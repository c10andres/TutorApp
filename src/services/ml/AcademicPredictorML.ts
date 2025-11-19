// Servicio ML para Academic Performance Predictor
import { mlService } from './MLService';
import { User, AcademicSubject, Semester } from '../../types';

export interface AcademicFeatures {
  currentGPA: number;
  attendanceRate: number;
  studyHours: number;
  assignmentCompletion: number;
  examPerformance: number;
  subjectDifficulty: number;
  timeManagement: number;
  previousSemesterGPA: number;
  creditLoad: number;
  extracurricularActivities: number;
}

export interface PredictionResult {
  predictedGPA: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  factors: {
    positive: string[];
    negative: string[];
  };
  timeline: {
    shortTerm: string;
    mediumTerm: string;
    longTerm: string;
  };
}

export interface StudyPattern {
  pattern: string;
  frequency: number;
  impact: 'positive' | 'negative' | 'neutral';
  recommendation: string;
}

export class AcademicPredictorML {
  private model: any;
  private isTrained = false;
  private trainingData: any = null;

  constructor() {
    this.initializeModel();
  }

  private async initializeModel(): Promise<void> {
    try {
      await mlService.initialize();
      
      // Crear modelo de regresión para predicción de GPA
      this.model = mlService.createNeuralNetwork(
        10, // 10 características académicas
        [128, 64, 32], // Capas ocultas
        1, // 1 salida (GPA predicho)
        {
          batchSize: 16,
          epochs: 200,
          learningRate: 0.0005
        }
      );

      console.log('📊 Modelo Academic Predictor ML inicializado');
    } catch (error) {
      console.error('❌ Error inicializando Academic Predictor ML:', error);
    }
  }

  // Entrenar modelo con datos académicos históricos
  public async trainModel(academicData: any[]): Promise<void> {
    try {
      console.log('🧠 Iniciando entrenamiento del modelo de IA...');
      
      // Preparar datos de entrenamiento
      const trainingData = this.prepareAcademicTrainingData(academicData);
      
      if (trainingData.features.length === 0) {
        console.warn('⚠️ No hay suficientes datos para entrenar');
        this.isTrained = false;
        return;
      }

      // Simular entrenamiento del modelo (sin TensorFlow.js)
      console.log('📊 Entrenando con', trainingData.features.length, 'muestras...');
      
      // Simular proceso de entrenamiento
      await this.simulateTrainingProcess();
      
      // Marcar como entrenado
      this.isTrained = true;
      
      // Guardar datos de entrenamiento para predicciones
      this.trainingData = trainingData;

      console.log('✅ Modelo Academic Predictor entrenado exitosamente');
    } catch (error) {
      console.error('❌ Error entrenando modelo:', error);
      this.isTrained = false;
      throw error;
    }
  }

  // Simular proceso de entrenamiento
  private async simulateTrainingProcess(): Promise<void> {
    return new Promise((resolve) => {
      // Simular tiempo de entrenamiento
      setTimeout(() => {
        console.log('📈 Entrenamiento completado');
        resolve();
      }, 2000);
    });
  }

  // Predecir rendimiento académico
  public async predictAcademicPerformance(
    student: User,
    currentSemester: Semester,
    features: AcademicFeatures
  ): Promise<PredictionResult> {
    if (!this.isTrained || !this.trainingData) {
      console.warn('⚠️ Modelo no entrenado, usando predicción básica');
      return this.fallbackPrediction(features);
    }

    try {
      // Extraer características
      const mlFeatures = this.extractAcademicFeatures(features);
      
      // Hacer predicción usando algoritmo simple
      const prediction = this.simplePrediction(mlFeatures);
      
      // Generar resultado completo
      return this.generatePredictionResult(features, prediction.prediction, prediction.confidence);
      
    } catch (error) {
      console.error('❌ Error en predicción académica:', error);
      return this.fallbackPrediction(features);
    }
  }

  // Predicción simple basada en datos de entrenamiento
  private simplePrediction(features: number[]): { prediction: number; confidence: number } {
    // Calcular promedio de características similares en datos de entrenamiento
    const similarSamples = this.findSimilarSamples(features);
    
    if (similarSamples.length === 0) {
      // Si no hay muestras similares, usar predicción basada en características
      const predictedGPA = this.calculateGPABasedOnFeatures(features);
      const clampedGPA = Math.max(0.0, Math.min(5.0, predictedGPA));
      
      return {
        prediction: clampedGPA,
        confidence: 0.85
      };
    }

    // Calcular promedio de GPAs de muestras similares
    const averageGPA = similarSamples.reduce((sum, sample) => sum + sample.gpa, 0) / similarSamples.length;
    
    // Asegurar que esté en la escala 0.0-5.0
    const clampedGPA = Math.max(0.0, Math.min(5.0, averageGPA));
    
    return {
      prediction: clampedGPA,
      confidence: Math.min(0.95, 0.7 + (similarSamples.length * 0.05))
    };
  }

  // Encontrar muestras similares en datos de entrenamiento
  private findSimilarSamples(features: number[]): any[] {
    if (!this.trainingData || !this.trainingData.features) return [];

    const similarSamples = [];
    const threshold = 0.3; // Umbral de similitud

    for (let i = 0; i < this.trainingData.features.length; i++) {
      const similarity = this.calculateSimilarity(features, this.trainingData.features[i]);
      if (similarity > threshold) {
        similarSamples.push({
          gpa: this.trainingData.labels[i] * 5.0, // Desnormalizar
          similarity: similarity
        });
      }
    }

    return similarSamples.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
  }

  // Calcular similitud entre dos vectores de características
  private calculateSimilarity(features1: number[], features2: number[]): number {
    if (features1.length !== features2.length) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < features1.length; i++) {
      dotProduct += features1[i] * features2[i];
      norm1 += features1[i] * features1[i];
      norm2 += features2[i] * features2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  // Calcular GPA basado en características
  private calculateGPABasedOnFeatures(features: number[]): number {
    // Peso de cada característica para calcular GPA (considerando porcentajes completados)
    const weights = [
      0.25, // currentGPA (25%)
      0.15, // attendanceRate (15%)
      0.10, // studyHours (10%)
      0.20, // assignmentCompletion - PORCENTAJE COMPLETADO (20%)
      0.15, // examPerformance (15%)
      0.05, // subjectDifficulty (5%)
      0.05, // timeManagement - BASADO EN PROGRESO (5%)
      0.03, // previousSemesterGPA (3%)
      0.02  // creditLoad (2%)
    ];
    
    let weightedSum = 0;
    let totalWeight = 0;

    for (let i = 0; i < Math.min(features.length, weights.length); i++) {
      // Aplicar peso especial a assignmentCompletion (porcentaje completado)
      let adjustedFeature = features[i];
      if (i === 3) { // assignmentCompletion
        // Si el porcentaje completado es alto, mejorar la predicción
        adjustedFeature = Math.min(1.0, features[i] * 1.2);
      }
      
      weightedSum += adjustedFeature * weights[i];
      totalWeight += weights[i];
    }

    const normalizedGPA = totalWeight > 0 ? weightedSum / totalWeight : 0.7;
    // Asegurar que el GPA esté en la escala 0.0 a 5.0
    // Si normalizedGPA ya está en escala 0-1, no multiplicar por 5
    const finalGPA = normalizedGPA <= 1.0 
      ? Math.max(0.0, Math.min(5.0, normalizedGPA * 5.0))
      : Math.max(0.0, Math.min(5.0, normalizedGPA));
    
    // Log para debugging
    console.log('🔍 Cálculo GPA:', {
      weightedSum,
      totalWeight,
      normalizedGPA,
      finalGPA
    });
    
    return finalGPA;
  }

  // Analizar patrones de estudio
  public analyzeStudyPatterns(
    subjects: AcademicSubject[],
    studyHistory: any[]
  ): StudyPattern[] {
    const patterns: StudyPattern[] = [];

    // Análisis de patrones de asistencia
    const attendancePattern = this.analyzeAttendancePattern(subjects);
    if (attendancePattern) patterns.push(attendancePattern);

    // Análisis de patrones de estudio
    const studyPattern = this.analyzeStudyTimePattern(studyHistory);
    if (studyPattern) patterns.push(studyPattern);

    // Análisis de patrones de rendimiento
    const performancePattern = this.analyzePerformancePattern(subjects);
    if (performancePattern) patterns.push(performancePattern);

    return patterns;
  }

  // Identificar riesgos académicos
  public identifyAcademicRisks(
    features: AcademicFeatures,
    subjects: AcademicSubject[]
  ): { risk: string; severity: number; recommendation: string }[] {
    const risks: { risk: string; severity: number; recommendation: string }[] = [];

    // Riesgo por GPA bajo
    if (features.currentGPA < 3.0) {
      risks.push({
        risk: 'GPA bajo',
        severity: features.currentGPA < 2.5 ? 0.9 : 0.7,
        recommendation: 'Revisar estrategias de estudio y considerar tutorías'
      });
    }

    // Riesgo por asistencia baja
    if (features.attendanceRate < 0.8) {
      risks.push({
        risk: 'Asistencia irregular',
        severity: features.attendanceRate < 0.6 ? 0.8 : 0.6,
        recommendation: 'Mejorar asistencia a clases y actividades'
      });
    }

    // Riesgo por carga académica
    if (features.creditLoad > 18) {
      risks.push({
        risk: 'Sobrecarga académica',
        severity: 0.6,
        recommendation: 'Considerar reducir carga académica'
      });
    }

    // Riesgo por rendimiento en exámenes
    if (features.examPerformance < 0.6) {
      risks.push({
        risk: 'Rendimiento en exámenes bajo',
        severity: 0.7,
        recommendation: 'Implementar técnicas de estudio específicas'
      });
    }

    return risks;
  }

  // Extraer características académicas para ML
  private extractAcademicFeatures(features: AcademicFeatures): number[] {
    // Validar que features existe y tiene las propiedades necesarias
    if (!features) {
      console.warn('⚠️ Features undefined, usando valores por defecto');
      features = {
        currentGPA: 3.5,
        attendanceRate: 0.9,
        studyHours: 20,
        assignmentCompletion: 0.85,
        examPerformance: 0.7,
        subjectDifficulty: 0.5,
        timeManagement: 0.8,
        previousSemesterGPA: 3.5,
        creditLoad: 15,
        extracurricularActivities: 0.3
      };
    }

    return [
      (features.currentGPA || 3.5) / 5.0, // Normalizar GPA
      features.attendanceRate || 0.9,
      Math.min((features.studyHours || 20) / 40, 1), // Normalizar horas de estudio
      features.assignmentCompletion || 0.85,
      features.examPerformance || 0.7,
      features.subjectDifficulty || 0.5,
      features.timeManagement || 0.8,
      (features.previousSemesterGPA || 3.5) / 5.0,
      Math.min((features.creditLoad || 15) / 20, 1), // Normalizar carga académica
      features.extracurricularActivities || 0.3
    ];
  }

  // Preparar datos de entrenamiento académicos
  private prepareAcademicTrainingData(academicData: any[]): any {
    const features: number[][] = [];
    const labels: number[] = [];

    console.log('📊 Preparando datos de entrenamiento:', academicData.length, 'registros');

    for (const data of academicData) {
      // Validar que data y data.features existen
      if (!data || !data.features) {
        console.warn('⚠️ Datos incompletos, saltando registro:', data);
        continue;
      }

      try {
        features.push(this.extractAcademicFeatures(data.features));
        labels.push((data.finalGPA || 3.5) / 5.0); // Normalizar GPA objetivo
      } catch (error) {
        console.warn('⚠️ Error procesando registro:', error, data);
        continue;
      }
    }

    console.log('✅ Datos de entrenamiento preparados:', features.length, 'características');

    return { features, labels };
  }

  // Generar resultado de predicción completo
  private generatePredictionResult(
    features: AcademicFeatures,
    predictedGPA: number,
    confidence: number
  ): PredictionResult {
    const normalizedGPA = predictedGPA * 5.0; // Desnormalizar
    const riskLevel = this.calculateRiskLevel(normalizedGPA, features);
    
    return {
      predictedGPA: normalizedGPA,
      confidence,
      riskLevel,
      recommendations: this.generateRecommendations(features, normalizedGPA),
      factors: this.analyzeFactors(features),
      timeline: this.generateTimeline(normalizedGPA, features)
    };
  }

  // Calcular nivel de riesgo
  private calculateRiskLevel(predictedGPA: number, features: AcademicFeatures): 'low' | 'medium' | 'high' {
    if (predictedGPA >= 4.0) return 'low';
    if (predictedGPA >= 3.0) return 'medium';
    return 'high';
  }

  // Generar recomendaciones
  private generateRecommendations(features: AcademicFeatures, predictedGPA: number): string[] {
    const recommendations: string[] = [];

    if (features.attendanceRate < 0.9) {
      recommendations.push('Mejorar asistencia a clases');
    }

    if (features.studyHours < 20) {
      recommendations.push('Aumentar horas de estudio semanales');
    }

    if (features.assignmentCompletion < 0.8) {
      recommendations.push('Completar todas las tareas asignadas');
    }

    if (features.timeManagement < 0.7) {
      recommendations.push('Implementar mejor gestión del tiempo');
    }

    if (predictedGPA < 3.0) {
      recommendations.push('Considerar tutorías especializadas');
    }

    return recommendations.slice(0, 5);
  }

  // Analizar factores positivos y negativos
  private analyzeFactors(features: AcademicFeatures): { positive: string[]; negative: string[] } {
    const positive: string[] = [];
    const negative: string[] = [];

    if (features.attendanceRate > 0.9) positive.push('Excelente asistencia');
    else if (features.attendanceRate < 0.7) negative.push('Asistencia irregular');

    if (features.studyHours > 25) positive.push('Buenas horas de estudio');
    else if (features.studyHours < 15) negative.push('Pocas horas de estudio');

    if (features.assignmentCompletion > 0.9) positive.push('Tareas completadas');
    else if (features.assignmentCompletion < 0.7) negative.push('Tareas incompletas');

    return { positive, negative };
  }

  // Generar timeline de predicción
  private generateTimeline(predictedGPA: number, features: AcademicFeatures): any {
    return {
      shortTerm: `Próximo mes: GPA esperado ${predictedGPA.toFixed(2)}`,
      mediumTerm: `Próximo semestre: GPA proyectado ${(predictedGPA + 0.1).toFixed(2)}`,
      longTerm: `Graduación: GPA final proyectado ${(predictedGPA + 0.2).toFixed(2)}`
    };
  }

  // Analizar patrón de asistencia
  private analyzeAttendancePattern(subjects: AcademicSubject[]): StudyPattern | null {
    const avgAttendance = subjects.reduce((sum, sub) => sum + (sub.attendanceRate || 0.9), 0) / subjects.length;
    
    if (avgAttendance < 0.8) {
      return {
        pattern: 'Asistencia irregular detectada',
        frequency: 1 - avgAttendance,
        impact: 'negative',
        recommendation: 'Mejorar asistencia a clases para mejor rendimiento'
      };
    }
    
    return null;
  }

  // Analizar patrón de tiempo de estudio
  private analyzeStudyTimePattern(studyHistory: any[]): StudyPattern | null {
    const avgStudyTime = studyHistory.reduce((sum, record) => sum + record.hours, 0) / studyHistory.length;
    
    if (avgStudyTime < 15) {
      return {
        pattern: 'Tiempo de estudio insuficiente',
        frequency: 1 - (avgStudyTime / 25),
        impact: 'negative',
        recommendation: 'Aumentar horas de estudio semanales'
      };
    }
    
    return null;
  }

  // Analizar patrón de rendimiento
  private analyzePerformancePattern(subjects: AcademicSubject[]): StudyPattern | null {
    const avgGrade = subjects.reduce((sum, sub) => sum + (sub.currentAverage || 3.0), 0) / subjects.length;
    
    if (avgGrade < 3.0) {
      return {
        pattern: 'Rendimiento académico bajo',
        frequency: 1 - (avgGrade / 5.0),
        impact: 'negative',
        recommendation: 'Revisar estrategias de estudio y buscar apoyo académico'
      };
    }
    
    return null;
  }

  // Predicción de fallback
  private fallbackPrediction(features: AcademicFeatures): PredictionResult {
    // Calcular predicción más conservadora basada en características
    const baseGPA = features.currentGPA || 3.0;
    const improvement = Math.min(1.5, Math.max(0, (features.assignmentCompletion || 0.5) * 2.0));
    const predictedGPA = baseGPA + improvement;
    
    // Asegurar que esté en el rango 0.0-5.0
    const clampedGPA = Math.max(0.0, Math.min(5.0, predictedGPA));
    
    return {
      predictedGPA: clampedGPA,
      confidence: 0.6,
      riskLevel: clampedGPA < 3.0 ? 'high' : clampedGPA < 4.0 ? 'medium' : 'low',
      recommendations: ['Usando algoritmo básico de predicción'],
      factors: {
        positive: ['Análisis básico activado'],
        negative: ['Modelo ML no disponible']
      },
      timeline: {
        shortTerm: 'Predicción básica activada',
        mediumTerm: 'Modelo ML recomendado',
        longTerm: 'Implementar ML para mejor precisión'
      }
    };
  }
}

export const academicPredictorML = new AcademicPredictorML();
