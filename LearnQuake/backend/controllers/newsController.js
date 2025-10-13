import newsService from '../services/newsService.js';

class NewsController {
  async getEarthquakeNews(req, res) {
    try {
      const { pageSize = 10, country = 'ph' } = req.query;
      const result = await newsService.fetchEarthquakeNews(
        parseInt(pageSize),
        country
      );

      if (!result.success) {
        return res.status(500).json({
          error: 'Failed to fetch earthquake news',
          message: result.error,
        });
      }

      res.json({
        success: true,
        data: result.articles,
        totalResults: result.totalResults,
      });
    } catch (error) {
      console.error('Error in getEarthquakeNews:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
      });
    }
  }

  async searchNewsByLocation(req, res) {
    try {
      const { location, pageSize = 5 } = req.query;

      if (!location) {
        return res.status(400).json({
          error: 'Location parameter is required',
        });
      }

      const result = await newsService.searchEarthquakeByLocation(
        location,
        parseInt(pageSize)
      );

      if (!result.success) {
        return res.status(500).json({
          error: 'Failed to search earthquake news',
          message: result.error,
        });
      }

      res.json({
        success: true,
        data: result.articles,
        totalResults: result.totalResults,
      });
    } catch (error) {
      console.error('Error in searchNewsByLocation:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
      });
    }
  }

  async getNewsByDateRange(req, res) {
    try {
      const { startDate, endDate, pageSize = 10 } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: 'startDate and endDate parameters are required',
        });
      }

      const result = await newsService.fetchNewsByDateRange(
        startDate,
        endDate,
        parseInt(pageSize)
      );

      if (!result.success) {
        return res.status(500).json({
          error: 'Failed to fetch news by date range',
          message: result.error,
        });
      }

      res.json({
        success: true,
        data: result.articles,
        totalResults: result.totalResults,
      });
    } catch (error) {
      console.error('Error in getNewsByDateRange:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
      });
    }
  }
}

export default new NewsController();