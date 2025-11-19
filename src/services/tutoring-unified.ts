// Servicio unificado de tutoría para todas las plataformas
import { ref, get, set, push, update } from 'firebase/database';
import { getFirebaseDatabase, checkFirebaseConnection } from '../firebase';
import { TutorRequest, User } from '../types';
import { Capacitor } from '@capacitor/core';

export class TutoringUnifiedService {
  private static retryCount = 0;
  private static maxRetries = 3;
  
  // Obtener solicitudes con estrategia unificada
  static async getUserRequests(userId: string): Promise<TutorRequest[]> {
    console.log('🔍 getUserRequests UNIFIED - Iniciando para:', userId);
    console.log('📱 Plataforma:', Capacitor.getPlatform());
    
    try {
      // Verificar conexión a Firebase
      const isConnected = await checkFirebaseConnection();
      if (!isConnected) {
        console.warn('⚠️ Firebase no conectado, retornando array vacío');
        return [];
      }
      
      // Cargar datos de Firebase
      const requests = await this.loadFromFirebase(userId);
      console.log('✅ Datos cargados de Firebase:', requests.length);
      return requests;
      
    } catch (error) {
      console.error('❌ Error cargando solicitudes:', error);
      return [];
    }
  }
  
  // Cargar datos desde Firebase
  private static async loadFromFirebase(userId: string): Promise<TutorRequest[]> {
    try {
      const database = getFirebaseDatabase();
      if (!database) {
        throw new Error('Database no disponible');
      }
      
      const requestsRef = ref(database, 'requests');
      const snapshot = await get(requestsRef);
      
      if (!snapshot.exists()) {
        console.log('❌ No hay datos en Firebase');
        return [];
      }
      
      const requests = snapshot.val();
      const userRequests: TutorRequest[] = [];
      
      console.log('🔍 Procesando solicitudes de Firebase para usuario:', userId);
      console.log('📊 Total de solicitudes en Firebase:', Object.keys(requests).length);
      
      for (const [requestId, requestData] of Object.entries(requests)) {
        const request = requestData as any;
        
        // Debug: Log de cada solicitud
        console.log(`🔍 Procesando solicitud ${requestId}:`, {
          studentId: request.studentId,
          tutorId: request.tutorId,
          status: request.status,
          userId: userId,
          matches: request.studentId === userId || request.tutorId === userId
        });
        
        if (request.studentId === userId || request.tutorId === userId) {
          const processedRequest: TutorRequest = {
            ...request,
            id: requestId,
            createdAt: request.createdAt ? new Date(request.createdAt) : new Date(),
            updatedAt: request.updatedAt ? new Date(request.updatedAt) : new Date(),
            scheduledTime: request.scheduledTime ? new Date(request.scheduledTime) : new Date()
          };
          
          console.log(`✅ Solicitud ${requestId} agregada para usuario ${userId}. Estado: ${processedRequest.status}`);
          userRequests.push(processedRequest);
        }
      }
      
      console.log('✅ Solicitudes cargadas de Firebase:', userRequests.length);
      console.log('📋 Estados de solicitudes:', userRequests.map(r => ({ id: r.id, status: r.status })));
      return userRequests;
      
    } catch (error) {
      console.error('❌ Error cargando de Firebase:', error);
      return [];
    }
  }
  
  // Obtener estadísticas con estrategia unificada
  static async getUserStats(userId: string): Promise<any> {
    try {
      console.log('📊 getUserStats UNIFIED - Calculando para:', userId);
      
      const requests = await this.getUserRequests(userId);
      console.log('📊 Solicitudes obtenidas para estadísticas:', requests.length);
      
      const stats = {
        totalRequests: requests.length,
        completedSessions: requests.filter(r => r.status === 'completed').length,
        totalEarnings: 0,
        averageRating: 4.5,
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
      
      // Calcular estudiantes únicos (solo cuando soy tutor)
      const myTutorRequests = requests.filter(req => req.tutorId === userId);
      const acceptedOrCompletedRequests = myTutorRequests.filter(req => 
        req.status === 'accepted' || req.status === 'completed'
      );
      const uniqueStudents = new Set(acceptedOrCompletedRequests.map(req => req.studentId));
      stats.activeStudents = uniqueStudents.size;
      
      console.log('✅ Estadísticas calculadas:', stats);
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
  
  // Datos mock como fallback
  private static getMockRequests(userId: string): TutorRequest[] {
    console.log('📝 Generando datos mock para:', userId);
    
    const mockRequests: TutorRequest[] = [
      {
        id: 'mock-1',
        studentId: userId,
        tutorId: 'tutor-1',
        studentName: 'Usuario Demo',
        tutorName: 'Tutor Demo',
        subject: 'Matemáticas',
        description: 'Necesito ayuda con cálculo diferencial',
        duration: 60,
        totalAmount: 25000,
        status: 'pending',
        isImmediate: false,
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mock-2',
        studentId: userId,
        tutorId: 'tutor-2',
        studentName: 'Usuario Demo',
        tutorName: 'Tutor Demo 2',
        subject: 'Física',
        description: 'Ayuda con mecánica clásica',
        duration: 90,
        totalAmount: 35000,
        status: 'accepted',
        isImmediate: false,
        scheduledTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mock-3',
        studentId: userId,
        tutorId: 'tutor-3',
        studentName: 'Usuario Demo',
        tutorName: 'Tutor Demo 3',
        subject: 'Química',
        description: 'Ayuda con química orgánica',
        duration: 120,
        totalAmount: 45000,
        status: 'completed',
        isImmediate: false,
        scheduledTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    console.log('✅ Datos mock generados:', mockRequests.length);
    return mockRequests;
  }
  
  // Verificar estado de la conexión
  static async checkConnectionStatus(): Promise<{
    database: boolean;
    platform: string;
    connected: boolean;
  }> {
    try {
      const database = getFirebaseDatabase();
      const platform = Capacitor.getPlatform();
      const connected = await checkFirebaseConnection();
      
      return {
        database: !!database,
        platform,
        connected
      };
    } catch (error) {
      console.error('❌ Error verificando estado:', error);
      return {
        database: false,
        platform: 'unknown',
        connected: false
      };
    }
  }
  
  // Crear solicitud de tutoría
  static async createRequest(requestData: Omit<TutorRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<TutorRequest> {
    try {
      console.log('🔍 createRequest UNIFIED - Creando solicitud:', requestData);
      
      // Verificar conexión a Firebase
      const isConnected = await checkFirebaseConnection();
      if (!isConnected) {
        console.warn('⚠️ Firebase no conectado, creando solicitud local');
        return this.createLocalRequest(requestData);
      }
      
      // Crear en Firebase
      const database = getFirebaseDatabase();
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
        updatedAt: request.updatedAt.toISOString()
      });
  
      console.log('✅ Solicitud creada en Firebase:', request.id);
      return request;
      
    } catch (error) {
      console.error('❌ Error creando solicitud:', error);
      return this.createLocalRequest(requestData);
    }
  }
  
  // Crear solicitud local como fallback
  private static createLocalRequest(requestData: Omit<TutorRequest, 'id' | 'createdAt' | 'updatedAt'>): TutorRequest {
    const request: TutorRequest = {
      id: `local_${Date.now()}`,
      ...requestData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('📝 Solicitud creada localmente:', request.id);
    return request;
  }
  
  // Actualizar estado de solicitud
  static async updateRequestStatus(requestId: string, status: string, tutorId?: string): Promise<void> {
    try {
      console.log('🔍 updateRequestStatus UNIFIED - Actualizando:', requestId, 'a estado:', status);
      
      // Verificar conexión a Firebase
      const isConnected = await checkFirebaseConnection();
      if (!isConnected) {
        console.warn('⚠️ Firebase no conectado, actualización local');
        return;
      }
      
      // Actualizar en Firebase
      const database = getFirebaseDatabase();
      const requestRef = ref(database, `requests/${requestId}`);
      
      // Primero verificar que la solicitud existe
      const snapshot = await get(requestRef);
      if (!snapshot.exists()) {
        console.error('❌ Solicitud no encontrada:', requestId);
        throw new Error('Solicitud no encontrada');
      }
      
      // Actualizar con timestamp
      const updateData = {
        status,
        updatedAt: new Date().toISOString()
      };
      
      await update(requestRef, updateData);
      
      // Verificar que la actualización se guardó correctamente
      const updatedSnapshot = await get(requestRef);
      const updatedData = updatedSnapshot.val();
      
      if (updatedData && updatedData.status === status) {
        console.log('✅ Solicitud actualizada correctamente en Firebase:', requestId, 'Estado:', status);
      } else {
        console.error('❌ Error: La actualización no se reflejó correctamente');
        throw new Error('Error al actualizar el estado de la solicitud');
      }
      
    } catch (error) {
      console.error('❌ Error actualizando solicitud:', error);
      throw error; // Re-lanzar el error para que se maneje en el componente
    }
  }
}

// Exportar funciones individuales
export const getUserRequestsUnified = TutoringUnifiedService.getUserRequests;
export const getUserStatsUnified = TutoringUnifiedService.getUserStats;
export const createRequestUnified = TutoringUnifiedService.createRequest;
export const updateRequestStatusUnified = TutoringUnifiedService.updateRequestStatus;
export const checkConnectionStatusUnified = TutoringUnifiedService.checkConnectionStatus;

// Hacer funciones disponibles globalmente
if (typeof window !== 'undefined') {
  (window as any).TutoringUnifiedService = TutoringUnifiedService;
  (window as any).getUserRequestsUnified = getUserRequestsUnified;
  (window as any).getUserStatsUnified = getUserStatsUnified;
  (window as any).createRequestUnified = createRequestUnified;
  (window as any).updateRequestStatusUnified = updateRequestStatusUnified;
  (window as any).checkConnectionStatusUnified = checkConnectionStatusUnified;
  
  console.log('🛠️ Servicio unificado de tutoría disponible:');
  console.log('- TutoringUnifiedService.getUserRequests(userId)');
  console.log('- TutoringUnifiedService.getUserStats(userId)');
  console.log('- TutoringUnifiedService.createRequest(requestData)');
  console.log('- TutoringUnifiedService.updateRequestStatus(requestId, status)');
  console.log('- TutoringUnifiedService.checkConnectionStatus()');
}
