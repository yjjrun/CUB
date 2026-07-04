const PARTNERS = [
  { name: "University of Pennsylvania", logo: "/assets/partners/penn.png" },
  { name: "National University of Singapore", logo: "/assets/partners/nus.png" },
  { name: "SPCA Singapore", logo: "/assets/partners/spca-singapore.png" },
  { name: "National Parks Board", logo: "/assets/partners/national-parks.png" },
];

export default function Partners() {
  const loop = [...PARTNERS, ...PARTNERS];

  return (
    <section className="partners-strip" aria-labelledby="partners-title">
      <div className="partners-inner">
        <h2 id="partners-title">Our Partners</h2>
        <div className="partners-marquee" aria-label="Partner logos">
          <div className="partners-track">
            {loop.map((partner, index) => (
              <div className="partner-logo" key={`${partner.name}-${index}`}>
                <img src={partner.logo} alt={partner.name} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
