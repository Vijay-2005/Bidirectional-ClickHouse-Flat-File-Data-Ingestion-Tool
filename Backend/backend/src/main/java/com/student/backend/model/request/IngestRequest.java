package com.student.backend.model.request;

import lombok.Data;
import java.util.List;

/**
 * Request DTO for the /api/ingest endpoint.
 */
@Data
public class IngestRequest {
    private String dataSource;
    private DataSourceConfig config;
    private List<String> columns;
}