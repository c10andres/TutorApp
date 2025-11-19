// Componente que muestra el estado de sincronización en Android
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Capacitor } from '@capacitor/core';

interface AndroidSyncStatusProps {
  onForceSync?: () => void;
}

export const AndroidSyncStatus: React.FC<AndroidSyncStatusProps> = ({ onForceSync }) => {
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [isAndroid, setIsAndroid] = useState(false);
  
  useEffect(() => {
    const platform = Capacitor.getPlatform();
    setIsAndroid(platform === 'android');
    
    if (platform === 'android') {
      updateSyncStatus();
    }
  }, []);
  
  const updateSyncStatus = () => {
    const status = {
      platform: Capacitor.getPlatform(),
      isAndroid: Capacitor.isNativePlatform(),
      timestamp: new Date().toISOString(),
      buildVersion: process.env.REACT_APP_VERSION || '1.0.0',
      lastSync: new Date().toLocaleTimeString()
    };
    
    setSyncStatus(status);
    setLastUpdate(new Date().toLocaleTimeString());
  };
  
  const forceSync = () => {
    console.log('🔄 Forzando sincronización...');
    
    // Simular proceso de sincronización
    setTimeout(() => {
      updateSyncStatus();
      if (onForceSync) {
        onForceSync();
      }
      console.log('✅ Sincronización forzada completada');
    }, 1000);
  };
  
  const clearCache = () => {
    console.log('🧹 Limpiando cache...');
    
    // Limpiar localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('tutoring') || key.includes('requests') || key.includes('user'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log(`🧹 Limpiados ${keysToRemove.length} elementos del cache`);
    }
    
    updateSyncStatus();
  };
  
  if (!isAndroid) {
    return null;
  }
  
  return (
    <Card className="w-full max-w-2xl mx-auto mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📱 Estado de Sincronización Android
          <Badge variant="outline">Sync</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado de sincronización */}
        {syncStatus && (
          <div className="space-y-2">
            <h4 className="font-semibold">Estado del Sistema</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Plataforma: <Badge variant="default">{syncStatus.plataforma}</Badge></div>
              <div>Nativo: <Badge variant={syncStatus.isAndroid ? "default" : "secondary"}>{syncStatus.isAndroid ? "✅" : "❌"}</Badge></div>
              <div>Versión: <span className="text-xs">{syncStatus.buildVersion}</span></div>
              <div>Última Sync: <span className="text-xs">{syncStatus.lastSync}</span></div>
            </div>
          </div>
        )}
        
        {/* Información de sincronización */}
        <Alert>
          <AlertDescription>
            <strong>📱 Sincronización Android:</strong> Si los cambios no se ven en Android Studio, 
            ejecuta los scripts de sincronización o usa los botones de abajo.
          </AlertDescription>
        </Alert>
        
        {/* Botones de acción */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={forceSync} 
            variant="outline"
            size="sm"
          >
            🔄 Forzar Sync
          </Button>
          
          <Button 
            onClick={clearCache} 
            variant="outline"
            size="sm"
          >
            🧹 Limpiar Cache
          </Button>
          
          <Button 
            onClick={updateSyncStatus} 
            variant="outline"
            size="sm"
          >
            🔄 Actualizar Estado
          </Button>
          
          <Button 
            onClick={() => {
              updateSyncStatus();
              if (onForceSync) onForceSync();
            }}
            variant="outline"
            size="sm"
          >
            🔄 Refrescar Todo
          </Button>
        </div>
        
        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm">
            <div className="font-semibold text-blue-800">📋 Instrucciones para Android Studio:</div>
            <div className="text-blue-700 space-y-1">
              <div>1. Ejecuta: <code>npm run build</code></div>
              <div>2. Ejecuta: <code>npx cap sync android</code></div>
              <div>3. Ejecuta: <code>npx cap open android</code></div>
              <div>4. En Android Studio: Build → Clean Project</div>
              <div>5. En Android Studio: Build → Rebuild Project</div>
            </div>
          </div>
        </div>
        
        {/* Scripts disponibles */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-sm">
            <div className="font-semibold text-green-800">🛠️ Scripts Disponibles:</div>
            <div className="text-green-700 space-y-1">
              <div>• <code>force-android-sync.bat</code> - Sincronización completa</div>
              <div>• <code>clean-android-build.bat</code> - Build limpio</div>
              <div>• <code>force-android-sync.ps1</code> - PowerShell script</div>
            </div>
          </div>
        </div>
        
        {/* Información adicional */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>• Si los cambios no se ven, ejecuta los scripts de sincronización</div>
          <div>• Limpia el cache si hay problemas de datos</div>
          <div>• Rebuilda el proyecto en Android Studio</div>
          <div>• Verifica que los archivos se compilaron correctamente</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AndroidSyncStatus;
