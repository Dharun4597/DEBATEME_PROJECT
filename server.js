// server.js
//
// Small Express server that:
//  1. Serves the built frontend (dist/) as static files.
//  2. Exposes /api/debate-response and /api/verdict, which hold the
//     Anthropic API key server-side and proxy requests to Claude.
//
// This is what keeps ANTHROPIC_API_KEY out of the browser bundle.

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

const app = express();
app.use(express.json({ limit: "1mb" }));

function getApiKey() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      "Missing ANTHROPIC_API_KEY environment variable on the server."
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
      "anthropic-version": "2023-06-01"
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

app.post("/api/debate-response", async (req, res) => {
  try {
    const { topic, side, history } = req.body;

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

    const messages = (history || []).map((turn) => ({
      role: turn.role,
      content: turn.content
    }));

    const text = await callClaude(messages, system, 600);
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/verdict", async (req, res) => {
  try {
    const { topic, history } = req.body;

    const system = `You are an impartial debate judge. You will be shown a full transcript of a debate on the topic: "${topic}".
One side is labelled USER, the other is labelled AI.
Judge strictly on argument quality: logic, evidence, rebuttal strength, and clarity. Do not favor either side by default.
Respond with ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:
{"winner": "USER" | "AI" | "DRAW", "summary": "2-4 sentence explanation of the decision", "userScore": <integer 0-10>, "aiScore": <integer 0-10>}`;

    const transcript = (history || [])
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

    let verdict;
    try {
      verdict = JSON.parse(cleaned);
    } catch {
      verdict = {
        winner: "DRAW",
        summary: "Claude's verdict could not be parsed. Raw response: " + raw,
        userScore: 5,
        aiScore: 5
      };
    }
    res.json(verdict);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Serve the built frontend
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Debate Me! server running on port ${PORT}`);
});
