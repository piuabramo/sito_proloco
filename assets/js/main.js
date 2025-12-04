/* Main JS for homepage */
(function(){
  const qs = sel => document.querySelector(sel);
  const ce = (tag, cls) => { const el = document.createElement(tag); if (cls) el.className = cls; return el; };
  const fmtDate = d => new Date(d).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' });

  // Mobile nav toggle
  const navToggle = qs('.nav-toggle');
  const navList = qs('.nav-list');
  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const open = navList.style.display === 'flex';
      navList.style.display = open ? 'none' : 'flex';
      navToggle.setAttribute('aria-expanded', (!open).toString());
    });
  }

  // Close mobile menu on link click
  if (navList) {
    navList.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && window.innerWidth <= 600) {
        navList.style.display = 'none';
        if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Year in footer (optional element)
  const yearEl = qs('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Contact form: show modal on submit
  const contactForm = qs('#contact-form');
  const modal = qs('#modal');
  const modalClose = qs('#modal-close');
  let modalShownOnce = false;
  function openModal(){ if(!modal) return; modal.classList.add('active'); modal.removeAttribute('aria-hidden'); modalClose && modalClose.focus(); }
  function closeModal(){ if(!modal) return; modal.classList.remove('active'); modal.setAttribute('aria-hidden','true'); }
  if (contactForm){
    // Show modal on first focus inside the contact form
    contactForm.addEventListener('focusin', (e) => {
      if (!modalShownOnce && (e.target.matches('input, textarea, select'))) {
        modalShownOnce = true;
        openModal();
      }
    });
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      openModal();
    });
  }
  if (modalClose){ modalClose.addEventListener('click', closeModal); }
  if (modal){
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal && modal.classList.contains('active')) closeModal(); });

  // Load data
  Promise.all([
    fetch('data/events.json').then(r => r.json()),
    fetch('data/sponsors.json').then(r => r.json())
  ]).then(([data, sponsors]) => {
    const all = Array.isArray(data.events) ? data.events.slice() : [];
    const now = new Date();
    // sort ascending by date
    all.sort((a,b)=> new Date(a.date) - new Date(b.date));
    // pick next upcoming
    const upcoming = all.find(e => new Date(e.date) >= now) || all[all.length-1];
    // Others: sort by date descending (most recent first)
    const others = all.filter(e => e !== upcoming).sort((a,b)=> new Date(b.date) - new Date(a.date));
    renderNextEvent(upcoming);
    // Force NATALE animation on all pages
    initThemeAnimation('NATALE');
    initEventsSlider(others);
    renderSponsors(sponsors);
  }).catch(err => {
    console.error('Errore nel caricamento dei dati', err);
  });

  function renderNextEvent(evt){
    if (!evt) return;
    const card = qs('#next-event-card');
    if (!card) return; // Not present on some pages
    card.innerHTML = '';
    const cover = ce('div', 'cover');
    cover.style.backgroundImage = `url(${evt.cover})`;
    const content = ce('div', 'content');
    const h3 = ce('h3'); h3.textContent = evt.title;
    const meta = ce('div', 'meta'); meta.textContent = `${fmtDate(evt.date)} • ${evt.location}`;
    const p = ce('p'); p.textContent = evt.description;
    const actions = ce('div', 'actions');
    const more = ce('a', 'btn btn-outline'); more.href = `event.html?id=${encodeURIComponent(slug(evt))}`; more.textContent = 'Vedi dettagli';
    actions.appendChild(more);
    if (evt.poster){
      const dl = ce('a', 'btn btn-primary'); dl.href = evt.poster; dl.textContent = 'Scarica locandina (PDF)'; dl.setAttribute('download', 'locandina.pdf');
      actions.appendChild(dl);
    }
    content.append(h3, meta, p, actions);
    card.append(cover, content);
  }

  // Theme animations: ISTITUZIONALE (none), NATALE (snow), PRIMAVERA (birds), AUTUNNO (leaves)
  function initThemeAnimation(theme){
    const existing = document.querySelector('.theme-anim');
    if (existing) existing.remove();
    if (!theme || theme === 'ISTITUZIONALE') return;
    const host = ce('div','theme-anim');
    document.body.appendChild(host);
    const W = window.innerWidth;
    const H = window.innerHeight;
    const rng = (min,max)=> Math.random()*(max-min)+min;
    if (theme === 'NATALE'){
      for(let i=0;i<60;i++){
        const s = ce('div','flake');
        s.style.left = `${rng(0,W)}px`;
        s.style.top = `-${rng(0, H*0.2)}px`;
        s.style.width = s.style.height = `${rng(2,5)}px`;
        s.style.background = 'rgba(255,255,255,0.9)';
        s.style.borderRadius = '50%';
        s.style.animation = `fall-snow ${rng(6,12)}s linear ${rng(0,6)}s infinite`;
        host.appendChild(s);
      }
    } else if (theme === 'AUTUNNO'){
      const colors = ['#f5a623','#f29f05','#d67700'];
      for(let i=0;i<40;i++){
        const l = ce('div','leaf');
        l.style.left = `${rng(0,W)}px`;
        l.style.top = `-${rng(0, H*0.2)}px`;
        l.style.width = `${rng(8,14)}px`;
        l.style.height = `${rng(12,18)}px`;
        l.style.background = colors[Math.floor(rng(0,colors.length))];
        l.style.borderRadius = '60% 60% 40% 40%';
        l.style.opacity = '0.9';
        l.style.animation = `fall-leaf ${rng(8,14)}s linear ${rng(0,6)}s infinite`;
        host.appendChild(l);
      }
    } else if (theme === 'PRIMAVERA'){
      for(let i=0;i<10;i++){
        const b = ce('div','bird');
        b.textContent = '🕊️';
        b.style.fontSize = `${rng(16,22)}px`;
        b.style.top = `${rng(H*0.2, H*0.6)}px`;
        b.style.left = `-${rng(20, 100)}px`;
        b.style.animation = `fly-bird ${rng(10,18)}s linear ${rng(0,4)}s infinite`;
        host.appendChild(b);
      }
    }
    window.addEventListener('resize', ()=> initThemeAnimation(theme), { once: true });
  }

  function slug(evt){
    return (evt.slug || evt.title.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,''));
  }

  function initEventsSlider(list){
    const track = qs('#events-track');
    if (!track) return;
    track.innerHTML = '';
    list.slice(0, 12).forEach(evt => {
      const item = ce('article', 'event-item');
      const link = ce('a'); link.href = `event.html?id=${encodeURIComponent(slug(evt))}`; link.style.textDecoration = 'none'; link.style.color = 'inherit';
      const thumb = ce('div', 'thumb');
      const firstImage = Array.isArray(evt.images) && evt.images.length ? evt.images[0] : evt.cover;
      thumb.style.backgroundImage = `url(${firstImage})`;
      const body = ce('div', 'body');
      const h4 = ce('h4'); h4.textContent = evt.title;
      const meta = ce('div', 'meta'); meta.textContent = `${fmtDate(evt.date)} • ${evt.location}`;
      // Past marking
      const isPast = new Date(evt.date) < new Date();
      if (isPast) {
        const badge = ce('div','ended-badge'); badge.textContent = 'Evento Terminato';
        item.appendChild(badge);
      }
      body.append(h4, meta);
      link.append(thumb, body);
      item.append(link);
      track.append(item);
    });

    let idx = 0;
    function visibleCount(){
      return window.innerWidth <= 600 ? 1 : 3;
    }
    function update(){
      const itemWidth = track.querySelector('.event-item')?.offsetWidth || 300;
      const gap = parseInt(getComputedStyle(track).gap || '20', 10);
      const step = itemWidth + gap;
      const maxIdx = Math.max(0, track.children.length - visibleCount());
      if (idx < 0) idx = 0; if (idx > maxIdx) idx = maxIdx;
      track.style.transform = `translateX(${-idx * step}px)`;
    }
    const nextBtn = qs('.slider-btn.next');
    const prevBtn = qs('.slider-btn.prev');
    if (nextBtn) nextBtn.addEventListener('click', ()=>{ idx++; update(); });
    if (prevBtn) prevBtn.addEventListener('click', ()=>{ idx--; update(); });
    // Swipe support for mobile
    let startX = 0; let dragging = false;
    track.addEventListener('touchstart', (e)=>{ dragging=true; startX = e.touches[0].clientX; }, {passive:true});
    track.addEventListener('touchend', (e)=>{
      if(!dragging) return; dragging=false; const endX = e.changedTouches[0].clientX;
      if (endX - startX > 40) { idx--; }
      else if (startX - endX > 40) { idx++; }
      update();
    }, {passive:true});
    window.addEventListener('resize', update);
    update();
  }

  // Carousel
  const track = qs('#sponsor-track');
  let index = 0;
  function renderSponsors(sponsors){
    if (!track) return;
    track.innerHTML = '';
    sponsors.forEach(sp => {
      const item = ce('div', 'carousel-item');
      const a = ce('a'); a.href = sp.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      const img = ce('img'); img.src = sp.logo; img.alt = sp.name;
      a.append(img); item.append(a); track.append(item);
    });
  }
  function updateCarousel(){
    if (!track) return;
    const itemWidth = 285; // fixed sponsor logo width
    const gap = parseInt(getComputedStyle(track).gap || '24', 10);
    const items = track.children.length;
    const visible = Math.floor(track.parentElement.offsetWidth / (itemWidth + gap)) || 1;
    const maxIndex = Math.max(0, items - visible);
    if (items === 0) return;
    // wrap index to create an infinite loop
    if (index < 0) index = maxIndex;
    if (index > maxIndex) index = 0;
    const offset = -index * (itemWidth + gap);
    track.style.transform = `translateX(${offset}px)`;
  }
  window.addEventListener('resize', updateCarousel);
  const carNext = qs('.carousel-btn.next');
  const carPrev = qs('.carousel-btn.prev');
  if (carNext) carNext.addEventListener('click', () => { index++; updateCarousel(); });
  if (carPrev) carPrev.addEventListener('click', () => { index--; updateCarousel(); });
  setInterval(() => { index++; updateCarousel(); }, 5000);

})();
