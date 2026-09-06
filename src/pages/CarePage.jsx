import { useEffect, useState } from "react";
import CareHome from "../components/care/CareHome.jsx";
import CarePlan from "../components/care/CarePlan.jsx";
import EmotionScan from "../components/care/EmotionScan.jsx";
import AskCub from "../components/care/AskCub.jsx";
import CareProfile from "../components/care/CareProfile.jsx";
import CareProfileSetup from "../components/care/CareProfileSetup.jsx";
import { loadPersonalCareProfile, SAMPLE_DOG, savePersonalCareProfile } from "../lib/care.js";
import {
  readBrowserCareData,
  startCareCloudAutosave,
  syncBrowserCareData,
} from "../lib/careSync.js";
import { saveCareData } from "../api.js";

const TABS = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "plan", label: "Care Plan", icon: "📋" },
  { id: "scan", label: "Emotion Scan", icon: "📷" },
  { id: "chat", label: "Ask CUB", icon: "💬" },
  { id: "profile", label: "Profile", icon: "🐶" },
];

export default function CarePage({ session, navigate, user, authLoading }) {
  const [tab, setTab] = useState("home");
  const [mode, setMode] = useState(session?.access_token ? "mine" : "demo");
  const [editingProfile, setEditingProfile] = useState(false);
  const [personalProfile, setPersonalProfile] = useState(loadPersonalCareProfile);
  const [syncVersion, setSyncVersion] = useState(0);
  const [syncState, setSyncState] = useState({
    ready: !session?.access_token,
    message: session?.access_token ? "Syncing CUB Care..." : "Demo mode.",
  });
  const accessToken = session?.access_token || "";
  const activeProfile = mode === "mine" ? personalProfile : null;
  const activeDog = activeProfile?.dog || SAMPLE_DOG;
  const ownerName = activeProfile?.ownerName || user?.user_metadata?.name || "You";
  const isDemo = mode !== "mine";
  const openMyCare = () => {
    if (!accessToken) {
      navigate("signup", { next: "/care" });
      return;
    }
    setMode("mine");
    setEditingProfile(false);
    setTab("home");
  };
  const editMyCare = () => {
    if (!accessToken) {
      navigate("signup", { next: "/care" });
      return;
    }
    setMode("mine");
    setEditingProfile(true);
    setTab("home");
  };

  useEffect(() => {
    if (!accessToken) {
      setMode("demo");
      setEditingProfile(false);
      setSyncState({ ready: true, message: "Demo mode." });
      return undefined;
    }

    let active = true;
    setSyncState({ ready: false, message: "Syncing CUB Care..." });
    const hasPersonalCareProfile = Boolean(loadPersonalCareProfile()?.dog);
    syncBrowserCareData(accessToken, { accountOnly: true, uploadLocal: hasPersonalCareProfile })
      .then((result) => {
        if (!active) return;
        const message = result.status === "loaded"
          ? "Synced from your CUB account."
          : result.status === "uploaded"
            ? "Saved to your CUB account."
            : "Synced to your CUB account.";
        setSyncState({ ready: true, message });
        const nextProfile = loadPersonalCareProfile();
        setPersonalProfile(nextProfile);
        if (nextProfile?.dog) setMode("mine");
        setEditingProfile(false);
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
    return startCareCloudAutosave(
      accessToken,
      (result) => {
        if (result.status === "saved") {
          setSyncState({ ready: true, message: "CUB Care saved to your account." });
        } else if (result.status === "offline") {
          setSyncState({ ready: true, message: "Changes are local until sync is available." });
        }
      },
      { accountOnly: true },
    );
  }, [accessToken, syncState.ready]);

  const saveCareProfile = async (profile) => {
    savePersonalCareProfile(profile);
    setPersonalProfile(profile);
    setMode("mine");
    setEditingProfile(false);
    setTab("home");
    setSyncVersion((version) => version + 1);
    if (!accessToken) return;
    try {
      await saveCareData(accessToken, readBrowserCareData({ accountOnly: true }));
      setSyncState({ ready: true, message: "Saved to your CUB account." });
    } catch {
      setSyncState({ ready: true, message: "Saved locally; cloud sync will retry." });
    }
  };

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
            {isDemo ? "CUB Care Demo" : "My CUB Care"}
          </span>
          <p>{isDemo ? "Explore a sample care plan for Lily." : `Caring for ${activeDog.name || "your dog"} after adoption.`}</p>
          <p className="care-sync-status">{syncState.message}</p>
        </div>

        <div className="care-mode-switch" aria-label="CUB Care mode">
          <button
            type="button"
            className={mode === "demo" ? "active" : ""}
            onClick={() => {
              setMode("demo");
              setEditingProfile(false);
              setTab("home");
            }}
          >
            Demo
          </button>
          <button
            type="button"
            className={mode === "mine" ? "active" : ""}
            onClick={() => {
              if (!accessToken) {
                navigate("signup", { next: "/care" });
                return;
              }
              setMode("mine");
              setEditingProfile(false);
              setTab("home");
            }}
            disabled={authLoading}
          >
            My CUB Care
          </button>
        </div>

        {mode === "demo" && !accessToken && (
          <section className="panel care-demo-banner">
            <div>
              <h1>This is the CUB Care demo.</h1>
              <p>Log in or create a free account to enter your own dog details and save your Care plan.</p>
            </div>
            <button className="primary-action" type="button" onClick={() => navigate("signup", { next: "/care" })}>
              Create my account
            </button>
          </section>
        )}

        {mode === "mine" && (!personalProfile?.dog || editingProfile) ? (
          <CareProfileSetup
            initialProfile={personalProfile}
            onCancel={() => {
              setEditingProfile(false);
              if (!personalProfile?.dog) setMode("demo");
            }}
            onSave={saveCareProfile}
            user={user}
          />
        ) : (
          <>
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

        <div className="care-view" key={`${syncVersion}-${mode}-${tab}-${activeDog.name || "dog"}`}>
          {tab === "home" && <CareHome goTo={setTab} dog={activeDog} ownerName={ownerName} isDemo={isDemo} onEdit={isDemo ? openMyCare : editMyCare} />}
          {tab === "plan" && <CarePlan dog={activeDog} isDemo={isDemo} />}
          {tab === "scan" && <EmotionScan dog={activeDog} isDemo={isDemo} />}
          {tab === "chat" && <AskCub dog={activeDog} isDemo={isDemo} />}
          {tab === "profile" && <CareProfile dog={activeDog} ownerName={ownerName} isDemo={isDemo} onEdit={isDemo ? openMyCare : editMyCare} />}
        </div>
          </>
        )}
      </div>
    </main>
  );
}
