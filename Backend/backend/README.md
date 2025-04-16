# Bidirectional Data Ingestion Tool - Backend API

This Spring Boot application implements the backend API for a bidirectional data ingestion tool that connects ClickHouse databases and Flat Files.

## Prerequisites

- Java 17 or higher
- Maven
- ClickHouse server (for testing with real ClickHouse instance)

## Getting Started

1. Clone the repository
2. Build the project:
   ```
   mvn clean install
   ```
3. Run the application:
   ```
   mvn spring-boot:run
   ```
   
The server will start on port 8080.

## API Documentation

The API provides two main endpoints:

### 1. Get Columns from Data Source

**Endpoint:** `POST /api/tables`

**Description:** Retrieves available columns from a ClickHouse database or a Flat File.

**Request Body:**
```json
{
  "dataSource": "ClickHouse" | "Flat File",
  "config": {
    // For ClickHouse
    "host": "string",
    "port": "string",
    "database": "string",
    "username": "string",     // Optional
    "jwtToken": "string",     // Optional
    
    // For Flat File
    "fileName": "string",
    "delimiter": "string"     // Optional, defaults to ','
  }
}
```

**Response:**
```json
{
  "columns": ["column1", "column2", ...]
}
```

### 2. Ingest Data

**Endpoint:** `POST /api/ingest`

**Description:** Transfers data between the specified data source and target. The direction is determined by the data source type:
- If "ClickHouse" is selected as the source, data is extracted from ClickHouse and written to a flat file
- If "Flat File" is selected as the source, data is read from the file and inserted into ClickHouse

**Request Body:**
```json
{
  "dataSource": "ClickHouse" | "Flat File",
  "config": {
    // Same structure as above
  },
  "columns": ["column1", "column2", ...]
}
```

**Response:**
```json
{
  "recordsCount": 1234,
  "message": "Successfully ingested data from X to Y",
  "timestamp": "2023-07-26T10:30:00Z"
}
```

### Error Responses

All API errors are returned in the following format:

```json
{
  "message": "User-friendly error message"
}
```

## Security

- The API supports JWT token authentication for ClickHouse connections
- Input validation is performed to prevent injection attacks
- CORS is configured to allow requests from the frontend

## Configuration

The following configuration properties can be modified in `application.properties`:

- `server.port`: Server port (default 8080)
- `spring.servlet.multipart.max-file-size`: Maximum file upload size
- `spring.servlet.multipart.max-request-size`: Maximum request size
- `clickhouse.default.host`: Default ClickHouse host
- `clickhouse.default.port`: Default ClickHouse port
- `clickhouse.default.database`: Default ClickHouse database

## Technology Stack

- Spring Boot 3.x
- ClickHouse JDBC Driver
- Apache Commons CSV for CSV processing
- Lombok for reducing boilerplate code

## Future Improvements

- Add support for authentication and authorization
- Implement table creation in ClickHouse
- Add support for more file formats (JSON, Parquet, etc.)
- Implement data type mapping and transformations
- Add file upload functionality for Flat Files