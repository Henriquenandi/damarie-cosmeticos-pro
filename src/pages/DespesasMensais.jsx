import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  Wallet,
  Plus,
  Search,
  TrendingDown,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
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
import { toast } from "sonner";
import moment from 'moment';

const categoryColors = {
  'Internet/Wi-Fi': 'bg-blue-100 text-blue-700',
  'Limpeza': 'bg-teal-100 text-teal-700',
  'Produtos de Limpeza': 'bg-green-100 text-green-700',
  'Aluguel': 'bg-purple-100 text-purple-700',
  'Energia': 'bg-yellow-100 text-yellow-700',
  'Água': 'bg-cyan-100 text-cyan-700',
  'Telefone': 'bg-indigo-100 text-indigo-700',
  'Transporte': 'bg-orange-100 text-orange-700',
  'Marketing': 'bg-pink-100 text-pink-700',
  'Outros': 'bg-slate-100 text-slate-700'
};

export default function DespesasMensais() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('month');
  const [despesaToDelete, setDespesaToDelete] = useState(null);

  const { data: despesas = [], isLoading } = useQuery({
    queryKey: ['despesas'],
    queryFn: () => base44.entities.DespesaMensal.list('-payment_date'),
  });

  const handleDelete = async () => {
    if (!despesaToDelete) return;

    try {
      await base44.entities.DespesaMensal.delete(despesaToDelete.id);
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      setDespesaToDelete(null);
      toast.success('Despesa excluída com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir despesa');
    }
  };

  // Filter by period
  const now = moment();
  const filteredDespesas = despesas.filter(d => {
    const matchSearch = !search || 
      d.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || d.category === categoryFilter;
    
    let matchPeriod = true;
    if (periodFilter === 'month') {
      matchPeriod = moment(d.payment_date).isSame(now, 'month');
    } else if (periodFilter === 'year') {
      matchPeriod = moment(d.payment_date).isSame(now, 'year');
    }
    
    return matchSearch && matchCategory && matchPeriod;
  });

  // Calculate totals
  const totalPago = filteredDespesas
    .filter(d => d.status === 'pago')
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  const totalPendente = filteredDespesas
    .filter(d => d.status === 'pendente')
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  // Group by month
  const despesasByMonth = filteredDespesas.reduce((groups, despesa) => {
    const month = moment(despesa.payment_date).format('MMMM YYYY');
    if (!groups[month]) groups[month] = [];
    groups[month].push(despesa);
    return groups;
  }, {});

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
          <h1 className="text-2xl font-bold text-slate-800">Despesas Mensais</h1>
          <p className="text-slate-500 text-sm">{filteredDespesas.length} despesas</p>
        </div>
        <Link to={createPageUrl('DespesaMensalForm')}>
          <Button className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800">
            <Plus className="w-5 h-5 lg:mr-2" />
            <span className="hidden lg:inline">Nova Despesa</span>
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 mb-1">Total Pago</p>
              <p className="text-3xl font-bold text-red-700">R$ {totalPago.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-200 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 mb-1">Total Pendente</p>
              <p className="text-3xl font-bold text-amber-700">R$ {totalPendente.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-200 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Buscar despesas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
              <SelectItem value="all">Todas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Todas</SelectItem>
              <SelectItem value="Internet/Wi-Fi">Internet/Wi-Fi</SelectItem>
              <SelectItem value="Limpeza">Limpeza</SelectItem>
              <SelectItem value="Produtos de Limpeza">Produtos de Limpeza</SelectItem>
              <SelectItem value="Aluguel">Aluguel</SelectItem>
              <SelectItem value="Energia">Energia</SelectItem>
              <SelectItem value="Água">Água</SelectItem>
              <SelectItem value="Telefone">Telefone</SelectItem>
              <SelectItem value="Transporte">Transporte</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Expenses List */}
      {filteredDespesas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
          <Wallet className="w-12 h-12 mx-auto mb-2 text-slate-300 opacity-50" />
          <p className="text-slate-500">
            {search || categoryFilter ? 'Nenhuma despesa encontrada' : 'Nenhuma despesa registrada'}
          </p>
          {!search && !categoryFilter && (
            <Link to={createPageUrl('DespesaMensalForm')}>
              <Button variant="outline" className="mt-4">
                Registrar Primeira Despesa
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(despesasByMonth).map(([month, despesas]) => (
            <div key={month} className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-500 uppercase px-2">
                {month}
              </h3>
              {despesas.map((despesa) => (
                <div 
                  key={despesa.id}
                  className="bg-white rounded-xl border border-slate-100 hover:shadow-sm transition-all overflow-hidden"
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <TrendingDown className="w-6 h-6 text-slate-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{despesa.description}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge className={categoryColors[despesa.category] || categoryColors['Outros']}>
                          {despesa.category}
                        </Badge>
                        <Badge className={despesa.status === 'pago' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                          {despesa.status === 'pago' ? 'Pago' : 'Pendente'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {despesa.recurrence === 'mensal' ? 'Mensal' : despesa.recurrence === 'anual' ? 'Anual' : 'Único'}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-red-600">R$ {(despesa.amount || 0).toFixed(2)}</p>
                      <p className="text-xs text-slate-400">
                        {moment(despesa.payment_date).format('DD/MM/YYYY')}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 px-4 pb-4">
                    <Link to={createPageUrl('DespesaMensalForm') + `?id=${despesa.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Editar
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDespesaToDelete(despesa)}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!despesaToDelete} onOpenChange={() => setDespesaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Despesa?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{despesaToDelete?.description}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}