# 🚀 Ejecutar en VS Code - Instrucciones Simples

## ✅ PASOS RÁPIDOS

### 1. Abrir el Proyecto
```bash
cd TutorApp-colombia
code .
```

### 2. Instalar Dependencias (PRIMERA VEZ)
Abre la terminal en VS Code (`` Ctrl+` `` o `View > Terminal`) y ejecuta:

```bash
npm install
```

⏱️ **Tiempo:** 2-5 minutos

### 3. Ejecutar el Servidor de Desarrollo
```bash
npm run dev
```

✅ **Listo!** La aplicación se abrirá automáticamente en `http://localhost:5173`

---

## 🎨 Los Estilos Ahora Funcionan Porque:

1. ✅ **Vite configurado** con HMR y CSS source maps
2. ✅ **Tailwind configurado** para detectar todos los archivos `.tsx`
3. ✅ **PostCSS configurado** para procesar Tailwind
4. ✅ **VS Code configurado** con extensiones recomendadas
5. ✅ **TypeScript configurado** con paths y alias
6. ✅ **Package.json optimizado** con scripts de desarrollo

---

## 📦 Extensiones Recomendadas

VS Code te sugerirá instalar estas extensiones automáticamente:

- ✅ **Tailwind CSS IntelliSense** - Autocompletado de clases
- ✅ **PostCSS Language Support** - Sintaxis de PostCSS
- ✅ **Prettier** - Formateo de código
- ✅ **ESLint** - Linting

---

## 🔧 Scripts Disponibles

```bash
# Desarrollo normal
npm run dev

# Desarrollo con limpieza de caché
npm run dev:clean

# Build para producción
npm run build

# Preview del build
npm run preview

# Lint del código
npm run lint
```

---

## 🐛 Solución de Problemas

### Los estilos no se ven
1. Detén el servidor (Ctrl+C)
2. Ejecuta:
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

### Puerto 5173 en uso
El servidor automáticamente usará el siguiente puerto disponible (5174, 5175, etc.)

### Errores de TypeScript
Recarga VS Code: `Ctrl+Shift+P` > "Reload Window"

---

## ✨ Todo está Configurado

El código ya está optimizado para:
- ✅ Hot Module Replacement (HMR)
- ✅ Fast Refresh en React
- ✅ Source maps para CSS
- ✅ Autocompletado de Tailwind
- ✅ Formateo automático al guardar

**Solo ejecuta `npm run dev` y empieza a desarrollar!** 🎉
