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
  { id: '5', name: 'Inglés', category: 'Idiomas' },
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
      "Cálculo", "Álgebra", "Geometría", "Estadística", "Química Orgánica", "Física Cuántica", "Biología Molecular"
    ];

    const nivelesEducacion = [
      "Licenciado en Matemáticas", "Ingeniero de Sistemas", "Físico", "Químico", "Psicólogo", "Economista",
      "Abogado", "Médico", "Arquitecto", "Licenciado en Literatura", "Historiador", "Filósofo",
      "Ingeniero Químico", "Ingeniero Civil", "Ingeniero Industrial", "Psicólogo Educativo"
    ];

    const experiencias = [
      "5 años enseñando en universidades", "8 años de experiencia docente", "10 años enseñando de forma privada",
      "6 años en colegios y universidades", "7 años especializado en tutorías", "12 años de experiencia académica",
      "4 años enseñando online", "9 años en educación superior", "11 años de experiencia docente"
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
        bio: 'Licenciado en Lenguas Modernas, certificado en metodología comunicativa para enseñanza del inglés. Especialista en preparación TOEFL e IELTS.',
        subjects: ['Inglés Básico', 'Inglés Intermedio', 'Inglés Avanzado', 'Inglés de Negocios', 'Preparación TOEFL', 'Preparación IELTS'],
        education: 'Licenciatura en Lenguas Modernas - Universidad Javeriana',
        location: 'Medellín, Antioquia',
        hourlyRate: 38000, // COP
        rating: 4.9,
        availability: true,
        currentMode: 'tutor',
        totalReviews: 89,
        experience: '6 años enseñando inglés con metodología comunicativa. Certificado TESOL. Más de 200 estudiantes han logrado certificaciones internacionales.',
        preferredSubjects: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mock-3',
        name: 'Ana Sofía Martínez',
        email: 'ana.martinez@example.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        bio: 'Ingeniera de Sistemas especializada en desarrollo web y mobile. Experiencia en empresas de tecnología y enseñanza de programación.',
        subjects: ['Python', 'JavaScript', 'React', 'Node.js', 'Ingeniería de Sistemas', 'Programación Básica'],
        education: 'Ingeniería de Sistemas - Universidad de los Andes',
        location: 'Bogotá, Cundinamarca',
        hourlyRate: 55000, // COP
        rating: 4.7,
        availability: true,
        currentMode: 'tutor',
        totalReviews: 156,
        experience: '5 años en desarrollo de software en empresas como Rappi y Mercado Libre. 3 años enseñando programación online y presencial.',
        preferredSubjects: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mock-4',
        name: 'Dr. Roberto Sánchez',
        email: 'roberto.sanchez@example.com',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
        bio: 'Médico especialista en medicina interna. Profesor universitario con amplia experiencia en ciencias de la salud y preparación para admisiones médicas.',
        subjects: ['Medicina', 'Anatomía', 'Fisiología', 'Bioquímica', 'Biología General'],
        education: 'Medicina - Universidad del Rosario, Especialización Medicina Interna - Fundación Santa Fe',
        location: 'Cali, Valle del Cauca',
        hourlyRate: 75000, // COP
        rating: 4.9,
        availability: true,
        currentMode: 'tutor',
        totalReviews: 67,
        experience: '12 años de experiencia médica y 5 años enseñando en pregrado y posgrado. Especialista en preparación para admisiones de medicina.',
        preferredSubjects: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mock-5',
        name: 'Ing. Laura Fernández',
        email: 'laura.fernandez@example.com',
        avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=150',
        bio: 'Ingeniera Civil con maestría en estructuras. Experiencia en proyectos de infraestructura y enseñanza universitaria.',
        subjects: ['Ingeniería Civil', 'Cálculo Diferencial', 'Cálculo Integral', 'Física Básica', 'Mecánica Clásica'],
        education: 'Ingeniería Civil - Universidad Nacional, Maestría en Estructuras - Universidad de los Andes',
        location: 'Barranquilla, Atlántico',
        hourlyRate: 50000, // COP
        rating: 4.6,
        availability: true,
        currentMode: 'tutor',
        totalReviews: 93,
        experience: '8 años en proyectos de infraestructura civil y 4 años enseñando materias de ingeniería a nivel universitario.',
        preferredSubjects: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mock-6',
        name: 'Dra. Patricia Morales',
        email: 'patricia.morales@example.com',
        avatar: 'https://images.unsplash.com/photo-1594824618748-c49f8cfc5a28?w=150',
        bio: 'Doctora en Química con especialización en química orgánica. Investigadora y profesora universitaria.',
        subjects: ['Química General', 'Química Orgánica', 'Química Inorgánica', 'Bioquímica'],
        education: 'Química - Universidad Nacional, Doctorado en Química Orgánica - Universidad de Antioquia',
        location: 'Medellín, Antioquia',
        hourlyRate: 60000, // COP
        rating: 4.8,
        availability: true,
        currentMode: 'tutor',
        totalReviews: 78,
        experience: '10 años en investigación química y 6 años enseñando química a nivel universitario. Autora de múltiples publicaciones científicas.',
        preferredSubjects: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mock-7',
        name: 'Lic. Andrés Castro',
        email: 'andres.castro@example.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        bio: 'Licenciado en Educación Física y Deportes. Entrenador personal certificado y especialista en biomecánica.',
        subjects: ['Educación Física', 'Anatomía', 'Fisiología', 'Nutrición'],
        education: 'Licenciatura en Educación Física - Universidad Pedagógica Nacional',
        location: 'Bucaramanga, Santander',
        hourlyRate: 30000, // COP
        rating: 4.7,
        availability: true,
        currentMode: 'tutor',
        totalReviews: 112,
        experience: '7 años en entrenamiento deportivo y educación física. Especialista en biomecánica del movimiento humano.',
        preferredSubjects: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mock-8',
        name: 'Prof. Diana López',
        email: 'diana.lopez@example.com',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        bio: 'Profesora de Literatura con maestría en Literatura Latinoamericana. Especialista en análisis literario y escritura creativa.',
        subjects: ['Literatura Española', 'Literatura Latinoamericana', 'Licenciatura en Español', 'Historia de Colombia'],
        education: 'Licenciatura en Literatura - Universidad Javeriana, Maestría en Literatura Latinoamericana',
        location: 'Online',
        hourlyRate: 35000, // COP
        rating: 4.9,
        availability: true,
        currentMode: 'tutor',
        totalReviews: 145,
        experience: '9 años enseñando literatura y español. Conductora de talleres de escritura creativa y análisis literario.',
        preferredSubjects: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Tutores adicionales para llegar a 50
      {
        id: 'mock-9',
        name: 'Dr. Roberto Sánchez',
        email: 'roberto.sanchez@example.com',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
        bio: 'Médico especialista en medicina interna. Profesor universitario con amplia experiencia en ciencias de la salud.',
        subjects: ['Medicina', 'Anatomía', 'Fisiología', 'Bioquímica', 'Biología General'],
        education: 'Medicina - Universidad del Rosario, Especialización Medicina Interna',
        location: 'Cali, Valle del Cauca',
        hourlyRate: 75000,
        rating: 4.9,
        availability: true,
        currentMode: 'tutor',
        totalReviews: 67,
        experience: '12 años de experiencia médica y 5 años enseñando en pregrado y posgrado.',
        preferredSubjects: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mock-10',
        name: 'Ing. Laura Fernández',
        email: 'laura.fernandez@example.com',
        avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=150',
        bio: 'Ingeniera Civil con maestría en estructuras. Experiencia en proyectos de infraestructura y enseñanza universitaria.',
        subjects: ['Ingeniería Civil', 'Cálculo Diferencial', 'Cálculo Integral', 'Física Básica', 'Mecánica Clásica'],
        education: 'Ingeniería Civil - Universidad Nacional, Maestría en Estructuras',
        location: 'Barranquilla, Atlántico',
        hourlyRate: 50000,
        rating: 4.6,
        availability: true,
        currentMode: 'tutor',
        totalReviews: 93,
        experience: '8 años en proyectos de infraestructura civil y 4 años enseñando materias de ingeniería.',
        preferredSubjects: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mock-11',
        name: 'Dra. Patricia Morales',
        email: 'patricia.morales@example.com',
        avatar: 'https://images.unsplash.com/photo-1594824618748-c49f8cfc5a28?w=150',
        bio: 'Doctora en Química con especialización en química orgánica. Investigadora y profesora universitaria.',
        subjects: ['Química General', 'Química Orgánica', 'Química Inorgánica', 'Bioquímica'],
        education: 'Química - Universidad Nacional, Doctorado en Química Orgánica',
        location: 'Medellín, Antioquia',
        hourlyRate: 60000,
        rating: 4.8,
        availability: true,
        currentMode: 'tutor',
        totalReviews: 78,
        experience: '10 años en investigación química y 6 años enseñando química a nivel universitario.',
        preferredSubjects: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mock-12',
        name: 'Lic. Andrés Castro',
        email: 'andres.castro@example.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        bio: 'Licenciado en Educación Física y Deportes. Entrenador personal certificado y especialista en biomecánica.',
        subjects: ['Educación Física', 'Anatomía', 'Fisiología', 'Nutrición'],
        education: 'Licenciatura en Educación Física - Universidad Pedagógica Nacional',
        location: 'Bucaramanga, Santander',
        hourlyRate: 30000,
        rating: 4.7,
        availability: true,
        currentMode: 'tutor',
        totalReviews: 112,
        experience: '7 años en entrenamiento deportivo y educación física. Especialista en biomecánica del movimiento humano.',
        preferredSubjects: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mock-13',
        name: 'Prof. Miguel Torres',
        email: 'miguel.torres@example.com',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        bio: 'Profesor de Historia con especialización en Historia de Colombia. Experto en metodología de investigación histórica.',
        subjects: ['Historia de Colombia', 'Historia Universal', 'Geografía', 'Ciencias Políticas'],
        education: 'Licenciatura en Historia - Universidad Nacional, Especialización en Historia de Colombia',
        location: 'Bogotá, D.C.',
        hourlyRate: 38000,
        rating: 4.5,
        availability: true,
        currentMode: 'tutor',
        totalReviews: 89,
        experience: '6 años enseñando historia en colegios y universidades. Especialista en preparación para exámenes de historia.',
        preferredSubjects: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mock-14',
        name: 'Dra. Carmen Ruiz',
        email: 'carmen.ruiz@example.com',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
        bio: 'Doctora en Psicología con especialización en psicología clínica. Terapeuta y profesora universitaria.',
        subjects: ['Psicología', 'Psicología Clínica', 'Psicología Social', 'Metodología de Investigación'],
        education: 'Psicología - Universidad Javeriana, Doctorado en Psicología Clínica',
        location: 'Medellín, Antioquia',
        hourlyRate: 65000,
        rating: 4.9,
        availability: true,
        currentMode: 'tutor',
        totalReviews: 156,
        experience: '15 años en práctica clínica y 8 años enseñando psicología a nivel universitario.',
        preferredSubjects: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mock-15',
        name: 'Ing. Fernando Silva',
        email: 'fernando.silva@example.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        bio: 'Ingeniero de Sistemas especializado en desarrollo web y mobile. Experiencia en empresas de tecnología.',
        subjects: ['Programación', 'Python', 'JavaScript', 'React', 'Node.js', 'Base de Datos'],
        education: 'Ingeniería de Sistemas - Universidad de los Andes, Especialización en Desarrollo Web',
        location: 'Bogotá, D.C.',
        hourlyRate: 55000,
        rating: 4.7,
        availability: true,
        currentMode: 'tutor',
        totalReviews: 134,
        experience: '5 años en desarrollo de software en empresas como Rappi y Mercado Libre. 3 años enseñando programación.',
        preferredSubjects: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
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
          smartSearchInArray(filters.language!, tutor.languages || [])
        );
      }

      if (filters?.minExperience) {
        // Extraer años de experiencia del campo experience (formato: "X años" o "X+ años")
        filteredTutors = filteredTutors.filter(tutor => {
          const experienceText = tutor.experience || '';
          const yearsMatch = experienceText.match(/(\d+)/);
          if (yearsMatch) {
            const years = parseInt(yearsMatch[1]);
            return years >= filters.minExperience!;
          }
          return false;
        });
      }

      return filteredTutors;
    } catch (error) {
      console.error('Error searching tutors:', error);
      throw new Error('Error al buscar tutores');
    }
  }

  // Obtener materias disponibles
  async getSubjects(): Promise<Subject[]> {
    try {
      const subjectsRef = ref(database, 'subjects');
      const snapshot = await get(subjectsRef);
      
      if (!snapshot.exists()) {
        // Si no hay materias en la base de datos, crear las por defecto
        await Promise.all(
          defaultSubjects.map(subject => 
            push(ref(database, 'subjects'), subject)
          )
        );
        return defaultSubjects;
      }

      const subjects = snapshot.val();
      return Object.keys(subjects).map(key => ({
        id: key,
        ...subjects[key]
      }));
    } catch (error) {
      console.error('Error getting subjects:', error);
      return defaultSubjects;
    }
  }

  // Crear solicitud de tutoría
  async createRequest(request: Omit<TutorRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<TutorRequest> {
    try {
      console.log('Creating request with data:', request);
      
      const requestsRef = ref(database, 'requests');
      const newRequestRef = push(requestsRef);
      
      const newRequest: TutorRequest = {
        ...request,
        id: newRequestRef.key!,
        createdAt: new Date(),
        updatedAt: new Date(),
        scheduledTime: request.scheduledTime || (request as any).preferredDateTime || undefined,
        isImmediate: request.isImmediate || request.isEmergency || false,
      };

      const requestData = {
        ...newRequest,
        createdAt: newRequest.createdAt.toISOString(),
        updatedAt: newRequest.updatedAt.toISOString(),
        scheduledTime: newRequest.scheduledTime?.toISOString(),
      };

      console.log('Attempting to save to Firebase:', requestData);
      await update(newRequestRef, requestData);
      console.log('Request saved successfully');

      // Enviar notificación al tutor
      try {
        await notificationsService.createRequestNotification(
          'request_created',
          request.tutorId,
          { id: newRequest.id, subject: request.subject }
        );
      } catch (notificationError) {
        console.warn('Error sending notification:', notificationError);
        // No fallar la creación de la solicitud si falla la notificación
      }
      
      return newRequest;
    } catch (error) {
      console.error('Error creating request:', error);
      
      // Si Firebase falla, usar almacenamiento local para demo
      if (error.toString().includes('Permission denied') || error.toString().includes('PERMISSION_DENIED')) {
        console.warn('Firebase permissions not configured. Using local storage for demo.');
        
        const newRequest: TutorRequest = {
          ...request,
          id: `mock-request-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          scheduledTime: request.scheduledTime || undefined,
        };

        // Guardar en localStorage para demo
        const existingRequests = JSON.parse(localStorage.getItem('tutoring-requests') || '[]');
        
        // Asegurar que se guarde con todos los campos necesarios
        const requestToSave = {
          ...newRequest,
          createdAt: newRequest.createdAt.toISOString(),
          updatedAt: newRequest.updatedAt.toISOString(),
          scheduledTime: newRequest.scheduledTime?.toISOString(),
        };
        
        console.log('💾 Guardando en localStorage:', requestToSave);
        existingRequests.push(requestToSave);
        localStorage.setItem('tutoring-requests', JSON.stringify(existingRequests));
        console.log('✅ Guardado en localStorage. Total de solicitudes:', existingRequests.length);
        
        return newRequest;
      }
      
      throw new Error('Error al crear la solicitud');
    }
  }

  // Obtener solicitudes del usuario
  async getUserRequests(userId: string, role: 'student' | 'tutor'): Promise<TutorRequest[]> {
    const field = role === 'student' ? 'studentId' : 'tutorId';
    
    return FirebaseFallbackManager.executeWithFallback(
      async () => {
        const requestsRef = ref(database, 'requests');
        const requestsQuery = query(requestsRef, orderByChild(field), equalTo(userId));
        
        const snapshot = await get(requestsQuery);
        
        if (!snapshot.exists()) {
          console.log('No requests found in Firebase');
          return this.getRequestsFromLocalStorage(userId, role);
        }

        const requests = snapshot.val();
        const requestsList = Object.keys(requests).map(key => ({
          ...requests[key],
          id: key,
          createdAt: new Date(requests[key].createdAt),
          updatedAt: new Date(requests[key].updatedAt),
          scheduledTime: requests[key].scheduledTime ? new Date(requests[key].scheduledTime) : undefined,
        }));
        
        console.log('Found requests from Firebase:', requestsList.length);
        return requestsList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      },
      () => this.getRequestsFromLocalStorage(userId, role),
      { path: '/requests', field }
    );
  }

  // Aliases para compatibilidad con RequestsPage
  async getTutorRequests(tutorId: string): Promise<TutorRequest[]> {
    return this.getUserRequests(tutorId, 'tutor');
  }

  async getStudentRequests(studentId: string): Promise<TutorRequest[]> {
    return this.getUserRequests(studentId, 'student');
  }

  // Función helper para obtener solicitudes de localStorage
  private getRequestsFromLocalStorage(userId: string, role: 'student' | 'tutor'): TutorRequest[] {
    try {
      const localRequests = JSON.parse(localStorage.getItem('tutoring-requests') || '[]');
      const filteredRequests = localRequests.filter((req: any) => {
        return role === 'student' ? req.studentId === userId : req.tutorId === userId;
      });
      
      // Si no hay solicitudes en localStorage y es un usuario mock, retornar datos mock
      if (filteredRequests.length === 0 && userId.startsWith('mock-')) {
        return this.getMockRequestsForUser(userId, role);
      }
      
      // Convertir strings de fecha a objetos Date
      const processedRequests = filteredRequests.map((req: any) => ({
        ...req,
        createdAt: new Date(req.createdAt),
        updatedAt: new Date(req.updatedAt),
        scheduledTime: req.scheduledTime ? new Date(req.scheduledTime) : undefined,
      }));
      
      console.log(`Found ${processedRequests.length} requests in localStorage for ${role} ${userId}`);
      return processedRequests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (localError) {
      console.error('Error accessing localStorage:', localError);
      // En caso de error, si es usuario mock, retornar datos mock
      if (userId.startsWith('mock-')) {
        return this.getMockRequestsForUser(userId, role);
      }
      return [];
    }
  }

  // Actualizar estado de solicitud
  async updateRequestStatus(requestId: string, status: TutorRequest['status']): Promise<TutorRequest> {
    try {
      const requestRef = ref(database, `requests/${requestId}`);
      const snapshot = await get(requestRef);
      
      if (!snapshot.exists()) {
        throw new Error('Solicitud no encontrada');
      }

      const updates = {
        status,
        updatedAt: new Date().toISOString()
      };

      await update(requestRef, updates);
      
      const updatedSnapshot = await get(requestRef);
      const requestData = updatedSnapshot.val();

      // Enviar notificación según el estado
      try {
        if (status === 'accepted') {
          await notificationsService.createRequestNotification(
            'request_accepted',
            requestData.studentId,
            { id: requestId, subject: requestData.subject }
          );
        } else if (status === 'rejected') {
          await notificationsService.createRequestNotification(
            'request_rejected',
            requestData.studentId,
            { id: requestId, subject: requestData.subject }
          );
        } else if (status === 'cancelled') {
          // Notificar tanto al estudiante como al tutor
          const recipientId = requestData.studentId !== requestData.tutorId ? 
            (requestData.studentId === requestData.tutorId ? requestData.tutorId : requestData.studentId) :
            requestData.tutorId;
          await notificationsService.createRequestNotification(
            'request_cancelled',
            recipientId,
            { id: requestId, subject: requestData.subject }
          );
        } else if (status === 'completed') {
          await notificationsService.createRequestNotification(
            'request_completed',
            requestData.studentId,
            { id: requestId, subject: requestData.subject }
          );
        }
      } catch (notificationError) {
        console.warn('Error sending notification:', notificationError);
        // No fallar la actualización si falla la notificación
      }
      
      // Disparar evento para actualizar estadísticas
      window.dispatchEvent(new CustomEvent('request-status-changed', { 
        detail: { requestId, status, tutorId: requestData.tutorId, studentId: requestData.studentId } 
      }));
      
      console.log('📊 Request status changed event dispatched:', status);
      
      return {
        ...requestData,
        createdAt: new Date(requestData.createdAt),
        updatedAt: new Date(requestData.updatedAt),
        scheduledTime: requestData.scheduledTime ? new Date(requestData.scheduledTime) : undefined,
      };
    } catch (error) {
      console.error('Error updating request status, trying localStorage fallback:', error);
      
      // Fallback a localStorage si Firebase falla
      try {
        const localRequests = JSON.parse(localStorage.getItem('tutoring-requests') || '[]');
        const requestIndex = localRequests.findIndex((req: TutorRequest) => req.id === requestId);
        
        if (requestIndex === -1) {
          throw new Error('Solicitud no encontrada en localStorage');
        }

        const updatedRequest = {
          ...localRequests[requestIndex],
          status,
          updatedAt: new Date().toISOString(),
        };

        localRequests[requestIndex] = updatedRequest;
        console.log('💾 Actualizando solicitud en localStorage:', updatedRequest);
        localStorage.setItem('tutoring-requests', JSON.stringify(localRequests));
        console.log('✅ Solicitud actualizada en localStorage. Total:', localRequests.length);
        
        return {
          ...updatedRequest,
          createdAt: new Date(updatedRequest.createdAt),
          updatedAt: new Date(updatedRequest.updatedAt),
          scheduledTime: updatedRequest.scheduledTime ? new Date(updatedRequest.scheduledTime) : undefined,
        };
      } catch (localError) {
        console.error('Error updating request in localStorage:', localError);
        throw new Error('Error al actualizar la solicitud');
      }
    }
  }

  // Obtener detalles del tutor
  async getTutorById(tutorId: string): Promise<User | null> {
    try {
      const tutorRef = ref(database, `users/${tutorId}`);
      const snapshot = await get(tutorRef);
      
      if (!snapshot.exists()) {
        return null;
      }

      const userData = snapshot.val();
      return {
        ...userData,
        createdAt: new Date(userData.createdAt),
        updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : undefined,
      };
    } catch (error) {
      console.error('Error getting tutor:', error);
      return null;
    }
  }

  // Crear reseña
  async createReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    try {
      return await reviewsService.createReview(review);
    } catch (error) {
      console.error('Error creating review:', error);
      throw new Error('Error al crear la reseña');
    }
  }

  // Obtener reseñas de un tutor
  async getTutorReviews(tutorId: string): Promise<Review[]> {
    try {
      return await reviewsService.getTutorReviews(tutorId);
    } catch (error) {
      console.error('Error getting tutor reviews:', error);
      return [];
    }
  }

  // Escuchar cambios en tiempo real para solicitudes
  onRequestsChanged(userId: string, role: 'student' | 'tutor', callback: (requests: TutorRequest[]) => void): () => void {
    try {
      const requestsRef = ref(database, 'requests');
      const field = role === 'student' ? 'studentId' : 'tutorId';
      const requestsQuery = query(requestsRef, orderByChild(field), equalTo(userId));

      const handleValueChange = (snapshot: any) => {
        if (snapshot.exists()) {
          const requests = snapshot.val();
          const requestsList = Object.keys(requests).map(key => ({
            ...requests[key],
            id: key,
            createdAt: new Date(requests[key].createdAt),
            updatedAt: new Date(requests[key].updatedAt),
            scheduledTime: requests[key].scheduledTime ? new Date(requests[key].scheduledTime) : undefined,
          }));
          callback(requestsList);
        } else {
          callback([]);
        }
      };

      const handleError = (error: any) => {
        console.warn('Firebase real-time listener error, using localStorage fallback:', error);
        
        // Fallback a localStorage si Firebase falla
        const localRequests = JSON.parse(localStorage.getItem('tutoring-requests') || '[]');
        const filteredRequests = localRequests.filter((req: TutorRequest) => {
          return role === 'student' ? req.studentId === userId : req.tutorId === userId;
        });
        
        callback(filteredRequests);
      };

      onValue(requestsQuery, handleValueChange, handleError);

      // Retornar función para cancelar la suscripción
      return () => {
        off(requestsQuery, 'value', handleValueChange);
      };
    } catch (error) {
      console.warn('Failed to set up Firebase listener, using localStorage only:', error);
      
      // Si no se puede configurar la escucha, usar solo localStorage
      const localRequests = JSON.parse(localStorage.getItem('tutoring-requests') || '[]');
      const filteredRequests = localRequests.filter((req: TutorRequest) => {
        return role === 'student' ? req.studentId === userId : req.tutorId === userId;
      });
      
      callback(filteredRequests);
      
      // Retornar función vacía para cleanup
      return () => {};
    }
  }

  // Obtener solicitudes mock para un usuario específico
  private getMockRequestsForUser(userId: string, role: 'student' | 'tutor'): TutorRequest[] {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    const mockRequests: TutorRequest[] = [];

    if (role === 'tutor') {
      // Solicitudes para tutores mock
      if (userId === 'mock-1') {
        mockRequests.push(
          {
            id: 'req-mock-1-1',
            studentId: 'mock-student-1',
            tutorId: 'mock-1',
            subject: 'Cálculo Diferencial',
            description: 'Necesito ayuda con límites y derivadas para el parcial de la próxima semana.',
            status: 'pending',
            createdAt: oneHourAgo,
            updatedAt: oneHourAgo,
            scheduledTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // En 2 días
            duration: 90,
            location: 'Bogotá, Cundinamarca',
            hourlyRate: 35000,
            totalAmount: 52500,
            isEmergency: false,
            isImmediate: false,
            paymentMethod: 'Tarjeta de crédito',
            hasReview: false
          },
          {
            id: 'req-mock-1-2',
            studentId: 'mock-student-2',
            tutorId: 'mock-1',
            subject: 'Estadística',
            description: 'Ayuda con análisis de varianza y regresión lineal.',
            status: 'completed',
            createdAt: twoDaysAgo,
            updatedAt: oneDayAgo,
            scheduledTime: oneDayAgo,
            duration: 60,
            location: 'Virtual',
            hourlyRate: 35000,
            totalAmount: 35000,
            isEmergency: false,
            isImmediate: false,
            paymentMethod: 'PSE',
            hasReview: true
          }
        );
      } else if (userId === 'mock-2') {
        mockRequests.push(
          {
            id: 'req-mock-2-1',
            studentId: 'mock-student-2',
            tutorId: 'mock-2',
            subject: 'Biología',
            description: 'Repaso de metabolismo celular y respiración.',
            status: 'active',
            createdAt: oneDayAgo,
            updatedAt: oneHourAgo,
            scheduledTime: new Date(now.getTime() + 60 * 60 * 1000), // En 1 hora
            duration: 120,
            location: 'Medellín, Antioquia',
            hourlyRate: 40000,
            totalAmount: 80000,
            isEmergency: false,
            isImmediate: false,
            paymentMethod: 'Efecty',
            hasReview: false
          }
        );
      }
    } else {
      // Solicitudes para estudiantes mock
      if (userId === 'mock-student-1') {
        mockRequests.push(
          {
            id: 'req-mock-1-1',
            studentId: 'mock-student-1',
            tutorId: 'mock-1',
            subject: 'Cálculo Diferencial',
            description: 'Necesito ayuda con límites y derivadas para el parcial de la próxima semana.',
            status: 'pending',
            createdAt: oneHourAgo,
            updatedAt: oneHourAgo,
            scheduledTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // En 2 días
            duration: 90,
            location: 'Bogotá, Cundinamarca',
            hourlyRate: 35000,
            totalAmount: 52500,
            isEmergency: false,
            isImmediate: false,
            paymentMethod: 'Tarjeta de crédito',
            hasReview: false
          }
        );
      } else if (userId === 'mock-student-2') {
        mockRequests.push(
          {
            id: 'req-mock-1-2',
            studentId: 'mock-student-2',
            tutorId: 'mock-1',
            subject: 'Estadística',
            description: 'Ayuda con análisis de varianza y regresión lineal.',
            status: 'completed',
            createdAt: twoDaysAgo,
            updatedAt: oneDayAgo,
            scheduledTime: oneDayAgo,
            duration: 60,
            location: 'Virtual',
            hourlyRate: 35000,
            totalAmount: 35000,
            isEmergency: false,
            isImmediate: false,
            paymentMethod: 'PSE',
            hasReview: true
          },
          {
            id: 'req-mock-2-1',
            studentId: 'mock-student-2',
            tutorId: 'mock-2',
            subject: 'Biología',
            description: 'Repaso de metabolismo celular y respiración.',
            status: 'active',
            createdAt: oneDayAgo,
            updatedAt: oneHourAgo,
            scheduledTime: new Date(now.getTime() + 60 * 60 * 1000), // En 1 hora
            duration: 120,
            location: 'Medellín, Antioquia',
            hourlyRate: 40000,
            totalAmount: 80000,
            isEmergency: false,
            isImmediate: false,
            paymentMethod: 'Efecty',
            hasReview: false
          }
        );
      }
    }

    return mockRequests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const tutoringService = new TutoringService();