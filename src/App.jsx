import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import Partners from "./components/Partners.jsx";
import FaqPage from "./pages/FaqPage.jsx";
import Home from "./pages/Home.jsx";
import MatchPage from "./pages/MatchPage.jsx";
import PartnerPage from "./pages/PartnerPage.jsx";
import { ADOPTER_FAQS, MATCHING_FAQS } from "./lib/faq.js";

const SITE_URL = "https://meetmycub.com";

const SEO = {
  home: {
    path: "/",
    title: "CUB: Dog Adoption Matching",
    description: "CUB helps adopters find dogs that fit their lifestyle, home environment, experience level, and personality using behaviour-informed matching.",
  },
  match: {
    path: "/match",
    title: "Meet Your Pet | CUB Dog Matching",
    description: "Answer CUB's adopter questionnaire to compare your lifestyle, home, activity level, and experience with available dog profiles.",
  },
  partner: {
    path: "/partner",
    title: "For Shelters | CUB Dog Intake",
    description: "CUB helps shelters and pet partners create behaviour-informed dog profiles for more thoughtful adoption matching.",
  },
  faq: {
    path: "/faq",
    title: "Dog Adoption Matching FAQ | CUB",
    description: "Read answers about CUB, dog adoption matching, behaviour profiles, match scores, shelter judgement, and adopter readiness.",
  },
};

function setMeta(name, content, attr = "name") {
  let tag = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setCanonical(url) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

function setRouteJsonLd(route, url) {
  const existing = document.getElementById("route-jsonld");
  if (existing) existing.remove();
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": route === "faq" ? "FAQPage" : "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: SEO[route].title,
    description: SEO[route].description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
  if (route === "faq") {
    pageSchema.mainEntity = [...ADOPTER_FAQS, ...MATCHING_FAQS].map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    }));
  }
  const script = document.createElement("script");
  script.id = "route-jsonld";
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(pageSchema);
  document.head.appendChild(script);
}

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

  useEffect(() => {
    const seo = SEO[route] || SEO.home;
    const url = `${SITE_URL}${seo.path}`;
    document.title = seo.title;
    setMeta("description", seo.description);
    setCanonical(url);
    setMeta("og:url", url, "property");
    setMeta("og:title", seo.title, "property");
    setMeta("og:description", seo.description, "property");
    setMeta("twitter:title", seo.title);
    setMeta("twitter:description", seo.description);
    setRouteJsonLd(route, url);
  }, [route]);

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
