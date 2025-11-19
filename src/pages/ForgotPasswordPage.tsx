// Página de recuperación de contraseña
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigateToLogin: () => void;
}

export function ForgotPasswordPage({ onNavigateToLogin }: ForgotPasswordPageProps) {
  const { resetPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el correo de recuperación');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="size-8 text-green-600" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-xl">¡Correo enviado exitosamente!</h2>
                  <p className="text-gray-600 text-sm">
                    Hemos enviado un enlace de recuperación a <strong>{email}</strong>
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  <p className="text-sm text-gray-600">
                    Revisa tu bandeja de entrada y busca el correo de <strong>TutorApp</strong>. 
                    Haz clic en el enlace para restablecer tu contraseña.
                  </p>
                  
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Consejo:</strong> Si no encuentras el correo, revisa tu carpeta de spam o correo no deseado.
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={onNavigateToLogin}
                    className="w-full"
                  >
                    <ArrowLeft className="size-4 mr-2" />
                    Volver al inicio de sesión
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    ¿No recibiste el correo? Revisa tu carpeta de spam o{' '}
                    <button
                      onClick={() => setSuccess(false)}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      intenta enviar de nuevo
                    </button>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl text-blue-600 mb-2">TutorApp</h1>
          <p className="text-gray-600">Recupera el acceso a tu cuenta</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              ¿Olvidaste tu contraseña?
            </CardTitle>
            <CardDescription className="text-center">
              Ingresa tu correo electrónico y te enviaremos un enlace seguro para restablecer tu contraseña
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
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 size-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    disabled={loading}
                    autoComplete="email"
                    className="pl-10"
                  />
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
                    Enviando...
                  </>
                ) : (
                  'Enviar enlace de recuperación'
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
                <Button
                  variant="ghost"
                  onClick={onNavigateToLogin}
                  className="text-sm"
                >
                  <ArrowLeft className="size-4 mr-2" />
                  Volver al inicio de sesión
                </Button>
              </div>
            </div>

            {/* Demo note */}
            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Nota de demostración:</strong> En esta versión de prueba, el correo de recuperación se simula. 
                En la aplicación real, recibirías un correo con un enlace seguro para restablecer tu contraseña.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}