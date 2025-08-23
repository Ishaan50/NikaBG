/* ====================================================
   Nika BG — script.js
   Paste into script.js
   Features:
   - Particles canvas background
   - Typewriter subtitle
   - Smooth scroll (respects reduced motion)
   - Animated counters on intersection
   - Testimonial auto-slider
   - Year auto-update
   - Accessibility & performance considerations
   ==================================================== */

(() => {
  // Utilities
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const q = (s, root=document) => root.querySelector(s);
  const qa = (s, root=document) => Array.from(root.querySelectorAll(s));

  // 1) Year
  const yearEl = q('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 2) Smooth scroll (unless reduced motion)
  if (!prefersReducedMotion) {
    qa('a[href^="#"]').forEach(a=>{
      a.addEventListener('click', (e)=>{
        const href = a.getAttribute('href');
        if (href.length > 1) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  // 3) Particles background (canvas)
  (function particles() {
    const canvas = q('#particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = innerWidth, height = innerHeight;
    let particles = [];
    const count = Math.round((width * height) / 100000); // density factor

    function resize() {
      width = innerWidth; height = innerHeight;
      canvas.width = width; canvas.height = height;
      initParticles();
    }
    function rand(min, max){ return min + Math.random()*(max-min) }

    function initParticles() {
      particles = [];
      for (let i=0;i<count;i++){
        particles.push({
          x: Math.random()*width,
          y: Math.random()*height,
          r: rand(0.6, 2.4),
          vx: rand(-0.3, 0.3),
          vy: rand(-0.2, 0.2),
          hue: Math.random()*360,
          alpha: rand(0.04, 0.16)
        });
      }
    }

    function draw() {
      ctx.clearRect(0,0,width,height);
      for (let p of particles){
        ctx.beginPath();
        ctx.fillStyle = `hsla(${200 + (p.hue%120)}, 80%, 60%, ${p.alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = width+10;
        if (p.x > width+10) p.x = -10;
        if (p.y < -10) p.y = height+10;
        if (p.y > height+10) p.y = -10;
      }
      if (!prefersReducedMotion) requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
  })();

  // 4) Typewriter effect for subtitle (single-run)
  (function typewriter() {
    const el = q('.typewriter');
    if (!el || prefersReducedMotion) return;
    const text = el.textContent;
    el.textContent = '';
    let i=0;
    function step(){
      if (i <= text.length){
        el.textContent = text.slice(0,i);
        i++;
        setTimeout(step, 28 + (Math.random()*20));
      }
    }
    step();
  })();

  // 5) Animated counters (intersection)
  (function counters() {
    const counters = qa('.counter');
    if (!counters.length) return;
    const io = new IntersectionObserver(entries=>{
      for (let e of entries){
        if (e.isIntersecting){
          const el = e.target;
          const target = parseInt(el.dataset.target, 10) || 0;
          if (!el._started) animateCount(el, target);
          el._started = true;
        }
      }
    }, {threshold:0.5});
    counters.forEach(c => io.observe(c));

    function animateCount(el, target) {
      const duration = 1600;
      const start = performance.now();
      function draw(now) {
        const t = Math.min(1, (now - start)/duration);
        const ease = t<.5 ? 2*t*t : -1 + (4 - 2*t)*t; // simple ease
        el.textContent = Math.floor(ease * target).toLocaleString();
        if (t < 1) requestAnimationFrame(draw);
        else el.textContent = target.toLocaleString();
      }
      requestAnimationFrame(draw);
    }
  })();

  // 6) Testimonial slider
  (function testimonials() {
    const track = q('.testimonial-track');
    const slides = qa('.testimonial');
    if (!track || slides.length === 0) return;
    let idx = 0;
    const total = slides.length;
    function go(i){
      idx = (i + total) % total;
      track.style.transform = `translateX(-${idx*100}%)`;
    }
    // auto
    if (!prefersReducedMotion) {
      let timer = setInterval(()=> go(idx+1), 4200);
      // pause on hover
      q('.testimonial-slider').addEventListener('mouseenter', ()=> clearInterval(timer));
      q('.testimonial-slider').addEventListener('mouseleave', ()=> timer = setInterval(()=> go(idx+1), 4200));
    }
    // keyboard
    document.addEventListener('keydown', (e)=>{
      if (e.key === 'ArrowRight') go(idx+1);
      if (e.key === 'ArrowLeft') go(idx-1);
    });
  })();

  // 7) Reveal animations (fade-in on scroll)
  (function reveal() {
    const items = qa('.fade-in');
    if (!items.length || prefersReducedMotion) {
      items.forEach(i=> i.classList.add('revealed'));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      for (let ent of entries) {
        if (ent.isIntersecting) {
          ent.target.classList.add('revealed');
          obs.unobserve(ent.target);
        }
      }
    }, {threshold: 0.18});
    items.forEach(i => io.observe(i));
  })();

  // 8) Animated "reveal" class styling injection (so we don't require user CSS changes)
  (function addRevealStyle() {
    const style = document.createElement('style');
    style.innerHTML = `
      .fade-in{ opacity:0; transform: translateY(12px); transition: opacity 700ms ease, transform 700ms ease }
      .fade-in.revealed{ opacity:1; transform:translateY(0) }
    `;
    document.head.appendChild(style);
  })();

  // 9) Accessibility: keyboard focusable team cards
  (function teamKeyboard() {
    qa('.team-card').forEach(card => {
      card.setAttribute('tabindex','0');
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.classList.toggle('flipped');
          const inner = card.querySelector('.card-inner');
          if (inner) inner.style.transform = inner.style.transform ? '' : 'rotateY(180deg)';
        }
      });
    });
  })();

})();
