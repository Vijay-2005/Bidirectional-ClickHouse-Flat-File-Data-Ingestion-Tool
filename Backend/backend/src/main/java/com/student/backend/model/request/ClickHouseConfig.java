package com.student.backend.model.request;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Configuration for ClickHouse connections.
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ClickHouseConfig extends DataSourceConfig {
    private String host;
    private String port;
    private String database;
    private String username;
    private String jwtToken;
}