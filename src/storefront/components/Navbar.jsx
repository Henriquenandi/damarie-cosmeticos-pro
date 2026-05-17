import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag } from 'lucide-react';

const WHATSAPP = '5548998506916';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20conhecer%20os%20produtos%20da%20Damarie!`;

const navLinks = [
  { label: 'Início', href: '#inicio' },
  { label: 'Produtos', href: '#produtos' },
  { label: 'Kits', href: '#kits' },
  { label: 'Sobre nós', href: '#sobre' },
  { label: 'Contato', href: '#contato' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? 'rgba(255, 250, 245, 0.95)'
            : 'rgba(255, 250, 245, 0)',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          boxShadow: scrolled ? '0 1px 20px rgba(226,115,57,0.08)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-10 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('#inicio')}
            className="flex items-center gap-2 group"
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, #E27339, #c85e2a)' }}
            >
              <span className="text-white text-base font-bold font-serif">D</span>
            </div>
            <div className="leading-none">
              <span className="font-serif text-xl tracking-tight" style={{ color: '#3D2B1F' }}>
                Damarie
              </span>
              <span className="font-script text-sm ml-1" style={{ color: '#E27339' }}>
                Presentes
              </span>
            </div>
          </button>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-sm font-medium transition-colors hover:text-[#E27339]"
                style={{ color: '#6B5344' }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #E27339, #c85e2a)' }}
            >
              <ShoppingBag className="w-4 h-4" />
              Comprar agora
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-xl transition-colors"
            style={{ color: '#3D2B1F' }}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 flex flex-col"
              style={{ background: '#FFF8F2' }}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-orange-100">
                <span className="font-serif text-xl" style={{ color: '#3D2B1F' }}>
                  Damarie
                </span>
                <button onClick={() => setMenuOpen(false)} style={{ color: '#6B5344' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1 p-4 flex-1">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className="text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-orange-50"
                    style={{ color: '#3D2B1F' }}
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
              <div className="p-4 border-t border-orange-100">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #E27339, #c85e2a)' }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Comprar agora
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
