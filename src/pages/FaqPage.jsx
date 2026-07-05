import { ADOPTER_FAQS, MATCHING_FAQS } from "../lib/faq.js";

export default function FaqPage() {
  return (
    <main className="screen faq-page">
      <header className="faq-page-head">
        <p className="eyebrow">For Adopters</p>
        <h1>Frequently Asked Questions</h1>
        <p>
          Simple answers about using CUB, understanding match scores, and choosing a dog with more
          realistic expectations before adoption.
        </p>
      </header>

      <FaqGroup title="For Adopters" items={ADOPTER_FAQS} />
      <FaqGroup title="About the Matching System" items={MATCHING_FAQS} />
    </main>
  );
}

function FaqGroup({ title, items }) {
  return (
    <section className="faq-page-section" aria-labelledby={`${title.toLowerCase().replaceAll(" ", "-")}-title`}>
      <h2 id={`${title.toLowerCase().replaceAll(" ", "-")}-title`}>{title}</h2>
      <div className="faq-list">
        {items.map((item) => (
          <article className="faq-row" key={item.question}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
