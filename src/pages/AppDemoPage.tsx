// Página de demostración interactiva de la aplicación
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  User, 
  Search, 
  MessageCircle, 
  Calendar, 
  CreditCard, 
  Star,
  BookOpen,
  Brain,
  PlaneTakeoff,
  HeadphonesIcon,
  Home,
  UserCheck,
  ArrowRight,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

interface DemoStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  mockupImage?: string;
  duration: number;
}

const demoSteps: DemoStep[] = [
  {
    id: 1,
    title: "Bienvenida y Autenticación",
    description: "El usuario ingresa a TutorApp Colombia y se autentica de forma segura",
    icon: <User className="size-6" />,
    color: "bg-blue-500",
    features: [
      "Login seguro con email y contraseña",
      "Registro rápido y sencillo",
      "Recuperación de contraseña",
      "Interfaz limpia y profesional"
    ],
    duration: 3000
  },
  {
    id: 2,
    title: "Página Principal",
    description: "Dashboard personalizado con estadísticas y acceso rápido a funciones",
    icon: <Home className="size-6" />,
    color: "bg-green-500",
    features: [
      "Estadísticas personales de tutorías",
      "Acceso rápido a buscar tutores",
      "Vista de solicitudes pendientes",
      "Navegación intuitiva"
    ],
    duration: 4000
  },
  {
    id: 3,
    title: "Búsqueda de Tutores",
    description: "Sistema avanzado de búsqueda y filtrado de tutores especializados",
    icon: <Search className="size-6" />,
    color: "bg-purple-500",
    features: [
      "Filtros por materia, ubicación y precio",
      "25 ubicaciones reales de Colombia",
      "103 materias especializadas",
      "Perfiles detallados de tutores"
    ],
    duration: 5000
  },
  {
    id: 4,
    title: "Solicitud de Tutoría",
    description: "Proceso simple para solicitar una sesión de tutoría personalizada",
    icon: <Calendar className="size-6" />,
    color: "bg-orange-500",
    features: [
      "Selección de fecha y hora",
      "Especificación de temas",
      "Modalidad presencial o virtual",
      "Cálculo automático de costos"
    ],
    duration: 4000
  },
  {
    id: 5,
    title: "Chat en Tiempo Real",
    description: "Comunicación directa entre estudiantes y tutores",
    icon: <MessageCircle className="size-6" />,
    color: "bg-cyan-500",
    features: [
      "Mensajería instantánea",
      "Compartir archivos y documentos",
      "Notificaciones en tiempo real",
      "Historial de conversaciones"
    ],
    duration: 4000
  },
  {
    id: 6,
    title: "Gestión de Pagos",
    description: "Sistema de pagos seguro adaptado al mercado colombiano",
    icon: <CreditCard className="size-6" />,
    color: "bg-red-500",
    features: [
      "Pagos en pesos colombianos (COP)",
      "Múltiples métodos de pago",
      "Procesamiento seguro",
      "Historial de transacciones"
    ],
    duration: 3000
  },
  {
    id: 7,
    title: "Smart Matching con IA",
    description: "Algoritmo inteligente que conecta estudiantes con tutores ideales",
    icon: <Brain className="size-6" />,
    color: "bg-pink-500",
    features: [
      "Matching basado en preferencias",
      "Análisis de compatibilidad",
      "Recomendaciones personalizadas",
      "Optimización por ubicación y horarios"
    ],
    duration: 4000
  },
  {
    id: 8,
    title: "Predictor Académico",
    description: "IA que predice el rendimiento académico y sugiere mejoras",
    icon: <BookOpen className="size-6" />,
    color: "bg-indigo-500",
    features: [
      "Análisis de notas actuales",
      "Predicción de rendimiento futuro",
      "Identificación de áreas de mejora",
      "Sugerencias personalizadas"
    ],
    duration: 4000
  },
  {
    id: 9,
    title: "Planificador de Estudios",
    description: "Herramienta IA para crear planes de estudio personalizados",
    icon: <PlaneTakeoff className="size-6" />,
    color: "bg-teal-500",
    features: [
      "Horarios de estudio optimizados",
      "Metas académicas personalizadas",
      "Seguimiento de progreso",
      "Recordatorios automáticos"
    ],
    duration: 4000
  },
  {
    id: 10,
    title: "Centro de Soporte IA",
    description: "Asistente virtual para resolver dudas y brindar soporte 24/7",
    icon: <HeadphonesIcon className="size-6" />,
    color: "bg-violet-500",
    features: [
      "Chat de IA disponible 24/7",
      "Respuestas inteligentes",
      "Resolución de problemas común",
      "Escalación a soporte humano"
    ],
    duration: 3000
  },
  {
    id: 11,
    title: "Sistema de Reseñas",
    description: "Calificaciones y comentarios para mantener la calidad del servicio",
    icon: <Star className="size-6" />,
    color: "bg-yellow-500",
    features: [
      "Calificación de 1 a 5 estrellas",
      "Comentarios detallados",
      "Sistema de reputación",
      "Filtros por calificación"
    ],
    duration: 3000
  },
  {
    id: 12,
    title: "Roles Dinámicos",
    description: "Cualquier usuario puede ser estudiante Y tutor simultáneamente",
    icon: <UserCheck className="size-6" />,
    color: "bg-emerald-500",
    features: [
      "Cambio dinámico entre roles",
      "Perfiles diferenciados",
      "Gestión independiente de solicitudes",
      "Flexibilidad total para usuarios"
    ],
    duration: 4000
  }
];

const platformFeatures = [
  {
    icon: <Smartphone className="size-8" />,
    title: "Móvil",
    description: "Android & iOS",
    color: "text-blue-600"
  },
  {
    icon: <Monitor className="size-8" />,
    title: "Escritorio",
    description: "Windows, Mac, Linux",
    color: "text-green-600"
  },
  {
    icon: <Tablet className="size-8" />,
    title: "Web App",
    description: "PWA Responsiva",
    color: "text-purple-600"
  }
];

export function AppDemoPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Auto-play logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentStep < demoSteps.length) {
      const step = demoSteps[currentStep];
      const stepDuration = step.duration;
      const updateInterval = 100; // Update every 100ms
      let currentTime = 0;

      interval = setInterval(() => {
        currentTime += updateInterval;
        const stepProgress = (currentTime / stepDuration) * 100;
        setProgress(stepProgress);

        if (currentTime >= stepDuration) {
          setProgress(100);
          setTimeout(() => {
            if (currentStep < demoSteps.length - 1) {
              setCurrentStep(currentStep + 1);
              setProgress(0);
            } else {
              setIsPlaying(false);
              setProgress(100);
            }
          }, 500);
        }
      }, updateInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentStep]);

  const handlePlay = () => {
    if (currentStep >= demoSteps.length - 1 && progress >= 100) {
      setCurrentStep(0);
      setProgress(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setProgress(0);
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setProgress(0);
      setIsPlaying(false);
    }
  };

  const currentStepData = demoSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-blue-600 mb-1">TutorApp Colombia</h1>
              <p className="text-gray-600">Demostración Interactiva de la Aplicación</p>
            </div>
            <Button onClick={() => onNavigate('home')} variant="outline">
              Volver a la App
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Platform Support */}
        <div className="mb-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Smartphone className="size-6 text-blue-600" />
                Disponible en Todas las Plataformas
              </CardTitle>
              <CardDescription>
                Una sola aplicación que funciona perfectamente en móviles, tablets y computadores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {platformFeatures.map((platform, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className={`${platform.color} mb-3 flex justify-center`}>
                      {platform.icon}
                    </div>
                    <h3 className="font-medium mb-1">{platform.title}</h3>
                    <p className="text-sm text-gray-600">{platform.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Controls */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Demostración de Funcionalidades</span>
                <Badge variant="secondary">
                  Paso {currentStep + 1} de {demoSteps.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                Explora paso a paso todas las funcionalidades de TutorApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progreso del paso actual</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <Button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  variant="outline"
                  size="sm"
                >
                  <SkipBack className="size-4" />
                </Button>
                
                <Button onClick={handlePlay} className="px-6">
                  {isPlaying ? (
                    <>
                      <Pause className="size-4 mr-2" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="size-4 mr-2" />
                      {currentStep >= demoSteps.length - 1 && progress >= 100 ? 'Reiniciar' : 'Reproducir'}
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={currentStep >= demoSteps.length - 1}
                  variant="outline"
                  size="sm"
                >
                  <SkipForward className="size-4" />
                </Button>
              </div>

              {/* Step Navigation */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {demoSteps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => {
                      setCurrentStep(index);
                      setProgress(0);
                      setIsPlaying(false);
                    }}
                    className={`p-2 rounded-lg text-xs transition-all ${
                      index === currentStep
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        : index < currentStep
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-150'
                    }`}
                  >
                    <div className={`${step.color} text-white rounded p-1 mb-1 flex justify-center`}>
                      {step.icon}
                    </div>
                    <div className="font-medium leading-tight">{step.title}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Step Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Step Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className={`${currentStepData.color} text-white p-3 rounded-lg`}>
                  {currentStepData.icon}
                </div>
                <div>
                  <CardTitle>{currentStepData.title}</CardTitle>
                  <Badge variant="outline">Paso {currentStep + 1}</Badge>
                </div>
              </div>
              <CardDescription className="text-base">
                {currentStepData.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h4 className="font-medium mb-3">Características principales:</h4>
              <ul className="space-y-2">
                {currentStepData.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ArrowRight className="size-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Mockup Area */}
          <Card>
            <CardHeader>
              <CardTitle>Vista de la Aplicación</CardTitle>
              <CardDescription>
                Así se ve esta funcionalidad en la aplicación real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-8 text-center min-h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <div className={`${currentStepData.color} text-white p-6 rounded-full mx-auto mb-4 w-24 h-24 flex items-center justify-center`}>
                    {React.cloneElement(currentStepData.icon as React.ReactElement, { className: 'size-12' })}
                  </div>
                  <h3 className="text-lg font-medium mb-2">{currentStepData.title}</h3>
                  <p className="text-gray-600 max-w-sm mx-auto">
                    En la aplicación real, aquí verías la interfaz completa de {currentStepData.title.toLowerCase()}
                  </p>
                  <div className="mt-4">
                    <Badge variant="secondary">
                      Mockup Visual - Paso {currentStep + 1}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de la Aplicación</CardTitle>
              <CardDescription>
                Datos clave sobre las funcionalidades de TutorApp Colombia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">103</div>
                  <div className="text-sm text-gray-600">Materias Disponibles</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">25</div>
                  <div className="text-sm text-gray-600">Ciudades de Colombia</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">4</div>
                  <div className="text-sm text-gray-600">Funciones de IA</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-1">100%</div>
                  <div className="text-sm text-gray-600">Localizada para Colombia</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-medium mb-4">¿Listo para probar TutorApp?</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => onNavigate('search')} size="lg">
                  Buscar Tutores
                </Button>
                <Button onClick={() => onNavigate('profile')} variant="outline" size="lg">
                  Ver Mi Perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}