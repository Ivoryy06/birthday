"use strict";
// ── Audio ────────────────────────────────────────────────────────────────────
const audio = document.getElementById('bg-audio');
const muteBtn = document.getElementById('mute-btn');
const splash = document.getElementById('splash');
audio.volume = 0.5;
splash.addEventListener('click', () => {
    audio.play();
    splash.style.opacity = '0';
    splash.style.pointerEvents = 'none';
    setTimeout(() => splash.remove(), 600);
}, { once: true });
muteBtn.addEventListener('click', e => {
    e.stopPropagation();
    audio.muted = !audio.muted;
    muteBtn.textContent = audio.muted ? '🔇' : '🎵';
    muteBtn.classList.toggle('muted', audio.muted);
});
// ── Lightbox ─────────────────────────────────────────────────────────────────
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
const lbClose = document.getElementById('lb-close');
function openLightbox(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt;
    lightbox.classList.add('open');
}
lbClose.addEventListener('click', () => lightbox.classList.remove('open'));
lightbox.addEventListener('click', e => { if (e.target === lightbox)
    lightbox.classList.remove('open'); });
document.querySelectorAll('.masonry-item img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', e => { e.stopPropagation(); openLightbox(img.src, img.alt); });
});
// ── Ambient confetti ──────────────────────────────────────────────────────────
function initConfetti(canvasId) {
    const canvasEl = document.getElementById(canvasId);
    if (!canvasEl)
        return;
    const canvas = canvasEl;
    const ctx = canvas.getContext('2d');
    const colors = ['#f472b6', '#fbbf24', '#fb7185', '#a78bfa', '#34d399', '#60a5fa'];
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
        if (pieces.length < 55)
            pieces.push(spawn());
        pieces = pieces.filter(p => p.y < canvas.height + 20);
        for (const p of pieces) {
            p.y += p.speed;
            p.x += p.drift;
            p.angle += p.spin;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = 0.75;
            if (p.shape === 'rect')
                ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
            else {
                ctx.beginPath();
                ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
        requestAnimationFrame(draw);
    }
    draw();
}
initConfetti('confetti');
// ── Burst confetti (typed) ────────────────────────────────────────────────────
function burstConfetti(config) {
    const { x, y, count = 60, colors = ['#f472b6', '#fbbf24', '#fb7185', '#a78bfa', '#34d399', '#60a5fa'], spread = 12, gravity = 0.3, } = config;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:500';
    document.body.appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const pieces = Array.from({ length: count }, () => ({
        x, y,
        vx: (Math.random() - 0.5) * spread,
        vy: (Math.random() - 2.5) * 8,
        r: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.2,
        gravity,
        alpha: 1,
    }));
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        for (const p of pieces) {
            p.vy += p.gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.angle += p.spin;
            p.alpha -= 0.018;
            if (p.alpha <= 0)
                continue;
            alive = true;
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
            ctx.restore();
        }
        if (alive)
            requestAnimationFrame(draw);
        else
            canvas.remove();
    }
    draw();
}
// ── Trivia ────────────────────────────────────────────────────────────────────
let triviaUnlocked = false;
document.querySelectorAll('.trivia-btn').forEach(btn => {
    btn.addEventListener('click', e => {
        e.stopPropagation();
        const val = parseInt(btn.dataset.val);
        if (val === 10) {
            triviaUnlocked = true;
            goTo(cards.indexOf(document.getElementById('card-10')));
        } else {
            document.getElementById('trivia-msg').textContent = 'Itu ga rispek wok 😡';
        }
    });
});

// ── Card navigation ───────────────────────────────────────────────────────────
const cards = Array.from(document.querySelectorAll('.card'));
const dotsEl = document.getElementById('dots');
const zoneL = document.getElementById('zone-left');
const zoneR = document.getElementById('zone-right');
let current = 0;
let isAnimating = false;
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
// GSAP cover-card entrance: cake bounces → text rises → confetti bursts
function playCoverEntrance() {
    const cake = document.querySelector('#card-1 .cake-emoji');
    const title = document.querySelector('#card-1 .cover-title');
    const name = document.querySelector('#card-1 .cover-name');
    const sub = document.querySelector('#card-1 .cover-sub');
    const hint = document.querySelector('#card-1 .tap-hint');
    const ribbon = document.querySelector('#card-1 .ribbon');
    gsap.set([title, name, sub, hint, ribbon, cake], { opacity: 0, y: 20 });
    gsap.timeline()
        .to(ribbon, { opacity: 0.8, y: 0, duration: 0.4, ease: 'power2.out' })
        .to(title, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.1')
        .to(name, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2')
        .to(cake, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }, '-=0.1')
        .to(cake, { y: -14, duration: 0.35, ease: 'power1.inOut', yoyo: true, repeat: 1 })
        .to(sub, { opacity: 0.5, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2')
        .to(hint, { opacity: 0.3, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.1')
        .call(() => {
        burstConfetti({ x: window.innerWidth / 2, y: window.innerHeight * 0.4 });
    });
}
function goTo(index) {
    if (isAnimating || index < 0 || index >= cards.length)
        return;
    const triviaIndex = cards.indexOf(document.getElementById('card-trivia'));
    if (index > triviaIndex && !triviaUnlocked)
        return;
    isAnimating = true;
    const dir = index > current ? 'left' : 'right';
    cards[current].classList.remove('active');
    current = index;
    const card = cards[current];
    card.classList.add('active');
    card.classList.remove('anim-in-left', 'anim-in-right');
    void card.offsetWidth;
    const animClass = dir === 'left' ? 'anim-in-left' : 'anim-in-right';
    card.classList.add(animClass);
    card.addEventListener('animationend', () => { isAnimating = false; }, { once: true });
    if (card.id === 'card-10' && !card.dataset.confettiInit) {
        card.dataset.confettiInit = '1';
        requestAnimationFrame(() => initConfetti('confetti-end'));
    }
    triggerStagger(card);
    getDots().forEach((d, i) => d.classList.toggle('active', i === current));
    zoneL.style.display = current === 0 ? 'none' : 'block';
    zoneR.style.display = current === cards.length - 1 ? 'none' : 'block';
}
zoneL.addEventListener('click', () => goTo(current - 1));
zoneR.addEventListener('click', () => goTo(current + 1));
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown')
        goTo(current + 1);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
        goTo(current - 1);
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
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40)
        goTo(dx < 0 ? current + 1 : current - 1);
});
// ── Gallery scroll hint ───────────────────────────────────────────────────────
const galleryBody = document.getElementById('gallery-body');
const scrollHint = document.getElementById('scroll-hint');
if (galleryBody && scrollHint) {
    galleryBody.addEventListener('scroll', () => {
        if (galleryBody.scrollTop > 20)
            scrollHint.classList.add('hidden');
    }, { passive: true });
}
// ── Presents ──────────────────────────────────────────────────────────────────
document.querySelectorAll('.present').forEach(present => {
    present.addEventListener('click', e => {
        var _a, _b;
        e.stopPropagation();
        const wasOpen = present.classList.contains('open');
        present.classList.toggle('open');
        if (!wasOpen) {
            const rect = present.getBoundingClientRect();
            burstConfetti({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
            (_b = (_a = window.navigator).vibrate) === null || _b === void 0 ? void 0 : _b.call(_a, 50);
        }
    });
});
// ── Init ──────────────────────────────────────────────────────────────────────
goTo(0);
playCoverEntrance();
