// Modal para añadir nuevas metas de estudio
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Slider } from './ui/slider';
import { CalendarIcon, Plus, X, Target } from 'lucide-react';

interface StudyGoal {
  id: string;
  subject: string;
  target: string;
  deadline: Date;
  progress: number;
  priority: 'high' | 'medium' | 'low';
}

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newGoal: Omit<StudyGoal, 'id'>) => void;
}

const COLOMBIAN_SUBJECTS = [
  'Matemáticas',
  'Física',
  'Química',
  'Biología',
  'Historia',
  'Geografía',
  'Español',
  'Literatura',
  'Inglés',
  'Francés',
  'Filosofía',
  'Ciencias Sociales',
  'Educación Física',
  'Artes',
  'Música',
  'Tecnología',
  'Informática',
  'Programación',
  'Economía',
  'Contabilidad',
  'Administración',
  'Derecho',
  'Psicología',
  'Sociología',
  'Antropología',
  'Estadística',
  'Cálculo',
  'Álgebra',
  'Geometría',
  'Trigonometría'
];

const GOAL_TEMPLATES = [
  'Aprobar el examen final',
  'Mejorar las calificaciones',
  'Dominar los conceptos básicos',
  'Completar todos los ejercicios del libro',
  'Prepararse para la universidad',
  'Ganar confianza en la materia',
  'Entender la teoría y práctica',
  'Superar las dificultades actuales'
];

export function AddGoalModal({ isOpen, onClose, onAdd }: AddGoalModalProps) {
  const [formData, setFormData] = useState({
    subject: '',
    target: '',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días desde hoy
    progress: 0,
    priority: 'medium' as const
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'La materia es obligatoria';
    }

    if (!formData.target.trim()) {
      newErrors.target = 'El objetivo es obligatorio';
    } else if (formData.target.length < 10) {
      newErrors.target = 'El objetivo debe tener al menos 10 caracteres';
    }

    if (formData.deadline <= new Date()) {
      newErrors.deadline = 'La fecha límite debe ser futura';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (!validateForm()) {
      return;
    }

    onAdd(formData);
    
    // Resetear formulario
    setFormData({
      subject: '',
      target: '',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      progress: 0,
      priority: 'medium'
    });
    setErrors({});
    onClose();
  };

  const handleCancel = () => {
    // Resetear formulario
    setFormData({
      subject: '',
      target: '',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      progress: 0,
      priority: 'medium'
    });
    setErrors({});
    onClose();
  };

  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const useTemplate = (template: string) => {
    updateField('target', template);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Crear Nueva Meta de Estudio
          </DialogTitle>
          <DialogDescription>
            Define una nueva meta académica con objetivos claros, fechas límite y seguimiento de progreso.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Materia */}
          <div className="space-y-2">
            <Label htmlFor="subject">Materia *</Label>
            <Select
              value={formData.subject}
              onValueChange={(value) => updateField('subject', value)}
            >
              <SelectTrigger className={errors.subject ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecciona una materia..." />
              </SelectTrigger>
              <SelectContent>
                {COLOMBIAN_SUBJECTS.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.subject && (
              <p className="text-sm text-red-600">{errors.subject}</p>
            )}
          </div>

          {/* Plantillas de objetivos */}
          <div className="space-y-2">
            <Label>Plantillas de objetivos</Label>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_TEMPLATES.slice(0, 4).map((template) => (
                <Button
                  key={template}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-2 px-2"
                  onClick={() => useTemplate(template)}
                >
                  {template}
                </Button>
              ))}
            </div>
          </div>

          {/* Objetivo */}
          <div className="space-y-2">
            <Label htmlFor="target">Objetivo *</Label>
            <Textarea
              id="target"
              value={formData.target}
              onChange={(e) => updateField('target', e.target.value)}
              placeholder="Describe tu objetivo de estudio..."
              className={`resize-none ${errors.target ? 'border-red-500' : ''}`}
              rows={3}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formData.target.length} caracteres</span>
              <span>Mínimo 10 caracteres</span>
            </div>
            {errors.target && (
              <p className="text-sm text-red-600">{errors.target}</p>
            )}
          </div>

          {/* Fecha límite */}
          <div className="space-y-2">
            <Label>Fecha límite *</Label>
            <Popover open={showCalendar} onOpenChange={setShowCalendar}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    errors.deadline ? 'border-red-500' : ''
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatDate(formData.deadline)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.deadline}
                  onSelect={(date) => {
                    if (date) {
                      updateField('deadline', date);
                      setShowCalendar(false);
                    }
                  }}
                  disabled={(date) => date <= new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.deadline && (
              <p className="text-sm text-red-600">{errors.deadline}</p>
            )}
          </div>

          {/* Progreso inicial */}
          <div className="space-y-2">
            <Label>Progreso inicial: {formData.progress}%</Label>
            <Slider
              value={[formData.progress]}
              onValueChange={(value) => updateField('progress', value[0])}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Prioridad */}
          <div className="space-y-2">
            <Label>Prioridad</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: 'high' | 'medium' | 'low') => updateField('priority', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">🔴 Alta</SelectItem>
                <SelectItem value="medium">🟡 Media</SelectItem>
                <SelectItem value="low">🟢 Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleAdd} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Crear meta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
