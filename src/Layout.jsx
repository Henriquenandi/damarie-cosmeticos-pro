import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { useAuth } from '@/lib/SupabaseAuthContext';
import { Button } from "@/components/ui/button";
import { 
        LayoutDashboard, 
        Package, 
        ShoppingCart, 
        Users, 
        Plus,
        BarChart3,
        Cake,
        Ticket,
        Trophy,
        Package2,
        Gift,
        Wallet,
        Receipt,
        LogOut
      } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { signOut, user } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
    { name: 'Produtos', icon: Package, page: 'Products' },
    { name: 'Vendas', icon: ShoppingCart, page: 'Sales' },
    { name: 'Clientes', icon: Users, page: 'Customers' },
    { name: 'Mercadorias', icon: Package2, page: 'Mercadorias' },
    { name: 'Kits', icon: Gift, page: 'Presentes' },
    { name: 'Catálogo', icon: ShoppingCart, page: 'Catalogo' },
    { name: 'Parcelas', icon: Receipt, page: 'Installments' },
    { name: 'Despesas', icon: Wallet, page: 'DespesasMensais' },
    { name: 'Aniversários', icon: Cake, page: 'Birthdays' },
    { name: 'Vouchers', icon: Ticket, page: 'Vouchers' },
    { name: 'Sorteios', icon: Trophy, page: 'Campaigns' },
    { name: 'Relatórios', icon: BarChart3, page: 'Reports' },
  ];

  const isActive = (page) => currentPageName === page;

  return (
    <div className="bg-gradient-to-br from-orange-50/30 via-white to-orange-50/50" style={{ minHeight: '100dvh', overscrollBehavior: 'contain' }}>
      <style>{`
        :root {
          --primary: #F97316;
          --primary-light: #FB923C;
          --primary-dark: #EA580C;
          --accent: #FDBA74;
          --accent-light: #FED7AA;
        }

        html, body {
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }
        
        .nav-item-active {
          color: var(--primary);
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(253, 186, 116, 0.1));
        }
        
        .main-button {
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
        }
        
        .main-button:hover {
          box-shadow: 0 6px 20px rgba(249, 115, 22, 0.5);
          transform: translateY(-2px);
        }
        
        @media (min-width: 1024px) {
          .desktop-sidebar {
            display: flex;
          }
          .mobile-nav {
            display: none;
          }
        }
      `}</style>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 flex-col z-50">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695c5f50ab63f5b9b84216d1/4f31b7e94_8360374a-28eb-4f8b-8a1c-d3c506ca44bd.jpg" 
              alt="Damariê Presentes" 
              className="w-10 h-10 rounded-xl object-cover shadow-md"
            />
            <div>
              <h1 className="font-bold text-slate-800">Damariê Presentes</h1>
              <p className="text-xs text-slate-400">Gestão Inteligente</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(item.page)
                  ? 'nav-item-active font-medium'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <item.icon className={`w-5 h-5 ${item.isMain ? 'text-purple-500' : ''}`} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        
        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {user?.email}
              </p>
              <p className="text-xs text-slate-500">Usuário</p>
            </div>
          </div>
          <Button
            onClick={signOut}
            variant="outline"
            size="sm"
            className="w-full text-slate-600 hover:text-red-600 hover:border-red-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className="lg:ml-64 lg:pb-8"
        style={{
          paddingBottom: 'calc(88px + env(safe-area-inset-bottom, 24px))'
        }}
      >
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav 
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-100 z-50 overflow-x-auto"
        style={{ 
          paddingTop: '0.75rem', 
          paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div className="flex items-center gap-1 px-2 min-w-max">
          {navItems.map((item) => (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 flex-shrink-0 ${
                isActive(item.page) 
                  ? 'nav-item-active' 
                  : 'text-slate-400'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium whitespace-nowrap">{item.name}</span>
            </Link>
          ))}
        </div>
        <style>{`
          nav::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </nav>
    </div>
  );
}