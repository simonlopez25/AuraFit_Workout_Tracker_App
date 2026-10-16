/**
 * AuraFit — Verificación de seguridad de datos
 * ----------------------------------------------
 * Prueba de estrés del blindaje: comprueba que la app NUNCA borra datos
 * automáticamente y que el sistema de respaldos/papelera funciona.
 *
 * Ejecutar con: npm run verify:data
 * (Usa fake-indexeddb para simular el IndexedDB del navegador en Node)
 */
import 'fake-indexeddb/auto';

// --- Shims de navegador -----------------------------------------------------
const localStore = new Map();
globalThis.localStorage = {
  getItem: (k) => (localStore.has(k) ? localStore.get(k) : null),
  setItem: (k, v) => localStore.set(k, String(v)),
  removeItem: (k) => localStore.delete(k),
  clear: () => localStore.clear()
};

// --- Módulos bajo prueba ----------------------------------------------------
const dbModule = await import('../src/storage/db.js');
const { db, initDatabase, seedSampleRoutines, importData, restoreFromData } = dbModule;
const backups = await import('../src/storage/backups.js');
const {
  createSnapshot,
  refreshMirror,
  checkIntegrity,
  getBestRecoveryData,
  getTrash,
  restoreFromTrash,
  purgeFromTrash,
  persistWorkout,
  enqueuePendingWorkout,
  flushPendingWorkouts,
  readPendingWorkouts
} = backups;

let passed = 0;
let failed = 0;

function check(name, condition, extra = '') {
  if (condition) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.error(`  FAIL  ${name}${extra ? ` — ${extra}` : ''}`);
  }
}

function section(title) {
  console.log(`\n== ${title} ==`);
}

try {
  // ---------------------------------------------------------------------
  section('1. Primera instalación: seed correcto');
  await initDatabase();
  check('Se sembraron 4 rutinas por defecto', (await db.routines.count()) === 4, `count=${await db.routines.count()}`);
  check('Se sembró el schedule (6 días)', (await db.schedule.count()) === 6);
  check('Bandera de inicialización presente', Boolean(await db.settings.get('hasInitializedDatabase')));

  // ---------------------------------------------------------------------
  section('2. Datos del usuario + init concurrente (race de StrictMode)');
  await db.routines.add({
    id: 'user_1',
    name: 'Mi Rutina Personalizada',
    category: 'fuerza',
    exercises: [{ id: 'ex1', name: 'Press', muscle: 'Pecho', sets: [] }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  await persistWorkout({
    id: 'wo_1',
    routineName: 'Mi Rutina Personalizada',
    date: '2026-10-15',
    startedAt: new Date().toISOString(),
    endedAt: new Date().toISOString(),
    exercises: []
  });

  // Simula App montada dos veces (React.StrictMode): debe inicializar UNA vez
  await Promise.all([initDatabase(), initDatabase(), initDatabase()]);
  check('Init concurrente no duplica ni borra (5 rutinas)', (await db.routines.count()) === 5, `count=${await db.routines.count()}`);
  check('Historial intacto tras init concurrente', (await db.workouts.count()) === 1);

  // ---------------------------------------------------------------------
  section('3. "Cargar Plantillas" idempotente (antiguo bug de la bandera)');
  await seedSampleRoutines();
  await seedSampleRoutines();
  check('Sin rutinas duplicadas tras cargar plantillas 2 veces', (await db.routines.count()) === 5, `count=${await db.routines.count()}`);
  check('La bandera NO se borró', Boolean(await db.settings.get('hasInitializedDatabase')));
  check('Historial intacto', (await db.workouts.count()) === 1);

  // ---------------------------------------------------------------------
  section('4. Error transitorio en init: NUNCA borra la BD');
  // Instancia de módulo fresca (como un arranque nuevo de la app)
  const fresh = await import('../src/storage/db.js?test=error-path');
  let failOnce = true;
  const origGet = fresh.db.settings.get.bind(fresh.db.settings);
  fresh.db.settings.get = (...args) => {
    if (failOnce) {
      failOnce = false;
      throw new Error('fallo transitorio simulado de IndexedDB');
    }
    return origGet(...args);
  };

  let initRejected = false;
  try {
    await fresh.initDatabase();
  } catch (e) {
    initRejected = true;
  }
  check('initDatabase propaga el error (sin catch destructivo)', initRejected);
  check('NO se borró ninguna rutina', (await db.routines.count()) === 5, `count=${await db.routines.count()}`);
  check('NO se borró el historial', (await db.workouts.count()) === 1);

  // Reintento: con el fallo consumido, el init debe funcionar
  await fresh.initDatabase();
  check('El reintento de init funciona', true);

  // ---------------------------------------------------------------------
  section('5. Bandera perdida con datos presentes: no re-sembrar');
  await db.settings.delete('hasInitializedDatabase');
  // Instancia fresca = simulación de un arranque nuevo de la app
  const fresh2 = await import('../src/storage/db.js?test=missing-flag');
  await fresh2.initDatabase();
  check('La bandera se restauró', Boolean(await db.settings.get('hasInitializedDatabase')));
  check('NO se re-sembraron rutinas encima (siguen 5)', (await db.routines.count()) === 5, `count=${await db.routines.count()}`);
  check('Historial intacto', (await db.workouts.count()) === 1);

  // ---------------------------------------------------------------------
  section('6. Snapshots automáticos y rotación (máx. 10)');
  for (let i = 0; i < 15; i++) {
    await createSnapshot(`test_${i}`);
  }
  const snapCount = await db.backups.count();
  check('Rotación limita a 10 snapshots', snapCount <= 10, `count=${snapCount}`);
  const latest = await backups.getLatestSnapshot();
  check('El último snapshot contiene las rutinas', latest?.data?.routines?.length === 5);

  // ---------------------------------------------------------------------
  section('7. Papelera (soft-delete) de rutinas');
  await db.routines.update('user_1', { deletedAt: new Date().toISOString() });
  let trash = await getTrash();
  check('La rutina eliminada aparece en la papelera', trash.routines.some((r) => r.id === 'user_1'));
  const activeRoutines = (await db.routines.toArray()).filter((r) => !r.deletedAt);
  check('NO aparece en la lista activa', !activeRoutines.some((r) => r.id === 'user_1'));

  await restoreFromTrash('routine', 'user_1');
  trash = await getTrash();
  check('Restaurar desde papelera la devuelve', !trash.routines.some((r) => r.id === 'user_1'));
  check('Visible de nuevo en la lista activa', (await db.routines.toArray()).some((r) => r.id === 'user_1' && !r.deletedAt));

  // ---------------------------------------------------------------------
  section('8. Detección de pérdida de datos + restauración');
  await refreshMirror(); // espejo con estado bueno conocido
  // Simulamos una pérdida real (como la del viejo bug / evicción del navegador)
  await db.routines.delete('user_1');
  const integrityLost = await checkIntegrity();
  check('La pérdida se detecta', integrityLost.ok === false, JSON.stringify(integrityLost));
  check('Reporta rutinas faltantes', Boolean(integrityLost.missing?.routines));

  const recovery = await getBestRecoveryData();
  check('Hay datos de recuperación disponibles', Boolean(recovery?.routines?.length));
  await restoreFromData(recovery);
  check('Tras restaurar, la rutina recuperada existe', (await db.routines.toArray()).some((r) => r.id === 'user_1'));
  const integrityOk = await checkIntegrity();
  check('Integridad OK tras restaurar', integrityOk.ok === true, JSON.stringify(integrityOk));

  // ---------------------------------------------------------------------
  section('9. Purga definitiva desde papelera (con snapshot previo)');
  await db.routines.update('user_1', { deletedAt: new Date().toISOString() });
  await purgeFromTrash('routine', 'user_1');
  trash = await getTrash();
  check('La purga la retira de la papelera', !trash.routines.some((r) => r.id === 'user_1'));
  check('La purga la elimina de la BD', !(await db.routines.toArray()).some((r) => r.id === 'user_1'));
  const integrityAfterPurge = await checkIntegrity();
  check('Sin falsa alarma tras purga', integrityAfterPurge.ok === true, JSON.stringify(integrityAfterPurge));

  // ---------------------------------------------------------------------
  section('10. Cola de emergencia de entrenamientos (IndexedDB caído)');
  enqueuePendingWorkout({
    id: 'wo_pending_1',
    routineName: 'Entreno de Prueba',
    date: '2026-10-16',
    startedAt: new Date().toISOString(),
    endedAt: new Date().toISOString(),
    exercises: []
  });
  check('La cola retiene el registro en localStorage', readPendingWorkouts().length === 1);
  const flushed = await flushPendingWorkouts();
  check('El vuelco a IndexedDB funciona', flushed === 1);
  check('La cola queda vacía', readPendingWorkouts().length === 0);
  check('El entreno está en la BD', (await db.workouts.toArray()).some((w) => w.id === 'wo_pending_1'));

  // ---------------------------------------------------------------------
  section('11. Importación de backup validada');
  const bad = await importData('esto no es json');
  check('JSON inválido rechazado', bad.success === false);
  const badShape = await importData('{"foo":1}');
  check('Formato con estructura inválida rechazado', badShape.success === false);

  const goodBackup = JSON.stringify({
    app: 'AuraFit',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: await backups.collectData()
  });
  const good = await importData(goodBackup);
  check('Backup válido importado', good.success === true, good.message);
  check('Rutinas intactas tras importar', (await db.routines.count()) === 4, `count=${await db.routines.count()}`);
  check('Historial intacto tras importar', (await db.workouts.count()) === 2, `count=${await db.workouts.count()}`);

  // ---------------------------------------------------------------------
  section('12. Estado final: init sigue sano y nada se perdió');
  await initDatabase();
  check('initDatabase resuelve sin errores', true);
  check('Las 4 rutinas por defecto siguen presentes', (await db.routines.count()) === 4);
  check('Los entrenamientos siguen presentes', (await db.workouts.count()) === 2);
  check('La bandera sigue activa', Boolean(await db.settings.get('hasInitializedDatabase')));
} catch (err) {
  failed++;
  console.error('\nERROR INESPERADO:', err);
}

console.log(`\n----------------------------------------`);
console.log(`Resultado: ${passed} pass, ${failed} fail`);
console.log(`----------------------------------------`);
process.exit(failed > 0 ? 1 : 0);
