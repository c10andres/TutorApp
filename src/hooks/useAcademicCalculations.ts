// Hook para cálculos académicos
export const useAcademicCalculations = () => {
  
  /**
   * Calcula el promedio real de una materia basándose en:
   * 1. Sistema de cortes acumulativos (preferido)
   * 2. Valores directos en Firebase
   * 3. Conversión de porcentajes a escala 0-5
   */
  const calculateRealAverage = (subject: any): number => {
    // CASO 1: Tiene cortes - calcular promedio acumulado (soporta múltiples cortes con diferentes porcentajes)
    if (subject.cuts && subject.cuts.length > 0) {
      let accumulatedPoints = 0;
      let totalPercentage = 0;
      const cutDetails: string[] = [];
      
      for (const cut of subject.cuts) {
        if (cut.grade > 0 && cut.percentage > 0) {
          // Fórmula: Puntos acumulados = (nota del corte / 5) * porcentaje del corte
          // Ejemplo: Nota 4.0/5, porcentaje 30% → (4.0/5) × 30 = 24 puntos
          const cutPoints = (cut.grade / 5.0) * cut.percentage;
          accumulatedPoints += cutPoints;
          totalPercentage += cut.percentage;
          
          // Guardar detalles para log
          cutDetails.push(`Corte: ${cut.grade}/5.0 (${cut.percentage}%) = ${cutPoints.toFixed(2)} pts`);
        }
      }
      
      // Calcular el promedio final en escala 0-5
      let average = 0;
      if (totalPercentage > 0) {
        // Ejemplo: 24 puntos de 30% evaluado
        // Promedio como porcentaje: (24 / 30) × 100 = 80%
        const averagePercentage = (accumulatedPoints / totalPercentage) * 100;
        // Convertir a escala 0-5: 80% de 5.0 = 4.0
        average = (averagePercentage / 100) * 5;
      } else {
        // Sin porcentajes evaluados, usar acumulado directo
        average = accumulatedPoints * 5;
      }
      
      const result = Math.round(average * 10) / 10;
      console.log(`📊 ${subject.name} - Promedio: ${result}/5.0`);
      console.log(`   Detalles: ${cutDetails.join(' | ')}`);
      console.log(`   Total: ${accumulatedPoints.toFixed(2)} puntos de ${totalPercentage}% evaluado`);
      return result;
    }
    
    // CASO 2: Sin cortes pero tiene currentAverage o finalGrade
    const rawGrade = subject.currentAverage || subject.finalGrade || 0;
    
    // CASO 3: Si el valor está en escala 0-100 (porcentaje), convertirlo a 0-5
    if (rawGrade > 5) {
      const convertedGrade = (rawGrade / 100) * 5;
      const result = Math.round(convertedGrade * 10) / 10;
      console.log(`📊 ${subject.name} - Convertido de ${rawGrade}% a ${result} en escala 0-5`);
      return result;
    }
    
    // CASO 4: Valor directo en escala 0-5
    const result = Math.round(rawGrade * 10) / 10;
    console.log(`📊 ${subject.name} - Valor directo: ${result}`);
    return result;
  };
  
  /**
   * Determina el nivel de riesgo basándose en el promedio actual
   */
  const determineRiskLevel = (currentGrade: number): 'low' | 'medium' | 'high' => {
    if (currentGrade < 1.0) {
      return 'high'; // CRÍTICO
    } else if (currentGrade < 2.0) {
      return 'high'; // ALTO
    } else if (currentGrade < 3.0) {
      return 'medium'; // MEDIO
    } else {
      return 'low'; // BAJO
    }
  };
  
  return {
    calculateRealAverage,
    determineRiskLevel
  };
};

