import { loadCareData, saveCareData } from "../api.js";

const STORE_PREFIX = "cub-care:v1:";

function safeParse(raw, fallback = null) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function readBrowserCareData() {
  const data = {};
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith(STORE_PREFIX)) continue;
      data[key.slice(STORE_PREFIX.length)] = safeParse(localStorage.getItem(key));
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

export function serializeBrowserCareData() {
  return JSON.stringify(readBrowserCareData());
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

export async function syncBrowserCareData(accessToken) {
  if (!accessToken) return { status: "local" };

  const localData = readBrowserCareData();
  const cloud = await loadCareData(accessToken);
  const cloudData = cloud.careData || {};

  if (hasCareData(cloudData)) {
    writeBrowserCareData(cloudData);
    return { status: "loaded", updatedAt: cloud.updatedAt };
  }

  if (hasCareData(localData)) {
    const saved = await saveCareData(accessToken, localData);
    return { status: "uploaded", updatedAt: saved.updatedAt };
  }

  return { status: "empty", updatedAt: cloud.updatedAt };
}

export function startCareCloudAutosave(accessToken, onStatus) {
  if (!accessToken) return () => {};
  let stopped = false;
  let lastSnapshot = serializeBrowserCareData();
  let saving = false;

  const flush = async () => {
    if (stopped || saving) return;
    const nextSnapshot = serializeBrowserCareData();
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
