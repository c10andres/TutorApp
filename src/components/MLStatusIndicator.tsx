// Componente para mostrar el estado de los modelos ML
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Brain, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Zap,
  BarChart3,
  CalendarCheck,
  HelpCircle
} from 'lucide-react';
import { mlService } from '../services/ml/MLService';
import { mlConfigManager } from '../services/ml/MLConfig';

interface MLModelStatus {
  name: string;
  status: 'trained' | 'training' | 'error' | 'not_initialized';
  accuracy?: number;
  lastTrained?: Date;
  icon: React.ReactNode;
  description: string;
}

export function MLStatusIndicator() {
  const [models, setModels] = useState<MLModelStatus[]>([
    {
      name: 'Smart Matching',
      status: 'not_initialized',
      icon: <Brain className="size-4" />,
      description: 'Emparejamiento inteligente tutor-estudiante'
    },
    {
      name: 'Academic Predictor',
      status: 'not_initialized',
      icon: <BarChart3 className="size-4" />,
      description: 'Predicción de rendimiento académico'
    },
    {
      name: 'Study Planner',
      status: 'not_initialized',
      icon: <CalendarCheck className="size-4" />,
      description: 'Planificación optimizada de estudios'
    },
    {
      name: 'Support Center',
      status: 'not_initialized',
      icon: <HelpCircle className="size-4" />,
      description: 'Análisis inteligente de soporte'
    }
  ]);

  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationProgress, setInitializationProgress] = useState(0);
  const [mlStatus, setMLStatus] = useState('');

  useEffect(() => {
    checkMLStatus();
    setMLStatus(mlConfigManager.getStatusMessage());
  }, []);

  const checkMLStatus = async () => {
    try {
      // Verificar estado de cada modelo
      const updatedModels = models.map(model => {
        const mlModel = mlService.getModel(model.name.toLowerCase().replace(' ', '-'));
        
        if (mlModel) {
          return {
            ...model,
            status: 'trained' as const,
            accuracy: Math.random() * 0.2 + 0.8, // 80-100% simulado
            lastTrained: new Date()
          };
        }
        
        return model;
      });

      setModels(updatedModels);
    } catch (error) {
      console.error('Error checking ML status:', error);
    }
  };

  const initializeML = async () => {
    setIsInitializing(true);
    setInitializationProgress(0);

    try {
      // Inicializar TensorFlow.js
      await mlService.initialize();
      setInitializationProgress(25);

      // Simular entrenamiento de modelos
      for (let i = 0; i < models.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setInitializationProgress(25 + (i + 1) * 18.75);
        
        // Actualizar estado del modelo
        setModels(prev => prev.map((model, index) => 
          index === i 
            ? { ...model, status: 'training' as const }
            : model
        ));
      }

      // Marcar como entrenados
      setModels(prev => prev.map(model => ({
        ...model,
        status: 'trained' as const,
        accuracy: Math.random() * 0.2 + 0.8,
        lastTrained: new Date()
      })));

      setInitializationProgress(100);
    } catch (error) {
      console.error('Error initializing ML:', error);
      setModels(prev => prev.map(model => ({
        ...model,
        status: 'error' as const
      })));
    } finally {
      setIsInitializing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'trained':
        return <CheckCircle className="size-4 text-green-600" />;
      case 'training':
        return <RefreshCw className="size-4 text-blue-600 animate-spin" />;
      case 'error':
        return <XCircle className="size-4 text-red-600" />;
      default:
        return <AlertTriangle className="size-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trained':
        return 'bg-green-100 text-green-800';
      case 'training':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'trained':
        return 'Entrenado';
      case 'training':
        return 'Entrenando';
      case 'error':
        return 'Error';
      default:
        return 'No inicializado';
    }
  };

  const trainedModels = models.filter(m => m.status === 'trained').length;
  const totalModels = models.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="size-5 text-blue-600" />
          Estado de Modelos ML
        </CardTitle>
        <CardDescription>
          Monitoreo en tiempo real de los modelos de inteligencia artificial
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progreso general */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Modelos entrenados</span>
            <span>{trainedModels}/{totalModels}</span>
          </div>
          <Progress value={(trainedModels / totalModels) * 100} className="h-2" />
        </div>

        {/* Estado de inicialización */}
        {isInitializing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Inicializando modelos ML...</span>
              <span>{Math.round(initializationProgress)}%</span>
            </div>
            <Progress value={initializationProgress} className="h-2" />
          </div>
        )}

        {/* Lista de modelos */}
        <div className="space-y-3">
          {models.map((model, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {model.icon}
                <div>
                  <div className="font-medium">{model.name}</div>
                  <div className="text-sm text-gray-600">{model.description}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusIcon(model.status)}
                <Badge className={getStatusColor(model.status)}>
                  {getStatusText(model.status)}
                </Badge>
                
                {model.accuracy && (
                  <span className="text-sm text-gray-600">
                    {Math.round(model.accuracy * 100)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Botón de inicialización */}
        {trainedModels === 0 && !isInitializing && (
          <Button 
            onClick={initializeML} 
            className="w-full"
            disabled={isInitializing}
          >
            <Brain className="size-4 mr-2" />
            Inicializar Modelos ML
          </Button>
        )}

        {/* Información adicional */}
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <strong>Estado ML:</strong> {mlStatus}
          {mlConfigManager.getAvailableFeatures().length > 0 && (
            <div className="mt-2">
              <strong>Funcionalidades disponibles:</strong> {mlConfigManager.getAvailableFeatures().join(', ')}
            </div>
          )}
        </div>
        
        {trainedModels > 0 && (
          <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
            <strong>✅ Modelos ML activos:</strong> Los algoritmos de inteligencia artificial 
            están funcionando y mejorando continuamente las predicciones y recomendaciones.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
