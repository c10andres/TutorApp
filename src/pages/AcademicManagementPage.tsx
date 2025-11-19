// Página de gestión académica con sistema de semestres
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Progress } from '../components/ui/progress';
import { Calendar } from '../components/ui/calendar';
import { academicService } from '../services/academic';
import { academicFirebaseService, FirebaseSemester, FirebaseSubject, FirebaseAcademicGoal } from '../services/academic-firebase';
import { formatDate, formatNumber } from '../utils/formatters';
import { getFirebaseDatabase } from '../firebase';
import { ref, get } from 'firebase/database';
import { 
  GraduationCap,
  BookOpen,
  Calendar as CalendarIcon,
  TrendingUp,
  Target,
  Clock,
  Award,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Users,
  ChevronDown,
  ChevronRight,
  FileText,
  Download,
  Upload,
  Eye,
  Star,
  Loader2,
  RefreshCw,
  Play
} from 'lucide-react';

interface AcademicManagementPageProps {
  onNavigate: (page: string, data?: any) => void;
}

// Interfaces para datos de Firebase
interface AcademicPeriod {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'completed' | 'current' | 'planned';
  credits: number;
  gpa: number | null;
  isActive?: boolean;
}

interface AcademicCut {
  id: string;
  title: string;
  percentage: number;
  grade: number | null;
  description?: string;
}

interface Subject {
  id: string;
  name: string;
  credits: number;
  grade: number | null;
  status: 'passed' | 'current' | 'pending' | 'failed';
  semesterName?: string;
  cuts: AcademicCut[];
}

interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  status: 'pending' | 'on-track' | 'completed' | 'overdue';
}

export function AcademicManagementPage({ onNavigate }: AcademicManagementPageProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddGoalDialog, setShowAddGoalDialog] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetDate: '',
    category: 'academic'
  });

  // Estados para gestión de datos de Firebase
  const [goals, setGoals] = useState<Goal[]>([]);
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentSemester, setCurrentSemester] = useState<FirebaseSemester | null>(null);
  const [newSubject, setNewSubject] = useState({ name: '', credits: 0, semesterId: '' });
  const [showAddSubjectDialog, setShowAddSubjectDialog] = useState(false);
  const [newSemester, setNewSemester] = useState({ name: '', year: new Date().getFullYear(), period: 1 });
  const [showAddSemesterDialog, setShowAddSemesterDialog] = useState(false);
  const [editingSemester, setEditingSemester] = useState<AcademicPeriod | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSemester, setDeletingSemester] = useState<AcademicPeriod | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  
  // Estados para cortes académicos
  const [showAddCutDialog, setShowAddCutDialog] = useState(false);
  const [selectedSubjectForCut, setSelectedSubjectForCut] = useState<Subject | null>(null);
  const [newCut, setNewCut] = useState({ title: '', percentage: 0, description: '' });
  const [editingCut, setEditingCut] = useState<AcademicCut | null>(null);
  const [processingCut, setProcessingCut] = useState<string | null>(null);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  
  // Estados para edición de metas
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showEditGoalDialog, setShowEditGoalDialog] = useState(false);
  const [goalProgress, setGoalProgress] = useState(0);
  const [goalStatus, setGoalStatus] = useState<'pending' | 'on-track' | 'completed' | 'overdue'>('pending');

  useEffect(() => {
    // Cargar datos académicos del usuario
    loadAcademicData();
  }, []);

  const loadAcademicData = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔍 Cargando datos académicos desde Firebase para:', user?.id);
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Cargar datos desde Firebase
      const [firebaseSemesters, firebaseGoals] = await Promise.all([
        academicFirebaseService.getUserSemesters(user.id),
        academicFirebaseService.getUserGoals(user.id)
      ]);
      
      console.log('📊 Datos cargados desde Firebase:', {
        semestersCount: firebaseSemesters.length,
        goalsCount: firebaseGoals.length,
        userId: user.id
      });

      // Procesar semestres
      if (firebaseSemesters.length > 0) {
        const processedPeriods: AcademicPeriod[] = firebaseSemesters.map(semester => ({
          id: semester.id,
          name: semester.name,
          startDate: new Date(semester.startDate),
          endDate: new Date(semester.endDate),
          status: semester.status === 'Completado' ? 'completed' : 
                  semester.status === 'En Curso' ? 'current' : 'planned',
          credits: semester.subjects.reduce((sum, sub) => sum + sub.credits, 0),
          gpa: semester.gpa || null,
          isActive: semester.isActive || false
        }));
        
        // Ordenar semestres: activo primero, luego por fecha de creación
        const sortedPeriods = processedPeriods.sort((a, b) => {
          if (a.isActive && !b.isActive) return -1;
          if (!a.isActive && b.isActive) return 1;
          return 0;
        });
        
        setPeriods(sortedPeriods);
        
        // Encontrar semestre actual - solo el primero si hay múltiples activos
        const activeSemesters = firebaseSemesters.filter(s => s.isActive);
        let activeSemester = null;
        
        if (activeSemesters.length > 1) {
          // Si hay múltiples activos, desactivar todos excepto el primero
          console.log('⚠️ Múltiples semestres activos encontrados:', activeSemesters.length);
          for (let i = 1; i < activeSemesters.length; i++) {
            await academicFirebaseService.updateSemester(activeSemesters[i].id, {
              isActive: false,
              updatedAt: new Date().toISOString()
            });
          }
          activeSemester = activeSemesters[0];
        } else if (activeSemesters.length === 1) {
          activeSemester = activeSemesters[0];
        }
        
        if (activeSemester) {
          setCurrentSemester(activeSemester);
          
          // Procesar materias del semestre actual
          const processedSubjects: Subject[] = activeSemester.subjects.map(subject => {
            console.log('📚 Procesando materia:', subject.name, 'con cortes:', subject.cuts ? subject.cuts.length : 0);
            if (subject.cuts && subject.cuts.length > 0) {
              console.log('✂️ Cortes de la materia', subject.name, ':', subject.cuts.map(cut => cut.title));
            }
            
            return {
              id: subject.id,
              name: subject.name,
              credits: subject.credits,
              grade: subject.finalGrade || null,
              status: subject.status === 'Aprobada' ? 'passed' : 
                     subject.status === 'En Curso' ? 'current' : 
                     subject.status === 'Reprobada' ? 'failed' : 'pending',
              cuts: subject.cuts || []
            };
          });
          
          setSubjects(processedSubjects);
        } else {
          // No hay semestre activo, limpiar datos
          setCurrentSemester(null);
          setSubjects([]);
          console.log('⚠️ No hay semestre activo');
        }
      } else {
        console.log('📝 No hay semestres en Firebase');
        setPeriods([]);
        setCurrentSemester(null);
        setSubjects([]);
      }
      
      // No establecer automáticamente un semestre como actual
      // El usuario debe activar manualmente el semestre que desee

      // Procesar metas
      const processedGoals: Goal[] = firebaseGoals.map(goal => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        targetDate: goal.targetDate,
        progress: goal.progress,
        status: goal.status as 'pending' | 'on-track' | 'completed' | 'overdue'
      }));
      
      setGoals(processedGoals);

      console.log('✅ Datos académicos cargados exitosamente desde Firebase');
      
      // Log detallado de cortes cargados
      const totalCuts = subjects.reduce((sum, subject) => sum + (subject.cuts ? subject.cuts.length : 0), 0);
      console.log('✂️ Total de cortes cargados en componente:', totalCuts);
      subjects.forEach(subject => {
        if (subject.cuts && subject.cuts.length > 0) {
          console.log('📚 Materia', subject.name, 'tiene', subject.cuts.length, 'cortes:', subject.cuts.map(cut => cut.title));
        } else {
          console.log('📚 Materia', subject.name, 'NO tiene cortes');
        }
      });
      
    } catch (error) {
      console.error('❌ Error cargando datos académicos:', error);
      // No mostrar error si es problema de conexión, solo log
      console.log('⚠️ Usando datos locales debido a problemas de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoal.title || !newGoal.targetDate || !user) return;

    try {
      console.log('🎯 Agregando nueva meta:', newGoal);
      
      // Crear meta en Firebase
      const firebaseGoal = await academicFirebaseService.createGoal(user.id, {
      title: newGoal.title,
      description: newGoal.description,
      targetDate: newGoal.targetDate,
      progress: 0,
        status: 'pending',
        category: newGoal.category as 'academic' | 'personal' | 'career'
      });

      // Actualizar estado local
      const goalToAdd: Goal = {
        id: firebaseGoal.id,
        title: firebaseGoal.title,
        description: firebaseGoal.description,
        targetDate: firebaseGoal.targetDate,
        progress: firebaseGoal.progress,
        status: firebaseGoal.status as 'pending' | 'on-track' | 'completed' | 'overdue'
      };
      
      setGoals(prev => [...prev, goalToAdd]);
      
      console.log('✅ Meta agregada en Firebase:', firebaseGoal.id);
      
    setNewGoal({ title: '', description: '', targetDate: '', category: 'academic' });
    setShowAddGoalDialog(false);
    } catch (error) {
      console.error('❌ Error agregando meta:', error);
      setError('Error al agregar la meta en Firebase');
    }
  };

  // Abrir diálogo de edición de meta
  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalProgress(goal.progress);
    setGoalStatus(goal.status);
    setShowEditGoalDialog(true);
  };

  // Actualizar progreso de meta
  const handleUpdateGoalProgress = async () => {
    if (!editingGoal || !user) return;

    try {
      console.log('🎯 Actualizando progreso de meta:', { 
        goalId: editingGoal.id, 
        progress: goalProgress, 
        status: goalStatus 
      });
      
      // Actualizar en Firebase
      await academicFirebaseService.updateGoal(editingGoal.id, {
        progress: goalProgress,
        status: goalStatus
      });

      // Actualizar estado local
      setGoals(prev => prev.map(goal => 
        goal.id === editingGoal.id 
          ? { ...goal, progress: goalProgress, status: goalStatus }
          : goal
      ));
      
      console.log('✅ Progreso de meta actualizado en Firebase');
      
      setShowEditGoalDialog(false);
      setEditingGoal(null);
    } catch (error) {
      console.error('❌ Error actualizando progreso de meta:', error);
      setError('Error al actualizar el progreso de la meta');
    }
  };

  // Actualizar nota de una materia
  const handleUpdateGrade = async (subjectId: string, newGrade: number) => {
    try {
      console.log('📝 Actualizando nota en Firebase:', { subjectId, newGrade });
      
      if (!currentSemester) {
        throw new Error('No hay semestre actual');
      }

      // Actualizar en Firebase
      await academicFirebaseService.updateSubject(currentSemester.id, subjectId, {
        finalGrade: newGrade,
        status: newGrade >= 3.0 ? 'Aprobada' : 'Reprobada'
      });
      
      // Actualizar estado local
      setSubjects(prev => prev.map(subject => 
        subject.id === subjectId 
          ? { ...subject, grade: newGrade, status: newGrade >= 3.0 ? 'passed' : 'failed' }
          : subject
      ));
      
      console.log('✅ Nota actualizada en Firebase');
      
    } catch (error) {
      console.error('❌ Error actualizando nota:', error);
      setError('Error al actualizar la nota en Firebase');
    }
  };

  // Agregar nueva materia
  const handleAddSubject = async (subjectData: { name: string; credits: number; semesterId: string }) => {
    try {
      console.log('➕ Agregando materia en Firebase:', subjectData);
      
      if (!subjectData.semesterId) {
        throw new Error('Debes seleccionar un semestre');
      }

      // Crear materia en Firebase
      const firebaseSubject = await academicFirebaseService.addSubjectToSemester(subjectData.semesterId, {
        name: subjectData.name,
        credits: subjectData.credits,
        status: 'En Curso'
      });
      
      // Actualizar estado local
      const newSubject: Subject = {
        id: firebaseSubject.id,
        name: firebaseSubject.name,
        credits: firebaseSubject.credits,
        grade: null,
        status: 'current',
        cuts: firebaseSubject.cuts || []
      };
      
      setSubjects(prev => [...prev, newSubject]);
      
      console.log('✅ Materia agregada en Firebase:', firebaseSubject.id);
      
      // Cerrar el diálogo actual
      setShowAddSubjectDialog(false);
      
      // Mostrar notificación de confirmación
      const addAnother = window.confirm('✅ Materia agregada exitosamente.\n\n¿Deseas agregar otra materia?');
      
      if (addAnother) {
        // Limpiar el formulario y abrir el diálogo para agregar otra materia
        setNewSubject({ name: '', credits: 0, semesterId: subjectData.semesterId });
        setShowAddSubjectDialog(true);
      }
      
    } catch (error) {
      console.error('❌ Error agregando materia:', error);
      setError('Error al agregar la materia en Firebase');
    }
  };

  // Agregar nuevo semestre
  const handleAddSemester = async (semesterData: { name: string; year: number; period: number }) => {
    try {
      console.log('➕ Creando nuevo semestre en Firebase:', semesterData);
      
      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      // Crear semestre en Firebase con los datos del usuario
      const firebaseSemester = await academicFirebaseService.createSemester(user.id, {
        name: semesterData.name,
        year: semesterData.year,
        period: semesterData.period,
        code: `${semesterData.year}-${semesterData.period}`,
        isActive: false, // No activar automáticamente
        status: 'En Curso',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString() // 120 días después
      });
      
      // Actualizar estado local
      const newPeriod: AcademicPeriod = {
        id: firebaseSemester.id,
        name: firebaseSemester.name,
        startDate: new Date(firebaseSemester.startDate),
        endDate: new Date(firebaseSemester.endDate),
        status: 'current',
        credits: 0,
        gpa: null
      };
      
      setPeriods(prev => [...prev, newPeriod]);
      // No establecer automáticamente como semestre actual
      // El usuario debe activar manualmente el semestre
      
      console.log('✅ Semestre creado en Firebase:', firebaseSemester.id);
      
    } catch (error) {
      console.error('❌ Error creando semestre:', error);
      setError('Error al crear el semestre en Firebase');
    }
  };

  // Editar semestre
  const handleEditSemester = async (semesterData: { name: string; year: number; period: number }) => {
    try {
      console.log('✏️ Editando semestre:', editingSemester?.id, semesterData);
      
      if (!editingSemester) {
        throw new Error('No hay semestre seleccionado para editar');
      }

      // Actualizar semestre en Firebase
      await academicFirebaseService.updateSemester(editingSemester.id, {
        name: semesterData.name,
        year: semesterData.year,
        period: semesterData.period,
        updatedAt: new Date().toISOString()
      });
      
      // Actualizar estado local
      setPeriods(prev => prev.map(period => 
        period.id === editingSemester.id 
          ? { ...period, name: semesterData.name }
          : period
      ));
      
      setEditingSemester(null);
      console.log('✅ Semestre editado exitosamente');
      
    } catch (error) {
      console.error('❌ Error editando semestre:', error);
      setError('Error al editar el semestre');
    }
  };

  // Editar materia
  const handleEditSubject = async (subjectData: { name: string; credits: number }) => {
    try {
      console.log('✏️ Editando materia:', editingSubject?.id, subjectData);
      
      if (!editingSubject || !currentSemester) {
        throw new Error('No hay materia o semestre seleccionado para editar');
      }

      // Actualizar materia en Firebase
      await academicFirebaseService.updateSubject(currentSemester.id, editingSubject.id, {
        name: subjectData.name,
        credits: subjectData.credits,
        updatedAt: new Date().toISOString()
      });
      
      // Actualizar estado local
      setSubjects(prev => prev.map(subject => 
        subject.id === editingSubject.id 
          ? { ...subject, name: subjectData.name, credits: subjectData.credits }
          : subject
      ));
      
      setEditingSubject(null);
      console.log('✅ Materia editada exitosamente');
      
    } catch (error) {
      console.error('❌ Error editando materia:', error);
      setError('Error al editar la materia');
    }
  };

  // Agregar corte académico
  const handleAddCut = async (cutData: { title: string; percentage: number; description: string }, subjectId?: string) => {
    try {
      setProcessingCut('adding');
      console.log('➕ Agregando corte académico:', cutData);
      
      // Usar subjectId proporcionado o selectedSubjectForCut
      const targetSubjectId = subjectId || selectedSubjectForCut?.id;
      const targetSubject = subjectId ? subjects.find(s => s.id === subjectId) : selectedSubjectForCut;
      
      console.log('📋 Materia objetivo:', targetSubject);
      console.log('📋 Semestre actual:', currentSemester);
      console.log('📋 ID de materia:', targetSubjectId);
      console.log('📋 ID de semestre:', currentSemester?.id);
      
      if (!targetSubjectId || !currentSemester) {
        console.error('❌ Error: No hay materia o semestre seleccionado');
        console.error('❌ targetSubjectId:', targetSubjectId);
        console.error('❌ currentSemester:', currentSemester);
        throw new Error('No hay materia o semestre seleccionado');
      }

      // Validar que la suma de porcentajes no exceda 100%
      const currentPercentage = targetSubject.cuts.reduce((sum, cut) => sum + cut.percentage, 0);
      if (currentPercentage + cutData.percentage > 100) {
        throw new Error(`La suma de porcentajes no puede exceder 100%. Actual: ${currentPercentage}%, Nuevo: ${cutData.percentage}%`);
      }

      console.log('💾 Llamando a addCutToSubject con:', {
        subjectId: targetSubjectId,
        cutData: cutData
      });

      // Agregar corte en Firebase
      console.log('🔄 Iniciando llamada a Firebase...');
      const newCutResult = await academicFirebaseService.addCutToSubject(targetSubjectId, cutData);
      console.log('🔄 Llamada a Firebase completada');
      
      console.log('✅ Corte agregado en Firebase:', newCutResult);
      
      // Verificar que el corte se guardó correctamente
      console.log('🔍 Verificando que el corte se guardó...');
      console.log('🔍 Buscando en ruta:', `academic/semesters/${currentSemester.id}/subjects/${targetSubjectId}/cuts/${newCutResult.id}`);
      
      // Buscar en todas las rutas posibles
      const possiblePaths = [
        `academic/semesters/${currentSemester.id}/subjects/${targetSubjectId}/cuts/${newCutResult.id}`,
        `academic/semesters/${currentSemester.id}/subjects/${targetSubjectId}/cuts`,
        `academic/semesters/${currentSemester.id}/subjects/${targetSubjectId}`
      ];
      
      for (const path of possiblePaths) {
        const verificationRef = ref(getFirebaseDatabase(), path);
        const verificationSnapshot = await get(verificationRef);
        if (verificationSnapshot.exists()) {
          console.log(`✅ Datos encontrados en ruta ${path}:`, verificationSnapshot.val());
          break;
        } else {
          console.log(`❌ No se encontraron datos en ruta ${path}`);
        }
      }
      
      // Actualizar estado local
      console.log('🔄 Actualizando estado local...');
      setSubjects(prev => {
        const updatedSubjects = prev.map(subject => 
          subject.id === targetSubjectId 
            ? { ...subject, cuts: [...subject.cuts, newCutResult] }
            : subject
        );
        console.log('🔄 Estado local actualizado:', updatedSubjects.find(s => s.id === targetSubjectId)?.cuts);
        return updatedSubjects;
      });
      
      // Actualizar editingSubject si está abierto
      if (editingSubject && editingSubject.id === targetSubjectId) {
        setEditingSubject(prev => prev ? { ...prev, cuts: [...prev.cuts, newCutResult] } : null);
      }
      
      console.log('🔄 Estado local actualizado');
      
      // Actualizar promedio de la materia en Firebase
      const updatedSubject = subjects.find(s => s.id === targetSubjectId);
      if (updatedSubject) {
        const updatedCuts = [...updatedSubject.cuts, newCutResult];
        console.log('📊 Actualizando promedio con cortes:', updatedCuts);
        await academicFirebaseService.updateSubjectAverage(targetSubjectId, updatedCuts);
      }
      
      // Recargar datos para asegurar sincronización
      console.log('🔄 Recargando datos para sincronización...');
      await loadAcademicData();
      
      setShowAddCutDialog(false);
      setSelectedSubjectForCut(null);
      setNewCut({ title: '', percentage: 0, description: '' });
      
      console.log('✅ Corte académico agregado exitosamente');
      
    } catch (error) {
      console.error('❌ Error agregando corte académico:', error);
      setError('Error al agregar el corte académico');
    } finally {
      setProcessingCut(null);
    }
  };

  // Actualizar nota de un corte
  const handleUpdateCutGrade = async (cutId: string, grade: number, subjectId?: string) => {
    try {
      console.log('📝 Actualizando nota del corte:', cutId, 'Nota:', grade);
      
      // Usar subjectId proporcionado o selectedSubjectForCut
      const targetSubjectId = subjectId || selectedSubjectForCut?.id;
      
      if (!targetSubjectId || !currentSemester) {
        throw new Error('No hay materia o semestre seleccionado');
      }

      // Validar que la nota esté en el rango correcto (0.0 a 5.0)
      if (grade < 0 || grade > 5) {
        throw new Error('La nota debe estar entre 0.0 y 5.0');
      }

      // Actualizar nota en Firebase
      await academicFirebaseService.updateCutGrade(targetSubjectId, cutId, grade);
      
      // Actualizar estado local
      setSubjects(prev => prev.map(subject => 
        subject.id === targetSubjectId 
          ? { 
              ...subject, 
              cuts: subject.cuts.map(cut => 
                cut.id === cutId ? { ...cut, grade } : cut
              )
            }
          : subject
      ));
      
      // Actualizar promedio de la materia en Firebase
      const updatedSubject = subjects.find(s => s.id === targetSubjectId);
      if (updatedSubject) {
        const updatedCuts = updatedSubject.cuts.map(cut => 
          cut.id === cutId ? { ...cut, grade } : cut
        );
        await academicFirebaseService.updateSubjectAverage(targetSubjectId, updatedCuts);
      }
      
      // Recargar datos para asegurar sincronización
      console.log('🔄 Recargando datos para sincronización...');
      await loadAcademicData();
      
      console.log('✅ Nota del corte actualizada exitosamente');
      
    } catch (error) {
      console.error('❌ Error actualizando nota del corte:', error);
      setError('Error al actualizar la nota del corte');
    }
  };

  // Eliminar corte académico
  const handleDeleteCut = async (cutId: string, subjectId?: string) => {
    try {
      console.log('🗑️ Eliminando corte académico:', cutId);
      
      // Usar subjectId proporcionado o selectedSubjectForCut
      const targetSubjectId = subjectId || selectedSubjectForCut?.id;
      
      if (!targetSubjectId || !currentSemester) {
        throw new Error('No hay materia o semestre seleccionado');
      }

      // Eliminar corte en Firebase
      await academicFirebaseService.deleteCut(targetSubjectId, cutId);
      
      // Actualizar estado local
      setSubjects(prev => prev.map(subject => 
        subject.id === targetSubjectId 
          ? { ...subject, cuts: subject.cuts.filter(cut => cut.id !== cutId) }
          : subject
      ));
      
      // Actualizar promedio de la materia en Firebase
      const updatedSubject = subjects.find(s => s.id === targetSubjectId);
      if (updatedSubject) {
        const updatedCuts = updatedSubject.cuts.filter(cut => cut.id !== cutId);
        await academicFirebaseService.updateSubjectAverage(targetSubjectId, updatedCuts);
      }
      
      // Recargar datos para asegurar sincronización
      console.log('🔄 Recargando datos para sincronización...');
      await loadAcademicData();
      
      console.log('✅ Corte académico eliminado exitosamente');
      
    } catch (error) {
      console.error('❌ Error eliminando corte académico:', error);
      setError('Error al eliminar el corte académico');
    }
  };

  // Alternar vista expandida de una materia
  const toggleSubjectExpansion = (subjectId: string) => {
    setExpandedSubjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subjectId)) {
        newSet.delete(subjectId);
      } else {
        newSet.add(subjectId);
      }
      return newSet;
    });
  };

  // Establecer semestre como activo
  const handleSetActiveSemester = async (semesterId: string) => {
    try {
      console.log('🎯 Estableciendo semestre activo:', semesterId);
      
      // Desactivar todos los semestres primero
      for (const period of periods) {
        if (period.id !== semesterId) {
          await academicFirebaseService.updateSemester(period.id, {
            isActive: false,
            updatedAt: new Date().toISOString()
          });
        }
      }
      
      // Activar el semestre seleccionado
      await academicFirebaseService.updateSemester(semesterId, {
        isActive: true,
        updatedAt: new Date().toISOString()
      });
      
      // Actualizar estado local inmediatamente
      setPeriods(prev => prev.map(period => ({
        ...period,
        isActive: period.id === semesterId
      })));
      
      // Recargar datos para obtener el semestre activo actualizado
      await loadAcademicData();
      
      console.log('✅ Semestre activo establecido:', semesterId);
      
    } catch (error) {
      console.error('❌ Error estableciendo semestre activo:', error);
      setError('Error al establecer el semestre activo');
    }
  };

  // Eliminar semestre
  const handleDeleteSemester = async (semesterId: string) => {
    try {
      console.log('🗑️ Eliminando semestre:', semesterId);
      
      // Eliminar semestre de Firebase
      await academicFirebaseService.deleteSemester(semesterId);
      
      // Actualizar estado local
      setPeriods(prev => prev.filter(period => period.id !== semesterId));
      
      // Si era el semestre actual, limpiar
      if (currentSemester?.id === semesterId) {
        setCurrentSemester(null);
        setSubjects([]);
      }
      
      console.log('✅ Semestre eliminado exitosamente');
      
    } catch (error) {
      console.error('❌ Error eliminando semestre:', error);
      setError('Error al eliminar el semestre');
    }
  };

  // Eliminar materia
  const handleDeleteSubject = async (subjectId: string) => {
    try {
      console.log('🗑️ Eliminando materia:', subjectId);
      
      if (!currentSemester) {
        throw new Error('No hay semestre actual');
      }

      // Eliminar materia de Firebase
      await academicFirebaseService.deleteSubject(currentSemester.id, subjectId);
      
      // Actualizar estado local
      setSubjects(prev => prev.filter(subject => subject.id !== subjectId));
      
      console.log('✅ Materia eliminada exitosamente');
      
    } catch (error) {
      console.error('❌ Error eliminando materia:', error);
      setError('Error al eliminar la materia');
    }
  };

  // Recargar datos académicos
  const handleRefreshData = async () => {
    try {
      setLoading(true);
      await loadAcademicData();
      console.log('🔄 Datos académicos recargados');
    } catch (error) {
      console.error('❌ Error recargando datos:', error);
      setError('Error al recargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Calcular GPA general de TODOS los semestres
  const calculateOverallGPA = () => {
    if (periods.length === 0) return 0;
    
    // Por ahora, usar el GPA del semestre activo si está disponible
    // TODO: Implementar cálculo completo de todos los semestres
    const activePeriod = periods.find(p => p.isActive);
    if (activePeriod && activePeriod.gpa && activePeriod.gpa > 0) {
      return activePeriod.gpa;
    }
    
    // Si no hay GPA del semestre activo, calcular basado en las materias actuales
    if (subjects.length === 0) return 0;
    
    const subjectsWithGrades = subjects.filter(s => {
      const currentAverage = s.cuts && s.cuts.length > 0 ? 
        academicFirebaseService.calculateSubjectAverage(s.cuts) : null;
      return (currentAverage !== null && currentAverage > 0) || (s.grade !== null && s.grade > 0);
    });
    
    if (subjectsWithGrades.length === 0) return 0;
    
    const totalCredits = subjectsWithGrades.reduce((sum, s) => sum + s.credits, 0);
    const weightedSum = subjectsWithGrades.reduce((sum, s) => {
      const currentAverage = s.cuts && s.cuts.length > 0 ? 
        academicFirebaseService.calculateSubjectAverage(s.cuts) : null;
      const grade = currentAverage !== null ? currentAverage : s.grade;
      return sum + (grade! * s.credits);
    }, 0);
    
    return totalCredits > 0 ? (weightedSum / totalCredits) : 0;
  };

  // Calcular créditos totales de TODOS los semestres
  const calculateTotalCredits = () => {
    return periods.reduce((sum, period) => sum + period.credits, 0);
  };

  // Calcular metas totales
  const calculateTotalGoals = () => {
    return goals.length;
  };

  const calculateGoalsProgress = () => {
    if (goals.length === 0) return 0;
    
    // Calcular el progreso promedio de todas las metas
    const totalProgress = goals.reduce((sum, goal) => {
      // Si tiene progreso numérico, usarlo
      if (goal.progress !== undefined && goal.progress !== null) {
        return sum + goal.progress;
      }
      
      // Si no tiene progreso numérico, calcular basado en el status
      switch (goal.status) {
        case 'completed':
          return sum + 100;
        case 'on-track':
          return sum + 75; // Asumir 75% si está en progreso
        case 'pending':
          return sum + 25; // Asumir 25% si está pendiente
        case 'overdue':
          return sum + 10; // Asumir 10% si está vencida
        default:
          return sum + 0;
      }
    }, 0);
    
    const averageProgress = totalProgress / goals.length;
    
    console.log(`📊 Progreso de metas: ${goals.length} metas, promedio: ${averageProgress.toFixed(1)}%`);
    
    return Math.round(averageProgress);
  };

  // Calcular GPA del semestre actual
  const calculateCurrentSemesterGPA = () => {
    if (subjects.length === 0) return 0;
    
    const subjectsWithGrades = subjects.filter(s => {
      const currentAverage = s.cuts && s.cuts.length > 0 ? 
        academicFirebaseService.calculateSubjectAverage(s.cuts) : null;
      return (currentAverage !== null && currentAverage > 0) || (s.grade !== null && s.grade > 0);
    });
    
    if (subjectsWithGrades.length === 0) return 0;
    
    const totalCredits = subjectsWithGrades.reduce((sum, s) => sum + s.credits, 0);
    const weightedSum = subjectsWithGrades.reduce((sum, s) => {
      const currentAverage = s.cuts && s.cuts.length > 0 ? 
        academicFirebaseService.calculateSubjectAverage(s.cuts) : null;
      const grade = currentAverage !== null ? currentAverage : s.grade;
      return sum + (grade! * s.credits);
    }, 0);
    
    return totalCredits > 0 ? (weightedSum / totalCredits) : 0;
  };

  const getCurrentSemesterProgress = () => {
    // Buscar el semestre activo usando isActive
    const currentPeriod = periods.find(p => p.isActive);
    if (!currentPeriod) return 0;
    
    // Si no hay materias en el semestre activo, progreso es 0
    if (subjects.length === 0) return 0;
    
    // Calcular el progreso promedio de todas las materias
    let totalProgress = 0;
    let subjectsWithProgress = 0;
    
    subjects.forEach(subject => {
      let subjectProgress = 0;
      
      // Si tiene nota final, está 100% completa
      if (subject.grade !== null && subject.grade > 0) {
        subjectProgress = 100;
      }
      // Si tiene cortes académicos, calcular el porcentaje completado
      else if (subject.cuts && subject.cuts.length > 0) {
        const cutsWithGrades = subject.cuts.filter(cut => cut.grade !== null && cut.grade > 0);
        const percentageWithGrades = cutsWithGrades.reduce((sum, cut) => sum + cut.percentage, 0);
        subjectProgress = Math.min(percentageWithGrades, 100); // Máximo 100%
      }
      
      // Solo contar materias que tienen algún progreso
      if (subjectProgress > 0) {
        totalProgress += subjectProgress;
        subjectsWithProgress++;
      }
    });
    
    // Calcular el progreso promedio del semestre
    const averageProgress = subjectsWithProgress > 0 ? (totalProgress / subjectsWithProgress) : 0;
    
    console.log(`📊 Progreso del semestre: ${subjectsWithProgress}/${subjects.length} materias con progreso, promedio: ${averageProgress.toFixed(1)}%`);
    
    return Math.round(averageProgress);
  };

  const getCurrentSemesterName = () => {
    if (currentSemester) {
      return currentSemester.name;
    }
    const currentPeriod = periods.find(p => p.status === 'current');
    return currentPeriod ? currentPeriod.name : 'Sin semestre activo';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl mb-2">Gestión Académica</h1>
          <p className="text-gray-600">Cargando información académica...</p>
        </div>
        
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl mb-2">📚 Gestión Académica</h1>
        <p className="text-gray-600">
          Administra tus semestres, calificaciones y metas académicas
        </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="size-4 mr-2" />
            )}
            Recargar Datos
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Indicador de estado de datos */}
      <Alert>
        <CheckCircle className="size-4" />
        <AlertDescription>
          {periods.length > 0 ? (
            <span className="text-green-600">
              ✅ Datos académicos cargados ({periods.length} semestres, {subjects.length} materias, {goals.length} metas)
            </span>
          ) : (
            <span className="text-blue-600">
              🔄 Cargando datos académicos...
            </span>
          )}
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="semesters">Semestres</TabsTrigger>
          <TabsTrigger value="subjects">Materias</TabsTrigger>
          <TabsTrigger value="goals">Metas</TabsTrigger>
        </TabsList>

        {/* Resumen General */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <GraduationCap className="size-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Promedio General</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {calculateOverallGPA().toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BookOpen className="size-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Créditos Totales</p>
                    <p className="text-2xl font-bold text-green-600">
                      {calculateTotalCredits()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>


            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="size-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Metas Totales</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {calculateTotalGoals()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progreso de Metas */}
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="size-5" />
                Progreso de Metas
              </CardTitle>
              <CardDescription>
                Progreso promedio de todas tus metas académicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                  <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progreso promedio</span>
                    <span>{calculateGoalsProgress()}%</span>
                  </div>
                  <Progress value={calculateGoalsProgress()} className="w-full" />
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {calculateTotalGoals()}
                    </p>
                    <p className="text-sm text-gray-600">Metas Totales</p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {goals.filter(g => g.status === 'completed').length}
                    </p>
                    <p className="text-sm text-gray-600">Completadas</p>
                  </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          {/* Progreso del Semestre Actual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="size-5" />
                Semestre Actual: {getCurrentSemesterName()}
              </CardTitle>
              <CardDescription>
                {periods.find(p => p.status === 'current') 
                  ? 'Progreso y estadísticas del semestre en curso'
                  : 'No hay semestre activo. Crea un nuevo semestre para comenzar.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progreso del semestre</span>
                  <span>{Math.round(getCurrentSemesterProgress())}%</span>
                </div>
                <Progress value={getCurrentSemesterProgress()} className="w-full" />
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {calculateCurrentSemesterGPA().toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600">Promedio Semestre</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {subjects.reduce((sum, s) => sum + s.credits, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Créditos Cursando</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    {subjects.length}
                  </p>
                  <p className="text-sm text-gray-600">Materias Activas</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(getCurrentSemesterProgress())}%
                  </p>
                  <p className="text-sm text-gray-600">Progreso Semestre</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metas Recientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="size-5" />
                Metas Académicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{goal.title}</h4>
                      <p className="text-sm text-gray-600">{goal.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={goal.progress} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{goal.progress}%</span>
                      </div>
                    </div>
                    <Badge variant={goal.status === 'on-track' ? 'default' : 'secondary'}>
                      {goal.status === 'on-track' ? 'En progreso' : 'Pendiente'}
                    </Badge>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setActiveTab('goals')}
                >
                  Ver todas las metas
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestión de Semestres */}
        <TabsContent value="semesters" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Períodos Académicos</h3>
            <Dialog open={showAddSemesterDialog} onOpenChange={setShowAddSemesterDialog}>
              <DialogTrigger asChild>
            <Button onClick={() => setShowAddSemesterDialog(true)}>
              <Plus className="size-4 mr-2" />
              Nuevo Período
            </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Semestre</DialogTitle>
                  <DialogDescription>
                    Crea un nuevo semestre académico
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="semesterName">Nombre del semestre</Label>
                    <Input
                      id="semesterName"
                      placeholder="Ej: Segundo Semestre 2024"
                      value={newSemester.name}
                      onChange={(e) => setNewSemester(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semesterYear">Año</Label>
                    <Input
                      id="semesterYear"
                      type="number"
                      placeholder="2024"
                      value={newSemester.year}
                      onChange={(e) => setNewSemester(prev => ({ ...prev, year: parseInt(e.target.value) || 2024 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semesterPeriod">Período</Label>
                    <Select 
                      value={newSemester.period.toString()} 
                      onValueChange={(value) => setNewSemester(prev => ({ ...prev, period: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Primer Semestre (Enero-Junio)</SelectItem>
                        <SelectItem value="2">Segundo Semestre (Julio-Diciembre)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setNewSemester({ name: '', year: new Date().getFullYear(), period: 1 });
                        setShowAddSemesterDialog(false);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={() => {
                        if (newSemester.name) {
                          handleAddSemester(newSemester);
                          setNewSemester({ name: '', year: new Date().getFullYear(), period: 1 });
                          setShowAddSemesterDialog(false);
                        }
                      }}
                      disabled={!newSemester.name}
                    >
                      Crear Semestre
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {periods.map((period) => (
              <Card key={period.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <Badge 
                          variant={
                            period.isActive ? 'default' :
                            period.status === 'completed' ? 'secondary' : 'outline'
                          }
                        >
                          {period.isActive ? 'Activo' :
                           period.status === 'completed' ? 'Completado' : 'Planeado'}
                        </Badge>
                        <h4 className="font-semibold text-lg mt-1">{period.name}</h4>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-4 text-sm">
                          <span>Créditos: {period.credits}</span>
                          {period.gpa && (
                            <span>Promedio: {period.gpa.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {console.log('🔍 Debug semestre:', period.name, 'isActive:', period.isActive, 'type:', typeof period.isActive)}
                      {period.isActive === true ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="size-3 mr-1" />
                          Activo
                        </Badge>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSetActiveSemester(period.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle className="size-4" />
                          Activar
                      </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingSemester(period)}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setDeletingSemester(period)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Diálogo de Edición de Semestre */}
        {editingSemester && (
          <Dialog open={!!editingSemester} onOpenChange={() => setEditingSemester(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Semestre</DialogTitle>
                <DialogDescription>
                  Modifica los datos del semestre seleccionado
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editSemesterName">Nombre del semestre</Label>
                  <Input
                    id="editSemesterName"
                    placeholder="Ej: Segundo Semestre 2024"
                    value={editingSemester.name}
                    onChange={(e) => setEditingSemester(prev => prev ? { ...prev, name: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editSemesterYear">Año</Label>
                  <Input
                    id="editSemesterYear"
                    type="number"
                    placeholder="2024"
                    value={editingSemester.startDate.getFullYear()}
                    onChange={(e) => setEditingSemester(prev => prev ? { 
                      ...prev, 
                      startDate: new Date(parseInt(e.target.value) || 2024, prev.startDate.getMonth()),
                      endDate: new Date(parseInt(e.target.value) || 2024, prev.endDate.getMonth())
                    } : null)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingSemester(null)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => {
                      if (editingSemester) {
                        handleEditSemester({
                          name: editingSemester.name,
                          year: editingSemester.startDate.getFullYear(),
                          period: 1 // Simplificado por ahora
                        });
                      }
                    }}
                    disabled={!editingSemester?.name}
                  >
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Gestión de Materias */}
        <TabsContent value="subjects" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Materias</h3>
            <Dialog open={showAddSubjectDialog} onOpenChange={setShowAddSubjectDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => setShowAddSubjectDialog(true)}>
              <Plus className="size-4 mr-2" />
              Agregar Materia
            </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Nueva Materia</DialogTitle>
                  <DialogDescription>
                    Agrega una nueva materia al semestre actual
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subjectSemester">Semestre</Label>
                    <Select 
                      value={newSubject.semesterId || ''} 
                      onValueChange={(value) => setNewSubject(prev => ({ ...prev, semesterId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el semestre" />
                      </SelectTrigger>
                      <SelectContent>
                        {periods.map((period) => (
                          <SelectItem key={period.id} value={period.id}>
                            {period.name} {period.status === 'current' ? '(Actual)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subjectName">Nombre de la materia</Label>
                    <Input
                      id="subjectName"
                      placeholder="Ej: Cálculo I"
                      value={newSubject.name}
                      onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subjectCredits">Créditos</Label>
                    <Input
                      id="subjectCredits"
                      type="number"
                      placeholder="Ej: 4"
                      value={newSubject.credits}
                      onChange={(e) => setNewSubject(prev => ({ ...prev, credits: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {
                      setNewSubject({ name: '', credits: 0, semesterId: '' });
                      setShowAddSubjectDialog(false);
                    }}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={() => {
                        if (newSubject.name && newSubject.credits > 0 && newSubject.semesterId) {
                          handleAddSubject(newSubject);
                        }
                      }}
                      disabled={!newSubject.name || newSubject.credits <= 0 || !newSubject.semesterId}
                    >
                      Agregar Materia
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {subjects.map((subject) => (
              <Card key={subject.id} className="w-full">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {/* Información básica de la materia */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                          <div className="size-10 sm:size-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="size-5 sm:size-6 text-blue-600" />
                        </div>
                      </div>
                      
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm sm:text-base truncate">{subject.name}</h4>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-1">
                          <span>Créditos: {subject.credits}</span>
                          {subject.grade && (
                            <span>Calificación: {subject.grade.toFixed(1)}</span>
                          )}
                            {subject.semesterName && (
                              <span className="text-blue-600 font-medium truncate">
                                {subject.semesterName}
                              </span>
                          )}
                          <Badge 
                            variant={
                              subject.status === 'passed' ? 'secondary' :
                              subject.status === 'current' ? 'default' : 'outline'
                            }
                              className="text-xs"
                          >
                            {subject.status === 'passed' ? 'Aprobada' :
                             subject.status === 'current' ? 'Cursando' : 'Pendiente'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedSubjectForCut(subject);
                            setShowAddCutDialog(true);
                          }}
                          className="text-xs sm:text-sm"
                        >
                          <Plus className="size-3 sm:size-4 mr-1" />
                          <span className="hidden sm:inline">Agregar Corte</span>
                          <span className="sm:hidden">Corte</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingSubject(subject)}
                        >
                          <Edit className="size-3 sm:size-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setDeletingSubject(subject)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="size-3 sm:size-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Botón para expandir/colapsar cortes */}
                    <div className="border-t pt-4">
                      <button
                        onClick={() => toggleSubjectExpansion(subject.id)}
                        className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                    <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-gray-700">
                            Cortes Académicos ({subject.cuts?.length || 0})
                          </span>
                          {subject.cuts && subject.cuts.length > 0 && (
                            <>
                              <Badge variant="outline" className="text-xs">
                                {subject.cuts.reduce((sum, cut) => sum + cut.percentage, 0)}%
                              </Badge>
                              {subject.cuts.reduce((sum, cut) => sum + cut.percentage, 0) > 100 && (
                                <Badge variant="destructive" className="text-xs">
                                  Excede 100%
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                        {expandedSubjects.has(subject.id) ? (
                          <ChevronDown className="size-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="size-4 text-gray-500" />
                        )}
                      </button>

                      {/* Cortes expandidos */}
                      {expandedSubjects.has(subject.id) && (
                        <div className="mt-3 space-y-2">
                          {subject.cuts && subject.cuts.length > 0 ? (
                            <>
                              {subject.cuts.map((cut) => (
                                <div key={cut.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-medium text-sm sm:text-base truncate">{cut.title}</span>
                                      <Badge variant="outline" className="text-xs">{cut.percentage}%</Badge>
                                    </div>
                                    {cut.description && (
                                      <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">{cut.description}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <Input
                                      type="number"
                                      min="0"
                                      max="5"
                                      step="0.1"
                                      placeholder="0.0-5.0"
                                      value={cut.grade || ''}
                                      onChange={(e) => {
                                        const grade = parseFloat(e.target.value);
                                        if (!isNaN(grade) && grade >= 0 && grade <= 5) {
                                          handleUpdateCutGrade(cut.id, grade, subject.id);
                                        }
                                      }}
                                      className="w-20 sm:w-24 text-sm"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteCut(cut.id, subject.id)}
                                      className="p-2"
                                    >
                                      <Trash2 className="size-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              
                              {/* Promedio ponderado */}
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <span className="font-medium text-blue-800 text-sm sm:text-base">Promedio Ponderado:</span>
                                  <span className="font-bold text-blue-900 text-lg sm:text-xl">
                                    {academicFirebaseService.calculateSubjectAverage(subject.cuts).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="p-4 text-center text-gray-500">
                              <p className="text-sm">No hay cortes académicos agregados</p>
                              <p className="text-xs mt-1">Usa el botón "Agregar Corte" para comenzar</p>
                        </div>
                      )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Diálogo de Edición de Materia */}
        {editingSubject && (
          <Dialog open={!!editingSubject} onOpenChange={() => setEditingSubject(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Materia</DialogTitle>
                <DialogDescription>
                  Modifica los datos de la materia seleccionada y gestiona sus cortes académicos
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Información básica de la materia */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Información Básica</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editSubjectName">Nombre de la materia</Label>
                      <Input
                        id="editSubjectName"
                        placeholder="Ej: Cálculo I"
                        value={editingSubject.name}
                        onChange={(e) => setEditingSubject(prev => prev ? { ...prev, name: e.target.value } : null)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editSubjectCredits">Créditos</Label>
                      <Input
                        id="editSubjectCredits"
                        type="number"
                        placeholder="Ej: 4"
                        value={editingSubject.credits}
                        onChange={(e) => setEditingSubject(prev => prev ? { ...prev, credits: parseInt(e.target.value) || 0 } : null)}
                      />
                    </div>
                  </div>
                </div>


                {/* Botones de acción */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setEditingSubject(null)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => {
                      if (editingSubject) {
                        handleEditSubject({
                          name: editingSubject.name,
                          credits: editingSubject.credits
                        });
                      }
                    }}
                    disabled={!editingSubject?.name || editingSubject?.credits <= 0}
                  >
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Diálogo de Confirmación de Eliminación de Semestre */}
        {deletingSemester && (
          <Dialog open={!!deletingSemester} onOpenChange={() => setDeletingSemester(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Eliminación</DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que quieres eliminar el semestre "{deletingSemester.name}"? 
                  Esta acción no se puede deshacer y se eliminarán todas las materias asociadas.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeletingSemester(null)}>
                  Cancelar
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    if (deletingSemester) {
                      handleDeleteSemester(deletingSemester.id);
                      setDeletingSemester(null);
                    }
                  }}
                >
                  Eliminar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Diálogo de Confirmación de Eliminación de Materia */}
        {deletingSubject && (
          <Dialog open={!!deletingSubject} onOpenChange={() => setDeletingSubject(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Eliminación</DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que quieres eliminar la materia "{deletingSubject.name}"? 
                  Esta acción no se puede deshacer.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeletingSubject(null)}>
                  Cancelar
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    if (deletingSubject) {
                      handleDeleteSubject(deletingSubject.id);
                      setDeletingSubject(null);
                    }
                  }}
                >
                  Eliminar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Diálogo de Agregar Corte Académico */}
        <Dialog open={showAddCutDialog} onOpenChange={setShowAddCutDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Corte Académico</DialogTitle>
              <DialogDescription>
                Agrega un nuevo corte académico para {selectedSubjectForCut?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cutTitle">Título del Corte</Label>
                <Input
                  id="cutTitle"
                  placeholder="Ej: Primer Parcial, Quiz 1, Proyecto Final"
                  value={newCut.title}
                  onChange={(e) => setNewCut(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cutPercentage">Porcentaje (%)</Label>
                <Input
                  id="cutPercentage"
                  type="number"
                  min="0"
                  max={100 - (selectedSubjectForCut?.cuts.reduce((sum, cut) => sum + cut.percentage, 0) || 0)}
                  placeholder="Ej: 30"
                  value={newCut.percentage}
                  onChange={(e) => setNewCut(prev => ({ ...prev, percentage: parseInt(e.target.value) || 0 }))}
                />
                {selectedSubjectForCut && (
                  <p className="text-sm text-gray-600">
                    Porcentaje actual: {selectedSubjectForCut.cuts.reduce((sum, cut) => sum + cut.percentage, 0)}%
                    {selectedSubjectForCut.cuts.reduce((sum, cut) => sum + cut.percentage, 0) > 0 && (
                      <span className="text-blue-600 ml-2">
                        (Máximo: {100 - selectedSubjectForCut.cuts.reduce((sum, cut) => sum + cut.percentage, 0)}%)
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cutDescription">Descripción (Opcional)</Label>
                <Textarea
                  id="cutDescription"
                  placeholder="Descripción del corte académico"
                  value={newCut.description}
                  onChange={(e) => setNewCut(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setNewCut({ title: '', percentage: 0, description: '' });
                  setShowAddCutDialog(false);
                  setSelectedSubjectForCut(null);
                }}>
                  Cancelar
                </Button>
                <Button 
                  onClick={() => {
                    console.log('🖱️ Botón Agregar Corte presionado');
                    console.log('📋 Datos del corte:', newCut);
                    console.log('📋 Materia seleccionada:', selectedSubjectForCut);
                    
                    if (newCut.title && newCut.percentage > 0) {
                      console.log('✅ Validación pasada, llamando handleAddCut');
                      handleAddCut(newCut);
                    } else {
                      console.log('❌ Validación falló:', {
                        title: newCut.title,
                        percentage: newCut.percentage
                      });
                    }
                  }}
                  disabled={
                    !newCut.title || 
                    newCut.percentage <= 0 || 
                    (selectedSubjectForCut && 
                     selectedSubjectForCut.cuts.reduce((sum, cut) => sum + cut.percentage, 0) + newCut.percentage > 100)
                  }
                >
                  Agregar Corte
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Gestión de Metas */}
        <TabsContent value="goals" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Metas Académicas</h3>
            <Button onClick={() => setShowAddGoalDialog(true)}>
              <Plus className="size-4 mr-2" />
              Nueva Meta
            </Button>
          </div>

          <div className="grid gap-4">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{goal.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Fecha objetivo: {formatDate(new Date(goal.targetDate))}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            goal.status === 'on-track' ? 'default' :
                            goal.status === 'completed' ? 'secondary' : 'outline'
                          }
                        >
                          {goal.status === 'on-track' ? 'En progreso' :
                           goal.status === 'completed' ? 'Completada' : 'Pendiente'}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditGoal(goal)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progreso</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para agregar nueva meta */}
      <Dialog open={showAddGoalDialog} onOpenChange={setShowAddGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Meta Académica</DialogTitle>
            <DialogDescription>
              Define una nueva meta para tu desarrollo académico
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="goal-title">Título de la meta</Label>
              <Input
                id="goal-title"
                placeholder="Ej: Aprobar Cálculo III con nota superior a 4.0"
                value={newGoal.title}
                onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="goal-description">Descripción</Label>
              <Textarea
                id="goal-description"
                placeholder="Describe los pasos específicos para alcanzar esta meta..."
                value={newGoal.description}
                onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="goal-date">Fecha objetivo</Label>
              <Input
                id="goal-date"
                type="date"
                value={newGoal.targetDate}
                onChange={(e) => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="goal-category">Categoría</Label>
              <Select
                value={newGoal.category}
                onValueChange={(value) => setNewGoal(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Académica</SelectItem>
                  <SelectItem value="research">Investigación</SelectItem>
                  <SelectItem value="career">Carrera</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowAddGoalDialog(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleAddGoal} className="flex-1">
              Crear Meta
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de edición de meta */}
      <Dialog open={showEditGoalDialog} onOpenChange={setShowEditGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Progreso de Meta</DialogTitle>
            <DialogDescription>
              Actualiza el progreso y estado de tu meta académica
            </DialogDescription>
          </DialogHeader>
          
          {editingGoal && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">{editingGoal.title}</h4>
                <p className="text-sm text-gray-600">{editingGoal.description}</p>
              </div>
              
              <div>
                <Label htmlFor="goal-progress">Progreso (%)</Label>
                <Input
                  id="goal-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={goalProgress}
                  onChange={(e) => setGoalProgress(Number(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="goal-status">Estado</Label>
                <Select value={goalStatus} onValueChange={(value: any) => setGoalStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="on-track">En progreso</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                    <SelectItem value="overdue">Vencida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditGoalDialog(false)} 
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleUpdateGoalProgress} 
                  className="flex-1"
                >
                  Actualizar Progreso
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}