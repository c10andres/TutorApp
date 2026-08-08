// Componente para generar interacciones basadas en respuestas de encuesta
// Solo visible para usuarios maestros

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { surveyInteractionsGenerator } from '../services/survey-interactions-generator';
import { allSurveyResponses } from '../data/survey-responses';
import { ref, get } from 'firebase/database';
import { database } from '../firebase';

export function SurveyInteractionsGenerator() {
  const { user, isTestUser } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Solo mostrar si es usuario maestro
  if (!user || !isTestUser(user)) {
    return null;
  }

  const handleGenerateInteractions = async () => {
    if (!user) return;

    try {
      setGenerating(true);
      setError('');
      setStatus('Iniciando generación de interacciones...');

      // Obtener usuarios existentes
      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);
      
      let userIds: string[] = [];
      if (usersSnapshot.exists()) {
        userIds = Object.keys(usersSnapshot.val());
        setStatus(`Usuarios encontrados: ${userIds.length}`);
      } else {
        setStatus('Creando IDs simulados para usuarios...');
        userIds = Array.from({ length: allSurveyResponses.length }, (_, i) => `user-${i + 1}`);
      }

      // Asegurar suficientes IDs
      while (userIds.length < allSurveyResponses.length) {
        userIds.push(`user-${userIds.length + 1}`);
      }

      setStatus(`Generando interacciones para ${allSurveyResponses.length} usuarios...`);
      setProgress({ current: 0, total: allSurveyResponses.length });

      let successCount = 0;
      let errorCount = 0;

      // Generar interacciones para cada respuesta
      for (let i = 0; i < allSurveyResponses.length; i++) {
        const userId = userIds[i];
        const surveyResponse = allSurveyResponses[i];

        try {
          await surveyInteractionsGenerator.generateInteractionsForUser(
            userId,
            surveyResponse,
            30 // Últimos 30 días
          );

          successCount++;
          setProgress({ current: i + 1, total: allSurveyResponses.length });
          setStatus(`Procesando usuario ${i + 1}/${allSurveyResponses.length}...`);

          // Pequeña pausa para no sobrecargar
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (err: any) {
          console.error(`Error para usuario ${userId}:`, err);
          errorCount++;
        }
      }

      setStatus(
        `✅ Completado! ${successCount} usuarios procesados exitosamente. ${errorCount} errores.`
      );
      
      // Resetear después de 5 segundos
      setTimeout(() => {
        setStatus('');
        setProgress({ current: 0, total: 0 });
      }, 5000);
    } catch (err: any) {
      setError(`Error: ${err.message}`);
      console.error('Error generando interacciones:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateForCurrentUser = async () => {
    if (!user) return;

    try {
      setGenerating(true);
      setError('');
      setStatus('Generando interacciones para tu usuario...');

      // Usar la primera respuesta de ejemplo (puedes cambiarla)
      const surveyResponse = allSurveyResponses[0];

      await surveyInteractionsGenerator.generateInteractionsForUser(
        user.id,
        surveyResponse,
        30
      );

      setStatus('✅ Interacciones generadas para tu usuario!');
      
      setTimeout(() => {
        setStatus('');
      }, 3000);
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Generador de Interacciones desde Encuesta
      </h2>
      
      <p className="text-gray-600 mb-4">
        Este componente genera interacciones de usuarios basadas en las respuestas de la encuesta de usabilidad.
        Las interacciones reflejarán el comportamiento que las respuestas de la encuesta sugieren.
      </p>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📊 Información</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Total de respuestas de encuesta: {allSurveyResponses.length}</li>
            <li>• Las interacciones se generan para los últimos 30 días</li>
            <li>• Cada interacción refleja las respuestas Q1-Q15 de la encuesta</li>
            <li>• Los datos se guardan en Firebase Realtime Database</li>
          </ul>
        </div>

        {status && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{status}</p>
            {progress.total > 0 && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-green-700 mt-1">
                  {progress.current} / {progress.total}
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleGenerateForCurrentUser}
            disabled={generating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? 'Generando...' : 'Generar para mi usuario'}
          </button>

          <button
            onClick={handleGenerateInteractions}
            disabled={generating}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? 'Generando...' : 'Generar para todos los usuarios'}
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <h4 className="font-semibold mb-2">Mapeo de Encuesta a Interacciones:</h4>
          <ul className="space-y-1 list-disc list-inside">
            <li>Q1 (Frecuencia) → app_opened, session_started, session_ended</li>
            <li>Q3, Q4 (Navegación) → page_viewed, navigation_click, back_button_used</li>
            <li>Q5 (Velocidad) → page_load_time, error_occurred</li>
            <li>Q9-Q11 (Búsqueda) → tutor_search_performed, tutor_profile_viewed</li>
            <li>Q12 (Chat) → chat_message_sent, chat_opened</li>
            <li>Q13 (Solicitudes) → tutoring_request_created, tutoring_request_completed</li>
            <li>Q14 (Pagos) → payment_completed, payment_failed</li>
            <li>Q15 (IA) → ai_feature_used, ai_suggestion_accepted</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
