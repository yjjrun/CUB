import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "./supabase.js";
import { syncBrowserCareData } from "./careSync.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session || null);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "PASSWORD_RECOVERY") setRecoveryMode(true);
      if (event === "SIGNED_OUT") setRecoveryMode(false);
      setSession(nextSession || null);
      setLoading(false);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.access_token) return undefined;
    let cancelled = false;
    syncBrowserCareData(session.access_token).catch(() => {
      if (!cancelled) {
        // Care data remains available locally if the cloud sync is unavailable.
      }
    });
    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  const value = useMemo(() => ({
    session,
    user: session?.user || null,
    accessToken: session?.access_token || "",
    loading,
    isConfigured: isSupabaseConfigured,
    recoveryMode,
    clearRecoveryMode: () => setRecoveryMode(false),
  }), [loading, recoveryMode, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
