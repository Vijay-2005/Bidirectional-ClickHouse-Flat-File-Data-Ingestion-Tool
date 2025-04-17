import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataIngestionService from '../services/apiService';
import MockApiService from '../mocks/mockApiService'; // Import the mock service
import { useDataContext } from '../context/DataContext';
import Spinner from '../components/Spinner';

function IngestionPage() {
  const navigate = useNavigate();
  const { 
    dataSource, 
    connectionConfig, 
    selectedColumns,
    ingestResult,
    setIngestResult,
    resetAll
  } = useDataContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Ready to ingest data');
  const [useMock, setUseMock] = useState(true); // Set to true to use mock service by default
  
  // Redirect to connection page if no config or columns are found
  useEffect(() => {
    if (!dataSource || Object.keys(connectionConfig).length === 0) {
      navigate('/connection');
    } else if (selectedColumns.length === 0) {
      navigate('/schema');
    }
  }, [dataSource, connectionConfig, selectedColumns, navigate]);
  
  const handleStartIngestion = async () => {
    try {
      setIsLoading(true);
      setStatus('Ingesting data...');
      setError('');
      
      // Use mock service if useMock is true, otherwise use real service
      const service = useMock ? MockApiService : DataIngestionService;
      
      const response = await service.ingestData(
        dataSource, 
        connectionConfig, 
        selectedColumns
      );
      
      if (response.isError) {
        setError(response.message);
        setStatus('Error');
        return;
      }
      
      setIngestResult(response.data);
      setStatus('Ingestion completed successfully');
    } catch (err) {
      setError('Failed to ingest data: ' + (err.message || 'Unknown error'));
      setStatus('Error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle between mock and real service
  const toggleMockService = () => {
    setUseMock(!useMock);
  };
  
  const handleBackToSchema = () => {
    navigate('/schema');
  };
  
  const handleStartOver = () => {
    // Clear all data and return to the connection page
    resetAll();
    navigate('/connection');
  };
  
  return (
    <div className="container">
      <div className="section">
        <h2>4. Data Ingestion</h2>
        
        <div className="summary-container">
          <h3>Configuration Summary</h3>
          <div className="summary-item">
            <strong>Data Source:</strong> {dataSource}
          </div>
          
          {dataSource === 'ClickHouse' ? (
            <div className="summary-item">
              <strong>Connection:</strong> {connectionConfig.host}:{connectionConfig.port}/{connectionConfig.database}
              {connectionConfig.username && <span> (User: {connectionConfig.username})</span>}
            </div>
          ) : (
            <div className="summary-item">
              <strong>File:</strong> {connectionConfig.fileName} 
              <span>(Delimiter: {connectionConfig.delimiter || ','})</span>
            </div>
          )}
          
          <div className="summary-item">
            <strong>Selected Columns ({selectedColumns.length}):</strong>
            <div className="selected-columns-list">
              {selectedColumns.map((column, index) => (
                <span key={index} className="column-tag">
                  {column}
                </span>
              ))}
            </div>
          </div>
          
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
                ? "Using mock data (no real backend connection needed)" 
                : "Using real backend connection"}
            </p>
          </div>
        </div>
        
        <div className="ingestion-status">
          <h3>Status</h3>
          <p className="status-text">{status}</p>
          {error && <p className="error-text">{error}</p>}
        </div>
        
        {isLoading ? (
          <Spinner message="Ingesting data... Please wait" size="large" />
        ) : !ingestResult ? (
          <div className="action-buttons">
            <button 
              className="btn btn-secondary" 
              onClick={handleBackToSchema}
            >
              Back to Schema
            </button>
            <button 
              className="btn btn-success" 
              onClick={handleStartIngestion}
            >
              Start Ingestion
            </button>
          </div>
        ) : (
          <div className="ingestion-results">
            <h3>Ingestion Complete</h3>
            <div className="result-display">
              <p><strong>Records Processed:</strong> {ingestResult.recordsCount}</p>
              <p><strong>Message:</strong> {ingestResult.message}</p>
              {ingestResult.timestamp && (
                <p><strong>Timestamp:</strong> {new Date(ingestResult.timestamp).toLocaleString()}</p>
              )}
            </div>
            
            <div className="action-buttons">
              <button className="btn btn-primary" onClick={handleStartOver}>
                Start New Ingestion
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default IngestionPage;