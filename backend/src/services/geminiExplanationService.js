const env = require("../config/env");
const systemPrompt = "You are an educational guidance assistant for students after 10th. Using ONLY the supplied assessment results and pathway information, explain recommendations in simple language. Do not calculate or change scores. Do not invent eligibility requirements, colleges, careers, salaries, or facts. Mention uncertainty where relevant and create a step-by-step educational roadmap.";

async function explainRecommendations(payload) {
  if (!env.geminiApiKey) return null;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent`, {
    method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": env.geminiApiKey },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nAssessment data:\n${JSON.stringify(payload)}` }] }], generationConfig: { responseMimeType: "application/json", responseSchema: { type: "OBJECT", properties: { summary: { type: "STRING" }, recommendations: { type: "ARRAY", items: { type: "OBJECT", properties: { pathway: { type: "STRING" }, why: { type: "STRING" }, nextSteps: { type: "ARRAY", items: { type: "STRING" } } }, required: ["pathway", "why", "nextSteps"] } }, exploreMore: { type: "ARRAY", items: { type: "STRING" } } }, required: ["summary", "recommendations", "exploreMore"] } } }),
  });
  if (!response.ok) throw new Error(`Gemini explanation request failed (${response.status}).`);
  const data = await response.json(); const text = data.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("");
  return text ? JSON.parse(text) : null;
}
module.exports = { explainRecommendations };
