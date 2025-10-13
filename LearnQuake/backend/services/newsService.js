import axios from 'axios';

class NewsService {
    constructor() {
        this.baseUrl = 'https://newsapi.org/v2';
    }

    getApiKey() {
        const apiKey = process.env.NEWS_API_KEY;
        if (!apiKey) {
            console.error('WARNING: NEWS_API_KEY not found in environment variables');
            console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('NEWS')));
            throw new Error('News API key is not configured. Please check your environment variables.');
        }
        return apiKey;
    }

    async getEarthquakeNews(query = 'earthquake', pageSize = 10, page = 1) {
        const apiKey = this.getApiKey();

        try {
            console.log('Making request to NewsAPI with query:', query);
            
            // First try with specific earthquake terms
            let response = await axios.get(`${this.baseUrl}/everything`, {
                params: {
                    q: query,
                    apiKey: apiKey,
                    pageSize: pageSize * 2, // Get more results to filter
                    page,
                    sortBy: 'publishedAt',
                    language: 'en',
                    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Last 30 days
                }
            });
            
            console.log('NewsAPI response status:', response.status);
            console.log('Total articles found:', response.data.totalResults);
            
            let articles = response.data.articles || [];
            
            // Filter articles to ensure they're earthquake-related
            const earthquakeKeywords = ['earthquake', 'seismic', 'tremor', 'magnitude', 'richter', 'geological', 'usgs', 'fault', 'aftershock'];
            const filteredArticles = articles.filter(article => {
                const titleAndDesc = (article.title + ' ' + (article.description || '')).toLowerCase();
                return earthquakeKeywords.some(keyword => titleAndDesc.includes(keyword));
            });

            console.log(`Filtered ${articles.length} articles down to ${filteredArticles.length} earthquake-related articles`);
            
            // If we don't have enough earthquake articles, try science category
            if (filteredArticles.length < pageSize) {
                console.log('Not enough earthquake articles, trying science headlines...');
                const scienceResponse = await this.getTopHeadlines('science', 'us');
                const scienceArticles = scienceResponse.articles || [];
                
                // Filter science articles for earthquake content
                const moreEarthquakeArticles = scienceArticles.filter(article => {
                    const titleAndDesc = (article.title + ' ' + (article.description || '')).toLowerCase();
                    return earthquakeKeywords.some(keyword => titleAndDesc.includes(keyword));
                });
                
                console.log(`Found ${moreEarthquakeArticles.length} additional earthquake articles from science category`);
                
                // Combine and deduplicate
                const combined = [...filteredArticles, ...moreEarthquakeArticles];
                const unique = combined.filter((article, index, self) => 
                    index === self.findIndex(a => a.title === article.title)
                );
                
                return {
                    ...response.data,
                    articles: unique.slice(0, pageSize)
                };
            }
            
            return {
                ...response.data,
                articles: filteredArticles.slice(0, pageSize)
            };
            
        } catch (error) {
            console.error('NewsAPI Error:', error.response?.data || error.message);
            throw new Error(`News API Error: ${error.response?.data?.message || error.message}`);
        }
    }

    async getTopHeadlines(category = 'science', country = 'us') {
        const apiKey = this.getApiKey();

        try {
            const response = await axios.get(`${this.baseUrl}/top-headlines`, {
                params: {
                    category,
                    country,
                    apiKey: apiKey
                }
            });
            return response.data;
        } catch (error) {
            console.error('News API Error:', error.response?.data);
            throw new Error(`News API Error: ${error.response?.data?.message || error.message}`);
        }
    }
}

export default new NewsService();