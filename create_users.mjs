import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA2cv8Zv9ahULWaPrqvfDeRUo2M5Je5BTU",
  authDomain: "udconecta-4bfff.firebaseapp.com",
  databaseURL: "https://udconecta-4bfff-default-rtdb.firebaseio.com/",
  projectId: "udconecta-4bfff",
  storageBucket: "udconecta-4bfff.appspot.com",
  messagingSenderId: "50299431698",
  appId: "1:50299431698:web:092a716de008e36c1b61cb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const usersToCreate = [
  {
    email: 'maestro@tutorapp.com',
    password: 'TutorApp123!',
    name: 'Administrador Maestro',
    currentMode: 'student',
    isAdmin: true,
    reputationPoints: 10000,
    udCoins: 10000,
    redeemablePoints: 10000,
    academicRole: 'administrativo',
    rank: 'Maestro',
    badges: ['Admin', 'Fundador'],
    subjects: [],
    preferredSubjects: [],
    hourlyPoints: 0,
    rating: 5,
    totalReviews: 0,
    availability: true,
    experience: 'Administrador del sistema'
  },
  // Estudiantes
  {
    email: 'estudiante1@tutorapp.com',
    password: 'TutorApp123!',
    name: 'Estudiante Uno',
    currentMode: 'student',
    isAdmin: false,
    reputationPoints: 100,
    udCoins: 50,
    academicRole: 'estudiante',
    rank: 'Novato',
    badges: [],
    subjects: [],
    preferredSubjects: ['Cálculo', 'Física'],
    hourlyPoints: 0,
    rating: 0,
    totalReviews: 0,
    availability: false,
    experience: 'Estudiante de primer año'
  },
  {
    email: 'estudiante2@tutorapp.com',
    password: 'TutorApp123!',
    name: 'Estudiante Dos',
    currentMode: 'student',
    isAdmin: false,
    reputationPoints: 150,
    udCoins: 70,
    academicRole: 'estudiante',
    rank: 'Novato',
    badges: [],
    subjects: [],
    preferredSubjects: ['Química', 'Biología'],
    hourlyPoints: 0,
    rating: 0,
    totalReviews: 0,
    availability: false,
    experience: 'Estudiante de segundo año'
  },
  {
    email: 'estudiante3@tutorapp.com',
    password: 'TutorApp123!',
    name: 'Estudiante Tres',
    currentMode: 'student',
    isAdmin: false,
    reputationPoints: 200,
    udCoins: 100,
    academicRole: 'estudiante',
    rank: 'Aprendiz',
    badges: [],
    subjects: [],
    preferredSubjects: ['Programación', 'Bases de Datos'],
    hourlyPoints: 0,
    rating: 0,
    totalReviews: 0,
    availability: false,
    experience: 'Estudiante de tercer año'
  },
  // Docentes
  {
    email: 'docente1@tutorapp.com',
    password: 'TutorApp123!',
    name: 'Docente Uno',
    currentMode: 'tutor',
    isAdmin: false,
    reputationPoints: 500,
    udCoins: 300,
    academicRole: 'docente',
    rank: 'Tutor Experto',
    badges: ['Verificado', 'Excelente'],
    subjects: ['Cálculo', 'Física'],
    preferredSubjects: [],
    hourlyPoints: 20,
    rating: 4.8,
    totalReviews: 15,
    availability: true,
    experience: 'Profesor titular de matemáticas'
  },
  {
    email: 'docente2@tutorapp.com',
    password: 'TutorApp123!',
    name: 'Docente Dos',
    currentMode: 'tutor',
    isAdmin: false,
    reputationPoints: 600,
    udCoins: 400,
    academicRole: 'docente',
    rank: 'Tutor Experto',
    badges: ['Verificado'],
    subjects: ['Química', 'Biología'],
    preferredSubjects: [],
    hourlyPoints: 25,
    rating: 4.9,
    totalReviews: 20,
    availability: true,
    experience: 'Especialista en ciencias naturales'
  },
  {
    email: 'docente3@tutorapp.com',
    password: 'TutorApp123!',
    name: 'Docente Tres',
    currentMode: 'tutor',
    isAdmin: false,
    reputationPoints: 700,
    udCoins: 500,
    academicRole: 'docente',
    rank: 'Tutor Maestro',
    badges: ['Verificado', 'Top Tutor'],
    subjects: ['Programación', 'Ingeniería de Software'],
    preferredSubjects: [],
    hourlyPoints: 30,
    rating: 5.0,
    totalReviews: 35,
    availability: true,
    experience: 'Arquitecto de software senior'
  },
  // Administrativos
  {
    email: 'administrativo1@tutorapp.com',
    password: 'TutorApp123!',
    name: 'Administrativo Uno',
    currentMode: 'student',
    isAdmin: false,
    reputationPoints: 300,
    udCoins: 300,
    academicRole: 'administrativo',
    rank: 'Coordinador',
    badges: ['Staff'],
    subjects: [],
    preferredSubjects: [],
    hourlyPoints: 0,
    rating: 0,
    totalReviews: 0,
    availability: false,
    experience: 'Coordinación académica'
  },
  {
    email: 'administrativo2@tutorapp.com',
    password: 'TutorApp123!',
    name: 'Administrativo Dos',
    currentMode: 'student',
    isAdmin: false,
    reputationPoints: 300,
    udCoins: 300,
    academicRole: 'administrativo',
    rank: 'Asistente',
    badges: ['Staff'],
    subjects: [],
    preferredSubjects: [],
    hourlyPoints: 0,
    rating: 0,
    totalReviews: 0,
    availability: false,
    experience: 'Asistente de registro'
  },
  {
    email: 'administrativo3@tutorapp.com',
    password: 'TutorApp123!',
    name: 'Administrativo Tres',
    currentMode: 'student',
    isAdmin: false,
    reputationPoints: 300,
    udCoins: 300,
    academicRole: 'administrativo',
    rank: 'Bienestar',
    badges: ['Staff'],
    subjects: [],
    preferredSubjects: [],
    hourlyPoints: 0,
    rating: 0,
    totalReviews: 0,
    availability: false,
    experience: 'Bienestar universitario'
  }
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateUsers() {
  console.log("Iniciando creación de usuarios...");
  for (const u of usersToCreate) {
    try {
      // Intentar crear el usuario en Auth
      let userCredential;
      try {
         userCredential = await createUserWithEmailAndPassword(auth, u.email, u.password);
         console.log(`Auth creado para ${u.email} (UID: ${userCredential.user.uid})`);
      } catch (e) {
         if (e.code === 'auth/email-already-in-use') {
            console.log(`El usuario ${u.email} ya existe, iniciando sesión para obtener UID...`);
            userCredential = await signInWithEmailAndPassword(auth, u.email, u.password);
         } else {
            throw e;
         }
      }
      
      const uid = userCredential.user.uid;

      // Construir perfil de base de datos
      const userProfile = {
        id: uid,
        email: u.email,
        name: u.name,
        createdAt: new Date().toISOString(),
        currentMode: u.currentMode,
        isAdmin: u.isAdmin,
        reputationPoints: u.reputationPoints,
        udCoins: u.udCoins,
        redeemablePoints: u.udCoins,
        academicRole: u.academicRole,
        rank: u.rank,
        badges: u.badges || [],
        subjects: u.subjects || [],
        preferredSubjects: u.preferredSubjects || [],
        hourlyPoints: u.hourlyPoints,
        rating: u.rating,
        totalReviews: u.totalReviews,
        availability: u.availability,
        experience: u.experience
      };

      await set(ref(db, `users/${uid}`), userProfile);
      console.log(`Perfil guardado para ${u.email} en Database`);
      
      await auth.signOut();
      await sleep(1000); // Pequeña pausa para no saturar
    } catch (error) {
      console.error(`Error al procesar ${u.email}:`, error);
    }
  }
  console.log("Proceso completado. ¡Se han creado todos los usuarios!");
  process.exit(0);
}

generateUsers();
