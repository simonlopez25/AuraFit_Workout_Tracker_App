import { db } from './db.js';

// ---------------------------------------------------------------------------
// Sistema de blindaje de datos de AuraFit
// - Snapshots automáticos en IndexedDB (tabla `backups`, últimos 10)
// - Espejo en localStorage (redundancia si el navegador evicciona IndexedDB)
// - Verificación de integridad al arrancar (detecta datos faltantes)
// - Papelera (soft-delete) para rutinas e historial
// - Cola de emergencia si IndexedDB no está disponible al guardar un entreno
// ---------------------------------------------------------------------------

const MIRROR_KEY = 'aurafit_last_backup';
const PENDING_KEY = 'aurafit_pending_workouts';
const MAX_SNAPSHOTS = 10;
const MIRROR_MAX_BYTES = 2_500_000;

export const DATA_CHANGED_EVENT = 'aurafit:data-changed';

// --- Event bus simple para que las vistas se recarguen tras mutaciones ------

export function notifyDataChanged() {
  try {
    window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT));
  } catch (e) {
    // entorno sin CustomEvent: ignorar
  }
}

export function onDataChanged(handler) {
  window.addEventListener(DATA_CHANGED_EVENT, handler);
  return () => window.removeEventListener(DATA_CHANGED_EVENT, handler);
}

// --- Recolección y espejo ---------------------------------------------------

export async function collectData() {
  const [routines, workouts, schedule, settings] = await Promise.all([
    db.routines.toArray(),
    db.workouts.toArray(),
    db.schedule.toArray(),
    db.settings.toArray()
  ]);
  return { routines, workouts, schedule, settings };
}

function writeMirror(data) {
  try {
    const counts = {
      routines: data.routines.length,
      workouts: data.workouts.length,
      schedule: data.schedule.length
    };
    let payload = { savedAt: new Date().toISOString(), trimmed: false, counts, data };
    let raw = JSON.stringify(payload);
    // Si el historial es muy grande para localStorage, guardamos el espejo
    // sin workouts (las rutinas/config caben siempre). Los snapshots de
    // IndexedDB siguen manteniendo el historial completo.
    if (raw.length > MIRROR_MAX_BYTES) {
      payload = { savedAt: payload.savedAt, trimmed: true, counts, data: { ...data, workouts: [] } };
      raw = JSON.stringify(payload);
    }
    localStorage.setItem(MIRROR_KEY, raw);
  } catch (err) {
    console.warn('[AuraFit] No se pudo actualizar el espejo de seguridad:', err);
  }
}

export function readMirror() {
  try {
    const raw = localStorage.getItem(MIRROR_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.data ? parsed : null;
  } catch (err) {
    console.warn('[AuraFit] Espejo de seguridad ilegible:', err);
    return null;
  }
}

export async function refreshMirror() {
  try {
    writeMirror(await collectData());
  } catch (err) {
    console.warn('[AuraFit] No se pudo refrescar el espejo:', err);
  }
}

// --- Snapshots automáticos --------------------------------------------------

export async function createSnapshot(reason) {
  try {
    const data = await collectData();
    const snapshot = {
      id: `snap_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      reason: reason || 'auto',
      data
    };
    await db.backups.add(snapshot);

    // Rotación: conservar solo los últimos N respaldos
    const all = await db.backups.orderBy('createdAt').toArray();
    if (all.length > MAX_SNAPSHOTS) {
      const stale = all.slice(0, all.length - MAX_SNAPSHOTS).map((s) => s.id);
      await db.backups.bulkDelete(stale);
    }

    writeMirror(data);
    return snapshot;
  } catch (err) {
    // Un fallo de respaldo nunca debe bloquear la operación principal
    console.warn('[AuraFit] No se pudo crear el respaldo automático:', err);
    return null;
  }
}

export async function getLatestSnapshot() {
  try {
    const all = await db.backups.orderBy('createdAt').toArray();
    return all.length ? all[all.length - 1] : null;
  } catch (err) {
    console.warn('[AuraFit] No se pudieron leer los respaldos:', err);
    return null;
  }
}

export async function listSnapshots() {
  try {
    const all = await db.backups.orderBy('createdAt').toArray();
    return all.reverse();
  } catch (err) {
    return [];
  }
}

// --- Verificación de integridad --------------------------------------------

// Compara los conteos actuales contra el último espejo conocido.
// Si la BD tiene MENOS registros que la última sesión, hubo pérdida.
// (Se cuentan también los elementos de la papelera: un soft-delete nunca
// dispara esta alarma, solo la pérdida real de datos.)
export async function checkIntegrity() {
  const mirror = readMirror();
  if (!mirror || !mirror.counts) return { ok: true, reason: 'no-mirror' };

  try {
    const current = {
      routines: await db.routines.count(),
      workouts: await db.workouts.count(),
      schedule: await db.schedule.count()
    };

    const missing = {};
    for (const key of ['routines', 'workouts', 'schedule']) {
      if (current[key] < mirror.counts[key]) {
        missing[key] = { was: mirror.counts[key], now: current[key] };
      }
    }

    if (Object.keys(missing).length > 0) {
      return { ok: false, missing, mirror };
    }
    return { ok: true, current };
  } catch (err) {
    // Si no podemos verificar, no bloqueamos la app; solo informamos.
    console.warn('[AuraFit] Verificación de integridad fallida:', err);
    return { ok: true, reason: 'check-failed' };
  }
}

// Mejor fuente disponible para recuperar datos:
// 1) último snapshot completo (IndexedDB), 2) espejo local (localStorage).
export async function getBestRecoveryData() {
  try {
    const snap = await getLatestSnapshot();
    if (snap && snap.data && Array.isArray(snap.data.routines)) {
      return snap.data;
    }
  } catch (e) {
    console.warn('[AuraFit] Snapshot ilegible:', e);
  }

  const mirror = readMirror();
  if (mirror && mirror.data && Array.isArray(mirror.data.routines)) {
    let data = mirror.data;
    if (!Array.isArray(data.workouts) || data.workouts.length === 0) {
      // Espejo recortado por tamaño: conservar los workouts actuales
      try {
        data = { ...data, workouts: await db.workouts.toArray() };
      } catch (e) {
        data = { ...data, workouts: [] };
      }
    }
    return data;
  }
  return null;
}

// --- Persistencia a prueba de fallos (entrenamientos) ----------------------

export async function persistWorkout(record) {
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // put() en vez de add(): idempotente, jamás falla por clave duplicada
      await db.workouts.put(record);
      return true;
    } catch (err) {
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, 200 * attempt));
    }
  }
  throw lastError;
}

export function enqueuePendingWorkout(record) {
  const queue = readPendingWorkouts();
  queue.push(record);
  localStorage.setItem(PENDING_KEY, JSON.stringify(queue));
}

export function readPendingWorkouts() {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function clearPendingWorkouts() {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch (e) {
    // ignorar
  }
}

// Vuelca la cola de emergencia a IndexedDB (si IndexedDB sigue caído,
// la cola permanece intacta y se reintentará en el próximo arranque).
export async function flushPendingWorkouts() {
  const queue = readPendingWorkouts();
  if (!queue.length) return 0;
  try {
    await db.workouts.bulkPut(queue);
    clearPendingWorkouts();
    notifyDataChanged();
    return queue.length;
  } catch (err) {
    console.warn('[AuraFit] No se pudo vaciar la cola de emergencia:', err);
    return 0;
  }
}

// --- Papelera (soft-delete) -------------------------------------------------

export async function getTrash() {
  try {
    const [routines, workouts] = await Promise.all([
      db.routines.filter((r) => Boolean(r.deletedAt)).toArray(),
      db.workouts.filter((w) => Boolean(w.deletedAt)).toArray()
    ]);
    routines.sort((a, b) => String(b.deletedAt).localeCompare(String(a.deletedAt)));
    workouts.sort((a, b) => String(b.deletedAt).localeCompare(String(a.deletedAt)));
    return { routines, workouts };
  } catch (err) {
    console.warn('[AuraFit] No se pudo cargar la papelera:', err);
    return { routines: [], workouts: [] };
  }
}

export async function restoreFromTrash(type, id) {
  if (type === 'routine') {
    await db.routines.update(id, { deletedAt: null });
  } else {
    await db.workouts.update(id, { deletedAt: null });
  }
  await refreshMirror();
  notifyDataChanged();
}

export async function purgeFromTrash(type, id) {
  await createSnapshot('antes-de-purga');
  if (type === 'routine') {
    // Limpiar referencias huérfanas en el schedule
    await db.transaction('rw', db.routines, db.schedule, async () => {
      await db.routines.delete(id);
      const orphaned = await db.schedule.where('routineId').equals(id).toArray();
      if (orphaned.length) {
        await db.schedule.bulkDelete(orphaned.map((s) => s.dayIndex));
      }
    });
  } else {
    await db.workouts.delete(id);
  }
  await refreshMirror();
  notifyDataChanged();
}

export async function purgeAllTrash() {
  const { routines, workouts } = await getTrash();
  if (!routines.length && !workouts.length) return;
  await createSnapshot('antes-de-vaciar-papelera');
  await db.transaction('rw', db.routines, db.workouts, db.schedule, async () => {
    for (const r of routines) {
      await db.routines.delete(r.id);
      const orphaned = await db.schedule.where('routineId').equals(r.id).toArray();
      if (orphaned.length) {
        await db.schedule.bulkDelete(orphaned.map((s) => s.dayIndex));
      }
    }
    for (const w of workouts) {
      await db.workouts.delete(w.id);
    }
  });
  await refreshMirror();
  notifyDataChanged();
}
