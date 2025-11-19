// Servicio para gestión de objetivos de estudio con Firebase
import { database } from '../firebase';
import { ref, push, set, get, update, remove, query, orderByChild, equalTo } from 'firebase/database';

export interface StudyGoal {
  id: string;
  userId: string;
  title: string;
  subject: string;
  description: string;
  targetDate: string;
  priority: 'low' | 'medium' | 'high';
  progress: number;
  estimatedHours: number;
  completedHours: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  aiSuggestions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  goalId: string;
  userId: string;
  subject: string;
  date: string;
  startTime: string;
  duration: number;
  actualDuration?: number;
  status: 'planned' | 'active' | 'completed' | 'missed';
  notes?: string;
  rating?: number;
  createdAt: string;
}

export interface WeeklySummary {
  userId: string;
  weekStart: string;
  totalHours: number;
  completedSessions: number;
  missedSessions: number;
  averageRating: number;
  subjects: { [key: string]: number };
  productivity: number;
  updatedAt: string;
}

class StudyGoalsService {
  private getGoalsRef(userId: string) {
    return ref(database, `studyGoals/${userId}`);
  }

  private getSessionsRef(userId: string) {
    return ref(database, `studySessions/${userId}`);
  }

  private getWeeklySummaryRef(userId: string) {
    return ref(database, `weeklySummaries/${userId}`);
  }

  // Crear nuevo objetivo
  async createGoal(goal: Omit<StudyGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const goalsRef = this.getGoalsRef(goal.userId);
      const newGoalRef = push(goalsRef);
      const goalId = newGoalRef.key!;
      
      const goalData: StudyGoal = {
        ...goal,
        id: goalId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await set(newGoalRef, goalData);
      return goalId;
    } catch (error) {
      console.error('Error creating study goal:', error);
      throw error;
    }
  }

  // Obtener objetivos del usuario
  async getGoals(userId: string): Promise<StudyGoal[]> {
    try {
      const goalsRef = this.getGoalsRef(userId);
      const snapshot = await get(goalsRef);
      
      if (!snapshot.exists()) {
        return [];
      }

      const goals: StudyGoal[] = [];
      snapshot.forEach((childSnapshot) => {
        goals.push(childSnapshot.val());
      });

      return goals.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (error) {
      console.error('Error fetching study goals:', error);
      throw error;
    }
  }

  // Actualizar objetivo
  async updateGoal(userId: string, goalId: string, updates: Partial<StudyGoal>): Promise<void> {
    try {
      const goalRef = ref(database, `studyGoals/${userId}/${goalId}`);
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await update(goalRef, updateData);
    } catch (error) {
      console.error('Error updating study goal:', error);
      throw error;
    }
  }

  // Eliminar objetivo
  async deleteGoal(userId: string, goalId: string): Promise<void> {
    try {
      const goalRef = ref(database, `studyGoals/${userId}/${goalId}`);
      await remove(goalRef);
      
      // También eliminar sesiones relacionadas
      const sessionsRef = this.getSessionsRef(userId);
      const sessionsSnapshot = await get(query(sessionsRef, orderByChild('goalId'), equalTo(goalId)));
      
      if (sessionsSnapshot.exists()) {
        sessionsSnapshot.forEach((childSnapshot) => {
          remove(childSnapshot.ref);
        });
      }
    } catch (error) {
      console.error('Error deleting study goal:', error);
      throw error;
    }
  }

  // Crear sesión de estudio
  async createSession(session: Omit<StudySession, 'id' | 'createdAt'>): Promise<string> {
    try {
      const sessionsRef = this.getSessionsRef(session.userId);
      const newSessionRef = push(sessionsRef);
      const sessionId = newSessionRef.key!;
      
      const sessionData: StudySession = {
        ...session,
        id: sessionId,
        createdAt: new Date().toISOString()
      };

      await set(newSessionRef, sessionData);
      return sessionId;
    } catch (error) {
      console.error('Error creating study session:', error);
      throw error;
    }
  }

  // Obtener sesiones del usuario
  async getSessions(userId: string, goalId?: string): Promise<StudySession[]> {
    try {
      const sessionsRef = this.getSessionsRef(userId);
      let queryRef;
      
      if (goalId) {
        queryRef = query(sessionsRef, orderByChild('goalId'), equalTo(goalId));
      } else {
        // No usar orderBy para evitar problemas de índice, ordenar en JavaScript
        queryRef = sessionsRef;
      }
      
      const snapshot = await get(queryRef);
      
      if (!snapshot.exists()) {
        return [];
      }

      const sessions: StudySession[] = [];
      snapshot.forEach((childSnapshot) => {
        sessions.push(childSnapshot.val());
      });

      // Ordenar en JavaScript por createdAt (más reciente primero)
      return sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error fetching study sessions:', error);
      throw error;
    }
  }

  // Actualizar sesión
  async updateSession(userId: string, sessionId: string, updates: Partial<StudySession>): Promise<void> {
    try {
      const sessionRef = ref(database, `studySessions/${userId}/${sessionId}`);
      await update(sessionRef, updates);
    } catch (error) {
      console.error('Error updating study session:', error);
      throw error;
    }
  }

  // Obtener resumen semanal
  async getWeeklySummary(userId: string, weekStart: string): Promise<WeeklySummary | null> {
    try {
      const summaryRef = ref(database, `weeklySummaries/${userId}/${weekStart}`);
      const snapshot = await get(summaryRef);
      
      if (!snapshot.exists()) {
        return null;
      }

      return snapshot.val();
    } catch (error) {
      console.error('Error fetching weekly summary:', error);
      throw error;
    }
  }

  // Crear o actualizar resumen semanal
  async updateWeeklySummary(userId: string, weekStart: string, summary: Omit<WeeklySummary, 'userId' | 'weekStart' | 'updatedAt'>): Promise<void> {
    try {
      const summaryRef = ref(database, `weeklySummaries/${userId}/${weekStart}`);
      const summaryData: WeeklySummary = {
        ...summary,
        userId,
        weekStart,
        updatedAt: new Date().toISOString()
      };
      
      await set(summaryRef, summaryData);
    } catch (error) {
      console.error('Error updating weekly summary:', error);
      throw error;
    }
  }

  // Calcular resumen semanal automáticamente
  async calculateWeeklySummary(userId: string, weekStart: string): Promise<WeeklySummary> {
    try {
      const sessions = await this.getSessions(userId);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const weekSessions = sessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= new Date(weekStart) && sessionDate < weekEnd;
      });

      const totalHours = weekSessions.reduce((sum, session) => sum + (session.actualDuration || 0) / 60, 0);
      const completedSessions = weekSessions.filter(session => session.status === 'completed').length;
      const missedSessions = weekSessions.filter(session => session.status === 'missed').length;
      
      const ratedSessions = weekSessions.filter(session => session.rating !== undefined);
      const averageRating = ratedSessions.length > 0 
        ? ratedSessions.reduce((sum, session) => sum + (session.rating || 0), 0) / ratedSessions.length
        : 0;

      const subjects: { [key: string]: number } = {};
      weekSessions.forEach(session => {
        subjects[session.subject] = (subjects[session.subject] || 0) + (session.actualDuration || 0) / 60;
      });

      const productivity = completedSessions > 0 ? (completedSessions / (completedSessions + missedSessions)) * 100 : 0;

      const summary: WeeklySummary = {
        userId,
        weekStart,
        totalHours: Math.round(totalHours * 10) / 10,
        completedSessions,
        missedSessions,
        averageRating: Math.round(averageRating * 10) / 10,
        subjects,
        productivity: Math.round(productivity),
        updatedAt: new Date().toISOString()
      };

      await this.updateWeeklySummary(userId, weekStart, summary);
      return summary;
    } catch (error) {
      console.error('Error calculating weekly summary:', error);
      throw error;
    }
  }

  // Obtener estadísticas generales del usuario
  async getUserStats(userId: string): Promise<{
    totalGoals: number;
    completedGoals: number;
    totalHours: number;
    averageProductivity: number;
    topSubjects: { subject: string; hours: number }[];
  }> {
    try {
      const [goals, sessions] = await Promise.all([
        this.getGoals(userId),
        this.getSessions(userId)
      ]);

      const totalGoals = goals.length;
      const completedGoals = goals.filter(goal => goal.status === 'completed').length;
      
      const totalHours = sessions.reduce((sum, session) => sum + (session.actualDuration || 0) / 60, 0);
      
      const subjectHours: { [key: string]: number } = {};
      sessions.forEach(session => {
        subjectHours[session.subject] = (subjectHours[session.subject] || 0) + (session.actualDuration || 0) / 60;
      });

      const topSubjects = Object.entries(subjectHours)
        .map(([subject, hours]) => ({ subject, hours: Math.round(hours * 10) / 10 }))
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 5);

      const completedSessions = sessions.filter(session => session.status === 'completed').length;
      const totalSessions = sessions.length;
      const averageProductivity = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

      return {
        totalGoals,
        completedGoals,
        totalHours: Math.round(totalHours * 10) / 10,
        averageProductivity: Math.round(averageProductivity),
        topSubjects
      };
    } catch (error) {
      console.error('Error calculating user stats:', error);
      throw error;
    }
  }
}

export const studyGoalsService = new StudyGoalsService();
