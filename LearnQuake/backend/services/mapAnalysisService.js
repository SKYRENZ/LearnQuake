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

// New data sources for geological features
export const GEOLOGICAL_DATA_SOURCES = {
  HISTORICAL_EARTHQUAKES: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson',
  TSUNAMI_ZONES: 'https://raw.githubusercontent.com/your-repo/tsunami-zones-philippines.geojson', // You'll need to host this
  ACTIVE_VOLCANOES: 'https://raw.githubusercontent.com/your-repo/philippines-volcanoes.geojson', // You'll need to host this
};

export default { generateMapAnalysis, GEOLOGICAL_DATA_SOURCES };
