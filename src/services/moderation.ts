import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export interface Report {
    contentId: string;
    contentType: 'question' | 'answer' | 'document';
    reason: string;
    reporterId: string;
    createdAt: Date;
    status: 'pending' | 'reviewed' | 'resolved';
}

export const REPORT_REASONS = [
    'Spam o publicidad',
    'Contenido ofensivo o inapropiado',
    'Información falsa o engañosa',
    'No relevante para la comunidad',
    'Otro'
];

export const moderationService = {
    async reportContent(
        contentId: string,
        contentType: 'question' | 'answer' | 'document',
        reason: string,
        reporterId: string
    ): Promise<void> {
        try {
            await addDoc(collection(db, 'reports'), {
                contentId,
                contentType,
                reason,
                reporterId,
                createdAt: Timestamp.now(),
                status: 'pending'
            });
            console.log(`✅ Contenido reportado: ${contentType} ${contentId}`);
        } catch (error) {
            console.error('Error reporting content:', error);
            throw error;
        }
    }
};
