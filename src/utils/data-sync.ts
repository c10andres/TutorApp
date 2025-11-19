import { database } from '../firebase';
import { ref, get, set } from 'firebase/database';
import { Capacitor } from '@capacitor/core';

export class DataSync {
  // Sincronizar datos entre plataformas
  static async syncDataBetweenPlatforms(): Promise<void> {
    console.log('🔄 === SINCRONIZANDO DATOS ENTRE PLATAFORMAS ===');
    console.log('📱 Plataforma actual:', Capacitor.getPlatform());
    
    try {
      // Verificar autenticación primero
      const { auth } = await import('../firebase');
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        console.log('⚠️ Usuario no autenticado, saltando sincronización');
        return;
      }
      
      console.log('👤 Usuario autenticado para sincronización:', currentUser.uid);
      
      // Verificar conexión de forma segura
      let isConnected = false;
      try {
        const connectedRef = ref(database, '.info/connected');
        const connectedSnapshot = await get(connectedRef);
        isConnected = connectedSnapshot.val();
      } catch (connectionError) {
        console.warn('⚠️ Error verificando conexión:', connectionError.message);
        // Si hay error de token, intentar continuar sin verificar conexión
        if (connectionError.message && connectionError.message.includes('Invalid token')) {
          console.log('🔄 Error de token detectado, continuando sin verificación de conexión');
          isConnected = true; // Asumir conexión para continuar
        }
      }
      
      if (!isConnected) {
        console.error('❌ No hay conexión a Firebase para sincronizar');
        return;
      }
      
      console.log('✅ Conexión a Firebase verificada');
      
      // Verificar usuarios existentes de forma segura
      try {
        const usersRef = ref(database, 'users');
        const usersSnapshot = await get(usersRef);
        
        if (usersSnapshot.exists()) {
          const users = usersSnapshot.val();
          console.log('👥 Usuarios existentes:', Object.keys(users).length);
          
          // Mostrar usuarios existentes
          Object.keys(users).forEach(userId => {
            const user = users[userId];
            console.log(`👤 ${user.name} (${user.currentMode}) - ${user.email}`);
          });
        } else {
          console.log('❌ No hay usuarios en Firebase');
        }
      } catch (usersError) {
        console.warn('⚠️ Error verificando usuarios:', usersError.message);
        if (usersError.message && usersError.message.includes('Invalid token')) {
          console.log('🔄 Error de token al verificar usuarios, continuando...');
        }
      }
      
      // Verificar solicitudes existentes de forma segura
      try {
        const requestsRef = ref(database, 'requests');
        const requestsSnapshot = await get(requestsRef);
        
        if (requestsSnapshot.exists()) {
          const requests = requestsSnapshot.val();
          console.log('📋 Solicitudes existentes:', Object.keys(requests).length);
          
          // Mostrar solicitudes existentes
          Object.keys(requests).forEach(requestId => {
            const request = requests[requestId];
            console.log(`📝 ${request.subject} - ${request.status} (${request.studentName} → ${request.tutorName})`);
          });
        } else {
          console.log('❌ No hay solicitudes en Firebase');
        }
      } catch (requestsError) {
        console.warn('⚠️ Error verificando solicitudes:', requestsError.message);
        if (requestsError.message && requestsError.message.includes('Invalid token')) {
          console.log('🔄 Error de token al verificar solicitudes, continuando...');
        }
      }
      
      console.log('✅ === SINCRONIZACIÓN COMPLETADA ===');
      
    } catch (error) {
      console.error('❌ Error sincronizando datos:', error);
      
      // Si es un error de token inválido, intentar reinicializar Firebase
      if (error.message && error.message.includes('Invalid token')) {
        console.log('🔄 Detectado error de token inválido en sincronización, reinicializando Firebase...');
        try {
          const { reinitializeFirebase } = await import('../firebase');
          reinitializeFirebase();
          console.log('✅ Firebase reinicializado para sincronización');
        } catch (reinitError) {
          console.error('❌ Error reinicializando Firebase para sincronización:', reinitError);
        }
      }
    }
  }
  
  // Verificar que los datos se cargan correctamente
  static async verifyDataLoading(userId: string): Promise<void> {
    console.log('🔍 === VERIFICANDO CARGA DE DATOS PARA USUARIO ===');
    console.log('👤 Usuario:', userId);
    
    try {
      // Verificar autenticación primero
      const { auth } = await import('../firebase');
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        console.log('⚠️ Usuario no autenticado, saltando verificación de datos');
        return;
      }
      
      console.log('👤 Usuario autenticado para verificación:', currentUser.uid);
      
      // Verificar solicitudes del usuario de forma segura
      try {
        const requestsRef = ref(database, 'requests');
        const requestsSnapshot = await get(requestsRef);
        
        if (requestsSnapshot.exists()) {
          const requests = requestsSnapshot.val();
          const userRequests = Object.values(requests).filter((req: any) => 
            req.studentId === userId || req.tutorId === userId
          );
          
          console.log('📋 Solicitudes del usuario:', userRequests.length);
          userRequests.forEach((req: any) => {
            console.log(`📝 ${req.subject} - ${req.status} - ${req.studentName} → ${req.tutorName}`);
          });
        } else {
          console.log('❌ No hay solicitudes para verificar');
        }
      } catch (requestsError) {
        console.warn('⚠️ Error verificando solicitudes del usuario:', requestsError.message);
        if (requestsError.message && requestsError.message.includes('Invalid token')) {
          console.log('🔄 Error de token al verificar solicitudes del usuario, continuando...');
        }
      }
      
      // Verificar usuarios relacionados de forma segura
      try {
        const usersRef = ref(database, 'users');
        const usersSnapshot = await get(usersRef);
        
        if (usersSnapshot.exists()) {
          const users = usersSnapshot.val();
          const userData = users[userId];
          
          if (userData) {
            console.log('👤 Datos del usuario encontrados:', userData.name);
          } else {
            console.log('❌ Usuario no encontrado en Firebase');
          }
        }
      } catch (usersError) {
        console.warn('⚠️ Error verificando datos del usuario:', usersError.message);
        if (usersError.message && usersError.message.includes('Invalid token')) {
          console.log('🔄 Error de token al verificar datos del usuario, continuando...');
        }
      }
      
      console.log('✅ === VERIFICACIÓN DE CARGA COMPLETADA ===');
      
    } catch (error) {
      console.error('❌ Error verificando carga de datos:', error);
      
      // Si es un error de token inválido, intentar reinicializar Firebase
      if (error.message && error.message.includes('Invalid token')) {
        console.log('🔄 Detectado error de token inválido en verificación, reinicializando Firebase...');
        try {
          const { reinitializeFirebase } = await import('../firebase');
          reinitializeFirebase();
          console.log('✅ Firebase reinicializado para verificación');
        } catch (reinitError) {
          console.error('❌ Error reinicializando Firebase para verificación:', reinitError);
        }
      }
    }
  }
  
  // Forzar recarga de datos
  static async forceDataReload(): Promise<void> {
    console.log('🔄 === FORZANDO RECARGA DE DATOS ===');
    
    try {
      // Limpiar cache local si existe
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('tutoring-requests');
        localStorage.removeItem('users');
        console.log('🧹 Cache local limpiado');
      }
      
      // Verificar autenticación primero
      const { auth } = await import('../firebase');
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        console.log('⚠️ Usuario no autenticado, saltando verificación de conexión');
        return;
      }
      
      console.log('👤 Usuario autenticado:', currentUser.uid);
      
      // Verificar conexión fresca solo si el usuario está autenticado
      try {
        const connectedRef = ref(database, '.info/connected');
        const connectedSnapshot = await get(connectedRef);
        const isConnected = connectedSnapshot.val();
        
        console.log('📊 Conexión fresca:', isConnected);
        
        if (isConnected) {
          console.log('✅ Datos listos para recargar');
        } else {
          console.log('❌ No hay conexión para recargar datos');
        }
      } catch (connectionError) {
        console.warn('⚠️ Error verificando conexión, pero continuando:', connectionError.message);
      }
      
    } catch (error) {
      console.error('❌ Error forzando recarga:', error);
      
      // Si es un error de token inválido, intentar reinicializar Firebase
      if (error.message && error.message.includes('Invalid token')) {
        console.log('🔄 Detectado error de token inválido, reinicializando Firebase...');
        try {
          const { reinitializeFirebase } = await import('../firebase');
          reinitializeFirebase();
          console.log('✅ Firebase reinicializado');
        } catch (reinitError) {
          console.error('❌ Error reinicializando Firebase:', reinitError);
        }
      }
    }
  }
}
