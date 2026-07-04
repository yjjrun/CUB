export async function loadDogs() {
  const res = await fetch("/api/dogs");
  const data = await res.json();
  return data.dogs || [];
}

export async function submitDog(dog) {
  const res = await fetch("/api/dogs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dog),
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || "Could not save this dog.");
  return payload;
}
