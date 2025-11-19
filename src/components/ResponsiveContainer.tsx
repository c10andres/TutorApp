// Componente contenedor responsive que se adapta a todas las plataformas
import React from 'react';
import { usePlatform } from '../hooks/usePlatform';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  fullHeight?: boolean;
  mobileNavSpace?: boolean; // Nueva prop para manejar espacio de navegación móvil
}

export function ResponsiveContainer({
  children,
  className = '',
  noPadding = false,
  fullHeight = false,
  mobileNavSpace = true, // Por defecto true para agregar espacio para navegación móvil
}: ResponsiveContainerProps) {
  const platform = usePlatform();

  const containerClasses = `
    ${platform.isNative ? 'app-layout safe-area-content' : 'container'}
    ${!noPadding ? 'px-4 py-6' : ''}
    ${fullHeight ? 'min-h-screen' : ''}
    ${className}
  `.trim();

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
}

// Componente para grids responsive
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: number;
}

export function ResponsiveGrid({
  children,
  className = '',
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4,
}: ResponsiveGridProps) {
  const gridClasses = `
    grid
    grid-cols-${cols.mobile || 1}
    md:grid-cols-${cols.tablet || 2}
    lg:grid-cols-${cols.desktop || 3}
    gap-${gap}
    ${className}
  `.trim();

  return <div className={gridClasses}>{children}</div>;
}

// Componente para stacks responsive (flex)
interface ResponsiveStackProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'column' | 'row' | 'column-reverse' | 'row-reverse';
  mobileDirection?: 'column' | 'row';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: number;
}

export function ResponsiveStack({
  children,
  className = '',
  direction = 'column',
  mobileDirection,
  align = 'stretch',
  justify = 'start',
  gap = 4,
}: ResponsiveStackProps) {
  const stackClasses = `
    flex
    flex-${mobileDirection || direction}
    ${mobileDirection ? `md:flex-${direction}` : ''}
    items-${align}
    justify-${justify}
    gap-${gap}
    ${className}
  `.trim();

  return <div className={stackClasses}>{children}</div>;
}

// Componente para cards responsive
interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export function ResponsiveCard({
  children,
  className = '',
  padding = 'md',
}: ResponsiveCardProps) {
  const platform = usePlatform();
  
  const paddingClasses = {
    sm: platform.isMobile ? 'p-3' : 'p-4',
    md: platform.isMobile ? 'p-4' : platform.isTablet ? 'p-5' : 'p-6',
    lg: platform.isMobile ? 'p-5' : platform.isTablet ? 'p-6' : 'p-8',
  };

  const cardClasses = `
    bg-white
    rounded-lg
    md:rounded-xl
    shadow-sm
    border
    border-gray-200
    ${paddingClasses[padding]}
    ${className}
  `.trim();

  return <div className={cardClasses}>{children}</div>;
}
