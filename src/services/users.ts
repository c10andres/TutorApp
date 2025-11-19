// Servicio para gestión de usuarios con Firebase
import { ref, get, set, update, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../firebase';
import { User } from '../types';
import { FirebaseFallbackManager } from '../utils/firebase-fallback';
import { safeFormatDate } from '../utils/dateUtils';
import { Capacitor } from '@capacitor/core';
import { EnvironmentDetector } from '../utils/environment-detector';
import { AndroidDataManager } from '../utils/android-data-manager';
import { checkFirebaseConnection, initializeFirebaseData, getFirebaseDatabase } from '../firebase';

class UsersService {
  // Detectar si estamos en entorno móvil
  private isMobileEnvironment(): boolean {
    return Capacitor.isNativePlatform();
  }
  // Obtener datos de un usuario por ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      console.log('🔍 getUserById - Iniciando búsqueda para:', userId);
      console.log('📱 Entorno móvil:', this.isMobileEnvironment());
      
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        console.log('❌ Usuario no encontrado en Firebase, buscando mock...');
        // Si no existe en Firebase, verificar si es un usuario mock
        const mockUser = this.getMockUserById(userId);
        if (mockUser) {
          console.log('✅ Usuario mock encontrado:', mockUser.name);
          return mockUser;
        }
        console.log('❌ Usuario mock tampoco encontrado');
        return null;
      }

      const userData = snapshot.val();
      console.log('✅ Usuario encontrado en Firebase:', userData.name);
      
      const processedUser = {
        ...userData,
        createdAt: new Date(userData.createdAt),
        updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : undefined,
      };
      
      return processedUser;
    } catch (error) {
      console.error('❌ Error getting user:', error);
      // En caso de error, intentar obtener usuario mock
      const mockUser = this.getMockUserById(userId);
      if (mockUser) {
        console.log('✅ Fallback a usuario mock:', mockUser.name);
        return mockUser;
      }
      return null;
    }
  }

  // Obtener múltiples usuarios por IDs
  async getUsersByIds(userIds: string[]): Promise<Record<string, User>> {
    try {
      console.log('🔍 getUsersByIds - Buscando usuarios:', userIds);
      const users: Record<string, User> = {};
      
      const promises = userIds.map(async (userId) => {
        const user = await this.getUserById(userId);
        if (user) {
          users[userId] = user;
        }
      });

      await Promise.all(promises);
      console.log('✅ Usuarios encontrados:', Object.keys(users).length);
      return users;
    } catch (error) {
      console.error('❌ Error getting users:', error);
      // En caso de error, intentar obtener usuarios mock
      const users: Record<string, User> = {};
      userIds.forEach(userId => {
        const mockUser = this.getMockUserById(userId);
        if (mockUser) {
          users[userId] = mockUser;
        }
      });
      return users;
    }
  }

  // Actualizar datos básicos del usuario
  async updateUserBasicInfo(userId: string, data: Partial<User>): Promise<void> {
    try {
      const userRef = ref(database, `users/${userId}`);
      const updates = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      await update(userRef, updates);
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Error al actualizar usuario');
    }
  }

  // Buscar usuarios por email o nombre
  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (!snapshot.exists()) {
        return [];
      }

      const users = snapshot.val();
      const searchResults: User[] = [];
      const searchTerm = query.toLowerCase();

      Object.keys(users).forEach(userId => {
        const userData = users[userId];
        const userName = userData.name?.toLowerCase() || '';
        const userEmail = userData.email?.toLowerCase() || '';
        
        if (userName.includes(searchTerm) || userEmail.includes(searchTerm)) {
          searchResults.push({
            ...userData,
            createdAt: new Date(userData.createdAt),
            updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : undefined,
          });
        }
      });

      return searchResults.slice(0, limit);
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  // Obtener estadísticas del usuario (para dashboard)
  async getUserStats(userId: string): Promise<{
    totalRequests: number;
    completedSessions: number;
    totalEarnings: number;
    averageRating: number;
    activeStudents: number;
    monthlyStats: {
      requests: number;
      earnings: number;
      sessions: number;
    };
  }> {
    try {
      console.log('🔍 CALCULANDO ESTADÍSTICAS PARA USUARIO:', userId);
      console.log('📱 Entorno móvil:', this.isMobileEnvironment());
      console.log('🌐 Plataforma:', Capacitor.getPlatform());
      
      // Usar el servicio unificado de tutoring (misma lógica que las solicitudes)
      const { TutoringUnifiedService } = await import('./tutoring-unified');
      const unifiedStats = await TutoringUnifiedService.getUserStats(userId);
      
      console.log('✅ Estadísticas obtenidas del servicio unificado:', unifiedStats);
      
      // Convertir a formato esperado por la HomePage
      const stats = {
        totalRequests: unifiedStats.totalRequests || 0,
        completedSessions: unifiedStats.completedSessions || 0,
        totalEarnings: unifiedStats.totalEarnings || 0,
        averageRating: unifiedStats.averageRating || 0,
        activeStudents: unifiedStats.activeStudents || 0,
        monthlyStats: {
          requests: unifiedStats.thisMonthSessions || 0,
          earnings: unifiedStats.totalEarnings || 0,
          sessions: unifiedStats.thisMonthSessions || 0,
        }
      };
      
      console.log('📊 ESTADÍSTICAS FINALES CALCULADAS:', stats);
      return stats;
      
    } catch (error) {
      console.error('❌ Error calculating user stats:', error);
      
      // En caso de error completo, devolver estadísticas en 0
      return {
        totalRequests: 0,
        completedSessions: 0,
        totalEarnings: 0,
        averageRating: 0,
        activeStudents: 0,
        monthlyStats: {
          requests: 0,
          earnings: 0,
          sessions: 0,
        }
      };
    }
  }



  // Obtener tutores recomendados para un estudiante
  async getRecommendedTutors(studentId: string, limit: number = 6): Promise<User[]> {
    try {
      console.log('🔍 getRecommendedTutors - Buscando tutores para:', studentId);
      console.log('📱 Entorno móvil:', this.isMobileEnvironment());
      
      // Usar Firebase directamente para todas las plataformas
      const { checkFirebaseConnection } = await import('../firebase');
      const isFirebaseConnected = await checkFirebaseConnection();
      console.log('🔥 Firebase conectado:', isFirebaseConnected);
      
      if (!isFirebaseConnected) {
        console.error('❌ Firebase no conectado, lanzando error');
        throw new Error('Firebase no está conectado');
      }
      
      // Cargar datos de Firebase usando la misma lógica para todas las plataformas
      const database = getFirebaseDatabase();
      if (!database) {
        console.error('❌ Database no disponible');
        throw new Error('Database no está disponible');
      }
      
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (!snapshot.exists()) {
        console.log('❌ No hay usuarios en Firebase');
        throw new Error('No hay usuarios en Firebase');
      }

      const users = snapshot.val();
      const tutors: User[] = [];

      Object.keys(users).forEach(userId => {
        const userData = users[userId];
        // Solo incluir usuarios que pueden ser tutores y están disponibles
        if (userData.subjects && userData.subjects.length > 0 && userData.availability) {
          tutors.push({
            ...userData,
            createdAt: new Date(userData.createdAt),
            updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : undefined,
          });
        }
      });

      // Ordenar por rating y disponibilidad
      tutors.sort((a, b) => {
        if (a.availability && !b.availability) return -1;
        if (!a.availability && b.availability) return 1;
        return (b.rating || 0) - (a.rating || 0);
      });

      console.log(`✅ ${tutors.length} tutores recomendados encontrados desde Firebase`);
      return tutors.slice(0, limit);
    } catch (error) {
      console.error('❌ Error getting recommended tutors from Firebase:', error);
      throw error; // Lanzar el error en lugar de usar fallback
    }
  }

  // Obtener usuario mock por ID
  private getMockUserById(userId: string): User | null {
    const mockUsers = this.getMockUsers();
    return mockUsers.find(user => user.id === userId) || null;
  }

  // Obtener tutores mock
  private getMockTutors(): User[] {
    return this.getMockUsers().filter(user => user.currentMode === 'tutor');
  }

  // Datos mock de usuarios que coinciden con los tutores mock del servicio de tutoring
  private getMockUsers(): User[] {
    return [
      {
        id: 'mock-1',
        name: 'María González Ruiz',
        email: 'maria.gonzalez@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9c5b6e8?w=150',
        bio: 'Ingeniera matemática con 8 años de experiencia enseñando cálculo, álgebra y estadística. Especializada en preparación para exámenes ICFES y Saber Pro.',
        subjects: ['Cálculo Diferencial', 'Cálculo Integral', 'Álgebra', 'Estadística', 'Preparación ICFES Saber 11'],
        education: 'Ingeniería Matemática - Universidad Nacional de Colombia',
        location: 'Bogotá, Cundinamarca',
        university: 'Universidad Nacional de Colombia',
        semester: 'Graduada',
        career: 'Ingeniería Matemática',
        hourlyRate: 35000,
        rating: 4.9,
        reviewsCount: 127,
        totalHours: 856,
        responseTime: '10 min',
        availability: true,
        languages: ['Español', 'Inglés'],
        currentMode: 'tutor',
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: 'mock-2',
        name: 'Carlos Mendoza López',
        email: 'carlos.mendoza@example.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        bio: 'Médico especialista en educación científica. 6 años ayudando estudiantes con biología, química y anatomía. Enfoque en aprendizaje visual y casos clínicos.',
        subjects: ['Biología', 'Anatomía', 'Fisiología', 'Química Orgánica', 'Preparación exámenes medicina'],
        education: 'Medicina - Universidad del Rosario',
        location: 'Medellín, Antioquia',
        university: 'Universidad del Rosario',
        semester: 'Graduado',
        career: 'Medicina',
        hourlyRate: 40000,
        rating: 4.8,
        reviewsCount: 94,
        totalHours: 642,
        responseTime: '15 min',
        availability: true,
        languages: ['Español'],
        currentMode: 'tutor',
        createdAt: new Date('2023-03-22'),
        updatedAt: new Date('2024-01-10'),
      },
      {
        id: 'mock-3',
        name: 'Ana Sofía Vargas',
        email: 'ana.vargas@example.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        bio: 'Profesora de idiomas certificada con 5 años de experiencia. Especializada en inglés conversacional, TOEFL, IELTS y preparación para certificaciones internacionales.',
        subjects: ['Inglés Conversacional', 'TOEFL', 'IELTS', 'Business English', 'Gramática Inglesa'],
        education: 'Lenguas Modernas - Universidad Javeriana',
        location: 'Cali, Valle del Cauca',
        university: 'Universidad Javeriana',
        semester: 'Graduada',
        career: 'Lenguas Modernas',
        hourlyRate: 30000,
        rating: 4.9,
        reviewsCount: 156,
        totalHours: 1024,
        responseTime: '5 min',
        availability: true,
        languages: ['Español', 'Inglés', 'Francés'],
        currentMode: 'tutor',
        createdAt: new Date('2023-02-10'),
        updatedAt: new Date('2024-01-12'),
      },
      {
        id: 'mock-4',
        name: 'David Ramírez Castro',
        email: 'david.ramirez@example.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        bio: 'Ingeniero de sistemas con maestría en IA. 7 años enseñando programación, algoritmos y desarrollo web. Experto en Python, JavaScript y bases de datos.',
        subjects: ['Python', 'JavaScript', 'Algoritmos', 'Bases de Datos', 'Desarrollo Web', 'Inteligencia Artificial'],
        education: 'Ingeniería de Sistemas - Universidad de los Andes',
        location: 'Bogotá, Cundinamarca',
        university: 'Universidad de los Andes',
        semester: 'Graduado',
        career: 'Ingeniería de Sistemas',
        hourlyRate: 45000,
        rating: 4.7,
        reviewsCount: 89,
        totalHours: 578,
        responseTime: '20 min',
        availability: true,
        languages: ['Español', 'Inglés'],
        currentMode: 'tutor',
        createdAt: new Date('2023-04-05'),
        updatedAt: new Date('2024-01-08'),
      },
      {
        id: 'mock-5',
        name: 'Laura Henao Suárez',
        email: 'laura.henao@example.com',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        bio: 'Contadora pública con especialización en finanzas. 4 años ayudando con contabilidad, estadística y matemáticas financieras. Metodología práctica con casos reales.',
        subjects: ['Contabilidad', 'Matemáticas Financieras', 'Estadística', 'Costos', 'Finanzas'],
        education: 'Contaduría Pública - Universidad EAFIT',
        location: 'Medellín, Antioquia',
        university: 'Universidad EAFIT',
        semester: 'Graduada',
        career: 'Contaduría Pública',
        hourlyRate: 32000,
        rating: 4.8,
        reviewsCount: 73,
        totalHours: 445,
        responseTime: '12 min',
        availability: true,
        languages: ['Español'],
        currentMode: 'tutor',
        createdAt: new Date('2023-05-18'),
        updatedAt: new Date('2024-01-14'),
      },
      {
        id: 'mock-student-1',
        name: 'Santiago Herrera Díaz',
        email: 'santiago.herrera@example.com',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
        bio: 'Estudiante de Ingeniería Industrial en 6to semestre. Busco apoyo en cálculo y estadística.',
        subjects: [],
        education: 'Estudiante de Ingeniería Industrial',
        location: 'Barranquilla, Atlántico',
        university: 'Universidad del Norte',
        semester: '6',
        career: 'Ingeniería Industrial',
        hourlyRate: 0,
        rating: 0,
        reviewsCount: 0,
        totalHours: 0,
        responseTime: '30 min',
        availability: false,
        languages: ['Español'],
        currentMode: 'student',
        createdAt: new Date('2023-08-20'),
        updatedAt: new Date('2024-01-05'),
      },
      {
        id: 'mock-student-2',
        name: 'Valeria Morales Gómez',
        email: 'valeria.morales@example.com',
        avatar: 'https://images.unsplash.com/photo-1488508872907-592763824245?w=150',
        bio: 'Estudiante de Medicina en 4to semestre. Necesito ayuda con biología y química orgánica.',
        subjects: [],
        education: 'Estudiante de Medicina',
        location: 'Cali, Valle del Cauca',
        university: 'Universidad Icesi',
        semester: '4',
        career: 'Medicina',
        hourlyRate: 0,
        rating: 0,
        reviewsCount: 0,
        totalHours: 0,
        responseTime: '45 min',
        availability: false,
        languages: ['Español', 'Inglés'],
        currentMode: 'student',
        createdAt: new Date('2023-09-12'),
        updatedAt: new Date('2024-01-03'),
      },
    ];
  }
}

export const usersService = new UsersService();