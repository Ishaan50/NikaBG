/* Enhanced interactivity:
   - theme toggle persisted in localStorage
   - accessible modal with focus trap & keyboard close
   - team-card click/enter opens modal with card data
   - nav toggle for small screens
   - year auto update
*/

(() => {
  // elements
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  const YEAR = document.getElementById('year');
  const modal = document.getElementById('modal');
  const modalClose = document.getElementById('modalClose');
  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalRole = document.getElementById('modalRole');
  const modalBio = document.getElementById('modalBio');
  const modalLinks = document.getElementById('modalLinks');
  const navToggle = document.getElementById('navToggle');
  const navList = document.getElementById('navList');

  // set year
  if (YEAR) YEAR.textContent = new Date().getFullYear();

  // THEME (persist)
  const savedTheme = localStorage.getItem('nbg:theme') || 'dark';
  if (savedTheme === 'light') root.setAttribute('data-theme', 'light');
  themeToggle && themeToggle.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    root.setAttribute('data-theme', isLight ? 'dark' : 'light');
    localStorage.setItem('nbg:theme', isLight ? 'dark' : 'light');
    themeToggle.setAttribute('aria-pressed', String(!isLight));
  });

  // NAV toggle (mobile)
  navToggle && navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navList.style.display = expanded ? '' : 'flex';
  });

  // OPEN GIVE MODAL (simple demo — slides same modal)
  const openGiveModalBtn = document.getElementById('openGiveModal');
  openGiveModalBtn && openGiveModalBtn.addEventListener('click', () => {
    openModal({
      name: 'GCcube Giveaway',
      role: 'Event',
      bio: 'Join our Discord and follow the rules to participate. One winner receives 300 GCcube.',
      img: 'https://play-lh.googleusercontent.com/f3z5Lcf_JI-Ux58hGCR-KlFxAvMTGjzftny59yvCdarulH33J6nDBCpVgymVqTKzUso'
    });
  });

  // TEAM CARDS: click or Enter/Space opens modal
  document.querySelectorAll('.team-card').forEach(card => {
    const handler = () => {
      const data = {
        name: card.dataset.name,
        role: card.dataset.role,
        bio: card.dataset.bio,
        img: card.dataset.img,
        links: card.dataset.links ? JSON.parse(card.dataset.links) : {}
      };
      openModal(data);
    };
    card.addEventListener('click', handler);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }
    });
  });

  // openModal: populate and show modal
  function openModal(data) {
    modalImg.src = data.img || '';
    modalImg.alt = `${data.name} avatar`;
    modalTitle.textContent = data.name || '';
    modalRole.textContent = data.role || '';
    modalBio.textContent = data.bio || '';
    // links
    modalLinks.innerHTML = '';
    if (data.links) {
      try {
        const links = data.links;
        Object.keys(links).forEach(k => {
          const a = document.createElement('a');
          a.href = links[k]; a.target = '_blank'; a.rel = 'noopener';
          a.className = 'chip';
          a.style.marginRight = '8px';
          a.textContent = k;
          modalLinks.appendChild(a);
        });
      } catch (err) { /* ignore */ }
    }
    showModal();
  }

  // show/hide modal with focus trap
  function showModal() {
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    // focus trap
    const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first && first.focus();

    function trap(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      } else if (e.key === 'Escape') {
        hideModal();
      }
    }
    modal._trap = trap;
    document.addEventListener('keydown', trap);
  }

  function hideModal() {
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    modalImg.src = '';
    // remove trap
    if (modal._trap) document.removeEventListener('keydown', modal._trap);
  }

  modalClose && modalClose.addEventListener('click', hideModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });

  // close on Escape globally (backup)
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideModal(); });

  // small accessibility enhancement: add skip link
  const skip = document.createElement('a');
  skip.href = '#main';
  skip.className = 'skip-link';
  skip.textContent = 'Skip to content';
  document.body.prepend(skip);

  // remove inline navList style on resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) navList.style.display = '';
  });

})();
