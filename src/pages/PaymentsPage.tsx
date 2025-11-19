// Página de gestión de pagos con datos reales
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { paymentService, COLOMBIAN_BANKS } from '../services/payment';
import { Payment } from '../types';
import { formatPriceCOP, formatDate } from '../utils/formatters';
import { 
  CreditCard,
  Calendar,
  DollarSign,
  TrendingUp,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Banknote,
  Wallet,
  Receipt,
  Settings,
  Plus,
  Trash2,
  ExternalLink,
  Smartphone,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';

interface PaymentsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'digital_wallet';
  name: string;
  last4?: string;
  brand?: string;
  bankInfo?: any;
  isDefault: boolean;
}

interface EarningsStats {
  totalEarnings: number;
  monthlyEarnings: number;
  pendingPayouts: number;
  completedSessions: number;
  lastPayouts: Payment[];
}

export function PaymentsPage({ onNavigate }: PaymentsPageProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [earningsStats, setEarningsStats] = useState<EarningsStats | null>(null);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBankForWithdraw, setSelectedBankForWithdraw] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');

      // Cargar datos reales del usuario
      const [userPayments, userPaymentMethods] = await Promise.all([
        paymentService.getUserPayments(user.id),
        paymentService.getPaymentMethods(user.id)
      ]);

      setPayments(userPayments);
      setPaymentMethods(userPaymentMethods);

      // Si es tutor, cargar estadísticas de ganancias
      if (user.currentMode === 'tutor') {
        const stats = await paymentService.getTutorEarnings(user.id);
        setEarningsStats(stats);
      }

    } catch (err) {
      setError('Error al cargar los datos de pagos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!user || !withdrawAmount || !selectedBankForWithdraw) return;

    try {
      setWithdrawLoading(true);
      
      const amount = parseFloat(withdrawAmount);
      if (amount < 50000) {
        setError('El monto mínimo para retiro es $50.000 COP');
        return;
      }

      await paymentService.requestPayout(user.id, amount, selectedBankForWithdraw);
      
      setShowWithdrawDialog(false);
      setWithdrawAmount('');
      setSelectedBankForWithdraw('');
      
      // Recargar datos
      await loadData();
      
      // Mostrar éxito
      alert('Solicitud de retiro enviada exitosamente. Se procesará en 1-3 días hábiles.');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el retiro');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const getTransactionIcon = (payment: Payment) => {
    if (payment.studentId === user?.id) {
      // Pagos realizados (gastos)
      return <ArrowUpRight className="size-4 text-red-600" />;
    } else {
      // Pagos recibidos (ingresos)
      return <ArrowDownRight className="size-4 text-green-600" />;
    }
  };

  const getTransactionType = (payment: Payment): string => {
    if (payment.studentId === user?.id) {
      return 'Pago realizado';
    } else {
      return 'Pago recibido';
    }
  };

  const getStatusBadge = (status: Payment['status']) => {
    const variants = {
      completed: { variant: 'default' as const, label: 'Completado', color: 'text-green-600' },
      pending: { variant: 'secondary' as const, label: 'Pendiente', color: 'text-yellow-600' },
      failed: { variant: 'destructive' as const, label: 'Fallida', color: 'text-red-600' },
      refunded: { variant: 'outline' as const, label: 'Reembolsado', color: 'text-blue-600' },
    };

    const config = variants[status];
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method.type) {
      case 'card':
        return <CreditCard className="size-5 text-blue-600" />;
      case 'bank':
        return <Building2 className="size-5 text-green-600" />;
      case 'digital_wallet':
        return <Smartphone className="size-5 text-purple-600" />;
      default:
        return <Wallet className="size-5 text-gray-600" />;
    }
  };

  const handleAddPaymentMethod = () => {
    setShowAddMethod(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl mb-2">Gestión de Pagos</h1>
          <p className="text-gray-600">Cargando información de pagos...</p>
        </div>
        
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-2xl mb-2">Gestión de Pagos</h1>
          <p className="text-gray-600">
            {user?.currentMode === 'tutor' 
              ? 'Administra tus ganancias y métodos de cobro'
              : 'Administra tus métodos de pago y transacciones'
            }
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards para Tutores */}
        {user?.currentMode === 'tutor' && earningsStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Wallet className="size-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ganancias totales</p>
                    <p className="text-xl">{formatPriceCOP(earningsStats.totalEarnings)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Este mes</p>
                    <p className="text-xl">{formatPriceCOP(earningsStats.monthlyEarnings)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="size-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pendiente de pago</p>
                    <p className="text-xl">{formatPriceCOP(earningsStats.pendingPayouts)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CheckCircle className="size-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Clases completadas</p>
                    <p className="text-xl">{earningsStats.completedSessions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">Transacciones</TabsTrigger>
            <TabsTrigger value="methods">Métodos de Pago</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg">Historial de Transacciones</h3>
              {user?.currentMode === 'tutor' && earningsStats?.pendingPayouts && earningsStats.pendingPayouts > 0 && (
                <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Download className="size-4 mr-2" />
                      Solicitar Retiro
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Solicitar Retiro de Fondos</DialogTitle>
                      <DialogDescription>
                        Retira tus ganancias a tu cuenta bancaria preferida
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Monto a retirar</Label>
                        <Input
                          type="number"
                          placeholder="50000"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                        />
                        <p className="text-sm text-gray-500">
                          Disponible: {formatPriceCOP(earningsStats?.pendingPayouts || 0)}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Banco de destino</Label>
                        <Select value={selectedBankForWithdraw} onValueChange={setSelectedBankForWithdraw}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu banco" />
                          </SelectTrigger>
                          <SelectContent>
                            {COLOMBIAN_BANKS.filter(bank => bank.supportedMethods.includes('transfer')).map((bank) => (
                              <SelectItem key={bank.id} value={bank.id}>
                                <div className="flex items-center gap-2">
                                  <span>{bank.logo}</span>
                                  <span>{bank.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowWithdrawDialog(false)}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleWithdraw}
                          disabled={withdrawLoading || !withdrawAmount || !selectedBankForWithdraw}
                          className="flex-1"
                        >
                          {withdrawLoading ? (
                            <>
                              <Loader2 className="size-4 mr-2 animate-spin" />
                              Procesando...
                            </>
                          ) : (
                            'Solicitar Retiro'
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {payments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Receipt className="size-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-600 mb-2">No hay transacciones</h3>
                  <p className="text-gray-500">
                    Tus pagos y cobros aparecerán aquí
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <Card key={payment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg">
                            {getTransactionIcon(payment)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{getTransactionType(payment)}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span>{formatDate(payment.createdAt)}</span>
                              <span>• {payment.paymentMethod}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-medium ${
                              payment.studentId === user?.id ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {payment.studentId === user?.id ? '-' : '+'}
                              {formatPriceCOP(payment.amount)}
                            </span>
                          </div>
                          {getStatusBadge(payment.status)}
                        </div>
                      </div>
                      
                      {payment.requestId && (
                        <div className="mt-3 pt-3 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onNavigate('requests')}
                          >
                            <Eye className="size-4 mr-1" />
                            Ver solicitud
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="methods" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg">Métodos de Pago</h3>
              <Button onClick={handleAddPaymentMethod}>
                <Plus className="size-4 mr-2" />
                Agregar Método
              </Button>
            </div>

            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <Card key={method.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg">
                          {getPaymentMethodIcon(method)}
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {method.name}
                          </h4>
                          <div className="text-sm text-gray-600">
                            {method.type === 'card' && 'Tarjeta de crédito/débito'}
                            {method.type === 'bank' && 'Cuenta bancaria'}
                            {method.type === 'digital_wallet' && 'Billetera digital'}
                            {method.bankInfo && method.bankInfo.supportedMethods && (
                              <span className="ml-2">
                                • Soporta: {method.bankInfo.supportedMethods.join(', ').toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {method.isDefault && (
                          <Badge variant="secondary">Por defecto</Badge>
                        )}
                        {method.bankInfo?.url && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(method.bankInfo.url, '_blank')}
                            title="Ir al sitio del banco"
                          >
                            <ExternalLink className="size-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Settings className="size-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Bancos disponibles para agregar */}
            <Card>
              <CardHeader>
                <CardTitle>Bancos Disponibles en Colombia</CardTitle>
                <CardDescription>
                  Conecta tu cuenta bancaria para recibir pagos más rápido
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {COLOMBIAN_BANKS.map((bank) => (
                    <Button
                      key={bank.id}
                      variant="outline"
                      className="h-auto p-3 flex flex-col items-center gap-2"
                      onClick={() => window.open(bank.url, '_blank')}
                    >
                      <span className="text-2xl">{bank.logo}</span>
                      <span className="text-xs text-center">{bank.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <h3 className="text-lg">Configuración de Pagos</h3>
            
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Retiros</CardTitle>
                <CardDescription>
                  Configura cómo y cuándo quieres recibir tus pagos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payout-frequency">Frecuencia de pagos</Label>
                  <Select defaultValue="weekly">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona frecuencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="biweekly">Quincenal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="min-payout">Monto mínimo para retiro</Label>
                  <Input 
                    id="min-payout" 
                    placeholder="50000" 
                    defaultValue="50000"
                  />
                  <p className="text-xs text-gray-500">
                    Monto mínimo en COP para procesar un retiro automático
                  </p>
                </div>

                <div className="pt-4">
                  <Button>Guardar Configuración</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información Fiscal</CardTitle>
                <CardDescription>
                  Información para reportes fiscales y certificados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tax-id">NIT / Cédula</Label>
                  <Input 
                    id="tax-id" 
                    placeholder="Número de identificación fiscal"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tax-regime">Régimen Fiscal</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona régimen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Régimen Simple</SelectItem>
                      <SelectItem value="common">Régimen Común</SelectItem>
                      <SelectItem value="iva">Responsable de IVA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4">
                  <Button variant="outline">
                    <Download className="size-4 mr-2" />
                    Descargar Certificado de Ingresos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}
