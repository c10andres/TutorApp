// Página para crear reseñas de tutores
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { TutorRequest, User, Review } from '../types';
import { tutoringService } from '../services/tutoring';
import { reviewsService } from '../services/reviews';
import { formatPriceCOP, formatDate } from '../utils/formatters';
import { database } from '../firebase';
import { ref, push, set, get, query, orderByChild, equalTo, update } from 'firebase/database';
import { 
  Star,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  BookOpen,
  Clock,
  MapPin,
  DollarSign,
  Bug
} from 'lucide-react';

interface ReviewPageProps {
  onNavigate: (page: string, data?: any) => void;
  request?: TutorRequest;
  tutor?: User;
}

export function ReviewPage({ onNavigate, request, tutor }: ReviewPageProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [debugMode, setDebugMode] = useState(false);

  // Función para testear la conexión con Firebase
  const testFirebaseConnection = async () => {
    try {
      console.log('Testing Firebase connection...');
      const testRef = ref(database, 'test-connection');
      const testData = {
        timestamp: new Date().toISOString(),
        message: 'Test connection from reviews page',
        userId: user?.id,
      };
      
      await set(testRef, testData);
      console.log('Firebase connection test successful!');
      alert('✅ Conexión con Firebase exitosa');
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      alert('❌ Error de conexión con Firebase: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  // Función para testear todo el proceso de creación de reseña
  const testFullReviewProcess = async () => {
    if (!user || !tutor || !request) {
      alert('❌ Faltan datos: usuario, tutor o request');
      return;
    }

    try {
      console.log('=== STARTING FULL REVIEW TEST ===');
      
      // Test 1: Conexión básica a Firebase
      console.log('Test 1: Testing basic Firebase connection...');
      const testRef = ref(database, 'test-full-review');
      await set(testRef, {
        timestamp: new Date().toISOString(),
        step: 'basic-connection-test'
      });
      console.log('✅ Test 1: Basic connection OK');

      // Test 2: Crear datos de reseña
      const testReviewData = {
        requestId: request.id,
        studentId: user.id,
        tutorId: tutor.id,
        rating: 5,
        comment: 'Test review from debug panel',
      };
      console.log('Test 2: Review data prepared:', testReviewData);

      // Test 3: Intentar escribir directamente en reviews
      console.log('Test 3: Writing directly to reviews collection...');
      const reviewsRef = ref(database, 'reviews');
      const reviewRef = push(reviewsRef);
      
      const testReviewForStorage = {
        id: reviewRef.key!,
        ...testReviewData,
        createdAt: new Date().toISOString(),
      };
      
      console.log('Test 3: Writing data:', testReviewForStorage);
      await set(reviewRef, testReviewForStorage);
      console.log('✅ Test 3: Direct write to reviews OK, ID:', reviewRef.key);

      // Test 4: Verificar que se escribió correctamente
      console.log('Test 4: Verifying write...');
      const verifySnapshot = await get(reviewRef);
      if (verifySnapshot.exists()) {
        console.log('✅ Test 4: Data verified in Firebase:', verifySnapshot.val());
      } else {
        console.log('❌ Test 4: Data not found after write');
      }

      // Test 5: Intentar leer todas las reseñas del tutor
      console.log('Test 5: Reading tutor reviews...');
      const tutorQuery = query(reviewsRef, orderByChild('tutorId'), equalTo(tutor.id));
      const tutorSnapshot = await get(tutorQuery);
      
      if (tutorSnapshot.exists()) {
        const reviews = tutorSnapshot.val();
        console.log('✅ Test 5: Found tutor reviews:', Object.keys(reviews).length, 'reviews');
        console.log('Reviews data:', reviews);
      } else {
        console.log('❌ Test 5: No reviews found for tutor');
      }

      // Test 6: Intentar actualizar el usuario
      console.log('Test 6: Testing user update...');
      const userRef = ref(database, `users/${tutor.id}`);
      await update(userRef, {
        testUpdate: new Date().toISOString(),
        rating: 4.8,
        totalReviews: 1
      });
      console.log('✅ Test 6: User update OK');

      alert('✅ Todos los tests pasaron! Revisa la consola para detalles.');

    } catch (error) {
      console.error('❌ Test failed at some point:', error);
      alert('❌ Test falló: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  // Función para cargar datos del tutor si faltan
  const [tutorData, setTutorData] = useState<User | null>(tutor || null);
  const [requestData, setRequestData] = useState<TutorRequest | null>(request || null);
  const [loadingTutorData, setLoadingTutorData] = useState(false);

  useEffect(() => {
    const loadMissingData = async () => {
      // Si ya tenemos los datos, no hacer nada
      if (tutorData && requestData) return;

      console.log('=== LOADING MISSING DATA ===');
      console.log('Current tutorData:', tutorData);
      console.log('Current requestData:', requestData);

      setLoadingTutorData(true);

      try {
        // Si falta el tutor pero tenemos request, intentar cargar el tutor
        if (!tutorData && requestData?.tutorId) {
          console.log('Loading tutor data for ID:', requestData.tutorId);
          const { usersService } = await import('../services/users');
          const loadedTutor = await usersService.getUserById(requestData.tutorId);
          console.log('Loaded tutor:', loadedTutor);
          if (loadedTutor) {
            setTutorData(loadedTutor);
          }
        }

        // Si falta request, intentar recuperar de localStorage o parámetros URL
        if (!requestData && tutorData?.id) {
          console.log('Attempting to recover request data...');
          // Intentar obtener de localStorage
          const storedRequests = localStorage.getItem('tutoring-requests');
          if (storedRequests) {
            const allRequests = JSON.parse(storedRequests);
            // Buscar una request completada con este tutor
            const matchingRequest = allRequests.find((req: any) => 
              req.tutorId === tutorData.id && 
              req.status === 'completed' && 
              req.studentId === user?.id
            );
            console.log('Found matching request:', matchingRequest);
            if (matchingRequest) {
              setRequestData(matchingRequest);
            }
          }
        }
      } catch (error) {
        console.error('Error loading missing data:', error);
      } finally {
        setLoadingTutorData(false);
      }
    };

    loadMissingData();
  }, [tutorData, requestData, user?.id]);

  // Verificar que tenemos los datos necesarios
  if (!requestData || !tutorData) {
    console.log('=== REVIEW PAGE: Missing data ===');
    console.log('Request received:', request);
    console.log('Tutor received:', tutor);
    console.log('RequestData state:', requestData);
    console.log('TutorData state:', tutorData);
    
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            {loadingTutorData ? (
              <>
                <Loader2 className="size-12 animate-spin mx-auto mb-4 text-blue-600" />
                <h3 className="text-lg mb-2">Cargando información...</h3>
                <p className="text-gray-600 mb-4">
                  Obteniendo datos del tutor y la clase
                </p>
              </>
            ) : (
              <>
                <AlertCircle className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg mb-2">Información incompleta</h3>
                <p className="text-gray-600 mb-4">
                  No se pudo cargar la información de la clase
                </p>
                <div className="text-xs font-mono text-red-600 mb-4 p-2 bg-red-50 rounded">
                  <p>Debug Info:</p>
                  <p>Request: {requestData ? '✅ Present' : '❌ Missing'}</p>
                  <p>Tutor: {tutorData ? '✅ Present' : '❌ Missing'}</p>
                  <p>Request ID: {requestData?.id || 'N/A'}</p>
                  <p>Tutor ID: {tutorData?.id || 'N/A'}</p>
                  <p>Tutor Name: {tutorData?.name || 'N/A'}</p>
                </div>
              </>
            )}
            <Button onClick={() => onNavigate('requests')}>
              Volver a mis clases
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Log de datos recibidos para debug
  console.log('=== REVIEW PAGE: Data received ===');
  console.log('Request:', request);
  console.log('Tutor:', tutor);
  console.log('RequestData:', requestData);
  console.log('TutorData:', tutorData);
  console.log('Current user:', user);

  const handleSubmitReview = async () => {
    console.log('=== STARTING handleSubmitReview ===');
    
    if (!user || !rating) {
      console.log('❌ Missing user or rating:', { user: !!user, rating });
      setError('Faltan datos necesarios para enviar la reseña');
      return;
    }

    if (!requestData || !tutorData) {
      console.log('❌ Missing requestData or tutorData:', { requestData: !!requestData, tutorData: !!tutorData });
      setError('Faltan datos de la clase o el tutor');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('=== All data validated, proceeding ===');
      console.log('User ID:', user.id);
      console.log('Rating:', rating);
      console.log('Comment:', comment.trim());
      console.log('Request ID:', requestData.id);
      console.log('Tutor ID:', tutorData.id);

      const reviewData = {
        requestId: requestData.id,
        studentId: user.id,
        tutorId: tutorData.id,
        rating,
        comment: comment.trim() || undefined,
      };
      
      console.log('=== Calling reviewsService.createReview ===');
      console.log('Data to send:', reviewData);
      
      const createdReview = await reviewsService.createReview(reviewData);
      console.log('✅ Review created successfully:', createdReview);
      
      console.log('=== Setting success state ===');
      setSuccess(true);
      console.log('✅ Success state set');
      
      // Forzar actualización de estadísticas después de crear la review
      console.log('🔄 Triggering stats refresh after review creation');
      setTimeout(() => {
        // Recargar la página principal para actualizar las estadísticas
        window.dispatchEvent(new CustomEvent('refresh-stats'));
      }, 1000);
      
    } catch (err) {
      console.error('❌ Error in handleSubmitReview:', err);
      
      if (err instanceof Error) {
        console.error('Error details:', {
          message: err.message,
          stack: err.stack
        });
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al enviar la reseña';
      setError(errorMessage);
      
      // Mostrar alert para debug inmediato
      alert(`❌ Error: ${errorMessage}`);
      
    } finally {
      setLoading(false);
      console.log('=== handleSubmitReview finished ===');
    }
  };

  const StarRating = ({ currentRating, onRate, onHover, onLeave }: {
    currentRating: number;
    onRate: (rating: number) => void;
    onHover: (rating: number) => void;
    onLeave: () => void;
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate(star)}
          onMouseEnter={() => onHover(star)}
          onMouseLeave={onLeave}
          className="transition-colors"
        >
          <Star 
            className={`size-8 ${
              (hoverRating || currentRating) >= star 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`} 
          />
        </button>
      ))}
    </div>
  );

  const getRatingText = (rating: number): string => {
    switch (rating) {
      case 1: return 'Muy malo';
      case 2: return 'Malo';
      case 3: return 'Regular';
      case 4: return 'Bueno';
      case 5: return 'Excelente';
      default: return '';
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="size-8 text-green-600" />
            </div>
            
            <h2 className="text-xl mb-2">¡Reseña enviada!</h2>
            <p className="text-gray-600 mb-6">
              Tu reseña ha sido enviada y ayudará a otros estudiantes. ¡Gracias por tu feedback!
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium mb-2">Resumen de tu reseña:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span>Calificación:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        className={`size-4 ${
                          rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">({getRatingText(rating)})</span>
                </div>
                {comment && (
                  <div>
                    <span className="font-medium">Comentario:</span>
                    <p className="text-gray-600 mt-1">{comment}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => onNavigate('requests')}>
                Ver mis clases
              </Button>
              <Button onClick={() => onNavigate('search')}>
                Buscar más tutores
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 w-full overflow-x-hidden">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('requests')}>
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl">Calificar tutor</h1>
            <p className="text-gray-600">Comparte tu experiencia con otros estudiantes</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDebugMode(!debugMode)}
            className="text-xs"
          >
            <Bug className="size-3 mr-1" />
            Debug
          </Button>
        </div>

        {/* Debug Panel */}
        {debugMode && (
          <Card className="border-dashed border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-orange-800">Panel de Debug - Firebase</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs font-mono text-orange-700">
                <p><strong>Usuario:</strong> {user?.id} ({user?.name})</p>
                <p><strong>Tutor:</strong> {tutorData?.id} ({tutorData?.name})</p>
                <p><strong>Request:</strong> {requestData?.id}</p>
                <p><strong>Rating:</strong> {rating}/5</p>
                <p><strong>Comentario:</strong> {comment.length} caracteres</p>
                <p><strong>Firebase Status:</strong> {navigator.onLine ? '🟢 Online' : '🔴 Offline'}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testFirebaseConnection}
                  className="text-xs"
                >
                  Probar Firebase
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testFullReviewProcess}
                  className="text-xs"
                >
                  Test Completo
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={async () => {
                    try {
                      console.log('Testing reviewsService.createReview directly...');
                      const testReview = await reviewsService.createReview({
                        requestId: request.id,
                        studentId: user.id,
                        tutorId: tutor.id,
                        rating: 5,
                        comment: 'Test desde servicio directo'
                      });
                      console.log('✅ Review service test successful:', testReview);
                      alert('✅ Servicio de reviews funciona correctamente');
                    } catch (error) {
                      console.error('❌ Review service test failed:', error);
                      alert('❌ Error en servicio: ' + (error instanceof Error ? error.message : 'Error desconocido'));
                    }
                  }}
                  className="text-xs"
                >
                  Test Servicio
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={async () => {
                    try {
                      console.log('Testing DIRECT Firebase write...');
                      const directRef = ref(database, `reviews/${Date.now()}`);
                      const directData = {
                        id: Date.now().toString(),
                        requestId: request.id,
                        studentId: user.id,
                        tutorId: tutor.id,
                        rating: 5,
                        comment: 'DIRECT write test',
                        createdAt: new Date().toISOString()
                      };
                      
                      await set(directRef, directData);
                      console.log('✅ DIRECT write successful!');
                      
                      // Verificar inmediatamente
                      const verifySnap = await get(directRef);
                      if (verifySnap.exists()) {
                        console.log('✅ DIRECT verify successful:', verifySnap.val());
                        alert('✅ Escritura directa a Firebase exitosa!');
                      } else {
                        alert('❌ Escritura directa falló en verificación');
                      }
                    } catch (error) {
                      console.error('❌ DIRECT write failed:', error);
                      alert('❌ Error escritura directa: ' + (error instanceof Error ? error.message : 'Error desconocido'));
                    }
                  }}
                  className="text-xs"
                >
                  Write Directo
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={async () => {
                    try {
                      console.log('=== TESTING WITH HARDCODED DATA ===');
                      
                      // Crear datos de prueba con IDs hardcoded que sabemos que existen
                      const testReviewData = {
                        requestId: 'test-request-id',
                        studentId: 'test-student-id', 
                        tutorId: 'test-tutor-id',
                        rating: 5,
                        comment: 'Test review with hardcoded data'
                      };
                      
                      console.log('Calling reviewsService.createReview with test data:', testReviewData);
                      
                      const result = await reviewsService.createReview(testReviewData);
                      console.log('✅ Hardcoded test successful:', result);
                      alert('✅ Test con datos hardcoded exitoso!');
                      
                    } catch (error) {
                      console.error('❌ Hardcoded test failed:', error);
                      alert('❌ Error en test hardcoded: ' + (error instanceof Error ? error.message : 'Error desconocido'));
                    }
                  }}
                  className="text-xs"
                >
                  Test Hardcoded
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={async () => {
                    try {
                      console.log('=== TESTING WITH CURRENT FORM DATA ===');
                      
                      if (!rating) {
                        alert('❌ Por favor selecciona una calificación primero');
                        return;
                      }
                      
                      if (!user?.id || !request?.id || !tutor?.id) {
                        alert('❌ Faltan datos necesarios');
                        console.log('Missing data:', { 
                          userId: user?.id, 
                          requestId: request?.id, 
                          tutorId: tutor?.id 
                        });
                        return;
                      }
                      
                      const testData = {
                        requestId: request.id,
                        studentId: user.id,
                        tutorId: tutor.id,
                        rating: rating,
                        comment: comment.trim() || 'Test comment from debug panel'
                      };
                      
                      console.log('Testing with current form data:', testData);
                      
                      const result = await reviewsService.createReview(testData);
                      console.log('✅ Form data test successful:', result);
                      alert('✅ Test con datos del formulario exitoso! La reseña se guardó.');
                      
                      // Si llega aquí, el problema no está en el servicio
                      // Vamos a actualizar el estado de éxito
                      setSuccess(true);
                      
                    } catch (error) {
                      console.error('❌ Form data test failed:', error);
                      alert('❌ Error en test de formulario: ' + (error instanceof Error ? error.message : 'Error desconocido'));
                    }
                  }}
                  className="text-xs"
                >
                  Test Formulario
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={async () => {
                    const debugInfo = {
                      'Firebase Config': database.app.options,
                      'User Auth': user,
                      'Request Data': request,
                      'Tutor Data': tutor,
                      'Current Rating': rating,
                      'Current Comment': comment
                    };
                    console.log('=== DEBUG INFO ===', debugInfo);
                    console.table([
                      { Field: 'User ID', Value: user?.id },
                      { Field: 'Tutor ID', Value: tutor?.id },
                      { Field: 'Request ID', Value: request?.id },
                      { Field: 'Rating', Value: rating },
                      { Field: 'Comment Length', Value: comment.length }
                    ]);
                  }}
                  className="text-xs"
                >
                  Debug Console
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Session Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumen de la clase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <Avatar className="size-16">
                <AvatarImage src={tutor.avatar} />
                <AvatarFallback>
                  {tutor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="font-medium">{tutor.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="size-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{tutor.rating}</span>
                  <span className="text-sm text-gray-500">({tutor.totalReviews} reseñas)</span>
                </div>
                
                {tutor.location && (
                  <div className="flex items-center gap-1 mt-2">
                    <MapPin className="size-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{tutor.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-blue-600" />
                  <div>
                    <p className="font-medium">Materia</p>
                    <p className="text-gray-600">{request.subject}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-green-600" />
                  <div>
                    <p className="font-medium">Duración</p>
                    <p className="text-gray-600">{request.duration} minutos</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="size-4 text-purple-600" />
                  <div>
                    <p className="font-medium">Costo</p>
                    <p className="text-gray-600">{formatPriceCOP(request.hourlyRate)}/hora</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  <strong>Descripción de la clase:</strong> {request.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Form */}
        <Card>
          <CardHeader>
            <CardTitle>Tu calificación</CardTitle>
            <CardDescription>
              Ayuda a otros estudiantes compartiendo tu experiencia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>
                  {error}
                  <details className="mt-2 text-xs">
                    <summary className="cursor-pointer">Ver detalles técnicos</summary>
                    <div className="mt-2 bg-red-50 p-2 rounded text-xs font-mono">
                      <p>Usuario ID: {user?.id}</p>
                      <p>Tutor ID: {tutor?.id}</p>
                      <p>Request ID: {request?.id}</p>
                      <p>Rating: {rating}</p>
                      <p>Comentario: {comment ? `"${comment.substring(0, 50)}..."` : 'Sin comentario'}</p>
                    </div>
                  </details>
                </AlertDescription>
              </Alert>
            )}

            {/* Star Rating */}
            <div className="space-y-3">
              <Label>¿Cómo calificas esta clase?</Label>
              <div className="flex items-center gap-4">
                <StarRating
                  currentRating={rating}
                  onRate={setRating}
                  onHover={setHoverRating}
                  onLeave={() => setHoverRating(0)}
                />
                {(rating || hoverRating) > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{rating || hoverRating}/5</span>
                    <span className="text-gray-600">- {getRatingText(hoverRating || rating)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment">Comentario (opcional)</Label>
              <Textarea
                id="comment"
                placeholder="Cuéntanos sobre tu experiencia: ¿Qué te gustó? ¿El tutor fue claro? ¿Recomendarías sus clases?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Máximo 500 caracteres</span>
                <span>{comment.length}/500</span>
              </div>
            </div>

            {/* Rating Guidelines */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Guía de calificaciones</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="size-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span>Excelente - Superó mis expectativas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1,2,3,4].map(i => (
                      <Star key={i} className="size-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    <Star className="size-3 text-gray-300" />
                  </div>
                  <span>Bueno - Cumplió con mis expectativas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1,2,3].map(i => (
                      <Star key={i} className="size-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    {[4,5].map(i => (
                      <Star key={i} className="size-3 text-gray-300" />
                    ))}
                  </div>
                  <span>Regular - Algunos problemas menores</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onNavigate('requests')}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmitReview} 
                disabled={loading || !rating}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Enviando reseña...
                  </>
                ) : (
                  <>
                    <Star className="size-4 mr-2" />
                    Enviar reseña
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Tu reseña será pública y ayudará a otros estudiantes a encontrar buenos tutores
            </p>
          </CardContent>
        </Card>
      </div>
  );
}
