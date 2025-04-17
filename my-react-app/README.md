# Bidirectional Data Ingestion Tool

A web application that facilitates data ingestion between ClickHouse database and Flat Files, supporting bidirectional data flow with column selection capabilities.

## Features

- Bidirectional data flow between ClickHouse and Flat Files
- JWT token-based authentication for ClickHouse
- Column selection for targeted data ingestion
- Real-time status reporting
- Record count display upon completion

## Project Structure

- `frontend`: React-based user interface
- `backend`: API server implementation

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- Backend requirements (per your backend implementation)
- Docker (for running ClickHouse locally)

### Running ClickHouse with Docker

```bash
# Pull and run ClickHouse container
docker run -d --name clickhouse-server -p 8123:8123 -p 9000:9000 clickhouse/clickhouse-server
```

### Setting Up Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install  # or equivalent for your backend language

# Start the backend server
npm start    # or equivalent command
```

### Setting Up Frontend

```bash
# Navigate to frontend directory
cd my-react-app

# Install dependencies
npm install

# Start the development server
npm start
```

The application will be available at http://localhost:3000

## Usage Guide

1. **Select Data Source**: Choose between ClickHouse and Flat File
2. **Configure Connection**:
   - For ClickHouse: Enter host, port, database, username, and JWT token
   - For Flat File: Specify file name and delimiter
3. **Select Columns**: Choose which columns to include in the data ingestion
4. **Start Ingestion**: Click the "Ingest Data" button to begin the process
5. **View Results**: See the number of records processed when complete

## Testing with Example Datasets

### ClickHouse Example Datasets

The application has been tested with the following ClickHouse example datasets:
- `uk_price_paid` 
- `ontime`

To load these datasets into your ClickHouse instance, follow these instructions:

```sql
-- For the UK Price Paid dataset
CREATE TABLE uk_price_paid
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4, 'other' = 0),
    is_new UInt8,
    duration Enum8('freehold' = 1, 'leasehold' = 2, 'unknown' = 0),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2);

-- Download and insert the UK Price Paid dataset
INSERT INTO uk_price_paid
WITH
    splitByChar(' ', postcode) AS p
SELECT
    toUInt32(price_string) AS price,
    parseDateTimeBestEffortUS(time) AS date,
    p[1] AS postcode1,
    p[2] AS postcode2,
    CAST(multiIf(property_type = 'T', 'terraced', property_type = 'S', 'semi-detached', property_type = 'D', 'detached', property_type = 'F', 'flat', 'other'), 'Enum8(\'terraced\' = 1, \'semi-detached\' = 2, \'detached\' = 3, \'flat\' = 4, \'other\' = 0)') AS type,
    old_or_new = 'N' AS is_new,
    CAST(multiIf(duration = 'F', 'freehold', duration = 'L', 'leasehold', 'unknown'), 'Enum8(\'freehold\' = 1, \'leasehold\' = 2, \'unknown\' = 0)') AS duration,
    primary_addressable_object_name AS addr1,
    secondary_addressable_object_name AS addr2,
    street,
    locality,
    town_city AS town,
    district,
    county
FROM url('http://prod.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-complete.csv', CSV, 'uuid_string,price_string,time,postcode,property_type,old_or_new,duration,paon,saon,street,locality,town_city,district,county,ppd_category_type,record_status')
WHERE length(postcode) > 0 AND postcode != 'POSTCODE'
SETTINGS max_http_get_redirects=10;
```

## Implementation Details

### Backend Technologies

- Backend framework (your choice)
- ClickHouse client library (your choice)
- File handling libraries (your choice)

### Frontend Components

- React with React Router for navigation
- Context API for state management
- Axios for API requests

## License

MIT License
