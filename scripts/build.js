// =============================================================================
// AuraFit Pro — Build de parciales HTML
// -----------------------------------------------------------------------------
// Este script:
//   1) "split": divide el index.html completo en parciales dentro de partials/,
//      cortando por los comentarios <!-- N. ... --> que ya existen en el código.
//   2) "build": recompone index.html a partir de los parciales + el nuevo <head>
//      con los CSS modulares.
//
// Garantía: "split" + "build" producen un index.html completo y funcional
// (los parciales son la fuente de organización; index.html es el artefacto).
//
// Uso: node scripts/build.js [split|build|all]
// =============================================================================
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const srcFile = path.join(root, 'index.html');
const partialsDir = path.join(root, 'partials');

// -----------------------------------------------------------------------------
// Cabecera fija del documento: <head> + apertura de <body> + contenedor #app.
// -----------------------------------------------------------------------------
const HEAD_PARTIAL = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <meta name="description" content="AuraFit Pro — Tracker de entrenamiento de fuerza, calistenia y cardio. Planifica tus rutinas semanales, registra series y progresa con gamificación real." />
    <title>AuraFit Pro — Tracker de Fuerza, Calistenia & Cardio</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
    <!-- AuraFit Pro Design System (CSS modulares) -->
    <link rel="stylesheet" href="css/tokens.css" />
    <link rel="stylesheet" href="css/header.css" />
    <link rel="stylesheet" href="css/widgets.css" />
    <link rel="stylesheet" href="css/cardio.css" />
    <link rel="stylesheet" href="css/workout.css" />
    <link rel="stylesheet" href="css/modals.css" />
    <link rel="stylesheet" href="css/importer-timer.css" />
    <link rel="stylesheet" href="css/header-actions.css" />
    <link rel="stylesheet" href="css/states.css" />
    <link rel="stylesheet" href="css/catalog.css" />
    <link rel="stylesheet" href="css/active-modes.css" />
    <link rel="stylesheet" href="css/auth.css" />
    <link rel="stylesheet" href="css/shell.css" />
  </head>
  <body>
    <div id="app" class="app-container">
`;

// -----------------------------------------------------------------------------
// Mapa de parciales: cada marcador corta desde su comentario hasta el siguiente.
// -----------------------------------------------------------------------------
const SECTIONS = [
  { file: '00-shell.html', marker: /<!-- SHELL: SIDEBAR DE ESCRITORIO -->/ },
  { file: '01-header.html', marker: /<!-- 1\. ENCABEZADO PRINCIPAL RESPONSIVE -->/ },
  { file: '02-navigation.html', marker: /<!-- 2\. CONMUTADOR DE MÓDULO/ },
  { file: '03-progress-banner.html', marker: /<!-- 3\. BANNER COMPACTO DE PROGRESO/ },
  { file: '04-calendar.html', marker: /<!-- 4\. PLANIFICADOR SEMANAL -->/ },
  { file: '05-cardio.html', marker: /<!-- 5\. PANEL DE CARDIO & AERÓBICO/ },
  { file: '06-strength.html', marker: /<!-- 6\. PANEL DE FUERZA & CALISTENIA/ },
  { file: '07-context-bar.html', marker: /<!-- 7\. BARRA CONTEXTUAL INFERIOR/ },
  { file: '08-modals.html', marker: /<!-- =+\s*[\s\S]*?MODALES[\s\S]*?-->/ },
  { file: '09-auth-modal.html', marker: /<!-- 10\. MODAL DE AUTENTICACIÓN SUPABASE -->/ },
  { file: '10-app-close.html', marker: /<\/div><!-- \/#app -->/ },
  { file: '11-scripts.html', marker: /<!-- SUPABASE SDK \(CDN\) -->/ },
];

// -----------------------------------------------------------------------------
// 1) DIVIDIR index.html en parciales
// -----------------------------------------------------------------------------
function split() {
  const original = fs.readFileSync(srcFile, 'utf8');
  if (!fs.existsSync(partialsDir)) fs.mkdirSync(partialsDir, { recursive: true });

  const cuts = [];
  for (const sec of SECTIONS) {
    const m = original.match(sec.marker);
    if (!m) {
      console.error(`Marcador no encontrado para ${sec.file}: ${sec.marker}`);
      process.exit(1);
    }
    cuts.push({ file: sec.file, index: m.index });
  }
  cuts.sort((a, b) => a.index - b.index);
  for (let i = 0; i < cuts.length; i++) {
    const start = cuts[i].index;
    const end = i + 1 < cuts.length ? cuts[i + 1].index : original.length;
    let body = original.slice(start, end).trimEnd() + '\n';
    if (i === cuts.length - 1 && !/<\/html>\s*$/.test(body)) body += '</body>\n</html>\n';
    fs.writeFileSync(path.join(partialsDir, cuts[i].file), body, 'utf8');
  }
  console.log(`Parciales generados (${cuts.length}) en partials/`);
}

// -----------------------------------------------------------------------------
// 2) RECOMPONER index.html desde los parciales
// -----------------------------------------------------------------------------
function build() {
  let out = HEAD_PARTIAL;
  for (const sec of SECTIONS) {
    const p = path.join(partialsDir, sec.file);
    if (!fs.existsSync(p)) {
      console.error(`Falta parcial: ${sec.file}. Ejecuta: node scripts/build.js split`);
      process.exit(1);
    }
    out += '\n' + fs.readFileSync(p, 'utf8');
  }
  fs.writeFileSync(srcFile, out + '\n', 'utf8');
  console.log(`index.html recompuesto (${Buffer.byteLength(out, 'utf8')} bytes).`);
}

// -----------------------------------------------------------------------------
// MAIN
// -----------------------------------------------------------------------------
const command = process.argv[2] || 'all';
if (command === 'split') {
  split();
} else if (command === 'build') {
  build();
} else if (command === 'all') {
  split();
  build();
} else {
  console.log('Uso: node scripts/build.js [split|build|all]');
}

