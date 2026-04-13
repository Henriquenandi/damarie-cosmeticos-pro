import React, { useState } from 'react';
import { useCustomer, useCustomerMutation, useSales } from '@/hooks/useSupabase';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CustomerForm from '@/components/customers/CustomerForm';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Phone,
  Mail,
  ShoppingCart,
  CreditCard,
  Clock,
  DollarSign,
  Loader2,
  MessageCircle,
  ChevronRight
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import moment from 'moment';

export default function CustomerDetails() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [processing, setProcessing] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const customerId = params.get('id');

  const { data: customer, isLoading } = useCustomer(customerId);
  const { data: sales = [] } = useSales();
  const customerMutation = useCustomerMutation();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await customerMutation.mutateAsync({
        action: 'delete',
        id: customerId
      });
      navigate(createPageUrl('Customers'));
    } catch (error) {
      toast.error('Erro ao excluir cliente');
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  const handlePayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error('Informe um valor válido');
      return;
    }

    setProcessing(true);
    try {
      const newBalance = Math.max(0, (customer.credit_balance || 0) - amount);
      
      await customerMutation.mutateAsync({
        action: 'update',
        id: customerId,
        data: { credit_balance: newBalance }
      });

      // Note: Credit payment creation would need to be implemented
      toast.success('Pagamento registrado!');
      setShowPayment(false);
      setPaymentAmount('');
    } catch (error) {
      toast.error('Erro ao registrar pagamento');
    } finally {
      setProcessing(false);
    }
  };

  const openWhatsApp = () => {
    if (customer?.phone) {
      const phone = customer.phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${phone}`, '_blank');
    }
  };

  if (isLoading || !customer) {
    return (
      <div className="p-4 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const pendingSales = sales.filter(s => s.payment_method === 'fiado' && s.status === 'pendente');

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(createPageUrl('Customers'))}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">{customer.name}</h1>
        </div>
        <Button variant="outline" size="icon" onClick={() => setShowForm(true)}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setShowDelete(true)} className="text-red-500">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <span className="font-bold text-purple-600 text-3xl">
              {customer.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{customer.name}</h2>
            <p className="text-slate-500 text-sm">Cliente desde {moment(customer.created_date).format('MMM YYYY')}</p>
          </div>
        </div>

        <div className="space-y-3">
          {customer.phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-slate-400" />
              <span className="text-slate-700">{customer.phone}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={openWhatsApp}
                className="ml-auto text-green-600"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                WhatsApp
              </Button>
            </div>
          )}
          {customer.email && (
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-400" />
              <span className="text-slate-700">{customer.email}</span>
            </div>
          )}
        </div>

        {customer.notes && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">Observações:</p>
            <p className="text-slate-700 mt-1">{customer.notes}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Compras</p>
              <p className="font-bold text-slate-800">R$ {(customer.total_purchases || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className={`rounded-2xl border p-4 ${
          (customer.credit_balance || 0) > 0 
            ? 'bg-amber-50 border-amber-200' 
            : 'bg-white border-slate-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              (customer.credit_balance || 0) > 0 ? 'bg-amber-100' : 'bg-slate-100'
            }`}>
              <CreditCard className={`w-5 h-5 ${
                (customer.credit_balance || 0) > 0 ? 'text-amber-600' : 'text-slate-400'
              }`} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Fiado Pendente</p>
              <p className={`font-bold ${
                (customer.credit_balance || 0) > 0 ? 'text-amber-700' : 'text-slate-800'
              }`}>
                R$ {(customer.credit_balance || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Action */}
      {(customer.credit_balance || 0) > 0 && (
        <Button 
          onClick={() => setShowPayment(true)}
          className="w-full h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
        >
          <DollarSign className="w-5 h-5 mr-2" />
          Registrar Pagamento de Fiado
        </Button>
      )}

      {/* Purchase History */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Histórico de Compras</h3>
          <p className="text-sm text-slate-400">{sales.length} compras</p>
        </div>
        
        <div className="divide-y divide-slate-50">
          {sales.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Nenhuma compra registrada</p>
            </div>
          ) : (
            sales.slice(0, 10).map((sale) => (
              <Link
                key={sale.id}
                to={createPageUrl('SaleDetails') + `?id=${sale.id}`}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  sale.payment_method === 'fiado' ? 'bg-amber-100' : 'bg-emerald-100'
                }`}>
                  {sale.payment_method === 'fiado' ? (
                    <Clock className="w-5 h-5 text-amber-600" />
                  ) : (
                    <ShoppingCart className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800">
                    {(sale.items || []).length} itens
                  </p>
                  <p className="text-xs text-slate-400">
                    {moment(sale.sale_date || sale.created_date).format('DD/MM/YYYY HH:mm')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">R$ {(sale.total_amount || 0).toFixed(2)}</p>
                  {sale.payment_method === 'fiado' && (
                    <Badge className="bg-amber-100 text-amber-700 text-[10px]">Fiado</Badge>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Quick Action */}
      <Button 
        onClick={() => navigate(createPageUrl('NewSale'))}
        variant="outline"
        className="w-full h-14"
      >
        <ShoppingCart className="w-5 h-5 mr-2" />
        Nova Venda para {customer.name}
      </Button>

      {/* Edit Sheet */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Editar Cliente</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <CustomerForm
              customer={customer}
              onSave={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Saldo atual de fiado: R$ {(customer.credit_balance || 0).toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
              <Input
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0,00"
                className="pl-10 text-lg"
              />
            </div>
            <div className="flex gap-2 mt-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPaymentAmount((customer.credit_balance / 2).toFixed(2))}
              >
                Metade
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPaymentAmount(customer.credit_balance.toFixed(2))}
              >
                Total
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayment(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handlePayment}
              disabled={processing}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar Pagamento'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O histórico de compras será mantido.
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