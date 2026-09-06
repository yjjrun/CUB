import { useEffect, useState } from "react";
import { loadSavedMatches } from "../api.js";
import { useAuth } from "../lib/auth.jsx";
import { supabase } from "../lib/supabase.js";
import { AuthShell } from "./LoginPage.jsx";

export default function ProfilePage({ navigate }) {
  const { user, accessToken, loading, isConfigured } = useAuth();
  const [matches, setMatches] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!accessToken) return undefined;
    let active = true;
    loadSavedMatches(accessToken)
      .then((items) => {
        if (active) setMatches(items);
      })
      .catch(() => {
        if (active) setStatus("Saved matches could not be loaded.");
      });
    return () => {
      active = false;
    };
  }, [accessToken]);

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    navigate("home");
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
      <AuthShell title="CUB account" eyebrow="Account setup">
        <p className="notice error">
          Supabase is not configured yet. Add the Supabase URL and publishable key to CUB's environment.
        </p>
      </AuthShell>
    );
  }

  if (!user) {
    return (
      <AuthShell
        title="Log in to your CUB account"
        eyebrow="CUB account"
        copy="Save matches, favourites, reminders, scans, and Care checklists across devices."
      >
        <div className="access-form auth-choice">
          <button className="primary-action" type="button" onClick={() => navigate("login", { next: "/profile" })}>
            Log in
          </button>
          <button className="secondary-outline-action" type="button" onClick={() => navigate("signup", { next: "/profile" })}>
            Create account
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <main className="screen auth-screen">
      <section className="profile-shell panel">
        <div className="profile-head">
          <div>
            <p className="eyebrow">CUB account</p>
            <h1>{user.user_metadata?.name || "Your profile"}</h1>
            <p>{user.email}</p>
          </div>
          <button className="secondary-outline-action" type="button" onClick={signOut}>Log out</button>
        </div>

        {status && <p className="notice error">{status}</p>}

        <div className="profile-actions">
          <button className="primary-action" type="button" onClick={() => navigate("care")}>
            Open CUB Care
          </button>
          <button className="secondary-outline-action" type="button" onClick={() => navigate("match")}>
            Find more matches
          </button>
        </div>

        <section className="profile-section">
          <h2>Saved matches</h2>
          {matches.length ? (
            <ul className="saved-match-list">
              {matches.map((item) => (
                <li key={item.dogId}>
                  <span>{item.dogName || "Saved dog"}</span>
                  <b>{item.compatibilityScore}%</b>
                </li>
              ))}
            </ul>
          ) : (
            <p className="helper-copy">No saved matches yet.</p>
          )}
        </section>
      </section>
    </main>
  );
}
