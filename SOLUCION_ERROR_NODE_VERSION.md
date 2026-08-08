# 🔧 Solución al Error: "The Capacitor CLI requires NodeJS >=20.0.0"

## ⚠️ Si SIGUE apareciendo el error después de actualizar el workflow

### 🔍 Diagnóstico

Si el error persiste, puede deberse a:

1. **Los cambios NO se han subido a GitHub todavía**
   - El workflow en GitHub aún tiene la versión antigua
   - Necesitas subir el archivo `.github/workflows/ios-build.yml` actualizado

2. **GitHub Actions está usando caché**
   - La caché de Node.js puede estar guardando una versión antigua
   - El workflow ahora limpia la caché automáticamente

3. **El workflow en GitHub es diferente al local**
   - Verifica que el archivo en GitHub tenga `node-version: '20.x'`

---

## ✅ Verificación Inmediata

### Paso 1: Verificar que los cambios están en el archivo local

```bash
# En PowerShell o Git Bash
cat .github/workflows/ios-build.yml | grep -A 3 "node-version"
```

**Debe mostrar:**
```yaml
node-version: '20.x'
```

Si muestra `'18'` o `'20'` (sin `.x`), el archivo no está actualizado.

### Paso 2: Subir los cambios a GitHub

**Opción A: Si Git está instalado**

```bash
git add .github/workflows/ios-build.yml
git commit -m "Actualizar Node.js a 20.x con verificaciones estrictas"
git push
```

**Opción B: Editar directamente en GitHub (más rápido)**

1. Ve a: https://github.com/c10andres/TutorApp
2. Navega a: `.github/workflows/ios-build.yml`
3. Click en **"Edit"** (lápiz)
4. Busca: `node-version: '20'` (o `'18'`)
5. Cámbiala a: `node-version: '20.x'`
6. Busca el bloque de verificación y actualízalo con:

```yaml
    - name: Verificar versión de Node.js (>=20.0.0 requerido)
      run: |
        NODE_VERSION=$(node --version | sed 's/v//')
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)
        echo "Node.js version: $NODE_VERSION"
        echo "npm version: $(npm --version)"
        
        if [ "$NODE_MAJOR" -lt 20 ]; then
          echo "❌ ERROR: Node.js $NODE_VERSION es menor que 20.0.0"
          echo "Capacitor CLI requiere Node.js >=20.0.0"
          exit 1
        fi
        echo "✅ Node.js $NODE_VERSION cumple el requisito >=20.0.0"
```

7. Scroll hacia abajo, mensaje: `"Actualizar Node.js a 20.x con verificaciones"`
8. Click en **"Commit changes"**

### Paso 3: Limpiar caché de GitHub Actions (si es necesario)

1. Ve a: https://github.com/c10andres/TutorApp/actions
2. Click en **"Build iOS App"**
3. Click en los **tres puntos** (⋮) arriba a la derecha
4. Click en **"Delete all caches"**
5. Confirma eliminación

### Paso 4: Ejecutar el workflow de nuevo

1. En la pestaña **"Actions"**
2. Click en **"Build iOS App"**
3. Click en **"Run workflow"**
4. Selecciona rama: **main**
5. Click en **"Run workflow"**

---

## 🔍 Verificación en los Logs

Cuando ejecutes el workflow, busca estos pasos en los logs:

### ✅ Debe aparecer:

1. **"Setup Node.js 20"**
   - Debe instalar Node.js 20.x.x

2. **"Verificar versión de Node.js (>=20.0.0 requerido)"**
   - Debe mostrar: `Node.js version: 20.x.x`
   - Debe mostrar: `✅ Node.js 20.x.x cumple el requisito >=20.0.0`

3. **"Instalar Capacitor CLI"**
   - Debe mostrar: `✅ Capacitor CLI instalado`
   - Debe mostrar la versión de Capacitor

4. **"Verificar Node.js y Capacitor antes de ejecutar"**
   - Debe mostrar: `✅ Todo listo para ejecutar Capacitor`

### ❌ Si aparece:

- `Node.js version: 18.x.x` → El workflow NO se actualizó en GitHub
- `ERROR: Node.js X es menor que 20.0.0` → El workflow detectó el problema y falló temprano

---

## 🛠️ Cambios Aplicados en Esta Versión

El workflow ahora incluye:

```22:40:.github/workflows/ios-build.yml
    - name: Setup Node.js 20
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Verificar versión de Node.js (>=20.0.0 requerido)
      run: |
        NODE_VERSION=$(node --version | sed 's/v//')
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)
        echo "Node.js version: $NODE_VERSION"
        echo "npm version: $(npm --version)"
        
        if [ "$NODE_MAJOR" -lt 20 ]; then
          echo "❌ ERROR: Node.js $NODE_VERSION es menor que 20.0.0"
          echo "Capacitor CLI requiere Node.js >=20.0.0"
          exit 1
        fi
        echo "✅ Node.js $NODE_VERSION cumple el requisito >=20.0.0"
```

Y también:

```42:54:.github/workflows/ios-build.yml
    - name: Limpiar caché de npm (si es necesario)
      run: |
        npm cache clean --force || true
        echo "✅ Caché limpiado"
    
    - name: Instalar dependencias
      run: npm ci
    
    - name: Instalar Capacitor CLI
      run: |
        npm install --no-save @capacitor/cli@latest
        echo "✅ Capacitor CLI instalado"
        npx cap --version
```

---

## 📋 Checklist Completo

Antes de ejecutar el workflow nuevamente:

- [ ] El archivo local `.github/workflows/ios-build.yml` tiene `node-version: '20.x'`
- [ ] El archivo está subido a GitHub (verifica en la web)
- [ ] La caché de GitHub Actions está limpia (opcional pero recomendado)
- [ ] Estás ejecutando el workflow desde la rama `main`

---

## 🆘 Si el error persiste

1. **Comparte los logs completos** del paso que falla
2. **Verifica en los logs** qué versión de Node.js muestra
3. **Confirma** que el archivo en GitHub tiene `node-version: '20.x'`

Los logs te mostrarán exactamente qué versión de Node.js se está usando y dónde está fallando.

---

**¿Necesitas ayuda con algún paso?** Comparte los logs y te ayudo a diagnosticar.

