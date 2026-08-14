/**
 * AuraFit Pro — SaaS Cloud & Local Database Adapter (db.js)
 * Proporciona una interfaz desacoplada asíncrona lista para conectar con Supabase, Firebase o PostgreSQL,
 * ofreciendo persistencia de usuario, rutinas, sesiones de cardio e historial con fallback automático en LocalStorage.
 */

class DatabaseAdapter {
  constructor() {
    this.CLOUD_ENDPOINT_MOCK = null; // Asignar endpoint real de Supabase / Firebase cuando esté configurado
    this.STORAGE_PREFIX = "aurafit_saas_";
    this.isCloudSyncActive = false;
  }

  _readLocal(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn("[AuraFit] No se pudo leer un dato local; se usará un valor seguro.", e);
      return fallback;
    }
  }

  /**
   * Carga el perfil del usuario (Nombre, Nivel, Configuración)
   */
  async getUserProfile() {
    const defaultProfile = {
      userId: "user_pro_01",
      name: "Atleta AuraFit",
      email: "atleta@aurafit.pro",
      isCloudSynced: this.isCloudSyncActive,
      lastSync: new Date().toISOString()
    };

    return this._readLocal(`${this.STORAGE_PREFIX}profile`, defaultProfile);
  }

  /**
   * Guarda o actualiza el perfil del usuario
   */
  async saveUserProfile(profileData) {
    localStorage.setItem(`${this.STORAGE_PREFIX}profile`, JSON.stringify(profileData));
    if (this.isCloudSyncActive) {
      await this._syncToCloudRemote("profile", profileData);
    }
  }

  /**
   * Obtiene todas las rutinas guardadas del usuario
   */
  async getRoutines() {
    return this._readLocal(`${this.STORAGE_PREFIX}routines`, null);
  }

  /**
   * Persiste la lista completa de rutinas
   */
  async saveRoutines(routines) {
    localStorage.setItem(`${this.STORAGE_PREFIX}routines`, JSON.stringify(routines));
    if (this.isCloudSyncActive) {
      await this._syncToCloudRemote("routines", routines);
    }
  }

  /**
   * Registra una sesión de entrenamiento completada (Musculación o Cardio)
   */
  async logWorkoutSession(sessionData) {
    const history = await this.getWorkoutHistory();
    history.push({
      id: `session-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...sessionData
    });
    localStorage.setItem(`${this.STORAGE_PREFIX}history`, JSON.stringify(history));

    if (this.isCloudSyncActive) {
      await this._syncToCloudRemote("history", sessionData);
    }
  }

  /**
   * Retorna el historial de entrenamientos del usuario
   */
  async getWorkoutHistory() {
    return this._readLocal(`${this.STORAGE_PREFIX}history`, []);
  }

  /**
   * Método privado simulado para sincronización remota con Supabase / Firebase
   */
  async _syncToCloudRemote(collectionName, payload) {
    try {
      console.log(`[Cloud DB Sync] Sincronizando colección ${collectionName} con backend SaaS...`, payload);
      // fetch(this.CLOUD_ENDPOINT_MOCK + '/' + collectionName, { method: 'POST', body: JSON.stringify(payload) })
    } catch (e) {
      console.warn("[Cloud DB Sync] Servidor remoto no disponible. Guardado local asegurado.", e);
    }
  }
}

// Instancia global exportada
const dbAdapter = new DatabaseAdapter();
