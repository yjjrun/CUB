import { ageLabel, SAMPLE_DOG, OWNER_NAME } from "../../lib/care.js";

const TRAIT_ROWS = [
  { key: "energy", label: "Energy" },
  { key: "sociability", label: "Sociability" },
  { key: "trainability", label: "Trainability" },
];

export default function CareProfile({
  dog = SAMPLE_DOG,
  ownerName = OWNER_NAME,
  isDemo = true,
  onEdit,
}) {
  const traits = dog.traits || SAMPLE_DOG.traits;
  const profileCompletion = dog.profileCompletion || (isDemo ? SAMPLE_DOG.profileCompletion : 70);

  return (
    <div className="care-profile">
      <section className="panel care-profile-card" aria-label="Dog profile">
        <img className="care-profile-photo" src={dog.photo || SAMPLE_DOG.photo} alt={`${dog.name || "Dog"}, a ${dog.breed || "dog"}`} />
        <div className="care-profile-body">
          <h1>{dog.name || "Your dog"}</h1>
          <p className="care-profile-sub">
            {dog.breed || "Breed not set"} · {ageLabel(dog)} · {dog.sex || "Sex not set"} · {dog.weightKg ? `${dog.weightKg}kg` : "Weight not set"} · {dog.location || "Location not set"}
          </p>
          <span className="cluster-pill">{dog.cluster || (isDemo ? SAMPLE_DOG.cluster : "Personal care profile")}</span>
          <dl className="care-profile-traits">
            {TRAIT_ROWS.map((trait) => (
              <div key={trait.key}>
                <dt>{trait.label}</dt>
                <dd>
                  <div className="mini-meter"><span style={{ width: `${traits[trait.key]}%` }} /></div>
                  <b>{traits[trait.key]}</b>
                </dd>
              </div>
            ))}
          </dl>
          <div className="care-profile-meta">
            <div>
              <span>Owner</span>
              <b>{ownerName}</b>
            </div>
            <div>
              <span>Adopted via</span>
              <b>{dog.adoptedVia || "CUB Care"}</b>
            </div>
            <div>
              <span>Profile</span>
              <b>{profileCompletion}% complete</b>
            </div>
          </div>
          <div className="care-profile-actions">
            <button className="ghost-action" type="button" onClick={onEdit}>
              {isDemo ? "Create my own profile" : "Edit profile"}
            </button>
          </div>
          <p className="helper-copy">
            {isDemo
              ? "This is demo sample data. Create an account to build and save your own CUB Care profile."
              : "This profile is saved to your CUB account and is used to personalise the Care demo screens."}
          </p>
        </div>
      </section>
    </div>
  );
}
