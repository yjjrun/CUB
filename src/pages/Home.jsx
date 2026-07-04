const PET_LINKS = [
  { label: "Pet news", description: "Heart-warming animal stories and the latest dog news.", url: "https://www.thedodo.com", host: "thedodo.com", image: "/assets/link-news.jpg" },
  { label: "Food & Snacks", description: "Shop wholesome meals and snacks for every life stage.", url: "https://www.bombom.com/", host: "bombom.com", image: "/assets/link-food-snacks.png" },
  { label: "Toys & play", description: "Enrichment toys and monthly play boxes for happy pups.", url: "https://www.barkbox.com", host: "barkbox.com", image: "/assets/link-toys.jpg" },
  { label: "Adoption & shelters", description: "Find adoptable dogs and trusted rescues near you.", url: "https://www.petfinder.com", host: "petfinder.com", image: "/assets/link-shelters.jpg" },
];

const TRAIT_CHIPS = [
  { label: "Energy", mark: "En" },
  { label: "Sociability", mark: "So" },
  { label: "Trainability", mark: "Tr" },
  { label: "Fearfulness", mark: "Fe" },
  { label: "Attachment", mark: "At" },
  { label: "Separation behaviour", mark: "Sb" },
  { label: "Sensitivity", mark: "Sn" },
];

const TRUST_POINTS = [
  { title: "Research-backed matching", text: "Built on behavioural science and real-world data.", mark: "01" },
  { title: "Privacy-first", text: "Your data is secure and never sold.", mark: "02" },
  { title: "Better outcomes", text: "Stronger matches. Happier dogs. Stronger homes.", mark: "03" },
];

export default function Home({ navigate }) {
  return (
    <main className="screen home-screen">
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">Canine Understanding Buddy</p>
          <h1><span className="hero-line">Understand your lifestyle.</span><br />Meet dogs who <span className="hero-fit">fit it.</span></h1>
          <p>
            CUB helps adopters find dogs that fit their lifestyle, experience, and home environment.
          </p>
          <div className="hero-proof">
            <div className="proof-heading">
              <span aria-hidden="true">CUB</span>
              <p>Our matching algorithm profiles each dog across key behavioural traits:</p>
            </div>
            <ul className="trait-list" aria-label="Dog behaviour traits">
              {TRAIT_CHIPS.map((trait) => (
                <li key={trait.label}><span aria-hidden="true">{trait.mark}</span>{trait.label}</li>
              ))}
            </ul>
            <div className="research-note">
              <span aria-hidden="true">R</span>
              <p>
                This approach is informed by established canine behaviour research and draws on large-scale
                behavioural datasets, alongside collaboration with academic researchers from institutions
                including the University of Pennsylvania and the National University of Singapore.
              </p>
            </div>
          </div>
          <p className="hero-question">
            Instead of matching based only on breed or appearance, CUB asks: which dog is most likely
            to thrive in your home?
          </p>
          <div className="hero-actions">
            <button className="primary-action hero-action" onClick={() => navigate("match")}><span aria-hidden="true">C</span>Meet your pet!<span aria-hidden="true">-&gt;</span></button>
            <button className="secondary-action hero-secondary" onClick={() => navigate("match")}><span aria-hidden="true">?</span>See how matching works</button>
          </div>
        </div>
        <div className="hero-dog-visual" aria-label="Golden retriever hero image">
          <img src="/assets/hero-golden-dog.png" alt="Happy golden retriever sitting on grass" />
        </div>
      </section>

      <section className="trust-strip" aria-label="Why CUB matching works">
        {TRUST_POINTS.map((point) => (
          <article key={point.title}>
            <span aria-hidden="true">{point.mark}</span>
            <div>
              <h2>{point.title}</h2>
              <p>{point.text}</p>
            </div>
          </article>
        ))}
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
