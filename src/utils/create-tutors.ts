// Utilidad para crear tutores desde la aplicación web
import { ref, set } from 'firebase/database';
import { database } from '../firebase';

// Arrays de datos para generar tutores diversos
const nombres = [
  "María", "Carlos", "Ana", "David", "Lucía", "Santiago", "Valentina", "Andrés", "Camila", "Diego",
  "Isabella", "Sebastián", "Sofía", "Nicolás", "Valeria", "Alejandro", "Gabriela", "Mateo", "Natalia", "Daniel",
  "Mariana", "Felipe", "Alejandra", "Juan", "Paola", "Cristian", "Laura", "Jorge", "Andrea", "Ricardo",
  "Carolina", "Fernando", "Diana", "Luis", "Claudia", "Roberto", "Patricia", "Eduardo", "Mónica", "Héctor",
  "Gloria", "Alberto", "Rosa", "Miguel", "Carmen", "Antonio", "Teresa", "Francisco", "Elena", "Manuel"
];

const apellidos = [
  "Rodríguez", "García", "López", "Martínez", "González", "Pérez", "Sánchez", "Ramírez", "Cruz", "Flores",
  "Rivera", "Gómez", "Díaz", "Reyes", "Morales", "Jiménez", "Álvarez", "Ruiz", "Herrera", "Medina",
  "Vargas", "Castillo", "Romero", "Moreno", "Muñoz", "Delgado", "Ortiz", "Vega", "Rojas", "Mendoza",
  "Guerrero", "Ramos", "Herrera", "Jiménez", "Espinoza", "Silva", "Torres", "Vásquez", "Castro", "Molina"
];

const ciudades = [
  { name: "Bogotá, D.C.", region: "Cundinamarca" },
  { name: "Medellín, Antioquia", region: "Antioquia" },
  { name: "Cali, Valle del Cauca", region: "Valle del Cauca" },
  { name: "Barranquilla, Atlántico", region: "Atlántico" },
  { name: "Cartagena, Bolívar", region: "Bolívar" },
  { name: "Bucaramanga, Santander", region: "Santander" },
  { name: "Pereira, Risaralda", region: "Risaralda" },
  { name: "Santa Marta, Magdalena", region: "Magdalena" },
  { name: "Ibagué, Tolima", region: "Tolima" },
  { name: "Manizales, Caldas", region: "Caldas" },
  { name: "Villavicencio, Meta", region: "Meta" },
  { name: "Pasto, Nariño", region: "Nariño" },
  { name: "Armenia, Quindío", region: "Quindío" },
  { name: "Neiva, Huila", region: "Huila" },
  { name: "Cúcuta, Norte de Santander", region: "Norte de Santander" }
];

const materias = [
  // Matemáticas y Estadística
  { name: "Matemáticas", category: "Básicas" },
  { name: "Álgebra", category: "Básicas" },
  { name: "Geometría", category: "Básicas" },
  { name: "Trigonometría", category: "Básicas" },
  { name: "Cálculo Diferencial", category: "Básicas" },
  { name: "Cálculo Integral", category: "Básicas" },
  { name: "Estadística", category: "Básicas" },
  { name: "Probabilidad", category: "Básicas" },
  
  // Ciencias Naturales
  { name: "Física", category: "Ciencias" },
  { name: "Química", category: "Ciencias" },
  { name: "Biología", category: "Ciencias" },
  { name: "Química Orgánica", category: "Ciencias" },
  { name: "Química Inorgánica", category: "Ciencias" },
  { name: "Termodinámica", category: "Ciencias" },
  
  // Programación y Tecnología
  { name: "Programación", category: "Tecnología" },
  { name: "Python", category: "Tecnología" },
  { name: "Java", category: "Tecnología" },
  { name: "JavaScript", category: "Tecnología" },
  { name: "C++", category: "Tecnología" },
  { name: "Algoritmos", category: "Tecnología" },
  { name: "Estructuras de Datos", category: "Tecnología" },
  { name: "Base de Datos", category: "Tecnología" },
  
  // Idiomas
  { name: "Inglés", category: "Idiomas" },
  { name: "Francés", category: "Idiomas" },
  { name: "Alemán", category: "Idiomas" },
  { name: "Italiano", category: "Idiomas" },
  { name: "Portugués", category: "Idiomas" },
  
  // Humanidades
  { name: "Historia", category: "Humanidades" },
  { name: "Geografía", category: "Humanidades" },
  { name: "Literatura", category: "Humanidades" },
  { name: "Filosofía", category: "Humanidades" },
  { name: "Psicología", category: "Humanidades" },
  { name: "Sociología", category: "Humanidades" },
  
  // Especializadas
  { name: "Economía", category: "Especializadas" },
  { name: "Contabilidad", category: "Especializadas" },
  { name: "Derecho", category: "Especializadas" },
  { name: "Medicina", category: "Especializadas" },
  { name: "Arquitectura", category: "Especializadas" },
  { name: "Diseño Gráfico", category: "Especializadas" }
];

const nivelesEducacion = [
  "Licenciado en Matemáticas",
  "Ingeniero de Sistemas",
  "Físico",
  "Químico",
  "Psicólogo",
  "Economista",
  "Abogado",
  "Médico",
  "Arquitecto",
  "Licenciado en Literatura",
  "Historiador",
  "Filósofo",
  "Ingeniero Químico",
  "Ingeniero Civil",
  "Ingeniero Industrial",
  "Psicólogo Educativo",
  "Especialista en Educación",
  "Magíster en Ciencias",
  "Doctor en Física",
  "Doctor en Matemáticas"
];

const experiencias = [
  "5 años enseñando en universidades",
  "8 años de experiencia docente",
  "10 años enseñando de forma privada",
  "6 años en colegios y universidades",
  "7 años especializado en tutorías",
  "12 años de experiencia académica",
  "4 años enseñando online",
  "9 años en educación superior",
  "11 años de experiencia docente",
  "3 años especializado en preparación de exámenes"
];

// Función para generar un tutor aleatorio
function generateRandomTutor(index: number) {
  const nombre = nombres[Math.floor(Math.random() * nombres.length)];
  const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
  const ciudad = ciudades[Math.floor(Math.random() * ciudades.length)];
  
  // Seleccionar 3-5 materias aleatorias
  const numMaterias = Math.floor(Math.random() * 3) + 3; // 3-5 materias
  const materiasSeleccionadas = [];
  const materiasDisponibles = [...materias];
  
  for (let i = 0; i < numMaterias; i++) {
    const materiaIndex = Math.floor(Math.random() * materiasDisponibles.length);
    materiasSeleccionadas.push(materiasDisponibles[materiaIndex].name);
    materiasDisponibles.splice(materiaIndex, 1); // Evitar duplicados
  }
  
  const nivelEducacion = nivelesEducacion[Math.floor(Math.random() * nivelesEducacion.length)];
  const experiencia = experiencias[Math.floor(Math.random() * experiencias.length)];
  
  // Generar tarifa por hora (30,000 - 80,000 COP)
  const tarifaBase = 30000 + Math.floor(Math.random() * 50000);
  
  // Generar rating (4.0 - 5.0)
  const rating = 4.0 + Math.random();
  
  // Generar número de reseñas (5 - 50)
  const numResenas = 5 + Math.floor(Math.random() * 46);
  
  // Generar sesiones totales (20 - 200)
  const sesionesTotales = 20 + Math.floor(Math.random() * 181);
  
  // Generar ganancias totales
  const gananciasTotales = Math.floor(sesionesTotales * tarifaBase * 0.8); // 80% de la tarifa por sesión
  
  // Generar disponibilidad aleatoria
  const diasSemana = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const disponibilidad = {};
  
  diasSemana.forEach(dia => {
    if (Math.random() > 0.3) { // 70% de probabilidad de estar disponible
      const horarios = [];
      const numHorarios = Math.floor(Math.random() * 2) + 1; // 1-2 horarios por día
      
      for (let i = 0; i < numHorarios; i++) {
        const horaInicio = 8 + Math.floor(Math.random() * 12); // 8:00 - 20:00
        const horaFin = horaInicio + 2 + Math.floor(Math.random() * 4); // 2-6 horas de duración
        horarios.push({
          start: `${horaInicio.toString().padStart(2, '0')}:00`,
          end: `${Math.min(horaFin, 22).toString().padStart(2, '0')}:00`
        });
      }
      disponibilidad[dia] = horarios;
    }
  });
  
  // Generar fechas
  const fechaCreacion = new Date(2024, Math.floor(Math.random() * 10), Math.floor(Math.random() * 28) + 1);
  const fechaActualizacion = new Date();
  const ultimaActividad = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)); // Última semana
  
  return {
    uid: `tutor_${(index + 1).toString().padStart(3, '0')}`,
    email: `${nombre.toLowerCase()}.${apellido.toLowerCase()}${index + 1}@tutorapp.com`,
    name: `${nombre} ${apellido}`,
    displayName: `${nombre} ${apellido}`,
    phoneNumber: `+57300${Math.floor(Math.random() * 9000000) + 1000000}`,
    photoURL: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000000)}?w=150&h=150&fit=crop&crop=face`,
    avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000000)}?w=150&h=150&fit=crop&crop=face`,
    location: ciudad.name,
    bio: `${nivelEducacion} con ${experiencia}. Especialista en ${materiasSeleccionadas.slice(0, 2).join(' y ')}. ${Math.random() > 0.5 ? 'Experiencia en educación virtual y presencial.' : 'Enfoque personalizado según las necesidades del estudiante.'}`,
    
    isStudent: false,
    isTutor: true,
    currentMode: 'tutor' as const,
    
    subjects: materiasSeleccionadas,
    hourlyRate: tarifaBase,
    rating: Math.round(rating * 10) / 10,
    totalReviews: numResenas,
    totalSessions: sesionesTotales,
    education: nivelEducacion,
    experience: experiencia,
    certificates: [
      `https://storage.googleapis.com/udconecta-4bfff.appspot.com/certificates/cert_${index + 1}.pdf`
    ],
    availability: disponibilidad,
    
    totalEarned: gananciasTotales,
    
    createdAt: fechaCreacion,
    updatedAt: fechaActualizacion,
    lastActive: ultimaActividad
  };
}

// Función para crear tutores desde la aplicación
export async function createTutorsFromApp(count: number = 50): Promise<void> {
  try {
    console.log(`🚀 Creando ${count} tutores desde la aplicación...`);
    
    const tutores = [];
    
    // Generar tutores
    for (let i = 0; i < count; i++) {
      const tutor = generateRandomTutor(i);
      tutores.push(tutor);
    }
    
    // Crear tutores en Firebase
    console.log("📚 Creando tutores en Firebase...");
    for (const tutor of tutores) {
      const tutorRef = ref(database, `users/${tutor.uid}`);
      await set(tutorRef, {
        ...tutor,
        createdAt: tutor.createdAt.toISOString(),
        updatedAt: tutor.updatedAt.toISOString(),
        lastActive: tutor.lastActive.toISOString()
      });
      console.log(`✅ Tutor ${tutor.uid} creado: ${tutor.name} (${tutor.email})`);
    }
    
    console.log(`🎉 ¡${count} tutores creados exitosamente!`);
    
  } catch (error) {
    console.error("❌ Error creando tutores:", error);
    throw error;
  }
}
