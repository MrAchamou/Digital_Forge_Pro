import * as fs from 'fs';
import * as path from 'path';

const PREVIEW_DIR = path.join(process.cwd(), 'exports', 'effect-previews');

export function ensurePreviewDir() {
  if (!fs.existsSync(PREVIEW_DIR)) {
    fs.mkdirSync(PREVIEW_DIR, { recursive: true });
  }
}

export function buildEffectPreviewHTML(opts: {
  previewId: string;
  code: string;
  description: string;
  concepts: string[];
  modules: string[];
  qualityScore: number;
  platform: string;
}): string {
  const { previewId, code, description, concepts, modules, qualityScore, platform } = opts;

  const safeCode = code
    .replace(/export\s+default\s+\w+\s*;?/g, '')
    .replace(/export\s+(const|let|var|function|class)/g, '$1')
    .replace(/</g, '\\x3c');

  const conceptsJSON = JSON.stringify(concepts);
  const modulesJSON = JSON.stringify(modules);
  const descEscaped = description.replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const scoreColor = qualityScore >= 90 ? '#00ff9d' : qualityScore >= 75 ? '#ffd700' : '#ff6b6b';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>EffectForge — ${descEscaped}</title>
<meta name="description" content="Effect preview: ${descEscaped}"/>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --gold:#ffd700;--cyan:#00e5ff;--plasma:#9c27b0;--green:#00ff9d;
    --bg:#080810;--glass:rgba(255,255,255,0.04);--border:rgba(255,255,255,0.08);
  }
  html,body{width:100%;height:100%;overflow:hidden;background:var(--bg);font-family:'Segoe UI',system-ui,sans-serif;color:#fff}
  canvas#stage{position:fixed;inset:0;z-index:0}

  /* ─── HUD top-left ─── */
  #hud{
    position:fixed;top:24px;left:24px;z-index:10;
    display:flex;flex-direction:column;gap:10px;pointer-events:none;
  }
  #hud-brand{
    font-size:11px;letter-spacing:.18em;text-transform:uppercase;
    color:rgba(255,255,255,.35);font-weight:600;
  }
  #hud-title{
    font-size:22px;font-weight:700;line-height:1.2;max-width:340px;
    background:linear-gradient(135deg,var(--gold),var(--cyan));
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    text-shadow:none;
  }
  #hud-score{
    display:inline-flex;align-items:center;gap:6px;
    font-size:12px;font-weight:600;color:${scoreColor};
    background:rgba(0,0,0,.45);border:1px solid ${scoreColor}40;
    border-radius:20px;padding:4px 12px;width:fit-content;
  }
  #hud-score::before{
    content:'';width:7px;height:7px;border-radius:50%;
    background:${scoreColor};box-shadow:0 0 8px ${scoreColor};
  }
  #hud-tags{display:flex;flex-wrap:wrap;gap:6px;max-width:360px;}
  .tag{
    font-size:10px;font-weight:500;letter-spacing:.06em;
    padding:3px 10px;border-radius:20px;
    background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);
    color:rgba(255,255,255,.65);
  }

  /* ─── Controls bottom-right ─── */
  #controls{
    position:fixed;bottom:28px;right:28px;z-index:10;
    display:flex;flex-direction:column;gap:10px;align-items:flex-end;
  }
  .ctrl-btn{
    display:flex;align-items:center;gap:8px;
    padding:10px 20px;border-radius:40px;border:none;cursor:pointer;
    font-size:13px;font-weight:600;letter-spacing:.05em;
    transition:transform .15s,box-shadow .15s,opacity .15s;
    backdrop-filter:blur(12px);
  }
  .ctrl-btn:hover{transform:scale(1.05);}
  .ctrl-btn:active{transform:scale(.97);}
  #btn-replay{
    background:linear-gradient(135deg,var(--gold),#ff9800);
    color:#000;box-shadow:0 4px 24px rgba(255,215,0,.4);
  }
  #btn-replay:hover{box-shadow:0 6px 32px rgba(255,215,0,.6);}
  #btn-share{
    background:rgba(255,255,255,.08);color:#fff;
    border:1px solid rgba(255,255,255,.15);
    box-shadow:0 4px 16px rgba(0,0,0,.3);
  }
  #btn-share:hover{background:rgba(255,255,255,.14);}
  #toast{
    position:fixed;bottom:100px;right:28px;z-index:20;
    background:var(--green);color:#000;font-weight:700;font-size:13px;
    padding:10px 20px;border-radius:30px;
    box-shadow:0 4px 20px rgba(0,255,157,.5);
    transform:translateY(20px);opacity:0;
    transition:all .3s;pointer-events:none;
  }
  #toast.show{transform:translateY(0);opacity:1;}

  /* ─── Click hint ─── */
  #hint{
    position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
    font-size:12px;color:rgba(255,255,255,.25);letter-spacing:.12em;
    text-transform:uppercase;z-index:5;pointer-events:none;
    animation:pulse 3s ease-in-out infinite;
  }
  @keyframes pulse{0%,100%{opacity:.25}50%{opacity:.5}}

  /* ─── Ripple on click ─── */
  .ripple{
    position:fixed;border-radius:50%;pointer-events:none;z-index:3;
    transform:scale(0);animation:ripple-anim .8s ease-out forwards;
  }
  @keyframes ripple-anim{
    to{transform:scale(6);opacity:0;}
  }

  /* ─── Code panel (toggleable) ─── */
  #code-panel{
    position:fixed;top:0;right:-480px;height:100%;width:460px;z-index:15;
    background:rgba(5,5,15,.95);border-left:1px solid var(--border);
    transition:right .35s cubic-bezier(.4,0,.2,1);
    display:flex;flex-direction:column;overflow:hidden;
    backdrop-filter:blur(20px);
  }
  #code-panel.open{right:0;}
  #code-header{
    padding:16px 20px;border-bottom:1px solid var(--border);
    display:flex;align-items:center;justify-content:space-between;
    flex-shrink:0;
  }
  #code-header span{font-size:13px;font-weight:600;color:var(--cyan);}
  #btn-close-code{
    background:none;border:none;color:rgba(255,255,255,.5);
    cursor:pointer;font-size:20px;line-height:1;padding:4px;
    transition:color .15s;
  }
  #btn-close-code:hover{color:#fff;}
  #code-body{
    flex:1;overflow-y:auto;padding:20px;
    font-family:'Cascadia Code','Fira Code',monospace;
    font-size:11px;line-height:1.6;color:#aaa;
    white-space:pre-wrap;word-break:break-all;
  }
  #code-body::-webkit-scrollbar{width:4px;}
  #code-body::-webkit-scrollbar-track{background:transparent;}
  #code-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:2px;}

  #btn-code{
    background:rgba(0,229,255,.08);color:var(--cyan);
    border:1px solid rgba(0,229,255,.2);
    box-shadow:0 4px 16px rgba(0,229,255,.12);
  }
  #btn-code:hover{background:rgba(0,229,255,.14);}

  /* scan lines overlay */
  #scan{
    position:fixed;inset:0;z-index:1;pointer-events:none;
    background:repeating-linear-gradient(
      to bottom,transparent 0,transparent 3px,rgba(0,0,0,.03) 3px,rgba(0,0,0,.03) 4px
    );
  }
</style>
</head>
<body>

<canvas id="stage"></canvas>
<div id="scan"></div>

<div id="hud">
  <div id="hud-brand">EffectForge AI — Effect Preview</div>
  <div id="hud-title">${descEscaped}</div>
  <div id="hud-score">Quality Score ${qualityScore}%</div>
  <div id="hud-tags"></div>
</div>

<div id="controls">
  <button id="btn-replay" class="ctrl-btn" onclick="replayEffect()">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
    REJOUER
  </button>
  <button id="btn-share" class="ctrl-btn" onclick="shareEffect()">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16c-.79 0-1.5.31-2.03.81L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.06-4.11c.53.5 1.24.81 2.03.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.03 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.03-.81l7.06 4.11c-.05.23-.09.46-.09.7 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z"/></svg>
    PARTAGER
  </button>
  <button id="btn-code" class="ctrl-btn" onclick="toggleCode()">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>
    CODE
  </button>
</div>

<div id="hint">Cliquer pour déclencher l'effet</div>

<div id="toast">✓ Lien copié !</div>

<div id="code-panel">
  <div id="code-header">
    <span>Code Généré — ${platform.toUpperCase()}</span>
    <button id="btn-close-code" onclick="toggleCode()">✕</button>
  </div>
  <div id="code-body"></div>
</div>

<script>
// ─────────────────────────────────────────────
// GENERATED EFFECT CODE
// ─────────────────────────────────────────────
(function() {
try {
${safeCode}
if (typeof AdvancedEffectSystem !== 'undefined') window.__EffectClass = AdvancedEffectSystem;
} catch(e) { console.warn('Effect code load:', e.message); }
})();

// ─────────────────────────────────────────────
// METADATA
// ─────────────────────────────────────────────
const META = {
  id: '${previewId}',
  description: '${descEscaped}',
  concepts: ${conceptsJSON},
  modules: ${modulesJSON},
  qualityScore: ${qualityScore},
  platform: '${platform}'
};

// ─────────────────────────────────────────────
// PARTICLE ENGINE — always-on visual showcase
// ─────────────────────────────────────────────
const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
let W, H, raf, particles = [], bursts = [], t = 0;
let isReplaying = false;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// color palette based on concepts
const PALETTES = {
  fire:   ['#ff4500','#ff6b00','#ffd700','#fff3aa'],
  water:  ['#00b4d8','#0077b6','#90e0ef','#caf0f8'],
  plasma: ['#9c27b0','#e91e63','#00bcd4','#fff'],
  gold:   ['#ffd700','#ffaa00','#ff8c00','#fff9c4'],
  cyber:  ['#00ff9d','#00e5ff','#7c4dff','#fff'],
  default:['#ffd700','#00e5ff','#9c27b0','#ff6b6b'],
};

function pickPalette() {
  const c = META.concepts.join(' ').toLowerCase();
  if (/feu|fire|flamme|explos/i.test(c)) return PALETTES.fire;
  if (/eau|water|liquid|fluid/i.test(c)) return PALETTES.water;
  if (/plasma|neon|glow/i.test(c)) return PALETTES.plasma;
  if (/or|gold|dor/i.test(c)) return PALETTES.gold;
  if (/cyber|tech|matrix/i.test(c)) return PALETTES.cyber;
  return PALETTES.default;
}
const COLORS = pickPalette();

class Particle {
  constructor(x, y, isBurst) {
    this.x = x ?? Math.random() * W;
    this.y = y ?? Math.random() * H;
    this.isBurst = isBurst;
    const speed = isBurst ? (2 + Math.random() * 8) : (.1 + Math.random() * .4);
    const angle = isBurst ? (Math.random() * Math.PI * 2) : (-Math.PI * .5 + (Math.random() - .5) * .8);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.r = isBurst ? (2 + Math.random() * 5) : (.5 + Math.random() * 2);
    this.alpha = 1;
    this.decay = isBurst ? (.008 + Math.random() * .018) : (.002 + Math.random() * .004);
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.life = 1;
    this.trail = isBurst ? [] : null;
  }
  update() {
    if (this.trail) this.trail.push({x: this.x, y: this.y, a: this.alpha});
    if (this.trail && this.trail.length > 12) this.trail.shift();
    this.x += this.vx;
    this.y += this.vy;
    if (!this.isBurst) { this.vy -= .003; }
    else { this.vy += .12; this.vx *= .985; }
    this.alpha -= this.decay;
    this.life = this.alpha;
  }
  draw() {
    if (this.trail && this.trail.length > 1) {
      for (let i = 1; i < this.trail.length; i++) {
        const p = this.trail[i-1], n = this.trail[i];
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(n.x, n.y);
        ctx.strokeStyle = this.color + Math.floor(n.a * 80).toString(16).padStart(2,'0');
        ctx.lineWidth = this.r * .6;
        ctx.stroke();
      }
    }
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.r * 4;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

// ambient floating particles
function spawnAmbient(count) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(Math.random() * W, H + 20, false));
  }
}

// burst on click / replay
function spawnBurst(x, y, count = 80) {
  for (let i = 0; i < count; i++) bursts.push(new Particle(x, y, true));
}

function replayEffect() {
  isReplaying = true;
  spawnBurst(W / 2, H / 2, 150);
  // re-init the generated system if available
  if (window.__EffectClass) {
    try {
      window.__effectInstance = new window.__EffectClass({
        canvas: canvas,
        performanceMode: 'high',
        aiEnhanced: true
      });
    } catch(e) {}
  }
  setTimeout(() => { isReplaying = false; }, 1200);
  rippleAt(W / 2, H / 2);
}

function rippleAt(x, y) {
  const el = document.createElement('div');
  el.className = 'ripple';
  const size = 80;
  el.style.cssText = \`width:\${size}px;height:\${size}px;left:\${x - size/2}px;top:\${y - size/2}px;background:rgba(255,215,0,.25);\`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 850);
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  // deep background
  const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H)*.8);
  bg.addColorStop(0, 'rgba(12,8,24,.98)');
  bg.addColorStop(1, 'rgba(4,4,12,1)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // soft glow centers
  const centers = [[W*.35, H*.4],[W*.65, H*.55]];
  for (const [cx, cy] of centers) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 350);
    g.addColorStop(0, COLORS[0] + '12');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  t++;
  if (t % 4 === 0 && particles.length < 120) spawnAmbient(2);

  particles = particles.filter(p => { p.update(); if (p.alpha > 0) { p.draw(); return true; } return false; });
  bursts    = bursts.filter(p => { p.update(); if (p.alpha > 0) { p.draw(); return true; } return false; });

  raf = requestAnimationFrame(draw);
}

// ─── init tags ───
const tagEl = document.getElementById('hud-tags');
META.concepts.slice(0, 5).forEach(c => {
  const span = document.createElement('span');
  span.className = 'tag';
  span.textContent = c;
  tagEl.appendChild(span);
});
META.modules.slice(0, 3).forEach(m => {
  const span = document.createElement('span');
  span.className = 'tag';
  span.style.borderColor = 'rgba(0,229,255,.2)';
  span.style.color = 'rgba(0,229,255,.65)';
  span.textContent = m;
  tagEl.appendChild(span);
});

// ─── code panel ───
document.getElementById('code-body').textContent = \`${code.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`;

// ─── interactions ───
let hintHidden = false;
document.addEventListener('click', (e) => {
  if (e.target.closest('#controls') || e.target.closest('#code-panel')) return;
  if (!hintHidden) {
    document.getElementById('hint').style.opacity = '0';
    hintHidden = true;
  }
  spawnBurst(e.clientX, e.clientY);
  rippleAt(e.clientX, e.clientY);
});

function shareEffect() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  });
}

function toggleCode() {
  document.getElementById('code-panel').classList.toggle('open');
}

// ─── start ───
spawnAmbient(60);
replayEffect();
draw();
</script>
</body>
</html>`;
}

export async function saveEffectPreview(previewId: string, html: string): Promise<string> {
  ensurePreviewDir();
  const filePath = path.join(PREVIEW_DIR, `${previewId}.html`);
  fs.writeFileSync(filePath, html, 'utf8');
  return filePath;
}

export function getEffectPreviewHTML(previewId: string): string | null {
  const filePath = path.join(PREVIEW_DIR, `${previewId}.html`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8');
}

// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion