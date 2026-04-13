import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/supabaseClient';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Gift,
  Plus,
  Search,
  ChevronRight,
  Package,
  TrendingUp,
  Trash2
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
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
import { toast } from "sonner";

export default function Presentes() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [presenteToDelete, setPresenteToDelete] = useState(null);

  const { data: presentes = [], isLoading } = useQuery({
    queryKey: ['presentes'],
    queryFn: () => base44.entities.Presente.list('-created_date'),
  });

  const handleDelete = async () => {
    if (!presenteToDelete) return;

    try {
      await base44.entities.Presente.delete(presenteToDelete.id);
      queryClient.invalidateQueries({ queryKey: ['presentes'] });
      setPresenteToDelete(null);
      toast.success('Kit excluído com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir kit');
    }
  };

  const filteredPresentes = presentes.filter(p => {
    const matchSearch = !search || 
      p.name?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const activeKits = presentes.filter(p => p.status === 'active');

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kits de Presentes</h1>
          <p className="text-slate-500 text-sm">{activeKits.length} kits ativos</p>
        </div>
        <Link to={createPageUrl('PresenteBuilder')}>
          <Button className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700">
            <Plus className="w-5 h-5 lg:mr-2" />
            <span className="hidden lg:inline">Criar Kit</span>
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Buscar kits..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* List */}
      {filteredPresentes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
          <Gift className="w-12 h-12 mx-auto mb-2 text-slate-300 opacity-50" />
          <p className="text-slate-500">
            {search ? 'Nenhum kit encontrado' : 'Nenhum kit criado'}
          </p>
          {!search && (
            <Link to={createPageUrl('PresenteBuilder')}>
              <Button variant="outline" className="mt-4">
                Criar Primeiro Kit
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPresentes.map((presente) => {
            const cosmeticCount = (presente.cosmetic_items || []).length;
            const mercadoriaCount = (presente.mercadoria_items || []).length;

            return (
              <div 
                key={presente.id}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-sm transition-all"
              >
                <div className="flex">
                  <Link 
                    to={createPageUrl('PresenteBuilder') + `?id=${presente.id}`}
                    className="w-24 h-24 bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center flex-shrink-0"
                  >
                    {presente.image_url ? (
                      <img src={presente.image_url} alt={presente.name} className="w-full h-full object-cover" />
                    ) : (
                      <Gift className="w-10 h-10 text-pink-500" />
                    )}
                  </Link>

                  <div className="flex-1 p-4">
                    <Link 
                      to={createPageUrl('PresenteBuilder') + `?id=${presente.id}`}
                      className="block"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-800">{presente.name}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge className="bg-purple-100 text-purple-700 text-xs">
                              {cosmeticCount} cosméticos
                            </Badge>
                            <Badge className="bg-teal-100 text-teal-700 text-xs">
                              {mercadoriaCount} mercadorias
                            </Badge>
                            <Badge className={presente.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                              {presente.status === 'active' ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300" />
                      </div>
                    
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div>
                        <p className="text-xs text-slate-500">Custo</p>
                        <p className="font-bold text-slate-800">R$ {(presente.total_cost || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Preço Final</p>
                        <p className="font-bold text-pink-600">R$ {(presente.final_price || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Lucro</p>
                        <p className="font-bold text-emerald-600">R$ {(presente.estimated_profit || 0).toFixed(2)}</p>
                      </div>
                    </div>
                    </Link>

                    <Button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPresenteToDelete(presente);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Kit
                    </Button>
                    </div>
                    </div>
                    </div>
                    );
                    })}
                    </div>
                    )}

                    {/* Delete Confirmation Dialog */}
                    <AlertDialog open={!!presenteToDelete} onOpenChange={() => setPresenteToDelete(null)}>
                    <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Kit?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o kit "{presenteToDelete?.name}"? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Excluir Kit
                    </AlertDialogAction>
                    </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                    </div>
                    );
                    }