package com.student.backend.model.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * Request DTO for the /api/tables endpoint.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TablesRequest {
    private String dataSource;
    private DataSourceConfig config;
    
    /**
     * Copy the dataSource value to the config object if needed.
     * This ensures proper type resolution when deserializing.
     */
    public DataSourceConfig getConfig() {
        if (config != null && config.getDataSource() == null && dataSource != null) {
            config.setDataSource(dataSource);
        }
        return config;
    }
}