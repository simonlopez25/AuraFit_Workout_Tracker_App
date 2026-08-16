/**
 * AuraFit Pro — Database Adapter (db.js)
 * Unified persistence layer: Supabase when authenticated, localStorage as fallback.
 *
 * Table schema expected in Supabase:
 *   routines      (id TEXT, user_id UUID, data JSONB, updated_at TIMESTAMPTZ)
 *   workout_logs  (id TEXT, user_id UUID, data JSONB, logged_at TIMESTAMPTZ)
 *
 * RLS policies must restrict SELECT/INSERT/UPDATE/DELETE to auth.uid() = user_id.
 */

class DatabaseAdapter {
  constructor() {
    this.STORAGE_PREFIX = "aurafit_saas_";
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  _readLocal(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn("[AuraFit DB] Error reading local key:", key, e);
      return fallback;
    }
  }

  _writeLocal(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("[AuraFit DB] Error writing local key:", key, e);
    }
  }

  /** Returns the Supabase client if available and user is logged in. */
  get _sb() {
    return (window.supabaseClient && authManager?.isLoggedIn) ? window.supabaseClient : null;
  }

  /** Returns current user id, or null. */
  get _uid() {
    return authManager?.currentUser?.id ?? null;
  }

  // ─── User Profile ─────────────────────────────────────────────────────────

  async getUserProfile() {
    const defaultProfile = {
      userId: this._uid || "guest",
      name: "Atleta AuraFit",
      email: authManager?.currentUser?.email || "",
      isCloudSynced: Boolean(this._sb),
      lastSync: new Date().toISOString()
    };
    return this._readLocal(`${this.STORAGE_PREFIX}profile`, defaultProfile);
  }

  async saveUserProfile(profileData) {
    this._writeLocal(`${this.STORAGE_PREFIX}profile`, profileData);
  }

  // ─── Routines ─────────────────────────────────────────────────────────────

  async getRoutines() {
    // Cloud: fetch all routines for current user
    if (this._sb) {
      try {
        const { data, error } = await this._sb
          .from("routines")
          .select("data")
          .eq("user_id", this._uid)
          .order("updated_at", { ascending: false });

        if (error) throw error;

        // data is an array of rows; each row has a `data` JSONB column containing the full routine object
        const routines = (data || []).map(row => row.data).filter(Boolean);
        // Keep local cache in sync
        this._writeLocal(`${this.STORAGE_PREFIX}routines`, routines);
        return routines;
      } catch (e) {
        console.warn("[AuraFit DB] Cloud fetch failed, using local cache.", e);
      }
    }
    // Local fallback
    return this._readLocal(`${this.STORAGE_PREFIX}routines`, null);
  }

  async saveRoutines(routines) {
    // Always keep a local copy for offline support
    this._writeLocal(`${this.STORAGE_PREFIX}routines`, routines);

    if (this._sb) {
      try {
        // Upsert each routine individually (Supabase requires one row per routine)
        const upsertRows = routines.map(routine => ({
          id: routine.id,
          user_id: this._uid,
          data: routine,
          updated_at: new Date().toISOString()
        }));

        const { error } = await this._sb
          .from("routines")
          .upsert(upsertRows, { onConflict: "id" });

        if (error) throw error;
      } catch (e) {
        console.warn("[AuraFit DB] Cloud save failed. Data preserved locally.", e);
      }
    }
  }

  /**
   * Delete a single routine from Supabase and local cache.
   * Called by RoutineManager.deleteRoutine() after filtering the array.
   */
  async deleteRoutineById(routineId) {
    if (this._sb) {
      try {
        const { error } = await this._sb
          .from("routines")
          .delete()
          .eq("id", routineId)
          .eq("user_id", this._uid);
        if (error) throw error;
      } catch (e) {
        console.warn("[AuraFit DB] Cloud delete failed.", e);
      }
    }
    // Local handled by saveRoutines() called from RoutineManager
  }

  // ─── Workout Logs ─────────────────────────────────────────────────────────

  async logWorkoutSession(sessionData) {
    const entry = {
      id: `session-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...sessionData
    };

    // Save locally
    const history = await this.getWorkoutHistory();
    history.push(entry);
    this._writeLocal(`${this.STORAGE_PREFIX}history`, history);

    // Save to cloud
    if (this._sb) {
      try {
        const { error } = await this._sb
          .from("workout_logs")
          .insert({
            id: entry.id,
            user_id: this._uid,
            data: entry,
            logged_at: entry.timestamp
          });
        if (error) throw error;
      } catch (e) {
        console.warn("[AuraFit DB] Cloud workout log failed. Saved locally.", e);
      }
    }
  }

  async getWorkoutHistory() {
    if (this._sb) {
      try {
        const { data, error } = await this._sb
          .from("workout_logs")
          .select("data")
          .eq("user_id", this._uid)
          .order("logged_at", { ascending: false })
          .limit(200);

        if (error) throw error;
        const history = (data || []).map(row => row.data).filter(Boolean);
        this._writeLocal(`${this.STORAGE_PREFIX}history`, history);
        return history;
      } catch (e) {
        console.warn("[AuraFit DB] Cloud history fetch failed, using local.", e);
      }
    }
    return this._readLocal(`${this.STORAGE_PREFIX}history`, []);
  }

  // ─── Cloud Sync ───────────────────────────────────────────────────────────

  /**
   * Migrate all local-only routines to Supabase after the user logs in.
   * Called once when a guest logs in for the first time.
   * @returns {number} number of routines synced
   */
  async syncLocalToCloud() {
    if (!this._sb) return 0;
    const local = this._readLocal(`${this.STORAGE_PREFIX}routines`, []);
    if (!local || !local.length) return 0;

    // Check if cloud already has data
    const { data: existing } = await this._sb
      .from("routines")
      .select("id, data")
      .eq("user_id", this._uid);

    const existingIds = new Set((existing || []).map(r => r.id));
    const toSync = local.filter(r => !existingIds.has(r.id));

    if (!toSync.length) return 0;

    await this.saveRoutines([...toSync, ...(existing ? existing.map(r => r.data).filter(Boolean) : [])]);
    return toSync.length;
  }
}

// Global singleton
const dbAdapter = new DatabaseAdapter();
