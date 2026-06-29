# Debate Me!

Debate an AI. Pick a topic, pick a side, argue it out, and get a verdict.

## Stack

- React + Vite
- Tailwind CSS
- Anthropic API (Claude) for the opponent and the judge

## Project structure

```
src/
  api/
    claude.js          # talks to the Anthropic Messages API
  components/
    TopicSetup.jsx     # pick a topic + side
    DebateArena.jsx     # the back-and-forth debate
    Verdict.jsx          # Claude judges the transcript
  App.jsx              # wires the three screens together
  main.jsx
  index.css
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and add your Anthropic API key:

   ```bash
   cp .env.example .env
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open the printed local URL (usually http://localhost:5173).

## Important security note

`src/api/claude.js` calls the Anthropic API directly from the browser using
the key in `VITE_ANTHROPIC_API_KEY`. That key ends up in your built JS, so
anyone who opens dev tools can read it. That's fine for messing around
locally, but **before deploying this anywhere public**, move the API call
into a small backend (an Express route, a Vercel/Netlify function, etc.)
that holds the key server-side, and have the frontend call that backend
instead.

## How it works

1. **TopicSetup** — type a resolution (or pick a suggestion) and choose
   whether you're arguing for or against it.
2. **DebateArena** — you and Claude trade arguments for 4 rounds each.
   Claude always argues the opposite side from you and replies to your most
   recent point.
3. **Verdict** — once the rounds are up, the full transcript is sent to
   Claude again, this time acting as an impartial judge, who returns a
   winner, a score for each side, and a short explanation.
