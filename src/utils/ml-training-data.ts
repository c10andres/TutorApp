// Utilidades para generar datos de entrenamiento ML
import { User } from '../types';

export interface TrainingDataGenerator {
  generateSmartMatchingData(): any[];
  generateAcademicPredictorData(): any[];
  generateStudyPlannerData(): any[];
  generateSupportCenterData(): any[];
}

export class MLTrainingDataGenerator implements TrainingDataGenerator {
  
  // Generar datos de entrenamiento para Smart Matching
  generateSmartMatchingData(): any[] {
    const data = [];
    
    // Simular 1000 interacciones estudiante-tutor
    for (let i = 0; i < 1000; i++) {
      const student = this.generateMockStudent();
      const tutor = this.generateMockTutor();
      const success = this.calculateMatchSuccess(student, tutor);
      
      data.push({
        features: [
          this.calculateSubjectMatch(student.preferredSubjects, tutor.subjects),
          this.calculatePriceMatch(student.maxPrice, tutor.hourlyRate),
          this.calculateLocationMatch(student.location, tutor.location),
          this.calculateScheduleMatch(student.availability, tutor.availability),
          this.calculateStyleMatch(student.learningStyle, tutor.experience),
          this.calculateExperienceMatch(student.experience, tutor.experience),
          this.calculateGoalMatch(student.goals, tutor.subjects)
        ],
        success: success ? 1 : 0,
        metadata: {
          studentId: student.id,
          tutorId: tutor.id,
          timestamp: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
        }
      });
    }
    
    return data;
  }

  // Generar datos de entrenamiento para Academic Predictor
  generateAcademicPredictorData(): any[] {
    const data = [];
    
    // Simular 500 registros académicos
    for (let i = 0; i < 500; i++) {
      const features = this.generateAcademicFeatures();
      const finalGPA = this.predictFinalGPA(features);
      
      data.push({
        features: {
          currentGPA: features.currentGPA,
          attendanceRate: features.attendanceRate,
          studyHours: features.studyHours,
          assignmentCompletion: features.assignmentCompletion,
          examPerformance: features.examPerformance,
          subjectDifficulty: features.subjectDifficulty,
          timeManagement: features.timeManagement,
          previousSemesterGPA: features.previousSemesterGPA,
          creditLoad: features.creditLoad,
          extracurricularActivities: features.extracurricularActivities
        },
        finalGPA,
        metadata: {
          studentId: `student_${i}`,
          semester: `2024-${Math.floor(Math.random() * 2) + 1}`,
          timestamp: new Date()
        }
      });
    }
    
    return data;
  }

  // Generar datos de entrenamiento para Study Planner
  generateStudyPlannerData(): any[] {
    const data = [];
    
    // Simular 800 sesiones de estudio
    for (let i = 0; i < 800; i++) {
      const session = this.generateStudySession();
      const effectiveness = this.calculateSessionEffectiveness(session);
      
      data.push({
        features: [
          session.duration / 120, // Normalizar duración (máximo 2 horas)
          session.difficulty === 'easy' ? 0 : session.difficulty === 'medium' ? 0.5 : 1,
          session.timeOfDay / 24, // Normalizar hora del día
          session.breakTime / 30, // Normalizar tiempo de descanso
          session.subjectDifficulty,
          session.studentEnergy,
          session.environment,
          session.previousPerformance
        ],
        effectiveness,
        metadata: {
          sessionId: session.id,
          studentId: session.studentId,
          timestamp: session.timestamp
        }
      });
    }
    
    return data;
  }

  // Generar datos de entrenamiento para Support Center
  generateSupportCenterData(): any[] {
    const data = [];
    
    // Simular 300 tickets de soporte
    for (let i = 0; i < 300; i++) {
      const ticket = this.generateSupportTicket();
      const resolution = this.calculateResolutionSuccess(ticket);
      
      data.push({
        features: [
          this.analyzeTicketUrgency(ticket),
          this.analyzeTicketComplexity(ticket),
          this.analyzeUserExperience(ticket),
          this.analyzeTicketCategory(ticket),
          this.analyzeResponseTime(ticket),
          this.analyzeTicketLength(ticket),
          this.analyzeSentimentScore(ticket),
          this.analyzeKeywordRelevance(ticket)
        ],
        success: resolution ? 1 : 0,
        metadata: {
          ticketId: ticket.id,
          userId: ticket.userId,
          category: ticket.category,
          timestamp: ticket.createdAt
        }
      });
    }
    
    return data;
  }

  // Métodos auxiliares para generar datos mock
  private generateMockStudent(): any {
    const subjects = ['Matemáticas', 'Física', 'Química', 'Programación', 'Inglés'];
    const locations = ['Bogotá', 'Medellín', 'Cali', 'Online'];
    const learningStyles = ['visual', 'auditory', 'kinesthetic', 'reading'];
    
    return {
      id: `student_${Math.random().toString(36).substr(2, 9)}`,
      preferredSubjects: this.randomSelect(subjects, Math.floor(Math.random() * 3) + 1),
      maxPrice: Math.floor(Math.random() * 50000) + 30000,
      location: this.randomSelect(locations),
      availability: this.generateAvailability(),
      experience: this.randomSelect(['beginner', 'intermediate', 'expert']),
      learningStyle: this.randomSelect(learningStyles),
      goals: this.generateGoals(),
      rating: Math.random() * 2 + 3 // 3-5
    };
  }

  private generateMockTutor(): any {
    const subjects = ['Matemáticas', 'Física', 'Química', 'Programación', 'Inglés', 'Biología'];
    const locations = ['Bogotá', 'Medellín', 'Cali', 'Online'];
    
    return {
      id: `tutor_${Math.random().toString(36).substr(2, 9)}`,
      subjects: this.randomSelect(subjects, Math.floor(Math.random() * 3) + 1),
      hourlyRate: Math.floor(Math.random() * 40000) + 20000,
      location: this.randomSelect(locations),
      availability: Math.random() > 0.2, // 80% disponible
      experience: {
        years: Math.floor(Math.random() * 10) + 1,
        description: 'Experiencia en enseñanza'
      },
      rating: Math.random() * 2 + 3,
      totalReviews: Math.floor(Math.random() * 100) + 10
    };
  }

  private generateAcademicFeatures(): any {
    return {
      currentGPA: Math.random() * 2 + 3, // 3-5
      attendanceRate: Math.random() * 0.3 + 0.7, // 0.7-1.0
      studyHours: Math.floor(Math.random() * 30) + 10, // 10-40
      assignmentCompletion: Math.random() * 0.4 + 0.6, // 0.6-1.0
      examPerformance: Math.random() * 0.4 + 0.6, // 0.6-1.0
      subjectDifficulty: Math.random(), // 0-1
      timeManagement: Math.random(), // 0-1
      previousSemesterGPA: Math.random() * 2 + 3, // 3-5
      creditLoad: Math.floor(Math.random() * 10) + 12, // 12-22
      extracurricularActivities: Math.floor(Math.random() * 5) // 0-5
    };
  }

  private generateStudySession(): any {
    const difficulties = ['easy', 'medium', 'hard'];
    const subjects = ['Matemáticas', 'Física', 'Química', 'Programación'];
    
    return {
      id: `session_${Math.random().toString(36).substr(2, 9)}`,
      studentId: `student_${Math.random().toString(36).substr(2, 9)}`,
      duration: Math.floor(Math.random() * 90) + 30, // 30-120 minutos
      difficulty: this.randomSelect(difficulties),
      subject: this.randomSelect(subjects),
      timeOfDay: Math.floor(Math.random() * 24), // 0-23 horas
      breakTime: Math.floor(Math.random() * 20) + 5, // 5-25 minutos
      subjectDifficulty: Math.random(),
      studentEnergy: Math.random(),
      environment: Math.random(),
      previousPerformance: Math.random(),
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    };
  }

  private generateSupportTicket(): any {
    const categories = ['Técnico', 'Pagos', 'Cuenta', 'Tutorías', 'General'];
    const messages = [
      'No puedo acceder a mi cuenta',
      'Error en el sistema de pagos',
      'Problema con la búsqueda de tutores',
      'No recibo notificaciones',
      'La aplicación se cierra inesperadamente'
    ];
    
    return {
      id: `ticket_${Math.random().toString(36).substr(2, 9)}`,
      userId: `user_${Math.random().toString(36).substr(2, 9)}`,
      title: 'Consulta de soporte',
      message: this.randomSelect(messages),
      category: this.randomSelect(categories),
      priority: this.randomSelect(['low', 'medium', 'high', 'urgent']),
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    };
  }

  // Métodos de cálculo
  private calculateMatchSuccess(student: any, tutor: any): boolean {
    const subjectMatch = this.calculateSubjectMatch(student.preferredSubjects, tutor.subjects);
    const priceMatch = this.calculatePriceMatch(student.maxPrice, tutor.hourlyRate);
    const locationMatch = this.calculateLocationMatch(student.location, tutor.location);
    
    const overallScore = (subjectMatch + priceMatch + locationMatch) / 3;
    return overallScore > 0.6 && Math.random() > 0.3; // 70% de éxito si hay buen match
  }

  private calculateSubjectMatch(studentSubjects: string[], tutorSubjects: string[]): number {
    if (!tutorSubjects || tutorSubjects.length === 0) return 0;
    const commonSubjects = studentSubjects.filter(s => tutorSubjects.includes(s));
    return commonSubjects.length / Math.max(studentSubjects.length, 1);
  }

  private calculatePriceMatch(maxPrice: number, tutorRate: number): number {
    if (!tutorRate) return 0;
    return Math.max(0, 1 - (tutorRate / maxPrice));
  }

  private calculateLocationMatch(studentLocation: string, tutorLocation: string): number {
    if (studentLocation === 'Online' || studentLocation === 'Cualquiera') return 1;
    if (tutorLocation === studentLocation) return 1;
    return 0.3;
  }

  private calculateScheduleMatch(studentAvailability: string[], tutorAvailability: boolean): number {
    if (!tutorAvailability) return 0;
    return 0.8; // Simplificado
  }

  private calculateStyleMatch(learningStyle: string, tutorExperience: any): number {
    return Math.random() * 0.3 + 0.7; // Simplificado
  }

  private calculateExperienceMatch(requiredExp: string, tutorExperience: any): number {
    if (!tutorExperience) return 0.5;
    const expYears = tutorExperience.years || 1;
    switch (requiredExp) {
      case 'beginner': return expYears >= 1 ? 1 : 0.6;
      case 'intermediate': return expYears >= 2 ? 1 : 0.6;
      case 'expert': return expYears >= 5 ? 1 : 0.6;
      default: return 0.5;
    }
  }

  private calculateGoalMatch(studentGoals: string[], tutorSubjects: string[]): number {
    if (!tutorSubjects || tutorSubjects.length === 0) return 0;
    return Math.random() * 0.4 + 0.6; // Simplificado
  }

  private predictFinalGPA(features: any): number {
    // Modelo simplificado de predicción
    const baseGPA = features.currentGPA;
    const attendanceBonus = features.attendanceRate * 0.5;
    const studyBonus = (features.studyHours / 40) * 0.3;
    const assignmentBonus = features.assignmentCompletion * 0.2;
    
    return Math.min(5, baseGPA + attendanceBonus + studyBonus + assignmentBonus);
  }

  private calculateSessionEffectiveness(session: any): number {
    // Factores que afectan la efectividad
    const timeFactor = session.duration > 30 && session.duration < 90 ? 1 : 0.8;
    const timeOfDayFactor = session.timeOfDay >= 9 && session.timeOfDay <= 17 ? 1 : 0.9;
    const energyFactor = session.studentEnergy;
    const environmentFactor = session.environment;
    
    return (timeFactor + timeOfDayFactor + energyFactor + environmentFactor) / 4;
  }

  private calculateResolutionSuccess(ticket: any): boolean {
    // Factores que afectan la resolución
    const urgencyFactor = ticket.priority === 'urgent' ? 0.9 : 0.7;
    const complexityFactor = ticket.message.length > 100 ? 0.6 : 0.8;
    const categoryFactor = ticket.category === 'General' ? 0.9 : 0.7;
    
    return (urgencyFactor + complexityFactor + categoryFactor) / 3 > 0.6;
  }

  // Métodos de análisis para Support Center
  private analyzeTicketUrgency(ticket: any): number {
    const urgencyMap = { low: 0.2, medium: 0.5, high: 0.8, urgent: 1.0 };
    return urgencyMap[ticket.priority] || 0.5;
  }

  private analyzeTicketComplexity(ticket: any): number {
    return Math.min(1, ticket.message.length / 200);
  }

  private analyzeUserExperience(ticket: any): number {
    return Math.random(); // Simplificado
  }

  private analyzeTicketCategory(ticket: any): number {
    const categoryMap = { 'Técnico': 0.8, 'Pagos': 0.7, 'Cuenta': 0.6, 'Tutorías': 0.5, 'General': 0.4 };
    return categoryMap[ticket.category] || 0.5;
  }

  private analyzeResponseTime(ticket: any): number {
    return Math.random(); // Simplificado
  }

  private analyzeTicketLength(ticket: any): number {
    return Math.min(1, ticket.message.length / 500);
  }

  private analyzeSentimentScore(ticket: any): number {
    return Math.random() * 2 - 1; // -1 a 1
  }

  private analyzeKeywordRelevance(ticket: any): number {
    return Math.random();
  }

  // Métodos auxiliares
  private randomSelect<T>(array: T[], count: number = 1): T | T[] {
    if (count === 1) {
      return array[Math.floor(Math.random() * array.length)];
    }
    
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private generateAvailability(): string[] {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return this.randomSelect(days, Math.floor(Math.random() * 5) + 2) as string[];
  }

  private generateGoals(): string[] {
    const goals = [
      'Mejorar calificaciones',
      'Preparar exámenes',
      'Entender conceptos',
      'Desarrollo personal',
      'Preparación universitaria'
    ];
    return this.randomSelect(goals, Math.floor(Math.random() * 3) + 1) as string[];
  }
}

export const mlTrainingDataGenerator = new MLTrainingDataGenerator();
