import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useProducts, usePresentes, useCustomers, useVouchers } from '@/hooks/useSupabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import CustomerForm from "@/components/customers/CustomerForm";
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
  Search, 
  Package, 
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  Clock,
  Check,
  X,
  Loader2,
  Ticket,
  Gift
} from 'lucide-react';
import { toast } from "sonner";
import moment from 'moment';

const paymentMethods = [
  { value: 'dinheiro', label: 'Dinheiro', icon: Banknote, color: 'bg-emerald-100 text-emerald-700' },
  { value: 'pix', label: 'PIX', icon: Smartphone, color: 'bg-purple-100 text-purple-700' },
  { value: 'cartao', label: 'Cartão', icon: CreditCard, color: 'bg-blue-100 text-blue-700' },
  { value: 'fiado', label: 'Fiado', icon: Clock, color: 'bg-amber-100 text-amber-700' },
];

export default function NewSaleView({ onComplete }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [showProducts, setShowProducts] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [installments, setInstallments] = useState(1);
  const [saleType, setSaleType] = useState('pronta_entrega');
  const [saving, setSaving] = useState(false);
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  const { data: products = [] } = useProducts();
  const { data: presentes = [] } = usePresentes();
  const { data: customers = [] } = useCustomers();
  const { data: vouchers = [] } = useVouchers();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('product');
    if (productId) {
      const product = products.find(p => p.id === productId);
      if (product) {
        addToCart(product);
      }
    }
  }, [products]);

  const availableProducts = products.filter(p => 
    (p.status === 'em_estoque' || p.status === 'apenas_catalogo') &&
    (p.stock_quantity > 0 || p.status === 'apenas_catalogo')
  );

  const allItems = [
    ...availableProducts.map(p => ({ ...p, type: 'product' })),
    ...presentes.map(k => ({ ...k, type: 'kit' }))
  ];

  const filteredProducts = allItems.filter(item => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    if (item.type === 'product') {
      return item.name?.toLowerCase().includes(searchLower) ||
             item.code?.toLowerCase().includes(searchLower) ||
             item.brand?.toLowerCase().includes(searchLower);
    } else {
      return item.name?.toLowerCase().includes(searchLower);
    }
  });

  const addToCart = (item) => {
    const itemId = item.id;
    const existing = cart.find(i => i.product_id === itemId);
    
    if (existing) {
      updateQuantity(itemId, existing.quantity + 1);
    } else {
      if (item.type === 'kit') {
        setCart([...cart, {
          product_id: item.id,
          product_name: item.name,
          quantity: 1,
          unit_price: item.final_price || 0,
          cost_price: item.total_cost || 0,
          subtotal: item.final_price || 0,
          stock: item.quantity || 0,
          status: 'kit',
          kit_data: item
        }]);
      } else {
        setCart([...cart, {
          product_id: item.id,
          product_name: item.name,
          quantity: 1,
          unit_price: item.selling_price || 0,
          cost_price: item.cost_price || 0,
          subtotal: item.selling_price || 0,
          stock: item.stock_quantity || 0,
          status: item.status,
        }]);
      }
    }
    toast.success(item.type === 'kit' ? 'Kit adicionado!' : 'Produto adicionado!');
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item => {
      if (item.product_id === productId) {
        const maxQty = item.status === 'apenas_catalogo' ? 999 : item.stock;
        const newQty = Math.min(quantity, maxQty);
        return {
          ...item,
          quantity: newQty,
          subtotal: newQty * item.unit_price,
        };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(i => i.product_id !== productId));
  };

  const subtotal = cart.reduce((sum, i) => sum + i.subtotal, 0);
  const voucherDiscount = appliedVoucher ? calculateVoucherDiscount(appliedVoucher, subtotal) : 0;
  const totalAmount = Math.max(0, subtotal - voucherDiscount);
  const totalCost = cart.reduce((sum, i) => sum + (i.cost_price * i.quantity), 0);
  const totalProfit = totalAmount - totalCost;

  function calculateVoucherDiscount(voucher, amount) {
    if (voucher.discount_type === 'percentage') {
      return (amount * voucher.discount_value) / 100;
    } else {
      return Math.min(voucher.discount_value, amount);
    }
  }

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error('Digite um código de voucher');
      return;
    }

    const voucher = vouchers.find(v => 
      v.code.toUpperCase() === voucherCode.toUpperCase()
    );

    if (!voucher) {
      toast.error('Voucher não encontrado');
      return;
    }

    if (voucher.status !== 'generated' && voucher.status !== 'sent') {
      toast.error('Voucher inválido ou já utilizado');
      return;
    }

    if (moment(voucher.expiry_date).isBefore(moment(), 'day')) {
      toast.error('Voucher expirado');
      return;
    }

    if (voucher.minimum_purchase > 0 && subtotal < voucher.minimum_purchase) {
      toast.error(`Valor mínimo de compra: R$ ${voucher.minimum_purchase.toFixed(2)}`);
      return;
    }

    if (voucher.non_cumulative && appliedVoucher) {
      toast.error('Apenas um voucher por compra');
      return;
    }

    setAppliedVoucher(voucher);
    toast.success('Voucher aplicado!');
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
  };

  const handleCreateCustomer = async (customerData) => {
    // Simplified for now - just show success message
    toast.success('Funcionalidade em desenvolvimento');
    setShowNewCustomerForm(false);
    setShowCustomerSelect(false);
  };

  const handleSale = async () => {
    if (cart.length === 0) {
      toast.error('Adicione produtos ao carrinho');
      return;
    }
    if (!paymentMethod) {
      toast.error('Selecione a forma de pagamento');
      return;
    }
    if (paymentMethod === 'fiado' && !selectedCustomer) {
      toast.error('Selecione um cliente para venda fiado');
      return;
    }

    setSaving(true);
    try {
      // Simplified sale creation - just show success
      toast.success('Venda registrada! (Funcionalidade em desenvolvimento)');
      if (onComplete) onComplete();
    } catch (error) {
      toast.error('Erro ao registrar venda');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Header with History Button */}
      <div className="bg-white border-b border-slate-100 p-4 sticky top-0 z-40 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Nova Venda</h1>
          <p className="text-sm text-slate-500">{cart.length} itens no carrinho</p>
        </div>
        {cart.length > 0 && (
          <Badge className="bg-purple-500 text-lg px-3 py-1">
            R$ {totalAmount.toFixed(2)}
          </Badge>
        )}
      </div>

      {/* Sale Type Toggle */}
      <div className="p-4 bg-slate-50">
        <div className="flex gap-2 bg-white rounded-xl p-1 border border-slate-200">
          <button
            onClick={() => setSaleType('pronta_entrega')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
              saleType === 'pronta_entrega' 
                ? 'bg-purple-500 text-white' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Pronta Entrega
          </button>
          <button
            onClick={() => setSaleType('encomenda')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
              saleType === 'encomenda' 
                ? 'bg-purple-500 text-white' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Encomenda
          </button>
        </div>
      </div>

      {/* Customer Selection */}
      <div className="p-4 bg-white border-b border-slate-100 space-y-3">
        {selectedCustomer ? (
          <div className="flex items-center gap-4 p-3 rounded-xl border-2 border-purple-200 bg-purple-50">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-800">{selectedCustomer.name}</p>
              <p className="text-xs text-slate-400">{selectedCustomer.phone || 'Sem telefone'}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSelectedCustomer(null)}
            >
              <X className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => {
                setShowNewCustomerForm(true);
                setShowCustomerSelect(true);
              }}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              style={{ height: '44px' }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Cliente
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewCustomerForm(false);
                setShowCustomerSelect(true);
              }}
              className="border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50"
              style={{ height: '44px' }}
            >
              <User className="w-5 h-5 mr-2" />
              Selecionar Cliente
            </Button>
          </div>
        )}
      </div>

      {/* Products / Cart Toggle */}
      <div className="flex border-b border-slate-100 bg-white">
        <button
          onClick={() => setShowProducts(true)}
          className={`flex-1 py-3.5 text-sm font-medium transition-all border-b-2 ${
            showProducts 
              ? 'border-purple-500 text-purple-600' 
              : 'border-transparent text-slate-500'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Produtos
        </button>
        <button
          onClick={() => setShowProducts(false)}
          className={`flex-1 py-3.5 text-sm font-medium transition-all border-b-2 ${
            !showProducts 
              ? 'border-purple-500 text-purple-600' 
              : 'border-transparent text-slate-500'
          }`}
        >
          <ShoppingCart className="w-4 h-4 inline mr-2" />
          Carrinho ({cart.length})
        </button>
      </div>

      {showProducts ? (
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2">
            {filteredProducts.map((item) => {
              const inCart = cart.find(i => i.product_id === item.id);
              const isKit = item.type === 'kit';
              return (
                <div 
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    inCart ? 'border-purple-300 bg-purple-50' : 'border-slate-100 bg-white'
                  }`}
                >
                  <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {isKit ? (
                          <Gift className="w-6 h-6 text-pink-400" />
                        ) : (
                          <Package className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800 truncate">{item.name}</p>
                      {isKit && (
                        <Badge className="bg-pink-100 text-pink-700 text-xs">Kit</Badge>
                      )}
                    </div>
                    {!isKit && <p className="text-xs text-slate-400">{item.brand}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-purple-600">
                        R$ {isKit ? (item.final_price || 0).toFixed(2) : (item.selling_price || 0).toFixed(2)}
                      </span>
                      {!isKit && item.status !== 'apenas_catalogo' && (
                        <span className="text-xs text-slate-400">({item.stock_quantity} disp.)</span>
                      )}
                      {isKit && (
                        <span className="text-xs text-slate-400">({item.quantity || 0} disp.)</span>
                      )}
                    </div>
                  </div>
                  
                  {inCart ? (
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => updateQuantity(item.id, inCart.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-bold">{inCart.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => updateQuantity(item.id, inCart.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => addToCart(item)}
                      className={isKit ? "bg-pink-500 hover:bg-pink-600" : "bg-purple-500 hover:bg-purple-600"}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Carrinho vazio</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {cart.map((item) => (
                  <div 
                    key={item.product_id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{item.product_name}</p>
                      <p className="text-sm text-purple-600">R$ {item.unit_price.toFixed(2)} cada</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="text-right w-20">
                      <p className="font-bold text-slate-800">R$ {item.subtotal.toFixed(2)}</p>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <Label className="text-slate-700 mb-2 block">Voucher de Desconto</Label>
                {!appliedVoucher ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Código do voucher"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleApplyVoucher}
                      variant="outline"
                      className="px-6"
                    >
                      Aplicar
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="font-medium text-purple-800 text-sm">{appliedVoucher.code}</p>
                        <p className="text-xs text-purple-600">
                          -{appliedVoucher.discount_type === 'percentage' 
                            ? `${appliedVoucher.discount_value}%` 
                            : `R$ ${appliedVoucher.discount_value.toFixed(2)}`
                          }
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleRemoveVoucher}
                      variant="ghost"
                      size="icon"
                      className="text-purple-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-700">R$ {subtotal.toFixed(2)}</span>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-600">Desconto (Voucher)</span>
                    <span className="text-purple-600">- R$ {voucherDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Lucro estimado</span>
                  <span className="text-emerald-600">R$ {totalProfit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200">
                  <span className="text-slate-800">Total</span>
                  <span className="text-purple-600">R$ {totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-slate-100 p-4 space-y-4 z-50">
          <div>
            <Label className="text-slate-700 mb-2 block">Forma de Pagamento</Label>
            <div className="grid grid-cols-4 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.value}
                  onClick={() => {
                    setPaymentMethod(method.value);
                    if (method.value === 'fiado') setInstallments(1);
                  }}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    paymentMethod === method.value 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <method.icon className={`w-5 h-5 ${
                    paymentMethod === method.value ? 'text-purple-600' : 'text-slate-400'
                  }`} />
                  <span className={`text-xs font-medium ${
                    paymentMethod === method.value ? 'text-purple-600' : 'text-slate-500'
                  }`}>
                    {method.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {paymentMethod && paymentMethod !== 'fiado' && (
            <div>
              <Label className="text-slate-700 mb-2 block">Parcelamento</Label>
              <Select 
                value={installments.toString()} 
                onValueChange={(v) => setInstallments(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">À vista</SelectItem>
                  <SelectItem value="2">2x de R$ {(totalAmount / 2).toFixed(2)}</SelectItem>
                  <SelectItem value="3">3x de R$ {(totalAmount / 3).toFixed(2)}</SelectItem>
                  <SelectItem value="4">4x de R$ {(totalAmount / 4).toFixed(2)}</SelectItem>
                  <SelectItem value="5">5x de R$ {(totalAmount / 5).toFixed(2)}</SelectItem>
                  <SelectItem value="6">6x de R$ {(totalAmount / 6).toFixed(2)}</SelectItem>
                  <SelectItem value="10">10x de R$ {(totalAmount / 10).toFixed(2)}</SelectItem>
                  <SelectItem value="12">12x de R$ {(totalAmount / 12).toFixed(2)}</SelectItem>
                </SelectContent>
              </Select>
              {installments > 1 && (
                <p className="text-xs text-slate-500 mt-2">
                  1ª parcela paga hoje, demais com vencimento mensal
                </p>
              )}
            </div>
          )}

          <Button 
            onClick={handleSale}
            disabled={saving || !paymentMethod}
            className="w-full h-14 text-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Finalizando...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Finalizar Venda • R$ {totalAmount.toFixed(2)}
              </>
            )}
          </Button>
        </div>
      )}

      <Sheet open={showCustomerSelect} onOpenChange={(open) => {
        setShowCustomerSelect(open);
        if (!open) setShowNewCustomerForm(false);
      }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{showNewCustomerForm ? 'Cadastrar Cliente' : 'Selecionar Cliente'}</SheetTitle>
          </SheetHeader>
          
          {showNewCustomerForm ? (
            <div className="mt-6">
              <CustomerForm
                onSubmit={handleCreateCustomer}
                onCancel={() => {
                  setShowNewCustomerForm(false);
                  setShowCustomerSelect(false);
                }}
              />
            </div>
          ) : (
            <div className="mt-6 flex flex-col h-full">
              <Button 
                variant="outline" 
                className="w-full justify-start h-12 mb-4"
                onClick={() => {
                  setSelectedCustomer(null);
                  setShowCustomerSelect(false);
                }}
              >
                <User className="w-4 h-4 mr-2" />
                Venda sem cliente
              </Button>
              
              <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                {customers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setShowCustomerSelect(false);
                    }}
                    className="w-full flex items-center gap-4 p-3 rounded-xl border border-slate-200 hover:border-purple-300 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <span className="font-bold text-purple-600">
                        {customer.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{customer.name}</p>
                      <p className="text-xs text-slate-400">{customer.phone || 'Sem telefone'}</p>
                    </div>
                    {customer.credit_balance > 0 && (
                      <Badge className="bg-amber-100 text-amber-700">
                        Fiado: R$ {customer.credit_balance.toFixed(2)}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}