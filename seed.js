/* eslint-disable @typescript-eslint/no-var-requires */
const admin = require('firebase-admin');
const { faker } = require('@faker-js/faker');
const serviceAccount = require('./serviceAccountKey.json');

// --- CONFIGURACIÓN ---
const NUM_TUTORS = 20;
const NUM_STUDENTS = 50;
const NUM_DOCUMENTS_PER_SUBJECT = 2;
const NUM_SESSIONS = 80;
const NUM_REVIEWS = 50;
const COLLECTIONS_TO_CLEAR = ['users', 'subjects', 'documents', 'tutoringSessions', 'reviews'];
// ---------------------

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const SUBJECTS = [
  'Cálculo Diferencial', 'Cálculo Integral', 'Álgebra Lineal', 'Ecuaciones Diferenciales', 'Física Mecánica',
  'Física de Campos', 'Química General', 'Química Orgánica', 'Biología Celular', 'Programación de Computadores',
  'Estructuras de Datos', 'Bases de Datos', 'Algoritmos', 'Sistemas Operativos', 'Redes de Computadores',
  'Inteligencia Artificial', 'Desarrollo de Software', 'Estadística y Probabilidad', 'Economía', 'Microeconomía',
  'Macroeconomía', 'Contabilidad Financiera', 'Administración de Empresas', 'Marketing', 'Finanzas',
  'Derecho Constitucional', 'Derecho Penal', 'Derecho Civil', 'Psicología General', 'Psicología del Desarrollo',
  'Historia de Colombia', 'Geografía Humana', 'Antropología', 'Sociología', 'Filosofía', 'Literatura Universal',
  'Inglés B1', 'Inglés B2', 'Francés A2', 'Alemán A1', 'Mandarín Básico', 'Termodinámica', 'Mecánica de Fluidos',
  'Circuitos Eléctricos', 'Electrónica Analógica', 'Diseño de Máquinas', 'Resistencia de Materiales',
  'Ingeniería de Software', 'Investigación de Operaciones', 'Cálculo Vectorial'
];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function clearCollections() {
  console.log('🗑️  Limpiando colecciones antiguas...');
  for (const collectionName of COLLECTIONS_TO_CLEAR) {
    const collectionRef = db.collection(collectionName);
    const snapshot = await collectionRef.limit(500).get();
    if (snapshot.empty) {
      console.log(`   - Colección '${collectionName}' ya está vacía.`);
      continue;
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`   - Colección '${collectionName}' limpiada.`);
  }
  console.log('✅ Limpieza completada.\n');
}

async function seedSubjects() {
  console.log('📚 Sembrando materias...');
  const batch = db.batch();
  SUBJECTS.forEach(name => {
    const subjectRef = db.collection('subjects').doc();
    batch.set(subjectRef, {
      name,
      description: `Curso de ${name}.`,
      faculty: faker.commerce.department(),
    });
  });
  await batch.commit();
  console.log(`✅ ${SUBJECTS.length} materias creadas.\n`);
  const subjectsSnapshot = await db.collection('subjects').get();
  return subjectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function seedUsers(subjects) {
  console.log('👥 Sembrando usuarios (tutores y estudiantes)...');
  const userPromises = [];
  const users = [];

  // Crear Tutores
  for (let i = 0; i < NUM_TUTORS; i++) {
    const email = `tutor${i}@tutorapp.com`;
    const password = 'password123';
    const fullName = faker.person.fullName();

    const userRecord = await admin.auth().createUser({ email, password, displayName: fullName });
    const userRef = db.collection('users').doc(userRecord.uid);

    const tutorSubjects = faker.helpers.arrayElements(subjects, { min: 2, max: 5 }).map(s => s.id);

    userPromises.push(userRef.set({
      uid: userRecord.uid,
      email,
      fullName,
      role: 'tutor',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      profile: {
        bio: faker.lorem.paragraph(),
        hourlyRate: faker.number.int({ min: 25, max: 80 }) * 1000,
        subjects: tutorSubjects,
        university: 'Universidad de Los Andes',
        profilePictureUrl: faker.image.avatar(),
        averageRating: faker.number.float({ min: 3.5, max: 5, precision: 0.1 }),
        totalReviews: faker.number.int({ min: 5, max: 30 }),
      }
    }));
    users.push({ id: userRecord.uid, role: 'tutor' });
  }

  // Crear Estudiantes
  for (let i = 0; i < NUM_STUDENTS; i++) {
    const email = `student${i}@tutorapp.com`;
    const password = 'password123';
    const fullName = faker.person.fullName();

    const userRecord = await admin.auth().createUser({ email, password, displayName: fullName });
    const userRef = db.collection('users').doc(userRecord.uid);

    userPromises.push(userRef.set({
      uid: userRecord.uid,
      email,
      fullName,
      role: 'student',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      profile: {
        university: 'Pontificia Universidad Javeriana',
        major: faker.person.jobArea(),
        profilePictureUrl: faker.image.avatar(),
      }
    }));
    users.push({ id: userRecord.uid, role: 'student' });
  }

  await Promise.all(userPromises);
  console.log(`✅ ${NUM_TUTORS} tutores y ${NUM_STUDENTS} estudiantes creados.\n`);
  return users;
}

async function seedDocuments(users, subjects) {
  console.log('📄 Sembrando documentos...');
  const batch = db.batch();
  let count = 0;

  subjects.forEach(subject => {
    for (let i = 0; i < NUM_DOCUMENTS_PER_SUBJECT; i++) {
      const uploader = getRandomElement(users);
      const docRef = db.collection('documents').doc();
      const category = getRandomElement(['notes', 'exams', 'projects']);

      batch.set(docRef, {
        title: `${faker.word.verb()} de ${subject.name} - ${faker.word.noun()}`,
        description: faker.lorem.sentence(),
        category,
        subjectId: subject.id,
        uploaderId: uploader.id,
        authorName: uploader.fullName || 'Usuario Anónimo',
        fileURL: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // URL de ejemplo
        downloads: faker.number.int({ min: 0, max: 500 }),
        upvotes: faker.number.int({ min: 0, max: 150 }),
        createdAt: admin.firestore.Timestamp.fromDate(faker.date.past({ years: 1 })),
      });
      count++;
    }
  });

  await batch.commit();
  console.log(`✅ ${count} documentos creados.\n`);
}

async function seedTutoringSessions(users, subjects) {
  console.log('🗓️  Sembrando sesiones de tutoría...');
  const batch = db.batch();
  const students = users.filter(u => u.role === 'student');
  const tutors = users.filter(u => u.role === 'tutor');

  for (let i = 0; i < NUM_SESSIONS; i++) {
    const student = getRandomElement(students);
    const tutor = getRandomElement(tutors);
    const subject = getRandomElement(subjects);
    const status = getRandomElement(['completed', 'pending', 'confirmed', 'cancelled']);
    const sessionRef = db.collection('tutoringSessions').doc();

    batch.set(sessionRef, {
      studentId: student.id,
      tutorId: tutor.id,
      subjectId: subject.id,
      status,
      startTime: admin.firestore.Timestamp.fromDate(faker.date.past({ years: 1 })),
      duration: getRandomElement([30, 60, 90]),
      totalPrice: faker.number.int({ min: 15, max: 100 }) * 1000,
      createdAt: admin.firestore.Timestamp.fromDate(faker.date.recent({ days: 30 })),
    });
  }

  await batch.commit();
  console.log(`✅ ${NUM_SESSIONS} sesiones creadas.\n`);
}

async function seedReviews(users) {
  console.log('⭐ Sembrando reseñas...');
  const batch = db.batch();
  const students = users.filter(u => u.role === 'student');
  const tutors = users.filter(u => u.role === 'tutor');

  for (let i = 0; i < NUM_REVIEWS; i++) {
    const student = getRandomElement(students);
    const tutor = getRandomElement(tutors);
    const reviewRef = db.collection('reviews').doc();

    batch.set(reviewRef, {
      studentId: student.id,
      tutorId: tutor.id,
      rating: faker.number.int({ min: 3, max: 5 }),
      comment: faker.lorem.paragraph(),
      createdAt: admin.firestore.Timestamp.fromDate(faker.date.past({ years: 1 })),
    });
  }

  await batch.commit();
  console.log(`✅ ${NUM_REVIEWS} reseñas creadas.\n`);
}

async function main() {
  console.log('🚀 Iniciando siembra de datos para TutorApp...');
  try {
    await clearCollections();
    const subjects = await seedSubjects();
    const users = await seedUsers(subjects);
    await seedDocuments(users, subjects);
    await seedTutoringSessions(users, subjects);
    await seedReviews(users);

    console.log('🎉 ¡Siembra de datos completada con éxito!');
    console.log('✨ Tu base de datos de Firebase ahora está llena de datos realistas.');
    console.log('👉 Ejecuta "npm run dev" y explora la aplicación.');
  } catch (error) {
    console.error('❌ Error durante la siembra de datos:', error);
  }
}

main();