import React from 'react';
import Alert from './Alert';

const AlertContainer = ({ alerts, onRemoveAlert, position = 'top-right' }) => {
  const getContainerStyles = () => {
    const baseStyles = {
      position: 'fixed',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      pointerEvents: 'none',
    };

    const positionStyles = {
      'top-right': { top: '20px', right: '20px', alignItems: 'flex-end' },
      'top-left': { top: '20px', left: '20px', alignItems: 'flex-start' },
      'bottom-right': { bottom: '20px', right: '20px', alignItems: 'flex-end' },
      'bottom-left': { bottom: '20px', left: '20px', alignItems: 'flex-start' },
      'top-center': { top: '20px', left: '50%', transform: 'translateX(-50%)', alignItems: 'center' },
      'bottom-center': { bottom: '20px', left: '50%', transform: 'translateX(-50%)', alignItems: 'center' },
    };

    return {
      ...baseStyles,
      ...positionStyles[position],
    };
  };

  return (
    <div style={getContainerStyles()}>
      {alerts.map((alert, index) => (
        <div key={alert.id} style={{ pointerEvents: 'auto' }}>
          <Alert
            type={alert.type}
            message={alert.message}
            duration={alert.duration}
            show={alert.show}
            onClose={() => onRemoveAlert(alert.id)}
            position="static"
          />
        </div>
      ))}
    </div>
  );
};

export default AlertContainer; 