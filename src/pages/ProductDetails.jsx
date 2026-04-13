import React, { useState } from 'react';
import { useProduct, useProductMutation, useSales } from '@/hooks/useSupabase';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ProductForm from '@/components/products/ProductForm';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Package,
  Plus,
  Minus,
  ShoppingCart
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import moment from 'moment';

const statusConfig = {
  em_estoque: { label: 'Em Estoque', color: 'bg-emerald-100 text-emerald-700' },
  sem_estoque: { label: 'Sem Estoque', color: 'bg-red-100 text-red-700' },
  apenas_catalogo: { label: 'Apenas Catálogo', color: 'bg-blue-100 text-blue-700' },
  inativo: { label: 'Inativo', color: 'bg-slate-100 text-slate-500' },
};

export default function ProductDetails() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  const { data: product, isLoading } = useProduct(productId);
  const { data: sales = [] } = useSales();
  const productMutation = useProductMutation();

  const productSales = sales.filter(s => 
    (s.items || []).some(i => i.product_id === productId)
  );

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productMutation.mutateAsync({
        action: 'delete',
        id: productId
      });
      navigate(createPageUrl('Products'));
    } catch (error) {
      toast.error('Erro ao excluir produto');
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  const handleStockAdjust = async (change) => {
    const newQty = Math.max(0, (product.stock_quantity || 0) + change);
    try {
      await productMutation.mutateAsync({
        action: 'update',
        id: productId,
        data: { 
          stock_quantity: newQty,
          status: newQty === 0 ? 'sem_estoque' : 'em_estoque'
        }
      });
      toast.success('Estoque atualizado!');
    } catch (error) {
      toast.error('Erro ao atualizar estoque');
    }
  };

  if (isLoading || !product) {
    return (
      <div className="p-4 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const status = statusConfig[product.status] || statusConfig.em_estoque;
  const profit = (product.selling_price || 0) - (product.cost_price || 0);
  const margin = product.selling_price ? ((profit / product.selling_price) * 100).toFixed(1) : 0;

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(createPageUrl('Products'))}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">{product.name}</h1>
          <p className="text-slate-500 text-sm">{product.brand} • {product.category}</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => setShowForm(true)}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setShowDelete(true)} className="text-red-500">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Product Image */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="aspect-square max-h-64 bg-slate-100 flex items-center justify-center">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
          ) : (
            <Package className="w-20 h-20 text-slate-300" />
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Badge className={status.color}>{status.label}</Badge>
            {product.code && (
              <span className="text-sm text-slate-400">Cód: {product.code}</span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-400 uppercase">Custo</p>
              <p className="font-semibold text-slate-700">R$ {(product.cost_price || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase">Venda</p>
              <p className="font-bold text-slate-800">R$ {(product.selling_price || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase">Lucro</p>
              <p className="font-semibold text-emerald-600">R$ {profit.toFixed(2)} ({margin}%)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Control */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <h3 className="font-semibold text-slate-800 mb-4">Controle de Estoque</h3>
        
        <div className="flex items-center justify-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            className="w-12 h-12 rounded-xl"
            onClick={() => handleStockAdjust(-1)}
            disabled={product.stock_quantity <= 0}
          >
            <Minus className="w-5 h-5" />
          </Button>
          
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex flex-col items-center justify-center text-white">
            <span className="text-3xl font-bold">{product.stock_quantity || 0}</span>
            <span className="text-xs opacity-80">em estoque</span>
          </div>
          
          <Button 
            variant="outline" 
            size="icon"
            className="w-12 h-12 rounded-xl"
            onClick={() => handleStockAdjust(1)}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        <p className="text-center text-sm text-slate-400 mt-4">
          Estoque mínimo: {product.min_stock || 2} unidades
        </p>
      </div>

      {/* Sales History */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Histórico de Vendas</h3>
          <p className="text-sm text-slate-400">{productSales.length} vendas encontradas</p>
        </div>
        
        <div className="divide-y divide-slate-50">
          {productSales.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Nenhuma venda deste produto</p>
            </div>
          ) : (
            productSales.slice(0, 10).map((sale) => {
              const item = (sale.items || []).find(i => i.product_id === productId);
              return (
                <div key={sale.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">
                      {sale.customer_name || 'Venda Avulsa'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {moment(sale.sale_date || sale.created_date).format('DD/MM/YYYY HH:mm')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">
                      {item?.quantity || 0}x R$ {(item?.unit_price || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-emerald-600">
                      R$ {(item?.subtotal || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={() => navigate(createPageUrl('NewSale') + `?product=${productId}`)}
          className="h-14 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Vender
        </Button>
        <Button 
          variant="outline"
          onClick={() => navigate(createPageUrl('StockEntry') + `?product=${productId}`)}
          className="h-14"
        >
          <Plus className="w-5 h-5 mr-2" />
          Entrada
        </Button>
      </div>

      {/* Edit Sheet */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Editar Produto</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <ProductForm
              product={product}
              onSave={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}