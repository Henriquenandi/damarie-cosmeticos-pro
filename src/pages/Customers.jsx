import React, { useState, useEffect } from 'react';
import { useCustomers, useCustomerMutation } from '@/hooks/useSupabase';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CustomerForm from '@/components/customers/CustomerForm';
import EmptyState from '@/components/ui/EmptyState';
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
  Plus, 
  Search, 
  Users,
  ChevronRight,
  Phone,
  CreditCard,
  ShoppingBag
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function Customers() {
  const navigate = useNavigate();
  const { data: customers = [], isLoading } = useCustomers();
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCredit, setFilterCredit] = useState(false);

  // Check URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('filter') === 'credit') {
      setFilterCredit(true);
    }
  }, []);



  const filteredCustomers = customers.filter(c => {
    const matchSearch = !search || 
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search);
    const matchCredit = !filterCredit || (c.credit_balance || 0) > 0;
    return matchSearch && matchCredit;
  });

  const totalCredit = customers.reduce((sum, c) => sum + (c.credit_balance || 0), 0);
  const customersWithCredit = customers.filter(c => (c.credit_balance || 0) > 0);

  const handleCustomerClick = (customer) => {
    navigate(createPageUrl('CustomerDetails') + `?id=${customer.id}`);
  };

  const handleSave = () => {
    setShowForm(false);
    setEditCustomer(null);
    // Customers will be automatically refreshed
  };

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
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
          <p className="text-slate-500 text-sm">{customers.length} clientes cadastrados</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-200"
        >
          <Plus className="w-5 h-5 lg:mr-2" />
          <span className="hidden lg:inline">Novo Cliente</span>
        </Button>
      </div>

      {/* Credit Summary */}
      {totalCredit > 0 && (
        <button
          onClick={() => setFilterCredit(!filterCredit)}
          className={`w-full bg-gradient-to-r from-amber-50 to-orange-50 border rounded-2xl p-4 flex items-center gap-4 transition-all ${
            filterCredit ? 'border-amber-400' : 'border-amber-200'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-amber-800">Fiado Pendente</p>
            <p className="text-sm text-amber-600">
              {customersWithCredit.length} clientes • R$ {totalCredit.toFixed(2)} a receber
            </p>
          </div>
          {filterCredit && (
            <Badge className="bg-amber-500">Filtrado</Badge>
          )}
        </button>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Buscar clientes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Customers List */}
      {filteredCustomers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search || filterCredit ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
          description={search || filterCredit 
            ? "Tente ajustar os filtros de busca" 
            : "Cadastre seus clientes para acompanhar compras e fiados"}
          actionLabel={!search && !filterCredit ? "Cadastrar Cliente" : undefined}
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="space-y-2">
          {filteredCustomers.map((customer) => (
            <button
              key={customer.id}
              onClick={() => handleCustomerClick(customer)}
              className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:border-purple-200 hover:shadow-sm transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-purple-600 text-lg">
                  {customer.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">{customer.name}</p>
                {customer.phone && (
                  <div className="flex items-center gap-1 text-sm text-slate-400 mt-1">
                    <Phone className="w-3 h-3" />
                    <span>{customer.phone}</span>
                  </div>
                )}
              </div>
              
              <div className="text-right">
                {(customer.credit_balance || 0) > 0 ? (
                  <Badge className="bg-amber-100 text-amber-700">
                    Fiado: R$ {customer.credit_balance.toFixed(2)}
                  </Badge>
                ) : (
                  <div className="flex items-center gap-1 text-sm text-slate-400">
                    <ShoppingBag className="w-4 h-4" />
                    <span>R$ {(customer.total_purchases || 0).toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </button>
          ))}
        </div>
      )}

      {/* Customer Form Sheet */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editCustomer ? 'Editar Cliente' : 'Novo Cliente'}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <CustomerForm
              customer={editCustomer}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setEditCustomer(null);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}