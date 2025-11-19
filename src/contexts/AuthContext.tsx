// Context para manejo de autenticación
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, UserMode } from '../types';
import { authService } from '../services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, name: string) => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  switchMode: (mode: UserMode) => Promise<User>;
  updateProfile: (updates: Partial<User>) => Promise<User>;
  isTestUser: (user?: User | null) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Suscribirse a cambios de autenticación
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const user = await authService.signIn(email, password);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<User> => {
    setLoading(true);
    try {
      const user = await authService.signUp(email, password, name);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.signOut();
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    await authService.resetPassword(email);
  };

  const switchMode = async (mode: UserMode): Promise<User> => {
    // No mostrar loading global para el cambio de modo
    // Se maneja localmente en el componente que lo llama
    try {
      const updatedUser = await authService.switchMode(mode);
      // El listener de onAuthStateChanged se encargará de actualizar el estado
      return updatedUser;
    } catch (error) {
      console.error('Error switching mode in context:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<User> => {
    console.log('🔍 AuthContext: updateProfile iniciado');
    console.log('📊 AuthContext: updates recibidos:', updates);
    
    setLoading(true);
    try {
      const updatedUser = await authService.updateProfile(updates);
      console.log('✅ AuthContext: Usuario actualizado recibido:', updatedUser);
      
      // Actualizar el estado local del usuario
      setUser(updatedUser);
      console.log('🔄 AuthContext: Estado del usuario actualizado');
      
      return updatedUser;
    } finally {
      setLoading(false);
    }
  };

  const isTestUser = (userToCheck?: User | null): boolean => {
    return authService.isTestUser(userToCheck || user);
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    switchMode,
    updateProfile,
    isTestUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}