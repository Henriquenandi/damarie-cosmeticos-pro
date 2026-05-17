import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const WHATSAPP = '5511999999999';

const kits = [
  {
    emoji: '🌹',
    nome: 'Kit Romance',
    descricao: 'Para quem quer surpreender com elegância. Perfume, crème e sabonete artesanal em embalagem premium.',
    destaque: 'Mais pedido',
    preco: 'A partir de R$ 149',
    cor1: '#FDE8D8',
    cor2: '#FBD5B8',
    msg: 'Kit Romance',
  },
  {
    emoji: '✨',
    nome: 'Kit Bem-Estar',
    descricao: 'Uma experiência completa de autocuidado. Óleos essenciais, hidratante e acessórios selecionados.',
    destaque: 'Novo',
    preco: 'A partir de R$ 199',
    cor1: '#F0FDF4',
    cor2: '#DCFCE7',
    msg: 'Kit Bem-Estar',
  },
  {
    emoji: '🎁',
    nome: 'Kit Personalizado',
    descricao: 'Monte o kit dos sonhos! Você escolhe os produtos, embalagem e mensagem. 100% do seu jeito.',
    destaque: 'Exclusivo',
    preco: 'Sob consulta',
    cor1: '#F5F3FF',
    cor2: '#EDE9FE',
    msg: 'Kit Personalizado',
  },
];

export default function KitsEspeciais() {
  return (
    <section
      id="kits"
      className="py-20 md:py-28 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #3D2B1F 0%, #5C3D2E 50%, #7A4F3A 100%)' }}
    >
      {/* Decorative orbs */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #E27339, transparent)',
          transform: 'translate(30%, -30%)',
        }}
      />
      <div
        className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #E27339, transparent)',
          transform: 'translateY(40%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-5 md:px-10 relative z-10">
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
            style={{ color: '#E8A87C' }}
          >
            Presenteie com sofisticação
          </p>
          <h2
            className="font-serif text-4xl md:text-5xl mb-4 tracking-tight text-white"
          >
            Kits que fazem{' '}
            <span className="font-script text-[#E27339]">a diferença</span>
          </h2>
          <p className="text-base md:text-lg max-w-lg mx-auto" style={{ color: '#C8A898' }}>
            Combinações pensadas com cuidado para cada ocasião especial na sua vida.
          </p>
        </motion.div>

        {/* Kit cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {kits.map((kit, i) => (
            <motion.div
              key={kit.nome}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="group relative flex flex-col gap-5 p-7 rounded-3xl overflow-hidden"
              style={{
                background: `linear-gradient(145deg, ${kit.cor1}, ${kit.cor2})`,
                boxShadow: '0 4px 30px rgba(0,0,0,0.15)',
              }}
            >
              {/* Destaque badge */}
              <div
                className="self-start px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide"
                style={{ background: '#E27339', color: 'white' }}
              >
                {kit.destaque}
              </div>

              {/* Emoji */}
              <motion.div
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
                className="text-5xl"
              >
                {kit.emoji}
              </motion.div>

              {/* Text */}
              <div className="flex flex-col gap-2">
                <h3 className="font-serif text-2xl" style={{ color: '#3D2B1F' }}>
                  {kit.nome}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6B5344' }}>
                  {kit.descricao}
                </p>
              </div>

              {/* Price + CTA */}
              <div className="mt-auto pt-4 border-t border-orange-100">
                <p className="font-bold text-sm mb-3" style={{ color: '#E27339' }}>
                  {kit.preco}
                </p>
                <a
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Olá! Tenho interesse no ${kit.msg}. Poderia me passar mais informações?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold transition-all group-hover:gap-3"
                  style={{ color: '#3D2B1F' }}
                >
                  Quero esse kit
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10 text-sm"
          style={{ color: '#9E7B6A' }}
        >
          Todos os kits podem ser personalizados com mensagem especial e embalagem exclusiva.
        </motion.p>
      </div>
    </section>
  );
}
