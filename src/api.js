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
