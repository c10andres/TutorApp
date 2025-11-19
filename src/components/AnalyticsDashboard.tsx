// Dashboard de analytics completo
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { usersService } from '../services/users';
import { tutoringService } from '../services/tutoring';
import { reviewsService } from '../services/reviews';
import { formatPriceCOP, formatDate } from '../utils/formatters';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  DollarSign,
  Star,
  Calendar,
  Clock,
  Target,
  Award,
  Activity,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';

interface AnalyticsDashboardProps {
  className?: string;
}

interface AnalyticsData {
  overview: {
    totalStudents: number;
    totalTutors: number;
    totalSessions: number;
    totalRevenue: number;
    averageRating: number;
    activeUsers: number;
  };
  trends: {
    sessionsGrowth: number;
    revenueGrowth: number;
    userGrowth: number;
    ratingTrend: number;
  };
  topPerformers: {
    tutors: Array<{
      id: string;
      name: string;
      rating: number;
      sessions: number;
      revenue: number;
    }>;
    students: Array<{
      id: string;
      name: string;
      sessions: number;
      rating: number;
    }>;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    value?: number;
  }>;
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30d');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      // Simular carga de datos de analytics
      // En producción, esto vendría de un servicio de analytics real
      const mockData: AnalyticsData = {
        overview: {
          totalStudents: 1247,
          totalTutors: 89,
          totalSessions: 3456,
          totalRevenue: 125000000, // COP
          averageRating: 4.7,
          activeUsers: 892
        },
        trends: {
          sessionsGrowth: 12.5,
          revenueGrowth: 18.3,
          userGrowth: 8.7,
          ratingTrend: 2.1
        },
        topPerformers: {
          tutors: [
            { id: '1', name: 'Dr. María González', rating: 4.9, sessions: 156, revenue: 7800000 },
            { id: '2', name: 'Prof. Carlos Ruiz', rating: 4.8, sessions: 142, revenue: 7100000 },
            { id: '3', name: 'Ing. Ana Martínez', rating: 4.7, sessions: 128, revenue: 6400000 }
          ],
          students: [
            { id: '1', name: 'Sofia López', sessions: 45, rating: 4.8 },
            { id: '2', name: 'Diego Ramírez', sessions: 38, rating: 4.6 },
            { id: '3', name: 'Valentina Torres', sessions: 32, rating: 4.7 }
          ]
        },
        recentActivity: [
          { id: '1', type: 'session', description: 'Nueva sesión completada', timestamp: new Date(), value: 50000 },
          { id: '2', type: 'review', description: 'Reseña de 5 estrellas recibida', timestamp: new Date(), value: 5 },
          { id: '3', type: 'payment', description: 'Pago procesado', timestamp: new Date(), value: 75000 },
          { id: '4', type: 'registration', description: 'Nuevo tutor registrado', timestamp: new Date() }
        ]
      };

      setAnalytics(mockData);
    } catch (err) {
      setError('Error cargando analytics');
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUp className="size-4 text-green-500" />;
    if (trend < 0) return <ArrowDown className="size-4 text-red-500" />;
    return <Minus className="size-4 text-gray-500" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <RefreshCw className="size-6 animate-spin text-blue-500" />
            <span className="text-lg">Cargando analytics...</span>
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
              <Button onClick={loadAnalytics} className="mt-4">
                <RefreshCw className="size-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <BarChart3 className="size-12 mx-auto mb-4 text-gray-300" />
              <p>No hay datos de analytics disponibles</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Analytics</h1>
          <p className="text-gray-600">Métricas y estadísticas de la plataforma</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
              <SelectItem value="1y">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="size-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalStudents.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(analytics.trends.userGrowth)}
                  <span className={`text-sm ${getTrendColor(analytics.trends.userGrowth)}`}>
                    {analytics.trends.userGrowth > 0 ? '+' : ''}{analytics.trends.userGrowth}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="size-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tutores</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalTutors.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(analytics.trends.userGrowth)}
                  <span className={`text-sm ${getTrendColor(analytics.trends.userGrowth)}`}>
                    {analytics.trends.userGrowth > 0 ? '+' : ''}{analytics.trends.userGrowth}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <BookOpen className="size-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sesiones Totales</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalSessions.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(analytics.trends.sessionsGrowth)}
                  <span className={`text-sm ${getTrendColor(analytics.trends.sessionsGrowth)}`}>
                    {analytics.trends.sessionsGrowth > 0 ? '+' : ''}{analytics.trends.sessionsGrowth}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="size-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">{formatPriceCOP(analytics.overview.totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(analytics.trends.revenueGrowth)}
                  <span className={`text-sm ${getTrendColor(analytics.trends.revenueGrowth)}`}>
                    {analytics.trends.revenueGrowth > 0 ? '+' : ''}{analytics.trends.revenueGrowth}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <DollarSign className="size-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rating Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.averageRating}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(analytics.trends.ratingTrend)}
                  <span className={`text-sm ${getTrendColor(analytics.trends.ratingTrend)}`}>
                    {analytics.trends.ratingTrend > 0 ? '+' : ''}{analytics.trends.ratingTrend}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Star className="size-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.activeUsers.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Activity className="size-4 text-green-500" />
                  <span className="text-sm text-green-600">Activos</span>
                </div>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <Activity className="size-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="size-5" />
              Top Tutores
            </CardTitle>
            <CardDescription>Mejores tutores por rendimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topPerformers.tutors.map((tutor, index) => (
                <div key={tutor.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{tutor.name}</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="size-3 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{tutor.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-600">{tutor.sessions} sesiones</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">{formatPriceCOP(tutor.revenue)}</p>
                    <p className="text-xs text-gray-500">Ingresos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-5" />
              Top Estudiantes
            </CardTitle>
            <CardDescription>Estudiantes más activos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topPerformers.students.map((student, index) => (
                <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{student.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{student.sessions} sesiones</span>
                        <span className="text-sm text-gray-500">•</span>
                        <div className="flex items-center gap-1">
                          <Star className="size-3 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{student.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    Activo
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actividad Reciente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5" />
            Actividad Reciente
          </CardTitle>
          <CardDescription>Últimas actividades en la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(activity.timestamp)} • {activity.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {activity.value && (
                  <Badge variant="outline">
                    {activity.type === 'session' ? formatPriceCOP(activity.value) : 
                     activity.type === 'review' ? `${activity.value}⭐` : 
                     formatPriceCOP(activity.value)}
                    }
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
