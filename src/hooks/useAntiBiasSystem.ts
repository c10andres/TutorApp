import { useState, useEffect, useMemo } from 'react';

interface CommunityAnswer {
  id: string;
  authorId: string;
  authorReputation: number;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  isBestAnswer: boolean;
}

interface AntiBiasConfig {
  hideVotesHours: number;        // Horas para ocultar votos
  randomShuffleCount: number;    // Número de respuestas a mezclar
  rotationNewContributorPercent: number; // % de slots para nuevos
  rotationEstablishedPercent: number;   // % de slots para establecidos
}

const DEFAULT_CONFIG: AntiBiasConfig = {
  hideVotesHours: 24,
  randomShuffleCount: 10,
  rotationNewContributorPercent: 0.3,
  rotationEstablishedPercent: 0.7
};

/**
 * Hook para sistema anti-sesgo en respuestas comunitarias
 * Implementa: ocultamiento temporal, orden aleatorio, rotación de visibilidad
 */
export const useAntiBiasSystem = (
  answers: CommunityAnswer[],
  config: Partial<AntiBiasConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const [shuffledAnswers, setShuffledAnswers] = useState<CommunityAnswer[]>([]);

  // Memoizar cálculo de si se deben ocultar votos
  const shouldHideVotes = (answer: CommunityAnswer): boolean => {
    const now = new Date();
    const createdAt = new Date(answer.createdAt);
    const hoursSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceCreated < finalConfig.hideVotesHours;
  };

  // Mezclar primeros N elementos de forma aleatoria
  const shuffleFirstN = (array: CommunityAnswer[], n: number): CommunityAnswer[] => {
    const firstN = array.slice(0, n);
    const rest = array.slice(n);
    
    // Shuffle Fisher-Yates
    const shuffled = [...firstN];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return [...shuffled, ...rest];
  };

  // Aplicar rotación de visibilidad (30% nuevos, 70% establecidos)
  const applyVisibilityRotation = (answers: CommunityAnswer[]): CommunityAnswer[] => {
    const newContributors = answers.filter(a => a.authorReputation < 100);
    const established = answers.filter(a => a.authorReputation >= 100);
    
    const maxNewContributors = Math.floor(answers.length * finalConfig.rotationNewContributorPercent);
    const maxEstablished = Math.floor(answers.length * finalConfig.rotationEstablishedPercent);
    
    const newSlice = newContributors.slice(0, maxNewContributors);
    const establishedSlice = established.slice(0, maxEstablished);
    
    // Combinar y mezclar
    const combined = [...newSlice, ...establishedSlice];
    return shuffleFirstN(combined, finalConfig.randomShuffleCount);
  };

  // Procesar respuestas con anti-sesgo
  useEffect(() => {
    if (!answers || answers.length === 0) {
      setShuffledAnswers([]);
      return;
    }

    // 1. Separar por reputación
    const processed = answers.map(answer => ({
      ...answer,
      shouldHideVotes: shouldHideVotes(answer)
    }));

    // 2. Aplicar rotación de visibilidad
    const withRotation = applyVisibilityRotation(processed);

    // 3. Mezclar primeros N elementos
    const shuffled = shuffleFirstN(withRotation, finalConfig.randomShuffleCount);

    setShuffledAnswers(shuffled);
  }, [answers, finalConfig.hideVotesHours]);

  // Calcular estadísticas de diversidad
  const diversityStats = useMemo(() => {
    if (!shuffledAnswers.length) {
      return {
        uniqueAuthors: 0,
        diversityIndex: 0,
        newContributors: 0,
        establishedContributors: 0
      };
    }

    const uniqueAuthors = new Set(shuffledAnswers.map(a => a.authorId)).size;
    const diversityIndex = (uniqueAuthors / shuffledAnswers.length) * 100;
    
    const newContributors = shuffledAnswers.filter(a => a.authorReputation < 100).length;
    const establishedContributors = shuffledAnswers.filter(a => a.authorReputation >= 100).length;

    return {
      uniqueAuthors,
      diversityIndex: Math.round(diversityIndex * 10) / 10,
      newContributors,
      establishedContributors
    };
  }, [shuffledAnswers]);

  return {
    processedAnswers: shuffledAnswers,
    shouldHideVotes,
    diversityStats,
    config: finalConfig
  };
};

/**
 * Hook complementario para resúmenes neutrales con IA
 */
export const useNeutralSummaries = (answers: CommunityAnswer[]) => {
  const [summaries, setSummaries] = useState<Record<string, string>>({});

  // Generar resumen neutral para una respuesta
  const generateSummary = (answer: CommunityAnswer): string => {
    // Lógica simple de NLP: primera oración + palabras clave
    const sentences = answer.content.split(/[.!?]/);
    const firstSentence = sentences[0] || answer.content.substring(0, 150);
    
    // Extraer palabras clave (simple)
    const words = answer.content.toLowerCase().match(/\b\w{5,}\b/g) || [];
    const keywords = [...new Set(words)].slice(0, 3).join(', ');
    
    return `${firstSentence}... [Palabras clave: ${keywords}]`;
  };

  useEffect(() => {
    if (!answers || answers.length === 0) return;

    const newSummaries: Record<string, string> = {};
    answers.forEach(answer => {
      newSummaries[answer.id] = generateSummary(answer);
    });

    setSummaries(newSummaries);
  }, [answers]);

  return summaries;
};
