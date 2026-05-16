// Inline style sheet for login — kept separate to keep login.jsx light
const LOGIN_CSS = `
.login-shell {
  position: relative;
  width: 100%;
  height: 100vh;
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  overflow: hidden;
  background: var(--cream);
}
.login-shell.centered { grid-template-columns: 1fr; }

/* ===== BRAND PANEL ===== */
.brand-panel {
  position: relative;
  overflow: hidden;
  background: radial-gradient(120% 100% at 15% 10%, #EE864A 0%, #E27339 35%, #C85A22 80%, #A8431A 100%);
  color: #fff;
  padding: 56px 64px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.brand-panel::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(circle at 80% 90%, rgba(255,255,255,0.16), transparent 40%),
              radial-gradient(circle at 20% 80%, rgba(0,0,0,0.18), transparent 50%);
  pointer-events: none;
}
.flowing-ribbon {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  mix-blend-mode: screen;
}
.brand-head {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 14px;
}
.brand-mark {
  display: flex; align-items: center; justify-content: center;
  width: 48px; height: 48px;
  border-radius: 14px;
  background: rgba(255,255,255,0.14);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.28);
}
.brand-name {
  font-family: 'DM Serif Display', serif;
  font-size: 22px;
  letter-spacing: 0.5px;
  line-height: 1;
}
.brand-name em { font-style: italic; font-weight: 400; }
.brand-tag {
  font-size: 11px;
  letter-spacing: 2.4px;
  text-transform: uppercase;
  opacity: 0.78;
  margin-top: 4px;
}

.brand-hero {
  position: relative; z-index: 2;
  max-width: 560px;
}
.eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 6px 14px 6px 8px;
  border-radius: 999px;
  background: rgba(255,255,255,0.14);
  border: 1px solid rgba(255,255,255,0.24);
  font-size: 12px;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  font-weight: 500;
}
.eyebrow .dot { width: 6px; height: 6px; border-radius: 50%; background: #fff; }
.headline {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(44px, 5.2vw, 76px);
  line-height: 0.98;
  letter-spacing: -0.01em;
  margin: 28px 0 24px;
  text-wrap: balance;
}
.headline em { font-style: italic; color: #FFE5C9; }
.kicker {
  font-size: 17px;
  line-height: 1.6;
  max-width: 460px;
  opacity: 0.92;
  font-weight: 300;
}

.brand-foot {
  position: relative; z-index: 2;
  display: flex; justify-content: space-between; align-items: flex-end;
  gap: 24px;
}
.testimonial {
  max-width: 340px;
  border-left: 2px solid rgba(255,255,255,0.4);
  padding-left: 16px;
}
.testimonial p {
  font-family: 'DM Serif Display', serif;
  font-style: italic;
  font-size: 18px;
  line-height: 1.45;
  margin: 0 0 10px;
}
.testimonial small {
  font-size: 11px;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  opacity: 0.75;
}
.stats {
  display: flex; gap: 28px;
  text-align: right;
}
.stat .num {
  font-family: 'DM Serif Display', serif;
  font-size: 32px;
  line-height: 1;
}
.stat .lbl {
  font-size: 10.5px;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  opacity: 0.78;
  margin-top: 4px;
}

/* floating bow accent */
.float-bow {
  position: absolute;
  z-index: 1;
  filter: drop-shadow(0 12px 24px rgba(0,0,0,0.18));
  animation: floatY 6s ease-in-out infinite;
}
@keyframes floatY {
  0%, 100% { transform: translateY(0) rotate(-6deg); }
  50% { transform: translateY(-14px) rotate(-2deg); }
}
.float-sparkle {
  position: absolute; z-index: 1;
  animation: twinkle 2.6s ease-in-out infinite;
}
@keyframes twinkle {
  0%, 100% { opacity: 0.35; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.15); }
}

/* ===== FORM PANEL ===== */
.form-panel {
  position: relative;
  background: var(--cream);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}
.form-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 1px 1px, rgba(168,67,26,0.08) 1px, transparent 0);
  background-size: 22px 22px;
  pointer-events: none;
  opacity: 0.6;
}
.form-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  z-index: 2;
}
.welcome-tag {
  font-family: 'Caveat', cursive;
  font-size: 24px;
  color: var(--orange-deep);
  display: inline-flex; align-items: center; gap: 8px;
  margin-bottom: 10px;
  transform: rotate(-2deg);
}
.welcome-tag::before {
  content: '';
  display: inline-block;
  width: 28px; height: 1px;
  background: var(--orange-deep);
}
h2.welcome {
  font-family: 'DM Serif Display', serif;
  font-size: 44px;
  line-height: 1.05;
  margin: 0 0 12px;
  color: var(--ink);
  letter-spacing: -0.01em;
}
h2.welcome em {
  font-style: italic;
  color: var(--orange-deep);
}
p.welcome-sub {
  font-size: 14.5px;
  color: var(--ink-soft);
  margin: 0 0 36px;
  line-height: 1.55;
}

.field { margin-bottom: 22px; position: relative; }
.field label {
  display: block;
  font-size: 11px;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: var(--ink-soft);
  margin-bottom: 10px;
  font-weight: 600;
}
.input-wrap {
  position: relative;
  display: flex; align-items: center;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 0 14px 0 14px;
  height: 56px;
  transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease;
}
.input-wrap:hover { border-color: rgba(168,67,26,0.32); }
.input-wrap.focused {
  border-color: var(--orange-deep);
  box-shadow: 0 0 0 4px rgba(226,115,57,0.12);
}
.input-wrap.error { border-color: var(--heart); box-shadow: 0 0 0 4px rgba(217,52,46,0.10); }
.input-wrap svg { color: var(--ink-soft); flex-shrink: 0; }
.input-wrap input {
  border: 0; outline: 0; background: transparent;
  width: 100%;
  font-size: 15px;
  color: var(--ink);
  padding: 0 12px;
  letter-spacing: 0.2px;
}
.input-wrap input::placeholder { color: rgba(91,69,56,0.45); }
.eye-btn {
  border: 0; background: transparent; padding: 6px;
  display: flex; align-items: center; justify-content: center;
  color: var(--ink-soft);
  border-radius: 8px;
}
.eye-btn:hover { color: var(--orange-deep); background: rgba(226,115,57,0.08); }

.row-between {
  display: flex; justify-content: space-between; align-items: center;
  margin: -6px 0 28px;
}
.remember {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 13px; color: var(--ink-soft);
  cursor: pointer; user-select: none;
}
.remember .box {
  width: 18px; height: 18px;
  border-radius: 5px;
  border: 1.5px solid var(--line);
  display: flex; align-items: center; justify-content: center;
  background: #fff;
  transition: all .18s;
}
.remember.on .box { background: var(--orange-deep); border-color: var(--orange-deep); }
.remember.on .box svg { color: #fff; }
.remember .box svg { width: 12px; height: 12px; color: transparent; }
.forgot {
  font-size: 13px; color: var(--orange-deep);
  text-decoration: none; font-weight: 600;
  border-bottom: 1px dotted rgba(168,67,26,0.4);
}
.forgot:hover { color: var(--terracotta); border-bottom-color: var(--terracotta); }

.submit {
  width: 100%; height: 58px;
  border: 0; border-radius: 14px;
  background: linear-gradient(180deg, #E27339 0%, #C85A22 100%);
  color: #fff;
  font-size: 15px; font-weight: 600;
  letter-spacing: 0.4px;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  box-shadow: 0 12px 28px -10px rgba(168,67,26,0.55), inset 0 1px 0 rgba(255,255,255,0.25);
  position: relative; overflow: hidden;
  transition: transform .12s ease, box-shadow .18s ease;
}
.submit:hover { transform: translateY(-1px); box-shadow: 0 16px 32px -10px rgba(168,67,26,0.6); }
.submit:active { transform: translateY(0); }
.submit:disabled { opacity: 0.85; cursor: progress; }
.submit .shine {
  position: absolute; top: 0; left: -30%;
  width: 30%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent);
  animation: shine 2.4s ease-in-out infinite;
}
@keyframes shine {
  0% { left: -30%; } 60%, 100% { left: 130%; }
}
.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.error-msg {
  background: rgba(217,52,46,0.08);
  border: 1px solid rgba(217,52,46,0.25);
  color: #9A1F1B;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 13px;
  margin-bottom: 18px;
  display: flex; align-items: center; gap: 8px;
  animation: shake .35s ease;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.divider {
  display: flex; align-items: center; gap: 12px;
  margin: 32px 0 20px;
  color: var(--ink-soft);
  font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
}
.divider::before, .divider::after {
  content: ''; flex: 1; height: 1px; background: var(--line);
}

.footer-meta {
  margin-top: 28px;
  display: flex; flex-direction: column; gap: 10px;
  align-items: center;
  font-size: 11.5px;
  color: var(--ink-soft);
}
.secure {
  display: inline-flex; align-items: center; gap: 6px;
  letter-spacing: 0.5px;
}
.bimcare {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 10px;
  background: rgba(42,26,15,0.04);
  border: 1px solid var(--line);
  border-radius: 999px;
  font-size: 10.5px;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.bimcare strong { color: var(--ink); font-weight: 600; }

/* success overlay */
.success-overlay {
  position: absolute; inset: 0;
  background: rgba(250, 243, 232, 0.96);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  z-index: 10;
  animation: fadeIn .3s ease;
}
.success-circle {
  width: 88px; height: 88px; border-radius: 50%;
  background: linear-gradient(180deg, #E27339, #C85A22);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 22px;
  animation: pop .5s cubic-bezier(.34,1.56,.64,1);
  box-shadow: 0 14px 32px -8px rgba(168,67,26,0.55);
}
.success-circle svg { color: #fff; }
.success-title {
  font-family: 'DM Serif Display', serif;
  font-size: 30px;
  color: var(--ink);
  margin: 0 0 6px;
}
.success-sub { font-size: 14px; color: var(--ink-soft); }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes pop { 0% { transform: scale(0); } 70% { transform: scale(1.08); } 100% { transform: scale(1); } }

/* confetti dots */
.confetti {
  position: absolute;
  width: 8px; height: 12px;
  animation: confetti-fall 1.6s ease-out forwards;
  border-radius: 2px;
}
@keyframes confetti-fall {
  0% { transform: translateY(-40px) rotate(0); opacity: 1; }
  100% { transform: translateY(140px) rotate(360deg); opacity: 0; }
}

/* centered layout variant */
.centered .brand-panel {
  position: absolute; inset: 0;
  padding: 0;
}
.centered .brand-panel > .brand-head,
.centered .brand-panel > .brand-hero,
.centered .brand-panel > .brand-foot { display: none; }
.centered .form-panel {
  position: relative;
  background: transparent;
}
.centered .form-card {
  background: rgba(255,255,255,0.96);
  backdrop-filter: blur(12px);
  padding: 48px 44px;
  border-radius: 24px;
  box-shadow: 0 30px 80px -20px rgba(42,26,15,0.35);
}
.centered .form-panel::before { display: none; }

@media (max-width: 960px) {
  .login-shell { grid-template-columns: 1fr; }
  .brand-panel { padding: 40px 32px; min-height: 360px; }
  .headline { font-size: 44px; }
  .brand-foot .stats { display: none; }
  .form-panel { padding: 40px 24px; }
}
`;

(function injectCss() {
  if (document.getElementById('__login_css')) return;
  const tag = document.createElement('style');
  tag.id = '__login_css';
  tag.textContent = LOGIN_CSS;
  document.head.appendChild(tag);
})();
