import React, { createContext, useState, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, title, type = 'info', duration = 5000) => {
    const id = Date.now();
    
    setNotifications(prev => [
      ...prev,
      {
        id,
        message,
        title,
        type,
        duration
      }
    ]);

    if (duration !== 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const hideNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showSuccess = useCallback((message, title = 'สำเร็จ') => {
    return showNotification(message, title, 'success');
  }, [showNotification]);

  const showError = useCallback((message, title = 'ข้อผิดพลาด') => {
    return showNotification(message, title, 'error');
  }, [showNotification]);

  const showInfo = useCallback((message, title = 'ข้อมูล') => {
    return showNotification(message, title, 'info');
  }, [showNotification]);

  const showWarning = useCallback((message, title = 'คำเตือน') => {
    return showNotification(message, title, 'warning');
  }, [showNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        hideNotification,
        showSuccess,
        showError,
        showInfo,
        showWarning
      }}
    >
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-4 max-w-sm w-full">
        {notifications.map(notification => {
          const { id, message, title, type } = notification;
          
          // กำหนดสีและไอคอนตาม type
          let bgColor, borderColor, textColor, Icon;
          
          switch (type) {
            case 'success':
              bgColor = 'bg-green-900/20';
              borderColor = 'border-green-500/50';
              textColor = 'text-green-400';
              Icon = CheckCircle;
              break;
            case 'error':
              bgColor = 'bg-red-900/20';
              borderColor = 'border-red-500/50';
              textColor = 'text-red-400';
              Icon = AlertCircle;
              break;
            case 'warning':
              bgColor = 'bg-amber-900/20';
              borderColor = 'border-amber-500/50';
              textColor = 'text-amber-400';
              Icon = AlertCircle;
              break;
            case 'info':
            default:
              bgColor = 'bg-blue-900/20';
              borderColor = 'border-blue-500/50';
              textColor = 'text-blue-400';
              Icon = Info;
              break;
          }
          
          return (
            <div
              key={id}
              className={`${bgColor} border ${borderColor} rounded-lg shadow-lg p-4 transform transition-all animate-in slide-in-from-right`}
              role="alert"
            >
              <div className="flex items-start">
                <div className={`${textColor} mt-0.5`}>
                  <Icon size={18} />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className={`text-sm font-medium ${textColor}`}>{title}</h3>
                  <div className="mt-1 text-sm text-zinc-300">{message}</div>
                </div>
                <button
                  type="button"
                  onClick={() => hideNotification(id)}
                  className="ml-4 inline-flex text-zinc-400 hover:text-zinc-300 focus:outline-none"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
