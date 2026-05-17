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
  AlertCircle,
  CheckCircle2,
  Trash2,
  Pencil,
  RefreshCw,
  Calendar
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
                  className="bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    {/* Status dot */}
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${despesa.status === 'pago' ? 'bg-emerald-400' : 'bg-amber-400'}`} />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-800 text-sm truncate">{despesa.description}</p>
                        {despesa.recurrence !== 'unico' && (
                          <RefreshCw className="w-3 h-3 text-slate-400 flex-shrink-0" title={despesa.recurrence} />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${categoryColors[despesa.category] || categoryColors['Outros']}`}>
                          {despesa.category}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {moment(despesa.payment_date).format('DD/MM/YY')}
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right flex-shrink-0 mr-2">
                      <p className="font-bold text-sm text-red-600">R$ {(despesa.amount || 0).toFixed(2)}</p>
                      <p className={`text-[11px] font-medium ${despesa.status === 'pago' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {despesa.status === 'pago' ? 'Pago' : 'Pendente'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Link to={createPageUrl('DespesaMensalForm') + `?id=${despesa.id}`}>
                        <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                      <button
                        onClick={() => setDespesaToDelete(despesa)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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