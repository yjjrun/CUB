import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { initSupabase } from "./supabase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    let active = true;
    let subscription = null;

    initSupabase()
      .then((client) => {
        if (!active) return;
        if (!client) {
          setConfigured(false);
          setLoading(false);
          return;
        }

        setConfigured(true);
        client.auth.getSession().then(({ data }) => {
          if (!active) return;
          setSession(data.session || null);
          setLoading(false);
        });

        const authListener = client.auth.onAuthStateChange((event, nextSession) => {
          if (event === "PASSWORD_RECOVERY") setRecoveryMode(true);
          if (event === "SIGNED_OUT") setRecoveryMode(false);
          setSession(nextSession || null);
          setLoading(false);
        });
        subscription = authListener.data.subscription;
      })
      .catch(() => {
        if (!active) return;
        setConfigured(false);
        setLoading(false);
      });

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({
    session,
    user: session?.user || null,
    accessToken: session?.access_token || "",
    loading,
    isConfigured: configured,
    recoveryMode,
    clearRecoveryMode: () => setRecoveryMode(false),
  }), [configured, loading, recoveryMode, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
