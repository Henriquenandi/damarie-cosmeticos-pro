import React from 'react';
import { useProducts, useCustomers, useSales, useVouchers, useDashboardData } from '@/hooks/useSupabase';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import StatsCard from '@/components/ui/StatsCard';
import { 
  DollarSign, 
  TrendingUp, 
  Package, 
  ShoppingCart,
  AlertTriangle,
  Users,
  ArrowRight,
  CreditCard,
  Clock,
  ChevronRight,
  Cake,
  Gift
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import moment from 'moment';

export default function Dashboard() {
  const { data: products = [], isLoading: loadingProducts } = useProducts();
  const { data: sales = [], isLoading: loadingSales } = useSales();
  const { data: customers = [], isLoading: loadingCustomers } = useCustomers();
  const { data: vouchers = [] } = useVouchers();
  const { data: dashboardData } = useDashboardData();

  // Calculate stats
  const today = moment().startOf('day');
  const weekAgo = moment().subtract(7, 'days').startOf('day');
  const monthAgo = moment().subtract(30, 'days').startOf('day');

  const todaySales = sales.filter(s => moment(s.sale_date || s.created_date).isSameOrAfter(today));
  const weekSales = sales.filter(s => moment(s.sale_date || s.created_date).isSameOrAfter(weekAgo));
  const monthSales = sales.filter(s => moment(s.sale_date || s.created_date).isSameOrAfter(monthAgo));

  const todayRevenue = todaySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const weekRevenue = weekSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const monthRevenue = monthSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const monthProfit = monthSales.reduce((sum, s) => sum + (s.profit || 0), 0);

  const lowStockProducts = products.filter(p => 
    p.stock_quantity <= (p.min_stock || 2) && p.status === 'em_estoque'
  );

  const totalCredit = customers.reduce((sum, c) => sum + (c.credit_balance || 0), 0);

  // Birthday alerts
  const birthdayToday = customers.filter(c => {
    if (!c.birth_date) return false;
    const birthDate = moment(c.birth_date);
    return birthDate.date() === today.date() && birthDate.month() === today.month();
  });

  const pendingVouchers = vouchers.filter(v => 
    v.status === 'generated' && moment(v.expiry_date).isAfter(today)
  );

  const recentSales = sales.slice(0, 5);

  // Best selling products
  const productSales = {};
  sales.forEach(sale => {
    (sale.items || []).forEach(item => {
      if (item.product_id) {
        productSales[item.product_id] = (productSales[item.product_id] || 0) + (item.quantity || 0);
      }
    });
  });
  
  const bestSellers = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, qty]) => ({
      product: products.find(p => p.id === id),
      quantity: qty
    }))
    .filter(b => b.product);

  if (loadingProducts || loadingSales) {
    return (
      <div className="p-4 lg:p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695c5f50ab63f5b9b84216d1/4f31b7e94_8360374a-28eb-4f8b-8a1c-d3c506ca44bd.jpg" 
          alt="Damariê Presentes" 
          className="w-16 h-16 rounded-2xl object-cover shadow-lg lg:block hidden"
        />
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
            Olá, Mariele! 👋
          </h1>
          <p className="text-slate-500 mt-1">
            {moment().format('dddd, D [de] MMMM')}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Vendas Hoje"
          value={`R$ ${todayRevenue.toFixed(2)}`}
          subtitle={`${todaySales.length} vendas`}
          icon={DollarSign}
          gradient="from-orange-500 to-orange-600"
        />
        <StatsCard
          title="Vendas do Mês"
          value={`R$ ${monthRevenue.toFixed(2)}`}
          subtitle={`${monthSales.length} vendas`}
          icon={TrendingUp}
          gradient="from-amber-500 to-orange-500"
        />
        <StatsCard
          title="Lucro do Mês"
          value={`R$ ${monthProfit.toFixed(2)}`}
          subtitle={monthRevenue > 0 ? `${((monthProfit / monthRevenue) * 100).toFixed(0)}% margem` : 'Sem vendas'}
          icon={TrendingUp}
          gradient="from-orange-600 to-red-500"
        />
        <StatsCard
          title="Produtos"
          value={products.length}
          subtitle={`${products.filter(p => p.status === 'em_estoque').length} em estoque`}
          icon={Package}
          gradient="from-orange-400 to-amber-500"
        />
      </div>

      {/* Alerts */}
      {(lowStockProducts.length > 0 || totalCredit > 0 || birthdayToday.length > 0 || pendingVouchers.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {lowStockProducts.length > 0 && (
            <Link to={createPageUrl('Products') + '?filter=low_stock'}>
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-amber-800">Estoque Baixo</p>
                  <p className="text-sm text-amber-600">{lowStockProducts.length} produtos precisam de reposição</p>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-400" />
              </div>
            </Link>
          )}

          {totalCredit > 0 && (
            <Link to={createPageUrl('Customers') + '?filter=credit'}>
              <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-red-800">Fiado Pendente</p>
                  <p className="text-sm text-red-600">R$ {totalCredit.toFixed(2)} a receber</p>
                </div>
                <ChevronRight className="w-5 h-5 text-red-400" />
              </div>
            </Link>
          )}

          {birthdayToday.length > 0 && (
            <Link to={createPageUrl('Birthdays')}>
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                  <Cake className="w-6 h-6 text-pink-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-pink-800">Aniversariantes Hoje</p>
                  <p className="text-sm text-pink-600">{birthdayToday.length} {birthdayToday.length === 1 ? 'cliente faz' : 'clientes fazem'} aniversário</p>
                </div>
                <ChevronRight className="w-5 h-5 text-pink-400" />
              </div>
            </Link>
          )}

          {pendingVouchers.length > 0 && (
            <Link to={createPageUrl('Vouchers')}>
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-purple-800">Vouchers Pendentes</p>
                  <p className="text-sm text-purple-600">{pendingVouchers.length} vouchers para enviar</p>
                </div>
                <ChevronRight className="w-5 h-5 text-purple-400" />
              </div>
            </Link>
          )}
          </div>
          )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Vendas Recentes</h2>
            <Link to={createPageUrl('Sales')}>
              <Button variant="ghost" size="sm" className="text-purple-600">
                Ver todas <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          <div className="divide-y divide-slate-50">
            {recentSales.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Nenhuma venda ainda</p>
              </div>
            ) : (
              recentSales.map((sale) => (
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
                    <p className="font-medium text-slate-800 truncate">
                      {sale.customer_name || 'Venda Avulsa'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {moment(sale.sale_date || sale.created_date).format('DD/MM HH:mm')} • {(sale.items || []).length} itens
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">R$ {(sale.total_amount || 0).toFixed(2)}</p>
                    <Badge variant="outline" className={`text-[10px] ${
                      sale.payment_method === 'fiado' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {sale.payment_method === 'dinheiro' ? 'Dinheiro' : 
                       sale.payment_method === 'pix' ? 'PIX' :
                       sale.payment_method === 'cartao' ? 'Cartão' : 'Fiado'}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Mais Vendidos</h2>
            <Link to={createPageUrl('Products')}>
              <Button variant="ghost" size="sm" className="text-purple-600">
                Ver todos <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          <div className="divide-y divide-slate-50">
            {bestSellers.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Sem vendas para análise</p>
              </div>
            ) : (
              bestSellers.map(({ product, quantity }, index) => (
                <Link 
                  key={product.id} 
                  to={createPageUrl('ProductDetails') + `?id=${product.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-amber-100 text-amber-700' :
                    index === 1 ? 'bg-slate-100 text-slate-600' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-50 text-slate-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{product.name}</p>
                    <p className="text-xs text-slate-400">{product.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">{quantity}</p>
                    <p className="text-xs text-slate-400">vendidos</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="lg:mt-16">
        <div 
          className="fixed lg:static bottom-0 left-0 right-0 bg-white lg:bg-transparent p-4 lg:p-0 border-t lg:border-0 border-slate-100 z-40"
          style={{ 
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 88px)',
          }}
        >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          <Link to={createPageUrl('Sales')}>
            <Button className="w-full h-16 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-200 text-base">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Nova Venda
            </Button>
          </Link>
          <Link to={createPageUrl('StockEntry')}>
            <Button variant="outline" className="w-full h-16 text-base border-2">
              <Package className="w-5 h-5 mr-2" />
              Entrada
            </Button>
          </Link>
          <Link to={createPageUrl('Products') + '?action=new'}>
            <Button variant="outline" className="w-full h-16 text-base border-2">
              <Package className="w-5 h-5 mr-2" />
              Novo Produto
            </Button>
          </Link>
          <Link to={createPageUrl('CatalogScan')}>
            <Button variant="outline" className="w-full h-16 text-base border-2">
              <Package className="w-5 h-5 mr-2" />
              Escanear Catálogo
            </Button>
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}