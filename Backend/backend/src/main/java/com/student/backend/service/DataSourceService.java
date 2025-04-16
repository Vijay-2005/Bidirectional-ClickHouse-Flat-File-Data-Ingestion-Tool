package com.student.backend.service;

import com.student.backend.model.request.DataSourceConfig;
import com.student.backend.model.response.IngestResponse;

import java.util.List;

/**
 * Interface for data source operations
 */
public interface DataSourceService {
    /**
     * Get available columns from a data source
     * 
     * @param config Configuration for the data source
     * @return List of column names
     */
    List<String> getColumns(DataSourceConfig config);
    
    /**
     * Ingest data from the source to the target
     * 
     * @param sourceConfig Source data configuration
     * @param targetConfig Target data configuration
     * @param columns Columns to ingest
     * @return Response with ingest results
     */
    IngestResponse ingestData(DataSourceConfig sourceConfig, DataSourceConfig targetConfig, List<String> columns);
}