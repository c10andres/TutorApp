// Servicio para gestión de reseñas con Firebase - Sistema completo de calificaciones
import { ref, push, get, query, orderByChild, equalTo, set, update } from 'firebase/database';
import { database } from '../firebase';
import { Review } from '../types';
import { FirebaseFallbackManager } from '../utils/firebase-fallback';

class ReviewsService {
  // Crear una nueva reseña con validaciones avanzadas
  async createReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    try {
      console.log('Creating review with data:', reviewData);
      
      // Validar que no exista una reseña previa para esta sesión
      const existingReview = await this.getReviewBySession(reviewData.tutorId, reviewData.studentId, reviewData.requestId);
      if (existingReview) {
        throw new Error('Ya existe una reseña para esta sesión');
      }

      // Validar que la calificación esté en el rango correcto
      if (reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error('La calificación debe estar entre 1 y 5 estrellas');
      }

      // Validar que el comentario no esté vacío
      if (!reviewData.comment || reviewData.comment.trim().length < 10) {
        throw new Error('El comentario debe tener al menos 10 caracteres');
      }
      
      const reviewsRef = ref(database, 'reviews');
      const reviewRef = push(reviewsRef);
      
      const newReview: Review = {
        id: reviewRef.key!,
        ...reviewData,
        createdAt: new Date(),
      };

      const reviewForStorage = {
        ...newReview,
        createdAt: newReview.createdAt.toISOString(),
      };
      
      console.log('Storing review:', reviewForStorage);

      // Usar set() en lugar de update() para escribir el objeto completo
      await set(reviewRef, reviewForStorage);
      
      console.log('Review created successfully, updating tutor rating...');

      // Actualizar rating promedio del tutor
      await this.updateTutorRating(reviewData.tutorId);
      
      // Actualizar estadísticas del estudiante
      await this.updateStudentStats(reviewData.studentId);
      
      console.log('Tutor rating updated successfully');

      // Disparar evento para actualizar estadísticas
      window.dispatchEvent(new CustomEvent('review-created', { 
        detail: { reviewId: newReview.id, tutorId: reviewData.tutorId } 
      }));
      
      console.log('📊 Review created event dispatched');

      return newReview;
    } catch (error) {
      console.error('Error creating review:', error);
      throw new Error('Error al crear la reseña: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  // Obtener reseña por sesión específica
  async getReviewBySession(tutorId: string, studentId: string, requestId: string): Promise<Review | null> {
    try {
      const reviewsRef = ref(database, 'reviews');
      const sessionQuery = query(
        reviewsRef,
        orderByChild('requestId'),
        equalTo(requestId)
      );
      
      const snapshot = await get(sessionQuery);
      
      if (!snapshot.exists()) {
        return null;
      }

      const reviews = snapshot.val();
      const review = Object.values(reviews).find((r: any) => 
        r.tutorId === tutorId && r.studentId === studentId
      ) as Review;

      return review || null;
    } catch (error) {
      console.error('Error getting review by session:', error);
      return null;
    }
  }

  // Actualizar estadísticas del estudiante
  private async updateStudentStats(studentId: string): Promise<void> {
    try {
      console.log('Updating student stats for:', studentId);
      
      const studentRef = ref(database, `users/${studentId}`);
      const snapshot = await get(studentRef);
      
      if (snapshot.exists()) {
        const studentData = snapshot.val();
        const currentReviews = studentData.totalReviews || 0;
        
        await update(studentRef, {
          totalReviews: currentReviews + 1,
          lastReviewDate: new Date().toISOString()
        });
        
        console.log('Student stats updated successfully');
      }
    } catch (error) {
      console.error('Error updating student stats:', error);
    }
  }

  // Obtener reseñas de un tutor
  async getTutorReviews(tutorId: string, limit: number = 20): Promise<Review[]> {
    return FirebaseFallbackManager.executeWithFallback(
      async () => {
        console.log('Getting tutor reviews for:', tutorId);
        
        const reviewsRef = ref(database, 'reviews');
        const tutorQuery = query(reviewsRef, orderByChild('tutorId'), equalTo(tutorId));
        
        console.log('Executing query for tutor reviews...');
        const snapshot = await get(tutorQuery);
        
        if (!snapshot.exists()) {
          console.log('No reviews found for tutor:', tutorId);
          return [];
        }

        const reviews = snapshot.val();
        console.log('Raw reviews data:', reviews);
        
        const reviewsList = Object.keys(reviews).map(key => {
          const reviewData = reviews[key];
          return {
            ...reviewData,
            id: key,
            createdAt: new Date(reviewData.createdAt),
          };
        });
        
        console.log('Processed reviews list:', reviewsList);

        // Ordenar por fecha descendente y limitar
        const sortedReviews = reviewsList
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, limit);
          
        console.log('Final sorted reviews:', sortedReviews);
        return sortedReviews;
      },
      () => {
        console.log('Using fallback: returning empty reviews array for tutor:', tutorId);
        return [];
      },
      { path: '/reviews', field: 'tutorId' }
    );
  }

  // Obtener reseñas de un estudiante
  async getStudentReviews(studentId: string): Promise<Review[]> {
    try {
      const reviewsRef = ref(database, 'reviews');
      const studentQuery = query(reviewsRef, orderByChild('studentId'), equalTo(studentId));
      
      const snapshot = await get(studentQuery);
      
      if (!snapshot.exists()) {
        return [];
      }

      const reviews = snapshot.val();
      const reviewsList = Object.keys(reviews).map(key => ({
        ...reviews[key],
        id: key,
        createdAt: new Date(reviews[key].createdAt),
      }));

      // Ordenar por fecha descendente
      return reviewsList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting student reviews:', error);
      return [];
    }
  }

  // Verificar si un estudiante ya reseñó una solicitud específica
  async hasStudentReviewed(requestId: string, studentId: string): Promise<boolean> {
    try {
      const reviewsRef = ref(database, 'reviews');
      const requestQuery = query(reviewsRef, orderByChild('requestId'), equalTo(requestId));
      
      const snapshot = await get(requestQuery);
      
      if (!snapshot.exists()) {
        return false;
      }

      const reviews = snapshot.val();
      return Object.values(reviews).some((review: any) => 
        review.studentId === studentId && review.requestId === requestId
      );
    } catch (error) {
      console.error('Error checking if student reviewed:', error);
      return false;
    }
  }

  // Actualizar rating promedio del tutor
  private async updateTutorRating(tutorId: string): Promise<void> {
    try {
      console.log('Updating tutor rating for:', tutorId);
      
      const reviews = await this.getTutorReviews(tutorId);
      console.log('Found reviews for tutor:', reviews.length);
      
      if (reviews.length === 0) {
        console.log('No reviews found, skipping rating update');
        return;
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      const roundedRating = Math.round(averageRating * 10) / 10; // Redondear a 1 decimal
      
      console.log('Calculated rating:', roundedRating, 'from', reviews.length, 'reviews');

      // Actualizar el usuario en la base de datos
      const userRef = ref(database, `users/${tutorId}`);
      const updateData = {
        rating: roundedRating,
        totalReviews: reviews.length,
        updatedAt: new Date().toISOString(),
      };
      
      console.log('Updating user with data:', updateData);
      await update(userRef, updateData);
      console.log('User rating updated successfully');
    } catch (error) {
      console.error('Error updating tutor rating:', error);
      // No lanzar el error para que no falle la creación de la reseña
    }
  }

  // Obtener estadísticas de reseñas de un tutor
  async getTutorReviewStats(tutorId: string): Promise<{
    totalReviews: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
    recentReviews: Review[];
  }> {
    try {
      const reviews = await this.getTutorReviews(tutorId, 100); // Obtener más para estadísticas
      
      if (reviews.length === 0) {
        return {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          recentReviews: [],
        };
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      // Distribución de calificaciones
      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach(review => {
        ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
      });

      return {
        totalReviews: reviews.length,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
        recentReviews: reviews.slice(0, 5), // Últimas 5 reseñas
      };
    } catch (error) {
      console.error('Error getting tutor review stats:', error);
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        recentReviews: [],
      };
    }
  }

  // Obtener reseña por ID
  async getReviewById(reviewId: string): Promise<Review | null> {
    try {
      const reviewRef = ref(database, `reviews/${reviewId}`);
      const snapshot = await get(reviewRef);
      
      if (!snapshot.exists()) {
        return null;
      }

      const reviewData = snapshot.val();
      return {
        ...reviewData,
        id: reviewId,
        createdAt: new Date(reviewData.createdAt),
      };
    } catch (error) {
      console.error('Error getting review by ID:', error);
      return null;
    }
  }

  // Calcular nivel de reputación
  private calculateReputationLevel(averageRating: number, totalReviews: number): string {
    if (averageRating >= 4.8 && totalReviews >= 50) return 'legendary';
    if (averageRating >= 4.5 && totalReviews >= 25) return 'expert';
    if (averageRating >= 4.0 && totalReviews >= 10) return 'experienced';
    if (averageRating >= 3.5 && totalReviews >= 5) return 'developing';
    return 'new';
  }

  // Calcular badges basados en rendimiento
  private calculateBadges(averageRating: number, totalReviews: number, distribution: any): string[] {
    const badges: string[] = [];
    
    // Badges por calificación
    if (averageRating >= 4.8) badges.push('excellent-tutor');
    if (averageRating >= 4.5) badges.push('highly-rated');
    if (averageRating >= 4.0) badges.push('quality-tutor');
    
    // Badges por cantidad
    if (totalReviews >= 100) badges.push('century-club');
    if (totalReviews >= 50) badges.push('experienced');
    if (totalReviews >= 25) badges.push('established');
    if (totalReviews >= 10) badges.push('proven');
    
    // Badges por consistencia
    if (distribution[5] >= totalReviews * 0.8) badges.push('consistently-excellent');
    if (distribution[5] >= totalReviews * 0.6) badges.push('mostly-excellent');
    
    return badges;
  }

  // Obtener análisis completo de reseñas
  async getReviewAnalytics(tutorId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: any;
    recentTrend: number;
    reputationLevel: string;
    badges: string[];
  }> {
    try {
      const reviews = await this.getTutorReviews(tutorId);
      
      if (reviews.length === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          recentTrend: 0,
          reputationLevel: 'new',
          badges: []
        };
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      const ratingDistribution = {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length
      };

      const recentReviews = reviews.slice(-10);
      const recentTrend = recentReviews.length > 0 
        ? recentReviews.reduce((sum, review) => sum + review.rating, 0) / recentReviews.length
        : 0;
      
      const reputationLevel = this.calculateReputationLevel(averageRating, reviews.length);
      const badges = this.calculateBadges(averageRating, reviews.length, ratingDistribution);

      return {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length,
        ratingDistribution,
        recentTrend: Math.round(recentTrend * 10) / 10,
        reputationLevel,
        badges
      };
    } catch (error) {
      console.error('Error getting review analytics:', error);
      throw error;
    }
  }

  // Obtener reseñas recientes con análisis de tendencias
  async getRecentReviewsWithTrends(tutorId: string, limit: number = 10): Promise<{
    reviews: Review[];
    trend: 'improving' | 'declining' | 'stable';
    trendPercentage: number;
  }> {
    try {
      const reviews = await this.getTutorReviews(tutorId);
      const recentReviews = reviews.slice(-limit);
      
      if (recentReviews.length < 3) {
        return {
          reviews: recentReviews,
          trend: 'stable',
          trendPercentage: 0
        };
      }

      // Calcular tendencia comparando la primera mitad con la segunda mitad
      const midPoint = Math.floor(recentReviews.length / 2);
      const firstHalf = recentReviews.slice(0, midPoint);
      const secondHalf = recentReviews.slice(midPoint);
      
      const firstHalfAvg = firstHalf.reduce((sum, r) => sum + r.rating, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, r) => sum + r.rating, 0) / secondHalf.length;
      
      const trendPercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
      
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (trendPercentage > 5) trend = 'improving';
      else if (trendPercentage < -5) trend = 'declining';

      return {
        reviews: recentReviews,
        trend,
        trendPercentage: Math.round(trendPercentage * 10) / 10
      };
    } catch (error) {
      console.error('Error getting recent reviews with trends:', error);
      throw error;
    }
  }
}

export const reviewsService = new ReviewsService();