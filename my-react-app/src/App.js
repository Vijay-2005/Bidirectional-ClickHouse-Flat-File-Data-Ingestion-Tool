import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import ConnectionPage from './pages/ConnectionPage';
import SchemaPage from './pages/SchemaPage';
import IngestionPage from './pages/IngestionPage';
import { DataProvider } from './context/DataContext';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Data Ingestion Tool</h1>
      </header>
      
      <main className="App-main">
        <DataProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Navigate to="/connection" />} />
              <Route path="/connection" element={<ConnectionPage />} />
              <Route path="/schema" element={<SchemaPage />} />
              <Route path="/ingestion" element={<IngestionPage />} />
            </Routes>
          </Router>
        </DataProvider>
      </main>
    </div>
  );
}

export default App;
