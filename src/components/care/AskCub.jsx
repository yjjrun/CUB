import { useEffect, useMemo, useRef, useState } from "react";
import { SAMPLE_DOG, STARTER_QUESTIONS, askCub } from "../../lib/care.js";

function timeLabel(date) {
  return date.toLocaleTimeString("en-SG", { hour: "numeric", minute: "2-digit" });
}

function welcomeFor(dog, isDemo) {
  const weightText = dog.weightKg ? `${dog.weightKg}kg` : "weight not set";
  return {
    role: "cub",
    text: isDemo
      ? `Hi! I'm CUB, and I know ${SAMPLE_DOG.name}'s demo profile - ${SAMPLE_DOG.ageYears}-year-old ${SAMPLE_DOG.breed}, ${SAMPLE_DOG.weightKg}kg, big social energy. Ask me anything about her behaviour or day-to-day care, or tap a question below to start.`
      : `Hi! I'm CUB, and I have ${dog.name || "your dog"}'s care profile - ${dog.breed || "breed not set"}, ${weightText}. Ask me anything about day-to-day care, routines, enrichment, or comfort signals.`,
  };
}

async function askPersonalCare(question, dog) {
  const lower = question.toLowerCase();
  const name = dog.name || "your dog";
  const energy = Number(dog.traits?.energy) || 55;
  const trainability = Number(dog.traits?.trainability) || 55;
  const sociability = Number(dog.traits?.sociability) || 55;
  let reply =
    `${name}'s saved CUB Care profile gives me the basics, but it is not a full veterinary or behaviour assessment yet. Use this as a starting point and adjust with your shelter or vet if you see anything unusual.`;

  if (lower.includes("food") || lower.includes("meal") || lower.includes("eat") || lower.includes("nutrition")) {
    const weight = Number(dog.weightKg) || 18;
    const grams = Math.max(80, Math.round(weight * (energy >= 75 ? 13 : energy >= 50 ? 11 : 9)));
    reply = `For ${name}, start with an age-appropriate complete food and split the day into two meals. Based on the profile weight and energy setting, the demo estimate is about ${grams}g per day, but your food label and vet advice should decide the exact amount. Keep treats modest and track appetite changes.`;
  } else if (lower.includes("walk") || lower.includes("exercise") || lower.includes("energy") || lower.includes("activity")) {
    const minutes = energy >= 75 ? 75 : energy >= 50 ? 50 : 30;
    reply = `${name}'s energy setting suggests aiming for around ${minutes} minutes of movement across the day. Two shorter walks plus sniffing or play is usually easier to sustain than one intense burst. In Singapore heat, early morning and evening are kinder.`;
  } else if (lower.includes("train") || lower.includes("enrichment") || lower.includes("bored")) {
    reply = trainability >= 70
      ? `${name}'s trainability setting is fairly high, so short daily sessions should work well. Try 5-10 minutes of recall, stay, or settling practice, then end while ${name} is still engaged.`
      : `${name} may do better with very simple training wins: name response, hand target, mat settling, and food puzzles. Keep sessions short and avoid pushing through frustration.`;
  } else if (lower.includes("social") || lower.includes("people") || lower.includes("dog") || lower.includes("friend")) {
    reply = sociability >= 70
      ? `${name}'s sociability setting suggests social time may be rewarding, but introductions should still be calm and controlled. Watch body language, not just enthusiasm.`
      : `${name}'s sociability setting suggests giving more space and slower introductions. Choose quiet environments, reward calm looking, and do not force greetings.`;
  } else if (lower.includes("scan") || lower.includes("emotion") || lower.includes("mood") || lower.includes("body")) {
    reply = `For ${name}, use the Emotion Scan as a care log helper rather than a diagnosis. Save repeated observations and look for patterns: appetite, posture, stiffness, sleep, triggers, and recovery time matter more than one reading.`;
  }

  await new Promise((resolve) => setTimeout(resolve, 700 + Math.min(1200, reply.length * 2)));
  return reply;
}

export default function AskCub({ dog = SAMPLE_DOG, isDemo = true }) {
  const welcome = useMemo(() => welcomeFor(dog, isDemo), [dog, isDemo]);
  const [messages, setMessages] = useState([{ ...welcome, at: new Date() }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef(null);

  useEffect(() => {
    setMessages([{ ...welcome, at: new Date() }]);
  }, [welcome]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, busy]);

  const send = async (text) => {
    const question = text.trim();
    if (!question || busy) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "you", text: question, at: new Date() }]);
    setBusy(true);
    const reply = isDemo ? await askCub(question) : await askPersonalCare(question, dog);
    setMessages((prev) => [...prev, { role: "cub", text: reply, at: new Date() }]);
    setBusy(false);
  };

  const clearChat = () => {
    setMessages([{ ...welcome, at: new Date() }]);
    setInput("");
  };

  return (
    <div className="care-chat">
      <section className="panel care-chat-panel" aria-label="Ask CUB chat">
        <div className="care-chat-top">
          <div className="care-chat-title">
            <img src={dog.photo || SAMPLE_DOG.photo} alt="" aria-hidden="true" />
            <div>
              <h1>Ask CUB</h1>
              <p>About {dog.name || "your dog"} · {dog.breed || "breed not set"}</p>
            </div>
          </div>
          <button className="ghost-action compact-action" type="button" onClick={clearChat}>
            New conversation
          </button>
        </div>

        <div className="care-chat-log" ref={logRef} aria-live="polite">
          {messages.map((message, index) => (
            <div key={index} className={`care-msg from-${message.role}`}>
              <div className="care-msg-bubble">
                {message.text.split("\n").map((line, lineIndex) => (
                  line ? <p key={lineIndex}>{line}</p> : <br key={lineIndex} />
                ))}
              </div>
              <span className="care-msg-time">{message.role === "cub" ? "CUB" : "You"} · {timeLabel(message.at)}</span>
            </div>
          ))}
          {busy && (
            <div className="care-msg from-cub">
              <div className="care-msg-bubble care-typing" aria-label="CUB is typing">
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>

        <div className="care-chat-starters" aria-label="Suggested questions">
          {STARTER_QUESTIONS.map((question) => (
            <button key={question} type="button" disabled={busy} onClick={() => send(question)}>
              {question}
            </button>
          ))}
        </div>

        <form
          className="care-chat-composer"
          onSubmit={(event) => {
            event.preventDefault();
            send(input);
          }}
        >
          <input
            value={input}
            disabled={busy}
            onChange={(event) => setInput(event.target.value)}
            placeholder={`Ask about ${dog.name || "your dog"}...`}
            aria-label="Your question for CUB"
            enterKeyHint="send"
          />
          <button className="primary-action" type="submit" disabled={busy || !input.trim()}>
            Send
          </button>
        </form>

        <p className="helper-copy care-chat-disclaimer">
          CUB offers general guidance from {dog.name || "your dog"}'s profile and common canine behaviour
          patterns. It is not a veterinarian or qualified behaviourist — for anything urgent or
          medical, please consult a professional.
        </p>
      </section>
    </div>
  );
}
