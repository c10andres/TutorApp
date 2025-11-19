// Study Planner - Planificador de Estudio Inteligente con IA (VERSIÓN CORREGIDA)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Calendar, Clock, Target, Brain, CheckCircle, AlertTriangle,
  Plus, Edit, Trash2, BookOpen, Zap, Award, TrendingUp,
  User, MapPin, Star, RefreshCw, Download, Eye, Play,
  Pause, SkipForward, RotateCcw, Timer, Bell, Activity, Loader2,
  Sparkles, AlertCircle as AlertCircleIcon
} from 'lucide-react';
import { studyGoalsService, StudyGoal, StudySession, WeeklySummary } from '../services/studyGoals';
import { academicPredictorML } from '../services/ml/AcademicPredictorML';
import { academicFirebaseService } from '../services/academic-firebase';

interface StudyPlannerPageProps {
  onNavigate: (page: string, data?: any) => void;
}

const SUBJECTS = [
  'Matemáticas', 'Física', 'Química', 'Biología', 'Programación',
  'Inglés', 'Historia', 'Geografía', 'Literatura', 'Filosofía',
  'Economía', 'Psicología', 'Medicina', 'Derecho', 'Arquitectura'
];

// Función para generar sugerencias inteligentes basadas en materia y descripción
const generateSmartSuggestions = (subject: string, description: string, title: string): string[] => {
  const suggestions: string[] = [];
  
  // Análisis por materia
  const subjectSuggestions = {
    'Matemáticas': [
      'Practica problemas diariamente para reforzar conceptos',
      'Revisa la teoría antes de resolver ejercicios',
      'Usa diferentes métodos de resolución para cada problema',
      'Crea un formulario con las fórmulas más importantes'
    ],
    'Física': [
      'Visualiza los conceptos con diagramas y esquemas',
      'Practica problemas paso a paso con unidades',
      'Relaciona la teoría con fenómenos cotidianos',
      'Usa simulaciones virtuales para experimentos'
    ],
    'Química': [
      'Memoriza la tabla periódica gradualmente',
      'Practica balanceo de ecuaciones químicas',
      'Realiza experimentos virtuales o de laboratorio',
      'Crea mapas conceptuales de reacciones'
    ],
    'Biología': [
      'Crea diagramas de procesos biológicos',
      'Usa mnemotécnicas para memorizar términos',
      'Relaciona conceptos con ejemplos reales',
      'Practica con modelos 3D de estructuras'
    ],
    'Programación': [
      'Practica con proyectos pequeños y reales',
      'Revisa documentación oficial del lenguaje',
      'Participa en comunidades de desarrolladores',
      'Haz ejercicios de algoritmos y estructuras de datos'
    ],
    'Inglés': [
      'Practica conversación diaria con nativos',
      'Lee artículos y noticias en inglés',
      'Escucha podcasts y música en inglés',
      'Escribe un diario personal en inglés'
    ],
    'Historia': [
      'Crea líneas de tiempo visuales',
      'Relaciona eventos históricos con fechas',
      'Investiga causas y consecuencias de eventos',
      'Usa mapas para ubicar eventos geográficamente'
    ],
    'Geografía': [
      'Estudia con mapas interactivos',
      'Relaciona características físicas con humanas',
      'Practica ubicación de países y capitales',
      'Analiza datos demográficos y económicos'
    ],
    'Literatura': [
      'Lee las obras completas, no solo resúmenes',
      'Analiza el contexto histórico de cada obra',
      'Identifica figuras literarias y estilos',
      'Escribe ensayos comparativos entre autores'
    ],
    'Filosofía': [
      'Lee textos originales de los filósofos',
      'Debate ideas con otros estudiantes',
      'Relaciona conceptos filosóficos con la actualidad',
      'Crea mapas conceptuales de corrientes filosóficas'
    ],
    'Economía': [
      'Analiza noticias económicas actuales',
      'Practica con ejercicios de oferta y demanda',
      'Estudia casos reales de empresas',
      'Relaciona teoría con políticas económicas'
    ],
    'Psicología': [
      'Estudia casos clínicos reales',
      'Relaciona teorías con experiencias personales',
      'Practica técnicas de observación',
      'Analiza diferentes enfoques psicológicos'
    ],
    'Medicina': [
      'Usa atlas anatómicos interactivos',
      'Practica con casos clínicos',
      'Memoriza terminología médica sistemáticamente',
      'Relaciona síntomas con diagnósticos'
    ],
    'Derecho': [
      'Estudia casos jurídicos reales',
      'Memoriza artículos de leyes importantes',
      'Practica redacción de documentos legales',
      'Analiza jurisprudencia relevante'
    ],
    'Arquitectura': [
      'Practica dibujo técnico regularmente',
      'Estudia obras de arquitectos famosos',
      'Usa software de diseño arquitectónico',
      'Analiza espacios y funcionalidad'
    ]
  };

  // Obtener sugerencias base por materia
  const baseSuggestions = subjectSuggestions[subject as keyof typeof subjectSuggestions] || subjectSuggestions['Matemáticas'];
  suggestions.push(...baseSuggestions.slice(0, 2)); // Tomar 2 sugerencias base

  // Análisis de palabras clave en la descripción
  const descriptionLower = description.toLowerCase();
  const titleLower = title.toLowerCase();

  // Sugerencias basadas en palabras clave
  if (descriptionLower.includes('examen') || titleLower.includes('examen')) {
    suggestions.push('Crea un plan de repaso estructurado por temas');
    suggestions.push('Practica con exámenes de años anteriores');
  }

  if (descriptionLower.includes('proyecto') || titleLower.includes('proyecto')) {
    suggestions.push('Divide el proyecto en fases con fechas específicas');
    suggestions.push('Establece hitos de revisión semanal');
  }

  if (descriptionLower.includes('investigación') || titleLower.includes('investigación')) {
    suggestions.push('Organiza tus fuentes con un gestor bibliográfico');
    suggestions.push('Crea un esquema antes de escribir');
  }

  if (descriptionLower.includes('práctica') || descriptionLower.includes('practicar')) {
    suggestions.push('Establece sesiones de práctica diaria');
    suggestions.push('Registra tu progreso para ver mejoras');
  }

  if (descriptionLower.includes('memorizar') || descriptionLower.includes('memoria')) {
    suggestions.push('Usa técnicas de repaso espaciado');
    suggestions.push('Crea tarjetas de estudio (flashcards)');
  }

  if (descriptionLower.includes('comprensión') || descriptionLower.includes('entender')) {
    suggestions.push('Explica los conceptos en tus propias palabras');
    suggestions.push('Busca analogías y ejemplos cotidianos');
  }

  // Sugerencias basadas en tiempo estimado (si se puede inferir)
  if (descriptionLower.includes('intensivo') || descriptionLower.includes('rápido')) {
    suggestions.push('Establece sesiones de estudio más largas');
    suggestions.push('Prioriza los temas más importantes');
  }

  if (descriptionLower.includes('gradual') || descriptionLower.includes('lento')) {
    suggestions.push('Establece un ritmo de estudio constante');
    suggestions.push('Revisa regularmente lo ya aprendido');
  }

  // Eliminar duplicados y limitar a 4 sugerencias
  const uniqueSuggestions = [...new Set(suggestions)];
  return uniqueSuggestions.slice(0, 4);
};

export function StudyPlannerPage({ onNavigate }: StudyPlannerPageProps) {
  const { user } = useAuth();
  
  // Estados principales
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [accumulatedTime, setAccumulatedTime] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(true);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isEditGoalOpen, setIsEditGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<StudyGoal | null>(null);
  const [isUpdatingGoal, setIsUpdatingGoal] = useState(false);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);
  const [tempTimerProgress, setTempTimerProgress] = useState<{[key: string]: {progress: number, completedHours: number, status: string}}>({});
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [isAcceptingRecommendations, setIsAcceptingRecommendations] = useState(false);

  const [newGoal, setNewGoal] = useState({
    title: '',
    subject: '',
    description: '',
    targetDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    estimatedHours: 10
  });

  // UN SOLO useEffect para cargar datos cuando el usuario cambia
  useEffect(() => {
    if (user && user.id) {
      loadStudyData();
      loadAiRecommendations();
    } else {
      setGoals([]);
      setSessions([]);
      setWeeklySummary(null);
      setAiRecommendations([]);
    }
  }, [user]);

  // useEffect para el timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
        updateProgressInRealTime();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer, timerSeconds]);

  const loadStudyData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const [firebaseGoals, firebaseSessions] = await Promise.all([
        studyGoalsService.getGoals(user.id),
        studyGoalsService.getSessions(user.id)
      ]);
      
      setGoals(firebaseGoals);
      setSessions(firebaseSessions);
      
    } catch (error) {
      console.error('Error loading study data:', error);
      setGoals([]);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAiRecommendations = async () => {
    if (!user?.id) return;

    try {
      // Cargar datos académicos del usuario desde Firebase
      const firebaseSemesters = await academicFirebaseService.getUserSemesters(user.id);
      
      if (!firebaseSemesters || firebaseSemesters.length === 0) {
        setAiRecommendations([]);
        return;
      }

      const activeSemester = firebaseSemesters.find((s: any) => s.isActive);
      if (!activeSemester || !activeSemester.subjects || activeSemester.subjects.length === 0) {
        setAiRecommendations([]);
        return;
      }

      // Analizar materias en riesgo
      const recommendations: string[] = [];
      const highRiskSubjects: string[] = [];
      const mediumRiskSubjects: string[] = [];

      for (const subject of activeSemester.subjects) {
        const currentGrade = calculateRealAverage(subject);
        
        if (currentGrade < 2.0) {
          highRiskSubjects.push(subject.name);
        } else if (currentGrade < 3.0) {
          mediumRiskSubjects.push(subject.name);
        }
      }

      // Generar recomendaciones basadas en análisis de riesgo con tiempos específicos
      // NOTA: Las recomendaciones DEBEN coincidir exactamente con los objetivos creados
      if (highRiskSubjects.length > 0) {
        recommendations.push(`🚨 ACCIÓN URGENTE: ${highRiskSubjects.join(', ')} están en RIESGO CRÍTICO`);
        recommendations.push(`📚 Crear plan de recuperación intensivo para: ${highRiskSubjects.join(', ')}`);
        recommendations.push(`⏰ Estudiar **20 horas** en total para materias en riesgo crítico (4 semanas, 5h/semana)`);
        recommendations.push(`👨‍🏫 Solicitar tutorías especializadas para ${highRiskSubjects[0]}`);
      }

      if (mediumRiskSubjects.length > 0) {
        recommendations.push(`⚠️ MEJORA NECESARIA: ${mediumRiskSubjects.join(', ')} requieren atención`);
        recommendations.push(`📖 Estudiar **15 horas** en total para estas materias (3 semanas, 5h/semana)`);
        recommendations.push(`🎯 Establecer metas semanales específicas de estudio`);
      }

      if (recommendations.length === 0) {
        recommendations.push('✅ Rendimiento académico estable');
        recommendations.push('📊 Continuar con estrategias de estudio actuales');
        recommendations.push('🎯 Considerar metas de mejora adicional con **10 horas**/semana');
      }

      setAiRecommendations(recommendations);
      console.log('✅ Recomendaciones del predictor cargadas:', recommendations.length);
    } catch (error) {
      console.error('Error cargando recomendaciones del predictor:', error);
      setAiRecommendations([]);
    }
  };

  const calculateRealAverage = (subject: any): number => {
    // CASO 1: Tiene cortes - calcular promedio acumulado
    if (subject.cuts && subject.cuts.length > 0) {
      let accumulatedPoints = 0;
      let totalPercentage = 0;
      
      for (const cut of subject.cuts) {
        if (cut.grade > 0 && cut.percentage > 0) {
          const cutPoints = (cut.grade / 5.0) * cut.percentage;
          accumulatedPoints += cutPoints;
          totalPercentage += cut.percentage;
        }
      }
      
      if (totalPercentage > 0) {
        const averagePercentage = (accumulatedPoints / totalPercentage) * 100;
        return (averagePercentage / 100) * 5;
      }
      return accumulatedPoints * 5;
    }
    
    // CASO 2: Sin cortes pero tiene currentAverage o finalGrade
    const rawGrade = subject.currentAverage || subject.finalGrade || 0;
    
    // CASO 3: Si el valor está en escala 0-100, convertirlo a 0-5
    if (rawGrade > 5) {
      return (rawGrade / 100) * 5;
    }
    
    return rawGrade;
  };

  const getWeekStart = (date: Date): string => {
    const weekStart = new Date(date);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para lunes como inicio de semana
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart.toISOString().split('T')[0];
  };

  const updateProgressInRealTime = () => {
    if (activeTimer && timerSeconds > 0) {
      const goal = goals.find(g => g.id === activeTimer);
      if (goal) {
        // Calcular tiempo total acumulado (tiempo previo + tiempo actual)
        const previousTime = accumulatedTime[activeTimer] || 0;
        const totalTimeSeconds = previousTime + timerSeconds;
        const totalTimeHours = totalTimeSeconds / 3600; // Convertir segundos a horas
        
        // Calcular progreso basado en tiempo acumulado total
        const newProgress = Math.min(100, (totalTimeHours / goal.estimatedHours) * 100);
        const completedHours = Math.min(totalTimeHours, goal.estimatedHours);
        
        // Solo actualizar estado temporal para visualización
        setTempTimerProgress(prev => ({
          ...prev,
          [activeTimer]: {
            progress: Math.round(newProgress),
            completedHours: Math.round(completedHours * 100) / 100,
            status: newProgress >= 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'not_started'
          }
        }));
      }
    }
  };

  const getGoalProgress = (goal: StudyGoal) => {
    const tempProgress = tempTimerProgress[goal.id];
    if (tempProgress && activeTimer === goal.id) {
      return {
        progress: tempProgress.progress,
        completedHours: tempProgress.completedHours,
        status: tempProgress.status
      };
    }
    
    // Si hay tiempo acumulado, calcular progreso basado en tiempo real
    const accumulatedSeconds = accumulatedTime[goal.id] || 0;
    if (accumulatedSeconds > 0) {
      const accumulatedHours = accumulatedSeconds / 3600;
      const realProgress = Math.min(100, (accumulatedHours / goal.estimatedHours) * 100);
      const realCompletedHours = Math.min(accumulatedHours, goal.estimatedHours);
      
      return {
        progress: Math.round(realProgress),
        completedHours: Math.round(realCompletedHours * 100) / 100,
        status: realProgress >= 100 ? 'completed' : realProgress > 0 ? 'in_progress' : 'not_started'
      };
    }
    
    return {
      progress: goal.progress,
      completedHours: goal.completedHours,
      status: goal.status
    };
  };

  const editGoal = (goal: StudyGoal) => {
    setEditingGoal({ ...goal });
    setIsEditGoalOpen(true);
  };

  const updateGoal = async () => {
    console.log('updateGoal llamada');
    
    if (!editingGoal) {
      console.error('No hay objetivo editando');
      alert('Error: No hay objetivo para editar');
      return;
    }

    if (!user) {
      console.error('Usuario no autenticado');
      alert('Error: Usuario no autenticado');
      return;
    }

    // Validar datos básicos
    if (!editingGoal.title?.trim()) {
      alert('El título es requerido');
      return;
    }

    if (!editingGoal.subject) {
      alert('La materia es requerida');
      return;
    }

    if (!editingGoal.targetDate) {
      alert('La fecha objetivo es requerida');
      return;
    }

    console.log('Datos válidos, procediendo con actualización...');
    setIsUpdatingGoal(true);

    try {
      // Actualizar en Firebase primero
      console.log('Actualizando en Firebase...');
      await studyGoalsService.updateGoal(user.id, editingGoal.id, {
        title: editingGoal.title,
        subject: editingGoal.subject,
        description: editingGoal.description,
        targetDate: editingGoal.targetDate,
        priority: editingGoal.priority,
        estimatedHours: editingGoal.estimatedHours
      });

      console.log('Objetivo actualizado en Firebase exitosamente');

      // Recargar objetivos desde Firebase para asegurar sincronización
      const updatedGoals = await studyGoalsService.getGoals(user.id);
      setGoals(updatedGoals);
      console.log('Objetivos recargados desde Firebase:', updatedGoals.length);

      // Cerrar diálogo y limpiar estado
      setIsEditGoalOpen(false);
      setEditingGoal(null);

    } catch (error) {
      console.error('Error updating goal:', error);
      alert('Error al actualizar el objetivo. Inténtalo de nuevo.');
    } finally {
      setIsUpdatingGoal(false);
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!user) return;

    // Usar window.confirm para mejor compatibilidad
    const confirmed = window.confirm('¿Estás seguro de que quieres eliminar este objetivo? Esta acción no se puede deshacer.');
    if (!confirmed) {
      return;
    }

    setDeletingGoalId(goalId);
    try {
      console.log('Eliminando objetivo:', goalId);
      
      // Intentar eliminar desde Firebase
      try {
        await studyGoalsService.deleteGoal(user.id, goalId);
        
        // Recargar objetivos desde Firebase
        const updatedGoals = await studyGoalsService.getGoals(user.id);
        setGoals(updatedGoals);
        
        console.log('Objetivo eliminado exitosamente desde Firebase');
      } catch (firebaseError) {
        console.warn('Firebase error, usando fallback local:', firebaseError);
        
        // Fallback: eliminar localmente
        setGoals(prev => prev.filter(goal => goal.id !== goalId));
        console.log('Objetivo eliminado localmente');
      }
      
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Error al eliminar el objetivo. Inténtalo de nuevo.');
    } finally {
      setDeletingGoalId(null);
    }
  };

  const updateGoalProgress = async (goalId: string, newProgress: number) => {
    console.log('updateGoalProgress llamada:', goalId, newProgress);
    
    if (!user) {
      console.error('Usuario no autenticado');
      return;
    }

    const goal = goals.find(g => g.id === goalId);
    if (!goal) {
      console.error('Objetivo no encontrado');
      return;
    }

    const clampedProgress = Math.max(0, Math.min(100, newProgress));
    const newCompletedHours = (clampedProgress / 100) * goal.estimatedHours;
    const newStatus = clampedProgress >= 100 ? 'completed' : clampedProgress > 0 ? 'in_progress' : 'not_started';

    console.log('Actualizando progreso:', {
      goalId,
      oldProgress: goal.progress,
      newProgress: clampedProgress,
      oldCompletedHours: goal.completedHours,
      newCompletedHours
    });

    // Actualizar localmente inmediatamente
    setGoals(prev => prev.map(g => 
      g.id === goalId 
        ? { 
            ...g, 
            progress: Math.round(clampedProgress),
            completedHours: Math.round(newCompletedHours * 100) / 100,
            status: newStatus
          }
        : g
    ));

    // Actualizar en Firebase inmediatamente y esperar
    try {
      console.log('Guardando progreso en Firebase...');
      await studyGoalsService.updateGoal(user.id, goalId, {
        progress: Math.round(clampedProgress),
        completedHours: Math.round(newCompletedHours * 100) / 100,
        status: newStatus
      });
      console.log('Progreso guardado en Firebase exitosamente');
    } catch (error) {
      console.error('Error guardando progreso en Firebase:', error);
      throw error; // Propagar el error para que completeGoal pueda manejarlo
    }
  };

  const completeGoal = async (goalId: string) => {
    try {
      console.log('Completando objetivo:', goalId);
      
      // Actualizar el objetivo a completado
      await updateGoalProgress(goalId, 100);
      
      // Esperar un momento para que Firebase se actualice
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Recargar datos para actualizar estadísticas
      await loadStudyData();
      
      console.log('✅ Objetivo completado y estadísticas actualizadas');
    } catch (error) {
      console.error('Error completando objetivo:', error);
      alert('Error al completar el objetivo. Inténtalo de nuevo.');
    }
  };

  const createGoal = async () => {
    console.log('createGoal llamada');
    
    if (!user) {
      alert('Debes estar autenticado para crear objetivos');
      return;
    }

    if (!user.id) {
      alert('Error de autenticación. Por favor, inicia sesión nuevamente.');
      return;
    }

    if (!newGoal.title?.trim()) {
      alert('El título es requerido');
      return;
    }

    if (!newGoal.subject) {
      alert('La materia es requerida');
      return;
    }

    if (!newGoal.targetDate) {
      alert('La fecha objetivo es requerida');
      return;
    }

    console.log('Datos válidos, procediendo con creación...');
    console.log('User ID:', user.id);

    try {
      // Crear objetivo en Firebase primero para obtener ID real
      console.log('Creando objetivo en Firebase...');
      const goalId = await studyGoalsService.createGoal({
        userId: user.id,
        title: newGoal.title,
        subject: newGoal.subject,
        description: newGoal.description,
        targetDate: newGoal.targetDate,
        priority: newGoal.priority,
        estimatedHours: newGoal.estimatedHours,
        progress: 0,
        completedHours: 0,
        status: 'not_started',
        aiSuggestions: generateSmartSuggestions(
          newGoal.subject,
          newGoal.description,
          newGoal.title
        )
      });

      console.log('Objetivo creado en Firebase con ID:', goalId);

      // Recargar objetivos desde Firebase para asegurar sincronización
      const updatedGoals = await studyGoalsService.getGoals(user.id);
      setGoals(updatedGoals);
      console.log('Objetivos recargados desde Firebase:', updatedGoals.length);

      // Cerrar diálogo y limpiar formulario
      setIsAddGoalOpen(false);
      setNewGoal({
        title: '',
        subject: '',
        description: '',
        targetDate: '',
        priority: 'medium',
        estimatedHours: 10
      });

    } catch (error) {
      console.error('Error creating goal:', error);
      
      // Mostrar error más específico
      let errorMessage = 'Error al crear el objetivo. ';
      
      if (error instanceof Error) {
        if (error.message.includes('undefined')) {
          errorMessage += 'Error de autenticación. Por favor, inicia sesión nuevamente.';
        } else if (error.message.includes('permission')) {
          errorMessage += 'No tienes permisos para crear objetivos.';
        } else if (error.message.includes('network') || error.message.includes('offline') || error.message.includes('fetch')) {
          errorMessage += 'Problema de conexión. Verifica tu internet e inténtalo de nuevo.';
        } else {
          errorMessage += `Error: ${error.message}`;
        }
      } else {
        errorMessage += 'Inténtalo de nuevo.';
      }
      
      alert(errorMessage);
    }
  };

  const startTimer = (goalId: string) => {
    setActiveTimer(goalId);
    setTimerSeconds(0);
    // Inicializar tiempo acumulado si no existe
    if (!accumulatedTime[goalId]) {
      setAccumulatedTime(prev => ({
        ...prev,
        [goalId]: 0
      }));
    }
  };

  const stopTimer = () => {
    console.log('stopTimer llamada');
    
    if (activeTimer && user) {
      const goal = goals.find(g => g.id === activeTimer);
      
      if (goal && timerSeconds > 0) {
        // Actualizar tiempo acumulado
        const newAccumulatedTime = (accumulatedTime[activeTimer] || 0) + timerSeconds;
        setAccumulatedTime(prev => ({
          ...prev,
          [activeTimer]: newAccumulatedTime
        }));
        
        const duration = Math.floor(newAccumulatedTime / 60);
        console.log(`Deteniendo sesión: ${duration} minutos (acumulado)`);
        
        // Calcular progreso basado en tiempo acumulado total
        const totalTimeHours = newAccumulatedTime / 3600; // Convertir segundos a horas
        const newCompletedHours = Math.min(totalTimeHours, goal.estimatedHours);
        const newProgress = Math.min(100, (totalTimeHours / goal.estimatedHours) * 100);
        
        // Actualizar objetivo localmente
        setGoals(prev => prev.map(g => 
          g.id === activeTimer 
            ? { 
                ...g, 
                completedHours: Math.round(newCompletedHours * 100) / 100,
                progress: Math.round(newProgress),
                status: newProgress >= 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'not_started'
              }
            : g
        ));

        // Intentar guardar en Firebase en segundo plano
        setTimeout(async () => {
          try {
            console.log('Guardando sesión en Firebase en segundo plano...');
            
            // Crear sesión de estudio en Firebase
            await studyGoalsService.createSession({
              goalId: activeTimer,
              userId: user.id,
              subject: goal.subject,
              date: new Date().toISOString().split('T')[0],
              startTime: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
              duration: duration,
              actualDuration: duration,
              status: 'completed',
              notes: `Sesión de estudio completada - ${duration} minutos`,
              rating: Math.floor(Math.random() * 2) + 4
            });

            // Actualizar horas completadas del objetivo en Firebase
            await studyGoalsService.updateGoal(user.id, activeTimer, {
              completedHours: Math.round(newCompletedHours * 100) / 100,
              progress: Math.round(newProgress),
              status: newProgress >= 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'not_started'
            });

            console.log('Sesión guardada en Firebase exitosamente');
          } catch (error) {
            console.warn('Error guardando sesión en Firebase (no crítico):', error);
            // No mostramos error al usuario porque ya se guardó localmente
          }
        }, 100);
      }
    }
    
    // Limpiar timer y estado temporal siempre
    setActiveTimer(null);
    setTimerSeconds(0);
    setTempTimerProgress({});
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="container-mobile page-layout">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Brain className="size-16 animate-pulse text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg mb-2">Cargando tu plan de estudio...</h3>
            <p className="text-gray-600">Organizando tus objetivos académicos</p>
          </div>
        </div>
      </div>
    );
  }

  // Log para depuración
  console.log('🎯 Renderizando StudyPlannerPage - goals:', goals.length, 'loading:', loading);
  console.log('🎯 Objetivos en el estado:', goals.map(g => ({id: g.id, title: g.title, userId: g.userId})));

  return (
    <div className="container-mobile page-layout">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <Calendar className="size-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-3xl mb-2">📅 Smart Study Planner</h1>
          <p className="text-gray-600 max-w-3xl mx-auto mb-4">
            Planificador de estudio inteligente que usa IA para optimizar tu tiempo, 
            establecer objetivos realistas y maximizar tu rendimiento académico.
          </p>
          
          {/* ML Status Indicator */}
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            <Zap className="size-4" />
            Datos Reales en Firebase
          </div>
        </div>

        {/* Weekly Summary */}
        {weeklySummary && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {weeklySummary.totalHours}h
                  </div>
                  <div className="text-sm text-gray-600">Total Estudiado</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {weeklySummary.completedSessions}
                  </div>
                  <div className="text-sm text-gray-600">Sesiones Completadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {weeklySummary.productivity}%
                  </div>
                  <div className="text-sm text-gray-600">Productividad</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {weeklySummary.averageRating}
                  </div>
                  <div className="text-sm text-gray-600">Calificación Promedio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {weeklySummary.missedSessions}
                  </div>
                  <div className="text-sm text-gray-600">Sesiones Perdidas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Recommendations from Academic Predictor */}
        {aiRecommendations.length > 0 && (
          <Alert className="border-purple-300 bg-gradient-to-r from-purple-50 to-indigo-50">
            <Sparkles className="size-5 text-purple-600" />
            <AlertDescription className="w-full">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <Brain className="size-4" />
                    Recomendaciones del Predictor Académico
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-purple-800">
                    {aiRecommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
                <Button
                  size="sm"
                  variant="default"
                  onClick={async () => {
                    if (!user?.id) {
                      alert('Debes estar autenticado para crear objetivos');
                      return;
                    }

                    setIsAcceptingRecommendations(true);
                    
                    try {
                      // Convertir recomendaciones en objetivos de estudio
                      // Obtener datos académicos para crear objetivos específicos
                      const firebaseSemesters = await academicFirebaseService.getUserSemesters(user.id);
                      const activeSemester = firebaseSemesters.find((s: any) => s.isActive);
                      
                      if (activeSemester?.subjects) {
                        const goalsCreated: string[] = [];
                        
                        // Crear objetivo para cada materia en riesgo
                        for (const subject of activeSemester.subjects) {
                          const currentGrade = calculateRealAverage(subject);
                          
                          if (currentGrade < 3.0) {
                            // Verificar si ya existe un objetivo para esta materia
                            const existingGoal = goals.find(g => 
                              g.subject === subject.name && 
                              g.title.toLowerCase().includes('mejorar rendimiento')
                            );
                            
                            if (existingGoal) {
                              console.log(`⏭️ Objetivo ya existe para ${subject.name}, omitiendo...`);
                              continue;
                            }
                            
                            const riskLevel = currentGrade < 2.0 ? 'high' : 'medium';
                            
                            // Determinar horas basadas en nivel de riesgo (sigue las recomendaciones exactas)
                            let estimatedHours: number;
                            let weeksNeeded: number;
                            
                            if (currentGrade < 2.0) {
                              // 🚨 Riesgo CRÍTICO: 20 horas según recomendación
                              estimatedHours = 20;
                              weeksNeeded = 4; // 20 horas / 5 horas por semana = 4 semanas
                            } else if (currentGrade < 3.0) {
                              // ⚠️ Riesgo MEDIO: 15 horas según recomendación (NO 20)
                              estimatedHours = 15;
                              weeksNeeded = 3; // 15 horas / 5 horas por semana = 3 semanas
                            } else {
                              // Ya no se crea para notas >= 3.0
                              continue;
                            }
                            
                            const targetDate = new Date(Date.now() + weeksNeeded * 7 * 24 * 60 * 60 * 1000);
                            
                            await studyGoalsService.createGoal({
                              userId: user.id,
                              title: `Mejorar rendimiento en ${subject.name}`,
                              subject: subject.name,
                              description: riskLevel === 'high' 
                                ? 'Plan de recuperación intensivo para materias en riesgo crítico'
                                : 'Plan de mejora para materias que requieren atención',
                              targetDate: targetDate.toISOString().split('T')[0],
                              priority: riskLevel,
                              estimatedHours: estimatedHours,
                              progress: 0,
                              completedHours: 0,
                              status: 'not_started',
                              aiSuggestions: generateSmartSuggestions(
                                subject.name,
                                riskLevel === 'high' ? 'Recuperación intensiva' : 'Mejora académica',
                                `Mejorar ${subject.name}`
                              )
                            });
                            
                            goalsCreated.push(subject.name);
                          }
                        }
                        
                        // Recargar objetivos después de crearlos
                        await loadStudyData();
                        
                        if (goalsCreated.length > 0) {
                          alert(`✅ Se crearon ${goalsCreated.length} objetivos de estudio basados en las recomendaciones.`);
                        }
                      }
                      
                      // Limpiar recomendaciones
                      setAiRecommendations([]);
                      
                    } catch (error) {
                      console.error('Error creando objetivos desde recomendaciones:', error);
                      alert('Error al crear objetivos. Por favor, inténtalo de nuevo.');
                    } finally {
                      setIsAcceptingRecommendations(false);
                    }
                  }}
                  disabled={isAcceptingRecommendations}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isAcceptingRecommendations ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Creando Objetivos...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="size-4 mr-2" />
                      Crear Objetivos de Estudio
                    </>
                  )}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Active Timer */}
        {activeTimer && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                      <Timer className="size-6 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">
                      Estudiando: {goals.find(g => g.id === activeTimer)?.title}
                    </h3>
                    <p className="text-sm text-green-600">
                      Tiempo transcurrido: {formatTime(timerSeconds)} (Total: {formatTime((accumulatedTime[activeTimer] || 0) + timerSeconds)})
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {formatTime(timerSeconds)}
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">⏱️ Estudiando activamente</p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={stopTimer}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <Pause className="size-4 mr-2" />
                    Detener
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="goals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="goals">Objetivos</TabsTrigger>
            <TabsTrigger value="schedule">Cronograma</TabsTrigger>
            <TabsTrigger value="progress">Progreso</TabsTrigger>
            <TabsTrigger value="analytics">Análisis</TabsTrigger>
          </TabsList>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Mis Objetivos de Estudio</h2>
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    loadStudyData();
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="size-4" />
                  Actualizar
                </Button>
                <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="size-4" />
                      Nuevo Objetivo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Objetivo</DialogTitle>
                      <DialogDescription>
                        Define un nuevo objetivo de estudio con la ayuda de IA
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Título del Objetivo *</Label>
                        <Input
                          id="title"
                          value={newGoal.title}
                          onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Ej: Preparar examen de matemáticas"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="subject">Materia *</Label>
                        <Select value={newGoal.subject} onValueChange={(value) => setNewGoal(prev => ({ ...prev, subject: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una materia" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUBJECTS.map(subject => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                          id="description"
                          value={newGoal.description}
                          onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe tu objetivo de estudio..."
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="targetDate">Fecha Objetivo *</Label>
                        <Input
                          id="targetDate"
                          type="date"
                          value={newGoal.targetDate}
                          onChange={(e) => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="priority">Prioridad</Label>
                        <Select value={newGoal.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewGoal(prev => ({ ...prev, priority: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baja</SelectItem>
                            <SelectItem value="medium">Media</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="estimatedHours">Horas Estimadas</Label>
                        <Input
                          id="estimatedHours"
                          type="number"
                          value={newGoal.estimatedHours}
                          onChange={(e) => setNewGoal(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
                          min="1"
                          max="200"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsAddGoalOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={createGoal}
                        disabled={!newGoal.title || !newGoal.subject || !newGoal.targetDate}
                      >
                        Crear Objetivo
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Dialog de Edición */}
            <Dialog open={isEditGoalOpen} onOpenChange={setIsEditGoalOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Editar Objetivo</DialogTitle>
                  <DialogDescription>
                    Modifica los detalles de tu objetivo de estudio
                  </DialogDescription>
                </DialogHeader>
                
                {editingGoal && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-title">Título del Objetivo *</Label>
                      <Input
                        id="edit-title"
                        value={editingGoal.title}
                        onChange={(e) => setEditingGoal(prev => prev ? { ...prev, title: e.target.value } : null)}
                        placeholder="Ej: Preparar examen de matemáticas"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-subject">Materia *</Label>
                      <Select 
                        value={editingGoal.subject} 
                        onValueChange={(value) => setEditingGoal(prev => prev ? { ...prev, subject: value } : null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una materia" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUBJECTS.map(subject => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="edit-description">Descripción</Label>
                      <Textarea
                        id="edit-description"
                        value={editingGoal.description}
                        onChange={(e) => setEditingGoal(prev => prev ? { ...prev, description: e.target.value } : null)}
                        placeholder="Describe tu objetivo de estudio..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-targetDate">Fecha Objetivo *</Label>
                      <Input
                        id="edit-targetDate"
                        type="date"
                        value={editingGoal.targetDate}
                        onChange={(e) => setEditingGoal(prev => prev ? { ...prev, targetDate: e.target.value } : null)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-priority">Prioridad</Label>
                      <Select 
                        value={editingGoal.priority} 
                        onValueChange={(value: 'low' | 'medium' | 'high') => setEditingGoal(prev => prev ? { ...prev, priority: value } : null)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baja</SelectItem>
                          <SelectItem value="medium">Media</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="edit-estimatedHours">Horas Estimadas</Label>
                      <Input
                        id="edit-estimatedHours"
                        type="number"
                        value={editingGoal.estimatedHours}
                        onChange={(e) => setEditingGoal(prev => prev ? { ...prev, estimatedHours: parseInt(e.target.value) || 0 } : null)}
                        min="1"
                        max="200"
                      />
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditGoalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={updateGoal}
                    disabled={!editingGoal?.title || !editingGoal?.subject || !editingGoal?.targetDate || isUpdatingGoal}
                  >
                    {isUpdatingGoal ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      'Actualizar Objetivo'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="grid gap-4">
              {goals.map(goal => (
                <Card key={goal.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{goal.title}</h3>
                          <Badge variant={
                            getGoalProgress(goal).status === 'completed' ? 'default' :
                            getGoalProgress(goal).status === 'in_progress' ? 'secondary' : 'outline'
                          }>
                            {getGoalProgress(goal).status === 'completed' ? 'Completado' :
                             getGoalProgress(goal).status === 'in_progress' ? 'En Progreso' : 'No Iniciado'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Materia</p>
                            <p className="font-medium">{goal.subject}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Fecha Objetivo</p>
                            <p className="font-medium">{new Date(goal.targetDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Progreso</p>
                            <p className="font-medium">{getGoalProgress(goal).progress}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Horas</p>
                            <p className="font-medium">
                              {getGoalProgress(goal).completedHours}/{goal.estimatedHours}h
                              {accumulatedTime[goal.id] && accumulatedTime[goal.id] > 0 && (
                                <span className="text-blue-600 ml-2 text-sm">
                                  (Acumulado: {formatTime(accumulatedTime[goal.id])})
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editGoal(goal)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteGoal(goal.id)}
                          disabled={deletingGoalId === goal.id}
                          className="text-red-600 hover:text-red-700"
                        >
                          {deletingGoalId === goal.id ? (
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{getGoalProgress(goal).progress}%</span>
                      </div>
                      <Progress value={getGoalProgress(goal).progress} className="h-2" />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {activeTimer === goal.id ? (
                          <Button
                            onClick={stopTimer}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            <Pause className="size-4 mr-2" />
                            Detener ({formatTime(timerSeconds)}) - Total: {formatTime((accumulatedTime[goal.id] || 0) + timerSeconds)}
                          </Button>
                        ) : (
                          <Button
                            onClick={() => startTimer(goal.id)}
                            disabled={getGoalProgress(goal).progress >= 100}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Play className="size-4 mr-2" />
                            Estudiar
                          </Button>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => completeGoal(goal.id)}
                          disabled={getGoalProgress(goal).progress >= 100}
                          className="text-green-600 hover:text-green-700"
                        >
                          Completar
                        </Button>
                      </div>
                    </div>

                    {goal.aiSuggestions.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="size-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            Sugerencias de IA
                          </span>
                        </div>
                        <ul className="text-sm text-blue-800 space-y-1">
                          {goal.aiSuggestions.map((suggestion, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Zap className="size-3 mt-0.5 text-blue-600 flex-shrink-0" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-5 text-blue-600" />
                  Cronograma de Estudio
                </CardTitle>
                <CardDescription>
                  Planifica tus sesiones de estudio de manera inteligente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.slice(0, 10).map(session => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <BookOpen className="size-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{session.subject}</p>
                          <p className="text-sm text-gray-600">
                            {session.date} - {session.startTime}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{session.duration} min</p>
                        <Badge variant={
                          session.status === 'completed' ? 'default' :
                          session.status === 'planned' ? 'secondary' : 'destructive'
                        }>
                          {session.status === 'completed' ? 'Completada' :
                           session.status === 'planned' ? 'Planificada' : 'Perdida'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="size-5 text-green-600" />
                    Resumen Semanal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weeklySummary && weeklySummary.subjects && (
                    <div className="space-y-4">
                      {Object.entries(weeklySummary.subjects).map(([subject, hours]) => (
                        <div key={subject} className="flex items-center justify-between">
                          <span className="font-medium">{subject}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={(hours / weeklySummary.totalHours) * 100} className="w-24 h-2" />
                            <span className="text-sm text-gray-600 min-w-[40px]">
                              {hours}h
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="size-5 text-yellow-600" />
                    Logros Recientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        🏆
                      </div>
                      <div>
                        <p className="font-medium">Racha de 7 días</p>
                        <p className="text-sm text-gray-600">Has estudiado todos los días esta semana</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        🎯
                      </div>
                      <div>
                        <p className="font-medium">Objetivo Cumplido</p>
                        <p className="text-sm text-gray-600">Completaste 18+ horas de estudio</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        📚
                      </div>
                      <div>
                        <p className="font-medium">Especialista en Matemáticas</p>
                        <p className="text-sm text-gray-600">Más de 50 horas estudiadas en esta materia</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Alert className="border-purple-200 bg-purple-50">
              <Brain className="size-4 text-purple-600" />
              <AlertDescription>
                Análisis avanzado con IA para optimizar tu rendimiento de estudio
              </AlertDescription>
            </Alert>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estadísticas Generales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Tiempo total estudiado</span>
                      <span className="font-semibold">124.5 horas</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Sesiones completadas</span>
                      <span className="font-semibold">89</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Tiempo promedio por sesión</span>
                      <span className="font-semibold">1.4 horas</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Tasa de finalización</span>
                      <span className="font-semibold">85%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recomendaciones de IA</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <Brain className="size-4 text-purple-600 mt-0.5" />
                      <span>Estudia matemáticas en horarios matutinos para mejor retención</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Brain className="size-4 text-purple-600 mt-0.5" />
                      <span>Aumentar tiempo en Química (+30min/día)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Brain className="size-4 text-purple-600 mt-0.5" />
                      <span>Optimizar horarios de estudio matutinos</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Brain className="size-4 text-purple-600 mt-0.5" />
                      <span>Incorporar técnicas de repaso espaciado</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}
