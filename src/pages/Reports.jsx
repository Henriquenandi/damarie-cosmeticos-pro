import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import StatsCard from '@/components/ui/StatsCard';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Gift,
  Wallet,
  TrendingDown
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import moment from 'moment';

const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#6366F1'];

export default function Reports() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('month');
  const [comparePeriod, setComparePeriod] = useState(false);

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: presentes = [] } = useQuery({
    queryKey: ['presentes'],
    queryFn: () => base44.entities.Presente.list(),
  });

  const { data: sales = [], isLoading: loadingSales } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.list('-sale_date', 500),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list(),
  });

  const { data: despesas = [] } = useQuery({
    queryKey: ['despesas'],
    queryFn: () => base44.entities.DespesaMensal.list(),
  });

  // Filter sales by period
  const now = moment();
  const periodStart = period === 'week' 
    ? now.clone().subtract(7, 'days') 
    : period === 'month' 
      ? now.clone().subtract(30, 'days')
      : now.clone().subtract(90, 'days');

  const filteredSales = sales.filter(s => 
    moment(s.sale_date || s.created_date).isAfter(periodStart)
  );

  // Filter despesas by period
  const filteredDespesas = despesas.filter(d =>
    moment(d.payment_date).isAfter(periodStart) && d.status === 'pago'
  );

  // Previous period for comparison
  const previousPeriodStart = period === 'week' 
    ? now.clone().subtract(14, 'days')
    : period === 'month' 
      ? now.clone().subtract(60, 'days')
      : now.clone().subtract(180, 'days');

  const previousSales = sales.filter(s => {
    const date = moment(s.sale_date || s.created_date);
    return date.isAfter(previousPeriodStart) && date.isBefore(periodStart);
  });

  const previousDespesas = despesas.filter(d => {
    const date = moment(d.payment_date);
    return date.isAfter(previousPeriodStart) && date.isBefore(periodStart) && d.status === 'pago';
  });

  const prevRevenue = previousSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const prevProfit = previousSales.reduce((sum, s) => sum + (s.profit || 0), 0);
  const prevDespesas = previousDespesas.reduce((sum, d) => sum + (d.amount || 0), 0);
  const prevLucroLiquido = prevProfit - prevDespesas;

  // Calculate stats
  const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const totalProfit = filteredSales.reduce((sum, s) => sum + (s.profit || 0), 0);
  const totalCost = filteredSales.reduce((sum, s) => sum + (s.total_cost || 0), 0);
  const totalDespesas = filteredDespesas.reduce((sum, d) => sum + (d.amount || 0), 0);
  const lucroLiquido = totalProfit - totalDespesas;
  const avgTicket = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

  // Growth calculations
  const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
  const profitGrowth = prevProfit > 0 ? ((totalProfit - prevProfit) / prevProfit) * 100 : 0;
  const lucroLiquidoGrowth = prevLucroLiquido > 0 ? ((lucroLiquido - prevLucroLiquido) / prevLucroLiquido) * 100 : 0;

  // Sales by week
  const salesByWeek = {};
  filteredSales.forEach(sale => {
    const week = moment(sale.sale_date || sale.created_date).startOf('week').format('DD/MM');
    if (!salesByWeek[week]) {
      salesByWeek[week] = { revenue: 0, profit: 0, count: 0 };
    }
    salesByWeek[week].revenue += sale.total_amount || 0;
    salesByWeek[week].profit += sale.profit || 0;
    salesByWeek[week].count += 1;
  });

  const weeklyData = Object.entries(salesByWeek)
    .map(([week, data]) => ({
      name: week,
      receita: data.revenue,
      lucro: data.profit,
      vendas: data.count,
    }))
    .slice(-8);

  // Sales by week of current month
  const currentMonth = moment();
  const startOfMonth = currentMonth.clone().startOf('month');
  const weeksInMonth = [];
  
  // Generate weeks for current month
  for (let i = 1; i <= 4; i++) {
    const weekStart = startOfMonth.clone().add((i - 1) * 7, 'days');
    const weekEnd = weekStart.clone().add(6, 'days').endOf('day');
    weeksInMonth.push({
      name: `Semana ${i}`,
      start: weekStart,
      end: weekEnd,
      revenue: 0,
      profit: 0,
      count: 0
    });
  }
  
  // Calculate sales for each week
  sales.forEach(sale => {
    const saleDate = moment(sale.sale_date || sale.created_date);
    if (saleDate.isSame(currentMonth, 'month')) {
      weeksInMonth.forEach(week => {
        if (saleDate.isBetween(week.start, week.end, null, '[]')) {
          week.revenue += sale.total_amount || 0;
          week.profit += sale.profit || 0;
          week.count += 1;
        }
      });
    }
  });

  const monthlyData = weeksInMonth.map(week => ({
    name: week.name,
    receita: week.revenue,
    lucro: week.profit,
    vendas: week.count,
  }));

  // Sales by brand (inclui kits como "Kits Presentes")
  const salesByBrand = {};
  filteredSales.forEach(sale => {
    (sale.items || []).forEach(item => {
      const product = products.find(p => p.id === item.product_id);
      const kit = presentes.find(k => k.id === item.product_id);
      
      if (kit) {
        if (!salesByBrand['Kits Presentes']) {
          salesByBrand['Kits Presentes'] = 0;
        }
        salesByBrand['Kits Presentes'] += item.subtotal || 0;
      } else if (product) {
        if (!salesByBrand[product.brand]) {
          salesByBrand[product.brand] = 0;
        }
        salesByBrand[product.brand] += item.subtotal || 0;
      }
    });
  });

  const brandData = Object.entries(salesByBrand)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Sales by category (inclui kits)
  const salesByCategory = {};
  filteredSales.forEach(sale => {
    (sale.items || []).forEach(item => {
      const product = products.find(p => p.id === item.product_id);
      const kit = presentes.find(k => k.id === item.product_id);
      
      if (kit) {
        if (!salesByCategory['Kit Presente']) {
          salesByCategory['Kit Presente'] = 0;
        }
        salesByCategory['Kit Presente'] += item.subtotal || 0;
      } else if (product) {
        if (!salesByCategory[product.category]) {
          salesByCategory[product.category] = 0;
        }
        salesByCategory[product.category] += item.subtotal || 0;
      }
    });
  });

  const categoryData = Object.entries(salesByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Payment methods
  const paymentData = {};
  filteredSales.forEach(sale => {
    const method = sale.payment_method || 'outro';
    if (!paymentData[method]) {
      paymentData[method] = 0;
    }
    paymentData[method] += sale.total_amount || 0;
  });

  const paymentLabels = {
    dinheiro: 'Dinheiro',
    pix: 'PIX',
    cartao: 'Cartão',
    fiado: 'Fiado',
    outro: 'Outro',
  };

  const paymentChartData = Object.entries(paymentData)
    .map(([key, value]) => ({ name: paymentLabels[key] || key, value }));

  // Best sellers (inclui kits)
  const productSales = {};
  filteredSales.forEach(sale => {
    (sale.items || []).forEach(item => {
      if (item.product_id) {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = { quantity: 0, revenue: 0, type: null };
        }
        productSales[item.product_id].quantity += item.quantity || 0;
        productSales[item.product_id].revenue += item.subtotal || 0;
        if (!productSales[item.product_id].type) {
          const isKit = presentes.find(k => k.id === item.product_id);
          productSales[item.product_id].type = isKit ? 'kit' : 'product';
        }
      }
    });
  });

  const bestSellers = Object.entries(productSales)
    .map(([id, data]) => {
      if (data.type === 'kit') {
        return {
          item: presentes.find(k => k.id === id),
          isKit: true,
          ...data,
        };
      } else {
        return {
          item: products.find(p => p.id === id),
          isKit: false,
          ...data,
        };
      }
    })
    .filter(b => b.item)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Low stock products
  const lowStock = products.filter(p => 
    p.stock_quantity <= (p.min_stock || 2) && p.status === 'em_estoque'
  );

  // Stock value
  const stockValue = products.reduce((sum, p) => 
    sum + ((p.stock_quantity || 0) * (p.cost_price || 0)), 0
  );
  const stockSellingValue = products.reduce((sum, p) => 
    sum + ((p.stock_quantity || 0) * (p.selling_price || 0)), 0
  );

  const isLoading = loadingProducts || loadingSales;

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Relatórios</h1>
            <p className="text-slate-500 text-sm">Análise do seu negócio</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setComparePeriod(!comparePeriod)}
            className={comparePeriod ? 'bg-purple-50 border-purple-300' : ''}
          >
            Comparar Período
          </Button>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Últimos 7 dias</SelectItem>
              <SelectItem value="month">Últimos 30 dias</SelectItem>
              <SelectItem value="quarter">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Faturamento"
          value={`R$ ${totalRevenue.toFixed(2)}`}
          subtitle={`${filteredSales.length} vendas`}
          icon={DollarSign}
          gradient="from-purple-500 to-purple-600"
          trend={comparePeriod && revenueGrowth !== 0 ? (revenueGrowth > 0 ? 'up' : 'down') : undefined}
          trendValue={comparePeriod ? `${Math.abs(revenueGrowth).toFixed(1)}%` : undefined}
        />
        <StatsCard
          title="Lucro Bruto"
          value={`R$ ${totalProfit.toFixed(2)}`}
          subtitle={totalRevenue > 0 ? `${((totalProfit / totalRevenue) * 100).toFixed(1)}% margem` : ''}
          icon={TrendingUp}
          gradient="from-emerald-500 to-emerald-600"
          trend={comparePeriod && profitGrowth !== 0 ? (profitGrowth > 0 ? 'up' : 'down') : undefined}
          trendValue={comparePeriod ? `${Math.abs(profitGrowth).toFixed(1)}%` : undefined}
        />
        <StatsCard
          title="Despesas"
          value={`R$ ${totalDespesas.toFixed(2)}`}
          subtitle={`${filteredDespesas.length} pagas`}
          icon={Wallet}
          gradient="from-red-500 to-red-600"
        />
        <StatsCard
          title="Lucro Líquido"
          value={`R$ ${lucroLiquido.toFixed(2)}`}
          subtitle={totalRevenue > 0 ? `${((lucroLiquido / totalRevenue) * 100).toFixed(1)}% líquido` : ''}
          icon={TrendingDown}
          gradient={lucroLiquido >= 0 ? "from-emerald-600 to-emerald-700" : "from-red-600 to-red-700"}
          trend={comparePeriod && lucroLiquidoGrowth !== 0 ? (lucroLiquidoGrowth > 0 ? 'up' : 'down') : undefined}
          trendValue={comparePeriod ? `${Math.abs(lucroLiquidoGrowth).toFixed(1)}%` : undefined}
        />
      </div>

      {/* Comparison Alert */}
      {comparePeriod && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-4">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            📊 Comparação com Período Anterior
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Faturamento anterior</p>
              <p className="font-bold text-slate-800">R$ {prevRevenue.toFixed(2)}</p>
              <p className={`text-xs ${revenueGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {revenueGrowth >= 0 ? '↗' : '↘'} {Math.abs(revenueGrowth).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-slate-600">Lucro bruto anterior</p>
              <p className="font-bold text-slate-800">R$ {prevProfit.toFixed(2)}</p>
              <p className={`text-xs ${profitGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {profitGrowth >= 0 ? '↗' : '↘'} {Math.abs(profitGrowth).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-slate-600">Lucro líquido anterior</p>
              <p className="font-bold text-slate-800">R$ {prevLucroLiquido.toFixed(2)}</p>
              <p className={`text-xs ${lucroLiquidoGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {lucroLiquidoGrowth >= 0 ? '↗' : '↘'} {Math.abs(lucroLiquidoGrowth).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Financial Summary */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Resumo Financeiro</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">💰 Receita Total</span>
            <span className="font-bold text-purple-600">R$ {totalRevenue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">📦 Custos de Produtos</span>
            <span className="font-medium text-slate-700">- R$ {totalCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <span className="text-slate-600">💵 Lucro Bruto</span>
            <span className="font-bold text-emerald-600">R$ {totalProfit.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">🔧 Despesas Operacionais</span>
            <span className="font-medium text-red-600">- R$ {totalDespesas.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t-2 border-slate-300">
            <span className="text-slate-800 font-semibold">✨ Lucro Líquido Real</span>
            <span className={`text-2xl font-bold ${lucroLiquido >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              R$ {lucroLiquido.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Sales */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-slate-800">Vendas Semanais</h3>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorWeekRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.7}/>
                  </linearGradient>
                  <linearGradient id="colorWeekProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
                <XAxis dataKey="name" stroke="#7c3aed" fontSize={11} />
                <YAxis stroke="#7c3aed" fontSize={11} />
                <Tooltip 
                  formatter={(value) => `R$ ${value.toFixed(2)}`}
                  contentStyle={{ 
                    borderRadius: 12, 
                    border: '2px solid #a78bfa',
                    backgroundColor: '#faf5ff'
                  }}
                />
                <Legend />
                <Bar dataKey="receita" fill="url(#colorWeekRevenue)" radius={[8, 8, 0, 0]} name="Receita" />
                <Bar dataKey="lucro" fill="url(#colorWeekProfit)" radius={[8, 8, 0, 0]} name="Lucro" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Sales by Week */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-800">Vendas do Mês Atual</h3>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorMonthRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.7}/>
                  </linearGradient>
                  <linearGradient id="colorMonthProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#bfdbfe" />
                <XAxis dataKey="name" stroke="#2563eb" fontSize={11} />
                <YAxis stroke="#2563eb" fontSize={11} />
                <Tooltip 
                  formatter={(value) => `R$ ${value.toFixed(2)}`}
                  contentStyle={{ 
                    borderRadius: 12, 
                    border: '2px solid #60a5fa',
                    backgroundColor: '#eff6ff'
                  }}
                />
                <Legend />
                <Bar dataKey="receita" fill="url(#colorMonthRevenue)" radius={[8, 8, 0, 0]} name="Receita" />
                <Bar dataKey="lucro" fill="url(#colorMonthProfit)" radius={[8, 8, 0, 0]} name="Lucro" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Brand */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-slate-800">Vendas por Marca</h3>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={brandData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {brandData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-slate-800">Formas de Pagamento</h3>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={80} />
                <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                <Bar dataKey="value" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stock Value */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
          <p className="text-sm text-blue-600 mb-1">Valor em Estoque (Custo)</p>
          <p className="text-2xl font-bold text-blue-700">R$ {stockValue.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-4 border border-emerald-200">
          <p className="text-sm text-emerald-600 mb-1">Valor em Estoque (Venda)</p>
          <p className="text-2xl font-bold text-emerald-700">R$ {stockSellingValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Best Sellers */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Produtos Mais Vendidos</h3>
        </div>
        
        <div className="divide-y divide-slate-50">
          {bestSellers.slice(0, 5).map(({ item, isKit, quantity, revenue }, index) => (
            <div key={item.id} className="p-4 flex items-center gap-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                index === 0 ? 'bg-amber-100 text-amber-700' :
                index === 1 ? 'bg-slate-100 text-slate-600' :
                index === 2 ? 'bg-orange-100 text-orange-700' :
                'bg-slate-50 text-slate-400'
              }`}>
                {index + 1}
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {isKit ? (
                      <Gift className="w-5 h-5 text-pink-400" />
                    ) : (
                      <Package className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-800 truncate">{item.name}</p>
                  {isKit && <Badge className="bg-pink-100 text-pink-700 text-xs">Kit</Badge>}
                </div>
                {!isKit && <p className="text-xs text-slate-400">{item.brand}</p>}
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800">{quantity} un</p>
                <p className="text-xs text-purple-600">R$ {revenue.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <h3 className="font-semibold text-amber-800 mb-3">
            ⚠️ {lowStock.length} Produtos com Estoque Baixo
          </h3>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((p) => (
              <Badge key={p.id} className="bg-amber-100 text-amber-700">
                {p.name} ({p.stock_quantity})
              </Badge>
            ))}
          </div>
        </div>
      )}

      </div>
      );
      }