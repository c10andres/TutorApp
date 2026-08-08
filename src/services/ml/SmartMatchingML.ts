// Servicio ML para Smart Matching
import { mlService } from './MLService';
import { User } from '../../types';

export interface MatchingPreferences {
  subjectSearch: string;
  maxPoints: number;
  location: string; // Restored
  minRating?: number;
  experience: 'beginner' | 'intermediate' | 'expert' | 'any';
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  schedule: string[];
  goals: string[];
}

export interface MLMatchingResult {
  tutor: User;
  compatibilityScore: number;
  confidence: number;
  reasons: string[];
  aiInsights: string[];
  features: {
    subjectMatch: number;
    pointsMatch: number;     // Affordability
    reputationMatch: number; // Quality
    badgeMatch: number;      // Gamification
    locationMatch: number;   // Logistics
    scheduleMatch: number;
    styleMatch: number;
    experienceMatch: number;
    goalMatch: number;
  };
}

export class SmartMatchingML {
  private model: any;
  private isTrained = false;

  constructor() {
    this.initializeModel();
  }

  private async initializeModel(): Promise<void> {
    try {
      await mlService.initialize();

      // Crear modelo de red neuronal para matching
      this.model = mlService.createNeuralNetwork(
        7, // 7 características de entrada
        [64, 32, 16], // Capas ocultas
        1, // 1 salida (score de compatibilidad)
        {
          batchSize: 32,
          epochs: 100,
          learningRate: 0.001
        }
      );

      console.log('🎯 Modelo Smart Matching ML inicializado');
    } catch (error) {
      console.error('❌ Error inicializando Smart Matching ML:', error);
    }
  }

  // Entrenar modelo con datos históricos
  public async trainModel(historicalData: any[]): Promise<void> {
    if (!this.model) {
      throw new Error('Modelo no inicializado');
    }

    try {
      // Preparar datos de entrenamiento
      const trainingData = this.prepareTrainingData(historicalData);

      // Entrenar modelo
      await mlService.trainModel(this.model, trainingData, {
        batchSize: 32,
        epochs: 100,
        learningRate: 0.001
      });

      // Guardar modelo
      await mlService.saveModel(this.model, 'smart-matching');
      this.isTrained = true;

      console.log('✅ Modelo Smart Matching entrenado exitosamente');
    } catch (error) {
      console.error('❌ Error entrenando modelo:', error);
      throw error;
    }
  }

  // Encontrar matches usando ML
  public async findMatches(
    student: User,
    preferences: MatchingPreferences,
    tutors: User[]
  ): Promise<MLMatchingResult[]> {
    if (!this.isTrained) {
      console.warn('⚠️ Modelo no entrenado, usando algoritmo de fallback');
      return this.fallbackMatching(student, preferences, tutors);
    }

    try {
      const results: MLMatchingResult[] = [];

      for (const tutor of tutors) {
        // Extraer características
        const features = this.extractFeatures(student, preferences, tutor);

        // Hacer predicción
        const prediction = await mlService.predict(this.model, features);

        // Generar resultado
        const result: MLMatchingResult = {
          tutor,
          compatibilityScore: prediction.prediction,
          confidence: prediction.confidence,
          reasons: this.generateMLReasons(features, prediction.prediction),
          aiInsights: this.generateMLInsights(features, prediction.prediction),
          features: this.parseFeatures(features)
        };

        results.push(result);
      }

      // Ordenar por score y retornar top matches
      return results
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, 8);

    } catch (error) {
      console.error('❌ Error en ML matching:', error);
      return this.fallbackMatching(student, preferences, tutors);
    }
  }

  // Extraer características para ML
  private extractFeatures(
    student: User,
    preferences: MatchingPreferences,
    tutor: User
  ): number[] {
    return [
      this.calculateSubjectMatch(preferences.subjectSearch, tutor.subjects),
      this.calculatePointsMatch(preferences.maxPoints, tutor.hourlyPoints), // Affordability
      this.calculateReputationMatch(tutor.reputationPoints, tutor.rating), // Reputation
      this.calculateBadgeMatch(tutor.badges, tutor.rank),
      this.calculateLocationMatch(preferences.location, tutor.location),
      this.calculateScheduleMatch(preferences.schedule, tutor.availability),
      this.calculateStyleMatch(preferences.learningStyle || '', tutor.experience),
      this.calculateExperienceMatch(preferences.experience, tutor.experience),
      this.calculateGoalMatch(preferences.goals, tutor.subjects)
    ];
  }

  // Calcular match de materias (búsqueda libre) - STRICT MATCHING (Thesis Requirement)
  private calculateSubjectMatch(subjectSearch: string, tutorSubjects: string[]): number {
    if (!tutorSubjects || tutorSubjects.length === 0) return 0;
    if (!subjectSearch.trim()) return 0;

    const searchTerm = subjectSearch.toLowerCase().trim();

    // 1. Afinidad Temática (1 o 0): Coincidencia estricta de tags
    const hasSubject = tutorSubjects.some(tutorSubject =>
      tutorSubject.toLowerCase().trim() === searchTerm ||
      tutorSubject.toLowerCase().includes(searchTerm)
    );

    return hasSubject ? 1 : 0;
  }

  // [NEW] Calcular match de Puntos (Budget/Affordability)
  private calculatePointsMatch(maxPoints: number, hourlyPoints: number = 10): number {
    if (!maxPoints) return 1; // No budget limit
    if (hourlyPoints <= maxPoints) return 1; // Within budget

    // Soft match logic for budget flexibility
    if (hourlyPoints <= maxPoints * 1.5) return 0.4;

    return 0; // Over budget significantly
  }

  // [NEW] Calcular match de Reputación (Points + Rating)
  private calculateReputationMatch(points: number = 0, rating: number = 0): number {
    // Points score (0 to 1): 5000 is 'Maestro' level
    const pointsScore = Math.min(points / 5000, 1);

    // Rating score (0 to 1): 5.0 is max
    const ratingScore = rating / 5;

    // Combined: 60% Points + 40% Rating
    return (pointsScore * 0.6) + (ratingScore * 0.4);
  }

  // [NEW] Calcular match de Insignias (Gamification)
  private calculateBadgeMatch(badges: string[] = [], rank: string = ''): number {
    if (!badges || badges.length === 0) return 0;

    // Count score (0.1 per badge, max 0.5)
    const countScore = Math.min(badges.length * 0.1, 0.5);

    // Rank score (0.5 for high ranks)
    let rankScore = 0;
    if (rank === 'Maestro') rankScore = 0.5;
    else if (rank === 'Monitor Experto') rankScore = 0.4;
    else if (rank === 'Monitor') rankScore = 0.3;
    else if (rank === 'Aprendiz Activo') rankScore = 0.1;

    return countScore + rankScore;
  }

  // [NEW] Calcular match de Ubicación
  private calculateLocationMatch(preferredLoc: string, tutorLoc: string = ''): number {
    if (!preferredLoc || preferredLoc === 'Cualquiera') return 1;
    if (!tutorLoc) return 0;

    // Online check
    if (preferredLoc === 'Online' || tutorLoc.includes('Online')) {
      if (preferredLoc === 'Online' && tutorLoc.includes('Online')) return 1;
      return 0.8; // High compatibility if one is online
    }

    // City check
    if (tutorLoc.toLowerCase().includes(preferredLoc.toLowerCase())) return 1;
    return 0;
  }

  // Calcular match de horario - DISPONIBILIDAD (0 a 1)
  private calculateScheduleMatch(preferredSchedule: string[], tutorAvailability: boolean): number {
    return tutorAvailability ? 1 : 0;
  }

  // Calcular match de estilo de aprendizaje
  private calculateStyleMatch(learningStyle: string, tutorExperience: any): number {
    return Math.random() * 0.3 + 0.7; // Placeholder
  }

  // Calcular match de experiencia
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

  // Calcular match de objetivos
  private calculateGoalMatch(studentGoals: string[], tutorSubjects: string[]): number {
    if (!tutorSubjects || tutorSubjects.length === 0) return 0;
    return Math.random() * 0.4 + 0.6;
  }

  // Preparar datos de entrenamiento
  private prepareTrainingData(historicalData: any[]): any {
    const features: number[][] = [];
    const labels: number[] = [];

    for (const data of historicalData) {
      features.push(data.features);
      labels.push(data.success ? 1 : 0);
    }

    return { features, labels };
  }

  // Generar razones basadas en ML
  private generateMLReasons(features: number[], score: number): string[] {
    const reasons: string[] = [];
    const featureNames = [
      'Materias', 'Reputación', 'Insignias', 'Horario',
      'Estilo', 'Experiencia', 'Objetivos'
    ];

    features.forEach((feature, index) => {
      if (feature > 0.8) {
        reasons.push(`Excelente match en ${featureNames[index]}`);
      } else if (feature > 0.6) {
        reasons.push(`Buen match en ${featureNames[index]}`);
      }
    });

    if (score > 0.9) {
      reasons.push('Match casi perfecto según IA');
    }

    return reasons.slice(0, 3);
  }

  // Generar insights de IA
  private generateMLInsights(features: number[], score: number): string[] {
    const insights: string[] = [];

    if (score > 0.9) {
      insights.push('La IA detectó compatibilidad excepcional en reputación y conocimiento');
      insights.push('Perfil altamente confiable (Insignias de valor)');
    } else if (score > 0.7) {
      insights.push('Alta probabilidad de éxito académico');
      insights.push('Metodología alineada con tu perfil');
    } else {
      insights.push('Match moderado con potencial de mejora');
      insights.push('Recomendación basada en historial de éxito');
    }

    return insights.slice(0, 2);
  }

  // Parsear características para visualización
  private parseFeatures(features: number[]) {
    return {
      subjectMatch: features[0],
      pointsMatch: features[1],
      reputationMatch: features[2],
      badgeMatch: features[3],
      locationMatch: features[4], // Added
      scheduleMatch: features[5],
      styleMatch: features[6],
      experienceMatch: features[7],
      goalMatch: features[8]
    };
  }

  // Algoritmo de fallback (actual)
  private fallbackMatching(
    student: User,
    preferences: MatchingPreferences,
    tutors: User[]
  ): MLMatchingResult[] {
    console.log('🔄 Usando algoritmo de fallback mejorado (Reputación + Insignias)');

    const results: MLMatchingResult[] = [];

    for (const tutor of tutors) {
      const features = this.extractFeatures(student, preferences, tutor);
      const compatibility = this.calculateCompatibilityScore(features, preferences, tutor);

      if (this.meetsCriticalCriteria(compatibility, preferences, tutor)) {
        results.push({
          tutor,
          compatibilityScore: compatibility.overall,
          confidence: 0.8,
          reasons: this.generateFallbackReasons(compatibility, tutor),
          aiInsights: this.generateFallbackInsights(compatibility, tutor),
          features: {
            subjectMatch: compatibility.subject,
            pointsMatch: compatibility.points,
            reputationMatch: compatibility.reputation,
            badgeMatch: compatibility.badges,
            locationMatch: compatibility.location,
            scheduleMatch: compatibility.schedule,
            styleMatch: compatibility.style,
            experienceMatch: compatibility.experience,
            goalMatch: compatibility.goal
          }
        });
      }
    }

    return results
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 6);
  }

  // Calcular score de compatibilidad - WEIGHTED SCORING UPDATED
  private calculateCompatibilityScore(features: number[], preferences: MatchingPreferences, tutor: User) {
    // 0: Subject
    // 1: Reputation (New)
    // 2: Badges (New)
    // 3: Schedule

    // FÓRMULA DE TESIS ACTUALIZADA: Solidarity Focus
    // Wt (Temática) = 0.4 (40%) - Essential
    // Wr (Reputation) = 0.3 (30%) - Trust
    // Wb (Badges) = 0.2 (20%) - Gamification
    // Wa (Availability) = 0.1 (10%) - Logistics

    const weightedScore =
      (features[0] * 0.25) + // Subject (Thematic is Key)
      (features[1] * 0.20) + // Points (Affordability)
      (features[2] * 0.20) + // Reputation (Skills - INCREASED)
      (features[3] * 0.15) + // Badges (Achievements - INCREASED)
      (features[4] * 0.00) + // Location (REMOVED)
      (features[5] * 0.05) + // Schedule
      (features[6] * 0.00) + // Style
      (features[7] * 0.05) + // Experience
      (features[8] * 0.10);  // Goal Match (Objectives - INCREASED)

    return {
      subject: features[0],
      points: features[1],
      reputation: features[2],
      badges: features[3],
      location: features[4], // Correct index
      schedule: features[5],
      style: features[6],
      experience: features[7],
      goal: features[8],
      overall: weightedScore
    };
  }

  // Verificar criterios críticos
  // Verificar criterios críticos
  private meetsCriticalCriteria(compatibility: any, preferences: MatchingPreferences, tutor: User): boolean {
    // Relaxed for "Discovery Mode" - Rank all tutors instead of filtering

    // Materia: Allow mismatches (they will just have low scores)
    // if (preferences.subjectSearch.trim() && compatibility.subject <= 0) return false;

    // Experiencia: Allow mismatches
    // if (preferences.experience && preferences.experience !== 'any' && compatibility.experience <= 0) return false;

    // Score mínimo: Very low to include almost everyone
    return compatibility.overall >= 0.01;
  }

  // Generar razones para fallback
  private generateFallbackReasons(compatibility: any, tutor: User): string[] {
    const reasons: string[] = [];

    if (compatibility.subject > 0.7) {
      reasons.push(`Especialista en ${tutor.subjects?.slice(0, 2).join(', ')}`);
    }
    if (compatibility.reputation > 0.7) {
      reasons.push(`Alta Reputación: ${tutor.reputationPoints || 0} Puntos`);
    }
    if (compatibility.badges > 0.5) {
      reasons.push(`Perfil Destacado: ${tutor.rank || 'Nivel Alto'}`);
    }
    if (tutor.badges && tutor.badges.length > 5) {
      reasons.push(`${tutor.badges.length} Insignias ganadas`);
    }

    return reasons.slice(0, 3);
  }

  // Generar insights para fallback
  private generateFallbackInsights(compatibility: any, tutor: User): string[] {
    const insights: string[] = [];

    if (compatibility.reputation > 0.8 && compatibility.badges > 0.6) {
      insights.push('IA detectó: Tutor líder en la comunidad solidaria');
    }
    else if (compatibility.subject > 0.7) {
      insights.push('IA detectó: Alta afinidad temática');
    }

    return insights.slice(0, 2);
  }
}

export const smartMatchingML = new SmartMatchingML();




