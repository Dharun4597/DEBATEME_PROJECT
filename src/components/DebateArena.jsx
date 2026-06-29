import { useEffect, useRef, useState } from "react";
import { getDebateResponse } from "../api/claude.js";

const MAX_ROUNDS = 4;

export default function DebateArena({ topic, userSide, onFinish }) {
  const aiSide = userSide === "for" ? "against" : "for";
  const [history, setHistory] = useState([]);
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  const userTurns = history.filter((t) => t.role === "user").length;
  const debateOver = userTurns >= MAX_ROUNDS;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isThinking]);

  async function sendArgument(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || isThinking || debateOver) return;

    const newHistory = [...history, { role: "user", content: text }];
    setHistory(newHistory);
    setDraft("");
    setIsThinking(true);
    setError(null);

    try {
      const reply = await getDebateResponse(topic, aiSide, newHistory);
      setHistory([...newHistory, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err.message || "Something went wrong talking to Claude.");
    } finally {
      setIsThinking(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col h-screen">
      <header className="mb-4">
        <p className="font-body text-xs tracking-[0.2em] uppercase text-podium">
          Round {Math.min(userTurns + (debateOver ? 0 : 1), MAX_ROUNDS)} of{" "}
          {MAX_ROUNDS}
        </p>
        <h2 className="font-display text-2xl text-ink leading-snug">
          {topic}
        </h2>
        <p className="font-body text-sm text-ink/60 mt-1">
          You're arguing <span className="font-semibold text-sage">{userSide.toUpperCase()}</span>{" "}
          · Claude is arguing{" "}
          <span className="font-semibold text-podium">{aiSide.toUpperCase()}</span>
        </p>
      </header>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {history.length === 0 && (
          <p className="font-body text-sm text-ink/50 italic text-center py-12">
            Make your opening argument to start the debate.
          </p>
        )}

        {history.map((turn, i) => (
          <div
            key={i}
            className={`flex ${turn.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-3 font-body text-sm whitespace-pre-wrap shadow-sm ${
                turn.role === "user"
                  ? "bg-sage text-white rounded-br-none"
                  : "bg-white border border-ink/10 text-ink rounded-bl-none"
              }`}
            >
              {turn.content}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg rounded-bl-none px-4 py-3 bg-white border border-ink/10 text-ink/50 font-body text-sm italic">
              Claude is preparing a rebuttal…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="font-body text-sm text-podium mt-2">{error}</p>
      )}

      {debateOver ? (
        <div className="mt-4 border-t border-ink/10 pt-4 text-center">
          <p className="font-body text-sm text-ink/70 mb-3">
            Both sides have made their case.
          </p>
          <button
            onClick={() => onFinish(history)}
            className="font-body font-semibold text-white bg-gavel rounded-md px-6 py-3 hover:opacity-90 transition-opacity"
          >
            Call for a verdict
          </button>
        </div>
      ) : (
        <form onSubmit={sendArgument} className="mt-4 flex gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                sendArgument(e);
              }
            }}
            placeholder="Make your argument…"
            rows={2}
            disabled={isThinking}
            className="flex-1 rounded-md border border-ink/20 bg-white px-3 py-2 font-body text-sm text-ink focus:outline-none focus:ring-2 focus:ring-sage/50 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isThinking || !draft.trim()}
            className="font-body font-semibold text-white bg-ink rounded-md px-5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink/90 transition-colors"
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}
