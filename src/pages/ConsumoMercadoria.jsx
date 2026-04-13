import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, TrendingDown, Package2, AlertTriangle } from 'lucide-react';
import { toast } from "sonner";

export default function ConsumoMercadoria() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedMercadoria, setSelectedMercadoria] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('Kit Presente');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: mercadorias = [] } = useQuery({
    queryKey: ['mercadorias'],
    queryFn: () => base44.entities.Mercadoria.list(),
  });

  const costConsumed = (selectedMercadoria && quantity) 
    ? (parseFloat(quantity) * (selectedMercadoria.unit_cost || 0)).toFixed(2)
    : '0.00';

  const newStock = selectedMercadoria && quantity
    ? (selectedMercadoria.current_stock || 0) - parseFloat(quantity)
    : 0;

  const hasInsufficientStock = newStock < 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMercadoria) {
      toast.error('Selecione uma mercadoria');
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error('Digite a quantidade');
      return;
    }

    setSaving(true);
    try {
      const qty = parseFloat(quantity);
      const cost = qty * (selectedMercadoria.unit_cost || 0);

      // Create consumption record
      await base44.entities.ConsumoMercadoria.create({
        mercadoria_id: selectedMercadoria.id,
        mercadoria_name: selectedMercadoria.name,
        quantity: qty,
        reason,
        cost_consumed: cost,
        consumption_date: new Date().toISOString(),
        notes: notes || ''
      });

      // Update stock (allow negative)
      const newStockValue = Math.max(0, (selectedMercadoria.current_stock || 0) - qty);
      await base44.entities.Mercadoria.update(selectedMercadoria.id, {
        current_stock: newStockValue
      });

      queryClient.invalidateQueries({ queryKey: ['mercadorias'] });
      
      if (hasInsufficientStock) {
        toast.success('Consumo registrado (estoque insuficiente)', { duration: 4000 });
      } else {
        toast.success('Consumo registrado!');
      }
      
      navigate(createPageUrl('Mercadorias'));
    } catch (error) {
      toast.error('Erro ao registrar consumo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-4 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-800">Consumo de Mercadoria</h1>
            <p className="text-sm text-slate-500">Registrar uso/saída</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Mercadoria Selection */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div>
            <Label>Mercadoria *</Label>
            {mercadorias.length === 0 ? (
              <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                Nenhuma mercadoria cadastrada. Cadastre primeiro em Mercadorias.
              </div>
            ) : (
              <Select 
                value={selectedMercadoria?.id} 
                onValueChange={(id) => {
                  const merc = mercadorias.find(m => m.id === id);
                  setSelectedMercadoria(merc || null);
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione a mercadoria" />
                </SelectTrigger>
                <SelectContent>
                  {mercadorias.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} - {m.current_stock.toFixed(m.unit === 'METRO' ? 1 : 0)} {m.unit === 'METRO' ? 'm' : 'un'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedMercadoria && (
            <div className="bg-slate-50 rounded-lg p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center">
                <Package2 className="w-6 h-6 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800">{selectedMercadoria.name}</p>
                <p className="text-sm text-slate-500">
                  Estoque atual: {selectedMercadoria.current_stock.toFixed(selectedMercadoria.unit === 'METRO' ? 1 : 0)} {selectedMercadoria.unit === 'METRO' ? 'm' : 'un'}
                </p>
                <p className="text-xs text-slate-400">
                  Custo: R$ {(selectedMercadoria.unit_cost || 0).toFixed(2)}/{selectedMercadoria.unit === 'METRO' ? 'm' : 'un'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Consumption Details */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div>
            <Label>Quantidade Consumida *</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              min="0"
              step={selectedMercadoria?.unit === 'METRO' ? '0.1' : '1'}
              className="mt-1"
            />
            {selectedMercadoria && (
              <p className="text-xs text-slate-500 mt-1">
                Em {selectedMercadoria.unit === 'METRO' ? 'metros' : 'unidades'}
              </p>
            )}
          </div>

          <div>
            <Label>Motivo *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Kit Presente">Kit Presente</SelectItem>
                <SelectItem value="Ajuste">Ajuste de Estoque</SelectItem>
                <SelectItem value="Perda">Perda/Dano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalhes do consumo..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        {/* Insufficient Stock Warning */}
        {hasInsufficientStock && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-800">Estoque Insuficiente</p>
              <p className="text-sm text-amber-600 mt-1">
                O estoque atual não é suficiente para esta quantidade, mas você pode prosseguir.
                O estoque ficará em {newStock.toFixed(selectedMercadoria.unit === 'METRO' ? 1 : 0)}.
              </p>
            </div>
          </div>
        )}

        {/* Summary */}
        {selectedMercadoria && quantity && (
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingDown className="w-6 h-6 text-slate-600" />
              <h3 className="font-bold text-slate-800">Resumo do Consumo</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Quantidade:</span>
                <span className="font-bold text-slate-800">
                  {parseFloat(quantity).toFixed(selectedMercadoria.unit === 'METRO' ? 1 : 0)} {selectedMercadoria.unit === 'METRO' ? 'm' : 'un'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Custo consumido:</span>
                <span className="font-bold text-slate-800">R$ {costConsumed}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-600">Estoque atual:</span>
                <span className="text-slate-800">
                  {selectedMercadoria.current_stock.toFixed(selectedMercadoria.unit === 'METRO' ? 1 : 0)} {selectedMercadoria.unit === 'METRO' ? 'm' : 'un'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Novo estoque:</span>
                <span className={`font-bold ${newStock < 0 ? 'text-red-600' : newStock <= (selectedMercadoria.min_stock || 0) ? 'text-amber-600' : 'text-slate-800'}`}>
                  {newStock.toFixed(selectedMercadoria.unit === 'METRO' ? 1 : 0)} {selectedMercadoria.unit === 'METRO' ? 'm' : 'un'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 mr-2" />
                Registrar Consumo
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}