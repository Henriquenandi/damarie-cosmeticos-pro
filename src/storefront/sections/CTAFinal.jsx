import { motion } from 'framer-motion';
import { ShoppingBag, MessageCircle, ArrowRight } from 'lucide-react';

const WHATSAPP = '5511999999999';

export default function CTAFinal() {
  return (
    <section
      id="contato"
      className="py-20 md:py-28 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #FFF8F0 0%, #FAF3E8 50%, #F0E6D3 100%)',
      }}
    >
      {/* Decorative elements */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute top-10 right-10 w-40 h-40 rounded-full border-2 border-dashed opacity-10"
        style={{ borderColor: '#E27339' }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-10 left-10 w-24 h-24 rounded-full border-2 border-dashed opacity-10"
        style={{ borderColor: '#E27339' }}
      />

      <div className="max-w-4xl mx-auto px-5 md:px-10 relative z-10 text-center">
        {/* Emoji */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 200 }}
          animate={{ y: [-6, 6, -6] }}
          className="text-6xl mb-6 inline-block"
        >
          🎁
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: '#E27339' }}
          >
            Comece agora
          </p>
          <h2
            className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight mb-6"
            style={{ color: '#3D2B1F' }}
          >
            Pronta para presentear{' '}
            <span className="font-script" style={{ color: '#E27339' }}>
              com amor?
            </span>
          </h2>
          <p
            className="text-base md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto"
            style={{ color: '#9E7B6A' }}
          >
            Fale com a gente pelo WhatsApp e descubra o presente perfeito. Atendimento rápido,
            personalizado e cheio de carinho — do jeito que você merece.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Olá! Vim pelo site e gostaria de conhecer os produtos da Damarie Presentes!')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-full text-white font-semibold text-base shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg, #E27339, #c85e2a)' }}
          >
            <MessageCircle className="w-5 h-5" />
            Falar no WhatsApp
          </a>
          <button
            onClick={() => {
              const el = document.querySelector('#produtos');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 font-semibold text-base transition-all hover:-translate-y-1"
            style={{ borderColor: '#E27339', color: '#E27339' }}
          >
            <ShoppingBag className="w-5 h-5" />
            Ver produtos
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Reassurance */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6 mt-12"
        >
          {['✓ Sem compromisso', '✓ Resposta rápida', '✓ Personalização gratuita'].map((item) => (
            <span key={item} className="text-sm font-medium" style={{ color: '#9E7B6A' }}>
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
