import { useEffect, useMemo, useState } from "react";
import {
  adminLogin,
  createAdminPartner,
  deleteAdminDog,
  deleteAdminPartner,
  downloadAdminCsv,
  loadAdminSummary,
} from "../api.js";

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
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [selectedDogId, setSelectedDogId] = useState("");

  const dogsByPartner = useMemo(() => {
    const map = new Map();
    for (const dog of summary.dogs) {
      const key = dog.partnerId || "unassigned";
      map.set(key, [...(map.get(key) || []), dog]);
    }
    return map;
  }, [summary.dogs]);

  const selectedPartner = summary.partners.find((partner) => partner.id === selectedPartnerId) || null;
  const selectedPartnerDogs = selectedPartner ? (dogsByPartner.get(selectedPartner.id) || []) : [];
  const selectedDog = summary.dogs.find((dog) => dog.id === selectedDogId) || null;

  const refresh = () => {
    loadAdminSummary(token)
      .then((payload) => {
        setSummary(payload);
        setSelectedPartnerId((current) => (
          current && payload.partners.some((partner) => partner.id === current) ? current : ""
        ));
        setSelectedDogId((current) => (
          current && payload.dogs.some((dog) => dog.id === current) ? current : ""
        ));
      })
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

  const removeDog = async (dog) => {
    if (!window.confirm(`Delete ${dog.name || "this dog"} from CUB? This cannot be undone.`)) return;
    setError("");
    try {
      await deleteAdminDog(token, dog.id);
      setSelectedDogId("");
      refresh();
    } catch (err) {
      if (err.status === 401) onLogout();
      else setError(err.message || "Could not delete dog.");
    }
  };

  const removePartner = async (partner) => {
    const count = dogsByPartner.get(partner.id)?.length || 0;
    const message = `Delete ${partner.name} and ${count} dog record${count === 1 ? "" : "s"}? This cannot be undone.`;
    if (!window.confirm(message)) return;
    setError("");
    try {
      await deleteAdminPartner(token, partner.id);
      setSelectedPartnerId("");
      setSelectedDogId("");
      refresh();
    } catch (err) {
      if (err.status === 401) onLogout();
      else setError(err.message || "Could not delete partner.");
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
              <button
                className={`admin-table-row admin-row-button ${selectedPartnerId === partner.id ? "is-selected" : ""}`}
                role="row"
                key={partner.id}
                type="button"
                onClick={() => {
                  setSelectedPartnerId(partner.id);
                  setSelectedDogId("");
                }}
              >
                <span>{partner.name}</span>
                <span>{partner.dogCount}</span>
                <span>{formatDate(partner.createdAt)}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedPartner && (
        <section className="panel admin-panel">
          <div className="panel-head admin-detail-head">
            <div>
              <h2>{selectedPartner.name}</h2>
              <p className="helper-copy">{selectedPartnerDogs.length} dog record{selectedPartnerDogs.length === 1 ? "" : "s"} · Created {formatDate(selectedPartner.createdAt)}</p>
            </div>
            <button className="danger-action" type="button" onClick={() => removePartner(selectedPartner)}>Delete Partner</button>
          </div>
          {selectedPartnerDogs.length === 0 ? (
            <p className="helper-copy">This partner has not added dogs yet.</p>
          ) : (
            <ul className="database-list admin-click-list">
              {selectedPartnerDogs.map((dog) => (
                <li key={dog.id}>
                  <button type="button" onClick={() => setSelectedDogId(dog.id)}>
                    <b>{dog.name || "Unnamed dog"}</b>
                    <span>{dog.breed} · {dog.cluster} · {dog.status}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="panel admin-panel">
        <div className="panel-head"><h2>All dog records</h2></div>
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
                  <ul className="database-list admin-click-list">
                    {(dogsByPartner.get(partner.id) || []).map((dog) => (
                      <li key={dog.id}>
                        <button type="button" onClick={() => setSelectedDogId(dog.id)}>
                          <b>{dog.name || "Unnamed dog"}</b>
                          <span>{dog.breed} · {dog.cluster} · {dog.status}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
            {(dogsByPartner.get("unassigned") || []).length > 0 && (
              <article className="admin-partner-group">
                <h3>Unassigned</h3>
                <ul className="database-list admin-click-list">
                  {dogsByPartner.get("unassigned").map((dog) => (
                    <li key={dog.id}>
                      <button type="button" onClick={() => setSelectedDogId(dog.id)}>
                        <b>{dog.name || "Unnamed dog"}</b>
                        <span>{dog.breed} · {dog.cluster} · {dog.shelter}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </article>
            )}
          </div>
        )}
      </section>

      {selectedDog && (
        <section className="panel admin-panel">
          <div className="panel-head admin-detail-head">
            <div>
              <h2>{selectedDog.name || "Unnamed dog"}</h2>
              <p className="helper-copy">{selectedDog.breed} · {selectedDog.cluster} · Added {formatDate(selectedDog.createdAt)}</p>
            </div>
            <button className="danger-action" type="button" onClick={() => removeDog(selectedDog)}>Delete Dog</button>
          </div>
          <div className="admin-detail-grid">
            <Detail label="Partner" value={selectedDog.shelter || "Unassigned"} />
            <Detail label="Status" value={selectedDog.status} />
            <Detail label="Age" value={selectedDog.ageMonths ? `${selectedDog.ageMonths} months` : "Not set"} />
            <Detail label="Sex" value={selectedDog.sex || "Not set"} />
            <Detail label="Size" value={selectedDog.size || "Not set"} />
            <Detail label="Colour" value={selectedDog.color || "Not set"} />
            <Detail label="HDB" value={selectedDog.hdbApproved ? "HDB approved" : "Not HDB approved"} />
            <Detail label="Home fit" value={(selectedDog.homeFits || []).join(", ") || "Not set"} />
            <Detail label="Exercise" value={(selectedDog.exerciseNeeds || []).join(", ") || "Not set"} />
            <Detail label="Contact" value={selectedDog.contactUrl || "Not set"} />
          </div>
          {selectedDog.imageUrl && <img className="admin-dog-photo" src={selectedDog.imageUrl} alt={selectedDog.name || "Dog"} />}
          {selectedDog.notes && (
            <div className="admin-notes">
              <h3>Behaviour notes</h3>
              <p>{selectedDog.notes}</p>
            </div>
          )}
          {selectedDog.cbarqFactors && (
            <div className="factor-grid compact">
              {Object.entries(selectedDog.cbarqFactors).map(([key, value]) => (
                <div className="factor-chip" key={key}><span>{key}</span><b>{value}</b></div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}

function Detail({ label, value }) {
  return (
    <div className="admin-detail-item">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
