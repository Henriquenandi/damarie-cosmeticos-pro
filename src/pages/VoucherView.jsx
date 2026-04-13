import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Gift,
  Trophy,
  Calendar,
  Tag,
  Share2,
  Check,
  Copy,
  ExternalLink,
  Download,
  Loader2
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import moment from 'moment';
import html2canvas from 'html2canvas';

const statusConfig = {
  draft: { label: 'Rascunho', color: 'bg-slate-100 text-slate-600' },
  generated: { label: 'Gerado', color: 'bg-blue-100 text-blue-700' },
  sent: { label: 'Enviado', color: 'bg-purple-100 text-purple-700' },
  used: { label: 'Usado', color: 'bg-emerald-100 text-emerald-700' },
  expired: { label: 'Expirado', color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelado', color: 'bg-slate-100 text-slate-500' },
};

export default function VoucherView() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const voucherRef = useRef(null);

  const params = new URLSearchParams(window.location.search);
  const voucherId = params.get('id');

  const { data: voucher, isLoading } = useQuery({
    queryKey: ['voucher', voucherId],
    queryFn: async () => {
      const vouchers = await base44.entities.Voucher.filter({ id: voucherId });
      return vouchers[0];
    },
    enabled: !!voucherId,
  });

  const handleShare = async () => {
    if (!voucher) return;

    // Message for the store owner to forward to customer
    const messageForOwner = `📋 *Voucher para enviar ao cliente*\n\n` +
      `👤 *Cliente:* ${voucher.customer_name}\n` +
      `${voucher.customer_phone ? `📱 *Telefone:* ${voucher.customer_phone}\n` : ''}\n` +
      `━━━━━━━━━━━━━━━━━\n\n` +
      `🎉 *Parabéns, ${voucher.customer_name}!*\n\n` +
      `Você ganhou um presente especial:\n` +
      `💝 ${voucher.discount_type === 'percentage' 
        ? `${voucher.discount_value}% de desconto` 
        : `R$ ${voucher.discount_value.toFixed(2)} de desconto`
      }\n\n` +
      `🎫 *Código:* ${voucher.code}\n` +
      `📅 *Válido até:* ${moment(voucher.expiry_date).format('DD/MM/YYYY')}\n` +
      (voucher.minimum_purchase > 0 ? `💰 *Mínimo:* R$ ${voucher.minimum_purchase.toFixed(2)}\n` : '') +
      `\n` +
      `Use seu código na próxima compra! 💜\n\n` +
      `_${voucher.non_cumulative ? 'Não cumulativo com outras promoções.' : ''}_`;

    // Send to store owner (Mariele)
    const ownerPhone = '5548998506916';
    const whatsappUrl = `https://wa.me/${ownerPhone}?text=${encodeURIComponent(messageForOwner)}`;
    window.open(whatsappUrl, '_blank');

    // Mark as sent
    await base44.entities.Voucher.update(voucherId, { 
      status: 'sent',
      sent_date: new Date().toISOString()
    });
    toast.success('Mensagem preparada! Envie ao cliente 💜');
  };

  const handleCopyCode = () => {
    if (!voucher) return;
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    toast.success('Código copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyMessage = () => {
    if (!voucher) return;

    const message = `🎉 *Parabéns, ${voucher.customer_name}!*\n\n` +
      `Você ganhou um presente especial:\n` +
      `💝 ${voucher.discount_type === 'percentage' 
        ? `${voucher.discount_value}% de desconto` 
        : `R$ ${voucher.discount_value.toFixed(2)} de desconto`
      }\n\n` +
      `🎫 *Código:* ${voucher.code}\n` +
      `📅 *Válido até:* ${moment(voucher.expiry_date).format('DD/MM/YYYY')}\n` +
      (voucher.minimum_purchase > 0 ? `💰 *Mínimo:* R$ ${voucher.minimum_purchase.toFixed(2)}\n` : '') +
      `\n` +
      `Use seu código na próxima compra! 💜\n\n` +
      `_${voucher.non_cumulative ? 'Não cumulativo com outras promoções.' : ''}_`;

    navigator.clipboard.writeText(message);
    toast.success('Mensagem copiada!');
  };

  const handleDownloadImage = async () => {
    if (!voucherRef.current || downloading) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(voucherRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `voucher-${voucher.code}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Imagem baixada!');
    } catch (error) {
      toast.error('Erro ao gerar imagem');
    } finally {
      setDownloading(false);
    }
  };

  const handleShareWhatsApp = async () => {
    if (!voucherRef.current || downloading) return;
    
    setDownloading(true);
    
    try {
      const canvas = await html2canvas(voucherRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
      });
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      
      if (!blob) {
        toast.error('Erro ao gerar imagem');
        setDownloading(false);
        return;
      }

      const file = new File([blob], `voucher-${voucher.code}.png`, { 
        type: 'image/png',
        lastModified: Date.now()
      });
      
      // Compartilhamento nativo
      await navigator.share({
        files: [file],
        title: 'Voucher de Desconto',
        text: 'Voucher de desconto'
      });
      
      await base44.entities.Voucher.update(voucherId, { 
        status: 'sent',
        sent_date: new Date().toISOString()
      });
      
      toast.success('Voucher compartilhado!');
      setDownloading(false);
    } catch (error) {
      if (error.name === 'AbortError') {
        setDownloading(false);
        return;
      }
      console.error('Erro:', error);
      toast.error('Erro ao compartilhar: ' + error.message);
      setDownloading(false);
    }
  };

  if (isLoading || !voucher) {
    return (
      <div className="p-4 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const now = moment();
  const isExpired = moment(voucher.expiry_date).isBefore(now, 'day');
  const status = isExpired && voucher.status !== 'used' && voucher.status !== 'cancelled' ? 'expired' : voucher.status;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 lg:p-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(createPageUrl('Vouchers'))}
          className="bg-white/80 backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* Voucher Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div ref={voucherRef} className="bg-white rounded-3xl overflow-hidden">
            {/* Header Gradient */}
            <div className={`h-32 bg-gradient-to-br ${
              voucher.origin === 'birthday' 
                ? 'from-pink-400 via-pink-500 to-purple-500' 
                : 'from-orange-400 via-orange-500 to-red-500'
            } relative`}>
              <div className="absolute inset-0 flex items-center justify-center">
                {voucher.origin === 'birthday' ? (
                  <Gift className="w-16 h-16 text-white opacity-90" />
                ) : (
                  <Trophy className="w-16 h-16 text-white opacity-90" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 lg:p-8 space-y-6">
              {/* Title */}
              <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                  🎉 Parabéns!
                </h1>
                <p className="text-xl text-slate-600">{voucher.customer_name}</p>
              </div>

              {/* Discount */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 text-center">
                <p className="text-slate-600 mb-2">Você ganhou</p>
                <p className="text-5xl font-bold text-purple-600">
                  {voucher.discount_type === 'percentage' 
                    ? `${voucher.discount_value}%` 
                    : `R$ ${voucher.discount_value.toFixed(2)}`
                  }
                </p>
                <p className="text-slate-600 mt-2">de desconto</p>
              </div>

              {/* Code */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <p className="text-center text-slate-500 text-sm mb-2">Código do Voucher</p>
                <div className="flex items-center justify-center gap-3">
                  <code className="text-2xl font-mono font-bold text-slate-800 bg-white px-4 py-2 rounded-lg border-2 border-dashed border-slate-300">
                    {voucher.code}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyCode}
                    className="h-12 w-12"
                  >
                    {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                  </Button>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>Válido até</span>
                  </div>
                  <span className="font-medium text-slate-800">
                    {moment(voucher.expiry_date).format('DD/MM/YYYY')}
                  </span>
                </div>

                {voucher.minimum_purchase > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Tag className="w-4 h-4" />
                      <span>Valor mínimo</span>
                    </div>
                    <span className="font-medium text-slate-800">
                      R$ {voucher.minimum_purchase.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 pt-2">
                  <Badge className={statusConfig[status]?.color}>
                    {statusConfig[status]?.label}
                  </Badge>
                  {voucher.origin === 'birthday' && (
                    <Badge className="bg-pink-100 text-pink-700">
                      Aniversário
                    </Badge>
                  )}
                  {voucher.origin === 'raffle' && (
                    <Badge className="bg-orange-100 text-orange-700">
                      Sorteio
                    </Badge>
                  )}
                </div>
              </div>

              {/* Rules */}
              {voucher.non_cumulative && (
                <div className="text-center text-xs text-slate-400 border-t border-slate-100 pt-4">
                  * Não cumulativo com outras promoções
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 lg:p-8 pt-0">
            {status !== 'used' && status !== 'cancelled' && (
              <div className="space-y-3 pt-4">
                <Button 
                  onClick={handleDownloadImage}
                  disabled={downloading}
                  className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Baixar Imagem
                    </>
                  )}
                </Button>

                <Button 
                  variant="outline"
                  onClick={handleCopyCode}
                  className="w-full h-12"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Código
                </Button>
              </div>
            )}

            {status === 'used' && voucher.used_date && (
              <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                <p className="text-emerald-700 font-medium">
                  ✓ Voucher usado em {moment(voucher.used_date).format('DD/MM/YYYY HH:mm')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}