// Página de perfil de usuario
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
// Layout ahora se maneja desde App.tsx con ResponsiveContainer y MobileNavigation
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { User, Subject } from '../types';
import { tutoringService } from '../services/tutoring';
import { MasterUserInfo } from '../components/MasterUserInfo';
import { 
  Camera, 
  Save, 
  Plus, 
  X, 
  Star, 
  MapPin, 
  Phone, 
  Mail,
  GraduationCap,
  DollarSign,
  Clock,
  Users,
  Loader2,
  CheckCircle,
  AlertCircle,
  BookOpen,
  UserCheck
} from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  // Verificar que el usuario esté cargado
  if (!user) {
    return (
      <div className="p-4 bg-gray-50 min-h-screen w-full max-w-full overflow-x-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Cargando perfil...</h1>
            <p className="text-gray-600">Por favor espera mientras cargamos tu información.</p>
          </div>
        </div>
      </div>
    );
  }
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newAchievement, setNewAchievement] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    // Tutor specific
    subjects: user?.subjects || [],
    hourlyRate: user?.hourlyRate || 0,
    availability: user?.availability || false,
    experience: user?.experience || '',
    education: user?.education || '',
    languages: user?.languages || ['Español'], // Usar datos del usuario o valor por defecto
    totalStudents: user?.totalStudents || 0, // Usar datos del usuario o valor por defecto
    responseTime: user?.responseTime || 'Menos de 1 hora', // Usar datos del usuario o valor por defecto
    achievements: user?.achievements || [], // Usar datos del usuario o valor por defecto
    // Student specific
    grade: user?.grade || '',
    studentCode: user?.studentCode || '',
    preferredSubjects: user?.preferredSubjects || [],
  });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const subjectsData = await tutoringService.getSubjects();
      setSubjects(subjectsData);
    } catch (err) {
      console.error('Error loading subjects:', err);
    }
  };

  useEffect(() => {
    // Actualizar formData cuando el usuario cambie
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        // Tutor specific
        subjects: user.subjects || [],
        hourlyRate: user.hourlyRate || 0,
        availability: user.availability || false,
        experience: user.experience || '',
        education: user.education || '',
        languages: user.languages || ['Español'], // Usar datos del usuario o valor por defecto
        totalStudents: user.totalStudents || 0, // Usar datos del usuario o valor por defecto
        responseTime: user.responseTime || 'Menos de 1 hora', // Usar datos del usuario o valor por defecto
        achievements: user.achievements || [], // Usar datos del usuario o valor por defecto
        // Student specific
        grade: user.grade || '',
        studentCode: user.studentCode || '',
        preferredSubjects: user.preferredSubjects || [],
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (message) setMessage(null);
    
    // Validaciones en tiempo real
    validateField(field, value);
  };

  const validateField = (field: string, value: any) => {
    let isValid = true;
    let errorMessage = '';

    switch (field) {
      case 'name':
        if (!value || value.trim().length < 2) {
          isValid = false;
          errorMessage = 'El nombre debe tener al menos 2 caracteres';
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          errorMessage = 'Ingresa un correo electrónico válido';
        }
        break;
      case 'phone':
        if (value && !/^[0-9+\-\s()]+$/.test(value)) {
          isValid = false;
          errorMessage = 'Ingresa un número de teléfono válido';
        }
        break;
      case 'hourlyRate':
        if (value && (isNaN(value) || value < 0)) {
          isValid = false;
          errorMessage = 'La tarifa debe ser un número positivo';
        }
        break;
    }

    if (!isValid) {
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  const addSubject = (type: 'teaching' | 'learning') => {
    if (newSubject.trim()) {
      const field = type === 'teaching' ? 'subjects' : 'preferredSubjects';
      const currentSubjects = formData[field];
      
      if (!currentSubjects.includes(newSubject.trim())) {
        setFormData(prev => ({
          ...prev,
          [field]: [...currentSubjects, newSubject.trim()],
        }));
        setNewSubject('');
      }
    }
  };

  const removeSubject = (subjectToRemove: string, type: 'teaching' | 'learning') => {
    const field = type === 'teaching' ? 'subjects' : 'preferredSubjects';
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(subject => subject !== subjectToRemove),
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      const currentLanguages = formData.languages;
      
      if (!currentLanguages.includes(newLanguage.trim())) {
        setFormData(prev => ({
          ...prev,
          languages: [...currentLanguages, newLanguage.trim()],
        }));
        setNewLanguage('');
      }
    }
  };

  const removeLanguage = (languageToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(language => language !== languageToRemove),
    }));
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      const currentAchievements = formData.achievements;
      
      if (!currentAchievements.includes(newAchievement.trim())) {
        setFormData(prev => ({
          ...prev,
          achievements: [...currentAchievements, newAchievement.trim()],
        }));
        setNewAchievement('');
      }
    }
  };

  const removeAchievement = (achievementToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter(achievement => achievement !== achievementToRemove),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      console.log('🔍 ProfilePage: Iniciando guardado...');
      console.log('📊 ProfilePage: formData actual:', formData);

      // Validaciones básicas
      if (!formData.name.trim()) {
        setMessage({ type: 'error', text: 'El nombre es requerido' });
        return;
      }

      // Validaciones para perfil de tutor
      if (user?.currentMode === 'tutor') {
        if (formData.subjects.length === 0) {
          setMessage({ type: 'error', text: 'Debes agregar al menos una materia que enseñes' });
          return;
        }
        if (formData.hourlyRate <= 0) {
          setMessage({ type: 'error', text: 'La tarifa por hora debe ser mayor a 0' });
          return;
        }
      }

      console.log('✅ ProfilePage: Validaciones pasadas, llamando updateProfile...');
      
      // Actualizar perfil
      const updatedUser = await updateProfile(formData);
      
      console.log('🎉 ProfilePage: updateProfile completado');
      console.log('👤 ProfilePage: Usuario actualizado:', updatedUser);
      
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      
    } catch (err) {
      console.error('❌ ProfilePage: Error al guardar:', err);
      setMessage({ type: 'error', text: 'Error al guardar el perfil' });
    } finally {
      setSaving(false);
    }
  };

  const renderTutorTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg mb-4">Información como tutor</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Tarifa por hora (Cop)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 size-4 text-gray-400" />
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="50"
                  placeholder="300"
                  value={formData.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', parseInt(e.target.value) || 0)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Disponibilidad</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="availability"
                  checked={formData.availability}
                  onCheckedChange={(checked: boolean) => handleInputChange('availability', checked)}
                />
                <span className="text-sm">
                  {formData.availability ? 'Disponible para nuevas clases' : 'No disponible'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="education">Educación</Label>
            <Input
              id="education"
              placeholder="Ej: Licenciatura en Matemáticas - UNAM"
              value={formData.education}
              onChange={(e) => handleInputChange('education', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experiencia enseñando</Label>
            <Textarea
              id="experience"
              placeholder="Describe tu experiencia profesional y docente..."
              value={formData.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Materias que enseñas</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.subjects.map((subject) => (
                <Badge key={subject} variant="secondary" className="flex items-center gap-1">
                  {subject}
                  <button
                    type="button"
                    onClick={() => removeSubject(subject, 'teaching')}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Agregar materia que enseñas"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSubject('teaching')}
              />
              <Button type="button" variant="outline" onClick={() => addSubject('teaching')}>
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Idiomas</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.languages.map((language) => (
                <Badge key={language} variant="outline" className="flex items-center gap-1">
                  {language}
                  <button
                    type="button"
                    onClick={() => removeLanguage(language)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Agregar idioma"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
              />
              <Button type="button" variant="outline" onClick={addLanguage}>
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalStudents">Estudiantes ayudados</Label>
              <Input
                id="totalStudents"
                type="number"
                min="0"
                placeholder="0"
                value={formData.totalStudents}
                onChange={(e) => handleInputChange('totalStudents', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responseTime">Tiempo de respuesta</Label>
              <Input
                id="responseTime"
                placeholder="Ej: Menos de 1 hora"
                value={formData.responseTime}
                onChange={(e) => handleInputChange('responseTime', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Logros y certificaciones</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.achievements.map((achievement) => (
                <Badge key={achievement} variant="secondary" className="flex items-center gap-1">
                  {achievement}
                  <button
                    type="button"
                    onClick={() => removeAchievement(achievement)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Agregar logro o certificación"
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addAchievement()}
              />
              <Button type="button" variant="outline" onClick={addAchievement}>
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudentTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg mb-4">Información como estudiante</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="grade">Grado/Nivel académico</Label>
            <Input
              id="grade"
              placeholder="Ej: Preparatoria, Universidad, etc."
              value={formData.grade}
              onChange={(e) => handleInputChange('grade', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Materias de interés (que quieres aprender)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.preferredSubjects.map((subject) => (
                <Badge key={subject} variant="secondary" className="flex items-center gap-1">
                  {subject}
                  <button
                    type="button"
                    onClick={() => removeSubject(subject, 'learning')}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Agregar materia de interés"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSubject('learning')}
              />
              <Button type="button" variant="outline" onClick={() => addSubject('learning')}>
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStats = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="size-5 text-yellow-500" />
            Estadísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl text-blue-600">{user?.rating || 0}</div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-green-600">{user?.totalReviews || 0}</div>
              <div className="text-sm text-gray-600">Reseñas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-purple-600">156</div>
              <div className="text-sm text-gray-600">Horas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-orange-600">24</div>
              <div className="text-sm text-gray-600">Estudiantes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen w-full max-w-full overflow-x-hidden" style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl mb-2">Mi perfil</h1>
            <p className="text-gray-600">
              Administra tu información personal como estudiante y tutor
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={user?.currentMode === 'tutor' ? 'default' : 'secondary'} className="capitalize">
              Modo actual: {user?.currentMode === 'student' ? 'Estudiante' : 'Tutor'}
            </Badge>
          </div>
        </div>

        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            {message.type === 'success' ? (
              <CheckCircle className="size-4" />
            ) : (
              <AlertCircle className="size-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Stats Card */}
        {renderStats()}

        {/* Master User Info - Solo visible para usuarios maestros */}
        <MasterUserInfo />

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Información personal</CardTitle>
            <CardDescription>
              Esta información será visible para otros usuarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="size-20">
                <AvatarImage src={formData.avatar} />
                <AvatarFallback className="text-lg">
                  {formData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">
                  <Camera className="size-4 mr-2" />
                  Cambiar foto
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG o GIF hasta 5MB
                </p>
              </div>
            </div>

            <Separator />

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 size-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 size-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+52 55 1234 5678"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 size-4 text-gray-400" />
                  <Input
                    id="location"
                    placeholder="Ciudad, Estado"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentCode">Código Estudiantil</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 size-4 text-gray-400" />
                  <Input
                    id="studentCode"
                    placeholder="202412345"
                    value={formData.studentCode}
                    onChange={(e) => handleInputChange('studentCode', e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Tu código estudiantil universitario (opcional)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografía</Label>
              <Textarea
                id="bio"
                placeholder="Cuéntanos sobre ti, tus intereses y experiencia..."
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={3}
              />
            </div>

            <Separator />

            {/* Tabs for Student/Tutor specific info */}
            <Tabs defaultValue="tutor" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tutor" className="flex items-center gap-2">
                  <GraduationCap className="size-4" />
                  Como Tutor
                </TabsTrigger>
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <BookOpen className="size-4" />
                  Como Estudiante
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="tutor" className="mt-6">
                {renderTutorTab()}
              </TabsContent>
              
              <TabsContent value="student" className="mt-6">
                {renderStudentTab()}
              </TabsContent>
            </Tabs>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="size-4 mr-2" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
