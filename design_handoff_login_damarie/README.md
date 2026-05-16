# Handoff: Login Damariê Presentes — Redesign

## Visão Geral

Redesign completo da página de login do painel administrativo da **Damariê Presentes**.
Substitui o visual antigo (gradiente laranja → rosa → roxo com ícone de sparkle genérico) por uma identidade própria, editorial, alinhada à marca de **boutique de presentes**.

A nova tela usa:
- **Split layout** (painel de marca + formulário) como padrão
- Paleta da marca real (laranja terracota + creme + coraçãozinho vermelho do logo)
- Tipografia editorial (DM Serif Display + Manrope + Caveat)
- Microinterações reais (focus, loading com shine, sucesso com confete, erro com shake)
- Decoração sutil em SVG (laço flutuante, fitas fluindo) — **sem** o sparkle genérico

## Sobre os arquivos de design

Os arquivos HTML/JSX deste pacote são **referências de design** — protótipos em HTML puro com React via Babel, que mostram a aparência e o comportamento pretendidos.

**A tarefa NÃO é copiar o HTML diretamente.** A tarefa é **recriar este design no codebase existente da Damariê**, que usa:
- React
- Tailwind CSS
- shadcn/ui (`@/components/ui/button`, `@/components/ui/input`, `@/components/ui/card`)
- lucide-react para ícones
- Supabase Auth (`@/lib/SupabaseAuthContext`)

O arquivo **`Login.jsx`** neste pacote já está pronto para colar no codebase — usa exatamente esses imports.

## Fidelidade

**Alta fidelidade (hifi).** Cores, tipografia, espaçamentos, raios e interações estão finalizados. Implemente pixel-perfect usando o `Login.jsx` deste pacote como referência principal.

---

## Tela: Login

### Propósito
Funcionária da Damariê faz login no painel para gerenciar pedidos, estoque e mensagens.

### Estrutura (Split Layout — 1.15fr / 1fr)

```
┌──────────────────────────────────┬─────────────────────────┐
│  PAINEL DE MARCA (laranja)       │  FORMULÁRIO (creme)     │
│                                  │                         │
│  [logo bow] Damariê presentes    │                         │
│                                  │   "Olá, que bom te ver" │
│                                  │   Entre na sua boutique │
│  • Área da equipe                │                         │
│  Cada presente tem uma           │   ┌─────────────────┐   │
│  história.                       │   │ ✉  email        │   │
│                                  │   └─────────────────┘   │
│  Entre no painel para…           │   ┌─────────────────┐   │
│                                  │   │ 🔒 senha    👁  │   │
│  ┊ "Cada caixinha sai…"          │   └─────────────────┘   │
│                       2.4k  98%  │                         │
│                                  │   [☑] Lembrar  esqueci? │
│  (laço flutuante + fitas SVG)    │   ┌─────────────────┐   │
│                                  │   │ Entrar na boutique│ │
│                                  │   └─────────────────┘   │
│                                  │   🛡 conexão segura     │
│                                  │   ✨ powered by TheBimCare│
└──────────────────────────────────┴─────────────────────────┘
```

Em telas < 960px, o layout vira 1 coluna (painel de marca empilhado em cima do formulário).

---

## Design Tokens

### Cores
| Token            | Hex        | Uso |
|------------------|------------|-----|
| `--orange`       | `#E27339`  | Laranja primário (logo) |
| `--orange-deep`  | `#C85A22`  | Hover / botão / acentos fortes |
| `--orange-soft`  | `#F1A06E`  | Highlights |
| `--terracotta`   | `#A8431A`  | Detalhes profundos |
| `--cream`        | `#FAF3E8`  | Fundo do formulário |
| `--cream-deep`   | `#F2E6D2`  | Fundo da caixa de presente |
| `--ink`          | `#2A1A0F`  | Texto principal |
| `--ink-soft`     | `#5B4538`  | Texto secundário, ícones |
| `--heart`        | `#D9342E`  | Coraçãozinho do logo, erros |
| `--line`         | `rgba(42,26,15,0.12)` | Bordas suaves |

**Gradiente do painel de marca:**
`radial-gradient(120% 100% at 15% 10%, #EE864A 0%, #E27339 35%, #C85A22 80%, #A8431A 100%)`

**Gradiente do botão:**
`linear-gradient(180deg, #E27339 0%, #C85A22 100%)`

### Tipografia
Importar via Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Manrope:wght@300;400;500;600;700&family=Caveat:wght@500;600&display=swap" rel="stylesheet">
```

| Família             | Uso                                          |
|---------------------|----------------------------------------------|
| DM Serif Display    | Headlines, nome da marca, títulos do form    |
| Manrope             | Corpo, inputs, labels                        |
| Caveat              | "Olá, que bom te ver" (toque manuscrito)     |

Adicionar ao `tailwind.config.js`:
```js
theme: {
  extend: {
    fontFamily: {
      serif: ['"DM Serif Display"', 'serif'],
      sans: ['Manrope', 'system-ui', 'sans-serif'],
      script: ['Caveat', 'cursive'],
    }
  }
}
```

### Espaçamento, raios e sombras
- Card raio: **14px** (inputs e botão), **24px** (card centralizado)
- Botão altura: **58px**
- Input altura: **56px**
- Padding painel de marca: **56px 64px**
- Padding formulário: **48px**
- Sombra botão: `0 12px 28px -10px rgba(168,67,26,0.55)`
- Sombra card centralizado: `0 30px 80px -20px rgba(42,26,15,0.35)`

---

## Componentes

### Painel de Marca (left)

- **Background**: gradiente radial laranja → terracota
- **Logo header**: `<Bow />` SVG dentro de quadrado branco translúcido (48×48, raio 14, `backdrop-blur`)
- **Eyebrow**: pill com bullet branco e label uppercase "Área da equipe · acesso interno"
- **Headline**: serifa, 44-76px responsiva (`clamp(44px, 5.2vw, 76px)`), com "história" em itálico cor `#FFE5C9`
- **Kicker**: Manrope 17px, opacity 0.92, max-width 460px
- **Testimonial**: serif itálica, border-left branca, label uppercase pequeno
- **Stats**: 2.4k presentes entregues / 98% clientes encantados — números em serif 32px
- **Decorações**:
  - `<FlowingRibbon />` SVG fitas brancas com `mix-blend-mode: screen`, opacity 0.16
  - `<Bow />` flutuante no canto superior direito com animação `floatY` (6s ease-in-out infinite)
  - 3x `<Sparkle />` com `twinkle` (2.6s)

### Formulário (right)

- **Background**: `#FAF3E8` com padrão de pontilhado sutil `radial-gradient(circle at 1px 1px, rgba(168,67,26,0.08) 1px, transparent 0)` 22px tile
- **Welcome tag**: fonte Caveat 24px, cor `--orange-deep`, rotacionada -2deg, com traço horizontal antes
- **H2**: "Entre na sua *boutique*" — DM Serif 44px, "boutique" em itálico cor `--orange-deep`
- **Sub**: Manrope 14.5px, `--ink-soft`

#### Input
```
height: 56px
border: 1px solid var(--line)
border-radius: 14px
background: #fff
padding: 0 14px
hover: border-color rgba(168,67,26,0.32)
focus: border-color var(--orange-deep) + box-shadow 0 0 0 4px rgba(226,115,57,0.12)
error: border-color var(--heart) + box-shadow vermelho suave
```
- Ícone à esquerda (Mail/Lock, 18px, cor `--ink-soft`)
- Botão olho à direita (apenas senha)

#### Checkbox "Lembrar de mim"
- Caixinha 18×18 com `--orange-deep` quando ativa
- Check em branco
- Texto "Lembrar de mim" 13px `--ink-soft`

#### Link "Esqueci minha senha"
- 13px `--orange-deep`, **font-weight 600**, **border-bottom dotted**

#### Botão Submit
- 58px altura, raio 14px
- Gradiente vertical laranja → terracota
- Texto "Entrar na boutique" + ícone seta
- **Shine animation**: faixa branca translúcida deslizando da esquerda pra direita a cada 2.4s
- **Hover**: `translateY(-1px)` + sombra mais forte
- **Loading**: spinner branco + texto "Abrindo a boutique…"

#### Footer
- 🛡 "Conexão segura · criptografada de ponta a ponta" (11.5px)
- Pill "powered by **TheBimCare**" (10.5px uppercase letter-spacing 1.4px)
- "© 2026 Damariê Presentes · feito com 🩷 "

---

## Interações e comportamento

### Estados
| Estado    | Disparo                                  | Visual                                       |
|-----------|------------------------------------------|----------------------------------------------|
| idle      | Inicial                                  | Botão laranja com shine                      |
| focus     | Click no input                           | Border laranja + ring 4px opacity 12%        |
| invalid   | Submit com email/senha vazios            | Mensagem vermelha + shake 0.35s + border vermelha |
| loading   | Submit válido                            | Botão disabled + spinner + "Abrindo a boutique…" |
| error     | Credenciais erradas                      | Mensagem "Email ou senha incorretos"         |
| success   | Login OK                                 | Overlay creme + checkmark pop + confete 1.6s |

### Validação
1. Campos obrigatórios → "Por favor, preencha email e senha"
2. Regex email simples (`/.+@.+\..+/`) → "Digite um email válido"
3. Senha < 4 chars → "Email ou senha incorretos" (no protótipo; em produção, Supabase decide)

### Animações
- **floatY** — laço flutuante: `translateY(0 ↔ -14px) + rotate(-6deg ↔ -2deg)` em 6s ease-in-out infinite
- **twinkle** — sparkles: scale 0.9 → 1.15 + opacity 0.35 → 1 em 2.6s
- **shine** — botão: faixa branca deslizando da esquerda à direita em 2.4s
- **shake** — erro: ±4px horizontal em 0.35s
- **pop** — sucesso: scale 0 → 1.08 → 1 com cubic-bezier(.34,1.56,.64,1) em 0.5s
- **confetti-fall** — 26 retângulos coloridos caindo + rotacionando 360° em 1.6s

---

## State management (React)

```js
const [email, setEmail] = useState('');
const [pwd, setPwd] = useState('');
const [showPwd, setShowPwd] = useState(false);
const [remember, setRemember] = useState(true);
const [focusField, setFocusField] = useState(null);
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
const [success, setSuccess] = useState(false);
```

A integração real com Supabase (`useAuth().signIn`) já está cabeada no `Login.jsx` deste pacote — basta colar.

---

## Assets

- **Logo**: `damarie-logo.jpeg` (incluído neste pacote) — usar em outras telas, mas o login usa o SVG `<Bow />` inline, não a JPG
- **Ícones**: lucide-react (`Mail`, `Lock`, `Eye`, `EyeOff`, `Check`, `Heart`, `Shield`, `Sparkles`, `ArrowRight`)
- **SVGs decorativos**: inline no `Login.jsx` (Bow, FlowingRibbon, Sparkle)

---

## Arquivos neste pacote

| Arquivo | Propósito |
|---|---|
| `README.md` | Este documento |
| `Login.jsx` | **Componente pronto pra colar** — React + Tailwind + shadcn/ui + lucide + Supabase Auth |
| `reference/index.html` | Protótipo HTML original (referência visual) |
| `reference/login.jsx` | Componente React do protótipo (Babel) |
| `reference/login-styles.jsx` | CSS injetado do protótipo |
| `reference/ribbons.jsx` | SVGs decorativos do protótipo |
| `damarie-logo.jpeg` | Logo original da Damariê |

---

## Passos para implementação

1. Garantir que `DM Serif Display`, `Manrope` e `Caveat` estão carregadas (Google Fonts no `index.html` ou via `@fontsource`)
2. Estender `tailwind.config.js` com as cores e fontes (ver seção Tokens acima)
3. Substituir o arquivo `src/pages/Login.jsx` (ou onde estiver) pelo `Login.jsx` deste pacote
4. Confirmar que os imports `@/components/ui/button`, `@/components/ui/input` existem (são shadcn padrão)
5. Conferir que `useAuth().signIn(email, password)` retorna uma Promise — está sendo aguardada no `handleSubmit`
6. Testar fluxos: email vazio, email inválido, credenciais erradas, login bem-sucedido
