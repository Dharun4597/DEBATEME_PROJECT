import { useState } from "react";

const SUGGESTIONS = [
  "Social media does more harm than good",
  "Remote work is better than office work",
  "AI will create more jobs than it destroys",
  "Zoos should be banned",
  "College is no longer worth the cost"
];

export default function TopicSetup({ onStart }) {
  const [topic, setTopic] = useState("");
  const [side, setSide] = useState("for");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = topic.trim();
    if (!trimmed) return;
    onStart(trimmed, side);
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <p className="font-body text-xs tracking-[0.2em] uppercase text-podium mb-2">
          Step into the chamber
        </p>
        <h1 className="font-display text-4xl text-ink mb-3">Debate Me!</h1>
        <p className="font-body text-ink/70">
          Pick a resolution, choose your side, and argue it out with Claude.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white/70 border border-ink/10 rounded-lg shadow-sm p-6 space-y-6"
      >
        <div>
          <label className="block font-body text-sm font-semibold text-ink mb-2">
            Resolution
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Pineapple belongs on pizza"
            rows={2}
            className="w-full rounded-md border border-ink/20 bg-parchment/60 px-3 py-2 font-body text-ink focus:outline-none focus:ring-2 focus:ring-podium/50"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {SUGGESTIONS.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setTopic(s)}
                className="text-xs font-body px-3 py-1 rounded-full border border-ink/15 text-ink/70 hover:border-podium hover:text-podium transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-body text-sm font-semibold text-ink mb-2">
            Your side
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSide("for")}
              className={`rounded-md border px-4 py-3 font-body text-sm font-medium transition-colors ${
                side === "for"
                  ? "border-sage bg-sage text-white"
                  : "border-ink/20 text-ink/70 hover:border-sage"
              }`}
            >
              I argue FOR
              <span className="block text-xs opacity-80 mt-0.5">
                Claude argues against
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSide("against")}
              className={`rounded-md border px-4 py-3 font-body text-sm font-medium transition-colors ${
                side === "against"
                  ? "border-podium bg-podium text-white"
                  : "border-ink/20 text-ink/70 hover:border-podium"
              }`}
            >
              I argue AGAINST
              <span className="block text-xs opacity-80 mt-0.5">
                Claude argues for
              </span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={!topic.trim()}
          className="w-full font-body font-semibold text-white bg-ink rounded-md py-3 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink/90 transition-colors"
        >
          Enter the debate
        </button>
      </form>
    </div>
  );
}
