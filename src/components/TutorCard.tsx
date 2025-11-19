// Componente para mostrar información de tutores
import React from 'react';
import { User } from '../types';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Star, MapPin, Clock, DollarSign, Award, Users, BookOpen, MessageCircle } from 'lucide-react';
import { formatPriceCOP } from '../utils/formatters';

interface TutorCardProps {
  tutor: User;
  onViewProfile?: (tutor: User) => void;
  onRequestTutoring?: (tutor: User) => void;
  showRequestButton?: boolean;
}

export function TutorCard({ 
  tutor, 
  onViewProfile, 
  onRequestTutoring,
  showRequestButton = true 
}: TutorCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow w-full max-w-full overflow-hidden tutor-card-responsive">
      <CardContent className="p-4 w-full max-w-full card-content">
        <div className="flex items-start gap-4 w-full max-w-full">
          {/* Avatar */}
          <Avatar className="size-16 shrink-0">
            <AvatarImage src={tutor.avatar} />
            <AvatarFallback>
              {tutor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0 w-full max-w-full overflow-hidden tutor-info">
            <div className="flex items-start justify-between gap-2 w-full">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{tutor.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="size-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{tutor.rating}</span>
                  <span className="text-sm text-gray-500">({tutor.totalReviews})</span>
                </div>
              </div>
              
              {/* Availability Status */}
              <div className="flex items-center gap-1 shrink-0">
                <div 
                  className={`size-2 rounded-full ${
                    tutor.availability ? 'bg-green-500' : 'bg-gray-400'
                  }`} 
                />
                <span className="text-xs text-gray-600 hidden sm:inline">
                  {tutor.availability ? 'Disponible' : 'Ocupado'}
                </span>
              </div>
            </div>

            {/* Location */}
            {tutor.location && (
              <div className="flex items-center gap-1 mt-2">
                <MapPin className="size-4 text-gray-400" />
                <span className="text-sm text-gray-600 truncate">{tutor.location}</span>
              </div>
            )}

            {/* Bio */}
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {tutor.bio}
            </p>

            {/* Subjects */}
            <div className="flex flex-wrap gap-1 mt-3">
              {tutor.subjects.slice(0, 2).map((subject) => (
                <Badge key={subject} variant="secondary" className="text-xs">
                  {subject}
                </Badge>
              ))}
              {tutor.subjects.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{tutor.subjects.length - 2} más
                </Badge>
              )}
            </div>

            {/* Rate and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 w-full tutor-actions">
              <div className="flex items-center gap-1">
                <DollarSign className="size-4 text-gray-400" />
                <span className="font-medium">{formatPriceCOP(tutor.hourlyRate)}</span>
                <span className="text-sm text-gray-500">/hora</span>
              </div>

              <div className="flex gap-2 w-full sm:w-auto action-buttons">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewProfile?.(tutor)}
                  className="flex-1 sm:flex-none action-button"
                >
                  Ver perfil
                </Button>
                {showRequestButton && tutor.availability && (
                  <Button 
                    size="sm"
                    onClick={() => onRequestTutoring?.(tutor)}
                    className="flex-1 sm:flex-none action-button"
                  >
                    Solicitar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de esqueleto para carga
export function TutorCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="size-16 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
            <div className="flex gap-2 mt-3">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-14" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
