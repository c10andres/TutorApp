# 📊 Sistema de Interacciones de Usuarios - TutorApp

## Descripción

El sistema de interacciones de usuarios registra automáticamente eventos de uso de la aplicación que complementan las respuestas de la **encuesta de usabilidad de TutorApp**. Este sistema permite analizar el comportamiento real de los usuarios y contrastarlo con sus respuestas en la encuesta.

## Relación con la Encuesta

Cada tipo de interacción corresponde a una o más preguntas de la encuesta:

| Pregunta Encuesta | Aspecto Evaluado | Tipos de Interacción Relacionados |
|-------------------|------------------|-----------------------------------|
| **Q1** | Frecuencia de uso | `app_opened`, `app_closed`, `session_started`, `session_ended` |
| **Q3, Q4** | Navegación | `page_viewed`, `navigation_click`, `back_button_used`, `search_initiated` |
| **Q5** | Velocidad/Rendimiento | `page_load_time`, `api_response_time`, `error_occurred`, `performance_metric` |
| **Q6, Q7** | Diseño/Estética | `ui_element_clicked`, `theme_changed`, `font_size_changed` |
| **Q8** | Responsive | `device_orientation_changed`, `screen_resize`, `responsive_breakpoint` |
| **Q9, Q10, Q11** | Búsqueda de tutores | `tutor_search_performed`, `tutor_search_filter_applied`, `tutor_profile_viewed` |
| **Q12** | Chat | `chat_message_sent`, `chat_message_received`, `chat_opened`, `chat_response_time` |
| **Q13** | Solicitud de tutoría | `tutoring_request_created`, `tutoring_request_completed`, `tutoring_request_cancelled` |
| **Q14** | Pagos | `payment_initiated`, `payment_completed`, `payment_failed`, `payment_method_selected` |
| **Q15** | IA | `ai_feature_used`, `ai_prediction_viewed`, `ai_suggestion_accepted`, `ai_suggestion_rejected` |

## Uso Básico

### 1. Importar el Hook

```typescript
import { useUserInteractions } from '../hooks/useUserInteractions';
```

### 2. Usar en un Componente

```typescript
function MyComponent() {
  const { logPageView, logTutorSearch, logError } = useUserInteractions();

  useEffect(() => {
    // Registrar vista de página
    logPageView('home');
  }, []);

  const handleSearch = async (query: string) => {
    // Registrar búsqueda de tutores
    await logTutorSearch(query, { subject: 'Matemáticas' }, 15);
  };

  const handleError = (error: Error) => {
    // Registrar error
    logError(error.message, error.name, 'home');
  };

  return <div>...</div>;
}
```

## Métodos Disponibles

### Navegación

```typescript
// Registrar vista de página
logPageView('tutor-profile', { tutorId: '123' });

// Registrar interacción genérica
logInteraction('navigation_click', { fromPage: 'home', toPage: 'search' });
```

### Búsqueda de Tutores

```typescript
// Registrar búsqueda
logTutorSearch('Matemáticas', { subject: 'Matemáticas', priceRange: '0-50000' }, 12);

// Registrar aplicación de filtro
logFilterApplied('priceRange', '0-50000');

// Registrar visualización de perfil
logTutorProfileView('tutor-123', 'Dr. María González');
```

### Chat

```typescript
// Registrar mensaje enviado
logChatMessage(150, 'chat-456', true);

// Registrar mensaje recibido
logChatMessage(200, 'chat-456', false);

// Registrar apertura de chat
logChatOpened('chat-456');
```

### Solicitudes de Tutoría

```typescript
// Registrar creación de solicitud
logTutoringRequest('request-789', 'Cálculo Diferencial', 60, 50000);

// Registrar finalización
logTutoringRequestCompleted('request-789', 60);
```

### Pagos

```typescript
// Registrar pago completado
logPayment('credit_card', 50000, 'completed');

// Registrar pago fallido
logPayment('credit_card', 50000, 'failed');
```

### Inteligencia Artificial

```typescript
// Registrar uso de funcionalidad de IA
logAIFeature('academic_predictor', { 
  subject: 'Matemáticas',
  confidence: 0.85 
});
```

### Rendimiento

```typescript
// Registrar tiempo de carga
logPageLoadTime('tutor-search', 1250);

// Registrar error
logError('Error al cargar tutores', 'NETWORK_ERROR', 'tutor-search');
```

### Apertura/Cierre de App

```typescript
// Al iniciar la app
useEffect(() => {
  logAppOpened();
  
  return () => {
    logAppClosed();
  };
}, []);
```

## Obtener Resumen de Interacciones

```typescript
function AnalyticsComponent() {
  const { getUserSummary } = useUserInteractions();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const loadSummary = async () => {
      // Obtener resumen de últimos 30 días
      const data = await getUserSummary(30);
      setSummary(data);
    };
    
    loadSummary();
  }, []);

  if (!summary) return <div>Cargando...</div>;

  return (
    <div>
      <h2>Resumen de Uso</h2>
      <p>Sesiones: {summary.totalSessions}</p>
      <p>Búsquedas de tutores: {summary.totalTutorSearches}</p>
      <p>Mensajes de chat: {summary.totalChatMessages}</p>
      <p>Tiempo promedio de carga: {summary.averagePageLoadTime}ms</p>
      {/* ... más métricas */}
    </div>
  );
}
```

## Integración en Componentes Existentes

### Ejemplo: Página de Búsqueda de Tutores

```typescript
function TutorSearchPage() {
  const { logTutorSearch, logFilterApplied, logTutorProfileView } = useUserInteractions();
  const [results, setResults] = useState([]);

  const handleSearch = async (query: string, filters: any) => {
    // Realizar búsqueda
    const tutors = await searchTutors(query, filters);
    setResults(tutors);

    // Registrar interacción
    await logTutorSearch(query, filters, tutors.length);
  };

  const handleFilterChange = (filterName: string, value: any) => {
    // Aplicar filtro
    applyFilter(filterName, value);

    // Registrar interacción
    logFilterApplied(filterName, value);
  };

  const handleTutorClick = (tutor: Tutor) => {
    // Registrar visualización de perfil
    logTutorProfileView(tutor.id, tutor.name);
    
    // Navegar al perfil
    navigate(`/tutor/${tutor.id}`);
  };

  return <div>...</div>;
}
```

### Ejemplo: Componente de Chat

```typescript
function ChatComponent({ chatId }: { chatId: string }) {
  const { logChatMessage, logChatOpened } = useUserInteractions();

  useEffect(() => {
    // Registrar apertura de chat
    logChatOpened(chatId);
  }, [chatId]);

  const handleSendMessage = async (content: string) => {
    // Enviar mensaje
    await sendMessage(chatId, content);

    // Registrar interacción
    logChatMessage(content.length, chatId, true);
  };

  return <div>...</div>;
}
```

## Análisis de Datos

### Comparar Interacciones con Encuesta

El sistema permite comparar las respuestas de la encuesta con el comportamiento real:

```typescript
// Ejemplo: Usuario dice que la navegación es "Muy fácil" (Q3)
// Pero registramos muchos clicks de navegación y uso del botón atrás
// Esto sugiere que la navegación podría no ser tan fácil como percibe

const interactions = await getUserInteractions({
  type: 'navigation_click',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31')
});

const backButtonUsage = interactions.filter(i => 
  i.type === 'back_button_used'
).length;

// Si hay muchos usos del botón atrás, podría indicar confusión
```

### Métricas Clave

```typescript
const summary = await getUserSummary(30);

// Frecuencia de uso (Q1)
console.log('Días activos:', summary.daysActive);
console.log('Sesiones promedio:', summary.totalSessions / summary.daysActive);

// Navegación (Q3, Q4)
console.log('Páginas únicas visitadas:', summary.uniquePagesVisited);
console.log('Página más visitada:', summary.mostVisitedPages[0]?.page);

// Rendimiento (Q5)
console.log('Tiempo promedio de carga:', summary.averagePageLoadTime);
console.log('Tasa de errores:', summary.errorRate);

// Búsqueda (Q9, Q10, Q11)
console.log('Búsquedas realizadas:', summary.totalTutorSearches);
console.log('Filtros aplicados:', summary.totalFiltersApplied);
console.log('Perfiles vistos:', summary.totalTutorProfilesViewed);

// Chat (Q12)
console.log('Mensajes enviados:', summary.totalChatMessages);
console.log('Tiempo promedio de respuesta:', summary.averageResponseTime);

// Solicitudes (Q13)
console.log('Solicitudes creadas:', summary.totalRequestsCreated);
console.log('Tasa de completación:', 
  summary.totalRequestsCompleted / summary.totalRequestsCreated * 100
);

// Pagos (Q14)
console.log('Pagos realizados:', summary.totalPayments);
console.log('Tasa de éxito:', summary.paymentSuccessRate);

// IA (Q15)
console.log('Funcionalidades de IA usadas:', summary.totalAIFeaturesUsed);
console.log('Tasa de aceptación:', summary.aiAcceptanceRate);
```

## Estructura de Datos en Firebase

### Realtime Database

Las interacciones se almacenan en **Realtime Database** (no Firestore) para permitir escrituras rápidas y frecuentes:

```
user_interactions/
  └── {interactionId}/
      ├── userId: string
      ├── userRole: 'student' | 'tutor' | 'parent' | 'other'
      ├── type: UserInteractionType
      ├── page?: string
      ├── metadata?: object
      ├── timestamp: string (ISO)
      └── createdAt: string (ISO)

user_interaction_summaries/
  └── {userId}/
      ├── userId: string
      ├── userRole: string
      ├── totalSessions: number
      ├── totalAppOpens: number
      ├── averageSessionDuration: number
      ├── totalPageViews: number
      ├── totalTutorSearches: number
      ├── totalChatMessages: number
      ├── ... (más métricas)
      ├── periodStart: string (ISO)
      ├── periodEnd: string (ISO)
      └── lastUpdated: string (ISO)
```

## Mejores Prácticas

1. **No registrar interacciones en cada render**: Usa `useEffect` o handlers de eventos
2. **No bloquear la UI**: Las interacciones se registran de forma asíncrona
3. **Incluir contexto relevante**: Agrega metadata útil (IDs, nombres, valores)
4. **Manejar errores silenciosamente**: No mostrar errores al usuario si falla el registro
5. **Respetar privacidad**: No registrar información sensible (contraseñas, datos personales)

## Ejemplo Completo

```typescript
import { useUserInteractions } from '../hooks/useUserInteractions';
import { useEffect, useState } from 'react';

function TutorSearchPage() {
  const { 
    logPageView, 
    logTutorSearch, 
    logFilterApplied,
    logTutorProfileView,
    logPageLoadTime 
  } = useUserInteractions();
  
  const [loading, setLoading] = useState(false);
  const [tutors, setTutors] = useState([]);

  useEffect(() => {
    const startTime = performance.now();
    
    // Registrar vista de página
    logPageView('tutor-search');
    
    // Registrar tiempo de carga cuando termine
    const loadTime = performance.now() - startTime;
    logPageLoadTime('tutor-search', loadTime);
  }, []);

  const handleSearch = async (query: string, filters: any) => {
    setLoading(true);
    const startTime = performance.now();
    
    try {
      const results = await searchTutors(query, filters);
      setTutors(results);
      
      // Registrar búsqueda
      await logTutorSearch(query, filters, results.length);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName: string, value: any) => {
    // Registrar aplicación de filtro
    logFilterApplied(filterName, value);
    
    // Aplicar filtro
    applyFilter(filterName, value);
  };

  const handleTutorClick = (tutor: Tutor) => {
    // Registrar visualización de perfil
    logTutorProfileView(tutor.id, tutor.name);
    
    // Navegar
    navigate(`/tutor/${tutor.id}`);
  };

  return (
    <div>
      {/* UI del componente */}
    </div>
  );
}
```

## Beneficios

1. **Datos objetivos**: Complementa las percepciones subjetivas de la encuesta con datos reales
2. **Análisis continuo**: No depende de que los usuarios completen encuestas
3. **Identificación de problemas**: Detecta discrepancias entre lo que dicen y lo que hacen
4. **Mejora continua**: Permite identificar áreas de mejora basadas en comportamiento real
5. **Validación**: Verifica si las mejoras implementadas realmente mejoran la experiencia

## Próximos Pasos

- [ ] Integrar en componentes clave de la aplicación
- [ ] Crear dashboard de análisis de interacciones
- [ ] Implementar alertas para métricas críticas
- [ ] Generar reportes automáticos comparando encuesta vs. interacciones
- [ ] Exportar datos para análisis externo

---

**Nota**: Este sistema complementa pero no reemplaza la encuesta de usabilidad. La combinación de datos objetivos (interacciones) y subjetivos (encuesta) proporciona una visión completa de la experiencia del usuario.
