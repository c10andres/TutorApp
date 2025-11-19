// Hook para usar el servicio de tutoría directo en Android
import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { TutoringDirectService } from '../services/tutoring-direct-load';
import { TutorRequest } from '../types';

export const useDirectTutoring = (userId: string | null) => {
  const [requests, setRequests] = useState<TutorRequest[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar solicitudes directamente
  const loadRequests = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando solicitudes directamente para:', userId);
      
      const requestsData = await TutoringDirectService.getUserRequests(userId);
      setRequests(requestsData);
      
      console.log('✅ Solicitudes cargadas directamente:', requestsData.length);
      
    } catch (error) {
      console.error('❌ Error cargando solicitudes directamente:', error);
      setError('Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Cargar estadísticas directamente
  const loadStats = useCallback(async () => {
    if (!userId) return;
    
    try {
      console.log('📊 Cargando estadísticas directamente para:', userId);
      
      const statsData = await TutoringDirectService.getUserStats(userId);
      setUserStats(statsData);
      
      console.log('✅ Estadísticas cargadas directamente:', statsData);
      
    } catch (error) {
      console.error('❌ Error cargando estadísticas directamente:', error);
    }
  }, [userId]);

  // Cargar todo
  const loadAll = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando todo directamente para:', userId);
      
      // Cargar en paralelo
      const [requestsData, statsData] = await Promise.all([
        TutoringDirectService.getUserRequests(userId),
        TutoringDirectService.getUserStats(userId)
      ]);
      
      setRequests(requestsData);
      setUserStats(statsData);
      
      console.log('✅ Todo cargado directamente:', {
        requests: requestsData.length,
        stats: statsData
      });
      
    } catch (error) {
      console.error('❌ Error cargando todo directamente:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Crear solicitud
  const createRequest = useCallback(async (requestData: Omit<TutorRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('🔍 Creando solicitud directamente:', requestData);
      
      const newRequest = await TutoringDirectService.createRequest(requestData);
      
      // Recargar solicitudes
      await loadRequests();
      
      console.log('✅ Solicitud creada directamente:', newRequest.id);
      return newRequest;
      
    } catch (error) {
      console.error('❌ Error creando solicitud directamente:', error);
      throw error;
    }
  }, [loadRequests]);

  // Actualizar estado de solicitud
  const updateRequestStatus = useCallback(async (requestId: string, status: string, tutorId?: string) => {
    try {
      console.log('🔍 Actualizando estado directamente:', requestId, 'a', status);
      
      await TutoringDirectService.updateRequestStatus(requestId, status, tutorId);
      
      // Recargar solicitudes
      await loadRequests();
      
      console.log('✅ Estado actualizado directamente');
      
    } catch (error) {
      console.error('❌ Error actualizando estado directamente:', error);
      throw error;
    }
  }, [loadRequests]);

  // Obtener solicitudes por estado
  const getRequestsByStatus = useCallback(async (status: string) => {
    if (!userId) return [];
    
    try {
      console.log('🔍 Obteniendo solicitudes por estado directamente:', status);
      
      const filteredRequests = await TutoringDirectService.getRequestsByStatus(userId, status);
      
      console.log('✅ Solicitudes filtradas directamente:', filteredRequests.length);
      return filteredRequests;
      
    } catch (error) {
      console.error('❌ Error obteniendo solicitudes por estado directamente:', error);
      return [];
    }
  }, [userId]);

  // Obtener solicitudes recientes
  const getRecentRequests = useCallback(async (limit: number = 5) => {
    if (!userId) return [];
    
    try {
      console.log('🔍 Obteniendo solicitudes recientes directamente:', limit);
      
      const recentRequests = await TutoringDirectService.getRecentRequests(userId, limit);
      
      console.log('✅ Solicitudes recientes obtenidas directamente:', recentRequests.length);
      return recentRequests;
      
    } catch (error) {
      console.error('❌ Error obteniendo solicitudes recientes directamente:', error);
      return [];
    }
  }, [userId]);

  // Cargar automáticamente cuando cambie el usuario
  useEffect(() => {
    if (userId) {
      loadAll();
    }
  }, [userId, loadAll]);

  return {
    requests,
    userStats,
    loading,
    error,
    loadRequests,
    loadStats,
    loadAll,
    createRequest,
    updateRequestStatus,
    getRequestsByStatus,
    getRecentRequests,
    // Funciones de utilidad
    isAndroid: Capacitor.getPlatform() === 'android',
    isWeb: Capacitor.getPlatform() === 'web'
  };
};

export default useDirectTutoring;
