import React from 'react';
import { SurveyForm } from '../components/SurveyForm';
import { Page } from '../App';

interface SurveyPageProps {
  onNavigate: (page: Page | string) => void;
}

export function SurveyPage({ onNavigate }: SurveyPageProps) {

  const handleSurveySubmit = (newResponse: any) => {
    console.log("Nueva respuesta de encuesta guardada:", newResponse);

    // Guardar en localStorage
    const storedData = localStorage.getItem('surveyData');
    const currentData = storedData ? JSON.parse(storedData) : [];

    // Asignar un ID simple
    const newId = currentData.length > 0 ? Math.max(...currentData.map((d: any) => d.id)) + 1 : 1;
    const responseWithId = {
      ...newResponse,
      id: newId,
      timestamp: new Date().toISOString()
    };

    const updatedData = [...currentData, responseWithId];
    localStorage.setItem('surveyData', JSON.stringify(updatedData));

    // Navegar de vuelta a la página de estadísticas
    onNavigate('survey-analytics');
  };

  return (
    <SurveyForm onSubmit={handleSurveySubmit} onClose={() => onNavigate('survey-analytics')} />
  );
}