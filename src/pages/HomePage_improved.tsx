// HomePage mejorada con layout dinámico y responsive
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useStatsRefresh } from '../hooks/useStatsRefresh';
import { usePlatform } from '../hooks/usePlatform';
import { DynamicLayout, DynamicSection, DynamicGrid, DynamicCard, DynamicButton } from '../components/DynamicLayout';
import { TutorCard, TutorCardSkeleton } from '../components/TutorCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tutor, TutorRequest, User } from '../types';
import { tutoringService } from '../services/tutoring';
import { usersService } from '../services/users';
import { formatPriceCOP, formatNumber } from '../utils/formatters';
import { createDemoNotifications, clearDemoNotifications } from '../utils/demo-notifications';
import { notificationsService } from '../services/notifications';
import { TestUserOptions } from '../components/TestUserOptions';
import { DebugStatsPanel } from '../components/DebugStatsPanel';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Users, 
  Star,
  Search,
  MessageSquare,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  GraduationCap,
  BookmarkCheck,
  MapPin,
  Bell,
  X,
  Brain,
  BarChart3,
  CalendarCheck,
  Zap,
  Target,
  HelpCircle
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { user, switchMode, loading: authLoading, isTestUser } = useAuth();
  const platform = usePlatform();
  const { refreshStats } = useStatsRefresh();
  
  const [featuredTutors, setFeaturedTutors] = useState<Tutor[]>([]);
  const [recentRequests, setRecentRequests] = useState<TutorRequest[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    avgRating: 0,
    totalEarnings: 0,
    totalSpent: 0,
    completedSessions: 0,
    activeRequests: 0
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Datos de ejemplo para las estadísticas
  const quickStats = [
    {
      title: "Sesiones Completadas",
      value: stats.completedSessions,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Calificación Promedio",
      value: `${stats.avgRating.toFixed(1)} ★`,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Solicitudes Activas",
      value: stats.activeRequests,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: user?.mode === 'tutor' ? "Ganancias Totales" : "Total Invertido",
      value: formatPriceCOP(user?.mode === 'tutor' ? stats.totalEarnings : stats.totalSpent),
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  // Funcionalidades IA
  const aiFeatures = [
    {
      title: "Smart Matching",
      description: "Encuentra tutores perfectos con IA",
      icon: Target,
      color: "bg-blue-500",
      action: () => onNavigate('smart-matching')
    },
    {
      title: "Predictor Académico",
      description: "Predice tu rendimiento académico",
      icon: BarChart3,
      color: "bg-green-500",
      action: () => onNavigate('academic-predictor')
    },
    {
      title: "Plan de Estudio",
      description: "Planifica tus estudios con IA",
      icon: CalendarCheck,
      color: "bg-purple-500",
      action: () => onNavigate('study-planner')
    },
    {
      title: "Soporte 24/7",
      description: "Asistente virtual inteligente",
      icon: HelpCircle,
      color: "bg-orange-500",
      action: () => onNavigate('support')
    }
  ];

  // Acciones rápidas
  const quickActions = [
    {
      title: "Buscar Tutores",
      description: "Encuentra el tutor perfecto",
      icon: Search,
      color: "bg-blue-600",
      action: () => onNavigate('search')
    },
    {
      title: "Mis Solicitudes",
      description: "Ver estado de solicitudes",
      icon: BookOpen,
      color: "bg-green-600",
      action: () => onNavigate('requests')
    },
    {
      title: "Chat",
      description: "Mensajes con tutores",
      icon: MessageSquare,
      color: "bg-purple-600",
      action: () => onNavigate('chat')
    },
    {
      title: "Mi Perfil",
      description: "Editar información personal",
      icon: Users,
      color: "bg-orange-600",
      action: () => onNavigate('profile')
    }
  ];

  useEffect(() => {
    loadData();
    loadNotifications();
  }, [user, refreshStats]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar tutores destacados
      const tutorsData = await usersService.getFeaturedTutors();
      setFeaturedTutors(tutorsData.slice(0, 6));

      // Cargar solicitudes recientes
      if (user) {
        const requestsData = await tutoringService.getUserRequests(user.id);
        setRecentRequests(requestsData.slice(0, 3));
        
        // Calcular estadísticas
        const userStats = await tutoringService.getUserStats(user.id);
        setStats(userStats);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      if (user) {
        const notificationsData = await notificationsService.getUserNotifications(user.id);
        setNotifications(notificationsData.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleNotificationAction = async (action: string) => {
    try {
      if (action === 'create') {
        await createDemoNotifications(user?.id || '');
        await loadNotifications();
      } else if (action === 'clear') {
        await clearDemoNotifications(user?.id || '');
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error with notifications:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <DynamicLayout backgroundColor="gray">
        <div className="space-y-6">
          {/* Stats skeleton */}
          <DynamicGrid cols={{ mobile: 2, tablet: 4, desktop: 4 }} gap="md">
            {Array.from({ length: 4 }).map((_, i) => (
              <DynamicCard key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </DynamicCard>
            ))}
          </DynamicGrid>

          {/* Tutors skeleton */}
          <DynamicSection title="Cargando..." spacing="md">
            <DynamicGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <TutorCardSkeleton key={i} />
              ))}
            </DynamicGrid>
          </DynamicSection>
        </div>
      </DynamicLayout>
    );
  }

  return (
    <DynamicLayout
      title={`¡Hola, ${user?.firstName || 'Usuario'}! 👋`}
      subtitle={`Modo: ${user?.mode === 'student' ? 'Estudiante' : 'Tutor'}`}
      backgroundColor="gray"
      rightAction={
        <div className="flex items-center gap-2">
          {/* Notificaciones */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="tap-area relative p-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            <Bell className={`${platform.isMobile ? 'size-5' : 'size-6'} text-gray-600`} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Switch Mode */}
          <DynamicButton
            variant="outline"
            size="sm"
            onClick={switchMode}
            className="bg-white"
          >
            {user?.mode === 'student' ? (
              <>
                <GraduationCap className="size-4 mr-1" />
                {platform.isMobile ? '' : 'Ser Tutor'}
              </>
            ) : (
              <>
                <BookOpen className="size-4 mr-1" />
                {platform.isMobile ? '' : 'Ser Estudiante'}
              </>
            )}
          </DynamicButton>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Panel de notificaciones */}
        {showNotifications && (
          <Alert className="bg-blue-50 border-blue-200">
            <Bell className="size-4" />
            <AlertDescription>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Notificaciones ({notifications.length})</span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="tap-area p-1 hover:bg-blue-100 rounded"
                >
                  <X className="size-4" />
                </button>
              </div>
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-600">No tienes notificaciones nuevas</p>
              ) : (
                <div className="space-y-2">
                  {notifications.slice(0, 3).map((notification, index) => (
                    <div key={index} className="text-sm p-2 bg-white rounded border-l-4 border-blue-500">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-gray-600">{notification.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Estadísticas rápidas */}
        <DynamicSection title="Resumen" spacing="md">
          <DynamicGrid cols={{ mobile: 2, tablet: 4, desktop: 4 }} gap="md">
            {quickStats.map((stat, index) => (
              <DynamicCard key={index} padding="md" hover>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`size-5 ${stat.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold ${platform.isMobile ? 'text-lg' : 'text-xl'}`}>
                      {stat.value}
                    </p>
                    <p className={`text-gray-600 line-clamp-1 ${platform.isMobile ? 'text-xs' : 'text-sm'}`}>
                      {stat.title}
                    </p>
                  </div>
                </div>
              </DynamicCard>
            ))}
          </DynamicGrid>
        </DynamicSection>

        {/* Funcionalidades de IA */}
        <DynamicSection 
          title="🤖 Inteligencia Artificial" 
          description="Potencia tu aprendizaje con nuestras herramientas de IA"
          spacing="md"
        >
          <DynamicGrid cols={{ mobile: 1, tablet: 2, desktop: 4 }} gap="md">
            {aiFeatures.map((feature, index) => (
              <DynamicCard 
                key={index}
                padding="md"
                hover
                clickable
                onClick={feature.action}
              >
                <div className="text-center space-y-3">
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mx-auto`}>
                    <feature.icon className="size-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${platform.isMobile ? 'text-sm' : 'text-base'}`}>
                      {feature.title}
                    </h3>
                    <p className={`text-gray-600 line-clamp-2 ${platform.isMobile ? 'text-xs' : 'text-sm'}`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </DynamicCard>
            ))}
          </DynamicGrid>
        </DynamicSection>

        {/* Acciones rápidas */}
        <DynamicSection title="Acciones Rápidas" spacing="md">
          <DynamicGrid cols={{ mobile: 2, tablet: 4, desktop: 4 }} gap="md">
            {quickActions.map((action, index) => (
              <DynamicCard
                key={index}
                padding="md"
                hover
                clickable
                onClick={action.action}
              >
                <div className="text-center space-y-3">
                  <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mx-auto`}>
                    <action.icon className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`font-medium ${platform.isMobile ? 'text-sm' : 'text-base'}`}>
                      {action.title}
                    </h3>
                    <p className={`text-gray-500 line-clamp-2 ${platform.isMobile ? 'text-xs' : 'text-sm'}`}>
                      {action.description}
                    </p>
                  </div>
                </div>
              </DynamicCard>
            ))}
          </DynamicGrid>
        </DynamicSection>

        {/* Tutores destacados */}
        <DynamicSection 
          title="⭐ Tutores Destacados" 
          description="Los mejores tutores de Colombia"
          spacing="md"
        >
          <DynamicGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md">
            {featuredTutors.map((tutor) => (
              <TutorCard
                key={tutor.id}
                tutor={tutor}
                onContact={() => onNavigate('request-tutoring', { tutor })}
                onViewProfile={() => onNavigate('tutor-profile', { tutor })}
              />
            ))}
          </DynamicGrid>
          
          <div className="text-center mt-6">
            <DynamicButton
              variant="outline"
              size="md"
              onClick={() => onNavigate('search')}
            >
              <Search className="size-4 mr-2" />
              Ver Todos los Tutores
            </DynamicButton>
          </div>
        </DynamicSection>

        {/* Solicitudes recientes (solo si hay) */}
        {recentRequests.length > 0 && (
          <DynamicSection title="📝 Solicitudes Recientes" spacing="md">
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <DynamicCard key={request.id} padding="md" hover>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium line-clamp-1">{request.subject}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {request.tutorName || 'Sin asignar'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={
                          request.status === 'confirmed' ? 'default' :
                          request.status === 'pending' ? 'secondary' : 'destructive'
                        }
                      >
                        {request.status === 'confirmed' ? 'Confirmada' :
                         request.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                      </Badge>
                    </div>
                  </div>
                </DynamicCard>
              ))}
            </div>
            
            <div className="text-center mt-4">
              <DynamicButton
                variant="outline"
                size="sm"
                onClick={() => onNavigate('requests')}
              >
                Ver Todas las Solicitudes
              </DynamicButton>
            </div>
          </DynamicSection>
        )}

        {/* Opciones de testing (solo para usuarios de prueba) */}
        {isTestUser && (
          <DynamicSection title="🧪 Panel de Pruebas" spacing="md">
            <div className="space-y-4">
              <TestUserOptions 
                onNavigate={onNavigate}
                onNotificationAction={handleNotificationAction}
              />
              <DebugStatsPanel />
            </div>
          </DynamicSection>
        )}

        {/* Call to action final */}
        <DynamicSection spacing="lg">
          <DynamicCard padding="lg" className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                <GraduationCap className="size-8 text-white" />
              </div>
              <div>
                <h2 className={`font-bold text-gray-900 ${platform.isMobile ? 'text-lg' : 'text-xl'}`}>
                  {user?.mode === 'student' 
                    ? '¿Listo para aprender algo nuevo?' 
                    : '¿Listo para enseñar y ganar dinero?'
                  }
                </h2>
                <p className={`text-gray-600 mt-2 ${platform.isMobile ? 'text-sm' : 'text-base'}`}>
                  {user?.mode === 'student'
                    ? 'Encuentra tutores expertos en más de 100 materias'
                    : 'Comparte tu conocimiento y ayuda a otros estudiantes'
                  }
                </p>
              </div>
              <DynamicButton
                variant="primary"
                size="lg"
                fullWidth={platform.isMobile}
                onClick={() => onNavigate(user?.mode === 'student' ? 'search' : 'profile')}
              >
                <Zap className="size-5 mr-2" />
                {user?.mode === 'student' ? 'Buscar Tutores' : 'Configurar Perfil'}
              </DynamicButton>
            </div>
          </DynamicCard>
        </DynamicSection>
      </div>
    </DynamicLayout>
  );
}