// Servicio de tutorías con Firebase Realtime Database
import { ref, push, get, set, update, query, orderByChild, equalTo, onValue, off } from 'firebase/database';
import { database } from '../firebase';
import { TutorRequest, Review, User, Subject, ColombianLocation } from '../types/index';
import { reviewsService } from './reviews';
import { notificationsService } from './notifications';
import { FirebaseFallbackManager } from '../utils/firebase-fallback';
import { smartSearch, smartSearchInArray, normalizeText } from '../utils/searchUtils';

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
  // Obtener todos los tutores disponibles
  async getTutors(): Promise<User[]> {
    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (!snapshot.exists()) {
        return this.getMockTutors();
      }

      const users = snapshot.val();
      const tutors: User[] = [];

      Object.keys(users).forEach(userId => {
        const userData = users[userId];
        if (userData.subjects && userData.subjects.length > 0) {
          tutors.push({
            ...userData,
            createdAt: new Date(userData.createdAt),
            updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : undefined,
          });
        }
      });

      return tutors;
    } catch (error) {
      console.error('Error getting tutors:', error);
      // Si hay error de permisos, devolver datos mock
      if (error.toString().includes('Permission denied')) {
        console.warn('Firebase permissions not configured. Using mock data.');
        return this.getMockTutors();
      }
      throw new Error('Error al obtener tutores');
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

    const materias = [
      "Matemáticas", "Física", "Química", "Biología", "Programación", "Python", "Java", "JavaScript",
      "Inglés", "Francés", "Alemán", "Historia", "Geografía", "Literatura", "Filosofía", "Psicología",
      "Economía", "Contabilidad", "Derecho", "Medicina", "Arquitectura", "Diseño Gráfico", "Educación Física",
      "Cálculo", "Álgebra", "Geometría", "Estadística", "Química Orgánica", "Física Cuántica", "Biología Molecular",
      "React", "Node.js", "Base de Datos", "Algoritmos", "Machine Learning", "Data Science", "AWS", "Docker",
      "Preparación ICFES", "Preparación TOEFL", "Preparación IELTS", "SAT", "GRE", "GMAT"
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

    // Generar 50 tutores
    for (let i = 0; i < 50; i++) {
      const nombre = nombres[Math.floor(Math.random() * nombres.length)];
      const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
      const ciudad = ciudades[Math.floor(Math.random() * ciudades.length)];
      
      // Seleccionar 3-5 materias aleatorias
      const numMaterias = Math.floor(Math.random() * 3) + 3;
      const materiasSeleccionadas = [];
      const materiasDisponibles = [...materias];
      
      for (let j = 0; j < numMaterias; j++) {
        const materiaIndex = Math.floor(Math.random() * materiasDisponibles.length);
        materiasSeleccionadas.push(materiasDisponibles[materiaIndex]);
        materiasDisponibles.splice(materiaIndex, 1);
      }
      
      const nivelEducacion = nivelesEducacion[Math.floor(Math.random() * nivelesEducacion.length)];
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
        bio: `${nivelEducacion} con ${experiencia}. Especialista en ${materiasSeleccionadas.slice(0, 2).join(' y ')}. ${Math.random() > 0.5 ? 'Experiencia en educación virtual y presencial.' : 'Enfoque personalizado según las necesidades del estudiante.'}`,
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
      const requestsRef = ref(database, 'requests');
      const snapshot = await get(requestsRef);
      
      if (!snapshot.exists()) {
        return this.getMockRequests();
      }

      const requests = snapshot.val();
      const userRequests: TutorRequest[] = [];

      Object.keys(requests).forEach(requestId => {
        const requestData = requests[requestId];
        if (requestData.studentId === userId || requestData.tutorId === userId) {
          userRequests.push({
            ...requestData,
            createdAt: new Date(requestData.createdAt),
            updatedAt: new Date(requestData.updatedAt)
          });
        }
      });

      return userRequests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting user requests:', error);
      return this.getMockRequests();
    }
  }

  // Datos mock para solicitudes
  private getMockRequests(): TutorRequest[] {
    return [
      {
        id: 'mock-request-1',
        studentId: 'student-1',
        tutorId: 'tutor-1',
        studentName: 'Carlos Estudiante',
        tutorName: 'María González',
        subject: 'Matemáticas',
        description: 'Necesito ayuda con cálculo diferencial',
        hourlyRate: 45000,
        duration: 60,
        totalAmount: 49500,
        status: 'pending',
        isImmediate: false,
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  // Actualizar estado de solicitud
  async updateRequestStatus(requestId: string, status: string, tutorId?: string): Promise<void> {
    try {
      const requestRef = ref(database, `requests/${requestId}`);
      await update(requestRef, {
        status,
        updatedAt: new Date().toISOString()
      });

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
    } catch (error) {
      console.error('Error updating request status:', error);
      throw new Error('Error al actualizar estado de solicitud');
    }
  }
}

export const tutoringService = new TutoringService();
