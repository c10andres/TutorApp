# 🎯 CÓMO EMPEZAR - Guía Ultra Simple

## ¿Nunca has usado Node.js o React? ¡No hay problema!

Esta es una guía paso a paso para personas que **nunca han desarrollado** antes.

---

## ✅ Paso 1: ¿Tienes Node.js instalado?

### ¿Cómo saber si lo tienes?

**Windows:**
1. Presiona `Windows + R`
2. Escribe `cmd` y presiona Enter
3. Escribe `node --version` y presiona Enter

**Mac/Linux:**
1. Abre la Terminal
2. Escribe `node --version` y presiona Enter

### Si aparece algo como "v18.17.0" o similar:
✅ **¡Ya lo tienes!** Salta al [Paso 2](#-paso-2-descargar-el-proyecto)

### Si aparece un error:
❌ **No lo tienes instalado.** Sigue estas instrucciones:

#### Instalar Node.js (toma 5 minutos):

1. **Ve a:** https://nodejs.org/
2. **Descarga** la versión **LTS** (el botón verde grande)
3. **Ejecuta** el instalador descargado
4. **Haz clic en "Next"** varias veces (deja todas las opciones por defecto)
5. **Espera** a que termine la instalación
6. **Reinicia** tu computadora

#### Verifica que se instaló:
- Abre la terminal/CMD de nuevo
- Escribe `node --version`
- Debería mostrar algo como `v18.17.0`

---

## 📥 Paso 2: Descargar el Proyecto

### Opción A: Ya descargaste este código de Figma Make
- ✅ Perfecto, ya tienes el proyecto descargado
- ✅ Continúa al [Paso 3](#-paso-3-abrir-el-proyecto)

### Opción B: Tienes el proyecto en un archivo .zip
1. **Descomprime** el archivo .zip
2. **Mueve** la carpeta a un lugar fácil de encontrar (por ejemplo, Documentos)
3. **Recuerda** dónde guardaste la carpeta

---

## 💻 Paso 3: Abrir el Proyecto

### Windows:

1. **Abre** el Explorador de Archivos
2. **Navega** a la carpeta del proyecto
3. **Haz clic derecho** dentro de la carpeta (en un espacio vacío)
4. **Selecciona** "Abrir en Terminal" o "Git Bash Here"
   - Si no aparece, presiona `Shift + Clic Derecho`
   - O busca "CMD" en el menú inicio, ábrelo, y escribe:
     ```
     cd C:\ruta\a\tu\proyecto
     ```

### Mac/Linux:

1. **Abre** la Terminal
2. **Escribe** `cd ` (con un espacio al final)
3. **Arrastra** la carpeta del proyecto a la Terminal
4. **Presiona** Enter

---

## 🔧 Paso 4: Instalar el Proyecto

### Método 1: Script Automático (Recomendado)

#### Windows:
1. **Doble clic** en el archivo `INSTALL.bat`
2. **Espera** 2-5 minutos
3. **Sigue** las instrucciones en pantalla
4. ✅ ¡Listo!

#### Mac/Linux:
1. En la Terminal (dentro de la carpeta del proyecto), escribe:
   ```bash
   chmod +x INSTALL.sh
   ./INSTALL.sh
   ```
2. **Espera** 2-5 minutos
3. **Sigue** las instrucciones en pantalla
4. ✅ ¡Listo!

---

### Método 2: Manual (si el script no funciona)

En la Terminal/CMD (dentro de la carpeta del proyecto), escribe:

```bash
npm install
```

**¿Qué verás?**
- Muchas líneas de texto pasando rápidamente
- Nombres de paquetes instalándose
- Barras de progreso (a veces)

**¿Cuánto tarda?**
- 2-5 minutos (depende de tu internet)

**¿Cómo sé que terminó?**
- Cuando vuelve a aparecer el cursor parpadeando
- Y puedes escribir de nuevo

**Si ves errores:**
- Lee la sección [Solución de Problemas](#-solución-de-problemas-comunes)

---

## 🚀 Paso 5: Ejecutar la Aplicación

En la Terminal/CMD, escribe:

```bash
npm run dev
```

**¿Qué verás?**
```
  VITE v4.4.5  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**¿Qué significa?**
- ✅ **¡La aplicación está corriendo!**
- ✅ Abre tu navegador
- ✅ Ve a: `http://localhost:5173`

---

## 🎉 ¡Listo! La Aplicación Está Corriendo

Ahora deberías ver la aplicación TutorApp en tu navegador.

### ¿Qué puedes hacer?

1. **Probar la app** sin configurar nada (modo demo)
2. **Registrar** un usuario de prueba
3. **Navegar** por todas las páginas
4. **Ver** cómo funciona la búsqueda de tutores
5. **Explorar** las funcionalidades de IA

### ⚠️ Nota sobre Firebase:
- La app mostrará algunas alertas sobre Firebase
- **Es normal**, la app funciona sin configurar Firebase
- Si quieres configurarlo más tarde, lee `README_FIREBASE_SETUP.md`

---

## 🛑 Cómo Detener la Aplicación

En la Terminal/CMD donde está corriendo:
- Presiona `Ctrl + C`
- La aplicación se detendrá
- Para volver a ejecutarla: `npm run dev`

---

## 📝 Resumen de Comandos

| Qué hacer | Comando |
|-----------|---------|
| Instalar dependencias | `npm install` |
| Ejecutar aplicación | `npm run dev` |
| Detener aplicación | `Ctrl + C` |
| Compilar para producción | `npm run build` |

---

## 🐛 Solución de Problemas Comunes

### ❌ Error: "npm no se reconoce como comando"

**Causa:** Node.js no está instalado o no se reinició la terminal  
**Solución:**
1. Cierra la Terminal/CMD
2. Reinicia tu computadora
3. Abre Terminal/CMD de nuevo
4. Verifica: `node --version`

---

### ❌ Error: "ENOENT: no such file or directory"

**Causa:** No estás en la carpeta correcta  
**Solución:**
1. Usa `cd` para navegar a la carpeta del proyecto
2. Verifica que estás en el lugar correcto:
   - Windows: `dir` (debería mostrar package.json)
   - Mac/Linux: `ls` (debería mostrar package.json)

---

### ❌ Error: "gyp ERR!" o errores de compilación

**Causa:** Falta software de compilación (raro)  
**Solución:**
- **Windows:** Instala Visual Studio Build Tools
- **Mac:** Instala Xcode Command Line Tools: `xcode-select --install`
- **Linux:** Instala build-essential: `sudo apt install build-essential`

Luego ejecuta `npm install` de nuevo.

---

### ❌ Pantalla blanca en el navegador

**Causa:** Error al cargar la app  
**Solución:**
1. Abre las DevTools del navegador (F12)
2. Ve a la pestaña "Console"
3. Busca errores en rojo
4. Si dice algo de Tailwind o CSS:
   ```bash
   rm -rf node_modules
   npm install
   npm run dev
   ```

---

### ❌ Puerto 5173 ya en uso

**Causa:** Ya hay una instancia corriendo  
**Solución:**

**Windows:**
```cmd
taskkill /F /IM node.exe
npm run dev
```

**Mac/Linux:**
```bash
killall node
npm run dev
```

---

### ❌ Errores de Firebase al usar la app

**Causa:** Normal, Firebase no está configurado  
**Solución:**
- **Opción 1:** Ignora las alertas (la app funciona)
- **Opción 2:** Configura Firebase (lee `README_FIREBASE_SETUP.md`)

---

## 🆘 ¿Todavía Tienes Problemas?

1. **Lee:** `README_EMPEZAR_AQUI.md` (guía más detallada)
2. **Busca:** El error en Google
3. **Revisa:** Los otros archivos .md del proyecto

---

## 📚 Próximos Pasos (Opcional)

Una vez que la app esté corriendo, puedes:

### 1. Configurar Firebase (1-2 horas)
- Lee: `README_FIREBASE_SETUP.md`
- Habilita autenticación real
- Base de datos en tiempo real
- Chat funcional

### 2. Compilar para Android (2-4 horas)
- Lee: `GUIA_ANDROID_STUDIO.md`
- Instala Android Studio
- Genera APK
- Prueba en tu celular

### 3. Personalizar la App
- Cambia colores en `/styles/globals.css`
- Modifica textos en las páginas
- Agrega tu logo
- Cambia el nombre de la app

---

## ✨ ¡Felicidades!

Si llegaste hasta aquí y la app está corriendo, **¡lo lograste!** 🎉

Ahora tienes:
- ✅ Una aplicación completa de tutorías
- ✅ Código funcional en React + TypeScript
- ✅ Diseño responsive para móvil y web
- ✅ 17 páginas completas
- ✅ Sistema de autenticación
- ✅ Chat en tiempo real
- ✅ Y mucho más...

---

## 🎯 Comandos de Memoria Rápida

```bash
# 1. Instalar (solo la primera vez)
npm install

# 2. Ejecutar (cada vez que quieras usar la app)
npm run dev

# 3. Abrir en navegador
http://localhost:5173

# 4. Detener (cuando termines)
Ctrl + C
```

---

## 📖 Documentación Adicional

- 📘 `README.md` - Documentación completa
- 🚀 `README_EMPEZAR_AQUI.md` - Guía detallada
- 🔥 `README_FIREBASE_SETUP.md` - Configurar Firebase
- 📱 `GUIA_ANDROID_STUDIO.md` - Compilar para Android
- 🐛 `SOLUCION_PANTALLA_BLANCA.md` - Problemas comunes

---

**¿Listo?** 

```bash
npm install
npm run dev
```

**¡A programar!** 💻✨
