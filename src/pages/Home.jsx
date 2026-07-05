const PET_LINKS = [
  { label: "Pet News", description: "Heart-warming animal stories and the latest dog news.", url: "https://www.dailypaws.com/", host: "dailypaws.com", image: "/assets/link-news.png" },
  { label: "Food & Snacks", description: "Shop wholesome meals and snacks for every life stage.", url: "https://www.bombom.com/", host: "bombom.com", image: "/assets/link-food-snacks.png" },
  { label: "Toys", description: "Enrichment toys and playful picks for happy pups.", url: "https://vanillapup.com/collections/dog-toys?srsltid=AfmBOorc6oNrFuRP5CIhjO-up8GGq6oyDWfREsMSn3c5Y6yDbFuOAemz", host: "vanillapup.com", image: "/assets/link-toys.png" },
  { label: "Health & Wellness", description: "Simple wellness guidance for healthier, happier pets.", url: "https://www.libertyinternational.com/sg/article/pet-wellness-guide", host: "libertyinternational.com", image: "/assets/link-health-wellness.png" },
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

const FAQ_ITEMS = [
  {
    question: "Is CUB only for Singapore?",
    answer: "CUB is currently built around Singapore adoption needs, including HDB considerations, but the matching approach can support shelters and adopters in other locations.",
  },
  {
    question: "How does the matching algorithm work?",
    answer: "CUB compares adopter lifestyle, home environment, dog experience, and preferences with each dog’s behaviour profile, breed-informed care needs, and shelter-provided intake answers.",
  },
  {
    question: "Can shelters use CUB?",
    answer: "Yes. Shelters and pet shops can use the partner intake to answer behaviour questions for each dog and add profiles to the matching database.",
  },
  {
    question: "Is CUB free for adopters?",
    answer: "Yes. Adopters can answer the matching questions and view suggested dogs without paying.",
  },
  {
    question: "Does CUB replace shelter staff judgement?",
    answer: "No. CUB is a decision-support tool. Shelter staff judgement, meet-and-greets, medical context, and adoption counselling should still guide final placements.",
  },
  {
    question: "Can I use CUB if I already own pets?",
    answer: "Yes. CUB can still help you understand which dogs may fit your routine and experience, but introductions with existing pets should be managed carefully with shelter guidance.",
  },
];

export default function Home({ navigate }) {
  return (
    <main className="screen home-screen">
      <section className="home-hero">
        <div className="hero-copy">
          <h1><span className="hero-line">Understand your lifestyle.</span><br />Meet dogs who <span className="hero-fit">fit it.</span></h1>
          <p>
            CUB helps adopters find dogs that fit their lifestyle, experience, and home environment.
          </p>
          <div className="hero-proof">
            <div className="proof-heading">
              <p>Our matching algorithm profiles each dog across key behavioural traits:</p>
            </div>
            <ul className="trait-list" aria-label="Dog behaviour traits">
              {TRAIT_CHIPS.map((trait) => (
                <li key={trait.label}><span aria-hidden="true">{trait.mark}</span>{trait.label}</li>
              ))}
            </ul>
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
        <div className="hero-dog-visual" aria-label="Golden retriever hero image">
          <img src="/assets/hero-golden-dog.png" alt="Happy golden retriever sitting on grass" />
        </div>
      </section>

      <section className="mission-section">
        <div className="section-title">
          <p className="eyebrow">Our Mission</p>
        </div>
        <p>
          Too many adoptions begin with love but fail because of mismatched expectations. CUB helps
          adopters understand a dog’s personality before adoption, so every match has a better chance
          of becoming permanent.
        </p>
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

      <section className="faq-section">
        <div className="section-title">
          <p className="eyebrow">FAQ</p>
        </div>
        <div className="faq-grid">
          {FAQ_ITEMS.map((item) => (
            <details className="faq-item" key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
