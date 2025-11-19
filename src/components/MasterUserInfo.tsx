// Componente informativo para usuarios maestros
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Shield, Crown, Key, Eye, TestTube } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function MasterUserInfo() {
  const { user, isTestUser } = useAuth();

  // Solo mostrar si es usuario maestro
  if (!isTestUser(user)) {
    return null;
  }

  const masterUsers = [
    {
      email: 'CarlosAdminEstudiante@gmail.com',
      password: '98765',
      name: 'Carlos Admin Estudiante',
      mode: 'Estudiante',
      description: 'Usuario maestro enfocado en funcionalidades de estudiante'
    },
    {
      email: 'CarlosAdminTutor@gmail.com',
      password: '98765',
      name: 'Carlos Admin Tutor',
      mode: 'Tutor',
      description: 'Usuario maestro enfocado en funcionalidades de tutor'
    }
  ];

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="size-5 text-yellow-600" />
          Panel de Usuario Maestro
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            ACCESO ADMINISTRATIVO
          </Badge>
        </CardTitle>
        <CardDescription>
          Tienes acceso especial a opciones de prueba y desarrollo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-blue-200 bg-blue-50">
          <Shield className="size-4 text-blue-600" />
          <AlertDescription>
            <strong>🔑 Permisos especiales habilitados:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <TestTube className="size-4" />
                Panel de debug para contadores de estadísticas
              </li>
              <li className="flex items-center gap-2">
                <Eye className="size-4" />
                Opciones de prueba de notificaciones
              </li>
              <li className="flex items-center gap-2">
                <Key className="size-4" />
                Creación de solicitudes de prueba
              </li>
              <li className="flex items-center gap-2">
                <Shield className="size-4" />
                Acceso completo a funcionalidades de validación
              </li>
            </ul>
          </AlertDescription>
        </Alert>

        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Crown className="size-4 text-yellow-600" />
            Usuarios Maestros Disponibles
          </h4>
          <div className="grid gap-3">
            {masterUsers.map((masterUser, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border-2 ${
                  user?.email === masterUser.email 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {masterUser.name}
                      {user?.email === masterUser.email && (
                        <Badge className="bg-green-100 text-green-800">
                          ACTIVO
                        </Badge>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">{masterUser.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      📧 {masterUser.email} | 🔑 {masterUser.password} | 👤 {masterUser.mode}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Alert className="border-orange-200 bg-orange-50">
          <AlertDescription>
            <strong>⚠️ Importante:</strong> Estas opciones están ocultas para usuarios regulares. 
            Solo los usuarios maestros pueden ver y usar las funcionalidades de prueba.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
