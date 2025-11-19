# 📁 Documentos Universitarios

Esta carpeta contiene los documentos PDF de la universidad.

## 📋 Cómo agregar documentos

1. **Coloca el archivo PDF** en esta carpeta (`public/documents/`)
   - Ejemplo: `estatuto-general.pdf`

2. **Edita `metadata.json`** y agrega la información del documento:

```json
{
  "id": "doc-4",
  "title": "Nombre del Documento",
  "description": "Descripción del documento",
  "category": "Estatutos",
  "priority": "alta",
  "status": "vigente",
  "publishDate": "2024-01-15",
  "lastModified": "2024-01-15",
  "fileName": "nombre-archivo.pdf",
  "fileSize": 2048000,
  "tags": ["tag1", "tag2"],
  "downloadCount": 0,
  "version": "1.0",
  "author": "Autor del Documento",
  "department": "Departamento"
}
```

## 📝 Categorías disponibles

- Estatutos
- Reglamentos
- Resoluciones
- Circulares
- Acuerdos
- Políticas
- Formularios
- Guías
- Manuales

## 🎯 Prioridades

- alta
- media
- baja

## 📊 Estados

- vigente
- derogado
- en_revision

## ✅ Ejemplo completo

Si tienes un archivo `resolucion-2024.pdf`:

1. Colócalo en: `public/documents/resolucion-2024.pdf`
2. Agrega a `metadata.json`:

```json
{
  "id": "doc-4",
  "title": "Resolución 2024",
  "description": "Descripción de la resolución",
  "category": "Resoluciones",
  "priority": "media",
  "status": "vigente",
  "publishDate": "2024-01-15",
  "lastModified": "2024-01-15",
  "fileName": "resolucion-2024.pdf",
  "fileSize": 512000,
  "tags": ["2024", "resolucion"],
  "downloadCount": 0,
  "version": "1.0",
  "author": "Rectoría",
  "department": "Rectoría"
}
```

## 🔄 Recargar la aplicación

Después de agregar documentos, recarga la aplicación para verlos.

