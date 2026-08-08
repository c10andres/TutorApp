// Servicio de Interacciones de Usuarios
// Complementa la encuesta de usabilidad de TutorApp
// Registra eventos de interacción que corresponden a las preguntas Q1-Q15

import { ref, push, set, get, query, orderByChild, limitToLast, startAt, endAt } from 'firebase/database';
import { database } from '../firebase';
import { UserInteraction, UserInteractionType, UserInteractionSummary } from '../types';
import { User } from '../types';

class UserInteractionsService {
  private readonly COLLECTION_PATH = 'user_interactions';
  private readonly SUMMARIES_PATH = 'user_interaction_summaries';

  /**
   * Registra una interacción de usuario
   * @param userId ID del usuario
   * @param userRole Rol del usuario (student, tutor, parent, other)
   * @param type Tipo de interacción
   * @param metadata Datos adicionales de la interacción
   */
  async logInteraction(
    userId: string,
    userRole: 'student' | 'tutor' | 'parent' | 'other',
    type: UserInteractionType,
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      const interactionRef = ref(database, this.COLLECTION_PATH);
      const newInteractionRef = push(interactionRef);

      const interaction: Omit<UserInteraction, 'id'> = {
        userId,
        userRole,
        type,
        metadata: metadata || {},
        timestamp: new Date(),
        createdAt: new Date(),
        deviceInfo: this.getDeviceInfo(),
      };

      const interactionData = {
        ...interaction,
        timestamp: interaction.timestamp.toISOString(),
        createdAt: interaction.createdAt.toISOString(),
      };

      await set(newInteractionRef, interactionData);

      const interactionId = newInteractionRef.key || '';
      
      // Actualizar resumen de interacciones (asíncrono, no bloquea)
      this.updateUserSummary(userId, userRole, type, metadata).catch(err => {
        console.warn('Error actualizando resumen de interacciones:', err);
      });

      return interactionId;
    } catch (error) {
      console.error('Error registrando interacción:', error);
      throw error;
    }
  }

  /**
   * Registra múltiples interacciones en batch
   */
  async logInteractions(
    userId: string,
    userRole: 'student' | 'tutor' | 'parent' | 'other',
    interactions: Array<{ type: UserInteractionType; metadata?: Record<string, any> }>
  ): Promise<string[]> {
    const promises = interactions.map(interaction =>
      this.logInteraction(userId, userRole, interaction.type, interaction.metadata)
    );
    return Promise.all(promises);
  }

  /**
   * Obtiene interacciones de un usuario
   */
  async getUserInteractions(
    userId: string,
    options?: {
      type?: UserInteractionType;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<UserInteraction[]> {
    try {
      const interactionsRef = ref(database, this.COLLECTION_PATH);
      let q = query(interactionsRef, orderByChild('userId'));

      // Aplicar filtros si existen
      if (options?.startDate) {
        q = query(q, startAt(options.startDate.toISOString()));
      }
      if (options?.endDate) {
        q = query(q, endAt(options.endDate.toISOString()));
      }
      if (options?.limit) {
        q = query(q, limitToLast(options.limit));
      }

      const snapshot = await get(q);
      
      if (!snapshot.exists()) {
        return [];
      }

      const interactions: UserInteraction[] = [];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        if (data.userId === userId) {
          if (!options?.type || data.type === options.type) {
            interactions.push({
              id: childSnapshot.key || '',
              ...data,
              timestamp: new Date(data.timestamp),
              createdAt: new Date(data.createdAt),
            });
          }
        }
      });

      return interactions.sort((a, b) => 
        b.timestamp.getTime() - a.timestamp.getTime()
      );
    } catch (error) {
      console.error('Error obteniendo interacciones:', error);
      return [];
    }
  }

  /**
   * Obtiene resumen de interacciones de un usuario
   */
  async getUserSummary(
    userId: string,
    periodDays: number = 30
  ): Promise<UserInteractionSummary | null> {
    try {
      const summaryRef = ref(database, `${this.SUMMARIES_PATH}/${userId}`);
      const snapshot = await get(summaryRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        return {
          ...data,
          periodStart: new Date(data.periodStart),
          periodEnd: new Date(data.periodEnd),
          lastUpdated: new Date(data.lastUpdated),
        };
      }

      // Si no existe resumen, calcularlo desde las interacciones
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      const interactions = await this.getUserInteractions(userId, {
        startDate,
        endDate,
      });

      return this.calculateSummary(userId, interactions, startDate, endDate);
    } catch (error) {
      console.error('Error obteniendo resumen:', error);
      return null;
    }
  }

  /**
   * Calcula resumen de interacciones
   */
  private calculateSummary(
    userId: string,
    interactions: UserInteraction[],
    periodStart: Date,
    periodEnd: Date
  ): UserInteractionSummary {
    const userRole = interactions[0]?.userRole || 'other';
    
    // Frecuencia de uso (Q1)
    const appOpens = interactions.filter(i => i.type === 'app_opened').length;
    const sessions = this.calculateSessions(interactions);
    const sessionDurations = this.calculateSessionDurations(interactions);
    const averageSessionDuration = sessionDurations.length > 0
      ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
      : 0;
    
    const uniqueDates = new Set(
      interactions.map(i => i.timestamp.toDateString())
    );
    const daysActive = uniqueDates.size;
    const lastActiveDate = interactions.length > 0
      ? interactions[0].timestamp
      : new Date();

    // Navegación (Q3, Q4)
    const pageViews = interactions.filter(i => i.type === 'page_viewed');
    const uniquePages = new Set(pageViews.map(i => i.page).filter(Boolean));
    const pageCounts = new Map<string, number>();
    pageViews.forEach(i => {
      if (i.page) {
        pageCounts.set(i.page, (pageCounts.get(i.page) || 0) + 1);
      }
    });
    const mostVisitedPages = Array.from(pageCounts.entries())
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Rendimiento (Q5)
    const loadTimes = interactions
      .filter(i => i.type === 'page_load_time' && i.metadata?.loadTime)
      .map(i => i.metadata.loadTime as number);
    const averagePageLoadTime = loadTimes.length > 0
      ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length
      : 0;
    const errors = interactions.filter(i => i.type === 'error_occurred').length;
    const errorRate = interactions.length > 0
      ? (errors / interactions.length) * 100
      : 0;

    // Búsqueda de tutores (Q9, Q10, Q11)
    const tutorSearches = interactions.filter(i => 
      i.type === 'tutor_search_performed'
    );
    const filtersApplied = interactions.filter(i =>
      i.type === 'tutor_search_filter_applied'
    );
    const tutorProfilesViewed = interactions.filter(i =>
      i.type === 'tutor_profile_viewed'
    );
    const searchResults = tutorSearches
      .map(i => i.metadata?.resultsCount as number || 0)
      .filter(count => count > 0);
    const averageSearchResults = searchResults.length > 0
      ? searchResults.reduce((a, b) => a + b, 0) / searchResults.length
      : 0;

    // Chat (Q12)
    const chatMessages = interactions.filter(i =>
      i.type === 'chat_message_sent' || i.type === 'chat_message_received'
    );
    const chatSessions = new Set(
      interactions
        .filter(i => i.type === 'chat_opened')
        .map(i => i.metadata?.chatId)
        .filter(Boolean)
    ).size;
    const responseTimes = interactions
      .filter(i => i.type === 'chat_response_time' && i.metadata?.responseTime)
      .map(i => i.metadata.responseTime as number);
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;
    const messageLengths = chatMessages
      .map(i => i.metadata?.messageLength as number || 0)
      .filter(len => len > 0);
    const averageMessageLength = messageLengths.length > 0
      ? messageLengths.reduce((a, b) => a + b, 0) / messageLengths.length
      : 0;

    // Solicitudes (Q13)
    const requestsCreated = interactions.filter(i =>
      i.type === 'tutoring_request_created'
    ).length;
    const requestsCompleted = interactions.filter(i =>
      i.type === 'tutoring_request_completed'
    ).length;
    const requestsCancelled = interactions.filter(i =>
      i.type === 'tutoring_request_cancelled'
    ).length;
    const requestDurations = interactions
      .filter(i => i.type === 'tutoring_request_completed' && i.metadata?.duration)
      .map(i => i.metadata.duration as number);
    const averageRequestDuration = requestDurations.length > 0
      ? requestDurations.reduce((a, b) => a + b, 0) / requestDurations.length
      : 0;

    // Pagos (Q14)
    const payments = interactions.filter(i =>
      i.type === 'payment_completed'
    );
    const paymentAmounts = payments
      .map(i => i.metadata?.paymentAmount as number || 0)
      .filter(amount => amount > 0);
    const totalPaymentAmount = paymentAmounts.reduce((a, b) => a + b, 0);
    const paymentMethods = payments
      .map(i => i.metadata?.paymentMethod)
      .filter(Boolean) as string[];
    const preferredPaymentMethod = this.getMostFrequent(paymentMethods);
    const paymentFailed = interactions.filter(i =>
      i.type === 'payment_failed'
    ).length;
    const paymentSuccessRate = payments.length + paymentFailed > 0
      ? (payments.length / (payments.length + paymentFailed)) * 100
      : 0;

    // IA (Q15)
    const aiFeatures = interactions.filter(i =>
      i.type === 'ai_feature_used'
    );
    const aiFeaturesList = Array.from(
      new Set(aiFeatures.map(i => i.metadata?.aiFeature).filter(Boolean))
    ) as string[];
    const aiAccepted = interactions.filter(i =>
      i.type === 'ai_suggestion_accepted'
    ).length;
    const aiRejected = interactions.filter(i =>
      i.type === 'ai_suggestion_rejected'
    ).length;
    const aiAcceptanceRate = aiAccepted + aiRejected > 0
      ? (aiAccepted / (aiAccepted + aiRejected)) * 100
      : 0;

    return {
      userId,
      userRole,
      totalSessions: sessions.length,
      totalAppOpens: appOpens,
      averageSessionDuration,
      lastActiveDate,
      daysActive,
      totalPageViews: pageViews.length,
      uniquePagesVisited: uniquePages.size,
      averageNavigationTime: 0, // Calcular si es necesario
      mostVisitedPages,
      averagePageLoadTime,
      totalErrors: errors,
      errorRate,
      totalTutorSearches: tutorSearches.length,
      totalFiltersApplied: filtersApplied.length,
      totalTutorProfilesViewed: tutorProfilesViewed.length,
      averageSearchResults,
      totalChatMessages: chatMessages.length,
      totalChatSessions: chatSessions,
      averageResponseTime,
      averageMessageLength,
      totalRequestsCreated: requestsCreated,
      totalRequestsCompleted: requestsCompleted,
      totalRequestsCancelled: requestsCancelled,
      averageRequestDuration,
      totalPayments: payments.length,
      totalPaymentAmount,
      preferredPaymentMethod,
      paymentSuccessRate,
      totalAIFeaturesUsed: aiFeatures.length,
      aiFeaturesUsed: aiFeaturesList,
      aiAcceptanceRate,
      periodStart,
      periodEnd,
      lastUpdated: new Date(),
    };
  }

  /**
   * Actualiza el resumen de interacciones de un usuario
   */
  private async updateUserSummary(
    userId: string,
    userRole: 'student' | 'tutor' | 'parent' | 'other',
    type: UserInteractionType,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const summaryRef = ref(database, `${this.SUMMARIES_PATH}/${userId}`);
      const snapshot = await get(summaryRef);

      let summary: UserInteractionSummary;
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        summary = {
          ...data,
          periodStart: new Date(data.periodStart),
          periodEnd: new Date(data.periodEnd),
          lastUpdated: new Date(data.lastUpdated),
        };
      } else {
        // Crear resumen inicial
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        summary = {
          userId,
          userRole,
          totalSessions: 0,
          totalAppOpens: 0,
          averageSessionDuration: 0,
          lastActiveDate: new Date(),
          daysActive: 0,
          totalPageViews: 0,
          uniquePagesVisited: 0,
          averageNavigationTime: 0,
          mostVisitedPages: [],
          averagePageLoadTime: 0,
          totalErrors: 0,
          errorRate: 0,
          totalTutorSearches: 0,
          totalFiltersApplied: 0,
          totalTutorProfilesViewed: 0,
          averageSearchResults: 0,
          totalChatMessages: 0,
          totalChatSessions: 0,
          averageResponseTime: 0,
          averageMessageLength: 0,
          totalRequestsCreated: 0,
          totalRequestsCompleted: 0,
          totalRequestsCancelled: 0,
          averageRequestDuration: 0,
          totalPayments: 0,
          totalPaymentAmount: 0,
          paymentSuccessRate: 0,
          totalAIFeaturesUsed: 0,
          aiFeaturesUsed: [],
          aiAcceptanceRate: 0,
          periodStart: startDate,
          periodEnd: endDate,
          lastUpdated: new Date(),
        };
      }

      // Actualizar campos relevantes según el tipo de interacción
      this.updateSummaryFields(summary, type, metadata);
      summary.lastUpdated = new Date();

      // Guardar en Firebase
      const summaryData = {
        ...summary,
        periodStart: summary.periodStart.toISOString(),
        periodEnd: summary.periodEnd.toISOString(),
        lastUpdated: summary.lastUpdated.toISOString(),
      };

      await set(ref(database, `${this.SUMMARIES_PATH}/${userId}`), summaryData);
    } catch (error) {
      console.error('Error actualizando resumen:', error);
    }
  }

  /**
   * Actualiza campos específicos del resumen según el tipo de interacción
   */
  private updateSummaryFields(
    summary: UserInteractionSummary,
    type: UserInteractionType,
    metadata?: Record<string, any>
  ): void {
    switch (type) {
      case 'app_opened':
        summary.totalAppOpens++;
        break;
      case 'page_viewed':
        summary.totalPageViews++;
        if (metadata?.page) {
          const pageEntry = summary.mostVisitedPages.find(p => p.page === metadata.page);
          if (pageEntry) {
            pageEntry.count++;
          } else {
            summary.mostVisitedPages.push({ page: metadata.page, count: 1 });
          }
          summary.mostVisitedPages.sort((a, b) => b.count - a.count);
          summary.mostVisitedPages = summary.mostVisitedPages.slice(0, 10);
        }
        break;
      case 'page_load_time':
        if (metadata?.loadTime) {
          const currentAvg = summary.averagePageLoadTime;
          const count = summary.totalPageViews;
          summary.averagePageLoadTime = (currentAvg * count + metadata.loadTime) / (count + 1);
        }
        break;
      case 'error_occurred':
        summary.totalErrors++;
        break;
      case 'tutor_search_performed':
        summary.totalTutorSearches++;
        break;
      case 'tutor_search_filter_applied':
        summary.totalFiltersApplied++;
        break;
      case 'tutor_profile_viewed':
        summary.totalTutorProfilesViewed++;
        break;
      case 'chat_message_sent':
      case 'chat_message_received':
        summary.totalChatMessages++;
        break;
      case 'chat_opened':
        summary.totalChatSessions++;
        break;
      case 'tutoring_request_created':
        summary.totalRequestsCreated++;
        break;
      case 'tutoring_request_completed':
        summary.totalRequestsCompleted++;
        break;
      case 'tutoring_request_cancelled':
        summary.totalRequestsCancelled++;
        break;
      case 'payment_completed':
        summary.totalPayments++;
        if (metadata?.paymentAmount) {
          summary.totalPaymentAmount += metadata.paymentAmount;
        }
        break;
      case 'ai_feature_used':
        summary.totalAIFeaturesUsed++;
        if (metadata?.aiFeature && !summary.aiFeaturesUsed.includes(metadata.aiFeature)) {
          summary.aiFeaturesUsed.push(metadata.aiFeature);
        }
        break;
    }
  }

  /**
   * Calcula sesiones de usuario
   */
  private calculateSessions(interactions: UserInteraction[]): Array<{ start: Date; end: Date }> {
    const sessions: Array<{ start: Date; end: Date }> = [];
    let currentSession: { start: Date; end: Date } | null = null;

    const sorted = [...interactions].sort((a, b) =>
      a.timestamp.getTime() - b.timestamp.getTime()
    );

    for (const interaction of sorted) {
      if (interaction.type === 'session_started' || interaction.type === 'app_opened') {
        if (currentSession) {
          sessions.push(currentSession);
        }
        currentSession = {
          start: interaction.timestamp,
          end: interaction.timestamp,
        };
      } else if (interaction.type === 'session_ended' || interaction.type === 'app_closed') {
        if (currentSession) {
          currentSession.end = interaction.timestamp;
          sessions.push(currentSession);
          currentSession = null;
        }
      } else if (currentSession) {
        currentSession.end = interaction.timestamp;
      }
    }

    if (currentSession) {
      sessions.push(currentSession);
    }

    return sessions;
  }

  /**
   * Calcula duraciones de sesiones
   */
  private calculateSessionDurations(interactions: UserInteraction[]): number[] {
    const sessions = this.calculateSessions(interactions);
    return sessions.map(session =>
      (session.end.getTime() - session.start.getTime()) / 1000
    );
  }

  /**
   * Obtiene el valor más frecuente en un array
   */
  private getMostFrequent<T>(arr: T[]): T | undefined {
    if (arr.length === 0) return undefined;
    
    const counts = new Map<T, number>();
    arr.forEach(item => {
      counts.set(item, (counts.get(item) || 0) + 1);
    });

    let maxCount = 0;
    let mostFrequent: T | undefined;
    
    counts.forEach((count, item) => {
      if (count > maxCount) {
        maxCount = count;
        mostFrequent = item;
      }
    });

    return mostFrequent;
  }

  /**
   * Obtiene información del dispositivo
   */
  private getDeviceInfo(): UserInteraction['deviceInfo'] {
    if (typeof window === 'undefined') {
      return {};
    }

    return {
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
}

export const userInteractionsService = new UserInteractionsService();
