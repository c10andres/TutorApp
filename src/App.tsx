// Componente principal de TutorApp - Multiplataforma y Responsive
import React, { useState, useEffect } from "react";
// Importar optimizaciones para Android
import './utils/android-gpu-optimization';
import './utils/android-performance-config';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoadingScreen from "./LoadingScreen";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ChatPage } from "./pages/ChatPage";
import { RequestsPage } from "./pages/RequestsPage";
import { RequestTutoringPage } from "./pages/RequestTutoringPage";
import { RequestDetailsPage } from "./pages/RequestDetailsPage";
import { ReviewPage } from "./pages/ReviewPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { AcademicManagementPage } from "./pages/AcademicManagementPage";
import { UniversityDocsPage } from "./pages/UniversityDocsPage";
import { SmartMatchingPage } from "./pages/SmartMatchingPage";
import { AcademicPredictorPage } from "./pages/AcademicPredictorPage";
import { StudyPlannerPage } from "./pages/StudyPlannerPage";
import { SupportPage } from "./pages/SupportPage";
import { AppDemoPage } from "./pages/AppDemoPage";
import TutorProfilePage from "./pages/TutorProfilePage";
import { FirebaseIndexAlert } from "./components/FirebaseIndexAlert";
import { SimpleToast } from "./components/SimpleToast";
import { ResponsiveContainer } from "./components/ResponsiveContainer";
import { MobileNavigation } from "./components/MobileNavigation";
import { Loader2 } from "lucide-react";
import { User } from "./types";
import { usePlatform } from "./hooks/usePlatform";
import { useStatusBar } from "./hooks/useStatusBar";
import { scheduleStatusBarFix } from "./utils/statusBarFix";
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { androidDebug } from './utils/android-debug';
import { AndroidInitializer } from './utils/android-initializer';

// Tipos para navegación
export type Page =
  | "home"
  | "search"
  | "profile"
  | "chat"
  | "requests"
  | "request-tutoring"
  | "request-details"
  | "review"
  | "tutor-profile"
  | "payments"
  | "academic"
  | "docs"
  | "smart-matching"
  | "academic-predictor"
  | "study-planner"
  | "support"
  | "demo"
  | "login"
  | "register"
  | "forgot-password";

interface NavigationState {
  page: Page | string;
  data?: {
    tutor?: User;
    otherUser?: User;
    request?: any;
    tutorId?: string;
    requestId?: string;
  };
}

function AppContent() {
  const { user, loading } = useAuth();
  const platform = usePlatform();
  useStatusBar(); // Configurar StatusBar automáticamente
  const [navigation, setNavigation] = useState<NavigationState>(
    { page: "home" as Page },
  );
  const [sidebarState, setSidebarState] = useState({ isCollapsed: true, isHidden: true });
  
  // Debug específico para Android
  useEffect(() => {
    androidDebug.log('🚀 AppContent inicializado');
    androidDebug.checkAppState();
    androidDebug.checkComponentsLoaded();
    
    // Inicializar datos para Android
    AndroidInitializer.initializeApp();
    
    // Optimizar rendimiento para Android (solo si es necesario)
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
      const optimizePerformance = async () => {
        try {
          const { AndroidPerformance } = await import('./utils/android-performance');
          await AndroidPerformance.optimizeForAndroid();
          await AndroidPerformance.optimizeFirebaseForAndroid();
        } catch (error) {
          console.warn('⚠️ Error en optimización de Android:', error);
        }
      };
      
      // Ejecutar con delay para no interferir con la inicialización
      setTimeout(optimizePerformance, 2000);
    }
  }, []);

  // Debug cuando cambia el usuario
  useEffect(() => {
    androidDebug.log('👤 Estado de usuario cambiado', { user, loading });
    androidDebug.checkAuthState(user);
  }, [user, loading]);

  // Debug cuando cambia la navegación
  useEffect(() => {
    androidDebug.log('🧭 Navegación cambiada', navigation);
    androidDebug.checkNavigation(navigation.page, navigation.data);
  }, [navigation]);

  // Log del estado inicial
  console.log('Initial sidebar state:', sidebarState);

  // Función para manejar cambios de estado de la barra lateral
  const handleSidebarStateChange = (isCollapsed: boolean, isHidden: boolean) => {
    console.log('Sidebar state changed:', { isCollapsed, isHidden });
    setSidebarState({ isCollapsed, isHidden });
  };

  // Configurar plataforma nativa
  useEffect(() => {
    const initializeNativeFeatures = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          console.log('🔧 Configurando características nativas para:', platform.platform);
          
          // StatusBar se configura automáticamente con useStatusBar hook

          // Ocultar splash screen cuando la app cargue
          await SplashScreen.hide();
          
          // Forzar ajuste de StatusBar
          scheduleStatusBarFix();
          
          console.log('✅ Características nativas configuradas correctamente');
        } else {
          console.log('🌐 Ejecutándose en web - características nativas deshabilitadas');
        }
      } catch (error) {
        console.warn('⚠️ Error configurando características nativas:', error);
        // No lanzar error, solo registrar
      }
    };

    initializeNativeFeatures();

    // Prevenir zoom en iOS
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventZoom, { passive: false });
    
    return () => {
      document.removeEventListener('touchmove', preventZoom);
    };
  }, [platform]);

  // Función para navegar entre páginas
  const handleNavigate = (
    page: Page | string,
    data?: NavigationState["data"],
  ) => {
    setNavigation({ page, data });
    
    // Scroll to top en navegación
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Loading state mientras se verifica la autenticación
  if (loading) {
    return (
      <ResponsiveContainer fullHeight className="flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className={`
            ${platform.isMobile ? 'size-8' : platform.isTablet ? 'size-10' : 'size-12'} 
            animate-spin mx-auto mb-4 text-blue-600
          `} />
          <p className={`
            ${platform.isMobile ? 'text-sm' : 'text-base'} 
            text-gray-600
          `}>
            Cargando...
          </p>
        </div>
      </ResponsiveContainer>
    );
  }

  // Si no hay usuario autenticado, mostrar páginas de auth
  if (!user) {
    switch (navigation.page) {
      case "register":
        return (
          <ResponsiveContainer fullHeight>
            <RegisterPage
              onNavigateToLogin={() => handleNavigate("login")}
            />
          </ResponsiveContainer>
        );
      case "forgot-password":
        return (
          <ResponsiveContainer fullHeight>
            <ForgotPasswordPage
              onNavigateToLogin={() => handleNavigate("login")}
            />
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer fullHeight>
            <LoginPage
              onNavigateToRegister={() =>
                handleNavigate("register")
              }
              onNavigateToForgotPassword={() =>
                handleNavigate("forgot-password")
              }
            />
          </ResponsiveContainer>
        );
    }
  }

  // Usuario autenticado - mostrar aplicación principal
  const renderPageWithNavigation = (PageComponent: React.ComponentType<{ onNavigate: typeof handleNavigate }>) => {
    androidDebug.log('🎨 Renderizando página con navegación', { 
      page: navigation.page, 
      component: PageComponent.name 
    });
    
    // Calcular el margen izquierdo basado en el estado de la barra lateral
    const getContentMargin = () => {
      const margin = sidebarState.isHidden ? 'ml-0' : 'ml-72'; // 288px para mejor ajuste
      console.log('Content margin calculated:', { sidebarState, margin });
      return margin;
    };

    return (
      <div className="min-h-screen bg-gray-50 relative" style={{ backgroundColor: '#f9fafb' }}>
        <div className={`transition-all duration-300 ease-in-out ${getContentMargin()}`} style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingTop: '4rem' }}>
          <ResponsiveContainer fullHeight mobileNavSpace={false}>
            <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
              <PageComponent onNavigate={handleNavigate} />
            </div>
          </ResponsiveContainer>
        </div>
        {/* Navegación vertical ocultable - Solo en móviles */}
        <MobileNavigation 
          currentPage={navigation.page} 
          onNavigate={handleNavigate}
          onSidebarStateChange={handleSidebarStateChange}
        />
      </div>
    );
  };

  switch (navigation.page) {
    case "search":
      return renderPageWithNavigation(SearchPage);

    case "profile":
      return renderPageWithNavigation(ProfilePage);

    case "chat":
      return (
        <div className="min-h-screen bg-gray-50 relative" style={{ backgroundColor: '#f9fafb' }}>
          <div className={`transition-all duration-300 ease-in-out ${sidebarState.isHidden ? 'ml-0' : 'ml-72'}`} style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingTop: '4rem' }}>
            <ResponsiveContainer fullHeight mobileNavSpace={false}>
              <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
                <ChatPage
                  onNavigate={handleNavigate}
                  initialUser={navigation.data?.otherUser}
                  requestId={navigation.data?.requestId}
                />
              </div>
            </ResponsiveContainer>
          </div>
          <MobileNavigation 
            currentPage={navigation.page} 
            onNavigate={handleNavigate}
            onSidebarStateChange={handleSidebarStateChange}
          />
        </div>
      );

    case "requests":
      return renderPageWithNavigation(RequestsPage);

    case "request-tutoring":
      return (
        <div className="min-h-screen bg-gray-50 relative" style={{ backgroundColor: '#f9fafb' }}>
          <div className={`transition-all duration-300 ease-in-out ${sidebarState.isHidden ? 'ml-0' : 'ml-72'}`} style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingTop: '4rem' }}>
            <ResponsiveContainer fullHeight mobileNavSpace={false}>
              <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
                <RequestTutoringPage
                  onNavigate={handleNavigate}
                  tutor={navigation.data?.tutor}
                />
              </div>
            </ResponsiveContainer>
          </div>
          <MobileNavigation 
            currentPage={navigation.page} 
            onNavigate={handleNavigate}
            onSidebarStateChange={handleSidebarStateChange}
          />
        </div>
      );

    case "request-details":
      return (
        <div className="min-h-screen bg-gray-50 relative" style={{ backgroundColor: '#f9fafb' }}>
          <div className={`transition-all duration-300 ease-in-out ${sidebarState.isHidden ? 'ml-0' : 'ml-72'}`} style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingTop: '4rem' }}>
            <ResponsiveContainer fullHeight mobileNavSpace={false}>
              <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
                <RequestDetailsPage
                  onNavigate={handleNavigate}
                />
              </div>
            </ResponsiveContainer>
          </div>
          <MobileNavigation 
            currentPage={navigation.page} 
            onNavigate={handleNavigate}
            onSidebarStateChange={handleSidebarStateChange}
          />
        </div>
      );

    case "review":
      return (
        <div className="min-h-screen bg-gray-50 relative" style={{ backgroundColor: '#f9fafb' }}>
          <div className={`transition-all duration-300 ease-in-out ${sidebarState.isHidden ? 'ml-0' : 'ml-72'}`} style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingTop: '4rem' }}>
            <ResponsiveContainer fullHeight mobileNavSpace={false}>
              <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
                <ReviewPage
                  onNavigate={handleNavigate}
                  request={navigation.data?.request}
                  tutor={navigation.data?.tutor}
                />
              </div>
            </ResponsiveContainer>
          </div>
          <MobileNavigation 
            currentPage={navigation.page} 
            onNavigate={handleNavigate}
            onSidebarStateChange={handleSidebarStateChange}
          />
        </div>
      );

    case "payments":
      return renderPageWithNavigation(PaymentsPage);

    case "academic":
      return renderPageWithNavigation(AcademicManagementPage);

    case "docs":
      return renderPageWithNavigation(UniversityDocsPage);

    case "smart-matching":
      return renderPageWithNavigation(SmartMatchingPage);

    case "academic-predictor":
      return renderPageWithNavigation(AcademicPredictorPage);

    case "study-planner":
      return renderPageWithNavigation(StudyPlannerPage);

    case "support":
      return renderPageWithNavigation(SupportPage);

    case "demo":
      return renderPageWithNavigation(AppDemoPage);

    case "tutor-profile":
      return (
        <div className="min-h-screen bg-gray-50 relative" style={{ backgroundColor: '#f9fafb' }}>
          <div className={`transition-all duration-300 ease-in-out ${sidebarState.isHidden ? 'ml-0' : 'ml-72'}`} style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingTop: '4rem' }}>
            <ResponsiveContainer fullHeight mobileNavSpace={false}>
              <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
                <TutorProfilePage 
                  onNavigate={handleNavigate}
                  tutor={navigation.data?.tutor}
                  tutorId={navigation.data?.tutorId}
                />
              </div>
            </ResponsiveContainer>
          </div>
          <MobileNavigation 
            currentPage={navigation.page} 
            onNavigate={handleNavigate}
            onSidebarStateChange={handleSidebarStateChange}
          />
        </div>
      );

    default:
      return renderPageWithNavigation(HomePage);
  }
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen-mobile bg-gray-50 overflow-x-hidden scroll-smooth mobile-safe-all w-full max-w-full app-container page-container">
        <AppContent />

        {/* Firebase Index Alert - only show when there are index issues */}
        <FirebaseIndexAlert />

        {/* Simple Toast for user feedback */}
        <SimpleToast />

        {/* Global styles for the app - Multiplataforma */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          /* Prevenir comportamientos no deseados en móviles */
          * {
            -webkit-tap-highlight-color: transparent;
          }

          /* Smooth transitions */
          button,
          a,
          [role="button"] {
            transition: all 0.2s ease-in-out;
          }

          /* Custom scrollbar para web */
          @media (hover: hover) and (pointer: fine) {
            ::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }

            ::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 4px;
            }

            ::-webkit-scrollbar-thumb {
              background: #c1c1c1;
              border-radius: 4px;
            }

            ::-webkit-scrollbar-thumb:hover {
              background: #a8a8a8;
            }
          }

          /* Focus states accesibles */
          button:focus-visible,
          input:focus-visible,
          textarea:focus-visible,
          select:focus-visible,
          a:focus-visible {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
          }

          /* Animation for skeleton loading */
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: .5;
            }
          }

          .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }

          /* Ajustes responsive */
          @media (max-width: 640px) {
            /* Aumentar áreas de toque en móviles */
            button,
            a[role="button"],
            input[type="checkbox"],
            input[type="radio"] {
              min-height: 44px;
              min-width: 44px;
            }

            /* Mejorar legibilidad en móviles */
            p, li, span {
              line-height: 1.6;
            }
          }

          /* Toast notifications */
          .toast-container {
            position: fixed;
            top: 1rem;
            right: 1rem;
            z-index: 9999;
          }

          @media (max-width: 640px) {
            .toast-container {
              top: auto;
              bottom: 1rem;
              left: 1rem;
              right: 1rem;
            }
          }

          /* Prevenir selección de texto en elementos interactivos */
          button,
          a,
          .tap-area {
            -webkit-user-select: none;
            user-select: none;
          }

          /* Mejoras de rendimiento para animaciones en móviles */
          .animate-in,
          .animate-out,
          .transition-all {
            will-change: transform, opacity;
          }

          /* Optimizar renderizado */
          img,
          video {
            max-width: 100%;
            height: auto;
          }

          /* Safe areas para iOS y Android - FORZADO */
          body {
            padding-top: env(safe-area-inset-top) !important;
            padding-left: env(safe-area-inset-left) !important;
            padding-right: env(safe-area-inset-right) !important;
            padding-bottom: env(safe-area-inset-bottom) !important;
          }
          
          /* Asegurar que el contenido principal respete las safe areas */
          .app-container {
            padding-top: env(safe-area-inset-top) !important;
            padding-left: env(safe-area-inset-left) !important;
            padding-right: env(safe-area-inset-right) !important;
            padding-bottom: env(safe-area-inset-bottom) !important;
            min-height: 100vh;
            min-height: -webkit-fill-available;
          }
          
          /* Forzar que el contenido no se oculte detrás de la StatusBar */
          .main-content {
            padding-top: max(env(safe-area-inset-top), 20px) !important;
          }
          
          /* Asegurar que las páginas respeten las safe areas */
          .page-container {
            padding-top: env(safe-area-inset-top) !important;
            padding-left: env(safe-area-inset-left) !important;
            padding-right: env(safe-area-inset-right) !important;
            padding-bottom: env(safe-area-inset-bottom) !important;
          }

          /* Prevenir bounce en iOS */
          body {
            overscroll-behavior-y: none;
          }

          /* Mejoras de accesibilidad */
          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }

          /* Dark mode support */
          @media (prefers-color-scheme: dark) {
            /* Preparado para dark mode futuro */
          }
        `,
          }}
        />
      </div>
    </AuthProvider>
  );
}
