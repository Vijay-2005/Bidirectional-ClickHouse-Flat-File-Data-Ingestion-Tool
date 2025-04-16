package com.student.backend.model.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Default implementation of DataSourceConfig used for JSON deserialization fallback.
 * Includes fields for both ClickHouse and Flat File configurations.
 */
@Data
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class DefaultDataSourceConfig extends DataSourceConfig {
    // Flat File fields
    private String fileName;
    private String delimiter = ",";
    
    // ClickHouse fields
    private String host;
    private String port;
    private String database;
    private String username;
    private String jwtToken;
}