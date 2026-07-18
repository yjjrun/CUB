import { APP_LOGO } from "../lib/matching.js";

export default function Header({ route, navigate }) {
  const aboutActive = route === "faq" || route === "team";

  return (
    <header className="topbar">
      <a
        className="brand"
        href="/"
        onClick={(e) => {
          e.preventDefault();
          navigate("home");
        }}
        aria-label="CUB home"
      >
        <img src={APP_LOGO} alt="" />
        <span className="brand-word">CUB</span>
        <span className="brand-subtitle">Canine<br />Understanding<br />Buddy</span>
      </a>
      <nav className="nav-pills" aria-label="Site areas">
        <button className={route === "home" ? "active" : ""} onClick={() => navigate("home")}>Home</button>
        <button className={route === "match" ? "active" : ""} onClick={() => navigate("match")}>For adopters</button>
        <button className={route === "care" ? "active" : ""} onClick={() => navigate("care")}>CUB Care</button>
        <button className={route === "partner" ? "active" : ""} onClick={() => navigate("partner")}>For shelters</button>
        <div className="nav-menu">
          <button className={aboutActive ? "active" : ""} type="button">About us</button>
          <div className="nav-submenu" aria-label="About us sections">
            <button className={route === "faq" ? "active" : ""} onClick={() => navigate("faq")}>FAQs</button>
            <button className={route === "team" ? "active" : ""} onClick={() => navigate("team")}>Our Team</button>
          </div>
        </div>
      </nav>
    </header>
  );
}
