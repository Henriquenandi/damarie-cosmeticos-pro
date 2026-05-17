import React, { useState } from 'react';
import { useSales } from '@/hooks/useSupabase';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  ShoppingCart,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  ChevronRight,
  Calendar,
  SlidersHorizontal,
  History
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const paymentIcons = {
  dinheiro: Banknote,
  pix: Smartphone,
  cartao: CreditCard,
  fiado: Clock,
};

const paymentColors = {
  dinheiro: 'bg-emerald-100 text-emerald-700',
  pix: 'bg-purple-100 text-purple-700',
  cartao: 'bg-blue-100 text-blue-700',
  fiado: 'bg-amber-100 text-amber-700',
};

const paymentLabels = {
  dinheiro: 'Dinheiro',
  pix: 'PIX',
  cartao: 'Cartão',
  fiado: 'Fiado',
};

export default function Sales() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: sales = [], isLoading } = useSales();

  const now = moment();
  const filteredSales = sales.filter(sale => {
    const matchSearch = !search || 
      sale.customer_name?.toLowerCase().includes(search.toLowerCase());
    const matchPayment = !paymentFilter || sale.payment_method === paymentFilter;
    
    let matchPeriod = true;
    if (periodFilter) {
      const saleDate = moment(sale.sale_date || sale.created_date);
      if (periodFilter === 'today') {
        matchPeriod = saleDate.isSame(now, 'day');
      } else if (periodFilter === 'week') {
        matchPeriod = saleDate.isAfter(now.clone().subtract(7, 'days'));
      } else if (periodFilter === 'month') {
        matchPeriod = saleDate.isAfter(now.clone().subtract(30, 'days'));
      }
    }
    
    return matchSearch && matchPayment && matchPeriod;
  });

  // Group sales by date
  const groupedSales = {};
  filteredSales.forEach(sale => {
    const date = moment(sale.sale_date || sale.created_date).format('YYYY-MM-DD');
    if (!groupedSales[date]) {
      groupedSales[date] = [];
    }
    groupedSales[date].push(sale);
  });

  const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const totalProfit = filteredSales.reduce((sum, s) => sum + (s.profit || 0), 0);

  const activeFilters = [paymentFilter, periodFilter].filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    );
  }


  return (
    <div className="p-4 lg:p-8 space-y-6 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Histórico de Vendas</h1>
          <p className="text-slate-500 text-sm">{filteredSales.length} vendas</p>
        </div>
        <Button
          onClick={() => navigate(createPageUrl('NewSale'))}
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
        >
          <Plus className="w-5 h-5 lg:mr-2" />
          <span className="hidden lg:inline">Nova Venda</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white">
          <p className="text-purple-100 text-sm">Total em Vendas</p>
          <p className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white">
          <p className="text-emerald-100 text-sm">Lucro Total</p>
          <p className="text-2xl font-bold">R$ {totalProfit.toFixed(2)}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Buscar por cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className={activeFilters > 0 ? 'border-purple-500 text-purple-600' : ''}
          >
            <SlidersHorizontal className="w-5 h-5" />
            {activeFilters > 0 && (
              <Badge className="ml-2 bg-purple-500">{activeFilters}</Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-700">Filtros</span>
              {activeFilters > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setPaymentFilter('');
                    setPeriodFilter('');
                  }}
                  className="text-red-500"
                >
                  Limpar filtros
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Todos</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                  <SelectItem value="fiado">Fiado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Todos</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Últimos 7 dias</SelectItem>
                  <SelectItem value="month">Últimos 30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Sales List */}
      {filteredSales.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title={search || activeFilters > 0 ? "Nenhuma venda encontrada" : "Nenhuma venda registrada"}
          description={search || activeFilters > 0 
            ? "Tente ajustar os filtros de busca" 
            : "Comece registrando sua primeira venda"}
          actionLabel={!search && activeFilters === 0 ? "Nova Venda" : undefined}
          onAction={() => window.location.href = createPageUrl('NewSale')}
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSales).map(([date, daySales]) => {
            const dayTotal = daySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
            const displayDate = moment(date);
            const isToday = displayDate.isSame(now, 'day');
            const isYesterday = displayDate.isSame(now.clone().subtract(1, 'day'), 'day');

            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-600">
                      {isToday ? 'Hoje' : isYesterday ? 'Ontem' : displayDate.format('DD [de] MMMM')}
                    </span>
                  </div>
                  <span className="text-sm text-slate-500">
                    {daySales.length} vendas • R$ {dayTotal.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2">
                  {daySales.map((sale) => {
                    const PaymentIcon = paymentIcons[sale.payment_method] || ShoppingCart;
                    return (
                      <Link 
                        key={sale.id}
                        to={createPageUrl('SaleDetails') + `?id=${sale.id}`}
                        className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:border-purple-200 hover:shadow-sm transition-all"
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentColors[sale.payment_method] || 'bg-slate-100'}`}>
                          <PaymentIcon className="w-6 h-6" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate">
                            {sale.customer_name || 'Venda Avulsa'}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-slate-400">
                              {moment(sale.sale_date || sale.created_date).format('HH:mm')}
                            </span>
                            <span className="text-xs text-slate-300">•</span>
                            <span className="text-xs text-slate-400">
                              {(sale.items || []).length} itens
                            </span>
                            <Badge className={`text-[10px] ${paymentColors[sale.payment_method]}`}>
                              {paymentLabels[sale.payment_method]}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-slate-800">R$ {(sale.total_amount || 0).toFixed(2)}</p>
                          {sale.profit > 0 && (
                            <p className="text-xs text-emerald-600">+R$ {sale.profit.toFixed(2)}</p>
                          )}
                        </div>
                        
                        <ChevronRight className="w-5 h-5 text-slate-300" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}