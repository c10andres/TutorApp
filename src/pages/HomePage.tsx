// Página principal / Dashboard
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useStatsRefresh } from '../hooks/useStatsRefresh';
import { useAndroidCleanup } from '../hooks/useAndroidCleanup';
import { Capacitor } from '@capacitor/core';
// Layout ahora se maneja desde App.tsx con ResponsiveContainer y MobileNavigation
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
import DataLoadingStatus from '../components/DataLoadingStatus';
import SimpleDataDebug from '../components/SimpleDataDebug';
import AndroidSyncStatus from '../components/AndroidSyncStatus';
import { platformDiagnostics } from '../utils/platform-diagnostics';
import { androidDebug } from '../utils/android-debug';
import { safeFormatDate } from '../utils/dateUtils';
import { CIEMDashboard } from '../components/CIEMDashboard';
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
  const [tutors, setTutors] = useState<User[]>([]);
  const [requests, setRequests] = useState<TutorRequest[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  
  // Limpieza para Android
  useAndroidCleanup();

  // Debug específico para HomePage
  useEffect(() => {
    androidDebug.log('🏠 HomePage - Componente montado');
    androidDebug.log('👤 Usuario en HomePage:', { user, loading: authLoading });
  }, []);

  useEffect(() => {
    androidDebug.log('🔄 HomePage - Estado cambiado', { 
      user: !!user, 
      loading, 
      tutors: tutors.length, 
      requests: requests.length,
      userStats: !!userStats 
    });
  }, [user, loading, tutors, requests, userStats]);

  // Hook para refrescar estadísticas automáticamente
  useStatsRefresh(() => {
    loadData();
  });

  useEffect(() => {
    androidDebug.log('🏠 HomePage cargada', { user, loading });
    loadData();
  }, [user]);

  const loadData = async () => {
    androidDebug.log('📊 HomePage - loadData iniciado', { user: !!user, userId: user?.id });
    
    if (!user) {
      androidDebug.log('❌ HomePage - No hay usuario, cancelando loadData');
      return;
    }

    try {
      setLoading(true);
      setError('');

      androidDebug.log('🔄 HomePage - Cargando datos...', { 
        mode: user.currentMode, 
        userId: user.id 
      });

      // Cargar datos directamente de Firebase como funcionaba antes
      console.log('📱 CARGANDO datos directamente de Firebase');
      console.log('📱 Plataforma:', Capacitor.getPlatform());
      console.log('👤 User ID:', user.id);
      
      // Cargar tutores y solicitudes en paralelo
      const [tutorsData, requestsData, stats] = await Promise.all([
        usersService.getRecommendedTutors(user.id, 6),
        tutoringService.getUserRequests(user.id),
        usersService.getUserStats(user.id)
      ]);
      
      console.log('✅ Datos cargados:', {
        tutors: tutorsData.length,
        requests: requestsData.length,
        stats: !!stats
      });
      
      setTutors(tutorsData);
      setRequests(requestsData);
      setUserStats(stats);
      
      // Sincronizar datos entre plataformas como funcionaba antes
      const { DataSync } = await import('../utils/data-sync');
      await DataSync.syncDataBetweenPlatforms();
      await DataSync.verifyDataLoading(user.id);
      await DataSync.forceDataReload();
    } catch (err) {
      androidDebug.log('❌ HomePage - Error en loadData:', err);
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      androidDebug.log('✅ HomePage - loadData completado', { 
        loading: false, 
        tutors: tutors.length, 
        requests: requests.length,
        userStats: !!userStats 
      });
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setProcessingRequest(requestId);
      setError('');
      
      console.log('🔄 Aceptando solicitud:', requestId);
      
      // Actualizar estado en Firebase
      await tutoringService.updateRequestStatus(requestId, 'accepted');
      
      console.log('✅ Estado actualizado, recargando datos...');
      
      // Recargar datos completos desde Firebase
      await loadData();
      
      console.log('✅ Solicitud aceptada y datos recargados');
    } catch (err) {
      console.error('❌ Error al aceptar solicitud:', err);
      setError('Error al aceptar la solicitud. Intenta de nuevo.');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setProcessingRequest(requestId);
      setError('');
      
      console.log('🔄 Rechazando solicitud:', requestId);
      
      // Actualizar estado en Firebase
      await tutoringService.updateRequestStatus(requestId, 'rejected');
      
      console.log('✅ Estado actualizado, recargando datos...');
      
      // Recargar datos completos desde Firebase
      await loadData();
      
      console.log('✅ Solicitud rechazada y datos recargados');
    } catch (err) {
      console.error('❌ Error al rechazar solicitud:', err);
      setError('Error al rechazar la solicitud. Intenta de nuevo.');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleModeSwitch = async (mode: 'student' | 'tutor') => {
    try {
      setLoading(true);
      await switchMode(mode);
      
      // Recargar datos inmediatamente después del cambio
      await loadData();
      
      // Mostrar feedback visual del cambio exitoso
      console.log(`Modo cambiado exitosamente a: ${mode === 'student' ? 'Estudiante' : 'Tutor'}`);
    } catch (err) {
      console.error('Error switching mode:', err);
      setError('Error al cambiar el modo. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Función helper para crear solicitudes de prueba
  const createTestRequest = async (status: 'pending' | 'accepted' | 'completed' = 'pending') => {
    try {
      console.log(`🧪 CREANDO SOLICITUD DE PRUEBA (${status})`);
      console.log('Usuario actual:', user?.id, user?.currentMode);
      
      const mockRequest = {
        studentId: user?.id || '',
        tutorId: user?.currentMode === 'student' ? 'mock-tutor-1' : user?.id || '',
        subject: 'Matemáticas',
        description: `Solicitud de prueba (${status}) para verificar contadores - ${new Date().toLocaleTimeString()}`,
        hourlyRate: 45000,
        duration: 60,
        totalAmount: 49500, // 45000 + 10% comisión
        status: 'pending' as const, // Siempre crear como pending primero
        isImmediate: false,
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };
      
      console.log('📋 Datos de la solicitud a crear:', mockRequest);
      
      const createdRequest = await tutoringService.createRequest(mockRequest);
      console.log('✅ Solicitud creada:', createdRequest);
      
      // Si el estado no es pending, actualizarlo
      if (status !== 'pending') {
        console.log(`🔄 Actualizando estado a: ${status}`);
        await tutoringService.updateRequestStatus(createdRequest.id, status);
        console.log('✅ Estado actualizado');
      }
      
      // Recargar datos
      console.log('🔄 Recargando datos...');
      await loadData();
      
      console.log(`✅ Solicitud de prueba (${status}) creada exitosamente!`);
      alert(`Solicitud ${status} creada exitosamente!`);
      return true;
    } catch (error) {
      console.error('❌ Error creando solicitud de prueba:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error creando solicitud ${status}: ${errorMessage}`);
      return false;
    }
  };

  const renderStudentDashboard = () => {
    androidDebug.log('🎓 HomePage - Renderizando dashboard de estudiante');
    return (
      <div className="space-y-6 main-content">
      {/* Welcome Card */}
      <Card className="bg-blue-500 text-white" style={{background: 'linear-gradient(to right, rgb(59 130 246), rgb(147 51 234))'}}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl mb-2">¡Hola, {user?.name?.split(' ')[0]}!</h2>
              <p className="text-blue-100">
                Encuentra el tutor perfecto para ti y acelera tu aprendizaje
              </p>
            </div>
            <BookOpen className="size-16 text-blue-200" />
          </div>
          <div className="flex gap-3 mt-4">
            <Button 
              variant="secondary" 
              onClick={() => onNavigate('search')}
              className="text-blue-600"
            >
              <Search className="size-4 mr-2" />
              Buscar tutores
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onNavigate('requests')}
              className="text-white border-white hover:bg-white hover:text-blue-600"
            >
              <Calendar className="size-4 mr-2" />
              Mis clases
            </Button>
          </div>
          
          {/* Quick Mode Switch */}
          <div className="mt-4 pt-4 border-t border-blue-400">
            <p className="text-blue-200 text-sm mb-2">
              ¿Quieres enseñar también?
            </p>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => handleModeSwitch('tutor')}
              disabled={authLoading}
              className="text-white border-white hover:bg-white hover:text-blue-600"
            >
              {authLoading ? (
                <RefreshCw className="size-4 mr-2 animate-spin" />
              ) : (
                <GraduationCap className="size-4 mr-2" />
              )}
              Cambiar a modo tutor
            </Button>
          </div>

          {/* Opciones de prueba - Solo para usuarios maestros */}
          <TestUserOptions user={user} />
        </CardContent>
      </Card>

      {/* Demo Section */}
      <Card className="bg-orange-500 text-white" style={{background: 'linear-gradient(to right, rgb(249 115 22), rgb(239 68 68))'}}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl mb-2 flex items-center gap-2">
                <Play className="size-6" />
                ¡Explora TutorApp en acción!
              </h3>
              <p className="text-orange-100 mb-4">
                Descubre todas las funcionalidades con nuestra demostración interactiva paso a paso
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  🎯 Matching inteligente
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  📊 Predictor académico
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  💬 Chat en tiempo real
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  💳 Pagos seguros
                </Badge>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-3 bg-red-400 rounded-full"></div>
                    <div className="size-3 bg-yellow-400 rounded-full"></div>
                    <div className="size-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="bg-white/20 rounded p-2">
                    <Play className="size-8 text-white/80 mx-auto" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Button 
            variant="secondary"
            size="lg"
            onClick={() => onNavigate('demo')}
            className="text-orange-600 hover:text-orange-700 bg-white hover:bg-orange-50"
          >
            <Play className="size-5 mr-2" />
            Ver demostración interactiva
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Clases este mes</p>
                <p className="text-xl">{userStats?.monthlyStats?.sessions || 0}</p>
                {(userStats?.totalRequests || 0) === 0 && (
                  <p className="text-xs text-gray-500">Crea tu primera solicitud</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total solicitudes</p>
                <p className="text-xl">{userStats?.totalRequests || 0}</p>
                {(userStats?.totalRequests || 0) === 0 && (
                  <p className="text-xs text-gray-500">Solicita tu primera clase</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sesiones completadas</p>
                <p className="text-xl">{userStats?.completedSessions || 0}</p>
                {(userStats?.completedSessions || 0) === 0 && (
                  <p className="text-xs text-gray-500">Completa tu primera sesión</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Features Section - Para estudiantes */}
      <div className="mb-6">
        <h3 className="text-lg mb-4 flex items-center gap-2">
          <Zap className="size-5 text-blue-600" />
          Funcionalidades de Inteligencia Artificial
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-dashed border-blue-200 hover:border-blue-400" onClick={() => onNavigate('smart-matching')}>
            <CardContent className="p-4 text-center">
              <Brain className="size-12 text-blue-600 mx-auto mb-3" />
              <h4 className="font-medium mb-2">🎯 Matching Inteligente</h4>
              <p className="text-sm text-gray-600 mb-3">IA encuentra tutores 87% más compatibles contigo</p>
              <Badge className="bg-blue-100 text-blue-800">Nuevo</Badge>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-dashed border-green-200 hover:border-green-400" onClick={() => onNavigate('academic-predictor')}>
            <CardContent className="p-4 text-center">
              <BarChart3 className="size-12 text-green-600 mx-auto mb-3" />
              <h4 className="font-medium mb-2">📊 Predictor Académico</h4>
              <p className="text-sm text-gray-600 mb-3">Predice tu rendimiento y sugiere mejoras</p>
              <Badge className="bg-green-100 text-green-800">IA</Badge>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-dashed border-purple-200 hover:border-purple-400" onClick={() => onNavigate('study-planner')}>
            <CardContent className="p-4 text-center">
              <CalendarCheck className="size-12 text-purple-600 mx-auto mb-3" />
              <h4 className="font-medium mb-2">📅 Planificador IA</h4>
              <p className="text-sm text-gray-600 mb-3">Optimiza tu tiempo de estudio automáticamente</p>
              <Badge className="bg-purple-100 text-purple-800">Popular</Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Support Section */}
      <Alert className="border-blue-200 bg-blue-50">
        <HelpCircle className="size-4 text-blue-600" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong>🆘 ¿Necesitas ayuda?</strong>
            <p className="text-sm text-gray-600 mt-1">
              Nuestro asistente de IA está disponible 24/7 para resolver tus dudas sobre la plataforma
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onNavigate('support')}
            className="ml-4 border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <MessageSquare className="size-4 mr-2" />
            Obtener ayuda
          </Button>
        </AlertDescription>
      </Alert>

      {/* Featured Tutors */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg">Tutores destacados</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onNavigate('search')}
          >
            Ver todos
          </Button>
        </div>

        {error && (
          <Alert className="mb-4">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-full overflow-x-hidden tutors-grid-responsive">
          {loading ? (
            // Skeleton loading
            Array.from({ length: 4 }).map((_, i) => (
              <TutorCardSkeleton key={i} />
            ))
          ) : tutors.length > 0 ? (
            tutors.map((tutor) => (
              <TutorCard
                key={tutor.id}
                tutor={tutor as Tutor}
                onViewProfile={() => onNavigate('tutor-profile', { tutor })}
                onRequestTutoring={() => onNavigate('request-tutoring', { tutor })}
              />
            ))
          ) : (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">
                <Users className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg mb-2">No hay tutores disponibles</h3>
                <p className="text-gray-600 mb-4">
                  Todos nuestros tutores están ocupados en este momento.
                </p>
                <Button onClick={() => onNavigate('search')}>
                  Buscar tutores
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
    );
  };

  const renderTutorDashboard = () => {
    androidDebug.log('👨‍🏫 HomePage - Renderizando dashboard de tutor');
    return (
      <div className="space-y-6 main-content">
      {/* Welcome Card */}
      <Card className="bg-green-500 text-white" style={{background: 'linear-gradient(to right, rgb(34 197 94), rgb(13 148 136))'}}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl mb-2">¡Hola, {user?.name?.split(' ')[0]}!</h2>
              <p className="text-green-100">
                Gestiona tus clases y ayuda a más estudiantes a alcanzar sus metas
              </p>
            </div>
            <Users className="size-16 text-green-200" />
          </div>
          <div className="flex gap-3 mt-4">
            <Button 
              variant="secondary" 
              onClick={() => onNavigate('profile')}
              className="text-green-600"
            >
              Editar perfil
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onNavigate('requests')}
              className="text-white border-white hover:bg-white hover:text-green-600"
            >
              <Calendar className="size-4 mr-2" />
              Mis clases
            </Button>
          </div>
          
          {/* Quick Mode Switch */}
          <div className="mt-4 pt-4 border-t border-green-400">
            <p className="text-green-200 text-sm mb-2">
              ¿Necesitas aprender algo nuevo?
            </p>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => handleModeSwitch('student')}
              disabled={authLoading}
              className="text-white border-white hover:bg-white hover:text-green-600"
            >
              {authLoading ? (
                <RefreshCw className="size-4 mr-2 animate-spin" />
              ) : (
                <BookmarkCheck className="size-4 mr-2" />
              )}
              Cambiar a modo estudiante
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Demo Section */}
      <Card className="bg-orange-500 text-white" style={{background: 'linear-gradient(to right, rgb(249 115 22), rgb(239 68 68))'}}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl mb-2 flex items-center gap-2">
                <Play className="size-6" />
                ¡Descubre todas las funcionalidades!
              </h3>
              <p className="text-orange-100 mb-4">
                Explora cómo funciona TutorApp desde la perspectiva del tutor y estudiante
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  👨‍🏫 Gestión de estudiantes
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  💰 Pagos automáticos
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  📈 Análisis de rendimiento
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  🧠 Herramientas IA
                </Badge>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-3 bg-red-400 rounded-full"></div>
                    <div className="size-3 bg-yellow-400 rounded-full"></div>
                    <div className="size-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="bg-white/20 rounded p-2">
                    <Play className="size-8 text-white/80 mx-auto" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Button 
            variant="secondary"
            size="lg"
            onClick={() => onNavigate('demo')}
            className="text-orange-600 hover:text-orange-700 bg-white hover:bg-orange-50"
          >
            <Play className="size-5 mr-2" />
            Ver demostración completa
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Estudiantes activos</p>
                <p className="text-xl">{userStats?.activeStudents || 0}</p>
                {(userStats?.activeStudents || 0) === 0 && (
                  <p className="text-xs text-gray-500">Acepta solicitudes para empezar</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Clases este mes</p>
                <p className="text-xl">{userStats?.monthlyStats?.sessions || 0}</p>
                {(userStats?.monthlyStats?.sessions || 0) === 0 && (
                  <p className="text-xs text-gray-500">Completa tu primera clase</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="size-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rating promedio</p>
                <p className="text-xl">{userStats?.averageRating?.toFixed(1) || '0.0'}</p>
                {(userStats?.averageRating || 0) === 0 && (
                  <p className="text-xs text-gray-500">Recibirás calificaciones</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ganancias del mes</p>
                <p className="text-xl">{formatPriceCOP(userStats?.monthlyStats?.earnings || 0)}</p>
                {(userStats?.monthlyStats?.earnings || 0) === 0 && (
                  <p className="text-xs text-gray-500">Completa clases para ganar</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile completeness reminder */}
      {(!(user?.subjects?.length) || !user?.hourlyRate || !user?.experience) && (
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>
            <strong>Completa tu perfil de tutor</strong> para empezar a recibir solicitudes. 
            <Button variant="link" className="p-0 ml-1 h-auto" onClick={() => onNavigate('profile')}>
              Ir al perfil
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* AI Features Section - Para tutores */}
      <div className="mb-6">
        <h3 className="text-lg mb-4 flex items-center gap-2">
          <Zap className="size-5 text-green-600" />
          Herramientas de IA para Tutores
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-dashed border-blue-200 hover:border-blue-400" onClick={() => onNavigate('academic-predictor')}>
            <CardContent className="p-4 text-center">
              <BarChart3 className="size-12 text-blue-600 mx-auto mb-3" />
              <h4 className="font-medium mb-2">📊 Análisis de Estudiantes</h4>
              <p className="text-sm text-gray-600 mb-3">Predice rendimiento y personaliza enseñanza</p>
              <Badge className="bg-blue-100 text-blue-800">IA</Badge>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-dashed border-green-200 hover:border-green-400" onClick={() => onNavigate('study-planner')}>
            <CardContent className="p-4 text-center">
              <CalendarCheck className="size-12 text-green-600 mx-auto mb-3" />
              <h4 className="font-medium mb-2">📅 Planificador para Estudiantes</h4>
              <p className="text-sm text-gray-600 mb-3">Crea planes de estudio optimizados</p>
              <Badge className="bg-green-100 text-green-800">Popular</Badge>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-dashed border-purple-200 hover:border-purple-400" onClick={() => onNavigate('support')}>
            <CardContent className="p-4 text-center">
              <Target className="size-12 text-purple-600 mx-auto mb-3" />
              <h4 className="font-medium mb-2">🆘 Soporte IA</h4>
              <p className="text-sm text-gray-600 mb-3">Asistente inteligente 24/7</p>
              <Badge className="bg-purple-100 text-purple-800">Nuevo</Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tablero de Inteligencia Colectiva (CIEM) */}
      <div className="mb-6">
        <h3 className="text-lg mb-4 flex items-center gap-2">
          <Brain className="size-5 text-blue-600" />
          Tablero de Inteligencia Colectiva
        </h3>
        <CIEMDashboard />
      </div>

      {/* Pending Requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg">Solicitudes pendientes</h3>
          <Badge variant="secondary">{requests.filter(r => r.status === 'pending').length}</Badge>
        </div>

        {error && (
          <Alert className="mb-4">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {loading ? (
            // Skeleton loading
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : requests.filter(r => r.status === 'pending').length > 0 ? (
            requests.filter(r => r.status === 'pending').map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">Solicitud de tutoría</h4>
                        <Badge variant="outline">{request.subject}</Badge>
                        {request.isImmediate && (
                          <Badge variant="destructive" className="text-xs">
                            Inmediata
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {request.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>💰 {formatPriceCOP(request.hourlyRate)}/hora</span>
                        <span>⏱️ {formatNumber(request.duration)} min</span>
                        {request.scheduledTime && (
                          <span>📅 {safeFormatDate(request.scheduledTime)}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectRequest(request.id)}
                        disabled={processingRequest === request.id}
                      >
                        {processingRequest === request.id ? (
                          <RefreshCw className="size-4 mr-1 animate-spin" />
                        ) : (
                          <XCircle className="size-4 mr-1" />
                        )}
                        Rechazar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request.id)}
                        disabled={processingRequest === request.id}
                      >
                        {processingRequest === request.id ? (
                          <RefreshCw className="size-4 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="size-4 mr-1" />
                        )}
                        Aceptar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg mb-2">No hay solicitudes pendientes</h3>
                <p className="text-gray-600 mb-4">
                  Las nuevas solicitudes de tutoría aparecerán aquí cuando los estudiantes te contacten.
                </p>
                {(!(user?.subjects?.length) || !user?.availability) && (
                  <Button onClick={() => onNavigate('profile')}>
                    Completar perfil de tutor
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
    );
  };

  // Debug del renderizado
  androidDebug.log('🎨 HomePage - Renderizando', { 
    user: !!user, 
    mode: user?.currentMode, 
    loading, 
    tutors: tutors.length, 
    requests: requests.length 
  });

  return (
    <div className="p-4 bg-gray-50 min-h-screen w-full max-w-full overflow-x-hidden" style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Panel de debug - Solo para usuarios maestros */}
      <DebugStatsPanel 
        user={user}
        userStats={userStats}
        setUserStats={setUserStats}
        loadData={loadData}
        createTestRequest={createTestRequest}
      />
      
      {/* Componentes de diagnóstico ocultos - Solo funcionalidad, no UI */}
      {false && (
        <>
          <DataLoadingStatus 
            userId={user?.id || null}
            onRefresh={loadData}
          />
          
          {Capacitor.getPlatform() === 'android' && (
            <SimpleDataDebug userId={user?.id || null} />
          )}
          
          {Capacitor.getPlatform() === 'android' && (
            <AndroidSyncStatus onForceSync={loadData} />
          )}
        </>
      )}
      
      {user?.currentMode === 'student' ? renderStudentDashboard() : renderTutorDashboard()}
    </div>
  );
}