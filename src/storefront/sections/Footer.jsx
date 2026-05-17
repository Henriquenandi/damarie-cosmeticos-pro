import { motion } from 'framer-motion';
import { Instagram, Facebook, MessageCircle, Heart } from 'lucide-react';

const WHATSAPP = '5548998506916';
const INSTAGRAM = 'https://instagram.com/damariepresentes';
const FACEBOOK = 'https://facebook.com/damariepresentes';

const links = {
  Loja: [
    { label: 'Produtos', href: '#produtos' },
    { label: 'Kits Especiais', href: '#kits' },
    { label: 'Categorias', href: '#categorias' },
    { label: 'Personalizados', href: '#kits' },
  ],
  Empresa: [
    { label: 'Sobre nós', href: '#sobre' },
    { label: 'Depoimentos', href: '#inicio' },
    { label: 'Contato', href: '#contato' },
  ],
  Atendimento: [
    { label: 'WhatsApp', href: `https://wa.me/${WHATSAPP}`, external: true },
    { label: 'Instagram', href: INSTAGRAM, external: true },
    { label: 'Trocas e devoluções', href: `https://wa.me/${WHATSAPP}`, external: true },
  ],
};

export default function Footer() {
  const scrollTo = (href) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer style={{ background: '#1C1209' }}>
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #E27339, #c85e2a)' }}
              >
                <span className="text-white text-base font-bold font-serif">D</span>
              </div>
              <div>
                <span className="font-serif text-xl text-white">Damarie</span>
                <span className="font-script text-sm ml-1" style={{ color: '#E27339' }}>
                  Presentes
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#9E7B6A' }}>
              Cosméticos, kits artesanais e presentes personalizados feitos com muito carinho para
              momentos especiais.
            </p>

            {/* Social icons */}
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: INSTAGRAM, label: 'Instagram' },
                { icon: Facebook, href: FACEBOOK, label: 'Facebook' },
                { icon: MessageCircle, href: `https://wa.me/${WHATSAPP}`, label: 'WhatsApp' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#9E7B6A' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#E27339';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = '#9E7B6A';
                  }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-5"
                style={{ color: '#E27339' }}
              >
                {category}
              </p>
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <li key={item.label}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm transition-colors hover:text-white"
                        style={{ color: '#9E7B6A' }}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <button
                        onClick={() => scrollTo(item.href)}
                        className="text-sm text-left transition-colors hover:text-white"
                        style={{ color: '#9E7B6A' }}
                      >
                        {item.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t px-5 md:px-10 py-6"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs" style={{ color: '#6B5344' }}>
          <p>© {new Date().getFullYear()} Damarie Presentes. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">
            Feito com <Heart className="w-3 h-3 fill-current" style={{ color: '#E27339' }} /> para
            presentear com amor
          </p>
          <p>www.damariepresentes.com.br</p>
        </div>
      </div>
    </footer>
  );
}
