import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { Notification } from '../types';
import { formatDate, formatTime } from '../utils/formatters';
import { 
  Calendar, 
  MessageCircle, 
  CreditCard, 
  Star, 
  AlertCircle,
  Clock,
  User,
  ArrowRight,
  CheckCircle,
  X
} from 'lucide-react';

interface NotificationModalProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: string, data?: any) => void;
  onMarkAsRead?: (notificationId: string) => void;
}

export function NotificationModal({ 
  notification, 
  isOpen, 
  onClose, 
  onNavigate, 
  onMarkAsRead 
}: NotificationModalProps) {
  if (!notification) return null;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'request':
        return <Calendar className="size-6 text-blue-500" />;
      case 'message':
        return <MessageCircle className="size-6 text-green-500" />;
      case 'payment':
        return <CreditCard className="size-6 text-purple-500" />;
      case 'review':
        return <Star className="size-6 text-yellow-500" />;
      default:
        return <AlertCircle className="size-6 text-gray-500" />;
    }
  };

  const getNotificationTypeLabel = (type: Notification['type']) => {
    switch (type) {
      case 'request':
        return 'Solicitud de Tutoría';
      case 'message':
        return 'Nuevo Mensaje';
      case 'payment':
        return 'Pago';
      case 'review':
        return 'Calificación';
      default:
        return 'Notificación';
    }
  };

  const getActionButton = () => {
    if (!onNavigate) return null;

    switch (notification.type) {
      case 'request':
        return (
          <Button 
            onClick={() => {
              onNavigate('requests');
              handleClose();
            }}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Calendar className="size-4 mr-2" />
            Ver Solicitudes
            <ArrowRight className="size-4 ml-auto" />
          </Button>
        );
      case 'message':
        return (
          <Button 
            onClick={() => {
              onNavigate('chat', notification.data?.senderId ? { 
                otherUserId: notification.data.senderId,
                requestId: notification.data?.requestId 
              } : undefined);
              handleClose();
            }}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <MessageCircle className="size-4 mr-2" />
            Ir al Chat
            <ArrowRight className="size-4 ml-auto" />
          </Button>
        );
      case 'payment':
        return (
          <Button 
            onClick={() => {
              onNavigate('payments');
              handleClose();
            }}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <CreditCard className="size-4 mr-2" />
            Ver Pagos
            <ArrowRight className="size-4 ml-auto" />
          </Button>
        );
      case 'review':
        return (
          <Button 
            onClick={() => {
              onNavigate('requests');
              handleClose();
            }}
            className="w-full bg-yellow-600 hover:bg-yellow-700"
          >
            <Star className="size-4 mr-2" />
            Ver Reseñas
            <ArrowRight className="size-4 ml-auto" />
          </Button>
        );
      default:
        return (
          <Button 
            onClick={() => {
              onNavigate('requests');
              handleClose();
            }}
            className="w-full"
          >
            Ver Detalles
            <ArrowRight className="size-4 ml-auto" />
          </Button>
        );
    }
  };

  const handleClose = () => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    onClose();
  };

  const getNotificationDetails = () => {
    switch (notification.type) {
      case 'request':
        return (
          <div className="space-y-3">
            {notification.data?.tutorName && (
              <div className="flex items-center gap-2">
                <User className="size-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Tutor:</strong> {notification.data.tutorName}
                </span>
              </div>
            )}
            {notification.data?.subject && (
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Materia:</strong> {notification.data.subject}
                </span>
              </div>
            )}
            {notification.data?.status && (
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Estado:</strong> 
                  <Badge 
                    variant={notification.data.status === 'accepted' ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    {notification.data.status}
                  </Badge>
                </span>
              </div>
            )}
          </div>
        );

      case 'message':
        return (
          <div className="space-y-3">
            {notification.data?.senderName && (
              <div className="flex items-center gap-2">
                <User className="size-4 text-gray-500" />
                <span className="text-sm">
                  <strong>De:</strong> {notification.data.senderName}
                </span>
              </div>
            )}
            {notification.data?.messagePreview && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm italic">"{notification.data.messagePreview}"</p>
              </div>
            )}
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-3">
            {notification.data?.amount && (
              <div className="flex items-center gap-2">
                <CreditCard className="size-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Monto:</strong> ${notification.data.amount.toLocaleString('es-CO')} COP
                </span>
              </div>
            )}
            {notification.data?.status && (
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Estado:</strong>
                  <Badge 
                    variant={notification.data.status === 'completed' ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    {notification.data.status}
                  </Badge>
                </span>
              </div>
            )}
          </div>
        );

      case 'review':
        return (
          <div className="space-y-3">
            {notification.data?.reviewerName && (
              <div className="flex items-center gap-2">
                <User className="size-4 text-gray-500" />
                <span className="text-sm">
                  <strong>De:</strong> {notification.data.reviewerName}
                </span>
              </div>
            )}
            {notification.data?.rating && (
              <div className="flex items-center gap-2">
                <Star className="size-4 text-yellow-500" />
                <span className="text-sm">
                  <strong>Calificación:</strong>
                  <div className="inline-flex ml-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i}
                        className={`size-4 ${
                          i < notification.data.rating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {getNotificationIcon(notification.type)}
            <div className="flex-1">
              <DialogTitle className="text-left text-lg">
                {notification.title}
              </DialogTitle>
              <DialogDescription className="text-left">
                <Badge variant="outline" className="mt-1">
                  {getNotificationTypeLabel(notification.type)}
                </Badge>
              </DialogDescription>
            </div>
            {!notification.read && (
              <div className="size-3 bg-blue-500 rounded-full" />
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mensaje principal */}
          <Card>
            <CardContent className="p-4">
              <p className="text-sm leading-relaxed">
                {notification.message}
              </p>
            </CardContent>
          </Card>

          {/* Detalles específicos del tipo de notificación */}
          {getNotificationDetails() && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Detalles</h4>
                {getNotificationDetails()}
              </div>
            </>
          )}

          {/* Información de tiempo */}
          <Separator />
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="size-3" />
            <span>
              {formatDate(notification.createdAt)} a las {formatTime(notification.createdAt)}
            </span>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              <X className="size-4 mr-2" />
              Cerrar
            </Button>
            
            {!notification.read && onMarkAsRead && (
              <Button
                variant="outline"
                onClick={() => onMarkAsRead(notification.id)}
                className="flex-shrink-0"
              >
                <CheckCircle className="size-4 mr-2" />
                Marcar como leída
              </Button>
            )}
          </div>

          {/* Botón de navegación principal */}
          <div className="pt-2">
            {getActionButton()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
