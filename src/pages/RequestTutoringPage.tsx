// Página para solicitar tutoría
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { User, TutorRequest } from '../types';
import { tutoringService } from '../services/tutoring';
// Removed: paymentService, PaymentMethodSelector, credit card imports
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  CheckCircle,
  Star,
  UserIcon,
  Loader2,
  AlertCircle,
  BookOpen,
  MessageSquare,
  Video,
  Home,
  CalendarDays,
  Time,
  CheckCircle2,
  Award // Added Award icon for points
} from 'lucide-react';

interface RequestTutoringPageProps {
  onNavigate: (page: string, data?: any) => void;
  tutor?: User;
}

const SUBJECTS = [
  'Matemáticas', 'Física', 'Química', 'Biología', 'Historia', 'Geografía',
  'Literatura', 'Inglés', 'Francés', 'Programación', 'Estadística',
  'Cálculo', 'Álgebra', 'Geometría', 'Filosofía', 'Psicología'
];

const DURATION_OPTIONS = [
  { value: 60, label: '1 hora' },
  { value: 90, label: '1.5 horas' },
  { value: 120, label: '2 horas' }
];

// Horarios disponibles para reserva
const AVAILABLE_HOURS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00'
];

export function RequestTutoringPage({ onNavigate, tutor }: RequestTutoringPageProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    preferredDateTime: '',
    duration: 60,
    location: 'online',
    customLocation: '',
    isEmergency: false
  });

  // Estado para calendario avanzado
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  // Removed paymentConfirmation state

  if (!tutor || !user) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="size-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg mb-2">Información incompleta</h3>
            <p className="text-gray-600 mb-4">
              No se encontró información del tutor seleccionado
            </p>
            <Button onClick={() => onNavigate('search')}>
              Buscar tutores
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hourlyPoints = tutor.hourlyPoints || 5;
  const estimatedPoints = Math.ceil((hourlyPoints * formData.duration) / 60);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError('');
  };

  // Funciones para calendario avanzado
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      // Simular horarios disponibles (en producción vendría del backend)
      const availableHours = AVAILABLE_HOURS.filter((_, index) => index % 2 === 0);
      setAvailableSlots(availableHours);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      const dateTime = new Date(selectedDate);
      const [hours, minutes] = time.split(':');
      dateTime.setHours(parseInt(hours), parseInt(minutes));
      setFormData(prev => ({
        ...prev,
        preferredDateTime: dateTime.toISOString()
      }));
    }
  };

  const formatSelectedDateTime = () => {
    if (selectedDate && selectedTime) {
      return `${selectedDate.toLocaleDateString('es-CO')} a las ${selectedTime}`;
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar que todos los campos estén completos
    if (!formData.subject || !formData.preferredDateTime) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    setLoading(true);

    try {
      // Create request directly without payment processing
      const request = {
        studentId: user.id,
        tutorId: tutor.id,
        subject: formData.subject,
        description: formData.description,
        scheduledTime: new Date(formData.preferredDateTime),
        duration: formData.duration,
        location: formData.location === 'custom' ? formData.customLocation : formData.location,
        hourlyPoints: hourlyPoints,
        totalPoints: estimatedPoints,
        status: 'pending' as const,
        isEmergency: formData.isEmergency,
        isImmediate: formData.isEmergency,
        hasReview: false
      };

      await tutoringService.createRequest(request as any); // Cast to any if Typescript complains about optional deprecated fields
      setSuccess(true);
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      setError('Error al enviar la solicitud. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };


  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="size-8 text-green-600" />
            </div>

            <h2 className="text-xl mb-2">¡Solicitud enviada con éxito!</h2>
            <p className="text-gray-600 mb-6">
              Tu solicitud ha sido enviada a {tutor.name}. Te notificaremos cuando responda.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium mb-2">Detalles de la solicitud:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Materia:</span>
                  <span className="font-medium">{formData.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duración:</span>
                  <span className="font-medium">
                    {DURATION_OPTIONS.find(d => d.value === formData.duration)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Modalidad:</span>
                  <span className="font-medium">
                    {formData.location === 'online' ? 'Virtual' :
                      formData.location === 'tutor' ? 'Casa del tutor' :
                        formData.location === 'student' ? 'Mi casa' : formData.customLocation}
                  </span>
                </div>
                {/* Points Summary instead of Cost */}
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Valor Estimado:</span>
                  <div className="flex items-center gap-1 text-blue-600 font-medium">
                    <Award className="size-4" />
                    <span>{estimatedPoints} PM</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onNavigate('requests')}>
                Ver mis solicitudes
              </Button>
              <Button onClick={() => onNavigate('search')}>
                Buscar más tutores
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('search')}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl">Solicitar tutoría</h1>
          <p className="text-gray-600">Completa los detalles de tu clase</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tutor Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={tutor.avatar} alt={tutor.name} />
              <AvatarFallback>{tutor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h3 className="font-semibold text-lg">{tutor.name}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="size-4 fill-yellow-400 text-yellow-400" />
                  <span>{tutor.rating}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="size-4 text-gray-400" />
                  <span>{tutor.experience}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  <Award className="size-4" />
                  <span>{hourlyPoints} PM/hora</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-2">
                {tutor.subjects.slice(0, 3).map((subject) => (
                  <Badge key={subject} variant="secondary" className="text-xs">
                    {subject}
                  </Badge>
                ))}
                {tutor.subjects.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{tutor.subjects.length - 3} más
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-5" />
              Detalles de la clase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Subject */}
            <div>
              <Label htmlFor="subject">Materia</Label>
              <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la materia" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((subject) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe qué temas específicos necesitas reforzar..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Date and Time - Calendario Avanzado */}
            <div>
              <Label>Fecha y hora preferida</Label>
              <div className="space-y-4">
                {/* Botón para abrir calendario */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="w-full justify-start"
                >
                  <CalendarDays className="size-4 mr-2" />
                  {formatSelectedDateTime() || 'Seleccionar fecha y hora'}
                </Button>

                {/* Calendario y selector de hora */}
                {showCalendar && (
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Calendario */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Seleccionar fecha</Label>
                        <div className="border rounded-lg p-2">
                          <input
                            type="date"
                            value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                            onChange={(e) => handleDateSelect(new Date(e.target.value))}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full p-2 border-0 focus:ring-0"
                          />
                        </div>
                      </div>

                      {/* Selector de hora */}
                      {selectedDate && (
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Seleccionar hora</Label>
                          <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                            {availableSlots.map((time) => (
                              <Button
                                key={time}
                                type="button"
                                variant={selectedTime === time ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleTimeSelect(time)}
                                className="text-xs"
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Resumen de selección */}
                    {selectedDate && selectedTime && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-800">
                          <CheckCircle2 className="size-4" />
                          <span className="font-medium">
                            Clase programada para: {formatSelectedDateTime()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Duration */}
            <div>
              <Label>Duración</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {DURATION_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={formData.duration === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleInputChange('duration', option.value)}
                    className="flex flex-col gap-1 h-auto py-3"
                  >
                    <Clock className="size-4" />
                    <span className="text-xs">{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <Label>Modalidad</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  type="button"
                  variant={formData.location === 'online' ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleInputChange('location', 'online')}
                  className="flex flex-col gap-1 h-auto py-3"
                >
                  <Video className="size-4" />
                  <span className="text-xs">Virtual</span>
                </Button>

                <Button
                  type="button"
                  variant={formData.location === 'student' ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleInputChange('location', 'student')}
                  className="flex flex-col gap-1 h-auto py-3"
                >
                  <Home className="size-4" />
                  <span className="text-xs">Mi casa</span>
                </Button>
              </div>
            </div>

            {/* Emergency */}
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium">Clase urgente</Label>
                <p className="text-xs text-gray-600">
                  Solicitar clase para hoy o mañana (Alta prioridad)
                </p>
              </div>
              <Switch
                checked={formData.isEmergency}
                onCheckedChange={(checked) => handleInputChange('isEmergency', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
          disabled={loading || !formData.subject || !formData.preferredDateTime}
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Enviando solicitud...
            </>
          ) : (
            <>
              <CheckCircle className="size-4 mr-2" />
              Enviar Solicitud
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
