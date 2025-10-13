import axios from 'axios';

class NewsService {
    constructor() {
        this.apiKey = process.env.NEWS_API_KEY;
        this.baseUrl = 'https://newsapi.org/v2';
    }

    async getEarthquakeNews(query = 'earthquake', pageSize = 10, page = 1) {
        try {
            const response = await axios.get(`${this.baseUrl}/everything`, {
                params: {
                    q: query,
                    apiKey: this.apiKey,
                    pageSize,
                    page,
                    sortBy: 'publishedAt',
                    language: 'en'
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`News API Error: ${error.response?.data?.message || error.message}`);
        }
    }

    async getTopHeadlines(category = 'science', country = 'us') {
        try {
            const response = await axios.get(`${this.baseUrl}/top-headlines`, {
                params: {
                    category,
                    country,
                    apiKey: this.apiKey
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`News API Error: ${error.response?.data?.message || error.message}`);
        }
    }
}

export default new NewsService();