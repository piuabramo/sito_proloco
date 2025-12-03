(function(){
  const qs = sel => document.querySelector(sel);
  const ce = (tag, cls) => { const el = document.createElement(tag); if (cls) el.className = cls; return el; };
  const fmtDate = d => new Date(d).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' });
  const yearEl = qs('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  fetch('data/events.json').then(r=>r.json()).then(data => {
    const list = Array.isArray(data.events) ? data.events : [];
    const evt = findEvent(list, id);
    if (!evt){ const t = qs('#evt-title'); if (t) t.textContent = 'Evento non trovato'; return; }
    renderEvent(evt);
    initThemeAnimation(evt.theme);
  }).catch(console.error);

  function slug(evt){ return (evt.slug || evt.title.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')); }
  function findEvent(list, id){
    if (!id) return list[0];
    return list.find(e => slug(e) === id);
  }
  function renderEvent(evt){
    const titleEl = qs('#evt-title');
    if (titleEl) titleEl.textContent = evt.title.toUpperCase();
    const descHost = qs('#evt-desc'); if (descHost) descHost.innerHTML = formatDesc(evt.descriptionLong || evt.description);

    const imgs = Array.isArray(evt.images) && evt.images.length ? evt.images : [evt.cover];
    const track = qs('#evt-track'); if (!track) return;
    track.innerHTML='';
    imgs.forEach(src => {
      const item = ce('div','carousel-item');
      const box = ce('div','square');
      const img = ce('img'); img.src = src; img.alt = evt.title;
      box.append(img); item.append(box); track.append(item);
    });
    // simple carousel
    let index = 0; const visible = 1;
    // dots
    const dotsHost = document.getElementById('evt-dots');
    if (!dotsHost) return;
    dotsHost.innerHTML = '';
    const dots = imgs.map((_,i)=>{
      const d = document.createElement('button'); d.type='button'; d.className='carousel-dot'; d.setAttribute('aria-label',`Vai a immagine ${i+1}`);
      d.addEventListener('click', ()=>{ index=i; update(); updateDots(); });
      dotsHost.appendChild(d); return d;
    });
    function updateDots(){ dots.forEach((d,i)=> d.classList.toggle('active', i===index)); }
    function update(){
      const itemWidth = track.querySelector('.carousel-item')?.offsetWidth || track.parentElement.offsetWidth || 300;
      const gap = parseInt(getComputedStyle(track).gap || '24', 10);
      const step = itemWidth + gap;
      const maxIndex = Math.max(0, track.children.length - visible);
      if (index < 0) index = 0; if (index > maxIndex) index = maxIndex;
      track.style.transform = `translateX(${-index * step}px)`;
    }
    // arrows removed; navigation via dots and swipe
    // swipe support (touch) + drag support (mouse)
    let startX = 0; let dragging = false;
    track.addEventListener('touchstart', (e)=>{ dragging=true; startX = e.touches[0].clientX; }, {passive:true});
    track.addEventListener('touchmove', (e)=>{ if(!dragging) return; }, {passive:true});
    track.addEventListener('touchend', (e)=>{ if(!dragging) return; dragging=false; const endX = e.changedTouches[0].clientX; if (endX - startX > 40) { index--; } else if (startX - endX > 40) { index++; } update(); updateDots(); });
    track.addEventListener('mousedown', (e)=>{ dragging=true; startX = e.clientX; e.preventDefault(); });
    window.addEventListener('mousemove', (e)=>{ if(!dragging) return; });
    window.addEventListener('mouseup', (e)=>{ if(!dragging) return; dragging=false; const endX = e.clientX; if (endX - startX > 40) { index--; } else if (startX - endX > 40) { index++; } update(); updateDots(); });
    // keyboard arrows for accessibility
    track.setAttribute('tabindex','0');
    track.addEventListener('keydown', (e)=>{
      if (e.key === 'ArrowRight') { index++; update(); updateDots(); }
      if (e.key === 'ArrowLeft') { index--; update(); updateDots(); }
    });
    window.addEventListener('resize', update);
    update(); updateDots();

    // auto-scroll every 10 seconds
    let autoTimer = setInterval(()=>{ index++; update(); updateDots(); }, 10000);
    // reset timer on user interaction
    const resetAuto = () => { clearInterval(autoTimer); autoTimer = setInterval(()=>{ index++; update(); updateDots(); }, 10000); };
    dotsHost.addEventListener('click', resetAuto);
    track.addEventListener('touchend', resetAuto, {passive:true});
    window.addEventListener('mouseup', resetAuto);

    // Countdown centered beneath title
    const countdownHost = document.getElementById('evt-countdown');
    const now = new Date();
    const start = new Date(evt.date);
    if (start.getTime() > now.getTime()) {
      if (countdownHost){
        countdownHost.innerHTML = countdownHTML(start);
        setInterval(() => { countdownHost.innerHTML = countdownHTML(start); }, 1000);
      }
    } else {
      if (countdownHost) { countdownHost.textContent = 'Evento terminato'; countdownHost.classList.add('ended'); }
    }

    // Right side: WHEN / WHERE
    const info = document.querySelector('.event-info');
    const whenWhere = document.createElement('div');
    whenWhere.className = 'when-where';
      const when = document.createElement('div');
      when.innerHTML = `<div class="label">📅 QUANDO</div><div class="value">${formatDateTime(start)}</div>`;
    const where = document.createElement('div');
    const mapLink = evt.mapUrl ? `<a href="${evt.mapUrl}" target="_blank" rel="noopener">Apri su Google Maps</a>` : '';
      where.innerHTML = `<div class="label">📍 DOVE</div><div class="value">${evt.location} ${mapLink ? '• ' + mapLink : ''}</div>`;
    whenWhere.append(when, where);
    const descEl = document.getElementById('evt-desc');
    if (info) {
      if (descEl && info.contains(descEl)) info.insertBefore(whenWhere, descEl);
      else info.appendChild(whenWhere);
    }

    // Poster download if available
    const actions = document.getElementById('evt-actions');
    actions.innerHTML = '';
    if (evt.poster){
      const dl = document.createElement('a');
      dl.className = 'btn btn-primary';
      dl.href = evt.poster;
      dl.textContent = 'Scarica locandina (PDF)';
      dl.setAttribute('download','locandina.pdf');
      actions.appendChild(dl);
    }

    // Inject Event structured data (JSON-LD)
    const ld = {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": evt.title,
      "startDate": evt.date,
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "eventStatus": "https://schema.org/EventScheduled",
      "location": {
        "@type": "Place",
        "name": evt.location
      },
      "image": imgs,
      "description": evt.description,
      "organizer": {
        "@type": "Organization",
        "name": "Pro Loco Gonars",
        "url": "https://www.prolocogonars.it/"
      }
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(ld);
    document.head.appendChild(script);
  }
  function countdownHTML(target){
    const now = new Date();
    const diff = Math.max(0, target.getTime() - now.getTime());
    const days = Math.floor(diff / (1000*60*60*24));
    const hours = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
    const minutes = Math.floor((diff % (1000*60*60)) / (1000*60));
    return `
      <div class="countdown" role="status" aria-live="polite">
        <div class="block"><span class="value">${days}</span><span class="label">Giorni</span></div>
        <div class="block"><span class="value">${hours}</span><span class="label">Ore</span></div>
        <div class="block"><span class="value">${minutes}</span><span class="label">Minuti</span></div>
      </div>
    `;
  }
  function formatDateTime(d){
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2,'0');
    const min = String(d.getMinutes()).padStart(2,'0');
    return `${dd}-${mm}-${yyyy} ore ${hh}-${min}`;
  }
  function formatDesc(text){
    // Simple paragraph splitter to allow longer descriptive text
    return String(text).split(/\n\n+/).map(p => `<p>${p}</p>`).join('');
  }

  // Theme animations (same as in main.js)
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
})();
