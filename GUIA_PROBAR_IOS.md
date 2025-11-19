# Guía para Probar la App en iOS sin iPhone Físico

## 🚨 GUÍA ESPECIAL: SIN MAC NI IPHONE

Si **NO TIENES MAC NI IPHONE**, aquí están tus opciones en orden de facilidad:

### ✅ OPCIÓN MÁS FÁCIL: Probar la PWA en Navegadores (Gratis, Ahora Mismo)

Como tu app es una **PWA (Progressive Web App)**, puedes probarla en navegadores que simulan iPhone **SIN NECESITAR NADA MÁS**.

---

## Opción 1: Simular iPhone en Chrome/Edge DevTools (GRATIS) ⭐⭐⭐ MEJOR OPCIÓN SIN MAC

### Pasos Rápidos:

1. **Construir la app:**
   ```bash
   npm run build
   ```

2. **Iniciar servidor local (o subir a hosting):**
   ```bash
   npm run preview
   ```
   O si prefieres servir los archivos:
   ```bash
   npx serve dist
   ```

3. **Abrir Chrome o Edge** y presiona `F12` (o `Ctrl+Shift+I`)

4. **Activar modo dispositivo móvil:**
   - Presiona `Ctrl+Shift+M` (o haz clic en el ícono de móvil 📱)
   - En el menú superior, selecciona **"iPhone 14 Pro"** o **"iPhone SE"**

5. **¡Listo!** Tu app se verá como en un iPhone real

### Configuración Recomendada en DevTools:
- **Dispositivo:** iPhone 14 Pro
- **Resolución:** 390 x 844
- **Ratio de píxeles:** 3
- **Conectar en red local:** Para probar desde tu celular Android accediendo a `http://tu-ip:3000`

**Ventajas:**
- ✅ 100% Gratis
- ✅ Inmediato
- ✅ Puedes probar responsive design
- ✅ Funciona ahora mismo desde Windows/Linux
- ✅ Puedes probar en tu teléfono Android accediendo a la IP local

**Limitaciones:**
- ⚠️ No tendrás plugins nativos de iOS
- ⚠️ Algunas funcionalidades específicas de iOS no funcionarán

---

### OPCIÓN 1B: Probar en Safari Online (Mejor experiencia iOS)

1. **Usa Safari Technology Preview** (si tienes Windows):
   - Descarga desde: https://developer.apple.com/safari/technology-preview/
   - No está disponible para Windows oficialmente, PERO...

2. **O usa un servicio de Safari en la nube:**
   - **Sauce Labs** ofrece Safari en la nube
   - **BrowserStack** tiene Safari para pruebas web
   - Ambos tienen versiones gratuitas limitadas

---

## Opción 2: Mac Virtual en la Nube (Alquilar Mac por Horas) 💰

Si necesitas compilar iOS o probar funcionalidades nativas:

### Servicios Recomendados:

#### 2.1. MacinCloud
- **Precio:** Desde $20-30/mes o $1-2/hora
- **Qué obtienes:** Mac remoto con Xcode preinstalado
- **Cómo funciona:** Te conectas por VNC/RDP y usas el Mac como si fuera tuyo
- **Link:** https://www.macincloud.com

#### 2.2. MacStadium
- **Precio:** Desde $50/mes (más profesional)
- **Mejor para:** Uso continuo
- **Link:** https://www.macstadium.com

#### 2.3. AWS EC2 Mac Instances
- **Precio:** Pay-per-use (~$1.08/hora)
- **Mejor para:** Uso ocasional
- **Cómo:** Crea una instancia EC2 Mac en AWS

#### 2.4. GitHub Actions / GitLab CI (Gratis para proyectos públicos)

Si tu proyecto está en GitHub/GitLab, puedes usar runners de Mac GRATIS:

**GitHub Actions (Gratis para repos públicos):**
```yaml
# .github/workflows/ios-test.yml
name: iOS Build and Test
on: [push]
jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - run: npx cap sync ios
      # Sube el .ipa a Appetize o similar
```

**Esto es GRATIS** si tu repo es público en GitHub!

---

## Opción 3: Servicios de Testing en la Nube (Sin Compilar) 🧪

Para probar apps YA COMPILADAS (necesitas que alguien compile por ti primero):

### 3.1. Appetize.io ⭐ RECOMENDADO PARA PRUEBAS RÁPIDAS

**Cómo funciona:**
1. Alguien con Mac compila tu app y crea un `.ipa`
2. Subes el `.ipa` a Appetize.io
3. Lo pruebas en navegador como si fuera un iPhone real

**Precio:** 100 minutos/mes GRATIS

**Pasos:**
1. Ve a https://appetize.io
2. Crea cuenta gratis
3. Sube tu `.ipa` (cuando lo tengas)
4. Prueba en navegador

**¿Cómo conseguir el .ipa sin Mac?**
- Usa GitHub Actions (opción 2.4 arriba)
- Usa un servicio de Mac en la nube (opción 2)
- Pide ayuda a alguien con Mac

---

### 3.2. BrowserStack (Más completo)

- **Precio:** 100 minutos gratis (requiere tarjeta)
- **Qué obtienes:** Dispositivos iOS reales en la nube
- **Link:** https://www.browserstack.com

---

## Opción 4: Probar PWA en iPhone de Amigo/Préstamo 📱

Si conoces a alguien con iPhone:

1. **Despliega tu app web** (Netlify, Vercel, Firebase Hosting - todo gratis):
   ```bash
   npm run build
   # Luego despliega dist/ a Netlify/Vercel
   ```

2. **Pide a tu amigo que:**
   - Abra Safari en su iPhone
   - Vaya a tu URL desplegada
   - Safari → Compartir → "Agregar a pantalla de inicio"
   - ¡La app se instalará como nativa!

3. **Prueba en su iPhone** - esto es lo más cercano a tener tu propio iPhone

**Servicios de hosting GRATIS:**
- **Netlify:** https://netlify.com (drag & drop de la carpeta `dist/`)
- **Vercel:** https://vercel.com (`npx vercel --prod`)
- **Firebase Hosting:** https://firebase.google.com (ya lo tienes configurado)

---

## Opción 1: Simulador de iOS (Requiere Mac) ⭐ RECOMENDADO SI TIENES MAC

Esta es la opción más común y gratuita para desarrolladores.

### Requisitos:
- **Mac** (macOS 10.15 o superior)
- **Xcode** instalado (descarga gratuita desde App Store)
- **Cuenta de desarrollador de Apple** (gratuita es suficiente para simulador)

### Pasos para configurar:

#### 1. Instalar dependencias de iOS:

```bash
npm install @capacitor/ios
```

#### 2. Agregar plataforma iOS:

```bash
npx cap add ios
```

#### 3. Sincronizar el proyecto:

```bash
npm run build
npx cap sync ios
```

#### 4. Abrir en Xcode:

```bash
npx cap open ios
```

#### 5. En Xcode:
- Selecciona un simulador de iOS (iPhone 14, iPhone 15, etc.)
- Haz clic en el botón "Play" (▶️) o presiona `Cmd + R`
- La app se abrirá en el simulador

### Simuladores disponibles:
- iPhone 15 Pro (iOS 17+)
- iPhone 14 Pro (iOS 16+)
- iPhone SE (iOS 16+)
- iPad Pro (iOS 16+)

---

## Opción 2: Servicios en la Nube (Sin Mac)

### 2.1. Appetize.io (Muy fácil, versión gratuita limitada)

**Pasos:**

1. **Compilar la app para iOS** (necesitas acceso a una Mac o usar un servicio de compilación):
   ```bash
   npx cap build ios
   ```

2. **Crear un archivo `.ipa`** desde Xcode:
   - Product → Archive
   - Distribute App → Development
   - Export como `.ipa`

3. **Subir a Appetize.io**:
   - Ve a https://appetize.io
   - Crea cuenta gratuita (100 minutos/mes gratis)
   - Sube tu `.ipa`
   - Accede desde cualquier navegador

**Precio:** Gratis hasta 100 minutos/mes

---

### 2.2. BrowserStack (Más completo, pago con prueba gratuita)

1. **Regístrate** en https://www.browserstack.com
2. **Prueba gratuita** de 100 minutos (requiere tarjeta)
3. **Sube tu `.ipa`** o compila directamente en su plataforma
4. **Prueba en múltiples dispositivos** iOS reales

**Precio:** Desde $29/mes

---

### 2.3. Sauce Labs (Empresarial)

1. **Regístrate** en https://saucelabs.com
2. **Plataforma completa** de testing
3. **Múltiples dispositivos** iOS disponibles

**Precio:** Desde $49/mes

---

### 2.4. AWS Device Farm

1. **Cuenta de AWS** (tienes créditos gratuitos si eres nuevo)
2. **Sube tu `.ipa`**
3. **Prueba en dispositivos reales** en la nube

**Precio:** Pay-per-use, muy económico para pruebas ocasionales

---

## Opción 3: Probar en Safari (Desktop) - PWA/Web

Como tu app usa Capacitor y es básicamente una web app, puedes probar parcialmente en Safari:

### Pasos:

1. **Construir la app web:**
   ```bash
   npm run build
   ```

2. **Abrir Safari** (disponible en Windows también como Safari Technology Preview, aunque limitado)

3. **Habilitar herramientas de desarrollador:**
   - Safari → Preferencias → Avanzado → "Mostrar menú de desarrollo"

4. **Probar responsive design**:
   - Ver → Entrar en modo Responsive Design
   - Seleccionar "iPhone 14 Pro" o similar

**Limitaciones:** 
- No tendrás acceso a plugins nativos de iOS
- Algunas funcionalidades específicas de iOS no funcionarán
- Es solo para probar la UI básica

---

## Opción 4: Alquilar o Usar un Mac Virtual

### 4.1. MacStadium / MacinCloud (Servicios de Mac en la Nube)

1. **Alquila un Mac virtual** por horas/días
2. **Accede remotamente** vía VNC o RDP
3. **Usa Xcode y simuladores** como si fuera tu Mac

**Precio:** Desde $20-50/mes o $1-2/hora

### 4.2. Mac Virtual Machine (No oficial, viola términos de Apple)

⚠️ **ADVERTENCIA:** Técnicamente viola los términos de servicio de Apple, aunque algunos desarrolladores lo usan.

**Requisitos:**
- PC con Windows/Linux potente
- Instalar macOS en VirtualBox/VMware
- Configuración compleja

**No recomendado** por términos legales de Apple.

---

## Opción 5: TestFlight (Para distribución beta)

Requiere Mac + cuenta de desarrollador de Apple ($99/año)

1. **Compila la app** en Xcode
2. **Sube a App Store Connect**
3. **Distribuye vía TestFlight**
4. **Invita usuarios** (máx. 10,000 beta testers)
5. **Ellos instalan** en sus iPhones reales

**Perfecto para:** Pruebas beta con usuarios reales antes del lanzamiento.

---

## 🎯 Recomendación según tu situación:

### ⭐ Si NO TIENES MAC NI IPHONE (Tu caso):

**OPCIÓN INMEDIATA (Gratis, ahora mismo):**
1. **Opción 1: Chrome DevTools** → Simular iPhone en navegador
   - Construye la app: `npm run build && npm run preview`
   - Presiona `F12` → `Ctrl+Shift+M` → Selecciona "iPhone 14 Pro"
   - ✅ **Funciona AHORA MISMO sin nada más**

**Si necesitas compilar iOS nativo:**
2. **Opción 2.4: GitHub Actions** → Usa Mac GRATIS en la nube
   - Crea repo público en GitHub
   - Configura workflow (ver código arriba)
   - Compila iOS GRATIS sin tener Mac

**Si tienes presupuesto:**
3. **Opción 2.1: MacinCloud** → Alquila Mac por horas ($1-2/hora)
   - Acceso completo a Xcode y simuladores
   - Perfecto para compilaciones ocasionales

**Para pruebas en iPhone real:**
4. **Opción 4: Deploy PWA + Préstamo de iPhone**
   - Despliega en Netlify/Vercel (gratis)
   - Pide a alguien con iPhone que pruebe
   - La PWA se instala como app nativa

---

### Si tienes acceso a una Mac (aunque sea prestada):
→ **Simulador iOS** (100% recomendado)

### Si eres estudiante:
→ Busca laboratorios de tu universidad con Macs o usa **GitHub Actions** (gratis para repos públicos)

### Si es para producción:
→ Considera **MacStadium** o **AWS EC2 Mac** para Mac dedicado

---

## 🚀 Próximos Pasos Recomendados SIN MAC NI IPHONE:

### PASO 1: Prueba INMEDIATA (5 minutos)
```bash
npm run build
npm run preview
```
Luego abre Chrome → `F12` → `Ctrl+Shift+M` → Selecciona "iPhone 14 Pro"

### PASO 2: Si necesitas compilar iOS
- **Opción A (Gratis):** Usa GitHub Actions (configura workflow)
- **Opción B (Pago):** Alquila Mac en MacinCloud por horas

### PASO 3: Para pruebas en iPhone real
- Despliega PWA en Netlify/Vercel (gratis)
- Pide a amigo/familiar con iPhone que pruebe

---

## Scripts útiles para agregar a package.json:

```json
{
  "scripts": {
    "cap:add:ios": "npx cap add ios",
    "cap:sync:ios": "npx cap sync ios",
    "cap:open:ios": "npx cap open ios",
    "ios:build": "npm run build && npx cap sync ios",
    "ios:run": "npm run ios:build && npx cap open ios"
  }
}
```

---

## Nota Importante:

Para compilar una app iOS necesitas **obligatoriamente un Mac** o un servicio de compilación en la nube. No hay forma de compilar apps iOS nativas desde Windows/Linux de forma oficial.

Las opciones sin Mac solo te permiten:
- Probar apps ya compiladas (Appetize, BrowserStack)
- Probar la versión web/PWA en navegadores
- Usar servicios de Mac en la nube para compilar

