// Verifica que el index.html recompuesto carga todos los CSS y JS referenciados.
const fs = require('fs');
const path = require('path');

const h = fs.readFileSync('index.html', 'utf8');

const css = [...h.matchAll(/<link[^>]+href="([^"]+\.css[^"]*)"/g)].map((m) => m[1]);
const scripts = [...h.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);

console.log('CSS links:');
for (const c of css) {
  const exists = fs.existsSync(path.join(__dirname, '..', c));
  console.log(`  ${c} -> ${exists ? 'OK' : 'MISSING'}`);
}
console.log('JS scripts:');
for (const s of scripts) {
  const exists = fs.existsSync(path.join(__dirname, '..', s));
  console.log(`  ${s} -> ${exists ? 'OK' : 'MISSING'}`);
}

// Verificar estructura básica
const checks = {
  'doctype': /<!doctype html>/i.test(h),
  '<html': /<html lang="es">/.test(h),
  '<head>': /<head>/.test(h),
  'CSS modular link': /css\/tokens\.css/.test(h),
  'NO styles.css': !/css\/styles\.css/.test(h),
  '<body>': /<body>/.test(h),
  'id="app"': /id="app"/.test(h),
  'cierre </body>': /<\/body>/.test(h),
  'cierre </html>': /<\/html>\s*$/.test(h),
  'Supabase SDK': /supabase-js@2/.test(h),
  'scripts finales': /<\/html>/.test(h) && /js\/app\.js/.test(h),
};
console.log('\nEstructura:');
for (const [k, v] of Object.entries(checks)) {
  console.log(`  ${k}: ${v ? 'OK' : 'FALLO'}`);
}
