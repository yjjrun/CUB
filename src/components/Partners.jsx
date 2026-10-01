const PARTNERS = [
  {
    name: "University of Pennsylvania",
    logo: "/assets/partners/penn.png",
    url: "https://vetapps.vet.upenn.edu/cbarq/",
  },
  { name: "National University of Singapore", logo: "/assets/partners/nus.png", active: false },
  {
    name: "MercyLight Animal Rescue & Sanctuary Limited",
    logo: "/assets/partners/mercylight.png",
    url: "https://www.mercylight.org.sg/",
  },
  {
    name: "Golden Paws",
    logo: "/assets/partners/golden-paws.png",
    frame: "circle",
    url: "https://goldenpaws.sg/",
  },
  {
    name: "National Parks Board",
    logo: "/assets/partners/national-parks.png",
    url: "https://www.nparks.gov.sg/",
  },
];

export default function Partners() {
  const visiblePartners = PARTNERS.filter((partner) => partner.active !== false);
  return (
    <section className="partners-strip" aria-labelledby="partners-title">
      <div className="partners-inner">
        <h2 id="partners-title">Our Partners</h2>
        <div className="partners-marquee" aria-label="Partner logos">
          <div className="partners-track">
            {[0, 1].map((group) => (
              <div className="partners-group" key={group} aria-hidden={group === 1 ? "true" : undefined}>
                {visiblePartners.map((partner, index) => (
                  <a
                    className={`partner-logo ${partner.frame === "circle" ? "partner-logo--circle" : ""}`.trim()}
                    key={`${partner.name}-${group}-${index}`}
                    href={partner.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    tabIndex={group === 1 ? -1 : undefined}
                    aria-label={group === 0 ? `Visit ${partner.name}` : undefined}
                  >
                    <img src={partner.logo} alt={group === 0 ? partner.name : ""} />
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
