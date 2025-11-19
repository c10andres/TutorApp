// Métricas de rendimiento y performance
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { formatPriceCOP } from '../utils/formatters';
import { 
  Zap,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  DollarSign,
  Star,
  CheckCircle,
  AlertCircle,
  Info,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Gauge
} from 'lucide-react';

interface PerformanceMetricsProps {
  className?: string;
}

interface PerformanceData {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'warning' | 'critical';
  description: string;
  lastUpdated: Date;
}

interface SystemMetrics {
  performance: PerformanceData[];
  kpis: {
    responseTime: number;
    uptime: number;
    errorRate: number;
    userSatisfaction: number;
    conversionRate: number;
    revenuePerUser: number;
  };
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: Date;
  }>;
}

export function PerformanceMetrics({ className }: PerformanceMetricsProps) {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError('');

      // Simular carga de métricas de rendimiento
      const mockMetrics: SystemMetrics = {
        performance: [
          {
            id: '1',
            name: 'Tiempo de Respuesta',
            value: 245,
            target: 200,
            unit: 'ms',
            trend: 'down',
            status: 'warning',
            description: 'Tiempo promedio de respuesta de la API',
            lastUpdated: new Date()
          },
          {
            id: '2',
            name: 'Disponibilidad',
            value: 99.8,
            target: 99.9,
            unit: '%',
            trend: 'up',
            status: 'good',
            description: 'Porcentaje de tiempo que el sistema está disponible',
            lastUpdated: new Date()
          },
          {
            id: '3',
            name: 'Sesiones Activas',
            value: 1247,
            target: 1000,
            unit: 'usuarios',
            trend: 'up',
            status: 'excellent',
            description: 'Número de usuarios activos simultáneamente',
            lastUpdated: new Date()
          },
          {
            id: '4',
            name: 'Tasa de Conversión',
            value: 12.5,
            target: 15.0,
            unit: '%',
            trend: 'up',
            status: 'good',
            description: 'Porcentaje de visitantes que se convierten en usuarios',
            lastUpdated: new Date()
          },
          {
            id: '5',
            name: 'Satisfacción del Usuario',
            value: 4.7,
            target: 4.5,
            unit: '⭐',
            trend: 'up',
            status: 'excellent',
            description: 'Rating promedio de satisfacción del usuario',
            lastUpdated: new Date()
          },
          {
            id: '6',
            name: 'Ingresos por Usuario',
            value: 125000,
            target: 100000,
            unit: 'COP',
            trend: 'up',
            status: 'excellent',
            description: 'Ingresos promedio por usuario activo',
            lastUpdated: new Date()
          }
        ],
        kpis: {
          responseTime: 245,
          uptime: 99.8,
          errorRate: 0.2,
          userSatisfaction: 4.7,
          conversionRate: 12.5,
          revenuePerUser: 125000
        },
        alerts: [
          {
            id: '1',
            type: 'warning',
            message: 'Tiempo de respuesta ligeramente elevado',
            timestamp: new Date()
          },
          {
            id: '2',
            type: 'info',
            message: 'Nuevo récord de usuarios activos',
            timestamp: new Date()
          }
        ]
      };

      setMetrics(mockMetrics);
    } catch (err) {
      setError('Error cargando métricas de rendimiento');
      console.error('Error loading metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="size-4 text-green-500" />;
      case 'good': return <CheckCircle className="size-4 text-blue-500" />;
      case 'warning': return <AlertCircle className="size-4 text-yellow-500" />;
      case 'critical': return <AlertCircle className="size-4 text-red-500" />;
      default: return <Info className="size-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="size-4 text-green-500" />;
      case 'down': return <TrendingDown className="size-4 text-red-500" />;
      default: return <Activity className="size-4 text-gray-500" />;
    }
  };

  const getProgressColor = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-blue-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <RefreshCw className="size-6 animate-spin text-blue-500" />
            <span className="text-lg">Cargando métricas...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p className="text-lg font-medium">{error}</p>
              <Button onClick={loadMetrics} className="mt-4">
                <RefreshCw className="size-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <BarChart3 className="size-12 mx-auto mb-4 text-gray-300" />
              <p>No hay métricas disponibles</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Métricas de Rendimiento</h1>
          <p className="text-gray-600">Monitoreo en tiempo real del sistema</p>
        </div>
        <Button onClick={loadMetrics} variant="outline">
          <RefreshCw className="size-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Alertas */}
      {metrics.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="size-5" />
              Alertas del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.alerts.map((alert) => (
                <div key={alert.id} className={`flex items-center gap-3 p-3 rounded-lg ${
                  alert.type === 'error' ? 'bg-red-50 border border-red-200' :
                  alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-blue-50 border border-blue-200'
                }`}>
                  <div className={`p-1 rounded-full ${
                    alert.type === 'error' ? 'bg-red-100' :
                    alert.type === 'warning' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    {alert.type === 'error' ? <AlertCircle className="size-4 text-red-500" /> :
                     alert.type === 'warning' ? <AlertCircle className="size-4 text-yellow-500" /> :
                     <Info className="size-4 text-blue-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-gray-500">
                      {alert.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo de Respuesta</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.kpis.responseTime}ms</p>
                <p className="text-xs text-gray-500">Promedio</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Zap className="size-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disponibilidad</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.kpis.uptime}%</p>
                <p className="text-xs text-gray-500">Uptime</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Clock className="size-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de Error</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.kpis.errorRate}%</p>
                <p className="text-xs text-gray-500">Errores</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="size-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfacción</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.kpis.userSatisfaction}⭐</p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Star className="size-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversión</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.kpis.conversionRate}%</p>
                <p className="text-xs text-gray-500">Rate</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="size-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos/Usuario</p>
                <p className="text-2xl font-bold text-gray-900">{formatPriceCOP(metrics.kpis.revenuePerUser)}</p>
                <p className="text-xs text-gray-500">ARPU</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <DollarSign className="size-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas detalladas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-5" />
            Métricas Detalladas
          </CardTitle>
          <CardDescription>
            Rendimiento detallado de cada métrica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {metrics.performance.map((metric) => (
              <div key={metric.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{metric.name}</h3>
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.status}
                    </Badge>
                    {getStatusIcon(metric.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(metric.trend)}
                    <span className="text-sm text-gray-500">
                      {metric.lastUpdated.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Valor Actual</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metric.unit === 'COP' ? formatPriceCOP(metric.value) : 
                       `${metric.value}${metric.unit}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Objetivo</p>
                    <p className="text-2xl font-bold text-gray-700">
                      {metric.unit === 'COP' ? formatPriceCOP(metric.target) : 
                       `${metric.target}${metric.unit}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Progreso</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round((metric.value / metric.target) * 100)}%
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progreso hacia el objetivo</span>
                    <span>{Math.round((metric.value / metric.target) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(metric.value / metric.target) * 100} 
                    className="h-2"
                  />
                </div>

                <p className="text-sm text-gray-600">{metric.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
