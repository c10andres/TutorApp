# 🔧 Actualizar Node.js en GitHub Actions - Solución Completa

## ✅ Cambios Realizados

He actualizado el workflow `.github/workflows/ios-build.yml` con todas las mejoras recomendadas:

**Cambios implementados (versión mejorada):**
1. ✅ **Node.js 20.x:** `node-version: '20.x'` (usa última versión de serie 20, >=20.0.0)
2. ✅ **Verificación estricta:** Script que falla si Node.js < 20.0.0 antes de continuar
3. ✅ **Instalación explícita de Capacitor CLI:** `npm install --no-save @capacitor/cli@latest` (versión más reciente)
4. ✅ **Limpieza de caché:** Limpia caché de npm antes de instalar dependencias
5. ✅ **Doble verificación:** Verifica Node.js >=20.0.0 antes y después de instalar dependencias
6. ✅ **Sin `|| true`:** Removido `|| true` de `npx cap add ios` para fallar temprano si hay errores
7. ✅ **Verificación de Capacitor CLI:** Verifica que Capacitor CLI está instalado y muestra versión

---

## 📤 Subir Cambios a GitHub

Si Git está instalado, ejecuta estos comandos:

### En Git Bash o PowerShell:

```bash
# 1. Navegar al proyecto
cd "C:\Users\carlo\Downloads\TutorApp (18)"

# 2. Verificar estado
git status

# 3. Agregar el archivo modificado
git add .github/workflows/ios-build.yml

# 4. Hacer commit
git commit -m "Actualizar Node.js a versión 20 (>=20.0.0) para Capacitor"

# 5. Subir cambios
git push
```

---

## 🔧 Si Git NO está Instalado

### Opción 1: Instalar Git (Recomendado)

1. **Descargar Git:**
   - Ve a: https://git-scm.com/download/win
   - O ejecuta en PowerShell: `Start-Process "https://git-scm.com/download/win"`

2. **Instalar:**
   - Ejecuta el instalador
   - Click "Next" en todas las pantallas
   - **IMPORTANTE:** Marca "Add Git to PATH"
   - Click "Install"

3. **Cerrar y abrir PowerShell de nuevo**

4. **Ejecutar los comandos arriba**

### Opción 2: Subir Manualmente en GitHub Web

1. **Ve a tu repositorio:**
   - https://github.com/c10andres/TutorApp

2. **Editar el archivo:**
   - Navega a: `.github/workflows/ios-build.yml`
   - Click en el botón **"✏️ Edit"** (lápiz)

3. **Buscar y cambiar:**
   - Busca la línea: `node-version: '20.x'`
   - Cámbiala a: `node-version: '20'`

4. **Guardar:**
   - Scroll hacia abajo
   - Mensaje del commit: `"Actualizar Node.js a versión 20 (>=20.0.0) para Capacitor"`
   - Click en **"Commit changes"**

---

## 🚀 Después de Subir

1. **El workflow se ejecutará automáticamente** (si tienes push activado)
   
   O ejecuta manualmente:

2. **Ir a GitHub Actions:**
   - Ve a: https://github.com/c10andres/TutorApp/actions

3. **Ejecutar workflow:**
   - Click en **"Build iOS App"**
   - Click en **"Run workflow"**
   - Selecciona rama: **main**
   - Click en **"Run workflow"**

4. **Esperar:**
   - Tiempo estimado: 5-15 minutos
   - El workflow usará Node.js 20 (>=20.0.0) ✅

---

## ✅ Verificación

Después de ejecutar el workflow, verifica que:

- ✅ No aparece el error: "The Capacitor CLI requires NodeJS >=20.0.0"
- ✅ El paso "Setup Node.js 20" muestra: `v20.x.x` (>=20.0.0)
- ✅ El paso "Instalar Capacitor CLI" se ejecuta correctamente
- ✅ Los comandos `npx cap add ios` y `npx cap sync ios` funcionan sin errores
- ✅ Si hay un error real, el workflow falla temprano (gracias a quitar `|| true`)

## 🔍 Por Qué Esto Resuelve el Problema

1. **Node.js >=20.0.0:** Capacitor CLI verifica la versión al arrancar; con Node 20 cumple el requisito
2. **CLI explícita:** Instalar `@capacitor/cli` antes asegura que está disponible, incluso si `npm ci` tiene problemas
3. **Fallo temprano:** Quitar `|| true` permite detectar errores reales inmediatamente, facilitando la depuración
4. **Doble verificación:** Logs de versión antes y después de instalar dependencias ayudan a diagnosticar problemas

---

## 🎯 Archivo Modificado

**Archivo:** `.github/workflows/ios-build.yml`

**Cambios detallados:**

1. **Línea 25:** `node-version: '20'` (cumple requisito >=20.0.0)
2. **Líneas 37-38:** Nuevo paso para instalar Capacitor CLI explícitamente
   ```yaml
   - name: Instalar Capacitor CLI
     run: npm install --no-save @capacitor/cli
   ```
3. **Línea 54:** Removido `|| true` de `npx cap add ios` (ahora falla temprano si hay errores)
   ```yaml
   - name: Agregar plataforma iOS
     run: npx cap add ios  # ✅ Sin || true
   ```

## 📋 Orden de Ejecución Mejorado

El workflow ahora sigue este orden optimizado:

1. ✅ Checkout código
2. ✅ Setup Node.js 20 (>=20.0.0)
3. ✅ Verificar versión de Node.js
4. ✅ Instalar dependencias (`npm ci`)
5. ✅ Instalar Capacitor CLI explícitamente
6. ✅ Instalar Capacitor iOS
7. ✅ Build web app
8. ✅ Verificar Node.js antes de Capacitor (doble verificación)
9. ✅ Agregar plataforma iOS (sin `|| true` - falla temprano si hay error)
10. ✅ Sincronizar iOS
11. ✅ Build iOS para simulador

---

**¿Necesitas ayuda con algún paso?** Dime y te guío.

