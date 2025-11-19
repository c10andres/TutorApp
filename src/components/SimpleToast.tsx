import React, { useState, useEffect } from 'react';
import { CheckCircle, Info, X } from 'lucide-react';

interface ToastEvent extends CustomEvent {
  detail: {
    message: string;
    type?: 'success' | 'info' | 'warning' | 'error';
    duration?: number;
  };
}

export function SimpleToast() {
  const [toasts, setToasts] = useState<Array<{
    id: number;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
    duration: number;
  }>>([]);

  useEffect(() => {
    const handleToast = (event: ToastEvent) => {
      const id = Date.now();
      const newToast = {
        id,
        message: event.detail.message,
        type: event.detail.type || 'info',
        duration: event.detail.duration || 3000,
      };

      setToasts(prev => [...prev, newToast]);

      // Auto remove after duration
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, newToast.duration);
    };

    window.addEventListener('show-toast', handleToast as EventListener);
    
    return () => {
      window.removeEventListener('show-toast', handleToast as EventListener);
    };
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="size-4 text-green-600" />;
      case 'warning':
        return <Info className="size-4 text-orange-600" />;
      case 'error':
        return <X className="size-4 text-red-600" />;
      default:
        return <Info className="size-4 text-blue-600" />;
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 p-3 rounded-lg border shadow-lg max-w-sm
            ${getToastStyles(toast.type)}
            animate-in slide-in-from-right-full duration-300
          `}
        >
          {getIcon(toast.type)}
          <p className="text-sm flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
