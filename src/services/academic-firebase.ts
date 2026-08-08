// Servicio Firebase real para gestión académica
import { getFirebaseDatabase, checkFirebaseConnection } from '../firebase.ts';
import { ref, get, set, update, remove, push } from 'firebase/database';

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
  // Schedule information from CSV
  day?: string;
  time?: string;
  building?: string;
  room?: string;
  professor?: string;
  group?: string;
  project?: string;
  faculty?: string;
  sede?: string;
  location?: string;
  // ML prediction fields
  attendanceRate?: number;
  studyHours?: number;
  assignmentCompletion?: number;
  difficulty?: number;
  timeManagement?: number;
  extracurricularActivities?: number;
  createdAt: string;
  updatedAt: string;
  scheduleBlocks?: Array<{
    day: string;
    time: string;
    building: string;
    room: string;
    sede: string;
  }>;
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

  async getUserSemesters(userId: string): Promise<FirebaseSemester[]> {
    try {
      const isConnected = await checkFirebaseConnection();
      if (!isConnected) {
        return [];
      }

      const database = getFirebaseDatabase();
      const semestersRef = ref(database, 'academic/semesters');
      const snapshot = await get(semestersRef);

      if (!snapshot.exists()) {
        return [];
      }

      const semesters: FirebaseSemester[] = [];
      snapshot.forEach((childSnapshot) => {
        const semester = childSnapshot.val();

        if (semester.userId === userId) {
          const processedSubjects = semester.subjects ? Object.keys(semester.subjects).map(subKey => {
            const subject = semester.subjects[subKey];

            const processedCuts = subject.cuts ? Object.keys(subject.cuts).map(cutKey => ({
              ...subject.cuts[cutKey],
              id: cutKey
            })) : [];

            return {
              ...subject,
              id: subKey,
              cuts: processedCuts
            };
          }) : [];

          semesters.push({
            ...semester,
            id: childSnapshot.key!,
            subjects: processedSubjects
          });
        }
      });

      semesters.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.period - a.period;
      });

      return semesters;
    } catch (error) {
      console.error('❌ Error obteniendo semestres:', error);
      throw error;
    }
  }

  async createInitialSemester(userId: string): Promise<FirebaseSemester> {
    try {
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
      return semester;
    } catch (error) {
      console.error('❌ Error creando semestre inicial:', error);
      throw error;
    }
  }

  async createSemester(userId: string, semesterData: Partial<FirebaseSemester>): Promise<FirebaseSemester> {
    try {
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
      return semester;
    } catch (error) {
      console.error('❌ Error creando semestre:', error);
      throw error;
    }
  }

  async updateSemester(semesterId: string, updates: Partial<FirebaseSemester>): Promise<void> {
    try {
      const database = getFirebaseDatabase();
      const semesterRef = ref(database, `academic/semesters/${semesterId}`);

      await update(semesterRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error actualizando semestre:', error);
      throw error;
    }
  }

  async addSubjectToSemester(semesterId: string, subjectData: Partial<FirebaseSubject>): Promise<FirebaseSubject> {
    try {
      // Build subject object only with defined values
      const subject: any = {
        name: subjectData.name || '',
        code: subjectData.code || '',
        credits: subjectData.credits || 3,
        status: subjectData.status || 'En Curso',
        cuts: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Only add optional fields if they have actual values (not undefined)
      if (subjectData.finalGrade !== undefined) subject.finalGrade = subjectData.finalGrade;
      if (subjectData.currentAverage !== undefined) subject.currentAverage = subjectData.currentAverage;
      if (subjectData.day) subject.day = subjectData.day;
      if (subjectData.time) subject.time = subjectData.time;
      if (subjectData.building) subject.building = subjectData.building;
      if (subjectData.room) subject.room = subjectData.room;
      if (subjectData.professor) subject.professor = subjectData.professor;
      if (subjectData.group) subject.group = subjectData.group;
      if (subjectData.project) subject.project = subjectData.project;
      if (subjectData.faculty) subject.faculty = subjectData.faculty;
      if (subjectData.sede) subject.sede = subjectData.sede;
      if (subjectData.attendanceRate !== undefined) subject.attendanceRate = subjectData.attendanceRate;
      if (subjectData.studyHours !== undefined) subject.studyHours = subjectData.studyHours;
      if (subjectData.assignmentCompletion !== undefined) subject.assignmentCompletion = subjectData.assignmentCompletion;
      if (subjectData.difficulty !== undefined) subject.difficulty = subjectData.difficulty;
      if (subjectData.timeManagement !== undefined) subject.timeManagement = subjectData.timeManagement;
      if (subjectData.extracurricularActivities !== undefined) subject.extracurricularActivities = subjectData.extracurricularActivities;
      if (subjectData.scheduleBlocks) subject.scheduleBlocks = subjectData.scheduleBlocks;

      const database = getFirebaseDatabase();
      const semesterRef = ref(database, `academic/semesters/${semesterId}`);
      const semesterSnapshot = await get(semesterRef);

      if (!semesterSnapshot.exists()) {
        throw new Error('Semestre no encontrado');
      }

      const subjectsRef = ref(database, `academic/semesters/${semesterId}/subjects`);
      const newSubjectRef = push(subjectsRef);
      subject.id = newSubjectRef.key!;

      await set(newSubjectRef, subject);

      await update(semesterRef, {
        updatedAt: new Date().toISOString()
      });

      return subject as FirebaseSubject;
    } catch (error) {
      console.error('❌ Error agregando materia:', error);
      throw error;
    }
  }

  async updateSubject(semesterId: string, subjectId: string, updates: Partial<FirebaseSubject>): Promise<void> {
    try {
      const database = getFirebaseDatabase();
      const subjectRef = ref(database, `academic/semesters/${semesterId}/subjects/${subjectId}`);

      await update(subjectRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      const semesterRef = ref(database, `academic/semesters/${semesterId}`);
      await update(semesterRef, {
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error actualizando materia:', error);
      throw error;
    }
  }

  async deleteSubject(semesterId: string, subjectId: string): Promise<void> {
    try {
      const database = getFirebaseDatabase();
      const subjectRef = ref(database, `academic/semesters/${semesterId}/subjects/${subjectId}`);

      await remove(subjectRef);

      const semesterRef = ref(database, `academic/semesters/${semesterId}`);
      await update(semesterRef, {
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error eliminando materia:', error);
      throw error;
    }
  }

  async deleteSemester(semesterId: string): Promise<void> {
    try {
      const database = getFirebaseDatabase();
      const semesterRef = ref(database, `academic/semesters/${semesterId}`);
      await remove(semesterRef);
    } catch (error) {
      console.error('❌ Error eliminando semestre:', error);
      throw error;
    }
  }

  async getUserGoals(userId: string): Promise<FirebaseAcademicGoal[]> {
    try {
      const isConnected = await checkFirebaseConnection();
      if (!isConnected) return [];

      const database = getFirebaseDatabase();
      const goalsRef = ref(database, 'academic/goals');
      const snapshot = await get(goalsRef);

      if (!snapshot.exists()) return [];

      const goals: FirebaseAcademicGoal[] = [];
      snapshot.forEach((childSnapshot) => {
        const goal = childSnapshot.val();
        if (goal.userId === userId) {
          goals.push({ ...goal, id: childSnapshot.key! });
        }
      });

      goals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return goals;
    } catch (error) {
      console.error('❌ Error obteniendo metas:', error);
      throw error;
    }
  }

  async createGoal(userId: string, goalData: Partial<FirebaseAcademicGoal>): Promise<FirebaseAcademicGoal> {
    try {
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
      return goal;
    } catch (error) {
      console.error('❌ Error creando meta:', error);
      throw error;
    }
  }

  async updateGoal(goalId: string, updates: Partial<FirebaseAcademicGoal>): Promise<void> {
    try {
      const database = getFirebaseDatabase();
      const goalRef = ref(database, `academic/goals/${goalId}`);

      await update(goalRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error actualizando meta:', error);
      throw error;
    }
  }

  async deleteGoal(goalId: string): Promise<void> {
    try {
      const database = getFirebaseDatabase();
      const goalRef = ref(database, `academic/goals/${goalId}`);
      await remove(goalRef);
    } catch (error) {
      console.error('❌ Error eliminando meta:', error);
      throw error;
    }
  }

  async addCutToSubject(subjectId: string, cutData: { title: string; percentage: number; description?: string }): Promise<AcademicCut> {
    try {
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
      const semestersRef = ref(database, 'academic/semesters');
      const semestersSnapshot = await get(semestersRef);

      if (!semestersSnapshot.exists()) {
        throw new Error('No se encontraron semestres');
      }

      let foundSemesterId = null;

      semestersSnapshot.forEach((semesterSnapshot) => {
        const semester = semesterSnapshot.val();
        if (semester.subjects && semester.subjects[subjectId]) {
          foundSemesterId = semesterSnapshot.key;
        }
      });

      if (!foundSemesterId) {
        throw new Error(`Materia ${subjectId} no encontrada en ningún semestre`);
      }

      const cutsRef = ref(database, `academic/semesters/${foundSemesterId}/subjects/${subjectId}/cuts`);
      const newCutRef = push(cutsRef);
      cut.id = newCutRef.key!;

      await set(newCutRef, cut);
      return cut;
    } catch (error) {
      console.error('❌ Error agregando corte académico:', error);
      throw error;
    }
  }

  async updateCutGrade(subjectId: string, cutId: string, grade: number): Promise<void> {
    try {
      const database = getFirebaseDatabase();
      const semestersRef = ref(database, 'academic/semesters');
      const semestersSnapshot = await get(semestersRef);

      if (!semestersSnapshot.exists()) {
        throw new Error('No se encontraron semestres');
      }

      let foundSemesterId = null;

      semestersSnapshot.forEach((semesterSnapshot) => {
        const semester = semesterSnapshot.val();
        if (semester.subjects && semester.subjects[subjectId]) {
          foundSemesterId = semesterSnapshot.key;
        }
      });

      if (!foundSemesterId) {
        throw new Error('Materia no encontrada en ningún semestre');
      }

      const cutRef = ref(database, `academic/semesters/${foundSemesterId}/subjects/${subjectId}/cuts/${cutId}`);

      await update(cutRef, {
        grade: grade,
        updatedAt: new Date().toISOString()
      });

      const subjectSnapshot = await get(ref(database, `academic/semesters/${foundSemesterId}/subjects/${subjectId}`));
      if (subjectSnapshot.exists()) {
        const subject = subjectSnapshot.val();
        const cuts = subject.cuts ? Object.keys(subject.cuts).map(cutKey => ({
          ...subject.cuts[cutKey],
          id: cutKey
        })) : [];
        await this.updateSubjectAverage(subjectId, cuts);
      }
    } catch (error) {
      console.error('❌ Error actualizando nota del corte:', error);
      throw error;
    }
  }

  async deleteCut(subjectId: string, cutId: string): Promise<void> {
    try {
      const database = getFirebaseDatabase();
      const semestersRef = ref(database, 'academic/semesters');
      const semestersSnapshot = await get(semestersRef);

      if (!semestersSnapshot.exists()) {
        throw new Error('No se encontraron semestres');
      }

      let foundSemesterId = null;

      semestersSnapshot.forEach((semesterSnapshot) => {
        const semester = semesterSnapshot.val();
        if (semester.subjects && semester.subjects[subjectId]) {
          foundSemesterId = semesterSnapshot.key;
        }
      });

      if (!foundSemesterId) {
        throw new Error('Materia no encontrada en ningún semestre');
      }

      const cutRef = ref(database, `academic/semesters/${foundSemesterId}/subjects/${subjectId}/cuts/${cutId}`);
      await remove(cutRef);

      const subjectSnapshot = await get(ref(database, `academic/semesters/${foundSemesterId}/subjects/${subjectId}`));
      if (subjectSnapshot.exists()) {
        const subject = subjectSnapshot.val();
        const cuts = subject.cuts ? Object.keys(subject.cuts).map(cutKey => ({
          ...subject.cuts[cutKey],
          id: cutKey
        })) : [];
        await this.updateSubjectAverage(subjectId, cuts);
      }
    } catch (error) {
      console.error('❌ Error eliminando corte académico:', error);
      throw error;
    }
  }

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

  async updateSubjectAverage(subjectId: string, cuts: AcademicCut[]): Promise<void> {
    try {
      const average = this.calculateSubjectAverage(cuts);

      const database = getFirebaseDatabase();
      const semestersRef = ref(database, 'academic/semesters');
      const semestersSnapshot = await get(semestersRef);

      if (!semestersSnapshot.exists()) {
        throw new Error('No se encontraron semestres');
      }

      let foundSemesterId = null;

      semestersSnapshot.forEach((semesterSnapshot) => {
        const semester = semesterSnapshot.val();
        if (semester.subjects && semester.subjects[subjectId]) {
          foundSemesterId = semesterSnapshot.key;
        }
      });

      if (!foundSemesterId) {
        throw new Error('Materia no encontrada en ningún semestre');
      }

      const subjectRef = ref(database, `academic/semesters/${foundSemesterId}/subjects/${subjectId}`);

      await update(subjectRef, {
        currentAverage: average,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error actualizando promedio de materia:', error);
      throw error;
    }
  }

  async calculateCumulativeGPA(userId: string): Promise<number> {
    try {
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
      return Math.round(gpa * 100) / 100;
    } catch (error) {
      console.error('❌ Error calculando GPA:', error);
      return 0;
    }
  }
}

export const academicFirebaseService = new AcademicFirebaseService();
