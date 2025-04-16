package com.student.backend.model.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Data;

/**
 * Abstract base class for source/target configuration.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "dataSource",
    visible = true,
    defaultImpl = DefaultDataSourceConfig.class
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = ClickHouseConfig.class, name = "ClickHouse"),
    @JsonSubTypes.Type(value = FlatFileConfig.class, name = "Flat File")
})
public abstract class DataSourceConfig {
    private String dataSource;
}