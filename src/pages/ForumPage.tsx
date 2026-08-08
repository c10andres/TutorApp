import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { forumService, ForumQuestion, ForumAnswer } from '../services/forum';
import { usersService } from '../services/users';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { formatDate } from '../utils/formatters';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Clock,
  Eye,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  ArrowUp,
  ArrowDown,
  BookOpen,
  HelpCircle,
  Tag,
  User,
  Send,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  Loader2,
  RefreshCw,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import { ReportButton } from '../components/ReportButton';

interface ForumPageProps {
  onNavigate: (page: string, data?: any) => void;
}

// Categorías del foro
const FORUM_CATEGORIES = [
  { id: 'all', name: 'Todas', icon: MessageSquare, color: 'bg-gray-100 text-gray-700' },
  { id: 'academics', name: 'Académico', icon: BookOpen, color: 'bg-blue-100 text-blue-700' },
  { id: 'tutoring', name: 'Tutorías', icon: User, color: 'bg-green-100 text-green-700' },
  { id: 'technical', name: 'Técnico', icon: HelpCircle, color: 'bg-purple-100 text-purple-700' },
  { id: 'general', name: 'General', icon: MessageSquare, color: 'bg-orange-100 text-orange-700' },
  { id: 'suggestions', name: 'Sugerencias', icon: TrendingUp, color: 'bg-pink-100 text-pink-700' }
];

export function ForumPage({ onNavigate }: ForumPageProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<ForumQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<ForumQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<ForumQuestion | null>(null);
  const [answers, setAnswers] = useState<ForumAnswer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular' | 'unanswered'>('newest');
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [showAnswerDialog, setShowAnswerDialog] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  // Formulario de pregunta
  const [questionForm, setQuestionForm] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: [] as string[]
  });

  // Formulario de respuesta
  const [answerForm, setAnswerForm] = useState({
    content: ''
  });



  useEffect(() => {
    loadQuestions();

    // Escuchar cambios en tiempo real
    const filters: any = {
      sortBy
    };

    if (selectedCategory !== 'all') {
      filters.category = selectedCategory;
    }

    const unsubscribe = forumService.onQuestionsChanged((updatedQuestions) => {
      console.log('🔄 [ForumPage] Preguntas actualizadas en tiempo real:', updatedQuestions.length);
      setQuestions(updatedQuestions);
    }, filters);

    // Limpiar listener al desmontar o cambiar filtros
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, selectedCategory, sortBy]);

  useEffect(() => {
    if (selectedQuestion) {
      // Escuchar cambios en respuestas en tiempo real
      const unsubscribe = forumService.onAnswersChanged(selectedQuestion.id, (updatedAnswers) => {
        console.log('🔄 [ForumPage] Respuestas actualizadas en tiempo real:', updatedAnswers.length);
        setAnswers(updatedAnswers);
      });

      // Limpiar listener al desmontar o cambiar pregunta
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    } else {
      setAnswers([]);
    }
  }, [selectedQuestion?.id]); // Depender solo del ID para evitar re-ejecuciones innecesarias

  // useEffect dedicado exclusivamente a contar la vista
  useEffect(() => {
    if (selectedQuestion) {
      incrementViewCount(selectedQuestion.id);
    }
  }, [selectedQuestion?.id]); // Este se ejecuta solo cuando el ID de la pregunta cambia

  // Cargar nombres de usuarios
  useEffect(() => {
    const loadUserNames = async () => {
      const names: Record<string, string> = {};
      const allUserIds = new Set<string>();

      questions.forEach(q => {
        allUserIds.add(q.authorId);
        if (selectedQuestion?.authorId) allUserIds.add(selectedQuestion.authorId);
      });
      answers.forEach(a => allUserIds.add(a.authorId));

      for (const userId of allUserIds) {
        try {
          const userData = await usersService.getUserById(userId);
          if (userData) {
            names[userId] = userData.name || 'Usuario';
          }
        } catch (error) {
          console.error('Error loading user:', userId, error);
        }
      }

      setUserNames(names);
    };

    if (questions.length > 0 || answers.length > 0) {
      loadUserNames();
    }
  }, [questions, answers, selectedQuestion]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError('');

      const filters: any = {
        sortBy
      };

      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }

      const data = await forumService.getAllQuestions(filters);
      setQuestions(data);
    } catch (error: any) {
      console.error('Error loading questions:', error);
      setError('Error al cargar las preguntas. Verifica la consola para más detalles.');
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = [...questions];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrar por categoría (si no está en 'all', ya viene filtrado del servicio)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }

    // Ordenar
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.score - a.score);
        break;
      case 'unanswered':
        filtered.sort((a, b) => {
          if (a.answerCount === 0 && b.answerCount > 0) return -1;
          if (a.answerCount > 0 && b.answerCount === 0) return 1;
          return b.createdAt.getTime() - a.createdAt.getTime();
        });
        break;
    }

    setFilteredQuestions(filtered);
  };

  const loadAnswers = async (questionId: string) => {
    try {
      const data = await forumService.getAnswersByQuestionId(questionId);
      setAnswers(data);
    } catch (error) {
      console.error('Error loading answers:', error);
    }
  };

  const incrementViewCount = async (questionId: string) => {
    try {
      await forumService.incrementViewCount(questionId);
      // Actualizar en el estado local
      setQuestions(prev => prev.map(q =>
        q.id === questionId ? { ...q, viewCount: q.viewCount + 1 } : q
      ));
      if (selectedQuestion?.id === questionId) {
        setSelectedQuestion(prev => prev ? { ...prev, viewCount: prev.viewCount + 1 } : null);
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleCreateQuestion = async () => {
    try {
      if (!questionForm.title.trim() || !questionForm.content.trim()) {
        setError('Por favor completa todos los campos requeridos');
        return;
      }

      if (!user) {
        setError('Debes iniciar sesión para publicar');
        return;
      }

      setSubmitting(true);
      setError('');

      const questionId = await forumService.createQuestion({
        title: questionForm.title.trim(),
        content: questionForm.content.trim(),
        category: questionForm.category,
        authorId: user.id,
        authorName: user.name || 'Usuario',
        authorAvatar: user.avatar || null,
        tags: questionForm.tags
      });

      console.log('✅ Pregunta creada:', questionId);

      // Limpiar formulario
      setQuestionForm({
        title: '',
        content: '',
        category: 'general',
        tags: []
      });
      setShowQuestionDialog(false);

      // El listener en tiempo real actualizará automáticamente
      // No necesitamos recargar manualmente, pero lo hacemos por seguridad
      setTimeout(() => {
        loadQuestions();
      }, 500);
    } catch (error: any) {
      console.error('Error creating question:', error);
      setError(`Error al crear la pregunta: ${error.message || 'Error desconocido'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAnswer = async () => {
    try {
      if (!selectedQuestion || !answerForm.content.trim()) {
        setError('Por favor escribe una respuesta');
        return;
      }

      if (!user) {
        setError('Debes iniciar sesión para responder');
        return;
      }

      setSubmitting(true);
      setError('');

      await forumService.createAnswer({
        questionId: selectedQuestion.id,
        content: answerForm.content.trim(),
        authorId: user.id,
        authorName: user.name || 'Usuario',
        authorAvatar: user.avatar || null
      });

      console.log('✅ Respuesta creada');

      // Limpiar formulario
      setAnswerForm({ content: '' });
      setShowAnswerDialog(false);

      // El listener en tiempo real actualizará automáticamente
      // Recargar por seguridad después de un breve delay
      setTimeout(() => {
        if (selectedQuestion) {
          loadAnswers(selectedQuestion.id);
          loadQuestions(); // Actualizar contador de respuestas
        }
      }, 500);
    } catch (error: any) {
      console.error('Error creating answer:', error);
      setError(`Error al crear la respuesta: ${error.message || 'Error desconocido'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoteQuestion = async (questionId: string, voteType: 'upvote' | 'downvote' | 'remove') => {
    try {
      if (!user) {
        setError('Debes iniciar sesión para votar');
        return;
      }

      await forumService.voteQuestion(questionId, voteType);

      // Actualizar estado local
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      const userId = user.id;
      let newUpvotes = [...(question.upvotes || [])];
      let newDownvotes = [...(question.downvotes || [])];

      if (voteType === 'remove') {
        newUpvotes = newUpvotes.filter(id => id !== userId);
        newDownvotes = newDownvotes.filter(id => id !== userId);
      } else if (voteType === 'upvote') {
        newDownvotes = newDownvotes.filter(id => id !== userId);
        if (!newUpvotes.includes(userId)) {
          newUpvotes.push(userId);
        }
      } else if (voteType === 'downvote') {
        newUpvotes = newUpvotes.filter(id => id !== userId);
        if (!newDownvotes.includes(userId)) {
          newDownvotes.push(userId);
        }
      }

      const updatedQuestion = {
        ...question,
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        score: newUpvotes.length - newDownvotes.length
      };

      // Actualizar en lista de preguntas
      setQuestions(prev => prev.map(q => q.id === questionId ? updatedQuestion : q));

      // Actualizar pregunta seleccionada si es la misma
      if (selectedQuestion?.id === questionId) {
        setSelectedQuestion(updatedQuestion);
      }

      // El listener en tiempo real actualizará automáticamente
    } catch (error: any) {
      console.error('Error voting question:', error);
      setError('Error al votar. Verifica la consola para más detalles.');
    }
  };

  const handleVoteAnswer = async (answerId: string, voteType: 'upvote' | 'downvote' | 'remove') => {
    try {
      if (!user) {
        setError('Debes iniciar sesión para votar');
        return;
      }

      await forumService.voteAnswer(answerId, voteType);

      // Actualizar estado local
      const answer = answers.find(a => a.id === answerId);
      if (!answer) return;

      const userId = user.id;
      let newUpvotes = [...(answer.upvotes || [])];
      let newDownvotes = [...(answer.downvotes || [])];

      if (voteType === 'remove') {
        newUpvotes = newUpvotes.filter(id => id !== userId);
        newDownvotes = newDownvotes.filter(id => id !== userId);
      } else if (voteType === 'upvote') {
        newDownvotes = newDownvotes.filter(id => id !== userId);
        if (!newUpvotes.includes(userId)) {
          newUpvotes.push(userId);
        }
      } else if (voteType === 'downvote') {
        newUpvotes = newUpvotes.filter(id => id !== userId);
        if (!newDownvotes.includes(userId)) {
          newDownvotes.push(userId);
        }
      }

      const updatedAnswer = {
        ...answer,
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        score: newUpvotes.length - newDownvotes.length
      };

      // Actualizar respuesta en la lista
      setAnswers(prev => prev.map(a => a.id === answerId ? updatedAnswer : a));

      // El listener en tiempo real actualizará automáticamente
    } catch (error: any) {
      console.error('Error voting answer:', error);
      setError('Error al votar. Verifica la consola para más detalles.');
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    try {
      if (!selectedQuestion || !user) return;

      if (selectedQuestion.authorId !== user.id) {
        setError('Solo el autor de la pregunta puede aceptar respuestas');
        return;
      }

      await forumService.acceptAnswer(selectedQuestion.id, answerId);

      // Actualizar estado local inmediatamente
      setAnswers(prev => prev.map(a => ({
        ...a,
        isAccepted: a.id === answerId
      })));

      // Actualizar pregunta localmente
      if (selectedQuestion) {
        setSelectedQuestion({ ...selectedQuestion, isResolved: true });
        setQuestions(prev => prev.map(q =>
          q.id === selectedQuestion.id ? { ...q, isResolved: true } : q
        ));
      }

      // El listener en tiempo real actualizará automáticamente
      setTimeout(() => {
        loadQuestions();
      }, 300);
    } catch (error: any) {
      console.error('Error accepting answer:', error);
      setError('Error al aceptar la respuesta. Verifica la consola para más detalles.');
    }
  };

  const handleVerifyAnswer = async (answerId: string) => {
    try {
      if (!user) return;

      // Doble validación: Solo tutores o docentes pueden verificar
      // En producción esto se valida en backend, aquí validamos por UI
      if (user.currentMode !== 'tutor') {
        setError('Solo los usuarios con perfil de Tutor pueden verificar respuestas.');
        return;
      }

      await forumService.verifyAnswer(answerId);

      // Actualizar estado local inmediatamente
      setAnswers(prev => prev.map(a => ({
        ...a,
        isVerified: a.id === answerId ? true : a.isVerified,
        verifiedBy: a.id === answerId ? user.id : a.verifiedBy
      })));

      console.log('✅ Respuesta verificada localmente');

      // El listener en tiempo real actualizará automáticamente
    } catch (error: any) {
      console.error('Error verifying answer:', error);
      setError('Error al verificar la respuesta. Verifica la consola para más detalles.');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      if (!window.confirm('¿Estás seguro de eliminar esta pregunta? Esta acción no se puede deshacer.')) {
        return;
      }

      await forumService.deleteQuestion(questionId);

      // Actualizar estado local inmediatamente
      setQuestions(prev => prev.filter(q => q.id !== questionId));

      if (selectedQuestion?.id === questionId) {
        setSelectedQuestion(null);
        setAnswers([]);
      }

      // El listener en tiempo real actualizará automáticamente
    } catch (error: any) {
      console.error('Error deleting question:', error);
      setError('Error al eliminar la pregunta. Verifica la consola para más detalles.');
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    try {
      if (!window.confirm('¿Estás seguro de eliminar esta respuesta? Esta acción no se puede deshacer.')) {
        return;
      }

      if (!selectedQuestion) return;

      await forumService.deleteAnswer(answerId);

      // Actualizar estado local inmediatamente
      setAnswers(prev => prev.filter(a => a.id !== answerId));
      setQuestions(prev => prev.map(q =>
        q.id === selectedQuestion.id
          ? { ...q, answerCount: Math.max(0, q.answerCount - 1) }
          : q
      ));

      // El listener en tiempo real actualizará automáticamente
      setTimeout(() => {
        if (selectedQuestion) {
          loadAnswers(selectedQuestion.id);
          loadQuestions();
        }
      }, 300);
    } catch (error: any) {
      console.error('Error deleting answer:', error);
      setError('Error al eliminar la respuesta. Verifica la consola para más detalles.');
    }
  };

  const getVoteState = (item: ForumQuestion | ForumAnswer, userId: string): 'upvote' | 'downvote' | null => {
    if (item.upvotes?.includes(userId)) return 'upvote';
    if (item.downvotes?.includes(userId)) return 'downvote';
    return null;
  };

  // Vista de lista de preguntas
  if (selectedQuestion) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header con botón volver */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedQuestion(null);
              setAnswers([]);
            }}
          >
            <ChevronLeft className="size-4 mr-2" />
            Volver al foro
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Pregunta seleccionada */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {selectedQuestion.isResolved && (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="size-3 mr-1" />
                      Resuelta
                    </Badge>
                  )}
                  <Badge variant="outline">{FORUM_CATEGORIES.find(c => c.id === selectedQuestion.category)?.name || selectedQuestion.category}</Badge>
                  {selectedQuestion.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="size-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                <CardTitle className="text-2xl mb-2">{selectedQuestion.title}</CardTitle>
                <CardDescription className="mt-2">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="size-4" />
                      <span>{userNames[selectedQuestion.authorId] || selectedQuestion.authorName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="size-4" />
                      <span>{formatDate(selectedQuestion.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="size-4" />
                      <span>{selectedQuestion.viewCount} vistas</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="size-4" />
                      <span>{selectedQuestion.answerCount} respuestas</span>
                    </div>
                  </div>
                </CardDescription>
              </div>

              {/* Botones de acción */}
              {user && user.id === selectedQuestion.authorId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteQuestion(selectedQuestion.id)}
                >
                  <Trash2 className="size-4" />
                </Button>

              )}
              {user && user.id !== selectedQuestion.authorId && (
                <ReportButton contentId={selectedQuestion.id} contentType="question" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{selectedQuestion.content}</p>
            </div>

            {/* Votación de pregunta */}
            {user && (
              <div className="flex items-center gap-2 pt-4 border-t">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => {
                    const currentState = getVoteState(selectedQuestion, user.id);
                    handleVoteQuestion(selectedQuestion.id, currentState === 'upvote' ? 'remove' : 'upvote');
                  }}>
                    <ThumbsUp className={`size-4 ${getVoteState(selectedQuestion, user.id) === 'upvote' ? 'text-blue-600 fill-blue-600' : 'text-gray-500'}`} />
                  </Button>

                  <span className="font-semibold">{selectedQuestion.score}</span>

                  <Button variant="ghost" size="sm" onClick={() => {
                    const currentState = getVoteState(selectedQuestion, user.id);
                    handleVoteQuestion(selectedQuestion.id, currentState === 'downvote' ? 'remove' : 'downvote');
                  }}>
                    <ThumbsDown className={`size-4 ${getVoteState(selectedQuestion, user.id) === 'downvote' ? 'text-red-600 fill-red-600' : 'text-gray-500'}`} />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Respuestas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {answers.length} {answers.length === 1 ? 'Respuesta' : 'Respuestas'}
            </h2>
            {user && (
              <Dialog open={showAnswerDialog} onOpenChange={setShowAnswerDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="size-4 mr-2" />
                    Responder
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Responder Pregunta</DialogTitle>
                    <DialogDescription>
                      Comparte tu conocimiento y ayuda a la comunidad.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="answer-content">Tu Respuesta</Label>
                      <Textarea
                        id="answer-content"
                        placeholder="Escribe tu respuesta aquí..."
                        value={answerForm.content}
                        onChange={(e) => setAnswerForm({ content: e.target.value })}
                        rows={8}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAnswerDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateAnswer} disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="size-4 mr-2 animate-spin" />
                          Publicando...
                        </>
                      ) : (
                        <>
                          <Send className="size-4 mr-2" />
                          Publicar Respuesta
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {answers.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="size-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aún no hay respuestas. Sé el primero en responder.</p>
              </CardContent>
            </Card>
          ) : (
            answers.map(answer => (
              <Card key={answer.id} className={answer.isAccepted ? 'border-green-500 bg-green-50' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {answer.isAccepted && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="size-3 mr-1" />
                            Respuesta Aceptada
                          </Badge>
                        )}
                        {answer.isVerified && (
                          <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 border-indigo-200">
                            <ShieldCheck className="size-3 mr-1" />
                            Validado por Docente
                          </Badge>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="size-4" />
                          <span>{userNames[answer.authorId] || answer.authorName}</span>
                          <span>•</span>
                          <Clock className="size-4" />
                          <span>{formatDate(answer.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center gap-2">
                      {user && user.id === selectedQuestion.authorId && !selectedQuestion.isResolved && !answer.isAccepted && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcceptAnswer(answer.id)}
                        >
                          <Check className="size-4 mr-1" />
                          Aceptar
                        </Button>
                      )}
                      {user && user.currentMode === 'tutor' && !answer.isVerified && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                          onClick={() => handleVerifyAnswer(answer.id)}
                          title="Verificar validación experta"
                        >
                          <ShieldCheck className="size-4 mr-1" />
                          Verificar
                        </Button>
                      )}
                      {user && user.id === answer.authorId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAnswer(answer.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>

                      )}
                      {user && user.id !== answer.authorId && (
                        <ReportButton contentId={answer.id} contentType="answer" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{answer.content}</p>
                  </div>

                  {/* Votación de respuesta */}
                  {user && (
                    <div className="flex items-center gap-2 pt-4 border-t">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => {
                          const currentState = getVoteState(answer, user.id);
                          handleVoteAnswer(answer.id, currentState === 'upvote' ? 'remove' : 'upvote');
                        }}>
                          <ThumbsUp className={`size-4 ${getVoteState(answer, user.id) === 'upvote' ? 'text-blue-600 fill-blue-600' : 'text-gray-500'}`} />
                        </Button>

                        <span className="font-semibold">{answer.score}</span>

                        <Button variant="ghost" size="sm" onClick={() => {
                          const currentState = getVoteState(answer, user.id);
                          handleVoteAnswer(answer.id, currentState === 'downvote' ? 'remove' : 'downvote');
                        }}>
                          <ThumbsDown className={`size-4 ${getVoteState(answer, user.id) === 'downvote' ? 'text-red-600 fill-red-600' : 'text-gray-500'}`} />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )
          }
        </div >
      </div >
    );
  }

  // Vista principal (lista de preguntas)
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        {/* Hero Header */}
        <div className="rounded-xl bg-purple-600 p-8 md:p-12 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left space-y-4 max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                Foro de la Comunidad
              </h1>
              <p className="text-blue-100 text-lg md:text-xl font-medium leading-relaxed">
                Un espacio para conectar, aprender y crecer juntos. Comparte tus dudas y conocimientos con miles de estudiantes y tutores.
              </p>
            </div>
            <div className="w-full md:w-auto shrink-0">
              {user && (
                <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      className="w-full md:w-auto bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-bold text-lg px-8 py-6 shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      <Plus className="size-6 mr-2" />
                      Hacer Pregunta
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Hacer una Pregunta</DialogTitle>
                      <DialogDescription>
                        Comparte tus dudas con la comunidad de tutores y estudiantes.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Título</Label>
                        <Input
                          id="title"
                          placeholder="¿Cómo resolver ecuaciones diferenciales?"
                          value={questionForm.title}
                          onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Categoría</Label>
                        <Select
                          value={questionForm.category}
                          onValueChange={(value) => setQuestionForm({ ...questionForm, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {FORUM_CATEGORIES.filter(c => c.id !== 'all').map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="content">Detalles</Label>
                        <Textarea
                          id="content"
                          placeholder="Describe tu pregunta con más detalle..."
                          className="min-h-[150px]"
                          value={questionForm.content}
                          onChange={(e) => setQuestionForm({ ...questionForm, content: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tags">Etiquetas (separadas por coma)</Label>
                        <Input
                          id="tags"
                          placeholder="matemáticas, cálculo, universidad"
                          value={questionForm.tags.join(', ')}
                          onChange={(e) => setQuestionForm({
                            ...questionForm,
                            tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                          })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowQuestionDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateQuestion} disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="size-4 mr-2 animate-spin" />
                            Publicando...
                          </>
                        ) : (
                          <>
                            <Send className="size-4 mr-2" />
                            Publicar Pregunta
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filtros y búsqueda */}
        <div className="grid gap-4 md:grid-cols-3 mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
            <Input
              placeholder="Buscar preguntas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {FORUM_CATEGORIES.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Más recientes</SelectItem>
              <SelectItem value="oldest">Más antiguas</SelectItem>
              <SelectItem value="popular">Más populares</SelectItem>
              <SelectItem value="unanswered">Sin responder</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Categorías */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {FORUM_CATEGORIES.map(category => {
            const Icon = category.icon;
            const count = questions.filter(q => q.category === category.id).length;
            return (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${selectedCategory === category.id ? 'ring-2 ring-blue-600 shadow-lg' : 'shadow-sm'
                  }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center ${category.color}`}>
                    <Icon className={`size-6 text-white`} />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-800">{category.name}</h3>
                  {category.id !== 'all' && (
                    <p className="text-xs text-gray-600 mt-1">{count} preguntas</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Lista de preguntas */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredQuestions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="size-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron preguntas
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Sé el primero en hacer una pregunta'}
              </p>
              {user && (
                <Button onClick={() => setShowQuestionDialog(true)}>
                  <Plus className="size-4 mr-2" />
                  Hacer Primera Pregunta
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map(question => {
              const categoryInfo = FORUM_CATEGORIES.find(c => c.id === question.category);
              const CategoryIcon = categoryInfo?.icon || MessageSquare;

              return (
                <Card
                  key={question.id}
                  className={`transition-all duration-300 cursor-pointer hover:brightness-105 shadow-md ${categoryInfo?.color.split(' ')[0] || 'bg-white'
                    }`}
                  onClick={() => setSelectedQuestion(question)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Votación lateral */}
                      {user && (
                        <div className="flex flex-col items-center gap-1 pt-1">
                          <Button variant="ghost" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            const currentState = getVoteState(question, user.id);
                            handleVoteQuestion(question.id, currentState === 'upvote' ? 'remove' : 'upvote');
                          }}>
                            <ThumbsUp className={`size-4 ${getVoteState(question, user.id) === 'upvote' ? 'text-blue-600 fill-blue-600' : 'text-gray-500'}`} />
                          </Button>

                          <span className="font-semibold text-lg">{question.score}</span>

                          <Button variant="ghost" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            const currentState = getVoteState(question, user.id);
                            handleVoteQuestion(question.id, currentState === 'downvote' ? 'remove' : 'downvote');
                          }}>
                            <ThumbsDown className={`size-4 ${getVoteState(question, user.id) === 'downvote' ? 'text-red-600 fill-red-600' : 'text-gray-500'}`} />
                          </Button>
                        </div>
                      )}

                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {question.isResolved && (
                                <Badge variant="default" className="bg-green-600">
                                  <CheckCircle className="size-3 mr-1" />
                                  Resuelta
                                </Badge>
                              )}
                              <Badge variant="outline" className="flex items-center gap-1">
                                <CategoryIcon className="size-3" />
                                {categoryInfo?.name || question.category}
                              </Badge>
                              {question.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  <Tag className="size-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{question.title}</h3>
                            <p className="text-gray-600 line-clamp-2">{question.content}</p>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between text-sm text-gray-600 gap-4">
                          <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                            <div className="flex items-center gap-1">
                              <User className="size-4" />
                              <span>{userNames[question.authorId] || question.authorName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="size-4" />
                              <span>{formatDate(question.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="size-4" />
                              <span>{question.viewCount} vistas</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="size-4" />
                              <span>{question.answerCount} respuestas</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
