# Pro Loco Gonars – Sito istituzionale

Struttura di un sito statico per la Pro Loco Gonars, ispirato allo stile di prolocoregionefvg.it. Include homepage con hero, prossimo evento, anteprima eventi, chi siamo, sponsor con carosello, contatti e pagina dedicata agli eventi passati.

## Avvio locale

Opzione 1: usando Python (se disponibile):

```powershell
python -m http.server 5500; Start-Process http://localhost:5500
```

Opzione 2: usando PowerShell puro:

```powershell
Start-Process index.html
```

Nota: aprire tramite server (opzione 1) garantisce il corretto caricamento dei file JSON.

## Struttura

- `index.html`: pagina principale (single page) con sezioni richieste.
- `events.html`: elenco completo degli eventi (tipo blog) con ricerca e filtro per anno.
- `assets/css/styles.css`: tema e layout responsive.
- `assets/js/main.js`: logica homepage (caricamento JSON, rendering sezioni, carosello, form).
- `assets/js/events.js`: logica pagina eventi (ricerca e filtri).
- `data/events.json`: prossimo evento e lista eventi passati (modificabile).
- `data/sponsors.json`: elenco sponsor con logo e link (modificabile).
- `assets/img/`: immagini di copertina degli eventi, sfondo hero, loghi sponsor e PDF locandina.

## Aggiornare i contenuti

- Prossimo evento: modifica la sezione `next` in `data/events.json` e sostituisci `poster` con il percorso PDF.
- Eventi passati: aggiungi oggetti nell'array `past` con campi `title`, `date` (YYYY-MM-DD), `location`, `description`, `cover`, `tags`.
- Sponsor: modifica `data/sponsors.json` con `name`, `logo`, `url`.

## Deploy su Cloudflare Pages

1. Crea un nuovo progetto su Cloudflare Pages collegando questo repository.
2. Build command: nessuno (sito statico). Output directory: `/` (root del repository).
3. Dopo il deploy, verifica che i percorsi alle risorse (`assets/...`, `data/...`) funzionino.

## TODO futuri

- Collegare il form contatti a un backend/serverless (es. Cloudflare Workers).
- Aggiungere pagine di dettaglio evento (se richiesto).
- Ottimizzare immagini e aggiungere favicon.