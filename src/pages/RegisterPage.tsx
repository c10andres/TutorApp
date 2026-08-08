// Página de registro
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Checkbox } from '../components/ui/checkbox';
import { Loader2, Eye, EyeOff, UserPlus } from 'lucide-react';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

export function RegisterPage({ onNavigateToLogin }: RegisterPageProps) {
  const { signUp, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return false;
    }

    if (!consentAccepted) {
      setError('Debes aceptar el consentimiento informado y tratamiento de datos.');
      return false;
    }

    if (!formData.email.trim()) {
      setError('El correo electrónico es requerido');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return false;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      await signUp(formData.email, formData.password, formData.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl text-blue-600 mb-2">TutorApp</h1>
          <p className="text-gray-600">Únete a nuestra comunidad educativa</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Crear Cuenta</CardTitle>
            <CardDescription className="text-center">
              Completa la información para registrarte. Podrás ser tanto estudiante como tutor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={loading}
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
              </div>



              {/* Consentimiento Informado (Thesis Requirement) */}
              <div className="flex items-start space-x-2 py-4 px-1">
                <Checkbox
                  id="consent"
                  checked={consentAccepted}
                  onCheckedChange={(checked) => setConsentAccepted(checked as boolean)}
                  className="mt-1"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="consent"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Consentimiento de Privacidad y Uso de Datos.
                  </label>
                  <p className="text-xs text-muted-foreground text-gray-600">
                    Acepto participar en estas pruebas bajo las normas básicas de respeto. Entiendo y acepto que <strong>todos mis datos personales y registros serán eliminados permanentemente</strong> al finalizar las pruebas del prototipo (Habeas Data).
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <UserPlus className="size-4 mr-2" />
                    Crear Cuenta
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">o</span>
                </div>
              </div>

              <div className="text-center mt-4">
                <span className="text-sm text-gray-600">¿Ya tienes cuenta? </span>
                <button
                  onClick={onNavigateToLogin}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Inicia sesión aquí
                </button>
              </div>
            </div>

            {/* Master Users info - HIDDEN as per user request */}
            {/* 
            <div className="mt-6 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-700 mb-2 flex items-center gap-1">
                <span className="text-yellow-600">👑</span>
                <strong>¿Quieres acceso de desarrollo?</strong>
              </p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Regístrate con estos emails para obtener permisos especiales:</p>
                <p><strong>• CarlosAdminEstudiante@gmail.com</strong> (funcionalidades de estudiante)</p>
                <p><strong>• CarlosAdminTutor@gmail.com</strong> (funcionalidades de tutor)</p>
                <p className="text-orange-600 mt-2">🔑 Incluye opciones de prueba y desarrollo</p>
              </div>
            </div>
            */}

            {/* Features info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Con tu cuenta podrás:</strong>
              </p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>✓ Solicitar tutorías como estudiante</li>
                <li>✓ Ofrecer tutorías como tutor</li>
                <li>✓ Cambiar entre modos fácilmente</li>
                <li>✓ Gestionar un perfil completo</li>
              </ul>
            </div>

            {/* Terms */}
            {/* Terms */}
            <div className="flex justify-center gap-2 text-xs text-gray-500 mt-4">
              <span>Al crear una cuenta, aceptas nuestros</span>

              <Dialog>
                <DialogTrigger asChild>
                  <button className="text-blue-600 hover:underline">
                    Términos de Servicio
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Términos y Condiciones del Prototipo</DialogTitle>
                    <DialogDescription>
                      Por favor lea atentamente los siguientes términos antes de continuar.
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4 text-sm text-gray-700">
                      <p><strong>1. Naturaleza Académica:</strong> Esta aplicación es un prototipo desarrollado exclusivamente con fines académicos como parte de un proyecto de grado.</p>
                      <p><strong>2. Sin Garantías:</strong> El servicio se proporciona "tal cual" para pruebas de funcionalidad. No se garantiza la disponibilidad continua ni la integridad de los datos a largo plazo.</p>
                      <p><strong>3. Datos de Prueba:</strong> Los datos ingresados (calificaciones, horarios, perfiles) se utilizarán únicamente para validar el funcionamiento de los algoritmos de emparejamiento y predicción académica.</p>
                      <p><strong>4. Eliminación de Datos:</strong> Al finalizar el periodo de evaluación académica, todas las bases de datos y registros de usuarios serán eliminados permanentemente.</p>
                      <p><strong>5. Conducta:</strong> Se espera un comportamiento respetuoso en los foros y chats. El contenido ofensivo será moderado automáticamente.</p>
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>

              <span>y</span>

              <Dialog>
                <DialogTrigger asChild>
                  <button className="text-blue-600 hover:underline">
                    Política de Privacidad
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Política de Privacidad y Habeas Data</DialogTitle>
                    <DialogDescription>
                      Tratamiento de sus datos personales en este experimento académico.
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4 text-sm text-gray-700">
                      <p><strong>1. Recolección de Datos:</strong> Recolectamos su nombre, correo electrónico y datos académicos simulados o reales según su elección para probar las funciones de la aplicación.</p>
                      <p><strong>2. Uso de la Información:</strong> Su información será procesada localmente y en la nube (Firebase) para:
                        <ul className="list-disc pl-5 mt-1">
                          <li>Autenticación de usuarios.</li>
                          <li>Cálculo de predicciones académicas.</li>
                          <li>Emparejamiento con tutores.</li>
                        </ul>
                      </p>
                      <p><strong>3. Derechos del Usuario (Habeas Data):</strong> Usted tiene derecho a conocer, actualizar, rectificar y suprimir sus datos personales. Puede eliminar su cuenta en cualquier momento desde la sección de Perfil.</p>
                      <p><strong>4. Confidencialidad:</strong> Sus datos no serán compartidos con terceros ni utilizados para fines comerciales.</p>
                      <p><strong>5. Consentimiento Informado:</strong> Al registrarse, usted acepta voluntariamente participar en esta prueba de concepto bajo las condiciones descritas.</p>
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div >
  );
}
