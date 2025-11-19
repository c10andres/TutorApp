// Servicio de gestión académica
import { 
  University, 
  Faculty, 
  AcademicProgram, 
  Professor, 
  Classroom, 
  AcademicSubject, 
  AcademicRecord, 
  Evaluation,
  Semester 
} from '../types';

// Datos mock de universidades colombianas
const COLOMBIAN_UNIVERSITIES: University[] = [
  {
    id: 'unal',
    name: 'Universidad Nacional de Colombia',
    location: 'Bogotá, Colombia',
    logo: '🏛️'
  },
  {
    id: 'uniandes',
    name: 'Universidad de los Andes',
    location: 'Bogotá, Colombia',
    logo: '🎓'
  },
  {
    id: 'javeriana',
    name: 'Pontificia Universidad Javeriana',
    location: 'Bogotá, Colombia',
    logo: '⛪'
  },
  {
    id: 'rosario',
    name: 'Universidad del Rosario',
    location: 'Bogotá, Colombia',
    logo: '🌹'
  },
  {
    id: 'udea',
    name: 'Universidad de Antioquia',
    location: 'Medellín, Colombia',
    logo: '🏔️'
  },
  {
    id: 'unicauca',
    name: 'Universidad del Cauca',
    location: 'Popayán, Colombia',
    logo: '🌋'
  },
  {
    id: 'univalle',
    name: 'Universidad del Valle',
    location: 'Cali, Colombia',
    logo: '🌴'
  },
  {
    id: 'unisabana',
    name: 'Universidad de La Sabana',
    location: 'Chía, Colombia',
    logo: '🌿'
  }
];

const FACULTIES: Faculty[] = [
  { id: 'ing', universityId: 'unal', name: 'Facultad de Ingeniería', code: 'ING' },
  { id: 'med', universityId: 'unal', name: 'Facultad de Medicina', code: 'MED' },
  { id: 'der', universityId: 'unal', name: 'Facultad de Derecho', code: 'DER' },
  { id: 'adm', universityId: 'unal', name: 'Facultad de Administración', code: 'ADM' },
  { id: 'psi', universityId: 'unal', name: 'Facultad de Psicología', code: 'PSI' },
  { id: 'art', universityId: 'unal', name: 'Facultad de Artes', code: 'ART' },
];

const ACADEMIC_PROGRAMS: AcademicProgram[] = [
  { id: 'ing-sistemas', facultyId: 'ing', name: 'Ingeniería de Sistemas', code: 'ISIST', duration: 10, degree: 'Pregrado' },
  { id: 'ing-civil', facultyId: 'ing', name: 'Ingeniería Civil', code: 'ICIVIL', duration: 10, degree: 'Pregrado' },
  { id: 'ing-industrial', facultyId: 'ing', name: 'Ingeniería Industrial', code: 'IIND', duration: 10, degree: 'Pregrado' },
  { id: 'medicina', facultyId: 'med', name: 'Medicina', code: 'MED', duration: 12, degree: 'Pregrado' },
  { id: 'derecho', facultyId: 'der', name: 'Derecho', code: 'DER', duration: 10, degree: 'Pregrado' },
  { id: 'adm-empresas', facultyId: 'adm', name: 'Administración de Empresas', code: 'ADMEMP', duration: 8, degree: 'Pregrado' },
];

const PROFESSORS: Professor[] = [
  { id: 'prof1', name: 'Dr. Carlos Martínez', email: 'carlos.martinez@email.com', office: 'Edificio 401 - 203', specialties: ['Cálculo', 'Análisis Matemático'] },
  { id: 'prof2', name: 'Dra. Ana García', email: 'ana.garcia@email.com', office: 'Edificio 301 - 105', specialties: ['Programación', 'Algoritmos'] },
  { id: 'prof3', name: 'Dr. Luis Rodríguez', email: 'luis.rodriguez@email.com', office: 'Edificio 201 - 301', specialties: ['Física', 'Mecánica'] },
  { id: 'prof4', name: 'Dra. María López', email: 'maria.lopez@email.com', office: 'Edificio 501 - 202', specialties: ['Química', 'Química Orgánica'] },
];

const CLASSROOMS: Classroom[] = [
  { id: 'aula101', code: 'Aula 101', building: 'Edificio Principal', capacity: 40, resources: ['Proyector', 'Aire Acondicionado'] },
  { id: 'lab201', code: 'Lab 201', building: 'Edificio de Laboratorios', capacity: 25, resources: ['Computadores', 'Proyector'] },
  { id: 'aula305', code: 'Aula 305', building: 'Edificio Norte', capacity: 60, resources: ['Proyector', 'Sistema de Audio'] },
];

// Mock data storage
let mockAcademicRecords: AcademicRecord[] = [];
let mockSemesters: Semester[] = [];

// Datos de ejemplo para materias que se crearán al inicializar semestres
const EXAMPLE_SUBJECTS = [
  {
    code: 'MAT101',
    name: 'Cálculo Diferencial',
    credits: 4,
    semester: 3,
    professorId: 'prof1',
    schedules: [
      { day: 'Lunes' as const, startTime: '08:00', endTime: '10:00', classroomId: 'aula101' },
      { day: 'Miércoles' as const, startTime: '08:00', endTime: '10:00', classroomId: 'aula101' },
      { day: 'Viernes' as const, startTime: '08:00', endTime: '10:00', classroomId: 'aula101' }
    ],
    evaluations: [
      {
        name: 'Primer Parcial',
        percentage: 30,
        maxGrade: 5.0,
        actualGrade: 4.2,
        date: new Date('2024-09-15'),
        description: 'Límites y derivadas'
      },
      {
        name: 'Segundo Parcial',
        percentage: 30,
        maxGrade: 5.0,
        actualGrade: 3.8,
        date: new Date('2024-10-20'),
        description: 'Aplicaciones de la derivada'
      },
      {
        name: 'Proyecto Final',
        percentage: 25,
        maxGrade: 5.0,
        description: 'Proyecto de aplicación matemática'
      },
      {
        name: 'Participación',
        percentage: 15,
        maxGrade: 5.0,
        actualGrade: 4.5,
        description: 'Participación en clase y tareas'
      }
    ],
    minPassingGrade: 3.0,
    status: 'En Curso' as const,
    observations: 'Clase muy exigente pero excelente profesor'
  },
  {
    code: 'PROG102',
    name: 'Programación Orientada a Objetos',
    credits: 3,
    semester: 3,
    professorId: 'prof2',
    schedules: [
      { day: 'Martes' as const, startTime: '14:00', endTime: '16:00', classroomId: 'lab201' },
      { day: 'Jueves' as const, startTime: '14:00', endTime: '16:00', classroomId: 'lab201' }
    ],
    evaluations: [
      {
        name: 'Quiz 1',
        percentage: 15,
        maxGrade: 5.0,
        actualGrade: 4.7,
        date: new Date('2024-09-10'),
        description: 'Conceptos básicos de POO'
      },
      {
        name: 'Proyecto 1',
        percentage: 35,
        maxGrade: 5.0,
        actualGrade: 4.0,
        date: new Date('2024-10-05'),
        description: 'Sistema de gestión básico'
      },
      {
        name: 'Quiz 2',
        percentage: 15,
        maxGrade: 5.0,
        description: 'Herencia y polimorfismo'
      },
      {
        name: 'Proyecto Final',
        percentage: 35,
        maxGrade: 5.0,
        description: 'Aplicación completa con base de datos'
      }
    ],
    minPassingGrade: 3.0,
    status: 'En Curso' as const
  }
];

class AcademicService {
  
  // Obtener universidades
  async getUniversities(): Promise<University[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return COLOMBIAN_UNIVERSITIES;
  }

  // Obtener facultades por universidad
  async getFacultiesByUniversity(universityId: string): Promise<Faculty[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return FACULTIES.filter(f => f.universityId === universityId);
  }

  // Obtener programas por facultad
  async getProgramsByFaculty(facultyId: string): Promise<AcademicProgram[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return ACADEMIC_PROGRAMS.filter(p => p.facultyId === facultyId);
  }

  // Obtener profesores
  async getProfessors(): Promise<Professor[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return PROFESSORS;
  }

  // Obtener salones
  async getClassrooms(): Promise<Classroom[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return CLASSROOMS;
  }

  // Obtener record académico del usuario
  async getAcademicRecord(userId: string): Promise<AcademicRecord | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let userRecord = mockAcademicRecords.find(record => record.userId === userId);
    
    if (!userRecord) {
      // Crear record de ejemplo para nuevos usuarios
      userRecord = {
        userId: userId,
        universityId: 'unal',
        facultyId: 'ing',
        programId: 'ing-sistemas',
        studentId: '2024' + Math.floor(Math.random() * 100000).toString().padStart(5, '0'),
        currentSemesterLevel: 3,
        cumulativeGPA: 0,
        totalCreditsCompleted: 0,
        semesters: [],
        academicPeriods: ['2023-1', '2023-2', '2024-1', '2024-2'],
        graduationProjectedDate: new Date('2027-12-15')
      };
      
      mockAcademicRecords.push(userRecord);
    }
    
    return userRecord;
  }

  // Crear/actualizar record académico
  async updateAcademicRecord(record: Partial<AcademicRecord> & { userId: string }): Promise<AcademicRecord> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const existingIndex = mockAcademicRecords.findIndex(r => r.userId === record.userId);
    
    if (existingIndex !== -1) {
      mockAcademicRecords[existingIndex] = { ...mockAcademicRecords[existingIndex], ...record };
      return mockAcademicRecords[existingIndex];
    } else {
      const newRecord: AcademicRecord = {
        universityId: '',
        facultyId: '',
        programId: '',
        studentId: '',
        currentSemesterLevel: 1,
        cumulativeGPA: 0,
        totalCreditsCompleted: 0,
        semesters: [],
        academicPeriods: [],
        ...record
      };
      mockAcademicRecords.push(newRecord);
      return newRecord;
    }
  }

  // Obtener semestres del usuario
  async getUserSemesters(userId: string): Promise<Semester[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    let userSemesters = mockSemesters.filter(semester => semester.userId === userId);
    
    if (userSemesters.length === 0) {
      // Crear semestres de ejemplo para nuevos usuarios
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      
      // Determinar período actual (1 = enero-junio, 2 = julio-diciembre)
      const currentPeriod = currentMonth < 6 ? 1 : 2;
      
      // Crear semestres: anteriores completados y actual en curso
      const semestersToCreate = [
        {
          code: `${currentYear - 1}-2`,
          name: `Segundo Semestre ${currentYear - 1}`,
          year: currentYear - 1,
          period: 2,
          isActive: false,
          status: 'Completado' as const,
          subjects: []
        },
        {
          code: `${currentYear}-1`,
          name: `Primer Semestre ${currentYear}`,
          year: currentYear,
          period: 1,
          isActive: false,
          status: 'Completado' as const,
          subjects: []
        },
        {
          code: `${currentYear}-2`,
          name: `Segundo Semestre ${currentYear}`,
          year: currentYear,
          period: 2,
          isActive: true,
          status: 'En Curso' as const,
          subjects: []
        }
      ];
      
      userSemesters = semestersToCreate.map((semesterData, index) => {
        const semester: Semester = {
          id: Date.now().toString() + index,
          userId: userId,
          ...semesterData,
          startDate: new Date(semesterData.year, (semesterData.period - 1) * 6, 1),
          endDate: new Date(semesterData.year, semesterData.period * 6 - 1, 30),
          totalCredits: 0,
          observations: '',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Si es el semestre actual, agregar materias de ejemplo
        if (semester.isActive) {
          semester.subjects = this.createExampleSubjects(userId, semester.code);
          semester.totalCredits = semester.subjects.reduce((sum, s) => sum + s.credits, 0);
          semester.semesterGPA = this.calculateSemesterGPA(semester.subjects);
        }
        
        return semester;
      });
      
      mockSemesters.push(...userSemesters);
    }
    
    return userSemesters.sort((a, b) => b.year - a.year || b.period - a.period);
  }

  // Crear materias de ejemplo para un semestre
  private createExampleSubjects(userId: string, academicPeriod: string): AcademicSubject[] {
    return EXAMPLE_SUBJECTS.map((subjectTemplate, index) => {
      const subject: AcademicSubject = {
        id: Date.now().toString() + index + Math.random().toString(36).substr(2, 5),
        userId: userId,
        ...subjectTemplate,
        academicPeriod: academicPeriod,
        evaluations: subjectTemplate.evaluations.map((evalTemplate, evalIndex) => ({
          id: Date.now().toString() + evalIndex + Math.random().toString(36).substr(2, 3),
          ...evalTemplate
        })),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Calcular estadísticas
      subject.currentAverage = this.calculateCurrentAverage(subject.evaluations);
      subject.projectedGrade = this.calculateProjectedGrade(subject.evaluations);
      subject.neededGrade = this.calculateNeededGrade(subject.evaluations, subject.minPassingGrade);
      
      return subject;
    });
  }

  // Crear nuevo semestre
  async createSemester(userId: string, semesterData: Omit<Semester, 'id' | 'userId' | 'subjects' | 'totalCredits' | 'semesterGPA' | 'createdAt' | 'updatedAt'>): Promise<Semester> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Desactivar semestre actual si se marca el nuevo como activo
    if (semesterData.isActive) {
      const userSemesters = mockSemesters.filter(s => s.userId === userId);
      userSemesters.forEach(semester => {
        semester.isActive = false;
        semester.updatedAt = new Date();
      });
    }
    
    const newSemester: Semester = {
      ...semesterData,
      id: Date.now().toString(),
      userId: userId,
      subjects: [],
      totalCredits: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockSemesters.push(newSemester);
    return newSemester;
  }

  // Actualizar semestre
  async updateSemester(semesterId: string, updates: Partial<Semester>): Promise<Semester> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const semesterIndex = mockSemesters.findIndex(s => s.id === semesterId);
    if (semesterIndex === -1) {
      throw new Error('Semestre no encontrado');
    }

    // Si se está activando este semestre, desactivar otros
    if (updates.isActive) {
      const semester = mockSemesters[semesterIndex];
      const userSemesters = mockSemesters.filter(s => s.userId === semester.userId && s.id !== semesterId);
      userSemesters.forEach(s => {
        s.isActive = false;
        s.updatedAt = new Date();
      });
    }

    const updatedSemester = {
      ...mockSemesters[semesterIndex],
      ...updates,
      updatedAt: new Date()
    };

    // Recalcular estadísticas del semestre
    updatedSemester.totalCredits = updatedSemester.subjects.reduce((sum, s) => sum + s.credits, 0);
    updatedSemester.semesterGPA = this.calculateSemesterGPA(updatedSemester.subjects);

    mockSemesters[semesterIndex] = updatedSemester;
    return updatedSemester;
  }

  // Eliminar semestre
  async deleteSemester(semesterId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const semesterIndex = mockSemesters.findIndex(s => s.id === semesterId);
    if (semesterIndex !== -1) {
      mockSemesters.splice(semesterIndex, 1);
    }
  }

  // Crear materia en un semestre específico
  async createSubject(semesterId: string, subjectData: Omit<AcademicSubject, 'id' | 'createdAt' | 'updatedAt'>): Promise<Semester> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const semesterIndex = mockSemesters.findIndex(s => s.id === semesterId);
    if (semesterIndex === -1) {
      throw new Error('Semestre no encontrado');
    }
    
    const newSubject: AcademicSubject = {
      ...subjectData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Calcular estadísticas iniciales
    newSubject.currentAverage = this.calculateCurrentAverage(newSubject.evaluations);
    newSubject.projectedGrade = this.calculateProjectedGrade(newSubject.evaluations);
    newSubject.neededGrade = this.calculateNeededGrade(newSubject.evaluations, newSubject.minPassingGrade);

    // Agregar materia al semestre
    mockSemesters[semesterIndex].subjects.push(newSubject);
    
    // Actualizar estadísticas del semestre
    return this.updateSemester(semesterId, {});
  }

  // Actualizar materia en un semestre
  async updateSubject(semesterId: string, subjectId: string, updates: Partial<AcademicSubject>): Promise<Semester> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const semesterIndex = mockSemesters.findIndex(s => s.id === semesterId);
    if (semesterIndex === -1) {
      throw new Error('Semestre no encontrado');
    }

    const subjectIndex = mockSemesters[semesterIndex].subjects.findIndex(s => s.id === subjectId);
    if (subjectIndex === -1) {
      throw new Error('Materia no encontrada');
    }

    const updatedSubject = {
      ...mockSemesters[semesterIndex].subjects[subjectIndex],
      ...updates,
      updatedAt: new Date()
    };

    // Recalcular estadísticas
    updatedSubject.currentAverage = this.calculateCurrentAverage(updatedSubject.evaluations);
    updatedSubject.projectedGrade = this.calculateProjectedGrade(updatedSubject.evaluations);
    updatedSubject.neededGrade = this.calculateNeededGrade(updatedSubject.evaluations, updatedSubject.minPassingGrade);

    mockSemesters[semesterIndex].subjects[subjectIndex] = updatedSubject;
    
    // Actualizar estadísticas del semestre
    return this.updateSemester(semesterId, {});
  }

  // Eliminar materia de un semestre
  async deleteSubject(semesterId: string, subjectId: string): Promise<Semester> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const semesterIndex = mockSemesters.findIndex(s => s.id === semesterId);
    if (semesterIndex === -1) {
      throw new Error('Semestre no encontrado');
    }

    const subjectIndex = mockSemesters[semesterIndex].subjects.findIndex(s => s.id === subjectId);
    if (subjectIndex !== -1) {
      mockSemesters[semesterIndex].subjects.splice(subjectIndex, 1);
    }
    
    // Actualizar estadísticas del semestre
    return this.updateSemester(semesterId, {});
  }

  // Agregar evaluación a una materia
  async addEvaluation(semesterId: string, subjectId: string, evaluation: Omit<Evaluation, 'id'>): Promise<Semester> {
    const semesterIndex = mockSemesters.findIndex(s => s.id === semesterId);
    if (semesterIndex === -1) {
      throw new Error('Semestre no encontrado');
    }

    const subjectIndex = mockSemesters[semesterIndex].subjects.findIndex(s => s.id === subjectId);
    if (subjectIndex === -1) {
      throw new Error('Materia no encontrada');
    }

    const newEvaluation: Evaluation = {
      ...evaluation,
      id: Date.now().toString()
    };

    mockSemesters[semesterIndex].subjects[subjectIndex].evaluations.push(newEvaluation);
    
    return this.updateSubject(semesterId, subjectId, { 
      evaluations: mockSemesters[semesterIndex].subjects[subjectIndex].evaluations 
    });
  }

  // Actualizar evaluación
  async updateEvaluation(semesterId: string, subjectId: string, evaluationId: string, updates: Partial<Evaluation>): Promise<Semester> {
    const semesterIndex = mockSemesters.findIndex(s => s.id === semesterId);
    if (semesterIndex === -1) {
      throw new Error('Semestre no encontrado');
    }

    const subjectIndex = mockSemesters[semesterIndex].subjects.findIndex(s => s.id === subjectId);
    if (subjectIndex === -1) {
      throw new Error('Materia no encontrada');
    }

    const evaluationIndex = mockSemesters[semesterIndex].subjects[subjectIndex].evaluations.findIndex(e => e.id === evaluationId);
    if (evaluationIndex === -1) {
      throw new Error('Evaluación no encontrada');
    }

    mockSemesters[semesterIndex].subjects[subjectIndex].evaluations[evaluationIndex] = {
      ...mockSemesters[semesterIndex].subjects[subjectIndex].evaluations[evaluationIndex],
      ...updates
    };

    return this.updateSubject(semesterId, subjectId, { 
      evaluations: mockSemesters[semesterIndex].subjects[subjectIndex].evaluations 
    });
  }

  // Calcular promedio actual
  private calculateCurrentAverage(evaluations: Evaluation[]): number {
    const completedEvaluations = evaluations.filter(e => e.actualGrade !== undefined);
    if (completedEvaluations.length === 0) return 0;

    const totalPercentage = completedEvaluations.reduce((sum, e) => sum + e.percentage, 0);
    if (totalPercentage === 0) return 0;

    const weightedSum = completedEvaluations.reduce((sum, e) => {
      return sum + (e.actualGrade! * e.percentage / 100);
    }, 0);

    return Number((weightedSum / (totalPercentage / 100)).toFixed(2));
  }

  // Calcular nota proyectada
  private calculateProjectedGrade(evaluations: Evaluation[]): number {
    const totalPercentage = evaluations.reduce((sum, e) => sum + e.percentage, 0);
    if (totalPercentage !== 100) return 0;

    const completedEvaluations = evaluations.filter(e => e.actualGrade !== undefined);
    const pendingEvaluations = evaluations.filter(e => e.actualGrade === undefined);

    let weightedSum = completedEvaluations.reduce((sum, e) => {
      return sum + (e.actualGrade! * e.percentage / 100);
    }, 0);

    // Asumir nota promedio (3.5) para evaluaciones pendientes
    weightedSum += pendingEvaluations.reduce((sum, e) => {
      return sum + (3.5 * e.percentage / 100);
    }, 0);

    return Number(weightedSum.toFixed(2));
  }

  // Calcular nota necesaria para aprobar
  private calculateNeededGrade(evaluations: Evaluation[], minPassingGrade: number): number {
    const completedEvaluations = evaluations.filter(e => e.actualGrade !== undefined);
    const pendingEvaluations = evaluations.filter(e => e.actualGrade === undefined);

    if (pendingEvaluations.length === 0) return 0;

    const completedWeight = completedEvaluations.reduce((sum, e) => {
      return sum + (e.actualGrade! * e.percentage / 100);
    }, 0);

    const pendingPercentage = pendingEvaluations.reduce((sum, e) => sum + e.percentage, 0);
    
    if (pendingPercentage === 0) return 0;

    const neededWeightedSum = minPassingGrade - completedWeight;
    const neededGrade = (neededWeightedSum * 100) / pendingPercentage;

    return Number(Math.max(0, neededGrade).toFixed(2));
  }

  // Calcular GPA de un semestre
  private calculateSemesterGPA(subjects: AcademicSubject[]): number {
    const subjectsWithGrades = subjects.filter(s => s.currentAverage && s.currentAverage > 0);
    
    if (subjectsWithGrades.length === 0) return 0;

    const totalCredits = subjectsWithGrades.reduce((sum, s) => sum + s.credits, 0);
    const weightedSum = subjectsWithGrades.reduce((sum, s) => {
      return sum + (s.currentAverage! * s.credits);
    }, 0);

    return Number((weightedSum / totalCredits).toFixed(2));
  }

  // Calcular GPA general (acumulado)
  async calculateCumulativeGPA(userId: string): Promise<number> {
    const semesters = await this.getUserSemesters(userId);
    const completedSemesters = semesters.filter(s => s.status === 'Completado');
    
    if (completedSemesters.length === 0) return 0;

    let totalCredits = 0;
    let weightedSum = 0;

    completedSemesters.forEach(semester => {
      const semesterSubjects = semester.subjects.filter(s => 
        (s.status === 'Aprobada' || s.status === 'Reprobada') && s.currentAverage
      );
      
      semesterSubjects.forEach(subject => {
        totalCredits += subject.credits;
        weightedSum += subject.currentAverage! * subject.credits;
      });
    });

    return totalCredits > 0 ? Number((weightedSum / totalCredits).toFixed(2)) : 0;
  }

  // Obtener estadísticas generales del usuario
  async getUserStats(userId: string): Promise<{
    totalSemesters: number;
    completedSemesters: number;
    totalCredits: number;
    completedCredits: number;
    cumulativeGPA: number;
    currentSemester: Semester | null;
  }> {
    const semesters = await this.getUserSemesters(userId);
    const completedSemesters = semesters.filter(s => s.status === 'Completado');
    const currentSemester = semesters.find(s => s.isActive) || null;
    
    let totalCredits = 0;
    let completedCredits = 0;
    
    semesters.forEach(semester => {
      semester.subjects.forEach(subject => {
        totalCredits += subject.credits;
        if (subject.status === 'Aprobada') {
          completedCredits += subject.credits;
        }
      });
    });

    const cumulativeGPA = await this.calculateCumulativeGPA(userId);

    return {
      totalSemesters: semesters.length,
      completedSemesters: completedSemesters.length,
      totalCredits,
      completedCredits,
      cumulativeGPA,
      currentSemester
    };
  }
}

export const academicService = new AcademicService();