package com.student.backend.service.impl;

import com.clickhouse.jdbc.ClickHouseDataSource;
import com.student.backend.exception.ConfigurationException;
import com.student.backend.exception.DataSourceException;
import com.student.backend.model.request.ClickHouseConfig;
import com.student.backend.model.request.DataSourceConfig;
import com.student.backend.model.request.DefaultDataSourceConfig;
import com.student.backend.model.request.FlatFileConfig;
import com.student.backend.model.response.IngestResponse;
import com.student.backend.service.DataSourceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.stream.Collectors;

/**
 * Implementation of DataSourceService for Flat File operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FlatFileService implements DataSourceService {

    @Override
    public List<String> getColumns(DataSourceConfig config) {
        // Handle DefaultDataSourceConfig by converting it to FlatFileConfig
        if (config instanceof DefaultDataSourceConfig) {
            DefaultDataSourceConfig defaultConfig = (DefaultDataSourceConfig) config;
            if ("Flat File".equals(defaultConfig.getDataSource())) {
                // Create a new FlatFileConfig and extract values from the map
                FlatFileConfig flatFileConfig = new FlatFileConfig();
                flatFileConfig.setDataSource(defaultConfig.getDataSource());
                
                // Since we don't have direct access to properties in DefaultDataSourceConfig,
                // we'll need to work with field names
                try {
                    // Use reflection to get fileName and delimiter fields if they exist
                    java.lang.reflect.Field fileNameField = defaultConfig.getClass().getDeclaredField("fileName");
                    fileNameField.setAccessible(true);
                    String fileName = (String) fileNameField.get(defaultConfig);
                    flatFileConfig.setFileName(fileName);
                    
                    try {
                        java.lang.reflect.Field delimiterField = defaultConfig.getClass().getDeclaredField("delimiter");
                        delimiterField.setAccessible(true);
                        String delimiter = (String) delimiterField.get(defaultConfig);
                        if (delimiter != null) {
                            flatFileConfig.setDelimiter(delimiter);
                        }
                    } catch (NoSuchFieldException e) {
                        // Use default delimiter
                    }
                    
                    config = flatFileConfig;
                } catch (Exception e) {
                    log.error("Error creating FlatFileConfig from DefaultDataSourceConfig", e);
                    throw new ConfigurationException("Invalid flat file configuration: " + e.getMessage());
                }
            }
        }
        
        if (!(config instanceof FlatFileConfig)) {
            throw new ConfigurationException("Invalid configuration type for Flat File service");
        }

        FlatFileConfig flatFileConfig = (FlatFileConfig) config;
        validateFlatFileConfig(flatFileConfig);
        
        try {
            File file = new File(flatFileConfig.getFileName());
            if (!file.exists()) {
                throw new DataSourceException("File not found: " + flatFileConfig.getFileName());
            }
            
            // Create CSV format with the specified delimiter
            char delimiter = flatFileConfig.getDelimiter().charAt(0);
            CSVFormat csvFormat = CSVFormat.DEFAULT.builder()
                    .setDelimiter(delimiter)
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .build();
            
            try (FileReader reader = new FileReader(file, StandardCharsets.UTF_8);
                 CSVParser csvParser = new CSVParser(reader, csvFormat)) {
                
                // Get headers from the CSV file
                return new ArrayList<>(csvParser.getHeaderMap().keySet());
            }
        } catch (IOException e) {
            log.error("Error reading columns from flat file", e);
            throw new DataSourceException("Failed to read columns from flat file: " + e.getMessage(), e);
        }
    }

    @Override
    public IngestResponse ingestData(DataSourceConfig sourceConfig, DataSourceConfig targetConfig, List<String> columns) {
        // This is where the data flows from a flat file to ClickHouse
        if (!(sourceConfig instanceof FlatFileConfig)) {
            throw new ConfigurationException("Invalid source configuration type for Flat File service");
        }
        
        if (!(targetConfig instanceof ClickHouseConfig)) {
            throw new ConfigurationException("Invalid target configuration type for ClickHouse");
        }
        
        FlatFileConfig flatFileConfig = (FlatFileConfig) sourceConfig;
        ClickHouseConfig clickHouseConfig = (ClickHouseConfig) targetConfig;
        
        validateFlatFileConfig(flatFileConfig);
        
        long recordsCount = 0;
        LocalDateTime now = LocalDateTime.now();
        
        try {
            File file = new File(flatFileConfig.getFileName());
            if (!file.exists()) {
                throw new DataSourceException("File not found: " + flatFileConfig.getFileName());
            }
            
            // Create CSV format with the specified delimiter
            char delimiter = flatFileConfig.getDelimiter().charAt(0);
            CSVFormat csvFormat = CSVFormat.DEFAULT.builder()
                    .setDelimiter(delimiter)
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .build();
            
            // Read records from CSV
            List<CSVRecord> records;
            try (FileReader reader = new FileReader(file, StandardCharsets.UTF_8);
                 CSVParser csvParser = new CSVParser(reader, csvFormat)) {
                records = csvParser.getRecords();
            }
            
            // Connect to ClickHouse and insert data
            String url = String.format("jdbc:clickhouse://%s:%s/%s", 
                    clickHouseConfig.getHost(), clickHouseConfig.getPort(), clickHouseConfig.getDatabase());
            
            Properties properties = new Properties();
            if (clickHouseConfig.getUsername() != null && !clickHouseConfig.getUsername().isEmpty()) {
                properties.setProperty("user", clickHouseConfig.getUsername());
            }
            
            if (clickHouseConfig.getJwtToken() != null && !clickHouseConfig.getJwtToken().isEmpty()) {
                properties.setProperty("password", clickHouseConfig.getJwtToken());
            }
            
            try (Connection connection = new ClickHouseDataSource(url, properties).getConnection()) {
                // In a real application, you'd need to specify the table name and create it if needed
                // For simplicity, we'll use a placeholder table name
                String tableName = "target_table";
                
                // Prepare placeholders for SQL INSERT statement
                String placeholders = columns.stream().map(c -> "?").collect(Collectors.joining(", "));
                String columnsStr = String.join(", ", columns);
                
                String insertSql = String.format("INSERT INTO %s.%s (%s) VALUES (%s)", 
                        clickHouseConfig.getDatabase(), tableName, columnsStr, placeholders);
                
                // Use batch processing for better performance
                try (PreparedStatement statement = connection.prepareStatement(insertSql)) {
                    int batchSize = 1000;
                    int count = 0;
                    
                    for (CSVRecord record : records) {
                        for (int i = 0; i < columns.size(); i++) {
                            String column = columns.get(i);
                            // Set the parameter for the prepared statement
                            // Note: In a real application, you'd need to handle different data types
                            statement.setString(i + 1, record.get(column));
                        }
                        
                        statement.addBatch();
                        count++;
                        
                        if (count % batchSize == 0) {
                            statement.executeBatch();
                            statement.clearBatch();
                        }
                    }
                    
                    // Execute any remaining batches
                    if (count % batchSize != 0) {
                        statement.executeBatch();
                    }
                    
                    recordsCount = count;
                }
            }
            
            String message = String.format("Successfully ingested %d records from file %s to ClickHouse", 
                    recordsCount, flatFileConfig.getFileName());
            
            return IngestResponse.builder()
                    .recordsCount(recordsCount)
                    .message(message)
                    .timestamp(now.format(DateTimeFormatter.ISO_DATE_TIME))
                    .build();
            
        } catch (IOException | SQLException e) {
            log.error("Error during data ingestion from flat file to ClickHouse", e);
            throw new DataSourceException("Failed to ingest data from flat file: " + e.getMessage(), e);
        }
    }
    
    /**
     * Validate the Flat File configuration
     */
    private void validateFlatFileConfig(FlatFileConfig config) {
        if (config.getFileName() == null || config.getFileName().isEmpty()) {
            throw new ConfigurationException("Flat File name is required");
        }
        
        if (config.getDelimiter() == null || config.getDelimiter().isEmpty()) {
            throw new ConfigurationException("Delimiter is required");
        }
    }
}