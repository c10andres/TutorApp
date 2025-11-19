// Componente para opciones de prueba - Solo visible para usuarios maestros
import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Bell, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createDemoNotifications, clearDemoNotifications } from '../utils/demo-notifications';
import { notificationsService } from '../services/notifications';
import { platformDiagnostics } from '../utils/platform-diagnostics';

interface TestUserOptionsProps {
  user: any;
  className?: string;
}

export function TestUserOptions({ user, className = '' }: TestUserOptionsProps) {
  const { isTestUser } = useAuth();

  // Solo mostrar si es usuario maestro
  if (!isTestUser(user)) {
    return null;
  }

  return (
    <div className={`mt-4 pt-4 border-t border-blue-400 ${className}`}>
      <p className="text-blue-200 text-sm mb-2 flex items-center gap-2">
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          USUARIO MAESTRO
        </Badge>
        🔔 Opciones de prueba - Solo visible para administradores
      </p>
      <div className="flex gap-2 flex-wrap">
        <Button 
          variant="outline"
          size="sm"
          onClick={async () => {
            console.log('🔔 Test button clicked');
            if (user?.id) {
              try {
                await notificationsService.createNotification({
                  userId: user.id,
                  type: 'message',
                  title: '🔔 Notificación de prueba',
                  message: 'Esta es una notificación de prueba para verificar que funciona el sistema.',
                  read: false,
                  data: { test: true }
                });
                console.log('✅ Test notification created');
              } catch (error) {
                console.error('❌ Error creating test notification:', error);
              }
            }
          }}
          className="text-white border-white hover:bg-white hover:text-blue-600"
        >
          <Bell className="size-4 mr-2" />
          Test Simple
        </Button>
        <Button 
          variant="outline"
          size="sm"
          onClick={async () => {
            console.log('🔔 Demo button clicked');
            if (user?.id) {
              await createDemoNotifications(user.id);
              console.log('✅ Demo notifications creation completed');
            }
          }}
          className="text-white border-white hover:bg-white hover:text-blue-600"
        >
          Demo
        </Button>
        <Button 
          variant="outline"
          size="sm"
          onClick={async () => {
            console.log('🗑️ Clear button clicked');
            if (user?.id) {
              await clearDemoNotifications(user.id);
              console.log('✅ Demo notifications cleared');
            }
          }}
          className="text-white border-white hover:bg-white hover:text-blue-600"
        >
          Limpiar
        </Button>
        <Button 
          variant="outline"
          size="sm"
          onClick={async () => {
            console.log('🔍 Platform diagnostics clicked');
            try {
              const diagnostics = await platformDiagnostics.runDiagnostics();
              const report = platformDiagnostics.generateReport(diagnostics);
              console.log('📊 Platform Diagnostics Report:');
              console.log(report);
              alert('Diagnóstico completado. Ver consola para detalles.');
            } catch (error) {
              console.error('❌ Error running diagnostics:', error);
              alert('Error ejecutando diagnóstico');
            }
          }}
          className="text-white border-white hover:bg-white hover:text-blue-600"
        >
          🔍 Diagnóstico
        </Button>
      </div>
    </div>
  );
}
