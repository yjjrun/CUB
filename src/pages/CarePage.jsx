import { useEffect, useState } from "react";
import CareHome from "../components/care/CareHome.jsx";
import CarePlan from "../components/care/CarePlan.jsx";
import EmotionScan from "../components/care/EmotionScan.jsx";
import AskCub from "../components/care/AskCub.jsx";
import CareProfile from "../components/care/CareProfile.jsx";
import { SAMPLE_DOG } from "../lib/care.js";
import { startCareCloudAutosave, syncBrowserCareData } from "../lib/careSync.js";

const TABS = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "plan", label: "Care Plan", icon: "📋" },
  { id: "scan", label: "Emotion Scan", icon: "📷" },
  { id: "chat", label: "Ask CUB", icon: "💬" },
  { id: "profile", label: "Profile", icon: "🐶" },
];

export default function CarePage({ session }) {
  const [tab, setTab] = useState("home");
  const [syncVersion, setSyncVersion] = useState(0);
  const [syncState, setSyncState] = useState({
    ready: !session?.access_token,
    message: session?.access_token ? "Syncing CUB Care..." : "Saved on this device.",
  });
  const accessToken = session?.access_token || "";

  useEffect(() => {
    if (!accessToken) {
      setSyncState({ ready: true, message: "Saved on this device." });
      return undefined;
    }

    let active = true;
    setSyncState({ ready: false, message: "Syncing CUB Care..." });
    syncBrowserCareData(accessToken)
      .then((result) => {
        if (!active) return;
        const message = result.status === "loaded"
          ? "Synced from your CUB account."
          : result.status === "uploaded"
            ? "Saved to your CUB account."
            : "Synced to your CUB account.";
        setSyncState({ ready: true, message });
        setSyncVersion((version) => version + 1);
      })
      .catch(() => {
        if (active) setSyncState({ ready: true, message: "Using local Care data until sync is available." });
      });
    return () => {
      active = false;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken || !syncState.ready) return undefined;
    return startCareCloudAutosave(accessToken, (result) => {
      if (result.status === "saved") {
        setSyncState({ ready: true, message: "CUB Care saved to your account." });
      } else if (result.status === "offline") {
        setSyncState({ ready: true, message: "Changes are local until sync is available." });
      }
    });
  }, [accessToken, syncState.ready]);

  if (!syncState.ready) {
    return (
      <main className="screen care-screen">
        <section className="panel care-sync-panel">
          <p className="eyebrow">CUB Care</p>
          <h1>Syncing your care data</h1>
          <p className="helper-copy">One moment while CUB checks your account.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="screen care-screen">
      <div className="care-shell">
        <div className="care-topline">
          <span className="care-badge">
            <img src="/assets/paw-logo-brown.png" alt="" aria-hidden="true" />
            CUB Care
          </span>
          <p>Caring for {SAMPLE_DOG.name} after adoption</p>
          <p className="care-sync-status">{syncState.message}</p>
        </div>

        <nav className="care-nav" aria-label="CUB Care sections">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={tab === item.id ? "active" : ""}
              aria-current={tab === item.id ? "page" : undefined}
              onClick={() => {
                setTab(item.id);
                window.scrollTo({ top: 0, behavior: "instant" });
              }}
            >
              <span className="care-nav-icon" aria-hidden="true">{item.icon}</span>
              <span className="care-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="care-view" key={syncVersion}>
          {tab === "home" && <CareHome goTo={setTab} />}
          {tab === "plan" && <CarePlan />}
          {tab === "scan" && <EmotionScan />}
          {tab === "chat" && <AskCub />}
          {tab === "profile" && <CareProfile />}
        </div>
      </div>
    </main>
  );
}
