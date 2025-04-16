package com.student.backend.model.request;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Configuration for Flat File operations.
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class FlatFileConfig extends DataSourceConfig {
    private String fileName;
    private String delimiter = ","; // Default delimiter is comma
}