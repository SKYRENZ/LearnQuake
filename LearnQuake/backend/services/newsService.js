import axios from 'axios';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

const VIDEO_HOST_HINTS = ['youtube', 'youtu.be', 'vimeo', 'dailymotion', 'facebook.com/watch', 'twitter.com', 'tiktok', 'video'];
const VIDEO_TEXT_HINTS = ['video', 'watch', 'footage', 'livestream', 'broadcast'];

function filterVideoArticles(articles = []) {
  return articles.filter(article => {
    const url = (article.url || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    const content = (article.content || '').toLowerCase();
    const combinedText = `${description} ${content}`;

    const urlHasVideoHint = VIDEO_HOST_HINTS.some(hint => url.includes(hint));
    const textHasVideoHint = VIDEO_TEXT_HINTS.some(hint => combinedText.includes(hint));

    return urlHasVideoHint || textHasVideoHint;
  });
}

class NewsService {
  async fetchEarthquakeNews(pageSize = 10, country = 'ph') {
    try {
      const response = await axios.get(NEWS_API_URL, {
        params: {
          q: 'earthquake AND (video OR footage)',
          language: 'en',
          sortBy: 'publishedAt',
          pageSize,
          apiKey: NEWS_API_KEY,
        },
      });

      const filtered = filterVideoArticles(response.data.articles);

      return {
        success: true,
        articles: filtered.map(article => ({
          title: article.title,
          description: article.description,
          url: article.url,
          urlToImage: article.urlToImage,
          publishedAt: article.publishedAt,
          source: article.source,
          content: article.content,
        })),
        totalResults: filtered.length,
      };
    } catch (error) {
      console.error('Error fetching earthquake news:', error.message);
      return { success: false, error: error.message, articles: [] };
    }
  }

  async searchEarthquakeByLocation(location, pageSize = 5) {
    try {
      const response = await axios.get(NEWS_API_URL, {
        params: {
          q: `earthquake ${location} AND (video OR footage)`,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize,
          apiKey: NEWS_API_KEY,
        },
      });

      const filtered = filterVideoArticles(response.data.articles);

      return {
        success: true,
        articles: filtered.map(article => ({
          title: article.title,
          description: article.description,
          url: article.url,
          urlToImage: article.urlToImage,
          publishedAt: article.publishedAt,
          source: article.source,
          content: article.content,
        })),
        totalResults: filtered.length,
      };
    } catch (error) {
      console.error('Error searching earthquake news:', error.message);
      return { success: false, error: error.message, articles: [] };
    }
  }

  async fetchNewsByDateRange(startDate, endDate, pageSize = 10) {
    try {
      const response = await axios.get(NEWS_API_URL, {
        params: {
          q: 'earthquake AND (video OR footage)',
          language: 'en',
          from: startDate,
          to: endDate,
          sortBy: 'publishedAt',
          pageSize,
          apiKey: NEWS_API_KEY,
        },
      });

      const filtered = filterVideoArticles(response.data.articles);

      return {
        success: true,
        articles: filtered,
        totalResults: filtered.length,
      };
    } catch (error) {
      console.error('Error fetching news by date range:', error.message);
      return { success: false, error: error.message, articles: [] };
    }
  }
}

export default new NewsService();