// Clean dual-theme + FX + counters + minimal interactions (no testimonials)
(()=>{
  const $ = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Year
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  // Smooth scroll
  if (!reduced){
    $$('a[href^="#"]').forEach(a=>{
      a.addEventListener('click', e=>{
        const id = a.getAttribute('href');
        if (id && id.length>1){
          const t = $(id);
          if (t){ e.preventDefault(); t.scrollIntoView({behavior:'smooth'}) }
          // close drawer
          document.body.classList.remove('menu-open');
          $('#drawer')?.setAttribute('aria-hidden','true');
        }
      });
    });
  }

  // Theme toggle
  const themeBtn = $('#themeToggle');
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
  themeBtn?.addEventListener('click', ()=>{
    const cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', cur);
    localStorage.setItem('theme', cur);
  });

  // FX toggle (particles vs glow)
  const fxBtn = $('#fxToggle');
  const savedFx = localStorage.getItem('fx') || 'particles';
  document.documentElement.setAttribute('data-fx', savedFx);
  fxBtn?.addEventListener('click', ()=>{
    const now = document.documentElement.getAttribute('data-fx') === 'particles' ? 'glow' : 'particles';
    document.documentElement.setAttribute('data-fx', now);
    localStorage.setItem('fx', now);
  });

  // Drawer
  const menuBtn = $('#menuToggle');
  const drawer = $('#drawer');
  menuBtn?.addEventListener('click', ()=>{
    const open = document.body.classList.toggle('menu-open');
    drawer?.setAttribute('aria-hidden', String(!open));
  });
  document.addEventListener('keydown', e=>{
    if (e.key === 'Escape'){ document.body.classList.remove('menu-open'); drawer?.setAttribute('aria-hidden', 'true'); }
  });

  // Typewriter (lightweight)
  (function typewriter(){
    const el = $('.typewriter'); if (!el || reduced) return;
    const text = el.textContent; el.textContent = '';
    let i=0; (function step(){
      if (i<=text.length){ el.textContent = text.slice(0,i++); setTimeout(step, 24 + Math.random()*18); }
    })();
  })();

  // Reveal on scroll
  (function reveal(){
    const els = $$('.fade'); if (!els.length) return;
    if (reduced){ els.forEach(e=>e.classList.add('reveal')); return; }
    const io = new IntersectionObserver((entries, obs)=>{
      for (const e of entries){ if (e.isIntersecting){ e.target.classList.add('reveal'); obs.unobserve(e.target); } }
    },{threshold:.15});
    els.forEach(e=>io.observe(e));
  })();

  // Counters
  (function counters(){
    const counters = $$('.num'); if (!counters.length) return;
    const io = new IntersectionObserver((ents)=>{
      for (const ent of ents){
        if (ent.isIntersecting){
          const el = ent.target;
          if (el._started) continue;
          el._started = true;
          animate(el, parseInt(el.dataset.target||'0',10));
        }
      }
    },{threshold:.5});
    counters.forEach(c=>io.observe(c));

    function animate(el, target){
      const start = performance.now(), dur=1300;
      function frame(now){
        const t = Math.min(1, (now-start)/dur);
        const e = t<.5 ? 2*t*t : -1+(4-2*t)*t;
        el.textContent = Math.floor(target*e).toLocaleString();
        if (t<1) requestAnimationFrame(frame); else el.textContent = target.toLocaleString();
      }
      requestAnimationFrame(frame);
    }
  })();

  // Particles
  (function particles(){
    const c = $('#particles'); if (!c) return;
    const ctx = c.getContext('2d');
    let w, h, ps=[]; const density = 90000; // higher = fewer
    function resize(){ w = c.width = innerWidth; h = c.height = innerHeight; init(); }
    function rnd(a,b){ return a + Math.random()*(b-a) }
    function init(){
      ps = []; const count = Math.max(30, Math.round((w*h)/density));
      for (let i=0;i<count;i++){
        ps.push({ x:rnd(0,w), y:rnd(0,h), r:rnd(.7,2.2), vx:rnd(-.25,.25), vy:rnd(-.2,.2), a:rnd(.05,.16) });
      }
    }
    function tick(){
      if (document.documentElement.getAttribute('data-fx')!=='particles'){ ctx.clearRect(0,0,w,h); if (!reduced) requestAnimationFrame(tick); return; }
      ctx.clearRect(0,0,w,h);
      for (const p of ps){
        ctx.beginPath(); ctx.fillStyle = 'rgba(0,200,255,'+p.a+')';
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
        p.x+=p.vx; p.y+=p.vy;
        if (p.x<-10) p.x=w+10; if (p.x>w+10) p.x=-10;
        if (p.y<-10) p.y=h+10; if (p.y>h+10) p.y=-10;
      }
      if (!reduced) requestAnimationFrame(tick);
    }
    window.addEventListener('resize', resize);
    resize(); tick();
  })();
})();