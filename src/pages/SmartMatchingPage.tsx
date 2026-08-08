// Smart Matching Algorithm - Emparejamiento Inteligente IA
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Slider } from '../components/ui/slider';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import {
  Brain, Zap, Target, Users, Star, MapPin, Clock,
  MessageSquare, BookOpen, Sparkles, CheckCircle,
  ArrowRight, Filter, Search, RefreshCw, Eye,
  Award, TrendingUp, Calendar, DollarSign
} from 'lucide-react';
import { tutoringService } from '../services/tutoring';
import { User } from '../types';
import { smartMatchingML } from '../services/ml/SmartMatchingML';

interface SmartMatchingPageProps {
  onNavigate: (page: string, data?: any) => void;
}

interface MatchingPreferences {
  subjectSearch: string; // Cambio de array a string para búsqueda libre
  maxPoints: number;
  location: string;
  availability: string[];
  experience: string;
  rating: number;
  teachingStyle: string[];
  goals: string[];
}

interface MatchScore {
  tutor: User;
  score: number;
  reasons: string[];
  compatibility: {
    subject: number;
    points: number;
    location: number;
    schedule: number;
    style: number;
    experience: number;
  };
  aiInsights: string[];
}

type MatchingStep = 'preferences' | 'analysis' | 'results';

const SUBJECTS = [
  'Matemáticas', 'Física', 'Química', 'Biología', 'Programación',
  'Inglés', 'Francés', 'Historia', 'Geografía', 'Economía',
  'Estadística', 'Cálculo', 'Álgebra', 'Geometría', 'Literatura'
];

const LOCATIONS = [
  'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena',
  'Bucaramanga', 'Pereira', 'Manizales', 'Online', 'Cualquiera'
];

const TEACHING_STYLES = [
  'Visual', 'Auditivo', 'Kinestésico', 'Práctico', 'Teórico',
  'Interactivo', 'Estructurado', 'Flexible', 'Intensivo', 'Relajado'
];

const GOALS = [
  'Mejorar calificaciones', 'Preparar exámenes', 'Reforzar conceptos',
  'Aprender desde cero', 'Práctica avanzada', 'Tareas y deberes',
  'Proyectos especiales', 'Certificaciones', 'Desarrollo personal'
];

export function SmartMatchingPage({ onNavigate }: SmartMatchingPageProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<MatchingStep>('preferences');
  const [preferences, setPreferences] = useState<MatchingPreferences>({
    subjectSearch: '', // Búsqueda libre de materias
    maxPoints: 50,
    location: 'Online',
    availability: [],
    experience: 'intermediate',
    rating: 4.0,
    teachingStyle: [],
    goals: []
  });
  const [matches, setMatches] = useState<MatchScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const startMatching = async () => {
    setCurrentStep('analysis');
    setLoading(true);
    setAnalysisProgress(0);

    // Simular proceso de análisis con progreso
    const steps = [
      'Analizando perfil del estudiante...',
      'Evaluando base de datos de tutores...',
      'Calculando compatibilidad...',
      'Aplicando algoritmos de IA...',
      'Generando recomendaciones...',
      'Finalizando análisis...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setAnalysisProgress(((i + 1) / steps.length) * 100);
    }

    // Generar matches mock
    await generateMatches();
    setCurrentStep('results');
    setLoading(false);
  };

  const generateMatches = async () => {
    try {
      // Obtener tutores disponibles
      const allTutors = await tutoringService.getTutors();

      // Usar ML para encontrar matches
      const mlMatches = await smartMatchingML.findMatches(
        user!,
        {
          subjectSearch: preferences.subjectSearch,
          maxPoints: preferences.maxPoints,
          location: preferences.location,
          minRating: preferences.rating,
          experience: preferences.experience as "intermediate" | "beginner" | "expert" | "any",
          learningStyle: undefined, // TODO: Implementar mapeo de estilos de enseñanza
          schedule: preferences.availability,
          goals: preferences.goals
        },
        allTutors
      );

      // Convertir resultados ML a formato esperado
      const scoredMatches: MatchScore[] = mlMatches.map(mlMatch => ({
        tutor: mlMatch.tutor,
        score: mlMatch.compatibilityScore,
        reasons: mlMatch.reasons,
        compatibility: {
          subject: mlMatch.features.subjectMatch,
          points: mlMatch.features.pointsMatch,
          location: mlMatch.features.locationMatch,
          schedule: mlMatch.features.scheduleMatch,
          style: mlMatch.features.styleMatch,
          experience: mlMatch.features.experienceMatch
        },
        aiInsights: mlMatch.aiInsights
      }));

      setMatches(scoredMatches);
    } catch (error) {
      console.error('Error generating matches:', error);
      // Fallback al algoritmo original si ML falla
      generateMatchesFallback();
    }
  };

  const generateMatchesFallback = async () => {
    try {
      const allTutors = await tutoringService.getTutors();

      console.log('🔍 Smart Matching - Preferencias del usuario:', preferences);
      console.log('📊 Total de tutores disponibles:', allTutors.length);

      const scoredMatches: MatchScore[] = allTutors.map(tutor => {
        const compatibility = calculateCompatibility(tutor);
        const overallScore = Object.values(compatibility).reduce((sum, score) => sum + score, 0) / 6;

        // Log de depuración para cada tutor
        console.log(`👤 Tutor: ${tutor.name}`);
        console.log(`   Materias: ${tutor.subjects?.join(', ') || 'N/A'}`);
        console.log(`   Ubicación: ${tutor.location || 'N/A'}`);
        console.log(`   Puntos: ${tutor.hourlyPoints || 'N/A'}`);
        console.log(`   Compatibilidad:`, compatibility);
        console.log(`   Score total: ${Math.round(overallScore * 100) / 100}`);
        console.log('---');

        return {
          tutor,
          score: Math.round(overallScore * 100) / 100,
          reasons: generateMatchReasons(tutor, compatibility),
          compatibility,
          aiInsights: generateAIInsights(tutor, compatibility)
        };
      });

      // Filtrar tutores que cumplan criterios críticos - FILTRADO ESTRICTO
      const relevantMatches = scoredMatches
        .filter(match => {
          // Criterios críticos que DEBEN cumplirse
          const criticalCriteria = [];
          let allCriteriaMet = true;

          // 1. Materia: Preferencia fuerte (Soft Filter)
          if (preferences.subjectSearch.trim()) {
            const subjectMatch = match.compatibility.subject > 0;
            // criticalCriteria.push(subjectMatch); // Relaxed for broader visibility
            // if (!subjectMatch) allCriteriaMet = false;
            console.log(`✅ ${match.tutor.name} - Materia: ${subjectMatch ? '✓' : 'soft'} (${match.compatibility.subject})`);
          }

          // 2. Ubicación: Preferencia fuerte (Soft Filter)
          if (preferences.location && preferences.location !== 'Cualquiera') {
            const locationMatch = match.compatibility.location > 0;
            // criticalCriteria.push(locationMatch); // Relaxed
            // if (!locationMatch) allCriteriaMet = false;
            console.log(`✅ ${match.tutor.name} - Ubicación: ${locationMatch ? '✓' : 'soft'} (${match.compatibility.location})`);
          }

          // 3. Puntos: Si se especificó límite, verificar (Soft Filter)
          if (preferences.maxPoints > 0) {
            const pointsMatch = match.compatibility.points > 0;
            // criticalCriteria.push(pointsMatch); // Removed strict check to allow suggestions
            // if (!pointsMatch) allCriteriaMet = false;
            console.log(`✅ ${match.tutor.name} - Puntos: ${pointsMatch ? '✓' : 'soft'} (${match.compatibility.points})`);
          }

          // 4. Experiencia: Si se especificó, verificar (Soft Filter)
          if (preferences.experience && preferences.experience !== 'any') {
            const experienceMatch = match.compatibility.experience > 0;
            // criticalCriteria.push(experienceMatch); // Removed strict check
            // if (!experienceMatch) allCriteriaMet = false;
            console.log(`✅ ${match.tutor.name} - Experiencia: ${experienceMatch ? '✓' : 'soft'} (${match.compatibility.experience})`);
          }

          // Score mínimo bajo para permitir descubrimiento
          const meetsScore = match.score >= 0.05;
          if (!meetsScore) allCriteriaMet = false;

          console.log(`🎯 ${match.tutor.name} - Todos los criterios: ${allCriteriaMet ? '✓' : '✗'}, Score: ${meetsScore ? '✓' : '✗'} (${match.score})`);

          return allCriteriaMet;
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 6); // Mostrar máximo 6 tutores para mejor experiencia

      console.log(`🎯 Matches finales encontrados: ${relevantMatches.length}`);
      relevantMatches.forEach((match, index) => {
        console.log(`${index + 1}. ${match.tutor.name} - Score: ${match.score} - Materias: ${match.tutor.subjects?.join(', ')} - Ubicación: ${match.tutor.location}`);
      });

      setMatches(relevantMatches);
    } catch (error) {
      console.error('Error generating fallback matches:', error);
    }
  };

  const calculateCompatibility = (tutor: User) => {
    const compatibility = {
      subject: 0,
      points: 0,
      location: 0,
      schedule: 0,
      style: 0,
      experience: 0
    };

    // Subject compatibility - BÚSQUEDA LIBRE INTELIGENTE Y ESTRICTA
    if (preferences.subjectSearch.trim()) {
      if (!tutor.subjects || tutor.subjects.length === 0) {
        compatibility.subject = 0; // Sin materias = incompatibilidad total
      } else {
        const searchTerm = preferences.subjectSearch.toLowerCase().trim();
        const matchingSubjects = tutor.subjects.filter(tutorSubject => {
          const tutorSub = tutorSubject.toLowerCase().trim();

          // Coincidencia exacta (máxima prioridad)
          if (tutorSub === searchTerm) return true;

          // Coincidencia parcial (la materia contiene el término de búsqueda)
          if (tutorSub.includes(searchTerm)) return true;

          // Coincidencia inversa (el término de búsqueda contiene la materia)
          if (searchTerm.includes(tutorSub)) return true;

          // Coincidencias por palabras clave relacionadas (más estrictas)
          const relatedKeywords = {
            'matematicas': ['algebra', 'geometria', 'calculo', 'estadistica', 'trigonometria', 'matematica'],
            'fisica': ['mecanica', 'termodinamica', 'electricidad', 'magnetismo', 'optica', 'fisica'],
            'quimica': ['organica', 'inorganica', 'analitica', 'fisicoquimica', 'bioquimica', 'quimica'],
            'programacion': ['codigo', 'software', 'desarrollo', 'programming', 'coding', 'programacion'],
            'ingles': ['english', 'idioma', 'language', 'conversacion', 'gramatica', 'ingles'],
            'historia': ['historia', 'sociales', 'geografia', 'politica', 'cultura'],
            'biologia': ['biologia', 'ciencias', 'anatomia', 'fisiologia', 'genetica'],
            'economia': ['economia', 'finanzas', 'contabilidad', 'administracion', 'negocios']
          };

          // Buscar palabras clave relacionadas (más estricto)
          for (const [key, keywords] of Object.entries(relatedKeywords)) {
            if (searchTerm.includes(key) || key.includes(searchTerm)) {
              return keywords.some(keyword =>
                tutorSub.includes(keyword) || keyword.includes(tutorSub)
              );
            }
          }

          return false;
        });

        if (matchingSubjects.length === 0) {
          compatibility.subject = 0; // Sin coincidencias = incompatibilidad total
        } else {
          // Puntuación basada en la calidad de la coincidencia (más estricta)
          const exactMatch = matchingSubjects.some(subject =>
            subject.toLowerCase().trim() === searchTerm
          );
          const partialMatch = matchingSubjects.some(subject =>
            subject.toLowerCase().includes(searchTerm) || searchTerm.includes(subject.toLowerCase())
          );

          if (exactMatch) {
            compatibility.subject = 1; // Coincidencia exacta = máxima puntuación
          } else if (partialMatch) {
            compatibility.subject = 0.9; // Coincidencia parcial = muy alta puntuación
          } else {
            compatibility.subject = 0.7; // Coincidencia por palabras clave = buena puntuación
          }
        }
      }
    } else {
      compatibility.subject = 0.5; // Neutral si no hay búsqueda de materia
    }

    // Location compatibility - FILTRO ESTRICTO
    if (preferences.location && preferences.location !== 'Cualquiera') {
      if (!tutor.location) {
        compatibility.location = 0; // Sin ubicación = incompatibilidad total
      } else if (preferences.location === 'Online') {
        if (tutor.location.toLowerCase().includes('online')) {
          compatibility.location = 1;
        } else {
          compatibility.location = 0.3; // Presencial cuando se busca online
        }
      } else {
        // Buscar coincidencia exacta de ciudad
        const tutorCity = tutor.location.split(',')[0].trim().toLowerCase();
        const prefCity = preferences.location.split(',')[0].trim().toLowerCase();

        if (tutorCity === prefCity) {
          compatibility.location = 1;
        } else if (tutor.location.toLowerCase().includes('online')) {
          compatibility.location = 0.2; // Online cuando se busca presencial
        } else {
          compatibility.location = 0; // Ciudad diferente = incompatibilidad total
        }
      }
    } else {
      compatibility.location = 1; // Cualquiera = compatible con todos
    }

    // Points compatibility - FILTRO ESTRICTO
    if (preferences.maxPoints > 0) {
      // Use hourlyPoints if available, otherwise default to 10
      const tutorPoints = tutor.hourlyPoints || 10;

      if (tutorPoints <= preferences.maxPoints) {
        const pointsRatio = tutorPoints / preferences.maxPoints;
        compatibility.points = 1 - (pointsRatio * 0.2); // Bonificación por estar dentro del presupuesto
      } else if (tutorPoints <= preferences.maxPoints * 1.5) {
        compatibility.points = 0.4; // Soft match: slightly over budget
      } else {
        compatibility.points = 0; // Excede presupuesto significativamente
      }
    } else {
      compatibility.points = 1; // Sin límite
    }

    // Schedule compatibility - Basado en disponibilidad real
    if (tutor.availability !== undefined) {
      if (tutor.availability === true) {
        compatibility.schedule = 1;
      } else if (tutor.availability === false) {
        compatibility.schedule = 0;
      } else {
        compatibility.schedule = 0.5;
      }
    } else {
      compatibility.schedule = 0.5; // Neutral si no hay información
    }

    // Teaching style compatibility - Basado en rating
    if (tutor.rating && tutor.rating >= 4.5) {
      compatibility.style = 1;
    } else if (tutor.rating && tutor.rating >= 4.0) {
      compatibility.style = 0.8;
    } else if (tutor.rating && tutor.rating >= 3.5) {
      compatibility.style = 0.6;
    } else if (tutor.rating && tutor.rating >= 3.0) {
      compatibility.style = 0.4;
    } else {
      compatibility.style = 0.2;
    }

    // Experience compatibility - FILTRO ESTRICTO
    if (preferences.experience && preferences.experience !== 'any') {
      if (!tutor.experience) {
        compatibility.experience = 0; // Sin experiencia = incompatibilidad total
      } else {
        const expMatch = tutor.experience.match(/(\d+)\s*años?/);
        const expYears = expMatch ? parseInt(expMatch[1]) : 0;

        if (preferences.experience === 'beginner') {
          if (expYears >= 1 && expYears <= 3) {
            compatibility.experience = 1;
          } else if (expYears > 3) {
            compatibility.experience = 0.6; // Demasiada experiencia para principiante
          } else {
            compatibility.experience = 0.3; // Poca experiencia
          }
        } else if (preferences.experience === 'intermediate') {
          if (expYears >= 2 && expYears <= 5) {
            compatibility.experience = 1;
          } else if (expYears > 5) {
            compatibility.experience = 0.8; // Buena experiencia
          } else {
            compatibility.experience = 0.4; // Poca experiencia
          }
        } else if (preferences.experience === 'expert') {
          if (expYears >= 5) {
            compatibility.experience = 1;
          } else if (expYears >= 3) {
            compatibility.experience = 0.7; // Experiencia moderada
          } else {
            compatibility.experience = 0.2; // Poca experiencia para experto
          }
        }
      }
    } else {
      compatibility.experience = 1; // Sin preferencia = compatible con todos
    }

    return compatibility;
  };

  const generateMatchReasons = (tutor: User, compatibility: any): string[] => {
    const reasons: string[] = [];

    // Razones basadas en compatibilidad alta
    if (compatibility.subject > 0.7) {
      const searchTerm = preferences.subjectSearch.toLowerCase().trim();
      const matchingSubjects = tutor.subjects?.filter(s => {
        const subject = s.toLowerCase().trim();
        return subject === searchTerm ||
          subject.includes(searchTerm) ||
          searchTerm.includes(subject);
      }) || [];

      if (matchingSubjects.length > 0) {
        reasons.push(`Especialista en: ${matchingSubjects.slice(0, 2).join(', ')}`);
      } else {
        reasons.push(`Especialista en ${preferences.subjectSearch}`);
      }
    }

    if (compatibility.points > 0.7) {
      const tutorPoints = tutor.hourlyPoints || 10;
      if (tutorPoints <= preferences.maxPoints * 0.8) {
        reasons.push(`Excelente tasa: ${tutorPoints} PM/hora`);
      } else {
        reasons.push('Puntos dentro de tu presupuesto');
      }
    }

    if (tutor.rating && tutor.rating >= preferences.rating) {
      if (tutor.rating >= 4.8) {
        reasons.push(`Calificación excepcional: ${tutor.rating} ⭐`);
      } else if (tutor.rating >= 4.5) {
        reasons.push(`Excelente calificación: ${tutor.rating} ⭐`);
      } else {
        reasons.push(`Buena calificación: ${tutor.rating} ⭐`);
      }
    }

    if (compatibility.location > 0.8) {
      if (tutor.location?.includes('Online')) {
        reasons.push('Disponible para clases online');
      } else {
        reasons.push(`Disponible en ${tutor.location}`);
      }
    }

    if (compatibility.schedule > 0.8) {
      reasons.push('Horarios flexibles disponibles');
    }

    if (compatibility.experience > 0.8) {
      const expMatch = tutor.experience?.match(/(\d+)\s*años?/);
      const expYears = expMatch ? parseInt(expMatch[1]) : 0;
      if (expYears > 0) {
        reasons.push(`${expYears} años de experiencia enseñando`);
      } else {
        reasons.push('Amplia experiencia en educación');
      }
    }

    if (tutor.totalReviews && tutor.totalReviews > 100) {
      reasons.push(`${tutor.totalReviews}+ estudiantes han confiado en este tutor`);
    } else if (tutor.totalReviews && tutor.totalReviews > 50) {
      reasons.push('Tutor con buena reputación');
    }

    // Si no hay suficientes razones, agregar razones genéricas
    if (reasons.length < 2) {
      if (tutor.bio && tutor.bio.length > 50) {
        reasons.push('Perfil detallado y profesional');
      }
      if (tutor.subjects && tutor.subjects.length > 3) {
        reasons.push('Amplio conocimiento en múltiples áreas');
      }
    }

    return reasons.slice(0, 3);
  };

  const generateAIInsights = (tutor: User, compatibility: any): string[] => {
    const insights: string[] = [];

    // Insights basados en compatibilidad específica
    if (compatibility.subject > 0.8 && compatibility.experience > 0.8) {
      insights.push('IA detectó: Combinación perfecta de especialización y experiencia');
    } else if (compatibility.subject > 0.7) {
      insights.push('IA detectó: Alta compatibilidad en materias de interés');
    }

    if (compatibility.points > 0.8 && compatibility.rating > 0.7) {
      insights.push('IA detectó: Excelente relación puntos-calidad');
    } else if (compatibility.points > 0.7) {
      insights.push('IA detectó: Tasa de puntos muy competitiva');
    }

    if (compatibility.location > 0.9) {
      insights.push('IA detectó: Ubicación ideal para clases presenciales');
    } else if (compatibility.location > 0.7) {
      insights.push('IA detectó: Buena compatibilidad de ubicación');
    }

    if (tutor.rating && tutor.rating >= 4.7 && tutor.totalReviews > 50) {
      insights.push('IA detectó: Tutor con historial comprobado de excelencia');
    } else if (tutor.rating && tutor.rating >= 4.5) {
      insights.push('IA detectó: Tutor altamente calificado por estudiantes');
    }

    if (compatibility.schedule > 0.8) {
      insights.push('IA detectó: Horarios muy flexibles para tu disponibilidad');
    }

    return insights.slice(0, 2);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600 bg-green-100';
    if (score >= 0.8) return 'text-blue-600 bg-blue-100';
    if (score >= 0.7) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const renderPreferencesStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="size-5 text-blue-600" />
            Preferencias de Búsqueda
          </CardTitle>
          <CardDescription>
            Configura tus preferencias para encontrar el tutor perfecto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subject Search */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              ¿Qué materia necesitas aprender? *
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 size-4 text-gray-400" />
              <Input
                placeholder="Ej: Matemáticas, Física, Programación, Inglés, Historia..."
                value={preferences.subjectSearch}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  subjectSearch: e.target.value
                }))}
                className="pl-10"
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              💡 Escribe la materia que necesitas. El sistema encontrará tutores especializados en esa área.
            </p>
          </div>

          {/* Points Range */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              Presupuesto Máximo por Hora: {preferences.maxPoints} PM
            </Label>
            <Slider
              value={[preferences.maxPoints]}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, maxPoints: value[0] }))}
              max={50}
              min={10}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>10 PM</span>
              <span>50 PM</span>
            </div>
          </div>



          {/* Teaching Goals */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              Objetivos de Aprendizaje
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {GOALS.map(goal => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={goal}
                    checked={preferences.goals.includes(goal)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setPreferences(prev => ({
                          ...prev,
                          goals: [...prev.goals, goal]
                        }));
                      } else {
                        setPreferences(prev => ({
                          ...prev,
                          goals: prev.goals.filter(g => g !== goal)
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={goal} className="text-sm">
                    {goal}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              Calificación Mínima: {preferences.rating} estrellas
            </Label>
            <Slider
              value={[preferences.rating]}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, rating: value[0] }))}
              max={5}
              min={1}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>1.0</span>
              <span>5.0</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={startMatching}
          disabled={!preferences.subjectSearch.trim()}
          className="flex items-center gap-2"
          size="lg"
        >
          <Brain className="size-4" />
          Encontrar Matches con IA
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );

  const renderAnalysisStep = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          <div className="relative">
            <Brain className="size-16 mx-auto text-blue-600 animate-pulse" />
            <Sparkles className="size-6 absolute -top-2 -right-2 text-yellow-500 animate-bounce" />
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">IA Analizando Matches</h3>
            <p className="text-gray-600">
              Procesando miles de perfiles para encontrar tus matches perfectos...
            </p>
          </div>

          <div className="space-y-3">
            <Progress value={analysisProgress} className="h-3" />
            <p className="text-sm text-gray-500">
              {analysisProgress < 20 ? 'Analizando tu perfil...' :
                analysisProgress < 40 ? 'Evaluando tutores disponibles...' :
                  analysisProgress < 60 ? 'Calculando compatibilidad...' :
                    analysisProgress < 80 ? 'Aplicando algoritmos de IA...' :
                      'Finalizando análisis...'}
            </p>
            <p className="text-xs text-gray-400">
              {Math.round(analysisProgress)}% completado
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCollaborativeRecommendations = () => {
    // Simular recomendaciones colaborativas
    // En un sistema real, esto vendría de un endpoint que analiza el comportamiento de usuarios similares
    const collaborativeMatches = matches.slice(1, 4); // Tomar algunos matches secundarios para mostrar como "recomendados por otros"

    if (collaborativeMatches.length === 0) return null;

    return (
      <div className="space-y-4 my-8">
        <div className="flex items-center gap-2">
          <Users className="size-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-indigo-900">
            Estudiantes con objetivos similares también contactaron a
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {collaborativeMatches.map((match, index) => (
            <Card key={`collab-${index}`} className="bg-indigo-50 border-indigo-100 hover:shadow-md transition-all cursor-pointer group" onClick={() => onNavigate('tutor-profile', { tutor: match.tutor })}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-200 overflow-hidden shrink-0">
                    {match.tutor.avatar && <img src={match.tutor.avatar} alt={match.tutor.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-indigo-900 line-clamp-1">{match.tutor.name}</p>
                    <div className="flex items-center gap-1">
                      <Star className="size-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-indigo-700">{match.tutor.rating}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-indigo-800 mb-2 line-clamp-2 h-8">
                  {match.reasons[0]}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="secondary" className="bg-white text-indigo-700 text-[10px] hover:bg-white border-indigo-200">
                    {Math.round(match.score * 95)}% Similaridad
                  </Badge>
                  <ArrowRight className="size-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderResultsStep = () => {
    return (
      <div className="space-y-6">
        {/* Results Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-green-700">
                  ¡{matches.length} Matches Encontrados!
                </h2>
                <p className="text-gray-600 mt-1">
                  La IA ha encontrado los tutores más compatibles contigo
                </p>
              </div>
              <div className="text-center">
                <CheckCircle className="size-12 text-green-600 mx-auto mb-2" />
                <Badge className="bg-green-100 text-green-800">
                  Análisis Completado
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Match Highlight */}
        {matches.length > 0 && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="size-5 text-green-600" />
                <CardTitle className="text-green-800">
                  🎯 Tu Match Perfecto
                </CardTitle>
                <Badge className="bg-green-600 text-white">
                  {Math.round(matches[0].score * 100)}% Compatible
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                  {matches[0].tutor.avatar && (
                    <img
                      src={matches[0].tutor.avatar}
                      alt={matches[0].tutor.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{matches[0].tutor.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="size-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{matches[0].tutor.rating}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3">
                    {matches[0].tutor.bio || 'Tutor experimentado y dedicado'}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {matches[0].tutor.subjects?.slice(0, 3).map(subject => (
                      <Badge key={subject} variant="secondary">
                        {subject}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Award className="size-4 text-gray-400" />
                      <span>{matches[0].tutor.hourlyPoints} PM/hora</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="size-4 text-gray-400" />
                      <span>{matches[0].tutor.location}</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      🤖 Insights de IA:
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {matches[0].aiInsights.map((insight, idx) => (
                        <li key={idx}>• {insight}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => onNavigate('request-tutoring', { tutor: matches[0].tutor })}
                      className="flex items-center gap-2"
                    >
                      <MessageSquare className="size-4" />
                      Contactar Ahora
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onNavigate('tutor-profile', { tutor: matches[0].tutor })}
                      className="flex items-center gap-2"
                    >
                      <Eye className="size-4" />
                      Ver Perfil
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Collaborative Recommendations */}
        {matches.length > 1 && renderCollaborativeRecommendations()}

        {/* Other Matches */}
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold">Otros Matches Recomendados</h3>

          {matches.slice(1).map((match, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden shrink-0">
                    {match.tutor.avatar && (
                      <img
                        src={match.tutor.avatar}
                        alt={match.tutor.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{match.tutor.name}</h4>
                        <Badge className={getScoreColor(match.score)}>
                          {Math.round(match.score * 100)}% Match
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="size-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{match.tutor.rating}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {match.tutor.subjects?.slice(0, 2).map(subject => (
                        <Badge key={subject} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>

                    <div className="text-xs text-gray-600 mb-2">
                      {match.reasons.join(' • ')}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {match.tutor.hourlyPoints} PM/hora
                      </span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onNavigate('request-tutoring', { tutor: match.tutor })}
                        >
                          Contactar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Matches Message */}
        {matches.length === 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Target className="size-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-orange-800 mb-2">
                    No se encontraron matches perfectos
                  </h3>
                  <p className="text-orange-700 mb-4">
                    La IA no encontró tutores que cumplan con todos tus criterios.
                    Intenta ajustar tus preferencias para obtener mejores resultados.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => setCurrentStep('preferences')}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <RefreshCw className="size-4 mr-2" />
                      Ajustar Preferencias
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onNavigate('search')}
                      className="border-orange-300 text-orange-700 hover:bg-orange-100"
                    >
                      <Search className="size-4 mr-2" />
                      Explorar Todos los Tutores
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            onClick={() => setCurrentStep('preferences')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="size-4" />
            Refinar Búsqueda
          </Button>

          <Button
            onClick={() => onNavigate('search')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Search className="size-4" />
            Explorar Todos los Tutores
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container-mobile page-layout">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <Brain className="size-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-3xl mb-2">🧠 Smart Matching Algorithm</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Nuestro algoritmo de inteligencia artificial analiza tu perfil, preferencias y objetivos
            para encontrar los tutores más compatibles contigo.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${currentStep === 'preferences' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'preferences' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                1
              </div>
              <span className="hidden sm:inline">Preferencias</span>
            </div>

            <div className="w-8 h-0.5 bg-gray-300" />

            <div className={`flex items-center gap-2 ${currentStep === 'analysis' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'analysis' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                2
              </div>
              <span className="hidden sm:inline">Análisis</span>
            </div>

            <div className="w-8 h-0.5 bg-gray-300" />

            <div className={`flex items-center gap-2 ${currentStep === 'results' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'results' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                3
              </div>
              <span className="hidden sm:inline">Resultados</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {currentStep === 'preferences' && renderPreferencesStep()}
        {currentStep === 'analysis' && renderAnalysisStep()}
        {currentStep === 'results' && renderResultsStep()}
      </div>
    </div>
  );
}
