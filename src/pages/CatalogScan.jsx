import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Camera, 
  Upload,
  Loader2,
  Check,
  X,
  AlertTriangle,
  Package,
  Pencil,
  Trash2,
  Plus
} from 'lucide-react';
import { toast } from "sonner";

const brands = ['Natura', 'O Boticário', 'Avon', 'Eudora', 'Mary Kay', 'Jequiti', 'Hinode', 'Outro'];
const categories = ['Perfume', 'Maquiagem', 'Corpo', 'Cabelo', 'Rosto', 'Unhas', 'Infantil', 'Masculino', 'Kit', 'Outro'];

export default function CatalogScan() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detectedProducts, setDetectedProducts] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImageUrl(file_url);
      toast.success('Imagem carregada!');
    } catch (error) {
      toast.error('Erro ao carregar imagem');
    } finally {
      setUploading(false);
    }
  };

  const processImage = async () => {
    if (!imageUrl) {
      toast.error('Carregue uma imagem primeiro');
      return;
    }
    if (!selectedBrand) {
      toast.error('Selecione a marca do catálogo');
      return;
    }

    setProcessing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise esta imagem de catálogo de cosméticos da marca ${selectedBrand} e extraia os produtos visíveis.
        
Para cada produto encontrado, extraia:
- Nome do produto (se visível)
- Preço de venda (se visível, converter para número)
- Categoria provável (Perfume, Maquiagem, Corpo, Cabelo, Rosto, Unhas, Infantil, Masculino, Kit, Outro)

IMPORTANTE: 
- Extraia apenas produtos claramente visíveis na imagem
- Se o preço não estiver visível, deixe como 0
- Seja preciso nos nomes e preços
- Não invente produtos que não estão na imagem`,
        file_urls: [imageUrl],
        response_json_schema: {
          type: "object",
          properties: {
            products: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  selling_price: { type: "number" },
                  category: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (result.products && result.products.length > 0) {
        setDetectedProducts(result.products.map((p, i) => ({
          ...p,
          id: `temp-${i}`,
          brand: selectedBrand,
          cost_price: 0,
          stock_quantity: 0,
          status: 'apenas_catalogo',
          selected: true,
        })));
        toast.success(`${result.products.length} produtos detectados!`);
      } else {
        toast.info('Nenhum produto detectado na imagem');
      }
    } catch (error) {
      toast.error('Erro ao processar imagem');
    } finally {
      setProcessing(false);
    }
  };

  const updateProduct = (index, field, value) => {
    setDetectedProducts(prev => prev.map((p, i) => 
      i === index ? { ...p, [field]: value } : p
    ));
  };

  const removeProduct = (index) => {
    setDetectedProducts(prev => prev.filter((_, i) => i !== index));
  };

  const addManualProduct = () => {
    setDetectedProducts(prev => [...prev, {
      id: `temp-${Date.now()}`,
      name: '',
      brand: selectedBrand,
      category: 'Outro',
      selling_price: 0,
      cost_price: 0,
      stock_quantity: 0,
      status: 'apenas_catalogo',
      selected: true,
    }]);
    setEditingIndex(detectedProducts.length);
  };

  const saveProducts = async () => {
    const productsToSave = detectedProducts.filter(p => p.selected && p.name);
    
    if (productsToSave.length === 0) {
      toast.error('Selecione pelo menos um produto para salvar');
      return;
    }

    setSaving(true);
    try {
      for (const product of productsToSave) {
        await base44.entities.Product.create({
          name: product.name,
          brand: product.brand,
          category: product.category,
          selling_price: product.selling_price || 0,
          cost_price: product.cost_price || 0,
          stock_quantity: product.stock_quantity || 0,
          status: product.stock_quantity > 0 ? 'em_estoque' : 'apenas_catalogo',
        });
      }

      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`${productsToSave.length} produtos salvos!`);
      navigate(createPageUrl('Products'));
    } catch (error) {
      toast.error('Erro ao salvar produtos');
    } finally {
      setSaving(false);
    }
  };

  const selectedCount = detectedProducts.filter(p => p.selected).length;

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-4 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-800">Escanear Catálogo</h1>
            <p className="text-sm text-slate-500">Detectar produtos de foto do catálogo</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Instructions */}
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <p className="font-medium text-purple-800">Como funciona</p>
              <p className="text-sm text-purple-600 mt-1">
                1. Selecione a marca do catálogo<br/>
                2. Tire uma foto ou carregue uma imagem<br/>
                3. Revise e edite os produtos detectados<br/>
                4. Confirme para salvar no seu estoque
              </p>
            </div>
          </div>
        </div>

        {/* Brand Selection */}
        <div>
          <Label className="text-slate-700">Marca do Catálogo</Label>
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Selecione a marca" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Image Upload */}
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-6">
          {imageUrl ? (
            <div className="space-y-4">
              <img 
                src={imageUrl} 
                alt="Catálogo" 
                className="w-full max-h-64 object-contain rounded-xl"
              />
              <div className="flex gap-2">
                <label className="flex-1">
                  <div className="flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 rounded-lg cursor-pointer hover:bg-slate-200 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Trocar imagem</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <Button 
                  onClick={processImage}
                  disabled={processing || !selectedBrand}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      Detectar Produtos
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center py-8 cursor-pointer">
              {uploading ? (
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
                  <Camera className="w-8 h-8 text-purple-500" />
                </div>
              )}
              <p className="font-medium text-slate-700">
                {uploading ? 'Carregando...' : 'Carregar Foto do Catálogo'}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Toque para selecionar uma imagem
              </p>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* Detected Products */}
        {detectedProducts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">
                Produtos Detectados ({selectedCount} selecionados)
              </h3>
              <Button variant="outline" size="sm" onClick={addManualProduct}>
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>

            <div className="space-y-3">
              {detectedProducts.map((product, index) => (
                <div 
                  key={product.id}
                  className={`bg-white rounded-xl border-2 transition-all ${
                    product.selected ? 'border-purple-300' : 'border-slate-100'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => updateProduct(index, 'selected', !product.selected)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                          product.selected 
                            ? 'bg-purple-500 border-purple-500' 
                            : 'border-slate-300'
                        }`}
                      >
                        {product.selected && <Check className="w-4 h-4 text-white" />}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        {editingIndex === index ? (
                          <div className="space-y-3">
                            <Input
                              value={product.name}
                              onChange={(e) => updateProduct(index, 'name', e.target.value)}
                              placeholder="Nome do produto"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Select 
                                value={product.category} 
                                onValueChange={(v) => updateProduct(index, 'category', v)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((c) => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={product.selling_price}
                                  onChange={(e) => updateProduct(index, 'selling_price', parseFloat(e.target.value) || 0)}
                                  className="pl-9"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Custo R$</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={product.cost_price}
                                  onChange={(e) => updateProduct(index, 'cost_price', parseFloat(e.target.value) || 0)}
                                  className="pl-16"
                                />
                              </div>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Qtd</span>
                                <Input
                                  type="number"
                                  value={product.stock_quantity}
                                  onChange={(e) => updateProduct(index, 'stock_quantity', parseInt(e.target.value) || 0)}
                                  className="pl-10"
                                />
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => setEditingIndex(null)}
                              className="w-full"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Confirmar
                            </Button>
                          </div>
                        ) : (
                          <>
                            <p className="font-medium text-slate-800">{product.name || 'Produto sem nome'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-400">{product.category}</span>
                              <span className="text-xs text-slate-300">•</span>
                              <span className="font-bold text-purple-600">
                                R$ {(product.selling_price || 0).toFixed(2)}
                              </span>
                              {product.stock_quantity > 0 && (
                                <>
                                  <span className="text-xs text-slate-300">•</span>
                                  <span className="text-xs text-emerald-600">
                                    {product.stock_quantity} un
                                  </span>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      
                      {editingIndex !== index && (
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => setEditingIndex(index)}
                          >
                            <Pencil className="w-4 h-4 text-slate-400" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => removeProduct(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      {detectedProducts.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-slate-100 p-4 z-50">
          <Button 
            onClick={saveProducts}
            disabled={saving || selectedCount === 0}
            className="w-full h-14 text-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Salvar {selectedCount} Produto{selectedCount !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}