import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { FirebaseFallbackManager } from '../utils/firebase-fallback';
import { 
  AlertTriangle, 
  Database, 
  CheckCircle, 
  ExternalLink,
  Terminal,
  X,
  Info,
  Shield
} from 'lucide-react';
import { FirebaseWebConsoleHelper } from './FirebaseWebConsoleHelper';

interface FirebaseIndexAlertProps {
  show?: boolean;
}

export function FirebaseIndexAlert({ show = true }: FirebaseIndexAlertProps) {
  const [dismissed, setDismissed] = useState(false);
  const [fallbackStatus, setFallbackStatus] = useState(FirebaseFallbackManager.getStatus());
  const [showDetails, setShowDetails] = useState(false);
  const [showWebConsole, setShowWebConsole] = useState(false);

  useEffect(() => {
    // Actualizar estado cada segundo
    const interval = setInterval(() => {
      const newStatus = FirebaseFallbackManager.getStatus();
      setFallbackStatus(newStatus);
    }, 1000);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  if (!show || dismissed || (fallbackStatus.totalErrors === 0 && !fallbackStatus.fallbackMode)) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('firebase-index-alert-dismissed', 'true');
  };

  const copyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    // Mostrar feedback visual temporal
    const event = new CustomEvent('show-toast', {
      detail: { message: `Comando copiado: ${command}`, type: 'success' }
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="fixed bottom-4 right-4 max-w-md z-50">
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-orange-600" />
              <CardTitle className="text-sm text-orange-800">
                Firebase Índices Faltantes
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="size-6 p-0 text-orange-600 hover:text-orange-800"
            >
              <X className="size-4" />
            </Button>
          </div>
          <CardDescription className="text-orange-700 text-xs">
            {fallbackStatus.fallbackMode ? 
              'Modo fallback activo - usando localStorage' : 
              `Se detectaron ${fallbackStatus.totalErrors} índices faltantes`
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Resumen de errores */}
          <div className="space-y-2">
            {fallbackStatus.fallbackMode && (
              <div className="flex items-center gap-2 text-xs bg-orange-100 p-2 rounded">
                <Shield className="size-3 text-orange-600" />
                <span className="text-orange-800">Modo fallback activo</span>
              </div>
            )}
            
            {fallbackStatus.indexErrors.slice(0, 3).map((error, index) => {
              const [path, field] = error.split(':');
              return (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <Database className="size-3 text-orange-600" />
                  <code className="bg-orange-100 px-1 rounded text-orange-800">
                    {path}
                  </code>
                  <Badge variant="outline" className="text-xs">
                    {field}
                  </Badge>
                </div>
              );
            })}
            {fallbackStatus.totalErrors > 3 && (
              <p className="text-xs text-orange-600">
                +{fallbackStatus.totalErrors - 3} más...
              </p>
            )}
          </div>

          {/* Botón principal de acción */}
          <div className="space-y-2">
            <Button
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Info className="size-4 mr-2" />
              {showDetails ? 'Ocultar' : 'Resolver'} índices faltantes
            </Button>

            {showDetails && (
              <div className="space-y-3 p-3 bg-orange-100 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="size-4 text-orange-600" />
                    <h4 className="text-sm font-medium text-orange-800">
                      Los índices ya están definidos
                    </h4>
                  </div>
                  
                  <p className="text-xs text-orange-700 mb-3">
                    Los índices necesarios ya están en <code className="bg-orange-200 px-1 rounded">firebase-rules.json</code>. 
                    Solo necesitas desplegarlos a Firebase:
                  </p>
                  
                  <div className="space-y-2">
                    <div className="p-2 bg-orange-50 rounded border border-orange-200">
                      <p className="text-xs font-medium text-orange-800 mb-1">
                        Opción 1: Script automático (Recomendado)
                      </p>
                      <div 
                        className="flex items-center gap-2 p-2 bg-white rounded cursor-pointer hover:bg-gray-50 border"
                        onClick={() => copyCommand('node firebase-deploy-rules.js')}
                        title="Clic para copiar comando"
                      >
                        <Terminal className="size-3 text-orange-600" />
                        <code className="text-xs font-mono flex-1">
                          node firebase-deploy-rules.js
                        </code>
                        <span className="text-xs text-orange-600">📋</span>
                      </div>
                      <p className="text-xs text-orange-600 mt-1">
                        Requiere Firebase CLI instalado y autenticado
                      </p>
                    </div>

                    <div className="p-2 bg-orange-50 rounded border border-orange-200">
                      <p className="text-xs font-medium text-orange-800 mb-1">
                        Opción 2: Firebase CLI directo
                      </p>
                      <div 
                        className="flex items-center gap-2 p-2 bg-white rounded cursor-pointer hover:bg-gray-50 border"
                        onClick={() => copyCommand('firebase deploy --only database')}
                        title="Clic para copiar comando"
                      >
                        <Terminal className="size-3 text-orange-600" />
                        <code className="text-xs font-mono flex-1">
                          firebase deploy --only database
                        </code>
                        <span className="text-xs text-orange-600">📋</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-orange-200">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Shield className="size-3 text-green-600 mt-0.5" />
                      <p className="text-xs text-green-700">
                        <strong>La app funciona perfectamente:</strong> El sistema de fallback con localStorage mantiene toda la funcionalidad.
                      </p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Info className="size-3 text-blue-600 mt-0.5" />
                      <p className="text-xs text-blue-700">
                        <strong>Después del deploy:</strong> Los índices se propagarán en 1-2 minutos y esta alerta desaparecerá.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowWebConsole(!showWebConsole)}
                        className="w-full text-xs text-blue-700 border-blue-300 hover:bg-blue-100"
                      >
                        <ExternalLink className="size-3 mr-1" />
                        {showWebConsole ? 'Ocultar' : 'Ver'} solución sin terminal
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          FirebaseFallbackManager.clearErrors();
                          setFallbackStatus(FirebaseFallbackManager.getStatus());
                        }}
                        className="w-full text-xs text-orange-700 border-orange-300 hover:bg-orange-100"
                      >
                        <CheckCircle className="size-3 mr-1" />
                        Verificar estado
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2 text-xs text-orange-600">
            <div className="size-2 bg-orange-500 rounded-full animate-pulse" />
            <span>Usando fallback de localStorage</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Web Console Helper Modal */}
      {showWebConsole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="relative max-w-4xl w-full max-h-[90vh] overflow-auto">
            <Button
              onClick={() => setShowWebConsole(false)}
              className="absolute top-2 right-2 z-10 size-8 p-0 bg-white hover:bg-gray-100 text-gray-600"
              variant="outline"
            >
              <X className="size-4" />
            </Button>
            <FirebaseWebConsoleHelper />
          </div>
        </div>
      )}
    </div>
  );
}
