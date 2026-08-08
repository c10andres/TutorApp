# 📊 Cómo Ver los Resultados de Interacciones en la App

## Ubicación de la Página

La página de análisis de interacciones está disponible en la ruta: **`interactions-analytics`**

## Formas de Acceder

### Opción 1: Desde el Código (Navegación Programática)

```typescript
// En cualquier componente con acceso a onNavigate
onNavigate('interactions-analytics');
```

### Opción 2: Agregar Botón en HomePage

Puedes agregar un botón en `HomePage.tsx` para usuarios maestros:

```typescript
// En HomePage.tsx, dentro del componente
{isTestUser(user) && (
  <Button
    onClick={() => onNavigate('interactions-analytics')}
    className="mt-4"
  >
    Ver Análisis de Interacciones
  </Button>
)}
```

### Opción 3: Agregar al Menú de Navegación

Puedes agregar un enlace en `Layout.tsx` o `MobileNavigation.tsx`:

```typescript
// En el menú de navegación
<button onClick={() => onNavigate('interactions-analytics')}>
  📊 Análisis de Interacciones
</button>
```

### Opción 4: URL Directa (Desarrollo)

Si estás en desarrollo, puedes navegar directamente a:
```
http://localhost:5173/#interactions-analytics
```

## Qué Verás en la Página

La página tiene **3 modos de visualización**:

### 1. **Resumen** (Vista por Defecto)
- Métricas generales de uso
- Páginas más visitadas
- Estadísticas por categoría:
  - Frecuencia de uso (Q1)
  - Navegación (Q3, Q4)
  - Rendimiento (Q5)
  - Búsqueda de tutores (Q9-Q11)
  - Chat (Q12)
  - Solicitudes (Q13)
  - Pagos (Q14)
  - IA (Q15)

### 2. **Detallado**
- Lista de todas las interacciones recientes
- Agrupadas por tipo
- Con timestamps y detalles

### 3. **Comparación**
- Comparación entre respuestas de encuesta y interacciones reales
- Identificación de discrepancias
- Análisis de coherencia

## Filtros Disponibles

- **Período de tiempo:**
  - Últimos 7 días
  - Últimos 30 días
  - Últimos 90 días

## Ejemplo de Integración Rápida

Para agregar acceso rápido desde HomePage, agrega esto después de los componentes de debug:

```typescript
// En HomePage.tsx
import { SurveyInteractionsGenerator } from '../components/SurveyInteractionsGenerator';

// Dentro del componente, después de DebugStatsPanel
{isTestUser(user) && (
  <div className="mt-6">
    <Card>
      <CardHeader>
        <CardTitle>Análisis de Interacciones</CardTitle>
        <CardDescription>
          Visualiza tus interacciones y compáralas con la encuesta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => onNavigate('interactions-analytics')}
          className="w-full"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Ver Análisis de Interacciones
        </Button>
      </CardContent>
    </Card>
  </div>
)}
```

## Requisitos

- Debes estar autenticado
- Las interacciones deben haber sido generadas previamente
- Si no hay datos, verás un mensaje indicando que no hay interacciones disponibles

## Datos Mostrados

La página muestra:

1. **Resumen de Interacciones:**
   - Total de sesiones
   - Aperturas de app
   - Días activos
   - Duración promedio de sesión

2. **Métricas de Navegación:**
   - Vistas de página
   - Páginas únicas visitadas
   - Tiempo promedio de carga
   - Tasa de errores

3. **Actividad por Funcionalidad:**
   - Búsquedas de tutores
   - Mensajes de chat
   - Solicitudes creadas
   - Pagos realizados
   - Uso de IA

4. **Páginas Más Visitadas:**
   - Top 5 páginas con más visitas
   - Gráfico de barras visual

## Troubleshooting

### No se muestran datos
- Verifica que hayas generado interacciones primero
- Revisa que estés autenticado
- Comprueba la conexión a Firebase

### Error al cargar
- Revisa la consola del navegador
- Verifica las reglas de seguridad de Firebase
- Asegúrate de tener permisos de lectura

### La página no aparece
- Verifica que la ruta esté agregada en `App.tsx`
- Comprueba que el componente esté importado correctamente
- Revisa que no haya errores de compilación

---

**Nota:** Esta página está diseñada para ayudar a visualizar y analizar las interacciones de usuarios, permitiendo comparar el comportamiento real con las respuestas de la encuesta de usabilidad.
