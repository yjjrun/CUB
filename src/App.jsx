import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import Partners from "./components/Partners.jsx";
import FaqPage from "./pages/FaqPage.jsx";
import Home from "./pages/Home.jsx";
import MatchPage from "./pages/MatchPage.jsx";
import PartnerPage from "./pages/PartnerPage.jsx";

function routeFromPath(pathname) {
  if (pathname === "/match") return "match";
  if (pathname === "/partner" || pathname === "/shelter") return "partner";
  if (pathname === "/faq" || pathname === "/faqs") return "faq";
  return "home";
}

export default function App() {
  const [route, setRoute] = useState(routeFromPath(window.location.pathname));

  useEffect(() => {
    const onPop = () => setRoute(routeFromPath(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (next) => {
    const path = next === "match" ? "/match" : next === "partner" ? "/partner" : next === "faq" ? "/faq" : "/";
    window.history.pushState({}, "", path);
    setRoute(next);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <Header route={route} navigate={navigate} />
      {route === "home" && <Home navigate={navigate} />}
      {route === "match" && <MatchPage navigate={navigate} />}
      {route === "partner" && <PartnerPage navigate={navigate} />}
      {route === "faq" && <FaqPage />}
      <Partners />
    </>
  );
}
