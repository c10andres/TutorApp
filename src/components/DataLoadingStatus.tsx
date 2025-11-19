// Componente que muestra el estado de carga de datos en tiempo real
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { DataGuaranteeService } from '../services/data-guarantee';
import { Capacitor } from '@capacitor/core';

interface DataLoadingStatusProps {
  userId: string | null;
  onRefresh?: () => void;
}

export const DataLoadingStatus: React.FC<DataLoadingStatusProps> = ({ 
  userId, 
  onRefresh 
}) => {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  
  useEffect(() => {
    if (userId) {
      updateStatus();
    }
  }, [userId]);
  
  const updateStatus = () => {
    const status = DataGuaranteeService.getSystemStatus();
    setSystemStatus(status);
    setLastUpdate(new Date().toLocaleTimeString());
  };
  
  const testDataLoading = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      console.log('🧪 Probando carga de datos...');
      
      // Probar carga de solicitudes
      const requests = await DataGuaranteeService.guaranteeUserRequests(userId);
      console.log('✅ Solicitudes cargadas:', requests.length);
      
      // Probar carga de estadísticas
      const stats = await DataGuaranteeService.guaranteeUserStats(userId);
      console.log('✅ Estadísticas cargadas:', stats);
      
      // Actualizar estado
      updateStatus();
      
      // Notificar al componente padre
      if (onRefresh) {
        onRefresh();
      }
      
    } catch (error) {
      console.error('❌ Error en prueba de datos:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const clearCache = () => {
    DataGuaranteeService.clearCache();
    updateStatus();
    console.log('🧹 Cache limpiado');
  };
  
  const isAndroid = Capacitor.getPlatform() === 'android';
  const isWeb = Capacitor.getPlatform() === 'web';
  
  return (
    <Card className="w-full max-w-2xl mx-auto mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🛡️ Estado de Carga de Datos
          <Badge variant="outline">Garantía</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado del sistema */}
        {systemStatus && (
          <div className="space-y-2">
            <h4 className="font-semibold">Estado del Sistema</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Plataforma: <Badge variant={isAndroid ? "default" : isWeb ? "secondary" : "outline"}>{systemStatus.plataforma}</Badge></div>
              <div>Nativo: <Badge variant={systemStatus.isNative ? "default" : "secondary"}>{systemStatus.isNative ? "✅" : "❌"}</Badge></div>
              <div>Cache: <Badge variant="outline">{systemStatus.cacheSize} elementos</Badge></div>
              <div>Actualizado: <span className="text-xs">{lastUpdate}</span></div>
            </div>
          </div>
        )}
        
        {/* Información de garantía */}
        <Alert>
          <AlertDescription>
            <strong>🛡️ Garantía de Datos:</strong> Este sistema garantiza que siempre se cargan datos, 
            usando múltiples estrategias: Cache → Firebase → Datos Mock → Fallback Final.
          </AlertDescription>
        </Alert>
        
        {/* Botones de acción */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={testDataLoading} 
            disabled={loading || !userId}
            variant="outline"
            size="sm"
          >
            {loading ? "🔄" : "🧪"} Probar Carga
          </Button>
          
          <Button 
            onClick={clearCache} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            🧹 Limpiar Cache
          </Button>
          
          <Button 
            onClick={updateStatus} 
            variant="outline"
            size="sm"
          >
            🔄 Actualizar Estado
          </Button>
          
          <Button 
            onClick={() => {
              updateStatus();
              if (onRefresh) onRefresh();
            }}
            variant="outline"
            size="sm"
          >
            🔄 Refrescar Todo
          </Button>
        </div>
        
        {/* Información adicional */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>• <strong>Cache:</strong> Datos almacenados localmente por 5 minutos</div>
          <div>• <strong>Firebase:</strong> Intento de carga desde la base de datos</div>
          <div>• <strong>Mock:</strong> Datos de ejemplo si Firebase falla</div>
          <div>• <strong>Fallback:</strong> Datos básicos como último recurso</div>
        </div>
        
        {/* Estado de garantía */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-800">
            <span className="text-lg">🛡️</span>
            <div>
              <div className="font-semibold">Garantía Activa</div>
              <div className="text-sm">Los datos SIEMPRE se cargarán, sin importar la plataforma</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataLoadingStatus;
