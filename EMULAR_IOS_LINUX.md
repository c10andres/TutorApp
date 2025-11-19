# 🐧 Cómo Emular/Probar iOS desde Linux

## 🎯 Respuesta Rápida

**No puedes emular iOS nativamente en Linux**, pero puedes **probar tu app como si fuera iOS** usando estas opciones:

---

## ✅ Opción 1: Chrome/Chromium DevTools (Más Fácil - GRATIS)

### Pasos:

1. **Ejecutar tu app en desarrollo:**
   ```bash
   npm run dev
   ```
   Tu app estará en: `http://localhost:3000` (o el puerto que muestre)

2. **Abrir Chrome o Chromium**

3. **Abrir DevTools:**
   - Presiona `F12` o `Ctrl+Shift+I`
   - O click derecho → "Inspeccionar"

4. **Activar modo dispositivo móvil:**
   - Presiona `Ctrl+Shift+M`
   - O click en el ícono de móvil 📱 (arriba a la izquierda)

5. **Seleccionar iPhone:**
   - En el menú desplegable arriba, selecciona:
     - **iPhone 14 Pro** (recomendado)
     - **iPhone SE**
     - **iPhone 12 Pro**
     - O cualquier otro iPhone

6. **¡Listo!** Tu app se verá como en un iPhone real

### Instalar Chrome/Chromium si no lo tienes:

**Ubuntu/Debian:**
```bash
# Chromium
sudo apt update
sudo apt install chromium-browser

# O Chrome (descargar desde Google)
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo apt-get install -f
```

**Fedora:**
```bash
sudo dnf install chromium
```

**Arch Linux:**
```bash
sudo pacman -S chromium
```

---

## ✅ Opción 2: Firefox Responsive Design Mode

### Pasos:

1. **Ejecutar app:**
   ```bash
   npm run dev
   ```

2. **Abrir Firefox**

3. **Activar modo responsive:**
   - Presiona `Ctrl+Shift+M`
   - O Tools → Responsive Design Mode

4. **Seleccionar iPhone:**
   - En el menú desplegable, elige "iPhone 6/7/8" o "iPhone X"

5. **¡Listo!**

### Instalar Firefox si no lo tienes:

```bash
# Ubuntu/Debian
sudo apt install firefox

# Fedora
sudo dnf install firefox

# Arch
sudo pacman -S firefox
```

---

## ✅ Opción 3: Usar el Script de Prueba iOS

Ya tienes un script configurado:

```bash
npm run test:ios:browser
```

Este script:
1. Construye tu app
2. Inicia un servidor local
3. Te da instrucciones para probar en Chrome DevTools

---

## ✅ Opción 4: Servicios en la Nube (Sin Instalar Nada)

### Appetize.io (Gratis 100 min/mes)

1. **Construir tu app:**
   ```bash
   npm run build
   ```

2. **Desplegar en Netlify (gratis):**
   ```bash
   # Instalar Netlify CLI
   npm install -g netlify-cli
   
   # Desplegar
   netlify deploy --prod --dir=dist
   ```
   O arrastra `dist/` a https://netlify.com

3. **Probar en Appetize:**
   - Ve a https://appetize.io
   - Crea cuenta gratis
   - Ingresa tu URL de Netlify
   - Prueba en iPhone simulado en el navegador

### BrowserStack (Prueba gratuita)

1. Ve a https://www.browserstack.com
2. Crea cuenta (prueba gratuita)
3. Selecciona "Live" → "iOS"
4. Elige dispositivo iPhone
5. Ingresa tu URL

---

## ✅ Opción 5: Probar PWA en iPhone Real (Sin Compilar)

### Si conoces a alguien con iPhone:

1. **Construir y desplegar:**
   ```bash
   npm run build
   ```
   - Sube `dist/` a Netlify/Vercel (gratis)
   - Obtienes URL pública

2. **En el iPhone:**
   - Abre Safari
   - Ve a tu URL
   - Safari → Compartir → "Agregar a pantalla de inicio"
   - ¡Se instala como app nativa!

---

## 🎯 Recomendación para Linux

### Para Desarrollo Diario:

**Usa Chrome/Chromium DevTools (Opción 1):**

1. En tu terminal, ejecuta:
   ```bash
   npm run dev
   ```

2. Abre Chrome/Chromium

3. `F12` → `Ctrl+Shift+M` → Selecciona "iPhone 14 Pro"

4. **Ventajas:**
   - ✅ Gratis
   - ✅ Inmediato
   - ✅ Puedes ver cambios en tiempo real
   - ✅ Funciona perfecto en Linux
   - ✅ Puedes probar responsive design

### Para Pruebas Más Realistas:

**Usa Appetize.io o BrowserStack:**
- Pruebas en iPhone simulado real
- Mejor para testing final

---

## 🔧 Configuración Avanzada en DevTools

### Personalizar iPhone:

1. En DevTools, click en el ícono de configuración ⚙️
2. **Device:** iPhone 14 Pro
3. **Resolution:** 390 x 844
4. **Device pixel ratio:** 3
5. **Throttling:** Fast 3G o Slow 3G (para probar conexión lenta)
6. **Touch:** Enabled (simula toques)

### Probar Diferentes Orientaciones:

- **Portrait (Vertical):** `Ctrl+Shift+M` → Click en el ícono de rotar
- **Landscape (Horizontal):** Mismo proceso

---

## 📱 Dispositivos iOS Disponibles en DevTools

- iPhone SE (375 x 667)
- iPhone 12 Pro (390 x 844)
- iPhone 14 Pro (390 x 844) ⭐ Recomendado
- iPhone 14 Pro Max (430 x 932)
- iPad (768 x 1024)
- iPad Pro (1024 x 1366)

---

## 🚀 Script Rápido para Probar

```bash
# Ejecutar app y abrir en navegador
npm run dev

# Luego en Chrome/Chromium:
# F12 → Ctrl+Shift+M → iPhone 14 Pro
```

---

## 💡 Tips para Desarrollo iOS desde Linux

1. **Usa Chrome DevTools diariamente:**
   - Es la forma más rápida
   - Cambios en tiempo real
   - No necesitas instalar nada más

2. **Prueba en diferentes tamaños:**
   - iPhone SE (pequeño)
   - iPhone 14 Pro (normal)
   - iPhone 14 Pro Max (grande)

3. **Prueba orientaciones:**
   - Portrait (vertical)
   - Landscape (horizontal)

4. **Prueba conexiones:**
   - Fast 3G
   - Slow 3G
   - Offline

5. **Para pruebas finales:**
   - Usa Appetize.io o BrowserStack
   - O pide a alguien con iPhone que pruebe

---

## 🎯 Resumen: ¿Qué Opción Usar?

| Opción | Cuándo Usar | Dificultad | Costo |
|--------|-------------|------------|-------|
| **Chrome DevTools** | Desarrollo diario | ⭐ Fácil | Gratis |
| **Firefox Responsive** | Alternativa a Chrome | ⭐ Fácil | Gratis |
| **Appetize.io** | Pruebas finales | ⭐⭐ Media | Gratis (100min/mes) |
| **BrowserStack** | Testing profesional | ⭐⭐ Media | Prueba gratis |
| **PWA en iPhone real** | Pruebas reales | ⭐ Fácil | Gratis |

---

## ✅ Comandos Rápidos

```bash
# Desarrollo con hot reload
npm run dev
# Luego: Chrome → F12 → Ctrl+Shift+M → iPhone 14 Pro

# Build para producción
npm run build
# Luego: Sube dist/ a Netlify y prueba en Appetize

# Probar iOS específicamente
npm run test:ios:browser
```

---

## 🐛 Solución de Problemas

### Chrome/Chromium no se abre:

**Solución:**
```bash
# Verificar que está instalado
which chromium
which google-chrome

# Si no está, instalar según tu distro
```

### La app no se ve bien en modo móvil:

**Solución:**
- Verifica que tienes viewport configurado en `index.html`
- Revisa que los estilos son responsive
- Prueba diferentes tamaños de iPhone

### No puedo hacer clic en elementos:

**Solución:**
- En DevTools, activa "Touch" en la configuración
- O usa el modo táctil del navegador

### Los cambios no se reflejan:

**Solución:**
- Refresca la página (`Ctrl+R` o `F5`)
- Verifica que `npm run dev` está corriendo
- Limpia caché del navegador (`Ctrl+Shift+Delete`)

---

**¿Listo para probar?** Ejecuta `npm run dev` y abre Chrome/Chromium con DevTools en modo iPhone. ¡Es la forma más rápida de probar iOS desde Linux!

