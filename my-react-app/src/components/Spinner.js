import React from 'react';

/**
 * Spinner component for displaying loading states
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the spinner (small, medium, large)
 * @param {string} props.message - Optional message to display with the spinner
 */
function Spinner({ size = 'medium', message = 'Loading...' }) {
  const getSize = () => {
    switch (size) {
      case 'small': return '20px';
      case 'large': return '50px';
      default: return '30px'; // medium
    }
  };

  const styles = {
    spinnerContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      textAlign: 'center'
    },
    spinner: {
      border: '4px solid rgba(0, 0, 0, 0.1)',
      borderLeft: '4px solid #007bff',
      borderRadius: '50%',
      width: getSize(),
      height: getSize(),
      animation: 'spin 1s linear infinite',
    },
    message: {
      marginTop: '10px',
      color: '#6c757d',
      fontSize: size === 'small' ? '0.8rem' : '1rem'
    }
  };

  return (
    <div style={styles.spinnerContainer}>
      <div style={styles.spinner} />
      {message && <div style={styles.message}>{message}</div>}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default Spinner;