import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { TutorRequest } from '../types';
import { tutoringService } from '../services/tutoring';
import { formatDate } from '../utils/formatters';
import {
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Loader2,
  Award,
  Video
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../components/ui/dialog';
import { Slider } from '../components/ui/slider';
import { reputationService } from '../services/reputation';
import { toast } from 'sonner';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  accepted: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  rejected: 'bg-gray-100 text-gray-800 border-gray-200'
};

const STATUS_LABELS = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  in_progress: 'En progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
  rejected: 'Rechazada'
};

interface RequestsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function RequestsPage({ onNavigate }: RequestsPageProps) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<TutorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  // Payment & Rating State
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedRequestForPayment, setSelectedRequestForPayment] = useState<TutorRequest | null>(null);
  const [paymentAmount, setPaymentAmount] = useState([5]); // Default 5 points
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const isStudentView = user?.currentMode === 'student';

  useEffect(() => {
    loadRequests();
  }, [user]);

  const loadRequests = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await tutoringService.getUserRequests(user.id);
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast.error('Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      setUpdatingStatus(requestId);
      await tutoringService.updateRequestStatus(requestId, newStatus, user?.id);
      toast.success(`Solicitud ${STATUS_LABELS[newStatus as keyof typeof STATUS_LABELS].toLowerCase()}`);
      await loadRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar el estado');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleOpenPayment = (request: TutorRequest) => {
    setSelectedRequestForPayment(request);
    setPaymentAmount([5]); // Reset to default
    setRating(5);
    setComment('');
    setPaymentDialogOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedRequestForPayment || !user) return;

    try {
      setProcessingPayment(true);
      const amount = paymentAmount[0];
      const tutorId = selectedRequestForPayment.tutorId;

      console.log(`💸 Procesando pago de ${amount} puntos para la solicitud ${selectedRequestForPayment.id}`);

      // 1. Transferir puntos
      await reputationService.transferPoints(user.id, tutorId, amount);

      // 2. Enviar Reseña (Evaluación)
      if (comment.trim()) {
        await tutoringService.addReview({
          tutorId: tutorId,
          studentId: user.id,
          studentName: user.name || 'Estudiante',
          requestId: selectedRequestForPayment.id,
          rating: rating,
          comment: comment,
          createdAt: new Date()
        });
      }

      // 3. Actualizar estado de la solicitud y marcar como pagada
      // Si la solicitud estaba en progreso, la marcamos como completada también
      if (selectedRequestForPayment.status !== 'completed') {
        await tutoringService.updateRequestStatus(selectedRequestForPayment.id, 'completed', selectedRequestForPayment.tutorId);
      }

      await tutoringService.updateRequest(selectedRequestForPayment.id, {
        hasPaid: true,
        hasReview: true,
        totalAmount: amount,
        paymentMethod: 'puntos_merito'
      });

      toast.success(`¡Has enviado ${amount} Puntos y tu calificación!`);
      setPaymentDialogOpen(false);
      await loadRequests();

    } catch (error) {
      console.error('Error en el pago:', error);
      toast.error('Error al procesar. Intenta de nuevo.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Filter requests
  const activeRequests = requests.filter(r =>
    ['pending', 'accepted', 'in_progress'].includes(r.status)
  );

  const historyRequests = requests.filter(r =>
    ['completed', 'cancelled', 'rejected'].includes(r.status)
  );

  const displayedRequests = activeTab === 'active' ? activeRequests : historyRequests;

  const renderRequestCard = (request: TutorRequest) => {
    // Show the OTHER person's info
    const otherPersonName = isStudentView ? request.tutorName : request.studentName;
    const otherPersonId = isStudentView ? request.tutorId : request.studentId;

    return (
      <Card key={request.id} className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex gap-4">
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${otherPersonId}`} />
                <AvatarFallback>{otherPersonName?.[0]}</AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-lg">{otherPersonName || 'Usuario'}</h3>
                  <Badge variant="secondary" className={STATUS_COLORS[request.status as keyof typeof STATUS_COLORS]}>
                    {STATUS_LABELS[request.status as keyof typeof STATUS_LABELS]}
                  </Badge>
                  {isStudentView && request.hasPaid && (
                    <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Pagado ({request.totalAmount} pts)
                    </Badge>
                  )}
                  {isStudentView && request.hasReview && (
                    <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50 flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Calificado
                    </Badge>
                  )}
                </div>

                <h4 className="text-blue-600 font-medium">{request.subject}</h4>

                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 mt-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(request.scheduledTime)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {request.duration} min
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {request.location || 'Online'}
                  </div>
                </div>

                {request.description && (
                  <div className="mt-3 text-sm bg-gray-50 p-3 rounded-md text-gray-700">
                    <MessageSquare className="h-3 w-3 inline mr-2 text-gray-400" />
                    {request.description}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 min-w-[140px] justify-center">
              {/* STUDENT ACTIONS */}
              {isStudentView && (
                <>
                  {request.status === 'pending' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleStatusChange(request.id, 'cancelled')}
                      disabled={!!updatingStatus}
                    >
                      Cancelar Solicitud
                    </Button>
                  )}
                  {request.status === 'accepted' && (
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      size="sm"
                      onClick={() => {/* Implement Join Session logic later */ }}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Unirse a Sesión
                    </Button>
                  )}
                  {/* Botón Unificado: Finalizar, Pagar y Calificar */}
                  {request.status === 'in_progress' && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                      onClick={() => handleOpenPayment(request)}
                    >
                      <CheckCircle className="size-4 mr-1" />
                      Finalizar y Calificar
                    </Button>
                  )}

                  {/* Si ya está completada pero falta pagar o calificar */}
                  {request.status === 'completed' && (!request.hasPaid || !request.hasReview) && (
                    <Button
                      size="sm"
                      className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm"
                      onClick={() => handleOpenPayment(request)}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      {request.hasPaid ? 'Calificar Tutor' : 'Pagar y Calificar'}
                    </Button>
                  )}
                </>
              )}

              {/* TUTOR ACTIONS */}
              {!isStudentView && (
                <>
                  {request.status === 'pending' && (
                    <div className="flex flex-col gap-2">
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                        onClick={() => handleStatusChange(request.id, 'accepted')}
                        disabled={!!updatingStatus}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aceptar
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        size="sm"
                        onClick={() => handleStatusChange(request.id, 'rejected')}
                        disabled={!!updatingStatus}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rechazar
                      </Button>
                    </div>
                  )}
                  {request.status === 'in_progress' && (
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                      onClick={() => handleStatusChange(request.id, 'completed')}
                      disabled={!!updatingStatus}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar Completada
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isStudentView ? 'Mis Solicitudes' : 'Solicitudes Recibidas'}
        </h1>
        <p className="text-gray-500">
          Gestiona tus sesiones de tutoría, pagos solidarios y calificaciones.
        </p>
      </div>

      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="active">Activas</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : displayedRequests.length > 0 ? (
            displayedRequests.map(renderRequestCard)
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No tienes solicitudes activas en este momento.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : displayedRequests.length > 0 ? (
            displayedRequests.map(renderRequestCard)
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No tienes solicitudes en el historial.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>

      {/* Payment & Rating Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Finalizar y Calificar
            </DialogTitle>
            <DialogDescription>
              Completa el ciclo de solidaridad enviando puntos y una reseña.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-6">

            {/* Sección de Puntos */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">1. Pago Solidario (Puntos)</h4>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="text-4xl font-bold text-blue-600 flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 border-4 border-blue-100 shadow-inner">
                    {paymentAmount[0]}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-2 py-0.5 rounded-full shadow border text-xs font-medium text-gray-600">
                    Puntos
                  </div>
                </div>
              </div>
              <div className="px-2">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>5 pts (Mín)</span>
                  <span>10 pts (Máx)</span>
                </div>
                <Slider
                  value={paymentAmount}
                  min={5}
                  max={10}
                  step={1}
                  onValueChange={setPaymentAmount}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>

            {/* Sección de Calificación */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">2. Califica tu experiencia</h4>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`transition-all duration-200 ${star <= rating ? 'text-yellow-400 scale-110' : 'text-gray-300'}`}
                    onClick={() => setRating(star)}
                  >
                    <Star className="w-8 h-8 fill-current" />
                  </button>
                ))}
              </div>
              <textarea
                className="w-full p-3 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                placeholder="Escribe un breve comentario sobre el tutor..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)} disabled={processingPayment}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmPayment} disabled={processingPayment} className="bg-blue-600 text-white hover:bg-blue-700">
              {processingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Confirmar Todo'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
