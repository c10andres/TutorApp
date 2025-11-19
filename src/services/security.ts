// Servicio de seguridad avanzado
import { ref, get, set, update, push } from 'firebase/database';
import { database } from '../firebase';
import { User } from '../types';

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'suspicious_activity' | 'data_access';
  userId: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SecurityConfig {
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  passwordMinLength: number;
  require2FA: boolean;
  sessionTimeout: number; // minutes
  auditLogRetention: number; // days
}

class SecurityService {
  private config: SecurityConfig = {
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    passwordMinLength: 8,
    require2FA: false,
    sessionTimeout: 60,
    auditLogRetention: 90
  };

  // Registrar evento de seguridad
  async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const eventRef = ref(database, 'security/events');
      const newEventRef = push(eventRef);
      
      const securityEvent: SecurityEvent = {
        ...event,
        id: newEventRef.key!,
        timestamp: new Date()
      };

      const eventData = {
        ...securityEvent,
        timestamp: securityEvent.timestamp.toISOString()
      };

      await set(newEventRef, eventData);
      
      // Si es un evento crítico, enviar alerta
      if (event.severity === 'critical') {
        await this.sendSecurityAlert(securityEvent);
      }
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  // Validar contraseña
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < this.config.passwordMinLength) {
      errors.push(`La contraseña debe tener al menos ${this.config.passwordMinLength} caracteres`);
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }
    
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Verificar intentos de login fallidos
  async checkFailedLoginAttempts(userId: string): Promise<{ locked: boolean; attemptsLeft: number }> {
    try {
      const eventsRef = ref(database, 'security/events');
      const snapshot = await get(eventsRef);
      
      if (!snapshot.exists()) {
        return { locked: false, attemptsLeft: this.config.maxLoginAttempts };
      }

      const events = snapshot.val();
      const now = new Date();
      const lockoutTime = new Date(now.getTime() - this.config.lockoutDuration * 60 * 1000);
      
      const failedAttempts = Object.values(events).filter((event: any) => 
        event.userId === userId && 
        event.type === 'failed_login' &&
        new Date(event.timestamp) > lockoutTime
      );

      const attemptsLeft = Math.max(0, this.config.maxLoginAttempts - failedAttempts.length);
      const locked = attemptsLeft === 0;

      return { locked, attemptsLeft };
    } catch (error) {
      console.error('Error checking failed login attempts:', error);
      return { locked: false, attemptsLeft: this.config.maxLoginAttempts };
    }
  }

  // Registrar intento de login fallido
  async recordFailedLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logSecurityEvent({
      type: 'failed_login',
      userId,
      ipAddress,
      userAgent,
      details: { timestamp: new Date().toISOString() },
      severity: 'medium'
    });
  }

  // Registrar login exitoso
  async recordSuccessfulLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logSecurityEvent({
      type: 'login',
      userId,
      ipAddress,
      userAgent,
      details: { timestamp: new Date().toISOString() },
      severity: 'low'
    });
  }

  // Detectar actividad sospechosa
  async detectSuspiciousActivity(userId: string, activity: any): Promise<boolean> {
    try {
      // Verificar múltiples logins desde diferentes IPs
      const eventsRef = ref(database, 'security/events');
      const snapshot = await get(eventsRef);
      
      if (!snapshot.exists()) {
        return false;
      }

      const events = Object.values(snapshot.val());
      const recentLogins = events.filter((event: any) => 
        event.userId === userId && 
        event.type === 'login' &&
        new Date(event.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
      );

      const uniqueIPs = new Set(recentLogins.map((event: any) => event.ipAddress));
      
      if (uniqueIPs.size > 3) {
        await this.logSecurityEvent({
          type: 'suspicious_activity',
          userId,
          details: { 
            reason: 'Multiple IPs detected',
            ipCount: uniqueIPs.size,
            activity 
          },
          severity: 'high'
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error detecting suspicious activity:', error);
      return false;
    }
  }

  // Obtener historial de seguridad
  async getSecurityHistory(userId: string, limit: number = 50): Promise<SecurityEvent[]> {
    try {
      const eventsRef = ref(database, 'security/events');
      const snapshot = await get(eventsRef);
      
      if (!snapshot.exists()) {
        return [];
      }

      const events = Object.values(snapshot.val()) as any[];
      const userEvents = events
        .filter(event => event.userId === userId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit)
        .map(event => ({
          ...event,
          timestamp: new Date(event.timestamp)
        }));

      return userEvents;
    } catch (error) {
      console.error('Error getting security history:', error);
      return [];
    }
  }

  // Enviar alerta de seguridad
  private async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    try {
      // En producción, aquí se enviaría una notificación real
      console.log('🚨 SECURITY ALERT:', {
        type: event.type,
        userId: event.userId,
        severity: event.severity,
        timestamp: event.timestamp,
        details: event.details
      });

      // Simular envío de alerta
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error sending security alert:', error);
    }
  }

  // Generar token de sesión seguro
  generateSessionToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Validar token de sesión
  validateSessionToken(token: string): boolean {
    return token && token.length === 32 && /^[A-Za-z0-9]+$/.test(token);
  }

  // Encriptar datos sensibles
  encryptSensitiveData(data: string): string {
    // En producción, usar una librería de encriptación real como crypto-js
    return btoa(data); // Base64 encoding (solo para demo)
  }

  // Desencriptar datos sensibles
  decryptSensitiveData(encryptedData: string): string {
    // En producción, usar una librería de encriptación real como crypto-js
    return atob(encryptedData); // Base64 decoding (solo para demo)
  }

  // Obtener configuración de seguridad
  getSecurityConfig(): SecurityConfig {
    return { ...this.config };
  }

  // Actualizar configuración de seguridad
  updateSecurityConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export const securityService = new SecurityService();
