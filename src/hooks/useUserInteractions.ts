// Hook para facilitar el uso del servicio de interacciones de usuarios
import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userInteractionsService } from '../services/user-interactions';
import { UserInteractionType, UserInteractionSummary } from '../types';

/**
 * Hook para registrar y obtener interacciones de usuarios
 * Complementa la encuesta de usabilidad de TutorApp
 */
export function useUserInteractions() {
  const { user } = useAuth();

  /**
   * Registra una interacción de usuario
   */
  const logInteraction = useCallback(
    async (
      type: UserInteractionType,
      metadata?: Record<string, any>
    ): Promise<string | null> => {
      if (!user) {
        console.warn('No hay usuario autenticado, no se puede registrar interacción');
        return null;
      }

      try {
        // Determinar el rol del usuario
        const userRole = user.currentMode === 'student'
          ? 'student'
          : user.currentMode === 'tutor'
          ? 'tutor'
          : 'other';

        const interactionId = await userInteractionsService.logInteraction(
          user.id,
          userRole,
          type,
          metadata
        );

        return interactionId;
      } catch (error) {
        console.error('Error registrando interacción:', error);
        return null;
      }
    },
    [user]
  );

  /**
   * Registra una vista de página
   */
  const logPageView = useCallback(
    async (page: string, metadata?: Record<string, any>) => {
      return logInteraction('page_viewed', {
        page,
        ...metadata,
      });
    },
    [logInteraction]
  );

  /**
   * Registra una búsqueda de tutores
   */
  const logTutorSearch = useCallback(
    async (
      searchQuery: string,
      filters?: Record<string, any>,
      resultsCount?: number
    ) => {
      return logInteraction('tutor_search_performed', {
        searchQuery,
        filters,
        resultsCount,
      });
    },
    [logInteraction]
  );

  /**
   * Registra la aplicación de un filtro en búsqueda
   */
  const logFilterApplied = useCallback(
    async (filterName: string, filterValue: any) => {
      return logInteraction('tutor_search_filter_applied', {
        filterName,
        filterValue,
      });
    },
    [logInteraction]
  );

  /**
   * Registra la visualización de un perfil de tutor
   */
  const logTutorProfileView = useCallback(
    async (tutorId: string, tutorName?: string) => {
      return logInteraction('tutor_profile_viewed', {
        tutorId,
        tutorName,
      });
    },
    [logInteraction]
  );

  /**
   * Registra un mensaje de chat
   */
  const logChatMessage = useCallback(
    async (
      messageLength: number,
      chatId?: string,
      isSent: boolean = true
    ) => {
      return logInteraction(
        isSent ? 'chat_message_sent' : 'chat_message_received',
        {
          messageLength,
          chatId,
        }
      );
    },
    [logInteraction]
  );

  /**
   * Registra la apertura de un chat
   */
  const logChatOpened = useCallback(
    async (chatId?: string) => {
      return logInteraction('chat_opened', { chatId });
    },
    [logInteraction]
  );

  /**
   * Registra la creación de una solicitud de tutoría
   */
  const logTutoringRequest = useCallback(
    async (
      requestId: string,
      subject: string,
      duration: number,
      amount: number
    ) => {
      return logInteraction('tutoring_request_created', {
        requestId,
        subject,
        duration,
        amount,
      });
    },
    [logInteraction]
  );

  /**
   * Registra la finalización de una solicitud
   */
  const logTutoringRequestCompleted = useCallback(
    async (requestId: string, duration: number) => {
      return logInteraction('tutoring_request_completed', {
        requestId,
        duration,
      });
    },
    [logInteraction]
  );

  /**
   * Registra un pago
   */
  const logPayment = useCallback(
    async (
      paymentMethod: string,
      amount: number,
      status: 'completed' | 'failed'
    ) => {
      const type = status === 'completed' ? 'payment_completed' : 'payment_failed';
      return logInteraction(type, {
        paymentMethod,
        paymentAmount: amount,
        paymentStatus: status,
      });
    },
    [logInteraction]
  );

  /**
   * Registra el uso de una funcionalidad de IA
   */
  const logAIFeature = useCallback(
    async (
      aiFeature: string,
      metadata?: Record<string, any>
    ) => {
      return logInteraction('ai_feature_used', {
        aiFeature,
        ...metadata,
      });
    },
    [logInteraction]
  );

  /**
   * Registra el tiempo de carga de una página
   */
  const logPageLoadTime = useCallback(
    async (page: string, loadTime: number) => {
      return logInteraction('page_load_time', {
        page,
        loadTime,
      });
    },
    [logInteraction]
  );

  /**
   * Registra un error
   */
  const logError = useCallback(
    async (errorMessage: string, errorCode?: string, page?: string) => {
      return logInteraction('error_occurred', {
        errorMessage,
        errorCode,
        page,
      });
    },
    [logInteraction]
  );

  /**
   * Registra la apertura de la app
   */
  const logAppOpened = useCallback(async () => {
    return logInteraction('app_opened');
  }, [logInteraction]);

  /**
   * Registra el cierre de la app
   */
  const logAppClosed = useCallback(async () => {
    return logInteraction('app_closed');
  }, [logInteraction]);

  /**
   * Obtiene el resumen de interacciones del usuario
   */
  const getUserSummary = useCallback(
    async (periodDays: number = 30): Promise<UserInteractionSummary | null> => {
      if (!user) {
        return null;
      }

      try {
        return await userInteractionsService.getUserSummary(user.id, periodDays);
      } catch (error) {
        console.error('Error obteniendo resumen:', error);
        return null;
      }
    },
    [user]
  );

  /**
   * Obtiene las interacciones del usuario
   */
  const getUserInteractions = useCallback(
    async (options?: {
      type?: UserInteractionType;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }) => {
      if (!user) {
        return [];
      }

      try {
        return await userInteractionsService.getUserInteractions(user.id, options);
      } catch (error) {
        console.error('Error obteniendo interacciones:', error);
        return [];
      }
    },
    [user]
  );

  return {
    logInteraction,
    logPageView,
    logTutorSearch,
    logFilterApplied,
    logTutorProfileView,
    logChatMessage,
    logChatOpened,
    logTutoringRequest,
    logTutoringRequestCompleted,
    logPayment,
    logAIFeature,
    logPageLoadTime,
    logError,
    logAppOpened,
    logAppClosed,
    getUserSummary,
    getUserInteractions,
  };
}
