// Servicio de tutorías con Firebase Realtime Database
import { ref, push, get, set, update, query, orderByChild, equalTo, onValue, off } from 'firebase/database';
import { database } from '../firebase';
import { TutorRequest, Review, User, Subject, ColombianLocation } from '../types/index';
import { reviewsService } from './reviews';
import { notificationsService } from './notifications';
import { FirebaseFallbackManager } from '../utils/firebase-fallback';
import { smartSearch, smartSearchInArray, normalizeText } from '../utils/searchUtils';
import { EnvironmentDetector } from '../utils/environment-detector';
import { AndroidDataManager } from '../utils/android-data-manager';
import { AndroidRequestsManager } from '../utils/android-requests-manager';
import { Capacitor } from '@capacitor/core';

// Datos mock de ubicaciones colombianas (movido aquí temporalmente)
const colombianLocations: ColombianLocation[] = [
  { id: '1', city: 'Bogotá', department: 'Cundinamarca', region: 'Andina', isCapital: true },
  { id: '2', city: 'Medellín', department: 'Antioquia', region: 'Andina' },
  { id: '3', city: 'Cali', department: 'Valle del Cauca', region: 'Pacífica' },
  { id: '4', city: 'Barranquilla', department: 'Atlántico', region: 'Caribe' },
  { id: '5', city: 'Cartagena', department: 'Bolívar', region: 'Caribe' }
];

// Materias por defecto
const defaultSubjects: Subject[] = [
  { id: '1', name: 'Matemáticas', category: 'Ciencias Exactas' },
  { id: '2', name: 'Cálculo', category: 'Ciencias Exactas' },
  { id: '3', name: 'Física', category: 'Ciencias Exactas' },
  { id: '4', name: 'Química', category: 'Ciencias Exactas' },
  { id: '6', name: 'Programación', category: 'Tecnología' },
];

class TutoringService {
  // Obtener todos los tutores disponibles (para búsqueda y filtros)
  async getTutors(): Promise<User[]> {
    try {
      // Primero intentar obtener tutores de Firebase
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      let firebaseTutors: User[] = [];
      
      if (snapshot.exists()) {
        const users = snapshot.val();
        Object.keys(users).forEach(userId => {
          const userData = users[userId];
          if (userData.subjects && userData.subjects.length > 0) {
            firebaseTutors.push({
              ...userData,
              createdAt: new Date(userData.createdAt),
              updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : undefined,
            });
          }
        });
        console.log(`📊 Encontrados ${firebaseTutors.length} tutores en Firebase`);
      }
      
      // Si hay menos de 50 tutores, crear tutores mock en Firebase (solo una vez)
      if (firebaseTutors.length < 50) {
        const tutoresNecesarios = 50 - firebaseTutors.length;
        console.log(`🎯 Creando ${tutoresNecesarios} tutores mock en Firebase...`);
        
        const mockTutors = this.generateMockTutors();
        const tutoresParaCrear = mockTutors.slice(0, tutoresNecesarios);
        
        // Crear cada tutor mock en Firebase
        for (const tutor of tutoresParaCrear) {
          try {
            const tutorRef = ref(database, `users/${tutor.id}`);
            await set(tutorRef, {
              ...tutor,
              createdAt: tutor.createdAt.toISOString(),
              updatedAt: tutor.updatedAt.toISOString()
            });
            console.log(`✅ Tutor mock creado: ${tutor.name}`);
          } catch (error) {
            console.error(`❌ Error creando tutor ${tutor.name}:`, error);
          }
        }
        
        // Recargar tutores después de crear los mock
        const newSnapshot = await get(usersRef);
        if (newSnapshot.exists()) {
          const users = newSnapshot.val();
          firebaseTutors = [];
      Object.keys(users).forEach(userId => {
        const userData = users[userId];
        if (userData.subjects && userData.subjects.length > 0) {
              firebaseTutors.push({
            ...userData,
            createdAt: new Date(userData.createdAt),
            updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : undefined,
          });
        }
      });
        }
      }
      
      console.log(`🎯 Total: ${firebaseTutors.length} tutores disponibles para búsqueda`);
      return firebaseTutors;

    } catch (error) {
      console.error('Error getting tutors:', error);
      // Si hay error, usar solo datos mock
      console.log('⚠️ Error con Firebase, usando solo datos mock');
        return this.getMockTutors();
      }
  }

  // Función para generar tutores dinámicamente
  private generateMockTutors(): User[] {
    const nombres = [
      "María", "Carlos", "Ana", "David", "Lucía", "Santiago", "Valentina", "Andrés", "Camila", "Diego",
      "Isabella", "Sebastián", "Sofía", "Nicolás", "Valeria", "Alejandro", "Gabriela", "Mateo", "Natalia", "Daniel",
      "Mariana", "Felipe", "Alejandra", "Juan", "Paola", "Cristian", "Laura", "Jorge", "Andrea", "Ricardo",
      "Carolina", "Fernando", "Diana", "Luis", "Claudia", "Roberto", "Patricia", "Eduardo", "Mónica", "Héctor",
      "Gloria", "Alberto", "Rosa", "Miguel", "Carmen", "Antonio", "Teresa", "Francisco", "Elena", "Manuel"
    ];

    const apellidos = [
      "Rodríguez", "García", "López", "Martínez", "González", "Pérez", "Sánchez", "Ramírez", "Cruz", "Flores",
      "Rivera", "Gómez", "Díaz", "Reyes", "Morales", "Jiménez", "Álvarez", "Ruiz", "Herrera", "Medina",
      "Vargas", "Castillo", "Romero", "Moreno", "Muñoz", "Delgado", "Ortiz", "Vega", "Rojas", "Mendoza",
      "Guerrero", "Ramos", "Herrera", "Jiménez", "Espinoza", "Silva", "Torres", "Vásquez", "Castro", "Molina"
    ];

    const ciudades = [
      "Bogotá, D.C.", "Medellín, Antioquia", "Cali, Valle del Cauca", "Barranquilla, Atlántico", 
      "Cartagena, Bolívar", "Bucaramanga, Santander", "Pereira, Risaralda", "Santa Marta, Magdalena",
      "Ibagué, Tolima", "Manizales, Caldas", "Villavicencio, Meta", "Pasto, Nariño", "Armenia, Quindío",
      "Neiva, Huila", "Cúcuta, Norte de Santander"
    ];

    // Perfiles especializados con materias coherentes
    const perfilesEspecializados = [
      {
        nombre: "Matemático",
        materias: ["Matemáticas", "Cálculo", "Álgebra", "Geometría", "Estadística", "Trigonometría"],
        educacion: ["Licenciado en Matemáticas", "Doctor en Matemáticas", "Magíster en Matemáticas"]
      },
      {
        nombre: "Físico",
        materias: ["Física", "Física Cuántica", "Mecánica", "Termodinámica", "Óptica", "Electricidad"],
        educacion: ["Físico", "Doctor en Física", "Ingeniero Físico"]
      },
      {
        nombre: "Químico",
        materias: ["Química", "Química Orgánica", "Química Inorgánica", "Bioquímica", "Fisicoquímica"],
        educacion: ["Químico", "Doctor en Química", "Ingeniero Químico"]
      },
      {
        nombre: "Biólogo",
        materias: ["Biología", "Biología Molecular", "Genética", "Anatomía", "Fisiología", "Ecología"],
        educacion: ["Biólogo", "Doctor en Biología", "Microbiólogo"]
      },
      {
        nombre: "Programador",
        materias: ["Programación", "Python", "Java", "JavaScript", "React", "Node.js", "Algoritmos"],
        educacion: ["Ingeniero de Sistemas", "Ingeniero de Software", "Desarrollador Full Stack"]
      },
      {
        nombre: "Lingüista",
        materias: ["Inglés", "Francés", "Alemán", "Literatura", "Gramática", "Conversación"],
        educacion: ["Licenciado en Idiomas", "Filólogo", "Traductor"]
      },
      {
        nombre: "Historiador",
        materias: ["Historia", "Geografía", "Ciencias Sociales", "Filosofía", "Política"],
        educacion: ["Historiador", "Licenciado en Historia", "Antropólogo"]
      },
      {
        nombre: "Psicólogo",
        materias: ["Psicología", "Psicología Educativa", "Desarrollo Humano", "Terapia"],
        educacion: ["Psicólogo", "Psicólogo Educativo", "Terapeuta"]
      },
      {
        nombre: "Economista",
        materias: ["Economía", "Contabilidad", "Finanzas", "Administración", "Estadística"],
        educacion: ["Economista", "Contador", "Administrador de Empresas"]
      },
      {
        nombre: "Médico",
        materias: ["Medicina", "Anatomía", "Fisiología", "Biología", "Química"],
        educacion: ["Médico", "Doctor en Medicina", "Especialista Médico"]
      },
      {
        nombre: "Arquitecto",
        materias: ["Arquitectura", "Dibujo Técnico", "Matemáticas", "Física", "Diseño"],
        educacion: ["Arquitecto", "Diseñador", "Ingeniero Civil"]
      },
      {
        nombre: "Preparador de Exámenes",
        materias: ["Preparación ICFES", "Preparación TOEFL", "Preparación IELTS", "SAT", "GRE", "GMAT"],
        educacion: ["Licenciado en Educación", "Magíster en Educación", "Especialista en Evaluación"]
      }
    ];

    const nivelesEducacion = [
      "Licenciado en Matemáticas", "Ingeniero de Sistemas", "Físico", "Químico", "Psicólogo", "Economista",
      "Abogado", "Médico", "Arquitecto", "Licenciado en Literatura", "Historiador", "Filósofo",
      "Ingeniero Químico", "Ingeniero Civil", "Ingeniero Industrial", "Psicólogo Educativo",
      "Doctor en Física", "Doctor en Química", "Doctor en Matemáticas", "Magíster en Educación",
      "Especialista en Data Science", "Especialista en Desarrollo Web", "Especialista en UX/UI"
    ];

    const experiencias = [
      "5 años enseñando en universidades", "8 años de experiencia docente", "10 años enseñando de forma privada",
      "6 años en colegios y universidades", "7 años especializado en tutorías", "12 años de experiencia académica",
      "4 años enseñando online", "9 años en educación superior", "11 años de experiencia docente",
      "3 años especializado en preparación de exámenes", "6 años en empresas de tecnología",
      "8 años de experiencia internacional", "5 años en investigación académica"
    ];

    const tutores = [];

    // Generar 50 tutores con perfiles especializados
    for (let i = 0; i < 50; i++) {
      const nombre = nombres[Math.floor(Math.random() * nombres.length)];
      const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
      const ciudad = ciudades[Math.floor(Math.random() * ciudades.length)];
      
      // Seleccionar un perfil especializado
      const perfilSeleccionado = perfilesEspecializados[Math.floor(Math.random() * perfilesEspecializados.length)];
      
      // Seleccionar 2-3 materias del perfil (más coherentes)
      const numMaterias = Math.floor(Math.random() * 2) + 2; // 2-3 materias
      const materiasSeleccionadas = [];
      const materiasDisponibles = [...perfilSeleccionado.materias];
      
      for (let j = 0; j < numMaterias; j++) {
        const materiaIndex = Math.floor(Math.random() * materiasDisponibles.length);
        materiasSeleccionadas.push(materiasDisponibles[materiaIndex]);
        materiasDisponibles.splice(materiaIndex, 1);
      }
      
      // Seleccionar educación coherente con el perfil
      const nivelEducacion = perfilSeleccionado.educacion[Math.floor(Math.random() * perfilSeleccionado.educacion.length)];
      const experiencia = experiencias[Math.floor(Math.random() * experiencias.length)];
      
      // Generar tarifa por hora (30,000 - 80,000 COP)
      const tarifaBase = 30000 + Math.floor(Math.random() * 50000);
      
      // Generar rating (4.0 - 5.0)
      const rating = 4.0 + Math.random();
      
      // Generar número de reseñas (5 - 50)
      const numResenas = 5 + Math.floor(Math.random() * 46);
      
      // Generar sesiones totales (20 - 200)
      const sesionesTotales = 20 + Math.floor(Math.random() * 181);
      
      // Generar fechas
      const fechaCreacion = new Date(2024, Math.floor(Math.random() * 10), Math.floor(Math.random() * 28) + 1);
      const fechaActualizacion = new Date();
      const ultimaActividad = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));
      
      tutores.push({
        id: `mock-${i + 1}`,
        name: `${nombre} ${apellido}`,
        email: `${nombre.toLowerCase()}.${apellido.toLowerCase()}${i + 1}@tutorapp.com`,
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000000)}?w=150&h=150&fit=crop&crop=face`,
        bio: `${nivelEducacion} con ${experiencia}. Especialista en ${perfilSeleccionado.nombre.toLowerCase()} con enfoque en ${materiasSeleccionadas.slice(0, 2).join(' y ')}. ${Math.random() > 0.5 ? 'Experiencia en educación virtual y presencial.' : 'Enfoque personalizado según las necesidades del estudiante.'}`,
        subjects: materiasSeleccionadas,
        education: nivelEducacion,
        location: ciudad,
        hourlyRate: tarifaBase,
        rating: Math.round(rating * 10) / 10,
        availability: true,
        currentMode: 'tutor' as const,
        totalReviews: numResenas,
        experience: experiencia,
        preferredSubjects: [],
        createdAt: fechaCreacion,
        updatedAt: fechaActualizacion
      });
    }

    return tutores;
  }

  // Datos mock expandidos para cuando Firebase no esté configurado
  private getMockTutors(): User[] {
    return this.generateMockTutors();
  }

  // Obtener ubicaciones colombianas disponibles
  getColombianLocations(): ColombianLocation[] {
    return colombianLocations;
  }

  // Buscar tutores por filtros
  async searchTutors(searchQuery?: string, filters?: {
    subject?: string;
    location?: string;
    minRating?: number;
    maxRate?: number;
    availability?: boolean;
    language?: string;
    minExperience?: number;
  }): Promise<User[]> {
    try {
      const allTutors = await this.getTutors();
      
      let filteredTutors = allTutors;

      // Búsqueda por texto (nombre, materia, descripción) - Mejorada para ignorar tildes y mayúsculas
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.trim();
        filteredTutors = filteredTutors.filter(tutor => {
          const nameMatch = smartSearch(query, tutor.name || '');
          const bioMatch = smartSearch(query, tutor.bio || '');
          const subjectsMatch = smartSearchInArray(query, tutor.subjects || []);
          return nameMatch || bioMatch || subjectsMatch;
        });
      }

      // Filtro por materia - Mejorado para ignorar tildes y mayúsculas
      if (filters?.subject) {
        filteredTutors = filteredTutors.filter(tutor =>
          smartSearchInArray(filters.subject!, tutor.subjects || [])
        );
      }

      // Filtro por ubicación - Mejorado para ignorar tildes y mayúsculas
      if (filters?.location) {
        filteredTutors = filteredTutors.filter(tutor =>
          smartSearch(filters.location!, tutor.location || '')
        );
      }

      if (filters?.minRating) {
        filteredTutors = filteredTutors.filter(tutor => tutor.rating >= filters.minRating!);
      }

      if (filters?.maxRate) {
        filteredTutors = filteredTutors.filter(tutor => tutor.hourlyRate <= filters.maxRate!);
      }

      if (filters?.availability) {
        filteredTutors = filteredTutors.filter(tutor => tutor.availability === true);
      }

      if (filters?.language) {
        filteredTutors = filteredTutors.filter(tutor =>
          tutor.languages?.includes(filters.language!) || false
        );
      }

      if (filters?.minExperience) {
        filteredTutors = filteredTutors.filter(tutor => {
          const experienceYears = parseInt(tutor.experience?.match(/\d+/)?.[0] || '0');
          return experienceYears >= filters.minExperience!;
        });
      }

      return filteredTutors;
    } catch (error) {
      console.error('Error searching tutors:', error);
      throw new Error('Error al buscar tutores');
    }
  }

  // Obtener materias disponibles
  getSubjects(): Subject[] {
        return defaultSubjects;
  }

  // Crear solicitud de tutoría
  async createTutorRequest(requestData: Omit<TutorRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
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

      // Enviar notificación al tutor
      await notificationsService.createNotification({
        id: `notif_${Date.now()}`,
        userId: requestData.tutorId,
        type: 'tutor_request',
        title: 'Nueva solicitud de tutoría',
        message: `${requestData.studentName} te ha enviado una solicitud de ${requestData.subject}`,
        data: { requestId: request.id },
        read: false,
        createdAt: new Date()
      });

      return request.id;
    } catch (error) {
      console.error('Error creating tutor request:', error);
      throw new Error('Error al crear solicitud de tutoría');
    }
  }

  // Obtener solicitudes de un usuario
  async getUserRequests(userId: string): Promise<TutorRequest[]> {
    try {
      console.log('🔍 getUserRequests - Iniciando búsqueda para:', userId);
      console.log('📱 Entorno móvil:', Capacitor.isNativePlatform());
      console.log('🌐 Plataforma:', Capacitor.getPlatform());
      
      // Usar servicio unificado
      const { TutoringUnifiedService } = await import('./tutoring-unified');
      const userRequests = await TutoringUnifiedService.getUserRequests(userId);
      
      console.log('✅ Solicitudes obtenidas para el usuario:', userRequests.length);
      console.log('📋 Solicitudes del usuario:', userRequests.map(r => ({ id: r.id, subject: r.subject, status: r.status })));
      
      return userRequests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('❌ Error getting user requests:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error stack:', error.stack);
      return [];
    }
  }

  // Datos mock para solicitudes
  private getMockRequests(): TutorRequest[] {
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
        totalAmount: 57750, // 35000 * 1.5 + 10% comisión
        status: 'pending',
        isImmediate: false,
        scheduledTime: tomorrow,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 horas atrás
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
        totalAmount: 88000, // 40000 * 2 + 10% comisión
        status: 'accepted',
        isImmediate: false,
        scheduledTime: nextWeek,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 día atrás
        updatedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000) // 12 horas atrás
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
        totalAmount: 33000, // 30000 * 1 + 10% comisión
        status: 'completed',
        isImmediate: false,
        scheduledTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        hasReview: true
      },
      {
        id: 'mock-request-4',
        studentId: 'mock-student-2',
        tutorId: 'mock-4',
        studentName: 'Valeria Morales Gómez',
        tutorName: 'David Ramírez Castro',
        subject: 'Programación Python',
        description: 'Ayuda con algoritmos y estructuras de datos en Python.',
        hourlyRate: 45000,
        duration: 90,
        totalAmount: 74250, // 45000 * 1.5 + 10% comisión
        status: 'in_progress',
        isImmediate: false,
        scheduledTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // En 2 días
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 horas atrás
        updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000) // 1 hora atrás
      },
      {
        id: 'mock-request-5',
        studentId: 'mock-student-1',
        tutorId: 'mock-5',
        studentName: 'Santiago Herrera Díaz',
        tutorName: 'Laura Henao Suárez',
        subject: 'Contabilidad',
        description: 'Repaso de principios contables y balance general.',
        hourlyRate: 32000,
        duration: 60,
        totalAmount: 35200, // 32000 * 1 + 10% comisión
        status: 'cancelled',
        isImmediate: false,
        scheduledTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // En 3 días
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 días atrás
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 días atrás
      }
    ];
  }

// Crear solicitud de tutoría (alias para createTutorRequest)
async createRequest(requestData: Omit<TutorRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<TutorRequest> {
  try {
    console.log('🔍 createRequest - Creando solicitud:', requestData);
    
    // Usar servicio unificado
    const { TutoringUnifiedService } = await import('./tutoring-unified');
    const request = await TutoringUnifiedService.createRequest(requestData);
    
    // Enviar notificación al tutor
    await notificationsService.createNotification({
      id: `notif_${Date.now()}`,
      userId: requestData.tutorId,
      type: 'tutor_request',
      title: 'Nueva solicitud de tutoría',
      message: `${requestData.studentName} te ha enviado una solicitud de ${requestData.subject}`,
      data: { requestId: request.id },
      read: false,
      createdAt: new Date()
    });
    
    console.log('✅ Solicitud creada exitosamente:', request.id);
    return request;
  } catch (error) {
    console.error('❌ Error creating request:', error);
    throw new Error('Error al crear solicitud de tutoría');
  }
}

  // Actualizar estado de solicitud
  async updateRequestStatus(requestId: string, status: string, tutorId?: string): Promise<void> {
    try {
      console.log('🔍 updateRequestStatus - Actualizando solicitud:', requestId, 'a estado:', status);
      
      // Usar servicio unificado
      const { TutoringUnifiedService } = await import('./tutoring-unified');
      await TutoringUnifiedService.updateRequestStatus(requestId, status, tutorId);

      // Crear notificación según el estado
      if (status === 'accepted') {
        await notificationsService.createNotification({
          id: `notif_${Date.now()}`,
          userId: tutorId || '',
          type: 'request_accepted',
          title: 'Solicitud aceptada',
          message: 'Tu solicitud de tutoría ha sido aceptada',
          data: { requestId },
          read: false,
          createdAt: new Date()
        });
      }
      
      console.log('✅ Estado de solicitud actualizado exitosamente');
    } catch (error) {
      console.error('❌ Error updating request status:', error);
      throw new Error('Error al actualizar estado de solicitud');
    }
  }
}

export const tutoringService = new TutoringService();
