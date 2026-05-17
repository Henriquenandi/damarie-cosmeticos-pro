import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const categorias = [
  {
    emoji: '🎁',
    nome: 'Kits Presentes',
    descricao: 'Combinações especiais para surpreender',
    cor: '#FDE8D8',
    corTexto: '#E27339',
  },
  {
    emoji: '🧴',
    nome: 'Cosméticos',
    descricao: 'Cremes, óleos e cuidados para a pele',
    cor: '#FEF3C7',
    corTexto: '#D97706',
  },
  {
    emoji: '💄',
    nome: 'Maquiagem',
    descricao: 'Produtos para realçar sua beleza',
    cor: '#FCE7F3',
    corTexto: '#DB2777',
  },
  {
    emoji: '🌸',
    nome: 'Corpo & Rosto',
    descricao: 'Hidratação e cuidados do dia a dia',
    cor: '#F0FDF4',
    corTexto: '#16A34A',
  },
  {
    emoji: '🎀',
    nome: 'Personalizados',
    descricao: 'Criados exclusivamente para você',
    cor: '#F5F3FF',
    corTexto: '#7C3AED',
  },
  {
    emoji: '✨',
    nome: 'Artesanais',
    descricao: 'Feitos à mão com todo carinho',
    cor: '#FFF7ED',
    corTexto: '#EA580C',
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Categorias() {
  const handleCategoryClick = () => {
    const el = document.querySelector('#produtos');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="categorias" className="py-20 md:py-28" style={{ background: '#FFFFFF' }}>
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
            Explore
          </p>
          <h2
            className="font-serif text-4xl md:text-5xl mb-4 tracking-tight"
            style={{ color: '#3D2B1F' }}
          >
            O que você está buscando?
          </h2>
          <p className="text-base md:text-lg max-w-xl mx-auto" style={{ color: '#9E7B6A' }}>
            Temos tudo para o presente perfeito — da hidratação delicada ao kit personalizado.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5"
        >
          {categorias.map((cat) => (
            <motion.button
              key={cat.nome}
              variants={cardVariants}
              onClick={handleCategoryClick}
              whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(226,115,57,0.12)' }}
              className="group relative flex flex-col gap-4 p-6 rounded-3xl text-left transition-shadow border border-transparent hover:border-orange-100"
              style={{ background: cat.cor }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                style={{ background: 'white' }}
              >
                {cat.emoji}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-base mb-1" style={{ color: '#3D2B1F' }}>
                  {cat.nome}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: '#9E7B6A' }}>
                  {cat.descricao}
                </p>
              </div>
              <div
                className="flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: cat.corTexto }}
              >
                Ver mais
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
