// Layout dinámico que se adapta a cualquier pantalla y plataforma
import React from 'react';
import { usePlatform } from '../hooks/usePlatform';
import { ArrowLeft, Menu, X } from 'lucide-react';

interface DynamicLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  fullHeight?: boolean;
  backgroundColor?: 'white' | 'gray' | 'blue';
}

export function DynamicLayout({
  children,
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  className = '',
  noPadding = false,
  fullHeight = true,
  backgroundColor = 'white'
}: DynamicLayoutProps) {
  const platform = usePlatform();

  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    blue: 'bg-gradient-to-br from-blue-50 to-indigo-100'
  };

  return (
    <div className={`
      ${fullHeight ? 'min-h-screen-mobile' : 'min-h-full'}
      ${backgroundClasses[backgroundColor]}
      page-layout
      ${platform.isNative ? 'safe-area-inset' : ''}
      ${className}
    `}>
      {/* Header */}
      {(title || showBack || rightAction) && (
        <div className="page-header bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className={`
            container-mobile
            ${platform.isMobile ? 'py-3' : 'py-4'}
          `}>
            <div className="responsive-stack items-center justify-between">
              {/* Left side - Back button + Title */}
              <div className="responsive-stack items-center flex-1">
                {showBack && onBack && (
                  <button
                    onClick={onBack}
                    className={`
                      tap-area
                      p-2 -ml-2
                      rounded-lg
                      hover:bg-gray-100
                      transition-colors
                      ${platform.isMobile ? 'mr-2' : 'mr-3'}
                    `}
                  >
                    <ArrowLeft className={`
                      ${platform.isMobile ? 'size-5' : 'size-6'}
                      text-gray-600
                    `} />
                  </button>
                )}
                
                {title && (
                  <div className="flex-1 min-w-0">
                    <h1 className={`
                      font-semibold text-gray-900 line-clamp-1
                      ${platform.isMobile ? 'text-lg' : platform.isTablet ? 'text-xl' : 'text-2xl'}
                    `}>
                      {title}
                    </h1>
                    {subtitle && (
                      <p className={`
                        text-gray-600 line-clamp-1 mt-1
                        ${platform.isMobile ? 'text-sm' : 'text-base'}
                      `}>
                        {subtitle}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Right side - Actions */}
              {rightAction && (
                <div className="flex-shrink-0 ml-4">
                  {rightAction}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="page-content flex-1">
        <div className={`
          ${!noPadding ? 'container-mobile' : ''}
          ${!noPadding && platform.isMobile ? 'py-4' : 'py-6'}
          h-full
        `}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Componente de sección para organizar contenido
interface DynamicSectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

export function DynamicSection({
  children,
  title,
  description,
  className = '',
  spacing = 'md'
}: DynamicSectionProps) {
  const platform = usePlatform();

  const spacingClasses = {
    sm: platform.isMobile ? 'space-y-3' : 'space-y-4',
    md: platform.isMobile ? 'space-y-4' : 'space-y-6',
    lg: platform.isMobile ? 'space-y-6' : 'space-y-8'
  };

  return (
    <section className={`${spacingClasses[spacing]} ${className}`}>
      {(title || description) && (
        <div className={platform.isMobile ? 'space-y-1' : 'space-y-2'}>
          {title && (
            <h2 className={`
              font-semibold text-gray-900
              ${platform.isMobile ? 'text-lg' : platform.isTablet ? 'text-xl' : 'text-2xl'}
            `}>
              {title}
            </h2>
          )}
          {description && (
            <p className={`
              text-gray-600 line-clamp-2
              ${platform.isMobile ? 'text-sm' : 'text-base'}
            `}>
              {description}
            </p>
          )}
        </div>
      )}
      <div>
        {children}
      </div>
    </section>
  );
}

// Componente de grid dinámico
interface DynamicGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

export function DynamicGrid({
  children,
  className = '',
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md'
}: DynamicGridProps) {
  const platform = usePlatform();

  const gapClasses = {
    sm: platform.isMobile ? 'gap-3' : 'gap-4',
    md: platform.isMobile ? 'gap-4' : 'gap-6',
    lg: platform.isMobile ? 'gap-6' : 'gap-8'
  };

  return (
    <div className={`
      responsive-grid
      ${gapClasses[gap]}
      ${className}
    `}
    style={{
      gridTemplateColumns: `repeat(${cols.mobile || 1}, 1fr)`,
      '@media (min-width: 768px)': {
        gridTemplateColumns: `repeat(${cols.tablet || 2}, 1fr)`
      },
      '@media (min-width: 1024px)': {
        gridTemplateColumns: `repeat(${cols.desktop || 3}, 1fr)`
      }
    }}>
      {children}
    </div>
  );
}

// Componente de card dinámico
interface DynamicCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export function DynamicCard({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm',
  border = true,
  hover = false,
  clickable = false,
  onClick
}: DynamicCardProps) {
  const platform = usePlatform();

  const paddingClasses = {
    sm: platform.isMobile ? 'p-3' : 'p-4',
    md: platform.isMobile ? 'p-4' : platform.isTablet ? 'p-5' : 'p-6',
    lg: platform.isMobile ? 'p-5' : platform.isTablet ? 'p-6' : 'p-8'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  return (
    <div
      className={`
        bg-white
        ${platform.isMobile ? 'rounded-lg' : 'rounded-xl'}
        ${paddingClasses[padding]}
        ${shadowClasses[shadow]}
        ${border ? 'border border-gray-200' : ''}
        ${hover ? 'hover:shadow-lg transition-shadow duration-200' : ''}
        ${clickable || onClick ? 'cursor-pointer tap-area' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Componente de botón dinámico
interface DynamicButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export function DynamicButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  className = ''
}: DynamicButtonProps) {
  const platform = usePlatform();

  const baseClasses = 'tap-area inline-flex items-center justify-center font-medium transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  };

  const sizeClasses = {
    sm: platform.isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2 text-sm',
    md: platform.isMobile ? 'px-4 py-3 text-base' : 'px-6 py-3 text-base',
    lg: platform.isMobile ? 'px-6 py-4 text-lg' : 'px-8 py-4 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <div className="animate-spin mr-2">⏳</div>
      ) : null}
      {children}
    </button>
  );
}
