import { useMemo, useState } from "react";
import {
  SAMPLE_DOG, OWNER_NAME, CARE_CATEGORIES, WEEKLY_INSIGHTS, DAILY_TASKS, loadChecklist,
} from "../../lib/care.js";

export default function CareHome({ goTo }) {
  const [category, setCategory] = useState(CARE_CATEGORIES[0].id);
  const active = CARE_CATEGORIES.find((entry) => entry.id === category);

  const doneCount = useMemo(() => {
    const state = loadChecklist();
    return DAILY_TASKS.filter((task) => state[task.id]).length;
  }, []);
  const planPct = Math.round((doneCount / DAILY_TASKS.length) * 100);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="care-home">
      <section className="care-hero panel" aria-label="Dog overview">
        <div className="care-hero-copy">
          <p className="eyebrow">{greeting}, {OWNER_NAME}</p>
          <h1>Here's what {SAMPLE_DOG.name} needs today.</h1>
          <div className="care-dog-facts">
            <span>{SAMPLE_DOG.breed}</span>
            <span>{SAMPLE_DOG.ageYears} yrs</span>
            <span>{SAMPLE_DOG.weightKg} kg</span>
            <span>{SAMPLE_DOG.sex}</span>
          </div>
          <div className="care-hero-meters">
            <div className="care-meter">
              <span className="care-meter-label">Today's plan</span>
              <div className="mini-meter"><span style={{ width: `${planPct}%` }} /></div>
              <b>{doneCount}/{DAILY_TASKS.length} done</b>
            </div>
            <div className="care-meter">
              <span className="care-meter-label">Profile</span>
              <div className="mini-meter"><span style={{ width: `${SAMPLE_DOG.profileCompletion}%` }} /></div>
              <b>{SAMPLE_DOG.profileCompletion}% complete</b>
            </div>
          </div>
          <div className="care-hero-actions">
            <button className="primary-action" type="button" onClick={() => goTo("plan")}>
              Open today's plan
            </button>
            <button className="ghost-action" type="button" onClick={() => goTo("scan")}>
              📷 Emotion scan
            </button>
          </div>
        </div>
        <figure className="care-hero-photo">
          <img src={SAMPLE_DOG.photo} alt={`${SAMPLE_DOG.name}, a ${SAMPLE_DOG.breed}`} />
          <figcaption>
            <b>{SAMPLE_DOG.name}</b>
            <span>{SAMPLE_DOG.location}</span>
          </figcaption>
          <button className="care-switch-dog" type="button" title="Prototype only">
            + Switch or add dog
          </button>
        </figure>
      </section>

      <section aria-label="Daily care categories" className="care-categories">
        <div className="care-tabs" role="tablist" aria-label="Care categories">
          {CARE_CATEGORIES.map((entry) => (
            <button
              key={entry.id}
              role="tab"
              type="button"
              aria-selected={category === entry.id}
              className={category === entry.id ? "active" : ""}
              onClick={() => setCategory(entry.id)}
            >
              <span aria-hidden="true">{entry.icon}</span> {entry.label}
            </button>
          ))}
        </div>
        <article className="panel care-category-card" role="tabpanel" aria-label={active.label}>
          <div className="care-category-head">
            <h2>{active.headline}</h2>
            <p>{active.detail}</p>
          </div>
          <dl className="care-stat-grid">
            {active.stats.map((stat) => (
              <div key={stat.label}>
                <dt>{stat.label}</dt>
                <dd>{stat.value}</dd>
              </div>
            ))}
          </dl>
          <p className="care-tip"><b>Tip</b> {active.tip}</p>
        </article>
      </section>

      <section className="panel care-week" aria-label="Weekly insights">
        <div className="panel-head compact">
          <p className="eyebrow">Weekly insights · {WEEKLY_INSIGHTS.weekLabel}</p>
          <h2>{SAMPLE_DOG.name}'s week at a glance</h2>
        </div>
        <div className="care-week-grid">
          <WeekStat label="Care plan" value={`${WEEKLY_INSIGHTS.carePlanCompletion}%`} pct={WEEKLY_INSIGHTS.carePlanCompletion} note="completed" />
          <WeekStat
            label="Exercise"
            value={`${WEEKLY_INSIGHTS.exercise.done}/${WEEKLY_INSIGHTS.exercise.target}`}
            pct={(WEEKLY_INSIGHTS.exercise.done / WEEKLY_INSIGHTS.exercise.target) * 100}
            note={`${WEEKLY_INSIGHTS.exercise.minutes} min total`}
          />
          <WeekStat
            label="Meals"
            value={`${WEEKLY_INSIGHTS.meals.done}/${WEEKLY_INSIGHTS.meals.target}`}
            pct={(WEEKLY_INSIGHTS.meals.done / WEEKLY_INSIGHTS.meals.target) * 100}
            note="recorded"
          />
          <WeekStat
            label="Enrichment"
            value={`${WEEKLY_INSIGHTS.enrichment.done}/${WEEKLY_INSIGHTS.enrichment.target}`}
            pct={(WEEKLY_INSIGHTS.enrichment.done / WEEKLY_INSIGHTS.enrichment.target) * 100}
            note="activities"
          />
        </div>
        <div className="care-moods" aria-label="Mood observations this week">
          {WEEKLY_INSIGHTS.moods.map((entry) => (
            <div key={entry.day} className={`care-mood mood-${entry.mood.toLowerCase()}`}>
              <span>{entry.day}</span>
              <b>{entry.mood}</b>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function WeekStat({ label, value, pct, note }) {
  return (
    <div className="care-week-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <div className="mini-meter"><span style={{ width: `${Math.round(pct)}%` }} /></div>
      <small>{note}</small>
    </div>
  );
}
