package com.student.backend.exception;

/**
 * Exception thrown when there's an issue with data source connectivity or operations.
 */
public class DataSourceException extends RuntimeException {
    public DataSourceException(String message) {
        super(message);
    }

    public DataSourceException(String message, Throwable cause) {
        super(message, cause);
    }
}