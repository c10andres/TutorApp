// Panel de depuración para datos en Android
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { AndroidDataDiagnostic } from '../utils/android-data-diagnostic';
import { Capacitor } from '@capacitor/core';

interface AndroidDataDebugPanelProps {
  userId: string | null;
  onClose?: () => void;
}

export const AndroidDataDebugPanel: React.FC<AndroidDataDebugPanelProps> = ({ 
  userId, 
  onClose 
}) => {
  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  
  useEffect(() => {
    if (userId) {
      loadSystemStatus();
    }
  }, [userId]);
  
  const loadSystemStatus = () => {
    const status = AndroidDataDiagnostic.getSystemStatus();
    setSystemStatus(status);
  };
  
  const runDiagnostic = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const result = await AndroidDataDiagnostic.runFullDiagnostic(userId);
      setDiagnostic(result);
    } catch (error) {
      console.error('Error en diagnóstico:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const testStepByStep = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      await AndroidDataDiagnostic.testStepByStep(userId);
    } catch (error) {
      console.error('Error en prueba paso a paso:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const forceReload = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const result = await AndroidDataDiagnostic.forceReload(userId);
      console.log('Resultado de recarga:', result);
    } catch (error) {
      console.error('Error en recarga:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const clearCache = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      await AndroidDataDiagnostic.clearCacheAndRestart(userId);
    } catch (error) {
      console.error('Error limpiando cache:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const isAndroid = Capacitor.getPlatform() === 'android';
  
  if (!isAndroid) {
    return null;
  }
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🤖 Diagnóstico de Datos Android
          <Badge variant="outline">Debug</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado del sistema */}
        {systemStatus && (
          <div className="space-y-2">
            <h4 className="font-semibold">Estado del Sistema</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Plataforma: <Badge variant={systemStatus.isAndroid ? "default" : "secondary"}>{systemStatus.plataforma}</Badge></div>
              <div>Firebase: <Badge variant={systemStatus.firebase ? "default" : "destructive"}>{systemStatus.firebase ? "✅" : "❌"}</Badge></div>
              <div>Database: <Badge variant={systemStatus.database ? "default" : "destructive"}>{systemStatus.database ? "✅" : "❌"}</Badge></div>
              <div>Timestamp: <span className="text-xs">{systemStatus.timestamp}</span></div>
            </div>
          </div>
        )}
        
        {/* Resultado del diagnóstico */}
        {diagnostic && (
          <div className="space-y-2">
            <h4 className="font-semibold">Resultado del Diagnóstico</h4>
            <Alert variant={diagnostic.success ? "default" : "destructive"}>
              <AlertDescription>
                {diagnostic.message}
              </AlertDescription>
            </Alert>
            {diagnostic.details && (
              <div className="text-sm space-y-1">
                <div>Solicitudes: {diagnostic.details.requests}</div>
                <div>Errores: {diagnostic.details.errors?.length || 0}</div>
                {diagnostic.details.errors?.length > 0 && (
                  <div className="text-red-600">
                    {diagnostic.details.errors.map((error: string, index: number) => (
                      <div key={index} className="text-xs">• {error}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Botones de acción */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={runDiagnostic} 
            disabled={loading || !userId}
            variant="outline"
            size="sm"
          >
            {loading ? "🔄" : "🔍"} Diagnóstico Completo
          </Button>
          
          <Button 
            onClick={testStepByStep} 
            disabled={loading || !userId}
            variant="outline"
            size="sm"
          >
            {loading ? "🔄" : "🧪"} Prueba Paso a Paso
          </Button>
          
          <Button 
            onClick={forceReload} 
            disabled={loading || !userId}
            variant="outline"
            size="sm"
          >
            {loading ? "🔄" : "🔄"} Forzar Recarga
          </Button>
          
          <Button 
            onClick={clearCache} 
            disabled={loading || !userId}
            variant="outline"
            size="sm"
          >
            {loading ? "🔄" : "🧹"} Limpiar Cache
          </Button>
        </div>
        
        {/* Información adicional */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>• Usa "Diagnóstico Completo" para verificar todos los componentes</div>
          <div>• Usa "Prueba Paso a Paso" para ver el proceso detallado</div>
          <div>• Usa "Forzar Recarga" para intentar cargar datos nuevamente</div>
          <div>• Usa "Limpiar Cache" para resetear el estado local</div>
        </div>
        
        {onClose && (
          <Button onClick={onClose} variant="ghost" size="sm" className="w-full">
            Cerrar Panel
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AndroidDataDebugPanel;
