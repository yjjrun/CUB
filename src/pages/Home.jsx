const PET_LINKS = [
  { label: "Pet news", description: "Heart-warming animal stories and the latest dog news.", url: "https://www.thedodo.com", host: "thedodo.com", image: "/assets/link-news.jpg" },
  { label: "Treats & snacks", description: "Shop healthy treats and food for every life stage.", url: "https://www.chewy.com", host: "chewy.com", image: "/assets/link-snacks.jpg" },
  { label: "Toys & play", description: "Enrichment toys and monthly play boxes for happy pups.", url: "https://www.barkbox.com", host: "barkbox.com", image: "/assets/link-toys.jpg" },
  { label: "Adoption & shelters", description: "Find adoptable dogs and trusted rescues near you.", url: "https://www.petfinder.com", host: "petfinder.com", image: "/assets/link-shelters.jpg" },
];

export default function Home({ navigate }) {
  return (
    <main className="screen home-screen">
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">Canine Understanding Buddy</p>
          <h1>Understand your lifestyle. Meet dogs who fit it.</h1>
          <p>
            CUB helps adopters find dogs that fit their lifestyle, experience, and home environment.
          </p>
          <div className="hero-proof">
            <p>
              Our matching algorithm profiles each dog across key behavioural traits:
            </p>
            <ul className="trait-list" aria-label="Dog behaviour traits">
              <li>Energy</li>
              <li>Sociability</li>
              <li>Trainability</li>
              <li>Fearfulness</li>
              <li>Attachment</li>
              <li>Separation behaviour</li>
              <li>Sensitivity</li>
            </ul>
            <p>
              This approach is informed by established canine behaviour research and large-scale
              behavioural datasets, alongside collaboration with academic researchers from institutions
              including the University of Pennsylvania and the National University of Singapore.
            </p>
            <p>
              Adopters are matched based on their routine, activity level, household, dog experience,
              and ability to meet each dog's needs.
            </p>
          </div>
          <p className="hero-question">
            Instead of matching based only on breed or appearance, CUB asks: which dog is most likely
            to thrive in your home?
          </p>
          <div className="hero-actions">
            <button className="primary-action hero-action" onClick={() => navigate("match")}>Meet your pet!</button>
            <button className="secondary-action hero-secondary" onClick={() => navigate("match")}>See how matching works</button>
          </div>
        </div>
        <div className="match-preview" aria-label="Example dog match preview">
          <div className="dog-orbit">
            <img src="/assets/mochi.jpg" alt="Matched dog preview" />
          </div>
          <div className="preview-card compatibility-card">
            <span>Compatibility</span>
            <strong>92<i>%</i></strong>
            <b>Match</b>
            <p>Great potential for a happy life together.</p>
            <div className="mini-meter"><span style={{ width: "92%" }} /></div>
          </div>
          <div className="preview-card dog-card">
            <img src="/assets/mochi.jpg" alt="" />
            <div>
              <h3>Sunny <small>2 yrs</small></h3>
              <p>Golden Retriever Mix</p>
              <span>Rescue Hub, Singapore</span>
            </div>
            <dl>
              <div><dt>Energy</dt><dd><span style={{ width: "76%" }} /></dd></div>
              <div><dt>Sociability</dt><dd><span style={{ width: "88%" }} /></dd></div>
              <div><dt>Trainability</dt><dd><span style={{ width: "82%" }} /></dd></div>
            </dl>
          </div>
          <div className="preview-card lifestyle-card">
            <h3>Your lifestyle</h3>
            <ul>
              <li>Active walks</li>
              <li>Experienced adopter</li>
              <li>Apartment living</li>
              <li>Calmer evenings</li>
            </ul>
          </div>
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
