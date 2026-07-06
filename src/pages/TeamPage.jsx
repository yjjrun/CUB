export default function TeamPage() {
  return (
    <main className="screen team-page">
      <header className="faq-page-head">
        <h1>Our Team</h1>
        <p>
          CUB is built with input from people who care about better dog-adoption outcomes,
          thoughtful behaviour matching, and clearer expectations before adoption.
        </p>
      </header>

      <section className="team-section" aria-label="CUB team">
        <article className="team-row">
          <h2>Jiarun Yang</h2>
          <p>
            Founder of CUB, focused on helping adopters and shelters make more informed,
            behaviour-aware matches.
          </p>
        </article>
        <article className="team-row">
          <h2>Research Collaborators</h2>
          <p>
            CUB draws on established canine behaviour research and collaboration with academic
            researchers to keep the matching system grounded in real behavioural traits.
          </p>
        </article>
        <article className="team-row">
          <h2>Shelter & Pet Partners</h2>
          <p>
            Partner organisations help turn dog behaviour information into practical profiles
            that adopters can understand before meeting a dog.
          </p>
        </article>
      </section>
    </main>
  );
}
