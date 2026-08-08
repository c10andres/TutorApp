// Script para generar interacciones de usuarios basadas en respuestas de encuesta
// Ejecutar con: npx ts-node scripts/generate-interactions-from-survey.ts

import { surveyInteractionsGenerator } from '../src/services/survey-interactions-generator';
import { allSurveyResponses } from '../src/data/survey-responses';
import { ref, get } from 'firebase/database';
import { database } from '../src/firebase';

/**
 * Genera interacciones para todos los usuarios de la encuesta
 */
async function generateAllInteractions() {
  console.log('🚀 Iniciando generación de interacciones desde respuestas de encuesta...');
  console.log(`📊 Total de respuestas de encuesta: ${allSurveyResponses.length}`);

  try {
    // Obtener usuarios existentes de Firebase
    const usersRef = ref(database, 'users');
    const usersSnapshot = await get(usersRef);
    
    let userIds: string[] = [];
    if (usersSnapshot.exists()) {
      userIds = Object.keys(usersSnapshot.val());
      console.log(`👥 Usuarios encontrados en Firebase: ${userIds.length}`);
    } else {
      console.log('⚠️ No se encontraron usuarios en Firebase. Creando IDs simulados...');
      // Crear IDs simulados para los usuarios de la encuesta
      userIds = Array.from({ length: allSurveyResponses.length }, (_, i) => `user-${i + 1}`);
    }

    // Asegurar que tenemos suficientes IDs de usuario
    while (userIds.length < allSurveyResponses.length) {
      userIds.push(`user-${userIds.length + 1}`);
    }

    console.log(`\n📝 Generando interacciones para ${allSurveyResponses.length} usuarios...\n`);

    let successCount = 0;
    let errorCount = 0;

    // Generar interacciones para cada respuesta de encuesta
    for (let i = 0; i < allSurveyResponses.length; i++) {
      const userId = userIds[i];
      const surveyResponse = allSurveyResponses[i];

      try {
        console.log(`[${i + 1}/${allSurveyResponses.length}] Generando interacciones para usuario ${userId}...`);
        
        await surveyInteractionsGenerator.generateInteractionsForUser(
          userId,
          surveyResponse,
          30 // Últimos 30 días
        );

        successCount++;
        
        if ((i + 1) % 10 === 0) {
          console.log(`✅ Progreso: ${i + 1}/${allSurveyResponses.length} usuarios procesados\n`);
        }
      } catch (error) {
        console.error(`❌ Error generando interacciones para usuario ${userId}:`, error);
        errorCount++;
      }

      // Pequeña pausa para no sobrecargar Firebase
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Generación completada!');
    console.log(`✅ Usuarios procesados exitosamente: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log('='.repeat(50));
    
    console.log('\n📊 Las interacciones generadas reflejan las respuestas de la encuesta:');
    console.log('   - Q1: Frecuencia de uso → app_opened, session_started, etc.');
    console.log('   - Q3, Q4: Navegación → page_viewed, navigation_click, etc.');
    console.log('   - Q5: Velocidad → page_load_time, error_occurred, etc.');
    console.log('   - Q9-Q11: Búsqueda → tutor_search_performed, tutor_profile_viewed, etc.');
    console.log('   - Q12: Chat → chat_message_sent, chat_opened, etc.');
    console.log('   - Q13: Solicitudes → tutoring_request_created, etc.');
    console.log('   - Q14: Pagos → payment_completed, etc.');
    console.log('   - Q15: IA → ai_feature_used, etc.');
    console.log('\n💡 Puedes verificar las interacciones en Firebase Realtime Database:');
    console.log('   - Ruta: user_interactions/');
    console.log('   - Resúmenes: user_interaction_summaries/');

  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateAllInteractions()
    .then(() => {
      console.log('\n✨ Proceso finalizado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el proceso:', error);
      process.exit(1);
    });
}

export { generateAllInteractions };
