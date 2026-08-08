# Código para Habilitar la Pestaña de Horario

## Paso 1: Cambiar la línea 1077

**Buscar:**
```tsx
        <TabsList className="grid w-full grid-cols-4">
```

**Reemplazar con:**
```tsx
        <TabsList className="grid w-full grid-cols-5">
```

## Paso 2: Agregar el TabsTrigger de Horario después de la línea 1078

**Después de:**
```tsx
          <TabsTrigger value="overview">Resumen</TabsTrigger>
```

**Agregar:**
```tsx
          <TabsTrigger value="schedule">Horario</TabsTrigger>
```

## Paso 3: Agregar el contenido de la pestaña Horario

**Buscar la línea que dice:**
```tsx
        {/* Resumen General */}
        <TabsContent value="overview" className="space-y-6">
```

**ANTES de esa línea, agregar:**

```tsx
        {/* Horario Semanal */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-blue-600">Horario Semanal</CardTitle>
              <CardDescription className="text-center">
                Vista de tu horario de clases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-12 text-gray-500">
                <Clock className="size-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">Pestaña de Horario Habilitada</h3>
                <p>El contenido del calendario se agregará próximamente</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

```

## Resultado Final

Después de estos cambios, tendrás 5 pestañas:
1. Resumen
2. **Horario** (nueva)
3. Semestres
4. Materias
5. Metas

La pestaña de Horario mostrará un mensaje placeholder que luego podremos reemplazar con el calendario estilo Google Calendar.
