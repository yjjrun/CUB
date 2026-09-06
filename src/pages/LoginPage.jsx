import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../lib/auth.jsx";

function nextTarget() {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next") || "/profile";
  return next.startsWith("/") ? next : "/profile";
}

function routeFromNext(next) {
  if (next === "/care") return "care";
  if (next === "/match") return "match";
  if (next === "/partner") return "partner";
  if (next === "/about/faq" || next === "/faq") return "faq";
  if (next === "/about/team" || next === "/team") return "team";
  return "profile";
}

export default function LoginPage({ navigate }) {
  const { user, loading, isConfigured, recoveryMode, clearRecoveryMode } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const target = useMemo(nextTarget, []);
  const isRecovery = recoveryMode || window.location.hash.includes("type=recovery");

  useEffect(() => {
    if (!loading && user && !isRecovery) navigate(routeFromNext(target));
  }, [isRecovery, loading, navigate, target, user]);

  const submitLogin = async (event) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError("");
    setMessage("");
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    navigate(routeFromNext(target));
  };

  const submitNewPassword = async (event) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError("");
    setMessage("");
    const { error: authError } = await supabase.auth.updateUser({ password: newPassword });
    setBusy(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    clearRecoveryMode();
    setMessage("Password updated. You are signed in.");
    window.history.replaceState({}, "", "/profile");
    navigate("profile");
  };

  if (loading) {
    return (
      <AuthShell title="Checking your account" eyebrow="CUB account">
        <p className="helper-copy">One moment...</p>
      </AuthShell>
    );
  }

  if (!isConfigured) {
    return (
      <AuthShell title="Log in to CUB" eyebrow="Account setup">
        <p className="notice error">
          Supabase is not configured yet. Add the Supabase URL and publishable key to CUB's environment.
        </p>
      </AuthShell>
    );
  }

  if (isRecovery) {
    return (
      <AuthShell title="Set a new password" eyebrow="Password reset">
        <form className="access-form" onSubmit={submitNewPassword}>
          {message && <p className="notice success">{message}</p>}
          {error && <p className="notice error">{error}</p>}
          <label className="field">
            <span>New password</span>
            <input
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
          </label>
          <button className="primary-action" type="submit" disabled={busy || newPassword.length < 8}>
            {busy ? "Saving..." : "Update password"}
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Welcome back"
      eyebrow="CUB account"
      copy="Log in to save matches, favourites, reminders, scans, and Care checklists across devices."
    >
      <form className="access-form" onSubmit={submitLogin}>
        {error && <p className="notice error">{error}</p>}
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button className="primary-action" type="submit" disabled={busy}>
          {busy ? "Logging in..." : "Log in"}
        </button>
        <div className="auth-form-links">
          <button type="button" className="link-action" onClick={() => navigate("signup", { next: target })}>
            Create account
          </button>
          <button type="button" className="link-action" onClick={() => navigate("forgotPassword")}>
            Forgot password?
          </button>
        </div>
      </form>
    </AuthShell>
  );
}

export function AuthShell({ eyebrow, title, copy, children }) {
  return (
    <main className="screen auth-screen">
      <section className="access-card auth-card panel">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {copy && <p>{copy}</p>}
        </div>
        {children}
      </section>
    </main>
  );
}
