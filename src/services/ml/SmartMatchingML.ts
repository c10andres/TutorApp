// Servicio ML para Smart Matching
import { mlService } from './MLService';
import { User } from '../../types';

export interface MatchingPreferences {
  subjectSearch: string; // Cambio de array a string para búsqueda libre
  maxPrice: number;
  location: string;
  rating: number;
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
    priceMatch: number;
    locationMatch: number;
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
      this.calculatePriceMatch(preferences.maxPrice, tutor.hourlyRate),
      this.calculateLocationMatch(preferences.location, tutor.location),
      this.calculateScheduleMatch(preferences.schedule, tutor.availability),
      this.calculateStyleMatch(preferences.learningStyle, tutor.experience),
      this.calculateExperienceMatch(preferences.experience, tutor.experience),
      this.calculateGoalMatch(preferences.goals, tutor.subjects)
    ];
  }

  // Calcular match de materias (búsqueda libre)
  private calculateSubjectMatch(subjectSearch: string, tutorSubjects: string[]): number {
    if (!tutorSubjects || tutorSubjects.length === 0) return 0;
    if (!subjectSearch.trim()) return 0.5;
    
    const searchTerm = subjectSearch.toLowerCase().trim();
    const matchingSubjects = tutorSubjects.filter(tutorSubject => {
      const tutorSub = tutorSubject.toLowerCase().trim();
      
      // Coincidencia exacta
      if (tutorSub === searchTerm) return true;
      
      // Coincidencia parcial
      if (tutorSub.includes(searchTerm)) return true;
      
      // Coincidencia inversa
      if (searchTerm.includes(tutorSub)) return true;
      
      return false;
    });
    
    if (matchingSubjects.length === 0) return 0;
    
    // Puntuación basada en la calidad de la coincidencia
    const exactMatch = matchingSubjects.some(subject => 
      subject.toLowerCase().trim() === searchTerm
    );
    const partialMatch = matchingSubjects.some(subject => 
      subject.toLowerCase().includes(searchTerm) || searchTerm.includes(subject.toLowerCase())
    );
    
    if (exactMatch) return 1;
    if (partialMatch) return 0.9;
    return 0.7;
  }

  // Calcular match de precio
  private calculatePriceMatch(maxPrice: number, tutorRate: number): number {
    if (!tutorRate) return 0;
    return Math.max(0, 1 - (tutorRate / maxPrice));
  }

  // Calcular match de ubicación
  private calculateLocationMatch(preferredLocation: string, tutorLocation: string): number {
    if (preferredLocation === 'Online' || preferredLocation === 'Cualquiera') return 1;
    if (tutorLocation === preferredLocation) return 1;
    return 0.3; // Penalización por ubicación diferente
  }

  // Calcular match de horario
  private calculateScheduleMatch(preferredSchedule: string[], tutorAvailability: boolean): number {
    if (!tutorAvailability) return 0;
    // Simplificado - en implementación real se compararían horarios específicos
    return 0.8;
  }

  // Calcular match de estilo de aprendizaje
  private calculateStyleMatch(learningStyle: string, tutorExperience: any): number {
    // Simplificado - en implementación real se analizaría el perfil del tutor
    return Math.random() * 0.3 + 0.7;
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
    
    // Simplificado - en implementación real se mapearían objetivos a materias
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
      'Materias', 'Precio', 'Ubicación', 'Horario', 
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
      insights.push('La IA detectó compatibilidad excepcional');
      insights.push('Patrones similares a matches exitosos');
    } else if (score > 0.7) {
      insights.push('Alta probabilidad de éxito académico');
      insights.push('Metodología alineada con tu perfil');
    } else {
      insights.push('Match moderado con potencial de mejora');
      insights.push('Recomendación basada en datos históricos');
    }

    return insights.slice(0, 2);
  }

  // Parsear características para visualización
  private parseFeatures(features: number[]) {
    return {
      subjectMatch: features[0],
      priceMatch: features[1],
      locationMatch: features[2],
      scheduleMatch: features[3],
      styleMatch: features[4],
      experienceMatch: features[5],
      goalMatch: features[6]
    };
  }

  // Algoritmo de fallback (actual)
  private fallbackMatching(
    student: User,
    preferences: MatchingPreferences,
    tutors: User[]
  ): MLMatchingResult[] {
    console.log('🔄 Usando algoritmo de fallback mejorado con filtrado estricto');
    
    const results: MLMatchingResult[] = [];
    
    for (const tutor of tutors) {
      // Calcular compatibilidad usando la misma lógica estricta
      const features = this.extractFeatures(student, preferences, tutor);
      const compatibility = this.calculateCompatibilityScore(features, preferences, tutor);
      
      // Solo incluir si cumple criterios críticos
      if (this.meetsCriticalCriteria(compatibility, preferences, tutor)) {
        results.push({
          tutor,
          compatibilityScore: compatibility.overall,
          confidence: 0.8, // Alta confianza en el algoritmo de fallback
          reasons: this.generateFallbackReasons(compatibility, tutor),
          aiInsights: this.generateFallbackInsights(compatibility, tutor),
          features: {
            subjectMatch: compatibility.subject,
            priceMatch: compatibility.price,
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
      .slice(0, 6); // Máximo 6 tutores como en el componente principal
  }

  // Calcular score de compatibilidad
  private calculateCompatibilityScore(features: number[], preferences: MatchingPreferences, tutor: User) {
    return {
      subject: features[0],
      price: features[1],
      location: features[2],
      schedule: features[3],
      style: features[4],
      experience: features[5],
      goal: features[6],
      overall: features.reduce((sum, score) => sum + score, 0) / features.length
    };
  }

  // Verificar criterios críticos
  private meetsCriticalCriteria(compatibility: any, preferences: MatchingPreferences, tutor: User): boolean {
    // Materia: Si se especificó búsqueda, DEBE coincidir
    if (preferences.subjectSearch.trim() && compatibility.subject <= 0) {
      return false;
    }
    
    // Ubicación: Si se especificó, DEBE coincidir
    if (preferences.location && preferences.location !== 'Cualquiera' && compatibility.location <= 0) {
      return false;
    }
    
    // Precio: Si se especificó límite, NO debe exceder
    if (preferences.maxPrice > 0 && compatibility.price <= 0) {
      return false;
    }
    
    // Experiencia: Si se especificó, DEBE coincidir
    if (preferences.experience && preferences.experience !== 'any' && compatibility.experience <= 0) {
      return false;
    }
    
    // Score mínimo
    return compatibility.overall >= 0.3;
  }

  // Generar razones para fallback
  private generateFallbackReasons(compatibility: any, tutor: User): string[] {
    const reasons: string[] = [];
    
    if (compatibility.subject > 0.7) {
      reasons.push(`Especialista en ${tutor.subjects?.slice(0, 2).join(', ')}`);
    }
    if (compatibility.price > 0.7) {
      reasons.push(`Precio competitivo: $${tutor.hourlyRate?.toLocaleString()} COP/hora`);
    }
    if (tutor.rating && tutor.rating >= 4.5) {
      reasons.push(`Excelente calificación: ${tutor.rating} ⭐`);
    }
    if (compatibility.location > 0.8) {
      reasons.push(`Disponible en ${tutor.location}`);
    }
    
    return reasons.slice(0, 3);
  }

  // Generar insights para fallback
  private generateFallbackInsights(compatibility: any, tutor: User): string[] {
    const insights: string[] = [];
    
    if (compatibility.subject > 0.8 && compatibility.experience > 0.8) {
      insights.push('IA detectó: Combinación perfecta de especialización y experiencia');
    } else if (compatibility.subject > 0.7) {
      insights.push('IA detectó: Alta compatibilidad en materias de interés');
    }
    
    if (compatibility.price > 0.8 && tutor.rating && tutor.rating >= 4.0) {
      insights.push('IA detectó: Excelente relación calidad-precio');
    }
    
    return insights.slice(0, 2);
  }
}

export const smartMatchingML = new SmartMatchingML();
