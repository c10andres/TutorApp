// Servicio ML para Support Center con NLP avanzado
import { mlService } from './MLService';
import * as natural from 'natural';
import * as nlp from 'compromise';
import * as sentiment from 'sentiment';

export interface SupportTicket {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  aiAnalysis?: AIAnalysis;
}

export interface AIAnalysis {
  intent: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  entities: string[];
  keywords: string[];
  suggestedCategory: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  response: string;
  relatedTickets: string[];
}

export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  timestamp: Date;
  aiResponse?: string;
  confidence?: number;
  intent?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  popularity: number;
  lastUpdated: Date;
}

export class SupportCenterML {
  private nlpModel: any;
  private sentimentAnalyzer: any;
  private isInitialized = false;
  private conversationContext: Map<string, any> = new Map();

  constructor() {
    this.initializeNLP();
  }

  private async initializeNLP(): Promise<void> {
    try {
      // Inicializar analizador de sentimientos
      this.sentimentAnalyzer = new sentiment();
      
      // Configurar NLP
      natural.PorterStemmer.attach();
      
      this.isInitialized = true;
      console.log('🤖 Support Center ML inicializado');
    } catch (error) {
      console.error('❌ Error inicializando Support Center ML:', error);
    }
  }

  // Analizar ticket de soporte
  public async analyzeSupportTicket(ticket: SupportTicket): Promise<AIAnalysis> {
    if (!this.isInitialized) {
      return this.fallbackAnalysis(ticket);
    }

    try {
      const text = `${ticket.title} ${ticket.message}`;
      
      // Análisis de intención
      const intent = this.analyzeIntent(text);
      
      // Análisis de sentimientos
      const sentimentResult = this.analyzeSentiment(text);
      
      // Extracción de entidades
      const entities = this.extractEntities(text);
      
      // Extracción de palabras clave
      const keywords = this.extractKeywords(text);
      
      // Sugerir categoría
      const suggestedCategory = this.suggestCategory(intent, keywords);
      
      // Determinar prioridad
      const priority = this.determinePriority(intent, sentimentResult, ticket);
      
      // Generar respuesta
      const response = await this.generateResponse(intent, sentimentResult, ticket);
      
      // Buscar tickets relacionados
      const relatedTickets = await this.findRelatedTickets(ticket, intent, keywords);

      return {
        intent,
        sentiment: sentimentResult.label,
        confidence: sentimentResult.confidence,
        entities,
        keywords,
        suggestedCategory,
        priority,
        response,
        relatedTickets
      };
    } catch (error) {
      console.error('❌ Error analizando ticket:', error);
      return this.fallbackAnalysis(ticket);
    }
  }

  // Procesar mensaje de chat
  public async processChatMessage(message: ChatMessage): Promise<{
    response: string;
    confidence: number;
    intent: string;
    suggestions: string[];
  }> {
    if (!this.isInitialized) {
      return this.fallbackChatResponse(message);
    }

    try {
      // Obtener contexto de conversación
      const context = this.conversationContext.get(message.userId) || { history: [] };
      
      // Analizar mensaje
      const intent = this.analyzeIntent(message.message);
      const sentiment = this.analyzeSentiment(message.message);
      
      // Generar respuesta contextual
      const response = await this.generateContextualResponse(
        message.message,
        intent,
        sentiment,
        context
      );
      
      // Actualizar contexto
      context.history.push({
        message: message.message,
        intent,
        timestamp: new Date()
      });
      this.conversationContext.set(message.userId, context);
      
      // Generar sugerencias
      const suggestions = this.generateSuggestions(intent, context);

      return {
        response,
        confidence: sentiment.confidence,
        intent,
        suggestions
      };
    } catch (error) {
      console.error('❌ Error procesando mensaje:', error);
      return this.fallbackChatResponse(message);
    }
  }

  // Buscar FAQ relevante
  public async searchFAQ(query: string, faqItems: FAQItem[]): Promise<FAQItem[]> {
    if (!this.isInitialized) {
      return this.fallbackFAQSearch(query, faqItems);
    }

    try {
      const queryKeywords = this.extractKeywords(query);
      const scoredFAQs = faqItems.map(faq => {
        const score = this.calculateFAQScore(queryKeywords, faq.keywords, faq.question);
        return { ...faq, score };
      });

      return scoredFAQs
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    } catch (error) {
      console.error('❌ Error buscando FAQ:', error);
      return this.fallbackFAQSearch(query, faqItems);
    }
  }

  // Analizar intención del mensaje
  private analyzeIntent(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Patrones de intención
    const intentPatterns = {
      greeting: ['hola', 'buenos días', 'buenas tardes', 'hey', 'hi', 'saludos'],
      technical_issue: ['error', 'problema', 'bug', 'no funciona', 'falla', 'conexión', 'carga', 'lento'],
      payment_help: ['pago', 'dinero', 'tarjeta', 'pse', 'nequi', 'daviplata', 'factura', 'reembolso'],
      account_help: ['cuenta', 'perfil', 'configurar', 'cambiar', 'actualizar', 'contraseña'],
      tutoring_help: ['tutor', 'tutoría', 'clase', 'enseñar', 'aprender', 'materia', 'reservar'],
      pricing_help: ['precio', 'costo', 'cuánto', 'tarifa', 'descuento', 'promoción'],
      ai_features: ['ia', 'inteligencia', 'artificial', 'emparejamiento', 'predictor', 'planificador'],
      general_help: ['ayuda', 'como', 'cómo', 'qué', 'donde', 'cuándo', 'información']
    };

    for (const [intent, keywords] of Object.entries(intentPatterns)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return intent;
      }
    }

    return 'general_help';
  }

  // Analizar sentimientos
  private analyzeSentiment(text: string): { label: string; confidence: number } {
    const result = this.sentimentAnalyzer.analyze(text);
    
    return {
      label: result.score > 0.1 ? 'positive' : result.score < -0.1 ? 'negative' : 'neutral',
      confidence: Math.abs(result.score)
    };
  }

  // Extraer entidades
  private extractEntities(text: string): string[] {
    const doc = nlp(text);
    const entities = [
      ...doc.people().out('array'),
      ...doc.places().out('array'),
      ...doc.organizations().out('array')
    ];
    
    return entities.filter(entity => entity.length > 2);
  }

  // Extraer palabras clave
  private extractKeywords(text: string): string[] {
    const doc = nlp(text);
    const tokens = natural.WordTokenizer().tokenize(text.toLowerCase());
    const stopWords = natural.stopwords;
    
    return tokens
      .filter(token => token.length > 3 && !stopWords.includes(token))
      .slice(0, 10);
  }

  // Sugerir categoría
  private suggestCategory(intent: string, keywords: string[]): string {
    const categoryMap = {
      technical_issue: 'Técnico',
      payment_help: 'Pagos',
      account_help: 'Cuenta',
      tutoring_help: 'Tutorías',
      pricing_help: 'Precios',
      ai_features: 'IA',
      general_help: 'General'
    };

    return categoryMap[intent] || 'General';
  }

  // Determinar prioridad
  private determinePriority(
    intent: string,
    sentiment: any,
    ticket: SupportTicket
  ): 'low' | 'medium' | 'high' | 'urgent' {
    // Palabras que indican urgencia
    const urgentKeywords = ['urgente', 'crítico', 'emergencia', 'no funciona', 'error grave'];
    const hasUrgentKeywords = urgentKeywords.some(keyword => 
      ticket.message.toLowerCase().includes(keyword)
    );

    if (hasUrgentKeywords || sentiment.label === 'negative') {
      return 'urgent';
    }

    if (intent === 'technical_issue' || intent === 'payment_help') {
      return 'high';
    }

    if (intent === 'tutoring_help' || intent === 'account_help') {
      return 'medium';
    }

    return 'low';
  }

  // Generar respuesta
  private async generateResponse(
    intent: string,
    sentiment: any,
    ticket: SupportTicket
  ): Promise<string> {
    const responses = {
      greeting: '¡Hola! ¿En qué puedo ayudarte hoy?',
      technical_issue: 'Entiendo que tienes un problema técnico. Voy a ayudarte a resolverlo paso a paso.',
      payment_help: 'Te ayudo con tu consulta sobre pagos. ¿Podrías darme más detalles?',
      account_help: 'Te ayudo con la configuración de tu cuenta. ¿Qué necesitas cambiar?',
      tutoring_help: 'Te ayudo con las tutorías. ¿Tienes alguna pregunta específica?',
      pricing_help: 'Te ayudo con información sobre precios y tarifas.',
      ai_features: 'Te explico las funcionalidades de IA disponibles en la plataforma.',
      general_help: 'Estoy aquí para ayudarte. ¿Podrías ser más específico sobre tu consulta?'
    };

    let response = responses[intent] || responses.general_help;

    // Personalizar según sentimiento
    if (sentiment.label === 'negative') {
      response = `Entiendo tu frustración. ${response}`;
    } else if (sentiment.label === 'positive') {
      response = `¡Me alegra saber que todo va bien! ${response}`;
    }

    return response;
  }

  // Buscar tickets relacionados
  private async findRelatedTickets(
    ticket: SupportTicket,
    intent: string,
    keywords: string[]
  ): Promise<string[]> {
    // En implementación real se buscarían en base de datos
    // Por ahora retornar IDs mock
    return ['ticket_001', 'ticket_002', 'ticket_003'];
  }

  // Generar respuesta contextual
  private async generateContextualResponse(
    message: string,
    intent: string,
    sentiment: any,
    context: any
  ): Promise<string> {
    // Considerar historial de conversación
    const lastIntent = context.history[context.history.length - 1]?.intent;
    
    if (lastIntent === intent && context.history.length > 1) {
      return '¿Hay algo más específico que necesites saber sobre este tema?';
    }

    // Generar respuesta basada en intención
    const baseResponse = this.generateResponse(intent, sentiment, { message } as any);
    
    // Añadir contexto si es necesario
    if (context.history.length > 3) {
      return `${baseResponse} ¿Te gustaría que profundicemos en algún aspecto específico?`;
    }

    return baseResponse;
  }

  // Generar sugerencias
  private generateSuggestions(intent: string, context: any): string[] {
    const suggestions = {
      technical_issue: [
        'Revisar conexión a internet',
        'Limpiar caché del navegador',
        'Verificar configuración de cuenta'
      ],
      payment_help: [
        'Verificar métodos de pago',
        'Revisar historial de transacciones',
        'Contactar soporte de pagos'
      ],
      tutoring_help: [
        'Buscar tutores disponibles',
        'Revisar solicitudes pendientes',
        'Configurar preferencias de tutoría'
      ],
      general_help: [
        'Explorar funcionalidades de IA',
        'Revisar documentación',
        'Contactar soporte técnico'
      ]
    };

    return suggestions[intent] || suggestions.general_help;
  }

  // Calcular score de FAQ
  private calculateFAQScore(
    queryKeywords: string[],
    faqKeywords: string[],
    faqQuestion: string
  ): number {
    let score = 0;
    
    // Match de palabras clave
    const commonKeywords = queryKeywords.filter(keyword => 
      faqKeywords.includes(keyword)
    );
    score += commonKeywords.length * 0.3;
    
    // Match en la pregunta
    const questionWords = faqQuestion.toLowerCase().split(' ');
    const commonWords = queryKeywords.filter(keyword => 
      questionWords.includes(keyword)
    );
    score += commonWords.length * 0.2;
    
    return Math.min(score, 1);
  }

  // Análisis de fallback
  private fallbackAnalysis(ticket: SupportTicket): AIAnalysis {
    return {
      intent: 'general_help',
      sentiment: 'neutral',
      confidence: 0.5,
      entities: [],
      keywords: [],
      suggestedCategory: 'General',
      priority: 'medium',
      response: 'Gracias por contactarnos. Un agente te ayudará pronto.',
      relatedTickets: []
    };
  }

  // Respuesta de chat de fallback
  private fallbackChatResponse(message: ChatMessage): any {
    return {
      response: 'Estoy aquí para ayudarte. ¿En qué puedo asistirte?',
      confidence: 0.5,
      intent: 'general_help',
      suggestions: ['Explorar funcionalidades', 'Ver documentación', 'Contactar soporte']
    };
  }

  // Búsqueda FAQ de fallback
  private fallbackFAQSearch(query: string, faqItems: FAQItem[]): FAQItem[] {
    return faqItems.slice(0, 3);
  }
}

export const supportCenterML = new SupportCenterML();
