import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, BookOpen, XCircle } from 'lucide-react';

const statusConfig = {
  em_estoque: { label: 'Em Estoque', color: 'bg-emerald-100 text-emerald-700', icon: Package },
  sem_estoque: { label: 'Sem Estoque', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  apenas_catalogo: { label: 'Catálogo', color: 'bg-blue-100 text-blue-700', icon: BookOpen },
  inativo: { label: 'Inativo', color: 'bg-slate-100 text-slate-500', icon: XCircle },
};

const brandColors = {
  'Natura': 'bg-amber-50 text-amber-700 border-amber-200',
  'O Boticário': 'bg-green-50 text-green-700 border-green-200',
  'Avon': 'bg-pink-50 text-pink-700 border-pink-200',
  'Eudora': 'bg-purple-50 text-purple-700 border-purple-200',
  'Mary Kay': 'bg-rose-50 text-rose-700 border-rose-200',
  'Jequiti': 'bg-orange-50 text-orange-700 border-orange-200',
  'Hinode': 'bg-blue-50 text-blue-700 border-blue-200',
  'Outro': 'bg-slate-50 text-slate-700 border-slate-200',
};

export default function ProductCard({ product, onClick, compact = false }) {
  const status = statusConfig[product.status] || statusConfig.em_estoque;
  const StatusIcon = status.icon;
  const profit = (product.selling_price || 0) - (product.cost_price || 0);
  const margin = product.selling_price ? ((profit / product.selling_price) * 100).toFixed(0) : 0;
  const isLowStock = product.stock_quantity <= (product.min_stock || 2) && product.status === 'em_estoque';

  if (compact) {
    return (
      <div 
        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-purple-200 hover:shadow-sm transition-all cursor-pointer"
        onClick={onClick}
      >
        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-5 h-5 text-slate-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-800 truncate">{product.name}</p>
          <p className="text-xs text-slate-400">{product.brand}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-800">R$ {(product.selling_price || 0).toFixed(2)}</p>
          <p className="text-xs text-slate-400">Qtd: {product.stock_quantity || 0}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white rounded-2xl border ${isLowStock ? 'border-amber-200' : 'border-slate-100'} hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group`}
      onClick={onClick}
    >
      {isLowStock && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium px-3 py-1 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Estoque baixo
        </div>
      )}
      
      <div className="p-4">
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <Package className="w-8 h-8 text-slate-300" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-800 truncate">{product.name}</h3>
                {product.code && (
                  <p className="text-xs text-slate-400">Cód: {product.code}</p>
                )}
              </div>
              <Badge className={`${status.color} text-[10px] flex-shrink-0`}>
                {status.label}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={`${brandColors[product.brand] || brandColors['Outro']} text-xs`}>
                {product.brand}
              </Badge>
              <Badge variant="outline" className="text-xs text-slate-500">
                {product.category}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-50">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Custo</p>
            <p className="font-medium text-slate-600">R$ {(product.cost_price || 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Venda</p>
            <p className="font-bold text-slate-800">R$ {(product.selling_price || 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Lucro</p>
            <p className="font-medium text-emerald-600">R$ {profit.toFixed(2)} ({margin}%)</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              product.stock_quantity > (product.min_stock || 2) 
                ? 'bg-emerald-100' 
                : product.stock_quantity > 0 
                  ? 'bg-amber-100' 
                  : 'bg-red-100'
            }`}>
              <span className={`text-sm font-bold ${
                product.stock_quantity > (product.min_stock || 2) 
                  ? 'text-emerald-600' 
                  : product.stock_quantity > 0 
                    ? 'text-amber-600' 
                    : 'text-red-600'
              }`}>
                {product.stock_quantity || 0}
              </span>
            </div>
            <span className="text-xs text-slate-400">em estoque</span>
          </div>
        </div>
      </div>
    </div>
  );
}