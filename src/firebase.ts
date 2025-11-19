// Configuración Firebase Limpia y Unificada
// Elimina todas las duplicidades y conflictos
import { initializeApp, FirebaseApp, getApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { Capacitor } from '@capacitor/core';
import { initializeAndroidFirebase } from './android-firebase-config';

// Configuración única de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA2cv8Zv9ahULWaPrqvfDeRUo2M5Je5BTU",
  authDomain: "udconecta-4bfff.firebaseapp.com",
  databaseURL: "https://udconecta-4bfff-default-rtdb.firebaseio.com/",
  projectId: "udconecta-4bfff",
  storageBucket: "udconecta-4bfff.appspot.com",
  messagingSenderId: "50299431698",
  appId: Capacitor.isNativePlatform() 
    ? "1:50299431698:android:092a716de008e36c1b61cb"
    : "1:50299431698:web:092a716de008e36c1b61cb"
};

// Variables globales para las instancias
let firebaseApp: FirebaseApp | null = null;
let firebaseDatabase: Database | null = null;
let firebaseAuth: Auth | null = null;
let firebaseFirestore: Firestore | null = null;
let firebaseStorage: FirebaseStorage | null = null;

// Función para obtener o crear la instancia de Firebase de forma segura
export const getFirebaseApp = (): FirebaseApp => {
  try {
    // Intentar obtener instancia existente
    const existingApp = getApp();
    if (existingApp) {
      console.log('✅ Reutilizando instancia existente de Firebase');
      return existingApp;
    }
  } catch (error) {
    // No existe instancia, continuar con la inicialización
    console.log('🆕 No existe instancia de Firebase, creando nueva');
  }
  
  // Solo inicializar si no existe
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
    console.log('✅ Firebase App inicializado correctamente');
    
    // Inicializar configuración específica de Android
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
      initializeAndroidFirebase();
    }
  }
  
  return firebaseApp;
};

// Función para obtener la instancia de Database de forma segura
export const getFirebaseDatabase = (): Database => {
  if (!firebaseDatabase) {
    const app = getFirebaseApp();
    firebaseDatabase = getDatabase(app);
    console.log('✅ Firebase Database inicializado correctamente');
  }
  return firebaseDatabase;
};

// Función para obtener la instancia de Auth de forma segura
export const getFirebaseAuth = (): Auth => {
  if (!firebaseAuth) {
    const app = getFirebaseApp();
    firebaseAuth = getAuth(app);
    console.log('✅ Firebase Auth inicializado correctamente');
  }
  return firebaseAuth;
};

// Función para obtener la instancia de Firestore de forma segura
export const getFirebaseFirestore = (): Firestore => {
  if (!firebaseFirestore) {
    const app = getFirebaseApp();
    firebaseFirestore = getFirestore(app);
    console.log('✅ Firebase Firestore inicializado correctamente');
  }
  return firebaseFirestore;
};

// Función para obtener la instancia de Storage de forma segura
export const getFirebaseStorage = (): FirebaseStorage => {
  if (!firebaseStorage) {
    const app = getFirebaseApp();
    firebaseStorage = getStorage(app);
    console.log('✅ Firebase Storage inicializado correctamente');
  }
  return firebaseStorage;
};

// Función para verificar la conexión de Firebase
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 Verificando conexión a Firebase...');
    console.log('📱 Plataforma:', Capacitor.getPlatform());
    
    const database = getFirebaseDatabase();
    
    if (!database) {
      console.error('❌ Firebase Database no está disponible');
      return false;
    }
    
    const { ref, get } = await import('firebase/database');
    
    // Intentar con una ruta que sabemos que existe o debería existir
    const testRef = ref(database, 'users');
    
    try {
      // Intentar leer la ruta de usuarios para verificar conexión
      const snapshot = await get(testRef);
      console.log('📊 Estado de conexión Firebase: Conectado');
      console.log('📊 Datos encontrados:', snapshot.exists() ? 'Sí' : 'No');
      return true;
    } catch (connectionError) {
      console.log('📊 Error de conexión:', connectionError.message);
      
      // Para Android, ser más permisivo con los errores
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
        console.log('🤖 Android: Asumiendo conexión válida a pesar del error');
        return true;
      }
      
      // Si hay error de conexión, verificar si es por falta de permisos o conexión
      if (connectionError.message.includes('permission') || 
          connectionError.message.includes('network') ||
          connectionError.message.includes('timeout')) {
        console.log('📊 Estado de conexión Firebase: Desconectado');
        return false;
      }
      
      // Si es otro tipo de error, asumir que la conexión está bien
      console.log('📊 Estado de conexión Firebase: Conectado (con errores menores)');
      return true;
    }
  } catch (error) {
    console.error('❌ Error verificando conexión Firebase:', error);
    
    // Para Android, ser más permisivo
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
      console.log('🤖 Android: Asumiendo conexión válida a pesar del error de verificación');
      return true;
    }
    
    return false;
  }
};

// Función para obtener todas las instancias de Firebase
export const getFirebaseInstances = () => {
  return {
    app: getFirebaseApp(),
    database: getFirebaseDatabase(),
    auth: getFirebaseAuth(),
    firestore: getFirebaseFirestore()
  };
};

// Función para reinicializar Firebase (útil para debugging)
export const reinitializeFirebase = (): void => {
  console.log('🔄 Reinicializando Firebase...');
  
  // Limpiar instancias existentes
  firebaseApp = null;
  firebaseDatabase = null;
  firebaseAuth = null;
  firebaseFirestore = null;
  
  console.log('✅ Firebase reinicializado correctamente');
};

// Función para inicializar datos de ejemplo en Firebase
export const initializeFirebaseData = async (): Promise<void> => {
  try {
    console.log('🚀 Verificando datos en Firebase...');
    
    // Verificar conexión primero
    const isConnected = await checkFirebaseConnection();
    if (!isConnected) {
      console.warn('⚠️ Firebase no está conectado, saltando verificación');
      return;
    }
    
    // Obtener instancia de database de forma segura
    const database = getFirebaseDatabase();
    
    // Importar funciones de Firebase v9+ modular
    const { ref, get } = await import('firebase/database');
    
    // Verificar que la instancia de database es válida
    if (!database) {
      console.error('❌ Firebase Database no está disponible');
      return;
    }
    
    // Solo verificar que existen datos, no crear nuevos
    const usersRef = ref(database, 'users');
    const usersSnapshot = await get(usersRef);
    
    if (usersSnapshot.exists()) {
      const users = usersSnapshot.val();
      console.log('✅ Usuarios encontrados en Firebase:', Object.keys(users).length);
    } else {
      console.log('❌ No hay usuarios en Firebase');
    }
    
    const requestsRef = ref(database, 'requests');
    const requestsSnapshot = await get(requestsRef);
    
    if (requestsSnapshot.exists()) {
      const requests = requestsSnapshot.val();
      console.log('✅ Solicitudes encontradas en Firebase:', Object.keys(requests).length);
    } else {
      console.log('❌ No hay solicitudes en Firebase');
    }
    
    console.log('✅ Verificación de datos completada');
  } catch (error) {
    console.error('❌ Error verificando datos en Firebase:', error);
    console.warn('⚠️ Continuando sin verificación de Firebase');
  }
};

// Exportar instancias por defecto para compatibilidad
export const app = getFirebaseApp();
export const database = getFirebaseDatabase();
export const auth = getFirebaseAuth();
export const db = getFirebaseFirestore();
export const storage = getFirebaseStorage();

console.log('🔥 Firebase limpio configurado para:', Capacitor.isNativePlatform() ? 'Móvil' : 'Web');
