import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Notification } from '../types';
import { formatDate, formatTime } from '../utils/formatters';
import { 
  Calendar, 
  MessageCircle, 
  CreditCard, 
  Star, 
  AlertCircle,
  ArrowRight,
  X
} from 'lucide-react';

interface SimpleNotificationModalProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: string, data?: any) => void;
}

export function SimpleNotificationModal({ 
  notification, 
  isOpen, 
  onClose, 
  onNavigate 
}: SimpleNotificationModalProps) {
  
  console.log('🔔 SimpleNotificationModal render:', { 
    isOpen, 
    hasNotification: !!notification,
    notificationTitle: notification?.title 
  });

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

  const handleNavigate = () => {
    console.log('🔗 Navigate button clicked, type:', notification.type);
    
    if (!onNavigate) {
      console.log('❌ No onNavigate function provided');
      return;
    }

    switch (notification.type) {
      case 'request':
        onNavigate('requests');
        break;
      case 'message':
        onNavigate('chat', { 
          otherUserId: notification.data?.senderId,
          requestId: notification.data?.requestId 
        });
        break;
      case 'payment':
        onNavigate('payments');
        break;
      case 'review':
        onNavigate('requests');
        break;
      default:
        onNavigate('requests');
        break;
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            {getNotificationIcon(notification.type)}
            <div className="flex-1">
              <DialogTitle className="text-lg">
                {notification.title}
              </DialogTitle>
              <Badge variant="outline" className="mt-1">
                {notification.type === 'request' && 'Solicitud'}
                {notification.type === 'message' && 'Mensaje'} 
                {notification.type === 'payment' && 'Pago'}
                {notification.type === 'review' && 'Reseña'}
              </Badge>
            </div>
            {!notification.read && (
              <div className="size-3 bg-blue-500 rounded-full" />
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mensaje */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm leading-relaxed">
              {notification.message}
            </p>
          </div>

          {/* Fecha */}
          <div className="text-xs text-gray-500 text-center">
            {formatDate(notification.createdAt)} a las {formatTime(notification.createdAt)}
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              <X className="size-4 mr-2" />
              Cerrar
            </Button>
            
            <Button
              onClick={handleNavigate}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Ver detalles
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
