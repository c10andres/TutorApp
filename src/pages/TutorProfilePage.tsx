import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User } from '../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  MapPin, 
  DollarSign, 
  Clock, 
  BookOpen, 
  MessageCircle, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Calendar,
  Award,
  Users
} from 'lucide-react';

interface Tutor {
  id: string;
  name: string;
  email: string;
  avatar: string;
  rating: number;
  totalReviews: number;
  hourlyRate: number;
  location: string;
  bio: string;
  subjects: string[];
  availability: boolean;
  experience: string;
  education: string;
  languages: string[];
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  achievements: string[];
  totalStudents: number;
  responseTime: string;
}

interface TutorProfilePageProps {
  onNavigate: (page: string, data?: any) => void;
  tutor?: User;
  tutorId?: string;
}

export default function TutorProfilePage({ onNavigate, tutor, tutorId }: TutorProfilePageProps) {
  const [tutorData, setTutorData] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTutorProfile = async () => {
      setLoading(true);
      
      if (tutor) {
        // Usar los datos reales del tutor
        const enhancedTutorData: Tutor = {
          id: tutor.id,
          name: tutor.name,
          email: tutor.email || '',
          avatar: tutor.avatar || '',
          rating: tutor.rating,
          totalReviews: tutor.totalReviews,
          hourlyRate: tutor.hourlyRate,
          location: tutor.location || '',
          bio: tutor.bio || '',
          subjects: tutor.subjects,
          availability: tutor.availability,
          // Datos reales del tutor
          experience: tutor.experience || 'No especificado',
          education: tutor.education || 'No especificado',
          languages: tutor.languages || ['Español'],
          totalStudents: tutor.totalStudents || 0,
          responseTime: tutor.responseTime || 'No especificado',
          achievements: tutor.achievements || [],
          // Horarios por defecto (se pueden expandir en el futuro)
          schedule: [
            { day: 'Lunes', startTime: '09:00', endTime: '17:00' },
            { day: 'Martes', startTime: '09:00', endTime: '17:00' },
            { day: 'Miércoles', startTime: '09:00', endTime: '17:00' },
            { day: 'Jueves', startTime: '09:00', endTime: '17:00' },
            { day: 'Viernes', startTime: '09:00', endTime: '17:00' },
          ]
        };

        setTutorData(enhancedTutorData);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    loadTutorProfile();
  }, [tutor]);

  const formatPriceCOP = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 min-h-screen w-full max-w-full overflow-x-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tutorData) {
    return (
      <div className="p-4 bg-gray-50 min-h-screen w-full max-w-full overflow-x-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Tutor no encontrado</h1>
            <p className="text-gray-600 mb-6">El tutor que buscas no está disponible.</p>
            <Button onClick={() => onNavigate('home')} variant="outline">
              <ArrowLeft className="size-4 mr-2" />
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen w-full max-w-full overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header con botón de regreso */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            onClick={() => onNavigate('search')} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="size-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Perfil del Tutor</h1>
        </div>

        {/* Información principal del tutor */}
        <Card className="w-full max-w-full overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Avatar y info básica */}
              <div className="flex flex-col sm:flex-row gap-4 lg:flex-col lg:items-center">
                <Avatar className="size-24 lg:size-32 shrink-0">
                  <AvatarImage src={tutorData.avatar} />
                  <AvatarFallback className="text-lg">
                    {tutorData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{tutorData.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="size-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{tutorData.rating}</span>
                          <span className="text-gray-500">({tutorData.totalReviews} reseñas)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className={`size-2 rounded-full ${tutorData.availability ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="text-sm text-gray-600">
                            {tutorData.availability ? 'Disponible' : 'Ocupado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ubicación */}
                  {tutorData.location && (
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="size-4 text-gray-400" />
                      <span className="text-gray-600">{tutorData.location}</span>
                    </div>
                  )}

                  {/* Precio por hora */}
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="size-4 text-gray-400" />
                    <span className="text-xl font-bold text-green-600">
                      {formatPriceCOP(tutorData.hourlyRate)}/hora
                    </span>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      size="lg" 
                      className="flex-1"
                      onClick={() => onNavigate('request-tutoring', { tutor: tutorData })}
                    >
                      <MessageCircle className="size-4 mr-2" />
                      Solicitar Clase
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información detallada */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Biografía */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="size-5" />
                Sobre mí
              </h3>
              <p className="text-gray-700 leading-relaxed">{tutorData.bio}</p>
            </CardContent>
          </Card>

          {/* Especialidades */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="size-5" />
                Especialidades
              </h3>
              <div className="flex flex-wrap gap-2">
                {tutorData.subjects.map((subject) => (
                  <Badge key={subject} variant="secondary" className="text-sm">
                    {subject}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Experiencia y Educación */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Experiencia</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-gray-400" />
                  <span className="text-gray-700">{tutorData.experience} de experiencia</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-gray-400" />
                  <span className="text-gray-700">{tutorData.totalStudents} estudiantes ayudados</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-gray-400" />
                  <span className="text-gray-700">{tutorData.education}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Idiomas */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Idiomas</h3>
              <div className="flex flex-wrap gap-2">
                {tutorData.languages.map((language) => (
                  <Badge key={language} variant="outline" className="text-sm">
                    {language}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Horarios */}
          <Card>
            <CardContent className="p6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="size-5" />
                Horarios Disponibles
              </h3>
              <div className="space-y-2">
                {tutorData.schedule.map((schedule => (
                  <div key={schedule.day} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="font-medium">{schedule.day}</span>
                    <span className="text-gray-600">{schedule.startTime} - {schedule.endTime}</span>
                  </div>
                )))}
              </div>
            </CardContent>
          </Card>

          {/* Logros */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Logros</h3>
              <div className="space-y-2">
                {tutorData.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Award className="size-4 text-yellow-500" />
                    <span className="text-gray-700">{achievement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información adicional */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Información Adicional</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-gray-400" />
                <span className="text-gray-700">Tiempo de respuesta: {tutorData.responseTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="size-4 text-green-500" />
                <span className="text-gray-700">Perfil verificado</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
