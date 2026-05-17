import { motion } from 'framer-motion';
import { Heart, Sparkles, Truck, Shield, Award, MessageCircle } from 'lucide-react';

const diferenciais = [
  {
    icon: Heart,
    titulo: 'Feito com carinho',
    texto: 'Cada produto é preparado com atenção aos detalhes e muito amor, do começo ao fim.',
    cor: '#FCE7F3',
    corIcone: '#DB2777',
  },
  {
    icon: Sparkles,
    titulo: 'Produtos únicos',
    texto: 'Nossa curadoria traz os melhores produtos artesanais e cosméticos premium do mercado.',
    cor: '#FDE8D8',
    corIcone: '#E27339',
  },
  {
    icon: Award,
    titulo: 'Qualidade garantida',
    texto: 'Trabalhamos apenas com marcas reconhecidas e produtos de alta qualidade.',
    cor: '#FEF3C7',
    corIcone: '#D97706',
  },
  {
    icon: Truck,
    titulo: 'Entrega cuidadosa',
    texto: 'Embalamos com carinho para que o presente chegue perfeito até você.',
    cor: '#F0FDF4',
    corIcone: '#16A34A',
  },
  {
    icon: MessageCircle,
    titulo: 'Atendimento humano',
    texto: 'Estamos sempre disponíveis para te ajudar a encontrar o presente ideal.',
    cor: '#F5F3FF',
    corIcone: '#7C3AED',
  },
  {
    icon: Shield,
    titulo: 'Personalização total',
    texto: 'Criamos kits exclusivos do jeito que você imaginar, para ocasiões especiais.',
    cor: '#FFF7ED',
    corIcone: '#EA580C',
  },
];

export default function PorQueEscolher() {
  return (
    <section id="sobre" className="py-20 md:py-28" style={{ background: '#FFFFFF' }}>
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left: Decorative visual */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Main card */}
            <div
              className="relative rounded-3xl p-10 overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #FDE8D8, #FAF3E8)',
                minHeight: 440,
              }}
            >
              {/* Decorative circles */}
              <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-30"
                style={{
                  background: 'radial-gradient(circle, #E27339, transparent)',
                  transform: 'translate(30%, -30%)',
                }}
              />
              <div
                className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-20"
                style={{
                  background: 'radial-gradient(circle, #c85e2a, transparent)',
                  transform: 'translate(-30%, 30%)',
                }}
              />

              {/* Content */}
              <div className="relative z-10 flex flex-col gap-6">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-6xl"
                >
                  🌸
                </motion.div>
                <blockquote>
                  <p
                    className="font-serif text-2xl md:text-3xl leading-snug mb-4"
                    style={{ color: '#3D2B1F' }}
                  >
                    "Um presente não é apenas um objeto — é uma declaração de afeto."
                  </p>
                  <footer className="font-script text-lg" style={{ color: '#E27339' }}>
                    — Damarie Presentes
                  </footer>
                </blockquote>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-orange-100">
                  {[
                    { num: '500+', label: 'Clientes' },
                    { num: '5★', label: 'Avaliação' },
                    { num: '3+', label: 'Anos' },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <p className="font-serif text-2xl font-bold" style={{ color: '#E27339' }}>
                        {s.num}
                      </p>
                      <p className="text-xs" style={{ color: '#9E7B6A' }}>
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              animate={{ y: [-4, 4, -4] }}
              className="absolute -bottom-5 -right-5 px-5 py-4 rounded-2xl shadow-xl text-sm font-semibold"
              style={{ background: 'white', color: '#3D2B1F' }}
            >
              <p className="text-2xl mb-1">🎁</p>
              <p>Kits personalizados</p>
              <p className="text-xs font-normal" style={{ color: '#9E7B6A' }}>
                do seu jeito
              </p>
            </motion.div>
          </motion.div>

          {/* Right: Features list */}
          <div className="flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: '#E27339' }}
              >
                Nossa essência
              </p>
              <h2
                className="font-serif text-4xl md:text-5xl mb-4 tracking-tight"
                style={{ color: '#3D2B1F' }}
              >
                Por que escolher a Damarie?
              </h2>
              <p className="text-base leading-relaxed" style={{ color: '#9E7B6A' }}>
                Porque aqui cada detalhe importa, cada produto é escolhido com critério e cada
                presente é entregue com o carinho de quem realmente se importa.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {diferenciais.map((d, i) => {
                const Icon = d.icon;
                return (
                  <motion.div
                    key={d.titulo}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    className="flex flex-col gap-2 p-4 rounded-2xl"
                    style={{ background: d.cor }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.8)' }}
                    >
                      <Icon className="w-4 h-4" style={{ color: d.corIcone }} />
                    </div>
                    <p className="font-semibold text-sm" style={{ color: '#3D2B1F' }}>
                      {d.titulo}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: '#9E7B6A' }}>
                      {d.texto}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
