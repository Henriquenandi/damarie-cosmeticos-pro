import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useProductMutation } from '@/hooks/useSupabase';
import { uploadImage } from '@/utils/imageHelpers';
import { Camera, Upload, Loader2, X, Package } from 'lucide-react';
import { toast } from "sonner";

const brands = ['Natura', 'O Boticário', 'Avon', 'Eudora', 'Mary Kay', 'Jequiti', 'Hinode', 'Outro'];
const categories = ['Perfume', 'Maquiagem', 'Corpo', 'Cabelo', 'Rosto', 'Unhas', 'Infantil', 'Masculino', 'Kit', 'Outro'];
const statuses = [
  { value: 'em_estoque', label: 'Em Estoque' },
  { value: 'sem_estoque', label: 'Sem Estoque' },
  { value: 'apenas_catalogo', label: 'Apenas Catálogo' },
  { value: 'inativo', label: 'Inativo' },
];

export default function ProductForm({ product, onSave, onCancel }) {
  const productMutation = useProductMutation();
  const [formData, setFormData] = useState({
    name: product?.name || '',
    brand: product?.brand || '',
    code: product?.code || '',
    category: product?.category || '',
    cost_price: product?.cost_price || '',
    selling_price: product?.selling_price || '',
    stock_quantity: product?.stock_quantity || 0,
    min_stock: product?.min_stock || 2,
    image_url: product?.image_url || '',
    status: product?.status || 'em_estoque',
  });
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const profit = (parseFloat(formData.selling_price) || 0) - (parseFloat(formData.cost_price) || 0);
  const margin = formData.selling_price ? ((profit / parseFloat(formData.selling_price)) * 100).toFixed(1) : 0;

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const publicUrl = await uploadImage(file, 'product');
      setFormData({ ...formData, image_url: publicUrl });
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.brand || !formData.category || !formData.selling_price) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...formData,
        cost_price: parseFloat(formData.cost_price) || 0,
        selling_price: parseFloat(formData.selling_price),
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        min_stock: parseInt(formData.min_stock) || 2,
      };

      if (product?.id) {
        await productMutation.mutateAsync({
          action: 'update',
          id: product.id,
          data
        });
      } else {
        await productMutation.mutateAsync({
          action: 'create',
          data
        });
      }
      onSave();
    } catch (error) {
      toast.error('Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-32 h-32 rounded-2xl bg-slate-100 overflow-hidden border-2 border-dashed border-slate-200">
            {formData.image_url ? (
              <img src={formData.image_url} alt="Produto" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <Package className="w-10 h-10 mb-1" />
                <span className="text-xs">Sem foto</span>
              </div>
            )}
          </div>
          
          <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow">
            {uploading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Camera className="w-5 h-5 text-white" />
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
          
          {formData.image_url && (
            <button
              type="button"
              onClick={() => setFormData({ ...formData, image_url: '' })}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <Label className="text-slate-700">Nome do Produto *</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Perfume Luna"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-700">Marca *</Label>
            <Select value={formData.brand} onValueChange={(v) => setFormData({ ...formData, brand: v })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-slate-700">Categoria *</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-slate-700">Código (opcional)</Label>
          <Input
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="Ex: NAT-001"
            className="mt-1"
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-slate-50 rounded-xl p-4 space-y-4">
        <h3 className="font-semibold text-slate-800">Preços</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-700">Preço de Custo</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
              <Input
                type="number"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                placeholder="0,00"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label className="text-slate-700">Preço de Venda *</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
              <Input
                type="number"
                step="0.01"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                placeholder="0,00"
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {formData.selling_price && (
          <div className="flex items-center justify-between bg-emerald-50 rounded-lg p-3">
            <span className="text-sm text-emerald-700">Lucro por unidade</span>
            <span className="font-bold text-emerald-700">
              R$ {profit.toFixed(2)} ({margin}%)
            </span>
          </div>
        )}
      </div>

      {/* Stock */}
      <div className="bg-slate-50 rounded-xl p-4 space-y-4">
        <h3 className="font-semibold text-slate-800">Estoque</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-700">Quantidade Atual</Label>
            <Input
              type="number"
              value={formData.stock_quantity}
              onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-slate-700">Estoque Mínimo</Label>
            <Input
              type="number"
              value={formData.min_stock}
              onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label className="text-slate-700">Status</Label>
          <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Actions */}
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
            product?.id ? 'Atualizar' : 'Cadastrar'
          )}
        </Button>
      </div>
    </form>
  );
}