import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { CheckCircle, XCircle, BarChart2, MousePointerClick, Search, MessageSquare, Edit, TrendingUp, Zap, Users, Download, PlusCircle, AlertTriangle, Info } from 'lucide-react';
import * as XLSX from 'xlsx';

// --- Datos de ejemplo MÁS COHERENTES ---
const weightedRandom = (weights: { [key: string]: number }): string => {
  const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * total;
  for (const key in weights) {
    if (random < weights[key]) return key;
    random -= weights[key];
  }
  return Object.keys(weights)[0];
};

const generateMockData = (count: number, startId: number) => {
  return Array.from({ length: count }, (_, i) => {
    const navigationChoice = weightedRandom({ 'Muy fácil': 0.3, 'Fácil': 0.5, 'Regular': 0.15, 'Difícil': 0.05 });
    const speedChoice = weightedRandom({ 'Excelente': 0.4, 'Buena': 0.5, 'Aceptable': 0.08, 'Lenta': 0.02 });
    const findabilityChoice = weightedRandom({ 'Sí, sin problema': 0.6, 'Sí, pero con dificultades': 0.3, 'No, me costó bastante': 0.08, 'No lo encontré': 0.02 });

    return {
      id: startId + i,
      role: weightedRandom({ 'Estudiante': 0.6, 'Tutor': 0.3, 'Ambos': 0.1 }),
      frequency: weightedRandom({ 'Diario': 0.2, 'Semanalmente': 0.4, 'Ocasionalmente': 0.3, 'Nunca': 0.1 }),
      navigation: navigationChoice,
      speed: speedChoice,
      findability: findabilityChoice,
      aesthetics: weightedRandom({ 'Muy agradable': 0.4, 'Agradable': 0.4, 'Neutral': 0.15, 'Poco atractiva': 0.05 }),
      'ui-clarity': weightedRandom({ 'Totalmente adecuados': 0.5, 'Adecuados': 0.4, 'Neutros': 0.1 }),
      responsive: weightedRandom({ 'Sí, perfectamente': 0.6, 'Sí, con detalles menores': 0.3, 'Regular': 0.1 }),
      'search-experience': weightedRandom({ 'Muy buena': 0.4, 'Buena': 0.4, 'Aceptable': 0.15, 'Deficiente': 0.05 }),
      'chat-experience': weightedRandom({ 'Excelente': 0.3, 'Bueno': 0.5, 'Aceptable': 0.15, 'Deficiente': 0.05 }),
      'request-flow': weightedRandom({ 'Muy claro': 0.5, 'Claro': 0.3, 'Regular': 0.15, 'Confuso': 0.05 }),
      'ai-usefulness': weightedRandom({ 'Muy útiles': 0.3, 'Bastante útiles': 0.4, 'Moderadamente útiles': 0.2, 'Poco útiles': 0.1 }),
      observations: 'Comentario generado automáticamente para análisis.',
      timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toISOString() // Últimos 30 días
    };
  });
};

const initialSurveyData = generateMockData(20, 1); // Start with 20 items

const interactionsData = Array.from({ length: 100 }, (_, i) => ({
  type: weightedRandom({ 'Page View': 0.6, 'Search': 0.2, 'Chat Message': 0.15, 'Session Start': 0.05 }),
  page: weightedRandom({ '/home': 0.3, '/search': 0.25, '/chat': 0.2, '/requests': 0.15, '/profile': 0.1 }),
  date: new Date(Date.now() - i * 1000 * 60 * 60).toLocaleString(),
}));

export function SurveyAnalyticsPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);
  const [surveyData, setSurveyData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = () => {
      const storedData = localStorage.getItem('surveyData');
      if (storedData) {
        setSurveyData(JSON.parse(storedData));
      } else {
        setSurveyData(initialSurveyData);
        localStorage.setItem('surveyData', JSON.stringify(initialSurveyData));
      }
    };
    loadData();

    // Listen for storage events in case other tabs update it (optional but good practice)
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const handleGenerateData = () => {
    const count = Math.floor(Math.random() * 11) + 50; // 50 to 60 items
    const startId = surveyData.length > 0 ? Math.max(...surveyData.map(d => d.id)) + 1 : 1;
    const newData = generateMockData(count, startId);
    const updatedData = [...surveyData, ...newData];
    setSurveyData(updatedData);
    localStorage.setItem('surveyData', JSON.stringify(updatedData));
    alert(`Se han generado ${count} nuevas encuestas exitosamente.`);
  };

  const handleDownloadExcel = () => {
    if (surveyData.length === 0) {
      alert("No hay datos para descargar.");
      return;
    }

    // Crear hoja de trabajo
    const ws = XLSX.utils.json_to_sheet(surveyData);

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Encuestas");

    // Generar archivo y descargar
    XLSX.writeFile(wb, `encuestas_tutorapp_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // --- Funciones para procesar datos dinámicamente ---
  const processChartData = (data: any[], key: string, categories: string[]) => {
    const counts = categories.reduce((acc: Record<string, number>, category) => {
      acc[category] = 0;
      return acc;
    }, {});
    data.forEach(item => {
      // Normalize key access if needed, or handle missing keys
      const value = item[key];
      if (value && counts[value] !== undefined) {
        counts[value]++;
      }
    });
    return categories.map(name => ({ name, count: counts[name] }));
  };

  const navigationCategories = ['Muy fácil', 'Fácil', 'Regular', 'Difícil', 'Muy difícil'];
  const speedCategories = ['Excelente', 'Buena', 'Aceptable', 'Lenta', 'Muy lenta'];
  const roleCategories = ['Estudiante', 'Tutor', 'Ambos', 'Solo estoy probando la interfaz'];
  const frequencyCategories = ['Nunca', 'Ocasionalmente', 'Semanalmente', 'Diario'];
  const findabilityCategories = ['Sí, sin problema', 'Sí, pero con dificultades', 'No, me costó bastante', 'No lo encontré'];


  const navigationChartData = processChartData(surveyData, 'navigation', navigationCategories);
  const speedChartData = processChartData(surveyData, 'speed', speedCategories);

  const totalResponses = surveyData.length;
  const studentResponses = surveyData.filter(d => d.role === 'Estudiante').length;
  const tutorResponses = surveyData.filter(d => d.role === 'Tutor').length;
  const roleChartData = processChartData(surveyData, 'role', roleCategories);
  const frequencyChartData = processChartData(surveyData, 'frequency', frequencyCategories);
  const findabilityChartData = processChartData(surveyData, 'findability', findabilityCategories);

  const PIE_COLORS = ['#3b82f6', '#84cc16', '#f97316', '#ef4444'];


  const renderSurveyTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Estadísticas Generales de la Encuesta (Actualizado)</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleGenerateData}>
                <PlusCircle className="mr-2 h-4 w-4" /> Generar Datos (50-60)
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadExcel}>
                <Download className="mr-2 h-4 w-4" /> Descargar Excel (.xlsx)
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-sm font-medium text-gray-500 flex items-center gap-1"><Users className="size-4" /> Total Respuestas</p>
            <p className="text-2xl font-bold">{totalResponses}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Respuestas de Estudiantes</p>
            <p className="text-2xl font-bold">{studentResponses}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Respuestas de Tutores</p>
            <p className="text-2xl font-bold">{tutorResponses}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Navegación en la App</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={navigationChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Respuestas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Velocidad Percibida</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={speedChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#84cc16" name="Respuestas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos adicionales en lugar de la tabla */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Distribución por Rol</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={roleChartData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {roleChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Frecuencia de Uso</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={frequencyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#f97316" fill="#fed7aa" name="Respuestas" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Facilidad para Encontrar Información</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={findabilityChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" name="Respuestas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {selectedResponse && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setSelectedResponse(null)}>
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Detalles de Respuesta #{selectedResponse.id}</h3>
            <p><strong>Rol:</strong> {selectedResponse.role}</p>
            <p><strong>Frecuencia de Uso:</strong> {selectedResponse.frequency}</p>
            <p><strong>Navegación:</strong> {selectedResponse.navigation}</p>
            <p><strong>Velocidad:</strong> {selectedResponse.speed}</p>
            <p><strong>Q1:</strong> {selectedResponse.q1}</p>
            <p><strong>Q2:</strong> {selectedResponse.q2}</p>
            {/* ... Mostrar todas las 16 preguntas ... */}
            <Button className="mt-4" onClick={() => setSelectedResponse(null)}>Cerrar</Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderInteractionsTab = () => (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Button>Generar Nuevas Interacciones</Button>
        <Button variant="outline">Actualizar Datos</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Resumen de Métricas de Interacción</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {['Sesiones', 'Vistas de Página', 'Búsquedas', 'Mensajes', 'Solicitudes', 'Pagos'].map(metric => (
            <div key={metric} className="p-4 bg-gray-100 rounded-lg text-center">
              <p className="text-sm font-medium text-gray-500">{metric}</p>
              <p className="text-2xl font-bold">{Math.floor(Math.random() * 500)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Tabla de Interacciones Recientes ({interactionsData.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-auto border rounded-lg">
            <Table>
              <TableHeader className="sticky top-0 bg-gray-50">
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Página</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interactionsData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.page}</TableCell>
                    <TableCell>{item.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderComparisonTab = () => {
    // 1. Cálculos Dinámicos de la Encuesta
    const total = surveyData.length || 1;

    const navSatisfaction = Math.round((surveyData.filter(d => ['Muy fácil', 'Fácil'].includes(d.navigation)).length / total) * 100);
    const speedSatisfaction = Math.round((surveyData.filter(d => ['Excelente', 'Buena'].includes(d.speed)).length / total) * 100);
    const searchSatisfaction = Math.round((surveyData.filter(d => ['Muy buena', 'Buena'].includes(d['search-experience'])).length / total) * 100);

    // 2. Métricas de "Realidad" (Simuladas para el ejemplo, conectarían con analíticas reales)
    const realityMetrics = {
      bounceRate: 25, // 25% de rebote (sesiones cortas)
      avgLoadTime: 450, // 450ms
      failedSearches: 18, // 18% de búsquedas sin resultados
      chatUsage: 75 // 75% de sesiones usan chat
    };

    // 3. Lógica de Divergencia Avanzada
    const getDivergenceLevel = (satisfaction: number, realityBadMetric: number, thresholdSat: number, thresholdReal: number) => {
      if (satisfaction > thresholdSat && realityBadMetric > thresholdReal * 1.5) return 'high'; // Alta divergencia (Muy grave)
      if (satisfaction > thresholdSat && realityBadMetric > thresholdReal) return 'medium'; // Media divergencia
      return 'none';
    };

    const navDivergenceLevel = getDivergenceLevel(navSatisfaction, realityMetrics.bounceRate, 70, 20);
    const searchDivergenceLevel = getDivergenceLevel(searchSatisfaction, realityMetrics.failedSearches, 70, 15);

    // Velocidad es especial porque la métrica es "tiempo" (menor es mejor), así que la lógica es inversa o diferente
    // Si satisfacción es BAJA (<50) pero tiempo es BUENO (<800ms) -> Divergencia
    const speedDivergenceLevel = (speedSatisfaction < 50 && realityMetrics.avgLoadTime < 800) ? 'medium' : 'none';

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
          <h3 className="font-semibold text-blue-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análisis de Divergencias
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            Este sistema compara la <strong>percepción del usuario</strong> (encuestas) con la <strong>realidad técnica</strong> (métricas).
            Las divergencias indican áreas donde la experiencia subjetiva no coincide con los datos objetivos, revelando oportunidades de mejora.
          </p>
        </div>

        <Card>
          <CardHeader><CardTitle>Comparación: Encuesta vs. Realidad (Datos Dinámicos)</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-6">
            <ComparisonCard
              icon={<MousePointerClick />}
              title="Navegación"
              surveyText={`${navSatisfaction}% de usuarios dice que es 'Fácil' o 'Muy fácil'`}
              realText={`Realidad: El ${realityMetrics.bounceRate}% de las sesiones terminan en rebote.`}
              divergenceLevel={navDivergenceLevel}
              recommendation="Revisar el flujo de onboarding y la claridad de los menús principales. Los usuarios creen que es fácil, pero abandonan rápido."
            />
            <ComparisonCard
              icon={<Zap />}
              title="Velocidad"
              surveyText={`${speedSatisfaction}% de usuarios la califica como 'Buena' o 'Excelente'`}
              realText={`Realidad: Tiempo de carga promedio de ${realityMetrics.avgLoadTime}ms (Muy rápido).`}
              divergenceLevel={speedDivergenceLevel}
              recommendation="La app es rápida, pero se percibe lenta. Mejorar feedback visual (spinners, skeletons) y transiciones."
            />
            <ComparisonCard
              icon={<Search />}
              title="Búsqueda"
              surveyText={`${searchSatisfaction}% de usuarios la califica como 'Buena' o 'Muy buena'`}
              realText={`Realidad: El ${realityMetrics.failedSearches}% de las búsquedas fallan.`}
              divergenceLevel={searchDivergenceLevel}
              recommendation="Optimizar el algoritmo de búsqueda o sugerir términos. Los usuarios se conforman con resultados pobres."
            />
            <ComparisonCard
              icon={<MessageSquare />}
              title="Chat"
              surveyText="Función valorada positivamente en comentarios"
              realText={`Realidad: El ${realityMetrics.chatUsage}% de sesiones activas usan el chat.`}
              divergenceLevel="none"
              recommendation="Mantener la calidad actual. El chat es un punto fuerte validado por uso y percepción."
            />
          </CardContent>
        </Card>
      </div>
    );
  };

  const ComparisonCard = ({ icon, title, surveyText, realText, divergenceLevel, recommendation }: any) => {
    const isCoherent = divergenceLevel === 'none';

    let statusColor = 'bg-green-100 text-green-700 border-green-200';
    let statusIcon = <CheckCircle className="h-5 w-5" />;
    let statusText = 'Datos Coherentes';

    if (divergenceLevel === 'medium') {
      statusColor = 'bg-yellow-50 text-yellow-700 border-yellow-200';
      statusIcon = <AlertTriangle className="h-5 w-5" />;
      statusText = 'Divergencia Detectada (Media)';
    } else if (divergenceLevel === 'high') {
      statusColor = 'bg-red-50 text-red-700 border-red-200';
      statusIcon = <XCircle className="h-5 w-5" />;
      statusText = 'Divergencia Crítica (Alta)';
    }

    return (
      <div className={`border rounded-lg p-5 flex flex-col md:flex-row gap-6 transition-all hover:shadow-md ${isCoherent ? 'bg-white' : 'bg-gray-50/50'}`}>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg bg-gray-100 text-gray-600`}>{icon}</div>
            <h4 className="font-bold text-lg">{title}</h4>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border p-3 rounded text-sm shadow-sm">
              <span className="font-semibold text-gray-500 block mb-1 text-xs uppercase tracking-wider">Percepción (Encuesta)</span>
              {surveyText}
            </div>
            <div className="bg-white border p-3 rounded text-sm shadow-sm">
              <span className="font-semibold text-gray-500 block mb-1 text-xs uppercase tracking-wider">Realidad (Métricas)</span>
              {realText}
            </div>
          </div>
        </div>

        <div className={`md:w-1/3 flex flex-col justify-center p-4 rounded-lg border ${statusColor}`}>
          <div className="flex items-center gap-2 mb-2 font-bold">
            {statusIcon}
            <span>{statusText}</span>
          </div>
          {!isCoherent && (
            <div className="text-sm mt-1">
              <span className="font-semibold block mb-1">Recomendación:</span>
              {recommendation}
            </div>
          )}
          {isCoherent && (
            <p className="text-sm opacity-90">La percepción del usuario está alineada con el rendimiento real del sistema.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Análisis de Encuesta e Interacciones</h1>
          <p className="text-gray-500">Una vista completa del feedback de usuarios y su comportamiento real.</p>
        </div>
        <Button onClick={() => onNavigate('survey')} className="mt-4 md:mt-0">
          <Edit className="mr-2 h-4 w-4" /> Llenar la Encuesta
        </Button>
      </div>

      <Tabs defaultValue="survey">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="survey">📊 Encuesta ({totalResponses})</TabsTrigger>
          <TabsTrigger value="interactions">Interacciones</TabsTrigger>
          <TabsTrigger value="comparison">Comparación</TabsTrigger>
        </TabsList>
        <TabsContent value="survey" className="mt-4">
          {renderSurveyTab()}
        </TabsContent>
        <TabsContent value="interactions" className="mt-4">
          {renderInteractionsTab()}
        </TabsContent>
        <TabsContent value="comparison" className="mt-4">
          {renderComparisonTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}