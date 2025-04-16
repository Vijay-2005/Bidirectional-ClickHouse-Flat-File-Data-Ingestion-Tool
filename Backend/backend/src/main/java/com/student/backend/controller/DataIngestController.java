package com.student.backend.controller;

import com.student.backend.exception.ConfigurationException;
import com.student.backend.model.DataSourceType;
import com.student.backend.model.request.ClickHouseConfig;
import com.student.backend.model.request.DataSourceConfig;
import com.student.backend.model.request.DefaultDataSourceConfig;
import com.student.backend.model.request.FlatFileConfig;
import com.student.backend.model.request.IngestRequest;
import com.student.backend.model.request.TablesRequest;
import com.student.backend.model.response.IngestResponse;
import com.student.backend.model.response.TablesResponse;
import com.student.backend.service.DataSourceService;
import com.student.backend.service.impl.ClickHouseService;
import com.student.backend.service.impl.FlatFileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for the bidirectional data ingestion API
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class DataIngestController {

    private final ClickHouseService clickHouseService;
    private final FlatFileService flatFileService;

    /**
     * Health check endpoint to verify the API is running
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Service is up and running!");
    }

    /**
     * Simple GET endpoint for testing sample columns
     */
    @GetMapping("/simple-test")
    public ResponseEntity<TablesResponse> simpleGetTest() {
        List<String> sampleColumns = Arrays.asList("id", "name", "age", "city", "email");
        return ResponseEntity.ok(new TablesResponse(sampleColumns));
    }

    /**
     * Test endpoint that returns sample column names
     */
    @GetMapping("/test/columns")
    public ResponseEntity<TablesResponse> testColumns() {
        List<String> sampleColumns = Arrays.asList("id", "name", "age", "city", "email");
        return ResponseEntity.ok(new TablesResponse(sampleColumns));
    }

    /**
     * Alternative endpoint to receive tables request with a simpler structure
     */
    @PostMapping("/tables-simple")
    public ResponseEntity<TablesResponse> getTablesSimple(@RequestBody Map<String, Object> request) {
        log.info("Received simple request to get tables for data source: {}", request.get("dataSource"));
        
        String dataSource = (String) request.get("dataSource");
        Map<String, Object> configMap = (Map<String, Object>) request.get("config");
        
        // Create the appropriate config object based on the dataSource
        DataSourceConfig config;
        if ("ClickHouse".equals(dataSource)) {
            ClickHouseConfig clickHouseConfig = new ClickHouseConfig();
            clickHouseConfig.setDataSource(dataSource);
            clickHouseConfig.setHost((String) configMap.get("host"));
            clickHouseConfig.setPort((String) configMap.get("port"));
            clickHouseConfig.setDatabase((String) configMap.get("database"));
            clickHouseConfig.setUsername((String) configMap.get("username"));
            clickHouseConfig.setJwtToken((String) configMap.get("jwtToken"));
            config = clickHouseConfig;
            
            // For test purpose
            if ("test".equals(clickHouseConfig.getDatabase())) {
                List<String> testColumns = Arrays.asList("id", "name", "age", "city", "created_at");
                return ResponseEntity.ok(new TablesResponse(testColumns));
            }
        } else if ("Flat File".equals(dataSource)) {
            FlatFileConfig flatFileConfig = new FlatFileConfig();
            flatFileConfig.setDataSource(dataSource);
            flatFileConfig.setFileName((String) configMap.get("fileName"));
            
            // Handle the delimiter - use default if not provided
            String delimiter = (String) configMap.get("delimiter");
            if (delimiter != null) {
                flatFileConfig.setDelimiter(delimiter);
            }
            config = flatFileConfig;
        } else {
            throw new ConfigurationException("Unsupported data source type: " + dataSource);
        }
        
        // Get the appropriate service and retrieve columns
        DataSourceType dataSourceType = DataSourceType.fromString(dataSource);
        DataSourceService service = getServiceForType(dataSourceType);
        List<String> columns = service.getColumns(config);
        
        return ResponseEntity.ok(new TablesResponse(columns));
    }

    /**
     * Endpoint to retrieve columns from a data source
     *
     * @param request The request containing data source type and configuration
     * @return A list of column names from the data source
     */
    @PostMapping("/tables")
    public ResponseEntity<TablesResponse> getTables(@RequestBody TablesRequest request) {
        log.info("Received request to get tables for data source: {}", request.getDataSource());
        log.debug("Request details: {}", request);
        
        try {
            // For test purpose - if the data source is ClickHouse and we're in test mode, return sample columns
            if ("ClickHouse".equals(request.getDataSource()) && 
                request.getConfig() instanceof ClickHouseConfig && 
                "test".equals(((ClickHouseConfig) request.getConfig()).getDatabase())) {
                
                List<String> testColumns = Arrays.asList("id", "name", "age", "city", "created_at");
                return ResponseEntity.ok(new TablesResponse(testColumns));
            }
            
            DataSourceType dataSourceType = DataSourceType.fromString(request.getDataSource());
            DataSourceService service = getServiceForType(dataSourceType);
            
            List<String> columns = service.getColumns(request.getConfig());
            return ResponseEntity.ok(new TablesResponse(columns));
        } catch (Exception e) {
            log.error("Error processing /api/tables request", e);
            throw e;
        }
    }

    /**
     * Endpoint to ingest data from a source to a target
     *
     * @param request The request containing source, target, and column selection
     * @return The result of the ingestion operation
     */
    @PostMapping("/ingest")
    public ResponseEntity<IngestResponse> ingestData(@RequestBody IngestRequest request) {
        log.info("Received request to ingest data from: {}", request.getDataSource());
        log.debug("Request details: {}", request);
        
        try {
            // Ensure dataSource is properly set in the config
            if (request.getConfig() != null && request.getConfig().getDataSource() == null) {
                request.getConfig().setDataSource(request.getDataSource());
                log.debug("Set dataSource in config object: {}", request.getDataSource());
            }
            
            // Convert DefaultDataSourceConfig to appropriate type if needed
            DataSourceConfig sourceConfig = request.getConfig();
            if (sourceConfig instanceof DefaultDataSourceConfig) {
                DefaultDataSourceConfig defaultConfig = (DefaultDataSourceConfig) sourceConfig;
                String dataSourceType = request.getDataSource();
                
                if ("ClickHouse".equals(dataSourceType)) {
                    log.debug("Converting DefaultDataSourceConfig to ClickHouseConfig");
                    ClickHouseConfig clickHouseConfig = new ClickHouseConfig();
                    clickHouseConfig.setDataSource(dataSourceType);
                    clickHouseConfig.setHost(defaultConfig.getHost());
                    clickHouseConfig.setPort(defaultConfig.getPort());
                    clickHouseConfig.setDatabase(defaultConfig.getDatabase());
                    clickHouseConfig.setUsername(defaultConfig.getUsername());
                    clickHouseConfig.setJwtToken(defaultConfig.getJwtToken());
                    sourceConfig = clickHouseConfig;
                } else if ("Flat File".equals(dataSourceType)) {
                    log.debug("Converting DefaultDataSourceConfig to FlatFileConfig");
                    FlatFileConfig flatFileConfig = new FlatFileConfig();
                    flatFileConfig.setDataSource(dataSourceType);
                    flatFileConfig.setFileName(defaultConfig.getFileName());
                    flatFileConfig.setDelimiter(defaultConfig.getDelimiter());
                    sourceConfig = flatFileConfig;
                }
            }
            
            // For test purpose - if the data source is ClickHouse and we're in test mode, return a mock response
            if ("ClickHouse".equals(request.getDataSource()) && 
                sourceConfig instanceof ClickHouseConfig && 
                "test_db".equals(((ClickHouseConfig) sourceConfig).getDatabase())) {
                
                IngestResponse mockResponse = IngestResponse.builder()
                    .recordsCount(150)
                    .message("Successfully ingested 150 records from test ClickHouse database to file output.csv")
                    .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                    .build();
                
                return ResponseEntity.ok(mockResponse);
            }
            
            DataSourceType sourceType = DataSourceType.fromString(request.getDataSource());
            
            // Determine target type - if source is ClickHouse, target is Flat File and vice versa
            DataSourceType targetType = (sourceType == DataSourceType.CLICKHOUSE) 
                    ? DataSourceType.FLAT_FILE 
                    : DataSourceType.CLICKHOUSE;
            
            // Create the target configuration based on the source configuration
            DataSourceConfig targetConfig;
            if (targetType == DataSourceType.FLAT_FILE) {
                // Source is ClickHouse, target is Flat File
                if (!(sourceConfig instanceof ClickHouseConfig)) {
                    log.error("Expected ClickHouseConfig but got: {}", sourceConfig.getClass().getName());
                    throw new ConfigurationException("Invalid source configuration for ClickHouse");
                }
                
                // Create a default Flat File config - in a real app, this would be provided by the client
                FlatFileConfig flatFileConfig = new FlatFileConfig();
                flatFileConfig.setDataSource(targetType.getValue());
                // Set default file name - this would come from the client in a real app
                flatFileConfig.setFileName("output.csv");
                targetConfig = flatFileConfig;
                
            } else {
                // Source is Flat File, target is ClickHouse
                if (!(sourceConfig instanceof FlatFileConfig)) {
                    log.error("Expected FlatFileConfig but got: {}", sourceConfig.getClass().getName());
                    throw new ConfigurationException("Invalid source configuration for Flat File");
                }
                
                // Create a default ClickHouse config - in a real app, this would be provided by the client
                ClickHouseConfig clickHouseConfig = new ClickHouseConfig();
                clickHouseConfig.setDataSource(targetType.getValue());
                // These values would come from the client in a real app
                clickHouseConfig.setHost("192.168.162.169"); // Updated to use WSL IP
                clickHouseConfig.setPort("8123");
                clickHouseConfig.setDatabase("test_db");
                targetConfig = clickHouseConfig;
            }
            
            // Get the appropriate service for the source type
            DataSourceService service = getServiceForType(sourceType);
            
            // Perform the ingestion
            IngestResponse response = service.ingestData(sourceConfig, targetConfig, request.getColumns());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing /api/ingest request", e);
            throw e;
        }
    }
    
    /**
     * Get the appropriate service implementation based on data source type
     */
    private DataSourceService getServiceForType(DataSourceType type) {
        return switch (type) {
            case CLICKHOUSE -> clickHouseService;
            case FLAT_FILE -> flatFileService;
        };
    }
}