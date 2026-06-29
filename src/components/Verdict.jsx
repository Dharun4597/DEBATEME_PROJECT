import { useEffect, useState } from "react";
import { getVerdict } from "../api/claude.js";

export default function Verdict({ topic, userSide, history, onRestart }) {
  const [verdict, setVerdict] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getVerdict(topic, history)
      .then((result) => {
        if (!cancelled) setVerdict(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not reach a verdict.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [topic, history]);

  const userWon = verdict?.winner === "USER";
  const aiWon = verdict?.winner === "AI";

  return (
    <div className="max-w-xl mx-auto px-6 py-16 text-center">
      <p className="font-body text-xs tracking-[0.2em] uppercase text-podium mb-2">
        The verdict
      </p>
      <h1 className="font-display text-3xl text-ink mb-6">{topic}</h1>

      {loading && (
        <p className="font-body text-ink/60 italic">
          Claude is weighing both sides…
        </p>
      )}

      {error && (
        <p className="font-body text-podium">{error}</p>
      )}

      {verdict && !loading && (
        <div className="bg-white/80 border border-ink/10 rounded-lg shadow-sm p-8">
          <div
            className={`gavel-strike inline-block text-5xl mb-4 ${
              verdict.winner === "DRAW" ? "" : ""
            }`}
            aria-hidden="true"
          >
            🔨
          </div>

          <h2 className="font-display text-2xl text-ink mb-2">
            {userWon && "You win the debate"}
            {aiWon && "Claude wins the debate"}
            {verdict.winner === "DRAW" && "It's a draw"}
          </h2>

          <div className="flex justify-center gap-8 my-6 font-body">
            <div>
              <p className="text-3xl font-bold text-sage">{verdict.userScore}</p>
              <p className="text-xs uppercase tracking-wide text-ink/50">
                You ({userSide})
              </p>
            </div>
            <div className="w-px bg-ink/10" />
            <div>
              <p className="text-3xl font-bold text-podium">{verdict.aiScore}</p>
              <p className="text-xs uppercase tracking-wide text-ink/50">
                Claude
              </p>
            </div>
          </div>

          <p className="font-body text-ink/80 text-sm leading-relaxed">
            {verdict.summary}
          </p>
        </div>
      )}

      <button
        onClick={onRestart}
        className="mt-8 font-body font-semibold text-white bg-ink rounded-md px-6 py-3 hover:bg-ink/90 transition-colors"
      >
        Start a new debate
      </button>
    </div>
  );
}
