import React, { useState } from 'react';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';

interface SurveyFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
}

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="mb-8 p-4 border rounded-lg">
    <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b pb-2">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const Question = ({ question, options, name, onChange }: { question: string, options: string[], name: string, onChange: (value: string) => void }) => (
  <div>
    <Label className="font-medium">{question}</Label>
    <RadioGroup name={name} onValueChange={onChange} className="mt-2 space-y-1">
      {options.map(option => (
        <div key={option} className="flex items-center space-x-2">
          <RadioGroupItem value={option} id={`${name}-${option}`} />
          <Label htmlFor={`${name}-${option}`} className="font-normal">{option}</Label>
        </div>
      ))}
      {options.map(option => {
        const id = `${name}-${option.replace(/\s+/g, '-')}`;
        return (
          <Label key={option} htmlFor={id} className="flex items-center space-x-3 p-3 rounded-md border border-transparent hover:bg-gray-100 cursor-pointer transition-colors">
            <RadioGroupItem value={option} id={id} />
            <span className="font-normal text-sm">{option}</span>
          </Label>
        );
      })}
    </RadioGroup>
  </div>
);

export function SurveyForm({ onSubmit, onClose }: SurveyFormProps) {
  const [formData, setFormData] = useState({});

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full flex flex-col overflow-hidden">
        {/* --- Encabezado del Modal --- */}
        <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-center">Encuesta de Usabilidad y Experiencia</h2>
            <p className="text-center text-gray-500">Tus respuestas nos ayudan a mejorar TutorApp.</p>
        </div>

        {/* --- Área de Contenido con Scroll --- */}
        <ScrollArea className="grow p-6">
          <Section title="Sección 1 — Datos Generales">
            <Question
              question="¿Con qué frecuencia utilizas aplicaciones educativas o de tutorías?"
              name="frequency"
              options={['Nunca', 'Ocasionalmente', 'Semanalmente', 'Diario']}
              onChange={(val) => handleChange('frequency', val)}
            />
            <Question
              question="¿Qué rol estás evaluando en la app?"
              name="role"
              options={['Estudiante', 'Tutor', 'Ambos', 'Solo estoy probando la interfaz']}
              onChange={(val) => handleChange('role', val)}
            />
          </Section>

          <Section title="Sección 2 — Navegación y Usabilidad">
            <Question
              question="¿Qué tan fácil fue navegar por la aplicación?"
              name="navigation"
              options={['Muy fácil', 'Fácil', 'Regular', 'Difícil', 'Muy difícil']}
              onChange={(val) => handleChange('navigation', val)}
            />
            <Question
              question="¿Pudiste encontrar lo que buscabas sin complicaciones?"
              name="findability"
              options={['Sí, sin problema', 'Sí, pero con dificultades', 'No, me costó bastante', 'No lo encontré']}
              onChange={(val) => handleChange('findability', val)}
            />
            <Question
              question="¿Cómo calificarías la velocidad y fluidez de la aplicación?"
              name="speed"
              options={['Excelente', 'Buena', 'Aceptable', 'Lenta', 'Muy lenta']}
              onChange={(val) => handleChange('speed', val)}
            />
          </Section>

            <Section title="Sección 3 — Diseño y Apariencia">
                <Question
                    question="¿Cómo describirías la estética general de la aplicación?"
                    name="aesthetics"
                    options={['Muy agradable', 'Agradable', 'Neutral', 'Poco atractiva', 'Para nada atractiva']}
                    onChange={(val) => handleChange('aesthetics', val)}
                />
                <Question
                    question="¿Los colores, iconos y tipografías son adecuados y fáciles de entender?"
                    name="ui-clarity"
                    options={['Totalmente adecuados', 'Adecuados', 'Neutros', 'Poco adecuados', 'Confusos o incómodos visualmente']}
                    onChange={(val) => handleChange('ui-clarity', val)}
                />
                <Question
                    question="¿La aplicación se ve bien en tu dispositivo móvil (responsive)?"
                    name="responsive"
                    options={['Sí, perfectamente', 'Sí, con detalles menores', 'Regular', 'Tiene varios errores de diseño', 'No se adapta bien']}
                    onChange={(val) => handleChange('responsive', val)}
                />
            </Section>

            <Section title="Sección 4 — Funcionalidades Principales">
                <Question
                    question="¿Cómo fue tu experiencia usando la búsqueda de tutores?"
                    name="search-experience"
                    options={['Muy buena', 'Buena', 'Aceptable', 'Deficiente', 'No la probé']}
                    onChange={(val) => handleChange('search-experience', val)}
                />
            </Section>

            <Section title="Sección 5 — Comunicación y Flujo de Tutorías">
                <Question
                    question="¿Qué tal te funcionó el sistema de chat en tiempo real?"
                    name="chat-experience"
                    options={['Excelente', 'Bueno', 'Aceptable', 'Deficiente', 'No lo probé']}
                    onChange={(val) => handleChange('chat-experience', val)}
                />
                <Question
                    question="¿El proceso para solicitar una tutoría te pareció claro y fácil de seguir?"
                    name="request-flow"
                    options={['Muy claro', 'Claro', 'Regular', 'Poco claro', 'Confuso']}
                    onChange={(val) => handleChange('request-flow', val)}
                />
            </Section>

            <Section title="Sección 6 — Módulos de Inteligencia Artificial">
                <Question
                    question="¿Qué tan útiles te parecieron los módulos de IA (Smart Matching, Predictor, Planner)?"
                    name="ai-usefulness"
                    options={['Muy útiles', 'Bastante útiles', 'Moderadamente útiles', 'Poco útiles', 'No útiles', 'No los probé']}
                    onChange={(val) => handleChange('ai-usefulness', val)}
                />
            </Section>

            <Section title="Sección Final — Observaciones">
                <Label htmlFor="observations" className="font-medium">Por favor, comparte tus observaciones generales (positivas, negativas, bugs, sugerencias, etc.):</Label>
                <Textarea
                    id="observations"
                    name="observations"
                    placeholder="Escribe tus comentarios aquí..."
                    className="mt-2"
                    rows={5}
                    onChange={(e) => handleChange('observations', e.target.value)}
                />
            </Section>
        </ScrollArea>

        {/* --- Pie de Página Fijo con Botones --- */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Enviar Encuesta</Button>
        </div>
      </form>
    </div>
  );
}