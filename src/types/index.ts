// Tipos principales de la aplicación de tutorías

export type UserMode = 'student' | 'tutor';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  createdAt: Date;
  updatedAt?: Date;
  // Perfil como estudiante
  grade?: string;
  studentCode?: string; // Código estudiantil
  preferredSubjects: string[];
  // Perfil como tutor
  subjects: string[];
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  availability: boolean;
  experience: string;
  education?: string;
  languages?: string[];
  totalStudents?: number;
  responseTime?: string;
  achievements?: string[];
  // Modo actual
  currentMode: UserMode;
  // Permisos especiales
  isTestUser?: boolean; // Usuario maestro con acceso a opciones de prueba
}

// Interfaces heredadas para compatibilidad
export interface Tutor extends User {
  currentMode: 'tutor';
}

export interface Student extends User {
  currentMode: 'student';
}

export interface TutorRequest {
  id: string;
  studentId: string;
  tutorId: string;
  subject: string;
  description: string;
  scheduledTime?: Date;
  preferredDateTime?: Date; // Para compatibilidad
  isImmediate?: boolean;
  isEmergency?: boolean; // Para compatibilidad con formulario
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled' | 'in_progress';
  location?: string;
  hourlyRate: number;
  duration: number; // en minutos
  totalAmount: number;
  paymentMethod?: string;
  hasReview?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
  requestId?: string;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  updatedAt: Date;
  requestId?: string;
}

export interface Payment {
  id: string;
  requestId: string;
  studentId: string;
  tutorId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  stripePaymentId?: string;
  createdAt: Date;
}

export interface Review {
  id: string;
  requestId: string;
  studentId: string;
  tutorId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'request' | 'message' | 'payment' | 'review';
  read: boolean;
  data?: any;
  createdAt: Date;
}

export interface Subject {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
}

// Ubicaciones de Colombia por regiones principales
export interface ColombianLocation {
  id: string;
  city: string;
  department: string;
  region: string;
  isCapital?: boolean;
}

// Enum para grados académicos comunes en Colombia
export type AcademicLevel = 
  | 'primaria' 
  | 'bachillerato' 
  | 'tecnico' 
  | 'tecnologo' 
  | 'pregrado' 
  | 'especializacion' 
  | 'maestria' 
  | 'doctorado';

// Interface para precios en COP
export interface PriceRange {
  min: number;
  max: number;
  currency: 'COP';
}

// Tipos para gestión académica
export interface University {
  id: string;
  name: string;
  location: string;
  logo?: string;
}

export interface Faculty {
  id: string;
  universityId: string;
  name: string;
  code: string;
}

export interface AcademicProgram {
  id: string;
  facultyId: string;
  name: string;
  code: string;
  duration: number; // semestres
  degree: 'Pregrado' | 'Especialización' | 'Maestría' | 'Doctorado';
}

export interface Professor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  office?: string;
  specialties: string[];
}

export interface Classroom {
  id: string;
  code: string;
  building: string;
  capacity?: number;
  resources: string[]; // proyector, aire acondicionado, etc.
}

export interface Schedule {
  day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  classroomId?: string;
}

export interface Evaluation {
  id: string;
  name: string; // "Parcial 1", "Quiz 2", "Proyecto Final", etc.
  percentage: number; // 0-100
  maxGrade: number; // nota máxima posible (ej: 5.0)
  actualGrade?: number; // nota obtenida
  date?: Date;
  description?: string;
}

export interface AcademicSubject {
  id: string;
  userId: string;
  code: string; // código de la materia (ej: MAT101)
  name: string;
  credits: number;
  semester: number;
  academicPeriod: string; // "2024-1", "2024-2", etc.
  professorId?: string;
  schedules: Schedule[];
  evaluations: Evaluation[];
  minPassingGrade: number; // nota mínima para aprobar (ej: 3.0)
  currentAverage?: number; // promedio actual calculado
  projectedGrade?: number; // nota proyectada
  neededGrade?: number; // nota necesaria en evaluaciones restantes
  status: 'En Curso' | 'Aprobada' | 'Reprobada' | 'Retirada';
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Semester {
  id: string;
  userId: string;
  code: string; // "2024-1", "2024-2", etc.
  name: string; // "Primer Semestre 2024", "Segundo Semestre 2024"
  year: number;
  period: number; // 1, 2, 3 (para intersemestrales)
  isActive: boolean; // semestre actual
  startDate?: Date;
  endDate?: Date;
  subjects: AcademicSubject[];
  semesterGPA?: number;
  totalCredits: number;
  status: 'Planificado' | 'En Curso' | 'Completado' | 'Cancelado';
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AcademicRecord {
  userId: string;
  universityId: string;
  facultyId: string;
  programId: string;
  studentId: string; // código estudiantil
  currentSemesterLevel: number; // nivel académico (1, 2, 3, etc.)
  cumulativeGPA: number;
  totalCreditsCompleted: number;
  semesters: Semester[];
  academicPeriods: string[];
  graduationProjectedDate?: Date;
}

// Documentación universitaria
export interface UniversityDocument {
  id: string;
  title: string;
  description: string;
  category: DocumentCategory;
  type: DocumentType;
  fileUrl?: string;
  downloadUrl?: string;
  content?: string; // Para documentos embebidos
  tags: string[];
  universityId: string;
  facultyId?: string; // Opcional si es específico de facultad
  publishedDate: Date;
  effectiveDate?: Date; // Para resoluciones y estatutos
  expiryDate?: Date;
  version: string;
  status: DocumentStatus;
  priority: DocumentPriority;
  author: string;
  authorRole: string;
  views: number;
  downloads: number;
  language: string;
  fileSize?: number; // En bytes
  thumbnailUrl?: string;
  attachments?: DocumentAttachment[];
  relatedDocuments?: string[]; // IDs de documentos relacionados
  searchKeywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type DocumentCategory = 
  | 'Estatutos'
  | 'Reglamentos'
  | 'Resoluciones'
  | 'Noticias'
  | 'Comunicados'
  | 'Circulares'
  | 'Calendarios'
  | 'Guías'
  | 'Manuales'
  | 'Convocatorias'
  | 'Actas'
  | 'Políticas'
  | 'Procedimientos';

export type DocumentType = 
  | 'PDF'
  | 'Word'
  | 'Excel'
  | 'PowerPoint'
  | 'Imagen'
  | 'Video'
  | 'Enlace'
  | 'Texto'
  | 'HTML';

export type DocumentStatus = 
  | 'Borrador'
  | 'Publicado'
  | 'Archivado'
  | 'Revisión'
  | 'Vencido';

export type DocumentPriority = 
  | 'Baja'
  | 'Normal'
  | 'Alta'
  | 'Urgente';

export interface DocumentAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface DocumentComment {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  userRole: string;
  content: string;
  isPublic: boolean;
  createdAt: Date;
}

export interface DocumentSearchFilters {
  category?: DocumentCategory;
  status?: DocumentStatus;
  priority?: DocumentPriority;
  universityId?: string;
  facultyId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  searchQuery?: string;
}