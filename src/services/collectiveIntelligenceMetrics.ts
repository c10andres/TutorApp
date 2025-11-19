import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  Timestamp,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../firebase';

export interface ParticipationMetrics {
  usersWithQuestions: number;      // % usuarios que preguntan
  usersWithAnswers: number;        // % usuarios que responden
  avgResponseTime: number;         // Tiempo promedio de respuesta (minutos)
  weeklyConsistency: number;       // Constancia semanal (% de semanas activas)
}

export interface CollectiveMetrics {
  answersPerQuestion: number;      // # respuestas por duda promedio
  consensusRate: number;           // Tasa de consenso (0-100%)
  sourceDiversity: number;         // Índice de diversidad de fuentes
  coverageBySubject: Record<string, number>;  // Coverage por materia
  coverageByCity: Record<string, number>;     // Coverage por ciudad
}

export interface KnowledgeMetrics {
  prePostImprovement: number;      // Mejora promedio en Predictor
  studyGoalAchievements: number;   // Logros del Study Planner
  averageGain: number;             // Ganancia promedio
}

export interface CIEMDashboard {
  participation: ParticipationMetrics;
  collective: CollectiveMetrics;
  knowledge: KnowledgeMetrics;
  timestamp: Date;
}

// Colores para badges de nivel
export const REPUTATION_LEVELS = {
  NEWCOMER: { min: 0, max: 50, badge: '🥉', label: 'Nuevo', color: 'text-gray-600' },
  CONTRIBUTOR: { min: 50, max: 200, badge: '🎯', label: 'Colaborador', color: 'text-blue-600' },
  EDITOR: { min: 200, max: 500, badge: '✏️', label: 'Editor', color: 'text-green-600' },
  MODERATOR: { min: 500, max: 1000, badge: '👮', label: 'Moderador', color: 'text-purple-600' },
  ADMIN: { min: 1000, max: Infinity, badge: '⭐', label: 'Administrador', color: 'text-yellow-600' }
};

export const collectiveIntelligenceService = {
  /**
   * Calcula métricas de Participación Individual (PI)
   */
  async calculatePIMetrics(userId: string): Promise<ParticipationMetrics> {
    try {
      // Obtener total de usuarios
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      // Obtener usuarios con preguntas
      const questionsSnapshot = await getDocs(collection(db, 'supportTickets'));
      const usersWithQuestions = new Set(questionsSnapshot.docs.map(d => d.data().userId)).size;

      // Obtener usuarios con respuestas
      const answersSnapshot = await getDocs(collection(db, 'communityAnswers'));
      const usersWithAnswers = new Set(answersSnapshot.docs.map(d => d.data().authorId)).size;

      // Calcular tiempo promedio de respuesta
      let totalResponseTime = 0;
      let responseCount = 0;
      
      answersSnapshot.docs.forEach(answerDoc => {
        const data = answerDoc.data();
        if (data.createdAt && data.questionCreatedAt) {
          const responseTime = (data.createdAt.toMillis() - data.questionCreatedAt.toMillis()) / (1000 * 60); // minutos
          totalResponseTime += responseTime;
          responseCount++;
        }
      });

      const avgResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0;

      // Calcular constancia semanal
      const weeklyActivity = await this.calculateWeeklyConsistency(userId);

      return {
        usersWithQuestions: (usersWithQuestions / totalUsers) * 100,
        usersWithAnswers: (usersWithAnswers / totalUsers) * 100,
        avgResponseTime,
        weeklyConsistency: weeklyActivity
      };
    } catch (error) {
      console.error('Error calculating PI metrics:', error);
      return {
        usersWithQuestions: 0,
        usersWithAnswers: 0,
        avgResponseTime: 0,
        weeklyConsistency: 0
      };
    }
  },

  /**
   * Calcula métricas de Comportamiento Colectivo (CI)
   */
  async calculateCIMetrics(): Promise<CollectiveMetrics> {
    try {
      // Obtener preguntas y respuestas
      const questionsSnapshot = await getDocs(collection(db, 'supportTickets'));
      const answersSnapshot = await getDocs(collection(db, 'communityAnswers'));

      // Calcular respuestas por pregunta
      const answerCountsByQuestion = new Map<string, number>();
      answersSnapshot.docs.forEach(answer => {
        const questionId = answer.data().questionId;
        answerCountsByQuestion.set(questionId, (answerCountsByQuestion.get(questionId) || 0) + 1);
      });

      const totalAnswers = answersSnapshot.size;
      const totalQuestions = questionsSnapshot.size;
      const avgAnswersPerQuestion = totalQuestions > 0 ? totalAnswers / totalQuestions : 0;

      // Calcular tasa de consenso (basado en votos)
      let totalVotes = 0;
      let consensusVotes = 0;
      const answerVotes = await getDocs(collection(db, 'answerVotes'));
      
      answerVotes.docs.forEach(vote => {
        const data = vote.data();
        totalVotes++;
        if (data.isBestAnswer) consensusVotes++;
      });

      const consensusRate = totalVotes > 0 ? (consensusVotes / totalVotes) * 100 : 0;

      // Calcular diversidad de fuentes
      const uniqueAuthors = new Set(answersSnapshot.docs.map(d => d.data().authorId)).size;
      const sourceDiversity = answersSnapshot.size > 0 ? (uniqueAuthors / answersSnapshot.size) * 100 : 0;

      // Coverage por materia y ciudad
      const coverageBySubject: Record<string, number> = {};
      const coverageByCity: Record<string, number> = {};

      // Agregar datos de usuarios para coverage por ciudad
      const usersSnapshot = await getDocs(collection(db, 'users'));
      usersSnapshot.docs.forEach(userDoc => {
        const userData = userDoc.data();
        const city = userData.city || 'Desconocido';
        coverageByCity[city] = (coverageByCity[city] || 0) + 1;
      });

      return {
        answersPerQuestion: avgAnswersPerQuestion,
        consensusRate,
        sourceDiversity,
        coverageBySubject,
        coverageByCity
      };
    } catch (error) {
      console.error('Error calculating CI metrics:', error);
      return {
        answersPerQuestion: 0,
        consensusRate: 0,
        sourceDiversity: 0,
        coverageBySubject: {},
        coverageByCity: {}
      };
    }
  },

  /**
   * Calcula métricas de Conocimiento Individual (RI)
   */
  async calculateRIMetrics(userId: string): Promise<KnowledgeMetrics> {
    try {
      // Obtener datos del Academic Predictor
      const academicData = await getDocs(
        query(collection(db, 'academicSemesters'), where('userId', '==', userId))
      );

      let totalImprovement = 0;
      let improvementCount = 0;

      academicData.docs.forEach(semesterDoc => {
        const semester = semesterDoc.data();
        if (semester.predictedGPA && semester.currentGPA) {
          const improvement = semester.predictedGPA - semester.currentGPA;
          totalImprovement += improvement;
          improvementCount++;
        }
      });

      const avgImprovement = improvementCount > 0 ? totalImprovement / improvementCount : 0;

      // Obtener logros del Study Planner
      const goalsSnapshot = await getDocs(
        query(collection(db, 'studyGoals'), where('userId', '==', userId))
      );

      const completedGoals = goalsSnapshot.docs.filter(g => g.data().status === 'completed').length;
      const totalGoals = goalsSnapshot.size;
      const achievementRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

      return {
        prePostImprovement: avgImprovement,
        studyGoalAchievements: achievementRate,
        averageGain: avgImprovement
      };
    } catch (error) {
      console.error('Error calculating RI metrics:', error);
      return {
        prePostImprovement: 0,
        studyGoalAchievements: 0,
        averageGain: 0
      };
    }
  },

  /**
   * Obtiene el dashboard completo de CIEM
   */
  async getCIEMDashboard(userId: string): Promise<CIEMDashboard> {
    try {
      const [participation, collective, knowledge] = await Promise.all([
        this.calculatePIMetrics(userId),
        this.calculateCIMetrics(),
        this.calculateRIMetrics(userId)
      ]);

      return {
        participation,
        collective,
        knowledge,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error getting CIEM dashboard:', error);
      throw error;
    }
  },

  /**
   * Calcula la constancia semanal de un usuario
   */
  async calculateWeeklyConsistency(userId: string): Promise<number> {
    try {
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

      const activitiesSnapshot = await getDocs(
        query(
          collection(db, 'userActivity'),
          where('userId', '==', userId),
          where('timestamp', '>=', Timestamp.fromDate(fourWeeksAgo))
        )
      );

      const weeks = new Set<string>();
      activitiesSnapshot.docs.forEach(doc => {
        const timestamp = doc.data().timestamp.toDate();
        const week = `${timestamp.getFullYear()}-W${getWeekNumber(timestamp)}`;
        weeks.add(week);
      });

      return (weeks.size / 4) * 100; // 4 semanas en un mes
    } catch (error) {
      console.error('Error calculating weekly consistency:', error);
      return 0;
    }
  },

  /**
   * Obtiene el nivel de reputación de un usuario
   */
  async getUserReputationLevel(reputationPoints: number): Promise<typeof REPUTATION_LEVELS[keyof typeof REPUTATION_LEVELS]> {
    for (const [key, level] of Object.entries(REPUTATION_LEVELS)) {
      if (reputationPoints >= level.min && reputationPoints < level.max) {
        return level;
      }
    }
    return REPUTATION_LEVELS.ADMIN;
  }
};

/**
 * Helper: Obtiene el número de semana del año
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
