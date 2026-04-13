import React, { useState, useEffect } from 'react';
import { useProducts, useProductMutation } from '@/hooks/useSupabase';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ProductCard from '@/components/ui/ProductCard';
import ProductForm from '@/components/products/ProductForm';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Package, 
  Filter,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

const brands = ['Natura', 'O Boticário', 'Avon', 'Eudora', 'Mary Kay', 'Jequiti', 'Hinode', 'Outro'];
const categories = ['Perfume', 'Maquiagem', 'Corpo', 'Cabelo', 'Rosto', 'Unhas', 'Infantil', 'Masculino', 'Kit', 'Outro'];

export default function Products() {
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Check URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new') {
      setShowForm(true);
    }
    if (params.get('filter') === 'low_stock') {
      setStatusFilter('low_stock');
    }
  }, []);



  // Calculate stock values
  const stockValue = products.reduce((sum, p) => 
    sum + ((p.stock_quantity || 0) * (p.cost_price || 0)), 0
  );
  const stockSellingValue = products.reduce((sum, p) => 
    sum + ((p.stock_quantity || 0) * (p.selling_price || 0)), 0
  );

  const filteredProducts = products.filter(p => {
    const matchSearch = !search || 
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.code?.toLowerCase().includes(search.toLowerCase());
    const matchBrand = !brandFilter || p.brand === brandFilter;
    const matchCategory = !categoryFilter || p.category === categoryFilter;
    const matchStatus = !statusFilter || 
      (statusFilter === 'low_stock' 
        ? p.stock_quantity <= (p.min_stock || 2) && p.status === 'em_estoque'
        : p.status === statusFilter);
    
    return matchSearch && matchBrand && matchCategory && matchStatus;
  });

  const activeFilters = [brandFilter, categoryFilter, statusFilter].filter(Boolean).length;

  const handleProductClick = (product) => {
    navigate(createPageUrl('ProductDetails') + `?id=${product.id}`);
  };

  const handleSave = () => {
    setShowForm(false);
    setEditProduct(null);
    // Products will be automatically refreshed by the hook
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Produtos</h1>
          <p className="text-slate-500 text-sm">{products.length} produtos cadastrados</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-200"
        >
          <Plus className="w-5 h-5 lg:mr-2" />
          <span className="hidden lg:inline">Novo Produto</span>
        </Button>
      </div>

      {/* Stock Value Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
          <p className="text-sm text-blue-600 mb-1">Valor em Estoque (Custo)</p>
          <p className="text-2xl font-bold text-blue-700">R$ {stockValue.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-4 border border-emerald-200">
          <p className="text-sm text-emerald-600 mb-1">Valor em Estoque (Venda)</p>
          <p className="text-2xl font-bold text-emerald-700">R$ {stockSellingValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className={activeFilters > 0 ? 'border-purple-500 text-purple-600' : ''}
          >
            <SlidersHorizontal className="w-5 h-5" />
            {activeFilters > 0 && (
              <Badge className="ml-2 bg-purple-500">{activeFilters}</Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-700">Filtros</span>
              {activeFilters > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setBrandFilter('');
                    setCategoryFilter('');
                    setStatusFilter('');
                  }}
                  className="text-red-500"
                >
                  Limpar filtros
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Marca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Todas as marcas</SelectItem>
                  {brands.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Todas as categorias</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Todos os status</SelectItem>
                  <SelectItem value="em_estoque">Em Estoque</SelectItem>
                  <SelectItem value="sem_estoque">Sem Estoque</SelectItem>
                  <SelectItem value="apenas_catalogo">Apenas Catálogo</SelectItem>
                  <SelectItem value="low_stock">Estoque Baixo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title={search || activeFilters > 0 ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
          description={search || activeFilters > 0 
            ? "Tente ajustar os filtros de busca" 
            : "Comece cadastrando seu primeiro produto para gerenciar seu estoque"}
          actionLabel={!search && activeFilters === 0 ? "Cadastrar Produto" : undefined}
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => handleProductClick(product)}
            />
          ))}
        </div>
      )}

      {/* Product Form Sheet */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editProduct ? 'Editar Produto' : 'Novo Produto'}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <ProductForm
              product={editProduct}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setEditProduct(null);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}