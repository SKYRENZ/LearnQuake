import footageService from '../services/footageService.js';

class FootageController {
  async getVideos(req, res) {
    try {
      const { region = 'PH', maxResults = 12 } = req.query;
      const videos = await footageService.fetchEarthquakeVideos(region, Number(maxResults));
      res.json({ success: true, data: videos });
    } catch (error) {
      console.error('Error fetching footage:', error.message);
      res.status(500).json({ success: false, error: 'Failed to fetch earthquake videos' });
    }
  }
}

export default new FootageController();