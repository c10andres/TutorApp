// Exportaciones centralizadas de servicios ML
export { mlService } from './MLService';
export { smartMatchingML } from './SmartMatchingML';
export { academicPredictorML } from './AcademicPredictorML';
export { studyPlannerML } from './StudyPlannerML';
export { supportCenterML } from './SupportCenterML';

// Tipos exportados
export type { MLConfig, MLResult, TrainingData } from './MLService';
export type { MatchingPreferences, MLMatchingResult } from './SmartMatchingML';
export type { AcademicFeatures, PredictionResult, StudyPattern } from './AcademicPredictorML';
export type { StudySession, StudyPlan, StudyRecommendation, ProductivityAnalysis } from './StudyPlannerML';
export type { SupportTicket, AIAnalysis, ChatMessage, FAQItem } from './SupportCenterML';
