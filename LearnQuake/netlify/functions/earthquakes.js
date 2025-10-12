import USGSEarthquakeService from "../../backend/services/usgsEarthquakeService.js";

const earthquakeService = new USGSEarthquakeService();

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
  if (event.httpMethod !== "GET") {
    return jsonResponse(405, { success: false, error: "Method Not Allowed" });
  }

  const params = event.queryStringParameters || {};
  const { timeframe = "day", limit = "20" } = params;

  try {
    const earthquakes = await earthquakeService.fetchAllEarthquakes(timeframe);
    const limitedEarthquakes = earthquakes
      .sort((a, b) => b.magnitude - a.magnitude)
      .slice(0, parseInt(limit, 10));

    return jsonResponse(200, {
      success: true,
      data: limitedEarthquakes,
      count: limitedEarthquakes.length,
    });
  } catch (error) {
    console.error("List earthquakes error:", error);
    return jsonResponse(500, { success: false, error: error.message });
  }
};
