# 📤 Alternativas para Subir Código a GitHub

## ❌ Problema Actual

Git no está disponible en PowerShell. Aquí tienes **3 alternativas**:

---

## ✅ OPCIÓN 1: Usar Git Bash (Más Fácil) ⭐

### Pasos:

1. **Busca "Git Bash"** en el menú de inicio de Windows
2. **Ábrelo** (terminal negra con texto verde)
3. **Ejecuta estos comandos:**

```bash
# 1. Navegar a tu proyecto
cd "/c/Users/carlo/Downloads/TutorApp (18)"

# 2. Verificar Git
git --version

# 3. Configurar Git (solo primera vez)
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"

# 4. Inicializar
git init
git add .
git commit -m "Initial commit - TutorApp Colombia"

# 5. Conectar con GitHub (REEMPLAZA con tus datos)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

**Cuando pida contraseña:** Usa tu Personal Access Token (no tu contraseña normal)

---

## ✅ OPCIÓN 2: GitHub Desktop (Interfaz Gráfica)

### Instalar GitHub Desktop:

1. **Descargar:**
   - Ve a: https://desktop.github.com
   - O ejecuta:
   ```powershell
   Start-Process "https://desktop.github.com"
   ```

2. **Instalar:**
   - Ejecuta el instalador
   - Sigue las instrucciones

3. **Usar:**
   - Abre GitHub Desktop
   - File → Add Local Repository
   - Selecciona tu carpeta: `C:\Users\carlo\Downloads\TutorApp (18)`
   - Click "Publish repository"
   - Elige nombre y visibilidad
   - Click "Publish repository"

**Ventajas:**
- ✅ Interfaz gráfica (fácil)
- ✅ No necesitas comandos
- ✅ Maneja Git automáticamente

---

## ✅ OPCIÓN 3: Agregar Git al PATH Manualmente

### Si Git está instalado pero no en PATH:

1. **Buscar dónde está Git:**
   ```powershell
   # Buscar en ubicaciones comunes
   Get-ChildItem "C:\Program Files\Git" -Recurse -Filter "git.exe" -ErrorAction SilentlyContinue
   Get-ChildItem "C:\Program Files (x86)\Git" -Recurse -Filter "git.exe" -ErrorAction SilentlyContinue
   ```

2. **Agregar al PATH:**
   - Busca "Variables de entorno" en Windows
   - Variables del sistema → "Path" → Editar
   - Agregar: `C:\Program Files\Git\cmd`
   - Aceptar y cerrar PowerShell de nuevo

3. **Verificar:**
   ```powershell
   git --version
   ```

---

## 🎯 Recomendación

**Usa Git Bash (Opción 1):**
- ✅ Ya viene con Git instalado
- ✅ Funciona inmediatamente
- ✅ No necesitas configurar nada más

**O GitHub Desktop (Opción 2):**
- ✅ Más fácil si prefieres interfaz gráfica
- ✅ No necesitas saber comandos

---

## 📋 Pasos Completos con Git Bash

### 1. Abrir Git Bash

Busca "Git Bash" en el menú de inicio y ábrelo.

### 2. Navegar al proyecto

```bash
cd "/c/Users/carlo/Downloads/TutorApp (18)"
```

### 3. Verificar Git

```bash
git --version
```

Deberías ver: `git version 2.x.x`

### 4. Configurar Git (solo primera vez)

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"
```

### 5. Inicializar y subir

```bash
# Inicializar
git init

# Agregar archivos
git add .

# Commit
git commit -m "Initial commit - TutorApp Colombia"

# Conectar con GitHub (REEMPLAZA con tus datos)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main

# Subir (usarás token como contraseña)
git push -u origin main
```

---

## 🔐 Personal Access Token

**Antes de `git push`, crea el token:**

1. Ve a: https://github.com/settings/tokens
2. Generate new token (classic)
3. Marca "repo" en permisos
4. Copia el token
5. Úsalo como contraseña cuando Git lo pida

---

## ✅ Checklist

- [ ] Git Bash abierto (o GitHub Desktop instalado)
- [ ] Repositorio creado en GitHub
- [ ] Personal Access Token creado
- [ ] Estás en la carpeta del proyecto

---

**¿Qué opción prefieres?** Git Bash es la más rápida. Si prefieres interfaz gráfica, usa GitHub Desktop.

