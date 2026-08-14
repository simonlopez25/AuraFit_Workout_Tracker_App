/**
 * AuraFit Pro — Supabase Client (supabaseClient.js)
 * Initializes the global Supabase client using credentials from config.js.
 * Exposes `supabaseClient` and `getCurrentUser()` globally.
 *
 * Requires: config.js loaded first, and the Supabase CDN script in index.html.
 */

(function initSupabaseClient() {
  // The Supabase JS SDK CDN exposes `supabase` globally as window.supabase
  if (!window.supabase) {
    console.error("[AuraFit] Supabase SDK not loaded. Check the CDN <script> tag in index.html.");
    return;
  }

  const { createClient } = window.supabase;
  window.supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  /**
   * Returns the currently authenticated user, or null if not signed in.
   * @returns {Promise<User|null>}
   */
  window.getCurrentUser = async function () {
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    return user ?? null;
  };

  console.log("[AuraFit] Supabase client initialized for:", SUPABASE_CONFIG.url);
})();
