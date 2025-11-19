// Servicio de tutoría con carga directa para Android (como en web)
import { ref, get, set, push, update, remove } from 'firebase/database';
import { getFirebaseDatabase } from '../firebase';
import { TutorRequest, User } from '../types';
import { Capacitor } from '@capacitor/core';

export class TutoringDirectService {
  // Obtener solicitudes de un usuario directamente (sin verificación de conexión)
  static async getUserRequests(userId: string): Promise<TutorRequest[]> {
    try {
      console.log('🔍 getUserRequests DIRECT - Iniciando búsqueda para:', userId);
      console.log('📱 Entorno móvil:', Capacitor.isNativePlatform());
      console.log('🌐 Plataforma:', Capacitor.getPlatform());
      
      // Obtener instancia de database directamente
      const database = getFirebaseDatabase();
      if (!database) {
        console.error('❌ No se pudo obtener la instancia de Database');
        return [];
      }
      
      console.log('📊 Obteniendo solicitudes directamente de Firebase...');
      const requestsRef = ref(database, 'requests');
      const snapshot = await get(requestsRef);
      
      console.log('📊 Snapshot existe:', snapshot.exists());
      
      if (!snapshot.exists()) {
        console.log('❌ No hay solicitudes en Firebase');
        return [];
      }

      const requests = snapshot.val();
      console.log('📊 Total de solicitudes en Firebase:', Object.keys(requests).length);
      
      const userRequests: TutorRequest[] = [];
      
      // Filtrar solicitudes del usuario
      for (const [requestId, requestData] of Object.entries(requests)) {
        const request = requestData as any;
        
        // Verificar si la solicitud pertenece al usuario
        const isUserRequest = request.studentId === userId || request.tutorId === userId;
        
        if (isUserRequest) {
          console.log('📝 Solicitud encontrada:', requestId, request.subject, request.status);
          
          // Convertir fechas si son strings
          const processedRequest: TutorRequest = {
            ...request,
            id: requestId,
            createdAt: request.createdAt ? new Date(request.createdAt) : new Date(),
            updatedAt: request.updatedAt ? new Date(request.updatedAt) : new Date(),
            scheduledTime: request.scheduledTime ? new Date(request.scheduledTime) : new Date()
          };
          
          userRequests.push(processedRequest);
        }
      }
      
      console.log('✅ Solicitudes del usuario encontradas:', userRequests.length);
      return userRequests;
      
    } catch (error) {
      console.error('❌ Error obteniendo solicitudes directamente:', error);
      return [];
    }
  }
  
  // Obtener estadísticas del usuario directamente
  static async getUserStats(userId: string): Promise<any> {
    try {
      console.log('📊 getUserStats DIRECT - Calculando estadísticas para:', userId);
      
      // Obtener solicitudes del usuario
      const requests = await this.getUserRequests(userId);
      
      // Calcular estadísticas
      const stats = {
        totalRequests: requests.length,
        completedSessions: requests.filter(r => r.status === 'completed').length,
        totalEarnings: 0,
        averageRating: 0,
        activeStudents: 0,
        totalSpent: 0,
        thisMonthSessions: 0
      };
      
      // Calcular ganancias/gastos
      requests.forEach(request => {
        if (request.status === 'completed') {
          if (request.studentId === userId) {
            stats.totalSpent += request.totalAmount || 0;
          } else {
            stats.totalEarnings += request.totalAmount || 0;
          }
        }
      });
      
      // Calcular sesiones de este mes
      const thisMonth = new Date();
      thisMonth.setDate(1);
      stats.thisMonthSessions = requests.filter(r => 
        r.status === 'completed' && 
        new Date(r.createdAt) >= thisMonth
      ).length;
      
      console.log('📊 Estadísticas calculadas:', stats);
      return stats;
      
    } catch (error) {
      console.error('❌ Error calculando estadísticas:', error);
      return {
        totalRequests: 0,
        completedSessions: 0,
        totalEarnings: 0,
        averageRating: 0,
        activeStudents: 0,
        totalSpent: 0,
        thisMonthSessions: 0
      };
    }
  }
  
  // Crear solicitud directamente
  static async createRequest(requestData: Omit<TutorRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<TutorRequest> {
    try {
      console.log('🔍 createRequest DIRECT - Creando solicitud:', requestData);
      
      const database = getFirebaseDatabase();
      if (!database) {
        throw new Error('No se pudo obtener la instancia de Database');
      }
      
      // Crear la solicitud en Firebase
      const requestRef = ref(database, 'requests');
      const newRequestRef = push(requestRef);
      
      const request: TutorRequest = {
        id: newRequestRef.key!,
        ...requestData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await set(newRequestRef, {
        ...request,
        createdAt: request.createdAt.toISOString(),
        updatedAt: request.updatedAt.toISOString(),
        scheduledTime: request.scheduledTime.toISOString()
      });
      
      console.log('✅ Solicitud creada directamente:', request.id);
      return request;
      
    } catch (error) {
      console.error('❌ Error creando solicitud directamente:', error);
      throw new Error('Error al crear solicitud de tutoría');
    }
  }
  
  // Actualizar estado de solicitud directamente
  static async updateRequestStatus(requestId: string, status: string, tutorId?: string): Promise<void> {
    try {
      console.log('🔍 updateRequestStatus DIRECT - Actualizando solicitud:', requestId, 'a estado:', status);
      
      const database = getFirebaseDatabase();
      if (!database) {
        throw new Error('No se pudo obtener la instancia de Database');
      }
      
      // Actualizar en Firebase
      const requestRef = ref(database, `requests/${requestId}`);
      await update(requestRef, {
        status,
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Estado actualizado directamente');
      
    } catch (error) {
      console.error('❌ Error actualizando estado directamente:', error);
      throw new Error('Error al actualizar estado de solicitud');
    }
  }
  
  // Obtener solicitudes por estado directamente
  static async getRequestsByStatus(userId: string, status: string): Promise<TutorRequest[]> {
    try {
      console.log('🔍 getRequestsByStatus DIRECT - Buscando solicitudes:', status, 'para usuario:', userId);
      
      const allRequests = await this.getUserRequests(userId);
      const filteredRequests = allRequests.filter(request => request.status === status);
      
      console.log('📊 Solicitudes filtradas por estado:', filteredRequests.length);
      return filteredRequests;
      
    } catch (error) {
      console.error('❌ Error obteniendo solicitudes por estado:', error);
      return [];
    }
  }
  
  // Obtener solicitudes recientes directamente
  static async getRecentRequests(userId: string, limit: number = 5): Promise<TutorRequest[]> {
    try {
      console.log('🔍 getRecentRequests DIRECT - Obteniendo solicitudes recientes para:', userId);
      
      const allRequests = await this.getUserRequests(userId);
      
      // Ordenar por fecha de creación (más recientes primero)
      const sortedRequests = allRequests.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      const recentRequests = sortedRequests.slice(0, limit);
      console.log('📊 Solicitudes recientes obtenidas:', recentRequests.length);
      return recentRequests;
      
    } catch (error) {
      console.error('❌ Error obteniendo solicitudes recientes:', error);
      return [];
    }
  }
}

// Exportar funciones individuales para compatibilidad
export const getUserRequests = TutoringDirectService.getUserRequests;
export const getUserStats = TutoringDirectService.getUserStats;
export const createRequest = TutoringDirectService.createRequest;
export const updateRequestStatus = TutoringDirectService.updateRequestStatus;
export const getRequestsByStatus = TutoringDirectService.getRequestsByStatus;
export const getRecentRequests = TutoringDirectService.getRecentRequests;

// Hacer funciones disponibles globalmente para depuración
if (typeof window !== 'undefined') {
  (window as any).TutoringDirectService = TutoringDirectService;
  (window as any).getUserRequests = getUserRequests;
  (window as any).getUserStats = getUserStats;
  (window as any).createRequest = createRequest;
  (window as any).updateRequestStatus = updateRequestStatus;
  
  console.log('🛠️ Servicio de tutoría directo disponible:');
  console.log('- TutoringDirectService.getUserRequests()');
  console.log('- TutoringDirectService.getUserStats()');
  console.log('- TutoringDirectService.createRequest()');
  console.log('- TutoringDirectService.updateRequestStatus()');
}
