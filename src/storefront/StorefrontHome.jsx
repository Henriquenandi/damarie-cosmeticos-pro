import Hero from './sections/Hero';
import Categorias from './sections/Categorias';
import ProdutosDestaque from './sections/ProdutosDestaque';
import PorQueEscolher from './sections/PorQueEscolher';
import KitsEspeciais from './sections/KitsEspeciais';
import ExperienciaMarca from './sections/ExperienciaMarca';
import Depoimentos from './sections/Depoimentos';
import CTAFinal from './sections/CTAFinal';
import Footer from './sections/Footer';

export default function StorefrontHome() {
  return (
    <main style={{ fontFamily: 'Manrope, system-ui, sans-serif' }}>
      <Hero />
      <Categorias />
      <ProdutosDestaque />
      <PorQueEscolher />
      <KitsEspeciais />
      <ExperienciaMarca />
      <Depoimentos />
      <CTAFinal />
      <Footer />
    </main>
  );
}
