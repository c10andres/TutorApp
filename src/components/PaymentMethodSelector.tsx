// Componente para seleccionar método de pago
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { COLOMBIAN_BANKS } from '../services/payment';
import { 
  CreditCard, 
  Building2, 
  Smartphone, 
  ExternalLink,
  Shield,
  Zap,
  Clock
} from 'lucide-react';

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string, type: 'card' | 'pse' | 'transfer') => void;
  amount: number;
  className?: string;
}

export function PaymentMethodSelector({ 
  selectedMethod, 
  onMethodChange, 
  amount, 
  className = '' 
}: PaymentMethodSelectorProps) {
  
  const [selectedBank, setSelectedBank] = useState('');

  const handleMethodSelect = (method: string) => {
    if (method === 'card') {
      onMethodChange('card_visa_default', 'card');
    } else if (method === 'pse') {
      onMethodChange(selectedBank || 'bank_bancolombia', 'pse');
    } else {
      onMethodChange(method, 'transfer');
    }
  };

  const handleBankSelect = (bankId: string) => {
    setSelectedBank(bankId);
    onMethodChange(bankId, 'pse');
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-5" />
          Método de Pago
        </CardTitle>
        <CardDescription>
          Selecciona cómo deseas pagar tu tutoría de ${amount.toLocaleString('es-CO')} COP
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Método recomendado: PSE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">PSE - Pagos Seguros en Línea</Label>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Zap className="size-3 mr-1" />
                Recomendado
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                <Shield className="size-3 mr-1" />
                Seguro
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {COLOMBIAN_BANKS.filter(bank => bank.supportedMethods.includes('pse')).map((bank) => (
              <Button
                key={bank.id}
                type="button"
                variant={selectedMethod === bank.id ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => handleBankSelect(bank.id)}
              >
                <span className="text-2xl">{bank.logo}</span>
                <span className="text-xs text-center leading-tight">{bank.name}</span>
                {selectedMethod === bank.id && (
                  <Badge variant="secondary" className="text-xs">
                    Seleccionado
                  </Badge>
                )}
              </Button>
            ))}
          </div>
          
          {selectedBank && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <ExternalLink className="size-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-800 font-medium">¿Cómo funciona PSE?</p>
                  <p className="text-blue-700 mt-1">
                    Serás redirigido al sitio web seguro de tu banco para completar el pago. 
                    Es el método más rápido y seguro para pagar en Colombia.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divisor */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-500">o paga con</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Tarjeta de crédito/débito */}
        <div className="space-y-3">
          <Button
            type="button"
            variant={selectedMethod === 'card_visa_default' ? "default" : "outline"}
            className="w-full h-auto p-4 justify-start"
            onClick={() => handleMethodSelect('card')}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="size-5" />
              <div className="text-left">
                <div className="font-medium">Tarjeta de Crédito/Débito</div>
                <div className="text-sm opacity-75">Visa, Mastercard, American Express</div>
              </div>
            </div>
            {selectedMethod === 'card_visa_default' && (
              <Badge variant="secondary" className="ml-auto">
                Seleccionado
              </Badge>
            )}
          </Button>
          
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Clock className="size-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="text-yellow-800 font-medium">Tarjetas internacionales</p>
                <p className="text-yellow-700 mt-1">
                  Para tarjetas emitidas fuera de Colombia. El procesamiento puede tomar 1-2 días adicionales.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Billeteras digitales */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Billeteras Digitales</Label>
          
          <div className="grid grid-cols-2 gap-3">
            {COLOMBIAN_BANKS.filter(bank => bank.id === 'nequi' || bank.id === 'daviplata').map((wallet) => (
              <Button
                key={wallet.id}
                type="button"
                variant={selectedMethod === wallet.id ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => onMethodChange(wallet.id, 'transfer')}
              >
                <span className="text-2xl">{wallet.logo}</span>
                <span className="text-sm font-medium">{wallet.name}</span>
                {selectedMethod === wallet.id && (
                  <Badge variant="secondary" className="text-xs">
                    Seleccionado
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Información de seguridad */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="size-4 text-gray-600 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium">Pago 100% seguro</p>
              <p className="mt-1">
                Todos los pagos están protegidos por encriptación SSL y no almacenamos información de tarjetas.
                Tu dinero está protegido hasta que la tutoría sea completada.
              </p>
            </div>
          </div>
        </div>

        {/* Mostrar método seleccionado */}
        {selectedMethod && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="size-2 bg-green-500 rounded-full" />
              <span className="font-medium text-green-800">
                Método seleccionado: {
                  selectedMethod.startsWith('card') ? 'Tarjeta de crédito/débito' :
                  COLOMBIAN_BANKS.find(b => b.id === selectedMethod)?.name || selectedMethod
                }
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
