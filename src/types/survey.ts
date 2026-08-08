// Tipos para la Encuesta de Usabilidad de TutorApp

/**
 * Respuestas de la encuesta de usabilidad
 * Corresponde a las preguntas Q1-Q16 de la encuesta
 */
export interface SurveyResponse {
  // Q1: Frecuencia de uso
  Q1_FrecuenciaUso: 
    | 'Todos los días'
    | 'Varias veces a la semana'
    | 'Una vez a la semana'
    | 'Varias veces al mes'
    | 'Rara vez'
    | 'Esta es la primera vez';

  // Q2: Rol
  Q2_Rol: 'Estudiante' | 'Tutor' | 'Padre/Madre' | 'Otro';

  // Q3: Navegación fácil
  Q3_NavegacionFacil: 
    | 'Muy fácil'
    | 'Fácil'
    | 'Ni fácil ni difícil'
    | 'Difícil'
    | 'Muy difícil';

  // Q4: Encontrar lo buscado
  Q4_EncontrarLoBuscado: 
    | 'Siempre'
    | 'Casi siempre'
    | 'A veces'
    | 'Rara vez'
    | 'Nunca';

  // Q5: Velocidad
  Q5_Velocidad: 
    | 'Muy rápida'
    | 'Rápida'
    | 'Adecuada'
    | 'Lenta'
    | 'Muy lenta';

  // Q6: Estética
  Q6_Estetica: 
    | 'Muy atractiva'
    | 'Atractiva'
    | 'Neutral'
    | 'Poco atractiva'
    | 'Nada atractiva';

  // Q7: Colores y tipografía
  Q7_ColoresTipografia: 
    | 'Excelente'
    | 'Buena'
    | 'Neutral'
    | 'Pobre'
    | 'Muy pobre';

  // Q8: Responsive
  Q8_Responsive: 
    | 'Muy buena'
    | 'Buena'
    | 'Regular'
    | 'Mala'
    | 'No lo he probado en otros dispositivos';

  // Q9: Búsqueda de tutores
  Q9_BusquedaTutores: 
    | 'Muy fácil'
    | 'Fácil'
    | 'Regular'
    | 'Difícil'
    | 'Muy difícil'
    | 'No he usado la búsqueda';

  // Q10: Filtros útiles
  Q10_FiltrosUtiles: 
    | 'Muy útiles'
    | 'Útiles'
    | 'Neutral'
    | 'Poco útiles'
    | 'Nada útiles'
    | 'No he usado los filtros';

  // Q11: Claridad perfil tutor
  Q11_ClaridadPerfilTutor: 
    | 'Muy clara'
    | 'Clara'
    | 'Neutral'
    | 'Confusa'
    | 'Muy confusa'
    | 'No he visto perfiles de tutor';

  // Q12: Chat experiencia
  Q12_ChatExperiencia: 
    | 'Muy buena'
    | 'Buena'
    | 'Neutral'
    | 'Mala'
    | 'Muy mala'
    | 'No he usado el chat';

  // Q13: Solicitud clara
  Q13_SolicitudClara: 
    | 'Muy clara'
    | 'Clara'
    | 'Neutral'
    | 'Confusa'
    | 'Muy confusa'
    | 'No he realizado solicitudes';

  // Q14: Pagos adecuados
  Q14_PagosAdecuados: 
    | 'Muy de acuerdo'
    | 'De acuerdo'
    | 'Neutral'
    | 'En desacuerdo'
    | 'Muy en desacuerdo'
    | 'No he realizado pagos';

  // Q15: IA utilidad
  Q15_IAUtilidad: 
    | 'Muy útil'
    | 'Útil'
    | 'Neutral'
    | 'Poco útil'
    | 'Nada útil'
    | 'No he utilizado la IA';

  // Q16: Observaciones (texto libre)
  Q16_Observaciones?: string;
}

/**
 * Respuesta de encuesta con ID de usuario
 */
export interface UserSurveyResponse extends SurveyResponse {
  userId: string;
  surveyDate: Date;
}

