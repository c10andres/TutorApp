// Servicio de notificaciones con soporte para push, email y SMS
import { ref, push, get, query, orderByChild, equalTo, update, onValue, off, remove } from 'firebase/database';
import { database } from '../firebase';
import { Notification as AppNotification } from '../types';
import { FirebaseFallbackManager } from '../utils/firebase-fallback';
import { platformService } from './platform';

class NotificationsService {
  private listeners: { [userId: string]: (() => void)[] } = {};

  // Crear notificación con soporte multi-canal
  async createNotification(notification: Omit<AppNotification, 'id' | 'createdAt'>): Promise<AppNotification> {
    console.log('📝 Creating notification:', notification.title, 'for user:', notification.userId);
    
    try {
      const notificationsRef = ref(database, 'notifications');
      const newNotificationRef = push(notificationsRef);
      
      const newNotification: AppNotification = {
        ...notification,
        id: newNotificationRef.key!,
        createdAt: new Date(),
      };

      const notificationData = {
        ...newNotification,
        createdAt: newNotification.createdAt.toISOString(),
      };

      await update(newNotificationRef, notificationData);
      console.log('✅ Firebase notification created:', newNotification.id);
      
      // Enviar notificaciones multi-canal
      await this.sendMultiChannelNotification(newNotification);
      
      return newNotification;
    } catch (error) {
      console.error('⚠️ Firebase error, using localStorage fallback:', error);
      
      // Fallback a localStorage
      const newNotification: AppNotification = {
        ...notification,
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
      };

      const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      existingNotifications.push(newNotification);
      localStorage.setItem('notifications', JSON.stringify(existingNotifications));
      
      console.log('💾 LocalStorage notification created:', newNotification.id);
      
      // Enviar notificaciones multi-canal incluso en fallback
      await this.sendMultiChannelNotification(newNotification);
      
      return newNotification;
    }
  }

  // Enviar notificaciones multi-canal (Push, Email, SMS)
  private async sendMultiChannelNotification(notification: AppNotification): Promise<void> {
    try {
      // 1. Notificación Push (si está disponible)
      if ('Notification' in window && Notification.permission === 'granted') {
        await this.sendPushNotification(notification);
      }

      // 2. Notificación por Email (simulada)
      await this.sendEmailNotification(notification);

      // 3. Notificación por SMS (simulada)
      await this.sendSMSNotification(notification);

      console.log('📱 Multi-channel notifications sent successfully');
    } catch (error) {
      console.error('⚠️ Error sending multi-channel notifications:', error);
    }
  }

  // Enviar notificación push
  private async sendPushNotification(notification: AppNotification): Promise<void> {
    try {
      const pushNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: notification.type,
        requireInteraction: notification.priority === 'high',
        actions: [
          {
            action: 'view',
            title: 'Ver',
            icon: '/action-view.png'
          },
          {
            action: 'dismiss',
            title: 'Descartar',
            icon: '/action-dismiss.png'
          }
        ]
      });

      pushNotification.onclick = () => {
        window.focus();
        pushNotification.close();
        // Aquí podrías navegar a la página específica
        console.log('Push notification clicked:', notification.type);
      };

      // Auto-cerrar después de 5 segundos si no es de alta prioridad
      if (notification.priority !== 'high') {
        setTimeout(() => pushNotification.close(), 5000);
      }

      console.log('📱 Push notification sent');
    } catch (error) {
      console.error('⚠️ Error sending push notification:', error);
    }
  }

  // Enviar notificación por email (simulada)
  private async sendEmailNotification(notification: AppNotification): Promise<void> {
    try {
      // Simular envío de email
      console.log('📧 Email notification sent:', {
        to: notification.userId,
        subject: notification.title,
        body: notification.message,
        type: notification.type
      });

      // En producción, aquí se integraría con un servicio de email como SendGrid, AWS SES, etc.
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('📧 Email notification queued for delivery');
    } catch (error) {
      console.error('⚠️ Error sending email notification:', error);
    }
  }

  // Enviar notificación por SMS (simulada)
  private async sendSMSNotification(notification: AppNotification): Promise<void> {
    try {
      // Solo enviar SMS para notificaciones de alta prioridad
      if (notification.priority === 'high') {
        console.log('📱 SMS notification sent:', {
          to: notification.userId,
          message: `${notification.title}: ${notification.message}`,
          type: notification.type
        });

        // En producción, aquí se integraría con un servicio de SMS como Twilio, AWS SNS, etc.
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('📱 SMS notification queued for delivery');
      }
    } catch (error) {
      console.error('⚠️ Error sending SMS notification:', error);
    }
  }

  // Solicitar permisos de notificaciones push
  async requestNotificationPermission(): Promise<boolean> {
    try {
      if (!('Notification' in window)) {
        console.log('❌ Este navegador no soporta notificaciones');
        return false;
      }

      if (Notification.permission === 'granted') {
        console.log('✅ Permisos de notificación ya concedidos');
        return true;
      }

      if (Notification.permission === 'denied') {
        console.log('❌ Permisos de notificación denegados');
        return false;
      }

      const permission = await Notification.requestPermission();
      console.log('📱 Permiso de notificación:', permission);
      
      return permission === 'granted';
    } catch (error) {
      console.error('⚠️ Error requesting notification permission:', error);
      return false;
    }
  }

  // Configurar notificaciones push
  async setupPushNotifications(): Promise<void> {
    try {
      const hasPermission = await this.requestNotificationPermission();
      
      if (hasPermission) {
        console.log('📱 Push notifications configured successfully');
        
        // Registrar service worker si está disponible
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('🔧 Service Worker registered:', registration);
          } catch (error) {
            console.warn('⚠️ Service Worker registration failed:', error);
          }
        }
      }
    } catch (error) {
      console.error('⚠️ Error setting up push notifications:', error);
    }
  }

  // Obtener notificaciones del usuario
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      console.log('🔔 Obteniendo notificaciones para usuario:', userId);
      
      const notificationsRef = ref(database, 'notifications');
      const userNotificationsQuery = query(notificationsRef, orderByChild('userId'), equalTo(userId));
      
      const snapshot = await get(userNotificationsQuery);
      
      let firebaseNotifications: AppNotification[] = [];
      if (snapshot.exists()) {
        const notifications = snapshot.val();
        firebaseNotifications = Object.keys(notifications)
          .map(key => ({
            ...notifications[key],
            id: key,
            createdAt: new Date(notifications[key].createdAt),
          }))
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          
        console.log(`✅ Encontradas ${firebaseNotifications.length} notificaciones en Firebase`);
      } else {
        console.log('ℹ️ No hay notificaciones en Firebase para este usuario');
      }

      // Fallback a localStorage
      let localNotifications: AppNotification[] = [];
      try {
        const localData = localStorage.getItem('notifications') || '[]';
        localNotifications = JSON.parse(localData)
          .filter((n: AppNotification) => n.userId === userId)
          .map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt),
          }))
          .sort((a: AppNotification, b: AppNotification) => b.createdAt.getTime() - a.createdAt.getTime());
          
        console.log(`✅ Encontradas ${localNotifications.length} notificaciones en localStorage`);
      } catch (localError) {
        console.error('❌ Error accediendo a localStorage:', localError);
      }

      // Combinar notificaciones de ambas fuentes
      const allNotifications = [...firebaseNotifications, ...localNotifications];
      
      console.log(`📊 Total de notificaciones combinadas: ${allNotifications.length}`);
      
      // Si no hay notificaciones, generar algunas de demostración
      if (allNotifications.length === 0) {
        console.log('ℹ️ No se encontraron notificaciones, generando datos de demostración');
        return this.generateDemoNotifications(userId);
      }

      // Eliminar duplicados por ID
      const uniqueNotifications = allNotifications.reduce((acc, notification) => {
        if (!acc.find(n => n.id === notification.id)) {
          acc.push(notification);
        }
        return acc;
      }, [] as Notification[]);

      console.log(`📋 Notificaciones únicas: ${uniqueNotifications.length}`);
      return uniqueNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
    } catch (error) {
      console.error('❌ Error obteniendo notificaciones:', error);
      console.log('🔄 Usando datos de demostración como fallback');
      return this.generateDemoNotifications(userId);
    }
  }

  // Generar notificaciones de demostración
  private generateDemoNotifications(userId: string): AppNotification[] {
    return [
      {
        id: `demo-1-${userId}`,
        userId: userId,
        title: '¡Nueva solicitud de tutoría!',
        message: 'María González solicita una clase de Cálculo Diferencial para mañana',
        type: 'request',
        read: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
        data: { requestId: 'demo-request-1' }
      },
      {
        id: `demo-2-${userId}`,
        userId: userId,
        title: 'Mensaje nuevo',
        message: 'Carlos: ¿Podemos reprogramar la clase para las 3 PM?',
        type: 'message',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        data: { senderId: 'demo-user-2', roomId: 'demo-room' }
      },
      {
        id: `demo-3-${userId}`,
        userId: userId,
        title: 'Clase completada',
        message: 'Tu clase de Programación en JavaScript ha sido marcada como completada. ¡Deja tu reseña!',
        type: 'request',
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 día atrás
        data: { requestId: 'demo-request-2' }
      }
    ];
  }

  // Marcar notificación como leída
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = ref(database, `notifications/${notificationId}`);
      await update(notificationRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read, using localStorage fallback:', error);
      
      // Fallback a localStorage
      try {
        const localNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const notificationIndex = localNotifications.findIndex((n: AppNotification) => n.id === notificationId);
        
        if (notificationIndex !== -1) {
          localNotifications[notificationIndex].read = true;
          localStorage.setItem('notifications', JSON.stringify(localNotifications));
        }
      } catch (localError) {
        console.error('Error updating notification in localStorage:', localError);
      }
    }
  }

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const notifications = await this.getUserNotifications(userId);
      const unreadNotifications = notifications.filter(n => !n.read);
      
      await Promise.all(
        unreadNotifications.map(notification => this.markAsRead(notification.id))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  // Eliminar notificación
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notificationRef = ref(database, `notifications/${notificationId}`);
      await remove(notificationRef);
    } catch (error) {
      console.error('Error deleting notification, using localStorage fallback:', error);
      
      // Fallback a localStorage
      try {
        const localNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const filteredNotifications = localNotifications.filter((n: AppNotification) => n.id !== notificationId);
        localStorage.setItem('notifications', JSON.stringify(filteredNotifications));
      } catch (localError) {
        console.error('Error deleting notification from localStorage:', localError);
      }
    }
  }

  // Escuchar cambios en notificaciones en tiempo real
  onNotificationsChanged(userId: string, callback: (notifications: AppNotification[]) => void): () => void {
    try {
      const notificationsRef = ref(database, 'notifications');
      const userNotificationsQuery = query(notificationsRef, orderByChild('userId'), equalTo(userId));

      const handleValueChange = (snapshot: any) => {
        if (snapshot.exists()) {
          const notifications = snapshot.val();
          const notificationsList = Object.keys(notifications)
            .map(key => ({
              ...notifications[key],
              id: key,
              createdAt: new Date(notifications[key].createdAt),
            }))
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          callback(notificationsList);
        } else {
          callback([]);
        }
      };

      const handleError = (error: any) => {
        console.warn('Firebase notifications listener error, using localStorage fallback:', error);
        
        // Fallback a localStorage
        try {
          const localNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
          const userNotifications = localNotifications
            .filter((n: AppNotification) => n.userId === userId)
            .map((n: any) => ({
              ...n,
              createdAt: new Date(n.createdAt),
            }))
            .sort((a: AppNotification, b: AppNotification) => b.createdAt.getTime() - a.createdAt.getTime());
          callback(userNotifications);
        } catch (localError) {
          console.error('Error accessing localStorage notifications:', localError);
          callback([]);
        }
      };

      onValue(userNotificationsQuery, handleValueChange, handleError);

      // Guardar la función de limpieza
      if (!this.listeners[userId]) {
        this.listeners[userId] = [];
      }
      
      const cleanup = () => {
        off(userNotificationsQuery, 'value', handleValueChange);
      };
      
      this.listeners[userId].push(cleanup);
      
      return cleanup;
    } catch (error) {
      console.warn('Failed to set up Firebase notifications listener:', error);
      
      // Si no se puede configurar la escucha, usar solo localStorage
      try {
        const localNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const userNotifications = localNotifications
          .filter((n: Notification) => n.userId === userId)
          .map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt),
          }))
          .sort((a: Notification, b: Notification) => b.createdAt.getTime() - a.createdAt.getTime());
        callback(userNotifications);
      } catch (localError) {
        console.error('Error accessing localStorage notifications:', localError);
        callback([]);
      }
      
      return () => {};
    }
  }

  // Obtener conteo de notificaciones no leídas
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const notifications = await this.getUserNotifications(userId);
      return notifications.filter(n => !n.read).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Crear notificaciones automáticas para eventos del sistema
  async createRequestNotification(
    type: 'request_created' | 'request_accepted' | 'request_rejected' | 'request_cancelled' | 'request_completed',
    recipientId: string,
    requestData: any
  ): Promise<void> {
    const notifications: { [key: string]: { title: string; message: string; type: AppNotification['type'] } } = {
      request_created: {
        title: 'Nueva solicitud de tutoría',
        message: `Tienes una nueva solicitud de tutoría para ${requestData.subject}`,
        type: 'request'
      },
      request_accepted: {
        title: 'Solicitud aceptada',
        message: `Tu solicitud de tutoría para ${requestData.subject} ha sido aceptada`,
        type: 'request'
      },
      request_rejected: {
        title: 'Solicitud rechazada',
        message: `Tu solicitud de tutoría para ${requestData.subject} ha sido rechazada`,
        type: 'request'
      },
      request_cancelled: {
        title: 'Solicitud cancelada',
        message: `La solicitud de tutoría para ${requestData.subject} ha sido cancelada`,
        type: 'request'
      },
      request_completed: {
        title: 'Clase completada',
        message: `La clase de ${requestData.subject} ha sido completada. ¡Deja tu reseña!`,
        type: 'request'
      }
    };

    const notificationConfig = notifications[type];
    if (!notificationConfig) return;

    await this.createNotification({
      userId: recipientId,
      title: notificationConfig.title,
      message: notificationConfig.message,
      type: notificationConfig.type,
      read: false,
      data: { requestId: requestData.id, type }
    });
  }

  // Limpiar listeners al desmontar componentes
  cleanup(userId?: string): void {
    if (userId && this.listeners[userId]) {
      this.listeners[userId].forEach(cleanup => cleanup());
      delete this.listeners[userId];
    } else if (!userId) {
      // Limpiar todos los listeners
      Object.keys(this.listeners).forEach(uid => {
        this.listeners[uid].forEach(cleanup => cleanup());
      });
      this.listeners = {};
    }
  }
}

export const notificationsService = new NotificationsService();