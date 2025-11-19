# 🖥️ FORMAS DE VISUALIZAR TU TUTORAPP

## ✅ OPCIÓN 1: MODO DESARROLLO (RECOMENDADO)

### Comando:
```bash
npm run dev
```

### Por qué es la mejor:
- ✅ **Más rápido** - Inicia en segundos
- ✅ **Hot reload** - Los cambios se ven inmediatamente
- ✅ **Errores claros** - Ves los errores en tiempo real
- ✅ **No necesita build** - Funciona directo desde el código fuente
- ✅ **Siempre actualizado** - Refleja los últimos cambios

### URL:
```
http://localhost:5173
```

### Cuándo usar:
- Para trabajar en el proyecto
- Para probar funcionalidades
- Para desarrollo diario
- **USO DIARIO RECOMENDADO** ⭐

---

## ⚠️ OPCIÓN 2: PREVIEW DEL BUILD (Para pruebas de producción)

### Comandos (en orden):
```bash
# 1. Primero hacer build
npm run build

# 2. Luego preview
npm run preview
```

### Por qué puede fallar si solo haces `npm run preview`:
- ❌ El build puede estar desactualizado
- ❌ Puede no existir la carpeta `dist/`
- ❌ Los archivos pueden estar corruptos
- ❌ Falta compilar los cambios recientes

### URL:
```
http://localhost:4173
```

### Cuándo usar:
- Para probar cómo se verá en producción
- Antes de hacer deploy
- Para verificar el tamaño del bundle
- **NO para desarrollo diario**

---

## 🌐 OPCIÓN 3: SERVIDOR ESTÁTICO

### Instalar servidor:
```bash
npm install -g serve
```

### Comandos:
```bash
# 1. Build
npm run build

# 2. Servir con 'serve'
npx serve dist -p 8080
```

### URL:
```
http://localhost:8080
```

### Cuándo usar:
- Para compartir localmente
- Para probar en diferentes dispositivos en la misma red
- Para simular un servidor de producción

---

## ☁️ OPCIÓN 4: DEPLOY EN LA NUBE (Para producción)

### 4A. Netlify (Más fácil)

**Paso 1:** Ve a https://www.netlify.com

**Paso 2:** Conecta tu repositorio o arrastra la carpeta `dist/`

**Paso 3:** Configuración:
```
Build command: npm run build
Publish directory: dist
```

**Resultado:** URL pública tipo `https://tu-app.netlify.app`

---

### 4B. Vercel

**Paso 1:** Ve a https://vercel.com

**Paso 2:** Importa tu proyecto desde Git

**Paso 3:** Se despliega automáticamente

**Resultado:** URL pública tipo `https://tu-app.vercel.app`

---

### 4C. GitHub Pages

**Paso 1:** Agrega al `package.json`:
```json
{
  "homepage": "https://tu-usuario.github.io/tutorapp"
}
```

**Paso 2:** Instala gh-pages:
```bash
npm install --save-dev gh-pages
```

**Paso 3:** Agrega script:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

**Paso 4:** Despliega:
```bash
npm run deploy
```

---

## 📱 OPCIÓN 5: VISUALIZAR EN DISPOSITIVO MÓVIL (Misma red)

### Paso 1: Ejecuta en modo dev
```bash
npm run dev
```

### Paso 2: Busca tu IP local

**Windows (PowerShell):**
```powershell
ipconfig
# Busca "IPv4 Address"
```

**Mac/Linux:**
```bash
ifconfig | grep "inet "
# o
ip addr show
```

### Paso 3: Abre en móvil
```
http://TU_IP_LOCAL:5173
```

Ejemplo:
```
http://192.168.1.100:5173
```

---

## 🔧 OPCIÓN 6: ARREGLAR PREVIEW (Si realmente necesitas usarlo)

### Comandos completos:
```bash
# 1. Detener servidor actual
Ctrl + C

# 2. Limpiar build anterior
rm -rf dist

# Windows:
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# 3. Hacer build limpio
npm run build

# 4. Verificar que se creó dist/
ls dist/
# Deberías ver: index.html, assets/

# 5. Ejecutar preview
npm run preview

# 6. Abrir
http://localhost:4173
```

---

## 📊 COMPARACIÓN RÁPIDA

| Método | Velocidad | Hot Reload | Para Desarrollo | Para Producción |
|--------|-----------|------------|-----------------|-----------------|
| `npm run dev` | ⚡⚡⚡ | ✅ | ✅ Perfecto | ❌ |
| `npm run preview` | ⚡⚡ | ❌ | ❌ | ✅ Pruebas |
| Servidor estático | ⚡⚡ | ❌ | ❌ | ✅ Pruebas |
| Netlify/Vercel | ⚡ | ❌ | ❌ | ✅ Deploy real |

---

## 🎯 RECOMENDACIÓN SEGÚN TU CASO

### Si estás desarrollando:
```bash
npm run dev
```
**Abre:** http://localhost:5173

### Si quieres probar el build:
```bash
npm run build
npm run preview
```
**Abre:** http://localhost:4173

### Si quieres compartir con otros:
1. Deploy en Netlify (5 minutos)
2. O usar tu IP local en misma red

---

## ⚡ SOLUCIÓN RÁPIDA A TU PROBLEMA

**Tu problema actual:**
- Ejecutaste: `npx vite preview --port 5174`
- Resultado: Pantalla blanca

**Solución inmediata:**

### Opción A (Recomendada):
```bash
# Detener
Ctrl + C

# Usar desarrollo
npm run dev

# Abrir
http://localhost:5173
```

### Opción B (Si necesitas preview):
```bash
# Detener
Ctrl + C

# Build limpio
npm run build

# Preview
npm run preview

# Abrir
http://localhost:4173
```

---

## 🐛 DEBUGGING: SI VES PANTALLA BLANCA

### Paso 1: Abrir DevTools (F12)
- Pestaña **Console** → Busca errores en rojo
- Pestaña **Network** → Busca archivos 404

### Paso 2: Verificar archivos
```bash
# Ver si existe dist/
ls dist/

# Deberías ver:
# - index.html
# - assets/
#   - index-XXXXX.js
#   - index-XXXXX.css
```

### Paso 3: Si falta dist/ o está vacía
```bash
npm run build
```

---

## 📝 RESUMEN EJECUTIVO

### Para trabajar en la app (99% del tiempo):
```bash
npm run dev
```

### Para probar el build antes de producción (1% del tiempo):
```bash
npm run build
npm run preview
```

### Para deploy final:
- Netlify (recomendado)
- Vercel
- GitHub Pages

---

## 💡 TIP FINAL

**NUNCA uses `npm run preview` para desarrollo diario.**

Es como usar una foto de tu casa en lugar de entrar a tu casa real.

- **Foto (preview)** = Puede estar desactualizada
- **Casa real (dev)** = Siempre refleja la realidad

---

**🇨🇴 ¡Usa `npm run dev` y disfruta tu TutorApp!** 🚀📚
