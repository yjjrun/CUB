import { APP_LOGO } from "../lib/matching.js";

export default function Header({ route, navigate }) {
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
        <button className={route === "partner" ? "active" : ""} onClick={() => navigate("partner")}>For shelters</button>
        <button onClick={() => navigate("home")}>About us</button>
      </nav>
    </header>
  );
}
