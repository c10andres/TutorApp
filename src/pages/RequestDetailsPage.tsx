// Página de detalles de solicitud de tutoría
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Alert, AlertDescription } from '../components/ui/alert';
import { TutorRequest, User } from '../types';
import { tutoringService } from '../services/tutoring';
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
  User as UserIcon,
  BookOpen,
  ArrowLeft,
  Loader2
} from 'lucide-react';

interface RequestDetailsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function RequestDetailsPage({ onNavigate }: RequestDetailsPageProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<TutorRequest | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Obtener datos de la navegación
    const navigationData = (window as any).navigationData;
    if (navigationData?.request && navigationData?.otherUser) {
      setRequest(navigationData.request);
      setOtherUser(navigationData.otherUser);
      setLoading(false);
    } else {
      setError('No se encontraron los datos de la solicitud');
      setLoading(false);
    }
  }, []);

  const handleRequestAction = async (action: string) => {
    if (!request) return;

    try {
      setActionLoading(true);
      setError('');

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
      
      await tutoringService.updateRequestStatus(request.id, status);
      
      // Actualizar el estado local
      setRequest(prev => prev ? { ...prev, status, updatedAt: new Date() } : null);
      
    } catch (error) {
      console.error('Error al procesar solicitud:', error);
      setError('Error al procesar la solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartChat = () => {
    if (!request || !otherUser) return;
    
    onNavigate('chat', {
      otherUser,
      requestId: request.id
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      rejected: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendiente',
      accepted: 'Aceptada',
      in_progress: 'En progreso',
      completed: 'Completada',
      cancelled: 'Cancelada',
      rejected: 'Rechazada'
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (error || !request || !otherUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="size-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'No se pudieron cargar los detalles de la solicitud'}</p>
          <Button onClick={() => onNavigate('requests')}>
            <ArrowLeft className="size-4 mr-2" />
            Volver a solicitudes
          </Button>
        </div>
      </div>
    );
  }

  const isStudentView = user?.currentMode === 'student';
  const canTakeAction = user?.id === (isStudentView ? request.studentId : request.tutorId);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('requests')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="size-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detalles de la solicitud</h1>
            <p className="text-gray-600">Información completa de la tutoría</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del tutor/estudiante */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="size-5" />
                  {isStudentView ? 'Tutor' : 'Estudiante'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="size-16">
                    <AvatarImage src={otherUser.avatar} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                      {otherUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{otherUser.name}</h3>
                    <p className="text-gray-600">{otherUser.email}</p>
                    {otherUser.bio && (
                      <p className="text-sm text-gray-500 mt-2">{otherUser.bio}</p>
                    )}
                    {isStudentView && otherUser.rating && (
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="size-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{otherUser.rating}</span>
                        <span className="text-sm text-gray-500">({otherUser.totalReviews} reseñas)</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detalles de la solicitud */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-5" />
                  Detalles de la tutoría
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="size-4 text-gray-500" />
                      <span className="text-sm font-medium">Materia:</span>
                      <span className="text-sm">{request.subject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-gray-500" />
                      <span className="text-sm font-medium">Fecha:</span>
                      <span className="text-sm">
                        {request.scheduledTime ? formatDate(request.scheduledTime) : 'Por definir'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-gray-500" />
                      <span className="text-sm font-medium">Duración:</span>
                      <span className="text-sm">{request.duration} minutos</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-gray-500" />
                      <span className="text-sm font-medium">Modalidad:</span>
                      <span className="text-sm">
                        {request.location === 'online' ? 'Virtual' : 
                         request.location === 'tutor' ? 'Casa del tutor' :
                         request.location === 'student' ? 'Mi casa' : request.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="size-4 text-gray-500" />
                      <span className="text-sm font-medium">Tarifa:</span>
                      <span className="text-sm">{formatPriceCOP(request.hourlyRate)}/hora</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="size-4 text-gray-500" />
                      <span className="text-sm font-medium">Total:</span>
                      <span className="text-sm font-semibold text-blue-600">{formatPriceCOP(request.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {request.description && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Descripción:</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {request.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Estado y acciones */}
            <Card>
              <CardHeader>
                <CardTitle>Estado y acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Estado:</span>
                  <Badge className={getStatusColor(request.status)}>
                    {getStatusLabel(request.status)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={handleStartChat}
                    className="w-full"
                    variant="outline"
                  >
                    <MessageSquare className="size-4 mr-2" />
                    Iniciar chat
                  </Button>

                  {canTakeAction && request.status === 'pending' && (
                    <>
                      <Button 
                        onClick={() => handleRequestAction('accept')}
                        disabled={actionLoading}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {actionLoading ? (
                          <Loader2 className="size-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="size-4 mr-2" />
                        )}
                        Aceptar
                      </Button>
                      <Button 
                        onClick={() => handleRequestAction('reject')}
                        disabled={actionLoading}
                        variant="destructive"
                        className="w-full"
                      >
                        {actionLoading ? (
                          <Loader2 className="size-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="size-4 mr-2" />
                        )}
                        Rechazar
                      </Button>
                    </>
                  )}

                  {canTakeAction && request.status === 'accepted' && (
                    <Button 
                      onClick={() => handleRequestAction('complete')}
                      disabled={actionLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {actionLoading ? (
                        <Loader2 className="size-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="size-4 mr-2" />
                      )}
                      Marcar completada
                    </Button>
                  )}

                  {canTakeAction && ['pending', 'accepted'].includes(request.status) && (
                    <Button 
                      onClick={() => handleRequestAction('cancel')}
                      disabled={actionLoading}
                      variant="outline"
                      className="w-full text-red-600 border-red-600 hover:bg-red-50"
                    >
                      {actionLoading ? (
                        <Loader2 className="size-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="size-4 mr-2" />
                      )}
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Información adicional */}
            <Card>
              <CardHeader>
                <CardTitle>Información adicional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Creada:</span>
                  <span>{formatDate(request.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Actualizada:</span>
                  <span>{formatDate(request.updatedAt)}</span>
                </div>
                {request.paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pago:</span>
                    <span>{request.paymentMethod}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
