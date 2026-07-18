import { useEffect, useRef, useState } from "react";
import { SAMPLE_DOG, STARTER_QUESTIONS, askCub } from "../../lib/care.js";

function timeLabel(date) {
  return date.toLocaleTimeString("en-SG", { hour: "numeric", minute: "2-digit" });
}

const WELCOME = {
  role: "cub",
  text:
    `Hi! I'm CUB, and I know ${SAMPLE_DOG.name}'s profile — ` +
    `${SAMPLE_DOG.ageYears}-year-old ${SAMPLE_DOG.breed}, ${SAMPLE_DOG.weightKg}kg, big social energy. ` +
    "Ask me anything about her behaviour or day-to-day care, or tap a question below to start.",
};

export default function AskCub() {
  const [messages, setMessages] = useState([{ ...WELCOME, at: new Date() }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, busy]);

  const send = async (text) => {
    const question = text.trim();
    if (!question || busy) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "you", text: question, at: new Date() }]);
    setBusy(true);
    const reply = await askCub(question);
    setMessages((prev) => [...prev, { role: "cub", text: reply, at: new Date() }]);
    setBusy(false);
  };

  const clearChat = () => {
    setMessages([{ ...WELCOME, at: new Date() }]);
    setInput("");
  };

  return (
    <div className="care-chat">
      <section className="panel care-chat-panel" aria-label="Ask CUB chat">
        <div className="care-chat-top">
          <div className="care-chat-title">
            <img src={SAMPLE_DOG.photo} alt="" aria-hidden="true" />
            <div>
              <h1>Ask CUB</h1>
              <p>About {SAMPLE_DOG.name} · {SAMPLE_DOG.breed}</p>
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
            placeholder={`Ask about ${SAMPLE_DOG.name}…`}
            aria-label="Your question for CUB"
            enterKeyHint="send"
          />
          <button className="primary-action" type="submit" disabled={busy || !input.trim()}>
            Send
          </button>
        </form>

        <p className="helper-copy care-chat-disclaimer">
          CUB offers general guidance from {SAMPLE_DOG.name}'s profile and common canine behaviour
          patterns. It is not a veterinarian or qualified behaviourist — for anything urgent or
          medical, please consult a professional.
        </p>
      </section>
    </div>
  );
}
