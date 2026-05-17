import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const depoimentos = [
  {
    nome: 'Ana Carolina',
    nota: 5,
    texto:
      'Comprei um kit personalizado para o aniversário da minha mãe e ela amou! A embalagem era linda e os produtos de ótima qualidade. Com certeza comprarei muito mais.',
    inicial: 'A',
    cor: '#FDE8D8',
    corInicial: '#E27339',
  },
  {
    nome: 'Fernanda Lima',
    nota: 5,
    texto:
      'Atendimento incrível! A Mariele me ajudou a montar o kit perfeito para o Dia das Mães. Chegou na data combinada, super bem embalado. Recomendo demais!',
    inicial: 'F',
    cor: '#FCE7F3',
    corInicial: '#DB2777',
  },
  {
    nome: 'Juliana Mendes',
    nota: 5,
    texto:
      'Os sabonetes artesanais são maravilhosos, cheiro incrível e duram muito. Já indiquei para todas as minhas amigas. Qualidade premium com preço justo!',
    inicial: 'J',
    cor: '#F0FDF4',
    corInicial: '#16A34A',
  },
  {
    nome: 'Mariana Costa',
    nota: 5,
    texto:
      'Presentes que fazem parte da memória afetiva. Cada vez que uso os produtos me lembro da ocasião especial. Damarie é sinônimo de carinho e qualidade.',
    inicial: 'M',
    cor: '#F5F3FF',
    corInicial: '#7C3AED',
  },
  {
    nome: 'Patricia Souza',
    nota: 5,
    texto:
      'Comprei para presentear a noiva na despedida de solteira. Todo mundo ficou encantado com os produtos. A personalização com o nome dela foi um toque especial!',
    inicial: 'P',
    cor: '#FEF3C7',
    corInicial: '#D97706',
  },
  {
    nome: 'Roberta Alves',
    nota: 5,
    texto:
      'Produto chegou antes do prazo e melhor do que eu esperava. A embalagem é premium e os cosméticos são de excelente qualidade. Super recomendo a Damarie!',
    inicial: 'R',
    cor: '#FFF7ED',
    corInicial: '#EA580C',
  },
];

function StarRating({ nota }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: nota }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export default function Depoimentos() {
  return (
    <section className="py-20 md:py-28" style={{ background: '#FFFFFF' }}>
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
            Quem já recebeu sabe
          </p>
          <h2
            className="font-serif text-4xl md:text-5xl mb-4 tracking-tight"
            style={{ color: '#3D2B1F' }}
          >
            O que nossas clientes dizem
          </h2>
          <p className="text-base md:text-lg max-w-lg mx-auto" style={{ color: '#9E7B6A' }}>
            Mais de 500 clientes satisfeitas e cada uma com uma história especial para contar.
          </p>

          {/* Overall rating */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 mt-6 px-6 py-3 rounded-2xl"
            style={{ background: '#FFF8F0' }}
          >
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-bold text-2xl" style={{ color: '#3D2B1F' }}>
              5.0
            </span>
            <span className="text-sm" style={{ color: '#9E7B6A' }}>
              de 500+ avaliações
            </span>
          </motion.div>
        </motion.div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {depoimentos.map((dep, i) => (
            <motion.div
              key={dep.nome}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -4 }}
              className="relative flex flex-col gap-4 p-6 rounded-3xl border border-transparent hover:border-orange-100 transition-all"
              style={{ background: '#FAFAFA', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}
            >
              {/* Quote icon */}
              <Quote
                className="w-8 h-8 opacity-20 absolute top-4 right-4"
                style={{ color: '#E27339' }}
              />

              <StarRating nota={dep.nota} />

              <p className="text-sm leading-relaxed flex-1" style={{ color: '#6B5344' }}>
                "{dep.texto}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t border-orange-50">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: dep.corInicial }}
                >
                  {dep.inicial}
                </div>
                <p className="font-semibold text-sm" style={{ color: '#3D2B1F' }}>
                  {dep.nome}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
