import { SAMPLE_DOG, OWNER_NAME } from "../../lib/care.js";

const TRAIT_ROWS = [
  { key: "energy", label: "Energy" },
  { key: "sociability", label: "Sociability" },
  { key: "trainability", label: "Trainability" },
];

export default function CareProfile() {
  return (
    <div className="care-profile">
      <section className="panel care-profile-card" aria-label="Dog profile">
        <img className="care-profile-photo" src={SAMPLE_DOG.photo} alt={`${SAMPLE_DOG.name}, a ${SAMPLE_DOG.breed}`} />
        <div className="care-profile-body">
          <h1>{SAMPLE_DOG.name}</h1>
          <p className="care-profile-sub">
            {SAMPLE_DOG.breed} · {SAMPLE_DOG.ageYears} yrs · {SAMPLE_DOG.sex} · {SAMPLE_DOG.weightKg}kg · {SAMPLE_DOG.location}
          </p>
          <span className="cluster-pill">{SAMPLE_DOG.cluster}</span>
          <dl className="care-profile-traits">
            {TRAIT_ROWS.map((trait) => (
              <div key={trait.key}>
                <dt>{trait.label}</dt>
                <dd>
                  <div className="mini-meter"><span style={{ width: `${SAMPLE_DOG.traits[trait.key]}%` }} /></div>
                  <b>{SAMPLE_DOG.traits[trait.key]}</b>
                </dd>
              </div>
            ))}
          </dl>
          <div className="care-profile-meta">
            <div>
              <span>Owner</span>
              <b>{OWNER_NAME}</b>
            </div>
            <div>
              <span>Adopted via</span>
              <b>{SAMPLE_DOG.adoptedVia}</b>
            </div>
            <div>
              <span>Profile</span>
              <b>{SAMPLE_DOG.profileCompletion}% complete</b>
            </div>
          </div>
          <div className="care-profile-actions">
            <button className="ghost-action" type="button" title="Prototype only">Edit profile</button>
            <button className="ghost-action" type="button" title="Prototype only">+ Add another dog</button>
          </div>
          <p className="helper-copy">
            This is prototype sample data. In the full product, this profile comes from your
            adoption record and the shelter's behaviour questionnaire.
          </p>
        </div>
      </section>
    </div>
  );
}
