// Página de dashboard para monitoreo de modelos ML
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { MLStatusIndicator } from '../components/MLStatusIndicator';
import { 
  Brain, 
  BarChart3, 
  TrendingUp, 
  Activity,
  Zap,
  Target,
  CalendarCheck,
  HelpCircle,
  RefreshCw,
  Download,
  Upload,
  Settings
} from 'lucide-react';
import { mlService } from '../services/ml/MLService';
import { mlTrainingDataGenerator } from '../utils/ml-training-data';

interface MLDashboardPageProps {
  onNavigate: (page: string, data?: any) => void;
}

interface MLMetrics {
  totalPredictions: number;
  accuracy: number;
  trainingTime: number;
  lastUpdate: Date;
  performance: {
    smartMatching: number;
    academicPredictor: number;
    studyPlanner: number;
    supportCenter: number;
  };
}

export function MLDashboardPage({ onNavigate }: MLDashboardPageProps) {
  const [metrics, setMetrics] = useState<MLMetrics>({
    totalPredictions: 0,
    accuracy: 0,
    trainingTime: 0,
    lastUpdate: new Date(),
    performance: {
      smartMatching: 0,
      academicPredictor: 0,
      studyPlanner: 0,
      supportCenter: 0
    }
  });

  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      // Simular carga de métricas
      setMetrics({
        totalPredictions: Math.floor(Math.random() * 10000) + 5000,
        accuracy: Math.random() * 0.2 + 0.8, // 80-100%
        trainingTime: Math.floor(Math.random() * 300) + 120, // 2-7 minutos
        lastUpdate: new Date(),
        performance: {
          smartMatching: Math.random() * 0.2 + 0.8,
          academicPredictor: Math.random() * 0.2 + 0.8,
          studyPlanner: Math.random() * 0.2 + 0.8,
          supportCenter: Math.random() * 0.2 + 0.8
        }
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const trainAllModels = async () => {
    setIsTraining(true);
    setTrainingProgress(0);

    try {
      // Generar datos de entrenamiento
      const smartMatchingData = mlTrainingDataGenerator.generateSmartMatchingData();
      const academicData = mlTrainingDataGenerator.generateAcademicPredictorData();
      const studyPlannerData = mlTrainingDataGenerator.generateStudyPlannerData();
      const supportData = mlTrainingDataGenerator.generateSupportCenterData();

      // Simular entrenamiento
      const steps = [
        'Preparando datos de entrenamiento...',
        'Entrenando Smart Matching...',
        'Entrenando Academic Predictor...',
        'Entrenando Study Planner...',
        'Entrenando Support Center...',
        'Validando modelos...',
        'Finalizando entrenamiento...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTrainingProgress(((i + 1) / steps.length) * 100);
      }

      // Actualizar métricas
      await loadMetrics();
    } catch (error) {
      console.error('Error training models:', error);
    } finally {
      setIsTraining(false);
    }
  };

  const exportModelData = () => {
    // Simular exportación de datos
    const data = {
      metrics,
      timestamp: new Date().toISOString(),
      models: ['smart-matching', 'academic-predictor', 'study-planner', 'support-center']
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ml-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const mlModules = [
    {
      name: 'Smart Matching',
      description: 'Emparejamiento inteligente tutor-estudiante',
      icon: <Target className="size-6" />,
      color: 'bg-blue-500',
      accuracy: metrics.performance.smartMatching,
      predictions: Math.floor(Math.random() * 1000) + 500
    },
    {
      name: 'Academic Predictor',
      description: 'Predicción de rendimiento académico',
      icon: <BarChart3 className="size-6" />,
      color: 'bg-green-500',
      accuracy: metrics.performance.academicPredictor,
      predictions: Math.floor(Math.random() * 800) + 400
    },
    {
      name: 'Study Planner',
      description: 'Planificación optimizada de estudios',
      icon: <CalendarCheck className="size-6" />,
      color: 'bg-purple-500',
      accuracy: metrics.performance.studyPlanner,
      predictions: Math.floor(Math.random() * 600) + 300
    },
    {
      name: 'Support Center',
      description: 'Análisis inteligente de soporte',
      icon: <HelpCircle className="size-6" />,
      color: 'bg-orange-500',
      accuracy: metrics.performance.supportCenter,
      predictions: Math.floor(Math.random() * 400) + 200
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="size-8 text-blue-600" />
            Dashboard ML
          </h1>
          <p className="text-gray-600 mt-2">
            Monitoreo y gestión de modelos de inteligencia artificial
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={trainAllModels} 
            disabled={isTraining}
            variant="outline"
          >
            <RefreshCw className={`size-4 mr-2 ${isTraining ? 'animate-spin' : ''}`} />
            {isTraining ? 'Entrenando...' : 'Entrenar Modelos'}
          </Button>
          
          <Button onClick={exportModelData} variant="outline">
            <Download className="size-4 mr-2" />
            Exportar Datos
          </Button>
        </div>
      </div>

      {/* Métricas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Predicciones Totales</p>
                <p className="text-2xl font-bold">{metrics.totalPredictions.toLocaleString()}</p>
              </div>
              <Activity className="size-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Precisión General</p>
                <p className="text-2xl font-bold">{Math.round(metrics.accuracy * 100)}%</p>
              </div>
              <TrendingUp className="size-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo de Entrenamiento</p>
                <p className="text-2xl font-bold">{Math.round(metrics.trainingTime / 60)}m</p>
              </div>
              <Zap className="size-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Última Actualización</p>
                <p className="text-sm font-bold">{metrics.lastUpdate.toLocaleTimeString()}</p>
              </div>
              <Settings className="size-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de contenido */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="models">Modelos</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="training">Entrenamiento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Estado de modelos */}
            <MLStatusIndicator />
            
            {/* Módulos ML */}
            <Card>
              <CardHeader>
                <CardTitle>Módulos ML</CardTitle>
                <CardDescription>
                  Rendimiento de cada módulo de inteligencia artificial
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mlModules.map((module, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${module.color} text-white`}>
                        {module.icon}
                      </div>
                      <div>
                        <div className="font-medium">{module.name}</div>
                        <div className="text-sm text-gray-600">{module.description}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {Math.round(module.accuracy * 100)}% precisión
                      </div>
                      <div className="text-xs text-gray-600">
                        {module.predictions} predicciones
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mlModules.map((module, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {module.icon}
                    {module.name}
                  </CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Precisión</span>
                    <span className="font-medium">{Math.round(module.accuracy * 100)}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${module.accuracy * 100}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Predicciones: {module.predictions}</span>
                    <Badge variant="outline">Activo</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Rendimiento</CardTitle>
              <CardDescription>
                Análisis detallado del rendimiento de los modelos ML
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mlModules.map((module, index) => (
                    <div key={index} className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(module.accuracy * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">{module.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Entrenamiento de Modelos</CardTitle>
              <CardDescription>
                Gestión y monitoreo del entrenamiento de modelos ML
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isTraining && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Entrenando modelos ML...</span>
                    <span>{Math.round(trainingProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${trainingProgress}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={trainAllModels} 
                  disabled={isTraining}
                  className="w-full"
                >
                  <RefreshCw className={`size-4 mr-2 ${isTraining ? 'animate-spin' : ''}`} />
                  {isTraining ? 'Entrenando...' : 'Entrenar Todos los Modelos'}
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Upload className="size-4 mr-2" />
                  Importar Datos de Entrenamiento
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
