// Servicio Firebase real para gestión académica
import { getFirebaseDatabase, checkFirebaseConnection } from '../firebase.ts';
import { ref, get, set, update, remove, push, query, orderByChild, equalTo } from 'firebase/database';

export interface FirebaseSemester {
  id: string;
  userId: string;
  name: string;
  code: string;
  year: number;
  period: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: 'Completado' | 'En Curso' | 'Planeado';
  gpa?: number;
  subjects: FirebaseSubject[];
  createdAt: string;
  updatedAt: string;
}

export interface AcademicCut {
  id: string;
  title: string;
  percentage: number;
  grade: number | null;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirebaseSubject {
  id: string;
  name: string;
  code: string;
  credits: number;
  finalGrade?: number;
  currentAverage?: number;
  status: 'Aprobada' | 'En Curso' | 'Pendiente' | 'Reprobada';
  cuts: AcademicCut[];
  attendanceRate?: number;
  studyHours?: number;
  assignmentCompletion?: number;
  difficulty?: number;
  timeManagement?: number;
  extracurricularActivities?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FirebaseAcademicGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  status: 'pending' | 'on-track' | 'completed' | 'overdue';
  category: 'academic' | 'personal' | 'career';
  createdAt: string;
  updatedAt: string;
}

class AcademicFirebaseService {
  
  // Obtener semestres del usuario
  async getUserSemesters(userId: string): Promise<FirebaseSemester[]> {
    try {
      console.log('🔍 Obteniendo semestres de Firebase para usuario:', userId);
      
      const isConnected = await checkFirebaseConnection();
      if (!isConnected) {
        console.warn('⚠️ Firebase no conectado, retornando lista vacía');
        return [];
      }

      const database = getFirebaseDatabase();
      const semestersRef = ref(database, 'academic/semesters');
      
      // Obtener todos los semestres y filtrar localmente para evitar problemas de índices
      const snapshot = await get(semestersRef);

      if (!snapshot.exists()) {
        console.log('📝 No hay semestres para el usuario en Firebase');
        return [];
      }

      const semesters: FirebaseSemester[] = [];
      snapshot.forEach((childSnapshot) => {
        const semester = childSnapshot.val();
        console.log('📋 Procesando semestre:', childSnapshot.key, 'para usuario:', semester.userId);
        
        // Filtrar por userId localmente
        if (semester.userId === userId) {
          console.log('✅ Semestre pertenece al usuario:', childSnapshot.key);
          
          const processedSubjects = semester.subjects ? Object.keys(semester.subjects).map(subKey => {
            const subject = semester.subjects[subKey];
            console.log('📚 Procesando materia:', subKey, 'con cortes:', subject.cuts ? Object.keys(subject.cuts) : 'ninguno');
            
            const processedCuts = subject.cuts ? Object.keys(subject.cuts).map(cutKey => {
              const cut = subject.cuts[cutKey];
              console.log('✂️ Procesando corte:', cutKey, 'título:', cut.title, 'porcentaje:', cut.percentage, 'nota:', cut.grade);
              return {
                ...cut,
                id: cutKey
              };
            }) : [];
            
            console.log('📊 Cortes procesados para materia', subKey, ':', processedCuts.length);
            
            return {
              ...subject,
              id: subKey,
              cuts: processedCuts
            };
          }) : [];
          
          console.log('📚 Materias procesadas para semestre', childSnapshot.key, ':', processedSubjects.length);
          
          semesters.push({
            ...semester,
            id: childSnapshot.key!,
            subjects: processedSubjects
          });
        } else {
          console.log('❌ Semestre no pertenece al usuario:', childSnapshot.key, 'userId:', semester.userId, 'vs', userId);
        }
      });

      // Ordenar por año y período
      semesters.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.period - a.period;
      });

      console.log('✅ Semestres cargados de Firebase:', semesters.length);
      
      // Log detallado de cortes cargados
      let totalCuts = 0;
      semesters.forEach(semester => {
        if (semester.subjects) {
          semester.subjects.forEach(subject => {
            if (subject.cuts) {
              totalCuts += subject.cuts.length;
              console.log('📚 Materia', subject.name, 'tiene', subject.cuts.length, 'cortes:', subject.cuts.map(cut => cut.title));
            }
          });
        }
      });
      console.log('✂️ Total de cortes cargados desde Firebase:', totalCuts);
      
      return semesters;

    } catch (error) {
      console.error('❌ Error obteniendo semestres:', error);
      throw error;
    }
  }

  // Crear semestre inicial para nuevos usuarios
  async createInitialSemester(userId: string): Promise<FirebaseSemester> {
    try {
      console.log('📝 Creando semestre inicial para usuario:', userId);
      
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      const currentPeriod = currentMonth < 6 ? 1 : 2;
      
      const semester: FirebaseSemester = {
        id: '',
        userId,
        name: `Segundo Semestre ${currentYear}`,
        code: `${currentYear}-2`,
        year: currentYear,
        period: currentPeriod,
        startDate: currentPeriod === 1 ? `${currentYear}-02-01` : `${currentYear}-08-01`,
        endDate: currentPeriod === 1 ? `${currentYear}-06-30` : `${currentYear}-12-15`,
        isActive: true,
        status: 'En Curso',
        subjects: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const database = getFirebaseDatabase();
      const semestersRef = ref(database, 'academic/semesters');
      const newSemesterRef = push(semestersRef);
      semester.id = newSemesterRef.key!;
      
      await set(newSemesterRef, semester);
      
      console.log('✅ Semestre inicial creado:', semester.id);
      return semester;

    } catch (error) {
      console.error('❌ Error creando semestre inicial:', error);
      throw error;
    }
  }

  // Crear nuevo semestre
  async createSemester(userId: string, semesterData: Partial<FirebaseSemester>): Promise<FirebaseSemester> {
    try {
      console.log('➕ Creando nuevo semestre:', semesterData);
      
      const semester: FirebaseSemester = {
        id: '',
        userId,
        name: semesterData.name || '',
        code: semesterData.code || '',
        year: semesterData.year || new Date().getFullYear(),
        period: semesterData.period || 1,
        startDate: semesterData.startDate || new Date().toISOString(),
        endDate: semesterData.endDate || new Date().toISOString(),
        isActive: semesterData.isActive || false,
        status: semesterData.status || 'Planeado',
        subjects: semesterData.subjects || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const database = getFirebaseDatabase();
      const semestersRef = ref(database, 'academic/semesters');
      const newSemesterRef = push(semestersRef);
      semester.id = newSemesterRef.key!;
      
      await set(newSemesterRef, semester);
      
      console.log('✅ Semestre creado:', semester.id);
      return semester;

    } catch (error) {
      console.error('❌ Error creando semestre:', error);
      throw error;
    }
  }

  // Actualizar semestre
  async updateSemester(semesterId: string, updates: Partial<FirebaseSemester>): Promise<void> {
    try {
      console.log('📝 Actualizando semestre:', semesterId, updates);
      
      const database = getFirebaseDatabase();
      const semesterRef = ref(database, `academic/semesters/${semesterId}`);
      
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await update(semesterRef, updateData);
      
      console.log('✅ Semestre actualizado:', semesterId);

    } catch (error) {
      console.error('❌ Error actualizando semestre:', error);
      throw error;
    }
  }

  // Agregar materia a un semestre
  async addSubjectToSemester(semesterId: string, subjectData: Partial<FirebaseSubject>): Promise<FirebaseSubject> {
    try {
      console.log('➕ Agregando materia al semestre:', semesterId, subjectData);
      
      const subject: FirebaseSubject = {
        id: '',
        name: subjectData.name || '',
        code: subjectData.code || '',
        credits: subjectData.credits || 3,
        finalGrade: subjectData.finalGrade || null,
        currentAverage: subjectData.currentAverage || null,
        status: subjectData.status || 'En Curso',
        attendanceRate: subjectData.attendanceRate || 0.9,
        studyHours: subjectData.studyHours || 15,
        assignmentCompletion: subjectData.assignmentCompletion || 0.8,
        difficulty: subjectData.difficulty || 0.5,
        timeManagement: subjectData.timeManagement || 0.7,
        extracurricularActivities: subjectData.extracurricularActivities || 0.3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const database = getFirebaseDatabase();
      const semesterRef = ref(database, `academic/semesters/${semesterId}`);
      const semesterSnapshot = await get(semesterRef);
      
      if (!semesterSnapshot.exists()) {
        throw new Error('Semestre no encontrado');
      }

      const semester = semesterSnapshot.val();
      const subjectsRef = ref(database, `academic/semesters/${semesterId}/subjects`);
      const newSubjectRef = push(subjectsRef);
      subject.id = newSubjectRef.key!;
      
      await set(newSubjectRef, subject);
      
      // Actualizar timestamp del semestre
      await update(semesterRef, {
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Materia agregada:', subject.id);
      return subject;

    } catch (error) {
      console.error('❌ Error agregando materia:', error);
      throw error;
    }
  }

  // Actualizar materia
  async updateSubject(semesterId: string, subjectId: string, updates: Partial<FirebaseSubject>): Promise<void> {
    try {
      console.log('📝 Actualizando materia:', subjectId, updates);
      
      const database = getFirebaseDatabase();
      const subjectRef = ref(database, `academic/semesters/${semesterId}/subjects/${subjectId}`);
      
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await update(subjectRef, updateData);
      
      // Actualizar timestamp del semestre
      const semesterRef = ref(database, `academic/semesters/${semesterId}`);
      await update(semesterRef, {
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Materia actualizada:', subjectId);

    } catch (error) {
      console.error('❌ Error actualizando materia:', error);
      throw error;
    }
  }

  // Eliminar materia
  async deleteSubject(semesterId: string, subjectId: string): Promise<void> {
    try {
      console.log('🗑️ Eliminando materia:', subjectId);
      
      const database = getFirebaseDatabase();
      const subjectRef = ref(database, `academic/semesters/${semesterId}/subjects/${subjectId}`);
      
      await remove(subjectRef);
      
      // Actualizar timestamp del semestre
      const semesterRef = ref(database, `academic/semesters/${semesterId}`);
      await update(semesterRef, {
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Materia eliminada:', subjectId);

    } catch (error) {
      console.error('❌ Error eliminando materia:', error);
      throw error;
    }
  }

  // Eliminar semestre
  async deleteSemester(semesterId: string): Promise<void> {
    try {
      console.log('🗑️ Eliminando semestre:', semesterId);
      
      const database = getFirebaseDatabase();
      const semesterRef = ref(database, `academic/semesters/${semesterId}`);
      
      await remove(semesterRef);
      
      console.log('✅ Semestre eliminado:', semesterId);

    } catch (error) {
      console.error('❌ Error eliminando semestre:', error);
      throw error;
    }
  }

  // Obtener metas académicas del usuario
  async getUserGoals(userId: string): Promise<FirebaseAcademicGoal[]> {
    try {
      console.log('🎯 Obteniendo metas de Firebase para usuario:', userId);
      
      const isConnected = await checkFirebaseConnection();
      if (!isConnected) {
        console.warn('⚠️ Firebase no conectado, retornando metas de ejemplo');
        return this.createExampleGoals(userId);
      }

      const database = getFirebaseDatabase();
      const goalsRef = ref(database, 'academic/goals');
      
      // Obtener todas las metas y filtrar localmente para evitar problemas de índices
      const snapshot = await get(goalsRef);

      if (!snapshot.exists()) {
        console.log('📝 No hay metas para el usuario');
        return [];
      }

      const goals: FirebaseAcademicGoal[] = [];
      snapshot.forEach((childSnapshot) => {
        const goal = childSnapshot.val();
        // Filtrar por userId localmente
        if (goal.userId === userId) {
          goals.push({
            ...goal,
            id: childSnapshot.key!
          });
        }
      });

      // Ordenar por fecha de creación
      goals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      console.log('✅ Metas cargadas de Firebase:', goals.length);
      return goals;

    } catch (error) {
      console.error('❌ Error obteniendo metas:', error);
      throw error;
    }
  }

  // Crear nueva meta
  async createGoal(userId: string, goalData: Partial<FirebaseAcademicGoal>): Promise<FirebaseAcademicGoal> {
    try {
      console.log('🎯 Creando nueva meta:', goalData);
      
      const goal: FirebaseAcademicGoal = {
        id: '',
        userId,
        title: goalData.title || '',
        description: goalData.description || '',
        targetDate: goalData.targetDate || new Date().toISOString(),
        progress: goalData.progress || 0,
        status: goalData.status || 'pending',
        category: goalData.category || 'academic',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const database = getFirebaseDatabase();
      const goalsRef = ref(database, 'academic/goals');
      const newGoalRef = push(goalsRef);
      goal.id = newGoalRef.key!;
      
      await set(newGoalRef, goal);
      
      console.log('✅ Meta creada:', goal.id);
      return goal;

    } catch (error) {
      console.error('❌ Error creando meta:', error);
      throw error;
    }
  }

  // Actualizar meta
  async updateGoal(goalId: string, updates: Partial<FirebaseAcademicGoal>): Promise<void> {
    try {
      console.log('📝 Actualizando meta:', goalId, updates);
      
      const database = getFirebaseDatabase();
      const goalRef = ref(database, `academic/goals/${goalId}`);
      
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await update(goalRef, updateData);
      
      console.log('✅ Meta actualizada:', goalId);

    } catch (error) {
      console.error('❌ Error actualizando meta:', error);
      throw error;
    }
  }

  // Eliminar meta
  async deleteGoal(goalId: string): Promise<void> {
    try {
      console.log('🗑️ Eliminando meta:', goalId);
      
      const database = getFirebaseDatabase();
      const goalRef = ref(database, `academic/goals/${goalId}`);
      
      await remove(goalRef);
      
      console.log('✅ Meta eliminada:', goalId);

    } catch (error) {
      console.error('❌ Error eliminando meta:', error);
      throw error;
    }
  }

  // Agregar corte académico a una materia
  async addCutToSubject(subjectId: string, cutData: { title: string; percentage: number; description?: string }): Promise<AcademicCut> {
    try {
      console.log('➕ Agregando corte académico:', cutData, 'para materia:', subjectId);
      
      const cut: AcademicCut = {
        id: `cut-${Date.now()}`,
        title: cutData.title,
        percentage: cutData.percentage,
        grade: null,
        description: cutData.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const database = getFirebaseDatabase();
      
      // Necesitamos encontrar el semestre que contiene esta materia
      const semestersRef = ref(database, 'academic/semesters');
      const semestersSnapshot = await get(semestersRef);
      
      if (!semestersSnapshot.exists()) {
        console.error('❌ No se encontraron semestres en Firebase');
        throw new Error('No se encontraron semestres');
      }

      let foundSemesterId = null;
      let foundSubject = null;
      
      console.log('🔍 Buscando materia en semestres...');
      console.log('📋 Semestres disponibles:', Object.keys(semestersSnapshot.val() || {}));
      
      // Buscar el semestre que contiene esta materia
      semestersSnapshot.forEach((semesterSnapshot) => {
        const semester = semesterSnapshot.val();
        console.log('📋 Revisando semestre:', semesterSnapshot.key, 'con materias:', Object.keys(semester.subjects || {}));
        
        if (semester.subjects && semester.subjects[subjectId]) {
          foundSemesterId = semesterSnapshot.key;
          foundSubject = semester.subjects[subjectId];
          console.log('✅ Materia encontrada en semestre:', foundSemesterId);
        }
      });

      if (!foundSemesterId || !foundSubject) {
        console.error('❌ Materia no encontrada. ID buscado:', subjectId);
        console.error('❌ Semestres disponibles:', Object.keys(semestersSnapshot.val() || {}));
        
        // Mostrar todas las materias disponibles para debugging
        semestersSnapshot.forEach((semesterSnapshot) => {
          const semester = semesterSnapshot.val();
          if (semester.subjects) {
            console.error('📚 Materias en semestre', semesterSnapshot.key, ':', Object.keys(semester.subjects));
          }
        });
        
        throw new Error(`Materia ${subjectId} no encontrada en ningún semestre`);
      }

      console.log('📍 Agregando corte a semestre:', foundSemesterId, 'materia:', subjectId);

      // Agregar corte a la materia
      const cutsRef = ref(database, `academic/semesters/${foundSemesterId}/subjects/${subjectId}/cuts`);
      const newCutRef = push(cutsRef);
      cut.id = newCutRef.key!;
      
      console.log('💾 Guardando corte con ID:', cut.id);
      console.log('📍 Ruta completa:', `academic/semesters/${foundSemesterId}/subjects/${subjectId}/cuts/${cut.id}`);
      
      await set(newCutRef, cut);
      
      console.log('✅ Corte académico agregado exitosamente:', cut.id);
      return cut;

    } catch (error) {
      console.error('❌ Error agregando corte académico:', error);
      throw error;
    }
  }

  // Actualizar nota de un corte académico
  async updateCutGrade(subjectId: string, cutId: string, grade: number): Promise<void> {
    try {
      console.log('📝 Actualizando nota del corte:', cutId, 'Nota:', grade);
      
      const database = getFirebaseDatabase();
      
      // Necesitamos encontrar el semestre que contiene esta materia
      const semestersRef = ref(database, 'academic/semesters');
      const semestersSnapshot = await get(semestersRef);
      
      if (!semestersSnapshot.exists()) {
        throw new Error('No se encontraron semestres');
      }

      let foundSemesterId = null;
      
      // Buscar el semestre que contiene esta materia
      semestersSnapshot.forEach((semesterSnapshot) => {
        const semester = semesterSnapshot.val();
        if (semester.subjects && semester.subjects[subjectId]) {
          foundSemesterId = semesterSnapshot.key;
        }
      });

      if (!foundSemesterId) {
        throw new Error('Materia no encontrada en ningún semestre');
      }

      // Actualizar nota del corte
      const cutRef = ref(database, `academic/semesters/${foundSemesterId}/subjects/${subjectId}/cuts/${cutId}`);
      
      await update(cutRef, {
        grade: grade,
        updatedAt: new Date().toISOString()
      });
      
      // Actualizar promedio de la materia
      const subjectSnapshot = await get(ref(database, `academic/semesters/${foundSemesterId}/subjects/${subjectId}`));
      if (subjectSnapshot.exists()) {
        const subject = subjectSnapshot.val();
        const cuts = subject.cuts ? Object.keys(subject.cuts).map(cutKey => ({
          ...subject.cuts[cutKey],
          id: cutKey
        })) : [];
        await this.updateSubjectAverage(subjectId, cuts);
      }
      
      console.log('✅ Nota del corte actualizada:', cutId);

    } catch (error) {
      console.error('❌ Error actualizando nota del corte:', error);
      throw error;
    }
  }

  // Eliminar corte académico
  async deleteCut(subjectId: string, cutId: string): Promise<void> {
    try {
      console.log('🗑️ Eliminando corte académico:', cutId);
      
      const database = getFirebaseDatabase();
      
      // Necesitamos encontrar el semestre que contiene esta materia
      const semestersRef = ref(database, 'academic/semesters');
      const semestersSnapshot = await get(semestersRef);
      
      if (!semestersSnapshot.exists()) {
        throw new Error('No se encontraron semestres');
      }

      let foundSemesterId = null;
      
      // Buscar el semestre que contiene esta materia
      semestersSnapshot.forEach((semesterSnapshot) => {
        const semester = semesterSnapshot.val();
        if (semester.subjects && semester.subjects[subjectId]) {
          foundSemesterId = semesterSnapshot.key;
        }
      });

      if (!foundSemesterId) {
        throw new Error('Materia no encontrada en ningún semestre');
      }

      // Eliminar corte
      const cutRef = ref(database, `academic/semesters/${foundSemesterId}/subjects/${subjectId}/cuts/${cutId}`);
      
      await remove(cutRef);
      
      // Actualizar promedio de la materia
      const subjectSnapshot = await get(ref(database, `academic/semesters/${foundSemesterId}/subjects/${subjectId}`));
      if (subjectSnapshot.exists()) {
        const subject = subjectSnapshot.val();
        const cuts = subject.cuts ? Object.keys(subject.cuts).map(cutKey => ({
          ...subject.cuts[cutKey],
          id: cutKey
        })) : [];
        await this.updateSubjectAverage(subjectId, cuts);
      }
      
      console.log('✅ Corte académico eliminado:', cutId);

    } catch (error) {
      console.error('❌ Error eliminando corte académico:', error);
      throw error;
    }
  }

  // Calcular promedio ponderado de una materia basado en cortes
  calculateSubjectAverage(cuts: AcademicCut[]): number {
    if (!cuts || cuts.length === 0) return 0;
    
    let totalWeightedGrade = 0;
    let totalPercentage = 0;
    
    for (const cut of cuts) {
      if (cut.grade !== null && cut.grade !== undefined && cut.grade >= 0 && cut.grade <= 5) {
        totalWeightedGrade += cut.grade * cut.percentage;
        totalPercentage += cut.percentage;
      }
    }
    
    return totalPercentage > 0 ? totalWeightedGrade / 100 : 0;
  }

  // Actualizar promedio de una materia
  async updateSubjectAverage(subjectId: string, cuts: AcademicCut[]): Promise<void> {
    try {
      console.log('📊 Actualizando promedio de materia:', subjectId);
      
      const average = this.calculateSubjectAverage(cuts);
      
      const database = getFirebaseDatabase();
      
      // Necesitamos encontrar el semestre que contiene esta materia
      const semestersRef = ref(database, 'academic/semesters');
      const semestersSnapshot = await get(semestersRef);
      
      if (!semestersSnapshot.exists()) {
        throw new Error('No se encontraron semestres');
      }

      let foundSemesterId = null;
      
      // Buscar el semestre que contiene esta materia
      semestersSnapshot.forEach((semesterSnapshot) => {
        const semester = semesterSnapshot.val();
        if (semester.subjects && semester.subjects[subjectId]) {
          foundSemesterId = semesterSnapshot.key;
        }
      });

      if (!foundSemesterId) {
        throw new Error('Materia no encontrada en ningún semestre');
      }

      // Actualizar promedio de la materia
      const subjectRef = ref(database, `academic/semesters/${foundSemesterId}/subjects/${subjectId}`);
      
      await update(subjectRef, {
        currentAverage: average,
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Promedio de materia actualizado:', average);

    } catch (error) {
      console.error('❌ Error actualizando promedio de materia:', error);
      throw error;
    }
  }

  // Calcular GPA acumulado del usuario
  async calculateCumulativeGPA(userId: string): Promise<number> {
    try {
      console.log('📊 Calculando GPA acumulado para usuario:', userId);
      
      const semesters = await this.getUserSemesters(userId);
      let totalCredits = 0;
      let weightedSum = 0;

      for (const semester of semesters) {
        for (const subject of semester.subjects) {
          if (subject.finalGrade && subject.finalGrade > 0) {
            totalCredits += subject.credits;
            weightedSum += subject.finalGrade * subject.credits;
          }
        }
      }

      const gpa = totalCredits > 0 ? weightedSum / totalCredits : 0;
      
      console.log('✅ GPA calculado:', gpa);
      return Math.round(gpa * 100) / 100;

    } catch (error) {
      console.error('❌ Error calculando GPA:', error);
      return 0;
    }
  }
}

export const academicFirebaseService = new AcademicFirebaseService();
