/* Events page JS */
(function(){
  const qs = sel => document.querySelector(sel);
  const ce = (tag, cls) => { const el = document.createElement(tag); if (cls) el.className = cls; return el; };
  const fmtDate = d => new Date(d).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' });
  // Simple theme animation (same as in main.js)
  function initThemeAnimation(theme){
    const existing = document.querySelector('.theme-anim');
    if (existing) existing.remove();
    if (!theme || theme === 'ISTITUZIONALE') return;
    const host = ce('div','theme-anim');
    document.body.appendChild(host);
    const W = window.innerWidth; const H = window.innerHeight;
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

  const yearEl = qs('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  Promise.all([
    fetch('data/events.json').then(r => r.json())
  ]).then(([data]) => {
    const all = Array.isArray(data.events) ? data.events.slice() : [];
    initFilters(all);
    renderList(all);
    // Force NATALE animation on all pages
    initThemeAnimation('NATALE');
  }).catch(err => console.error(err));

  function initFilters(list){
    const years = Array.from(new Set(list.map(e => new Date(e.date).getFullYear()))).sort((a,b)=>b-a);
    const sel = qs('#year-filter');
    years.forEach(y => {
      const opt = ce('option'); opt.value = String(y); opt.textContent = String(y); sel.append(opt);
    });
    qs('#search').addEventListener('input', () => applyFilters(list));
    sel.addEventListener('change', () => applyFilters(list));
  }
  function applyFilters(base){
    const term = qs('#search').value.toLowerCase();
    const year = qs('#year-filter').value;
    const filtered = base.filter(e => {
      const matchesTerm = !term || (e.title.toLowerCase().includes(term) || (e.tags||[]).some(t=>t.toLowerCase().includes(term)));
      const matchesYear = !year || String(new Date(e.date).getFullYear()) === year;
      return matchesTerm && matchesYear;
    });
    renderList(filtered);
  }
  function renderList(list){
    const grid = qs('#events-list'); if (!grid) return; grid.innerHTML = '';
    list.sort((a,b)=> new Date(b.date) - new Date(a.date));
    list.forEach(evt => {
      const item = ce('article', 'event-item');
      const link = ce('a'); link.href = `event.html?id=${encodeURIComponent(slug(evt))}`; link.style.textDecoration = 'none'; link.style.color = 'inherit'; link.setAttribute('aria-label', `Apri evento: ${evt.title}`);
      const thumb = ce('div', 'thumb');
      const firstImage = Array.isArray(evt.images) && evt.images.length ? evt.images[0] : evt.cover;
      thumb.style.backgroundImage = `url(${firstImage})`;
      const body = ce('div', 'body');
      const h4 = ce('h4'); h4.textContent = evt.title;
      const meta = ce('div', 'meta'); meta.textContent = `${fmtDate(evt.date)} • ${evt.location}`;
      const p = ce('p'); p.textContent = evt.description;
      body.append(h4, meta, p);
      link.append(thumb, body);
      item.append(link);
      grid.append(item);
    });
  }
  function slug(evt){
    return (evt.slug || evt.title.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,''));
  }
})();
