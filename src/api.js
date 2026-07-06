class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
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
