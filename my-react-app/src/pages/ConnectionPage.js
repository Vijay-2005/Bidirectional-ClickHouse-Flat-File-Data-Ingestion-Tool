import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataContext } from '../context/DataContext';

function ConnectionPage() {
  const navigate = useNavigate();
  const { 
    dataSource, 
    setDataSource, 
    connectionConfig, 
    setConnectionConfig 
  } = useDataContext();
  
  const [error, setError] = useState('');

  const handleDataSourceChange = (e) => {
    setDataSource(e.target.value);
  };

  const handleInputChange = (e) => {
    setConnectionConfig({ 
      ...connectionConfig, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = () => {
    // Validation
    if (dataSource === 'ClickHouse' && (!connectionConfig.host || !connectionConfig.port || !connectionConfig.database)) {
      setError('Please fill in required ClickHouse fields (Host, Port, Database)');
      return;
    } else if (dataSource === 'Flat File' && !connectionConfig.fileName) {
      setError('Please provide a file name');
      return;
    }
    
    // Navigate to schema page
    navigate('/schema');
  };

  return (
    <div className="container">
      <div className="section">
        <h2>1. Select Data Source</h2>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="dataSource"
              value="ClickHouse"
              checked={dataSource === 'ClickHouse'}
              onChange={handleDataSourceChange}
            />
            ClickHouse
          </label>
          <label>
            <input
              type="radio"
              name="dataSource"
              value="Flat File"
              checked={dataSource === 'Flat File'}
              onChange={handleDataSourceChange}
            />
            Flat File
          </label>
        </div>
      </div>

      <div className="section">
        <h2>2. Configure Connection</h2>
        {dataSource === 'ClickHouse' && (
          <div className="form-group">
            <div className="form-row">
              <label>Host:</label>
              <input 
                name="host" 
                value={connectionConfig.host}
                placeholder="Host" 
                onChange={handleInputChange}
                required 
              />
            </div>
            <div className="form-row">
              <label>Port:</label>
              <input 
                name="port" 
                value={connectionConfig.port}
                placeholder="Port" 
                onChange={handleInputChange}
                required 
              />
            </div>
            <div className="form-row">
              <label>Database:</label>
              <input 
                name="database" 
                value={connectionConfig.database}
                placeholder="Database" 
                onChange={handleInputChange}
                required 
              />
            </div>
            <div className="form-row">
              <label>Username:</label>
              <input 
                name="username" 
                value={connectionConfig.username}
                placeholder="Username" 
                onChange={handleInputChange} 
              />
            </div>
            <div className="form-row">
              <label>JWT Token:</label>
              <input 
                type="password"
                name="jwtToken" 
                value={connectionConfig.jwtToken}
                placeholder="JWT Token" 
                onChange={handleInputChange} 
              />
            </div>
          </div>
        )}

        {dataSource === 'Flat File' && (
          <div className="form-group">
            <div className="form-row">
              <label>File Name:</label>
              <input 
                name="fileName" 
                value={connectionConfig.fileName}
                placeholder="File Name" 
                onChange={handleInputChange}
                required 
              />
            </div>
            <div className="form-row">
              <label>Delimiter:</label>
              <input 
                name="delimiter" 
                value={connectionConfig.delimiter}
                placeholder="Delimiter (e.g., comma, tab)" 
                onChange={handleInputChange} 
              />
            </div>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}
        
        <button className="btn btn-primary" onClick={handleSubmit}>Continue to Schema</button>
      </div>
    </div>
  );
}

export default ConnectionPage;