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
    question: "What is CUB?",
    answer: "CUB, short for Canine Understanding Buddy, is a dog-adoption matching platform that helps adopters find dogs who fit their lifestyle, home environment, experience level, and personality.",
  },
  {
    question: "How does CUB match me with a dog?",
    answer: "CUB asks about your routine, living situation, activity level, dog experience, household members, and preferences. It then compares your answers with each dog’s behavioural profile to suggest more compatible matches.",
  },
  {
    question: "Is CUB only based on breed?",
    answer: "No. CUB focuses on individual dog behaviour, not just breed. Dogs of the same breed can have very different personalities, energy levels, training needs, and comfort around people or other pets.",
  },
  {
    question: "Do I need to be ready to adopt immediately?",
    answer: "No. You can use CUB to explore what kind of dog may suit your lifestyle before making a decision. Adoption is a long-term commitment, so we encourage users to think carefully before applying.",
  },
  {
    question: "Can first-time dog owners use CUB?",
    answer: "Yes. CUB is especially helpful for first-time owners because it explains why certain dogs may be easier or harder to care for based on your experience, schedule, and home environment.",
  },
  {
    question: "Does a high match score guarantee a perfect adoption?",
    answer: "No. A high match score means the dog may be a strong fit based on available information, but it does not guarantee behaviour, health, or adoption approval. Shelter staff will still make the final decision.",
  },
  {
    question: "What happens after I find a match?",
    answer: "You can review the dog’s profile, understand their needs, and follow the shelter’s adoption process. CUB helps you make a more informed choice, but the actual adoption is handled by the shelter or rescue organisation.",
  },
];

const MATCHING_FAQ_ITEMS = [
  {
    question: "What traits does CUB consider?",
    answer: "CUB may consider traits such as energy level, sociability, trainability, independence, confidence, sensitivity, fearfulness, attachment style, and tolerance for being alone.",
  },
  {
    question: "Why does behavioural matching matter?",
    answer: "Many adoption challenges happen when expectations do not match reality. A dog may be loving but need more exercise, training, patience, or structure than an adopter expected. CUB helps make those needs clearer before adoption.",
  },
  {
    question: "Can CUB tell me which dog I should definitely adopt?",
    answer: "No. CUB is a decision-support tool, not a replacement for human judgement. It helps narrow down suitable options, but adopters should still speak with shelter staff, meet the dog, and consider their long-term readiness.",
  },
  {
    question: "Can my match results change?",
    answer: "Yes. Your results may change if you update your answers, if new dogs are added, or if a dog’s behavioural profile is updated with more information.",
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
          <p className="eyebrow">For Adopters</p>
        </div>
        <div className="faq-grid">
          {FAQ_ITEMS.map((item) => (
            <details className="faq-item" key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
        <h3>About the Matching System</h3>
        <div className="faq-grid">
          {MATCHING_FAQ_ITEMS.map((item) => (
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
