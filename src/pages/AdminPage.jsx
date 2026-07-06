import { useEffect, useMemo, useState } from "react";
import { adminLogin, createAdminPartner, downloadAdminCsv, loadAdminSummary } from "../api.js";

const ADMIN_TOKEN_KEY = "cub_admin_token";

function storedAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY) || "";
}

export default function AdminPage() {
  const [token, setToken] = useState(storedAdminToken);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const logout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken("");
  };

  if (!token) {
    return (
      <main className="screen partner-screen">
        <section className="access-card panel">
          <div>
            <h1>Admin view</h1>
            <p>Manage partner accounts and review all saved dog records.</p>
          </div>
          <form
            className="access-form"
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              try {
                const payload = await adminLogin(code);
                localStorage.setItem(ADMIN_TOKEN_KEY, payload.token);
                setToken(payload.token);
              } catch (err) {
                setError(err.message || "Could not log in.");
              }
            }}
          >
            {error && <p className="notice error">{error}</p>}
            <label className="field">
              <span>Admin code</span>
              <input type="password" value={code} onChange={(e) => setCode(e.target.value)} />
            </label>
            <button className="primary-action" type="submit">Open Admin</button>
          </form>
        </section>
      </main>
    );
  }

  return <AdminDashboard token={token} onLogout={logout} />;
}

function AdminDashboard({ token, onLogout }) {
  const [summary, setSummary] = useState({ partners: [], dogs: [], totals: { partners: 0, dogs: 0 } });
  const [partnerName, setPartnerName] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [created, setCreated] = useState(null);
  const [error, setError] = useState("");

  const dogsByPartner = useMemo(() => {
    const map = new Map();
    for (const dog of summary.dogs) {
      const key = dog.partnerId || "unassigned";
      map.set(key, [...(map.get(key) || []), dog]);
    }
    return map;
  }, [summary.dogs]);

  const refresh = () => {
    loadAdminSummary(token)
      .then(setSummary)
      .catch((err) => {
        if (err.status === 401) onLogout();
        else setError(err.message || "Could not load admin view.");
      });
  };

  useEffect(refresh, []);

  const exportCsv = async () => {
    setError("");
    try {
      const blob = await downloadAdminCsv(token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cub-admin-export.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      if (err.status === 401) onLogout();
      else setError(err.message || "Could not export CSV.");
    }
  };

  const submitPartner = async (e) => {
    e.preventDefault();
    setError("");
    setCreated(null);
    try {
      const payload = await createAdminPartner(token, {
        name: partnerName,
        code: customCode || undefined,
      });
      setCreated(payload);
      setPartnerName("");
      setCustomCode("");
      refresh();
    } catch (err) {
      if (err.status === 401) onLogout();
      else setError(err.message || "Could not create partner.");
    }
  };

  return (
    <main className="screen admin-page">
      <section className="intro-strip partner">
        <div>
          <h1>Admin view</h1>
          <p className="helper-copy">
            All partner accounts and saved dog records.{" "}
            <button type="button" className="link-action" onClick={onLogout}>Log out</button>
          </p>
        </div>
        <div className="stat-block"><strong>{summary.totals.dogs}</strong><span>total dogs</span></div>
        <div className="stat-block"><strong>{summary.totals.partners}</strong><span>partners</span></div>
      </section>

      {error && <p className="notice error">{error}</p>}

      <div className="admin-grid">
        <section className="panel admin-panel">
          <div className="panel-head"><h2>Create partner account</h2></div>
          <form className="admin-form" onSubmit={submitPartner}>
            <label className="field">
              <span>Partner name</span>
              <input value={partnerName} placeholder="Shelter or pet shop" onChange={(e) => setPartnerName(e.target.value)} />
            </label>
            <label className="field">
              <span>Custom code</span>
              <input value={customCode} placeholder="Optional" onChange={(e) => setCustomCode(e.target.value)} />
            </label>
            <button className="primary-action" type="submit">Create Partner</button>
          </form>
          {created && (
            <div className="admin-code-box">
              <span>New partner code</span>
              <b>{created.code}</b>
              <small>Copy this now. It is only shown once.</small>
            </div>
          )}
        </section>

        <section className="panel admin-panel">
          <div className="panel-head"><h2>Google Sheets</h2></div>
          <p className="helper-copy">
            Download a CSV and import it into Google Sheets. Live sync can be added after a Google
            service account or Apps Script webhook is configured.
          </p>
          <button className="secondary-action admin-export" type="button" onClick={exportCsv}>Download CSV</button>
        </section>
      </div>

      <section className="panel admin-panel">
        <div className="panel-head"><h2>Partners</h2></div>
        {summary.partners.length === 0 ? (
          <p className="helper-copy">No partner accounts yet.</p>
        ) : (
          <div className="admin-table" role="table" aria-label="Partner accounts">
            <div className="admin-table-row head" role="row">
              <span>Partner</span><span>Dogs</span><span>Created</span>
            </div>
            {summary.partners.map((partner) => (
              <div className="admin-table-row" role="row" key={partner.id}>
                <span>{partner.name}</span>
                <span>{partner.dogCount}</span>
                <span>{formatDate(partner.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel admin-panel">
        <div className="panel-head"><h2>Dog records</h2></div>
        {summary.dogs.length === 0 ? (
          <p className="helper-copy">No dogs saved yet.</p>
        ) : (
          <div className="admin-dog-list">
            {summary.partners.map((partner) => (
              <article className="admin-partner-group" key={partner.id}>
                <h3>{partner.name}</h3>
                {(dogsByPartner.get(partner.id) || []).length === 0 ? (
                  <p className="helper-copy">No dogs added.</p>
                ) : (
                  <ul className="database-list">
                    {(dogsByPartner.get(partner.id) || []).map((dog) => (
                      <li key={dog.id}>
                        <b>{dog.name || "Unnamed dog"}</b>
                        <span>{dog.breed} · {dog.cluster} · {dog.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
            {(dogsByPartner.get("unassigned") || []).length > 0 && (
              <article className="admin-partner-group">
                <h3>Unassigned</h3>
                <ul className="database-list">
                  {dogsByPartner.get("unassigned").map((dog) => (
                    <li key={dog.id}>
                      <b>{dog.name || "Unnamed dog"}</b>
                      <span>{dog.breed} · {dog.cluster} · {dog.shelter}</span>
                    </li>
                  ))}
                </ul>
              </article>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function formatDate(value) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
