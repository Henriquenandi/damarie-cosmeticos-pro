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
import { ArrowLeft, Loader2, Archive, Package2 } from 'lucide-react';
import { toast } from "sonner";

export default function EntradaMercadoria() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedMercadoria, setSelectedMercadoria] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [totalPaid, setTotalPaid] = useState('');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: mercadorias = [] } = useQuery({
    queryKey: ['mercadorias'],
    queryFn: () => base44.entities.Mercadoria.list(),
  });

  const unitCost = (selectedMercadoria && quantity && totalPaid) 
    ? (parseFloat(totalPaid) / parseFloat(quantity)).toFixed(2)
    : '0.00';

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

    if (!totalPaid || parseFloat(totalPaid) <= 0) {
      toast.error('Digite o valor pago');
      return;
    }

    setSaving(true);
    try {
      const qty = parseFloat(quantity);
      const paid = parseFloat(totalPaid);
      const cost = paid / qty;

      // Create entry record
      await base44.entities.EntradaMercadoria.create({
        mercadoria_id: selectedMercadoria.id,
        mercadoria_name: selectedMercadoria.name,
        quantity: qty,
        total_paid: paid,
        unit_cost: cost,
        supplier: supplier || '',
        entry_date: new Date().toISOString(),
        notes: notes || ''
      });

      // Update mercadoria stock and cost
      await base44.entities.Mercadoria.update(selectedMercadoria.id, {
        current_stock: (selectedMercadoria.current_stock || 0) + qty,
        unit_cost: cost
      });

      queryClient.invalidateQueries({ queryKey: ['mercadorias'] });
      toast.success('Entrada registrada!');
      navigate(createPageUrl('Mercadorias'));
    } catch (error) {
      toast.error('Erro ao registrar entrada');
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
            <h1 className="text-lg font-bold text-slate-800">Entrada de Mercadoria</h1>
            <p className="text-sm text-slate-500">Registrar compra/reposição</p>
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
                      {m.name} ({m.unit === 'METRO' ? 'm' : 'un'})
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
              </div>
            </div>
          )}
        </div>

        {/* Purchase Details */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div>
            <Label>Quantidade Comprada *</Label>
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
            <Label>Valor Total Pago *</Label>
            <Input
              type="number"
              value={totalPaid}
              onChange={(e) => setTotalPaid(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Fornecedor (opcional)</Label>
            <Input
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Nome do fornecedor"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalhes da compra..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        {/* Summary */}
        {selectedMercadoria && quantity && totalPaid && (
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Archive className="w-6 h-6 text-teal-600" />
              <h3 className="font-bold text-slate-800">Resumo da Entrada</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Quantidade:</span>
                <span className="font-bold text-slate-800">
                  {parseFloat(quantity).toFixed(selectedMercadoria.unit === 'METRO' ? 1 : 0)} {selectedMercadoria.unit === 'METRO' ? 'm' : 'un'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Valor pago:</span>
                <span className="font-bold text-slate-800">R$ {parseFloat(totalPaid).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-teal-200">
                <span className="text-slate-600">Custo unitário:</span>
                <span className="font-bold text-teal-600">
                  R$ {unitCost}/{selectedMercadoria.unit === 'METRO' ? 'm' : 'un'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Novo estoque:</span>
                <span className="font-bold text-emerald-600">
                  {((selectedMercadoria.current_stock || 0) + parseFloat(quantity)).toFixed(selectedMercadoria.unit === 'METRO' ? 1 : 0)} {selectedMercadoria.unit === 'METRO' ? 'm' : 'un'}
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
            className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <Archive className="w-4 h-4 mr-2" />
                Registrar Entrada
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}