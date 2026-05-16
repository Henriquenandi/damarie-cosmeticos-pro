import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/supabaseClient';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
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
  Package2,
  Plus,
  Search,
  AlertTriangle,
  ChevronRight,
  TrendingDown,
  Archive
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function Mercadorias() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: mercadorias = [], isLoading } = useQuery({
    queryKey: ['mercadorias'],
    queryFn: () => base44.entities.Mercadoria.list('name'),
  });

  const filteredMercadorias = mercadorias.filter(m => {
    const matchSearch = !search || 
      m.name?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || m.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const lowStockItems = mercadorias.filter(m => 
    m.current_stock <= (m.min_stock || 0) && m.current_stock > 0
  );

  const outOfStockItems = mercadorias.filter(m => m.current_stock <= 0);

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
    <div className="p-4 lg:p-8 space-y-6 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mercadorias</h1>
          <p className="text-slate-500 text-sm">{mercadorias.length} itens</p>
        </div>
        <Link to={createPageUrl('MercadoriaForm')}>
          <Button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700">
            <Plus className="w-5 h-5 lg:mr-2" />
            <span className="hidden lg:inline">Novo Item</span>
          </Button>
        </Link>
      </div>

      {/* Alerts */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {lowStockItems.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-800">Estoque Baixo</p>
                <p className="text-sm text-amber-600">{lowStockItems.length} itens precisam reposição</p>
              </div>
            </div>
          )}
          {outOfStockItems.length > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-800">Sem Estoque</p>
                <p className="text-sm text-red-600">{outOfStockItems.length} itens esgotados</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Buscar mercadorias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Todas</SelectItem>
            <SelectItem value="Cesta">Cesta</SelectItem>
            <SelectItem value="Plástico">Plástico</SelectItem>
            <SelectItem value="Fita">Fita</SelectItem>
            <SelectItem value="Papel">Papel</SelectItem>
            <SelectItem value="Caixa">Caixa</SelectItem>
            <SelectItem value="Enfeite">Enfeite</SelectItem>
            <SelectItem value="Laço">Laço</SelectItem>
            <SelectItem value="Outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link to={createPageUrl('EntradaMercadoria')}>
          <Button variant="outline" className="w-full h-14">
            <Archive className="w-5 h-5 mr-2" />
            Registrar Entrada
          </Button>
        </Link>
        <Link to={createPageUrl('ConsumoMercadoria')}>
          <Button variant="outline" className="w-full h-14">
            <TrendingDown className="w-5 h-5 mr-2" />
            Registrar Consumo
          </Button>
        </Link>
      </div>

      {/* List */}
      {filteredMercadorias.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
          <Package2 className="w-12 h-12 mx-auto mb-2 text-slate-300 opacity-50" />
          <p className="text-slate-500">Nenhuma mercadoria encontrada</p>
          <Link to={createPageUrl('MercadoriaForm')}>
            <Button variant="outline" className="mt-4">
              Cadastrar Primeira Mercadoria
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMercadorias.map((mercadoria) => {
            const isLowStock = mercadoria.current_stock <= (mercadoria.min_stock || 0) && mercadoria.current_stock > 0;
            const isOutOfStock = mercadoria.current_stock <= 0;
            
            return (
              <Link 
                key={mercadoria.id}
                to={createPageUrl('MercadoriaDetails') + `?id=${mercadoria.id}`}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:border-teal-200 hover:shadow-sm transition-all"
              >
                <div className="w-14 h-14 rounded-lg bg-teal-50 overflow-hidden flex-shrink-0">
                  {mercadoria.image_url ? (
                    <img src={mercadoria.image_url} alt={mercadoria.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package2 className="w-6 h-6 text-teal-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{mercadoria.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-teal-100 text-teal-700 text-xs">
                      {mercadoria.category}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {mercadoria.unit === 'METRO' ? 'm' : 'un'}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-bold ${
                    isOutOfStock ? 'text-red-600' : 
                    isLowStock ? 'text-amber-600' : 
                    'text-slate-800'
                  }`}>
                    {mercadoria.current_stock.toFixed(mercadoria.unit === 'METRO' ? 1 : 0)}
                    <span className="text-xs ml-1">{mercadoria.unit === 'METRO' ? 'm' : 'un'}</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    R$ {(mercadoria.unit_cost || 0).toFixed(2)}/{mercadoria.unit === 'METRO' ? 'm' : 'un'}
                  </p>
                </div>
                
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}