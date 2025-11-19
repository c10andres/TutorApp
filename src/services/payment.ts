// Servicio de pagos con integración colombiana
import { Payment } from '../types';

interface BankInfo {
  id: string;
  name: string;
  logo: string;
  color: string;
  url: string;
  supportedMethods: ('pse' | 'transfer' | 'card')[];
}

// Bancos colombianos principales
export const COLOMBIAN_BANKS: BankInfo[] = [
  {
    id: 'bancolombia',
    name: 'Bancolombia',
    logo: '🏛️',
    color: '#FFED00',
    url: 'https://www.bancolombia.com/personas/productos-servicios/canales-digitales/banca-virtual',
    supportedMethods: ['pse', 'transfer', 'card']
  },
  {
    id: 'banco-bogota',
    name: 'Banco de Bogotá',
    logo: '🏦',
    color: '#003DA5',
    url: 'https://www.bancodebogota.com/wps/portal/banco-de-bogota/bogota/personas/canales/banca-virtual/',
    supportedMethods: ['pse', 'transfer', 'card']
  },
  {
    id: 'davivienda',
    name: 'Davivienda',
    logo: '🏪',
    color: '#E4002B',
    url: 'https://www.davivienda.com/wps/portal/personas/nuevo',
    supportedMethods: ['pse', 'transfer', 'card']
  },
  {
    id: 'bbva',
    name: 'BBVA Colombia',
    logo: '🏧',
    color: '#004481',
    url: 'https://www.bbva.com.co/personas/banca-digital.html',
    supportedMethods: ['pse', 'transfer', 'card']
  },
  {
    id: 'itau',
    name: 'Itaú',
    logo: '🔶',
    color: '#FF6800',
    url: 'https://www.itau.co/personas/',
    supportedMethods: ['pse', 'transfer', 'card']
  },
  {
    id: 'scotiabank',
    name: 'Scotiabank Colpatria',
    logo: '🏴',
    color: '#DA020E',
    url: 'https://www.scotiabankcolpatria.com/',
    supportedMethods: ['pse', 'transfer', 'card']
  },
  {
    id: 'banco-caja-social',
    name: 'Banco Caja Social',
    logo: '🏢',
    color: '#1B365D',
    url: 'https://www.bancocajasocial.com/',
    supportedMethods: ['pse', 'transfer']
  },
  {
    id: 'banco-popular',
    name: 'Banco Popular',
    logo: '🏛️',
    color: '#FF0000',
    url: 'https://www.bancopopular.com.co/',
    supportedMethods: ['pse', 'transfer']
  },
  {
    id: 'nequi',
    name: 'Nequi',
    logo: '📱',
    color: '#FF3366',
    url: 'https://www.nequi.com.co/',
    supportedMethods: ['transfer']
  },
  {
    id: 'daviplata',
    name: 'DaviPlata',
    logo: '💳',
    color: '#E4002B',
    url: 'https://www.daviplata.com/',
    supportedMethods: ['transfer']
  }
];

interface PSETransaction {
  id: string;
  bankId: string;
  amount: number;
  reference: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  redirectUrl: string;
  returnUrl: string;
  createdAt: Date;
}

let mockPayments: Payment[] = [];
let mockTransactions: PSETransaction[] = [];

class PaymentService {
  
  // Crear transacción PSE (Pagos Seguros en Línea)
  async createPSETransaction(
    bankId: string,
    amount: number,
    description: string,
    userEmail: string,
    requestId: string
  ): Promise<PSETransaction> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const bank = COLOMBIAN_BANKS.find(b => b.id === bankId);
    if (!bank) {
      throw new Error('Banco no soportado');
    }

    const transaction: PSETransaction = {
      id: `pse_${Date.now()}`,
      bankId,
      amount,
      reference: `REF${Date.now()}`,
      status: 'pending',
      redirectUrl: bank.url,
      returnUrl: `${window.location.origin}/payments/return`,
      createdAt: new Date()
    };

    mockTransactions.push(transaction);
    
    // Simular redirección del banco
    console.log(`🏦 Redirecting to ${bank.name} for PSE payment...`);
    
    return transaction;
  }

  // Redirigir al banco seleccionado
  redirectToBankPayment(transaction: PSETransaction): void {
    const bank = COLOMBIAN_BANKS.find(b => b.id === transaction.bankId);
    if (!bank) {
      throw new Error('Banco no encontrado');
    }

    // En un entorno real, esto abriría la ventana del banco
    const paymentWindow = window.open(
      bank.url,
      'bank_payment',
      'width=800,height=600,scrollbars=yes,resizable=yes'
    );

    // Simular el proceso de pago del banco después de 5 segundos
    setTimeout(() => {
      if (paymentWindow) {
        paymentWindow.close();
      }
      
      // Simular respuesta del banco (90% éxito)
      const success = Math.random() > 0.1;
      this.handleBankCallback(transaction.id, success ? 'completed' : 'failed');
    }, 5000);
  }

  // Manejar respuesta del banco
  private handleBankCallback(transactionId: string, status: 'completed' | 'failed' | 'cancelled'): void {
    const transactionIndex = mockTransactions.findIndex(t => t.id === transactionId);
    if (transactionIndex !== -1) {
      mockTransactions[transactionIndex].status = status;
      console.log(`💳 PSE Transaction ${transactionId} status: ${status}`);
      
      // Disparar evento personalizado para notificar a la UI
      window.dispatchEvent(new CustomEvent('pse-payment-update', {
        detail: { transactionId, status }
      }));
    }
  }

  // Integración con Stripe para tarjetas internacionales
  async createPaymentIntent(amount: number, currency: string = 'cop'): Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      clientSecret: `pi_mock_${Date.now()}_secret`,
      paymentIntentId: `pi_mock_${Date.now()}`,
    };
  }

  // Procesar pago (ahora con soporte para múltiples métodos)
  async processPayment(
    requestId: string,
    studentId: string,
    tutorId: string,
    amount: number,
    paymentMethodId: string,
    paymentType: 'card' | 'pse' | 'transfer' = 'card'
  ): Promise<Payment> {
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Para PSE, crear transacción especial
    if (paymentType === 'pse') {
      const bankId = paymentMethodId.replace('bank_', '');
      const pseTransaction = await this.createPSETransaction(
        bankId,
        amount,
        `Pago tutoría ${requestId}`,
        'user@example.com',
        requestId
      );
      
      // Redirigir al banco
      this.redirectToBankPayment(pseTransaction);
      
      // Por ahora, marcar como pendiente
      const payment: Payment = {
        id: Date.now().toString(),
        requestId,
        studentId,
        tutorId,
        amount,
        status: 'pending',
        paymentMethod: paymentMethodId,
        stripePaymentId: pseTransaction.id,
        createdAt: new Date(),
      };

      mockPayments.push(payment);
      return payment;
    }

    // Pago con tarjeta tradicional
    const success = Math.random() > 0.1; // 90% de éxito

    const payment: Payment = {
      id: Date.now().toString(),
      requestId,
      studentId,
      tutorId,
      amount,
      status: success ? 'completed' : 'failed',
      paymentMethod: paymentMethodId,
      stripePaymentId: `pi_mock_${Date.now()}`,
      createdAt: new Date(),
    };

    mockPayments.push(payment);

    if (!success) {
      throw new Error('El pago no pudo ser procesado. Intenta con otro método de pago.');
    }

    return payment;
  }

  // Obtener historial de pagos del usuario
  async getUserPayments(userId: string): Promise<Payment[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockPayments.filter(payment => 
      payment.studentId === userId || payment.tutorId === userId
    );
  }

  // Obtener estadísticas de ganancias para tutores
  async getTutorEarnings(tutorId: string): Promise<{
    totalEarnings: number;
    monthlyEarnings: number;
    pendingPayouts: number;
    completedSessions: number;
    lastPayouts: Payment[];
  }> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const tutorPayments = mockPayments.filter(p => p.tutorId === tutorId && p.status === 'completed');
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyPayments = tutorPayments.filter(p => {
      const paymentDate = new Date(p.createdAt);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });

    return {
      totalEarnings: tutorPayments.reduce((total, p) => total + (p.amount * 0.9), 0), // 90% después de comisión
      monthlyEarnings: monthlyPayments.reduce((total, p) => total + (p.amount * 0.9), 0),
      pendingPayouts: 125000, // Simulado
      completedSessions: tutorPayments.length,
      lastPayouts: tutorPayments.slice(-10)
    };
  }

  // Obtener métodos de pago guardados (incluyendo bancos colombianos)
  async getPaymentMethods(userId: string): Promise<Array<{
    id: string;
    type: 'card' | 'bank' | 'digital_wallet';
    name: string;
    last4?: string;
    brand?: string;
    bankInfo?: BankInfo;
    isDefault: boolean;
  }>> {
    await new Promise(resolve => setTimeout(resolve, 400));

    return [
      {
        id: 'card_visa_4242',
        type: 'card',
        name: 'Visa •••• 4242',
        last4: '4242',
        brand: 'Visa',
        isDefault: true,
      },
      {
        id: 'bank_bancolombia',
        type: 'bank',
        name: 'Bancolombia •••• 1234',
        last4: '1234',
        bankInfo: COLOMBIAN_BANKS.find(b => b.id === 'bancolombia'),
        isDefault: false,
      },
      {
        id: 'bank_nequi',
        type: 'digital_wallet',
        name: 'Nequi +57 300 123 4567',
        bankInfo: COLOMBIAN_BANKS.find(b => b.id === 'nequi'),
        isDefault: false,
      }
    ];
  }

  // Solicitar retiro de fondos
  async requestPayout(
    tutorId: string, 
    amount: number, 
    bankAccountId: string
  ): Promise<{
    id: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    estimatedDate: Date;
  }> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const payout = {
      id: `payout_${Date.now()}`,
      amount,
      status: 'pending' as const,
      estimatedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 días
    };

    console.log(`💸 Payout requested: ${amount} COP to account ${bankAccountId}`);
    
    return payout;
  }

  // Calcular comisión de la plataforma
  calculatePlatformFee(amount: number): number {
    return Math.round(amount * 0.1); // 10% de comisión
  }

  // Calcular monto total a cobrar al estudiante
  calculateTotalAmount(tutorRate: number, duration: number): number {
    const baseCost = (tutorRate * duration) / 60; // duration en minutos
    const platformFee = this.calculatePlatformFee(baseCost);
    return Math.round(baseCost + platformFee);
  }

  // Obtener información de un banco específico
  getBankInfo(bankId: string): BankInfo | null {
    return COLOMBIAN_BANKS.find(bank => bank.id === bankId) || null;
  }

  // Validar si un banco soporta un método de pago
  bankSupportsMethod(bankId: string, method: 'pse' | 'transfer' | 'card'): boolean {
    const bank = this.getBankInfo(bankId);
    return bank ? bank.supportedMethods.includes(method) : false;
  }
}

export const paymentService = new PaymentService();