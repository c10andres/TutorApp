import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  Globe,
  Database,
  ArrowRight,
  Info
} from 'lucide-react';

export function FirebaseWebConsoleHelper() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const rulesContent = `{
  "rules": {
    "users": {
      ".read": "auth != null",
      ".indexOn": ["id", "email", "currentMode", "isAvailable", "subjects"],
      "$userId": {
        ".write": "auth != null && (auth.uid == $userId || auth != null)",
        ".validate": "newData.hasChildren(['id', 'email', 'name', 'currentMode'])"
      }
    },
    "requests": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["tutorId", "studentId", "status", "createdAt", "userId"]
    },
    "notifications": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["userId", "createdAt", "read", "type", "requestId"]
    },
    "reviews": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["tutorId", "studentId", "requestId", "createdAt"]
    },
    "chats": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["participants", "lastMessageTime", "requestId", "createdAt"]
    },
    "messages": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["chatId", "senderId", "timestamp", "type", "read"]
    },
    "payments": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["userId", "requestId", "status", "createdAt"]
    },
    "subjects": {
      ".read": true,
      ".write": "auth != null",
      ".indexOn": ["category", "name"]
    },
    "$other": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}`;

  const handleCopy = (content: string, stepNumber: number) => {
    navigator.clipboard.writeText(content);
    setCopiedStep(stepNumber);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const steps = [
    {
      title: "Abrir Firebase Console",
      description: "Ve a la consola web de Firebase",
      action: "Abrir Firebase Console",
      url: "https://console.firebase.google.com"
    },
    {
      title: "Navegar a Realtime Database",
      description: "Selecciona tu proyecto → Realtime Database → Rules",
      action: "Ir a Rules"
    },
    {
      title: "Reemplazar reglas",
      description: "Borra el contenido actual y pega las nuevas reglas",
      action: "Copiar reglas",
      content: rulesContent
    },
    {
      title: "Publicar cambios",
      description: "Haz clic en 'Publish' para aplicar los índices",
      action: "Publish"
    }
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto border-blue-200 bg-blue-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="size-5 text-blue-600" />
          <CardTitle className="text-blue-800">
            Solución sin terminal: Firebase Web Console
          </CardTitle>
        </div>
        <CardDescription className="text-blue-700">
          Configura los índices directamente desde el navegador sin necesidad de instalar Firebase CLI
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-4 p-3 bg-white rounded-lg border border-blue-200">
            <div className="flex-shrink-0">
              <div className="size-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium text-sm">
                {index + 1}
              </div>
            </div>
            
            <div className="flex-1 space-y-2">
              <div>
                <h4 className="font-medium text-blue-900">{step.title}</h4>
                <p className="text-sm text-blue-700">{step.description}</p>
              </div>
              
              <div className="flex gap-2">
                {step.url && (
                  <Button
                    size="sm"
                    onClick={() => window.open(step.url, '_blank')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <ExternalLink className="size-3 mr-1" />
                    {step.action}
                  </Button>
                )}
                
                {step.content && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(step.content!, index)}
                    className="text-blue-700 border-blue-300 hover:bg-blue-100"
                  >
                    {copiedStep === index ? (
                      <CheckCircle className="size-3 mr-1 text-green-600" />
                    ) : (
                      <Copy className="size-3 mr-1" />
                    )}
                    {copiedStep === index ? 'Copiado' : step.action}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <div className="mt-6 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-2">
            <Info className="size-4 text-green-600 mt-0.5" />
            <div className="text-sm text-green-700">
              <p className="font-medium mb-1">Después de publicar:</p>
              <p>Los índices se propagarán en 1-2 minutos y la alerta naranja desaparecerá automáticamente.</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-blue-600 pt-2 border-t border-blue-200">
          <Database className="size-3" />
          <span>Esta configuración aplicará todos los índices necesarios para eliminar los warnings</span>
        </div>
      </CardContent>
    </Card>
  );
}
