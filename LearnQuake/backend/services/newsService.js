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
            
            // Get date from 1 month ago
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            const fromDate = oneMonthAgo.toISOString().split('T')[0];
            
            console.log('Searching from date:', fromDate);
            
            // Enhanced earthquake-specific query
            const earthquakeQuery = 'earthquake OR seismic OR tremor OR "magnitude" OR "richter scale" OR aftershock OR "geological survey" OR "tectonic plates" OR "fault line"';
            
            let response = await axios.get(`${this.baseUrl}/everything`, {
                params: {
                    q: earthquakeQuery,
                    apiKey: apiKey,
                    pageSize: pageSize * 3, // Get more results to filter better
                    page,
                    sortBy: 'publishedAt', // Most recent first
                    language: 'en',
                    from: fromDate, // Only articles from the last month
                    searchIn: 'title,description' // Search in title and description for better relevance
                }
            });
            
            console.log('NewsAPI response status:', response.status);
            console.log('Total articles found:', response.data.totalResults);
            
            let articles = response.data.articles || [];
            
            // Enhanced filtering for earthquake relevance
            const earthquakeKeywords = [
                'earthquake', 'seismic', 'tremor', 'magnitude', 'richter', 
                'aftershock', 'geological', 'usgs', 'fault', 'tectonic',
                'epicenter', 'tsunami', 'shake', 'quake'
            ];
            
            const filteredArticles = articles.filter(article => {
                const titleAndDesc = (article.title + ' ' + (article.description || '')).toLowerCase();
                const earthquakeScore = earthquakeKeywords.reduce((score, keyword) => {
                    return score + (titleAndDesc.includes(keyword) ? 1 : 0);
                }, 0);
                
                // Require at least 1 earthquake-related keyword
                return earthquakeScore >= 1;
            }).sort((a, b) => {
                // Sort by recency within filtered results
                return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
            });

            console.log(`Filtered ${articles.length} articles down to ${filteredArticles.length} earthquake-related articles`);
            
            // If we still don't have enough, try a more specific recent earthquake search
            if (filteredArticles.length < pageSize) {
                console.log('Trying more specific recent earthquake search...');
                
                const recentEarthquakeQuery = '"recent earthquake" OR "earthquake today" OR "earthquake yesterday" OR "latest earthquake" OR "breaking earthquake"';
                
                const recentResponse = await axios.get(`${this.baseUrl}/everything`, {
                    params: {
                        q: recentEarthquakeQuery,
                        apiKey: apiKey,
                        pageSize: pageSize,
                        sortBy: 'publishedAt',
                        language: 'en',
                        from: fromDate
                    }
                });
                
                const recentArticles = recentResponse.data.articles || [];
                console.log(`Found ${recentArticles.length} additional recent earthquake articles`);
                
                // Combine and deduplicate
                const combined = [...filteredArticles, ...recentArticles];
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