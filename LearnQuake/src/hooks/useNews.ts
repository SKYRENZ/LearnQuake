import { useState, useEffect, useCallback } from 'react';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface NewsResponse {
  articles: NewsArticle[];
  totalResults: number;
  status: string;
}

export const useNews = (query: string = 'earthquake', pageSize: number = 6) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching news with query:', query);
      
      const response = await fetch(
        `http://localhost:5000/api/news/earthquake?query=${encodeURIComponent(query)}&pageSize=${pageSize}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch news`);
      }
      
      const data: NewsResponse = await response.json();
      console.log('News API response:', data);
      console.log('Total articles found:', data.totalResults);
      console.log('Articles received:', data.articles?.length);
      
      // Log first few article titles for debugging
      if (data.articles?.length > 0) {
        console.log('First 3 article titles:');
        data.articles.slice(0, 3).forEach((article, index) => {
          console.log(`${index + 1}. ${article.title}`);
        });
      }
      
      setNews(data.articles || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('News fetch error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [query, pageSize]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return { news, loading, error, refetch: fetchNews };
};