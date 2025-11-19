// Utilidad específica para manejar solicitudes en Android
import { EnvironmentDetector } from './environment-detector';
import { AndroidDataManager } from './android-data-manager';
import { TutorRequest } from '../types';

export class AndroidRequestsManager {
  // Inicializar datos de solicitudes para Android
  static async initializeRequestsData(): Promise<void> {
    try {
      console.log('🤖 Inicializando datos de solicitudes para Android...');
      
      // Inicializar localStorage con datos de solicitudes
      EnvironmentDetector.initializeLocalStorage('tutoring-requests', []);
      
      console.log('✅ Datos de solicitudes inicializados para Android');
    } catch (error) {
      console.error('❌ Error inicializando datos de solicitudes:', error);
    }
  }

  // Obtener solicitudes de forma inteligente
  static async getSmartRequests(
    userId: string,
    firebaseCallback: () => Promise<TutorRequest[]>
  ): Promise<TutorRequest[]> {
    try {
      console.log('🔍 getSmartRequests - Obteniendo solicitudes para:', userId);
      
      // Obtener datos de forma inteligente
      const allRequests = await AndroidDataManager.getSmartData(
        'tutoring-requests',
        firebaseCallback,
        this.getMockRequests() // Mock data como fallback
      );
      
      // Filtrar solicitudes del usuario actual
      const userRequests = allRequests.filter((req: any) => {
        const isTutor = String(req.tutorId) === String(userId);
        const isStudent = String(req.studentId) === String(userId);
        return isTutor || isStudent;
      });
      
      console.log('✅ Solicitudes filtradas para el usuario:', userRequests.length);
      return userRequests;
    } catch (error) {
      console.error('❌ Error obteniendo solicitudes inteligentes:', error);
      return this.getMockRequests();
    }
  }

  // Guardar solicitud en localStorage
  static async saveRequestToLocalStorage(request: TutorRequest): Promise<boolean> {
    try {
      console.log('💾 Guardando solicitud en localStorage:', request.id);
      
      const existingRequests = EnvironmentDetector.getLocalStorageItem('tutoring-requests', []);
      const updatedRequests = [...existingRequests, request];
      
      const saved = EnvironmentDetector.setLocalStorageItem('tutoring-requests', updatedRequests);
      
      if (saved) {
        console.log('✅ Solicitud guardada en localStorage');
        return true;
      } else {
        console.warn('⚠️ No se pudo guardar en localStorage');
        return false;
      }
    } catch (error) {
      console.error('❌ Error guardando solicitud en localStorage:', error);
      return false;
    }
  }

  // Actualizar solicitud en localStorage
  static async updateRequestInLocalStorage(
    requestId: string, 
    updates: Partial<TutorRequest>
  ): Promise<boolean> {
    try {
      console.log('🔄 Actualizando solicitud en localStorage:', requestId);
      
      const existingRequests = EnvironmentDetector.getLocalStorageItem('tutoring-requests', []);
      const updatedRequests = existingRequests.map((req: any) => 
        req.id === requestId 
          ? { ...req, ...updates, updatedAt: new Date().toISOString() }
          : req
      );
      
      const saved = EnvironmentDetector.setLocalStorageItem('tutoring-requests', updatedRequests);
      
      if (saved) {
        console.log('✅ Solicitud actualizada en localStorage');
        return true;
      } else {
        console.warn('⚠️ No se pudo actualizar en localStorage');
        return false;
      }
    } catch (error) {
      console.error('❌ Error actualizando solicitud en localStorage:', error);
      return false;
    }
  }

  // Eliminar solicitud de localStorage
  static async deleteRequestFromLocalStorage(requestId: string): Promise<boolean> {
    try {
      console.log('🗑️ Eliminando solicitud de localStorage:', requestId);
      
      const existingRequests = EnvironmentDetector.getLocalStorageItem('tutoring-requests', []);
      const updatedRequests = existingRequests.filter((req: any) => req.id !== requestId);
      
      const saved = EnvironmentDetector.setLocalStorageItem('tutoring-requests', updatedRequests);
      
      if (saved) {
        console.log('✅ Solicitud eliminada de localStorage');
        return true;
      } else {
        console.warn('⚠️ No se pudo eliminar de localStorage');
        return false;
      }
    } catch (error) {
      console.error('❌ Error eliminando solicitud de localStorage:', error);
      return false;
    }
  }

  // Sincronizar solicitudes entre localStorage y Firebase
  static async syncRequestsWithFirebase(
    firebaseCallback: () => Promise<TutorRequest[]>
  ): Promise<TutorRequest[]> {
    try {
      console.log('🔄 Sincronizando solicitudes con Firebase...');
      
      // Obtener datos de ambas fuentes
      const localRequests = EnvironmentDetector.getLocalStorageItem('tutoring-requests', []);
      const firebaseRequests = await firebaseCallback();
      
      // Combinar datos (localStorage tiene prioridad)
      const combinedRequests = [...localRequests];
      firebaseRequests.forEach(req => {
        if (!combinedRequests.find(localReq => localReq.id === req.id)) {
          combinedRequests.push(req);
        }
      });
      
      // Guardar datos combinados
      EnvironmentDetector.setLocalStorageItem('tutoring-requests', combinedRequests);
      
      console.log('✅ Solicitudes sincronizadas:', combinedRequests.length);
      return combinedRequests;
    } catch (error) {
      console.error('❌ Error sincronizando solicitudes:', error);
      return [];
    }
  }

  // Obtener estadísticas de solicitudes
  static getRequestsStats(requests: TutorRequest[]): {
    total: number;
    pending: number;
    accepted: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    rejected: number;
  } {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      accepted: requests.filter(r => r.status === 'accepted').length,
      inProgress: requests.filter(r => r.status === 'in_progress').length,
      completed: requests.filter(r => r.status === 'completed').length,
      cancelled: requests.filter(r => r.status === 'cancelled').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
    };
  }

  // Datos mock para solicitudes
  private static getMockRequests(): TutorRequest[] {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return [
      {
        id: 'mock-request-1',
        studentId: 'mock-student-1',
        tutorId: 'mock-1',
        studentName: 'Santiago Herrera Díaz',
        tutorName: 'María González Ruiz',
        subject: 'Cálculo Diferencial',
        description: 'Necesito ayuda con límites y derivadas. Tengo examen la próxima semana.',
        hourlyRate: 35000,
        duration: 90,
        totalAmount: 57750,
        status: 'pending',
        isImmediate: false,
        scheduledTime: tomorrow,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'mock-request-2',
        studentId: 'mock-student-2',
        tutorId: 'mock-2',
        studentName: 'Valeria Morales Gómez',
        tutorName: 'Carlos Mendoza López',
        subject: 'Biología',
        description: 'Preparación para examen de anatomía. Necesito repasar el sistema cardiovascular.',
        hourlyRate: 40000,
        duration: 120,
        totalAmount: 88000,
        status: 'accepted',
        isImmediate: false,
        scheduledTime: nextWeek,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000)
      },
      {
        id: 'mock-request-3',
        studentId: 'mock-student-1',
        tutorId: 'mock-3',
        studentName: 'Santiago Herrera Díaz',
        tutorName: 'Ana Sofía Vargas',
        subject: 'Inglés Conversacional',
        description: 'Práctica de conversación en inglés para mejorar fluidez.',
        hourlyRate: 30000,
        duration: 60,
        totalAmount: 33000,
        status: 'completed',
        isImmediate: false,
        scheduledTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        hasReview: true
      }
    ];
  }
}
