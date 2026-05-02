const audio   = document.getElementById('bg-audio');
const muteBtn = document.getElementById('mute-btn');

audio.volume = 0.5;
audio.play().catch(() => {
  const resume = () => { audio.play(); document.removeEventListener('click', resume); };
  document.addEventListener('click', resume);
});

muteBtn.addEventListener('click', e => {
  e.stopPropagation();
  audio.muted = !audio.muted;
  muteBtn.textContent = audio.muted ? '🔇' : '🎵';
  muteBtn.classList.toggle('muted', audio.muted);
});

const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lb-img');
const lbClose  = document.getElementById('lb-close');

function openLightbox(src, alt) {
  lbImg.src = src; lbImg.alt = alt;
  lightbox.classList.add('open');
}
lbClose.addEventListener('click', () => lightbox.classList.remove('open'));
lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.classList.remove('open'); });

document.querySelectorAll('.masonry-item img').forEach(img => {
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', e => { e.stopPropagation(); openLightbox(img.src, img.alt); });
});

function initConfetti(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const colors = ['#f472b6','#fbbf24','#fb7185','#a78bfa','#34d399','#60a5fa'];
  let pieces = [];

  function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
  resize();
  window.addEventListener('resize', resize);

  function spawn() {
    return {
      x: Math.random() * canvas.width, y: -10,
      r: Math.random() * 5 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 1.5 + 0.8,
      drift: (Math.random() - 0.5) * 1.2,
      spin: (Math.random() - 0.5) * 0.1,
      angle: Math.random() * Math.PI * 2,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    };
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (pieces.length < 55) pieces.push(spawn());
    pieces = pieces.filter(p => p.y < canvas.height + 20);
    for (const p of pieces) {
      p.y += p.speed; p.x += p.drift; p.angle += p.spin;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.angle);
      ctx.fillStyle = p.color; ctx.globalAlpha = 0.75;
      if (p.shape === 'rect') ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      else { ctx.beginPath(); ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    requestAnimationFrame(draw);
  }
  draw();
}

initConfetti('confetti');
initConfetti('confetti-end');

const cards   = Array.from(document.querySelectorAll('.card'));
const dotsEl  = document.getElementById('dots');
const zoneL   = document.getElementById('zone-left');
const zoneR   = document.getElementById('zone-right');
let current   = 0;

cards.forEach((_, i) => {
  const d = document.createElement('div');
  d.className = 'dot' + (i === 0 ? ' active' : '');
  dotsEl.appendChild(d);
});
function getDots() { return Array.from(dotsEl.querySelectorAll('.dot')); }

function triggerStagger(card) {
  card.querySelectorAll('.stagger-item').forEach((el, i) => {
    el.classList.remove('anim-rise');
    el.style.animationDelay = '';
    void el.offsetWidth;
    el.style.animationDelay = `${120 + i * 80}ms`;
    setTimeout(() => el.classList.add('anim-rise'), 120 + i * 80);
  });
}

function goTo(index) {
  if (index < 0 || index >= cards.length) return;
  const dir = index > current ? 'left' : 'right';
  cards[current].classList.remove('active');
  current = index;
  const card = cards[current];
  card.classList.add('active');
  card.classList.remove('anim-in-left', 'anim-in-right');
  void card.offsetWidth;
  card.classList.add(dir === 'left' ? 'anim-in-left' : 'anim-in-right');
  triggerStagger(card);
  getDots().forEach((d, i) => d.classList.toggle('active', i === current));
  zoneL.style.display = current === 0 ? 'none' : 'block';
  zoneR.style.display = current === cards.length - 1 ? 'none' : 'block';
}

zoneL.addEventListener('click', () => goTo(current - 1));
zoneR.addEventListener('click', () => goTo(current + 1));

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(current + 1);
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goTo(current - 1);
});

let touchStartX = 0;
let touchStartY = 0;
document.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });
document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
});

const galleryBody = document.getElementById('gallery-body');
const scrollHint  = document.getElementById('scroll-hint');
if (galleryBody && scrollHint) {
  galleryBody.addEventListener('scroll', () => {
    if (galleryBody.scrollTop > 20) scrollHint.classList.add('hidden');
  }, { passive: true });
}

function burstConfetti(x, y) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:500';
  document.body.appendChild(canvas);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const colors = ['#f472b6','#fbbf24','#fb7185','#a78bfa','#34d399','#60a5fa'];
  const pieces = Array.from({length: 60}, () => ({
    x, y,
    vx: (Math.random() - 0.5) * 12,
    vy: (Math.random() - 2.5) * 8,
    r: Math.random() * 5 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.2,
    gravity: 0.3,
    alpha: 1,
  }));
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of pieces) {
      p.vy += p.gravity; p.x += p.vx; p.y += p.vy; p.angle += p.spin; p.alpha -= 0.018;
      if (p.alpha <= 0) continue;
      alive = true;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y); ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      ctx.restore();
    }
    if (alive) requestAnimationFrame(draw);
    else canvas.remove();
  }
  draw();
}

document.querySelectorAll('.present').forEach(present => {
  present.addEventListener('click', e => {
    e.stopPropagation();
    const wasOpen = present.classList.contains('open');
    present.classList.toggle('open');
    if (!wasOpen) {
      const rect = present.getBoundingClientRect();
      burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  });
});

goTo(0);
triggerStagger(cards[0]);

setTimeout(() => {
  if (current === 0) goTo(1);
}, 5000);
