/**
 * AuraFit Pro — Auth Manager (auth.js)
 * Handles user registration, login, logout, and session state changes.
 * Integrates with Supabase Auth and keeps the UI header in sync.
 *
 * Requires: supabaseClient.js loaded first.
 */

class AuthManager {
  constructor() {
    this._onChangeCallbacks = [];
    this.currentUser = null;
  }

  /**
   * Initialize: restore existing session and subscribe to auth state changes.
   * Should be called once at app startup, before any DB operations.
   */
  async init() {
    if (!window.supabaseClient) {
      console.warn("[Auth] Supabase client not available. Running in offline/local mode.");
      return;
    }

    // Restore existing session
    try {
      const user = await getCurrentUser();
      this.currentUser = user;
    } catch (error) {
      // Keep the app usable offline if Supabase is temporarily unavailable.
      console.warn("[Auth] Unable to restore the Supabase session.", error);
      this.currentUser = null;
    }

    // Subscribe to future auth state changes
    window.supabaseClient.auth.onAuthStateChange((_event, session) => {
      this.currentUser = session?.user ?? null;
      this._onChangeCallbacks.forEach(cb => cb(this.currentUser));
    });
  }

  /**
   * Register a new user with email and password.
   * @returns {{ user, error }}
   */
  async signUp(email, password) {
    const { data, error } = await window.supabaseClient.auth.signUp({
      email: email.trim(),
      password
    });
    return { user: data?.user ?? null, error };
  }

  /**
   * Sign in an existing user with email and password.
   * @returns {{ user, error }}
   */
  async signIn(email, password) {
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
      email: email.trim(),
      password
    });
    return { user: data?.user ?? null, error };
  }

  /**
   * Sign out the current user.
   */
  async signOut() {
    await window.supabaseClient.auth.signOut();
    this.currentUser = null;
  }

  /**
   * Register a callback to be fired whenever auth state changes.
   * @param {(user: User|null) => void} callback
   */
  onChange(callback) {
    this._onChangeCallbacks.push(callback);
  }

  /**
   * Returns true if a user is currently authenticated.
   */
  get isLoggedIn() {
    return Boolean(this.currentUser);
  }

  /**
   * Returns a human-friendly label for the user (email prefix or full email).
   */
  get userLabel() {
    if (!this.currentUser) return null;
    const email = this.currentUser.email || "";
    return email.length > 22 ? email.slice(0, 20) + "…" : email;
  }

  /**
   * Translate Supabase error codes into user-friendly Spanish messages.
   */
  static friendlyError(error) {
    if (!error) return null;
    const msg = (error.message || "").toLowerCase();
    if (msg.includes("invalid login credentials")) return "Email o contraseña incorrectos.";
    if (msg.includes("email not confirmed")) return "Confirma tu email antes de iniciar sesión.";
    if (msg.includes("user already registered")) return "Este email ya tiene una cuenta. Inicia sesión.";
    if (msg.includes("password should be at least")) return "La contraseña debe tener al menos 6 caracteres.";
    if (msg.includes("rate limit")) return "Demasiados intentos. Espera unos minutos.";
    if (msg.includes("network") || msg.includes("fetch")) return "Sin conexión. Comprueba tu red.";
    return error.message || "Error desconocido. Inténtalo de nuevo.";
  }
}

// Global singleton
const authManager = new AuthManager();
