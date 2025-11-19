# 🚀 FIREBASE DEPLOYMENT - GUÍA RÁPIDA

## ⚡ Deployment en 5 Minutos

### Paso 1: Instalar Firebase CLI (solo la primera vez)
```bash
npm install -g firebase-tools
```

### Paso 2: Login en Firebase
```bash
firebase login
```

### Paso 3: Inicializar Firebase (solo la primera vez)
```bash
firebase init

# Selecciona:
# [x] Firestore
# [x] Hosting
# [x] Storage

# Responde:
# - Use existing project: [Selecciona tu proyecto]
# - Firestore rules: firestore.rules (presiona Enter)
# - Firestore indexes: firestore.indexes.json (presiona Enter)
# - Public directory: dist
# - Single-page app: Yes
# - Storage rules: storage.rules (presiona Enter)
```

### Paso 4: Configurar Firebase Credentials

Edita `/firebase.ts` con tus credenciales (obtén de Firebase Console):

```typescript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com"
};
```

### Paso 5: Deploy Completo (Un Solo Comando)

#### Opción A: Script Automático (Recomendado)

**Windows:**
```powershell
.\deploy-firebase.ps1
```

**Mac/Linux:**
```bash
chmod +x deploy-firebase.sh
./deploy-firebase.sh
```

#### Opción B: Comando Manual
```bash
npm install && npm run build && firebase deploy
```

---

## 🎯 Comandos Esenciales

### Deploy Completo
```bash
firebase deploy
```

### Deploy Solo Hosting (más rápido)
```bash
npm run build && firebase deploy --only hosting
```

### Deploy Solo Reglas
```bash
firebase deploy --only firestore:rules,storage:rules
```

### Deploy Solo Índices
```bash
firebase deploy --only firestore:indexes
```

---

## 📱 URLs de tu App

Después del deployment, tu app estará disponible en:
- `https://tu-proyecto-id.web.app`
- `https://tu-proyecto-id.firebaseapp.com`

---

## ✅ Checklist Pre-Deployment

- [ ] Node.js instalado (v18+)
- [ ] Firebase CLI instalado
- [ ] Logueado en Firebase (`firebase login`)
- [ ] Proyecto Firebase creado en la consola
- [ ] Authentication habilitado (Email/Password)
- [ ] Firestore Database creado
- [ ] Storage habilitado
- [ ] Archivo `/firebase.ts` configurado con tus credenciales
- [ ] `npm install` ejecutado sin errores
- [ ] `npm run build` funciona correctamente

---

## 🔧 Troubleshooting Rápido

### Error: "Command not found: firebase"
```bash
npm install -g firebase-tools
```

### Error: "Not logged in"
```bash
firebase login
```

### Error: "No project active"
```bash
firebase use --add
# Selecciona tu proyecto
```

### Error: Build falla
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Error: "Missing index"
Copia la URL del error, ábrela en el navegador y haz clic en "Crear índice"

---

## 📊 Verificar Deployment

### 1. Ver Estado
```bash
firebase hosting:releases:list
```

### 2. Abrir App
```bash
firebase open hosting:site
```

### 3. Ver Logs
```bash
firebase hosting:channel:list
```

---

## 🔄 Updates Futuros

Para actualizar tu app después del primer deployment:

```bash
# 1. Hacer cambios en el código
# 2. Ejecutar:
npm run build && firebase deploy --only hosting
```

---

## 🆘 Links Útiles

- **Firebase Console**: https://console.firebase.google.com
- **Documentación**: https://firebase.google.com/docs
- **CLI Reference**: https://firebase.google.com/docs/cli

---

## 💡 Consejos Pro

1. **Usar Emuladores Locales** (para testing sin tocar producción):
   ```bash
   firebase emulators:start
   ```

2. **Ver Uso de Recursos**:
   ```bash
   firebase projects:info
   ```

3. **Rollback si algo sale mal**:
   ```bash
   firebase hosting:rollback
   ```

4. **Agregar Dominio Personalizado**:
   - Ve a Firebase Console > Hosting > Agregar dominio personalizado
   - Sigue las instrucciones

5. **Habilitar Analytics**:
   - Ve a Firebase Console > Analytics
   - Haz clic en "Habilitar"

---

## 🎉 ¡Listo!

Tu TutorApp ahora está en producción en Firebase Hosting.

**URL**: https://tu-proyecto-id.web.app

Para documentación completa, revisa: `FIREBASE_DEPLOYMENT_COMPLETO.md`
