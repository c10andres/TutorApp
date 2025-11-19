import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { collectiveIntelligenceService, CIEMDashboard } from '../services/collectiveIntelligenceMetrics';
import { 
  Users, 
  MessageSquare, 
  Clock, 
  TrendingUp,
  BarChart3,
  Target,
  Brain,
  Award,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface CIEMDashboardProps {
  className?: string;
}

export function CIEMDashboard({ className }: CIEMDashboardProps) {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<CIEMDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError('');
      
      const data = await collectiveIntelligenceService.getCIEMDashboard(user.id);
      setDashboard(data);
    } catch (err) {
      console.error('Error loading CIEM dashboard:', err);
      setError('Error cargando métricas de inteligencia colectiva');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="size-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando métricas...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !dashboard) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="size-5 text-blue-600" />
            Tablero de Inteligencia Colectiva
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            {error || 'No hay datos disponibles'}
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-4"
              onClick={loadDashboard}
            >
              <RefreshCw className="size-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { participation, collective, knowledge } = dashboard;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="size-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  Tablero de Inteligencia Colectiva (CIEM)
                </CardTitle>
                <CardDescription>
                  Métricas de participación, comportamiento y conocimiento
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={loadDashboard}>
              <RefreshCw className="size-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* PI - Participación Individual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="size-5 text-blue-600" />
            Participación Individual (PI)
          </CardTitle>
          <CardDescription>
            Métricas de participación individual de usuarios
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Usuarios con Preguntas"
            value={`${participation.usersWithQuestions.toFixed(1)}%`}
            icon={<MessageSquare className="size-5" />}
            progress={participation.usersWithQuestions}
            color="blue"
          />
          <MetricCard
            title="Usuarios con Respuestas"
            value={`${participation.usersWithAnswers.toFixed(1)}%`}
            icon={<Award className="size-5" />}
            progress={participation.usersWithAnswers}
            color="green"
          />
          <MetricCard
            title="Tiempo de Respuesta"
            value={`${Math.round(participation.avgResponseTime)} min`}
            icon={<Clock className="size-5" />}
            progress={100 - (participation.avgResponseTime / 60) * 100}
            color="purple"
          />
          <MetricCard
            title="Constancia Semanal"
            value={`${participation.weeklyConsistency.toFixed(1)}%`}
            icon={<TrendingUp className="size-5" />}
            progress={participation.weeklyConsistency}
            color="orange"
          />
        </CardContent>
      </Card>

      {/* CI - Comportamiento Colectivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="size-5 text-green-600" />
            Comportamiento Colectivo (CI)
          </CardTitle>
          <CardDescription>
            Análisis del comportamiento del grupo
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Respuestas por Pregunta"
            value={collective.answersPerQuestion.toFixed(1)}
            icon={<MessageSquare className="size-5" />}
            progress={(collective.answersPerQuestion / 10) * 100}
            color="blue"
          />
          <MetricCard
            title="Tasa de Consenso"
            value={`${collective.consensusRate.toFixed(1)}%`}
            icon={<Target className="size-5" />}
            progress={collective.consensusRate}
            color="green"
          />
          <MetricCard
            title="Diversidad de Fuentes"
            value={`${collective.sourceDiversity.toFixed(1)}%`}
            icon={<Users className="size-5" />}
            progress={collective.sourceDiversity}
            color="purple"
          />
        </CardContent>
      </Card>

      {/* RI - Conocimiento Individual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="size-5 text-purple-600" />
            Conocimiento Individual (RI)
          </CardTitle>
          <CardDescription>
            Métricas de conocimiento y mejora académica
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Mejora Promedio"
            value={knowledge.prePostImprovement > 0 ? `+${knowledge.prePostImprovement.toFixed(2)}` : knowledge.prePostImprovement.toFixed(2)}
            icon={<TrendingUp className="size-5" />}
            progress={Math.max(0, (knowledge.prePostImprovement / 5) * 100)}
            color="green"
            showTrend
          />
          <MetricCard
            title="Logros de Objetivos"
            value={`${knowledge.studyGoalAchievements.toFixed(1)}%`}
            icon={<Award className="size-5" />}
            progress={knowledge.studyGoalAchievements}
            color="blue"
          />
          <MetricCard
            title="Ganancia Promedio"
            value={knowledge.averageGain > 0 ? `+${knowledge.averageGain.toFixed(2)}` : knowledge.averageGain.toFixed(2)}
            icon={<Target className="size-5" />}
            progress={Math.max(0, (knowledge.averageGain / 5) * 100)}
            color="orange"
          />
        </CardContent>
      </Card>

      {/* Coverage por Ciudad */}
      {Object.keys(collective.coverageByCity).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cobertura por Ciudad</CardTitle>
            <CardDescription>
              Distribución de usuarios por ubicación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {Object.entries(collective.coverageByCity)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([city, count]) => (
                  <div key={city} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-semibold text-sm">{city}</div>
                    <div className="text-xs text-gray-600">{count} usuarios</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  progress: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
  showTrend?: boolean;
}

function MetricCard({ title, value, icon, progress, color, showTrend }: MetricCardProps) {
  const colors = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100'
  };

  return (
    <div className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
        {showTrend && progress > 0 && (
          <Badge variant="secondary" className="text-green-600">
            <TrendingUp className="size-3 mr-1" />
            Mejorando
          </Badge>
        )}
      </div>
      <div className="space-y-2">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-600">{title}</div>
        <Progress value={Math.min(100, Math.max(0, progress))} className="h-2" />
      </div>
    </div>
  );
}
