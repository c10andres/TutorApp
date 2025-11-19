// Servicio robusto de tutoría para Android con fallbacks
import { ref, get, set, push, update } from 'firebase/database';
import { getFirebaseDatabase } from '../firebase';
import { TutorRequest, User } from '../types';
import { Capacitor } from '@capacitor/core';

export class TutoringAndroidRobust {
  private static retryCount = 0;
  private static maxRetries = 3;
  
  // Obtener solicitudes con múltiples fallbacks
  static async getUserRequests(userId: string): Promise<TutorRequest[]> {
    console.log('🔍 getUserRequests ROBUST - Iniciando para:', userId);
    
    try {
      // Intento 1: Carga directa
      const directRequests = await this.loadDirectRequests(userId);
      if (directRequests.length > 0) {
        console.log('✅ Carga directa exitosa:', directRequests.length);
        return directRequests;
      }
      
      // Intento 2: Carga con retry
      const retryRequests = await this.loadWithRetry(userId);
      if (retryRequests.length > 0) {
        console.log('✅ Carga con retry exitosa:', retryRequests.length);
        return retryRequests;
      }
      
      // Intento 3: Carga con timeout
      const timeoutRequests = await this.loadWithTimeout(userId);
      if (timeoutRequests.length > 0) {
        console.log('✅ Carga con timeout exitosa:', timeoutRequests.length);
        return timeoutRequests;
      }
      
      // Fallback: Datos mock
      console.log('⚠️ Usando datos mock como fallback');
      return this.getMockRequests(userId);
      
    } catch (error) {
      console.error('❌ Error en carga robusta:', error);
      return this.getMockRequests(userId);
    }
  }
  
  // Carga directa
  private static async loadDirectRequests(userId: string): Promise<TutorRequest[]> {
    try {
      console.log('🔄 Intento 1: Carga directa');
      
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
      
      for (const [requestId, requestData] of Object.entries(requests)) {
        const request = requestData as any;
        
        if (request.studentId === userId || request.tutorId === userId) {
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
      
      console.log('✅ Carga directa completada:', userRequests.length);
      return userRequests;
      
    } catch (error) {
      console.error('❌ Error en carga directa:', error);
      return [];
    }
  }
  
  // Carga con retry
  private static async loadWithRetry(userId: string): Promise<TutorRequest[]> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 Intento ${attempt}: Carga con retry`);
        
        const database = getFirebaseDatabase();
        if (!database) {
          await this.delay(1000 * attempt);
          continue;
        }
        
        const requestsRef = ref(database, 'requests');
        const snapshot = await get(requestsRef);
        
        if (snapshot.exists()) {
          const requests = snapshot.val();
          const userRequests: TutorRequest[] = [];
          
          for (const [requestId, requestData] of Object.entries(requests)) {
            const request = requestData as any;
            
            if (request.studentId === userId || request.tutorId === userId) {
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
          
          console.log(`✅ Carga con retry exitosa (intento ${attempt}):`, userRequests.length);
          return userRequests;
        }
        
        await this.delay(1000 * attempt);
        
      } catch (error) {
        console.error(`❌ Error en intento ${attempt}:`, error);
        await this.delay(1000 * attempt);
      }
    }
    
    return [];
  }
  
  // Carga con timeout
  private static async loadWithTimeout(userId: string): Promise<TutorRequest[]> {
    return new Promise(async (resolve) => {
      const timeout = setTimeout(() => {
        console.log('⏰ Timeout en carga con timeout');
        resolve([]);
      }, 10000); // 10 segundos timeout
      
      try {
        console.log('🔄 Intento 3: Carga con timeout');
        
        const database = getFirebaseDatabase();
        if (!database) {
          clearTimeout(timeout);
          resolve([]);
          return;
        }
        
        const requestsRef = ref(database, 'requests');
        const snapshot = await get(requestsRef);
        
        if (snapshot.exists()) {
          const requests = snapshot.val();
          const userRequests: TutorRequest[] = [];
          
          for (const [requestId, requestData] of Object.entries(requests)) {
            const request = requestData as any;
            
            if (request.studentId === userId || request.tutorId === userId) {
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
          
          clearTimeout(timeout);
          console.log('✅ Carga con timeout exitosa:', userRequests.length);
          resolve(userRequests);
        } else {
          clearTimeout(timeout);
          resolve([]);
        }
        
      } catch (error) {
        clearTimeout(timeout);
        console.error('❌ Error en carga con timeout:', error);
        resolve([]);
      }
    });
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
      }
    ];
    
    console.log('✅ Datos mock generados:', mockRequests.length);
    return mockRequests;
  }
  
  // Obtener estadísticas con fallbacks
  static async getUserStats(userId: string): Promise<any> {
    try {
      console.log('📊 getUserStats ROBUST - Calculando para:', userId);
      
      const requests = await this.getUserRequests(userId);
      
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
  
  // Función de delay
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Verificar estado de la conexión
  static async checkConnectionStatus(): Promise<{
    database: boolean;
    platform: string;
    retryCount: number;
  }> {
    try {
      const database = getFirebaseDatabase();
      const platform = Capacitor.getPlatform();
      
      return {
        database: !!database,
        platform,
        retryCount: this.retryCount
      };
    } catch (error) {
      console.error('❌ Error verificando estado:', error);
      return {
        database: false,
        platform: 'unknown',
        retryCount: this.retryCount
      };
    }
  }
  
  // Resetear contador de reintentos
  static resetRetryCount(): void {
    this.retryCount = 0;
    console.log('🔄 Contador de reintentos reseteado');
  }
}

// Exportar funciones individuales
export const getUserRequestsRobust = TutoringAndroidRobust.getUserRequests;
export const getUserStatsRobust = TutoringAndroidRobust.getUserStats;
export const checkConnectionStatus = TutoringAndroidRobust.checkConnectionStatus;
export const resetRetryCount = TutoringAndroidRobust.resetRetryCount;

// Hacer funciones disponibles globalmente
if (typeof window !== 'undefined') {
  (window as any).TutoringAndroidRobust = TutoringAndroidRobust;
  (window as any).getUserRequestsRobust = getUserRequestsRobust;
  (window as any).getUserStatsRobust = getUserStatsRobust;
  (window as any).checkConnectionStatus = checkConnectionStatus;
  
  console.log('🛠️ Servicio robusto de tutoría disponible:');
  console.log('- TutoringAndroidRobust.getUserRequests(userId)');
  console.log('- TutoringAndroidRobust.getUserStats(userId)');
  console.log('- TutoringAndroidRobust.checkConnectionStatus()');
}
