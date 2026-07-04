// Stage 1 placeholder. The full partner access gate + 101-item C-BARQ intake
// is ported in stage 2 of the React migration.
export default function PartnerPage({ navigate }) {
  return (
    <main className="screen partner-screen">
      <section className="intro-strip partner">
        <div>
          <p className="eyebrow">Private shelter and pet shop portal</p>
          <h1>Shelter intake is being upgraded.</h1>
        </div>
      </section>
      <div className="panel" style={{ padding: "24px", maxWidth: "640px", margin: "0 auto" }}>
        <p>
          The partner intake — access gate plus the full 101-item C-BARQ questionnaire — is being
          ported to the new interface and will return shortly.
        </p>
        <button className="primary-action" style={{ marginTop: "18px" }} onClick={() => navigate("home")}>
          Back to home
        </button>
      </div>
    </main>
  );
}
