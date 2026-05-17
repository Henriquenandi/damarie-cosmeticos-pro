import { motion } from 'framer-motion';
import { ArrowRight, Star, Heart, Sparkles } from 'lucide-react';
import ownerPhoto from '@/assets/Image.jpeg';

const WHATSAPP = '5548998506916';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP}?text=Ol%C3%A1%2C%20quero%20conhecer%20os%20produtos%20da%20Damarie!`;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut', delay },
  }),
};

const floatingCards = [
  { icon: '✨', label: '500+ clientes felizes', delay: 0.4 },
  { icon: '🎁', label: 'Kits personalizados', delay: 0.6 },
  { icon: '🌸', label: '100% artesanal', delay: 0.8 },
];

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center overflow-hidden pt-20"
      style={{
        background: 'linear-gradient(145deg, #FFF8F0 0%, #FAF3E8 40%, #F5EBE0 100%)',
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #E27339 0%, transparent 70%)',
          transform: 'translate(30%, -30%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #c85e2a 0%, transparent 70%)',
          transform: 'translate(-40%, 40%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-5 md:px-10 py-20 grid md:grid-cols-2 gap-12 items-center w-full">
        {/* Left: Copy */}
        <div className="flex flex-col gap-6 relative z-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.1}
            className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase"
            style={{ background: '#FDE8D8', color: '#E27339' }}
          >
            <Sparkles className="w-3 h-3" />
            Presentes que encantam
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.2}
            className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight"
            style={{ color: '#3D2B1F' }}
          >
            Mimo é coisa{' '}
            <span className="relative inline-block">
              <span style={{ color: '#E27339' }}>séria.</span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.7, duration: 0.5, ease: 'easeOut' }}
                className="absolute bottom-1 left-0 right-0 h-[3px] origin-left rounded-full"
                style={{ background: '#E27339', opacity: 0.4 }}
              />
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.35}
            className="text-lg md:text-xl leading-relaxed max-w-lg"
            style={{ color: '#6B5344' }}
          >
            Cosméticos, kits artesanais e presentes personalizados feitos com muito carinho.
            Porque cada pessoa especial merece um presente à altura.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.5}
            className="flex flex-wrap gap-3 pt-2"
          >
            <button
              onClick={() => {
                const el = document.querySelector('#produtos');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              style={{ background: 'linear-gradient(135deg, #E27339, #c85e2a)' }}
            >
              Ver coleção
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm border-2 transition-all hover:-translate-y-1"
              style={{ borderColor: '#E27339', color: '#E27339', background: 'transparent' }}
            >
              Falar no WhatsApp
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.65}
            className="flex items-center gap-3 pt-4"
          >
            <div className="flex -space-x-2">
              {['bg-orange-300', 'bg-amber-300', 'bg-rose-300', 'bg-pink-300'].map((c, i) => (
                <div key={i} className={`w-8 h-8 rounded-full border-2 border-white ${c}`} />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs" style={{ color: '#9E7B6A' }}>
                +500 clientes satisfeitas
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right: Visual */}
        <div className="relative flex items-center justify-center py-10">
          {/* Outer glow */}
          <div
            className="absolute w-80 h-80 md:w-[420px] md:h-[420px] rounded-full opacity-30 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #E27339 0%, transparent 70%)',
            }}
          />

          {/* Main photo frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
            className="relative w-64 h-64 md:w-80 md:h-80"
          >
            {/* Spinning dashed ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-5 rounded-full border-2 border-dashed opacity-25"
              style={{ borderColor: '#E27339' }}
            />

            {/* Gradient border ring */}
            <div
              className="absolute -inset-2 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #E27339, #c85e2a, #F5A97A, #E27339)',
                padding: 3,
              }}
            >
              <div className="w-full h-full rounded-full overflow-hidden"
                style={{ background: '#FAF3E8' }}>
                <img
                  src={ownerPhoto}
                  alt="Mariele — Damarie Presentes"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            {/* Orbiting icons */}
            {[
              { emoji: '🌸', angle: -30 },
              { emoji: '✨', angle: 42 },
              { emoji: '🧴', angle: 130 },
              { emoji: '💄', angle: 210 },
            ].map(({ emoji, angle }, i) => {
              const rad = (angle * Math.PI) / 180;
              const r = 175;
              const x = Math.cos(rad) * r;
              const y = Math.sin(rad) * r;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.12, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.2 }}
                  className="absolute w-11 h-11 rounded-full flex items-center justify-center text-lg shadow-lg"
                  style={{
                    background: 'white',
                    top: '50%',
                    left: '50%',
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    boxShadow: '0 4px 16px rgba(226,115,57,0.15)',
                  }}
                >
                  {emoji}
                </motion.div>
              );
            })}
          </motion.div>

          {/* Name badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-2.5 rounded-full shadow-xl"
            style={{ background: 'white', whiteSpace: 'nowrap' }}
          >
            <span className="text-base">🌸</span>
            <div className="text-center leading-tight">
              <p className="font-semibold text-sm" style={{ color: '#3D2B1F' }}>Mariele</p>
              <p className="font-script text-xs" style={{ color: '#E27339' }}>fundadora</p>
            </div>
          </motion.div>

          {/* Floating info cards */}
          {floatingCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? 30 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: card.delay, duration: 0.6 }}
              className="absolute flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-lg text-sm font-medium"
              style={{
                background: 'white',
                color: '#3D2B1F',
                ...(i === 0
                  ? { top: '8%', right: '-5%' }
                  : i === 1
                  ? { bottom: '15%', right: '-10%' }
                  : { top: '50%', left: '-15%' }),
              }}
            >
              <span className="text-lg">{card.icon}</span>
              {card.label}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 rounded-full border-2 flex items-start justify-center pt-1"
          style={{ borderColor: '#E27339', opacity: 0.5 }}
        >
          <div className="w-1 h-2 rounded-full" style={{ background: '#E27339' }} />
        </motion.div>
      </motion.div>
    </section>
  );
}
