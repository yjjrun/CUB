import { useEffect, useState } from "react";
import AdminPage from "./pages/AdminPage.jsx";
import CarePage from "./pages/CarePage.jsx";
import Header from "./components/Header.jsx";
import Partners from "./components/Partners.jsx";
import FaqPage from "./pages/FaqPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import Home from "./pages/Home.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import MatchPage from "./pages/MatchPage.jsx";
import PartnerPage from "./pages/PartnerPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import TeamPage from "./pages/TeamPage.jsx";
import { useAuth } from "./lib/auth.jsx";
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
    path: "/about/faq",
    title: "Dog Adoption Matching FAQ | CUB",
    description: "Read answers about CUB, dog adoption matching, behaviour profiles, match scores, shelter judgement, and adopter readiness.",
  },
  team: {
    path: "/about/team",
    title: "Our Team | CUB",
    description: "Meet the student team behind CUB's behaviour-informed dog adoption matching platform.",
  },
  admin: {
    path: "/admin",
    title: "Admin | CUB",
    description: "Private CUB administration view.",
    robots: "noindex,nofollow",
  },
  care: {
    path: "/care",
    title: "CUB Care | Daily Care for Your Dog",
    description: "CUB Care helps adopters look after their dog with personalised nutrition, exercise, enrichment, and health guidance, plus an emotion scan and care chatbot.",
  },
  login: {
    path: "/login",
    title: "Log In | CUB",
    description: "Log in to CUB to save dog matches, favourites, reminders, scans, and care checklists.",
  },
  signup: {
    path: "/signup",
    title: "Create Account | CUB",
    description: "Create a free CUB account to save dog matches and keep CUB Care in sync across devices.",
  },
  forgotPassword: {
    path: "/forgot-password",
    title: "Reset Password | CUB",
    description: "Reset your CUB account password securely.",
  },
  profile: {
    path: "/profile",
    title: "Profile | CUB",
    description: "Manage your CUB account, saved matches, and CUB Care access.",
    robots: "noindex,nofollow",
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
  if (pathname === "/admin") return "admin";
  if (pathname === "/care") return "care";
  if (pathname === "/login") return "login";
  if (pathname === "/signup") return "signup";
  if (pathname === "/forgot-password") return "forgotPassword";
  if (pathname === "/profile") return "profile";
  if (pathname === "/match") return "match";
  if (pathname === "/partner" || pathname === "/shelter") return "partner";
  if (pathname === "/faq" || pathname === "/faqs" || pathname === "/about/faq") return "faq";
  if (pathname === "/team" || pathname === "/about/team") return "team";
  return "home";
}

export default function App() {
  const auth = useAuth();
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
    setMeta("robots", seo.robots || "index,follow");
    setRouteJsonLd(route, url);
  }, [route]);

  const navigate = (next, options = {}) => {
    let path = next === "match"
      ? "/match"
      : next === "partner"
        ? "/partner"
        : next === "faq"
          ? "/about/faq"
          : next === "team"
            ? "/about/team"
            : next === "admin"
              ? "/admin"
              : next === "care"
                ? "/care"
                : next === "login"
                  ? "/login"
                  : next === "signup"
                    ? "/signup"
                    : next === "forgotPassword"
                      ? "/forgot-password"
                      : next === "profile"
                        ? "/profile"
                        : "/";
    if ((next === "login" || next === "signup") && options.next) {
      path += `?next=${encodeURIComponent(options.next)}`;
    }
    window.history.pushState({}, "", path);
    setRoute(next);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <Header route={route} navigate={navigate} user={auth.user} />
      {route === "home" && <Home navigate={navigate} />}
      {route === "match" && <MatchPage navigate={navigate} session={auth.session} />}
      {route === "partner" && <PartnerPage navigate={navigate} />}
      {route === "faq" && <FaqPage />}
      {route === "team" && <TeamPage />}
      {route === "admin" && <AdminPage />}
      {route === "login" && <LoginPage navigate={navigate} />}
      {route === "signup" && <SignupPage navigate={navigate} />}
      {route === "forgotPassword" && <ForgotPasswordPage navigate={navigate} />}
      {route === "profile" && <ProfilePage navigate={navigate} />}
      {route === "care" && <CarePage session={auth.session} navigate={navigate} user={auth.user} authLoading={auth.loading} />}
      {route !== "care" && <Partners />}
    </>
  );
}
