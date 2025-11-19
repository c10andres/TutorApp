// Componente dropdown para notificaciones - Versión simplificada que funciona
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { SimpleNotificationModal } from './SimpleNotificationModal';
import { Notification } from '../types';
import { notificationsService } from '../services/notifications';
import { formatDate } from '../utils/formatters';
import { 
  Bell, 
  BellRing, 
  Check, 
  CheckCheck, 
  MessageCircle, 
  Calendar, 
  CreditCard, 
  Star,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';

interface NotificationsDropdownProps {
  onNavigate?: (page: string, data?: any) => void;
}

export function NotificationsDropdown({ onNavigate }: NotificationsDropdownProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
  
  // Estados del modal
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Refs para el dropdown manual
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    console.log('🔔 Loading notifications for user:', user.id);

    // Cargar notificaciones iniciales
    const loadNotifications = async () => {
      try {
        setLoading(true);
        console.log('🔧 Cargando notificaciones...');
        const userNotifications = await notificationsService.getUserNotifications(user.id);
        console.log('📋 Notificaciones cargadas:', userNotifications.length);
        console.log('📋 Detalles de notificaciones:', userNotifications);
        setNotifications(userNotifications);
      } catch (error) {
        console.error('❌ Error loading notifications:', error);
        setNotifications([]); // Asegurar que se inicialice como array vacío
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    // Configurar escucha en tiempo real
    const unsubscribe = notificationsService.onNotificationsChanged(user.id, (newNotifications) => {
      console.log('🔄 Notificaciones actualizadas via listener:', newNotifications.length);
      console.log('🔄 Detalles de notificaciones actualizadas:', newNotifications);
      setNotifications(newNotifications);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Cerrar dropdown cuando se hace clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleBellClick = () => {
    console.log('🔔 Bell clicked, current state:', isOpen);
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (notificationId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    try {
      setMarkingAsRead(notificationId);
      await notificationsService.markAsRead(notificationId);
      console.log('✅ Marked notification as read:', notificationId);
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    } finally {
      setMarkingAsRead(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    
    try {
      await notificationsService.markAllAsRead(user.id);
      console.log('✅ Marked all notifications as read');
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    console.log('🖱️ Notification clicked:', notification.title);
    
    setSelectedNotification(notification);
    setIsModalOpen(true);
    setIsOpen(false);
    
    // Marcar como leída si no lo está
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
  };

  const handleCloseModal = () => {
    console.log('❌ Closing modal');
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'request':
        return <Calendar className="size-4 text-blue-500" />;
      case 'message':
        return <MessageCircle className="size-4 text-green-500" />;
      case 'payment':
        return <CreditCard className="size-4 text-purple-500" />;
      case 'review':
        return <Star className="size-4 text-yellow-500" />;
      default:
        return <AlertCircle className="size-4 text-gray-500" />;
    }
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return formatDate(date);
  };

  console.log('🔔 NotificationsDropdown render:', {
    isOpen,
    unreadCount,
    notificationsCount: notifications.length,
    loading,
    isModalOpen,
    hasSelectedNotification: !!selectedNotification
  });

  return (
    <>
      {/* Botón y dropdown con posicionamiento manual */}
      <div className="relative" ref={buttonRef}>
        {/* Botón de la campana */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative"
          onClick={handleBellClick}
        >
          {unreadCount > 0 ? (
            <BellRing className="size-5 text-orange-500" />
          ) : (
            <Bell className="size-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 size-5 text-xs p-0 flex items-center justify-center pointer-events-none"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* Dropdown manual */}
        {isOpen && (
          <div 
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] max-h-96 overflow-hidden"
            style={{ zIndex: 9999 }}
          >
            {/* Header del dropdown */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">Notificaciones</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="size-6 p-0"
                >
                  <X className="size-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {unreadCount > 0 
                    ? `${unreadCount} sin leer` 
                    : 'Todas leídas'
                  }
                </p>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs h-6 px-2"
                  >
                    <CheckCheck className="size-3 mr-1" />
                    Marcar todas
                  </Button>
                )}
              </div>
            </div>

            {/* Contenido del dropdown */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="size-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Cargando...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Bell className="size-12 text-gray-300 mb-3" />
                  <h4 className="font-medium text-gray-600 mb-1">No hay notificaciones</h4>
                  <p className="text-sm text-gray-500">
                    Las notificaciones aparecerán aquí
                  </p>
                </div>
              ) : (
                <div>
                  {notifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div
                        className={`w-full text-left flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors group cursor-pointer ${
                          !notification.read ? 'bg-blue-50/50 border-l-4 border-blue-500' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'}`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className="text-xs text-gray-500">
                                {getTimeAgo(notification.createdAt)}
                              </span>
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="size-6 p-0 hover:bg-green-100 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => handleMarkAsRead(notification.id, e)}
                                  disabled={markingAsRead === notification.id}
                                  title="Marcar como leída"
                                >
                                  {markingAsRead === notification.id ? (
                                    <Loader2 className="size-3 animate-spin" />
                                  ) : (
                                    <Check className="size-3 text-green-600" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                              {notification.type === 'request' && '📅 Solicitud'}
                              {notification.type === 'message' && '💬 Mensaje'}
                              {notification.type === 'payment' && '💳 Pago'}
                              {notification.type === 'review' && '⭐ Reseña'}
                            </span>
                            <span className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              Clic para ver →
                            </span>
                          </div>
                        </div>
                        
                        {!notification.read && (
                          <div className="size-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        )}
                      </div>
                      {index < notifications.length - 1 && (
                        <div className="border-b border-gray-100" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de detalles */}
      <SimpleNotificationModal
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onNavigate={onNavigate}
      />
    </>
  );
}
