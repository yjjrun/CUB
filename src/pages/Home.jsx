const PET_LINKS = [
  { label: "Pet News", description: "Heart-warming animal stories and the latest dog news.", url: "https://www.dailypaws.com/", host: "dailypaws.com", image: "/assets/link-news.png" },
  { label: "Food & Snacks", description: "Shop wholesome meals and snacks for every life stage.", url: "https://www.bombom.com/", host: "bombom.com", image: "/assets/link-food-snacks.png" },
  { label: "Toys", description: "Enrichment toys and playful picks for happy pups.", url: "https://vanillapup.com/collections/dog-toys?srsltid=AfmBOorc6oNrFuRP5CIhjO-up8GGq6oyDWfREsMSn3c5Y6yDbFuOAemz", host: "vanillapup.com", image: "/assets/link-toys.png" },
  { label: "Health & Wellness", description: "Simple wellness guidance for healthier, happier pets.", url: "https://www.libertyinternational.com/sg/article/pet-wellness-guide", host: "libertyinternational.com", image: "/assets/link-health-wellness.png" },
];

const TRAIT_CHIPS = [
  { label: "Energy", tone: "energy" },
  { label: "Sociability", tone: "sociability" },
  { label: "Trainability", tone: "trainability" },
  { label: "Fearfulness", tone: "fearfulness" },
  { label: "Attachment", tone: "attachment" },
  { label: "Separation behaviour", tone: "separation" },
  { label: "Sensitivity", tone: "sensitivity" },
];

export default function Home({ navigate }) {
  const traitLoop = [...TRAIT_CHIPS, ...TRAIT_CHIPS];

  return (
    <main className="screen home-screen">
      <section className="home-hero">
        <div className="hero-copy">
          <h1><span className="hero-line">Understand your lifestyle.</span><br />Meet dogs who <span className="hero-fit">fit it.</span></h1>
          <p className="hero-intro">
            CUB helps adopters find dogs that fit their lifestyle, experience, and home environment.
          </p>
          <div className="hero-proof">
            <div className="proof-heading">
              <p>Our matching algorithm profiles each dog across key behavioural traits:</p>
            </div>
            <div
              className="trait-marquee"
              aria-label={`Dog behaviour traits: ${TRAIT_CHIPS.map((trait) => trait.label).join(", ")}`}
            >
              <ul className="trait-list" aria-hidden="true">
                {traitLoop.map((trait, index) => (
                  <li key={`${trait.label}-${index}`} className={`trait-${trait.tone}`}>{trait.label}</li>
                ))}
              </ul>
            </div>
            <div className="research-note">
              <p>
                This approach is informed by established canine behaviour research and draws on large-scale
                behavioural datasets, alongside collaboration with academic researchers from institutions
                including the University of Pennsylvania and the National University of Singapore.
              </p>
            </div>
          </div>
          <p className="hero-question">
            <span>Instead of matching based only on breed or appearance, CUB asks:</span> which dog
            is most likely to thrive in your home?
          </p>
          <div className="hero-actions">
            <button className="primary-action hero-action" onClick={() => navigate("match")}><img src="/assets/paw-white.png" alt="" aria-hidden="true" />Meet your pet!</button>
          </div>
        </div>
        <div className="hero-dog-visual" aria-label="Golden retriever hero image" tabIndex={0}>
          <img src="/assets/hero-golden-dog.png" alt="Happy golden retriever sitting on grass" />
          <article className="preview-card compatibility-card hero-preview-card" aria-hidden="true">
            <span>Compatibility</span>
            <strong>92<i>%</i></strong>
            <b>Match</b>
            <p>Great potential for a happy life together.</p>
            <div className="mini-meter"><span style={{ width: "84%" }} /></div>
          </article>
          <article className="preview-card dog-card hero-preview-card" aria-hidden="true">
            <img src="/assets/lily-profile.png" alt="" />
            <div>
              <h3>Lily <small>2 yrs</small></h3>
              <p>Golden Retriever Mix</p>
              <span>Singapore</span>
            </div>
            <dl>
              <div><dt>Energy</dt><dd><span style={{ width: "78%" }} /></dd></div>
              <div><dt>Sociability</dt><dd><span style={{ width: "88%" }} /></dd></div>
              <div><dt>Trainability</dt><dd><span style={{ width: "72%" }} /></dd></div>
            </dl>
          </article>
          <article className="preview-card lifestyle-card hero-preview-card" aria-hidden="true">
            <h3>Your lifestyle</h3>
            <ul>
              <li>Active · Enjoys walks</li>
              <li>Experienced adopter</li>
              <li>Apartment living</li>
              <li>Prefers calmer evenings</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="collab-section">
        <div className="section-title">
          <p className="eyebrow">Pet resources</p>
          <h2>Handy links for new dog parents.</h2>
        </div>
        <div className="collab-grid">
          {PET_LINKS.map((link) => (
            <a key={link.host} className="collab-card" href={link.url} target="_blank" rel="noreferrer noopener">
              <img className="collab-thumb" src={link.image} alt={link.label} loading="lazy" />
              <div>
                <h3>{link.label}</h3>
                <p>{link.description}</p>
                <span>{link.host} &rarr;</span>
              </div>
            </a>
          ))}
        </div>
      </section>

    </main>
  );
}
