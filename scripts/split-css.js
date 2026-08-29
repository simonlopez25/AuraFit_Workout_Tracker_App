// Divide css/styles.css en archivos CSS modulares, preservando el 100% del contenido.
// Garantía: la concatenación de los archivos generados (cuerpos) es idéntica al original.
// Uso: node scripts/split-css.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const srcFile = path.join(root, 'css', 'styles.css');
const content = fs.readFileSync(srcFile, 'utf8');
const lines = content.split(/\r?\n/);

// --- Mapa de banners -> archivo destino -----------------------------------
// Detectamos los banners /* ==== ... */ y asignamos la sección a un archivo.
const FILE_HEADER = `/* ==========================================================================
   AuraFit Pro — Dark Cyber-Performance SaaS Design System
   Módulo CSS: %NAME%
   (Fragmento dividido de styles.css — no editar a mano, usar scripts/split-css.js)
   ========================================================================== */\n`;

const bannerToFile = [
  { match: /AuraFit Pro — Dark Cyber/, file: 'tokens.css' },
  { match: /RESET & BASE STYLES/, file: 'tokens.css' },
  { match: /HEADER & SAAS CLOUD BADGE/, file: 'header.css' },
  { match: /NAVIGATION MODULE SWITCHER/, file: 'header.css' },
  { match: /GAMIFICATION WIDGET/, file: 'widgets.css' },
  { match: /HORIZONTAL CALENDAR & PLANNER/, file: 'widgets.css' },
  { match: /PANEL DE CARDIO & TRABAJO/, file: 'cardio.css' },
  { match: /CARDIO METRICS GRID/, file: 'cardio.css' },
  { match: /RPE SLIDER/, file: 'cardio.css' },
  { match: /ROUTINE SELECTION TABS/, file: 'workout.css' },
  { match: /IN-WORKOUT STREAM/, file: 'workout.css' },
  { match: /BARRA DE ACCIÓN INFERIOR FIX/, file: 'workout.css' },
  { match: /MODALES \(Overlay, Card, Layout\)/, file: 'modals.css' },
  { match: /IMPORTADOR INTELIGENTE/, file: 'importer-timer.css' },
  { match: /TEMPORIZADOR OVERLAY/, file: 'importer-timer.css' },
  { match: /POST-WORKOUT BESTIAL SUMMARY/, file: 'importer-timer.css' },
  { match: /HEADER ACTIONS & RESPONSIVE DROPDOWN/, file: 'header-actions.css' },
  { match: /EMPTY STATE CARD/, file: 'states.css' },
  { match: /MODERN GLASSMORPHISM & ACTIVE/, file: 'states.css' },
  { match: /PROFILE & BADGES MODAL/, file: 'states.css' },
  { match: /PREDICTIVE SEARCH AUTOCOMPLETE/, file: 'catalog.css' },
  { match: /CARDIO IN-WORKOUT MODE/, file: 'active-modes.css' },
  { match: /UNIFIED CONTEXTUAL BOTTOM/, file: 'active-modes.css' },
  { match: /SUPABASE AUTHENTICATION/, file: 'auth.css' },
];

// --- Detectar posiciones de banners ---------------------------------------
const banners = []; // {start, file}
let pendingFile = null;
for (let i = 0; i < lines.length; i++) {
  if (/^\s*\/\*\s*=/.test(lines[i])) {
    // Recopilar título del banner
    let title = '';
    let j = i + 1;
    while (j < lines.length && !/\*\/\s*$/.test(lines[j])) {
      title += lines[j].trim().replace(/^\*\s?/, '') + ' ';
      j++;
    }
    const match = bannerToFile.find((b) => b.match.test(title));
    pendingFile = match ? match.file : (pendingFile || 'misc.css');
    banners.push({ start: i, file: pendingFile });
  }
}

// --- Construir fragmentos ------------------------------------------------
// El contenido entre un banner y el siguiente pertenece al archivo del banner.
const fragments = []; // {file, body}
for (let b = 0; b < banners.length; b++) {
  const start = banners[b].start;
  const end = b + 1 < banners.length ? banners[b + 1].start : lines.length;
  const body = lines.slice(start, end).join('\n');
  const existing = fragments.find((f) => f.file === banners[b].file);
  if (existing) {
    existing.body += (existing.body ? '\n' : '') + body;
  } else {
    fragments.push({ file: banners[b].file, body });
  }
}

// --- Verificar integridad ---------------------------------------------------
const reconstructed = fragments.map((f) => f.body).join('\n');
const originalNormalized = lines.join('\n');
if (reconstructed.trim() !== originalNormalized.trim()) {
  console.error('ERROR: la reconstrucción NO coincide con el original.');
  console.error('Largo original:', originalNormalized.length);
  console.error('Largo reconstruido:', reconstructed.length);
  process.exit(1);
}

// --- Escribir archivos ------------------------------------------------------
const cssDir = path.join(root, 'css');
const written = [];
for (const frag of fragments) {
  const header = FILE_HEADER.replace('%NAME%', frag.file.replace('.css', ''));
  const filePath = path.join(cssDir, frag.file);
  fs.writeFileSync(filePath, header + '\n' + frag.body, 'utf8');
  written.push(frag.file);
}

console.log('División CSS completada. Archivos generados:');
for (const f of written.sort()) {
  const size = fs.statSync(path.join(cssDir, f)).size;
  console.log(`  css/${f} (${size} bytes)`);
}
console.log('Integridad verificada: la suma de fragmentos == original.');