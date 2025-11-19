// Componentes de visualización de datos
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { formatPriceCOP } from '../utils/formatters';
import { 
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Users,
  DollarSign,
  Star,
  Calendar,
  Clock,
  Eye,
  Download,
  RefreshCw,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface DataVisualizationProps {
  className?: string;
}

interface ChartData {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'area';
  data: any[];
  metrics: {
    total: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
  period: string;
  lastUpdated: Date;
}

export function DataVisualization({ className }: DataVisualizationProps) {
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [expandedView, setExpandedView] = useState(false);

  useEffect(() => {
    loadCharts();
  }, [selectedPeriod]);

  const loadCharts = async () => {
    try {
      setLoading(true);
      setError('');

      // Simular carga de datos de visualización
      const mockCharts: ChartData[] = [
        {
          id: '1',
          title: 'Sesiones por Día',
          type: 'bar',
          data: [
            { name: 'Lun', value: 45, color: '#3B82F6' },
            { name: 'Mar', value: 52, color: '#3B82F6' },
            { name: 'Mié', value: 38, color: '#3B82F6' },
            { name: 'Jue', value: 61, color: '#3B82F6' },
            { name: 'Vie', value: 55, color: '#3B82F6' },
            { name: 'Sáb', value: 42, color: '#3B82F6' },
            { name: 'Dom', value: 33, color: '#3B82F6' }
          ],
          metrics: {
            total: 326,
            growth: 12.5,
            trend: 'up'
          },
          period: selectedPeriod,
          lastUpdated: new Date()
        },
        {
          id: '2',
          title: 'Ingresos por Mes',
          type: 'line',
          data: [
            { name: 'Ene', value: 12000000, color: '#10B981' },
            { name: 'Feb', value: 15000000, color: '#10B981' },
            { name: 'Mar', value: 18000000, color: '#10B981' },
            { name: 'Abr', value: 16500000, color: '#10B981' },
            { name: 'May', value: 22000000, color: '#10B981' },
            { name: 'Jun', value: 25000000, color: '#10B981' }
          ],
          metrics: {
            total: 108500000,
            growth: 18.3,
            trend: 'up'
          },
          period: selectedPeriod,
          lastUpdated: new Date()
        },
        {
          id: '3',
          title: 'Distribución por Materia',
          type: 'pie',
          data: [
            { name: 'Matemáticas', value: 35, color: '#8B5CF6' },
            { name: 'Física', value: 20, color: '#F59E0B' },
            { name: 'Química', value: 15, color: '#EF4444' },
            { name: 'Inglés', value: 18, color: '#06B6D4' },
            { name: 'Programación', value: 12, color: '#84CC16' }
          ],
          metrics: {
            total: 100,
            growth: 5.2,
            trend: 'stable'
          },
          period: selectedPeriod,
          lastUpdated: new Date()
        },
        {
          id: '4',
          title: 'Crecimiento de Usuarios',
          type: 'area',
          data: [
            { name: 'Sem 1', value: 120, color: '#F97316' },
            { name: 'Sem 2', value: 145, color: '#F97316' },
            { name: 'Sem 3', value: 168, color: '#F97316' },
            { name: 'Sem 4', value: 192, color: '#F97316' },
            { name: 'Sem 5', value: 218, color: '#F97316' },
            { name: 'Sem 6', value: 245, color: '#F97316' }
          ],
          metrics: {
            total: 1088,
            growth: 25.8,
            trend: 'up'
          },
          period: selectedPeriod,
          lastUpdated: new Date()
        }
      ];

      setCharts(mockCharts);
    } catch (err) {
      setError('Error cargando visualizaciones');
      console.error('Error loading charts:', err);
    } finally {
      setLoading(false);
    }
  };

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'bar': return <BarChart3 className="size-5" />;
      case 'line': return <LineChart className="size-5" />;
      case 'pie': return <PieChart className="size-5" />;
      case 'area': return <Activity className="size-5" />;
      default: return <BarChart3 className="size-5" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="size-4 text-green-500" />;
      case 'down': return <TrendingDown className="size-4 text-red-500" />;
      default: return <Activity className="size-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const renderChart = (chart: ChartData) => {
    // Simulación de renderizado de gráfico
    // En producción, aquí se integraría con una librería como Chart.js, D3.js, etc.
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="mb-2">{getChartIcon(chart.type)}</div>
          <p className="text-sm text-gray-600">Gráfico {chart.type}</p>
          <p className="text-xs text-gray-500">{chart.data.length} puntos de datos</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <RefreshCw className="size-6 animate-spin text-blue-500" />
            <span className="text-lg">Cargando visualizaciones...</span>
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
              <Button onClick={loadCharts} className="mt-4">
                <RefreshCw className="size-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visualización de Datos</h1>
          <p className="text-gray-600">Gráficos y métricas interactivas</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">90 días</SelectItem>
              <SelectItem value="1y">1 año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="size-4 mr-2" />
            Exportar
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setExpandedView(!expandedView)}
          >
            {expandedView ? (
              <>
                <Minimize2 className="size-4 mr-2" />
                Compacto
              </>
            ) : (
              <>
                <Maximize2 className="size-4 mr-2" />
                Expandir
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Grid de gráficos */}
      <div className={`grid gap-6 ${
        expandedView 
          ? 'grid-cols-1' 
          : 'grid-cols-1 md:grid-cols-2'
      }`}>
        {charts.map((chart) => (
          <Card key={chart.id} className={selectedChart === chart.id ? 'ring-2 ring-blue-500' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getChartIcon(chart.type)}
                  <CardTitle className="text-lg">{chart.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {chart.type}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedChart(selectedChart === chart.id ? null : chart.id)}
                  >
                    <Eye className="size-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                Período: {chart.period} • Actualizado: {chart.lastUpdated.toLocaleTimeString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Métricas */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {chart.type === 'pie' ? `${chart.metrics.total}%` : chart.metrics.total.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {getTrendIcon(chart.metrics.trend)}
                    <span className={`text-lg font-semibold ${getTrendColor(chart.metrics.trend)}`}>
                      +{chart.metrics.growth}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Crecimiento</p>
                </div>
                <div className="text-center">
                  <Badge className={getTrendColor(chart.metrics.trend)}>
                    {chart.metrics.trend === 'up' ? 'Subiendo' : 
                     chart.metrics.trend === 'down' ? 'Bajando' : 'Estable'}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">Tendencia</p>
                </div>
              </div>

              {/* Gráfico */}
              {renderChart(chart)}

              {/* Datos de muestra */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Datos de Muestra</h4>
                <div className="space-y-1">
                  {chart.data.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">
                        {chart.type === 'pie' ? `${item.value}%` : 
                         chart.title.includes('Ingresos') ? formatPriceCOP(item.value) :
                         item.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {chart.data.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{chart.data.length - 3} más...
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vista expandida */}
      {selectedChart && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getChartIcon(charts.find(c => c.id === selectedChart)?.type || 'bar')}
                {charts.find(c => c.id === selectedChart)?.title}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedChart(null)}
              >
                <Minimize2 className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              {renderChart(charts.find(c => c.id === selectedChart)!)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
