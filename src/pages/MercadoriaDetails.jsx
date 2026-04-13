import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Edit, 
  Package2,
  TrendingUp,
  TrendingDown,
  Calendar,
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

export default function MercadoriaDetails() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = new URLSearchParams(window.location.search);
  const mercadoriaId = params.get('id');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: mercadoria, isLoading } = useQuery({
    queryKey: ['mercadoria', mercadoriaId],
    queryFn: async () => {
      const items = await base44.entities.Mercadoria.filter({ id: mercadoriaId });
      return items[0];
    },
    enabled: !!mercadoriaId,
  });

  const { data: entries = [] } = useQuery({
    queryKey: ['entradas', mercadoriaId],
    queryFn: () => base44.entities.EntradaMercadoria.filter({ mercadoria_id: mercadoriaId }),
    enabled: !!mercadoriaId,
  });

  const { data: consumptions = [] } = useQuery({
    queryKey: ['consumos', mercadoriaId],
    queryFn: () => base44.entities.ConsumoMercadoria.filter({ mercadoria_id: mercadoriaId }),
    enabled: !!mercadoriaId,
  });

  if (isLoading || !mercadoria) {
    return (
      <div className="p-4 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const isLowStock = mercadoria.current_stock <= (mercadoria.min_stock || 0) && mercadoria.current_stock > 0;
  const isOutOfStock = mercadoria.current_stock <= 0;

  const recentMovements = [
    ...entries.map(e => ({ ...e, type: 'entry', date: e.entry_date || e.created_date })),
    ...consumptions.map(c => ({ ...c, type: 'consumption', date: c.consumption_date || c.created_date }))
  ].sort((a, b) => moment(b.date).diff(moment(a.date))).slice(0, 10);

  const handleDelete = async () => {
    try {
      await base44.entities.Mercadoria.delete(mercadoriaId);
      queryClient.invalidateQueries({ queryKey: ['mercadorias'] });
      toast.success('Mercadoria excluída com sucesso');
      navigate(createPageUrl('Mercadorias'));
    } catch (error) {
      toast.error('Erro ao excluir mercadoria');
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl('Mercadorias'))}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">{mercadoria.name}</h1>
          <Badge className="mt-1 bg-teal-100 text-teal-700">
            {mercadoria.category}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl('MercadoriaForm') + `?id=${mercadoria.id}`}>
            <Button variant="outline" size="icon">
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Image */}
      {mercadoria.image_url && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <img src={mercadoria.image_url} alt={mercadoria.name} className="w-full h-64 object-cover" />
        </div>
      )}

      {/* Stock Status */}
      <div className={`rounded-2xl border-2 p-6 ${
        isOutOfStock ? 'bg-red-50 border-red-200' :
        isLowStock ? 'bg-amber-50 border-amber-200' :
        'bg-emerald-50 border-emerald-200'
      }`}>
        <div className="text-center">
          <p className="text-sm text-slate-600 mb-2">Estoque Atual</p>
          <p className={`text-4xl font-bold ${
            isOutOfStock ? 'text-red-600' :
            isLowStock ? 'text-amber-600' :
            'text-emerald-600'
          }`}>
            {mercadoria.current_stock.toFixed(mercadoria.unit === 'METRO' ? 1 : 0)}
            <span className="text-2xl ml-2">{mercadoria.unit === 'METRO' ? 'm' : 'un'}</span>
          </p>
          {isLowStock && !isOutOfStock && (
            <p className="text-sm text-amber-700 mt-2">⚠️ Estoque baixo</p>
          )}
          {isOutOfStock && (
            <p className="text-sm text-red-700 mt-2">⚠️ Sem estoque</p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3">
        <div className="flex justify-between">
          <span className="text-slate-600">Custo unitário:</span>
          <span className="font-bold text-slate-800">
            R$ {(mercadoria.unit_cost || 0).toFixed(2)}/{mercadoria.unit === 'METRO' ? 'm' : 'un'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Estoque mínimo:</span>
          <span className="font-bold text-slate-800">
            {(mercadoria.min_stock || 0).toFixed(mercadoria.unit === 'METRO' ? 1 : 0)} {mercadoria.unit === 'METRO' ? 'm' : 'un'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Unidade:</span>
          <span className="font-bold text-slate-800">
            {mercadoria.unit === 'METRO' ? 'Metro (M)' : 'Unidade (UN)'}
          </span>
        </div>
        {mercadoria.notes && (
          <div className="pt-3 border-t border-slate-100">
            <p className="text-sm text-slate-600">Observações:</p>
            <p className="text-slate-700 mt-1">{mercadoria.notes}</p>
          </div>
        )}
      </div>

      {/* Recent Movements */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Movimentações Recentes</h3>
        </div>
        {recentMovements.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>Nenhuma movimentação</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentMovements.map((movement, index) => (
              <div key={index} className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  movement.type === 'entry' ? 'bg-emerald-100' : 'bg-slate-100'
                }`}>
                  {movement.type === 'entry' ? (
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-slate-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800">
                    {movement.type === 'entry' ? 'Entrada' : movement.reason}
                  </p>
                  <p className="text-xs text-slate-400">
                    {moment(movement.date).format('DD/MM/YYYY HH:mm')}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${movement.type === 'entry' ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {movement.type === 'entry' ? '+' : '-'}{movement.quantity.toFixed(mercadoria.unit === 'METRO' ? 1 : 0)} {mercadoria.unit === 'METRO' ? 'm' : 'un'}
                  </p>
                  <p className="text-xs text-slate-400">
                    R$ {((movement.type === 'entry' ? movement.total_paid : movement.cost_consumed) || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link to={createPageUrl('EntradaMercadoria')}>
          <Button variant="outline" className="w-full">
            <TrendingUp className="w-4 h-4 mr-2" />
            Registrar Entrada
          </Button>
        </Link>
        <Link to={createPageUrl('ConsumoMercadoria')}>
          <Button variant="outline" className="w-full">
            <TrendingDown className="w-4 h-4 mr-2" />
            Registrar Consumo
          </Button>
        </Link>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Mercadoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{mercadoria.name}"? Esta ação não pode ser desfeita.
              {(entries.length > 0 || consumptions.length > 0) && (
                <span className="block mt-2 text-amber-600 font-medium">
                  ⚠️ Esta mercadoria possui {entries.length + consumptions.length} movimentação(ões) registrada(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir Mercadoria
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}