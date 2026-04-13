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
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import { toast } from "sonner";

export default function MercadoriaForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = new URLSearchParams(window.location.search);
  const mercadoriaId = params.get('id');

  const [formData, setFormData] = useState({
    name: '',
    category: 'Cesta',
    unit: 'UN',
    current_stock: 0,
    unit_cost: 0,
    min_stock: 0,
    image_url: '',
    notes: ''
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: mercadoria } = useQuery({
    queryKey: ['mercadoria', mercadoriaId],
    queryFn: async () => {
      const items = await base44.entities.Mercadoria.filter({ id: mercadoriaId });
      return items[0];
    },
    enabled: !!mercadoriaId,
  });

  useEffect(() => {
    if (mercadoria) {
      setFormData(mercadoria);
    }
  }, [mercadoria]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Digite o nome da mercadoria');
      return;
    }

    setSaving(true);
    try {
      if (mercadoriaId) {
        await base44.entities.Mercadoria.update(mercadoriaId, formData);
        toast.success('Mercadoria atualizada!');
      } else {
        await base44.entities.Mercadoria.create(formData);
        toast.success('Mercadoria cadastrada!');
      }

      queryClient.invalidateQueries({ queryKey: ['mercadorias'] });
      navigate(createPageUrl('Mercadorias'));
    } catch (error) {
      toast.error('Erro ao salvar mercadoria');
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
          <h1 className="text-lg font-bold text-slate-800">
            {mercadoriaId ? 'Editar Mercadoria' : 'Nova Mercadoria'}
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Image Upload */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <Label>Foto (opcional)</Label>
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
            <label className="mt-2 flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-teal-300 transition-colors">
              {uploading ? (
                <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-500">Clique para enviar</span>
                </>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            </label>
          )}
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div>
            <Label>Nome *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Cesta de Vime Grande"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Categoria *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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

            <div>
              <Label>Unidade *</Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UN">Unidade (UN)</SelectItem>
                  <SelectItem value="METRO">Metro (M)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Estoque Mínimo</Label>
            <Input
              type="number"
              value={formData.min_stock}
              onChange={(e) => setFormData({ ...formData, min_stock: parseFloat(e.target.value) || 0 })}
              min="0"
              step={formData.unit === 'METRO' ? '0.1' : '1'}
              className="mt-1"
            />
            <p className="text-xs text-slate-500 mt-1">Alerta quando o estoque atingir este valor</p>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Detalhes, fornecedores..."
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
            className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              mercadoriaId ? 'Atualizar' : 'Cadastrar'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}