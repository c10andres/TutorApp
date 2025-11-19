// Layout principal de la aplicación
import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { NotificationsDropdown } from './NotificationsDropdown';
import { FirebaseStatus } from './FirebaseStatus';
import { Bell, MessageCircle, Home, Search, User, Calendar, RefreshCw, CreditCard, TestTube, GraduationCap, FileText, Brain, BarChart3, CalendarCheck, HelpCircle } from 'lucide-react';
import { notificationsService } from '../services/notifications';

interface LayoutProps {
  children: ReactNode;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export function Layout({ children, currentPage = 'home', onNavigate }: LayoutProps) {
  const { user, signOut, switchMode, loading } = useAuth();

  const handleNavigation = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  const handleModeSwitch = async (checked: boolean) => {
    const newMode = checked ? 'tutor' : 'student';
    try {
      await switchMode(newMode);
    } catch (err) {
      console.error('Error switching mode:', err);
    }
  };

  const navigationItems = [
    { key: 'home', label: 'Inicio', icon: Home },
    { key: 'search', label: 'Buscar', icon: Search },
    { key: 'requests', label: 'Solicitudes', icon: Calendar },
    { key: 'chat', label: 'Chat', icon: MessageCircle },
    { key: 'smart-matching', label: 'Matching IA', icon: Brain },
    { key: 'academic-predictor', label: 'Predictor IA', icon: BarChart3 },
    { key: 'study-planner', label: 'Planificador IA', icon: CalendarCheck },
    { key: 'academic', label: 'Académico', icon: GraduationCap },
    { key: 'docs', label: 'Documentos', icon: FileText },
    { key: 'payments', label: 'Pagos', icon: CreditCard },
    { key: 'support', label: 'Soporte', icon: HelpCircle },
    { key: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl text-blue-600">TutorApp</h1>
            </div>

            {/* Mode Switch */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                <span className={`text-sm ${user?.currentMode === 'student' ? 'text-blue-600' : 'text-gray-500'}`}>
                  Estudiante
                </span>
                <Switch
                  checked={user?.currentMode === 'tutor'}
                  onCheckedChange={handleModeSwitch}
                  disabled={loading}
                />
                <span className={`text-sm ${user?.currentMode === 'tutor' ? 'text-green-600' : 'text-gray-500'}`}>
                  Tutor
                </span>
                {loading && <RefreshCw className="size-3 animate-spin text-gray-400" />}
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <FirebaseStatus />
              
              {/* Test notification button - temporary */}
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (user?.id) {
                    console.log('🧪 Creating test notification');
                    try {
                      await notificationsService.createNotification({
                        userId: user.id,
                        type: 'message',
                        title: '🎉 ¡Funciona!',
                        message: 'Esta es una notificación de prueba. El sistema está funcionando correctamente.',
                        read: false,
                        data: { test: true, timestamp: Date.now() }
                      });
                      console.log('✅ Test notification created successfully');
                    } catch (error) {
                      console.error('❌ Error creating test notification:', error);
                    }
                  }
                }}
                className="text-xs"
                title="Crear notificación de prueba"
              >
                <TestTube className="size-4" />
              </Button>
              
              <NotificationsDropdown onNavigate={onNavigate} />
              
              <div className="flex items-center gap-2">
                <Avatar className="size-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    Modo: {user?.currentMode === 'student' ? 'Estudiante' : 'Tutor'}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  Salir
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg sm:hidden">
        <div className="flex justify-around">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.key;
            
            return (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.key)}
                className={`flex flex-col items-center py-2 px-3 ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <Icon className="size-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Mode Switch */}
        <div className="border-t px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Modo actual:</span>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${user?.currentMode === 'student' ? 'text-blue-600' : 'text-gray-400'}`}>
                Estudiante
              </span>
              <Switch
                checked={user?.currentMode === 'tutor'}
                onCheckedChange={handleModeSwitch}
                disabled={loading}
                size="sm"
              />
              <span className={`text-xs ${user?.currentMode === 'tutor' ? 'text-green-600' : 'text-gray-400'}`}>
                Tutor
              </span>
              {loading && <RefreshCw className="size-3 animate-spin text-gray-400" />}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden sm:block fixed left-4 top-24 w-64 bg-white rounded-lg shadow-sm border p-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.key;
            
            return (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="size-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Mode Info */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Modo actual:</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={user?.currentMode === 'tutor' ? 'default' : 'secondary'} className="capitalize">
              {user?.currentMode === 'student' ? 'Estudiante' : 'Tutor'}
            </Badge>
            {user?.currentMode === 'tutor' && user?.availability && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                Disponible
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {user?.currentMode === 'student' 
              ? 'Puedes solicitar tutorías y aprender'
              : 'Puedes ofrecer tutorías y enseñar'
            }
          </p>
        </div>
      </aside>

      {/* Main content offset for sidebar */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Ajuste para la barra lateral siempre visible */
        main {
          margin-left: 80px; /* Aumentado a 80px para evitar que el contenido quede oculto */
          padding-left: 16px; /* Padding adicional para separar del borde */
        }
        
        /* Add bottom padding for mobile navigation */
        @media (max-width: 640px) {
          main {
            padding-bottom: 120px;
          }
        }
      `}} />
    </div>
  );
}
