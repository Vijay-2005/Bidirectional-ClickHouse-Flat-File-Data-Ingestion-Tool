package com.student.backend.model.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response model for the /api/tables endpoint.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TablesResponse {
    private List<String> columns;
}