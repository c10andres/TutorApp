// Componente de navegación lateral responsive (móvil y desktop)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Switch } from './ui/switch';
import { usePlatform } from '../hooks/usePlatform';
import { 
  Home, 
  Search, 
  Calendar, 
  MessageCircle, 
  Brain, 
  BarChart3, 
  CalendarCheck, 
  GraduationCap, 
  FileText, 
  User,
  RefreshCw,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LogOut,
  Bell,
  BellRing
} from 'lucide-react';

interface MobileNavigationProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
  onSidebarStateChange?: (isCollapsed: boolean, isHidden: boolean) => void;
}

export function MobileNavigation({ currentPage = 'home', onNavigate, onSidebarStateChange }: MobileNavigationProps) {
  const { user, switchMode, signOut, loading } = useAuth();
  const platform = usePlatform();
  // Estados para controlar la visibilidad de la barra lateral
  const [isVisible, setIsVisible] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHidden, setIsHidden] = useState(true); // Iniciar oculta por defecto
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Notificar cambios de estado de la barra lateral
  useEffect(() => {
    if (onSidebarStateChange) {
      onSidebarStateChange(isCollapsed, isHidden);
    }
  }, [isCollapsed, isHidden]); // Removido onSidebarStateChange de dependencias

  // Prevenir scroll del body cuando el sidebar está abierto (solo en móvil)
  useEffect(() => {
    if (!isHidden && platform.isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isHidden, platform.isMobile]);

  // Cerrar sidebar al hacer clic fuera (sin overlay)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isHidden) {
        const target = event.target as HTMLElement;
        const sidebar = document.querySelector('[data-sidebar="true"]');
        const toggleButton = document.querySelector('[data-toggle-button="true"]');
        
        // Si el clic no es en el sidebar ni en el botón toggle, cerrar la barra
        if (sidebar && !sidebar.contains(target) && toggleButton && !toggleButton.contains(target)) {
          setIsHidden(true);
        }
      }
    };

    if (!isHidden) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isHidden]);

  const handleNavigation = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
    // Ocultar el menú después de navegar
    setIsHidden(true);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleSidebar = () => {
    console.log('toggleSidebar called, current isHidden:', isHidden);
    if (isHidden) {
      // Oculto → Expandido
      console.log('Setting to visible');
      setIsHidden(false);
      setIsCollapsed(false);
    } else {
      // Expandido → Oculto
      console.log('Setting to hidden');
      setIsHidden(true);
      setIsCollapsed(true);
    }
  };

  const hideSidebar = () => {
    setIsHidden(true);
    setIsCollapsed(true);
  };

  const handleModeSwitch = async (checked: boolean) => {
    try {
      // Determinar el nuevo modo basado en el estado del switch
      const newMode = checked ? 'tutor' : 'student';
      console.log('Switching mode from', user?.currentMode, 'to', newMode);
      await switchMode(newMode);
      console.log('Mode switched successfully');
    } catch (err) {
      console.error('Error switching mode:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsVisible(false);
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  // Navegación principal organizada por categorías
  const navigationSections = [
    {
      title: "PRINCIPAL",
      items: [
        { key: 'home', label: 'Inicio', icon: Home },
        { key: 'search', label: 'Buscar Tutores', icon: Search },
        { key: 'requests', label: 'Mis Solicitudes', icon: Calendar },
        { key: 'chat', label: 'Mensajes', icon: MessageCircle },
      ]
    },
    {
      title: "INTELIGENCIA ARTIFICIAL",
      items: [
        { key: 'smart-matching', label: 'Smart Matching', icon: Brain },
        { key: 'academic-predictor', label: 'Predictor Académico', icon: BarChart3 },
        { key: 'study-planner', label: 'Planificador IA', icon: CalendarCheck },
      ]
    },
    {
      title: "ACADÉMICO",
      items: [
        { key: 'academic', label: 'Gestión Semestre', icon: GraduationCap },
        { key: 'docs', label: 'Documentos', icon: FileText },
      ]
    },
    {
      title: "Cuenta",
      items: [
        { key: 'profile', label: 'Mi Perfil', icon: User },
        { key: 'payments', label: 'Pagos', icon: CreditCard },
        { key: 'support', label: 'Soporte', icon: HelpCircle },
      ]
    }
  ];

  // Mostrar en todas las pantallas, pero con comportamiento diferente
  // En desktop: sidebar fijo, en móvil: overlay

  // Debug: Log para verificar que se está renderizando
  console.log('MobileNavigation render:', { 
    isVisible, 
    isMobile: platform.isMobile, 
    platform: platform.platform 
  });

  // Debug: Log para verificar estados
  console.log('MobileNavigation states:', { isHidden, isCollapsed, isVisible });
  console.log('MobileNavigation render - isHidden:', isHidden, 'should render:', !isHidden);

  // Función para obtener el título de la página actual
  const getPageTitle = () => {
    const allItems = navigationSections.flatMap(section => section.items);
    const currentItem = allItems.find(item => item.key === currentPage);
    return currentItem?.label || 'TutorApp';
  };

  return (
    <>
              {/* Barra superior fija con botón del menú y título */}
              <div className="fixed top-0 left-0 right-0 z-[1001] bg-white border-b border-gray-200 shadow-sm w-full max-w-full overflow-x-hidden nav-responsive">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Botón del menú y título */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              data-toggle-button="true"
              className={`
                w-10 h-10 rounded-lg shadow-sm
                bg-blue-500 hover:bg-blue-600 active:bg-blue-700
                text-white transition-all duration-200
                flex items-center justify-center
                hover:scale-105 active:scale-95
              `}
              title={isHidden ? 'Mostrar barra lateral' : 'Ocultar barra lateral'}
            >
              {isHidden ? (
                <Menu className="size-5" />
              ) : (
                <X className="size-5" />
              )}
            </button>
            
            {/* Título de la página activa */}
            <h1 className="text-lg font-semibold text-gray-800">
              {getPageTitle()}
            </h1>
          </div>
          
          {/* Espacio para elementos adicionales del header si es necesario */}
          <div className="flex items-center gap-2">
            {/* Botón de notificaciones */}
            <button
              onClick={() => setShowNotificationCenter(true)}
              className="relative w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
              title="Notificaciones"
            >
              {unreadNotifications > 0 ? (
                <BellRing className="size-5 text-blue-500" />
              ) : (
                <Bell className="size-5 text-gray-600" />
              )}
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>


              {/* Panel de navegación vertical - Lado izquierdo - SOLO se renderiza si NO está oculta */}
              {!isHidden && (
                <nav
                  data-sidebar="true"
                  className="fixed left-0 w-72 bg-white shadow-2xl border-r border-gray-200 z-[1000] flex flex-col overflow-x-hidden"
                  style={{
                    display: 'flex',
                    backgroundColor: 'white',
                    top: '64px', // 4rem = 64px
                    height: 'calc(100vh - 64px)',
                    position: 'fixed',
                    left: '0px',
                    width: '288px', // w-72 = 288px
                    maxWidth: '100vw'
                  }}
                >
        {/* Header de la navegación - Simplificado */}
        <div className="p-4 border-b border-gray-200">
          <div className="text-center text-gray-600 text-sm font-medium">
            TutorApp
          </div>
        </div>

        {/* Modo actual */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="text-center text-gray-700 text-sm font-medium mb-3">Modo actual</div>
          <div className="flex items-center justify-center gap-3">
            {/* Botón Estudiante */}
            <button
              onClick={() => handleModeSwitch(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                user?.currentMode === 'student' 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <GraduationCap className="size-4" />
              <span>Estudiante</span>
            </button>
            
            {/* Botón Tutor */}
            <button
              onClick={() => handleModeSwitch(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                user?.currentMode === 'tutor' 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <User className="size-4" />
              <span>Tutor</span>
            </button>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
            {/* Secciones de navegación */}
            <div className="py-2 flex flex-col w-full">
              {navigationSections.map((section, sectionIndex) => (
                <div key={section.title} className="w-full">
                  <div className="px-4 py-3 text-xs font-bold text-gray-600 uppercase tracking-wide">
                    {section.title}
                  </div>
                  <div className="w-full flex flex-col">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentPage === item.key;
                      
                      return (
                        <button
                          key={item.key}
                          onClick={() => handleNavigation(item.key)}
                          className={`
                            w-full flex items-center px-4 py-3 mx-2 rounded-lg
                            transition-all duration-200
                            ${isActive 
                              ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500' 
                              : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                            }
                            justify-start
                          `}
                          title={item.label}
                        >
                          <Icon className={`size-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                          <span className={`ml-3 font-medium ${isActive ? 'text-blue-600' : 'text-gray-700'}`}>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {sectionIndex < navigationSections.length - 1 && (
                    <div className="mx-4 my-2 border-t border-gray-200"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

        {/* Footer con información del usuario y logout */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-medium">
              {user?.name?.[0]?.toUpperCase() || 'C'}
            </div>
            <div className="ml-3">
              <div className="text-gray-900 text-sm font-medium">{user?.name || 'carlos'}</div>
              <div className="text-gray-500 text-xs">{user?.email || '24c.andres@gmail.com'}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors"
          >
            <LogOut className="size-4 mr-2" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
        </nav>
      )}

      {/* Centro de notificaciones */}
      {showNotificationCenter && (
        <div className="fixed inset-0 z-[1002] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Bell className="size-5" />
                <h2 className="text-lg font-semibold">Centro de Notificaciones</h2>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {unreadNotifications} sin leer
                </span>
              </div>
              <button
                onClick={() => setShowNotificationCenter(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <X className="size-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              <div className="text-center text-gray-500 py-8">
                <Bell className="size-12 mx-auto mb-4 text-gray-300" />
                <p>No hay notificaciones</p>
                <p className="text-sm">Las notificaciones aparecerán aquí cuando recibas mensajes o actualizaciones</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Hook para calcular el espacio necesario para la navegación lateral
export function useSidebarNavHeight() {
  const platform = usePlatform();
  
  // Altura aproximada de la navegación
  const navHeight = platform.isMobile ? 140 : 0;
  
  return {
    navHeight,
    paddingBottom: platform.isMobile ? `${navHeight}px` : '0px',
    marginBottom: platform.isMobile ? `${navHeight}px` : '0px'
  };
}
