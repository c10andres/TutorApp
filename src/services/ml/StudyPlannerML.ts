// Servicio ML para Smart Study Planner
import { mlService } from './MLService';
import { User, AcademicSubject } from '../../types';

export interface StudySession {
  id: string;
  subject: string;
  duration: number; // en minutos
  difficulty: 'easy' | 'medium' | 'hard';
  priority: 'low' | 'medium' | 'high';
  scheduledTime: Date;
  completed: boolean;
  effectiveness?: number; // 0-1
}

export interface StudyPlan {
  id: string;
  studentId: string;
  name: string;
  subjects: string[];
  totalDuration: number;
  sessions: StudySession[];
  startDate: Date;
  endDate: Date;
  goals: string[];
  effectiveness: number;
}

export interface StudyRecommendation {
  type: 'schedule' | 'break' | 'review' | 'practice';
  message: string;
  priority: 'low' | 'medium' | 'high';
  timeSlot: Date;
  duration: number;
}

export interface ProductivityAnalysis {
  peakHours: number[];
  optimalBreakDuration: number;
  bestStudyDuration: number;
  effectivenessBySubject: { [subject: string]: number };
  patterns: {
    pattern: string;
    frequency: number;
    impact: 'positive' | 'negative';
  }[];
}

export class StudyPlannerML {
  private model: any;
  private isTrained = false;

  constructor() {
    this.initializeModel();
  }

  private async initializeModel(): Promise<void> {
    try {
      await mlService.initialize();
      
      // Crear modelo para optimización de horarios
      this.model = mlService.createNeuralNetwork(
        8, // 8 características de estudio
        [64, 32, 16], // Capas ocultas
        1, // 1 salida (efectividad)
        {
          batchSize: 32,
          epochs: 150,
          learningRate: 0.001
        }
      );

      console.log('📅 Modelo Study Planner ML inicializado');
    } catch (error) {
      console.error('❌ Error inicializando Study Planner ML:', error);
    }
  }

  // Entrenar modelo con datos de estudio históricos
  public async trainModel(studyData: any[]): Promise<void> {
    if (!this.model) {
      throw new Error('Modelo no inicializado');
    }

    try {
      const trainingData = this.prepareStudyTrainingData(studyData);
      
      await mlService.trainModel(this.model, trainingData, {
        batchSize: 32,
        epochs: 150,
        learningRate: 0.001
      });

      await mlService.saveModel(this.model, 'study-planner');
      this.isTrained = true;

      console.log('✅ Modelo Study Planner entrenado exitosamente');
    } catch (error) {
      console.error('❌ Error entrenando modelo:', error);
      throw error;
    }
  }

  // Generar plan de estudio optimizado
  public async generateOptimalStudyPlan(
    student: User,
    subjects: AcademicSubject[],
    preferences: {
      availableHours: number;
      preferredTimes: string[];
      breakFrequency: number;
      studyGoals: string[];
    }
  ): Promise<StudyPlan> {
    try {
      // Analizar patrones de productividad
      const productivityAnalysis = await this.analyzeProductivity(student);
      
      // Generar sesiones optimizadas
      const sessions = await this.generateOptimalSessions(
        subjects,
        preferences,
        productivityAnalysis
      );

      // Crear plan de estudio
      const studyPlan: StudyPlan = {
        id: `plan_${Date.now()}`,
        studentId: student.id,
        name: `Plan de Estudio ${new Date().toLocaleDateString()}`,
        subjects: subjects.map(s => s.name),
        totalDuration: sessions.reduce((sum, session) => sum + session.duration, 0),
        sessions,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 semana
        goals: preferences.studyGoals,
        effectiveness: this.calculatePlanEffectiveness(sessions, productivityAnalysis)
      };

      return studyPlan;
    } catch (error) {
      console.error('❌ Error generando plan de estudio:', error);
      return this.fallbackStudyPlan(student, subjects, preferences);
    }
  }

  // Analizar productividad del estudiante
  public async analyzeProductivity(student: User): Promise<ProductivityAnalysis> {
    try {
      // Simular análisis de productividad (en implementación real se usarían datos históricos)
      const peakHours = this.identifyPeakHours(student);
      const optimalBreakDuration = this.calculateOptimalBreakDuration(student);
      const bestStudyDuration = this.calculateBestStudyDuration(student);
      
      return {
        peakHours,
        optimalBreakDuration,
        bestStudyDuration,
        effectivenessBySubject: this.calculateSubjectEffectiveness(student),
        patterns: this.identifyStudyPatterns(student)
      };
    } catch (error) {
      console.error('❌ Error analizando productividad:', error);
      return this.fallbackProductivityAnalysis();
    }
  }

  // Generar recomendaciones inteligentes
  public async generateStudyRecommendations(
    student: User,
    currentPlan: StudyPlan,
    performance: any
  ): Promise<StudyRecommendation[]> {
    const recommendations: StudyRecommendation[] = [];

    // Analizar rendimiento actual
    const analysis = await this.analyzeCurrentPerformance(currentPlan, performance);

    // Recomendaciones basadas en análisis
    if (analysis.needsBreak) {
      recommendations.push({
        type: 'break',
        message: 'Es momento de tomar un descanso para mantener la concentración',
        priority: 'medium',
        timeSlot: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
        duration: 10
      });
    }

    if (analysis.needsReview) {
      recommendations.push({
        type: 'review',
        message: 'Revisar material de la sesión anterior para reforzar aprendizaje',
        priority: 'high',
        timeSlot: new Date(),
        duration: 20
      });
    }

    if (analysis.needsPractice) {
      recommendations.push({
        type: 'practice',
        message: 'Practicar ejercicios para consolidar conocimientos',
        priority: 'high',
        timeSlot: new Date(Date.now() + 30 * 60 * 1000),
        duration: 30
      });
    }

    return recommendations;
  }

  // Generar sesiones de estudio optimizadas
  private async generateOptimalSessions(
    subjects: AcademicSubject[],
    preferences: any,
    productivityAnalysis: ProductivityAnalysis
  ): Promise<StudySession[]> {
    const sessions: StudySession[] = [];
    let currentTime = new Date();
    const endTime = new Date(currentTime.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Ordenar materias por prioridad y dificultad
    const sortedSubjects = this.prioritizeSubjects(subjects);

    for (const subject of sortedSubjects) {
      // Calcular duración óptima para esta materia
      const optimalDuration = this.calculateOptimalDuration(subject, productivityAnalysis);
      
      // Encontrar mejor horario
      const bestTimeSlot = this.findBestTimeSlot(
        currentTime,
        endTime,
        optimalDuration,
        productivityAnalysis.peakHours
      );

      // Crear sesión
      const session: StudySession = {
        id: `session_${Date.now()}_${Math.random()}`,
        subject: subject.name,
        duration: optimalDuration,
        difficulty: this.assessSubjectDifficulty(subject),
        priority: this.assessSubjectPriority(subject),
        scheduledTime: bestTimeSlot,
        completed: false,
        effectiveness: this.predictSessionEffectiveness(subject, bestTimeSlot, productivityAnalysis)
      };

      sessions.push(session);
      currentTime = new Date(bestTimeSlot.getTime() + optimalDuration * 60 * 1000);
    }

    return sessions;
  }

  // Identificar horas pico de productividad
  private identifyPeakHours(student: User): number[] {
    // En implementación real se analizarían datos históricos
    // Por ahora retornar horas típicas de alta productividad
    return [9, 10, 11, 14, 15, 16, 19, 20];
  }

  // Calcular duración óptima de descanso
  private calculateOptimalBreakDuration(student: User): number {
    // Basado en investigación sobre ciclos de atención
    return 15; // 15 minutos
  }

  // Calcular mejor duración de sesión de estudio
  private calculateBestStudyDuration(student: User): number {
    // Basado en capacidad de atención promedio
    return 45; // 45 minutos
  }

  // Calcular efectividad por materia
  private calculateSubjectEffectiveness(student: User): { [subject: string]: number } {
    // En implementación real se usarían datos históricos
    return {
      'Matemáticas': 0.8,
      'Física': 0.7,
      'Química': 0.9,
      'Programación': 0.85
    };
  }

  // Identificar patrones de estudio
  private identifyStudyPatterns(student: User): any[] {
    return [
      {
        pattern: 'Estudio más efectivo en las mañanas',
        frequency: 0.8,
        impact: 'positive'
      },
      {
        pattern: 'Necesita descansos cada 45 minutos',
        frequency: 0.9,
        impact: 'positive'
      }
    ];
  }

  // Priorizar materias
  private prioritizeSubjects(subjects: AcademicSubject[]): AcademicSubject[] {
    return subjects.sort((a, b) => {
      // Priorizar por dificultad y notas actuales
      const aPriority = this.calculateSubjectPriority(a);
      const bPriority = this.calculateSubjectPriority(b);
      return bPriority - aPriority;
    });
  }

  // Calcular prioridad de materia
  private calculateSubjectPriority(subject: AcademicSubject): number {
    const currentGrade = subject.currentAverage || 3.0;
    const difficulty = subject.credits || 3;
    const urgency = 5.0 - currentGrade; // Más urgente si la nota es baja
    
    return urgency * difficulty;
  }

  // Calcular duración óptima
  private calculateOptimalDuration(subject: AcademicSubject, analysis: ProductivityAnalysis): number {
    const baseDuration = analysis.bestStudyDuration;
    const difficulty = this.assessSubjectDifficulty(subject);
    
    // Ajustar duración según dificultad
    switch (difficulty) {
      case 'easy': return baseDuration;
      case 'medium': return Math.round(baseDuration * 1.2);
      case 'hard': return Math.round(baseDuration * 1.5);
      default: return baseDuration;
    }
  }

  // Evaluar dificultad de materia
  private assessSubjectDifficulty(subject: AcademicSubject): 'easy' | 'medium' | 'hard' {
    const currentGrade = subject.currentAverage || 3.0;
    const credits = subject.credits || 3;
    
    if (currentGrade >= 4.0 && credits <= 3) return 'easy';
    if (currentGrade >= 3.0 && credits <= 4) return 'medium';
    return 'hard';
  }

  // Evaluar prioridad de materia
  private assessSubjectPriority(subject: AcademicSubject): 'low' | 'medium' | 'high' {
    const currentGrade = subject.currentAverage || 3.0;
    
    if (currentGrade < 3.0) return 'high';
    if (currentGrade < 4.0) return 'medium';
    return 'low';
  }

  // Encontrar mejor horario
  private findBestTimeSlot(
    startTime: Date,
    endTime: Date,
    duration: number,
    peakHours: number[]
  ): Date {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Buscar en las próximas 24 horas
    for (let hour = 8; hour < 22; hour++) {
      if (peakHours.includes(hour)) {
        const timeSlot = new Date(tomorrow);
        timeSlot.setHours(hour, 0, 0, 0);
        return timeSlot;
      }
    }
    
    // Fallback: mañana a las 9 AM
    return new Date(tomorrow.setHours(9, 0, 0, 0));
  }

  // Predecir efectividad de sesión
  private predictSessionEffectiveness(
    subject: AcademicSubject,
    timeSlot: Date,
    analysis: ProductivityAnalysis
  ): number {
    const hour = timeSlot.getHours();
    const isPeakHour = analysis.peakHours.includes(hour);
    const subjectEffectiveness = analysis.effectivenessBySubject[subject.name] || 0.7;
    
    return isPeakHour ? subjectEffectiveness * 1.2 : subjectEffectiveness;
  }

  // Calcular efectividad del plan
  private calculatePlanEffectiveness(sessions: StudySession[], analysis: ProductivityAnalysis): number {
    const totalEffectiveness = sessions.reduce((sum, session) => sum + (session.effectiveness || 0.7), 0);
    return totalEffectiveness / sessions.length;
  }

  // Analizar rendimiento actual
  private async analyzeCurrentPerformance(plan: StudyPlan, performance: any): Promise<any> {
    return {
      needsBreak: performance.studyTime > 45, // Más de 45 minutos sin descanso
      needsReview: performance.lastReview > 24, // Más de 24 horas sin revisar
      needsPractice: performance.practiceTime < 30 // Menos de 30 minutos de práctica
    };
  }

  // Preparar datos de entrenamiento
  private prepareStudyTrainingData(studyData: any[]): any {
    const features: number[][] = [];
    const labels: number[] = [];

    for (const data of studyData) {
      features.push([
        data.duration / 120, // Normalizar duración (máximo 2 horas)
        data.difficulty === 'easy' ? 0 : data.difficulty === 'medium' ? 0.5 : 1,
        data.timeOfDay / 24, // Normalizar hora del día
        data.breakTime / 30, // Normalizar tiempo de descanso
        data.subjectDifficulty,
        data.studentEnergy,
        data.environment,
        data.previousPerformance
      ]);
      labels.push(data.effectiveness);
    }

    return { features, labels };
  }

  // Plan de estudio de fallback
  private fallbackStudyPlan(
    student: User,
    subjects: AcademicSubject[],
    preferences: any
  ): StudyPlan {
    const sessions: StudySession[] = subjects.map((subject, index) => ({
      id: `fallback_${index}`,
      subject: subject.name,
      duration: 45,
      difficulty: 'medium',
      priority: 'medium',
      scheduledTime: new Date(Date.now() + index * 60 * 60 * 1000),
      completed: false
    }));

    return {
      id: `fallback_plan_${Date.now()}`,
      studentId: student.id,
      name: 'Plan de Estudio Básico',
      subjects: subjects.map(s => s.name),
      totalDuration: sessions.length * 45,
      sessions,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      goals: preferences.studyGoals,
      effectiveness: 0.6
    };
  }

  // Análisis de productividad de fallback
  private fallbackProductivityAnalysis(): ProductivityAnalysis {
    return {
      peakHours: [9, 10, 11, 14, 15, 16, 19, 20],
      optimalBreakDuration: 15,
      bestStudyDuration: 45,
      effectivenessBySubject: {},
      patterns: []
    };
  }
}

export const studyPlannerML = new StudyPlannerML();
