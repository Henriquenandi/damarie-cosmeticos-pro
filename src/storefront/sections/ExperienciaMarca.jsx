import { motion } from 'framer-motion';

const pilares = [
  {
    emoji: '💛',
    titulo: 'Carinho em cada detalhe',
    texto:
      'Desde a escolha dos ingredientes até a embalagem, cada etapa é feita com atenção e afeto — porque você merece o melhor.',
  },
  {
    emoji: '🌿',
    titulo: 'Qualidade que se sente',
    texto:
      'Trabalhamos com produtos de alto padrão, selecionados a dedo para garantir uma experiência sensorial única.',
  },
  {
    emoji: '🎨',
    titulo: 'Personalização sem limites',
    texto:
      'Porque cada presente deve contar uma história. Criamos a peça perfeita para a pessoa perfeita — do seu jeito.',
  },
];

export default function ExperienciaMarca() {
  return (
    <section
      className="py-20 md:py-28 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #FFF8F0, #FAF3E8 60%, #F0E6D3)' }}
    >
      {/* Decorative large text */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden
      >
        <span
          className="font-serif text-[12rem] md:text-[18rem] opacity-[0.035] whitespace-nowrap"
          style={{ color: '#E27339' }}
        >
          Damarie
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-10 relative z-10">
        {/* Top headline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="text-5xl mb-6"
          >
            🎀
          </motion.div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: '#E27339' }}
          >
            A experiência Damarie
          </p>
          <h2
            className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight mb-6"
            style={{ color: '#3D2B1F' }}
          >
            A sensação especial de{' '}
            <span className="font-script" style={{ color: '#E27339' }}>
              receber um presente
            </span>{' '}
            com amor
          </h2>
          <p className="text-base md:text-lg leading-relaxed" style={{ color: '#9E7B6A' }}>
            Um presente da Damarie não é apenas um produto — é um momento. É o coração acelerado ao
            abrir a embalagem, o sorriso que não se controla, a memória afetiva que fica para sempre.
          </p>
        </motion.div>

        {/* Three pillars */}
        <div className="grid md:grid-cols-3 gap-8">
          {pilares.map((p, i) => (
            <motion.div
              key={p.titulo}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.7 }}
              className="relative flex flex-col gap-5 p-8 rounded-3xl text-center"
              style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}
            >
              {/* Connector line (desktop) */}
              {i < pilares.length - 1 && (
                <div
                  className="hidden md:block absolute top-1/2 -right-4 w-8 h-px"
                  style={{ background: '#E8D5C0', zIndex: 0 }}
                />
              )}

              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                className="text-5xl mx-auto"
              >
                {p.emoji}
              </motion.div>

              <div>
                <h3 className="font-serif text-xl mb-3" style={{ color: '#3D2B1F' }}>
                  {p.titulo}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#9E7B6A' }}>
                  {p.texto}
                </p>
              </div>

              {/* Decorative bottom accent */}
              <div
                className="w-10 h-1 rounded-full mx-auto mt-2"
                style={{ background: 'linear-gradient(90deg, #E27339, #c85e2a)' }}
              />
            </motion.div>
          ))}
        </div>

        {/* Emotional quote */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="mt-16 p-8 md:p-12 rounded-3xl text-center"
          style={{
            background: 'linear-gradient(135deg, #E27339, #c85e2a)',
          }}
        >
          <p className="font-script text-3xl md:text-4xl text-white mb-3">
            "O presente certo pode transformar um dia comum em uma memória eterna."
          </p>
          <p className="text-orange-100 text-sm font-medium">
            Essa é a nossa missão — e o nosso presente para você.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
