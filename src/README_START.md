# 🎓 TutorApp - Inicio Rápido

## ⚡ Instalación en 3 Pasos

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Firebase
Edita `firebase.ts` con tus credenciales:
```typescript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  databaseURL: "https://tu-proyecto-rtdb.firebaseio.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

Obtener credenciales:
1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Crear proyecto nuevo
3. Habilitar Authentication > Email/Password
4. Crear Realtime Database
5. Copiar credenciales de configuración

### 3. Ejecutar
```bash
npm run dev
```

Abrir: http://localhost:5173

---

## 📚 Documentación Completa

Ver **GUIA_REPLICACION_COMPLETA.md** para:
- Requisitos previos detallados
- Configuración Firebase paso a paso
- Estructura del proyecto completa
- Solución de problemas
- Todas las funcionalidades

---

## ✨ Funcionalidades

- 🔐 Autenticación completa
- 👥 Perfiles estudiante/tutor
- 🔍 Búsqueda 103 materias
- 💬 Chat tiempo real
- 📚 Gestión tutorías
- ⭐ Reviews y calificaciones
- 💰 Pagos COP (Colombia)
- 📊 Gestión académica
- 🤖 4 módulos IA

---

## 🇨🇴 Hecho para Colombia

- 25 ubicaciones colombianas
- 103 materias universitarias
- Moneda: COP
- Métodos pago: PSE, Nequi, Daviplata

---

**🚀 ¡Listo para usar!**
