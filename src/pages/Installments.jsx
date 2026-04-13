import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabaseHelpers } from '@/api/supabaseClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Smartphone,
  DollarSign
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import moment from 'moment';

const paymentIcons = {
  dinheiro: Banknote,
  pix: Smartphone,
  cartao: CreditCard,
};

export default function Installments() {
  const queryClient = useQueryClient();
  const [periodFilter, setPeriodFilter] = useState('pending');
  const [paymentDialog, setPaymentDialog] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');

  const { data: installments = [], isLoading } = useQuery({
    queryKey: ['credit_payments'],
    queryFn: () => supabaseHelpers.getAll('credit_payment', {
      orderBy: 'payment_date',
      ascending: false
    }),
  });

  const now = moment();
  const filteredInstallments = installments.filter(inst => {
    // Since we're using credit_payment, all are considered "paid"
    if (periodFilter === 'pending') return false; // No pending in credit_payment
    if (periodFilter === 'paid') return true;
    if (periodFilter === 'overdue') return false; // No overdue in credit_payment
    return true;
  });

  const handlePayInstallment = async () => {
    toast.success('Funcionalidade em desenvolvimento');
    setPaymentDialog(null);
    setPaymentMethod('');
  };

  const totalPending = 0; // No pending payments in credit_payment table
  const nextMonth = [];
  const nextMonthTotal = 0;

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pagamentos de Fiado</h1>
        <p className="text-slate-500 text-sm">{filteredInstallments.length} pagamentos registrados</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <p className="text-emerald-100 text-sm">Total Recebido</p>
          </div>
          <p className="text-2xl font-bold">R$ {filteredInstallments.reduce((sum, i) => sum + (i.amount || 0), 0).toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5" />
            <p className="text-purple-100 text-sm">Este Mês</p>
          </div>
          <p className="text-2xl font-bold">R$ {filteredInstallments.filter(i => moment(i.payment_date).isSame(now, 'month')).reduce((sum, i) => sum + (i.amount || 0), 0).toFixed(2)}</p>
          <p className="text-xs text-purple-100 mt-1">{filteredInstallments.filter(i => moment(i.payment_date).isSame(now, 'month')).length} pagamentos</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto">
        <Button
          variant={periodFilter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPeriodFilter('pending')}
          className={periodFilter === 'pending' ? 'bg-purple-500' : ''}
        >
          Pendentes
        </Button>
        <Button
          variant={periodFilter === 'overdue' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPeriodFilter('overdue')}
          className={periodFilter === 'overdue' ? 'bg-red-500' : ''}
        >
          Atrasadas
        </Button>
        <Button
          variant={periodFilter === 'paid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPeriodFilter('paid')}
          className={periodFilter === 'paid' ? 'bg-emerald-500' : ''}
        >
          Pagas
        </Button>
      </div>

      {/* Installments List */}
      <div className="space-y-2">
        {filteredInstallments.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma parcela encontrada</p>
          </div>
        ) : (
          filteredInstallments.map((inst) => {
            const isOverdue = inst.status === 'atrasada' || 
              (inst.status === 'pendente' && moment(inst.due_date).isBefore(now, 'day'));
            const isPaid = inst.status === 'paga';
            
            return (
              <div
                key={inst.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  isPaid 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : isOverdue 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-white border-slate-100 hover:shadow-sm'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isPaid 
                    ? 'bg-emerald-100' 
                    : isOverdue 
                      ? 'bg-red-100' 
                      : 'bg-amber-100'
                }`}>
                  {isPaid ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : isOverdue ? (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  ) : (
                    <Clock className="w-6 h-6 text-amber-600" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">
                    {inst.customer_name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">
                      Parcela {inst.installment_number}/{inst.total_installments}
                    </span>
                    <span className="text-xs text-slate-300">•</span>
                    <span className={`text-xs ${
                      isOverdue ? 'text-red-600 font-medium' : 'text-slate-500'
                    }`}>
                      {isOverdue ? 'Venceu ' : 'Vence '}
                      {moment(inst.due_date).format('DD/MM/YYYY')}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-slate-800">R$ {inst.amount.toFixed(2)}</p>
                  {isPaid && inst.payment_method && (
                    <Badge className="mt-1 bg-emerald-100 text-emerald-700 text-xs">
                      {inst.payment_method === 'pix' ? 'PIX' : 
                       inst.payment_method === 'cartao' ? 'Cartão' : 'Dinheiro'}
                    </Badge>
                  )}
                </div>
                
                {!isPaid && (
                  <Button
                    size="sm"
                    onClick={() => setPaymentDialog(inst)}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    Receber
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={!!paymentDialog} onOpenChange={() => setPaymentDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
          </DialogHeader>
          
          {paymentDialog && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-600">Cliente</p>
                <p className="font-semibold text-slate-800">{paymentDialog.customer_name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Parcela {paymentDialog.installment_number}/{paymentDialog.total_installments}
                </p>
              </div>

              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-sm text-purple-600">Valor da Parcela</p>
                <p className="text-3xl font-bold text-purple-700">
                  R$ {paymentDialog.amount.toFixed(2)}
                </p>
              </div>

              <div>
                <Label className="text-slate-700 mb-2 block">Forma de Pagamento</Label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(paymentIcons).map(([key, Icon]) => (
                    <button
                      key={key}
                      onClick={() => setPaymentMethod(key)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        paymentMethod === key 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-slate-200'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${
                        paymentMethod === key ? 'text-purple-600' : 'text-slate-400'
                      }`} />
                      <span className={`text-xs font-medium ${
                        paymentMethod === key ? 'text-purple-600' : 'text-slate-500'
                      }`}>
                        {key === 'pix' ? 'PIX' : key === 'cartao' ? 'Cartão' : 'Dinheiro'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPaymentDialog(null);
                    setPaymentMethod('');
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handlePayInstallment}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                >
                  Confirmar Pagamento
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}