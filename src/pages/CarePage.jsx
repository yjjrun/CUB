import { useState } from "react";
import CareHome from "../components/care/CareHome.jsx";
import CarePlan from "../components/care/CarePlan.jsx";
import EmotionScan from "../components/care/EmotionScan.jsx";
import AskCub from "../components/care/AskCub.jsx";
import CareProfile from "../components/care/CareProfile.jsx";
import { SAMPLE_DOG } from "../lib/care.js";

const TABS = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "plan", label: "Care Plan", icon: "📋" },
  { id: "scan", label: "Emotion Scan", icon: "📷" },
  { id: "chat", label: "Ask CUB", icon: "💬" },
  { id: "profile", label: "Profile", icon: "🐶" },
];

export default function CarePage() {
  const [tab, setTab] = useState("home");

  return (
    <main className="screen care-screen">
      <div className="care-shell">
        <div className="care-topline">
          <span className="care-badge">
            <img src="/assets/paw-logo-brown.png" alt="" aria-hidden="true" />
            CUB Care
          </span>
          <p>Caring for {SAMPLE_DOG.name} after adoption</p>
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

        <div className="care-view">
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
