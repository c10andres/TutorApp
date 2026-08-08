// Generador de Interacciones basadas en Respuestas de Encuesta
// Genera interacciones que coinciden con las respuestas de la encuesta de usabilidad

import { userInteractionsService } from './user-interactions';
import { SurveyResponse, UserSurveyResponse } from '../types/survey';
import { UserInteractionType } from '../types';

/**
 * Genera interacciones de usuario basadas en las respuestas de la encuesta
 * Las interacciones reflejan el comportamiento que las respuestas sugieren
 */
export class SurveyInteractionsGenerator {
  /**
   * Genera interacciones para un usuario basado en sus respuestas de encuesta
   */
  async generateInteractionsForUser(
    userId: string,
    surveyResponse: SurveyResponse,
    daysBack: number = 30
  ): Promise<void> {
    const userRole = this.mapRoleToInteractionRole(surveyResponse.Q2_Rol);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Q1: Frecuencia de uso - Generar aperturas de app y sesiones
    await this.generateFrequencyInteractions(
      userId,
      userRole,
      surveyResponse.Q1_FrecuenciaUso,
      startDate
    );

    // Q3, Q4: Navegación - Generar eventos de navegación
    await this.generateNavigationInteractions(
      userId,
      userRole,
      surveyResponse.Q3_NavegacionFacil,
      surveyResponse.Q4_EncontrarLoBuscado,
      startDate
    );

    // Q5: Velocidad - Generar tiempos de carga
    await this.generatePerformanceInteractions(
      userId,
      userRole,
      surveyResponse.Q5_Velocidad,
      startDate
    );

    // Q9, Q10, Q11: Búsqueda de tutores
    if (surveyResponse.Q9_BusquedaTutores !== 'No he usado la búsqueda') {
      await this.generateTutorSearchInteractions(
        userId,
        userRole,
        surveyResponse.Q9_BusquedaTutores,
        surveyResponse.Q10_FiltrosUtiles,
        surveyResponse.Q11_ClaridadPerfilTutor,
        startDate
      );
    }

    // Q12: Chat
    if (surveyResponse.Q12_ChatExperiencia !== 'No he usado el chat') {
      await this.generateChatInteractions(
        userId,
        userRole,
        surveyResponse.Q12_ChatExperiencia,
        startDate
      );
    }

    // Q13: Solicitudes de tutoría
    if (surveyResponse.Q13_SolicitudClara !== 'No he realizado solicitudes') {
      await this.generateTutoringRequestInteractions(
        userId,
        userRole,
        surveyResponse.Q13_SolicitudClara,
        startDate
      );
    }

    // Q14: Pagos
    if (surveyResponse.Q14_PagosAdecuados !== 'No he realizado pagos') {
      await this.generatePaymentInteractions(
        userId,
        userRole,
        surveyResponse.Q14_PagosAdecuados,
        startDate
      );
    }

    // Q15: IA
    if (surveyResponse.Q15_IAUtilidad !== 'No he utilizado la IA') {
      await this.generateAIFeatureInteractions(
        userId,
        userRole,
        surveyResponse.Q15_IAUtilidad,
        startDate
      );
    }
  }

  /**
   * Q1: Genera interacciones de frecuencia de uso
   */
  private async generateFrequencyInteractions(
    userId: string,
    userRole: 'student' | 'tutor' | 'parent' | 'other',
    frecuencia: SurveyResponse['Q1_FrecuenciaUso'],
    startDate: Date
  ): Promise<void> {
    const frequencyMap: Record<string, { opens: number; sessions: number }> = {
      'Todos los días': { opens: 30, sessions: 30 },
      'Varias veces a la semana': { opens: 12, sessions: 12 },
      'Una vez a la semana': { opens: 4, sessions: 4 },
      'Varias veces al mes': { opens: 6, sessions: 6 },
      'Rara vez': { opens: 2, sessions: 2 },
      'Esta es la primera vez': { opens: 1, sessions: 1 },
    };

    const config = frequencyMap[frecuencia] || { opens: 1, sessions: 1 };
    const days = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    for (let i = 0; i < config.opens; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + Math.floor(Math.random() * days));

      // Apertura de app
      await userInteractionsService.logInteraction(
        userId,
        userRole,
        'app_opened',
        { timestamp: date.toISOString() }
      );

      // Sesión iniciada
      await userInteractionsService.logInteraction(
        userId,
        userRole,
        'session_started',
        { timestamp: date.toISOString() }
      );

      // Duración de sesión (en segundos)
      const sessionDuration = this.getSessionDuration(frecuencia);
      const sessionEnd = new Date(date);
      sessionEnd.setSeconds(sessionEnd.getSeconds() + sessionDuration);

      // Sesión finalizada
      await userInteractionsService.logInteraction(
        userId,
        userRole,
        'session_ended',
        { 
          timestamp: sessionEnd.toISOString(),
          sessionDuration 
        }
      );

      // Cierre de app
      await userInteractionsService.logInteraction(
        userId,
        userRole,
        'app_closed',
        { timestamp: sessionEnd.toISOString() }
      );
    }
  }

  /**
   * Q3, Q4: Genera interacciones de navegación
   */
  private async generateNavigationInteractions(
    userId: string,
    userRole: 'student' | 'tutor' | 'parent' | 'other',
    facilidad: SurveyResponse['Q3_NavegacionFacil'],
    encontrar: SurveyResponse['Q4_EncontrarLoBuscado'],
    startDate: Date
  ): Promise<void> {
    const pages = ['home', 'tutor-search', 'tutor-profile', 'chat', 'requests', 'payments', 'profile'];
    
    // Número de navegaciones según la facilidad
    const navigationCount = this.getNavigationCount(facilidad, encontrar);
    
    // Si es difícil, más clicks de navegación y uso del botón atrás
    const isDifficult = facilidad === 'Difícil' || facilidad === 'Muy difícil';
    const backButtonUsage = isDifficult ? Math.floor(navigationCount * 0.3) : Math.floor(navigationCount * 0.1);

    for (let i = 0; i < navigationCount; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + Math.floor(Math.random() * 30));
      date.setHours(8 + Math.floor(Math.random() * 12));
      date.setMinutes(Math.floor(Math.random() * 60));

      const fromPage = pages[Math.floor(Math.random() * pages.length)];
      const toPage = pages[Math.floor(Math.random() * pages.length)];

      // Vista de página
      await userInteractionsService.logInteraction(
        userId,
        userRole,
        'page_viewed',
        {
          page: toPage,
          fromPage: i > 0 ? fromPage : undefined,
          timestamp: date.toISOString(),
        }
      );

      // Click de navegación
      if (i > 0) {
        await userInteractionsService.logInteraction(
          userId,
          userRole,
          'navigation_click',
          {
            fromPage,
            toPage,
            timestamp: date.toISOString(),
          }
        );
      }

      // Uso del botón atrás (más frecuente si es difícil)
      if (i < backButtonUsage && Math.random() < (isDifficult ? 0.4 : 0.1)) {
        await userInteractionsService.logInteraction(
          userId,
          userRole,
          'back_button_used',
          {
            fromPage: toPage,
            toPage: fromPage,
            timestamp: new Date(date.getTime() + 5000).toISOString(),
          }
        );
      }
    }
  }

  /**
   * Q5: Genera interacciones de rendimiento
   */
  private async generatePerformanceInteractions(
    userId: string,
    userRole: 'student' | 'tutor' | 'parent' | 'other',
    velocidad: SurveyResponse['Q5_Velocidad'],
    startDate: Date
  ): Promise<void> {
    const loadTimeMap: Record<string, { min: number; max: number }> = {
      'Muy rápida': { min: 200, max: 500 },
      'Rápida': { min: 500, max: 1000 },
      'Adecuada': { min: 1000, max: 2000 },
      'Lenta': { min: 2000, max: 4000 },
      'Muy lenta': { min: 4000, max: 8000 },
    };

    const config = loadTimeMap[velocidad] || { min: 1000, max: 2000 };
    const pageCount = 20 + Math.floor(Math.random() * 30);

    for (let i = 0; i < pageCount; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + Math.floor(Math.random() * 30));
      
      const loadTime = config.min + Math.random() * (config.max - config.min);
      const page = ['home', 'tutor-search', 'tutor-profile', 'chat', 'requests'][Math.floor(Math.random() * 5)];

      await userInteractionsService.logInteraction(
        userId,
        userRole,
        'page_load_time',
        {
          page,
          loadTime: Math.round(loadTime),
          timestamp: date.toISOString(),
        }
      );

      // Si es lenta, puede haber errores ocasionales
      if ((velocidad === 'Lenta' || velocidad === 'Muy lenta') && Math.random() < 0.1) {
        await userInteractionsService.logInteraction(
          userId,
          userRole,
          'error_occurred',
          {
            page,
            errorMessage: 'Tiempo de carga excedido',
            errorCode: 'TIMEOUT',
            timestamp: date.toISOString(),
          }
        );
      }
    }
  }

  /**
   * Q9, Q10, Q11: Genera interacciones de búsqueda de tutores
   */
  private async generateTutorSearchInteractions(
    userId: string,
    userRole: 'student' | 'tutor' | 'parent' | 'other',
    facilidad: SurveyResponse['Q9_BusquedaTutores'],
    filtros: SurveyResponse['Q10_FiltrosUtiles'],
    claridad: SurveyResponse['Q11_ClaridadPerfilTutor'],
    startDate: Date
  ): Promise<void> {
    const searchCount = this.getSearchCount(facilidad);
    const subjects = ['Matemáticas', 'Física', 'Química', 'Biología', 'Inglés', 'Programación'];

    for (let i = 0; i < searchCount; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + Math.floor(Math.random() * 30));
      
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const resultsCount = 5 + Math.floor(Math.random() * 20);

      // Búsqueda realizada
      await userInteractionsService.logInteraction(
        userId,
        userRole,
        'tutor_search_performed',
        {
          searchQuery: subject,
          resultsCount,
          timestamp: date.toISOString(),
        }
      );

      // Aplicación de filtros (si los encuentra útiles)
      if (filtros === 'Muy útiles' || filtros === 'Útiles') {
        const filterCount = 1 + Math.floor(Math.random() * 3);
        for (let j = 0; j < filterCount; j++) {
          await userInteractionsService.logInteraction(
            userId,
            userRole,
            'tutor_search_filter_applied',
            {
              filterName: ['priceRange', 'rating', 'location'][j] || 'priceRange',
              filterValue: j === 0 ? '0-50000' : j === 1 ? '4+' : 'Bogotá',
              timestamp: new Date(date.getTime() + j * 1000).toISOString(),
            }
          );
        }
      }

      // Visualización de perfiles (más si la claridad es buena)
      const profileViews = claridad === 'Muy clara' || claridad === 'Clara' 
        ? Math.min(resultsCount, 3 + Math.floor(Math.random() * 5))
        : Math.min(resultsCount, 1 + Math.floor(Math.random() * 2));

      for (let j = 0; j < profileViews; j++) {
        await userInteractionsService.logInteraction(
          userId,
          userRole,
          'tutor_profile_viewed',
          {
            tutorId: `tutor-${i}-${j}`,
            tutorName: `Tutor ${j + 1}`,
            timestamp: new Date(date.getTime() + (j + 1) * 2000).toISOString(),
          }
        );
      }
    }
  }

  /**
   * Q12: Genera interacciones de chat
   */
  private async generateChatInteractions(
    userId: string,
    userRole: 'student' | 'tutor' | 'parent' | 'other',
    experiencia: SurveyResponse['Q12_ChatExperiencia'],
    startDate: Date
  ): Promise<void> {
    const chatCount = experiencia === 'Muy buena' || experiencia === 'Buena' ? 5 : 2;
    const messageCountPerChat = experiencia === 'Muy buena' ? 20 : experiencia === 'Buena' ? 15 : 8;

    for (let i = 0; i < chatCount; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + Math.floor(Math.random() * 30));
      const chatId = `chat-${userId}-${i}`;

      // Apertura de chat
      await userInteractionsService.logInteraction(
        userId,
        userRole,
        'chat_opened',
        {
          chatId,
          timestamp: date.toISOString(),
        }
      );

      // Mensajes
      for (let j = 0; j < messageCountPerChat; j++) {
        const messageDate = new Date(date);
        messageDate.setMinutes(messageDate.getMinutes() + j * 5);
        const messageLength = 20 + Math.floor(Math.random() * 100);
        const isSent = Math.random() > 0.5;

        await userInteractionsService.logInteraction(
          userId,
          userRole,
          isSent ? 'chat_message_sent' : 'chat_message_received',
          {
            chatId,
            messageLength,
            timestamp: messageDate.toISOString(),
          }
        );

        // Tiempo de respuesta (si es buena experiencia, respuestas rápidas)
        if (j > 0 && isSent && (experiencia === 'Muy buena' || experiencia === 'Buena')) {
          const responseTime = experiencia === 'Muy buena' ? 5000 + Math.random() * 10000 : 10000 + Math.random() * 20000;
          await userInteractionsService.logInteraction(
            userId,
            userRole,
            'chat_response_time',
            {
              chatId,
              responseTime: Math.round(responseTime),
              timestamp: new Date(messageDate.getTime() + responseTime).toISOString(),
            }
          );
        }
      }
    }
  }

  /**
   * Q13: Genera interacciones de solicitudes de tutoría
   */
  private async generateTutoringRequestInteractions(
    userId: string,
    userRole: 'student' | 'tutor' | 'parent' | 'other',
    claridad: SurveyResponse['Q13_SolicitudClara'],
    startDate: Date
  ): Promise<void> {
    const requestCount = claridad === 'Muy clara' || claridad === 'Clara' ? 3 : 1;

    for (let i = 0; i < requestCount; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + Math.floor(Math.random() * 30));
      const requestId = `request-${userId}-${i}`;
      const subject = ['Matemáticas', 'Física', 'Química'][Math.floor(Math.random() * 3)];
      const duration = 60;
      const amount = 50000 + Math.floor(Math.random() * 50000);

      // Creación de solicitud
      await userInteractionsService.logInteraction(
        userId,
        userRole,
        'tutoring_request_created',
        {
          requestId,
          subject,
          duration,
          amount,
          timestamp: date.toISOString(),
        }
      );

      // Si es clara, más probabilidad de completarse
      if (claridad === 'Muy clara' || claridad === 'Clara') {
        if (Math.random() > 0.3) {
          const completedDate = new Date(date);
          completedDate.setDate(completedDate.getDate() + 1 + Math.floor(Math.random() * 7));

          await userInteractionsService.logInteraction(
            userId,
            userRole,
            'tutoring_request_completed',
            {
              requestId,
              duration,
              timestamp: completedDate.toISOString(),
            }
          );
        }
      }
    }
  }

  /**
   * Q14: Genera interacciones de pagos
   */
  private async generatePaymentInteractions(
    userId: string,
    userRole: 'student' | 'tutor' | 'parent' | 'other',
    adecuacion: SurveyResponse['Q14_PagosAdecuados'],
    startDate: Date
  ): Promise<void> {
    const paymentCount = adecuacion === 'Muy de acuerdo' || adecuacion === 'De acuerdo' ? 3 : 1;
    const successRate = adecuacion === 'Muy de acuerdo' ? 1.0 : adecuacion === 'De acuerdo' ? 0.9 : 0.7;

    for (let i = 0; i < paymentCount; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + Math.floor(Math.random() * 30));
      const amount = 50000 + Math.floor(Math.random() * 100000);
      const paymentMethod = ['credit_card', 'debit_card', 'nequi', 'daviplata'][Math.floor(Math.random() * 4)];

      // Inicio de pago
      await userInteractionsService.logInteraction(
        userId,
        userRole,
        'payment_initiated',
        {
          paymentMethod,
          paymentAmount: amount,
          timestamp: date.toISOString(),
        }
      );

      // Selección de método
      await userInteractionsService.logInteraction(
        userId,
        userRole,
        'payment_method_selected',
        {
          paymentMethod,
          timestamp: new Date(date.getTime() + 2000).toISOString(),
        }
      );

      // Resultado del pago
      const isSuccess = Math.random() < successRate;
      await userInteractionsService.logInteraction(
        userId,
        userRole,
        isSuccess ? 'payment_completed' : 'payment_failed',
        {
          paymentMethod,
          paymentAmount: amount,
          paymentStatus: isSuccess ? 'completed' : 'failed',
          timestamp: new Date(date.getTime() + 5000).toISOString(),
        }
      );
    }
  }

  /**
   * Q15: Genera interacciones de IA
   */
  private async generateAIFeatureInteractions(
    userId: string,
    userRole: 'student' | 'tutor' | 'parent' | 'other',
    utilidad: SurveyResponse['Q15_IAUtilidad'],
    startDate: Date
  ): Promise<void> {
    const featureCount = utilidad === 'Muy útil' || utilidad === 'Útil' ? 5 : 2;
    const features = ['academic_predictor', 'study_planner', 'smart_matching', 'support_ai'];
    const acceptanceRate = utilidad === 'Muy útil' ? 0.8 : utilidad === 'Útil' ? 0.6 : 0.3;

    for (let i = 0; i < featureCount; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + Math.floor(Math.random() * 30));
      const feature = features[Math.floor(Math.random() * features.length)];

      // Uso de funcionalidad de IA
      await userInteractionsService.logInteraction(
        userId,
        userRole,
        'ai_feature_used',
        {
          aiFeature: feature,
          aiModel: 'gpt-4',
          aiConfidence: 0.7 + Math.random() * 0.3,
          timestamp: date.toISOString(),
        }
      );

      // Visualización de predicción/sugerencia
      await userInteractionsService.logInteraction(
        userId,
        userRole,
        'ai_prediction_viewed',
        {
          aiFeature: feature,
          timestamp: new Date(date.getTime() + 1000).toISOString(),
        }
      );

      // Aceptación o rechazo de sugerencia
      const isAccepted = Math.random() < acceptanceRate;
      await userInteractionsService.logInteraction(
        userId,
        userRole,
        isAccepted ? 'ai_suggestion_accepted' : 'ai_suggestion_rejected',
        {
          aiFeature: feature,
          timestamp: new Date(date.getTime() + 3000).toISOString(),
        }
      );
    }
  }

  // Métodos auxiliares

  private mapRoleToInteractionRole(role: string): 'student' | 'tutor' | 'parent' | 'other' {
    switch (role) {
      case 'Estudiante': return 'student';
      case 'Tutor': return 'tutor';
      case 'Padre/Madre': return 'parent';
      default: return 'other';
    }
  }

  private getSessionDuration(frecuencia: string): number {
    const durationMap: Record<string, number> = {
      'Todos los días': 1800, // 30 min
      'Varias veces a la semana': 2400, // 40 min
      'Una vez a la semana': 3600, // 1 hora
      'Varias veces al mes': 1800,
      'Rara vez': 900, // 15 min
      'Esta es la primera vez': 600, // 10 min
    };
    return durationMap[frecuencia] || 1800;
  }

  private getNavigationCount(facilidad: string, encontrar: string): number {
    // Si es fácil encontrar, menos navegaciones necesarias
    // Si es difícil, más navegaciones
    const baseCount = encontrar === 'Siempre' ? 10 : encontrar === 'Casi siempre' ? 15 : 25;
    const difficultyMultiplier = facilidad === 'Muy fácil' ? 0.8 : facilidad === 'Fácil' ? 1.0 : 1.5;
    return Math.floor(baseCount * difficultyMultiplier);
  }

  private getSearchCount(facilidad: string): number {
    const countMap: Record<string, number> = {
      'Muy fácil': 8,
      'Fácil': 6,
      'Regular': 4,
      'Difícil': 2,
      'Muy difícil': 1,
    };
    return countMap[facilidad] || 3;
  }
}

export const surveyInteractionsGenerator = new SurveyInteractionsGenerator();
