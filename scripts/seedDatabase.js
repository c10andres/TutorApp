const admin = require('firebase-admin');
const { faker } = require('@faker-js/faker/locale/es'); // Datos en español
const fs = require('fs');

// ==========================================
// CONFIGURACIÓN
// ==========================================
// ⚠️ IMPORTANTE: Descarga tu Service Account Key desde:
// Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key
// Guarda el archivo como 'serviceAccountKey.json' en la misma carpeta que este script
const serviceAccountPath = './serviceAccountKey.json';

if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ ERROR: No se encontró el archivo serviceAccountKey.json');
    console.log('👉 Por favor descarga la llave desde Firebase Console y guárdala en la raíz del proyecto.');
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ==========================================
// CONSTANTES Y UTILIDADES
// ==========================================
const ROLES = ['student', 'tutor'];
const RANK_TIERS = [
    { name: 'Novato', min: 0, max: 100 },
    { name: 'Aprendiz Activo', min: 101, max: 299 },
    { name: 'Monitor', min: 300, max: 1000 },
    { name: 'Monitor Experto', min: 1001, max: 4999 },
    { name: 'Maestro', min: 5000, max: 10000 }
];

const BADGES_LIST = [
    'novice', 'contributor', 'expert', 'master',
    'savior', 'erudite', 'community', 'night_owl', 'early_bird'
];

const SUBJECTS = [
    'Cálculo Diferencial', 'Física Mecánica', 'Programación Básica',
    'Álgebra Lineal', 'Química General', 'Inglés Técnico',
    'Ecuaciones Diferenciales', 'Estructuras de Datos', 'Circuitos DC'
];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomItems = (arr, count) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

// ==========================================
// 1. GENERAR USUARIOS
// ==========================================
async function seedUsers(count = 20) {
    console.log(`🌱 Sembrando ${count} usuarios...`);
    const users = [];

    for (let i = 0; i < count; i++) {
        const isTutor = Math.random() > 0.4; // 60% tutores para tener oferta
        const reputationPoints = faker.number.int({ min: 0, max: 6000 });

        // Determinar Rango y Badges basado en puntos
        const rank = RANK_TIERS.find(t => reputationPoints >= t.min && reputationPoints <= t.max)?.name || 'Maestro';
        const numBadges = Math.floor(reputationPoints / 500); // 1 badge cada 500 puntos aprox
        const userBadges = getRandomItems(BADGES_LIST, numBadges);

        const user = {
            uid: faker.string.uuid(),
            email: faker.internet.email(),
            displayName: faker.person.fullName(),
            photoURL: faker.image.avatar(),
            role: isTutor ? 'tutor' : 'student',
            currentMode: isTutor ? 'tutor' : 'student',

            // Gamificación
            reputationPoints,
            rank,
            badges: userBadges,
            verified: reputationPoints > 500, // Verificado si tiene exp

            // Perfil Tutor
            subjects: isTutor ? getRandomItems(SUBJECTS, 3) : [],
            hourlyPoints: isTutor ? faker.number.int({ min: 5, max: 10 }) : 0, // Ajustado a estandar 5-10 puntos
            aboutMe: faker.person.bio(),

            createdAt: admin.firestore.Timestamp.fromDate(faker.date.past()),
        };

        // Crear en Auth (opcional, para login real) y Firestore
        // Nota: Para este script solo populamos Firestore para visualización
        const userRef = db.collection('users').doc(user.uid);
        users.push({ ref: userRef, data: user });
    }

    const batch = db.batch();
    users.forEach(u => batch.set(u.ref, u.data));
    await batch.commit();

    console.log('✅ Usuarios creados.');
    return users.map(u => u.data);
}

// ==========================================
// 2. GENERAR PREGUNTAS (FORO DE INTELIGENCIA COLECTIVA)
// ==========================================
async function seedQuestions(users, count = 15) {
    console.log(`🌱 Sembrando ${count} preguntas de foro...`);
    const questions = [];

    for (let i = 0; i < count; i++) {
        const author = getRandomItem(users);
        const resolved = Math.random() > 0.3;
        const isVerified = resolved && Math.random() > 0.5; // Solución verificada (Knowledge Base)

        const question = {
            title: faker.lorem.sentence({ min: 5, max: 10 }) + '?',
            body: faker.lorem.paragraphs(2),
            authorId: author.uid,
            authorName: author.displayName,
            tags: getRandomItems(['Matemáticas', 'Programación', 'Física', 'Ingeniería'], 2),

            // Métricas de IC
            createdAt: admin.firestore.Timestamp.fromDate(faker.date.recent({ days: 30 })),
            voteCount: faker.number.int({ min: 0, max: 50 }),
            viewCount: faker.number.int({ min: 10, max: 500 }),
            answerCount: resolved ? faker.number.int({ min: 1, max: 5 }) : 0,

            isResolved: resolved,
            isVerified: isVerified // Si es true, se considera "Promoted to FAQ"
        };

        const qRef = db.collection('forum_posts').doc();
        questions.push({ ref: qRef, data: question });

        // Si está resuelta, crear respuestas
        if (resolved) {
            // Crear respuesta aceptada (posiblemente de un experto)
            const expert = users.find(u => u.reputationPoints > 1000) || getRandomItem(users);
            await qRef.collection('answers').add({
                body: faker.lorem.paragraph(),
                authorId: expert.uid,
                authorName: expert.displayName,
                isAccepted: true,
                voteCount: faker.number.int({ min: 5, max: 20 }),
                createdAt: admin.firestore.Timestamp.fromDate(faker.date.recent({ days: 10 }))
            });
        }
    }

    const batch = db.batch();
    questions.forEach(q => batch.set(q.ref, q.data));
    await batch.commit();

    console.log('✅ Preguntas de foro creadas.');
}

// ==========================================
// 3. GENERAR TUTORÍAS (HISTORIAL Y REPUTACIÓN)
// ==========================================
async function seedTutorRequests(users, count = 10) {
    console.log(`🌱 Sembrando ${count} historias de tutoría...`);
    const requests = [];

    const tutors = users.filter(u => u.role === 'tutor');
    const students = users.filter(u => u.role === 'student');

    if (tutors.length === 0 || students.length === 0) {
        console.log('⚠️ No hay suficientes tutores o estudiantes para emparejar.');
        return;
    }

    for (let i = 0; i < count; i++) {
        // Seleccionar tutor con alta reputación para simular mejores ratings (Smart Matching proof)
        const tutor = Math.random() > 0.7
            ? tutors.sort((a, b) => b.reputationPoints - a.reputationPoints)[0] // Top tutor
            : getRandomItem(tutors); // Random tutor

        const student = getRandomItem(students);

        // Si el tutor es crack, el rating es alto (4.5 - 5.0)
        const isTopTutor = tutor.reputationPoints > 1000;
        const rating = isTopTutor
            ? faker.number.float({ min: 4.5, max: 5, multipleOf: 0.1 })
            : faker.number.float({ min: 3.0, max: 5, multipleOf: 0.1 });

        const request = {
            studentId: student.uid,
            tutorId: tutor.uid,
            tutorName: tutor.displayName,
            studentName: student.displayName,
            subject: getRandomItem(tutor.subjects || SUBJECTS),
            status: 'completed',

            // Detalles
            scheduledDate: admin.firestore.Timestamp.fromDate(faker.date.recent({ days: 60 })),
            durationHours: faker.number.int({ min: 1, max: 3 }),
            costPoints: tutor.hourlyPoints * faker.number.int({ min: 1, max: 3 }),

            // Feedback
            rating: rating,
            review: faker.lorem.sentence(),

            createdAt: admin.firestore.Timestamp.fromDate(faker.date.past())
        };

        requests.push({ ref: db.collection('tutor_requests').doc(), data: request });
    }

    const batch = db.batch();
    requests.forEach(r => batch.set(r.ref, r.data));
    await batch.commit();

    console.log('✅ Historial de tutorías creado.');
}

// ==========================================
// EJECUCIÓN PRINCIPAL
// ==========================================
async function main() {
    try {
        console.log('🚀 Iniciando script de población de base de datos...');

        const users = await seedUsers(20);
        await seedQuestions(users, 15);
        await seedTutorRequests(users, 15);

        console.log('✨ Base de datos poblada exitosamente.');
        console.log('📋 Resumen:');
        console.log('- 20 Usuarios (mezcla de rangos)');
        console.log('- 15 Debates en Foro (Inteligencia Colectiva)');
        console.log('- 15 Tutorías finalizadas (Validación Smart Matching)');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    }
}

main();
