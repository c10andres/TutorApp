# 📊 ESTRUCTURA DE DATOS FIREBASE - TutorApp

## Índice
1. [Colecciones Principales](#colecciones-principales)
2. [Tipos TypeScript](#tipos-typescript)
3. [Ejemplos de Documentos](#ejemplos-de-documentos)
4. [Relaciones entre Colecciones](#relaciones-entre-colecciones)
5. [Queries Comunes](#queries-comunes)

---

## 1. Colecciones Principales

### Estructura General
```
📁 Firestore Database
├── 📄 users (colección)
│   ├── {userId} (documento)
│   │   └── reviews (subcolección)
│   │       └── {reviewId} (documento)
│   └── ...
├── 📄 tutoring_requests (colección)
├── 📄 chats (colección)
│   └── {chatId} (documento)
│       └── messages (subcolección)
├── 📄 reviews (colección)
├── 📄 payments (colección)
├── 📄 transactions (colección)
├── 📄 notifications (colección)
├── 📄 semesters (colección)
│   └── {semesterId} (documento)
│       └── subjects (subcolección)
├── 📄 documents (colección)
├── 📄 study_plans (colección)
│   └── {planId} (documento)
│       └── tasks (subcolección)
├── 📄 support_tickets (colección)
│   └── {ticketId} (documento)
│       └── messages (subcolección)
└── 📄 analytics (colección)
```

---

## 2. Tipos TypeScript

### 2.1 User (Usuario)
```typescript
interface User {
  // Identificación
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  
  // Ubicación
  location: string; // Ej: "Bogotá, D.C."
  bio?: string;
  
  // Roles Dinámicos
  isStudent: boolean;
  isTutor: boolean;
  
  // Datos de Tutor (si isTutor === true)
  subjects?: string[]; // ["Matemáticas", "Física"]
  hourlyRate?: number; // 50000 (COP)
  rating?: number; // 4.8
  reviewCount?: number; // 25
  totalSessions?: number; // 100
  education?: string; // "Ingeniero de la Universidad Nacional"
  experience?: string; // "5 años enseñando matemáticas"
  certificates?: string[]; // URLs de certificados
  availability?: {
    [day: string]: Array<{ start: string; end: string }>;
  };
  // Ejemplo:
  // {
  //   "monday": [{ "start": "14:00", "end": "18:00" }],
  //   "tuesday": [{ "start": "14:00", "end": "18:00" }]
  // }
  
  // Datos de Estudiante
  academicLevel?: string; // "Universitario"
  interests?: string[]; // ["Matemáticas", "Programación"]
  
  // Estadísticas
  totalEarned?: number; // Como tutor (COP)
  totalSpent?: number; // Como estudiante (COP)
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActive?: Timestamp;
}
```

### 2.2 TutoringRequest (Solicitud de Tutoría)
```typescript
interface TutoringRequest {
  // IDs
  id: string;
  studentId: string; // UID del estudiante
  tutorId: string; // UID del tutor
  
  // Detalles de la tutoría
  subject: string; // "Cálculo I"
  description: string; // "Necesito ayuda con derivadas"
  
  // Fecha y Duración
  requestedDate: Timestamp; // Fecha y hora solicitada
  duration: number; // Duración en minutos (60, 90, 120)
  
  // Ubicación
  mode: 'online' | 'presencial';
  location?: string; // Si es presencial: "Café Juan Valdez, Calle 85"
  
  // Precio
  price: number; // Precio total en COP
  
  // Estado
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  
  // Notas adicionales
  notes?: string;
  urgency?: 'low' | 'medium' | 'high';
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  
  // Chat asociado
  chatId?: string;
}
```

### 2.3 Chat
```typescript
interface Chat {
  id: string;
  participants: string[]; // [studentId, tutorId]
  requestId?: string; // Solicitud de tutoría asociada
  
  // Último mensaje (para listado)
  lastMessage?: string;
  lastMessageAt?: Timestamp;
  lastMessageSenderId?: string;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

### 2.4 Message (Mensaje de Chat)
```typescript
interface Message {
  id: string;
  chatId: string;
  senderId: string;
  
  // Contenido
  text: string;
  
  // Archivos adjuntos
  fileURL?: string;
  fileName?: string;
  fileType?: string; // 'image', 'document', 'video'
  fileSize?: number;
  
  // Estado
  read: boolean;
  readAt?: Timestamp;
  
  // Metadata
  createdAt: Timestamp;
  
  // Reacciones (opcional)
  reactions?: {
    [userId: string]: string; // emoji
  };
}
```

### 2.5 Review (Reseña)
```typescript
interface Review {
  id: string;
  studentId: string;
  tutorId: string;
  requestId: string; // Tutoría que se está calificando
  
  // Calificación
  rating: number; // 1-5 estrellas
  comment: string;
  
  // Aspectos específicos (1-5 cada uno)
  aspects: {
    knowledge: number; // Conocimiento del tema
    punctuality: number; // Puntualidad
    communication: number; // Comunicación
    patience: number; // Paciencia
    materials: number; // Materiales proporcionados
    value: number; // Relación calidad-precio
  };
  
  // Configuración
  anonymous: boolean;
  
  // Respuesta del tutor (opcional)
  tutorResponse?: {
    text: string;
    createdAt: Timestamp;
  };
  
  // Metadata
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  
  // Útil para otros estudiantes
  helpfulCount?: number;
  reportCount?: number;
}
```

### 2.6 Payment (Pago)
```typescript
interface Payment {
  id: string;
  requestId: string;
  studentId: string;
  tutorId: string;
  
  // Monto
  amount: number; // En COP
  currency: 'COP';
  
  // Desglose
  subtotal: number;
  platformFee: number; // Comisión de la plataforma
  tax?: number;
  
  // Método de pago
  method: 'pse' | 'card' | 'nequi' | 'daviplata' | 'efectivo' | 'baloto';
  
  // Estado
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  
  // Detalles de la transacción externa
  transactionId?: string; // ID de la pasarela de pagos
  paymentGateway?: string; // 'mercadopago', 'wompi', etc.
  
  // Metadata
  createdAt: Timestamp;
  completedAt?: Timestamp;
  failedAt?: Timestamp;
  refundedAt?: Timestamp;
  
  // Notas
  failureReason?: string;
  notes?: string;
}
```

### 2.7 Notification (Notificación)
```typescript
interface Notification {
  id: string;
  userId: string; // Destinatario
  
  // Tipo y contenido
  type: 'request' | 'message' | 'review' | 'payment' | 'system' | 'reminder';
  title: string;
  message: string;
  
  // Datos adicionales
  data?: {
    requestId?: string;
    chatId?: string;
    userId?: string;
    [key: string]: any;
  };
  
  // Estado
  read: boolean;
  readAt?: Timestamp;
  
  // Acciones
  actionUrl?: string;
  actionText?: string;
  
  // Metadata
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}
```

### 2.8 Semester (Semestre Académico)
```typescript
interface Semester {
  id: string;
  userId: string;
  
  // Información básica
  name: string; // "2024-1" o "Primer Semestre 2024"
  startDate: Timestamp;
  endDate: Timestamp;
  
  // Institución
  university?: string;
  program?: string; // Carrera
  
  // Estado
  active: boolean;
  archived: boolean;
  
  // Estadísticas calculadas
  totalCredits?: number;
  currentGPA?: number; // Promedio del semestre
  
  // Metadata
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

### 2.9 Subject (Materia de un Semestre)
```typescript
interface Subject {
  id: string;
  
  // Información básica
  name: string; // "Cálculo Diferencial"
  code?: string; // "MAT101"
  credits: number;
  
  // Profesor
  professor?: string;
  professorEmail?: string;
  
  // Horario
  schedule?: {
    [day: string]: Array<{ start: string; end: string; room?: string }>;
  };
  
  // Calificaciones
  grades: Array<{
    name: string; // "Parcial 1"
    value: number; // Nota obtenida
    percentage: number; // Peso en la nota final (20%)
    date: Timestamp;
  }>;
  
  // Nota final
  finalGrade?: number;
  passed?: boolean;
  
  // Tutorías relacionadas
  tutoringRequestIds?: string[];
  
  // Metadata
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

### 2.10 Document (Documento Universitario)
```typescript
interface Document {
  id: string;
  userId: string; // Quien subió el documento
  
  // Información básica
  title: string;
  description?: string;
  subject: string; // Materia relacionada
  
  // Tipo
  type: 'guia' | 'apuntes' | 'ejercicios' | 'examen' | 'presentacion' | 'video' | 'link';
  
  // Archivo
  fileURL: string; // URL del archivo en Storage
  fileName: string;
  fileType: string; // 'application/pdf', 'image/png', etc.
  fileSize: number; // En bytes
  
  // Privacidad
  privacy: 'public' | 'contacts' | 'private';
  
  // Contexto académico
  university?: string;
  professor?: string;
  semester?: string;
  year?: number;
  
  // Estadísticas
  rating?: number; // Calificación promedio (1-5)
  ratingCount?: number;
  downloads: number;
  views: number;
  
  // Tags
  tags?: string[];
  
  // Metadata
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

### 2.11 StudyPlan (Plan de Estudio)
```typescript
interface StudyPlan {
  id: string;
  userId: string;
  
  // Información básica
  name: string; // "Plan para Examen Final de Cálculo"
  description?: string;
  
  // Fechas
  startDate: Timestamp;
  endDate: Timestamp;
  
  // Objetivos
  goals: string[]; // ["Aprobar con 4.5", "Dominar derivadas"]
  
  // Materias incluidas
  subjects: string[];
  
  // Técnica de estudio
  technique: 'pomodoro' | 'spaced-repetition' | 'active-recall' | 'feynman' | 'custom';
  
  // Configuración de técnica
  pomodoroConfig?: {
    workMinutes: number; // 25
    breakMinutes: number; // 5
    longBreakMinutes: number; // 15
    sessionsBeforeLongBreak: number; // 4
  };
  
  // Estado
  active: boolean;
  completed: boolean;
  
  // Progreso
  progress?: number; // 0-100
  
  // Estadísticas
  totalHoursPlanned?: number;
  totalHoursStudied?: number;
  tasksCompleted?: number;
  tasksTotal?: number;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  completedAt?: Timestamp;
}
```

### 2.12 Task (Tarea de Plan de Estudio)
```typescript
interface Task {
  id: string;
  
  // Información básica
  title: string;
  description?: string;
  subject: string;
  
  // Fecha y duración
  dueDate: Timestamp;
  duration: number; // Minutos estimados
  
  // Prioridad
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Estado
  completed: boolean;
  completedAt?: Timestamp;
  
  // Tiempo real
  actualDuration?: number; // Minutos reales
  
  // Recordatorios
  reminders?: Timestamp[];
  
  // Subtareas
  subtasks?: Array<{
    title: string;
    completed: boolean;
  }>;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

### 2.13 SupportTicket (Ticket de Soporte)
```typescript
interface SupportTicket {
  id: string;
  userId: string;
  
  // Información
  category: 'technical' | 'payment' | 'account' | 'tutoring' | 'security' | 'other';
  subject: string;
  description: string;
  
  // Estado
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  
  // Archivos adjuntos
  attachments?: Array<{
    url: string;
    name: string;
    type: string;
  }>;
  
  // Asignación
  assignedTo?: string; // ID del agente de soporte
  
  // Satisfacción
  satisfaction?: {
    rating: number; // 1-5
    comment?: string;
    createdAt: Timestamp;
  };
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt?: Timestamp;
  closedAt?: Timestamp;
}
```

### 2.14 Analytics (Análisis Académico)
```typescript
interface Analytics {
  userId: string;
  
  // Predicciones
  predictions: Array<{
    subject: string;
    predictedGrade: number; // 0-5
    confidence: number; // 0-100
    recommendations: string[];
    factors: {
      currentGrade?: number;
      studyHours?: number;
      tutoringSessions?: number;
      attendance?: number;
    };
    lastUpdated: Timestamp;
  }>;
  
  // Rendimiento histórico
  performance: Array<{
    date: Timestamp;
    subject: string;
    grade: number;
    hoursStudied: number;
    tutoringSessions: number;
    assignments: number;
    exams: number;
  }>;
  
  // Metas
  goals: Array<{
    subject: string;
    targetGrade: number;
    currentGrade: number;
    deadline: Timestamp;
    progress: number; // 0-100
    onTrack: boolean;
    actionsNeeded: string[];
  }>;
  
  // Patrones de estudio
  studyPatterns?: {
    bestTimeOfDay?: string; // "morning", "afternoon", "evening", "night"
    bestDayOfWeek?: string;
    averageSessionDuration?: number;
    optimalBreakTime?: number;
  };
  
  // Metadata
  updatedAt: Timestamp;
  lastCalculated: Timestamp;
}
```

### 2.15 Transaction (Transacción Financiera)
```typescript
interface Transaction {
  id: string;
  userId: string;
  
  // Tipo
  type: 'payment' | 'earning' | 'refund' | 'withdrawal' | 'fee';
  
  // Monto
  amount: number; // En COP
  currency: 'COP';
  
  // Descripción
  description: string;
  
  // Relacionado a
  relatedId?: string; // paymentId, requestId, etc.
  relatedType?: string; // 'payment', 'request', etc.
  
  // Balance
  balanceBefore: number;
  balanceAfter: number;
  
  // Método
  method?: string; // Para retiros: 'bank_transfer', etc.
  
  // Estado
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  
  // Metadata
  createdAt: Timestamp;
  completedAt?: Timestamp;
  
  // Detalles adicionales
  metadata?: {
    [key: string]: any;
  };
}
```

---

## 3. Ejemplos de Documentos

### Ejemplo 1: Usuario (Tutor)
```json
{
  "uid": "abc123",
  "email": "juan.perez@gmail.com",
  "displayName": "Juan Pérez",
  "phoneNumber": "+573001234567",
  "photoURL": "https://storage.googleapis.com/...",
  "location": "Bogotá, D.C.",
  "bio": "Ingeniero de sistemas con 8 años de experiencia enseñando programación y matemáticas.",
  
  "isStudent": false,
  "isTutor": true,
  
  "subjects": ["Programación", "Matemáticas", "Física"],
  "hourlyRate": 50000,
  "rating": 4.8,
  "reviewCount": 47,
  "totalSessions": 150,
  "education": "Ingeniero de Sistemas - Universidad Nacional de Colombia",
  "experience": "8 años enseñando en universidades y de forma privada",
  "certificates": [
    "https://storage.googleapis.com/.../cert1.pdf",
    "https://storage.googleapis.com/.../cert2.pdf"
  ],
  "availability": {
    "monday": [
      { "start": "14:00", "end": "20:00" }
    ],
    "wednesday": [
      { "start": "14:00", "end": "20:00" }
    ],
    "friday": [
      { "start": "16:00", "end": "22:00" }
    ],
    "saturday": [
      { "start": "09:00", "end": "17:00" }
    ]
  },
  
  "totalEarned": 7500000,
  
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-10-08T15:45:00Z",
  "lastActive": "2024-10-09T09:20:00Z"
}
```

### Ejemplo 2: Solicitud de Tutoría
```json
{
  "id": "req_abc123",
  "studentId": "user_student_123",
  "tutorId": "user_tutor_456",
  
  "subject": "Cálculo Diferencial",
  "description": "Necesito ayuda con límites y derivadas. Tengo examen la próxima semana.",
  
  "requestedDate": "2024-10-15T15:00:00Z",
  "duration": 90,
  
  "mode": "online",
  
  "price": 75000,
  
  "status": "accepted",
  
  "notes": "Preferiblemente usar Google Meet",
  "urgency": "high",
  
  "createdAt": "2024-10-09T10:00:00Z",
  "updatedAt": "2024-10-09T11:30:00Z",
  
  "chatId": "chat_xyz789"
}
```

### Ejemplo 3: Reseña
```json
{
  "id": "review_abc123",
  "studentId": "user_student_123",
  "tutorId": "user_tutor_456",
  "requestId": "req_abc123",
  
  "rating": 5,
  "comment": "Excelente tutor! Muy paciente y explica súper bien. Logré entender todo antes del examen. 100% recomendado.",
  
  "aspects": {
    "knowledge": 5,
    "punctuality": 5,
    "communication": 5,
    "patience": 5,
    "materials": 4,
    "value": 5
  },
  
  "anonymous": false,
  
  "createdAt": "2024-10-16T18:00:00Z",
  
  "helpfulCount": 12
}
```

### Ejemplo 4: Semestre con Materias
```json
// Documento en /semesters/sem_2024_1
{
  "id": "sem_2024_1",
  "userId": "user_student_123",
  
  "name": "2024-1",
  "startDate": "2024-02-01T00:00:00Z",
  "endDate": "2024-06-30T23:59:59Z",
  
  "university": "Universidad Nacional de Colombia",
  "program": "Ingeniería de Sistemas",
  
  "active": true,
  "archived": false,
  
  "totalCredits": 18,
  "currentGPA": 4.2,
  
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-10-09T15:00:00Z"
}

// Documento en /semesters/sem_2024_1/subjects/subj_calculo
{
  "id": "subj_calculo",
  "name": "Cálculo Diferencial",
  "code": "MAT2201",
  "credits": 4,
  
  "professor": "Dr. Carlos Rodríguez",
  "professorEmail": "crodriguez@unal.edu.co",
  
  "schedule": {
    "monday": [
      { "start": "08:00", "end": "10:00", "room": "Edificio 405, Salón 201" }
    ],
    "wednesday": [
      { "start": "08:00", "end": "10:00", "room": "Edificio 405, Salón 201" }
    ]
  },
  
  "grades": [
    {
      "name": "Parcial 1",
      "value": 4.0,
      "percentage": 30,
      "date": "2024-03-15T14:00:00Z"
    },
    {
      "name": "Parcial 2",
      "value": 4.5,
      "percentage": 30,
      "date": "2024-05-10T14:00:00Z"
    },
    {
      "name": "Tareas",
      "value": 4.8,
      "percentage": 20,
      "date": "2024-06-01T23:59:59Z"
    }
  ],
  
  "finalGrade": 4.3,
  "passed": true,
  
  "tutoringRequestIds": ["req_abc123", "req_def456"],
  
  "createdAt": "2024-02-01T10:00:00Z",
  "updatedAt": "2024-06-20T15:00:00Z"
}
```

### Ejemplo 5: Plan de Estudio con Tareas
```json
// Documento en /study_plans/plan_examen_final
{
  "id": "plan_examen_final",
  "userId": "user_student_123",
  
  "name": "Preparación Examen Final - Cálculo",
  "description": "Plan intensivo de 2 semanas para el examen final",
  
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-06-15T23:59:59Z",
  
  "goals": [
    "Dominar límites y continuidad",
    "Practicar 50 ejercicios de derivadas",
    "Aprobar con mínimo 4.5"
  ],
  
  "subjects": ["Cálculo Diferencial"],
  
  "technique": "pomodoro",
  "pomodoroConfig": {
    "workMinutes": 25,
    "breakMinutes": 5,
    "longBreakMinutes": 15,
    "sessionsBeforeLongBreak": 4
  },
  
  "active": true,
  "completed": false,
  
  "progress": 65,
  
  "totalHoursPlanned": 40,
  "totalHoursStudied": 26,
  "tasksCompleted": 13,
  "tasksTotal": 20,
  
  "createdAt": "2024-06-01T09:00:00Z",
  "updatedAt": "2024-06-09T20:30:00Z"
}

// Documento en /study_plans/plan_examen_final/tasks/task_limites
{
  "id": "task_limites",
  "title": "Repasar teoría de límites",
  "description": "Revisar apuntes y resolver ejercicios del capítulo 2",
  "subject": "Cálculo Diferencial",
  
  "dueDate": "2024-06-03T18:00:00Z",
  "duration": 120,
  
  "priority": "high",
  
  "completed": true,
  "completedAt": "2024-06-03T17:45:00Z",
  "actualDuration": 135,
  
  "subtasks": [
    { "title": "Leer capítulo 2", "completed": true },
    { "title": "Resolver ejercicios pares", "completed": true },
    { "title": "Resolver ejercicios impares", "completed": true }
  ],
  
  "createdAt": "2024-06-01T09:15:00Z",
  "updatedAt": "2024-06-03T17:45:00Z"
}
```

---

## 4. Relaciones entre Colecciones

### Diagrama de Relaciones
```
User (tutor)
    ↓ (1:N)
TutoringRequests
    ↓ (1:1)
Chat
    ↓ (1:N)
Messages

User (student)
    ↓ (1:N)
TutoringRequests
    ↓ (1:1)
Review
    ↓ (1:1)
Payment

User
    ↓ (1:N)
Semesters
    ↓ (1:N)
Subjects

User
    ↓ (1:N)
StudyPlans
    ↓ (1:N)
Tasks

User
    ↓ (1:N)
Documents

User
    ↓ (1:N)
Notifications

User
    ↓ (1:1)
Analytics
```

---

## 5. Queries Comunes

### 5.1 Buscar Tutores por Materia y Ubicación
```typescript
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

const tutorsRef = collection(db, 'users');
const q = query(
  tutorsRef,
  where('isTutor', '==', true),
  where('subjects', 'array-contains', 'Matemáticas'),
  where('location', '==', 'Bogotá, D.C.'),
  orderBy('rating', 'desc')
);

const snapshot = await getDocs(q);
const tutors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

### 5.2 Obtener Solicitudes de un Estudiante
```typescript
const requestsRef = collection(db, 'tutoring_requests');
const q = query(
  requestsRef,
  where('studentId', '==', userId),
  where('status', '==', 'pending'),
  orderBy('createdAt', 'desc')
);

const snapshot = await getDocs(q);
const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

### 5.3 Obtener Mensajes de un Chat (en Tiempo Real)
```typescript
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const messagesRef = collection(db, 'chats', chatId, 'messages');
const q = query(messagesRef, orderBy('createdAt', 'asc'));

const unsubscribe = onSnapshot(q, (snapshot) => {
  const messages = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  // Actualizar UI con los mensajes
  setMessages(messages);
});
```

### 5.4 Obtener Reseñas de un Tutor
```typescript
const reviewsRef = collection(db, 'reviews');
const q = query(
  reviewsRef,
  where('tutorId', '==', tutorId),
  orderBy('createdAt', 'desc'),
  limit(10)
);

const snapshot = await getDocs(q);
const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

### 5.5 Obtener Notificaciones No Leídas
```typescript
const notificationsRef = collection(db, 'notifications');
const q = query(
  notificationsRef,
  where('userId', '==', userId),
  where('read', '==', false),
  orderBy('createdAt', 'desc')
);

const snapshot = await getDocs(q);
const unreadNotifications = snapshot.docs.map(doc => ({ 
  id: doc.id, 
  ...doc.data() 
}));
```

### 5.6 Obtener Materias del Semestre Actual
```typescript
import { collection, getDocs } from 'firebase/firestore';

const subjectsRef = collection(db, 'semesters', semesterId, 'subjects');
const snapshot = await getDocs(subjectsRef);
const subjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

### 5.7 Buscar Documentos Públicos por Materia
```typescript
const docsRef = collection(db, 'documents');
const q = query(
  docsRef,
  where('subject', '==', 'Cálculo Diferencial'),
  where('privacy', '==', 'public'),
  orderBy('rating', 'desc'),
  limit(20)
);

const snapshot = await getDocs(q);
const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

### 5.8 Obtener Tareas Pendientes del Plan de Estudio
```typescript
const tasksRef = collection(db, 'study_plans', planId, 'tasks');
const q = query(
  tasksRef,
  where('completed', '==', false),
  orderBy('dueDate', 'asc')
);

const snapshot = await getDocs(q);
const pendingTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

### 5.9 Obtener Transacciones de un Usuario
```typescript
const transactionsRef = collection(db, 'transactions');
const q = query(
  transactionsRef,
  where('userId', '==', userId),
  orderBy('createdAt', 'desc'),
  limit(50)
);

const snapshot = await getDocs(q);
const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

### 5.10 Obtener Tickets de Soporte Abiertos
```typescript
const ticketsRef = collection(db, 'support_tickets');
const q = query(
  ticketsRef,
  where('userId', '==', userId),
  where('status', 'in', ['open', 'in-progress']),
  orderBy('createdAt', 'desc')
);

const snapshot = await getDocs(q);
const openTickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

---

## 6. Operaciones CRUD Comunes

### 6.1 Crear Usuario (después del registro)
```typescript
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const userRef = doc(db, 'users', userId);
await setDoc(userRef, {
  uid: userId,
  email: email,
  displayName: displayName,
  phoneNumber: phoneNumber,
  location: location,
  isStudent: true,
  isTutor: false,
  interests: interests,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
});
```

### 6.2 Crear Solicitud de Tutoría
```typescript
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const requestsRef = collection(db, 'tutoring_requests');
const docRef = await addDoc(requestsRef, {
  studentId: currentUserId,
  tutorId: selectedTutorId,
  subject: subject,
  description: description,
  requestedDate: requestedDate,
  duration: duration,
  mode: mode,
  location: location,
  price: price,
  status: 'pending',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
});

const requestId = docRef.id;
```

### 6.3 Enviar Mensaje en Chat
```typescript
const messagesRef = collection(db, 'chats', chatId, 'messages');
await addDoc(messagesRef, {
  chatId: chatId,
  senderId: currentUserId,
  text: messageText,
  read: false,
  createdAt: serverTimestamp()
});

// Actualizar último mensaje del chat
const chatRef = doc(db, 'chats', chatId);
await updateDoc(chatRef, {
  lastMessage: messageText,
  lastMessageAt: serverTimestamp(),
  lastMessageSenderId: currentUserId
});
```

### 6.4 Actualizar Estado de Solicitud
```typescript
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const requestRef = doc(db, 'tutoring_requests', requestId);
await updateDoc(requestRef, {
  status: 'accepted',
  updatedAt: serverTimestamp()
});
```

### 6.5 Crear Reseña
```typescript
const reviewsRef = collection(db, 'reviews');
await addDoc(reviewsRef, {
  studentId: currentUserId,
  tutorId: tutorId,
  requestId: requestId,
  rating: rating,
  comment: comment,
  aspects: aspects,
  anonymous: anonymous,
  createdAt: serverTimestamp()
});

// Actualizar estadísticas del tutor
const tutorRef = doc(db, 'users', tutorId);
const tutorDoc = await getDoc(tutorRef);
const currentRating = tutorDoc.data().rating || 0;
const currentCount = tutorDoc.data().reviewCount || 0;
const newRating = ((currentRating * currentCount) + rating) / (currentCount + 1);

await updateDoc(tutorRef, {
  rating: newRating,
  reviewCount: currentCount + 1,
  updatedAt: serverTimestamp()
});
```

---

## 7. Seguridad y Validación

### Reglas de Validación en el Cliente

```typescript
// Validar antes de crear/actualizar
function validateUser(data: Partial<User>): boolean {
  if (data.email && !isValidEmail(data.email)) {
    throw new Error('Email inválido');
  }
  
  if (data.phoneNumber && !isValidColombianPhone(data.phoneNumber)) {
    throw new Error('Número de teléfono colombiano inválido');
  }
  
  if (data.hourlyRate && (data.hourlyRate < 10000 || data.hourlyRate > 500000)) {
    throw new Error('Tarifa debe estar entre $10,000 y $500,000 COP');
  }
  
  return true;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidColombianPhone(phone: string): boolean {
  return /^\+57[0-9]{10}$/.test(phone);
}
```

---

## 8. Índices Requeridos

Ver archivo `firestore.indexes.json` para la lista completa de índices compuestos necesarios.

Los índices más importantes son:

1. `users`: `isTutor` + `subjects` (array-contains) + `rating` (desc)
2. `tutoring_requests`: `studentId` + `status` + `createdAt` (desc)
3. `tutoring_requests`: `tutorId` + `status` + `createdAt` (desc)
4. `notifications`: `userId` + `read` + `createdAt` (desc)
5. `reviews`: `tutorId` + `createdAt` (desc)

---

¡Tu base de datos de TutorApp está lista para funcionar! 🚀
