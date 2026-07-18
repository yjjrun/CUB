export default function TeamPage() {
  const team = [
    {
      name: "Jiarun",
      role: "Founder & Head of Research",
      photo: "/assets/team/jiarun.jpg",
      bio:
        "As a student passionate about both cognitive and data science, Jiarun hopes to build practical tools that tackle real-world problems and improve how humans make decisions. After raising two dogs with vastly different personalities, Jiarun learnt that successful pet ownership depends not simply on choosing the right breed, but on understanding the unique behavioural traits, needs, and temperament of each individual dog. This inspired CUB: a platform designed to help every dog find a loving and compatible home while encouraging more informed and responsible pet ownership.",
    },
    {
      name: "Julie",
      role: "Head of Data",
      photo: "/assets/team/julie.jpg",
      bio:
        "Julie believes animals have shown her that every life deserves patience, compassion, and the opportunity to belong. As a student in Computing, she hopes to harness data and artificial intelligence to make the pet adoption process more personalised and evidence-based, empowering shelters and adopters to build lasting relationships founded on understanding and long-term success.",
    },
    {
      name: "Ethan",
      role: "Head of Outreach",
      photo: "/assets/team/ethan.jpg",
      bio:
        "Ethan is fascinated by biology because no two minds are shaped in quite the same way. Genetics, environment, and experience combine to make every dog's temperament unique. Through CUB, Ethan hopes to use behavioural data to match dogs with suitable owners, moving beyond guesswork toward pairings built on compatibility. He also wants to help owners and their dogs grow together through personalised training, enrichment, and long-term support.",
    },
    {
      name: "Kiera",
      role: "Head of Operations",
      photo: "/assets/team/kiera.jpg",
      bio:
        "Kiera sees even personal choices, like adopting a dog, as shaped by wider systems of information, responsibility, and social behaviour. Through CUB, she hopes to help prospective owners make better-informed decisions while fostering a culture of responsible pet ownership, building toward a society that treats adoption as a lasting commitment.",
    },
  ];

  return (
    <main className="screen team-page">
      <header className="faq-page-head">
        <h1>Our Team</h1>
        <p>
          CUB is built by students combining behavioural research, data, outreach, and operations
          to help more dogs find homes where they can truly thrive.
        </p>
      </header>

      <section className="team-section" aria-label="CUB team">
        {team.map((member) => (
          <article className="team-row" key={member.name}>
            <div className="team-person">
              <img className="team-photo" src={member.photo} alt={`${member.name} from the CUB team`} loading="lazy" />
              <div className="team-id">
                <h2>{member.name}</h2>
                <p className="team-role">{member.role}</p>
              </div>
            </div>
            <p>{member.bio}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
