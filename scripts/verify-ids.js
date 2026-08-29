// Verifica que todos los IDs referenciados por el JS existan en el HTML.
// Uso: node scripts/verify-ids.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// IDs definidos en el HTML
const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));

// IDs referenciados por el JS (getElementById, querySelector('#...'))
const jsFiles = fs
  .readdirSync(path.join(root, 'js'))
  .filter((f) => f.endsWith('.js'))
  .map((f) => path.join(root, 'js', f));

const usedIds = new Set();
for (const file of jsFiles) {
  const src = fs.readFileSync(file, 'utf8');
  for (const m of src.matchAll(/getElementById\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    usedIds.add(m[1]);
  }
  for (const m of src.matchAll(/querySelector(?:All)?\(\s*['"]\.?([A-Za-z0-9_-]+)['"]\s*\)/g)) {
    // Solo IDs (con #) para el chequeo principal
  }
}

// IDs usados con selectores #id (evitar falsos positivos de colores hex como #F59E0B)
for (const file of jsFiles) {
  const src = fs.readFileSync(file, 'utf8');
  for (const m of src.matchAll(/['"]#([A-Za-z][A-Za-z0-9_-]*)['"]/g)) {
    const id = m[1];
    // Ignorar códigos de color hexadecimal (#F59E0B, #EC4899...)
    if (/^[0-9A-Fa-f]{6}$/.test(id)) continue;
    usedIds.add(id);
  }
}

const missing = [...usedIds].filter((id) => !htmlIds.has(id));
const dupes = [...htmlIds].filter((id) => [...htmlIds].filter((x) => x === id).length > 1);

console.log(`IDs en HTML: ${htmlIds.size}`);
console.log(`IDs usados por JS: ${usedIds.size}`);
console.log(`IDs faltantes (usados por JS pero no en HTML): ${missing.length}`);
if (missing.length) console.log('  -> ' + missing.join(', '));

// Dupes se calculan con Set arriba, revisar con frecuencia real
const freq = {};
for (const id of htmlIds) freq[id] = (freq[id] || 0) + 1;
const dupes2 = Object.entries(freq).filter(([, n]) => n > 1);
console.log(`IDs duplicados: ${dupes2.length}`);
if (dupes2.length) console.log('  -> ' + dupes2.map(([id]) => id).join(', '));

process.exit(missing.length ? 1 : 0);