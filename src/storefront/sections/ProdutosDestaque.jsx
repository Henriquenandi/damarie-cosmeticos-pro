import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Package, Star } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';

const WHATSAPP = '5548998506916';

const mockProducts = [
  { id: 1, name: 'Kit Hidratação Luxo', brand: 'Damarie', category: 'Kit', selling_price: 89.90, image_url: null, status: 'em_estoque' },
  { id: 2, name: 'Perfume Floral Delicado', brand: 'Eudora', category: 'Perfume', selling_price: 129.00, image_url: null, status: 'em_estoque' },
  { id: 3, name: 'Creme Corporal Premium', brand: 'Natura', category: 'Corpo', selling_price: 59.90, image_url: null, status: 'em_estoque' },
  { id: 4, name: 'Presente Personalizado', brand: 'Damarie', category: 'Kit', selling_price: 149.00, image_url: null, status: 'em_estoque' },
  { id: 5, name: 'Sabonete Artesanal', brand: 'Damarie', category: 'Outro', selling_price: 29.90, image_url: null, status: 'em_estoque' },
  { id: 6, name: 'Kit Maquiagem Básico', brand: 'O Boticário', category: 'Maquiagem', selling_price: 199.00, image_url: null, status: 'em_estoque' },
  { id: 7, name: 'Óleo Corporal Essencial', brand: 'Natura', category: 'Corpo', selling_price: 74.90, image_url: null, status: 'em_estoque' },
  { id: 8, name: 'Kit Presente Especial', brand: 'Damarie', category: 'Kit', selling_price: 249.00, image_url: null, status: 'em_estoque' },
];

const emojiGradients = {
  Kit: { emoji: '🎁', from: '#FDE8D8', to: '#FBD5B8' },
  Perfume: { emoji: '🌸', from: '#FCE7F3', to: '#FBCFE8' },
  Corpo: { emoji: '🧴', from: '#F0FDF4', to: '#DCFCE7' },
  Maquiagem: { emoji: '💄', from: '#FFF0F5', to: '#FDE8EF' },
  Rosto: { emoji: '✨', from: '#FFF7ED', to: '#FEF3C7' },
  Outro: { emoji: '🎀', from: '#F5F3FF', to: '#EDE9FE' },
  default: { emoji: '💎', from: '#FAF3E8', to: '#F0E6D3' },
};

function ProductCard({ product }) {
  const gradient = emojiGradients[product.category] || emojiGradients.default;
  const whatsappMsg = encodeURIComponent(
    `Olá! Tenho interesse no produto *${product.name}* (R$ ${(product.selling_price || 0).toFixed(2)}). Poderia me ajudar?`
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP}?text=${whatsappMsg}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -8 }}
      className="group flex flex-col rounded-3xl overflow-hidden border border-orange-50 bg-white"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
    >
      {/* Image / Placeholder */}
      <div
        className="relative h-52 flex items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(145deg, ${gradient.from}, ${gradient.to})`,
        }}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="text-6xl"
          >
            {gradient.emoji}
          </motion.div>
        )}

        {/* Badge */}
        <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold"
          style={{ background: 'rgba(255,255,255,0.9)', color: '#E27339' }}
        >
          {product.category}
        </div>

        {/* Stars */}
        <div className="absolute top-3 right-3 flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: '#9E7B6A' }}>
            {product.brand}
          </p>
          <h3
            className="font-semibold text-base leading-snug line-clamp-2"
            style={{ color: '#3D2B1F' }}
          >
            {product.name}
          </h3>
        </div>

        <div className="mt-auto">
          <p className="text-2xl font-bold" style={{ color: '#E27339' }}>
            R$ {(product.selling_price || 0).toFixed(2).replace('.', ',')}
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#B09080' }}>
            ou 3x sem juros
          </p>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold text-white transition-all hover:shadow-md hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #E27339, #c85e2a)' }}
        >
          <ShoppingBag className="w-4 h-4" />
          Pedir no WhatsApp
        </a>
      </div>
    </motion.div>
  );
}

export default function ProdutosDestaque() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('product')
          .select('id, name, brand, category, selling_price, image_url, status')
          .eq('status', 'em_estoque')
          .order('name', { ascending: true })
          .limit(8);

        if (!error && data && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(mockProducts);
        }
      } catch {
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <section
      id="produtos"
      className="py-20 md:py-28"
      style={{ background: 'linear-gradient(180deg, #FFF8F2 0%, #FAF3E8 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: '#E27339' }}
          >
            Selecionados com carinho
          </p>
          <h2
            className="font-serif text-4xl md:text-5xl mb-4 tracking-tight"
            style={{ color: '#3D2B1F' }}
          >
            Produtos em Destaque
          </h2>
          <p className="text-base md:text-lg max-w-lg mx-auto" style={{ color: '#9E7B6A' }}>
            Cada produto escolhido com critério e amor para que você encontre o presente perfeito.
          </p>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-3xl bg-white animate-pulse" style={{ height: 340 }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <a
            href={`https://wa.me/${WHATSAPP}?text=Ol%C3%A1%2C%20gostaria%20de%20ver%20mais%20produtos!`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 font-semibold text-sm transition-all hover:-translate-y-1"
            style={{ borderColor: '#E27339', color: '#E27339' }}
          >
            Ver todos os produtos
            <Package className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
