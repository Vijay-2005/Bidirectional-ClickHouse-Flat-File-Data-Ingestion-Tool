package com.student.backend.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response model for the /api/ingest endpoint.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IngestResponse {
    private long recordsCount;
    private String message;
    private String timestamp;
}