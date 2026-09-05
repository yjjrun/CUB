export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function authHeaders(token, extra = {}) {
  return {
    ...extra,
    Authorization: `Bearer ${token}`,
  };
}

async function readJson(res, fallbackMessage) {
  const payload = await res.json();
  if (!res.ok) throw new ApiError(payload.error || fallbackMessage, res.status);
  return payload;
}

export async function loadDogs() {
  const res = await fetch("/api/dogs");
  const data = await res.json();
  return data.dogs || [];
}

export async function partnerLogin(code) {
  const res = await fetch("/api/partner/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  const payload = await res.json();
  if (!res.ok) throw new ApiError(payload.error || "Could not log in.", res.status);
  return payload;
}

export async function loadPartnerDogs(token) {
  const res = await fetch("/api/partner/dogs", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await res.json();
  if (!res.ok) throw new ApiError(payload.error || "Could not load your dogs.", res.status);
  return payload.dogs || [];
}

export async function submitDog(token, dog) {
  const res = await fetch("/api/dogs", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(dog),
  });
  const payload = await res.json();
  if (!res.ok) throw new ApiError(payload.error || "Could not save this dog.", res.status);
  return payload;
}

export async function adminLogin(code) {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  const payload = await res.json();
  if (!res.ok) throw new ApiError(payload.error || "Could not log in.", res.status);
  return payload;
}

export async function loadAdminSummary(token) {
  const res = await fetch("/api/admin/summary", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await res.json();
  if (!res.ok) throw new ApiError(payload.error || "Could not load admin view.", res.status);
  return payload;
}

export async function createAdminPartner(token, partner) {
  const res = await fetch("/api/admin/partners", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(partner),
  });
  const payload = await res.json();
  if (!res.ok) throw new ApiError(payload.error || "Could not create partner.", res.status);
  return payload;
}

export async function downloadAdminCsv(token) {
  const res = await fetch("/api/admin/export.csv", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    let message = "Could not export CSV.";
    try {
      const payload = await res.json();
      message = payload.error || message;
    } catch {
      // Keep the default message for non-JSON failures.
    }
    throw new ApiError(message, res.status);
  }
  return res.blob();
}

export async function deleteAdminDog(token, dogId) {
  const res = await fetch(`/api/admin/dogs/${encodeURIComponent(dogId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await res.json();
  if (!res.ok) throw new ApiError(payload.error || "Could not delete dog.", res.status);
  return payload;
}

export async function deleteAdminPartner(token, partnerId) {
  const res = await fetch(`/api/admin/partners/${encodeURIComponent(partnerId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await res.json();
  if (!res.ok) throw new ApiError(payload.error || "Could not delete partner.", res.status);
  return payload;
}

export async function createProfile(token, profile) {
  const res = await fetch("/api/account/profile", {
    method: "POST",
    headers: authHeaders(token, { "Content-Type": "application/json" }),
    body: JSON.stringify(profile),
  });
  return readJson(res, "Could not save your profile.");
}

export async function loadSavedMatches(token) {
  const res = await fetch("/api/account/saved-matches", {
    headers: authHeaders(token),
  });
  const payload = await readJson(res, "Could not load saved matches.");
  return payload.matches || [];
}

export async function saveMatch(token, match) {
  const res = await fetch("/api/account/saved-matches", {
    method: "POST",
    headers: authHeaders(token, { "Content-Type": "application/json" }),
    body: JSON.stringify(match),
  });
  return readJson(res, "Could not save this match.");
}

export async function removeSavedMatch(token, dogId) {
  const res = await fetch(`/api/account/saved-matches/${encodeURIComponent(dogId)}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return readJson(res, "Could not remove this match.");
}

export async function loadCareData(token) {
  const res = await fetch("/api/account/care-data", {
    headers: authHeaders(token),
  });
  return readJson(res, "Could not load CUB Care data.");
}

export async function saveCareData(token, careData) {
  const res = await fetch("/api/account/care-data", {
    method: "POST",
    headers: authHeaders(token, { "Content-Type": "application/json" }),
    body: JSON.stringify({ careData }),
  });
  return readJson(res, "Could not save CUB Care data.");
}
