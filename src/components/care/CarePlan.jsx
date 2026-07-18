import { useMemo, useState } from "react";
import {
  SAMPLE_DOG, DAILY_TASKS, SAMPLE_REMINDERS, REMINDER_TYPES,
  loadChecklist, saveChecklist, loadReminders, saveReminders,
} from "../../lib/care.js";

function formatDate(iso) {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-SG", { day: "numeric", month: "short" });
}

export default function CarePlan() {
  const [checked, setChecked] = useState(loadChecklist);
  const [userReminders, setUserReminders] = useState(loadReminders);
  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState({ label: "", date: "", type: REMINDER_TYPES[0] });
  const [draftError, setDraftError] = useState("");

  const doneCount = DAILY_TASKS.filter((task) => checked[task.id]).length;
  const pct = Math.round((doneCount / DAILY_TASKS.length) * 100);

  const toggle = (id) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    saveChecklist(next);
  };

  const reminders = useMemo(() => {
    return [...SAMPLE_REMINDERS, ...userReminders].sort((a, b) => a.date.localeCompare(b.date));
  }, [userReminders]);

  const addReminder = (event) => {
    event.preventDefault();
    if (!draft.label.trim() || !draft.date) {
      setDraftError("Please give the reminder a name and a date.");
      return;
    }
    const next = [...userReminders, { ...draft, label: draft.label.trim(), id: `u-${Date.now()}` }];
    setUserReminders(next);
    saveReminders(next);
    setDraft({ label: "", date: "", type: REMINDER_TYPES[0] });
    setDraftError("");
    setShowModal(false);
  };

  const removeReminder = (id) => {
    const next = userReminders.filter((entry) => entry.id !== id);
    setUserReminders(next);
    saveReminders(next);
  };

  return (
    <div className="care-plan">
      <section className="panel care-checklist" aria-label="Today's care plan">
        <div className="care-plan-head">
          <div>
            <p className="eyebrow">Today's care plan</p>
            <h1>{doneCount === DAILY_TASKS.length ? `All done — good human! 🎉` : `${SAMPLE_DOG.name}'s day, step by step`}</h1>
          </div>
          <div className="care-plan-ring" role="img" aria-label={`${pct}% of today's plan completed`}>
            <svg viewBox="0 0 44 44" width="72" height="72">
              <circle cx="22" cy="22" r="19" fill="none" stroke="var(--latte)" strokeWidth="5" />
              <circle
                cx="22" cy="22" r="19" fill="none" stroke="var(--sage)" strokeWidth="5"
                strokeLinecap="round" strokeDasharray={`${(pct / 100) * 119.4} 119.4`}
                transform="rotate(-90 22 22)"
              />
            </svg>
            <b>{pct}%</b>
          </div>
        </div>
        <ul className="care-task-list">
          {DAILY_TASKS.map((task) => (
            <li key={task.id}>
              <label className={checked[task.id] ? "care-task done" : "care-task"}>
                <input
                  type="checkbox"
                  checked={Boolean(checked[task.id])}
                  onChange={() => toggle(task.id)}
                />
                <span className="care-task-icon" aria-hidden="true">{task.icon}</span>
                <span className="care-task-label">{task.label}</span>
                <span className="care-task-time">{task.time}</span>
              </label>
            </li>
          ))}
        </ul>
        <p className="helper-copy">Ticks are saved on this device and reset each morning.</p>
      </section>

      <section className="panel care-reminders" aria-label="Upcoming reminders">
        <div className="care-plan-head">
          <div>
            <p className="eyebrow">Upcoming</p>
            <h2>Reminders</h2>
          </div>
          <button className="primary-action compact-action" type="button" onClick={() => setShowModal(true)}>
            + Add reminder
          </button>
        </div>
        <ul className="care-reminder-list">
          {reminders.map((entry) => (
            <li key={entry.id}>
              <span className={`care-reminder-type type-${entry.type.toLowerCase()}`}>{entry.type}</span>
              <span className="care-reminder-label">{entry.label}</span>
              <span className="care-reminder-date">{formatDate(entry.date)}</span>
              {entry.id.startsWith("u-") && (
                <button
                  className="care-reminder-remove"
                  type="button"
                  aria-label={`Remove reminder: ${entry.label}`}
                  onClick={() => removeReminder(entry.id)}
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {showModal && (
        <div className="care-modal-backdrop" role="presentation" onClick={() => setShowModal(false)}>
          <form
            className="panel care-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Add a reminder"
            onClick={(event) => event.stopPropagation()}
            onSubmit={addReminder}
          >
            <h2>Add a reminder</h2>
            {draftError && <p className="notice error">{draftError}</p>}
            <label className="field">
              <span>What's it for?</span>
              <input
                value={draft.label}
                onChange={(event) => setDraft({ ...draft, label: event.target.value })}
                placeholder="e.g. Tick treatment"
                autoFocus
              />
            </label>
            <label className="field">
              <span>Date</span>
              <input
                type="date"
                value={draft.date}
                onChange={(event) => setDraft({ ...draft, date: event.target.value })}
              />
            </label>
            <label className="field">
              <span>Type</span>
              <select
                value={draft.type}
                onChange={(event) => setDraft({ ...draft, type: event.target.value })}
              >
                {REMINDER_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <div className="care-modal-actions">
              <button className="ghost-action" type="button" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="primary-action" type="submit">Save reminder</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
