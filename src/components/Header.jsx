import { useEffect, useRef, useState } from "react";
import { APP_LOGO } from "../lib/matching.js";

export default function Header({ route, navigate }) {
  const aboutActive = route === "faq" || route === "team";
  const [aboutOpen, setAboutOpen] = useState(false);
  const menuRef = useRef(null);

  // Tap-to-open needs an explicit way back out: hover has no equivalent of
  // "moving the pointer away" on a touchscreen.
  useEffect(() => {
    if (!aboutOpen) return undefined;
    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setAboutOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setAboutOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [aboutOpen]);

  const go = (target) => {
    setAboutOpen(false);
    navigate(target);
  };

  return (
    <header className="topbar">
      <a
        className="brand"
        href="/"
        onClick={(e) => {
          e.preventDefault();
          go("home");
        }}
        aria-label="CUB home"
      >
        <img src={APP_LOGO} alt="" />
        <span className="brand-word">CUB</span>
        <span className="brand-subtitle">Canine<br />Understanding<br />Buddy</span>
      </a>
      <nav className="nav-pills" aria-label="Site areas">
        <button className={route === "home" ? "active" : ""} onClick={() => go("home")}>Home</button>
        <button className={route === "match" ? "active" : ""} onClick={() => go("match")}>For adopters</button>
        <div className={`nav-menu${aboutOpen ? " open" : ""}`} ref={menuRef}>
          <button
            className={aboutActive ? "active" : ""}
            type="button"
            aria-expanded={aboutOpen}
            aria-haspopup="true"
            onClick={() => setAboutOpen((open) => !open)}
          >
            About us
          </button>
          <div className="nav-submenu" aria-label="About us sections">
            <button className={route === "faq" ? "active" : ""} onClick={() => go("faq")}>FAQs</button>
            <button className={route === "team" ? "active" : ""} onClick={() => go("team")}>Our Team</button>
          </div>
        </div>
      </nav>
    </header>
  );
}
