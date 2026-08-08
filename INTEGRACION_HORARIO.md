# Integración de la Página de Horario

He creado un nuevo archivo `src/pages/SchedulePage.tsx` con el calendario semanal estilo plantilla.

## Cómo integrarlo en la aplicación

### Opción 1: Agregar como enlace desde Gestión Académica

En `src/pages/AcademicManagementPage.tsx`, puedes agregar un botón que navegue a la página de horario:

```tsx
// En la sección de Overview o donde prefieras, agrega:
<Button 
  onClick={() => onNavigate('schedule')}
  className="w-full"
>
  <Clock className="size-4 mr-2" />
  Ver Horario Semanal
</Button>
```

### Opción 2: Agregar en el Layout principal

Si quieres que el horario sea accesible desde el menú principal, necesitas:

1. **Actualizar `src/App.tsx`** para incluir la ruta:
```tsx
import { SchedulePage } from './pages/SchedulePage';

// En el switch de páginas:
case 'schedule':
  return <SchedulePage onNavigate={setCurrentPage} />;
```

2. **Actualizar `src/components/Layout.tsx`** o `src/components/MobileNavigation.tsx` para agregar el enlace en el menú.

## Características del Horario

✅ **Ya implementado:**
- Tabla de calendario semanal (DOM - SÁB)
- Horarios de 5 AM a 10 PM
- Colores alternados en las filas (blanco/verde claro)
- Estilo similar a la plantilla de referencia
- Diseño responsive con scroll horizontal

📋 **Próximos pasos:**
- Conectar con los datos de materias desde Firebase
- Mostrar las clases en las celdas correspondientes
- Agregar colores por materia
- Implementar vista diaria navegable

## Prueba la página

Una vez integrada, la página mostrará el calendario vacío listo para recibir los datos de las clases.
