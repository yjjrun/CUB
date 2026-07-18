const PARTNERS = [
  { name: "University of Pennsylvania", logo: "/assets/partners/penn.png" },
  { name: "National University of Singapore", logo: "/assets/partners/nus.png" },
  { name: "National Parks Board", logo: "/assets/partners/national-parks.png" },
];

export default function Partners() {
  const marqueePartners = [...PARTNERS, ...PARTNERS];

  return (
    <section className="partners-strip" aria-labelledby="partners-title">
      <div className="partners-inner">
        <h2 id="partners-title">Our Partners</h2>
        <div className="partners-marquee" aria-label="Partner logos">
          <div className="partners-track">
            {[0, 1].map((group) => (
              <div className="partners-group" key={group} aria-hidden={group === 1 ? "true" : undefined}>
                {marqueePartners.map((partner, index) => (
                  <div className="partner-logo" key={`${partner.name}-${group}-${index}`}>
                    <img src={partner.logo} alt={group === 0 ? partner.name : ""} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
