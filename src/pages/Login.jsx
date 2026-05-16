import React, { useState } from 'react';
import { useAuth } from '@/lib/SupabaseAuthContext';
import damarieLogoSrc from '@/assets/damarielogo.jpeg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Sparkles,
  Heart,
  Check,
} from 'lucide-react';

function Bow({ size = 28, color = '#fff', heart = '#D9342E', stroke = 2 }) {
  return (
    <svg width={size} height={size * 0.72} viewBox="0 0 200 144" fill="none" aria-hidden="true">
      <path d="M100 78 C 70 50, 30 40, 14 58 C 2 72, 14 96, 44 96 C 70 96, 92 90, 100 78 Z"
        fill={color} stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
      <path d="M100 78 C 130 50, 170 40, 186 58 C 198 72, 186 96, 156 96 C 130 96, 108 90, 100 78 Z"
        fill={color} stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
      <path d="M86 64 C 88 78, 88 86, 86 100 L 114 100 C 112 86, 112 78, 114 64 Z"
        fill={color} stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
      <path d="M86 100 C 72 116, 64 128, 56 140 L 78 138 C 86 124, 92 114, 100 102 Z"
        fill={color} stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
      <path d="M114 100 C 128 116, 136 128, 144 140 L 122 138 C 114 124, 108 114, 100 102 Z"
        fill={color} stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
      <path d="M100 64 C 96 58, 88 58, 88 66 C 88 72, 100 80, 100 80 C 100 80, 112 72, 112 66 C 112 58, 104 58, 100 64 Z"
        fill={heart} />
    </svg>
  );
}

function FlowingRibbon() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full mix-blend-screen"
      viewBox="0 0 800 600"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ribGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <path d="M -40 120 C 200 60, 380 220, 520 180 S 760 80, 880 160"
        stroke="url(#ribGrad)" strokeWidth="36" fill="none" strokeLinecap="round" />
      <path d="M -40 360 C 180 280, 420 460, 600 380 S 780 320, 880 380"
        stroke="url(#ribGrad)" strokeWidth="48" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M -40 520 C 220 470, 400 580, 600 540 S 780 480, 880 540"
        stroke="url(#ribGrad)" strokeWidth="24" fill="none" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

function Confetti() {
  const colors = ['#E27339', '#D9342E', '#F2C46B', '#fff', '#A8431A'];
  const pieces = Array.from({ length: 26 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.4,
    color: colors[i % colors.length],
    rot: Math.random() * 360,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map(p => (
        <span
          key={p.id}
          className="absolute h-3 w-2 rounded-sm animate-[confettiFall_1.6s_ease-out_forwards]"
          style={{
            left: `${p.left}%`,
            top: '20%',
            background: p.color,
            transform: `rotate(${p.rot}deg)`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Login() {
  const { signIn, isLoadingAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [focusField, setFocusField] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha email e senha');
      return;
    }
    if (!/.+@.+\..+/.test(email)) {
      setError('Digite um email válido');
      return;
    }

    try {
      await signIn(email, password);
      setSuccess(true);
    } catch (err) {
      setError('Email ou senha incorretos');
    }
  };

  return (
    <div
      className="relative grid min-h-screen w-full overflow-hidden bg-[#FAF3E8] font-sans text-[#2A1A0F]
                 grid-cols-1 md:grid-cols-[1.15fr_1fr]"
    >
      <style>{`
        @keyframes floatY   { 0%,100% { transform: translateY(0) rotate(-6deg); }
                              50%     { transform: translateY(-14px) rotate(-2deg); } }
        @keyframes twinkle  { 0%,100% { opacity:.35; transform:scale(.9); }
                              50%     { opacity:1;   transform:scale(1.15); } }
        @keyframes shine    { 0%      { left:-30%; } 60%,100% { left:130%; } }
        @keyframes shake    { 0%,100% { transform:translateX(0); }
                              25%     { transform:translateX(-4px); }
                              75%     { transform:translateX(4px); } }
        @keyframes pop      { 0%      { transform:scale(0); }
                              70%     { transform:scale(1.08); }
                              100%    { transform:scale(1); } }
        @keyframes confettiFall {
                              0%   { transform:translateY(-40px) rotate(0);   opacity:1; }
                              100% { transform:translateY(140px) rotate(360deg); opacity:0; } }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
          box-shadow: 0 0 0 1000px #ffffff inset !important;
          -webkit-text-fill-color: #2A1A0F !important;
        }
      `}</style>

      {/* BRAND PANEL (left) */}
      <aside
        className="relative flex flex-col justify-between overflow-hidden px-8 py-10 text-white
                   md:px-16 md:py-14"
        style={{
          background:
            'radial-gradient(120% 100% at 15% 10%, #EE864A 0%, #E27339 35%, #C85A22 80%, #A8431A 100%)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 80% 90%, rgba(255,255,255,0.16), transparent 40%), radial-gradient(circle at 20% 80%, rgba(0,0,0,0.18), transparent 50%)',
          }}
        />
        <FlowingRibbon />

        <div
          className="absolute z-10 animate-[floatY_6s_ease-in-out_infinite]"
          style={{ top: '8%', right: '8%', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.18))' }}
        >
          <Bow size={64} />
        </div>
        <Sparkles
          className="absolute z-10 text-[#FFE5C9] animate-[twinkle_2.6s_ease-in-out_infinite]"
          style={{ top: '24%', right: '22%', animationDelay: '0.4s' }}
          size={20}
        />
        <Sparkles
          className="absolute z-10 text-white/80 animate-[twinkle_2.6s_ease-in-out_infinite]"
          style={{ top: '60%', right: '14%', animationDelay: '1.2s' }}
          size={14}
        />
        <Sparkles
          className="absolute z-10 text-[#FFE5C9]/70 animate-[twinkle_2.6s_ease-in-out_infinite]"
          style={{ top: '70%', left: '8%', animationDelay: '2s' }}
          size={16}
        />

        <div className="relative z-20 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-white/15 backdrop-blur-sm overflow-hidden">
            <img src={damarieLogoSrc} alt="Damariê" className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="font-serif text-[22px] leading-none">
              Damari<em className="not-italic">ê</em>{' '}
              <span className="ml-1 text-sm opacity-70">presentes</span>
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.2em] opacity-80">
              Boutique de presentes
            </div>
          </div>
        </div>

        <div className="relative z-20 max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 py-1.5 pl-2 pr-3.5 text-[11px] font-medium uppercase tracking-[0.15em]">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            Área da equipe · acesso interno
          </span>
          <h1 className="mt-7 mb-6 font-serif text-[clamp(44px,5.2vw,76px)] leading-[0.98] tracking-tight text-balance">
            Cada presente
            <br />
            tem uma <em className="text-[#FFE5C9]">história</em>.
          </h1>
          <p className="max-w-md text-[17px] font-light leading-relaxed opacity-90">
            Entre no painel para acompanhar pedidos, embalagens personalizadas e a magia
            que sai daqui pra fazer alguém sorrir.
          </p>
        </div>

        <div className="relative z-20 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-sm border-l-2 border-white/40 pl-4">
            <p className="m-0 mb-2 font-serif text-[18px] italic leading-snug">
              "Cada caixinha sai como se fosse pra mim. Isso é o nosso jeito."
            </p>
            <small className="text-[11px] uppercase tracking-[0.18em] opacity-75">
              — Damariê · desde 2024
            </small>
          </div>
        </div>
      </aside>

      {/* FORM PANEL (right) */}
      <main className="relative flex items-center justify-center px-6 py-10 md:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(168,67,26,0.08) 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />

        <div className="relative z-10 w-full max-w-[420px]">
          {success && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#FAF3E8]/95 animate-in fade-in duration-300">
              <Confetti />
              <div
                className="mb-5 flex h-[88px] w-[88px] items-center justify-center rounded-full animate-[pop_0.5s_cubic-bezier(.34,1.56,.64,1)]"
                style={{
                  background: 'linear-gradient(180deg,#E27339,#C85A22)',
                  boxShadow: '0 14px 32px -8px rgba(168,67,26,0.55)',
                }}
              >
                <Check className="h-9 w-9 text-white" strokeWidth={3} />
              </div>
              <h3 className="m-0 mb-1 font-serif text-[30px]">Bem-vinda de volta!</h3>
              <p className="text-sm text-[#5B4538]">Abrindo seu painel…</p>
            </div>
          )}

          <div className="mb-8 flex items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-2xl shadow-md">
              <img src={damarieLogoSrc} alt="Damariê" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="font-serif text-[20px] leading-tight text-[#2A1A0F]">Damariê presentes</div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-[#5B4538]">Boutique de presentes</div>
            </div>
          </div>

          <span className="mb-2 inline-flex -rotate-2 items-center gap-2 font-script text-2xl text-[#C85A22]">
            <span className="inline-block h-px w-7 bg-[#C85A22]" />
            Olá, que bom te ver
            <Heart className="h-3.5 w-3.5 fill-[#D9342E] text-[#D9342E]" />
          </span>

          <h2 className="m-0 mb-3 font-serif text-[44px] leading-[1.05] tracking-tight text-[#2A1A0F]">
            Entre na sua <em className="text-[#C85A22]">boutique</em>.
          </h2>
          <p className="mb-9 text-[14.5px] leading-relaxed text-[#5B4538]">
            Acesse o painel da Damariê para gerenciar pedidos, estoque e mensagens dos clientes.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <div
                className="mb-4 flex items-center gap-2 rounded-lg border border-[#D9342E]/25 bg-[#D9342E]/10 px-3.5 py-3 text-[13px] text-[#9A1F1B]
                           animate-[shake_0.35s_ease]"
              >
                <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#D9342E] text-[11px] font-bold text-white">
                  !
                </span>
                {error}
              </div>
            )}

            <div className="mb-5">
              <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5B4538]">
                Email
              </label>
              <div
                className={[
                  'flex h-14 items-center rounded-2xl border bg-white px-3.5 transition-all',
                  focusField === 'email'
                    ? 'border-[#C85A22] shadow-[0_0_0_4px_rgba(226,115,57,0.12)]'
                    : 'border-[#2A1A0F]/10 hover:border-[#A8431A]/30',
                  error && !email ? 'border-[#D9342E] shadow-[0_0_0_4px_rgba(217,52,46,0.10)]' : '',
                ].join(' ')}
              >
                <Mail className="h-[18px] w-[18px] flex-shrink-0 text-[#5B4538]" strokeWidth={1.8} />
                <Input
                  type="email"
                  placeholder="voce@damarie.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusField('email')}
                  onBlur={() => setFocusField('')}
                  disabled={isLoadingAuth}
                  autoComplete="email"
                  className="h-full border-0 bg-transparent px-3 text-[15px] tracking-wide shadow-none focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5B4538]">
                Senha
              </label>
              <div
                className={[
                  'flex h-14 items-center rounded-2xl border bg-white px-3.5 transition-all',
                  focusField === 'pwd'
                    ? 'border-[#C85A22] shadow-[0_0_0_4px_rgba(226,115,57,0.12)]'
                    : 'border-[#2A1A0F]/10 hover:border-[#A8431A]/30',
                  error && !password ? 'border-[#D9342E] shadow-[0_0_0_4px_rgba(217,52,46,0.10)]' : '',
                ].join(' ')}
              >
                <Lock className="h-[18px] w-[18px] flex-shrink-0 text-[#5B4538]" strokeWidth={1.8} />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusField('pwd')}
                  onBlur={() => setFocusField('')}
                  disabled={isLoadingAuth}
                  autoComplete="current-password"
                  className="h-full border-0 bg-transparent px-3 text-[15px] tracking-wide shadow-none focus-visible:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[#5B4538] hover:bg-[#E27339]/10 hover:text-[#C85A22]"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="mb-7 flex items-center justify-between">
              <label className="flex cursor-pointer select-none items-center gap-2 text-[13px] text-[#5B4538]">
                <span
                  className={[
                    'flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border-[1.5px] transition-all',
                    remember
                      ? 'border-[#C85A22] bg-[#C85A22]'
                      : 'border-[#2A1A0F]/15 bg-white',
                  ].join(' ')}
                >
                  {remember && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                </span>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="hidden"
                />
                Lembrar de mim
              </label>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="border-b border-dotted border-[#A8431A]/40 text-[13px] font-semibold text-[#C85A22] hover:border-[#A8431A] hover:text-[#A8431A]"
              >
                Esqueci minha senha
              </a>
            </div>

            <Button
              type="submit"
              disabled={isLoadingAuth}
              className="relative h-[58px] w-full overflow-hidden rounded-2xl text-[15px] font-semibold tracking-wide text-white
                         shadow-[0_12px_28px_-10px_rgba(168,67,26,0.55),inset_0_1px_0_rgba(255,255,255,0.25)]
                         hover:-translate-y-px hover:shadow-[0_16px_32px_-10px_rgba(168,67,26,0.6)]
                         active:translate-y-0 disabled:cursor-progress disabled:opacity-85"
              style={{ background: 'linear-gradient(180deg,#E27339 0%,#C85A22 100%)' }}
            >
              {!isLoadingAuth && (
                <span
                  className="absolute top-0 h-full w-[30%] animate-[shine_2.4s_ease-in-out_infinite]"
                  style={{
                    left: '-30%',
                    background:
                      'linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)',
                  }}
                />
              )}
              {isLoadingAuth ? (
                <span className="flex items-center gap-2.5">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Abrindo a boutique…
                </span>
              ) : (
                <span className="flex items-center gap-2.5">
                  Entrar na boutique
                  <ArrowRight size={16} strokeWidth={2.2} />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-7 flex flex-col items-center gap-2.5 text-[11.5px] text-[#5B4538]">
            <span className="inline-flex items-center gap-1.5">
              <Shield size={13} className="text-[#C85A22]" />
              Conexão segura · criptografada de ponta a ponta
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2A1A0F]/10 bg-[#2A1A0F]/[0.03] px-2.5 py-[5px] text-[10.5px] uppercase tracking-[0.14em]">
              <Sparkles size={11} className="text-[#C85A22]" />
              powered by <strong className="font-semibold text-[#2A1A0F]">TheBimCare</strong>
            </span>
            <span className="mt-1 inline-flex items-center gap-1 text-[11px] opacity-60">
              © 2026 Damariê Presentes · feito com
              <Heart className="h-3 w-3 fill-[#D9342E] text-[#D9342E]" />
              
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
