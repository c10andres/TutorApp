// Componente simple de diagnóstico de datos
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { DirectDataLoader } from '../services/direct-data-loader';
import { Capacitor } from '@capacitor/core';

interface SimpleDataDebugProps {
  userId: string | null;
}

export const SimpleDataDebug: React.FC<SimpleDataDebugProps> = ({ userId }) => {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const testDataLoading = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      console.log('🧪 Probando carga directa de datos...');
      
      // Probar carga de solicitudes
      const requests = await DirectDataLoader.loadUserRequests(userId);
      console.log('✅ Solicitudes cargadas:', requests.length);
      
      // Probar carga de estadísticas
      const stats = await DirectDataLoader.loadUserStats(userId);
      console.log('✅ Estadísticas cargadas:', stats);
      
      setTestResults({
        requests: requests.length,
        stats: stats,
        platform: Capacitor.getPlatform(),
        timestamp: new Date().toLocaleTimeString()
      });
      
    } catch (error) {
      console.error('❌ Error en prueba:', error);
      setTestResults({
        error: error.message,
        platform: Capacitor.getPlatform(),
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setLoading(false);
    }
  };
  
  const platform = Capacitor.getPlatform();
  const isAndroid = platform === 'android';
  
  return (
    <Card className="w-full max-w-2xl mx-auto mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📱 Diagnóstico Simple de Datos
          <Badge variant={isAndroid ? "default" : "secondary"}>{platform}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Información de la plataforma */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm">
            <div><strong>Plataforma:</strong> {platform}</div>
            <div><strong>Es Android:</strong> {isAndroid ? 'Sí' : 'No'}</div>
            <div><strong>Usuario:</strong> {userId || 'No disponible'}</div>
          </div>
        </div>
        
        {/* Resultados de la prueba */}
        {testResults && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-sm">
              <div><strong>Resultado de la prueba:</strong></div>
              <div>• Solicitudes: {testResults.requests || 'Error'}</div>
              <div>• Estadísticas: {testResults.stats ? 'Cargadas' : 'Error'}</div>
              <div>• Timestamp: {testResults.timestamp}</div>
              {testResults.error && (
                <div className="text-red-600">• Error: {testResults.error}</div>
              )}
            </div>
          </div>
        )}
        
        {/* Botón de prueba */}
        <Button 
          onClick={testDataLoading} 
          disabled={loading || !userId}
          className="w-full"
        >
          {loading ? "🔄" : "🧪"} Probar Carga Directa de Datos
        </Button>
        
        {/* Información adicional */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>• Este componente prueba la carga directa de datos</div>
          <div>• No usa Firebase, cache, ni complicaciones</div>
          <div>• Debería funcionar en todas las plataformas</div>
          <div>• Si falla aquí, hay un problema más profundo</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleDataDebug;
