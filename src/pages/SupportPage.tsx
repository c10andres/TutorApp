import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { supportService } from '../services/support';
import { formatDate } from '../utils/formatters';
import { 
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  Search,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Bot,
  User,
  Send,
  FileText,
  Download,
  Star,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  ArrowRight,
  BookOpen,
  CreditCard,
  Settings,
  Shield,
  Zap
} from 'lucide-react';

interface SupportPageProps {
  onNavigate: (page: string, data?: any) => void;
}

// Categorías de soporte
const SUPPORT_CATEGORIES = [
  {
    id: 'tutoring',
    name: 'Tutorías',
    icon: BookOpen,
    description: 'Cómo solicitar, programar y gestionar clases',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'payments',
    name: 'Pagos',
    icon: CreditCard,
    description: 'Métodos de pago, facturación y reembolsos',
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 'account',
    name: 'Cuenta',
    icon: Settings,
    description: 'Perfil, configuración y verificación',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    id: 'safety',
    name: 'Seguridad',
    icon: Shield,
    description: 'Reportes, políticas y seguridad',
    color: 'bg-red-100 text-red-600'
  },
  {
    id: 'technical',
    name: 'Técnico',
    icon: Zap,
    description: 'App, funciones y errores técnicos',
    color: 'bg-orange-100 text-orange-600'
  }
];

// FAQs por categoría
const FAQ_DATA = [
  {
    id: 'faq-1',
    category: 'tutoring',
    question: '¿Cómo solicito una tutoría?',
    answer: 'Puedes solicitar una tutoría navegando a la sección "Buscar Tutores", seleccionando un tutor que se ajuste a tus necesidades, y haciendo clic en "Solicitar Tutoría". Completa los detalles de tu clase y el tutor recibirá tu solicitud.'
  },
  {
    id: 'faq-2',
    category: 'payments',
    question: '¿Qué métodos de pago acepta la plataforma?',
    answer: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard), PSE, Nequi, Daviplata y transferencias bancarias. Todos los pagos se procesan de forma segura a través de nuestra plataforma.'
  },
  {
    id: 'faq-3',
    category: 'tutoring',
    question: '¿Puedo cancelar una clase programada?',
    answer: 'Sí, puedes cancelar una clase hasta 24 horas antes del horario programado sin penalización. Las cancelaciones con menos de 24 horas de anticipación pueden estar sujetas a cargos.'
  },
  {
    id: 'faq-4',
    category: 'account',
    question: '¿Cómo verifico mi cuenta de tutor?',
    answer: 'Para verificar tu cuenta como tutor, ve a "Mi Perfil" > "Configuración" y completa el proceso de verificación subiendo tu cédula, certificados académicos y cualquier documentación requerida.'
  },
  {
    id: 'faq-5',
    category: 'payments',
    question: '¿Cuándo recibo el pago como tutor?',
    answer: 'Los pagos se procesan automáticamente 24 horas después de que una clase se marca como completada. El dinero se transfiere a tu método de pago registrado.'
  }
];

export function SupportPage({ onNavigate }: SupportPageProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: '¡Hola! 👋 Soy el asistente virtual de TutorApp. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: ''
  });
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  // Filtrar FAQs basado en búsqueda y categoría
  const filteredFAQs = FAQ_DATA.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // Agregar mensaje del usuario
    const userMessage = {
      id: Date.now(),
      type: 'user' as const,
      message: newMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);

    // Simular respuesta del bot
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot' as const,
        message: 'Gracias por tu mensaje. He registrado tu consulta y un agente te responderá pronto. ¿Hay algo más en lo que pueda ayudarte?',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 1000);

    setNewMessage('');
  };

  const handleCreateTicket = async () => {
    try {
      await supportService.createTicket({
        ...ticketForm,
        userId: user?.id || '',
        status: 'open'
      });
      
      setShowTicketDialog(false);
      setTicketForm({ subject: '', category: '', priority: 'medium', description: '' });
      
      // Mostrar confirmación
      alert('Ticket creado exitosamente. Te responderemos pronto.');
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <HelpCircle className="size-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl mb-2">🆘 Centro de Ayuda y Soporte</h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Encuentra respuestas rápidas, chatea con nuestra IA de soporte o contacta nuestro equipo especializado. 
          Estamos aquí para resolver cualquier duda sobre la plataforma.
        </p>
      </div>

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faq">Preguntas Frecuentes</TabsTrigger>
          <TabsTrigger value="chat">Chat en Vivo</TabsTrigger>
          <TabsTrigger value="contact">Contactar Soporte</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6">
          {/* Buscador */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
              <Input
                placeholder="Buscar en preguntas frecuentes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Categorías */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="h-auto p-4 flex flex-col gap-2"
            >
              <HelpCircle className="size-6" />
              <span className="text-sm">Todas</span>
            </Button>
            {SUPPORT_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const count = FAQ_DATA.filter(faq => faq.category === category.id).length;
              return (
                <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <Button
                      variant={selectedCategory === category.id ? 'default' : 'ghost'}
                      onClick={() => setSelectedCategory(category.id)}
                      className="w-full h-auto p-0 flex flex-col gap-2 bg-transparent"
                    >
                      <div className={`p-3 rounded-lg ${category.color}`}>
                        <Icon className="size-6" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{category.name}</p>
                        <p className="text-xs text-gray-500">{count} preguntas</p>
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* FAQs */}
          <div className="space-y-4">
            {filteredFAQs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="size-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg mb-2">No se encontraron resultados</h3>
                  <p className="text-gray-600">
                    Intenta con otros términos de búsqueda o selecciona una categoría diferente.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredFAQs.map((faq) => (
                <Card key={faq.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      className="w-full p-6 text-left flex items-center justify-between"
                    >
                      <h3 className="font-medium pr-4">{faq.question}</h3>
                      {expandedFAQ === faq.id ? (
                        <ChevronDown className="size-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="size-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    
                    {expandedFAQ === faq.id && (
                      <div className="px-6 pb-6 border-t">
                        <div className="pt-4">
                          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                            <span className="text-sm text-gray-500">¿Te fue útil esta respuesta?</span>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <ThumbsUp className="size-4 mr-1" />
                                Sí
                              </Button>
                              <Button variant="ghost" size="sm">
                                <ThumbsDown className="size-4 mr-1" />
                                No
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="size-5 text-blue-600" />
                Chat con Asistente Virtual
              </CardTitle>
              <CardDescription>
                Obtén ayuda inmediata con nuestro asistente inteligente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mensajes */}
              <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        {message.type === 'bot' ? (
                          <Bot className="size-4" />
                        ) : (
                          <User className="size-4" />
                        )}
                        <span className="text-xs opacity-70">
                          {message.type === 'bot' ? 'Asistente' : 'Tú'}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input para mensaje */}
              <div className="flex gap-2">
                <Input
                  placeholder="Escribe tu mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage}>
                  <Send className="size-4" />
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                Para consultas complejas, considera crear un ticket de soporte
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Crear Ticket */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="size-5" />
                  Crear Ticket de Soporte
                </CardTitle>
                <CardDescription>
                  Para consultas específicas o problemas técnicos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowTicketDialog(true)}
                  className="w-full"
                >
                  Crear Nuevo Ticket
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Contacto Directo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="size-5" />
                  Contacto Directo
                </CardTitle>
                <CardDescription>
                  Para emergencias o consultas urgentes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="size-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Línea de Soporte</p>
                    <p className="text-sm text-gray-600">+57 (1) 234-5678</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Email de Soporte</p>
                    <p className="text-sm text-gray-600">soporte@tutorapp.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="size-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Horario de Atención</p>
                    <p className="text-sm text-gray-600">Lunes a Viernes: 8AM - 8PM</p>
                    <p className="text-sm text-gray-600">Sábados: 9AM - 5PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-5" />
                  Guías de Usuario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="ghost" className="w-full justify-start">
                  <Download className="size-4 mr-2" />
                  Guía para Estudiantes
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Download className="size-4 mr-2" />
                  Guía para Tutores
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Download className="size-4 mr-2" />
                  Manual de Pagos
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="size-5" />
                  Políticas y Términos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="size-4 mr-2" />
                  Términos de Servicio
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="size-4 mr-2" />
                  Política de Privacidad
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="size-4 mr-2" />
                  Código de Conducta
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="size-5" />
                  Tutoriales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="ghost" className="w-full justify-start">
                  <ArrowRight className="size-4 mr-2" />
                  Cómo solicitar una tutoría
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <ArrowRight className="size-4 mr-2" />
                  Configurar métodos de pago
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <ArrowRight className="size-4 mr-2" />
                  Usar el chat integrado
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para crear ticket */}
      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Ticket de Soporte</DialogTitle>
            <DialogDescription>
              Describe tu problema detalladamente para recibir la mejor ayuda posible
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="ticket-subject">Asunto</Label>
              <Input
                id="ticket-subject"
                placeholder="Resumen breve del problema"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ticket-category">Categoría</Label>
                <Select
                  value={ticketForm.category}
                  onValueChange={(value) => setTicketForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORT_CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="ticket-priority">Prioridad</Label>
                <Select
                  value={ticketForm.priority}
                  onValueChange={(value) => setTicketForm(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="ticket-description">Descripción detallada</Label>
              <Textarea
                id="ticket-description"
                placeholder="Describe tu problema paso a paso, incluyendo cualquier mensaje de error que hayas visto..."
                value={ticketForm.description}
                onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[120px]"
              />
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowTicketDialog(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleCreateTicket} className="flex-1">
              Crear Ticket
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
