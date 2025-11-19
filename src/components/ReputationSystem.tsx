// Sistema de reputación y badges
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { reviewsService } from '../services/reviews';
import { 
  Award,
  Star,
  Target,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  Crown,
  Shield,
  Zap,
  Trophy,
  Medal,
  Gem
} from 'lucide-react';

interface ReputationSystemProps {
  tutorId: string;
  className?: string;
}

interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  requirement: string;
  unlocked: boolean;
}

export function ReputationSystem({ tutorId, className }: ReputationSystemProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, [tutorId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const analyticsData = await reviewsService.getReviewAnalytics(tutorId);
      setAnalytics(analyticsData);
    } catch (err) {
      setError('Error cargando sistema de reputación');
      console.error('Error loading reputation:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeInfo = (badgeId: string): BadgeInfo => {
    const badges: { [key: string]: BadgeInfo } = {
      'excellent-tutor': {
        id: 'excellent-tutor',
        name: 'Tutor Excelente',
        description: 'Calificación promedio de 4.8+ estrellas',
        icon: <Crown className="size-4" />,
        color: 'text-purple-600 bg-purple-100',
        requirement: '4.8+ estrellas',
        unlocked: analytics?.averageRating >= 4.8
      },
      'highly-rated': {
        id: 'highly-rated',
        name: 'Altamente Calificado',
        description: 'Calificación promedio de 4.5+ estrellas',
        icon: <Star className="size-4" />,
        color: 'text-blue-600 bg-blue-100',
        requirement: '4.5+ estrellas',
        unlocked: analytics?.averageRating >= 4.5
      },
      'quality-tutor': {
        id: 'quality-tutor',
        name: 'Tutor de Calidad',
        description: 'Calificación promedio de 4.0+ estrellas',
        icon: <Shield className="size-4" />,
        color: 'text-green-600 bg-green-100',
        requirement: '4.0+ estrellas',
        unlocked: analytics?.averageRating >= 4.0
      },
      'century-club': {
        id: 'century-club',
        name: 'Club del Siglo',
        description: '100+ reseñas recibidas',
        icon: <Trophy className="size-4" />,
        color: 'text-yellow-600 bg-yellow-100',
        requirement: '100+ reseñas',
        unlocked: analytics?.totalReviews >= 100
      },
      'experienced': {
        id: 'experienced',
        name: 'Experimentado',
        description: '50+ reseñas recibidas',
        icon: <Medal className="size-4" />,
        color: 'text-orange-600 bg-orange-100',
        requirement: '50+ reseñas',
        unlocked: analytics?.totalReviews >= 50
      },
      'established': {
        id: 'established',
        name: 'Establecido',
        description: '25+ reseñas recibidas',
        icon: <Award className="size-4" />,
        color: 'text-indigo-600 bg-indigo-100',
        requirement: '25+ reseñas',
        unlocked: analytics?.totalReviews >= 25
      },
      'proven': {
        id: 'proven',
        name: 'Probado',
        description: '10+ reseñas recibidas',
        icon: <CheckCircle className="size-4" />,
        color: 'text-teal-600 bg-teal-100',
        requirement: '10+ reseñas',
        unlocked: analytics?.totalReviews >= 10
      },
      'consistently-excellent': {
        id: 'consistently-excellent',
        name: 'Consistentemente Excelente',
        description: '80%+ de reseñas de 5 estrellas',
        icon: <Gem className="size-4" />,
        color: 'text-pink-600 bg-pink-100',
        requirement: '80%+ de 5 estrellas',
        unlocked: analytics?.ratingDistribution?.[5] >= (analytics?.totalReviews * 0.8)
      },
      'mostly-excellent': {
        id: 'mostly-excellent',
        name: 'Mayormente Excelente',
        description: '60%+ de reseñas de 5 estrellas',
        icon: <Zap className="size-4" />,
        color: 'text-cyan-600 bg-cyan-100',
        requirement: '60%+ de 5 estrellas',
        unlocked: analytics?.ratingDistribution?.[5] >= (analytics?.totalReviews * 0.6)
      }
    };

    return badges[badgeId] || {
      id: badgeId,
      name: badgeId,
      description: 'Badge personalizado',
      icon: <Award className="size-4" />,
      color: 'text-gray-600 bg-gray-100',
      requirement: 'Requisito no especificado',
      unlocked: false
    };
  };

  const getReputationLevel = (level: string) => {
    const levels = {
      'legendary': { name: 'Legendario', color: 'text-purple-600 bg-purple-100', icon: <Crown className="size-5" /> },
      'expert': { name: 'Experto', color: 'text-blue-600 bg-blue-100', icon: <Star className="size-5" /> },
      'experienced': { name: 'Experimentado', color: 'text-green-600 bg-green-100', icon: <Shield className="size-5" /> },
      'developing': { name: 'En Desarrollo', color: 'text-yellow-600 bg-yellow-100', icon: <Target className="size-5" /> },
      'new': { name: 'Nuevo', color: 'text-gray-600 bg-gray-100', icon: <Users className="size-5" /> }
    };

    return levels[level as keyof typeof levels] || levels['new'];
  };

  const getNextLevelRequirement = () => {
    if (!analytics) return null;

    const currentLevel = analytics.reputationLevel;
    const currentRating = analytics.averageRating;
    const currentReviews = analytics.totalReviews;

    if (currentLevel === 'new') {
      return { rating: 3.5, reviews: 5, level: 'developing' };
    } else if (currentLevel === 'developing') {
      return { rating: 4.0, reviews: 10, level: 'experienced' };
    } else if (currentLevel === 'experienced') {
      return { rating: 4.5, reviews: 25, level: 'expert' };
    } else if (currentLevel === 'expert') {
      return { rating: 4.8, reviews: 50, level: 'legendary' };
    }

    return null;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Cargando reputación...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Users className="size-12 mx-auto mb-4 text-gray-300" />
            <p>No hay datos de reputación disponibles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentLevel = getReputationLevel(analytics.reputationLevel);
  const nextRequirement = getNextLevelRequirement();
  const allBadges = analytics.badges || [];
  const availableBadges = [
    'excellent-tutor', 'highly-rated', 'quality-tutor',
    'century-club', 'experienced', 'established', 'proven',
    'consistently-excellent', 'mostly-excellent'
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Nivel de reputación actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="size-5" />
            Nivel de Reputación
          </CardTitle>
          <CardDescription>
            Tu nivel actual en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${currentLevel.color} font-medium`}>
              {currentLevel.icon}
              {currentLevel.name}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {analytics.averageRating} estrellas • {analytics.totalReviews} reseñas
            </p>
          </div>

          {/* Progreso hacia el siguiente nivel */}
          {nextRequirement && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso hacia {nextRequirement.level}</span>
                <span>
                  {Math.round((analytics.averageRating / nextRequirement.rating) * 100)}%
                </span>
              </div>
              <Progress 
                value={(analytics.averageRating / nextRequirement.rating) * 100} 
                className="h-2" 
              />
              <p className="text-xs text-gray-600">
                Necesitas {nextRequirement.rating} estrellas y {nextRequirement.reviews} reseñas
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badges desbloqueados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="size-5" />
            Logros Desbloqueados
          </CardTitle>
          <CardDescription>
            {allBadges.length} de {availableBadges.length} badges desbloqueados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allBadges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allBadges.map((badgeId: string) => {
                const badge = getBadgeInfo(badgeId);
                return (
                  <div key={badge.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className={`p-2 rounded-full ${badge.color}`}>
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{badge.name}</h4>
                      <p className="text-xs text-gray-600">{badge.description}</p>
                    </div>
                    <CheckCircle className="size-4 text-green-500" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Trophy className="size-12 mx-auto mb-4 text-gray-300" />
              <p>No hay badges desbloqueados aún</p>
              <p className="text-sm">Comienza a recibir reseñas para desbloquear logros</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badges disponibles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="size-5" />
            Logros Disponibles
          </CardTitle>
          <CardDescription>
            Badges que puedes desbloquear
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableBadges.map((badgeId) => {
              const badge = getBadgeInfo(badgeId);
              const isUnlocked = allBadges.includes(badgeId);
              
              return (
                <div key={badge.id} className={`flex items-center gap-3 p-3 border rounded-lg ${
                  isUnlocked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className={`p-2 rounded-full ${
                    isUnlocked ? badge.color : 'text-gray-400 bg-gray-100'
                  }`}>
                    {badge.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium text-sm ${isUnlocked ? 'text-green-800' : 'text-gray-700'}`}>
                      {badge.name}
                    </h4>
                    <p className="text-xs text-gray-600">{badge.description}</p>
                    <p className="text-xs text-blue-600 mt-1">Requisito: {badge.requirement}</p>
                  </div>
                  {isUnlocked ? (
                    <CheckCircle className="size-4 text-green-500" />
                  ) : (
                    <div className="size-4 border-2 border-gray-300 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
