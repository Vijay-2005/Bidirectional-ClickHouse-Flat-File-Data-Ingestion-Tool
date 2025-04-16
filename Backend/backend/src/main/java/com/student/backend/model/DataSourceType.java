package com.student.backend.model;

/**
 * Enum representing the types of data sources supported by the application.
 */
public enum DataSourceType {
    CLICKHOUSE("ClickHouse"),
    FLAT_FILE("Flat File");

    private final String value;

    DataSourceType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static DataSourceType fromString(String text) {
        for (DataSourceType type : DataSourceType.values()) {
            if (type.value.equalsIgnoreCase(text)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown data source type: " + text);
    }
}