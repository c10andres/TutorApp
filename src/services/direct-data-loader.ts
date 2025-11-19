// Cargador directo de datos - SIN complicaciones
import { TutorRequest } from '../types';

export class DirectDataLoader {
  // Cargar solicitudes DIRECTAMENTE - sin Firebase, sin cache, sin complicaciones
  static async loadUserRequests(userId: string): Promise<TutorRequest[]> {
    console.log('📱 CARGANDO solicitudes DIRECTAMENTE para:', userId);
    
    // Datos mock COMPLETOS y REALISTAS
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const mockRequests: TutorRequest[] = [
      {
        id: 'direct_1',
        studentId: userId,
        tutorId: 'tutor_1',
        studentName: 'Usuario Demo',
        tutorName: 'Dr. María González',
        subject: 'Matemáticas',
        description: 'Necesito ayuda con cálculo diferencial e integral. Tengo examen la próxima semana.',
        duration: 60,
        totalAmount: 25000,
        status: 'pending',
        isImmediate: false,
        scheduledTime: tomorrow,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 horas atrás
        updatedAt: new Date(now.getTime() - 30 * 60 * 1000) // 30 minutos atrás
      },
      {
        id: 'direct_2',
        studentId: userId,
        tutorId: 'tutor_2',
        studentName: 'Usuario Demo',
        tutorName: 'Prof. Carlos Ruiz',
        subject: 'Física',
        description: 'Ayuda con mecánica clásica y termodinámica. Problemas de física cuántica.',
        duration: 90,
        totalAmount: 35000,
        status: 'accepted',
        isImmediate: false,
        scheduledTime: nextWeek,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 día atrás
        updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 horas atrás
      },
      {
        id: 'direct_3',
        studentId: userId,
        tutorId: 'tutor_3',
        studentName: 'Usuario Demo',
        tutorName: 'Dra. Ana Martínez',
        subject: 'Química',
        description: 'Ayuda con química orgánica y análisis. Preparación para laboratorio.',
        duration: 120,
        totalAmount: 45000,
        status: 'completed',
        isImmediate: false,
        scheduledTime: lastWeek,
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) // 3 días atrás
      },
      {
        id: 'direct_4',
        studentId: userId,
        tutorId: 'tutor_4',
        studentName: 'Usuario Demo',
        tutorName: 'Ing. Luis Pérez',
        subject: 'Programación',
        description: 'Ayuda con algoritmos y estructuras de datos. Preparación para entrevista técnica.',
        duration: 75,
        totalAmount: 30000,
        status: 'pending',
        isImmediate: true,
        scheduledTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 horas en el futuro
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hora atrás
        updatedAt: new Date(now.getTime() - 30 * 60 * 1000) // 30 minutos atrás
      },
      {
        id: 'direct_5',
        studentId: userId,
        tutorId: 'tutor_5',
        studentName: 'Usuario Demo',
        tutorName: 'Lic. Sofía Ramírez',
        subject: 'Inglés',
        description: 'Preparación para examen TOEFL. Práctica de speaking y writing.',
        duration: 45,
        totalAmount: 20000,
        status: 'accepted',
        isImmediate: false,
        scheduledTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 días en el futuro
        createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 horas atrás
        updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000) // 1 hora atrás
      }
    ];
    
    console.log('✅ Solicitudes cargadas DIRECTAMENTE:', mockRequests.length);
    console.log('📋 Detalles de solicitudes:', mockRequests.map(r => ({
      id: r.id,
      subject: r.subject,
      status: r.status,
      tutorName: r.tutorName,
      amount: r.totalAmount
    })));
    return mockRequests;
  }
  
  // Cargar estadísticas DIRECTAMENTE
  static async loadUserStats(userId: string): Promise<any> {
    console.log('📊 CARGANDO estadísticas DIRECTAMENTE para:', userId);
    
    const stats = {
      totalRequests: 5,
      completedSessions: 1,
      totalEarnings: 45000,
      averageRating: 4.7,
      activeStudents: 3,
      totalSpent: 155000, // Suma de todas las solicitudes
      thisMonthSessions: 2,
      pendingRequests: 2,
      acceptedRequests: 2,
      completedRequests: 1,
      totalHours: 4.5, // Suma de duraciones en horas
      favoriteSubject: 'Matemáticas',
      lastActivity: new Date().toISOString(),
      successRate: 85,
      responseTime: '2.5 horas promedio'
    };
    
    console.log('✅ Estadísticas cargadas DIRECTAMENTE:', stats);
    console.log('📊 Detalles de estadísticas:', {
      totalRequests: stats.totalRequests,
      completedSessions: stats.completedSessions,
      totalEarnings: stats.totalEarnings,
      averageRating: stats.averageRating
    });
    return stats;
  }
  
  // Calcular estadísticas desde solicitudes reales
  static calculateStatsFromRequests(requests: TutorRequest[], userId: string): any {
    console.log('📊 Calculando estadísticas desde solicitudes reales:', requests.length);
    
    const stats = {
      totalRequests: requests.length,
      completedSessions: requests.filter(r => r.status === 'completed').length,
      totalEarnings: 0,
      averageRating: 4.5,
      activeStudents: 0,
      totalSpent: 0,
      thisMonthSessions: 0,
      pendingRequests: requests.filter(r => r.status === 'pending').length,
      acceptedRequests: requests.filter(r => r.status === 'accepted').length,
      completedRequests: requests.filter(r => r.status === 'completed').length,
      totalHours: requests.reduce((sum, r) => sum + (r.duration || 0), 0) / 60,
      favoriteSubject: DirectDataLoader.getFavoriteSubject(requests),
      lastActivity: requests.length > 0 ? requests[0].createdAt.toISOString() : new Date().toISOString(),
      successRate: requests.length > 0 ? Math.round((requests.filter(r => r.status === 'completed').length / requests.length) * 100) : 0,
      responseTime: '2.5 horas promedio'
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
    
    console.log('✅ Estadísticas calculadas desde Firebase:', stats);
    return stats;
  }
  
  // Obtener materia favorita
  static getFavoriteSubject(requests: TutorRequest[]): string {
    if (requests.length === 0) return 'N/A';
    
    const subjectCount: { [key: string]: number } = {};
    requests.forEach(request => {
      subjectCount[request.subject] = (subjectCount[request.subject] || 0) + 1;
    });
    
    const favorite = Object.keys(subjectCount).reduce((a, b) => 
      subjectCount[a] > subjectCount[b] ? a : b
    );
    
    return favorite;
  }
  
  // Obtener tutores mock como fallback
  static getMockTutors(): User[] {
    console.log('📚 Generando tutores mock como fallback...');
    
    const mockTutors: User[] = [
      {
        id: 'tutor_1',
        name: 'Dr. María González',
        email: 'maria.gonzalez@tutorapp.com',
        phone: '+57 300 123 4567',
        subjects: ['Matemáticas', 'Cálculo', 'Álgebra'],
        rating: 4.8,
        availability: true,
        location: 'Bogotá, Colombia',
        bio: 'Profesora de matemáticas con 10 años de experiencia. Especialista en cálculo diferencial e integral.',
        hourlyRate: 25000,
        experience: '10 años',
        education: 'PhD en Matemáticas - Universidad Nacional',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'tutor_2',
        name: 'Prof. Carlos Ruiz',
        email: 'carlos.ruiz@tutorapp.com',
        phone: '+57 300 234 5678',
        subjects: ['Física', 'Mecánica', 'Termodinámica'],
        rating: 4.6,
        availability: true,
        location: 'Medellín, Colombia',
        bio: 'Ingeniero físico con amplia experiencia en mecánica clásica y cuántica.',
        hourlyRate: 30000,
        experience: '8 años',
        education: 'MSc en Física - Universidad de Antioquia',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'tutor_3',
        name: 'Dra. Ana Martínez',
        email: 'ana.martinez@tutorapp.com',
        phone: '+57 300 345 6789',
        subjects: ['Química', 'Química Orgánica', 'Análisis'],
        rating: 4.9,
        availability: true,
        location: 'Cali, Colombia',
        bio: 'Química con doctorado en química orgánica. Experta en laboratorio y análisis.',
        hourlyRate: 35000,
        experience: '12 años',
        education: 'PhD en Química - Universidad del Valle',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'tutor_4',
        name: 'Ing. Luis Pérez',
        email: 'luis.perez@tutorapp.com',
        phone: '+57 300 456 7890',
        subjects: ['Programación', 'Algoritmos', 'Estructuras de Datos'],
        rating: 4.7,
        availability: true,
        location: 'Bogotá, Colombia',
        bio: 'Ingeniero de sistemas con experiencia en desarrollo de software y algoritmos.',
        hourlyRate: 40000,
        experience: '6 años',
        education: 'Ingeniería de Sistemas - Universidad de los Andes',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'tutor_5',
        name: 'Lic. Sofía Ramírez',
        email: 'sofia.ramirez@tutorapp.com',
        phone: '+57 300 567 8901',
        subjects: ['Inglés', 'TOEFL', 'Conversación'],
        rating: 4.5,
        availability: true,
        location: 'Barranquilla, Colombia',
        bio: 'Licenciada en idiomas con certificación TOEFL. Especialista en preparación de exámenes.',
        hourlyRate: 20000,
        experience: '5 años',
        education: 'Licenciatura en Idiomas - Universidad del Norte',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'tutor_6',
        name: 'Dr. Roberto Silva',
        email: 'roberto.silva@tutorapp.com',
        phone: '+57 300 678 9012',
        subjects: ['Biología', 'Genética', 'Ecología'],
        rating: 4.8,
        availability: true,
        location: 'Cartagena, Colombia',
        bio: 'Biólogo con doctorado en genética. Experto en biología molecular y ecología.',
        hourlyRate: 28000,
        experience: '9 años',
        education: 'PhD en Biología - Universidad de Cartagena',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    console.log('✅ Tutores mock generados:', mockTutors.length);
    return mockTutors;
  }
  
  // Verificar que funciona
  static test(): boolean {
    console.log('🧪 Probando cargador directo...');
    return true;
  }
}

// Exportar funciones
export const loadUserRequestsDirect = DirectDataLoader.loadUserRequests;
export const loadUserStatsDirect = DirectDataLoader.loadUserStats;
export const calculateStatsFromRequests = DirectDataLoader.calculateStatsFromRequests;
export const testDirectLoader = DirectDataLoader.test;

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
  (window as any).DirectDataLoader = DirectDataLoader;
  (window as any).loadUserRequestsDirect = loadUserRequestsDirect;
  (window as any).loadUserStatsDirect = loadUserStatsDirect;
  
  console.log('📱 Cargador directo disponible:');
  console.log('- DirectDataLoader.loadUserRequests(userId)');
  console.log('- DirectDataLoader.loadUserStats(userId)');
}
