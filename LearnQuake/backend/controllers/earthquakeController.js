import USGSEarthquakeService from '../services/usgsEarthquakeService.js';

const earthquakeService = new USGSEarthquakeService();

export async function searchByLocation(req, res) {
  try {
    const { location, radius = 500, timeframe = 'month', limit = 50 } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location parameter is required',
      });
    }

    console.log(`Searching earthquakes near: ${location}`);

    const result = await earthquakeService.searchEarthquakesByLocation(
      location,
      parseInt(radius),
      timeframe,
    );

    const limitedEarthquakes = result.earthquakes.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        searchLocation: result.searchLocation,
        earthquakes: limitedEarthquakes,
        totalFound: result.totalFound,
        showing: limitedEarthquakes.length,
      },
    });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export async function getRecent(req, res) {
  try {
    const { timeframe = 'day', limit = 20 } = req.query;

    const earthquakes = await earthquakeService.fetchAllEarthquakes(timeframe);
    const limitedEarthquakes = earthquakes
      .sort((a, b) => b.magnitude - a.magnitude)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: limitedEarthquakes,
      count: limitedEarthquakes.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export async function searchByCountry(req, res) {
  try {
    const { country, timeframe = 'month', limit = 50 } = req.query;

    if (!country) {
      return res.status(400).json({
        success: false,
        error: 'Country parameter is required',
      });
    }

    const result = await earthquakeService.searchEarthquakesByCountry(country, timeframe);

    if (limit && result.earthquakes.length > limit) {
      result.earthquakes = result.earthquakes.slice(0, parseInt(limit));
      result.showing = parseInt(limit);
    } else {
      result.showing = result.earthquakes.length;
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error searching earthquakes by country:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}