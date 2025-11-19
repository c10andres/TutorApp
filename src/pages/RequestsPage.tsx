import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { TutorRequest, User } from '../types';
import { tutoringService } from '../services/tutoring';
import { usersService } from '../services/users';
import { formatPriceCOP, formatDate } from '../utils/formatters';
import { 
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  BookOpen,
  Loader2
} from 'lucide-react';

interface RequestsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  rejected: 'bg-gray-100 text-gray-800'
};

const STATUS_LABELS = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  in_progress: 'En progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
  rejected: 'Rechazada'
};

export function RequestsPage({ onNavigate }: RequestsPageProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<TutorRequest[]>([]);
  const [tutors, setTutors] = useState<Record<string, User>>({});
  const [students, setStudents] = useState<Record<string, User>>({});
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showSpending, setShowSpending] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, [user]);

  const loadRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');

      // Cargar solicitudes de Firebase REAL
      console.log('📱 CARGANDO solicitudes de Firebase');
      console.log('📱 Plataforma:', Capacitor.getPlatform());
      
      const requestsData = await tutoringService.getUserRequests(user.id);

      setRequests(requestsData);

      const userIds = new Set<string>();
      requestsData.forEach(request => {
        if (user.currentMode === 'tutor') {
          userIds.add(request.studentId);
        } else {
          userIds.add(request.tutorId);
        }
      });

      // Optimizar carga de usuarios usando getUsersByIds
      const usersData: Record<string, User> = {};
      if (userIds.size > 0) {
        try {
          const usersList = Array.from(userIds);
          const usersResult = await usersService.getUsersByIds(usersList);
          Object.assign(usersData, usersResult);
        } catch (error) {
          console.error('Error cargando usuarios:', error);
          // Fallback a carga individual si falla la carga masiva
          for (const userId of userIds) {
            try {
              const userData = await usersService.getUserById(userId);
              if (userData) {
                usersData[userId] = userData;
              }
            } catch (userError) {
              console.error(`Error cargando usuario ${userId}:`, userError);
            }
          }
        }
      }

      if (user.currentMode === 'tutor') {
        setStudents(usersData);
      } else {
        setTutors(usersData);
      }

    } catch (error) {
      console.error('Error cargando solicitudes:', error);
      setError('Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const handleRequestAction = async (requestId: string, action: string) => {
    try {
      setError('');
      setProcessingRequest(requestId);
      
      console.log('🔄 Procesando acción:', action, 'para solicitud:', requestId);
      
      // Mapear acciones a estados
      const statusMap: Record<string, TutorRequest['status']> = {
        'accept': 'accepted',
        'reject': 'rejected', 
        'cancel': 'cancelled',
        'complete': 'completed'
      };
      
      const status = statusMap[action];
      if (!status) {
        throw new Error(`Acción no válida: ${action}`);
      }
      
      console.log('📝 Actualizando solicitud a estado:', status);
      
      // Actualizar estado en Firebase
      await tutoringService.updateRequestStatus(requestId, status);
      
      console.log('✅ Estado actualizado, recargando solicitudes...');
      
      // Recargar solicitudes para reflejar el cambio
      await loadRequests();
      
      console.log('✅ Solicitudes recargadas exitosamente');
      
    } catch (error) {
      console.error('❌ Error al procesar solicitud:', error);
      setError(`Error al procesar la solicitud: ${error.message || 'Error desconocido'}`);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleStartChat = (request: TutorRequest) => {
    const otherUser = user?.currentMode === 'tutor' 
      ? students[request.studentId]
      : tutors[request.tutorId];
    
    onNavigate('chat', {
      otherUser,
      requestId: request.id
    });
  };

  const handleWriteReview = (request: TutorRequest) => {
    const tutor = tutors[request.tutorId];
    onNavigate('review', {
      request,
      tutor
    });
  };

  const handleViewDetails = (request: TutorRequest) => {
    // Obtener información del tutor o estudiante según el modo
    const otherUser = user?.currentMode === 'tutor' 
      ? students[request.studentId] 
      : tutors[request.tutorId];
    
    if (otherUser) {
      // Almacenar datos temporalmente para la página de detalles
      (window as any).navigationData = {
        request,
        otherUser,
        user: user
      };
      
      // Navegar a la página de detalles
      onNavigate('request-details');
    }
  };

  const handleMarkAsCompleted = async (requestId: string) => {
    try {
      setRefreshing(true);
      await tutoringService.updateRequestStatus(requestId, 'completed');
      
      // Actualizar la lista local
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'completed' as const, updatedAt: new Date() }
          : req
      ));
      
      // Mostrar mensaje de éxito
      setError('');
    } catch (err) {
      console.error('Error marcando como completada:', err);
      setError('Error al marcar la solicitud como completada');
    } finally {
      setRefreshing(false);
    }
  };

  const getFilteredRequests = () => {
    switch (activeTab) {
      case 'pending':
        return requests.filter(r => r.status === 'pending');
      case 'active':
        return requests.filter(r => ['accepted', 'in_progress'].includes(r.status));
      case 'completed':
        return requests.filter(r => r.status === 'completed');
      case 'cancelled':
        return requests.filter(r => ['cancelled', 'rejected'].includes(r.status));
      default:
        return requests;
    }
  };

  const renderRequestCard = (request: TutorRequest) => {
    const isStudentView = user?.currentMode === 'student';
    const otherUserId = isStudentView ? request.tutorId : request.studentId;
    const otherUser = isStudentView ? tutors[request.tutorId] : students[request.studentId];
    const statusStyle = STATUS_COLORS[request.status] || STATUS_COLORS.pending;

    // Si no tenemos información del otro usuario, mostrar información básica
    if (!otherUser && otherUserId) {
      // Mostrar tarjeta con información limitada mientras se carga el usuario
      console.warn('Usuario no encontrado para ID:', otherUserId);
    }

    return (
      <Card key={request.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarImage src={otherUser?.avatar} alt={otherUser?.name} />
                  <AvatarFallback>
                    {otherUser?.name?.split(' ').map(n => n[0]).join('') || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {isStudentView ? 'Tutor: ' : 'Estudiante: '}
                    {otherUser?.name || 'Usuario no encontrado'}
                  </h3>
                  <p className="text-sm text-gray-600">{request.subject || 'Materia no especificada'}</p>
                </div>
              </div>
              
              <Badge variant="secondary" className={statusStyle}>
                {STATUS_LABELS[request.status]}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-700 line-clamp-2">
                {request.description || 'Sin descripción'}
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  <span>{formatDate(request.scheduledTime || request.preferredDateTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4" />
                  <span>{request.duration || 0} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  <span className="capitalize">{request.location || 'No especificada'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="size-4" />
                  <span>{formatPriceCOP(request.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {!isStudentView && request.status === 'pending' && (
                <>
                  <Button 
                    size="sm" 
                    onClick={() => handleRequestAction(request.id, 'accept')}
                    disabled={processingRequest === request.id}
                  >
                    {processingRequest === request.id ? (
                      <Loader2 className="size-4 mr-1 animate-spin" />
                    ) : (
                      <CheckCircle className="size-4 mr-1" />
                    )}
                    Aceptar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRequestAction(request.id, 'reject')}
                    disabled={processingRequest === request.id}
                  >
                    {processingRequest === request.id ? (
                      <Loader2 className="size-4 mr-1 animate-spin" />
                    ) : (
                      <XCircle className="size-4 mr-1" />
                    )}
                    Rechazar
                  </Button>
                </>
              )}

              {isStudentView && request.status === 'pending' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleRequestAction(request.id, 'cancel')}
                  disabled={processingRequest === request.id}
                >
                  {processingRequest === request.id ? (
                    <Loader2 className="size-4 mr-1 animate-spin" />
                  ) : (
                    <XCircle className="size-4 mr-1" />
                  )}
                  Cancelar
                </Button>
              )}

              {['accepted', 'in_progress'].includes(request.status) && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleStartChat(request)}
                  >
                    <MessageSquare className="size-4 mr-1" />
                    Chat
                  </Button>
                  
                  {!isStudentView && (
                    <Button 
                      size="sm"
                      onClick={() => handleRequestAction(request.id, 'complete')}
                    >
                      <CheckCircle className="size-4 mr-1" />
                      Completar
                    </Button>
                  )}
                </>
              )}

              {isStudentView && request.status === 'completed' && !request.hasReview && (
                <Button 
                  size="sm"
                  onClick={() => handleWriteReview(request)}
                >
                  <Star className="size-4 mr-1" />
                  Escribir reseña
                </Button>
              )}

              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleViewDetails(request)}
              >
                <Eye className="size-4 mr-1" />
                Ver detalles
              </Button>

              {/* Botón para marcar como completada - solo para tutores y solicitudes aceptadas */}
              {!isStudentView && request.status === 'accepted' && (
                <Button 
                  size="sm"
                  onClick={() => handleMarkAsCompleted(request.id)}
                  disabled={refreshing}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {refreshing ? (
                    <Loader2 className="size-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle className="size-4 mr-1" />
                  )}
                  Marcar completada
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl mb-2">Mis solicitudes</h1>
          <p className="text-gray-600">Gestiona tus solicitudes de tutoría</p>
        </div>
        
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-12 bg-gray-200 rounded-full" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32" />
                      <div className="h-3 bg-gray-200 rounded w-24" />
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl mb-2">
            {user?.currentMode === 'student' ? 'Mis clases' : 'Solicitudes de tutoría'}
          </h1>
          <p className="text-gray-600">
            {user?.currentMode === 'student' 
              ? 'Gestiona tus clases programadas y completadas'
              : 'Revisa y gestiona las solicitudes de tus estudiantes'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`size-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          
          {user?.currentMode === 'student' && (
            <Button
              size="sm"
              onClick={() => onNavigate('search')}
            >
              <Plus className="size-4 mr-1" />
              Nueva clase
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {requests.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {requests.filter(r => ['accepted', 'in_progress'].includes(r.status)).length}
            </div>
            <div className="text-sm text-gray-600">Activas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {requests.filter(r => r.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completadas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-orange-600">
                {showSpending ? (
                  requests.length > 0 ? (() => {
                    const relevantRequests = requests.filter(r => ['accepted', 'in_progress', 'completed'].includes(r.status));
                    const totalSpent = relevantRequests.reduce((sum, r) => {
                      console.log(`💰 Solicitud ${r.id}: estado=${r.status}, totalAmount=${r.totalAmount}`);
                      return sum + (r.totalAmount || 0);
                    }, 0);
                    console.log(`💰 Total gastado calculado: ${totalSpent} (${relevantRequests.length} solicitudes relevantes)`);
                    return formatPriceCOP(totalSpent);
                  })() : formatPriceCOP(0)
                ) : (
                  '***'
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSpending(!showSpending)}
                className="text-gray-500 hover:text-gray-700"
                title={showSpending ? 'Ocultar gasto' : 'Mostrar gasto'}
              >
                {showSpending ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              {user?.currentMode === 'student' ? 'Gastado' : 'Ganado'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="active">Activas</TabsTrigger>
          <TabsTrigger value="completed">Completadas</TabsTrigger>
          <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {getFilteredRequests().length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay solicitudes
                </h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === 'all' 
                    ? 'Aún no tienes solicitudes de tutoría'
                    : `No hay solicitudes ${activeTab === 'pending' ? 'pendientes' : 
                         activeTab === 'active' ? 'activas' : 
                         activeTab === 'completed' ? 'completadas' : 'canceladas'}`
                  }
                </p>
                {user?.currentMode === 'student' && (
                  <Button onClick={() => onNavigate('search')}>
                    <Plus className="size-4 mr-2" />
                    Buscar tutores
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {getFilteredRequests().map(renderRequestCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
