// ===== Login component =====
const { useState: useS, useEffect: useE, useRef: useR } = React;

// Small icon set (Lucide-style inline SVGs)
const Icon = {
  Mail: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m22 7-10 6L2 7"/></svg>,
  Lock: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Eye: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><path d="m2 2 20 20"/><path d="M14.12 14.12A3 3 0 1 1 9.88 9.88"/></svg>,
  Check: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
  Heart: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 21s-7-4.5-9.5-9C.7 8.7 2.4 5 6 5c2 0 3.5 1.2 4 2 .5-.8 2-2 4-2 3.6 0 5.3 3.7 3.5 7-2.5 4.5-9.5 9-9.5 9Z"/></svg>,
  Shield: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>,
  Sparkle: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2 13.5 9 22 12l-8.5 3L12 22l-1.5-7L2 12l8.5-3Z"/></svg>,
  Arrow: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 5 19 12 13 19"/></svg>,
  Gift: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
};

const DEFAULTS = window.LOGIN_DEFAULTS || {
  layout: 'split',
  decor: 'ribbons',
  showBimcare: true,
};

function Confetti({ trigger }) {
  if (!trigger) return null;
  const colors = ['#E27339', '#D9342E', '#F2C46B', '#fff', '#A8431A'];
  const pieces = Array.from({ length: 26 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.4,
    color: colors[i % colors.length],
    rot: Math.random() * 360,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {pieces.map(p => (
        <span key={p.id} className="confetti"
          style={{
            left: `${p.left}%`,
            top: '20%',
            background: p.color,
            transform: `rotate(${p.rot}deg)`,
            animationDelay: `${p.delay}s`,
          }} />
      ))}
    </div>
  );
}

function Login() {
  const t = window.useTweaks ? window.useTweaks(DEFAULTS) : [DEFAULTS, () => {}];
  const tweaks = t[0]; const setTweak = t[1];

  const [email, setEmail] = useS('');
  const [pwd, setPwd] = useS('');
  const [showPwd, setShowPwd] = useS(false);
  const [remember, setRemember] = useS(true);
  const [focusField, setFocusField] = useS(null);
  const [error, setError] = useS('');
  const [loading, setLoading] = useS(false);
  const [success, setSuccess] = useS(false);

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !pwd) { setError('Por favor, preencha email e senha'); return; }
    if (!/.+@.+\..+/.test(email)) { setError('Digite um email válido'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    if (pwd.length < 4) {
      setLoading(false);
      setError('Email ou senha incorretos');
      return;
    }
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3200);
  };

  return (
    <div className={`login-shell ${tweaks.layout}`} data-screen-label="01 Login">
      {/* ============ BRAND PANEL ============ */}
      <aside className="brand-panel">
        {tweaks.decor === 'ribbons' && <FlowingRibbon color="#fff" opacity={0.16} />}
        {tweaks.decor === 'dots' && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.22) 1px, transparent 0)',
            backgroundSize: '24px 24px', opacity: 0.5
          }} />
        )}

        {/* floating bow */}
        <div className="float-bow" style={{ top: '8%', right: '8%' }}>
          <Bow size={64} color="#fff" heart="#D9342E" />
        </div>
        <div className="float-sparkle" style={{ top: '24%', right: '22%', animationDelay: '0.4s' }}>
          <Sparkle size={20} color="#FFE5C9" />
        </div>
        <div className="float-sparkle" style={{ top: '60%', right: '14%', animationDelay: '1.2s' }}>
          <Sparkle size={12} color="#fff" opacity={0.8} />
        </div>
        <div className="float-sparkle" style={{ top: '70%', left: '8%', animationDelay: '2s' }}>
          <Sparkle size={16} color="#FFE5C9" opacity={0.7} />
        </div>

        {/* HEAD */}
        <div className="brand-head">
          <div className="brand-mark">
            <Bow size={28} color="#fff" heart="#D9342E" stroke={2} />
          </div>
          <div>
            <div className="brand-name">Damari<em>ê</em> <span style={{opacity:0.7,fontSize:14,marginLeft:4}}>presentes</span></div>
            <div className="brand-tag">Boutique de presentes</div>
          </div>
        </div>

        {/* HERO */}
        <div className="brand-hero">
          <span className="eyebrow">
            <span className="dot"></span> Área da equipe · acesso interno
          </span>
          <h1 className="headline">
            Cada presente<br/>
            tem uma <em>história</em>.
          </h1>
          <p className="kicker">
            Entre no painel para acompanhar pedidos, embalagens personalizadas
            e a magia que sai daqui pra fazer alguém sorrir.
          </p>
        </div>

        {/* FOOT */}
        <div className="brand-foot">
          <div className="testimonial">
            <p>"Cada caixinha sai como se fosse pra mim. Isso é o nosso jeito."</p>
            <small>— Damariê · desde 2024</small>
          </div>
          <div className="stats">
            <div className="stat">
              <div className="num">2.4k</div>
              <div className="lbl">presentes<br/>entregues</div>
            </div>
            <div className="stat">
              <div className="num">98<span style={{fontSize:18}}>%</span></div>
              <div className="lbl">clientes<br/>encantados</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ============ FORM PANEL ============ */}
      <main className="form-panel">
        <div className="form-card">
          {success && (
            <div className="success-overlay">
              <Confetti trigger={success} />
              <div className="success-circle">
                <Icon.Check style={{width:36,height:36}} />
              </div>
              <h3 className="success-title">Bem-vinda de volta!</h3>
              <p className="success-sub">Abrindo seu painel…</p>
            </div>
          )}

          <span className="welcome-tag">Olá, que bom te ver <Icon.Heart style={{color:'#D9342E'}}/></span>
          <h2 className="welcome">Entre na sua <em>boutique</em>.</h2>
          <p className="welcome-sub">
            Acesse o painel da Damariê para gerenciar pedidos, estoque e mensagens dos clientes.
          </p>

          <form onSubmit={handle} noValidate>
            {error && (
              <div className="error-msg">
                <span style={{
                  width:16,height:16,borderRadius:'50%',
                  background:'#D9342E', color:'#fff',
                  display:'inline-flex',alignItems:'center',justifyContent:'center',
                  fontSize:11,fontWeight:700,flexShrink:0
                }}>!</span>
                {error}
              </div>
            )}

            <div className="field">
              <label>Email</label>
              <div className={`input-wrap ${focusField==='email'?'focused':''} ${error && !email?'error':''}`}>
                <Icon.Mail />
                <input
                  type="email"
                  placeholder="voce@damarie.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusField('email')}
                  onBlur={() => setFocusField(null)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="field">
              <label>Senha</label>
              <div className={`input-wrap ${focusField==='pwd'?'focused':''} ${error && !pwd?'error':''}`}>
                <Icon.Lock />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  onFocus={() => setFocusField('pwd')}
                  onBlur={() => setFocusField(null)}
                  autoComplete="current-password"
                />
                <button type="button" className="eye-btn" onClick={() => setShowPwd(v => !v)} tabIndex={-1}>
                  {showPwd ? <Icon.EyeOff /> : <Icon.Eye />}
                </button>
              </div>
            </div>

            <div className="row-between">
              <label className={`remember ${remember ? 'on' : ''}`}>
                <span className="box"><Icon.Check /></span>
                <input type="checkbox" checked={remember} onChange={(e)=>setRemember(e.target.checked)} style={{display:'none'}}/>
                Lembrar de mim
              </label>
              <a href="#" className="forgot" onClick={(e)=>e.preventDefault()}>Esqueci minha senha</a>
            </div>

            <button className="submit" type="submit" disabled={loading}>
              {!loading && <span className="shine"></span>}
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Abrindo a boutique…</span>
                </>
              ) : (
                <>
                  <span>Entrar na boutique</span>
                  <Icon.Arrow />
                </>
              )}
            </button>
          </form>

          <div className="footer-meta">
            <span className="secure">
              <Icon.Shield style={{color:'var(--orange-deep)'}} /> Conexão segura · criptografada de ponta a ponta
            </span>
            {tweaks.showBimcare && (
              <span className="bimcare">
                <Icon.Sparkle style={{color:'var(--orange-deep)'}}/> powered by <strong>TheBimCare</strong>
              </span>
            )}
            <span style={{fontSize:11, opacity:0.6, marginTop:4}}>
              © 2026 Damariê Presentes · feito com <Icon.Heart style={{color:'#D9342E',display:'inline',verticalAlign:-2}}/> 
            </span>
          </div>
        </div>
      </main>

      {/* ============ TWEAKS PANEL ============ */}
      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection label="Layout">
            <window.TweakRadio
              label="Estilo"
              value={tweaks.layout}
              onChange={(v) => setTweak('layout', v)}
              options={[
                { value: 'split', label: 'Split' },
                { value: 'centered', label: 'Card' },
              ]}
            />
          </window.TweakSection>
          <window.TweakSection label="Visual">
            <window.TweakSelect
              label="Decoração"
              value={tweaks.decor}
              onChange={(v) => setTweak('decor', v)}
              options={[
                { value: 'ribbons', label: 'Fitas fluindo' },
                { value: 'dots', label: 'Pontilhado' },
                { value: 'minimal', label: 'Minimalista' },
              ]}
            />
            <window.TweakToggle
              label="Selo TheBimCare"
              value={tweaks.showBimcare}
              onChange={(v) => setTweak('showBimcare', v)}
            />
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </div>
  );
}

window.Login = Login;
