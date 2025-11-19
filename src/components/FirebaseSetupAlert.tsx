// Componente para mostrar alertas sobre configuración de Firebase
import React from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { AlertTriangle, ExternalLink } from 'lucide-react';

interface FirebaseSetupAlertProps {
  show: boolean;
  onDismiss?: () => void;
}

export function FirebaseSetupAlert({ show, onDismiss }: FirebaseSetupAlertProps) {
  if (!show) return null;

  const handleOpenFirebaseConsole = () => {
    window.open(
      'https://console.firebase.google.com/project/udconecta-4bfff/database/udconecta-4bfff-default-rtdb/rules',
      '_blank'
    );
  };

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50">
      <AlertTriangle className="size-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <div className="space-y-2">
          <p>
            <strong>Configuración optimizada disponible:</strong> Nuevas reglas de Firebase que permiten
            el cambio libre entre roles estudiante/tutor y mejoran el rendimiento.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenFirebaseConsole}
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <ExternalLink className="size-3 mr-1" />
              Configurar Firebase
            </Button>
            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className="text-orange-700 hover:bg-orange-100"
              >
                Entendido
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
