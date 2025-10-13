const NEWS_ENDPOINT = import.meta.env.VITE_NEWS_ENDPOINT || 'http://localhost:5000/api/news';

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
  content: string;
}

export interface NewsResponse {
  success: boolean;
  data: NewsArticle[];
  totalResults: number;
}

export async function fetchEarthquakeNews(
  pageSize: number = 10,
  country: string = 'ph'
): Promise<NewsArticle[]> {
  try {
    const response = await fetch(
      `${NEWS_ENDPOINT}?pageSize=${pageSize}&country=${country}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }
    
    const result: NewsResponse = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching earthquake news:', error);
    return [];
  }
}

export async function searchNewsByLocation(
  location: string,
  pageSize: number = 5
): Promise<NewsArticle[]> {
  try {
    const response = await fetch(
      `${NEWS_ENDPOINT}/search?location=${encodeURIComponent(location)}&pageSize=${pageSize}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search news');
    }
    
    const result: NewsResponse = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error searching earthquake news:', error);
    return [];
  }
}

export async function fetchNewsByDateRange(
  startDate: string,
  endDate: string,
  pageSize: number = 10
): Promise<NewsArticle[]> {
  try {
    const response = await fetch(
      `${NEWS_ENDPOINT}/date-range?startDate=${startDate}&endDate=${endDate}&pageSize=${pageSize}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch news by date range');
    }
    
    const result: NewsResponse = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching news by date range:', error);
    return [];
  }
}