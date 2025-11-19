// Centro de notificaciones con soporte multi-canal
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Notification } from '../types';
import { notificationsService } from '../services/notifications';
import { formatDate, formatTime } from '../utils/formatters';
import { 
  Bell,
  BellOff,
  Settings,
  Check,
  X,
  Trash2,
  Mail,
  MessageSquare,
  Smartphone,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  Star
} from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    pushEnabled: false,
    emailEnabled: true,
    smsEnabled: false,
    soundEnabled: true,
    showPreview: true
  });

  // Cargar notificaciones
  useEffect(() => {
    if (isOpen && user) {
      loadNotifications();
    }
  }, [isOpen, user]);

  // Configurar notificaciones push al cargar
  useEffect(() => {
    if (user) {
      setupNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userNotifications = await notificationsService.getUserNotifications(user.id);
      setNotifications(userNotifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupNotifications = async () => {
    try {
      await notificationsService.setupPushNotifications();
      setSettings(prev => ({ ...prev, pushEnabled: true }));
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      for (const notification of unreadNotifications) {
        await notificationsService.markAsRead(notification.id);
      }
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationsService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      for (const notification of notifications) {
        await notificationsService.deleteNotification(notification.id);
      }
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'request_created':
      case 'request_accepted':
      case 'request_rejected':
        return <CheckCircle className="size-4 text-blue-500" />;
      case 'message_received':
        return <MessageSquare className="size-4 text-green-500" />;
      case 'payment_received':
        return <Star className="size-4 text-yellow-500" />;
      case 'review_received':
        return <Star className="size-4 text-purple-500" />;
      default:
        return <Info className="size-4 text-gray-500" />;
    }
  };

  const getNotificationPriority = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">Alta</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">Media</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Baja</Badge>;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Bell className="size-5" />
            <CardTitle>Centro de Notificaciones</CardTitle>
            <Badge variant="outline">
              {notifications.filter(n => !n.read).length} sin leer
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadNotifications}
              disabled={loading}
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Configuración de notificaciones */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Configuración de Notificaciones</Label>
              <Settings className="size-4 text-gray-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="size-4" />
                  <Label className="text-sm">Push</Label>
                </div>
                <Switch
                  checked={settings.pushEnabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, pushEnabled: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="size-4" />
                  <Label className="text-sm">Email</Label>
                </div>
                <Switch
                  checked={settings.emailEnabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, emailEnabled: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4" />
                  <Label className="text-sm">SMS</Label>
                </div>
                <Switch
                  checked={settings.smsEnabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, smsEnabled: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="size-4" />
                  <Label className="text-sm">Sonido</Label>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, soundEnabled: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Acciones rápidas */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={notifications.every(n => n.read)}
            >
              <Check className="size-4 mr-2" />
              Marcar todas como leídas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllNotifications}
              disabled={notifications.length === 0}
            >
              <Trash2 className="size-4 mr-2" />
              Limpiar todas
            </Button>
          </div>

          <Separator />

          {/* Lista de notificaciones */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="size-6 animate-spin text-gray-500" />
                <span className="ml-2 text-gray-500">Cargando notificaciones...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <BellOff className="size-12 mb-4" />
                <p>No hay notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    notification.read 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{formatDate(notification.createdAt)}</span>
                          <span>•</span>
                          <span>{formatTime(notification.createdAt)}</span>
                          {getNotificationPriority(notification.priority)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="size-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
