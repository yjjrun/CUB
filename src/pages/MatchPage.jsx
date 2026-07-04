import { useEffect, useMemo, useState } from "react";
import { MATCH_STEPS, DEFAULT_PROFILE } from "../lib/wizard.js";
import { getMatches, CLUSTERS, clusterTraits, experienceLabel, APP_LOGO } from "../lib/matching.js";
import { loadDogs } from "../api.js";

export default function MatchPage({ navigate }) {
  const [dogs, setDogs] = useState([]);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    loadDogs().then(setDogs).catch(() => setDogs([]));
  }, []);

  if (submitted) {
    return (
      <MatchResults
        dogs={dogs}
        profile={profile}
        selected={selected}
        setSelected={setSelected}
        onRestart={() => { setSubmitted(false); setStep(0); setSelected(0); }}
        navigate={navigate}
      />
    );
  }
  return (
    <MatchWizard
      profile={profile}
      setProfile={setProfile}
      step={step}
      setStep={setStep}
      onFinish={() => { setSubmitted(true); setSelected(0); }}
      onCancel={() => navigate("home")}
    />
  );
}

function MatchWizard({ profile, setProfile, step, setStep, onFinish, onCancel }) {
  const total = MATCH_STEPS.length;
  const index = Math.max(0, Math.min(step, total - 1));
  const current = MATCH_STEPS[index];
  const selectedValue = current.get(profile);
  const pct = Math.round(((index + 1) / total) * 100);

  return (
    <main className="screen wizard-screen">
      <div className="wizard">
        <nav className="wizard-crumb">
          <a href="#" onClick={(e) => { e.preventDefault(); onCancel(); }}>Find your match</a>
          <span>/ {current.crumb}</span>
        </nav>
        <div className="wizard-grid">
          <div className="wizard-intro">
            <div className="wizard-progress">
              <div className="wizard-progress-head"><span>Progress</span><span>{index + 1}/{total}</span></div>
              <div className="wizard-bar"><i style={{ width: `${pct}%` }} /></div>
            </div>
            <h1>{current.title}</h1>
            <p>{current.desc}</p>
          </div>
          <div className="wizard-options">
            <p className="wizard-hint">Choose the one that fits best.</p>
            <div className="option-list">
              {current.options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`option-card ${opt.value === selectedValue ? "is-selected" : ""}`}
                  onClick={() => setProfile(current.apply(profile, opt.value))}
                >
                  <span className="option-check" aria-hidden="true" />
                  <span className="option-text"><b>{opt.label}</b><small>{opt.sub}</small></span>
                </button>
              ))}
            </div>
            <div className="wizard-actions">
              <button type="button" className="ghost-action" onClick={() => (index <= 0 ? onCancel() : setStep(index - 1))}>
                {index === 0 ? "Cancel" : "Back"}
              </button>
              <button type="button" className="primary-action" onClick={() => (index >= total - 1 ? onFinish() : setStep(index + 1))}>
                {index === total - 1 ? "See my matches" : "Continue"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function MatchResults({ dogs, profile, selected, setSelected, onRestart, navigate }) {
  const matches = useMemo(() => getMatches(dogs, profile), [dogs, profile]);

  if (!matches.length) {
    return (
      <main className="screen results-screen">
        <div className="results">
          <nav className="wizard-crumb">
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("home"); }}>Find your match</a>
            <span>/ Matches</span>
          </nav>
          <div className="result-empty big">
            <img src={APP_LOGO} alt="" />
            <h3>No dogs are available yet.</h3>
            <p>Once approved shelters add dogs, your matches will appear here.</p>
            <button type="button" className="primary-action" onClick={onRestart}>Retake the quiz</button>
          </div>
        </div>
      </main>
    );
  }

  const top = matches.slice(0, 5);
  const idx = Math.max(0, Math.min(selected, top.length - 1));
  const match = top[idx];
  const { dog } = match;
  const cluster = CLUSTERS[dog.cluster] || CLUSTERS["Golden Hearts"];

  return (
    <main className="screen results-screen">
      <div className="results">
        <div className="results-head">
          <div>
            <nav className="wizard-crumb">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("home"); }}>Find your match</a>
              <span>/ Matches</span>
            </nav>
            <h1>Top {top.length} match{top.length > 1 ? "es" : ""}</h1>
          </div>
          <button type="button" className="link-action" onClick={onRestart}>Change my answers &rsaquo;</button>
        </div>

        <div className="match-avatars">
          {top.map((m, i) => (
            <button
              key={m.dog.id}
              type="button"
              className={`avatar ${i === idx ? "is-active" : ""}`}
              onClick={() => setSelected(i)}
            >
              <span className="avatar-img"><img src={m.dog.imageUrl || APP_LOGO} alt={m.dog.name} /></span>
              <span className="avatar-label">Top {i + 1}</span>
              <span className={`avatar-score tier-${scoreTier(m.score)}`}>{m.score}%</span>
            </button>
          ))}
        </div>

        <div className="results-grid">
          <section className="match-detail">
            <div className="match-detail-head">
              <div className={`score-ring tier-${scoreTier(match.score)}`}><b>{match.score}<i>%</i></b><span>match</span></div>
              <div className="match-detail-copy">
                <h2>{dog.name}</h2>
                <p className="match-breed">{dog.breed} · {dog.size || "Size n/a"}{dog.color ? ` · ${dog.color}` : ""}</p>
                <p className="match-traits">{clusterTraits(dog.cluster).join(" · ")}</p>
              </div>
              <a className="primary-action meet-btn" href={dog.contactUrl} target="_blank" rel="noreferrer noopener">Meet {dog.name}</a>
            </div>
            <div className="match-photo"><img src={dog.imageUrl || APP_LOGO} alt={dog.name} /></div>
            <div className="cluster-pill">{dog.cluster}</div>
            <p className="cluster-headline">{cluster.headline}</p>
          </section>

          <section className="match-breakdown">
            <h3>How {dog.name} fits you</h3>
            <div className="compare">
              <div className="compare-head"><span>This dog</span><span>vs your answers</span></div>
              {comparisonRows(match, profile).map((r) => (
                <div className="compare-row" key={r.label}>
                  <div className="compare-cell"><small>{r.label}</small><b>{r.value}</b></div>
                  <div className={`compare-status ${r.matched ? "ok" : "no"}`}>{r.matched ? "✓ Matched" : "⚠ Not matched"}</div>
                </div>
              ))}
            </div>
            {match.flags.length > 0 && (
              <div className="compare-flags">
                {match.flags.map((f) => <span key={f}>⚠ {f}</span>)}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function scoreTier(score) {
  return score > 70 ? "high" : score < 30 ? "low" : "mid";
}

function comparisonRows(match, profile) {
  const { dog, subscores } = match;
  const dogExercise = { low: "Calm, short walks", moderate: "Moderate exercise", moderateHigh: "Active", high: "Very active" }[dog.exerciseNeed] || "Moderate exercise";
  const rank = { "first-time": 0, some: 1, experienced: 2 };
  const needed = ["Fiery Dynamos", "Driven Guardians"].includes(dog.cluster)
    ? "experienced"
    : dog.cluster === "Cautious Companions" ? "some" : "first-time";
  return [
    { label: "Personality", value: `${subscores.personality}% fit with ${dog.cluster}`, matched: subscores.personality >= 60 },
    { label: "Energy level", value: dogExercise, matched: subscores.lifestyle >= 65 },
    { label: "Housing", value: dog.hdbApproved ? "HDB-approved" : "Not HDB-approved", matched: subscores.housing >= 70 },
    { label: "Experience", value: experienceLabel(dog.cluster), matched: rank[profile.lifestyle.experience] >= rank[needed] },
    { label: "Size", value: dog.size || "Not set", matched: profile.preferences.size === "Any" || profile.preferences.size === dog.size },
  ];
}
