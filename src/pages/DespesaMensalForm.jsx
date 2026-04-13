import React, { useState, useEffect } from 'react';
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
import { ArrowLeft, Loader2, Wallet } from 'lucide-react';
import { toast } from "sonner";
import moment from 'moment';

export default function DespesaMensalForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = new URLSearchParams(window.location.search);
  const despesaId = params.get('id');

  const [formData, setFormData] = useState({
    description: '',
    category: 'Outros',
    amount: '',
    payment_date: moment().format('YYYY-MM-DD'),
    recurrence: 'mensal',
    status: 'pago',
    notes: ''
  });

  const [saving, setSaving] = useState(false);

  const { data: despesa } = useQuery({
    queryKey: ['despesa', despesaId],
    queryFn: async () => {
      const items = await base44.entities.DespesaMensal.filter({ id: despesaId });
      return items[0];
    },
    enabled: !!despesaId,
  });

  useEffect(() => {
    if (despesa) {
      setFormData({
        description: despesa.description || '',
        category: despesa.category || 'Outros',
        amount: despesa.amount?.toString() || '',
        payment_date: despesa.payment_date || moment().format('YYYY-MM-DD'),
        recurrence: despesa.recurrence || 'mensal',
        status: despesa.status || 'pago',
        notes: despesa.notes || ''
      });
    }
  }, [despesa]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description || !formData.amount) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (despesaId) {
        await base44.entities.DespesaMensal.update(despesaId, data);
        toast.success('Despesa atualizada!');
      } else {
        await base44.entities.DespesaMensal.create(data);
        toast.success('Despesa registrada!');
      }

      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      navigate(createPageUrl('DespesasMensais'));
    } catch (error) {
      toast.error('Erro ao salvar despesa');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-4 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-slate-800">
            {despesaId ? 'Editar Despesa' : 'Nova Despesa Mensal'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div>
            <Label>Descrição *</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: Internet Vivo Fibra"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Categoria *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valor (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Data do Pagamento *</Label>
              <Input
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Recorrência</Label>
              <Select value={formData.recurrence} onValueChange={(value) => setFormData({ ...formData, recurrence: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                  <SelectItem value="unico">Único</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Informações adicionais sobre a despesa..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

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
                Salvando...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                {despesaId ? 'Atualizar Despesa' : 'Registrar Despesa'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}