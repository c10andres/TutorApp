// Servicio de autenticación con Firebase
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { ref, set, get, update } from 'firebase/database';
import { auth, database } from '../firebase';
import { User, UserMode } from '../types';

class AuthService {
  private authListeners: ((user: User | null) => void)[] = [];

  constructor() {
    // Escuchar cambios de autenticación
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Usuario autenticado, obtener datos del perfil
        const userData = await this.getUserData(firebaseUser.uid);
        this.notifyListeners(userData);
      } else {
        // Usuario no autenticado
        this.notifyListeners(null);
      }
    });
  }

  // Iniciar sesión
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await this.getUserData(userCredential.user.uid);
      return userData;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Registrarse
  async signUp(email: string, password: string, name: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Verificar si es un usuario maestro
      const isTestUser = this.isTestUserEmail(email);
      
      // Configurar datos especiales para usuarios maestros
      let defaultMode: UserMode = 'student';
      let defaultSubjects: string[] = [];
      let defaultHourlyRate = 0;
      let defaultRating = 0;
      let defaultTotalReviews = 0;
      let defaultAvailability = false;
      let defaultExperience = '';
      let defaultPreferredSubjects: string[] = [];
      
      if (isTestUser) {
        if (email === 'CarlosAdminTutor@gmail.com') {
          defaultMode = 'tutor';
          defaultSubjects = ['Matemáticas', 'Física', 'Programación'];
          defaultHourlyRate = 50000;
          defaultRating = 4.8;
          defaultTotalReviews = 25;
          defaultAvailability = true;
          defaultExperience = 'Usuario administrador con acceso completo a funcionalidades de prueba';
        } else if (email === 'CarlosAdminEstudiante@gmail.com') {
          defaultMode = 'student';
          defaultPreferredSubjects = ['Matemáticas', 'Física', 'Programación'];
        }
      }
      
      // Crear perfil de usuario en la base de datos
      const userData: User = {
        id: userCredential.user.uid,
        email,
        name,
        currentMode: defaultMode,
        preferredSubjects: defaultPreferredSubjects,
        subjects: defaultSubjects,
        hourlyRate: defaultHourlyRate,
        rating: defaultRating,
        totalReviews: defaultTotalReviews,
        availability: defaultAvailability,
        experience: defaultExperience,
        createdAt: new Date(),
        isTestUser,
      };

      await set(ref(database, `users/${userCredential.user.uid}`), {
        ...userData,
        createdAt: userData.createdAt.toISOString(),
      });

      return userData;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Cerrar sesión
  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  // Recuperar contraseña
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Cambiar modo del usuario
  async switchMode(mode: UserMode): Promise<User> {
    if (!auth.currentUser) {
      throw new Error('No hay usuario autenticado');
    }

    const userId = auth.currentUser.uid;
    
    try {
      // Obtener datos actuales del usuario
      const currentUserData = await this.getUserData(userId);
      
      // Preparar actualizaciones básicas
      const updates: any = {
        currentMode: mode,
        updatedAt: new Date().toISOString()
      };

      // Si cambia a tutor y no tiene configuración básica, inicializar con valores por defecto
      if (mode === 'tutor') {
        // Asegurar que tenga todas las propiedades requeridas para ser tutor
        if (!currentUserData.subjects || currentUserData.subjects.length === 0) {
          updates.subjects = []; // Array vacío por defecto
        }
        if (typeof currentUserData.hourlyRate !== 'number') {
          updates.hourlyRate = 0; // Valor por defecto
        }
        if (!currentUserData.experience) {
          updates.experience = ''; // String vacío por defecto
        }
        if (typeof currentUserData.availability !== 'boolean') {
          updates.availability = false; // Disponibilidad por defecto
        }
        if (typeof currentUserData.rating !== 'number') {
          updates.rating = 0;
        }
        if (typeof currentUserData.totalReviews !== 'number') {
          updates.totalReviews = 0;
        }
      }

      // Realizar la actualización
      await update(ref(database, `users/${userId}`), updates);

      // Obtener y retornar los datos actualizados
      const updatedUserData = await this.getUserData(userId);
      
      // Notificar a los listeners del cambio
      this.notifyListeners(updatedUserData);
      
      return updatedUserData;
    } catch (error: any) {
      console.error('Error in switchMode:', error);
      throw new Error(`Error al cambiar modo: ${error.message || 'Error desconocido'}`);
    }
  }

  // Actualizar perfil
  async updateProfile(updates: Partial<User>): Promise<User> {
    console.log('🔍 AuthService: updateProfile iniciado');
    console.log('📊 AuthService: updates recibidos:', updates);
    
    if (!auth.currentUser) {
      console.error('❌ AuthService: No hay usuario autenticado');
      throw new Error('No hay usuario autenticado');
    }

    const userId = auth.currentUser.uid;
    console.log('👤 AuthService: UserId:', userId);
    
    const updatesWithDate = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    console.log('💾 AuthService: Guardando en Firebase:', updatesWithDate);

    await update(ref(database, `users/${userId}`), updatesWithDate);
    
    console.log('✅ AuthService: Datos guardados en Firebase');
    
    const userData = await this.getUserData(userId);
    console.log('👤 AuthService: Usuario actualizado obtenido:', userData);
    
    return userData;
  }

  // Obtener usuario actual
  getCurrentUser(): User | null {
    return null; // Se maneja a través de onAuthStateChanged
  }

  // Inicializar autenticación
  initializeAuth(): User | null {
    // Verificar si hay un usuario autenticado actualmente
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Si hay usuario, obtener sus datos (esto se manejará de forma asíncrona)
      return null; // Se maneja a través de onAuthStateChanged
    }
    return null;
  }

  // Suscribirse a cambios de autenticación
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.authListeners.push(callback);
    
    return () => {
      this.authListeners = this.authListeners.filter(listener => listener !== callback);
    };
  }

  // Obtener datos del usuario desde la base de datos
  private async getUserData(userId: string): Promise<User> {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      throw new Error('Usuario no encontrado');
    }

    const userData = snapshot.val();
    
    // Verificar si es usuario maestro por email si no tiene el campo isTestUser
    const isTestUser = userData.isTestUser !== undefined 
      ? userData.isTestUser 
      : this.isTestUserEmail(userData.email);
    
    return {
      ...userData,
      id: userId, // Asegurar que el id sea el uid de Firebase
      createdAt: new Date(userData.createdAt),
      updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : undefined,
      isTestUser,
    };
  }

  // Notificar a los listeners
  private notifyListeners(user: User | null): void {
    this.authListeners.forEach(listener => listener(user));
  }

  // Verificar si un email corresponde a un usuario maestro
  private isTestUserEmail(email: string): boolean {
    const testUserEmails = [
      'CarlosAdminEstudiante@gmail.com',
      'CarlosAdminTutor@gmail.com'
    ];
    return testUserEmails.includes(email);
  }



  // Verificar si un usuario es maestro
  isTestUser(user: User | null): boolean {
    return user?.isTestUser === true;
  }

  // Obtener mensaje de error legible
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Usuario no encontrado';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta';
      case 'auth/email-already-in-use':
        return 'El email ya está registrado';
      case 'auth/weak-password':
        return 'La contraseña es muy débil';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Intenta más tarde';
      default:
        return 'Error de autenticación';
    }
  }
}

export const authService = new AuthService();