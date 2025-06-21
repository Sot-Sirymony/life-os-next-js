import { useState, useCallback } from 'react';

const useAlert = () => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = useCallback((type, message, duration = 5000) => {
    const id = Date.now() + Math.random();
    const newAlert = {
      id,
      type,
      message,
      duration,
      show: true
    };

    setAlerts(prev => [...prev, newAlert]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeAlert(id);
      }, duration);
    }

    return id;
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration) => {
    return showAlert('success', message, duration);
  }, [showAlert]);

  const showError = useCallback((message, duration) => {
    return showAlert('error', message, duration);
  }, [showAlert]);

  const showWarning = useCallback((message, duration) => {
    return showAlert('warning', message, duration);
  }, [showAlert]);

  const showInfo = useCallback((message, duration) => {
    return showAlert('info', message, duration);
  }, [showAlert]);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    alerts,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeAlert,
    clearAllAlerts
  };
};

export default useAlert; 