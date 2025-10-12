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
  const { country, timeframe = "month", limit = "50" } = params;

  if (!country) {
    return jsonResponse(400, {
      success: false,
      error: "Country parameter is required",
    });
  }

  try {
    const result = await earthquakeService.searchEarthquakesByCountry(country, timeframe);

    const limitedEarthquakes = result.earthquakes.slice(0, parseInt(limit, 10));

    return jsonResponse(200, {
      success: true,
      data: {
        ...result,
        earthquakes: limitedEarthquakes,
        showing: limitedEarthquakes.length,
      },
    });
  } catch (error) {
    console.error("Country search error:", error);
    return jsonResponse(500, { success: false, error: error.message });
  }
};
