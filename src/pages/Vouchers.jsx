import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/supabaseClient';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Ticket,
  Gift,
  Calendar,
  ChevronRight,
  Trophy,
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
import moment from 'moment';
import { useQueryClient } from '@tanstack/react-query';

const statusConfig = {
  draft: { label: 'Rascunho', color: 'bg-slate-100 text-slate-600' },
  generated: { label: 'Gerado', color: 'bg-blue-100 text-blue-700' },
  sent: { label: 'Enviado', color: 'bg-purple-100 text-purple-700' },
  used: { label: 'Usado', color: 'bg-emerald-100 text-emerald-700' },
  expired: { label: 'Expirado', color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelado', color: 'bg-slate-100 text-slate-500' },
};

const originConfig = {
  birthday: { label: 'Aniversário', icon: Gift, color: 'text-pink-500' },
  raffle: { label: 'Sorteio', icon: Trophy, color: 'text-orange-500' },
};

export default function Vouchers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [originFilter, setOriginFilter] = useState('');
  const [voucherToDelete, setVoucherToDelete] = useState(null);

  const { data: vouchers = [], isLoading } = useQuery({
    queryKey: ['vouchers'],
    queryFn: () => base44.entities.Voucher.list('-created_date', 200),
  });

  const handleDeleteVoucher = async () => {
    if (!voucherToDelete) return;

    try {
      await base44.entities.Voucher.delete(voucherToDelete.id);
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      setVoucherToDelete(null);
      toast.success('Voucher excluído com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir voucher');
    }
  };

  const filteredVouchers = vouchers.filter(v => {
    const matchSearch = !search || 
      v.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      v.code?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || v.status === statusFilter;
    const matchOrigin = !originFilter || v.origin === originFilter;
    
    return matchSearch && matchStatus && matchOrigin;
  });

  // Update expired vouchers
  const now = moment();
  filteredVouchers.forEach(v => {
    if (v.status !== 'used' && v.status !== 'cancelled' && v.status !== 'expired') {
      if (moment(v.expiry_date).isBefore(now, 'day')) {
        base44.entities.Voucher.update(v.id, { status: 'expired' });
      }
    }
  });

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vouchers</h1>
          <p className="text-slate-500 text-sm">{filteredVouchers.length} vouchers</p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Buscar por cliente ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Todos</SelectItem>
              <SelectItem value="generated">Gerado</SelectItem>
              <SelectItem value="sent">Enviado</SelectItem>
              <SelectItem value="used">Usado</SelectItem>
              <SelectItem value="expired">Expirado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={originFilter} onValueChange={setOriginFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Todos</SelectItem>
              <SelectItem value="birthday">Aniversário</SelectItem>
              <SelectItem value="raffle">Sorteio</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Vouchers List */}
      <div className="space-y-2">
        {filteredVouchers.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Ticket className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum voucher encontrado</p>
          </div>
        ) : (
          filteredVouchers.map((voucher) => {
            const OriginIcon = originConfig[voucher.origin]?.icon || Gift;
            const isExpired = moment(voucher.expiry_date).isBefore(now, 'day');
            const status = isExpired && voucher.status !== 'used' && voucher.status !== 'cancelled' ? 'expired' : voucher.status;
            
            return (
              <div
                key={voucher.id}
                className="bg-white rounded-xl border border-slate-100 hover:shadow-sm transition-all"
              >
                <Link 
                  to={createPageUrl('VoucherView') + `?id=${voucher.id}`}
                  className="flex items-center gap-3 p-4"
                >
                  <div className={`w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br ${
                    voucher.origin === 'birthday' ? 'from-pink-100 to-pink-200' : 'from-orange-100 to-orange-200'
                  } flex items-center justify-center`}>
                    <OriginIcon className={`w-6 h-6 ${originConfig[voucher.origin]?.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-medium text-slate-800 truncate">{voucher.customer_name}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {voucher.code}
                      </code>
                      <Badge className={statusConfig[status]?.color}>
                        {statusConfig[status]?.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span className="truncate">Válido até {moment(voucher.expiry_date).format('DD/MM/YYYY')}</span>
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-purple-600 whitespace-nowrap">
                      {voucher.discount_type === 'percentage' 
                        ? `${voucher.discount_value}%` 
                        : `R$ ${voucher.discount_value.toFixed(2)}`
                      }
                    </p>
                    <p className="text-xs text-slate-400">desconto</p>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
                </Link>
                
                <div className="border-t border-slate-100 px-4 py-2">
                  <Button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setVoucherToDelete(voucher);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Voucher
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!voucherToDelete} onOpenChange={() => setVoucherToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Voucher?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o voucher "{voucherToDelete?.code}" de {voucherToDelete?.customer_name}? Esta ação não pode ser desfeita.
              {voucherToDelete?.status === 'used' && (
                <span className="block mt-2 text-amber-600 font-medium">
                  ⚠️ Este voucher já foi utilizado em uma venda.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVoucher}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir Voucher
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}