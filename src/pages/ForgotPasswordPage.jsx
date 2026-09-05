import { useState } from "react";
import { useAuth } from "../lib/auth.jsx";
import { supabase } from "../lib/supabase.js";
import { AuthShell } from "./LoginPage.jsx";

export default function ForgotPasswordPage({ navigate }) {
  const { isConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError("");
    setMessage("");
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setBusy(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    setMessage("Password reset email sent.");
  };

  if (!isConfigured) {
    return (
      <AuthShell title="Reset password" eyebrow="Account setup">
        <p className="notice error">
          Supabase is not configured yet. Add the Supabase URL and publishable key to CUB's environment.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      eyebrow="CUB account"
      copy="Enter your email and Supabase will send a secure reset link."
    >
      <form className="access-form" onSubmit={submit}>
        {message && <p className="notice success">{message}</p>}
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
        <button className="primary-action" type="submit" disabled={busy}>
          {busy ? "Sending..." : "Send reset email"}
        </button>
        <button type="button" className="link-action auth-single-link" onClick={() => navigate("login")}>
          Back to login
        </button>
      </form>
    </AuthShell>
  );
}
