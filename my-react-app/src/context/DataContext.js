import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
export const DataContext = createContext();

// Create a provider component
export const DataProvider = ({ children }) => {
  // Initialize state from session storage if available
  const [dataSource, setDataSource] = useState(() => {
    return sessionStorage.getItem('dataSource') || 'ClickHouse';
  });
  
  const [connectionConfig, setConnectionConfig] = useState(() => {
    const storedConfig = sessionStorage.getItem('connectionConfig');
    return storedConfig ? JSON.parse(storedConfig) : {
      // Default ClickHouse config
      host: '',
      port: '',
      database: '',
      username: '',
      jwtToken: '',
      // Default Flat File config
      fileName: '',
      delimiter: ','
    };
  });
  
  const [selectedColumns, setSelectedColumns] = useState(() => {
    const storedColumns = sessionStorage.getItem('selectedColumns');
    return storedColumns ? JSON.parse(storedColumns) : [];
  });
  
  const [availableColumns, setAvailableColumns] = useState([]);
  const [ingestResult, setIngestResult] = useState(null);
  
  // Update session storage when state changes
  useEffect(() => {
    sessionStorage.setItem('dataSource', dataSource);
  }, [dataSource]);
  
  useEffect(() => {
    sessionStorage.setItem('connectionConfig', JSON.stringify(connectionConfig));
  }, [connectionConfig]);
  
  useEffect(() => {
    sessionStorage.setItem('selectedColumns', JSON.stringify(selectedColumns));
  }, [selectedColumns]);
  
  // Reset selected columns when data source changes
  useEffect(() => {
    setSelectedColumns([]);
    setAvailableColumns([]);
  }, [dataSource]);
  
  // Clear all data for a fresh start
  const resetAll = () => {
    setDataSource('ClickHouse');
    setConnectionConfig({
      host: '',
      port: '',
      database: '',
      username: '',
      jwtToken: '',
      fileName: '',
      delimiter: ','
    });
    setSelectedColumns([]);
    setAvailableColumns([]);
    setIngestResult(null);
    
    // Clear session storage
    sessionStorage.removeItem('dataSource');
    sessionStorage.removeItem('connectionConfig');
    sessionStorage.removeItem('selectedColumns');
  };
  
  // The context value that will be shared
  const contextValue = {
    dataSource,
    setDataSource,
    connectionConfig,
    setConnectionConfig,
    selectedColumns,
    setSelectedColumns,
    availableColumns,
    setAvailableColumns,
    ingestResult,
    setIngestResult,
    resetAll
  };
  
  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the context
export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};