// Servicio de Foro con Firebase Firestore
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  limit,
  runTransaction
} from 'firebase/firestore';
import { db, auth } from '../firebase';

export interface ForumQuestion {
  id: string;
  title: string;
  content: string;
  category: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  answerCount: number;
  isResolved: boolean;
  tags: string[];
  upvotes: string[]; // Array de user IDs que votaron positivo
  downvotes: string[]; // Array de user IDs que votaron negativo
  score: number; // upvotes.length - downvotes.length
}

export interface ForumAnswer {
  id: string;
  questionId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
  isAccepted: boolean;
  upvotes: string[]; // Array de user IDs que votaron positivo
  downvotes: string[]; // Array de user IDs que votaron negativo
  score: number; // upvotes.length - downvotes.length
  isVerified: boolean; // Validado por un experto/docente
  verifiedBy?: string; // ID del validador
  verifiedAt?: Date;
}

export const forumService = {
  /**
   * Obtener todas las preguntas
   */
  async getAllQuestions(filters?: {
    category?: string;
    sortBy?: 'newest' | 'oldest' | 'popular' | 'unanswered';
    limitCount?: number;
  }): Promise<ForumQuestion[]> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('⚠️ Usuario no autenticado');
        return [];
      }

      let q = query(collection(db, 'forumQuestions'));

      // Aplicar filtros
      if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
      }

      // Ordenar
      if (filters?.sortBy === 'newest') {
        q = query(q, orderBy('createdAt', 'desc'));
      } else if (filters?.sortBy === 'oldest') {
        q = query(q, orderBy('createdAt', 'asc'));
      } else if (filters?.sortBy === 'popular') {
        q = query(q, orderBy('score', 'desc'));
      } else if (filters?.sortBy === 'unanswered') {
        q = query(q, where('answerCount', '==', 0), orderBy('createdAt', 'desc'));
      } else {
        q = query(q, orderBy('createdAt', 'desc'));
      }

      // Limitar resultados
      if (filters?.limitCount) {
        q = query(q, limit(filters.limitCount));
      }

      const snapshot = await getDocs(q);
      const questions: ForumQuestion[] = [];

      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        questions.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          score: (data.upvotes?.length || 0) - (data.downvotes?.length || 0)
        } as ForumQuestion);
      });

      // Ordenar por popularidad si es necesario (después de calcular score)
      if (filters?.sortBy === 'popular') {
        questions.sort((a, b) => b.score - a.score);
      }

      console.log(`✅ [getAllQuestions] Obtenidas ${questions.length} preguntas`);
      return questions;
    } catch (error: any) {
      console.error('❌ [getAllQuestions] Error:', error);

      // Si hay error de índice, intentar sin filtros complejos
      if (error.code === 'failed-precondition' || error.message?.includes('index')) {
        console.log('⚠️ Error de índice, intentando sin filtros...');
        try {
          const q = query(collection(db, 'forumQuestions'), orderBy('createdAt', 'desc'));
          const snapshot = await getDocs(q);
          const questions: ForumQuestion[] = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              score: (data.upvotes?.length || 0) - (data.downvotes?.length || 0)
            } as ForumQuestion;
          });
          return questions;
        } catch (retryError) {
          console.error('❌ [getAllQuestions] Error en retry:', retryError);
          return [];
        }
      }

      return [];
    }
  },

  /**
   * Obtener una pregunta por ID
   */
  async getQuestionById(questionId: string): Promise<ForumQuestion | null> {
    try {
      const docRef = doc(db, 'forumQuestions', questionId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        score: (data.upvotes?.length || 0) - (data.downvotes?.length || 0)
      } as ForumQuestion;
    } catch (error) {
      console.error('❌ [getQuestionById] Error:', error);
      return null;
    }
  },

  /**
   * Crear una nueva pregunta
   */
  async createQuestion(question: Omit<ForumQuestion, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'answerCount' | 'isResolved' | 'score' | 'upvotes' | 'downvotes'>): Promise<string> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const questionData = {
        ...question,
        authorId: currentUser.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        viewCount: 0,
        answerCount: 0,
        isResolved: false,
        upvotes: [],
        downvotes: [],
        score: 0,
        tags: question.tags || []
      };

      const docRef = await addDoc(collection(db, 'forumQuestions'), questionData);
      console.log(`✅ [createQuestion] Pregunta creada: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ [createQuestion] Error:', error);
      throw error;
    }
  },

  /**
   * Actualizar una pregunta
   */
  async updateQuestion(questionId: string, updates: Partial<Pick<ForumQuestion, 'title' | 'content' | 'category' | 'tags' | 'isResolved'>>): Promise<void> {
    try {
      const questionRef = doc(db, 'forumQuestions', questionId);
      await updateDoc(questionRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      console.log(`✅ [updateQuestion] Pregunta actualizada: ${questionId}`);
    } catch (error) {
      console.error('❌ [updateQuestion] Error:', error);
      throw error;
    }
  },

  /**
   * Eliminar una pregunta
   */
  async deleteQuestion(questionId: string): Promise<void> {
    try {
      // También eliminar todas las respuestas asociadas
      const answers = await this.getAnswersByQuestionId(questionId);
      for (const answer of answers) {
        await this.deleteAnswer(answer.id);
      }

      const questionRef = doc(db, 'forumQuestions', questionId);
      await deleteDoc(questionRef);
      console.log(`✅ [deleteQuestion] Pregunta eliminada: ${questionId}`);
    } catch (error) {
      console.error('❌ [deleteQuestion] Error:', error);
      throw error;
    }
  },

  /**
   * Incrementar contador de vistas
   */
  async incrementViewCount(questionId: string): Promise<void> {
    try {
      const questionRef = doc(db, 'forumQuestions', questionId);
      await updateDoc(questionRef, {
        viewCount: increment(1)
      });
    } catch (error) {
      console.error('❌ [incrementViewCount] Error:', error);
    }
  },

  /**
   * Votar en una pregunta (upvote/downvote)
   */
  async voteQuestion(questionId: string, voteType: 'upvote' | 'downvote' | 'remove'): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Usuario no autenticado');

    const questionRef = doc(db, 'forumQuestions', questionId);

    try {
      await runTransaction(db, async (transaction) => {
        const questionDoc = await transaction.get(questionRef);
        if (!questionDoc.exists()) {
          throw new Error("Pregunta no encontrada");
        }

        const question = questionDoc.data();
        const userId = currentUser.uid;
        let upvotes = question.upvotes || [];
        let downvotes = question.downvotes || [];

        // Lógica de votación
        if (voteType === 'upvote') {
          upvotes = upvotes.includes(userId) ? upvotes : [...upvotes, userId];
          downvotes = downvotes.filter((id: string) => id !== userId);
        } else if (voteType === 'downvote') {
          downvotes = downvotes.includes(userId) ? downvotes : [...downvotes, userId];
          upvotes = upvotes.filter((id: string) => id !== userId);
        } else if (voteType === 'remove') {
          upvotes = upvotes.filter((id: string) => id !== userId);
          downvotes = downvotes.filter((id: string) => id !== userId);
        }

        transaction.update(questionRef, {
          upvotes: upvotes,
          downvotes: downvotes,
          score: upvotes.length - downvotes.length,
          updatedAt: Timestamp.now()
        });
      });

      console.log(`✅ [voteQuestion] Voto registrado: ${voteType} en ${questionId}`);
    } catch (error) {
      console.error('❌ [voteQuestion] Error:', error);
      throw error;
    }
  },

  /**
   * Obtener respuestas de una pregunta
   */
  async getAnswersByQuestionId(questionId: string): Promise<ForumAnswer[]> {
    try {
      // Simplificar la consulta para evitar errores de índice. El ordenamiento se hará en el cliente.
      const q = query(collection(db, 'forumAnswers'), where('questionId', '==', questionId));

      const snapshot = await getDocs(q);
      const answers: ForumAnswer[] = [];

      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        answers.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          score: (data.upvotes?.length || 0) - (data.downvotes?.length || 0)
        } as ForumAnswer);
      });

      // Ordenar siempre manualmente en el cliente para garantizar consistencia
      answers.sort((a, b) => {
        // Primero las aceptadas
        if (a.isAccepted && !b.isAccepted) return -1;
        if (!a.isAccepted && b.isAccepted) return 1;
        // Luego por score
        if (b.score !== a.score) return b.score - a.score;
        // Finalmente por fecha
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

      console.log(`✅ [getAnswersByQuestionId] Obtenidas ${answers.length} respuestas`);
      return answers;
    } catch (error: any) {
      console.error('❌ [getAnswersByQuestionId] Error:', error);
      return [];
    }
  },

  /**
   * Crear una respuesta
   */
  async createAnswer(answer: Omit<ForumAnswer, 'id' | 'createdAt' | 'updatedAt' | 'isAccepted' | 'score' | 'upvotes' | 'downvotes' | 'isVerified' | 'verifiedBy' | 'verifiedAt'>): Promise<string> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const answerData = {
        ...answer,
        authorId: currentUser.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isAccepted: false,
        upvotes: [],
        downvotes: [],
        score: 0,
        isVerified: false
      };

      const docRef = await addDoc(collection(db, 'forumAnswers'), answerData);

      // Incrementar contador de respuestas en la pregunta
      const questionRef = doc(db, 'forumQuestions', answer.questionId);
      await updateDoc(questionRef, {
        answerCount: increment(1),
        updatedAt: Timestamp.now()
      });

      console.log(`✅ [createAnswer] Respuesta creada: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ [createAnswer] Error:', error);
      throw error;
    }
  },

  /**
   * Actualizar una respuesta
   */
  async updateAnswer(answerId: string, updates: Partial<Pick<ForumAnswer, 'content'>>): Promise<void> {
    try {
      const answerRef = doc(db, 'forumAnswers', answerId);
      await updateDoc(answerRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      console.log(`✅ [updateAnswer] Respuesta actualizada: ${answerId}`);
    } catch (error) {
      console.error('❌ [updateAnswer] Error:', error);
      throw error;
    }
  },

  /**
   * Eliminar una respuesta
   */
  async deleteAnswer(answerId: string): Promise<void> {
    try {
      // Obtener la respuesta para decrementar el contador en la pregunta
      const answerRef = doc(db, 'forumAnswers', answerId);
      const answerSnap = await getDoc(answerRef);

      if (answerSnap.exists()) {
        const answerData = answerSnap.data();
        const questionRef = doc(db, 'forumQuestions', answerData.questionId);
        await updateDoc(questionRef, {
          answerCount: increment(-1),
          updatedAt: Timestamp.now()
        });
      }

      await deleteDoc(answerRef);
      console.log(`✅ [deleteAnswer] Respuesta eliminada: ${answerId}`);
    } catch (error) {
      console.error('❌ [deleteAnswer] Error:', error);
      throw error;
    }
  },

  /**
   * Aceptar una respuesta como solución
   */
  async acceptAnswer(questionId: string, answerId: string): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      // Verificar que el usuario es el autor de la pregunta
      const questionRef = doc(db, 'forumQuestions', questionId);
      const questionSnap = await getDoc(questionRef);

      if (!questionSnap.exists()) {
        throw new Error('Pregunta no encontrada');
      }

      const question = questionSnap.data();
      if (question.authorId !== currentUser.uid) {
        throw new Error('Solo el autor de la pregunta puede aceptar respuestas');
      }

      // Desmarcar todas las demás respuestas como aceptadas
      const answers = await this.getAnswersByQuestionId(questionId);
      for (const answer of answers) {
        if (answer.id !== answerId && answer.isAccepted) {
          const otherAnswerRef = doc(db, 'forumAnswers', answer.id);
          await updateDoc(otherAnswerRef, {
            isAccepted: false,
            updatedAt: Timestamp.now()
          });
        }
      }

      // Marcar la respuesta seleccionada como aceptada
      const answerRef = doc(db, 'forumAnswers', answerId);
      await updateDoc(answerRef, {
        isAccepted: true,
        updatedAt: Timestamp.now()
      });

      // Marcar la pregunta como resuelta
      await updateDoc(questionRef, {
        isResolved: true,
        updatedAt: Timestamp.now()
      });

      console.log(`✅ [acceptAnswer] Respuesta aceptada: ${answerId}`);
    } catch (error) {
      console.error('❌ [acceptAnswer] Error:', error);
      throw error;
    }
  },

  /**
   * Verificar una respuesta (Solo para Tutores/Docentes - Capa de Consolidación)
   */
  async verifyAnswer(answerId: string): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      // En una implementación real, aquí verificaríamos si el usuario tiene rol de 'tutor' o 'docente'
      // Por ahora confiamos en la UI, pero el backend debería validar claims

      const answerRef = doc(db, 'forumAnswers', answerId);
      await updateDoc(answerRef, {
        isVerified: true,
        verifiedBy: currentUser.uid,
        verifiedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      await updateDoc(answerRef, {
        isVerified: true,
        verifiedBy: currentUser.uid,
        verifiedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      console.log(`✅ [verifyAnswer] Respuesta verificada: ${answerId} por ${currentUser.uid}`);

      // TRIGGER AUTOMÁTICO DE TESIS: Promoción a Base de Conocimiento
      // Si un docente valida, la respuesta es "verdad canónica" = Knowledge Base
      await this.checkAndPromoteToKnowledgeBase(answerId);

    } catch (error) {
      console.error('❌ [verifyAnswer] Error:', error);
      throw error;
    }
  },

  /**
   * Votar en una respuesta (upvote/downvote)
   */
  async voteAnswer(answerId: string, voteType: 'upvote' | 'downvote' | 'remove'): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Usuario no autenticado');

    const answerRef = doc(db, 'forumAnswers', answerId);

    try {
      await runTransaction(db, async (transaction) => {
        const answerDoc = await transaction.get(answerRef);
        if (!answerDoc.exists()) {
          throw new Error("Respuesta no encontrada");
        }

        const answer = answerDoc.data();
        const userId = currentUser.uid;
        let upvotes = answer.upvotes || [];
        let downvotes = answer.downvotes || [];

        if (voteType === 'upvote') {
          upvotes = upvotes.includes(userId) ? upvotes : [...upvotes, userId];
          downvotes = downvotes.filter((id: string) => id !== userId);
        } else if (voteType === 'downvote') {
          downvotes = downvotes.includes(userId) ? downvotes : [...downvotes, userId];
          upvotes = upvotes.filter((id: string) => id !== userId);
        } else if (voteType === 'remove') {
          upvotes = upvotes.filter((id: string) => id !== userId);
          downvotes = downvotes.filter((id: string) => id !== userId);
        }

        transaction.update(answerRef, {
          upvotes: upvotes,
          downvotes: downvotes,
          score: upvotes.length - downvotes.length,
          updatedAt: Timestamp.now()
        });
      });



      console.log(`✅ [voteAnswer] Voto registrado: ${voteType} en ${answerId}`);

      // TRIGGER AUTOMÁTICO DE TESIS: Inteligencia Colectiva
      // Si supera 5 votos netos, se considera validada socialmente = Promoción potencial
      if (voteType === 'upvote') {
        const answerDoc = await getDoc(answerRef);
        const score = (answerDoc.data()?.upvotes?.length || 0) - (answerDoc.data()?.downvotes?.length || 0);
        if (score >= 5) {
          await this.checkAndPromoteToKnowledgeBase(answerId);
        }
      }

    } catch (error) {
      console.error('❌ [voteAnswer] Error:', error);
      throw error;
    }
  },

  /**
   * Escuchar cambios en preguntas en tiempo real
   */
  onQuestionsChanged(
    callback: (questions: ForumQuestion[]) => void,
    filters?: {
      category?: string;
      sortBy?: 'newest' | 'oldest' | 'popular' | 'unanswered';
    }
  ): () => void {
    try {
      let q = query(collection(db, 'forumQuestions'));

      if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
      }

      if (filters?.sortBy === 'newest') {
        q = query(q, orderBy('createdAt', 'desc'));
      } else if (filters?.sortBy === 'popular') {
        q = query(q, orderBy('score', 'desc'));
      } else {
        q = query(q, orderBy('createdAt', 'desc'));
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const questions: ForumQuestion[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            score: (data.upvotes?.length || 0) - (data.downvotes?.length || 0)
          } as ForumQuestion;
        });

        if (filters?.sortBy === 'popular') {
          questions.sort((a, b) => b.score - a.score);
        }

        callback(questions);
      }, (error) => {
        console.error('❌ [onQuestionsChanged] Error en listener:', error);
        callback([]);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ [onQuestionsChanged] Error:', error);
      return () => { };
    }
  },

  /**
   * Escuchar cambios en respuestas en tiempo real
   */
  onAnswersChanged(questionId: string, callback: (answers: ForumAnswer[]) => void): () => void {
    try {
      const q = query(collection(db, 'forumAnswers'), where('questionId', '==', questionId));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const answers: ForumAnswer[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            score: (data.upvotes?.length || 0) - (data.downvotes?.length || 0)
          } as ForumAnswer;
        });

        // Ordenar manualmente
        answers.sort((a, b) => {
          if (a.isAccepted && !b.isAccepted) return -1;
          if (!a.isAccepted && b.isAccepted) return 1;
          if (b.score !== a.score) return b.score - a.score;
          return a.createdAt.getTime() - b.createdAt.getTime();
        });

        callback(answers);
      }, (error) => {
        console.error('❌ [onAnswersChanged] Error en listener:', error);
        callback([]);
      });

      return unsubscribe;
    } catch (error: any) {
      console.error('❌ [onAnswersChanged] Error:', error);
      return () => { };
    }
  },

  /**
   * Promoción a Base de Conocimiento (Knowledge Base)
   * Implementa el concepto de "Repositorio de Conocimiento" de la tesis
   */
  async checkAndPromoteToKnowledgeBase(answerId: string): Promise<void> {
    try {
      const answerRef = doc(db, 'forumAnswers', answerId);
      const answerSnap = await getDoc(answerRef);

      if (!answerSnap.exists()) return;

      const answerData = answerSnap.data();

      // Criterios de promoción: Verificado por docente O Score alto (>5)
      const isVerified = answerData.isVerified;
      const score = (answerData.upvotes?.length || 0) - (answerData.downvotes?.length || 0);

      if (isVerified || score >= 5) {
        // En una app real, esto copiaría el contenido a una colección 'knowledgeBase'
        // optimizada para búsquedas vectoriales (RAG).
        // Aquí simulamos el evento para la defensa.
        console.log(`🚀 [KnowledgeBase] PROMOVIENDO RESPUESTA ${answerId}`);
        console.log(`   Razón: ${isVerified ? 'Verificación Experta 🛡️' : 'Validación Social Distribuida 👥'}`);

        // Marcar en el documento original que ha sido promovido
        await updateDoc(answerRef, {
          promotedToKB: true,
          promotedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error promoting to KB:', error);
    }
  }
};
