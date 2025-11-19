# 🎓 GUÍA PASO A PASO PARA PRINCIPIANTES - TUTORAPP

## 📱 ¿QUÉ APLICACIONES NECESITO?

### 1️⃣ **Visual Studio Code (VS Code)** 
- **Para qué**: Editar código y ejecutar comandos
- **Ya lo tienes**: ✅ (porque me dices que abres el proyecto ahí)

### 2️⃣ **Terminal/Línea de Comandos**
- **Para qué**: Ejecutar comandos de instalación
- **Dónde está**:
  - **Windows**: PowerShell (viene con Windows) o Terminal dentro de VS Code
  - **Mac**: Terminal (viene con Mac)
  - **Linux**: Terminal (viene con Linux)

### 3️⃣ **Navegador Web**
- **Para qué**: Ver tu aplicación funcionando
- **Usa**: Chrome, Firefox, Edge o Safari

---

## 🚀 PASO A PASO - ARREGLAR LOS ESTILOS

### **PASO 1: ABRIR VS CODE**

1. Abre **Visual Studio Code**
2. Abre la carpeta de tu proyecto TutorApp:
   - Menu → File → Open Folder
   - Selecciona la carpeta donde está tu TutorApp

---

### **PASO 2: ABRIR LA TERMINAL EN VS CODE**

Hay 3 formas de abrir la terminal en VS Code:

**Opción A** (Más fácil):
- Presiona estas teclas juntas: **Ctrl + `** (la tilde está arriba del Tab)
- En Mac: **Cmd + `**

**Opción B** (Con menú):
- Click en menú **Terminal** → **New Terminal**

**Opción C** (Con teclas):
- Presiona **Ctrl + Shift + P** (o **Cmd + Shift + P** en Mac)
- Escribe "terminal"
- Selecciona "Terminal: Create New Terminal"

📸 **Deberías ver** una ventana en la parte inferior de VS Code que dice algo como:
```
PS C:\Users\TuNombre\TutorApp>
```
o
```
usuario@computadora ~/TutorApp %
```

---

### **PASO 3: VERIFICAR QUE ESTÁS EN LA CARPETA CORRECTA**

En la terminal que acabas de abrir, escribe:

**Windows (PowerShell):**
```powershell
ls
```

**Mac/Linux:**
```bash
ls
```

**¿Qué deberías ver?**
Una lista de archivos que incluya:
- package.json
- App.tsx
- firebase.ts
- tailwind.config.js
- etc.

Si NO ves estos archivos, navega a la carpeta correcta:
```bash
cd ruta/a/tu/proyecto/TutorApp
```

---

### **PASO 4: DETENER EL SERVIDOR (SI ESTÁ CORRIENDO)**

Si ya tenías `npm run dev` ejecutándose:

1. Click en la terminal
2. Presiona **Ctrl + C** (Windows/Mac/Linux)
3. Espera a que aparezca el prompt (PS > o %)

---

### **PASO 5: LIMPIAR INSTALACIÓN ANTERIOR**

Copia y pega estos comandos UNO POR UNO en la terminal:

#### **Windows (PowerShell):**

**Comando 1 - Borrar node_modules:**
```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
```
Presiona **Enter**

**Comando 2 - Borrar package-lock.json:**
```powershell
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
```
Presiona **Enter**

**Comando 3 - Limpiar cache:**
```powershell
npm cache clean --force
```
Presiona **Enter**

---

#### **Mac/Linux:**

**Comando 1 - Borrar node_modules:**
```bash
rm -rf node_modules
```
Presiona **Enter**

**Comando 2 - Borrar package-lock.json:**
```bash
rm -rf package-lock.json
```
Presiona **Enter**

**Comando 3 - Limpiar cache:**
```bash
npm cache clean --force
```
Presiona **Enter**

---

### **PASO 6: INSTALAR DEPENDENCIAS**

Ahora copia este comando en la terminal:

```bash
npm install
```

Presiona **Enter**

**⏰ ESTO PUEDE TARDAR 2-5 MINUTOS**

Verás algo como:
```
npm WARN deprecated...
added 500 packages...
```

**✅ Cuando termine**, verás algo como:
```
added 500 packages in 2m
```

---

### **PASO 7: EJECUTAR LA APLICACIÓN**

Ahora ejecuta:

```bash
npm run dev
```

Presiona **Enter**

**✅ Deberías ver:**
```
VITE v4.4.5  ready in 847 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
```

---

### **PASO 8: ABRIR EN EL NAVEGADOR**

1. Abre tu navegador favorito (Chrome, Firefox, Edge, Safari)
2. En la barra de direcciones escribe:
   ```
   http://localhost:5173
   ```
3. Presiona **Enter**

---

### **PASO 9: VERIFICAR QUE FUNCIONA**

**✅ SI TODO ESTÁ BIEN**, verás:

- **Fondo con gradiente azul-índigo** (no blanco plano)
- **Logo "TutorApp"** en el centro
- **Formulario de login** con bordes redondeados
- **Botones azules** que cambian de color al pasar el mouse
- **Campos de email y contraseña** con fondo claro

**❌ SI SIGUES VIENDO TEXTO PLANO:**

1. Presiona **Ctrl + Shift + R** (Windows/Linux) o **Cmd + Shift + R** (Mac)
   - Esto limpia el cache del navegador
2. Si no funciona, prueba en **modo incógnito**:
   - **Chrome/Edge**: Ctrl + Shift + N
   - **Firefox**: Ctrl + Shift + P
   - **Safari**: Cmd + Shift + N

---

## 🎯 RESUMEN RÁPIDO DE LOS COMANDOS

### Windows PowerShell:
```powershell
# 1. Limpiar
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm cache clean --force

# 2. Instalar
npm install

# 3. Ejecutar
npm run dev
```

### Mac/Linux:
```bash
# 1. Limpiar
rm -rf node_modules package-lock.json
npm cache clean --force

# 2. Instalar
npm install

# 3. Ejecutar
npm run dev
```

### Abrir navegador:
```
http://localhost:5173
```

---

## 📸 CAPTURAS CONCEPTUALES

### CÓMO SE VE LA TERMINAL EN VS CODE:

```
┌─────────────────────────────────────────────┐
│  VS CODE                                    │
├─────────────────────────────────────────────┤
│                                             │
│  [Tu código aquí]                           │
│                                             │
├─────────────────────────────────────────────┤
│  TERMINAL                          [_ □ X]  │
├─────────────────────────────────────────────┤
│  PS C:\Users\Tu\TutorApp> npm install       │
│  npm WARN deprecated...                     │
│  added 500 packages in 2m                   │
│  PS C:\Users\Tu\TutorApp> █                 │
└─────────────────────────────────────────────┘
```

### CÓMO SE VE CUANDO FUNCIONA (NAVEGADOR):

```
┌─────────────────────────────────────────────┐
│  Chrome: http://localhost:5173         [x]  │
├─────────────────────────────────────────────┤
│                                             │
│         🎓 TutorApp                         │
│    ════════════════════                     │
│                                             │
│    ┌─────────────────────────┐             │
│    │  Email                  │             │
│    │  [__________________]   │             │
│    │                         │             │
│    │  Contraseña             │             │
│    │  [__________________]   │             │
│    │                         │             │
│    │   [  Iniciar Sesión  ]  │  ← Azul     │
│    │                         │             │
│    │   ¿No tienes cuenta?    │             │
│    └─────────────────────────┘             │
│                                             │
│  Fondo con gradiente azul-índigo           │
└─────────────────────────────────────────────┘
```

---

## 🆘 PROBLEMAS COMUNES

### ❌ "npm: command not found"
**Problema**: Node.js no está instalado
**Solución**:
1. Ve a https://nodejs.org
2. Descarga la versión LTS (recomendada)
3. Instala
4. Cierra y vuelve a abrir VS Code
5. Intenta de nuevo

### ❌ "Cannot find module"
**Problema**: Los paquetes no se instalaron
**Solución**:
```bash
npm install
```

### ❌ "Port 5173 is already in use"
**Problema**: Ya hay un servidor corriendo
**Solución**:
1. Busca en VS Code otras terminales abiertas
2. Ciérralas todas (click en el ícono de basurero)
3. Abre una nueva terminal
4. Ejecuta `npm run dev` de nuevo

### ❌ "Permission denied"
**Problema**: No tienes permisos
**Solución Mac/Linux**:
```bash
sudo npm install
```
Ingresa tu contraseña cuando te la pida

### ❌ Los estilos siguen sin verse
**Solución**:
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Copia cualquier error que veas
4. Busca ayuda con ese error específico

---

## 📞 GLOSARIO DE TÉRMINOS

| Término | Qué es |
|---------|--------|
| **Terminal** | Ventana negra donde escribes comandos |
| **PowerShell** | Terminal de Windows |
| **npm** | Gestor de paquetes de Node.js |
| **node_modules** | Carpeta con todos los paquetes instalados |
| **package.json** | Archivo con la lista de dependencias |
| **localhost** | Tu computadora (servidor local) |
| **puerto 5173** | Canal de comunicación para el servidor |
| **Ctrl + C** | Detener un proceso en la terminal |
| **Ctrl + `** | Abrir/cerrar terminal en VS Code |

---

## ✅ CHECKLIST FINAL

Marca cada paso conforme lo completes:

- [ ] Abrí VS Code
- [ ] Abrí la terminal (Ctrl + `)
- [ ] Verifiqué que estoy en la carpeta correcta (ls)
- [ ] Detuve el servidor anterior (Ctrl + C)
- [ ] Borré node_modules
- [ ] Borré package-lock.json
- [ ] Limpié el cache (npm cache clean --force)
- [ ] Instalé dependencias (npm install)
- [ ] Ejecuté el servidor (npm run dev)
- [ ] Abrí http://localhost:5173 en el navegador
- [ ] Veo los estilos correctamente (gradiente azul, botones con color)

---

## 🎉 ¡LISTO!

Si completaste todos los pasos, tu TutorApp debería verse perfecta con todos los estilos aplicados.

**Próximos pasos:**
1. Registra un usuario
2. Explora la aplicación
3. Disfruta tu TutorApp funcionando al 100%

---

## 💡 TIPS ÚTILES

### Para detener el servidor:
```
Ctrl + C
```

### Para volver a ejecutar:
```bash
npm run dev
```

### Para limpiar y reinstalar todo de nuevo:
```bash
# Windows
Remove-Item -Recurse -Force node_modules
npm install
npm run dev

# Mac/Linux
rm -rf node_modules
npm install
npm run dev
```

---

**🇨🇴 ¡Tu TutorApp está lista para Colombia!** 🚀📚

*Si sigues teniendo problemas, revisa el archivo: SOLUCION_ESTILOS.md*
