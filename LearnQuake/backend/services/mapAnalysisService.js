import { mapSystemPrompt } from "../mapRules.js";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

function assertEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function generateMapAnalysis({ place, magnitude, areaCoverage, coordinates }) {
  const apiKey = assertEnv("OPENAI_API_KEY");

  const payload = {
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: mapSystemPrompt },
      {
        role: "user",
        content: JSON.stringify({
          place,
          coordinates,
          magnitude,
          areaCoverage,
        }),
      },
    ],
  };

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI request failed with status ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const analysisText = data.choices?.[0]?.message?.content;

  if (!analysisText) {
    throw new Error("No content received from OpenAI.");
  }

  try {
    return JSON.parse(analysisText);
  } catch (error) {
    throw new Error("Invalid AI response: expected JSON payload.");
  }
}

export default { generateMapAnalysis };
