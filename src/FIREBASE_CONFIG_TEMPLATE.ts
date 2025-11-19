// 🔥 PLANTILLA DE CONFIGURACIÓN FIREBASE - TutorApp Colombia
// Reemplaza los valores con tus credenciales reales de Firebase

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ⚠️ IMPORTANTE: Reemplaza estos valores con los de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",                    // Ejemplo: "AIzaSyC3gQ2X9Y1Z3..."
  authDomain: "YOUR_PROJECT.firebaseapp.com",    // Ejemplo: "tutorapp-colombia.firebaseapp.com"
  projectId: "YOUR_PROJECT_ID",                  // Ejemplo: "tutorapp-colombia"
  storageBucket: "YOUR_PROJECT.appspot.com",     // Ejemplo: "tutorapp-colombia.appspot.com"
  messagingSenderId: "123456789012",              // Ejemplo: "123456789012"
  appId: "YOUR_APP_ID"                           // Ejemplo: "1:123456789012:web:abc123..."
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Exportar la instancia de la app
export default app;

// 📋 INSTRUCCIONES DE CONFIGURACIÓN:
// 
// 1. Ve a Firebase Console: https://console.firebase.google.com
// 2. Selecciona tu proyecto o crea uno nuevo
// 3. Ve a "Project Settings" (⚙️ > Project settings)
// 4. Scroll hacia abajo hasta "Your apps"
// 5. Si no tienes una app web, haz clic en "Add app" y selecciona "Web"
// 6. Copia los valores de firebaseConfig y reemplaza los de arriba
// 7. Guarda este archivo como "firebase.ts" (sin "_TEMPLATE")
// 8. Elimina este archivo de plantilla
//
// 🔐 CONFIGURACIÓN DE SERVICIOS REQUERIDOS:
//
// Authentication:
// - Ve a Authentication > Sign-in method
// - Habilita "Email/Password"
// 
// Firestore Database:
// - Ve a Firestore Database
// - Crea una base de datos en modo "test" (para desarrollo)
// - Aplica las reglas de seguridad del archivo firebase-rules.json
//
// Storage (opcional):
// - Ve a Storage
// - Inicializa Storage si planeas subir archivos
//
// 🚨 SEGURIDAD:
// - Nunca subas este archivo con credenciales reales a repositorios públicos
// - Usa variables de entorno en producción
// - Revisa las reglas de seguridad de Firestore y Storage

/* 
📋 EJEMPLO DE CONFIGURACIÓN COMPLETA:

const firebaseConfig = {
  apiKey: "AIzaSyC3gQ2X9Y1Z3A4B5C6D7E8F9G0H1I2J3K4",
  authDomain: "tutorapp-colombia.firebaseapp.com",
  projectId: "tutorapp-colombia",
  storageBucket: "tutorapp-colombia.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789jkl012"
};

REGLAS DE FIRESTORE (aplicar en Firebase Console):

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Solicitudes de tutoría
    match /tutoring_requests/{requestId} {
      allow read, write: if request.auth != null;
    }
    
    // Reseñas
    match /reviews/{reviewId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Chats
    match /chats/{chatId} {
      allow read, write: if request.auth != null;
    }
  }
}

REGLAS DE STORAGE (aplicar en Firebase Console):

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
*/