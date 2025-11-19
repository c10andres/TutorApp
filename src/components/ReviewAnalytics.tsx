// Componente de análisis de reseñas con estadísticas avanzadas
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { reviewsService } from '../services/reviews';
import { 
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Award,
  Target,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface ReviewAnalyticsProps {
  tutorId: string;
  className?: string;
}

export function ReviewAnalytics({ tutorId, className }: ReviewAnalyticsProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, [tutorId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsData, trendsData] = await Promise.all([
        reviewsService.getReviewAnalytics(tutorId),
        reviewsService.getRecentReviewsWithTrends(tutorId, 10)
      ]);
      
      setAnalytics(analyticsData);
      setTrends(trendsData);
    } catch (err) {
      setError('Error cargando análisis de reseñas');
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getReputationColor = (level: string) => {
    switch (level) {
      case 'legendary': return 'text-purple-600 bg-purple-100';
      case 'expert': return 'text-blue-600 bg-blue-100';
      case 'experienced': return 'text-green-600 bg-green-100';
      case 'developing': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getReputationLabel = (level: string) => {
    switch (level) {
      case 'legendary': return 'Legendario';
      case 'expert': return 'Experto';
      case 'experienced': return 'Experimentado';
      case 'developing': return 'En desarrollo';
      default: return 'Nuevo';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="size-4 text-green-500" />;
      case 'declining': return <TrendingDown className="size-4 text-red-500" />;
      default: return <Minus className="size-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'declining': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Cargando análisis...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center text-red-600">
            <AlertCircle className="size-5 mr-2" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics || analytics.totalReviews === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <BarChart3 className="size-12 mx-auto mb-4 text-gray-300" />
            <p>No hay reseñas disponibles</p>
            <p className="text-sm">Las estadísticas aparecerán cuando se reciban reseñas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Resumen principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-5" />
            Análisis de Reseñas
          </CardTitle>
          <CardDescription>
            Estadísticas detalladas del rendimiento del tutor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rating promedio y reputación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {analytics.averageRating}
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${
                      i < Math.floor(analytics.averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">Calificación promedio</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {analytics.totalReviews}
              </div>
              <p className="text-sm text-gray-600">Total de reseñas</p>
            </div>

            <div className="text-center">
              <Badge className={`${getReputationColor(analytics.reputationLevel)} font-medium`}>
                {getReputationLabel(analytics.reputationLevel)}
              </Badge>
              <p className="text-sm text-gray-600 mt-1">Nivel de reputación</p>
            </div>
          </div>

          {/* Distribución de calificaciones */}
          <div>
            <h4 className="font-medium mb-3">Distribución de calificaciones</h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = analytics.ratingDistribution[rating] || 0;
                const percentage = analytics.totalReviews > 0 
                  ? (count / analytics.totalReviews) * 100 
                  : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-8">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="size-3 text-yellow-400 fill-current" />
                    </div>
                    <div className="flex-1">
                      <Progress value={percentage} className="h-2" />
                    </div>
                    <div className="text-sm text-gray-600 w-12 text-right">
                      {count} ({Math.round(percentage)}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tendencias recientes */}
          {trends && (
            <div>
              <h4 className="font-medium mb-3">Tendencia reciente</h4>
              <div className="flex items-center gap-2">
                {getTrendIcon(trends.trend)}
                <span className={`font-medium ${getTrendColor(trends.trend)}`}>
                  {trends.trend === 'improving' ? 'Mejorando' : 
                   trends.trend === 'declining' ? 'Declinando' : 'Estable'}
                </span>
                {trends.trendPercentage !== 0 && (
                  <span className="text-sm text-gray-600">
                    ({trends.trendPercentage > 0 ? '+' : ''}{trends.trendPercentage}%)
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Basado en las últimas {trends.reviews.length} reseñas
              </p>
            </div>
          )}

          {/* Badges */}
          {analytics.badges && analytics.badges.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Logros</h4>
              <div className="flex flex-wrap gap-2">
                {analytics.badges.map((badge: string) => (
                  <Badge key={badge} variant="outline" className="flex items-center gap-1">
                    <Award className="size-3" />
                    {badge.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reseñas recientes */}
      {trends && trends.reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              Reseñas Recientes
            </CardTitle>
            <CardDescription>
              Últimas {trends.reviews.length} reseñas recibidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trends.reviews.slice(0, 5).map((review: any) => (
                <div key={review.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${
                            i < review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
