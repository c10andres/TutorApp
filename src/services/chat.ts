// Servicio de chat en tiempo real con Firebase
import { ref, push, get, onValue, off, query, orderByChild, limitToLast, update, equalTo, set } from 'firebase/database';
import { database } from '../firebase';
import { ChatMessage, ChatRoom } from '../types';
import { notificationsService } from './notifications';
import { db } from '../firebase'; // Firestore for Knowledge Base
import { collection, addDoc } from 'firebase/firestore';

class ChatService {
  // Crear o obtener sala de chat entre dos usuarios
  async getOrCreateChatRoom(user1Id: string, user2Id: string, requestId?: string): Promise<string> {
    try {
      // Crear ID de sala consistente (siempre el mismo orden)
      const participants = [user1Id, user2Id].sort();
      const roomId = `${participants[0]}_${participants[1]}`;

      const roomRef = ref(database, `chatRooms/${roomId}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        // Verificar si existen otras salas entre estos usuarios (limpieza de duplicados)
        await this.cleanupDuplicateRooms(user1Id, user2Id);

        // Crear nueva sala de chat
        const newRoom: Omit<ChatRoom, 'id'> = {
          participants,
          updatedAt: new Date(),
          requestId
        };

        const roomData = {
          ...newRoom,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          lastMessage: null
        };

        await update(roomRef, roomData);
        console.log(`✅ Sala de chat creada: ${roomId}`);
      } else {
        console.log(`✅ Sala de chat existente encontrada: ${roomId}`);

        // Actualizar requestId si se proporciona y no existe
        const existingRoom = snapshot.val();
        if (requestId && !existingRoom.requestId) {
          await update(roomRef, {
            requestId: requestId,
            updatedAt: new Date().toISOString()
          });
          console.log(`✅ RequestId actualizado para sala: ${roomId}`);
        }
      }

      return roomId;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw new Error('Error al crear la sala de chat');
    }
  }

  // Limpiar salas duplicadas entre dos usuarios
  private async cleanupDuplicateRooms(user1Id: string, user2Id: string): Promise<void> {
    try {
      const allRoomsRef = ref(database, 'chatRooms');
      const snapshot = await get(allRoomsRef);

      if (!snapshot.exists()) return;

      const allRooms = snapshot.val();
      const duplicateRooms: string[] = [];

      // Buscar salas que involucren a ambos usuarios
      Object.keys(allRooms).forEach(roomId => {
        const room = allRooms[roomId];
        if (room.participants &&
          room.participants.includes(user1Id) &&
          room.participants.includes(user2Id)) {
          duplicateRooms.push(roomId);
        }
      });

      // Si hay más de una sala, mantener solo la más reciente
      if (duplicateRooms.length > 1) {
        console.log(`⚠️ Se encontraron ${duplicateRooms.length} salas duplicadas, limpiando...`);

        // Ordenar por fecha de actualización (más reciente primero)
        const sortedRooms = duplicateRooms.sort((a, b) => {
          const roomA = allRooms[a];
          const roomB = allRooms[b];
          const dateA = new Date(roomA.updatedAt || roomA.createdAt);
          const dateB = new Date(roomB.updatedAt || roomB.createdAt);
          return dateB.getTime() - dateA.getTime();
        });

        // Mantener la primera (más reciente) y eliminar las demás
        const roomsToDelete = sortedRooms.slice(1);

        for (const roomId of roomsToDelete) {
          const roomRef = ref(database, `chatRooms/${roomId}`);
          await set(roomRef, null); // Eliminar la sala
          console.log(`🗑️ Sala duplicada eliminada: ${roomId}`);
        }

        console.log(`✅ Limpieza completada: ${roomsToDelete.length} salas duplicadas eliminadas`);
      }
    } catch (error) {
      console.warn('Error during duplicate cleanup:', error);
      // No fallar la creación de la sala si falla la limpieza
    }
  }

  // Enviar mensaje
  async sendMessage(
    roomId: string,
    senderId: string,
    receiverId: string,
    content: string,
    requestId?: string
  ): Promise<ChatMessage> {
    try {
      const messagesRef = ref(database, `messages/${roomId}`);
      const messageRef = push(messagesRef);

      const newMessage: ChatMessage = {
        id: messageRef.key!,
        senderId,
        receiverId,
        content,
        timestamp: new Date(),
        read: false,
        requestId,
      };

      const messageData = {
        ...newMessage,
        timestamp: newMessage.timestamp.toISOString(),
      };

      await update(messageRef, messageData);

      // Actualizar la sala de chat con el último mensaje
      const roomRef = ref(database, `chatRooms/${roomId}`);
      await update(roomRef, {
        lastMessage: messageData,
        updatedAt: new Date().toISOString(),
      });

      // Enviar notificación al receptor
      try {
        await notificationsService.createNotification({
          userId: receiverId,
          title: 'Nuevo mensaje',
          message: content.length > 50 ? `${content.substring(0, 50)}...` : content,
          type: 'message',
          read: false,
          data: {
            senderId: senderId,
            roomId: roomId,
            requestId: requestId
          }
        });
      } catch (notificationError) {
        console.warn('Error sending message notification:', notificationError);
        // No fallar el envío del mensaje si falla la notificación
      }

      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Error al enviar mensaje');
    }
  }

  // Obtener mensajes de una sala (últimos 50 mensajes)
  async getMessages(roomId: string): Promise<ChatMessage[]> {
    try {
      const messagesRef = ref(database, `messages/${roomId}`);
      const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(50));

      const snapshot = await get(messagesQuery);

      if (!snapshot.exists()) {
        return [];
      }

      const messages = snapshot.val();
      const messagesList = Object.keys(messages).map(key => ({
        ...messages[key],
        id: key,
        timestamp: new Date(messages[key].timestamp),
      }));

      // Ordenar por timestamp ascendente
      return messagesList.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } catch (error) {
      console.error('Error getting messages:', error);
      throw new Error('Error al cargar mensajes');
    }
  }

  // Escuchar mensajes en tiempo real
  onMessagesChanged(roomId: string, callback: (messages: ChatMessage[]) => void): () => void {
    const messagesRef = ref(database, `messages/${roomId}`);
    const messagesQuery = query(messagesRef, orderByChild('timestamp'));

    const handleValueChange = (snapshot: any) => {
      if (snapshot.exists()) {
        const messages = snapshot.val();
        const messagesList = Object.keys(messages)
          .map(key => ({
            ...messages[key],
            id: key,
            timestamp: new Date(messages[key].timestamp),
          }))
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        callback(messagesList);
      } else {
        callback([]);
      }
    };

    onValue(messagesQuery, handleValueChange);

    // Retornar función para cancelar la suscripción
    return () => {
      off(messagesQuery, 'value', handleValueChange);
    };
  }

  // Obtener salas de chat del usuario
  async getUserChatRooms(userId: string): Promise<ChatRoom[]> {
    try {
      console.log('🔧 Obteniendo salas de chat para usuario:', userId);
      const roomsRef = ref(database, 'chatRooms');
      const snapshot = await get(roomsRef);

      if (!snapshot.exists()) {
        console.log('ℹ️ No hay salas de chat en la base de datos');
        return [];
      }

      const rooms = snapshot.val();
      const userRooms: ChatRoom[] = [];

      Object.keys(rooms).forEach(roomId => {
        const roomData = rooms[roomId];
        if (roomData.participants && roomData.participants.includes(userId)) {
          console.log('✅ Sala encontrada:', roomId, 'para usuario:', userId);
          userRooms.push({
            id: roomId,
            ...roomData,
            updatedAt: new Date(roomData.updatedAt),
            lastMessage: roomData.lastMessage ? {
              ...roomData.lastMessage,
              timestamp: new Date(roomData.lastMessage.timestamp),
            } : undefined,
          });
        }
      });

      console.log(`📚 ${userRooms.length} salas de chat encontradas para el usuario`);

      // Ordenar por última actualización
      const sortedRooms = userRooms.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      return sortedRooms;
    } catch (error) {
      console.error('❌ Error getting chat rooms:', error);
      return [];
    }
  }

  // Marcar mensajes como leídos
  async markMessagesAsRead(roomId: string, userId: string): Promise<void> {
    try {
      const messagesRef = ref(database, `messages/${roomId}`);
      const unreadQuery = query(messagesRef, orderByChild('receiverId'), equalTo(userId));

      const snapshot = await get(unreadQuery);

      if (snapshot.exists()) {
        const messages = snapshot.val();
        const updates: Record<string, any> = {};

        Object.keys(messages).forEach(messageId => {
          const message = messages[messageId];
          if (!message.read && message.receiverId === userId) {
            updates[`${messageId}/read`] = true;
          }
        });

        if (Object.keys(updates).length > 0) {
          await update(messagesRef, updates);
        }
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  // Obtener conteo de mensajes no leídos
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const rooms = await this.getUserChatRooms(userId);
      let unreadCount = 0;

      for (const room of rooms) {
        const messagesRef = ref(database, `messages/${room.id}`);
        const unreadQuery = query(messagesRef, orderByChild('receiverId'), equalTo(userId));

        const snapshot = await get(unreadQuery);
        if (snapshot.exists()) {
          const messages = snapshot.val();
          Object.values(messages).forEach((message: any) => {
            if (!message.read && message.receiverId === userId) {
              unreadCount++;
            }
          });
        }
      }

      return unreadCount;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Función para demostración: crear mensajes iniciales con un tutor
  async createDemoMessages(studentId: string, tutorId: string, requestId: string): Promise<void> {
    try {
      const roomId = await this.getOrCreateChatRoom(studentId, tutorId, requestId);

      // Solo crear mensajes si la sala no tiene mensajes
      const messages = await this.getMessages(roomId);
      if (messages.length === 0) {
        const demoMessages = [
          {
            senderId: tutorId,
            receiverId: studentId,
            content: '¡Hola! He visto tu solicitud de tutoría. Me parece muy interesante el tema que quieres aprender.',
          },
          {
            senderId: tutorId,
            receiverId: studentId,
            content: 'Tengo amplia experiencia en esta materia. ¿Te gustaría que empecemos con una clase de introducción?',
          },
          {
            senderId: studentId,
            receiverId: tutorId,
            content: '¡Perfecto! Me interesa mucho. ¿Cuándo podemos empezar?',
          }
        ];

        for (const msgData of demoMessages) {
          await this.sendMessage(roomId, msgData.senderId, msgData.receiverId, msgData.content, requestId);
          // Pequeño delay para que los timestamps sean diferentes
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      console.error('Error creating demo messages:', error);
    }
  }
  // Promover mensaje a FAQ (Collaborative Core)
  async promoteToFAQ(message: ChatMessage, tags: string[], promotedBy: string): Promise<boolean> {
    try {
      // Guardar en Firestore (Repositorio de Conocimiento Persistente)
      await addDoc(collection(db, 'knowledge_base'), {
        question: message.content,
        answer: null, // To be filled by community
        originalMessageId: message.id,
        originalSenderId: message.senderId,
        promotedBy: promotedBy,
        tags: tags,
        votes: 0,
        createdAt: new Date(),
        status: 'pending_answer' // pending_answer, answered
      });

      console.log(`Knowledge Base: Message ${message.id} promoted to FAQ`);
      return true;
    } catch (error) {
      console.error('Error promoting to FAQ:', error);
      return false;
    }
  }
}

export const chatService = new ChatService();