import { useState } from "react";
import { AKC_BREEDS } from "../../lib/breeds.js";
import { SAMPLE_DOG } from "../../lib/care.js";

const EMPTY_TRAITS = {
  energy: 55,
  sociability: 55,
  trainability: 55,
};
const MAX_PHOTO_EDGE = 900;
const PHOTO_QUALITY = 0.82;

function clampTrait(value) {
  const next = Number(value);
  if (Number.isNaN(next)) return 55;
  return Math.max(0, Math.min(100, next));
}

function profileFromInitial(initialProfile, user) {
  const dog = initialProfile?.dog || {};
  return {
    ownerName: initialProfile?.ownerName || user?.user_metadata?.name || "",
    name: dog.name || "",
    breed: dog.breed || "",
    ageMonths: dog.ageMonths || "",
    sex: dog.sex || "Female",
    weightKg: dog.weightKg || "",
    location: dog.location || "Singapore",
    photo: dog.photo || "",
    traits: {
      ...EMPTY_TRAITS,
      ...(dog.traits || {}),
    },
  };
}

function readPhotoDataUrl(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      const scale = Math.min(1, MAX_PHOTO_EDGE / Math.max(width, height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", PHOTO_QUALITY));
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Photo could not be read."));
    };

    image.src = objectUrl;
  });
}

export default function CareProfileSetup({ initialProfile, onSave, onCancel, user }) {
  const [draft, setDraft] = useState(() => profileFromInitial(initialProfile, user));
  const [error, setError] = useState("");

  const setField = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const setTrait = (field, value) => {
    setDraft((current) => ({
      ...current,
      traits: { ...current.traits, [field]: clampTrait(value) },
    }));
  };

  const setPhoto = async (file) => {
    if (!file) return;
    try {
      setError("");
      const photo = await readPhotoDataUrl(file);
      setField("photo", photo);
    } catch {
      setError("That photo could not be read. Try a JPG or PNG.");
    }
  };

  const submit = (event) => {
    event.preventDefault();
    if (!draft.name.trim()) {
      setError("Please enter your dog's name.");
      return;
    }
    if (!draft.breed.trim()) {
      setError("Please enter your dog's breed.");
      return;
    }

    const ageMonths = draft.ageMonths ? Number(draft.ageMonths) : null;
    const weightKg = draft.weightKg ? Number(draft.weightKg) : null;
    const completeFields = [
      draft.ownerName,
      draft.name,
      draft.breed,
      ageMonths,
      draft.sex,
      weightKg,
      draft.location,
      draft.photo,
    ].filter(Boolean).length;

    onSave({
      ownerName: draft.ownerName.trim() || "You",
      dog: {
        name: draft.name.trim(),
        breed: draft.breed.trim(),
        ageMonths,
        ageYears: ageMonths ? Math.round((ageMonths / 12) * 10) / 10 : null,
        sex: draft.sex,
        weightKg,
        location: draft.location.trim() || "Singapore",
        photo: draft.photo || SAMPLE_DOG.photo,
        cluster: "Personal care profile",
        traits: {
          energy: clampTrait(draft.traits.energy),
          sociability: clampTrait(draft.traits.sociability),
          trainability: clampTrait(draft.traits.trainability),
        },
        adoptedVia: "CUB Care",
        profileCompletion: Math.max(55, Math.round((completeFields / 8) * 100)),
      },
    });
  };

  return (
    <section className="panel care-setup-card" aria-label="Create your CUB Care profile">
      <div className="care-setup-copy">
        <p className="eyebrow">My CUB Care</p>
        <h1>Create your dog's Care profile</h1>
        <p>
          The Lily Care page stays as a demo. This profile lets your own account show your
          dog's name, photo, routine, and Care recommendations.
        </p>
      </div>

      <form className="care-setup-form" onSubmit={submit}>
        {error && <p className="notice error">{error}</p>}

        <div className="form-split">
          <div>
            <label className="field">
              <span>Your name</span>
              <input
                value={draft.ownerName}
                onChange={(event) => setField("ownerName", event.target.value)}
                placeholder="Optional"
              />
            </label>
            <label className="field">
              <span>Dog name</span>
              <input
                value={draft.name}
                onChange={(event) => setField("name", event.target.value)}
                placeholder="e.g. Lily"
                required
              />
            </label>
            <label className="field">
              <span>Breed</span>
              <input
                list="care-breed-options"
                value={draft.breed}
                onChange={(event) => setField("breed", event.target.value)}
                placeholder="Required"
                required
              />
              <datalist id="care-breed-options">
                {AKC_BREEDS.map((breed) => <option value={breed} key={breed}>{breed}</option>)}
              </datalist>
            </label>
            <label className="field">
              <span>Age in months</span>
              <input
                type="number"
                min="0"
                value={draft.ageMonths}
                onChange={(event) => setField("ageMonths", event.target.value)}
              />
            </label>
          </div>

          <div>
            <label className="field">
              <span>Sex</span>
              <select value={draft.sex} onChange={(event) => setField("sex", event.target.value)}>
                <option>Female</option>
                <option>Male</option>
                <option>Unknown</option>
              </select>
            </label>
            <label className="field">
              <span>Weight in kg</span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={draft.weightKg}
                onChange={(event) => setField("weightKg", event.target.value)}
              />
            </label>
            <label className="field">
              <span>Location</span>
              <input
                value={draft.location}
                onChange={(event) => setField("location", event.target.value)}
                placeholder="Singapore"
              />
            </label>
            <label className="field">
              <span>Photo</span>
              <input type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0])} />
            </label>
          </div>
        </div>

        {draft.photo && (
          <div className="care-setup-preview">
            <img src={draft.photo} alt="" />
            <span>Photo preview</span>
          </div>
        )}

        <div className="care-trait-sliders" aria-label="Care traits">
          <TraitSlider label="Energy" value={draft.traits.energy} onChange={(value) => setTrait("energy", value)} />
          <TraitSlider label="Sociability" value={draft.traits.sociability} onChange={(value) => setTrait("sociability", value)} />
          <TraitSlider label="Trainability" value={draft.traits.trainability} onChange={(value) => setTrait("trainability", value)} />
        </div>

        <div className="care-setup-actions">
          <button className="ghost-action" type="button" onClick={onCancel}>View demo instead</button>
          <button className="primary-action" type="submit">Save my CUB Care profile</button>
        </div>
      </form>
    </section>
  );
}

function TraitSlider({ label, value, onChange }) {
  return (
    <label>
      <span>{label}</span>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <b>{value}</b>
    </label>
  );
}
