import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// 3. Sistema de Economía de la Reputación (Gamification)
// Trigger: Cuando se marca una respuesta como útil o se completa una tutoría
export const onReputationTrigger = functions.https.onCall(async (data, context) => {
    // 1. Validación de seguridad
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }

    const { targetUserId, actionType } = data;
    const sourceUserId = context.auth.uid;

    // Evitar auto-votos (Fraude)
    if (targetUserId === sourceUserId) {
        throw new functions.https.HttpsError('invalid-argument', 'Cannot award points to yourself');
    }

    // Definir puntos por acción
    const POINTS_MAP: { [key: string]: number } = {
        'MARK_USEFUL': 5,
        'TUTORING_COMPLETED': 15,
        'QUESTION_ANSWERED': 10,
        'PROMOTE_TO_FAQ': 20
    };

    const points = POINTS_MAP[actionType] || 0;
    if (points === 0) return { success: false, message: 'Invalid action' };

    try {
        const userRef = db.collection('users').doc(targetUserId);

        // Transacción atómica para asegurar consistencia
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) throw new Error('User does not exist');

            const userData = userDoc.data();
            const newPoints = (userData?.reputationPoints || 0) + points;

            const updates: any = {
                reputationPoints: newPoints
            };

            // Check Badges (Coherente con lista de badges)
            const currentBadges = userData?.badges || [];
            const newBadges = [...currentBadges];

            if (newPoints >= 100 && !currentBadges.includes('TUTOR_JUNIOR')) {
                newBadges.push('TUTOR_JUNIOR');
            }
            if (newPoints >= 500 && !currentBadges.includes('TUTOR_SENIOR')) {
                newBadges.push('TUTOR_SENIOR');
            }
            if (newPoints >= 1000 && !currentBadges.includes('MENTOR_MASTER')) {
                newBadges.push('MENTOR_MASTER');
            }

            if (newBadges.length > currentBadges.length) {
                updates.badges = newBadges;
            }

            transaction.update(userRef, updates);
        });

        return { success: true, pointsAwarded: points };
    } catch (error) {
        console.error('Reputation Error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to award points');
    }
});
