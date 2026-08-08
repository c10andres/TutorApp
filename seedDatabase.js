const admin = require('firebase-admin');
const { fakerES: faker } = require('@faker-js/faker');
const path = require('path');
const fs = require('fs');

// --- CONFIGURATION ---
const SERVICE_ACCOUNT_PATH = './serviceAccountKey.json';
const USERS_TO_GENERATE = 20;
const QUESTIONS_TO_GENERATE = 15;
const REQUESTS_TO_GENERATE = 10;

// --- INIT FIREBASE ---
if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error(`❌ ERROR: Service Account Key not found at ${SERVICE_ACCOUNT_PATH}`);
    console.error("👉 Please download your service account key from Firebase Console > Project Settings > Service Accounts");
    console.error("👉 Rename it to 'serviceAccountKey.json' and place it in the project root.");
    process.exit(1);
}

const serviceAccount = require(SERVICE_ACCOUNT_PATH);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: "YOUR_DATABASE_URL" // Optional for Firestore
});

const db = admin.firestore();

// --- HELPERS ---
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- DATA GENERATION ---

async function seedDatabase() {
    console.log('🌱 Starting Collective Intelligence Seeder...');

    try {
        // 1. GENERATE USERS (Nodes in the Collective Intelligence Network)
        console.log('generating Users...');
        const userIds = [];
        const tutors = [];

        for (let i = 0; i < USERS_TO_GENERATE; i++) {
            // Determine Role & Reputation Tier
            const isTutor = i < 10; // First 10 are tutors
            const role = isTutor ? 'tutor' : 'student';

            // Reputation Probability: 40% Novice, 40% Intermediate, 20% Expert
            const rand = Math.random();
            let reputationPoints = 0;
            let badges = [];
            let rank = 'Novato';
            let verified = false;

            if (rand > 0.8) { // Expert (20%)
                reputationPoints = getRandomInt(501, 1500);
                badges = ['Top Contributor', 'Fast Responder', 'Knowledge Expert'];
                rank = 'Experto';
                verified = true;
            } else if (rand > 0.4) { // Intermediate (40%)
                reputationPoints = getRandomInt(100, 500);
                badges = ['Active Member'];
                rank = 'Monitor Junior';
            } else { // Novice (40%)
                reputationPoints = getRandomInt(0, 99);
                badges = [];
                rank = 'Novato';
            }

            // Calculate Hourly Points based on Rank Rule
            // Novato(0)=10, MonitorJr(1)=15, MonitorSr(2)=20, Maestro(3)=25, Experto(4)=30...
            // Simplified mapping for seeding
            let hourlyPoints = 10;
            if (rank === 'Monitor Junior') hourlyPoints = 15;
            if (rank === 'Experto') hourlyPoints = 30;

            const userData = {
                uid: faker.string.uuid(),
                email: faker.internet.email(),
                name: faker.person.fullName(),
                role: role,
                avatar: faker.image.avatar(),
                reputationPoints: reputationPoints,
                badges: badges,
                rank: rank,
                verified: verified,
                hourlyPoints: hourlyPoints,
                subjects: isTutor ? faker.helpers.arrayElements(['Matemáticas', 'Física', 'Programación', 'Inglés', 'Química'], getRandomInt(1, 3)) : [],
                createdAt: new Date()
            };

            // Create in Firestore (both 'users' collection and Auth if possible, but here just Firestore)
            await db.collection('users').doc(userData.uid).set(userData);

            userIds.push(userData.uid);
            if (isTutor) tutors.push(userData);

            process.stdout.write('.');
        }
        console.log(`\n✅ Created ${USERS_TO_GENERATE} Users.`);

        // 2. GENERATE QUESTIONS (Knowledge Base)
        console.log('Generating Q&A (Collective Knowledge)...');

        for (let i = 0; i < QUESTIONS_TO_GENERATE; i++) {
            const authorId = getRandomItem(userIds);

            const questionData = {
                title: faker.lorem.sentence() + '?',
                body: faker.lorem.paragraph(),
                tags: faker.helpers.arrayElements(['Matemáticas', 'Programación', 'Ciencia', 'Tips de Estudio'], getRandomInt(1, 2)),
                authorId: authorId,
                voteCount: getRandomInt(0, 50),
                status: getRandomItem(['open', 'resolved', 'verified_knowledge_base']),
                createdAt: faker.date.recent({ days: 30 })
            };

            const qRef = await db.collection('questions').add(questionData);

            // Generate Answers
            const answersCount = getRandomInt(0, 5);
            for (let j = 0; j < answersCount; j++) {
                // Pick a tutor to answer
                const answerer = getRandomItem(tutors);
                let votes = getRandomInt(0, 10);
                let isVerifiedAnswer = false;

                // EXPERT LOGIC: increased probability of high quality
                if (answerer.reputationPoints > 500) {
                    votes = getRandomInt(20, 100);
                    isVerifiedAnswer = true;
                    // Expert answers often Resolve the question
                    if (j === 0) {
                        await qRef.update({ status: 'verified_knowledge_base' });
                    }
                }

                await qRef.collection('answers').add({
                    content: faker.lorem.paragraph(),
                    authorId: answerer.uid,
                    authorName: answerer.name,
                    authorRank: answerer.rank,
                    votes: votes,
                    isVerified: isVerifiedAnswer,
                    createdAt: faker.date.recent({ days: 10 })
                });
            }
            process.stdout.write('.');
        }
        console.log(`\n✅ Created ${QUESTIONS_TO_GENERATE} Questions with Answers.`);

        // 3. GENERATE TUTOR REQUESTS (Service History)
        console.log('Generating Tutor Requests (Reputation Validation)...');

        for (let i = 0; i < REQUESTS_TO_GENERATE; i++) {
            const tutor = getRandomItem(tutors);
            const studentId = getRandomItem(userIds.filter(id => id !== tutor.uid));

            // REPUTATION LOGIC: High Rep -> High Rating
            let rating = getRandomInt(3, 5);
            if (tutor.reputationPoints > 500) {
                rating = faker.number.float({ min: 4.5, max: 5.0, precision: 0.1 }); // High consistency
            } else if (tutor.reputationPoints < 100) {
                rating = faker.number.float({ min: 2.0, max: 4.0, precision: 0.1 }); // Volatile quality
            }

            const requestData = {
                studentId: studentId,
                tutorId: tutor.uid,
                tutorName: tutor.name,
                subject: getRandomItem(tutor.subjects),
                status: 'completed',
                rating: rating,
                comment: faker.lorem.sentence(),
                hourlyPoints: tutor.hourlyPoints,
                totalPoints: tutor.hourlyPoints * getRandomInt(1, 3), // 1-3 hours
                createdAt: faker.date.recent({ days: 60 })
            };

            await db.collection('tutor_requests').add(requestData);
            process.stdout.write('.');
        }
        console.log(`\n✅ Created ${REQUESTS_TO_GENERATE} Tutor Requests.`);

        console.log('\n✨ Database Seeded Successfully!');
        console.log('🚀 Ready for Thesis Defense: "Collective Intelligence in Educational Platforms"');

    } catch (error) {
        console.error('\n❌ Seeding Failed:', error);
    } finally {
        // admin.app().delete(); // Close execution if needed, or let process exit
    }
}

seedDatabase();
