# 🔍 SOLUCIÓN: PANTALLA BLANCA EN PREVIEW

## ❌ PROBLEMA
Cuando ejecutas `npx vite preview --port 5174`, ves una pantalla en blanco.

## 🎯 CAUSA
El problema es que estás viendo el **build de producción** (carpeta `dist/`) que puede tener errores o no estar actualizado.

---

## ✅ SOLUCIÓN RÁPIDA

### **USAR MODO DESARROLLO (NO PREVIEW)**

En lugar de usar `npx vite preview`, usa:

```bash
npm run dev
```

Esto ejecutará la aplicación en **modo desarrollo** donde TODO funciona correctamente.

---

## 📊 DIFERENCIAS: DEV vs PREVIEW

| Comando | Para qué es | Cuándo usarlo |
|---------|-------------|---------------|
| `npm run dev` | Desarrollo | ✅ Para trabajar en la app |
| `npm run preview` | Ver el build | ⚠️ Solo para probar antes de producción |

---

## 🔧 SI NECESITAS USAR PREVIEW

Si realmente necesitas probar el preview, sigue estos pasos:

### PASO 1: Detener cualquier servidor
```bash
Ctrl + C
```

### PASO 2: Hacer un build limpio
```bash
# Borrar build anterior
rm -rf dist

# Windows PowerShell:
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# Hacer nuevo build
npm run build
```

### PASO 3: Verificar que el build funcionó
Deberías ver:
```
✓ built in XXXXms
dist/index.html               X.XX kB
dist/assets/index-XXXXX.js    XXX.XX kB
dist/assets/index-XXXXX.css   XX.XX kB
```

### PASO 4: Ejecutar preview
```bash
npm run preview
# o
npx vite preview --port 5174
```

---

## 🐛 DEBUGGING: SI SIGUE EN BLANCO

### 1. Abrir DevTools (F12)

```
1. Presiona F12 en el navegador
2. Ve a la pestaña "Console"
3. Busca errores en rojo
```

**Errores comunes que verás:**

#### Error: "Failed to fetch dynamically imported module"
**Solución:**
```bash
rm -rf dist
npm run build
npm run preview
```

#### Error: "Cannot read property of undefined"
**Solución:** Hay un error en el código. Revisa la consola y me compartes el error.

#### Error: "404 Not Found" para archivos CSS/JS
**Solución:** Verifica que `vite.config.ts` tenga `base: './'` o `base: '/'`

---

### 2. Verificar Network (Red)

```
1. En DevTools, ve a la pestaña "Network"
2. Recarga la página (F5)
3. Busca archivos en rojo (404)
```

Si ves archivos 404:
- El build tiene problemas
- Necesitas reconstruir: `npm run build`

---

### 3. Verificar que los archivos existen

```bash
# Ver contenido de dist/
ls dist/

# Deberías ver:
# - index.html
# - assets/
#   - index-XXXXX.js
#   - index-XXXXX.css
```

Si NO ves estos archivos:
```bash
npm run build
```

---

## 🎯 RECOMENDACIÓN: USA MODO DESARROLLO

Para trabajar en tu aplicación, **SIEMPRE usa:**

```bash
npm run dev
```

**Beneficios:**
- ✅ Cambios en tiempo real
- ✅ Hot reload automático
- ✅ Errores claros en consola
- ✅ Más rápido
- ✅ Mejor experiencia de desarrollo

**Solo usa `npm run preview` cuando:**
- Quieras probar cómo se verá en producción
- Antes de hacer deploy
- Para verificar el tamaño del bundle

---

## 🚀 COMANDOS CORRECTOS

### Para Desarrollo (Recomendado):
```bash
npm run dev
```
Abre: http://localhost:5173

### Para Build + Preview:
```bash
# 1. Build
npm run build

# 2. Preview
npm run preview
```
Abre: http://localhost:4173

---

## 📝 CHECKLIST DE VERIFICACIÓN

- [ ] Detuve el servidor con Ctrl+C
- [ ] Ejecuté `npm run dev` (NO preview)
- [ ] Abrí http://localhost:5173
- [ ] Veo la aplicación con estilos
- [ ] Puedo navegar sin problemas

Si todos los checks están ✅, **estás usando el comando correcto**.

---

## ⚠️ IMPORTANTE

**`npm run preview` NO es para desarrollo diario.**

Es solo para:
- Ver el build final
- Probar antes de producción
- Verificar optimizaciones

**Para desarrollar, SIEMPRE usa:**
```bash
npm run dev
```

---

## 🎉 SOLUCIÓN FINAL

**Ejecuta este comando:**
```bash
npm run dev
```

**Abre en navegador:**
```
http://localhost:5173
```

**✅ Tu aplicación funcionará perfectamente.**

---

*Si necesitas más ayuda, abre DevTools (F12) y comparte los errores que veas en la consola.*