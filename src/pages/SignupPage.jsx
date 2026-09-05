import { useMemo, useState } from "react";
import { createProfile } from "../api.js";
import { useAuth } from "../lib/auth.jsx";
import { supabase } from "../lib/supabase.js";
import { AuthShell } from "./LoginPage.jsx";

function nextTarget() {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next") || "/profile";
  return next.startsWith("/") ? next : "/profile";
}

function routeFromNext(next) {
  if (next === "/care") return "care";
  if (next === "/match") return "match";
  return "profile";
}

export default function SignupPage({ navigate }) {
  const { isConfigured } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const target = useMemo(nextTarget, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError("");
    setMessage("");

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name.trim() },
        emailRedirectTo: `${window.location.origin}${target}`,
      },
    });

    if (authError) {
      setBusy(false);
      setError(authError.message);
      return;
    }

    if (data.session?.access_token) {
      try {
        await createProfile(data.session.access_token, { name: name.trim() });
      } catch {
        // Profile creation can be retried after login; Auth remains the source of truth.
      }
      setBusy(false);
      navigate(routeFromNext(target));
      return;
    }

    setBusy(false);
    setMessage("Check your email to confirm your CUB account, then log in.");
  };

  if (!isConfigured) {
    return (
      <AuthShell title="Create a CUB account" eyebrow="Account setup">
        <p className="notice error">
          Supabase is not configured yet. Add the Supabase URL and publishable key to CUB's environment.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create a free account"
      eyebrow="CUB account"
      copy="Your matches are ready. Create an account to save them and keep CUB Care in sync."
    >
      <form className="access-form" onSubmit={submit}>
        {message && <p className="notice success">{message}</p>}
        {error && <p className="notice error">{error}</p>}
        <label className="field">
          <span>Name</span>
          <input
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Optional"
          />
        </label>
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
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button className="primary-action" type="submit" disabled={busy || password.length < 8}>
          {busy ? "Creating account..." : "Create account"}
        </button>
        <button type="button" className="link-action auth-single-link" onClick={() => navigate("login", { next: target })}>
          Already have an account?
        </button>
      </form>
    </AuthShell>
  );
}
