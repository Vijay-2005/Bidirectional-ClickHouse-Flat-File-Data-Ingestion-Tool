/**
 * Mock API responses for development testing
 * This file simulates backend API responses to allow frontend testing
 * without a connected backend
 */

// Sample ClickHouse databases and tables with columns
const mockClickHouseDatabases = {
  'default': {
    'uk_price_paid': [
      'price',
      'date',
      'postcode1',
      'postcode2',
      'type',
      'is_new',
      'duration',
      'addr1',
      'addr2',
      'street',
      'locality',
      'town',
      'district',
      'county'
    ],
    'ontime': [
      'Year',
      'Quarter',
      'Month',
      'DayofMonth',
      'DayOfWeek',
      'FlightDate',
      'UniqueCarrier',
      'AirlineID',
      'Carrier',
      'TailNum',
      'FlightNum',
      'OriginAirportID',
      'OriginAirportSeqID',
      'OriginCityMarketID',
      'Origin',
      'DestAirportID',
      'DestAirportSeqID',
      'DestCityMarketID',
      'Dest',
      'CRSDepTime',
      'DepTime',
      'DepDelay',
      'ArrTime',
      'ArrDelay',
      'Cancelled',
      'Diverted'
    ]
  },
  'test_db': {
    'users': [
      'id',
      'name',
      'email',
      'created_at',
      'updated_at',
      'status',
      'role'
    ],
    'orders': [
      'id',
      'customer_id',
      'order_date',
      'order_number',
      'total_amount',
      'payment_method',
      'status'
    ]
  }
};

// Mock response for Flat File columns
const mockFlatFileColumns = [
  'user_id',
  'first_name',
  'last_name',
  'email_address',
  'phone_number',
  'registration_date',
  'subscription_type',
  'last_login',
  'address',
  'country'
];

/**
 * Mock API service for development and testing
 */
const MockApiService = {
  /**
   * Simulates fetching columns from a data source
   * @param {string} dataSource - The data source type ('ClickHouse' or 'Flat File')
   * @param {object} config - Connection configuration
   * @returns {Promise} - Promise with mock response data
   */
  fetchColumns: (dataSource, config) => {
    return new Promise((resolve, reject) => {
      // Simulate API delay
      setTimeout(() => {
        // Simulate validation errors
        if (dataSource === 'ClickHouse' && (!config.host || !config.port || !config.database)) {
          reject({ response: { data: { message: 'Missing required ClickHouse connection parameters' } } });
          return;
        }

        if (dataSource === 'Flat File' && !config.fileName) {
          reject({ response: { data: { message: 'Missing required file name' } } });
          return;
        }

        // Return appropriate mock columns based on data source
        if (dataSource === 'ClickHouse') {
          console.log('Mock: Fetching columns for ClickHouse', config);
          
          // Parse the database from the config
          // Format can be either host:port/database or just database
          let database = config.database;
          if (database.includes('/')) {
            database = database.split('/').pop();
          }
          
          // Check if the database exists in our mock data
          if (mockClickHouseDatabases[database]) {
            // For testing purposes, we'll return columns from the first table found
            const firstTable = Object.keys(mockClickHouseDatabases[database])[0];
            const columns = mockClickHouseDatabases[database][firstTable];
            resolve({ data: { columns } });
          } else {
            // If using test_tb, return custom columns
            if (database === 'test_tb') {
              resolve({ 
                data: { 
                  columns: [
                    'id', 
                    'test_name', 
                    'test_value', 
                    'created_at', 
                    'is_active'
                  ] 
                } 
              });
            } else {
              resolve({ data: { columns: [] } });
            }
          }
        } else {
          resolve({ data: { columns: mockFlatFileColumns } });
        }
      }, 800); // Simulate network delay
    });
  },

  /**
   * Simulates ingesting data with selected columns
   * @param {string} dataSource - The data source type ('ClickHouse' or 'Flat File')
   * @param {object} config - Connection configuration
   * @param {array} columns - The columns selected for ingestion
   * @returns {Promise} - Promise with mock ingestion results
   */
  ingestData: (dataSource, config, columns) => {
    return new Promise((resolve, reject) => {
      // Simulate API delay
      setTimeout(() => {
        // Simulate validation errors
        if (columns.length === 0) {
          reject({ response: { data: { message: 'No columns selected for ingestion' } } });
          return;
        }

        // Generate random number of records for the mock response
        const recordsCount = Math.floor(Math.random() * 10000) + 1000;
        
        resolve({
          data: {
            recordsCount,
            message: `Successfully ingested data from ${dataSource} to ${dataSource === 'ClickHouse' ? 'Flat File' : 'ClickHouse'}`,
            timestamp: new Date().toISOString()
          }
        });
      }, 2000); // Longer delay to simulate data processing
    });
  }
};

export default MockApiService;