# 💻 Guía Completa para VS Code - TutorApp Colombia

## 🎯 Objetivo

Esta guía asegura que el proyecto funcione **perfectamente** en VS Code con todos los estilos y tipos correctos.

---

## ⚡ Inicio Rápido (3 Comandos)

Si ya tienes Node.js instalado:

```bash
npm install
npm run dev
```

Abre: `http://localhost:5173`

✅ **Los estilos deberían verse perfectamente.**

---

## 🔍 ¿Los Estilos NO se Ven?

### Diagnóstico Automático

```bash
node diagnostico-estilos.js
```

Este script te dirá exactamente qué está mal.

### Arreglo Automático

```bash
node arreglar-estilos-automatico.js
```

Este script arregla automáticamente los problemas comunes.

---

## 📋 Checklist Manual de Verificación

### 1. ¿Node.js Instalado?

```bash
node --version
# Debe mostrar: v18.x o superior
```

**Si no:** Descarga desde https://nodejs.org/

---

### 2. ¿Dependencias Instaladas?

```bash
# Verificar que existe node_modules
ls node_modules

# Si NO existe, instalar:
npm install
```

**Tiempo:** 2-5 minutos

---

### 3. ¿Tailwind Configurado?

#### Archivo: `package.json`

Busca en `devDependencies`:

```json
{
  "tailwindcss": "^3.4.1"
}
```

✅ **Debe ser v3.x** (no v4.x)

**Si es v4.x:**

```bash
# Edita package.json manualmente o ejecuta:
node arreglar-estilos-automatico.js
npm install
```

---

### 4. ¿PostCSS Configurado?

#### Archivo: `postcss.config.js`

Debe contener:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Si no existe o está mal:**

```bash
node arreglar-estilos-automatico.js
```

---

### 5. ¿Tailwind Config Existe?

#### Archivo: `tailwind.config.js`

Debe existir y contener:

```javascript
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./main.tsx",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    // ...
  ],
  // ...
}
```

**Si no existe:**

```bash
npx tailwindcss init
```

Luego copia la configuración del proyecto.

---

### 6. ¿Globals.css Correcto?

#### Archivo: `styles/globals.css`

Debe comenzar con:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

✅ **Estas 3 líneas son CRÍTICAS**

---

### 7. ¿Main.tsx Importa los Estilos?

#### Archivo: `main.tsx`

Debe contener:

```typescript
import './styles/globals.css'
```

✅ **DEBE estar ANTES de importar `<App />`**

**Ejemplo correcto:**

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'  // ← IMPORTANTE

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Si falta:**

```bash
node arreglar-estilos-automatico.js
```

---

## 🛠️ Configuración de VS Code

### Extensiones Recomendadas

El proyecto incluye `.vscode/extensions.json` que recomienda:

1. **Tailwind CSS IntelliSense**
   - Autocompletado de clases
   - Vista previa de colores

2. **Prettier**
   - Formateo automático

3. **ESLint**
   - Detección de errores

4. **TypeScript**
   - Soporte completo de TypeScript

**Instalar todas:**

1. Abre VS Code
2. Ve a Extensiones (Ctrl+Shift+X)
3. Aparecerá un aviso: "This workspace recommends extensions"
4. Clic en "Install All"

---

### Configuración Incluida

El proyecto ya tiene `.vscode/settings.json` con:

- ✅ Formateo automático al guardar
- ✅ Fix de ESLint automático
- ✅ IntelliSense de Tailwind habilitado
- ✅ Asociación de archivos CSS

**No necesitas configurar nada más.**

---

## 🧪 Prueba Visual

### 1. Ejecutar la App

```bash
npm run dev
```

### 2. Abrir en Navegador

```
http://localhost:5173
```

### 3. Verificar Estilos

#### ✅ Deberías Ver:

- **Fondo:** Gradiente azul (de claro a oscuro)
- **Formulario:** Centrado, con bordes redondeados
- **Botones:** Azul (#3b82f6), redondeados
- **Inputs:** Bordes grises, fondo blanco
- **Texto:** Bien espaciado y legible

#### ❌ Si Ves:

- **Texto plano** sin estilos
- **Todo en blanco y negro**
- **Sin espaciado**

→ **Los estilos NO se están aplicando**

---

## 🔧 Soluciones a Problemas Comunes

### Problema 1: "Los Estilos No Se Ven"

#### Solución A: Limpieza Completa

```bash
# Detener servidor (Ctrl+C)

# Limpiar cache
rm -rf node_modules/.vite
rm -rf dist

# Reinstalar
rm -rf node_modules package-lock.json
npm install

# Ejecutar
npm run dev
```

#### Solución B: Script Automático

```bash
node diagnostico-estilos.js
node arreglar-estilos-automatico.js
npm install
npm run dev
```

---

### Problema 2: "Error: Cannot find module 'tailwindcss'"

#### Solución:

```bash
npm install
```

Si persiste:

```bash
npm install -D tailwindcss postcss autoprefixer
npm install
```

---

### Problema 3: "Los Estilos Se Ven en Figma Make pero NO en VS Code"

#### Causa:

Figma Make tiene procesamiento especial. VS Code usa las configuraciones locales.

#### Solución:

1. **Verificar que `main.tsx` importe `globals.css`:**

```typescript
import './styles/globals.css'
```

2. **Verificar `package.json` tiene Tailwind v3:**

```json
{
  "devDependencies": {
    "tailwindcss": "^3.4.1"
  }
}
```

3. **Reinstalar:**

```bash
npm install
npm run dev
```

---

### Problema 4: "TypeScript Errors en VS Code"

#### Síntomas:

- Líneas rojas en el código
- Errores de tipos

#### Solución:

```bash
# Instalar tipos faltantes
npm install -D @types/node @types/react @types/react-dom

# Reiniciar TypeScript Server en VS Code
# Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

---

### Problema 5: "Tailwind Classes No Tienen Autocompletado"

#### Solución:

1. Instala extensión: **Tailwind CSS IntelliSense**

2. Recarga VS Code:
   - Ctrl+Shift+P
   - "Developer: Reload Window"

3. Verifica que `tailwind.config.js` existe

---

### Problema 6: "Puerto 5173 Ya en Uso"

#### Solución A: Usar Otro Puerto

```bash
npm run dev -- --port 3000
```

#### Solución B: Matar Proceso

**Mac/Linux:**
```bash
killall node
npm run dev
```

**Windows:**
```bash
taskkill /F /IM node.exe
npm run dev
```

---

## 🎨 Verificar que Tailwind Funciona

### Test Rápido:

1. Abre cualquier componente (por ejemplo `App.tsx`)

2. Agrega una clase de Tailwind:

```typescript
<div className="bg-red-500 p-4 text-white">
  TEST - Esto debería tener fondo rojo
</div>
```

3. Guarda el archivo

4. Mira en el navegador

✅ **Si se ve rojo → Tailwind funciona**  
❌ **Si NO se ve rojo → Tailwind NO funciona**

---

## 📊 Herramientas de Diagnóstico

### Script 1: Diagnóstico

```bash
node diagnostico-estilos.js
```

**Verifica:**
- ✅ package.json correcto
- ✅ node_modules instalado
- ✅ Archivos de configuración existen
- ✅ globals.css tiene directivas de Tailwind
- ✅ main.tsx importa globals.css

---

### Script 2: Arreglo Automático

```bash
node arreglar-estilos-automatico.js
```

**Arregla:**
- ✅ Agrega import de globals.css si falta
- ✅ Limpia cache de Vite
- ✅ Actualiza package.json a Tailwind v3
- ✅ Crea/actualiza postcss.config.js

---

### Script 3: Verificación de Instalación

```bash
# Linux/Mac
./VERIFICAR_INSTALACION.sh

# Windows
VERIFICAR_INSTALACION.bat
```

**Verifica todo el proyecto de forma completa.**

---

## 📚 Archivos de Configuración

### Creados Automáticamente:

1. ✅ `.vscode/settings.json` - Configuración de VS Code
2. ✅ `.vscode/extensions.json` - Extensiones recomendadas
3. ✅ `.prettierrc` - Configuración de Prettier
4. ✅ `.eslintrc.cjs` - Configuración de ESLint
5. ✅ `.gitignore` - Archivos a ignorar
6. ✅ `postcss.config.js` - Configuración de PostCSS
7. ✅ `tailwind.config.js` - Configuración de Tailwind
8. ✅ `vite.config.ts` - Configuración de Vite

**No necesitas crear nada manualmente.**

---

## 🔍 Verificación en DevTools

### 1. Abrir DevTools

- **Chrome/Edge:** F12
- **Firefox:** F12

### 2. Inspeccionar un Botón

1. Haz clic derecho en un botón azul
2. Selecciona "Inspeccionar"
3. En el panel derecho, ve a "Computed"
4. Busca `background-color`

✅ **Debería mostrar:** `rgb(59, 130, 246)` (azul de Tailwind)

❌ **Si NO aparece o es blanco/gris:** Tailwind NO está funcionando

---

### 3. Ver Console

- Ve a la pestaña "Console"
- **NO debe haber errores rojos**
- Puede haber warnings amarillos de Firebase (es normal)

---

## ✅ Confirmación Final

### Si TODO está bien:

- [ ] `npm install` sin errores
- [ ] `npm run dev` inicia correctamente
- [ ] Navegador abre `http://localhost:5173`
- [ ] Se ve el gradiente azul
- [ ] Botones son azules y redondeados
- [ ] Texto está bien espaciado
- [ ] Es responsive (se adapta al tamaño)
- [ ] No hay errores en consola
- [ ] Tailwind IntelliSense funciona en VS Code

✅ **¡Perfecto! El proyecto está 100% compatible con VS Code**

---

## 🆘 Si Nada Funciona

### Último Recurso:

```bash
# 1. Borrar TODA la carpeta node_modules
rm -rf node_modules package-lock.json dist .vite

# 2. Reinstalar desde cero
npm install

# 3. Ejecutar diagnóstico
node diagnostico-estilos.js

# 4. Si hay errores, ejecutar arreglo
node arreglar-estilos-automatico.js

# 5. Instalar de nuevo si se modificó package.json
npm install

# 6. Ejecutar
npm run dev
```

---

## 📞 Documentación Adicional

- 📖 `VERIFICACION_COMPLETA.md` - Guía de verificación paso a paso
- 🔧 `SOLUCION_ESTILOS.md` - Soluciones a problemas de estilos
- 🐛 `SOLUCION_PANTALLA_BLANCA.md` - Solución a pantalla blanca
- 🚀 `README_EMPEZAR_AQUI.md` - Guía general de inicio
- 📚 `README.md` - Documentación completa

---

## 🎉 ¡Listo!

Si seguiste esta guía, tu proyecto debería estar funcionando perfectamente en VS Code con todos los estilos aplicados correctamente.

**Para ejecutar:**

```bash
npm run dev
```

**Para verificar:**

```bash
node diagnostico-estilos.js
```

**Para arreglar problemas:**

```bash
node arreglar-estilos-automatico.js
```

---

**Última actualización:** Optimizado para VS Code en Windows, Mac y Linux.
