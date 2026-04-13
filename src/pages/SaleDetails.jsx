import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, 
  Trash2, 
  Package,
  User,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  Calendar,
  Share2,
  Check
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import moment from 'moment';

const paymentConfig = {
  dinheiro: { label: 'Dinheiro', icon: Banknote, color: 'bg-emerald-100 text-emerald-700' },
  pix: { label: 'PIX', icon: Smartphone, color: 'bg-purple-100 text-purple-700' },
  cartao: { label: 'Cartão', icon: CreditCard, color: 'bg-blue-100 text-blue-700' },
  fiado: { label: 'Fiado', icon: Clock, color: 'bg-amber-100 text-amber-700' },
};

export default function SaleDetails() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingPayment, setEditingPayment] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState('');

  const params = new URLSearchParams(window.location.search);
  const saleId = params.get('id');

  const { data: sale, isLoading } = useQuery({
    queryKey: ['sale', saleId],
    queryFn: async () => {
      const sales = await base44.entities.Sale.filter({ id: saleId });
      return sales[0];
    },
    enabled: !!saleId,
  });

  const { data: installments = [] } = useQuery({
    queryKey: ['installments', saleId],
    queryFn: () => base44.entities.Installment.filter({ sale_id: saleId }),
    enabled: !!saleId,
  });

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // If fiado, restore customer credit
      if (sale.payment_method === 'fiado' && sale.customer_id) {
        const customers = await base44.entities.Customer.filter({ id: sale.customer_id });
        if (customers[0]) {
          await base44.entities.Customer.update(sale.customer_id, {
            credit_balance: Math.max(0, (customers[0].credit_balance || 0) - (sale.total_amount || 0)),
          });
        }
      }

      await base44.entities.Sale.delete(saleId);
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Venda excluída!');
      navigate(createPageUrl('Sales'));
    } catch (error) {
      toast.error('Erro ao excluir venda');
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  const shareReceipt = () => {
    const items = (sale.items || []).map(i => `${i.quantity}x ${i.product_name}: R$ ${i.subtotal.toFixed(2)}`).join('\n');
    const text = `🛍️ *Comprovante de Venda*\n\n${items}\n\n*Total: R$ ${sale.total_amount.toFixed(2)}*\n\nObrigado pela preferência! 💜`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Comprovante de Venda',
        text: text,
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Comprovante copiado!');
    }
  };

  const handleUpdatePayment = async () => {
    if (!newPaymentMethod) {
      toast.error('Selecione uma forma de pagamento');
      return;
    }

    try {
      const updates = {
        payment_method: newPaymentMethod,
        status: newPaymentMethod === 'fiado' ? 'pendente' : 'concluida'
      };

      // If changing FROM fiado, restore customer credit
      if (sale.payment_method === 'fiado' && newPaymentMethod !== 'fiado' && sale.customer_id) {
        const customers = await base44.entities.Customer.filter({ id: sale.customer_id });
        if (customers[0]) {
          await base44.entities.Customer.update(sale.customer_id, {
            credit_balance: Math.max(0, (customers[0].credit_balance || 0) - (sale.total_amount || 0))
          });
        }
      }

      // If changing TO fiado, add to customer credit
      if (sale.payment_method !== 'fiado' && newPaymentMethod === 'fiado' && sale.customer_id) {
        const customers = await base44.entities.Customer.filter({ id: sale.customer_id });
        if (customers[0]) {
          await base44.entities.Customer.update(sale.customer_id, {
            credit_balance: (customers[0].credit_balance || 0) + (sale.total_amount || 0)
          });
        }
      }

      await base44.entities.Sale.update(saleId, updates);
      queryClient.invalidateQueries({ queryKey: ['sale', saleId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setEditingPayment(false);
      toast.success('Forma de pagamento atualizada!');
    } catch (error) {
      toast.error('Erro ao atualizar');
    }
  };

  if (isLoading || !sale) {
    return (
      <div className="p-4 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const payment = paymentConfig[sale.payment_method] || paymentConfig.dinheiro;
  const PaymentIcon = payment.icon;

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(createPageUrl('Sales'))}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">Detalhes da Venda</h1>
          <p className="text-slate-500 text-sm">
            {moment(sale.sale_date || sale.created_date).format('DD/MM/YYYY HH:mm')}
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={shareReceipt}>
          <Share2 className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setShowDelete(true)} className="text-red-500">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Customer & Payment Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <User className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Cliente</p>
              <p className="font-medium text-slate-800">
                {sale.customer_name || 'Venda Avulsa'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <button 
            onClick={() => {
              setEditingPayment(true);
              setNewPaymentMethod(sale.payment_method);
            }}
            className="flex items-center gap-3 w-full text-left hover:opacity-75 transition-opacity"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${payment.color}`}>
              <PaymentIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400">Pagamento</p>
              <p className="font-medium text-slate-800">{payment.label}</p>
            </div>
            <span className="text-xs text-purple-600">Alterar</span>
          </button>
        </div>
      </div>

      {/* Edit Payment Dialog */}
      <AlertDialog open={editingPayment} onOpenChange={setEditingPayment}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterar Forma de Pagamento</AlertDialogTitle>
            <AlertDialogDescription>
              Escolha a nova forma de pagamento para esta venda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="grid grid-cols-2 gap-3 py-4">
            {Object.entries(paymentConfig).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <button
                  key={key}
                  onClick={() => setNewPaymentMethod(key)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    newPaymentMethod === key 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-sm font-medium ${
                    newPaymentMethod === key ? 'text-purple-600' : 'text-slate-600'
                  }`}>
                    {config.label}
                  </span>
                </button>
              );
            })}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleUpdatePayment}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Salvar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status */}
      {sale.payment_method === 'fiado' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
          <Clock className="w-6 h-6 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800">Venda Fiado</p>
            <p className="text-sm text-amber-600">Aguardando pagamento do cliente</p>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Itens da Venda</h3>
        </div>
        
        <div className="divide-y divide-slate-50">
          {(sale.items || []).map((item, index) => (
            <div key={index} className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">{item.product_name}</p>
                <p className="text-sm text-slate-400">
                  {item.quantity}x R$ {(item.unit_price || 0).toFixed(2)}
                </p>
              </div>
              <p className="font-bold text-slate-800">R$ {(item.subtotal || 0).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-slate-500">Subtotal</span>
          <span className="text-slate-700">R$ {(sale.total_amount || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Custo</span>
          <span className="text-slate-700">R$ {(sale.total_cost || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-emerald-600">
          <span>Lucro</span>
          <span className="font-medium">R$ {(sale.profit || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between pt-3 border-t border-slate-200">
          <span className="font-bold text-slate-800 text-lg">Total</span>
          <span className="font-bold text-purple-600 text-lg">R$ {(sale.total_amount || 0).toFixed(2)}</span>
        </div>
      </div>

      {/* Installments */}
      {installments.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Parcelamento</h3>
            <p className="text-xs text-slate-500 mt-1">{installments.length}x de R$ {(sale.total_amount / installments.length).toFixed(2)}</p>
          </div>
          
          <div className="divide-y divide-slate-50">
            {installments.map((inst) => (
              <div key={inst.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {inst.status === 'paga' ? (
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-600" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Parcela {inst.installment_number}/{inst.total_installments}
                    </p>
                    <p className="text-xs text-slate-500">
                      Vence {moment(inst.due_date).format('DD/MM/YYYY')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">R$ {inst.amount.toFixed(2)}</p>
                  <Badge className={inst.status === 'paga' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                    {inst.status === 'paga' ? 'Paga' : 'Pendente'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sale Info */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-slate-500">Data:</span>
          <span className="text-slate-700">
            {moment(sale.sale_date || sale.created_date).format('DD/MM/YYYY [às] HH:mm')}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Package className="w-4 h-4 text-slate-400" />
          <span className="text-slate-500">Tipo:</span>
          <span className="text-slate-700">
            {sale.sale_type === 'pronta_entrega' ? 'Pronta Entrega' : 'Encomenda'}
          </span>
        </div>
        {sale.notes && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-sm text-slate-500">Observações:</p>
            <p className="text-slate-700 mt-1">{sale.notes}</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir venda?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O estoque não será restaurado automaticamente.
              {sale.payment_method === 'fiado' && ' O saldo de fiado do cliente será atualizado.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}