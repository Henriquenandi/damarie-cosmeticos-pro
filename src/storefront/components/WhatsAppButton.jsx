import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, MessageCircle } from 'lucide-react';

const WHATSAPP = '5511999999999';

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);

  const whatsappUrl = (msg) =>
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

  const shortcuts = [
    { emoji: '🎁', label: 'Ver kits disponíveis', msg: 'Olá! Gostaria de ver os kits disponíveis na Damarie Presentes!' },
    { emoji: '💄', label: 'Ver cosméticos', msg: 'Olá! Gostaria de conhecer os cosméticos da Damarie Presentes!' },
    { emoji: '✨', label: 'Presente personalizado', msg: 'Olá! Gostaria de criar um presente personalizado na Damarie Presentes!' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Quick options panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex flex-col gap-2 w-64 rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'white' }}
          >
            {/* Header */}
            <div
              className="px-4 py-3"
              style={{ background: 'linear-gradient(135deg, #E27339, #c85e2a)' }}
            >
              <p className="font-semibold text-white text-sm">Damarie Presentes 🌸</p>
              <p className="text-xs text-orange-100">Respondemos em instantes!</p>
            </div>

            {/* Shortcuts */}
            <div className="flex flex-col gap-1 p-2">
              {shortcuts.map((s) => (
                <a
                  key={s.label}
                  href={whatsappUrl(s.msg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-orange-50"
                  style={{ color: '#3D2B1F' }}
                  onClick={() => setOpen(false)}
                >
                  <span className="text-lg">{s.emoji}</span>
                  {s.label}
                </a>
              ))}
            </div>

            {/* Free text CTA */}
            <div className="px-3 pb-3">
              <a
                href={whatsappUrl('Olá! Vim pelo site da Damarie Presentes e gostaria de mais informações.')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: '#25D366' }}
                onClick={() => setOpen(false)}
              >
                <MessageCircle className="w-4 h-4" />
                Enviar mensagem
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
        style={{ background: '#25D366' }}
        aria-label="WhatsApp"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* WhatsApp SVG icon */}
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse ring */}
        {!open && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ background: '#25D366' }}
            animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.button>
    </div>
  );
}
