import { useEffect, useMemo, useState } from "react";
import {
  FACTORS, CBARQ_SECTIONS, CBARQ_OPTIONS, DEFAULT_CBARQ_ANSWERS, CBARQ_TOTAL_QUESTIONS,
  deriveCbarqFactors, cbarqAnsweredCount,
} from "../lib/cbarq.js";
import { AKC_BREEDS, deriveDogCareProfile } from "../lib/breeds.js";
import { loadPartnerDogs, partnerLogin, submitDog } from "../api.js";

const EMPTY_PARTNER = {
  name: "", contactUrl: "", breed: "", ageMonths: "", sex: "Female",
  size: "Small", color: "", imageUrl: "", notes: "",
};

const TOKEN_KEY = "cub_partner_token";
const NAME_KEY = "cub_partner_name";

function readStoredSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const partnerName = localStorage.getItem(NAME_KEY);
  return token && partnerName ? { token, partnerName } : null;
}

export default function PartnerPage() {
  const [session, setSession] = useState(readStoredSession);
  const [code, setCode] = useState("");
  const [lockError, setLockError] = useState("");

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(NAME_KEY);
    setSession(null);
  };

  if (!session) {
    return (
      <main className="screen partner-screen">
        <section className="access-card panel">
          <div>
            <h1>Answer questions for each dog!</h1>
            <p>Only approved shelters and pet shops should enter dog records into CUB.</p>
          </div>
          <form
            className="access-form"
            onSubmit={async (e) => {
              e.preventDefault();
              setLockError("");
              try {
                const { token, partnerName } = await partnerLogin(code);
                localStorage.setItem(TOKEN_KEY, token);
                localStorage.setItem(NAME_KEY, partnerName);
                setSession({ token, partnerName });
              } catch (err) {
                setLockError(err.message || "That code does not match a partner account.");
              }
            }}
          >
            {lockError && <p className="notice error">{lockError}</p>}
            <label className="field">
              <span>Partner access code</span>
              <input name="partnerCode" type="password" value={code} placeholder="Enter code" onChange={(e) => setCode(e.target.value)} />
            </label>
            <button className="primary-action" type="submit">Unlock Intake</button>
          </form>
        </section>
      </main>
    );
  }
  return <Intake session={session} onLogout={logout} />;
}

function Intake({ session, onLogout }) {
  const [partner, setPartner] = useState(EMPTY_PARTNER);
  const [cbarq, setCbarq] = useState(DEFAULT_CBARQ_ANSWERS);
  const [dogs, setDogs] = useState([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const refreshDogs = () => {
    loadPartnerDogs(session.token)
      .then(setDogs)
      .catch((err) => {
        if (err.status === 401) onLogout();
        else setDogs([]);
      });
  };

  useEffect(refreshDogs, []);

  const setField = (key, value) => setPartner((p) => ({ ...p, [key]: value }));
  const careProfile = useMemo(
    () => deriveDogCareProfile({ breed: partner.breed, size: partner.size }),
    [partner.breed, partner.size],
  );
  const setPhoto = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setField("imageUrl", String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const factors = deriveCbarqFactors(cbarq);
  const answered = cbarqAnsweredCount(cbarq);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setSaved("");
    try {
      const payload = await submitDog(session.token, {
        ...partner,
        ageMonths: partner.ageMonths ? Number(partner.ageMonths) : null,
        ...careProfile,
        cbarqFactors: factors,
        cbarqAnswers: cbarq,
      });
      setSaved(`${partner.name || "This dog"} was saved as ${payload.cluster}.`);
      setPartner(EMPTY_PARTNER);
      setCbarq(DEFAULT_CBARQ_ANSWERS);
      refreshDogs();
    } catch (err) {
      if (err.status === 401) { onLogout(); return; }
      setError(err.message || "Could not save this dog.");
    }
  };

  return (
    <main className="screen partner-screen">
      <section className="intro-strip partner">
        <div>
          <h1>Answer questions for each dog!</h1>
          <p className="helper-copy">
            Logged in as <b>{session.partnerName}</b>.{" "}
            <button type="button" className="link-action" onClick={onLogout}>Log out</button>
          </p>
        </div>
        <div className="stat-block"><strong>{dogs.length}</strong><span>stored records</span></div>
      </section>

      <div className="portal-grid">
        <form className="panel intake-panel" onSubmit={submit}>
          <div className="panel-head"><h2>Intake record</h2></div>
          {error && <p className="notice error">{error}</p>}
          {saved && <p className="notice success">{saved}</p>}
          <div className="form-split">
            <div>
              <Field label="Dog name" value={partner.name} onChange={(v) => setField("name", v)} placeholder="Optional" />
              <Field label="Website to meet this pet" value={partner.contactUrl} onChange={(v) => setField("contactUrl", v)} placeholder="https://..." />
              <label className="field">
                <span>Breed</span>
                <input list="breed-options" value={partner.breed} placeholder="Required" onChange={(e) => setField("breed", e.target.value)} />
                <datalist id="breed-options">
                  {AKC_BREEDS.map((b) => <option key={b} value={b} />)}
                </datalist>
              </label>
              <Field label="Age in months" type="number" value={partner.ageMonths} onChange={(v) => setField("ageMonths", v)} />
              <Select label="Sex" value={partner.sex} onChange={(v) => setField("sex", v)} options={["Female", "Male", "Unknown"]} />
            </div>
            <div>
              <Select label="Size" value={partner.size} onChange={(v) => setField("size", v)} options={["Small", "Medium", "Large"]} />
              <Field label="Color" value={partner.color} onChange={(v) => setField("color", v)} placeholder="e.g. brown and white" />
              <label className="field">
                <span>Photo</span>
                <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0])} />
              </label>
              <div className="derived-care">
                <span>Home fit</span>
                <div>{careProfile.homeFits.map((fit) => <b key={fit}>{fit}</b>)}</div>
              </div>
              <div className="derived-care">
                <span>Exercise fit</span>
                <div>{careProfile.exerciseNeeds.map((need) => <b key={need}>{exerciseLabel(need)}</b>)}</div>
              </div>
              <div className="derived-care">
                <span>HDB status</span>
                <div><b>{careProfile.hdbApproved ? "HDB approved" : "Not HDB approved"}</b></div>
              </div>
            </div>
          </div>

          <div className="panel-head compact">
            <p className="eyebrow">C-BARQ short form</p>
            <h2>Behavior questions</h2>
            <p className="helper-copy">{answered} of {CBARQ_TOTAL_QUESTIONS} questions answered. N/A is accepted when the situation has not been observed.</p>
          </div>
          <div className="cbarq-sections">
            {CBARQ_SECTIONS.map((section) => (
              <section className="cbarq-section" key={section.title}>
                <div className="cbarq-section-head"><h3>{section.title}</h3><span>{section.scale}</span></div>
                <div className="cbarq-question-grid">
                  {section.items.map(([number, label]) => (
                    <label className="cbarq-question" key={number}>
                      <span><b>{number}.</b> {label}</span>
                      <select value={cbarq[`q${number}`]} onChange={(e) => setCbarq((c) => ({ ...c, [`q${number}`]: e.target.value }))}>
                        {CBARQ_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </label>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="factor-summary">
            <h3>Calculated behavior factors</h3>
            <div className="factor-grid compact">
              {FACTORS.map(([id, label]) => (
                <div className="factor-chip" key={id}><span>{label}</span><b>{factors[id]}</b></div>
              ))}
            </div>
          </div>

          <label className="field">
            <span>Behavior notes</span>
            <textarea rows={4} value={partner.notes} placeholder="Triggers, handling advice, medical context, or adoption notes" onChange={(e) => setField("notes", e.target.value)} />
          </label>
          <button className="primary-action" type="submit">Save Dog To Database</button>
        </form>

        <aside className="panel database-panel">
          <div className="panel-head"><h2>Stored dog records</h2></div>
          {dogs.length === 0 ? (
            <p className="helper-copy">No dogs saved yet. Dogs you save will appear here.</p>
          ) : (
            <ul className="database-list">
              {dogs.map((d) => (
                <li key={d.id}><b>{d.name || "Unnamed dog"}</b><span>{d.breed} · {d.cluster}</span></li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </main>
  );
}

function exerciseLabel(value) {
  return {
    low: "Low",
    moderate: "Moderate",
    moderateHigh: "Moderate-high",
    high: "High",
  }[value] || value;
}

function Field({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
