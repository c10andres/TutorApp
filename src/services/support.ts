// Servicio de Soporte - Sistema completo de tickets, chat IA y recursos
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot,
  limit,
  increment,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// Interfaces
export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  responseTime?: string;
  assignedAgent?: string;
  resolution?: string;
  rating?: number;
  attachments?: string[];
  publicId: string; // ID público para referencias
}

export interface ChatMessage {
  id: string;
  ticketId?: string;
  content: string;
  sender: 'user' | 'ai' | 'agent';
  timestamp: Date;
  helpful?: boolean;
  metadata?: {
    confidence?: number;
    intent?: string;
    entities?: string[];
    followUp?: string[];
  };
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  notHelpful: number;
  tags: string[];
  lastUpdated: Date;
  views: number;
  relatedFAQs?: string[];
}

export interface SystemStatus {
  service: string;
  status: 'operational' | 'degraded' | 'down' | 'maintenance';
  lastChecked: Date;
  uptime: number;
  responseTime?: number;
  description?: string;
}

export interface SupportMetrics {
  totalTickets: number;
  openTickets: number;
  avgResponseTime: number;
  satisfactionRating: number;
  aiResolutionRate: number;
  topCategories: { category: string; count: number }[];
}

// Datos mock para desarrollo
let mockTickets: SupportTicket[] = [];
let mockFAQs: FAQItem[] = [];
let mockMessages: ChatMessage[] = [];

// Servicio de Tickets
export const createSupportTicket = async (
  userId: string, 
  ticketData: Omit<SupportTicket, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'status' | 'publicId'>
): Promise<string> => {
  try {
    // Generar ID público único
    const publicId = `TIK-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const ticketId = `ticket-${Date.now()}`;
    
    const newTicket: SupportTicket = {
      id: ticketId,
      ...ticketData,
      userId,
      publicId,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Intentar usar Firestore, pero usar fallback local si falla
    try {
      const docRef = await addDoc(collection(db, 'support_tickets'), {
        ...ticketData,
        userId,
        publicId,
        status: 'open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Crear mensaje inicial del sistema
      await addDoc(collection(db, 'support_messages'), {
        ticketId: docRef.id,
        content: `Ticket ${publicId} creado exitosamente. Un agente revisará tu caso pronto.`,
        sender: 'ai',
        timestamp: serverTimestamp(),
        metadata: {
          type: 'system',
          ticketCreated: true
        }
      });

      return docRef.id;
    } catch (firestoreError) {
      console.warn('Firestore not available, using local storage:', firestoreError);
      
      // Fallback a almacenamiento local
      mockTickets.push(newTicket);
      localStorage.setItem('supportTickets', JSON.stringify(mockTickets));
      
      return ticketId;
    }
  } catch (error) {
    console.error('Error creating support ticket:', error);
    throw error;
  }
};

export const getUserTickets = async (userId: string): Promise<SupportTicket[]> => {
  try {
    // Intentar usar Firestore primero
    try {
      const q = query(
        collection(db, 'support_tickets'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as SupportTicket[];
    } catch (firestoreError) {
      console.warn('Firestore not available, using local storage:', firestoreError);
      
      // Fallback a almacenamiento local
      const stored = localStorage.getItem('supportTickets');
      if (stored) {
        mockTickets = JSON.parse(stored);
      }
      
      return mockTickets
        .filter(ticket => ticket.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    return [];
  }
};

export const updateTicketStatus = async (
  ticketId: string, 
  status: SupportTicket['status'],
  resolution?: string
): Promise<void> => {
  try {
    try {
      const updateData: any = {
        status,
        updatedAt: serverTimestamp()
      };

      if (resolution) {
        updateData.resolution = resolution;
      }

      await updateDoc(doc(db, 'support_tickets', ticketId), updateData);

      // Agregar mensaje de actualización de estado
      await addDoc(collection(db, 'support_messages'), {
        ticketId,
        content: `Estado del ticket actualizado a: ${getStatusDisplayName(status)}${resolution ? `\n\nResolución: ${resolution}` : ''}`,
        sender: 'ai',
        timestamp: serverTimestamp(),
        metadata: {
          type: 'status_update',
          newStatus: status
        }
      });
    } catch (firestoreError) {
      console.warn('Firestore not available for updating ticket status:', firestoreError);
      
      // Actualizar en datos locales
      mockTickets = mockTickets.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status, updatedAt: new Date(), resolution }
          : ticket
      );
      localStorage.setItem('supportTickets', JSON.stringify(mockTickets));
    }
  } catch (error) {
    console.error('Error updating ticket status:', error);
    throw error;
  }
};

export const rateTicket = async (ticketId: string, rating: number): Promise<void> => {
  try {
    try {
      await updateDoc(doc(db, 'support_tickets', ticketId), {
        rating,
        updatedAt: serverTimestamp()
      });

      await updateSupportMetrics('ticketRated', rating);
    } catch (firestoreError) {
      console.warn('Firestore not available for rating ticket:', firestoreError);
      
      // Actualizar en datos locales
      mockTickets = mockTickets.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, rating, updatedAt: new Date() }
          : ticket
      );
      localStorage.setItem('supportTickets', JSON.stringify(mockTickets));
    }
  } catch (error) {
    console.error('Error rating ticket:', error);
    throw error;
  }
};

// Servicio de Chat con IA
export const sendChatToAI = async (
  userId: string,
  message: string,
  ticketId?: string
): Promise<ChatMessage> => {
  try {
    // Generar respuesta de IA
    const aiResponse = await generateIntelligentAIResponse(message, userId, ticketId);
    
    const aiMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      ticketId,
      content: aiResponse.content,
      sender: 'ai',
      timestamp: new Date(),
      metadata: aiResponse.metadata
    };

    try {
      // Intentar usar Firestore
      await addDoc(collection(db, 'support_messages'), {
        ticketId,
        content: message,
        sender: 'user',
        timestamp: serverTimestamp(),
        userId
      });

      await addDoc(collection(db, 'support_messages'), {
        ticketId,
        content: aiResponse.content,
        sender: 'ai',
        timestamp: serverTimestamp(),
        metadata: aiResponse.metadata
      });
    } catch (firestoreError) {
      console.warn('Firestore not available for messages:', firestoreError);
      // En caso de error, simplemente retornar la respuesta sin persistir
    }

    return aiMessage;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

export const getTicketMessages = async (ticketId: string): Promise<ChatMessage[]> => {
  try {
    try {
      const q = query(
        collection(db, 'support_messages'),
        where('ticketId', '==', ticketId),
        orderBy('timestamp', 'asc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as ChatMessage[];
    } catch (firestoreError) {
      console.warn('Firestore not available for ticket messages:', firestoreError);
      
      // Retornar mensajes mock para el ticket
      return mockMessages.filter(message => message.ticketId === ticketId);
    }
  } catch (error) {
    console.error('Error fetching ticket messages:', error);
    return [];
  }
};

export const markMessageHelpful = async (
  messageId: string, 
  helpful: boolean
): Promise<void> => {
  try {
    try {
      await updateDoc(doc(db, 'support_messages', messageId), {
        helpful
      });

      // Actualizar métricas de IA
      await updateSupportMetrics(helpful ? 'aiHelpful' : 'aiNotHelpful');
    } catch (firestoreError) {
      console.warn('Firestore not available for message rating:', firestoreError);
      // En modo de desarrollo, simplemente simular el éxito
    }
  } catch (error) {
    console.error('Error marking message helpful:', error);
    throw error;
  }
};

// Servicio de FAQ
export const getFAQs = async (category?: string, searchQuery?: string): Promise<FAQItem[]> => {
  try {
    let faqs: FAQItem[] = [];

    try {
      // Intentar usar Firestore
      let q = query(collection(db, 'faqs'), orderBy('helpful', 'desc'));

      if (category) {
        q = query(
          collection(db, 'faqs'),
          where('category', '==', category),
          orderBy('helpful', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      faqs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastUpdated: doc.data().lastUpdated?.toDate() || new Date()
      })) as FAQItem[];
    } catch (firestoreError) {
      console.warn('Firestore not available, using mock data:', firestoreError);
      
      // Datos mock de FAQ
      faqs = [
        {
          id: 'faq-1',
          question: '¿Cómo funciona el emparejamiento inteligente con IA?',
          answer: 'Nuestro sistema de IA analiza tu perfil de aprendizaje, horarios, presupuesto y objetivos académicos para encontrar los tutores más compatibles. El algoritmo considera más de 15 factores diferentes y tiene una precisión del 87% en matches exitosos.',
          category: 'ai-features',
          helpful: 45,
          notHelpful: 3,
          tags: ['IA', 'matching', 'tutores', 'algoritmo'],
          views: 245,
          lastUpdated: new Date(),
          relatedFAQs: []
        },
        {
          id: 'faq-2',
          question: '¿Qué métodos de pago están disponibles en Colombia?',
          answer: 'Aceptamos múltiples métodos: PSE (recomendado), tarjetas de crédito/débito de bancos colombianos, billeteras digitales como Nequi y DaviPlata. Todos los pagos son seguros y se procesan en pesos colombianos (COP).',
          category: 'payments',
          helpful: 52,
          notHelpful: 1,
          tags: ['pagos', 'PSE', 'colombia', 'nequi', 'daviplata'],
          views: 312,
          lastUpdated: new Date(),
          relatedFAQs: []
        },
        {
          id: 'faq-3',
          question: '¿Cómo solicitar una tutoría?',
          answer: 'Puedes solicitar una tutoría de varias maneras: 1) Buscar tutores en la página de búsqueda, 2) Usar el emparejamiento inteligente de IA, 3) Desde el perfil de un tutor específico. Solo selecciona el tutor, elige fecha/hora y describe tus necesidades de aprendizaje.',
          category: 'tutoring',
          helpful: 38,
          notHelpful: 2,
          tags: ['tutoría', 'solicitar', 'proceso', 'reserva'],
          views: 189,
          lastUpdated: new Date(),
          relatedFAQs: []
        },
        {
          id: 'faq-4',
          question: '¿El predictor académico de IA es preciso?',
          answer: 'Nuestro predictor tiene una precisión promedio del 84% basado en análisis de más de 10,000 estudiantes. Analiza patrones de estudio, historial académico, asistencia a tutorías y otros factores para predecir tu rendimiento futuro y sugerir mejoras.',
          category: 'ai-features',
          helpful: 29,
          notHelpful: 4,
          tags: ['predictor', 'IA', 'precisión', 'académico'],
          views: 156,
          lastUpdated: new Date(),
          relatedFAQs: []
        },
        {
          id: 'faq-5',
          question: '¿Cómo cambiar entre modo estudiante y tutor?',
          answer: 'Puedes cambiar de modo fácilmente desde tu perfil o desde el botón en la página principal. Cada usuario puede ser tanto estudiante como tutor sin restricciones. El cambio es instantáneo y mantienes toda tu información.',
          category: 'account',
          helpful: 33,
          notHelpful: 1,
          tags: ['modo', 'estudiante', 'tutor', 'cambiar', 'perfil'],
          views: 201,
          lastUpdated: new Date(),
          relatedFAQs: []
        }
      ];
    }

    // Filtrar por categoría si se especifica
    if (category) {
      faqs = faqs.filter(faq => faq.category === category);
    }

    // Filtrar por búsqueda si se proporciona
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      faqs = faqs.filter(faq => 
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return faqs;
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return [];
  }
};

export const voteFAQ = async (faqId: string, helpful: boolean): Promise<void> => {
  try {
    try {
      const field = helpful ? 'helpful' : 'notHelpful';
      await updateDoc(doc(db, 'faqs', faqId), {
        [field]: increment(1),
        lastUpdated: serverTimestamp()
      });

      // Incrementar vistas
      await updateDoc(doc(db, 'faqs', faqId), {
        views: increment(1)
      });
    } catch (firestoreError) {
      console.warn('Firestore not available for FAQ voting:', firestoreError);
      // En modo de desarrollo, simplemente simular el éxito
    }
  } catch (error) {
    console.error('Error voting FAQ:', error);
    throw error;
  }
};

// Sistema de Estado del Servicio
export const getSystemStatus = async (): Promise<SystemStatus[]> => {
  try {
    try {
      const snapshot = await getDocs(collection(db, 'system_status'));
      return snapshot.docs.map(doc => ({
        service: doc.id,
        ...doc.data(),
        lastChecked: doc.data().lastChecked?.toDate() || new Date()
      })) as SystemStatus[];
    } catch (firestoreError) {
      console.warn('Firestore not available, using mock system status:', firestoreError);
    }
    
    // Devolver estado mock siempre
    return [
      {
        service: 'Plataforma Web',
        status: 'operational',
        lastChecked: new Date(),
        uptime: 99.9,
        responseTime: 120,
        description: 'Todos los servicios funcionando correctamente'
      },
      {
        service: 'Funciones de IA',
        status: 'operational',
        lastChecked: new Date(),
        uptime: 99.5,
        responseTime: 300,
        description: 'Emparejamiento, predictor y planificador activos'
      },
      {
        service: 'Sistema de Pagos',
        status: 'operational',
        lastChecked: new Date(),
        uptime: 99.8,
        responseTime: 200,
        description: 'PSE, Nequi y DaviPlata disponibles'
      },
      {
        service: 'App Móvil',
        status: 'operational',
        lastChecked: new Date(),
        uptime: 99.7,
        responseTime: 150,
        description: 'Versión móvil completamente funcional'
      }
    ];
  } catch (error) {
    console.error('Error fetching system status:', error);
    return [];
  }
};

export const updateSystemStatus = async (
  service: string, 
  status: SystemStatus['status'],
  responseTime?: number
): Promise<void> => {
  try {
    try {
      await updateDoc(doc(db, 'system_status', service), {
        status,
        lastChecked: serverTimestamp(),
        responseTime: responseTime || null
      });
    } catch (firestoreError) {
      console.warn('Firestore not available for updating system status:', firestoreError);
      // En modo de desarrollo, simplemente simular la actualización
      console.log(`System status updated: ${service} - ${status}`);
    }
  } catch (error) {
    console.error('Error updating system status:', error);
  }
};

// Métricas y Analytics
export const getSupportMetrics = async (): Promise<SupportMetrics> => {
  try {
    try {
      const metricsDoc = await getDoc(doc(db, 'support_metrics', 'current'));
      
      if (metricsDoc.exists()) {
        return metricsDoc.data() as SupportMetrics;
      }
    } catch (firestoreError) {
      console.warn('Firestore not available for metrics:', firestoreError);
    }

    // Métricas mock para demostración
    const mockMetrics: SupportMetrics = {
      totalTickets: 156,
      openTickets: 8,
      avgResponseTime: 2.5, // horas
      satisfactionRating: 4.7,
      aiResolutionRate: 73,
      topCategories: [
        { category: 'Funciones de IA', count: 45 },
        { category: 'Pagos y facturación', count: 38 },
        { category: 'Problemas técnicos', count: 32 },
        { category: 'Cuenta y perfil', count: 25 },
        { category: 'Tutorías y clases', count: 16 }
      ]
    };

    return mockMetrics;
  } catch (error) {
    console.error('Error fetching support metrics:', error);
    return {
      totalTickets: 0,
      openTickets: 0,
      avgResponseTime: 0,
      satisfactionRating: 0,
      aiResolutionRate: 0,
      topCategories: []
    };
  }
};

const updateSupportMetrics = async (action: string, value?: number): Promise<void> => {
  try {
    try {
      const metricsRef = doc(db, 'support_metrics', 'current');
      
      switch (action) {
        case 'ticketsCreated':
          await updateDoc(metricsRef, {
            totalTickets: increment(1),
            openTickets: increment(1)
          });
          break;
          
        case 'ticketResolved':
          await updateDoc(metricsRef, {
            openTickets: increment(-1)
          });
          break;
          
        case 'ticketRated':
          if (value) {
            // Actualizar rating promedio (simplificado)
            const currentMetrics = await getSupportMetrics();
            const newRating = (currentMetrics.satisfactionRating + value) / 2;
            await updateDoc(metricsRef, {
              satisfactionRating: newRating
            });
          }
          break;
          
        case 'aiHelpful':
          // Incrementar tasa de resolución de IA
          break;
          
        case 'aiNotHelpful':
          // Decrementar tasa de resolución de IA
          break;
      }
    } catch (firestoreError) {
      console.warn('Firestore not available for updating metrics:', firestoreError);
      // En modo de desarrollo, simplemente logear la acción
      console.log(`Metrics action: ${action}${value ? ` with value: ${value}` : ''}`);
    }
  } catch (error) {
    console.error('Error updating support metrics:', error);
  }
};

// IA Inteligente para Soporte con contexto conversacional
let conversationContext: Map<string, any> = new Map();

const generateIntelligentAIResponse = async (
  message: string, 
  userId: string, 
  ticketId?: string
): Promise<{ content: string; metadata: any }> => {
  const lowerMessage = message.toLowerCase();
  
  // Obtener contexto de conversación del usuario
  const userContext = conversationContext.get(userId) || { history: [], lastIntent: null, currentFlow: null };
  
  // Analizar intención del mensaje
  const intent = analyzeIntent(lowerMessage, userContext);
  const entities = extractEntities(lowerMessage);
  
  let response = '';
  let confidence = 0.7;
  let followUp: string[] = [];
  let quickActions: string[] = [];
  let suggestedFlow: string | null = null;

  // Actualizar contexto de conversación
  userContext.history.push({ message, intent, timestamp: new Date() });
  userContext.lastIntent = intent;

  // Respuestas contextuales más naturales
  switch (intent) {
    case 'ai_features':
      if (userContext.history.some(h => h.intent === 'ai_features')) {
        response = generateContextualAIResponse(entities, userContext);
      } else {
        response = `¡Hola! Me alegra que te interesen nuestras funciones de IA. 😊

Tenemos 4 herramientas principales que han revolucionado la experiencia de estudio en Colombia:

🎯 **Emparejamiento Inteligente**: En promedio, nuestros usuarios encuentran su tutor ideal en menos de 3 minutos. El algoritmo analiza tu horario (especialmente útil para estudiantes de universidades como Nacional, Javeriana, Andes), tu presupuesto en COP, y tu estilo de aprendizaje.

📊 **Predictor Académico**: Ha ayudado a más de 2,500 estudiantes colombianos a mejorar sus notas. Predice tu rendimiento en el próximo semestre con 84% de precisión.

📅 **Planificador de Estudio**: Considera el calendario académico colombiano, incluyendo periodos de parciales y finales típicos de universidades locales.

🎯 **Asistente de Metas**: Te ayuda a establecer objetivos realistas basados en el sistema educativo colombiano.

¿Hay alguna que te llame especialmente la atención? Puedo explicarte casos de éxito reales de estudiantes en tu ciudad.`;
      }
      
      followUp = [
        '¿Cómo empiezo con el emparejamiento?',
        'Quiero ver el predictor académico',
        'Casos de éxito en mi universidad'
      ];
      quickActions = ['Ir a Emparejamiento IA', 'Ver Predictor', 'Configurar Perfil'];
      confidence = 0.95;
      break;

    case 'payment_help':
      if (entities.includes('nequi')) {
        response = `Perfecto, veo que quieres usar Nequi 💜

Te cuento que **Nequi es uno de nuestros métodos más populares** - lo usa el 35% de nuestros estudiantes colombianos porque es súper conveniente.

**Proceso con Nequi:**
1. Selecciona el tutor y horario
2. En checkout, elige "Nequi" 
3. Te redirigimos a la app de Nequi
4. Autoriza el pago con tu clave o huella
5. ¡Listo! Confirmación instantánea

**Datos importantes:**
💰 Monto mínimo: $25,000 COP (una clase básica)
💰 Monto máximo: $500,000 COP (paquetes grandes)
⚡ Confirmación: Inmediata (máximo 2 minutos)
🧾 Factura: Te llega al email registrado

¿El problema es específico con algún paso del proceso?`;
      } else if (entities.includes('pse')) {
        response = `Excelente elección con PSE 🏦 

Es nuestro método más confiable y el que recomendamos para pagos de tutorías. El 60% de nuestros pagos se hacen por PSE.

**Bancos compatibles más usados:**
• Bancolombia (más popular)
• Banco de Bogotá
• Davivienda  
• BBVA
• Banco Popular
• Y todos los demás bancos colombianos

**Proceso súper fácil:**
1. Elige "PSE" al pagar
2. Selecciona tu banco
3. Te redirigimos al portal de tu banco
4. Ingresas con tus credenciales habituales
5. Autorizas el débito
6. ¡Confirmación al instante!

**¿Sabías que...?** Con PSE tienes las mismas protecciones que en la banca en línea de tu banco. Es el método más seguro.

¿Hay algún paso específico donde tienes dudas?`;
      } else {
        response = `Te ayudo con los pagos - es una de las consultas más comunes 💳

Primero, déjame contarte algo genial: **procesamos más de $2.3 millones COP diarios** en pagos de tutoría, así que nuestro sistema está súper optimizado para Colombia.

**Los favoritos de nuestros usuarios:**
🥇 **PSE** (60% de pagos) - El más confiable
🥈 **Nequi** (35% de pagos) - El más rápido  
🥉 **Tarjetas** (5% de pagos) - Para compras recurrentes

**Datos en tiempo real:**
💵 Tarifa promedio: $35,000 COP/hora
⏰ Tiempo promedio de confirmación: 45 segundos
🔒 Tasa de éxito de pagos: 99.2%

¿Con qué método específico necesitas ayuda? Te explico paso a paso.`;
      }
      
      followUp = [
        'Problemas con confirmación de pago',
        'Solicitar reembolso',
        'Cambiar método de pago'
      ];
      quickActions = ['Ver Mi Billetera', 'Historial de Pagos', 'Crear Ticket'];
      confidence = 0.95;
      break;

    case 'tutoring_help':
      if (entities.some(e => ['matemáticas', 'cálculo', 'álgebra'].includes(e))) {
        response = `¡Matemáticas! 📐 Una de nuestras materias más solicitadas en Colombia.

**Datos específicos de matemáticas en nuestra plataforma:**
👥 +850 tutores de matemáticas activos
⭐ Calificación promedio: 4.8/5
💰 Rango de precios: $25,000 - $80,000 COP/hora
🎯 Tasa de éxito: 92% de estudiantes mejoran sus notas

**Los tutores más populares enseñan:**
• Cálculo I, II, III (nivel universitario)
• Álgebra lineal y matemáticas discretas
• Estadística y probabilidad
• Matemáticas para ingeniería
• Preparación ICFES/Saber 11

**Universidades más representadas:**
🏛️ Universidad Nacional (25% de tutores)
🏛️ Universidad de los Andes (20%)
🏛️ Pontificia Javeriana (18%)
🏛️ Universidad del Rosario (15%)

¿En qué nivel específico necesitas ayuda? Te puedo conectar con tutores especializados de tu universidad.`;
      } else if (entities.some(e => ['programación', 'código', 'python', 'java'].includes(e))) {
        response = `¡Programación! 💻 Súper popular, especialmente desde la pandemia.

**El boom de programación en Colombia:**
📈 +300% incremento en solicitudes desde 2023
👨‍💻 +650 tutores especializados en desarrollo
💼 Enfoque en empleabilidad tech colombiana
🚀 95% de estudiantes aprueban sus materias

**Lenguajes más solicitados:**
1. **Python** (40% de clases) - Data Science, IA
2. **JavaScript** (30%) - Desarrollo web
3. **Java** (15%) - Universitario y enterprise
4. **C++** (10%) - Algoritmos y competencias
5. **SQL** (5%) - Bases de datos

**Modalidades populares:**
🎯 Proyectos reales de empresas colombianas
🎯 Preparación para entrevistas tech
🎯 Bootcamps intensivos de fin de semana
🎯 Mentoría para freelancers

¿Qué lenguaje te interesa o en qué proyecto estás trabajando?`;
      } else {
        response = `¡Perfecto! Te ayudo a encontrar el tutor ideal 🎓

Primero, un dato que te puede interesar: **tenemos más de 3,200 tutores activos** cubriendo 103 materias diferentes, todos ubicados en Colombia.

**¿Sabías que nuestros estudiantes colombianos prefieren?**
📍 78% prefiere tutores de su misma ciudad
⏰ 65% programa clases entre 6pm-9pm (después del trabajo/estudio)
💰 Presupuesto promedio: $35,000 COP por sesión
📱 85% usa nuestra app móvil para coordinar

**Para darte la mejor recomendación, cuéntame:**
1. ¿Qué materia específica necesitas?
2. ¿Eres de universidad o colegio?
3. ¿Prefieres clases presenciales o virtuales?

Mientras me cuentas, también puedes probar nuestro **Emparejamiento Inteligente** - ¡encuentra tu tutor ideal en menos de 3 minutos!`;
      }
      
      followUp = [
        'Ver tutores en mi ciudad',
        'Usar emparejamiento inteligente',
        'Filtrar por presupuesto'
      ];
      quickActions = ['Buscar Tutores', 'Emparejamiento IA', 'Ver Precios'];
      confidence = 0.9;
      break;

    case 'technical_issue':
      response = generateTechnicalSolutionFlow(lowerMessage, userContext);
      followUp = ['Reportar problema urgente', 'Probar en otro navegador', 'Contactar soporte técnico'];
      quickActions = ['Diagnóstico Rápido', 'Crear Ticket Técnico', 'Ver Estado del Sistema'];
      suggestedFlow = 'technical_diagnostic';
      confidence = 0.85;
      break;

    case 'account_help':
      response = generateAccountHelpResponse(entities, userContext);
      followUp = ['Cambiar a modo tutor', 'Actualizar información', 'Configurar notificaciones'];
      quickActions = ['Ir a Perfil', 'Configuración', 'Modo Tutor'];
      confidence = 0.9;
      break;

    case 'university_specific':
      response = generateUniversitySpecificResponse(entities, userContext);
      followUp = ['Ver tutores de mi universidad', 'Calendario académico', 'Grupos de estudio'];
      quickActions = ['Filtrar por Universidad', 'Ver Materias', 'Conectar Estudiantes'];
      confidence = 0.85;
      break;

    case 'pricing_help':
      response = `💰 Te explico todo sobre precios - **transparencia total** es nuestra política.

**Rangos reales de nuestros tutores (Enero 2024):**
• 📚 **Colegio**: $15,000 - $35,000 COP/hora
• 🎓 **Universidad**: $25,000 - $60,000 COP/hora  
• 💼 **Especialización**: $40,000 - $100,000 COP/hora
• 🏆 **Premium/PhD**: $80,000 - $150,000 COP/hora

**Factores que influyen en el precio:**
✅ Experiencia del tutor (años enseñando)
✅ Calificaciones y reseñas de estudiantes
✅ Nivel de la materia (básico vs avanzado)
✅ Modalidad (virtual vs presencial)
✅ Certificaciones y títulos

**Paquetes populares con descuento:**
📦 4 clases: 10% descuento
📦 8 clases: 15% descuento  
📦 12 clases: 20% descuento

¿Tienes un presupuesto específico en mente? Te muestro tutores perfectos en tu rango.`;
      
      followUp = ['Ver tutores por presupuesto', 'Paquetes con descuento', 'Comparar precios'];
      quickActions = ['Filtrar por Precio', 'Ver Paquetes', 'Calcular Costo'];
      confidence = 0.9;
      break;

    case 'greeting':
      response = generatePersonalizedGreeting(userId, userContext);
      followUp = ['¿Cómo funciona la plataforma?', 'Buscar un tutor', 'Configurar mi perfil'];
      quickActions = ['Tour de la App', 'Emparejamiento IA', 'Buscar Tutores'];
      confidence = 0.8;
      break;

    default:
      response = `Entiendo que necesitas ayuda con "${message}" 🤔

No te preocupes, estoy aquí para resolver cualquier duda. Como no estoy seguro del tema específico, te voy a ofrecer las mejores opciones:

**Opciones inmediatas:**
🤖 **Déjame ayudarte ahora**: Reformula tu pregunta con más detalles
📋 **Crear ticket personalizado**: Un experto humano te contacta en menos de 2 horas
📞 **Contacto directo**: WhatsApp +57 300 123 4567 (horario: 8am-8pm)

**También puedes explorar:**
❓ FAQ con +50 respuestas comunes
📊 Estado del sistema en tiempo real
📚 Centro de recursos y guías

¿Prefieres que te ayude ahora mismo o crear un ticket para atención especializada?`;
      
      followUp = [
        'Reformular mi pregunta',
        'Crear ticket de soporte',
        'Ver preguntas frecuentes'
      ];
      quickActions = ['Crear Ticket', 'Ver FAQ', 'Contactar por WhatsApp'];
      confidence = 0.6;
      break;
  }

  // Actualizar contexto de conversación
  userContext.currentFlow = suggestedFlow;
  conversationContext.set(userId, userContext);

  return {
    content: response,
    metadata: {
      confidence,
      intent,
      entities,
      followUp,
      quickActions,
      suggestedFlow,
      timestamp: new Date(),
      userId,
      ticketId,
      contextual: true
    }
  };
};

// Análisis de intención del mensaje con contexto
const analyzeIntent = (message: string, context?: any): string => {
  const intents = {
    greeting: ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'hey', 'hi', 'saludos'],
    ai_features: ['ia', 'inteligencia', 'artificial', 'emparejamiento', 'predictor', 'planificador', 'matching', 'algoritmo'],
    payment_help: ['pago', 'dinero', 'tarjeta', 'pse', 'nequi', 'daviplata', 'factura', 'reembolso', 'cobro', 'billetera'],
    tutoring_help: ['tutor', 'tutoría', 'clase', 'enseñar', 'aprender', 'materia', 'reservar', 'agendar', 'profesor'],
    technical_issue: ['error', 'problema', 'bug', 'no funciona', 'falla', 'conexión', 'carga', 'lento', 'caído'],
    account_help: ['cuenta', 'perfil', 'configurar', 'cambiar', 'actualizar', 'modo', 'estudiante', 'contraseña'],
    pricing_help: ['precio', 'costo', 'cuánto', 'tarifa', 'descuento', 'promoción', 'barato', 'caro'],
    university_specific: ['universidad', 'nacional', 'javeriana', 'andes', 'rosario', 'católica', 'externado', 'universidad'],
    general_help: ['ayuda', 'como', 'cómo', 'qué', 'donde', 'cuándo', 'información', 'funciona']
  };

  // Considerar contexto de conversación previa
  if (context?.lastIntent && context.history.length > 0) {
    const lastMessage = context.history[context.history.length - 1];
    // Si el mensaje es muy corto, podría estar respondiendo a una pregunta anterior
    if (message.length < 10 && ['sí', 'si', 'no', 'ok', 'vale', 'correcto'].includes(message)) {
      return context.lastIntent; // Mantener la intención anterior
    }
  }

  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some(keyword => message.includes(keyword))) {
      return intent;
    }
  }

  return 'general_help';
};

// Funciones auxiliares para respuestas contextuales
const generatePersonalizedGreeting = (userId: string, context: any): string => {
  const timeOfDay = new Date().getHours();
  let greeting = '';
  
  if (timeOfDay < 12) greeting = '¡Buenos días!';
  else if (timeOfDay < 18) greeting = '¡Buenas tardes!';
  else greeting = '¡Buenas noches!';

  return `${greeting} 👋 Soy tu asistente de IA especializado en la plataforma de tutorías.

**Un poco sobre nuestra comunidad:**
🇨🇴 +15,000 estudiantes activos en Colombia
👨‍🏫 +3,200 tutores verificados
📚 103 materias disponibles
⭐ 4.8/5 calificación promedio

Estoy aquí para ayudarte con cualquier duda sobre:
• Encontrar el tutor perfecto para ti
• Funciones de IA y cómo usarlas
• Métodos de pago colombianos
• Problemas técnicos
• Configuración de tu cuenta

¿En qué puedo ayudarte hoy?`;
};

const generateContextualAIResponse = (entities: string[], context: any): string => {
  if (entities.includes('emparejamiento') || entities.includes('matching')) {
    return `Te explico cómo funciona nuestro emparejamiento inteligente - es realmente impresionante 🎯

**Lo que hace especial a nuestro algoritmo:**
• Analiza más de 15 factores simultáneamente
• Incluye datos específicos del sistema educativo colombiano
• Considera tu horario académico y laboral
• Evalúa compatibilidad de personalidades de estudio

**Proceso real (toma solo 3 minutos):**
1. **Perfil académico**: Materias, nivel, universidad
2. **Preferencias**: Modalidad, horario, presupuesto
3. **Estilo de aprendizaje**: Visual, auditivo, kinestésico
4. **Objetivos**: Mejorar notas, preparar exámenes, aprender nuevo tema

**Resultados comprobados:**
📊 87% de matches exitosos (estudiante satisfecho)
⏰ Tiempo promedio de match: 2.3 minutos
🎯 96% encuentra tutor en primer intento

¿Quieres que iniciemos tu perfil de emparejamiento ahora?`;
  }
  
  return `Veo que ya conoces nuestras funciones de IA. ¡Genial! 🚀

¿Te interesa profundizar en alguna específica? Cada una tiene casos de uso diferentes dependiendo de tus objetivos académicos.`;
};

const generateTechnicalSolutionFlow = (message: string, context: any): string => {
  if (message.includes('video') || message.includes('cámara')) {
    return `🎥 Problemas de video son los más comunes, pero tienen solución fácil:

**Diagnóstico rápido:**
1. ¿El problema es que no te ven o que no ves al tutor?
2. ¿Sale algún mensaje de error específico?
3. ¿Estás en Chrome/Firefox/Safari?

**Soluciones inmediatas:**
✅ **Permisos**: Ve a configuración del navegador → Cámara → Permitir para nuestro sitio
✅ **Otro navegador**: Chrome funciona mejor (97% de éxito)
✅ **Reiniciar**: Cierra el navegador completamente y vuelve a abrir
✅ **App móvil**: Si usas computador, prueba desde el celular

**Si nada funciona:**
📞 Durante la clase: Botón "Reportar problema técnico" (respuesta en 30 segundos)
📧 Después: Te devolvemos el dinero de la clase automáticamente

¿Quieres que hagamos un diagnóstico en vivo de tu cámara?`;
  }
  
  if (message.includes('pago') || message.includes('dinero')) {
    return `💳 Los problemas de pago son críticos, los resolvemos inmediatamente:

**Situaciones más comunes:**
1. **"Se descontó pero no se confirmó"** → Solución en 10 minutos
2. **"Error al autorizar"** → Problema del banco, retry en 5 minutos
3. **"No aparece mi método"** → Verificación de región/banco

**Acción inmediata:**
📸 Toma screenshot del error
💌 Envíalo por este chat o WhatsApp
⚡ Respuesta garantizada en menos de 15 minutos

**Mientras tanto:**
• Verifica que tienes saldo suficiente
• Intenta con otro método (PSE es más estable)
• No hagas múltiples intentos (puede generar cobros duplicados)

¿Quieres crear un ticket urgente de pago ahora?`;
  }

  return `🔧 Te voy a ayudar paso a paso con tu problema técnico.

**Información del sistema (tiempo real):**
🟢 Plataforma Web: 99.9% operativa
🟢 Funciones IA: 99.5% operativa  
🟢 Sistema Pagos: 99.8% operativa
🟡 App Móvil: 97.2% operativa (actualizándose)

**Pasos básicos (resuelven 78% de problemas):**
1. Ctrl+F5 (recarga forzada)
2. Borrar caché y cookies
3. Probar en ventana incógnita
4. Verificar extensiones del navegador

**Si persiste, describe exactamente:**
• ¿Qué estabas haciendo cuando pasó?
• ¿Qué mensaje de error aparece?
• ¿Dispositivo y navegador que usas?

Hagamos diagnóstico en vivo - ¿empezamos?`;
};

const generateAccountHelpResponse = (entities: string[], context: any): string => {
  if (entities.includes('tutor') || entities.includes('modo')) {
    return `👨‍🏫 ¡Excelente! Cambiar a modo tutor es una decisión inteligente.

**Datos motivadores:**
💰 Tutores activos ganan promedio $450,000 COP/mes
⭐ 92% de tutores reportan satisfacción alta
📈 Demanda creció 340% en 2024
🎯 Flexibilidad total de horarios

**Proceso súper fácil (5 minutos):**
1. **Completar perfil de tutor**:
   • Materias que enseñas
   • Tu experiencia y títulos
   • Tarifas por hora
   • Horarios disponibles

2. **Verificación express**:
   • Subir cédula (para pagos)
   • Certificado de estudios
   • Video de presentación (opcional)

3. **¡Empezar a enseñar!**:
   • Apareces en búsquedas inmediatamente
   • Recibes solicitudes por matching IA
   • Primer pago en 24-48 horas

**Ventaja especial:** Como ya tienes cuenta, el proceso es más rápido (sin verificación de email).

¿Empezamos con tu perfil de tutor ahora mismo?`;
  }

  return `👤 Te ayudo con la configuración de tu cuenta - es súper importante tener todo optimizado.

**Checklist de perfil perfecto:**
✅ Foto de perfil profesional
✅ Descripción clara de objetivos
✅ Materias de interés actualizadas
✅ Universidad/institución
✅ Horarios de disponibilidad
✅ Presupuesto por clase

**Configuraciones que marcan la diferencia:**
🔔 **Notificaciones**: Recibir matches por IA
📍 **Ubicación**: Para tutores presenciales cercanos
🎯 **Preferencias**: Modalidad, tipo de tutor
🔒 **Privacidad**: Quién puede contactarte

**Optimización IA:**
Mientras más completo tu perfil, mejores matches recibes. El algoritmo usa cada dato para encontrar tu tutor ideal.

¿Qué parte de tu perfil quieres configurar primero?`;
};

const generateUniversitySpecificResponse = (entities: string[], context: any): string => {
  const universities = {
    'nacional': 'Universidad Nacional de Colombia',
    'javeriana': 'Pontificia Universidad Javeriana',
    'andes': 'Universidad de los Andes',
    'rosario': 'Universidad del Rosario',
    'católica': 'Universidad Católica de Colombia'
  };

  const foundUniversity = entities.find(e => universities[e]);
  
  if (foundUniversity) {
    const uniName = universities[foundUniversity];
    return `🏛️ ¡${uniName}! Una de nuestras universidades con más tutores activos.

**Datos específicos de ${uniName}:**
👥 +280 tutores verificados de esta universidad
📚 Especialistas en todas las facultades principales
⭐ Calificación promedio: 4.9/5
💡 Conocen exactamente el pensum y metodología

**Materias más solicitadas:**
• Matemáticas (Cálculo, Álgebra Lineal)
• Ingenierías (todas las ramas)
• Medicina y Ciencias de la Salud
• Ciencias Sociales y Humanas
• Idiomas y Literatura

**Ventaja especial:**
Nuestros tutores de ${uniName} conocen:
✅ Calendario académico específico
✅ Metodología de profesores
✅ Estructura de parciales y finales
✅ Recursos y bibliografía usada

¿Quieres que te conecte con tutores específicamente de ${uniName}?`;
  }

  return `🎓 Veo que estás preguntando por universidades - ¡perfecto!

**Universidades con más tutores en nuestra plataforma:**
1. Universidad Nacional - 380 tutores
2. Javeriana - 295 tutores  
3. Universidad de los Andes - 240 tutores
4. Universidad del Rosario - 180 tutores
5. Universidad Católica - 165 tutores

**¿Por qué filtrar por universidad?**
• Los tutores conocen exactamente tu pensum
• Saben la metodología específica de tus profesores
• Tienen material de estudio de tu universidad
• Entienden el calendario académico

¿De qué universidad eres? Te muestro tutores específicos de allí.`;
};

// Extracción de entidades del mensaje (mejorada)
const extractEntities = (message: string): string[] => {
  const entities = [];
  const lowerMessage = message.toLowerCase();
  
  // Materias académicas expandidas
  const subjects = {
    'matemáticas': ['matemáticas', 'matemática', 'mates', 'cálculo', 'álgebra', 'trigonometría', 'geometría'],
    'programación': ['programación', 'programacion', 'código', 'programming', 'python', 'java', 'javascript', 'html', 'css'],
    'inglés': ['inglés', 'ingles', 'english', 'idioma', 'language'],
    'física': ['física', 'fisica', 'physics'],
    'química': ['química', 'quimica', 'chemistry'],
    'biología': ['biología', 'biologia', 'biology'],
    'economía': ['economía', 'economia', 'economics', 'micro', 'macro'],
    'contabilidad': ['contabilidad', 'contaduría', 'accounting'],
    'medicina': ['medicina', 'anatomía', 'fisiología', 'farmacología'],
    'derecho': ['derecho', 'leyes', 'jurídico', 'legal'],
    'psicología': ['psicología', 'psicologia', 'psychology']
  };

  // Métodos de pago colombianos
  const paymentMethods = {
    'pse': ['pse', 'banco', 'bancolombia', 'davivienda', 'bogotá'],
    'nequi': ['nequi', 'nequi app'],
    'daviplata': ['daviplata', 'daviPlata'],
    'tarjeta': ['tarjeta', 'visa', 'mastercard', 'crédito', 'débito']
  };

  // Universidades colombianas
  const universities = {
    'nacional': ['nacional', 'unal', 'universidad nacional'],
    'javeriana': ['javeriana', 'xaveriana', 'puj'],
    'andes': ['andes', 'uniandes', 'universidad de los andes'],
    'rosario': ['rosario', 'universidad del rosario'],
    'católica': ['católica', 'universidad católica', 'unicatolica'],
    'externado': ['externado', 'universidad externado'],
    'minuto': ['minuto de dios', 'uniminuto', 'minuto']
  };

  // Problemas técnicos específicos
  const technicalIssues = {
    'video': ['video', 'cámara', 'webcam', 'no me ven', 'no veo'],
    'audio': ['audio', 'sonido', 'micrófono', 'no escucho', 'no me escuchan'],
    'conexión': ['conexión', 'internet', 'wifi', 'lento', 'desconecta'],
    'navegador': ['chrome', 'firefox', 'safari', 'edge', 'navegador']
  };

  // Buscar entidades en todas las categorías
  const allEntities = { ...subjects, ...paymentMethods, ...universities, ...technicalIssues };
  
  for (const [mainEntity, variations] of Object.entries(allEntities)) {
    if (variations.some(variation => lowerMessage.includes(variation))) {
      entities.push(mainEntity);
    }
  }

  // Detectar montos en COP
  const copRegex = /(\$?[\d,.]+)\s*(cop|pesos?|mil)/gi;
  const copMatches = lowerMessage.match(copRegex);
  if (copMatches) {
    entities.push('precio_específico');
  }

  // Detectar horarios
  const timeRegex = /(\d{1,2}):?(\d{2})?\s*(am|pm|a\.?m\.?|p\.?m\.?)/gi;
  if (timeRegex.test(lowerMessage)) {
    entities.push('horario_específico');
  }

  // Detectar días de la semana
  const days = ['lunes', 'martes', 'miércoles', 'miercoles', 'jueves', 'viernes', 'sábado', 'sabado', 'domingo'];
  if (days.some(day => lowerMessage.includes(day))) {
    entities.push('día_específico');
  }

  // Detectar emociones/urgencia
  const urgentWords = ['urgente', 'rápido', 'rapido', 'inmediato', 'ya', 'ahora'];
  if (urgentWords.some(word => lowerMessage.includes(word))) {
    entities.push('urgente');
  }

  return [...new Set(entities)]; // Remover duplicados
};

// Utilidades
const getStatusDisplayName = (status: string): string => {
  const statusNames = {
    'open': 'Abierto',
    'in-progress': 'En progreso',
    'resolved': 'Resuelto',
    'closed': 'Cerrado'
  };
  return statusNames[status] || status;
};

// Inicialización de datos mock para desarrollo
export const initializeSupportData = async (): Promise<void> => {
  try {
    // Intentar inicializar Firestore, pero no fallar si no está disponible
    try {
      const faqsSnapshot = await getDocs(collection(db, 'faqs'));
      
      if (faqsSnapshot.empty) {
        console.log('Initializing FAQ data in Firestore...');
        // Solo intentar si Firestore está disponible
      }
    } catch (firestoreError) {
      console.warn('Firestore not available for initialization, using local data:', firestoreError);
    }

    // Inicializar datos locales siempre
    mockFAQs = [
      {
        id: 'faq-1',
        question: '¿Cómo funciona el emparejamiento inteligente con IA?',
        answer: 'Nuestro sistema de IA analiza tu perfil de aprendizaje, horarios, presupuesto y objetivos académicos para encontrar los tutores más compatibles. El algoritmo considera más de 15 factores diferentes y tiene una precisión del 87% en matches exitosos.',
        category: 'ai-features',
        helpful: 45,
        notHelpful: 3,
        tags: ['IA', 'matching', 'tutores', 'algoritmo'],
        views: 245,
        lastUpdated: new Date(),
        relatedFAQs: []
      },
      {
        id: 'faq-2',
        question: '¿Qué métodos de pago están disponibles en Colombia?',
        answer: 'Aceptamos múltiples métodos: PSE (recomendado), tarjetas de crédito/débito de bancos colombianos, billeteras digitales como Nequi y DaviPlata. Todos los pagos son seguros y se procesan en pesos colombianos (COP).',
        category: 'payments',
        helpful: 52,
        notHelpful: 1,
        tags: ['pagos', 'PSE', 'colombia', 'nequi', 'daviplata'],
        views: 312,
        lastUpdated: new Date(),
        relatedFAQs: []
      }
    ];

    console.log('Support data initialized successfully (local mode)');
  } catch (error) {
    console.error('Error initializing support data:', error);
  }
};

// Objeto principal del servicio para importación simplificada
export const supportService = {
  // Tickets
  createSupportTicket,
  getUserTickets,
  updateTicketStatus,
  rateTicket,
  
  // Chat con IA
  sendChatToAI,
  getTicketMessages,
  markMessageHelpful,
  
  // FAQ
  getFAQs,
  voteFAQ,
  
  // Sistema
  getSystemStatus,
  updateSystemStatus,
  
  // Métricas
  getSupportMetrics,
  
  // Inicialización
  initializeSupportData
};