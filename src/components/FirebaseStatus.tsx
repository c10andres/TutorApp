import React, { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { FirebaseFallbackManager } from '../utils/firebase-fallback';
import { Database, Wifi, WifiOff } from 'lucide-react';

export function FirebaseStatus() {
  const [status, setStatus] = useState(FirebaseFallbackManager.getStatus());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(FirebaseFallbackManager.getStatus());
      setIsOnline(navigator.onLine);
    }, 2000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <Badge variant="destructive" className="text-xs">
        <WifiOff className="size-3 mr-1" />
        Sin conexión
      </Badge>
    );
  }

  if (status.fallbackMode) {
    return (
      <Badge variant="secondary" className="text-xs">
        <Database className="size-3 mr-1" />
        Modo Local
      </Badge>
    );
  }

  if (status.totalErrors > 0) {
    return (
      <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
        <Database className="size-3 mr-1" />
        Firebase (~{status.totalErrors} índices)
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-xs text-green-600 border-green-200">
      <Wifi className="size-3 mr-1" />
      Firebase OK
    </Badge>
  );
}
