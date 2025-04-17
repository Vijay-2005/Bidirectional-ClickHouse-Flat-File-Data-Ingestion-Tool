import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataIngestionService from '../services/apiService';
import MockApiService from '../mocks/mockApiService'; // Import the mock service
import { useDataContext } from '../context/DataContext';
import Spinner from '../components/Spinner';

function SchemaPage() {
  const navigate = useNavigate();
  const { 
    dataSource, 
    connectionConfig, 
    selectedColumns, 
    setSelectedColumns,
    availableColumns,
    setAvailableColumns
  } = useDataContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [useMock, setUseMock] = useState(true); // Set to true to use mock service by default
  
  // Redirect to connection page if no config is found
  useEffect(() => {
    if (!dataSource || Object.keys(connectionConfig).length === 0) {
      navigate('/connection');
    }
  }, [dataSource, connectionConfig, navigate]);
  
  // Load columns when the component mounts
  useEffect(() => {
    loadColumns();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const loadColumns = async () => {
    try {
      setIsLoading(true);
      setStatus('Fetching columns...');
      setError('');
      
      // Use mock service if useMock is true, otherwise use real service
      const service = useMock ? MockApiService : DataIngestionService;
      
      const response = await service.fetchColumns(dataSource, connectionConfig);
      
      if (response.isError) {
        setError(response.message);
        setStatus('Error');
        return;
      }
      
      setAvailableColumns(response.data.columns || []);
      setStatus('Columns loaded successfully');
    } catch (err) {
      setError('Failed to load columns: ' + (err.message || 'Unknown error'));
      setStatus('Error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle between mock and real service
  const toggleMockService = () => {
    setUseMock(!useMock);
    // Reload columns with the new service setting
    setTimeout(loadColumns, 100);
  };
  
  const handleColumnToggle = (columnName) => {
    if (selectedColumns.includes(columnName)) {
      setSelectedColumns(selectedColumns.filter(col => col !== columnName));
    } else {
      setSelectedColumns([...selectedColumns, columnName]);
    }
  };
  
  const handleSelectAll = () => {
    setSelectedColumns([...availableColumns]);
  };
  
  const handleDeselectAll = () => {
    setSelectedColumns([]);
  };
  
  const handleBack = () => {
    navigate('/connection');
  };
  
  const handleContinue = () => {
    if (selectedColumns.length === 0) {
      setError('Please select at least one column');
      return;
    }
    
    // Navigate to ingestion page
    navigate('/ingestion');
  };
  
  return (
    <div className="container">
      <div className="section">
        <h2>3. Schema & Column Selection</h2>
        
        <div className="source-info">
          <p>Data Source: <strong>{dataSource}</strong></p>
          {dataSource === 'ClickHouse' ? (
            <p>Connection: {connectionConfig.host}:{connectionConfig.port}/{connectionConfig.database}</p>
          ) : (
            <p>File: {connectionConfig.fileName}</p>
          )}
          
          {/* Add mock mode indicator and toggle button */}
          <div className="mock-control" style={{ marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={useMock} 
                onChange={toggleMockService} 
                style={{ marginRight: '8px' }}
              />
              Testing Mode (Use Mock Data)
            </label>
            <p style={{ fontSize: '0.8rem', color: '#666', margin: '5px 0 0 20px' }}>
              {useMock 
                ? "Using mock data (no real database connection needed)" 
                : "Using real database connection"}
            </p>
          </div>
        </div>
        
        {isLoading ? (
          <Spinner message="Fetching columns from data source..." />
        ) : error ? (
          <div className="error-container">
            <p className="error-text">{error}</p>
            <button className="btn btn-primary" onClick={loadColumns}>
              Retry Loading Columns
            </button>
          </div>
        ) : (
          <>
            {availableColumns.length > 0 ? (
              <>
                <div className="column-actions">
                  <button 
                    onClick={handleSelectAll} 
                    className="btn btn-sm btn-outline"
                    disabled={availableColumns.length === selectedColumns.length}
                  >
                    Select All
                  </button>
                  <button 
                    onClick={handleDeselectAll} 
                    className="btn btn-sm btn-outline"
                    disabled={selectedColumns.length === 0}
                  >
                    Deselect All
                  </button>
                </div>
                
                <div className="columns-list">
                  {availableColumns.map((column, index) => (
                    <div className="column-item" key={index}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedColumns.includes(column)}
                          onChange={() => handleColumnToggle(column)}
                        />
                        {column}
                      </label>
                    </div>
                  ))}
                </div>
                
                <div className="selected-count">
                  Selected: {selectedColumns.length} of {availableColumns.length} columns
                </div>
              </>
            ) : (
              <div className="no-columns-message">
                <p>No columns available. Please check your connection details.</p>
                <button className="btn btn-primary" onClick={loadColumns}>
                  Retry Loading Columns
                </button>
              </div>
            )}
          </>
        )}
        
        <div className="navigation-buttons">
          <button className="btn btn-secondary" onClick={handleBack}>
            Back
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleContinue}
            disabled={selectedColumns.length === 0 || isLoading}
          >
            Continue to Ingestion
          </button>
        </div>
      </div>
    </div>
  );
}

export default SchemaPage;