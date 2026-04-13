import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCustomerMutation } from '@/hooks/useSupabase';
import { Loader2, User } from 'lucide-react';
import { toast } from "sonner";

export default function CustomerForm({ customer, onSave, onCancel }) {
  const customerMutation = useCustomerMutation();
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    birth_date: customer?.birth_date || '',
    accepts_promotions: customer?.accepts_promotions !== undefined ? customer.accepts_promotions : true,
    notes: customer?.notes || '',
  });
  
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Preencha o nome do cliente');
      return;
    }

    setSaving(true);
    try {
      if (customer?.id) {
        await customerMutation.mutateAsync({
          action: 'update',
          id: customer.id,
          data: formData
        });
      } else {
        await customerMutation.mutateAsync({
          action: 'create',
          data: {
            ...formData,
            total_purchases: 0,
            credit_balance: 0,
          }
        });
      }
      onSave();
    } catch (error) {
      toast.error('Erro ao salvar cliente');
    } finally {
      setSaving(false);
    }
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
          <User className="w-10 h-10 text-purple-500" />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-slate-700">Nome *</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nome do cliente"
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-slate-700">Telefone / WhatsApp</Label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
            placeholder="(00) 00000-0000"
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-slate-700">Email</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@exemplo.com"
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-slate-700">Data de Nascimento</Label>
          <Input
            type="date"
            value={formData.birth_date}
            onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
            className="mt-1"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div className="flex-1">
            <Label className="text-sm font-medium">
              Aceita receber promoções
            </Label>
            <p className="text-xs text-slate-500 mt-1">
              Vouchers de aniversário e sorteios
            </p>
          </div>
          <Switch
            checked={formData.accepts_promotions}
            onCheckedChange={(checked) => setFormData({ ...formData, accepts_promotions: checked })}
          />
        </div>

        <div>
          <Label className="text-slate-700">Observações</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Preferências, observações..."
            className="mt-1"
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            customer?.id ? 'Atualizar' : 'Cadastrar'
          )}
        </Button>
      </div>
    </form>
  );
}