// Sistema de reportes avanzado
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { formatPriceCOP, formatDate } from '../utils/formatters';
import { 
  FileText,
  Download,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Star,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  Info,
  RefreshCw,
  Eye,
  Share2
} from 'lucide-react';

interface ReportingSystemProps {
  className?: string;
}

interface ReportData {
  id: string;
  title: string;
  description: string;
  type: 'financial' | 'academic' | 'user' | 'performance';
  period: string;
  generatedAt: Date;
  status: 'completed' | 'processing' | 'failed';
  metrics: {
    totalSessions: number;
    totalRevenue: number;
    averageRating: number;
    userGrowth: number;
    completionRate: number;
  };
  charts: Array<{
    type: 'bar' | 'line' | 'pie';
    title: string;
    data: any;
  }>;
}

export function ReportingSystem({ className }: ReportingSystemProps) {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedType, setSelectedType] = useState('all');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReports();
  }, [selectedPeriod, selectedType]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');

      // Simular carga de reportes
      const mockReports: ReportData[] = [
        {
          id: '1',
          title: 'Reporte Financiero Mensual',
          description: 'Análisis de ingresos y gastos del último mes',
          type: 'financial',
          period: '30d',
          generatedAt: new Date(),
          status: 'completed',
          metrics: {
            totalSessions: 456,
            totalRevenue: 12500000,
            averageRating: 4.7,
            userGrowth: 12.5,
            completionRate: 94.2
          },
          charts: [
            { type: 'bar', title: 'Ingresos por Día', data: {} },
            { type: 'line', title: 'Tendencia de Crecimiento', data: {} }
          ]
        },
        {
          id: '2',
          title: 'Reporte Académico Trimestral',
          description: 'Métricas de rendimiento académico y satisfacción',
          type: 'academic',
          period: '90d',
          generatedAt: new Date(Date.now() - 86400000),
          status: 'completed',
          metrics: {
            totalSessions: 1234,
            totalRevenue: 34500000,
            averageRating: 4.8,
            userGrowth: 18.3,
            completionRate: 96.1
          },
          charts: [
            { type: 'pie', title: 'Distribución por Materia', data: {} },
            { type: 'bar', title: 'Calificaciones por Tutor', data: {} }
          ]
        },
        {
          id: '3',
          title: 'Reporte de Usuarios Semanal',
          description: 'Análisis de crecimiento y actividad de usuarios',
          type: 'user',
          period: '7d',
          generatedAt: new Date(Date.now() - 172800000),
          status: 'processing',
          metrics: {
            totalSessions: 89,
            totalRevenue: 2100000,
            averageRating: 4.6,
            userGrowth: 5.2,
            completionRate: 92.8
          },
          charts: []
        }
      ];

      setReports(mockReports);
    } catch (err) {
      setError('Error cargando reportes');
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setGenerating(true);
      
      // Simular generación de reporte
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newReport: ReportData = {
        id: Date.now().toString(),
        title: `Reporte ${selectedType === 'all' ? 'General' : selectedType} - ${selectedPeriod}`,
        description: `Reporte generado para el período ${selectedPeriod}`,
        type: selectedType as any,
        period: selectedPeriod,
        generatedAt: new Date(),
        status: 'completed',
        metrics: {
          totalSessions: Math.floor(Math.random() * 1000) + 100,
          totalRevenue: Math.floor(Math.random() * 50000000) + 1000000,
          averageRating: Math.random() * 2 + 3.5,
          userGrowth: Math.random() * 20 + 5,
          completionRate: Math.random() * 10 + 90
        },
        charts: [
          { type: 'bar', title: 'Métricas Principales', data: {} },
          { type: 'line', title: 'Tendencias', data: {} }
        ]
      };

      setReports(prev => [newReport, ...prev]);
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = (reportId: string) => {
    // Simular descarga de reporte
    console.log('Downloading report:', reportId);
    // En producción, aquí se generaría y descargaría el archivo
  };

  const shareReport = (reportId: string) => {
    // Simular compartir reporte
    console.log('Sharing report:', reportId);
    // En producción, aquí se generaría un enlace compartible
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'financial': return <DollarSign className="size-4" />;
      case 'academic': return <Star className="size-4" />;
      case 'user': return <Users className="size-4" />;
      case 'performance': return <Target className="size-4" />;
      default: return <FileText className="size-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'financial': return 'text-green-600 bg-green-100';
      case 'academic': return 'text-blue-600 bg-blue-100';
      case 'user': return 'text-purple-600 bg-purple-100';
      case 'performance': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="size-4 text-green-500" />;
      case 'processing': return <RefreshCw className="size-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertCircle className="size-4 text-red-500" />;
      default: return <Info className="size-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <RefreshCw className="size-6 animate-spin text-blue-500" />
            <span className="text-lg">Cargando reportes...</span>
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
              <Button onClick={loadReports} className="mt-4">
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
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Reportes</h1>
          <p className="text-gray-600">Genera y gestiona reportes detallados</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={generateReport} disabled={generating}>
            {generating ? (
              <>
                <RefreshCw className="size-4 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <FileText className="size-4 mr-2" />
                Generar Reporte
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="size-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="period">Período</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 días</SelectItem>
                  <SelectItem value="30d">Últimos 30 días</SelectItem>
                  <SelectItem value="90d">Últimos 90 días</SelectItem>
                  <SelectItem value="1y">Último año</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="financial">Financiero</SelectItem>
                  <SelectItem value="academic">Académico</SelectItem>
                  <SelectItem value="user">Usuarios</SelectItem>
                  <SelectItem value="performance">Rendimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Buscar</Label>
              <Input placeholder="Buscar reportes..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de reportes */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <FileText className="size-12 mx-auto mb-4 text-gray-300" />
                <p>No hay reportes disponibles</p>
                <p className="text-sm">Genera tu primer reporte para comenzar</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${getTypeColor(report.type)}`}>
                      {getTypeIcon(report.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{report.title}</h3>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status === 'completed' ? 'Completado' :
                           report.status === 'processing' ? 'Procesando' : 'Fallido'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{report.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Sesiones</p>
                          <p className="font-semibold">{report.metrics.totalSessions.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Ingresos</p>
                          <p className="font-semibold">{formatPriceCOP(report.metrics.totalRevenue)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Rating</p>
                          <p className="font-semibold">{report.metrics.averageRating.toFixed(1)}⭐</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Crecimiento</p>
                          <p className="font-semibold text-green-600">+{report.metrics.userGrowth}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="size-4" />
                        <span>Generado: {formatDate(report.generatedAt)}</span>
                        <span>•</span>
                        <span>Período: {report.period}</span>
                        <span>•</span>
                        <span>Charts: {report.charts.length}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(report.status)}
                    <Button variant="outline" size="sm" onClick={() => downloadReport(report.id)}>
                      <Download className="size-4 mr-2" />
                      Descargar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => shareReport(report.id)}>
                      <Share2 className="size-4 mr-2" />
                      Compartir
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="size-4 mr-2" />
                      Ver
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
