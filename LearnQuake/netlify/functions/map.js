import { generateMapAnalysis } from "../../backend/services/mapAnalysisService.js";

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { success: false, error: "Method Not Allowed" });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (error) {
    return jsonResponse(400, { success: false, error: "Invalid JSON payload" });
  }

  const { place, magnitude, areaCoverage, coordinates } = body;

  if (!place || typeof magnitude === "undefined" || !areaCoverage || !coordinates) {
    return jsonResponse(400, {
      success: false,
      error: "Missing required fields: place, magnitude, areaCoverage, coordinates",
    });
  }

  try {
    const analysis = await generateMapAnalysis({ place, magnitude, areaCoverage, coordinates });
    return jsonResponse(200, { success: true, analysis });
  } catch (error) {
    console.error("Map function error:", error);
    return jsonResponse(500, { success: false, error: error.message });
  }
};
