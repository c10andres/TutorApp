// Componente mejorado para mostrar información de tutores
import React from 'react';
import { User } from '../types';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Star, MapPin, Clock, DollarSign, Award, Users, BookOpen, MessageCircle, CheckCircle } from 'lucide-react';
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
    <Card className="hover:shadow-lg transition-all duration-300 w-full max-w-full overflow-hidden tutor-card-responsive border-l-4 border-l-blue-500 bg-white">
      <CardContent className="p-5 w-full max-w-full card-content">
        <div className="flex items-start gap-4 w-full max-w-full">
          {/* Avatar */}
          <Avatar className="size-20 shrink-0 ring-2 ring-blue-100">
            <AvatarImage src={tutor.avatar} />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
              {tutor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0 w-full max-w-full overflow-hidden tutor-info">
            <div className="flex items-start justify-between gap-2 w-full">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate text-gray-900">{tutor.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="size-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{tutor.rating || 0}</span>
                    <span className="text-sm text-gray-500">({tutor.totalReviews || 0} reseñas)</span>
                  </div>
                  {tutor.experience && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Award className="size-3" />
                      <span className="truncate max-w-32">{tutor.experience}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Availability Status */}
              <div className="flex items-center gap-1 shrink-0">
                <div 
                  className={`size-3 rounded-full ${
                    tutor.availability ? 'bg-green-500' : 'bg-gray-400'
                  }`} 
                />
                <span className="text-xs font-medium text-gray-700">
                  {tutor.availability ? 'Disponible' : 'Ocupado'}
                </span>
              </div>
            </div>

            {/* Location */}
            {tutor.location && (
              <div className="flex items-center gap-1 mt-2">
                <MapPin className="size-4 text-gray-500" />
                <span className="text-sm text-gray-700 font-medium">{tutor.location}</span>
              </div>
            )}

            {/* Bio */}
            <p className="text-sm text-gray-600 mt-3 line-clamp-3 leading-relaxed">
              {tutor.bio || 'Tutor especializado con amplia experiencia en enseñanza.'}
            </p>

            {/* Education */}
            {tutor.education && (
              <div className="flex items-center gap-1 mt-2">
                <BookOpen className="size-3 text-blue-500" />
                <span className="text-xs text-blue-600 font-medium truncate">{tutor.education}</span>
              </div>
            )}

            {/* Subjects */}
            <div className="flex flex-wrap gap-1 mt-3">
              {tutor.subjects.slice(0, 3).map((subject) => (
                <Badge key={subject} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  {subject}
                </Badge>
              ))}
              {tutor.subjects.length > 3 && (
                <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">
                  +{tutor.subjects.length - 3} más
                </Badge>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
              {tutor.totalSessions && (
                <div className="flex items-center gap-1">
                  <Users className="size-3" />
                  <span>{tutor.totalSessions} sesiones</span>
                </div>
              )}
              {tutor.responseTime && (
                <div className="flex items-center gap-1">
                  <Clock className="size-3" />
                  <span>Responde en {tutor.responseTime}</span>
                </div>
              )}
              {tutor.languages && tutor.languages.length > 0 && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="size-3" />
                  <span>{tutor.languages.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Rate and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 w-full tutor-actions">
              <div className="flex items-center gap-1">
                <DollarSign className="size-4 text-green-600" />
                <span className="font-bold text-lg text-green-700">{formatPriceCOP(tutor.hourlyRate || 0)}</span>
                <span className="text-sm text-gray-600">/hora</span>
              </div>

              <div className="flex gap-2 w-full sm:w-auto action-buttons">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewProfile?.(tutor)}
                  className="flex-1 sm:flex-none action-button border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <MessageCircle className="size-3 mr-1" />
                  Ver perfil
                </Button>
                {showRequestButton && tutor.availability && (
                  <Button 
                    size="sm"
                    onClick={() => onRequestTutoring?.(tutor)}
                    className="flex-1 sm:flex-none action-button bg-blue-600 hover:bg-blue-700"
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

// Componente de esqueleto mejorado para carga
export function TutorCardSkeleton() {
  return (
    <Card className="border-l-4 border-l-gray-200">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="size-20 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
            <div className="flex gap-2 mt-3">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-14" />
            </div>
            <div className="flex gap-2 mt-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
              <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
