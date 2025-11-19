import { useEffect, useCallback } from 'react';

export function useStatsRefresh(onRefresh?: () => void) {
  const refreshStats = useCallback(() => {
    if (onRefresh) {
      console.log('🔄 Refreshing stats due to data change');
      onRefresh();
    }
  }, [onRefresh]);

  useEffect(() => {
    // Escuchar eventos de refresh
    const handleRefreshStats = () => {
      refreshStats();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tutoring-requests' || e.key === 'reviews') {
        console.log('📱 Storage changed:', e.key);
        refreshStats();
      }
    };

    // Eventos personalizados
    window.addEventListener('refresh-stats', handleRefreshStats);
    window.addEventListener('review-created', handleRefreshStats);
    window.addEventListener('request-status-changed', handleRefreshStats);
    
    // Cambios en localStorage
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('refresh-stats', handleRefreshStats);
      window.removeEventListener('review-created', handleRefreshStats);
      window.removeEventListener('request-status-changed', handleRefreshStats);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshStats]);

  return { refreshStats };
}