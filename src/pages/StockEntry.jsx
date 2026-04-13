import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  Package, 
  Search,
  Plus,
  Minus,
  Check,
  Loader2,
  X
} from 'lucide-react';
import { toast } from "sonner";

export default function StockEntry() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [costPrice, setCostPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  // Check URL params for pre-selected product
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('product');
    if (productId) {
      const product = products.find(p => p.id === productId);
      if (product) {
        setSelectedProduct(product);
        setCostPrice(product.cost_price?.toString() || '');
      }
    }
  }, [products]);

  const filteredProducts = products.filter(p => 
    !search || 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.code?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setCostPrice(product.cost_price?.toString() || '');
    setSearch('');
  };

  const handleEntry = async () => {
    if (!selectedProduct) {
      toast.error('Selecione um produto');
      return;
    }
    if (quantity <= 0) {
      toast.error('Informe uma quantidade válida');
      return;
    }

    setSaving(true);
    try {
      const cost = parseFloat(costPrice) || selectedProduct.cost_price || 0;
      const newStock = (selectedProduct.stock_quantity || 0) + quantity;

      // Update product
      await base44.entities.Product.update(selectedProduct.id, {
        stock_quantity: newStock,
        cost_price: cost,
        status: 'em_estoque',
        last_movement_date: new Date().toISOString(),
      });

      // Create stock entry record
      await base44.entities.StockEntry.create({
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        quantity: quantity,
        cost_price: cost,
        total_cost: cost * quantity,
        entry_type: 'manual',
        supplier: selectedProduct.brand,
        entry_date: new Date().toISOString(),
      });

      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`${quantity} unidades adicionadas ao estoque!`);
      
      // Reset for another entry
      setSelectedProduct(null);
      setQuantity(1);
      setCostPrice('');
    } catch (error) {
      toast.error('Erro ao registrar entrada');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-4 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-800">Entrada de Estoque</h1>
            <p className="text-sm text-slate-500">Registrar entrada de produtos</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Product Selection */}
        {!selectedProduct ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Buscar produto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:border-purple-200 transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{product.name}</p>
                    <p className="text-xs text-slate-400">{product.brand} • {product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">{product.stock_quantity || 0}</p>
                    <p className="text-xs text-slate-400">em estoque</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Selected Product */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                  {selectedProduct.image_url ? (
                    <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{selectedProduct.name}</p>
                  <p className="text-sm text-slate-400">{selectedProduct.brand} • {selectedProduct.category}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Estoque atual: <span className="font-bold">{selectedProduct.stock_quantity || 0}</span>
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSelectedProduct(null)}
                >
                  <X className="w-5 h-5 text-slate-400" />
                </Button>
              </div>
            </div>

            {/* Quantity */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <Label className="text-slate-700 block mb-4">Quantidade a Adicionar</Label>
              
              <div className="flex items-center justify-center gap-4">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="w-14 h-14 rounded-xl"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-6 h-6" />
                </Button>
                
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 h-14 text-center text-2xl font-bold"
                />
                
                <Button 
                  variant="outline" 
                  size="icon"
                  className="w-14 h-14 rounded-xl"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-6 h-6" />
                </Button>
              </div>

              <div className="flex justify-center gap-2 mt-4">
                {[5, 10, 20, 50].map((q) => (
                  <Button
                    key={q}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(q)}
                    className={quantity === q ? 'border-purple-500 text-purple-600' : ''}
                  >
                    +{q}
                  </Button>
                ))}
              </div>
            </div>

            {/* Cost Price */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <Label className="text-slate-700">Preço de Custo (opcional)</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                <Input
                  type="number"
                  step="0.01"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder={(selectedProduct.cost_price || 0).toFixed(2)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Estoque atual</span>
                <span className="text-slate-700">{selectedProduct.stock_quantity || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Quantidade a adicionar</span>
                <span className="text-emerald-600">+{quantity}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200">
                <span className="text-slate-800">Novo estoque</span>
                <span className="text-purple-600">{(selectedProduct.stock_quantity || 0) + quantity}</span>
              </div>
              {costPrice && (
                <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Custo total</span>
                  <span className="text-slate-700">R$ {(parseFloat(costPrice) * quantity).toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Action */}
            <Button 
              onClick={handleEntry}
              disabled={saving}
              className="w-full h-14 text-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Confirmar Entrada
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}