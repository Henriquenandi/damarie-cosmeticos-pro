import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/supabaseClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart,
  Plus,
  Minus,
  Search,
  Package,
  Send,
  X,
  Gift
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const brandColors = {
  'Natura': 'bg-orange-100 text-orange-700',
  'O Boticário': 'bg-green-100 text-green-700',
  'Avon': 'bg-pink-100 text-pink-700',
  'Eudora': 'bg-purple-100 text-purple-700',
  'Mary Kay': 'bg-rose-100 text-rose-700',
  'Jequiti': 'bg-blue-100 text-blue-700',
  'Hinode': 'bg-amber-100 text-amber-700',
};

export default function Catalogo() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const { data: products = [] } = useQuery({
    queryKey: ['catalog-products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: presentes = [] } = useQuery({
    queryKey: ['catalog-kits'],
    queryFn: () => base44.entities.Presente.filter({ status: 'active' }),
  });

  // Combine products and kits
  const availableProducts = products.filter(p => 
    (p.status === 'em_estoque' || p.status === 'apenas_catalogo') &&
    (p.stock_quantity > 0 || p.status === 'apenas_catalogo')
  );

  const allItems = [
    ...availableProducts.map(p => ({ ...p, type: 'product' })),
    ...presentes.map(k => ({ ...k, type: 'kit' }))
  ];

  const filteredItems = allItems.filter(item => {
    const matchSearch = !search || 
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      (item.type === 'product' && item.brand?.toLowerCase().includes(search.toLowerCase()));
    
    const matchCategory = !categoryFilter || 
      item.type === 'kit' ||
      (item.type === 'product' && item.category === categoryFilter);
    
    const matchBrand = !brandFilter || 
      item.type === 'kit' ||
      (item.type === 'product' && item.brand === brandFilter);
    
    return matchSearch && matchCategory && matchBrand;
  });

  const addToCart = (item) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      setCart(cart.map(i => 
        i.id === item.id 
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setCart([...cart, {
        id: item.id,
        name: item.name,
        price: item.type === 'kit' ? (item.final_price || 0) : (item.selling_price || 0),
        quantity: 1,
        type: item.type
      }]);
    }
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      setCart(cart.filter(i => i.id !== id));
    } else {
      setCart(cart.map(i => 
        i.id === id ? { ...i, quantity } : i
      ));
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const generateWhatsAppMessage = () => {
    if (!customerData.name || !customerData.phone) {
      alert('Preencha nome e telefone');
      return;
    }

    let message = `Olá! Gostaria de fazer um pedido:\n\n`;
    
    cart.forEach(item => {
      const emoji = item.type === 'kit' ? '🎁' : '🛍️';
      message += `${emoji} ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n💰 Total: R$ ${cartTotal.toFixed(2)}\n\n`;
    message += `📝 Nome: ${customerData.name}\n`;
    message += `📱 Telefone: ${customerData.phone}\n`;
    if (customerData.address) {
      message += `📍 Endereço: ${customerData.address}\n`;
    }

    // Replace with actual WhatsApp number
    const whatsappNumber = '5548998506916';
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

  const categories = [...new Set(products.map(p => p.category))];
  const brands = [...new Set(products.map(p => p.brand))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695c5f50ab63f5b9b84216d1/4f31b7e94_8360374a-28eb-4f8b-8a1c-d3c506ca44bd.jpg" 
                alt="Damariê" 
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <h1 className="text-xl font-bold text-slate-800">Damariê Presentes</h1>
                <p className="text-sm text-slate-500">Catálogo Online</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCart(true)}
              className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Todas</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Marca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Todas</SelectItem>
                {brands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const inCart = cart.find(i => i.id === item.id);
            const isKit = item.type === 'kit';
            const price = isKit ? (item.final_price || 0) : (item.selling_price || 0);

            return (
              <div 
                key={item.id}
                className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="aspect-square bg-gradient-to-br from-slate-50 to-slate-100 relative">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {isKit ? (
                        <Gift className="w-16 h-16 text-pink-300" />
                      ) : (
                        <Package className="w-16 h-16 text-slate-300" />
                      )}
                    </div>
                  )}
                  {isKit && (
                    <Badge className="absolute top-2 right-2 bg-pink-500 text-white">
                      Kit
                    </Badge>
                  )}
                </div>

                <div className="p-3 space-y-2">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm line-clamp-2">
                      {item.name}
                    </h3>
                    {!isKit && item.brand && (
                      <Badge className={`${brandColors[item.brand] || 'bg-slate-100 text-slate-600'} text-xs mt-1`}>
                        {item.brand}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-pink-600">
                      R$ {price.toFixed(2)}
                    </span>

                    {inCart ? (
                      <div className="flex items-center gap-1">
                        <Button 
                          size="icon"
                          variant="outline"
                          className="w-7 h-7"
                          onClick={() => updateQuantity(item.id, inCart.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-6 text-center font-bold text-sm">
                          {inCart.quantity}
                        </span>
                        <Button 
                          size="icon"
                          variant="outline"
                          className="w-7 h-7"
                          onClick={() => updateQuantity(item.id, inCart.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        size="sm"
                        onClick={() => addToCart(item)}
                        className="bg-pink-500 hover:bg-pink-600"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum produto encontrado</p>
          </div>
        )}
      </div>

      {/* Cart Sheet */}
      <Sheet open={showCart} onOpenChange={setShowCart}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Seu Pedido</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Carrinho vazio</p>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 text-sm">
                          {item.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          R$ {item.price.toFixed(2)} cada
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          size="icon"
                          variant="outline"
                          className="w-7 h-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-6 text-center font-bold text-sm">
                          {item.quantity}
                        </span>
                        <Button 
                          size="icon"
                          variant="outline"
                          className="w-7 h-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => updateQuantity(item.id, 0)}
                        className="text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Customer Form */}
                <div className="space-y-4 border-t border-slate-200 pt-4">
                  <h3 className="font-semibold text-slate-800">Seus Dados</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <Label>Nome *</Label>
                      <Input
                        placeholder="Seu nome completo"
                        value={customerData.name}
                        onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label>Telefone (WhatsApp) *</Label>
                      <Input
                        placeholder="(11) 99999-9999"
                        value={customerData.phone}
                        onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label>Endereço (Opcional)</Label>
                      <Textarea
                        placeholder="Rua, número, bairro..."
                        value={customerData.address}
                        onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* PIX Information */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">₿</span>
                    </div>
                    <h3 className="font-semibold text-slate-800">Pagamento via PIX</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">Você pode pagar agora com PIX:</p>
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <p className="text-xs text-slate-500 mb-1">Chave PIX:</p>
                      <p className="font-mono font-bold text-green-700 text-sm break-all">
                        48998506916
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total and Submit */}
                <div className="border-t border-slate-200 pt-4 space-y-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span className="text-pink-600">R$ {cartTotal.toFixed(2)}</span>
                  </div>

                  <Button
                    onClick={generateWhatsAppMessage}
                    className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Enviar Pedido via WhatsApp
                  </Button>

                  <p className="text-xs text-center text-slate-500">
                    Seu pedido será enviado pelo WhatsApp. Aguarde nossa confirmação!
                  </p>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}