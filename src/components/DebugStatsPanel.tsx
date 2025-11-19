// Panel de debug para estadísticas - Solo visible para usuarios maestros
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { tutoringService } from '../services/tutoring';
import { usersService } from '../services/users';
import { createTutorsFromApp } from '../utils/create-tutors';
import { getDatabase, ref, get, set } from 'firebase/database';
import { database } from '../firebase';

interface DebugStatsPanelProps {
  user: any;
  userStats: any;
  setUserStats: (stats: any) => void;
  loadData: () => Promise<void>;
  createTestRequest: (status: 'pending' | 'accepted' | 'completed') => Promise<boolean>;
}

export function DebugStatsPanel({ 
  user, 
  userStats, 
  setUserStats, 
  loadData, 
  createTestRequest 
}: DebugStatsPanelProps) {
  const { isTestUser } = useAuth();
  const [creatingTutors, setCreatingTutors] = useState(false);
  const [updatingTutors, setUpdatingTutors] = useState(false);

  // Solo mostrar si es usuario maestro
  if (!isTestUser(user)) {
    return null;
  }

  const handleCreateTutors = async () => {
    try {
      setCreatingTutors(true);
      await createTutorsFromApp(50);
      alert('¡50 tutores creados exitosamente!');
      loadData(); // Recargar datos
    } catch (error) {
      console.error('Error creando tutores:', error);
      alert('Error creando tutores: ' + error.message);
    } finally {
      setCreatingTutors(false);
    }
  };

  const updateExistingTutors = async () => {
    
    // Perfiles especializados
    const perfilesEspecializados = [
      {
        nombre: "Matemático",
        materias: ["Matemáticas", "Cálculo", "Álgebra", "Geometría", "Estadística", "Trigonometría"],
        educacion: ["Licenciado en Matemáticas", "Doctor en Matemáticas", "Magíster en Matemáticas"]
      },
      {
        nombre: "Físico",
        materias: ["Física", "Física Cuántica", "Mecánica", "Termodinámica", "Óptica", "Electricidad"],
        educacion: ["Físico", "Doctor en Física", "Ingeniero Físico"]
      },
      {
        nombre: "Químico",
        materias: ["Química", "Química Orgánica", "Química Inorgánica", "Bioquímica", "Fisicoquímica"],
        educacion: ["Químico", "Doctor en Química", "Ingeniero Químico"]
      },
      {
        nombre: "Biólogo",
        materias: ["Biología", "Biología Molecular", "Genética", "Anatomía", "Fisiología", "Ecología"],
        educacion: ["Biólogo", "Doctor en Biología", "Microbiólogo"]
      },
      {
        nombre: "Programador",
        materias: ["Programación", "Python", "Java", "JavaScript", "React", "Node.js", "Algoritmos"],
        educacion: ["Ingeniero de Sistemas", "Ingeniero de Software", "Desarrollador Full Stack"]
      },
      {
        nombre: "Lingüista",
        materias: ["Inglés", "Francés", "Alemán", "Literatura", "Gramática", "Conversación"],
        educacion: ["Licenciado en Idiomas", "Filólogo", "Traductor"]
      },
      {
        nombre: "Historiador",
        materias: ["Historia", "Geografía", "Ciencias Sociales", "Filosofía", "Política"],
        educacion: ["Historiador", "Licenciado en Historia", "Antropólogo"]
      },
      {
        nombre: "Psicólogo",
        materias: ["Psicología", "Psicología Educativa", "Desarrollo Humano", "Terapia"],
        educacion: ["Psicólogo", "Psicólogo Educativo", "Terapeuta"]
      },
      {
        nombre: "Economista",
        materias: ["Economía", "Contabilidad", "Finanzas", "Administración", "Estadística"],
        educacion: ["Economista", "Contador", "Administrador de Empresas"]
      },
      {
        nombre: "Médico",
        materias: ["Medicina", "Anatomía", "Fisiología", "Biología", "Química"],
        educacion: ["Médico", "Doctor en Medicina", "Especialista Médico"]
      },
      {
        nombre: "Arquitecto",
        materias: ["Arquitectura", "Dibujo Técnico", "Matemáticas", "Física", "Diseño"],
        educacion: ["Arquitecto", "Diseñador", "Ingeniero Civil"]
      },
      {
        nombre: "Preparador de Exámenes",
        materias: ["Preparación ICFES", "Preparación TOEFL", "Preparación IELTS", "SAT", "GRE", "GMAT"],
        educacion: ["Licenciado en Educación", "Magíster en Educación", "Especialista en Evaluación"]
      }
    ];

    console.log('🔄 Iniciando actualización de tutores en Firebase...');
    
    // Obtener todos los usuarios
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      console.log('❌ No se encontraron usuarios en Firebase');
      return;
    }
    
    const users = snapshot.val();
    const tutorIds = Object.keys(users);
    
    console.log(`📊 Encontrados ${tutorIds.length} usuarios en Firebase`);
    
    let updatedCount = 0;
    
    for (const userId of tutorIds) {
      const userData = users[userId];
      
      // Solo actualizar si es un tutor (tiene subjects)
      if (userData.subjects && userData.subjects.length > 0) {
        console.log(`\n👤 Actualizando tutor: ${userData.name}`);
        console.log(`   Materias actuales: ${userData.subjects.join(', ')}`);
        
        // Seleccionar un perfil especializado
        const perfilSeleccionado = perfilesEspecializados[Math.floor(Math.random() * perfilesEspecializados.length)];
        
        // Seleccionar 2-3 materias del perfil
        const numMaterias = Math.floor(Math.random() * 2) + 2; // 2-3 materias
        const materiasSeleccionadas = [];
        const materiasDisponibles = [...perfilSeleccionado.materias];
        
        for (let j = 0; j < numMaterias; j++) {
          const materiaIndex = Math.floor(Math.random() * materiasDisponibles.length);
          materiasSeleccionadas.push(materiasDisponibles[materiaIndex]);
          materiasDisponibles.splice(materiaIndex, 1);
        }
        
        // Seleccionar educación coherente con el perfil
        const nivelEducacion = perfilSeleccionado.educacion[Math.floor(Math.random() * perfilSeleccionado.educacion.length)];
        
        // Actualizar el tutor
        const updatedTutor = {
          ...userData,
          subjects: materiasSeleccionadas,
          education: nivelEducacion,
          bio: `${nivelEducacion} con ${userData.experience || 'experiencia docente'}. Especialista en ${perfilSeleccionado.nombre.toLowerCase()} con enfoque en ${materiasSeleccionadas.slice(0, 2).join(' y ')}. ${Math.random() > 0.5 ? 'Experiencia en educación virtual y presencial.' : 'Enfoque personalizado según las necesidades del estudiante.'}`,
          updatedAt: new Date().toISOString()
        };
        
        // Guardar en Firebase
        const tutorRef = ref(database, `users/${userId}`);
        await set(tutorRef, updatedTutor);
        
        console.log(`   ✅ Nuevas materias: ${materiasSeleccionadas.join(', ')}`);
        console.log(`   ✅ Nueva educación: ${nivelEducacion}`);
        console.log(`   ✅ Perfil: ${perfilSeleccionado.nombre}`);
        
        updatedCount++;
      }
    }
    
    console.log(`\n🎯 Actualización completada: ${updatedCount} tutores actualizados con perfiles especializados`);
  };

  const handleUpdateTutors = async () => {
    try {
      setUpdatingTutors(true);
      await updateExistingTutors();
      alert('¡Tutores existentes actualizados con perfiles especializados!');
      loadData(); // Recargar datos
    } catch (error) {
      console.error('Error actualizando tutores:', error);
      alert('Error actualizando tutores: ' + error.message);
    } finally {
      setUpdatingTutors(false);
    }
  };

  return (
    <div className="mb-4 p-3 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          USUARIO MAESTRO
        </Badge>
        <p className="text-sm text-gray-600">🧪 Panel de pruebas - Contadores de estadísticas</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => createTestRequest('pending')}
        >
          ➕ Crear pendiente
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => createTestRequest('accepted')}
        >
          ✅ Crear aceptada
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => createTestRequest('completed')}
        >
          🎯 Crear completada
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => {
            localStorage.removeItem('tutoring-requests');
            loadData();
            console.log('🗑️ Todas las solicitudes eliminadas');
            alert('Datos limpiados exitosamente!');
          }}
        >
          🗑️ Limpiar
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => {
            const data = localStorage.getItem('tutoring-requests');
            console.log('📋 Datos actuales completos:', data ? JSON.parse(data) : 'Sin datos');
            if (data) {
              const requests = JSON.parse(data);
              console.log('📊 Resumen de solicitudes:');
              requests.forEach((req: any, index: number) => {
                console.log(`  ${index + 1}. ID: ${req.id}, Status: ${req.status}, Student: ${req.studentId}, Tutor: ${req.tutorId}, Created: ${req.createdAt}`);
              });
              alert(`Encontradas ${requests.length} solicitudes. Ver consola para detalles.`);
            } else {
              alert('No hay datos en localStorage');
            }
          }}
        >
          📋 Ver datos
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={async () => {
            console.log('🔄 FORZANDO RECALCULO DE ESTADÍSTICAS');
            const stats = await usersService.getUserStats(user?.id || '');
            setUserStats(stats);
            console.log('📊 Estadísticas recalculadas:', stats);
            alert('Estadísticas recalculadas! Ver consola para detalles.');
          }}
        >
          🔄 Recalcular
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => {
            console.log('📊 ESTADO ACTUAL userStats:', userStats);
            const mode = user?.currentMode || 'unknown';
            if (mode === 'student') {
              console.log('👨‍🎓 ESTUDIANTE - Valores actuales:', {
                'Total solicitudes': userStats?.totalRequests || 0,
                'Sesiones completadas': userStats?.completedSessions || 0,
                'Clases este mes': userStats?.monthlyStats?.sessions || 0
              });
            } else {
              console.log('👨‍🏫 TUTOR - Valores actuales:', {
                'Estudiantes activos': userStats?.activeStudents || 0,
                'Clases este mes': userStats?.monthlyStats?.sessions || 0,
                'Rating promedio': userStats?.averageRating || 0,
                'Ganancias del mes': userStats?.monthlyStats?.earnings || 0
              });
            }
            alert(`Estado userStats mostrado en consola para modo ${mode}`);
          }}
        >
          📊 Estado actual
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleCreateTutors}
          disabled={creatingTutors}
          className="bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
        >
          {creatingTutors ? '⏳ Creando...' : '👥 Crear 50 tutores'}
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleUpdateTutors}
          disabled={updatingTutors}
          className="bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
        >
          {updatingTutors ? '⏳ Actualizando...' : '🔄 Actualizar tutores existentes'}
        </Button>
      </div>
    </div>
  );
}
