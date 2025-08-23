/* script.js
   Handles:
   - Theme toggle (dark/light)
   - FX (particles) toggle
   - Mobile drawer toggle
   - Smooth scrolling & active nav links
   - Typewriter & reveal animations
   - Animated counters
   - Simple particle background
*/

/* ====== helpers ====== */
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

/* ====== initial UI elements ====== */
const html = document.documentElement;
const themeToggle = $('#themeToggle');
const fxToggle = $('#fxToggle');
const menuToggle = $('#menuToggle');
const drawer = $('#drawer');
const particlesCanvas = $('#particles');

/* Set current year */
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ====== Theme toggle ====== */
function getStoredTheme(){
  try { return localStorage.getItem('site-theme'); } catch(e) { return null; }
}
function setTheme(name){
  html.setAttribute('data-theme', name);
  try { localStorage.setItem('site-theme', name); } catch(e){}
}
const storedTheme = getStoredTheme();
if (storedTheme) setTheme(storedTheme);
else setTheme('dark');

themeToggle?.addEventListener('click', ()=>{
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  setTheme(next);
  themeToggle.animate([{transform:'rotate(0)'},{transform:'rotate(360deg)'}], {duration:420, easing:'cubic-bezier(.2,.9,.3,1)'});
});

/* ====== FX toggle (particles) ====== */
function setFx(enabled){
  html.setAttribute('data-fx', enabled ? 'particles' : 'none');
  if(enabled) startParticles();
  else stopParticles();
  try { localStorage.setItem('site-fx', enabled ? '1' : '0'); } catch(e){}
}
const storedFx = (function(){ try { return localStorage.getItem('site-fx'); } catch(e){ return null; }})();
setFx(storedFx !== '0'); // default enabled
fxToggle?.addEventListener('click', ()=>{
  const enabled = html.getAttribute('data-fx') !== 'particles';
  setFx(enabled);
});

/* ====== Mobile drawer ====== */
menuToggle?.addEventListener('click', ()=>{
  const isOpen = drawer.getAttribute('aria-hidden') === 'false';
  drawer.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
});

/* Close drawer when clicking an anchor */
drawer && drawer.addEventListener('click', (e)=>{
  if(e.target.tagName === 'A') drawer.setAttribute('aria-hidden','true');
});

/* ====== Smooth scroll & active nav link ====== */
const navLinks = $$('.nav__links a');
const sections = navLinks.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);

function onScrollActive(){
  const y = window.scrollY + Math.min(window.innerHeight * 0.35, 200);
  let current = null;
  for(const s of sections){
    if(s.offsetTop <= y) current = s;
  }
  navLinks.forEach(a => a.classList.toggle('active', current && a.getAttribute('href').slice(1) === current.id));
}
window.addEventListener('scroll', onScrollActive, {passive:true});
onScrollActive();

/* smooth anchors */
$$('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', (ev)=>{
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if(el){
      ev.preventDefault();
      el.scrollIntoView({behavior:'smooth', block:'start'});
      // update active state after small delay
      setTimeout(onScrollActive, 500);
    }
  });
});

/* ====== Reveal on scroll (fade) ====== */
const revealEls = $$('.fade.reveal');
const revealObs = new IntersectionObserver(entries=>{
  for(const e of entries){
    if(e.isIntersecting){
      e.target.classList.add('show');
      revealObs.unobserve(e.target);
    }
  }
},{threshold:0.18});
revealEls.forEach(el => revealObs.observe(el));

/* ====== Typewriter effect for .typewriter (rotating text simplified) ====== */
(function typewriter(){
  const el = $('.typewriter');
  if(!el) return;
  const texts = ['🎮 Gamer', '🎥 Creator', '🚀 Leader', '🌍 Dreamer'];
  let i = 0, char = 0, direction = 1;
  function tick(){
    const current = texts[i];
    el.textContent = current.slice(0, char);
    if(direction === 1){
      if(char < current.length) char++;
      else { direction = -1; setTimeout(tick, 900); return; }
    } else {
      if(char > 0) char--;
      else { direction = 1; i = (i+1)%texts.length; }
    }
    setTimeout(tick, direction === 1 ? 70 : 30);
  }
  tick();
})();

/* ====== Animated counters ====== */
const counters = $$('.num');
const counterObs = new IntersectionObserver(entries=>{
  for(const en of entries){
    if(en.isIntersecting){
      const el = en.target;
      const target = parseInt(el.getAttribute('data-target') || el.textContent.replace(/,/g,''), 10) || 0;
      animateNumber(el, target, 1400);
      counterObs.unobserve(el);
    }
  }
},{threshold:0.4});

function animateNumber(el, target, duration=1200){
  const start = 0;
  const startTime = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - startTime) / duration);
    const eased = easeOutCubic(t);
    const value = Math.floor(start + (target - start) * eased);
    el.textContent = value.toLocaleString();
    if(t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }
counters.forEach(c => counterObs.observe(c));

/* ====== Simple particle background ====== */
let particlesActive = false;
let particles = [];
let pCtx, pW, pH, pRAF;

function makeParticlesContext(){
  if(!particlesCanvas) return null;
  pCtx = particlesCanvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas(){
  if(!particlesCanvas) return;
  pW = particlesCanvas.width = window.innerWidth;
  pH = particlesCanvas.height = window.innerHeight;
}

/* create particle objects */
function seedParticles(count=60){
  particles = [];
  for(let i=0;i<count;i++){
    particles.push({
      x: Math.random()*pW,
      y: Math.random()*pH,
      vx: (Math.random()-0.5)*0.6,
      vy: (Math.random()-0.5)*0.6,
      r: 0.6 + Math.random()*2.4,
      hue: 220 + Math.random()*120
    });
  }
}

/* draw loop */
function drawParticles(){
  if(!particlesCanvas || !pCtx) return;
  pCtx.clearRect(0,0,pW,pH);
  // slight trail
  pCtx.fillStyle = 'rgba(4,6,10,0.06)';
  pCtx.fillRect(0,0,pW,pH);

  for(let i=0;i<particles.length;i++){
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    if(p.x < -10) p.x = pW + 10;
    if(p.x > pW + 10) p.x = -10;
    if(p.y < -10) p.y = pH + 10;
    if(p.y > pH + 10) p.y = -10;

    pCtx.beginPath();
    const g = pCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*6);
    g.addColorStop(0, `hsla(${p.hue}, 90%, 65%, 0.12)`);
    g.addColorStop(0.6, `hsla(${p.hue+40}, 90%, 60%, 0.06)`);
    g.addColorStop(1, 'transparent');
    pCtx.fillStyle = g;
    pCtx.fillRect(p.x - p.r*6, p.y - p.r*6, p.r*12, p.r*12);
  }

  // connect near particles
  for(let i=0;i<particles.length;i++){
    for(let j=i+1;j<particles.length;j++){
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d = Math.sqrt(dx*dx + dy*dy);
      if(d < 120){
        pCtx.beginPath();
        const alpha = 0.08 * (1 - d/120);
        pCtx.strokeStyle = `rgba(124,92,255, ${alpha})`;
        pCtx.lineWidth = 0.8;
        pCtx.moveTo(a.x, a.y);
        pCtx.lineTo(b.x, b.y);
        pCtx.stroke();
      }
    }
  }

  pRAF = requestAnimationFrame(drawParticles);
}

function startParticles(){
  if(particlesActive) return;
  particlesActive = true;
  if(!pCtx) makeParticlesContext();
  seedParticles(Math.max(40, Math.floor(window.innerWidth / 30)));
  pRAF = requestAnimationFrame(drawParticles);
  particlesCanvas.style.display = 'block';
}
function stopParticles(){
  particlesActive = false;
  if(pRAF) cancelAnimationFrame(pRAF);
  if(pCtx) pCtx.clearRect(0,0,pW,pH);
  if(particlesCanvas) particlesCanvas.style.display = 'none';
}

/* Initialize particles context whether visible or not */
makeParticlesContext();

/* start if enabled */
if(html.getAttribute('data-fx') === 'particles') startParticles();

/* pause particles when tab hidden for perf */
document.addEventListener('visibilitychange', ()=>{
  if(document.hidden) { if(particlesActive && pRAF) cancelAnimationFrame(pRAF); }
  else if(html.getAttribute('data-fx') === 'particles') drawParticles();
});

/* ====== small accessibility: close drawer on escape ====== */
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape'){
    if(drawer) drawer.setAttribute('aria-hidden','true');
  }
});

/* ====== small nav shrink on scroll ====== */
let lastScroll = 0;
window.addEventListener('scroll', ()=>{
  const nav = document.querySelector('.nav');
  if(!nav) return;
  const s = window.scrollY;
  if(s > 40) nav.style.transform = 'translateY(-4px) scale(.995)';
  else nav.style.transform = 'none';
  lastScroll = s;
}, {passive:true});

/* ====== ready log ====== */
document.addEventListener('DOMContentLoaded', ()=>{
  // ensure reveal on load for above-the-fold
  revealEls.forEach(el => {
    if(el.getBoundingClientRect().top < window.innerHeight * 0.8) el.classList.add('show');
  });
});
