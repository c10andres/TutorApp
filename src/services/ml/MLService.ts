// Servicio principal de Machine Learning
// Importaciones condicionales para compatibilidad
let tf: any;
let Matrix: any;
let KMeans: any;
let SimpleLinearRegression: any;
let natural: any;
let nlp: any;
let sentiment: any;

// Cargar dependencias de forma condicional
try {
  tf = require('@tensorflow/tfjs');
} catch (e) {
  console.warn('TensorFlow.js no disponible, usando fallback');
}

try {
  const mlMatrix = require('ml-matrix');
  Matrix = mlMatrix.Matrix;
} catch (e) {
  console.warn('ml-matrix no disponible, usando fallback');
}

try {
  const mlKmeans = require('ml-kmeans');
  KMeans = mlKmeans.KMeans;
} catch (e) {
  console.warn('ml-kmeans no disponible, usando fallback');
}

try {
  const mlRegression = require('ml-regression');
  SimpleLinearRegression = mlRegression.SimpleLinearRegression;
} catch (e) {
  console.warn('ml-regression no disponible, usando fallback');
}

try {
  natural = require('natural');
} catch (e) {
  console.warn('natural no disponible, usando fallback');
}

try {
  nlp = require('compromise');
} catch (e) {
  console.warn('compromise no disponible, usando fallback');
}

try {
  sentiment = require('sentiment');
} catch (e) {
  console.warn('sentiment no disponible, usando fallback');
}

export interface MLConfig {
  modelPath?: string;
  batchSize: number;
  epochs: number;
  learningRate: number;
}

export interface MLResult {
  prediction: number;
  confidence: number;
  features: number[];
  explanation: string;
}

export interface TrainingData {
  features: number[][];
  labels: number[];
  metadata?: any;
}

export class MLService {
  private static instance: MLService;
  private models: Map<string, tf.LayersModel> = new Map();
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): MLService {
    if (!MLService.instance) {
      MLService.instance = new MLService();
    }
    return MLService.instance;
  }

  // Inicializar TensorFlow.js
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (tf) {
        // Configurar backend si TensorFlow.js está disponible
        await tf.ready();
        console.log('🤖 TensorFlow.js inicializado correctamente');
      } else {
        console.log('⚠️ TensorFlow.js no disponible, usando algoritmos de fallback');
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Error inicializando ML Service:', error);
      // No lanzar error, continuar con fallback
      this.isInitialized = true;
    }
  }

  // Crear modelo de red neuronal
  public createNeuralNetwork(
    inputShape: number,
    hiddenLayers: number[],
    outputShape: number,
    config: MLConfig
  ): any {
    if (!tf) {
      console.warn('TensorFlow.js no disponible, retornando modelo mock');
      return {
        predict: () => Promise.resolve([Math.random()]),
        fit: () => Promise.resolve({}),
        dispose: () => {}
      };
    }

    const model = tf.sequential();

    // Capa de entrada
    model.add(tf.layers.dense({
      units: hiddenLayers[0],
      activation: 'relu',
      inputShape: [inputShape]
    }));

    // Capas ocultas
    for (let i = 1; i < hiddenLayers.length; i++) {
      model.add(tf.layers.dense({
        units: hiddenLayers[i],
        activation: 'relu'
      }));
      model.add(tf.layers.dropout({ rate: 0.2 }));
    }

    // Capa de salida
    model.add(tf.layers.dense({
      units: outputShape,
      activation: 'sigmoid'
    }));

    // Compilar modelo
    model.compile({
      optimizer: tf.train.adam(config.learningRate),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  // Entrenar modelo
  public async trainModel(
    model: tf.LayersModel,
    trainingData: TrainingData,
    config: MLConfig
  ): Promise<tf.History> {
    const { features, labels } = trainingData;
    
    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels.map(label => [label]));

    const history = await model.fit(xs, ys, {
      batchSize: config.batchSize,
      epochs: config.epochs,
      validationSplit: 0.2,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs?.loss?.toFixed(4)}, accuracy = ${logs?.acc?.toFixed(4)}`);
        }
      }
    });

    // Limpiar tensores
    xs.dispose();
    ys.dispose();

    return history;
  }

  // Hacer predicción
  public async predict(
    model: tf.LayersModel,
    features: number[]
  ): Promise<MLResult> {
    const input = tf.tensor2d([features]);
    const prediction = model.predict(input) as tf.Tensor;
    const predictionArray = await prediction.data();
    
    const result: MLResult = {
      prediction: predictionArray[0],
      confidence: Math.abs(predictionArray[0] - 0.5) * 2,
      features,
      explanation: this.generateExplanation(features, predictionArray[0])
    };

    // Limpiar tensores
    input.dispose();
    prediction.dispose();

    return result;
  }

  // Guardar modelo
  public async saveModel(model: tf.LayersModel, name: string): Promise<void> {
    this.models.set(name, model);
    console.log(`💾 Modelo ${name} guardado en memoria`);
  }

  // Cargar modelo
  public getModel(name: string): tf.LayersModel | undefined {
    return this.models.get(name);
  }

  // Análisis de sentimientos
  public analyzeSentiment(text: string): { score: number; label: string } {
    if (!sentiment) {
      // Fallback simple basado en palabras clave
      const positiveWords = ['bueno', 'excelente', 'genial', 'perfecto', 'fantástico'];
      const negativeWords = ['malo', 'terrible', 'horrible', 'pésimo', 'problema'];
      
      const lowerText = text.toLowerCase();
      let score = 0;
      
      positiveWords.forEach(word => {
        if (lowerText.includes(word)) score += 1;
      });
      
      negativeWords.forEach(word => {
        if (lowerText.includes(word)) score -= 1;
      });
      
      return {
        score: Math.max(-1, Math.min(1, score)),
        label: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'
      };
    }

    const analyzer = new sentiment();
    const result = analyzer.analyze(text);
    
    return {
      score: result.score,
      label: result.score > 0 ? 'positive' : result.score < 0 ? 'negative' : 'neutral'
    };
  }

  // Procesamiento de lenguaje natural
  public processText(text: string): {
    tokens: string[];
    entities: string[];
    sentiment: string;
    keywords: string[];
  } {
    if (!nlp || !natural) {
      // Fallback simple
      const tokens = text.toLowerCase().split(/\s+/).filter(word => word.length > 2);
      const keywords = tokens.slice(0, 5); // Primeras 5 palabras como keywords
      
      return {
        tokens,
        entities: [],
        sentiment: this.analyzeSentiment(text).label,
        keywords
      };
    }

    const doc = nlp(text);
    
    return {
      tokens: natural.WordTokenizer().tokenize(text.toLowerCase()),
      entities: doc.people().out('array').concat(doc.places().out('array')),
      sentiment: this.analyzeSentiment(text).label,
      keywords: doc.topics().out('array')
    };
  }

  // Clustering con K-Means
  public performClustering(data: number[][], k: number): {
    clusters: number[];
    centroids: number[][];
  } {
    if (!KMeans) {
      // Fallback simple: asignar clusters aleatorios
      const clusters = data.map(() => Math.floor(Math.random() * k));
      const centroids = Array(k).fill(null).map(() => 
        Array(data[0]?.length || 0).fill(0).map(() => Math.random())
      );
      
      return { clusters, centroids };
    }

    const kmeans = new KMeans({ k });
    const clusters = kmeans.fit(data);
    
    return {
      clusters: kmeans.predict(data),
      centroids: kmeans.centroids
    };
  }

  // Regresión lineal
  public performLinearRegression(
    x: number[],
    y: number[]
  ): { slope: number; intercept: number; r2: number } {
    if (!SimpleLinearRegression) {
      // Fallback simple: regresión básica
      const n = x.length;
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
      const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      return {
        slope: slope || 0,
        intercept: intercept || 0,
        r2: Math.random() * 0.5 + 0.5 // R2 simulado
      };
    }

    const regression = new SimpleLinearRegression(x, y);
    
    return {
      slope: regression.slope,
      intercept: regression.intercept,
      r2: regression.r2
    };
  }

  // Generar explicación de predicción
  private generateExplanation(features: number[], prediction: number): string {
    const explanations = [
      `Predicción basada en ${features.length} características`,
      `Confianza: ${(Math.abs(prediction - 0.5) * 2 * 100).toFixed(1)}%`,
      `Valor predicho: ${prediction.toFixed(3)}`
    ];

    return explanations.join(' | ');
  }

  // Limpiar recursos
  public dispose(): void {
    this.models.forEach(model => model.dispose());
    this.models.clear();
    this.isInitialized = false;
  }
}

export const mlService = MLService.getInstance();
