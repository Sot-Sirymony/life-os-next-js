import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes, FaTimesCircle } from 'react-icons/fa';

const Alert = ({ 
  type = 'info', 
  message, 
  duration = 5000, 
  onClose, 
  show = true,
  position = 'top-right' // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center, static
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsVisible(show);
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  const getAlertStyles = () => {
    const baseStyles = {
      padding: '12px 16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      maxWidth: '400px',
      minWidth: '300px',
      fontFamily: "'PT Sans', sans-serif",
      fontSize: '14px',
      fontWeight: 500,
      transition: 'all 0.3s ease',
      transform: isExiting ? 'translateX(100%)' : 'translateX(0)',
      opacity: isExiting ? 0 : 1,
    };

    // Only apply positioning styles if not static
    if (position !== 'static') {
      baseStyles.position = 'fixed';
      baseStyles.zIndex = 9999;
      
      const positionStyles = {
        'top-right': { top: '20px', right: '20px' },
        'top-left': { top: '20px', left: '20px' },
        'bottom-right': { bottom: '20px', right: '20px' },
        'bottom-left': { bottom: '20px', left: '20px' },
        'top-center': { top: '20px', left: '50%', transform: isExiting ? 'translate(-50%, -100%)' : 'translate(-50%, 0)' },
        'bottom-center': { bottom: '20px', left: '50%', transform: isExiting ? 'translate(-50%, 100%)' : 'translate(-50%, 0)' },
      };
      
      return {
        ...baseStyles,
        ...positionStyles[position],
      };
    }

    const typeStyles = {
      success: {
        backgroundColor: '#d4edda',
        color: '#155724',
        border: '1px solid #c3e6cb',
      },
      error: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        border: '1px solid #f5c6cb',
      },
      warning: {
        backgroundColor: '#fff3cd',
        color: '#856404',
        border: '1px solid #ffeaa7',
      },
      info: {
        backgroundColor: '#d1ecf1',
        color: '#0c5460',
        border: '1px solid #bee5eb',
      },
    };

    return {
      ...baseStyles,
      ...typeStyles[type],
    };
  };

  const getIcon = () => {
    const iconProps = { size: 18 };
    switch (type) {
      case 'success':
        return <FaCheckCircle {...iconProps} />;
      case 'error':
        return <FaTimesCircle {...iconProps} />;
      case 'warning':
        return <FaExclamationTriangle {...iconProps} />;
      case 'info':
        return <FaInfoCircle {...iconProps} />;
      default:
        return <FaInfoCircle {...iconProps} />;
    }
  };

  if (!isVisible) return null;

  return (
    <div style={getAlertStyles()}>
      {getIcon()}
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.7,
          transition: 'opacity 0.2s ease',
        }}
        onMouseEnter={(e) => e.target.style.opacity = 1}
        onMouseLeave={(e) => e.target.style.opacity = 0.7}
      >
        <FaTimes size={14} />
      </button>
    </div>
  );
};

export default Alert; 