import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/supabaseClient';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Cake,
  Gift,
  Calendar,
  Phone,
  Ticket,
  AlertCircle,
  Loader2,
  MessageCircle
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import moment from 'moment';

export default function Birthdays() {
  const queryClient = useQueryClient();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showVoucherDialog, setShowVoucherDialog] = useState(false);
  const [generatedVoucherId, setGeneratedVoucherId] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [filterTab, setFilterTab] = useState('month');
  
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(15);
  const [validityDays, setValidityDays] = useState(15);
  const [minimumPurchase, setMinimumPurchase] = useState(0);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list(),
  });

  const { data: vouchers = [] } = useQuery({
    queryKey: ['vouchers'],
    queryFn: () => base44.entities.Voucher.list(),
  });

  const now = moment();
  const currentMonth = now.month();
  const currentWeekStart = now.clone().startOf('week');
  const currentWeekEnd = now.clone().endOf('week');

  // Filter customers based on tab
  const customersWithBirthdays = customers.filter(c => {
    if (!c.birth_date) return false;
    const birthDate = moment(c.birth_date);
    
    if (filterTab === 'today') {
      return birthDate.date() === now.date() && birthDate.month() === currentMonth;
    } else if (filterTab === 'week') {
      const birthThisYear = birthDate.clone().year(now.year());
      return birthThisYear.isBetween(currentWeekStart, currentWeekEnd, null, '[]');
    } else {
      return birthDate.month() === currentMonth;
    }
  }).sort((a, b) => {
    const dayA = moment(a.birth_date).date();
    const dayB = moment(b.birth_date).date();
    return dayA - dayB;
  });

  const customersWithDetails = customersWithBirthdays.map(customer => {
    const birthDate = moment(customer.birth_date);
    const age = moment().diff(birthDate, 'years');
    const nextBirthday = birthDate.clone().year(moment().year());
    if (nextBirthday.isBefore(moment(), 'day')) {
      nextBirthday.add(1, 'year');
    }
    const daysUntil = nextBirthday.diff(moment(), 'days');

    // Check for existing voucher this year
    const currentYear = moment().year();
    const existingVoucher = vouchers.find(v => 
      v.customer_id === customer.id && 
      v.origin === 'birthday' &&
      moment(v.created_date).year() === currentYear &&
      v.status !== 'cancelled'
    );

    return {
      ...customer,
      age,
      daysUntil,
      birthdayFormatted: birthDate.format('DD/MM'),
      hasVoucher: !!existingVoucher,
      voucherId: existingVoucher?.id
    };
  });

  const generateVoucherCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'ANIV-';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleOpenVoucherDialog = (customer) => {
    // Check if customer already has voucher this year
    if (customer.hasVoucher) {
      toast.error('Este cliente já tem um voucher de aniversário este ano');
      return;
    }

    if (!customer.accepts_promotions) {
      toast.error('Cliente não aceita receber promoções');
      return;
    }

    setSelectedCustomer(customer);
    setGeneratedVoucherId(null);
    setShowVoucherDialog(true);
  };

  const handleGenerateVoucher = async () => {
    if (!selectedCustomer) return;

    setGenerating(true);
    try {
      const code = generateVoucherCode();
      const expiryDate = moment().add(validityDays, 'days').format('YYYY-MM-DD');

      const voucher = await base44.entities.Voucher.create({
        code,
        customer_id: selectedCustomer.id,
        customer_name: selectedCustomer.name,
        customer_phone: selectedCustomer.phone,
        origin: 'birthday',
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        expiry_date: expiryDate,
        minimum_purchase: parseFloat(minimumPurchase) || 0,
        non_cumulative: true,
        status: 'generated'
      });

      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      setGeneratedVoucherId(voucher.id);
      toast.success('Voucher criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar voucher');
    } finally {
      setGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Aniversariantes</h1>
          <p className="text-slate-500 text-sm">
            {customersWithDetails.length} aniversariantes
          </p>
        </div>
        <Link to={createPageUrl('Vouchers')}>
          <Button variant="outline" size="sm">
            <Ticket className="w-4 h-4 mr-2" />
            Ver Vouchers
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-50 rounded-xl p-1">
        <button
          onClick={() => setFilterTab('today')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            filterTab === 'today' 
              ? 'bg-white text-pink-600 shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Hoje
        </button>
        <button
          onClick={() => setFilterTab('week')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            filterTab === 'week' 
              ? 'bg-white text-pink-600 shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Esta Semana
        </button>
        <button
          onClick={() => setFilterTab('month')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            filterTab === 'month' 
              ? 'bg-white text-pink-600 shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Este Mês
        </button>
      </div>

      {/* Birthday List */}
      <div className="space-y-2">
        {customersWithDetails.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
            <Cake className="w-12 h-12 mx-auto mb-2 text-slate-300 opacity-50" />
            <p className="text-slate-500">Nenhum aniversariante neste período</p>
          </div>
        ) : (
          customersWithDetails.map((customer) => (
            <div 
              key={customer.id}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:border-pink-200 hover:shadow-sm transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
                <span className="text-2xl">🎂</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-slate-800">{customer.name}</p>
                  {customer.daysUntil === 0 && (
                    <Badge className="bg-pink-500 text-white">Hoje!</Badge>
                  )}
                  {customer.hasVoucher && (
                    <Badge className="bg-emerald-100 text-emerald-700">
                      <Ticket className="w-3 h-3 mr-1" />
                      Voucher criado
                    </Badge>
                  )}
                  {!customer.accepts_promotions && (
                    <Badge className="bg-amber-100 text-amber-700">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Não aceita promoções
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>{customer.birthdayFormatted} • {customer.age} anos</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Phone className="w-4 h-4" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                </div>
                {customer.daysUntil > 0 && (
                  <p className="text-xs text-slate-400 mt-1">
                    Faltam {customer.daysUntil} dias
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                {customer.hasVoucher ? (
                  <>
                    <Link to={createPageUrl('VoucherView') + `?id=${customer.voucherId}`}>
                      <Button variant="outline">
                        <Ticket className="w-5 h-5 mr-2" />
                        Ver Voucher
                      </Button>
                    </Link>
                    {customer.phone && (
                      <a 
                        href={`https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`🎉 Feliz Aniversário, ${customer.name}! 🎂\n\nQue alegria celebrar mais um ano de vida com você! 💝\n\nPara comemorar, preparamos um presente especial: um voucher de desconto exclusivo! 🎁\n\nAcesse o link para ver seu voucher:\n${window.location.origin}${createPageUrl('VoucherView')}?id=${customer.voucherId}\n\nAproveite e venha nos visitar! 💖\n\nDamariê Presentes`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="bg-green-500 hover:bg-green-600">
                          <MessageCircle className="w-5 h-5" />
                        </Button>
                      </a>
                    )}
                  </>
                ) : (
                  <Button
                    onClick={() => handleOpenVoucherDialog(customer)}
                    className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
                    disabled={!customer.accepts_promotions}
                  >
                    <Gift className="w-5 h-5 mr-2" />
                    Gerar Voucher
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Voucher Creation Dialog */}
      <Dialog open={showVoucherDialog} onOpenChange={setShowVoucherDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-pink-500" />
              Criar Voucher de Aniversário
            </DialogTitle>
            <DialogDescription>
              Para {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>

          {!generatedVoucherId ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Desconto</Label>
                <Select value={discountType} onValueChange={setDiscountType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                    <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  {discountType === 'percentage' ? 'Porcentagem' : 'Valor'} do Desconto
                </Label>
                <Input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  min="0"
                  step={discountType === 'percentage' ? '1' : '0.01'}
                />
              </div>

              <div className="space-y-2">
                <Label>Válido por (dias)</Label>
                <Input
                  type="number"
                  value={validityDays}
                  onChange={(e) => setValidityDays(e.target.value)}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label>Valor Mínimo de Compra (opcional)</Label>
                <Input
                  type="number"
                  value={minimumPurchase}
                  onChange={(e) => setMinimumPurchase(e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="R$ 0.00"
                />
              </div>

              <Button
                onClick={handleGenerateVoucher}
                disabled={generating}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4 mr-2" />
                    Gerar Voucher
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 text-center border-2 border-pink-200">
                <Gift className="w-12 h-12 mx-auto mb-3 text-pink-500" />
                <p className="text-lg font-bold text-slate-800 mb-2">Voucher Criado!</p>
                <p className="text-sm text-slate-600">
                  Visualize e envie o voucher para o cliente
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowVoucherDialog(false)}
                >
                  Fechar
                </Button>
                <Link 
                  to={createPageUrl('VoucherView') + `?id=${generatedVoucherId}`}
                  className="flex-1"
                >
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Ticket className="w-4 h-4 mr-2" />
                    Ver Voucher
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}