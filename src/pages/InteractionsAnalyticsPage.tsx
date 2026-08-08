// Página para visualizar interacciones de usuarios y compararlas con la encuesta
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserInteractions } from '../hooks/useUserInteractions';
import { UserInteraction, UserInteractionSummary } from '../types';
import { surveyInteractionsGenerator } from '../services/survey-interactions-generator';
import { allSurveyResponses } from '../data/survey-responses';
import { BarChart3, TrendingUp, Clock, Search, MessageSquare, CreditCard, Brain, Activity, Users, AlertCircle, RefreshCw } from 'lucide-react';

interface InteractionsAnalyticsPageProps {
  onNavigate?: (page: string) => void;
}

export function InteractionsAnalyticsPage({ onNavigate }: InteractionsAnalyticsPageProps) {
  const { user } = useAuth();
  const { getUserSummary, getUserInteractions } = useUserInteractions();
  const [summary, setSummary] = useState<UserInteractionSummary | null>(null);
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [viewMode, setViewMode] = useState<'summary' | 'detailed' | 'comparison'>('summary');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    if (!user) {
      setError('No hay usuario autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log('📊 Cargando datos de interacciones para usuario:', user.id);

      const [summaryData, interactionsData] = await Promise.all([
        getUserSummary(selectedPeriod),
        getUserInteractions({ limit: 100 }),
      ]);

      console.log('📊 Resumen cargado:', summaryData);
      console.log('📊 Interacciones cargadas:', interactionsData.length);

      setSummary(summaryData);
      setInteractions(interactionsData);
    } catch (err: any) {
      console.error('❌ Error cargando datos:', err);
      setError(`Error cargando datos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInteractions = async () => {
    if (!user) {
      setError('No hay usuario autenticado');
      return;
    }

    try {
      setGenerating(true);
      setError('');

      // Usar la primera respuesta de encuesta como ejemplo
      const surveyResponse = allSurveyResponses[0];

      await surveyInteractionsGenerator.generateInteractionsForUser(
        user.id,
        surveyResponse,
        30 // Últimos 30 días
      );

      // Recargar datos después de generar
      await loadData();
    } catch (err: any) {
      console.error('Error generando interacciones:', err);
      setError(`Error generando interacciones: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando interacciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-semibold">Error</h3>
          </div>
          <p className="text-red-700">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Análisis de Interacciones
              </h1>
              <p className="text-gray-600">
                Visualiza tus interacciones y compáralas con las respuestas de la encuesta
              </p>
            </div>
            <button
              onClick={() => onNavigate?.('home')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              ← Volver
            </button>
          </div>

          {/* Filtros */}
          <div className="flex gap-4 items-center">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value={7}>Últimos 7 días</option>
              <option value={30}>Últimos 30 días</option>
              <option value={90}>Últimos 90 días</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('summary')}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === 'summary'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Resumen
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === 'detailed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Detallado
              </button>
              <button
                onClick={() => setViewMode('comparison')}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === 'comparison'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Comparación
              </button>
            </div>
          </div>
        </div>

        {/* Contenido según modo */}
        {viewMode === 'summary' && summary && (
          <SummaryView summary={summary} />
        )}

        {viewMode === 'detailed' && (
          <DetailedView interactions={interactions} />
        )}

        {viewMode === 'comparison' && summary && (
          <ComparisonView summary={summary} />
        )}

        {!summary && !loading && !error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="text-center mb-4">
              <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                No hay datos de interacciones disponibles
              </h3>
              <p className="text-yellow-800 mb-4">
                Para ver tus interacciones, primero necesitas generarlas basándote en las respuestas de la encuesta.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Generar interacciones ahora:</h4>
              <p className="text-sm text-gray-700 mb-4">
                Puedes generar interacciones basadas en las respuestas de la encuesta directamente desde aquí.
              </p>
              <button
                onClick={handleGenerateInteractions}
                disabled={generating}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generando interacciones...
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5" />
                    Generar Interacciones para mi Usuario
                  </>
                )}
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">O desde HomePage:</h4>
              <ol className="list-decimal list-inside space-y-1 text-xs text-gray-700">
                <li>Ve a la página principal</li>
                <li>Busca el componente "Generador de Interacciones desde Encuesta"</li>
                <li>Haz clic en "Generar para mi usuario"</li>
              </ol>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => onNavigate?.('home')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Ir a HomePage
              </button>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-semibold">Error al cargar datos</h3>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={loadData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reintentar
              </button>
              <button
                onClick={() => onNavigate?.('home')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Volver
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Vista de Resumen
function SummaryView({ summary }: { summary: UserInteractionSummary }) {
  const metrics = [
    {
      title: 'Frecuencia de Uso',
      icon: Activity,
      color: 'blue',
      items: [
        { label: 'Sesiones totales', value: summary.totalSessions },
        { label: 'Aperturas de app', value: summary.totalAppOpens },
        { label: 'Días activos', value: summary.daysActive },
        { label: 'Duración promedio sesión', value: `${Math.round(summary.averageSessionDuration / 60)} min` },
      ],
    },
    {
      title: 'Navegación',
      icon: BarChart3,
      color: 'green',
      items: [
        { label: 'Vistas de página', value: summary.totalPageViews },
        { label: 'Páginas únicas', value: summary.uniquePagesVisited },
        { label: 'Tiempo promedio carga', value: `${Math.round(summary.averagePageLoadTime)}ms` },
        { label: 'Tasa de errores', value: `${summary.errorRate.toFixed(1)}%` },
      ],
    },
    {
      title: 'Búsqueda de Tutores',
      icon: Search,
      color: 'purple',
      items: [
        { label: 'Búsquedas realizadas', value: summary.totalTutorSearches },
        { label: 'Filtros aplicados', value: summary.totalFiltersApplied },
        { label: 'Perfiles vistos', value: summary.totalTutorProfilesViewed },
        { label: 'Resultados promedio', value: summary.averageSearchResults.toFixed(1) },
      ],
    },
    {
      title: 'Chat',
      icon: MessageSquare,
      color: 'orange',
      items: [
        { label: 'Mensajes enviados', value: summary.totalChatMessages },
        { label: 'Sesiones de chat', value: summary.totalChatSessions },
        { label: 'Tiempo promedio respuesta', value: `${Math.round(summary.averageResponseTime / 1000)}s` },
        { label: 'Longitud promedio mensaje', value: `${Math.round(summary.averageMessageLength)} chars` },
      ],
    },
    {
      title: 'Solicitudes',
      icon: Clock,
      color: 'indigo',
      items: [
        { label: 'Solicitudes creadas', value: summary.totalRequestsCreated },
        { label: 'Solicitudes completadas', value: summary.totalRequestsCompleted },
        { label: 'Solicitudes canceladas', value: summary.totalRequestsCancelled },
        { label: 'Duración promedio', value: `${Math.round(summary.averageRequestDuration)} min` },
      ],
    },
    {
      title: 'Pagos',
      icon: CreditCard,
      color: 'green',
      items: [
        { label: 'Pagos realizados', value: summary.totalPayments },
        { label: 'Monto total', value: `$${summary.totalPaymentAmount.toLocaleString('es-CO')} COP` },
        { label: 'Método preferido', value: summary.preferredPaymentMethod || 'N/A' },
        { label: 'Tasa de éxito', value: `${summary.paymentSuccessRate.toFixed(1)}%` },
      ],
    },
    {
      title: 'Inteligencia Artificial',
      icon: Brain,
      color: 'pink',
      items: [
        { label: 'Funcionalidades usadas', value: summary.totalAIFeaturesUsed },
        { label: 'Funcionalidades únicas', value: summary.aiFeaturesUsed.length },
        { label: 'Tasa de aceptación', value: `${summary.aiAcceptanceRate.toFixed(1)}%` },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Páginas más visitadas */}
      {summary.mostVisitedPages.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Páginas Más Visitadas
          </h2>
          <div className="space-y-2">
            {summary.mostVisitedPages.slice(0, 5).map((page, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{page.page}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(page.count / summary.mostVisitedPages[0].count) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-600 font-medium w-12 text-right">{page.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Métricas por categoría */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg bg-${metric.color}-100`}>
                <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{metric.title}</h3>
            </div>
            <div className="space-y-3">
              {metric.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">{item.label}</span>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Vista Detallada
function DetailedView({ interactions }: { interactions: UserInteraction[] }) {
  const groupedByType = interactions.reduce((acc, interaction) => {
    if (!acc[interaction.type]) {
      acc[interaction.type] = [];
    }
    acc[interaction.type].push(interaction);
    return acc;
  }, {} as Record<string, UserInteraction[]>);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Interacciones Recientes</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {interactions.slice(0, 50).map((interaction) => (
            <div
              key={interaction.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">{interaction.type}</div>
                <div className="text-sm text-gray-500">
                  {interaction.page && `Página: ${interaction.page} • `}
                  {new Date(interaction.timestamp).toLocaleString('es-CO')}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {interaction.userRole}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Interacciones por Tipo</h2>
        <div className="space-y-4">
          {Object.entries(groupedByType).map(([type, typeInteractions]) => (
            <div key={type} className="border-b border-gray-200 pb-4 last:border-0">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">{type}</span>
                <span className="text-sm text-gray-500">{typeInteractions.length} eventos</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Vista de Comparación
function ComparisonView({ summary }: { summary: UserInteractionSummary }) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-900">
          Comparación: Encuesta vs. Interacciones
        </h2>
        <p className="text-blue-800 mb-4">
          Esta vista te permite comparar tus respuestas en la encuesta con tus interacciones reales.
          Las discrepancias pueden indicar áreas de mejora o diferencias entre percepción y comportamiento.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Métricas Clave</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Frecuencia de Uso</h4>
            <p className="text-sm text-gray-600">
              Sesiones: {summary.totalSessions} • Días activos: {summary.daysActive}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Compara con tu respuesta Q1 de la encuesta
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">Navegación</h4>
            <p className="text-sm text-gray-600">
              Páginas visitadas: {summary.uniquePagesVisited} • Errores: {summary.totalErrors}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Compara con tus respuestas Q3 y Q4
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">Rendimiento</h4>
            <p className="text-sm text-gray-600">
              Tiempo promedio: {Math.round(summary.averagePageLoadTime)}ms • Tasa de errores: {summary.errorRate.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Compara con tu respuesta Q5
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">Búsqueda de Tutores</h4>
            <p className="text-sm text-gray-600">
              Búsquedas: {summary.totalTutorSearches} • Perfiles vistos: {summary.totalTutorProfilesViewed}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Compara con tus respuestas Q9, Q10, Q11
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
