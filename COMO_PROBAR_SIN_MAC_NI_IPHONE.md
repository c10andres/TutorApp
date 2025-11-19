# 📱 Cómo Probar iOS SIN Mac NI iPhone - Guía Rápida

## ⚡ MÉTODO RÁPIDO (5 minutos) - GRATIS

### Paso 1: Construir y servir la app
```bash
npm run test:ios:browser
```

O manualmente:
```bash
npm run build
npm run preview
```

### Paso 2: Abrir en Chrome/Edge

1. Abre **Chrome** o **Edge**
2. Presiona **F12** (o `Ctrl+Shift+I`)
3. Presiona **Ctrl+Shift+M** (o haz clic en el ícono 📱 de móvil)
4. En el menú superior, selecciona **"iPhone 14 Pro"** o **"iPhone SE"**
5. Ve a `http://localhost:3000` (o la URL que te muestra el script)

**¡LISTO!** Tu app se verá como en un iPhone real 🎉

---

## 🎯 Otras Opciones (Si Necesitas Más)

### Opción 1: GitHub Actions (Compilar iOS GRATIS)

Si tu proyecto está en GitHub (público):

1. Crea el archivo `.github/workflows/ios-build.yml` (ya lo creé por ti)
2. Haz push a GitHub
3. GitHub ejecutará la compilación en un Mac GRATIS en la nube
4. Descarga el resultado

**Es GRATIS** para repos públicos.

---

### Opción 2: Desplegar PWA y Probar en iPhone Prestado

1. **Construye la app:**
   ```bash
   npm run build
   ```

2. **Despliega a Netlify (gratis):**
   - Ve a https://netlify.com
   - Arrastra la carpeta `dist/` a Netlify
   - Obtienes una URL como `tutorapp-123.netlify.app`

3. **Pide a alguien con iPhone que:**
   - Abra Safari en su iPhone
   - Vaya a tu URL
   - Safari → Compartir → "Agregar a pantalla de inicio"
   - ¡La app se instalará como nativa!

4. **Prueba en su iPhone** - es como tener tu propio iPhone para pruebas

---

### Opción 3: Alquilar Mac en la Nube (Si Necesitas Compilar)

- **MacinCloud:** $1-2/hora o $20-30/mes
  - https://www.macincloud.com
  - Te conectas remotamente y usas Xcode

- **AWS EC2 Mac:** ~$1.08/hora
  - Instancias Mac en AWS
  - Perfecto para uso ocasional

---

## 📋 Resumen de Opciones

| Opción | Precio | Tiempo | Para Qué |
|--------|--------|--------|----------|
| **Chrome DevTools** | Gratis | 5 min | Probar UI/responsive ⭐ |
| **GitHub Actions** | Gratis | 10 min | Compilar iOS sin Mac |
| **Netlify + iPhone prestado** | Gratis | 15 min | Probar en iPhone real |
| **MacinCloud** | $1-2/hora | 30 min | Compilar iOS completo |
| **Appetize.io** | Gratis 100min/mes | 5 min | Probar .ipa ya compilado |

---

## ✅ Recomendación Final

**Para empezar AHORA:**
1. Ejecuta `npm run test:ios:browser`
2. Abre Chrome → F12 → Ctrl+Shift+M → Selecciona "iPhone 14 Pro"
3. ¡Listo! Pruebas tu app sin Mac ni iPhone

**Para compilar iOS después:**
- Usa GitHub Actions (gratis)
- O alquila Mac en MacinCloud si necesitas más control

---

## 📚 Documentación Completa

Para más detalles, revisa:
- `GUIA_PROBAR_IOS.md` - Guía completa con todas las opciones
- `.github/workflows/ios-build.yml` - Workflow de GitHub Actions

---

**¿Tienes dudas?** La guía completa está en `GUIA_PROBAR_IOS.md`






