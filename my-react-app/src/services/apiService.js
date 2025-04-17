import axios from 'axios';

// Set the base URL to your backend server
// Update this URL to match your live backend URL and port
const API_BASE_URL = 'http://localhost:8080/api';

// Set up axios defaults
axios.defaults.baseURL = API_BASE_URL;

/**
 * Error handler for API requests
 * @param {Error} error - The error object from axios
 * @returns {Object} Standardized error object
 */
const handleApiError = (error) => {
  let errorMessage = 'An unexpected error occurred';
  
  if (error.response) {
    // The request was made and the server responded with an error status
    errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage = 'No response from server. Please check your network connection.';
  } else {
    // Something else caused the error
    errorMessage = error.message;
  }
  
  return {
    isError: true,
    message: errorMessage,
    originalError: error
  };
};

/**
 * Service for handling data ingestion API calls
 */
const DataIngestionService = {
  /**
   * Fetch available columns from the data source
   * @param {string} dataSource - The data source type ('ClickHouse' or 'Flat File')
   * @param {object} config - Connection configuration for the data source
   * @returns {Promise} - Promise with the response data
   */
  fetchColumns: async (dataSource, config) => {
    try {
      // Log request for debugging
      console.log(`Fetching columns for ${dataSource} with config:`, config);
      
      const response = await axios.post('/tables', { dataSource, config });
      return { isSuccess: true, data: response.data };
    } catch (error) {
      console.error('Error fetching columns:', error);
      return handleApiError(error);
    }
  },

  /**
   * Ingest data with the selected columns
   * @param {string} dataSource - The data source type ('ClickHouse' or 'Flat File')
   * @param {object} config - Connection configuration for the data source
   * @param {array} columns - Array of column names to ingest
   * @returns {Promise} - Promise with the response data
   */
  ingestData: async (dataSource, config, columns) => {
    try {
      // Log request for debugging
      console.log(`Ingesting data from ${dataSource} with columns:`, columns);
      
      const response = await axios.post('/ingest', { dataSource, config, columns });
      return { isSuccess: true, data: response.data };
    } catch (error) {
      console.error('Error ingesting data:', error);
      return handleApiError(error);
    }
  }
};

export default DataIngestionService;