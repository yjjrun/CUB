import { createClient } from "@supabase/supabase-js";

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
let supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "";

export let isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
export let supabase = null;
let initPromise = null;

function createSupabaseClient() {
  isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
  supabase = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;
  return supabase;
}

export async function initSupabase() {
  if (supabase || initPromise) return initPromise || Promise.resolve(supabase);

  initPromise = (async () => {
    if (!supabaseUrl || !supabaseKey) {
      try {
        const res = await fetch("/api/config");
        if (res.ok) {
          const config = await res.json();
          supabaseUrl = config.supabaseUrl || "";
          supabaseKey = config.supabasePublishableKey || "";
        }
      } catch {
        // The auth UI will show the normal "not configured" state.
      }
    }
    return createSupabaseClient();
  })();

  return initPromise;
}
