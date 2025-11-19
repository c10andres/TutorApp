// Utilidad para crear notificaciones de demostración
import { notificationsService } from '../services/notifications';
import { Notification } from '../types';

export async function createDemoNotifications(userId: string): Promise<void> {
  console.log('🚀 Creating demo notifications for user:', userId);
  const demoNotifications: Partial<Notification>[] = [
    {
      userId,
      type: 'request',
      title: '¡Nueva solicitud de tutoría!',
      message: 'María González ha solicitado una sesión de Matemáticas Avanzadas para mañana a las 3:00 PM. La sesión durará 2 horas y el precio acordado es $45,000 COP.',
      data: {
        tutorName: 'María González',
        subject: 'Matemáticas Avanzadas',
        status: 'pending',
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
        duration: 120,
        price: 45000
      },
      read: false
    },
    {
      userId,
      type: 'message',
      title: 'Nuevo mensaje de Carlos Rodríguez',
      message: 'Hola! Te escribo para confirmar nuestra sesión de Física para el viernes. ¿Podríamos adelantarla 30 minutos? Tengo una reunión importante después.',
      data: {
        senderId: 'tutor-2',
        senderName: 'Carlos Rodríguez',
        messagePreview: 'Hola! Te escribo para confirmar nuestra sesión de Física...',
        requestId: 'req-123'
      },
      read: false
    },
    {
      userId,
      type: 'payment',
      title: 'Pago recibido exitosamente',
      message: 'Has recibido el pago de $60,000 COP por la sesión de Química Orgánica con Ana Martínez. El dinero estará disponible en tu cuenta en 1-2 días hábiles.',
      data: {
        amount: 60000,
        status: 'completed',
        payerName: 'Ana Martínez',
        sessionSubject: 'Química Orgánica',
        transactionId: 'PAY-789'
      },
      read: false
    },
    {
      userId,
      type: 'review',
      title: 'Nueva calificación recibida',
      message: 'David López ha calificado tu sesión de Programación en Python con 5 estrellas. Comentario: "Excelente explicación, muy claro y paciente. Definitivamente recomendaré a Alejandro."',
      data: {
        reviewerName: 'David López',
        rating: 5,
        comment: 'Excelente explicación, muy claro y paciente. Definitivamente recomendaré a Alejandro.',
        subject: 'Programación en Python'
      },
      read: true
    },
    {
      userId,
      type: 'request',
      title: 'Solicitud cancelada',
      message: 'Lamentablemente, Laura Hernández ha cancelado la sesión de Inglés Conversacional programada para hoy. No se aplicarán cargos por la cancelación.',
      data: {
        tutorName: 'Laura Hernández',
        subject: 'Inglés Conversacional',
        status: 'cancelled',
        reason: 'Emergencia familiar'
      },
      read: true
    },
    {
      userId,
      type: 'message',
      title: 'Recordatorio de sesión',
      message: 'Tu sesión de Álgebra Lineal con Patricia Gómez comienza en 30 minutos. ¡No olvides preparar los materiales que acordaron!',
      data: {
        senderId: 'system',
        senderName: 'Sistema',
        reminderType: 'session',
        sessionTime: new Date(Date.now() + 30 * 60 * 1000), // En 30 minutos
        subject: 'Álgebra Lineal',
        tutorName: 'Patricia Gómez'
      },
      read: false
    }
  ];

  try {
    console.log(`📝 Creating ${demoNotifications.length} demo notifications...`);
    
    for (let i = 0; i < demoNotifications.length; i++) {
      const notification = demoNotifications[i];
      console.log(`Creating notification ${i + 1}: ${notification.title}`);
      
      const created = await notificationsService.createNotification(notification as Omit<Notification, 'id' | 'createdAt'>);
      console.log(`✅ Created notification:`, created);
      
      // Pequeña pausa para que las notificaciones tengan timestamps diferentes
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('✅ Notificaciones de demostración creadas exitosamente');
    
    // Verificar que se guardaron
    const notifications = await notificationsService.getUserNotifications(userId);
    console.log(`🔍 Total notifications in system for user: ${notifications.length}`);
    
  } catch (error) {
    console.error('❌ Error creando notificaciones de demostración:', error);
  }
}

export async function clearDemoNotifications(userId: string): Promise<void> {
  try {
    const notifications = await notificationsService.getUserNotifications(userId);
    for (const notification of notifications) {
      await notificationsService.deleteNotification(notification.id);
    }
    console.log('🗑️ Notificaciones de demostración eliminadas');
  } catch (error) {
    console.error('❌ Error eliminando notificaciones:', error);
  }
}