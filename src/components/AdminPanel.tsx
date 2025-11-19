// Panel de administración completo
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { formatPriceCOP, formatDate } from '../utils/formatters';
import { 
  Shield,
  Users,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Ban,
  Unlock,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  Crown,
  Star,
  DollarSign,
  Calendar,
  MessageSquare,
  FileText,
  Activity
} from 'lucide-react';

interface AdminPanelProps {
  className?: string;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTutors: number;
  totalStudents: number;
  totalSessions: number;
  totalRevenue: number;
  averageRating: number;
  pendingReports: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'tutor' | 'student';
  status: 'active' | 'inactive' | 'banned';
  createdAt: Date;
  lastLogin: Date;
  totalSessions: number;
  rating: number;
  reports: number;
}

interface Report {
  id: string;
  type: 'user' | 'content' | 'payment' | 'technical';
  reporterId: string;
  reportedUserId: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export function AdminPanel({ className }: AdminPanelProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError('');

      // Simular carga de datos de administración
      const mockStats: AdminStats = {
        totalUsers: 1247,
        activeUsers: 892,
        totalTutors: 89,
        totalStudents: 1158,
        totalSessions: 3456,
        totalRevenue: 125000000,
        averageRating: 4.7,
        pendingReports: 12,
        systemHealth: 'good'
      };

      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Dr. María González',
          email: 'maria@example.com',
          role: 'tutor',
          status: 'active',
          createdAt: new Date('2024-01-15'),
          lastLogin: new Date(),
          totalSessions: 156,
          rating: 4.9,
          reports: 0
        },
        {
          id: '2',
          name: 'Sofia López',
          email: 'sofia@example.com',
          role: 'student',
          status: 'active',
          createdAt: new Date('2024-02-20'),
          lastLogin: new Date(Date.now() - 86400000),
          totalSessions: 45,
          rating: 4.8,
          reports: 0
        },
        {
          id: '3',
          name: 'Carlos Ruiz',
          email: 'carlos@example.com',
          role: 'tutor',
          status: 'banned',
          createdAt: new Date('2024-01-10'),
          lastLogin: new Date(Date.now() - 7 * 86400000),
          totalSessions: 23,
          rating: 2.1,
          reports: 3
        }
      ];

      const mockReports: Report[] = [
        {
          id: '1',
          type: 'user',
          reporterId: 'user-1',
          reportedUserId: 'user-3',
          reason: 'Comportamiento inapropiado',
          description: 'El tutor ha mostrado comportamiento inapropiado durante las sesiones',
          status: 'pending',
          createdAt: new Date(),
          priority: 'high'
        },
        {
          id: '2',
          type: 'payment',
          reporterId: 'user-2',
          reportedUserId: 'user-4',
          reason: 'Problema con el pago',
          description: 'No se ha procesado el pago de la sesión',
          status: 'reviewed',
          createdAt: new Date(Date.now() - 86400000),
          priority: 'medium'
        }
      ];

      setStats(mockStats);
      setUsers(mockUsers);
      setReports(mockReports);
    } catch (err) {
      setError('Error cargando datos de administración');
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-yellow-600 bg-yellow-100';
      case 'banned': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="size-4" />;
      case 'tutor': return <Star className="size-4" />;
      case 'student': return <Users className="size-4" />;
      default: return <Users className="size-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <RefreshCw className="size-6 animate-spin text-blue-500" />
            <span className="text-lg">Cargando panel de administración...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p className="text-lg font-medium">{error}</p>
              <Button onClick={loadAdminData} className="mt-4">
                <RefreshCw className="size-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600">Gestión completa de la plataforma</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={loadAdminData} variant="outline">
            <RefreshCw className="size-4 mr-2" />
            Actualizar
          </Button>
          <Button>
            <Download className="size-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Estadísticas principales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{stats.activeUsers} activos</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="size-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tutores</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTutors.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Registrados</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Star className="size-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sesiones</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSessions.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Completadas</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Calendar className="size-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPriceCOP(stats.totalRevenue)}</p>
                  <p className="text-xs text-gray-500">Totales</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <DollarSign className="size-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs de administración */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        {/* Tab de Usuarios */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5" />
                Gestión de Usuarios
              </CardTitle>
              <CardDescription>
                Administrar usuarios, permisos y estados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <Label htmlFor="search">Buscar</Label>
                  <Input
                    id="search"
                    placeholder="Buscar usuarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Rol</Label>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="tutor">Tutor</SelectItem>
                      <SelectItem value="student">Estudiante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="banned">Baneado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full">
                    <Filter className="size-4 mr-2" />
                    Aplicar
                  </Button>
                </div>
              </div>

              {/* Lista de usuarios */}
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getRoleIcon(user.role)}
                      </div>
                      <div>
                        <h4 className="font-medium">{user.name}</h4>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {user.role}
                          </Badge>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                          {user.rating > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Star className="size-3 text-yellow-400 fill-current" />
                              {user.rating}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm text-gray-500">
                        <p>{user.totalSessions} sesiones</p>
                        <p>Último login: {formatDate(user.lastLogin)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="size-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="size-4" />
                        </Button>
                        {user.status === 'active' ? (
                          <Button variant="ghost" size="sm" className="text-red-500">
                            <Ban className="size-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-green-500">
                            <Unlock className="size-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-red-500">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Reportes */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="size-5" />
                Reportes Pendientes
              </CardTitle>
              <CardDescription>
                Gestionar reportes y moderación de contenido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getPriorityColor(report.priority)}>
                            {report.priority}
                          </Badge>
                          <Badge variant="outline">
                            {report.type}
                          </Badge>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                        </div>
                        <h4 className="font-medium mb-1">{report.reason}</h4>
                        <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                        <p className="text-xs text-gray-500">
                          Reportado el {formatDate(report.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="size-4 mr-2" />
                          Revisar
                        </Button>
                        <Button variant="outline" size="sm">
                          <CheckCircle className="size-4 mr-2" />
                          Resolver
                        </Button>
                        <Button variant="outline" size="sm">
                          <XCircle className="size-4 mr-2" />
                          Descartar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="size-5" />
                Analytics de Administración
              </CardTitle>
              <CardDescription>
                Métricas y estadísticas del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <BarChart3 className="size-12 mx-auto mb-4 text-gray-300" />
                <p>Analytics detallados disponibles</p>
                <p className="text-sm">Gráficos y métricas avanzadas</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Configuración */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="size-5" />
                Configuración del Sistema
              </CardTitle>
              <CardDescription>
                Ajustes globales de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="system-health">Estado del Sistema</Label>
                  <div className="mt-2">
                    <Badge className={getStatusColor(stats?.systemHealth || 'good')}>
                      {stats?.systemHealth || 'good'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label htmlFor="maintenance">Modo de Mantenimiento</Label>
                  <div className="mt-2">
                    <Button variant="outline" size="sm">
                      Activar Mantenimiento
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="backup">Respaldo de Datos</Label>
                  <div className="mt-2">
                    <Button variant="outline" size="sm">
                      <Download className="size-4 mr-2" />
                      Crear Respaldo
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
