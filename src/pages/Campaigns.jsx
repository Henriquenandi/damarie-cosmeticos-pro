import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/supabaseClient';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Trophy,
  Plus,
  Calendar,
  Users,
  Ticket,
  Loader2,
  Sparkles,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import moment from 'moment';

export default function Campaigns() {
  const queryClient = useQueryClient();
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [showDrawDialog, setShowDrawDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [drawResult, setDrawResult] = useState(null);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    eligibility_type: 'all',
    eligibility_date_start: '',
    eligibility_date_end: '',
    winner_count: 1,
    prize_discount_type: 'percentage',
    prize_discount_value: 10,
    prize_validity_days: 15,
    prize_minimum_purchase: 0,
    prize_non_cumulative: true
  });

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.Campaign.list('-created_date'),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list(),
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.list('-created_date', 500),
  });

  const handleCreateCampaign = async () => {
    if (!campaignForm.name) {
      toast.error('Digite um nome para a campanha');
      return;
    }

    try {
      await base44.entities.Campaign.create({
        ...campaignForm,
        start_date: new Date().toISOString().split('T')[0],
        status: 'active'
      });

      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setShowNewCampaign(false);
      setCampaignForm({
        name: '',
        eligibility_type: 'all',
        eligibility_date_start: '',
        eligibility_date_end: '',
        winner_count: 1,
        prize_discount_type: 'percentage',
        prize_discount_value: 10,
        prize_validity_days: 15,
        prize_minimum_purchase: 0,
        prize_non_cumulative: true
      });
      toast.success('Campanha criada!');
    } catch (error) {
      toast.error('Erro ao criar campanha');
    }
  };

  const getEligibleCustomers = (campaign) => {
    return customers.filter(customer => {
      // accepts_promotions é true por padrão (apenas exclui se explicitamente false)
      if (customer.accepts_promotions === false) return false;
      
      if (campaign.eligibility_type === 'all') {
        return true;
      } else if (campaign.eligibility_type === 'with_purchase') {
        return sales.some(s => s.customer_id === customer.id);
      } else if (campaign.eligibility_type === 'date_range') {
        const customerSales = sales.filter(s => 
          s.customer_id === customer.id &&
          moment(s.sale_date || s.created_date).isBetween(
            moment(campaign.eligibility_date_start), 
            moment(campaign.eligibility_date_end), 
            null, 
            '[]'
          )
        );
        return customerSales.length > 0;
      }
      return false;
    });
  };

  const handleDeleteCampaign = async () => {
    if (!campaignToDelete) return;

    try {
      await base44.entities.Campaign.delete(campaignToDelete.id);
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setCampaignToDelete(null);
      toast.success('Campanha excluída com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir campanha');
    }
  };

  const handleDraw = async () => {
    if (!selectedCampaign) return;

    setDrawing(true);
    try {
      const eligible = getEligibleCustomers(selectedCampaign);
      
      if (eligible.length === 0) {
        toast.error('Nenhum cliente elegível para este sorteio');
        setDrawing(false);
        return;
      }

      if (eligible.length < selectedCampaign.winner_count) {
        toast.error(`Apenas ${eligible.length} clientes elegíveis, mas ${selectedCampaign.winner_count} vencedores configurados`);
        setDrawing(false);
        return;
      }

      // Randomly select winners
      const shuffled = [...eligible].sort(() => 0.5 - Math.random());
      const winners = shuffled.slice(0, selectedCampaign.winner_count);

      // Generate vouchers for winners
      const voucherPromises = winners.map(async (winner) => {
        const code = `SORTEIO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const expiryDate = moment().add(selectedCampaign.prize_validity_days, 'days').format('YYYY-MM-DD');

        const voucher = await base44.entities.Voucher.create({
          code,
          customer_id: winner.id,
          customer_name: winner.name,
          customer_phone: winner.phone,
          origin: 'raffle',
          campaign_id: selectedCampaign.id,
          discount_type: selectedCampaign.prize_discount_type,
          discount_value: selectedCampaign.prize_discount_value,
          expiry_date: expiryDate,
          minimum_purchase: selectedCampaign.prize_minimum_purchase || 0,
          non_cumulative: selectedCampaign.prize_non_cumulative,
          status: 'generated'
        });

        return {
          customer_id: winner.id,
          customer_name: winner.name,
          voucher_id: voucher.id,
          voucher_code: code
        };
      });

      const winnerData = await Promise.all(voucherPromises);

      // Save draw result
      await base44.entities.DrawResult.create({
        campaign_id: selectedCampaign.id,
        campaign_name: selectedCampaign.name,
        draw_date: new Date().toISOString(),
        winners: winnerData,
        eligible_count: eligible.length
      });

      // Mark campaign as completed
      await base44.entities.Campaign.update(selectedCampaign.id, {
        status: 'completed',
        end_date: new Date().toISOString().split('T')[0]
      });

      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      
      setDrawResult({
        campaign: selectedCampaign,
        winners: winnerData,
        eligible_count: eligible.length
      });
      
      toast.success(`Sorteio realizado! ${winnerData.length} vencedor(es)`);
    } catch (error) {
      toast.error('Erro ao realizar sorteio');
    } finally {
      setDrawing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Campanhas de Sorteio</h1>
          <p className="text-slate-500 text-sm">{campaigns.length} campanhas</p>
        </div>
        <Button 
          onClick={() => setShowNewCampaign(true)}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nova Campanha
        </Button>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
            <Trophy className="w-12 h-12 mx-auto mb-2 text-slate-300 opacity-50" />
            <p className="text-slate-500">Nenhuma campanha criada</p>
            <Button 
              onClick={() => setShowNewCampaign(true)}
              variant="outline"
              className="mt-4"
            >
              Criar Primeira Campanha
            </Button>
          </div>
        ) : (
          campaigns.map((campaign) => {
            const eligible = getEligibleCustomers(campaign);
            
            return (
              <div 
                key={campaign.id}
                className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{campaign.name}</h3>
                        <p className="text-sm text-slate-500">
                          {moment(campaign.created_date).format('DD/MM/YYYY')}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500">Vencedores</p>
                        <p className="text-lg font-bold text-slate-800">{campaign.winner_count}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500">Elegíveis</p>
                        <p className="text-lg font-bold text-slate-800">{eligible.length}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500">Prêmio</p>
                        <p className="text-lg font-bold text-orange-600">
                          {campaign.prize_discount_type === 'percentage' 
                            ? `${campaign.prize_discount_value}%` 
                            : `R$ ${campaign.prize_discount_value.toFixed(2)}`
                          }
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500">Validade</p>
                        <p className="text-lg font-bold text-slate-800">{campaign.prize_validity_days}d</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={campaign.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                        {campaign.status === 'active' ? 'Ativa' : 'Finalizada'}
                      </Badge>
                      <Badge variant="outline">
                        {campaign.eligibility_type === 'all' ? 'Todos os clientes' :
                         campaign.eligibility_type === 'with_purchase' ? 'Com compra' :
                         'Período específico'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {campaign.status === 'active' && (
                      <Button 
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setDrawResult(null);
                          setShowDrawDialog(true);
                        }}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Sortear Agora
                      </Button>
                    )}
                    <Button 
                      onClick={() => setCampaignToDelete(campaign)}
                      variant="outline"
                      size="icon"
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Campaign Dialog */}
      <Dialog open={showNewCampaign} onOpenChange={setShowNewCampaign}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-500" />
              Nova Campanha de Sorteio
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Campanha</Label>
              <Input
                value={campaignForm.name}
                onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                placeholder="Ex: Sorteio do Mês"
              />
            </div>

            <div className="space-y-2">
              <Label>Elegibilidade</Label>
              <Select 
                value={campaignForm.eligibility_type} 
                onValueChange={(value) => setCampaignForm({...campaignForm, eligibility_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os clientes</SelectItem>
                  <SelectItem value="with_purchase">Clientes com pelo menos 1 compra</SelectItem>
                  <SelectItem value="date_range">Clientes com compra em período específico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {campaignForm.eligibility_type === 'date_range' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Início</Label>
                  <Input
                    type="date"
                    value={campaignForm.eligibility_date_start}
                    onChange={(e) => setCampaignForm({...campaignForm, eligibility_date_start: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Input
                    type="date"
                    value={campaignForm.eligibility_date_end}
                    onChange={(e) => setCampaignForm({...campaignForm, eligibility_date_end: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Quantidade de Vencedores</Label>
              <Input
                type="number"
                value={campaignForm.winner_count}
                onChange={(e) => setCampaignForm({...campaignForm, winner_count: parseInt(e.target.value)})}
                min="1"
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-slate-700 mb-4">Prêmio (Voucher)</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Desconto</Label>
                  <Select 
                    value={campaignForm.prize_discount_type} 
                    onValueChange={(value) => setCampaignForm({...campaignForm, prize_discount_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                      <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Valor do Desconto</Label>
                  <Input
                    type="number"
                    value={campaignForm.prize_discount_value}
                    onChange={(e) => setCampaignForm({...campaignForm, prize_discount_value: parseFloat(e.target.value)})}
                    min="0"
                    step={campaignForm.prize_discount_type === 'percentage' ? '1' : '0.01'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Validade (dias)</Label>
                  <Input
                    type="number"
                    value={campaignForm.prize_validity_days}
                    onChange={(e) => setCampaignForm({...campaignForm, prize_validity_days: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Valor Mínimo (opcional)</Label>
                  <Input
                    type="number"
                    value={campaignForm.prize_minimum_purchase}
                    onChange={(e) => setCampaignForm({...campaignForm, prize_minimum_purchase: parseFloat(e.target.value)})}
                    min="0"
                    step="0.01"
                    placeholder="R$ 0.00"
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={handleCreateCampaign}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Criar Campanha
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Draw Dialog */}
      <Dialog open={showDrawDialog} onOpenChange={setShowDrawDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              {drawResult ? 'Resultado do Sorteio' : 'Realizar Sorteio'}
            </DialogTitle>
            <DialogDescription>
              {selectedCampaign?.name}
            </DialogDescription>
          </DialogHeader>

          {!drawResult ? (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Clientes elegíveis:</span>
                  <span className="font-bold text-slate-800">
                    {selectedCampaign ? getEligibleCustomers(selectedCampaign).length : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Vencedores:</span>
                  <span className="font-bold text-slate-800">{selectedCampaign?.winner_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Prêmio:</span>
                  <span className="font-bold text-orange-600">
                    {selectedCampaign?.prize_discount_type === 'percentage' 
                      ? `${selectedCampaign?.prize_discount_value}%` 
                      : `R$ ${selectedCampaign?.prize_discount_value.toFixed(2)}`
                    }
                  </span>
                </div>
              </div>

              <Button 
                onClick={handleDraw}
                disabled={drawing}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                {drawing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sorteando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Sortear Agora
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 text-center border-2 border-orange-200">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-orange-500" />
                <p className="text-lg font-bold text-slate-800 mb-2">Sorteio Realizado!</p>
                <p className="text-sm text-slate-600">
                  {drawResult.winners.length} vencedor(es) de {drawResult.eligible_count} elegíveis
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-slate-700">Vencedores:</h4>
                {drawResult.winners.map((winner, index) => (
                  <Link 
                    key={index}
                    to={createPageUrl('VoucherView') + `?id=${winner.voucher_id}`}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-orange-200 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{winner.customer_name}</p>
                      <code className="text-xs text-slate-500">{winner.voucher_code}</code>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </Link>
                ))}
              </div>

              <Button
                onClick={() => setShowDrawDialog(false)}
                variant="outline"
                className="w-full"
              >
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!campaignToDelete} onOpenChange={() => setCampaignToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Campanha?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{campaignToDelete?.name}"? Esta ação não pode ser desfeita.
              {campaignToDelete?.status === 'completed' && (
                <span className="block mt-2 text-amber-600 font-medium">
                  ⚠️ Esta campanha já foi sorteada. Os vouchers gerados não serão excluídos.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCampaign}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir Campanha
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}