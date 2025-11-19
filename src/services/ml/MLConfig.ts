// Configuración para servicios ML
export interface MLDependencies {
  tensorflow: boolean;
  mlMatrix: boolean;
  mlKmeans: boolean;
  mlRegression: boolean;
  natural: boolean;
  compromise: boolean;
  sentiment: boolean;
}

export class MLConfigManager {
  private static instance: MLConfigManager;
  private dependencies: MLDependencies = {
    tensorflow: false,
    mlMatrix: false,
    mlKmeans: false,
    mlRegression: false,
    natural: false,
    compromise: false,
    sentiment: false
  };

  private constructor() {
    this.checkDependencies();
  }

  public static getInstance(): MLConfigManager {
    if (!MLConfigManager.instance) {
      MLConfigManager.instance = new MLConfigManager();
    }
    return MLConfigManager.instance;
  }

  private checkDependencies(): void {
    // Verificar TensorFlow.js
    try {
      require('@tensorflow/tfjs');
      this.dependencies.tensorflow = true;
    } catch (e) {
      console.warn('⚠️ TensorFlow.js no disponible');
    }

    // Verificar ml-matrix
    try {
      require('ml-matrix');
      this.dependencies.mlMatrix = true;
    } catch (e) {
      console.warn('⚠️ ml-matrix no disponible');
    }

    // Verificar ml-kmeans
    try {
      require('ml-kmeans');
      this.dependencies.mlKmeans = true;
    } catch (e) {
      console.warn('⚠️ ml-kmeans no disponible');
    }

    // Verificar ml-regression
    try {
      require('ml-regression');
      this.dependencies.mlRegression = true;
    } catch (e) {
      console.warn('⚠️ ml-regression no disponible');
    }

    // Verificar natural
    try {
      require('natural');
      this.dependencies.natural = true;
    } catch (e) {
      console.warn('⚠️ natural no disponible');
    }

    // Verificar compromise
    try {
      require('compromise');
      this.dependencies.compromise = true;
    } catch (e) {
      console.warn('⚠️ compromise no disponible');
    }

    // Verificar sentiment
    try {
      require('sentiment');
      this.dependencies.sentiment = true;
    } catch (e) {
      console.warn('⚠️ sentiment no disponible');
    }
  }

  public getDependencies(): MLDependencies {
    return { ...this.dependencies };
  }

  public isMLAvailable(): boolean {
    return Object.values(this.dependencies).some(dep => dep);
  }

  public getAvailableFeatures(): string[] {
    const features: string[] = [];
    
    if (this.dependencies.tensorflow) features.push('Redes Neuronales');
    if (this.dependencies.mlMatrix) features.push('Álgebra Lineal');
    if (this.dependencies.mlKmeans) features.push('Clustering');
    if (this.dependencies.mlRegression) features.push('Regresión');
    if (this.dependencies.natural) features.push('NLP Avanzado');
    if (this.dependencies.compromise) features.push('Procesamiento de Texto');
    if (this.dependencies.sentiment) features.push('Análisis de Sentimientos');
    
    return features;
  }

  public getStatusMessage(): string {
    const available = this.getAvailableFeatures();
    
    if (available.length === 0) {
      return '⚠️ ML no disponible - usando algoritmos básicos';
    }
    
    if (available.length === Object.keys(this.dependencies).length) {
      return '✅ ML completo disponible';
    }
    
    return `🔄 ML parcial - ${available.join(', ')} disponible`;
  }
}

export const mlConfigManager = MLConfigManager.getInstance();
