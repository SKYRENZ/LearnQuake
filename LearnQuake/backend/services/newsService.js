import axios from 'axios';

class NewsService {
    constructor() {
        this.baseUrl = 'https://newsapi.org/v2';
        
        // List of reputable news sources
        this.reputableSources = [
            // Major International News
            'bbc-news', 'cnn', 'reuters', 'associated-press', 'abc-news', 'cbs-news', 'nbc-news',
            
            // Major Newspapers
            'the-washington-post', 'the-new-york-times', 'usa-today', 'the-guardian-uk', 'the-times-of-india',
            
            // Scientific/Geological Sources
            'national-geographic', 'scientific-american',
            
            // News Agencies
            'al-jazeera-english', 'fox-news', 'bloomberg', 'newsweek', 'time',
            
            // Additional reputable sources (by domain/name)
            'BBC News', 'CNN', 'Reuters', 'Associated Press', 'AP News', 'ABC News', 'CBS News', 'NBC News',
            'The Washington Post', 'The New York Times', 'USA Today', 'The Guardian', 'The Times of India',
            'National Geographic', 'Scientific American', 'Al Jazeera English', 'Fox News', 'Bloomberg',
            'Newsweek', 'Time', 'NPR', 'PBS NewsHour', 'The Wall Street Journal', 'Los Angeles Times',
            'Chicago Tribune', 'Boston Globe', 'USGS', 'Earthquake Track', 'Seismological Society',
            'Nature', 'Science Magazine', 'LiveScience', 'Phys.org', 'Space.com', 'Weather.com',
            'AccuWeather', 'Weather Channel', 'Sky News', 'BBC', 'ITV News', 'Channel 4 News',
            'Daily Mail', 'The Independent', 'Telegraph', 'Mirror', 'Express', 'Metro',
            'Hindustan Times', 'Indian Express', 'Times Now', 'NDTV', 'Zee News',
            'Japan Times', 'Asahi Shimbun', 'Mainichi', 'Yomiuri', 'Kyodo News',
            'Deutsche Welle', 'France 24', 'Euronews', 'ANSA', 'EFE', 'Xinhua'
        ];
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

    isReputableSource(sourceName) {
        if (!sourceName) return false;
        
        const lowerSourceName = sourceName.toLowerCase();
        
        // Check against our list of reputable sources
        return this.reputableSources.some(reputableSource => {
            const lowerReputable = reputableSource.toLowerCase();
            return lowerSourceName.includes(lowerReputable) || lowerReputable.includes(lowerSourceName);
        });
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
            
            // Very specific earthquake query - focus on actual seismic events
            const earthquakeQuery = 'earthquake OR "magnitude earthquake" OR "earthquake hits" OR "earthquake strikes" OR "earthquake damages" OR tsunami OR aftershock OR "fault rupture" OR epicenter';
            
            let response = await axios.get(`${this.baseUrl}/everything`, {
                params: {
                    q: earthquakeQuery,
                    apiKey: apiKey,
                    pageSize: pageSize * 8, // Get even more results to filter by source quality
                    page,
                    sortBy: 'publishedAt',
                    language: 'en',
                    from: fromDate,
                    searchIn: 'title,description'
                }
            });
            
            console.log('NewsAPI response status:', response.status);
            console.log('Total articles found:', response.data.totalResults);
            
            let articles = response.data.articles || [];
            
            // Very strict filtering for actual earthquakes AND reputable sources
            const strictEarthquakeFilter = (article) => {
                const titleAndDesc = (article.title + ' ' + (article.description || '')).toLowerCase();
                
                // First check if source is reputable
                if (!this.isReputableSource(article.source?.name)) {
                    console.log(`Filtering out non-reputable source: ${article.source?.name}`);
                    return false;
                }
                
                // Required earthquake indicators
                const earthquakeIndicators = [
                    'earthquake', 'quake', 'seismic activity', 'tremor', 'aftershock', 'tsunami'
                ];
                
                // Must have at least one earthquake indicator
                const hasEarthquakeIndicator = earthquakeIndicators.some(indicator => 
                    titleAndDesc.includes(indicator)
                );
                
                if (!hasEarthquakeIndicator) return false;
                
                // Exclude non-earthquake content
                const excludeTerms = [
                    'football', 'nfl', 'sports', 'game', 'team', 'player', 'coach',
                    'music', 'concert', 'album', 'song', 'artist',
                    'movie', 'film', 'actor', 'actress',
                    'politics', 'election', 'campaign',
                    'seismic week', 'seismic shift in', 'seismic change',
                    'crypto', 'bitcoin', 'stock', 'market'
                ];
                
                const hasExcludedTerm = excludeTerms.some(term => 
                    titleAndDesc.includes(term)
                );
                
                if (hasExcludedTerm) return false;
                
                // Positive indicators for real earthquakes
                const positiveIndicators = [
                    'magnitude', 'richter', 'epicenter', 'depth',
                    'damage', 'building', 'collapsed', 'destroyed',
                    'injury', 'casualties', 'victim', 'rescue',
                    'usgs', 'geological survey', 'seismologist',
                    'fault', 'tectonic', 'plate',
                    'tsunami warning', 'evacuation',
                    'shake', 'shaking', 'felt',
                    'km deep', 'miles deep',
                    'struck', 'hits', 'jolted', 'rocked'
                ];
                
                const positiveScore = positiveIndicators.reduce((score, indicator) => {
                    return score + (titleAndDesc.includes(indicator) ? 1 : 0);
                }, 0);
                
                // Need at least 1 positive indicator for real earthquakes
                return positiveScore >= 1;
            };
            
            const filteredArticles = articles.filter(strictEarthquakeFilter).sort((a, b) => {
                return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
            });

            console.log(`Strictly filtered ${articles.length} articles down to ${filteredArticles.length} earthquake-related articles from reputable sources`);
            
            // Log filtered articles with their sources for debugging
            if (filteredArticles.length > 0) {
                console.log('Filtered earthquake articles from reputable sources:');
                filteredArticles.slice(0, 5).forEach((article, index) => {
                    console.log(`${index + 1}. [${article.source.name}] ${article.title}`);
                });
            }
            
            // If still not enough, try reputable sources specifically
            if (filteredArticles.length < pageSize) {
                console.log('Trying reputable sources specifically...');
                
                const reputableSources = 'bbc-news,cnn,reuters,associated-press,abc-news,cbs-news,nbc-news';
                
                const sourceResponse = await axios.get(`${this.baseUrl}/everything`, {
                    params: {
                        q: 'earthquake',
                        sources: reputableSources,
                        apiKey: apiKey,
                        pageSize: pageSize,
                        sortBy: 'publishedAt',
                        language: 'en',
                        from: fromDate
                    }
                });
                
                const sourceArticles = (sourceResponse.data.articles || []).filter(article => {
                    const titleAndDesc = (article.title + ' ' + (article.description || '')).toLowerCase();
                    return titleAndDesc.includes('earthquake') || titleAndDesc.includes('seismic') || titleAndDesc.includes('tsunami');
                });
                
                console.log(`Found ${sourceArticles.length} additional articles from specific reputable sources`);
                
                // Combine and deduplicate
                const combined = [...filteredArticles, ...sourceArticles];
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
            
            // Filter top headlines by reputable sources too
            const filteredArticles = (response.data.articles || []).filter(article => 
                this.isReputableSource(article.source?.name)
            );
            
            return {
                ...response.data,
                articles: filteredArticles
            };
        } catch (error) {
            console.error('News API Error:', error.response?.data);
            throw new Error(`News API Error: ${error.response?.data?.message || error.message}`);
        }
    }
}

export default new NewsService();