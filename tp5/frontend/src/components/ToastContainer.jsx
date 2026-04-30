import React, { useState, useEffect } from 'react';
import { toast } from './toastManager';

// Componente que se encarga de renderizar visualmente las notificaciones (carteles) en la pantalla
const ToastContainer = () => {
  const [toasts, setToasts] = useState([]); // Almacena la lista de notificaciones activas

  useEffect(() => {
    const unsubscribe = toast.subscribe((newToast) => {
      setToasts(prev => [...prev, newToast]);
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 5000);
    });

    return unsubscribe;
  }, []);

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`custom-toast toast-${t.type}`}>
          <div className="toast-icon">
            {t.type === 'success' && '✓'}
            {t.type === 'error' && '✕'}
            {t.type === 'marvel' && '🦸‍♂️'}
            {t.type === 'dc' && '🦇'}
          </div>
          <div>{t.message}</div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
