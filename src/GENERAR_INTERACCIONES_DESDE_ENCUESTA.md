# 📊 Generar Interacciones desde Respuestas de Encuesta

Este documento explica cómo generar interacciones de usuarios que coinciden con las respuestas de la encuesta de usabilidad de TutorApp.

## Descripción

El sistema genera automáticamente interacciones de usuarios basadas en las 150 respuestas de la encuesta. Cada interacción refleja el comportamiento que las respuestas de la encuesta sugieren, creando datos coherentes entre la encuesta y las interacciones reales.

## Mapeo de Encuesta a Interacciones

| Pregunta Encuesta | Aspecto | Interacciones Generadas |
|-------------------|---------|------------------------|
| **Q1** | Frecuencia de uso | `app_opened`, `app_closed`, `session_started`, `session_ended` |
| **Q3, Q4** | Navegación | `page_viewed`, `navigation_click`, `back_button_used` |
| **Q5** | Velocidad/Rendimiento | `page_load_time`, `error_occurred`, `performance_metric` |
| **Q9, Q10, Q11** | Búsqueda de tutores | `tutor_search_performed`, `tutor_search_filter_applied`, `tutor_profile_viewed` |
| **Q12** | Chat | `chat_message_sent`, `chat_message_received`, `chat_opened`, `chat_response_time` |
| **Q13** | Solicitudes | `tutoring_request_created`, `tutoring_request_completed`, `tutoring_request_cancelled` |
| **Q14** | Pagos | `payment_initiated`, `payment_completed`, `payment_failed`, `payment_method_selected` |
| **Q15** | IA | `ai_feature_used`, `ai_prediction_viewed`, `ai_suggestion_accepted`, `ai_suggestion_rejected` |

## Ejemplos de Coherencia

### Ejemplo 1: Usuario con Navegación "Muy fácil"
- **Encuesta:** Q3 = "Muy fácil", Q4 = "Siempre"
- **Interacciones generadas:**
  - Pocas navegaciones (10-12 eventos)
  - Pocos usos del botón atrás (10% de las navegaciones)
  - Navegación directa entre páginas

### Ejemplo 2: Usuario con Navegación "Difícil"
- **Encuesta:** Q3 = "Difícil", Q4 = "A veces"
- **Interacciones generadas:**
  - Muchas navegaciones (25+ eventos)
  - Muchos usos del botón atrás (30% de las navegaciones)
  - Navegación entre múltiples páginas antes de encontrar lo buscado

### Ejemplo 3: Usuario con Velocidad "Muy rápida"
- **Encuesta:** Q5 = "Muy rápida"
- **Interacciones generadas:**
  - Tiempos de carga: 200-500ms
  - Pocos o ningún error

### Ejemplo 4: Usuario con Velocidad "Muy lenta"
- **Encuesta:** Q5 = "Muy lenta"
- **Interacciones generadas:**
  - Tiempos de carga: 4000-8000ms
  - Errores ocasionales (10% de las cargas)

## Formas de Generar Interacciones

### Opción 1: Desde la Interfaz de la App (Recomendado)

1. Inicia sesión como usuario maestro (ver `USUARIOS_MAESTROS_SETUP.md`)
2. Ve a la página donde se muestra el componente `SurveyInteractionsGenerator`
3. Haz clic en "Generar para todos los usuarios" o "Generar para mi usuario"
4. Espera a que se complete el proceso (puede tomar varios minutos)

### Opción 2: Desde la Línea de Comandos

```bash
# Instalar dependencias si es necesario
npm install

# Ejecutar el script
npx ts-node scripts/generate-interactions-from-survey.ts
```

### Opción 3: Desde Código

```typescript
import { surveyInteractionsGenerator } from './services/survey-interactions-generator';
import { allSurveyResponses } from './data/survey-responses';

// Generar interacciones para un usuario específico
await surveyInteractionsGenerator.generateInteractionsForUser(
  'user-id-123',
  allSurveyResponses[0], // Primera respuesta de encuesta
  30 // Últimos 30 días
);
```

## Estructura de Datos

### Respuestas de Encuesta
Las respuestas se almacenan en `src/data/survey-responses.ts`:
- 10 respuestas de ejemplo explícitas
- 140 respuestas generadas automáticamente con distribución realista
- Total: 150 respuestas

### Interacciones Generadas
Las interacciones se guardan en Firebase Realtime Database:
- **Ruta:** `user_interactions/`
- **Resúmenes:** `user_interaction_summaries/{userId}`

## Parámetros de Generación

### Frecuencia de Uso (Q1)
- **"Todos los días":** 30 aperturas de app, sesiones de 30 min
- **"Varias veces a la semana":** 12 aperturas, sesiones de 40 min
- **"Una vez a la semana":** 4 aperturas, sesiones de 1 hora
- **"Varias veces al mes":** 6 aperturas, sesiones de 30 min
- **"Rara vez":** 2 aperturas, sesiones de 15 min
- **"Esta es la primera vez":** 1 apertura, sesión de 10 min

### Navegación (Q3, Q4)
- **"Muy fácil" + "Siempre":** 10-12 navegaciones, 10% botón atrás
- **"Fácil" + "Casi siempre":** 15 navegaciones, 10% botón atrás
- **"Difícil" + "A veces":** 25+ navegaciones, 30% botón atrás

### Velocidad (Q5)
- **"Muy rápida":** 200-500ms
- **"Rápida":** 500-1000ms
- **"Adecuada":** 1000-2000ms
- **"Lenta":** 2000-4000ms + 10% errores
- **"Muy lenta":** 4000-8000ms + 10% errores

### Búsqueda de Tutores (Q9-Q11)
- **"Muy fácil":** 8 búsquedas
- **"Fácil":** 6 búsquedas
- **"Regular":** 4 búsquedas
- **"Difícil":** 2 búsquedas
- **"Muy difícil":** 1 búsqueda

### Chat (Q12)
- **"Muy buena":** 5 chats, 20 mensajes/chat, respuestas rápidas (5-15s)
- **"Buena":** 5 chats, 15 mensajes/chat, respuestas moderadas (10-30s)
- **"Neutral":** 2 chats, 8 mensajes/chat

### Solicitudes (Q13)
- **"Muy clara" / "Clara":** 3 solicitudes, 70% completadas
- **"Neutral":** 1 solicitud, 50% completadas

### Pagos (Q14)
- **"Muy de acuerdo":** 3 pagos, 100% éxito
- **"De acuerdo":** 3 pagos, 90% éxito
- **"Neutral":** 1 pago, 70% éxito

### IA (Q15)
- **"Muy útil":** 5 usos, 80% aceptación
- **"Útil":** 5 usos, 60% aceptación
- **"Neutral":** 2 usos, 30% aceptación

## Verificación

### En Firebase Console
1. Ve a Firebase Realtime Database
2. Navega a `user_interactions/`
3. Verifica que hay interacciones para cada usuario
4. Revisa `user_interaction_summaries/` para ver resúmenes

### En la App
```typescript
import { useUserInteractions } from './hooks/useUserInteractions';

function MyComponent() {
  const { getUserSummary, getUserInteractions } = useUserInteractions();
  
  useEffect(() => {
    const loadData = async () => {
      const summary = await getUserSummary(30);
      console.log('Resumen:', summary);
      
      const interactions = await getUserInteractions({ limit: 50 });
      console.log('Interacciones:', interactions);
    };
    
    loadData();
  }, []);
}
```

## Troubleshooting

### Error: "No se encontraron usuarios en Firebase"
- El script creará IDs simulados automáticamente
- O puedes crear usuarios primero en la app

### Error: "Firebase permission denied"
- Verifica las reglas de seguridad de Realtime Database
- Asegúrate de estar autenticado si es necesario

### Las interacciones no se generan
- Verifica la conexión a Firebase
- Revisa la consola del navegador para errores
- Asegúrate de que el usuario tenga permisos

## Próximos Pasos

1. ✅ Generar interacciones para todos los usuarios de la encuesta
2. ✅ Verificar que las interacciones reflejan las respuestas
3. ✅ Analizar los datos comparando encuesta vs. interacciones
4. ✅ Crear visualizaciones de los datos
5. ✅ Generar reportes automáticos

---

**Nota:** Este sistema garantiza que las interacciones generadas sean coherentes con las respuestas de la encuesta, permitiendo análisis comparativos precisos entre lo que los usuarios dicen (encuesta) y lo que hacen (interacciones).
