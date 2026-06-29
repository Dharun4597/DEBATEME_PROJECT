// src/api/claude.js
//
// Thin wrapper around the Anthropic Messages API.
//
// IMPORTANT SECURITY NOTE:
// This calls the Anthropic API directly from the browser using a key stored
// in an env var (VITE_ANTHROPIC_API_KEY). That means the key ships in your
// built JS bundle and anyone can read it. That's fine for local dev/demos,
// but before you deploy this anywhere public, move this call behind a tiny
// backend (Node/Express, a Vercel function, etc.) that holds the real key
// server-side, and have the frontend call your backend instead.

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

function getApiKey() {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      "Missing VITE_ANTHROPIC_API_KEY. Add it to a .env file in the project root."
    );
  }
  return key;
}

async function callClaude(messages, system, maxTokens = 1024) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": getApiKey(),
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages
    })
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Claude API error (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find((block) => block.type === "text");
  return textBlock ? textBlock.text : "";
}

/**
 * Get Claude's next debate argument, arguing the given side of the topic.
 *
 * @param {string} topic - The debate topic/resolution.
 * @param {"for"|"against"} side - The side Claude is arguing.
 * @param {{role: "user"|"assistant", content: string}[]} history - Prior turns, oldest first.
 * @returns {Promise<string>} Claude's next argument.
 */
export async function getDebateResponse(topic, side, history) {
  const stance =
    side === "for"
      ? `You are arguing IN FAVOR of: "${topic}"`
      : `You are arguing AGAINST: "${topic}"`;

  const system = `You are a sharp, engaging debate opponent in a structured debate app called "Debate Me!".
${stance}
Rules:
- Stay firmly on your assigned side, even if you privately think the other side has merit.
- Write 2-4 short paragraphs per turn. Be persuasive, specific, and use concrete examples or reasoning.
- Directly rebut the user's most recent point before advancing your own.
- Keep a confident but respectful tone. No insults, no straw-manning.
- Do not break character or mention that you are an AI model.`;

  const messages = history.map((turn) => ({
    role: turn.role,
    content: turn.content
  }));

  return callClaude(messages, system, 600);
}

/**
 * Ask Claude to judge the full debate transcript and return a verdict.
 *
 * @param {string} topic
 * @param {{role: "user"|"assistant", content: string}[]} history
 * @returns {Promise<{winner: string, summary: string, userScore: number, aiScore: number}>}
 */
export async function getVerdict(topic, history) {
  const system = `You are an impartial debate judge. You will be shown a full transcript of a debate on the topic: "${topic}".
One side is labelled USER, the other is labelled AI.
Judge strictly on argument quality: logic, evidence, rebuttal strength, and clarity. Do not favor either side by default.
Respond with ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:
{"winner": "USER" | "AI" | "DRAW", "summary": "2-4 sentence explanation of the decision", "userScore": <integer 0-10>, "aiScore": <integer 0-10>}`;

  const transcript = history
    .map((turn) => `${turn.role === "user" ? "USER" : "AI"}: ${turn.content}`)
    .join("\n\n");

  const messages = [
    {
      role: "user",
      content: `Here is the full debate transcript:\n\n${transcript}\n\nReturn your verdict as JSON now.`
    }
  ];

  const raw = await callClaude(messages, system, 400);
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return {
      winner: "DRAW",
      summary: "Claude's verdict could not be parsed. Raw response: " + raw,
      userScore: 5,
      aiScore: 5
    };
  }
}
