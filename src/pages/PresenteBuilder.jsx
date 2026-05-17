import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Loader2, 
  Upload, 
  X,
  Plus,
  Trash2,
  Package,
  Package2,
  Gift,
  Calculator
} from 'lucide-react';
import { toast } from "sonner";

export default function PresenteBuilder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = new URLSearchParams(window.location.search);
  const presenteId = params.get('id');

  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    quantity: 1,
    cosmetic_items: [],
    mercadoria_items: [],
    additional_costs: { labor: 0, other: 0 },
    margin_percentage: 30,
    final_price: 0,
    status: 'active',
    notes: ''
  });
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: presente } = useQuery({
    queryKey: ['presente', presenteId],
    queryFn: async () => {
      const items = await base44.entities.Presente.filter({ id: presenteId });
      return items[0];
    },
    enabled: !!presenteId,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: mercadorias = [] } = useQuery({
    queryKey: ['mercadorias'],
    queryFn: () => base44.entities.Mercadoria.list(),
  });

  useEffect(() => {
    if (presente) {
      setFormData({
        ...presente,
        additional_costs: presente.additional_costs || { labor: 0, other: 0 }
      });
    }
  }, [presente]);

  // Calculate costs
  const cosmeticCost = formData.cosmetic_items.reduce((sum, item) => 
    sum + ((item.cost_price || 0) * (item.quantity || 0)), 0
  );

  const mercadoriaCost = formData.mercadoria_items.reduce((sum, item) => 
    sum + ((item.unit_cost || 0) * (item.quantity || 0)), 0
  );

  const additionalCostsTotal = (formData.additional_costs.labor || 0) + (formData.additional_costs.other || 0);
  
  const totalCost = cosmeticCost + mercadoriaCost + additionalCostsTotal;
  
  const suggestedPrice = totalCost * (1 + (formData.margin_percentage || 0) / 100);
  
  const finalPrice = formData.final_price || suggestedPrice;
  
  const estimatedProfit = finalPrice - totalCost;

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, image_url: file_url });
      toast.success('Imagem enviada!');
    } catch (error) {
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const addCosmeticItem = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = formData.cosmetic_items.find(i => i.product_id === productId);
    if (existing) {
      toast.error('Produto já adicionado');
      return;
    }

    setFormData({
      ...formData,
      cosmetic_items: [...formData.cosmetic_items, {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        cost_price: product.cost_price || 0
      }]
    });
  };

  const updateCosmeticQty = (index, qty) => {
    const items = [...formData.cosmetic_items];
    items[index].quantity = Math.max(1, qty);
    setFormData({ ...formData, cosmetic_items: items });
  };

  const removeCosmeticItem = (index) => {
    const items = formData.cosmetic_items.filter((_, i) => i !== index);
    setFormData({ ...formData, cosmetic_items: items });
  };

  const addMercadoriaItem = (mercadoriaId) => {
    const mercadoria = mercadorias.find(m => m.id === mercadoriaId);
    if (!mercadoria) return;

    const existing = formData.mercadoria_items.find(i => i.mercadoria_id === mercadoriaId);
    if (existing) {
      toast.error('Mercadoria já adicionada');
      return;
    }

    setFormData({
      ...formData,
      mercadoria_items: [...formData.mercadoria_items, {
        mercadoria_id: mercadoria.id,
        mercadoria_name: mercadoria.name,
        quantity: mercadoria.unit === 'METRO' ? 0.5 : 1,
        unit_cost: mercadoria.unit_cost || 0,
        unit: mercadoria.unit
      }]
    });
  };

  const updateMercadoriaQty = (index, qty) => {
    const items = [...formData.mercadoria_items];
    items[index].quantity = Math.max(0.1, qty);
    setFormData({ ...formData, mercadoria_items: items });
  };

  const removeMercadoriaItem = (index) => {
    const items = formData.mercadoria_items.filter((_, i) => i !== index);
    setFormData({ ...formData, mercadoria_items: items });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Digite o nome do kit');
      return;
    }

    if (formData.cosmetic_items.length === 0 && formData.mercadoria_items.length === 0) {
      toast.error('Adicione pelo menos um item ao kit');
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...formData,
        total_cost: totalCost,
        suggested_price: suggestedPrice,
        final_price: finalPrice,
        estimated_profit: estimatedProfit
      };

      if (presenteId) {
        await base44.entities.Presente.update(presenteId, data);
        toast.success('Kit atualizado!');
      } else {
        await base44.entities.Presente.create(data);
        toast.success('Kit criado!');
      }

      queryClient.invalidateQueries({ queryKey: ['presentes'] });
      navigate(createPageUrl('Presentes'));
    } catch (error) {
      toast.error('Erro ao salvar kit');
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
            {presenteId ? 'Editar Kit' : 'Criar Kit de Presente'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div>
            <Label>Nome do Kit *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Kit Romântico Dia dos Namorados"
              className="mt-1"
            />
          </div>

          {/* Image */}
          <div>
            <Label>Foto do Kit</Label>
            {formData.image_url ? (
              <div className="relative mt-2">
                <img src={formData.image_url} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setFormData({ ...formData, image_url: '' })}
                  className="absolute top-2 right-2 bg-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="mt-2 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-pink-300 transition-colors">
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-sm text-slate-500">Clique para enviar</span>
                  </>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              </label>
            )}
          </div>

          <div>
            <Label>Quantidade em Estoque</Label>
            <Input
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cosmetic Items */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-slate-800">Produtos Cosméticos</h3>
            </div>
          </div>

          {formData.cosmetic_items.length > 0 && (
            <div className="space-y-2 mb-4">
              {formData.cosmetic_items.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{item.product_name}</p>
                    <p className="text-xs text-slate-500">R$ {(item.cost_price || 0).toFixed(2)} cada</p>
                  </div>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateCosmeticQty(index, parseInt(e.target.value))}
                    min="1"
                    className="w-20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCosmeticItem(index)}
                    className="text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Select onValueChange={addCosmeticItem}>
            <SelectTrigger>
              <SelectValue placeholder="+ Adicionar produto" />
            </SelectTrigger>
            <SelectContent>
              {[...products].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mercadoria Items */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package2 className="w-5 h-5 text-teal-500" />
              <h3 className="font-semibold text-slate-800">Mercadorias (Embalagens)</h3>
            </div>
          </div>

          {formData.mercadoria_items.length > 0 && (
            <div className="space-y-2 mb-4">
              {formData.mercadoria_items.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{item.mercadoria_name}</p>
                    <p className="text-xs text-slate-500">
                      R$ {(item.unit_cost || 0).toFixed(2)}/{item.unit === 'METRO' ? 'm' : 'un'}
                    </p>
                  </div>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateMercadoriaQty(index, parseFloat(e.target.value))}
                    min={item.unit === 'METRO' ? '0.1' : '1'}
                    step={item.unit === 'METRO' ? '0.1' : '1'}
                    className="w-24"
                  />
                  <span className="text-xs text-slate-500 w-6">{item.unit === 'METRO' ? 'm' : 'un'}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMercadoriaItem(index)}
                    className="text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Select onValueChange={addMercadoriaItem}>
            <SelectTrigger>
              <SelectValue placeholder="+ Adicionar mercadoria" />
            </SelectTrigger>
            <SelectContent>
              {[...mercadorias].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map(m => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name} ({m.unit === 'METRO' ? 'm' : 'un'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Additional Costs */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <h3 className="font-semibold text-slate-800">Custos Adicionais (opcional)</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Mão de obra</Label>
              <Input
                type="number"
                value={formData.additional_costs.labor}
                onChange={(e) => setFormData({
                  ...formData,
                  additional_costs: { ...formData.additional_costs, labor: parseFloat(e.target.value) || 0 }
                })}
                min="0"
                step="0.01"
                placeholder="R$ 0.00"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Outros</Label>
              <Input
                type="number"
                value={formData.additional_costs.other}
                onChange={(e) => setFormData({
                  ...formData,
                  additional_costs: { ...formData.additional_costs, other: parseFloat(e.target.value) || 0 }
                })}
                min="0"
                step="0.01"
                placeholder="R$ 0.00"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-pink-500" />
            <h3 className="font-semibold text-slate-800">Precificação</h3>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Custo cosméticos:</span>
              <span className="font-medium">R$ {cosmeticCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Custo mercadorias:</span>
              <span className="font-medium">R$ {mercadoriaCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Custos adicionais:</span>
              <span className="font-medium">R$ {additionalCostsTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200">
              <span className="text-slate-800 font-semibold">Custo Total:</span>
              <span className="font-bold text-slate-800">R$ {totalCost.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <Label>Margem de Lucro (%)</Label>
            <Input
              type="number"
              value={formData.margin_percentage}
              onChange={(e) => setFormData({ ...formData, margin_percentage: parseFloat(e.target.value) || 0 })}
              min="0"
              step="1"
              className="mt-1"
            />
            <p className="text-xs text-slate-500 mt-1">
              Preço sugerido: R$ {suggestedPrice.toFixed(2)}
            </p>
          </div>

          <div>
            <Label>Preço Final de Venda *</Label>
            <Input
              type="number"
              value={formData.final_price || suggestedPrice}
              onChange={(e) => setFormData({ ...formData, final_price: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
              className="mt-1"
            />
          </div>

          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <div className="flex justify-between items-center">
              <span className="text-emerald-700 font-medium">Lucro Estimado:</span>
              <span className="text-2xl font-bold text-emerald-600">R$ {estimatedProfit.toFixed(2)}</span>
            </div>
            {estimatedProfit > 0 && (
              <p className="text-xs text-emerald-600 mt-1">
                Margem real: {((estimatedProfit / finalPrice) * 100).toFixed(1)}%
              </p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <Label>Observações</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Instruções de montagem, ocasiões especiais..."
            className="mt-1"
            rows={3}
          />
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
            className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Gift className="w-4 h-4 mr-2" />
                {presenteId ? 'Atualizar Kit' : 'Criar Kit'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}