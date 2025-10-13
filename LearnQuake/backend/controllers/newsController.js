import newsService from '../services/newsService.js';

class NewsController {
    async getEarthquakeNews(req, res) {
        try {
            const { query = 'earthquake', pageSize = 10, page = 1 } = req.query;
            const news = await newsService.getEarthquakeNews(query, parseInt(pageSize), parseInt(page));
            res.json(news);
        } catch (error) {
      console.error('Error fetching earthquake news:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch earthquake news',
      });
        }
    }

    async getTopHeadlines(req, res) {
        try {
            const { category = 'science', country = 'us' } = req.query;
            const news = await newsService.getTopHeadlines(category, country);
            res.json(news);
        } catch (error) {
            console.error('Error fetching top headlines:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

export default new NewsController();