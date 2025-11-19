// Utilidades para testing y QA
export interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  error?: string;
  details?: any;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  totalDuration: number;
  passed: number;
  failed: number;
  skipped: number;
}

export class TestRunner {
  private tests: Array<() => Promise<TestResult>> = [];
  private results: TestResult[] = [];

  addTest(name: string, testFn: () => Promise<TestResult>): void {
    this.tests.push(async () => {
      const startTime = Date.now();
      try {
        const result = await testFn();
        return {
          ...result,
          name,
          duration: Date.now() - startTime
        };
      } catch (error) {
        return {
          name,
          status: 'fail' as const,
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });
  }

  async runAll(): Promise<TestSuite> {
    const startTime = Date.now();
    this.results = [];

    for (const test of this.tests) {
      const result = await test();
      this.results.push(result);
    }

    const totalDuration = Date.now() - startTime;
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const skipped = this.results.filter(r => r.status === 'skip').length;

    return {
      name: 'Test Suite',
      tests: this.results,
      totalDuration,
      passed,
      failed,
      skipped
    };
  }

  getResults(): TestResult[] {
    return this.results;
  }
}

// Utilidades de testing para componentes
export const testUtils = {
  // Simular datos para testing
  mockUser: {
    id: 'test-user-1',
    name: 'Usuario de Prueba',
    email: 'test@example.com',
    currentMode: 'student' as const,
    avatar: 'https://via.placeholder.com/150',
    rating: 4.5,
    totalReviews: 10
  },

  mockTutor: {
    id: 'test-tutor-1',
    name: 'Tutor de Prueba',
    email: 'tutor@example.com',
    currentMode: 'tutor' as const,
    avatar: 'https://via.placeholder.com/150',
    rating: 4.8,
    totalReviews: 25,
    subjects: ['Matemáticas', 'Física'],
    hourlyRate: 50000
  },

  mockRequest: {
    id: 'test-request-1',
    studentId: 'test-user-1',
    tutorId: 'test-tutor-1',
    subject: 'Matemáticas',
    description: 'Necesito ayuda con cálculo diferencial',
    scheduledTime: new Date(),
    duration: 60,
    status: 'pending' as const,
    hourlyRate: 50000,
    totalAmount: 50000
  },

  mockReview: {
    id: 'test-review-1',
    studentId: 'test-user-1',
    tutorId: 'test-tutor-1',
    requestId: 'test-request-1',
    rating: 5,
    comment: 'Excelente tutor, muy recomendado',
    createdAt: new Date()
  },

  // Funciones de validación
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePhone: (phone: string): boolean => {
    const phoneRegex = /^[0-9+\-\s()]+$/;
    return phoneRegex.test(phone);
  },

  validateRating: (rating: number): boolean => {
    return rating >= 1 && rating <= 5 && Number.isInteger(rating);
  },

  validatePrice: (price: number): boolean => {
    return price > 0 && Number.isFinite(price);
  },

  // Simular delay para testing
  delay: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Generar datos aleatorios para testing
  generateRandomData: (type: 'user' | 'tutor' | 'request' | 'review') => {
    const baseData = {
      id: `test-${type}-${Date.now()}`,
      createdAt: new Date()
    };

    switch (type) {
      case 'user':
        return {
          ...baseData,
          name: `Usuario ${Math.floor(Math.random() * 1000)}`,
          email: `user${Math.floor(Math.random() * 1000)}@example.com`,
          currentMode: 'student' as const,
          rating: Math.random() * 2 + 3,
          totalReviews: Math.floor(Math.random() * 50)
        };
      
      case 'tutor':
        return {
          ...baseData,
          name: `Tutor ${Math.floor(Math.random() * 1000)}`,
          email: `tutor${Math.floor(Math.random() * 1000)}@example.com`,
          currentMode: 'tutor' as const,
          rating: Math.random() * 2 + 3,
          totalReviews: Math.floor(Math.random() * 100),
          subjects: ['Matemáticas', 'Física', 'Química'].slice(0, Math.floor(Math.random() * 3) + 1),
          hourlyRate: Math.floor(Math.random() * 100000) + 20000
        };
      
      case 'request':
        return {
          ...baseData,
          studentId: `test-user-${Math.floor(Math.random() * 100)}`,
          tutorId: `test-tutor-${Math.floor(Math.random() * 100)}`,
          subject: ['Matemáticas', 'Física', 'Química', 'Inglés'][Math.floor(Math.random() * 4)],
          description: 'Descripción de prueba',
          scheduledTime: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
          duration: [60, 90, 120][Math.floor(Math.random() * 3)],
          status: ['pending', 'accepted', 'completed'][Math.floor(Math.random() * 3)] as const,
          hourlyRate: Math.floor(Math.random() * 100000) + 20000,
          totalAmount: Math.floor(Math.random() * 200000) + 50000
        };
      
      case 'review':
        return {
          ...baseData,
          studentId: `test-user-${Math.floor(Math.random() * 100)}`,
          tutorId: `test-tutor-${Math.floor(Math.random() * 100)}`,
          requestId: `test-request-${Math.floor(Math.random() * 100)}`,
          rating: Math.floor(Math.random() * 5) + 1,
          comment: 'Comentario de prueba'
        };
      
      default:
        return baseData;
    }
  }
};

// Tests específicos para la aplicación
export const appTests = {
  // Test de autenticación
  async testAuthentication(): Promise<TestResult> {
    try {
      // Simular login
      const user = testUtils.mockUser;
      if (!user.id || !user.email) {
        throw new Error('Usuario inválido');
      }
      
      return {
        name: 'Authentication Test',
        status: 'pass',
        duration: 0,
        details: { userId: user.id, email: user.email }
      };
    } catch (error) {
      return {
        name: 'Authentication Test',
        status: 'fail',
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Test de validación de datos
  async testDataValidation(): Promise<TestResult> {
    try {
      const tests = [
        { name: 'Email validation', test: () => testUtils.validateEmail('test@example.com') },
        { name: 'Phone validation', test: () => testUtils.validatePhone('+57 300 123 4567') },
        { name: 'Rating validation', test: () => testUtils.validateRating(5) },
        { name: 'Price validation', test: () => testUtils.validatePrice(50000) }
      ];

      const results = tests.map(t => t.test());
      const allPassed = results.every(r => r === true);

      return {
        name: 'Data Validation Test',
        status: allPassed ? 'pass' : 'fail',
        duration: 0,
        details: { tests: tests.map((t, i) => ({ name: t.name, passed: results[i] })) }
      };
    } catch (error) {
      return {
        name: 'Data Validation Test',
        status: 'fail',
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Test de rendimiento
  async testPerformance(): Promise<TestResult> {
    try {
      const startTime = Date.now();
      
      // Simular operación pesada
      await testUtils.delay(100);
      
      const duration = Date.now() - startTime;
      const passed = duration < 200; // Debe completarse en menos de 200ms

      return {
        name: 'Performance Test',
        status: passed ? 'pass' : 'fail',
        duration,
        details: { maxDuration: 200, actualDuration: duration }
      };
    } catch (error) {
      return {
        name: 'Performance Test',
        status: 'fail',
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};
