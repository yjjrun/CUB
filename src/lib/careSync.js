import { loadCareData, saveCareData } from "../api.js";

const STORE_PREFIX = "cub-care:v1:";

function safeParse(raw, fallback = null) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function isAccountCareKey(key) {
  return key === "dog_profile" || key.startsWith("personal:");
}

function filterAccountCareData(data) {
  if (!data || typeof data !== "object") return {};
  return Object.fromEntries(Object.entries(data).filter(([key]) => isAccountCareKey(key)));
}

export function readBrowserCareData(options = {}) {
  const { accountOnly = false } = options;
  const data = {};
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith(STORE_PREFIX)) continue;
      const careKey = key.slice(STORE_PREFIX.length);
      if (accountOnly && !isAccountCareKey(careKey)) continue;
      data[careKey] = safeParse(localStorage.getItem(key));
    }
  } catch {
    return {};
  }
  return data;
}

export function writeBrowserCareData(data) {
  if (!data || typeof data !== "object") return;
  try {
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(STORE_PREFIX + key, JSON.stringify(value));
    });
  } catch {
    // Browser storage can be disabled; the Care UI still works in memory.
  }
}

export function serializeBrowserCareData(options = {}) {
  return JSON.stringify(readBrowserCareData(options));
}

function hasCareData(data) {
  if (!data || typeof data !== "object") return false;
  return Object.keys(data).some((key) => {
    const value = data[key];
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === "object") return Object.keys(value).length > 0;
    return value !== null && value !== undefined && value !== "";
  });
}

export async function syncBrowserCareData(accessToken, options = {}) {
  if (!accessToken) return { status: "local" };
  const { accountOnly = false, uploadLocal = true } = options;

  const localData = readBrowserCareData({ accountOnly });
  const cloud = await loadCareData(accessToken);
  const rawCloudData = cloud.careData || {};
  const cloudData = accountOnly ? filterAccountCareData(rawCloudData) : rawCloudData;

  if (hasCareData(cloudData)) {
    writeBrowserCareData(cloudData);
    return { status: "loaded", updatedAt: cloud.updatedAt };
  }

  if (uploadLocal && hasCareData(localData)) {
    const saved = await saveCareData(accessToken, localData);
    return { status: "uploaded", updatedAt: saved.updatedAt };
  }

  return { status: "empty", updatedAt: cloud.updatedAt };
}

export function startCareCloudAutosave(accessToken, onStatus, options = {}) {
  if (!accessToken) return () => {};
  let stopped = false;
  let lastSnapshot = serializeBrowserCareData(options);
  let saving = false;

  const flush = async () => {
    if (stopped || saving) return;
    const nextSnapshot = serializeBrowserCareData(options);
    if (nextSnapshot === lastSnapshot) return;

    saving = true;
    try {
      const payload = safeParse(nextSnapshot, {});
      const saved = await saveCareData(accessToken, payload);
      lastSnapshot = nextSnapshot;
      onStatus?.({ status: "saved", updatedAt: saved.updatedAt });
    } catch {
      onStatus?.({ status: "offline" });
    } finally {
      saving = false;
    }
  };

  const timer = window.setInterval(flush, 1500);
  window.addEventListener("pagehide", flush);
  return () => {
    stopped = true;
    window.clearInterval(timer);
    window.removeEventListener("pagehide", flush);
  };
}
