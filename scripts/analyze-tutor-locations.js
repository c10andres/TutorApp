// Script para analizar las ubicaciones de los tutores
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getDatabase, ref, get } = require('firebase/database');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA2cv8Zv9ahULWaPrqvfDeRUo2M5Je5BTU",
  authDomain: "udconecta-4bfff.firebaseapp.com",
  databaseURL: "https://udconecta-4bfff-default-rtdb.firebaseio.com/",
  projectId: "udconecta-4bfff",
  storageBucket: "udconecta-4bfff.appspot.com",
  messagingSenderId: "50299431698",
  appId: "1:50299431698:android:092a716de008e36c1b61cb"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

async function analyzeTutorLocations() {
  try {
    console.log("🔍 Analizando ubicaciones de tutores...");
    console.log("=" * 60);
    
    // Autenticarse como estudiante
    console.log("🔐 Autenticando como estudiante...");
    const studentCredential = await signInWithEmailAndPassword(auth, "juan.perez@estudiante.com", "password123");
    const studentId = studentCredential.user.uid;
    console.log("✅ Estudiante autenticado:", studentId);
    
    // Obtener todos los usuarios
    console.log("\n👨‍🏫 Obteniendo todos los usuarios...");
    const usersRef = ref(database, 'users');
    const usersSnapshot = await get(usersRef);
    const allUsers = usersSnapshot.val();
    
    const tutors = [];
    const locationCounts = {};
    const uniqueLocations = new Set();
    
    Object.keys(allUsers).forEach(userId => {
      const userData = allUsers[userId];
      if (userData.isTutor && userData.subjects && userData.subjects.length > 0 && userId !== studentId) {
        tutors.push({
          id: userId,
          name: userData.name,
          email: userData.email,
          location: userData.location,
          subjects: userData.subjects,
          hourlyRate: userData.hourlyRate
        });
        
        // Analizar ubicaciones
        if (userData.location) {
          const location = userData.location;
          uniqueLocations.add(location);
          locationCounts[location] = (locationCounts[location] || 0) + 1;
        }
      }
    });
    
    console.log(`📊 Tutores encontrados: ${tutors.length}`);
    
    // ANÁLISIS DETALLADO DE UBICACIONES
    console.log("\n" + "=" * 50);
    console.log("🔍 ANÁLISIS DETALLADO DE UBICACIONES");
    console.log("=" * 50);
    
    console.log("📍 UBICACIONES EXACTAS EN LOS PERFILES:");
    const sortedLocations = Array.from(uniqueLocations).sort();
    sortedLocations.forEach((location, index) => {
      const count = locationCounts[location];
      console.log(`   ${index + 1}. "${location}" (${count} tutor${count > 1 ? 'es' : ''})`);
    });
    
    console.log(`\n📊 Total de ubicaciones únicas: ${uniqueLocations.size}`);
    
    // ANÁLISIS POR TUTOR
    console.log("\n" + "=" * 50);
    console.log("🔍 ANÁLISIS POR TUTOR");
    console.log("=" * 50);
    
    tutors.forEach((tutor, index) => {
      console.log(`\n${index + 1}. ${tutor.name}`);
      console.log(`   📧 Email: ${tutor.email}`);
      console.log(`   📍 Ubicación: "${tutor.location || 'No especificada'}"`);
      console.log(`   📚 Materias: ${tutor.subjects ? tutor.subjects.length : 0} materias`);
      console.log(`   💰 Tarifa: $${tutor.hourlyRate ? tutor.hourlyRate.toLocaleString() : 'No especificada'}/hora`);
    });
    
    // COMPARACIÓN CON FILTROS ACTUALES
    console.log("\n" + "=" * 50);
    console.log("🔍 COMPARACIÓN CON FILTROS ACTUALES");
    console.log("=" * 50);
    
    const currentFilterCities = [
      'Bogotá D.C.', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena',
      'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué', 'Pasto',
      'Manizales', 'Neiva', 'Villavicencio', 'Armenia', 'Popayán',
      'Montería', 'Valledupar', 'Sincelejo', 'Tunja', 'Florencia'
    ];
    
    console.log("📱 CIUDADES EN FILTROS ACTUALES:");
    currentFilterCities.forEach((city, index) => {
      console.log(`   ${index + 1}. "${city}"`);
    });
    
    console.log("\n🔍 COINCIDENCIAS:");
    const matches = [];
    const mismatches = [];
    
    currentFilterCities.forEach(filterCity => {
      const found = sortedLocations.find(profileLocation => 
        profileLocation.toLowerCase().includes(filterCity.toLowerCase()) ||
        filterCity.toLowerCase().includes(profileLocation.toLowerCase())
      );
      
      if (found) {
        matches.push({ filter: filterCity, profile: found });
      } else {
        mismatches.push(filterCity);
      }
    });
    
    console.log("✅ COINCIDENCIAS ENCONTRADAS:");
    matches.forEach(match => {
      console.log(`   • Filtro: "${match.filter}" → Perfil: "${match.profile}"`);
    });
    
    console.log("\n❌ CIUDADES SIN COINCIDENCIA:");
    mismatches.forEach(city => {
      console.log(`   • "${city}"`);
    });
    
    console.log("\n📍 CIUDADES EN PERFILES SIN FILTRO:");
    const profileCitiesWithoutFilter = sortedLocations.filter(profileLocation => {
      return !currentFilterCities.some(filterCity => 
        profileLocation.toLowerCase().includes(filterCity.toLowerCase()) ||
        filterCity.toLowerCase().includes(profileLocation.toLowerCase())
      );
    });
    
    profileCitiesWithoutFilter.forEach(city => {
      console.log(`   • "${city}"`);
    });
    
    // RECOMENDACIONES
    console.log("\n" + "=" * 50);
    console.log("🔍 RECOMENDACIONES PARA FILTROS");
    console.log("=" * 50);
    
    console.log("✅ CIUDADES RECOMENDADAS PARA FILTROS:");
    const recommendedCities = [];
    
    // Agregar ciudades que coinciden
    matches.forEach(match => {
      recommendedCities.push(match.profile);
    });
    
    // Agregar ciudades de perfiles que no están en filtros
    profileCitiesWithoutFilter.forEach(city => {
      recommendedCities.push(city);
    });
    
    // Ordenar y eliminar duplicados
    const finalRecommendedCities = [...new Set(recommendedCities)].sort();
    
    finalRecommendedCities.forEach((city, index) => {
      console.log(`   ${index + 1}. "${city}"`);
    });
    
    console.log(`\n📊 Total de ciudades recomendadas: ${finalRecommendedCities.length}`);
    
    // CÓDIGO ACTUALIZADO
    console.log("\n" + "=" * 50);
    console.log("🔧 CÓDIGO ACTUALIZADO RECOMENDADO");
    console.log("=" * 50);
    
    console.log("📱 SearchPage.tsx - Ciudades actualizadas:");
    console.log("   const cities = [");
    finalRecommendedCities.forEach((city, index) => {
      const isLast = index === finalRecommendedCities.length - 1;
      console.log(`     '${city}'${isLast ? '' : ','}`);
    });
    console.log("   ];");
    
    // Cerrar sesión
    await auth.signOut();
    
  } catch (error) {
    console.error("❌ Error en el análisis:", error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  analyzeTutorLocations()
    .then(() => {
      console.log("✅ Análisis de ubicaciones completado exitosamente");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error en el análisis:", error);
      process.exit(1);
    });
}

module.exports = { analyzeTutorLocations };
