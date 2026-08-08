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
  hourlyPoints: number; // Cost in Merit Points
  rating: number;
  totalReviews: number;
  availability: boolean;
  experience: string;
  education?: string;
  languages?: string[];
  totalStudents?: number;
  responseTime?: string;
  achievements?: string[];
  // Reputation Economy
  reputationPoints: number;
  redeemablePoints?: number; // Puntos disponibles para canjear por UDcoins
  /** Moneda de la app (UDcoins); vive en Realtime Database junto al perfil */
  udCoins?: number;
  badges: string[];
  rank: string; // 'Novato', 'Monitor', 'Maestro', etc.
  // Modo actual
  currentMode: UserMode;
  // Permisos especiales
  // Permisos especiales
  isTestUser?: boolean; // Usuario maestro con acceso a opciones de prueba

  // Roles Académicos (Sub-roles)
  academicRole?: 'docente' | 'estudiante' | 'administrativo';
  isAdmin?: boolean; // Permite acceso total al panel de administración
}

export interface SubjectGroup {
  id: string;
  code: string; // e.g., "MAT101"
  name: string; // e.g., "Cálculo Diferencial"
  groupCode: string; // e.g., "01"
  teacherId: string;
  teacherName: string;
  term: string; // e.g., "2024-3"
  schedule?: string;
  students: string[]; // List of student User IDs
  createdAt: Date;
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
  studentName?: string; // Cache for display
  tutorName?: string;   // Cache for display
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
  hasPaid?: boolean; // Indicates if the solidarity payment (points) has been made
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
  attendanceRate?: number; // 0-1, para análisis de IA
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

// ============================================
// TIPOS PARA INTERACCIONES DE USUARIOS
// Complementa la encuesta de usabilidad
// ============================================

/**
 * Tipos de interacciones que complementan las preguntas de la encuesta
 * Q1-Q15 de la encuesta de usabilidad de TutorApp
 */
export type UserInteractionType =
  // Q1: Frecuencia de uso
  | 'app_opened'                    // App abierta
  | 'app_closed'                    // App cerrada
  | 'session_started'                // Sesión iniciada
  | 'session_ended'                  // Sesión finalizada

  // Q3, Q4: Navegación
  | 'page_viewed'                    // Página visitada
  | 'navigation_click'               // Click en navegación
  | 'back_button_used'              // Botón atrás usado
  | 'search_initiated'               // Búsqueda iniciada

  // Q5: Velocidad/Rendimiento
  | 'page_load_time'                 // Tiempo de carga de página
  | 'api_response_time'              // Tiempo de respuesta de API
  | 'error_occurred'                 // Error ocurrido
  | 'performance_metric'             // Métrica de rendimiento

  // Q6, Q7: Diseño/Estética
  | 'ui_element_clicked'             // Elemento UI clickeado
  | 'theme_changed'                  // Tema cambiado
  | 'font_size_changed'              // Tamaño de fuente cambiado

  // Q8: Responsive
  | 'device_orientation_changed'     // Orientación de dispositivo cambiada
  | 'screen_resize'                  // Redimensionamiento de pantalla
  | 'responsive_breakpoint'          // Punto de quiebre responsive

  // Q9, Q10, Q11: Búsqueda de tutores
  | 'tutor_search_performed'         // Búsqueda de tutores realizada
  | 'tutor_search_filter_applied'    // Filtro aplicado en búsqueda
  | 'tutor_profile_viewed'           // Perfil de tutor visto
  | 'tutor_profile_contact_clicked'  // Click en contacto de tutor

  // Q12: Chat
  | 'chat_message_sent'              // Mensaje de chat enviado
  | 'chat_message_received'          // Mensaje de chat recibido
  | 'chat_opened'                    // Chat abierto
  | 'chat_closed'                    // Chat cerrado
  | 'chat_response_time'             // Tiempo de respuesta en chat

  // Q13: Solicitud de tutoría
  | 'tutoring_request_created'       // Solicitud de tutoría creada
  | 'tutoring_request_accepted'      // Solicitud aceptada
  | 'tutoring_request_rejected'      // Solicitud rechazada
  | 'tutoring_request_completed'     // Solicitud completada
  | 'tutoring_request_cancelled'     // Solicitud cancelada

  // Q14: Pagos
  | 'payment_initiated'              // Pago iniciado
  | 'payment_completed'              // Pago completado
  | 'payment_failed'                 // Pago fallido
  | 'payment_method_selected'        // Método de pago seleccionado

  // Q15: IA
  | 'ai_feature_used'                // Funcionalidad de IA usada
  | 'ai_prediction_viewed'           // Predicción de IA vista
  | 'ai_suggestion_accepted'         // Sugerencia de IA aceptada
  | 'ai_suggestion_rejected'         // Sugerencia de IA rechazada
  | 'ai_chat_interaction'            // Interacción con chat de IA

  // Eventos generales
  | 'feature_discovered'             // Funcionalidad descubierta
  | 'help_accessed'                  // Ayuda accedida
  | 'feedback_submitted'              // Feedback enviado
  | 'survey_started'                 // Encuesta iniciada
  | 'survey_completed';              // Encuesta completada

/**
 * Interfaz para eventos de interacción de usuarios
 * Almacena datos que complementan las respuestas de la encuesta
 */
export interface UserInteraction {
  id: string;
  userId: string;
  userRole: 'student' | 'tutor' | 'parent' | 'other';
  type: UserInteractionType;

  // Contexto de la interacción
  page?: string;                    // Página donde ocurrió
  section?: string;                 // Sección específica
  elementId?: string;               // ID del elemento interactuado

  // Datos específicos según el tipo
  metadata?: {
    // Para búsquedas
    searchQuery?: string;
    filters?: Record<string, any>;
    resultsCount?: number;

    // Para perfiles
    tutorId?: string;
    tutorName?: string;

    // Para chat
    messageLength?: number;
    responseTime?: number;           // En milisegundos
    chatId?: string;

    // Para solicitudes
    requestId?: string;
    subject?: string;
    duration?: number;
    amount?: number;

    // Para pagos
    paymentMethod?: string;
    paymentAmount?: number;
    paymentStatus?: string;

    // Para IA
    aiFeature?: string;
    aiModel?: string;
    aiConfidence?: number;

    // Para rendimiento
    loadTime?: number;               // En milisegundos
    errorMessage?: string;
    errorCode?: string;

    // Para navegación
    fromPage?: string;
    toPage?: string;
    navigationMethod?: string;

    // Para responsive
    screenWidth?: number;
    screenHeight?: number;
    deviceType?: 'mobile' | 'tablet' | 'desktop';
    orientation?: 'portrait' | 'landscape';

    // Datos adicionales flexibles
    [key: string]: any;
  };

  // Información de sesión
  sessionId?: string;
  sessionDuration?: number;          // Duración de la sesión en segundos

  // Información del dispositivo
  deviceInfo?: {
    platform?: string;
    userAgent?: string;
    language?: string;
    timezone?: string;
  };

  // Timestamps
  timestamp: Date;
  createdAt: Date;
}

/**
 * Resumen de interacciones por usuario
 * Permite analizar patrones de uso que complementan la encuesta
 */
export interface UserInteractionSummary {
  userId: string;
  userRole: 'student' | 'tutor' | 'parent' | 'other';

  // Frecuencia de uso (Q1)
  totalSessions: number;
  totalAppOpens: number;
  averageSessionDuration: number;   // En segundos
  lastActiveDate: Date;
  daysActive: number;                // Días activos en el período

  // Navegación (Q3, Q4)
  totalPageViews: number;
  uniquePagesVisited: number;
  averageNavigationTime: number;    // Tiempo promedio entre navegaciones
  mostVisitedPages: Array<{
    page: string;
    count: number;
  }>;

  // Rendimiento (Q5)
  averagePageLoadTime: number;       // En milisegundos
  totalErrors: number;
  errorRate: number;                 // Porcentaje de errores

  // Búsqueda de tutores (Q9, Q10, Q11)
  totalTutorSearches: number;
  totalFiltersApplied: number;
  totalTutorProfilesViewed: number;
  averageSearchResults: number;

  // Chat (Q12)
  totalChatMessages: number;
  totalChatSessions: number;
  averageResponseTime: number;       // En milisegundos
  averageMessageLength: number;

  // Solicitudes (Q13)
  totalRequestsCreated: number;
  totalRequestsCompleted: number;
  totalRequestsCancelled: number;
  averageRequestDuration: number;    // En minutos

  // Pagos (Q14)
  totalPayments: number;
  totalPaymentAmount: number;
  preferredPaymentMethod?: string;
  paymentSuccessRate: number;        // Porcentaje

  // IA (Q15)
  totalAIFeaturesUsed: number;
  aiFeaturesUsed: string[];
  aiAcceptanceRate: number;          // Porcentaje de sugerencias aceptadas

  // Período de análisis
  periodStart: Date;
  periodEnd: Date;
  lastUpdated: Date;
}