/* Events page JS */
(function(){
  const qs = sel => document.querySelector(sel);
  const ce = (tag, cls) => { const el = document.createElement(tag); if (cls) el.className = cls; return el; };
  const fmtDate = d => new Date(d).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' });

  const yearEl = qs('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  Promise.all([
    fetch('data/events.json').then(r => r.json())
  ]).then(([data]) => {
    const all = Array.isArray(data.events) ? data.events.slice() : [];
    initFilters(all);
    renderList(all);
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
