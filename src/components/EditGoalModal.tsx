// Modal para editar metas de estudio
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Slider } from './ui/slider';
import { CalendarIcon, Save, X } from 'lucide-react';

interface StudyGoal {
  id: string;
  subject: string;
  target: string;
  deadline: Date;
  progress: number;
  priority: 'high' | 'medium' | 'low';
}

interface EditGoalModalProps {
  goal: StudyGoal | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedGoal: StudyGoal) => void;
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

export function EditGoalModal({ goal, isOpen, onClose, onSave }: EditGoalModalProps) {
  const [formData, setFormData] = useState<StudyGoal>({
    id: '',
    subject: '',
    target: '',
    deadline: new Date(),
    progress: 0,
    priority: 'medium'
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (goal && isOpen) {
      setFormData({ ...goal });
      setErrors({});
    }
  }, [goal, isOpen]);

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

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    onSave(formData);
    onClose();
  };

  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  const updateField = (field: keyof StudyGoal, value: any) => {
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

  if (!goal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📝 Editar Meta de Estudio
          </DialogTitle>
          <DialogDescription>
            Modifica los detalles de tu meta de estudio para mantenerla actualizada con tus objetivos académicos.
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

          {/* Progreso */}
          <div className="space-y-2">
            <Label>Progreso actual: {formData.progress}%</Label>
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
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
