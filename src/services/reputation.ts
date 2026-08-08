import { db } from '../firebase';
import { doc, updateDoc, increment, getDoc, setDoc, arrayUnion, writeBatch } from 'firebase/firestore';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    minPoints: number;
}

export const BADGES: Badge[] = [
    {
        id: 'novice',
        name: 'Novato',
        description: 'Comienza tu viaje de aprendizaje',
        icon: '🌱',
        color: 'bg-green-100 text-green-800',
        minPoints: 0
    },
    {
        id: 'contributor',
        name: 'Colaborador',
        description: 'Participa activamente en la comunidad',
        icon: '🤝',
        color: 'bg-blue-100 text-blue-800',
        minPoints: 100
    },
    {
        id: 'expert',
        name: 'Experto',
        description: 'Reconocido por su conocimiento',
        icon: '⭐',
        color: 'bg-purple-100 text-purple-800',
        minPoints: 500
    },
    {
        id: 'savior',
        name: 'Salvavidas',
        description: 'Ayudaste en semana de parciales',
        icon: '🚑',
        color: 'bg-red-100 text-red-800',
        minPoints: 200
    },
    {
        id: 'erudite',
        name: 'Erudito',
        description: 'Promedio superior a 4.5',
        icon: '🎓',
        color: 'bg-indigo-100 text-indigo-800',
        minPoints: 800
    },
    {
        id: 'community',
        name: 'Comunitario',
        description: 'Gran actividad en el foro',
        icon: '🏘️',
        color: 'bg-orange-100 text-orange-800',
        minPoints: 300
    },
    {
        id: 'night_owl',
        name: 'Búho Nocturno',
        description: 'Tutorías en horario nocturno',
        icon: '🦉',
        color: 'bg-slate-800 text-slate-100',
        minPoints: 150
    },
    {
        id: 'early_bird',
        name: 'Madrugador',
        description: 'Activo desde primera hora',
        icon: '🌅',
        color: 'bg-yellow-50 text-yellow-600',
        minPoints: 150
    },
    {
        id: 'master',
        name: 'Maestro',
        description: 'Líder de la comunidad',
        icon: '👑',
        color: 'bg-yellow-100 text-yellow-800',
        minPoints: 1000
    }
];

export const REPUTATION_ACTIONS = {
    CREATE_QUESTION: 5,
    CREATE_ANSWER: 10,
    RECEIVE_UPVOTE: 2,
    ANSWER_ACCEPTED: 20,
    UPLOAD_DOCUMENT: 15,
    DOCUMENT_DOWNLOADED: 1
};

export const reputationService = {
    async awardPoints(userId: string, points: number) {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                reputationPoints: increment(points),
                redeemablePoints: increment(points)
            });
            await this.checkAndAwardBadges(userId);
        } catch (error) {
            console.error('Error awarding points:', error);
        }
    },

    async checkAndAwardBadges(userId: string) {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) return;

            const userData = userSnap.data();
            const currentPoints = userData.reputationPoints || 0;
            const currentBadges = userData.badges || [];

            const newBadges = BADGES.filter(badge =>
                badge.minPoints <= currentPoints && !currentBadges.includes(badge.id)
            );

            if (newBadges.length > 0) {
                await updateDoc(userRef, {
                    badges: arrayUnion(...newBadges.map(b => b.id))
                });
            }
        } catch (error) {
            console.error('Error checking badges:', error);
        }
    },

    getBadgeInfo(badgeId: string): Badge | undefined {
        return BADGES.find(b => b.id === badgeId);
    },

    async transferPoints(fromUserId: string, toUserId: string, points: number) {
        try {
            const batch = writeBatch(db);
            const fromRef = doc(db, 'users', fromUserId);
            const toRef = doc(db, 'users', toUserId);

            // Deduct from sender's available points (redeemablePoints), not their experience
            batch.update(fromRef, {
                redeemablePoints: increment(-points)
            });

            // Add to receiver's experience and available points
            batch.update(toRef, {
                reputationPoints: increment(points),
                redeemablePoints: increment(points)
            });

            await batch.commit();

            // Check badges for receiver
            await this.checkAndAwardBadges(toUserId);
            return true;
        } catch (error) {
            console.error('Error transferring points:', error);
            throw error;
        }
    },

    getLevel(points: number): number {
        return Math.floor(Math.sqrt(points / 10)) + 1;
    }
};
