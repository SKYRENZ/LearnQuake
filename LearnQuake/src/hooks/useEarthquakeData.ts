import { useState, useEffect } from 'react';
import { getEndpoint } from '../api/client';

interface EarthquakeData {
  id: string;
  magnitude: number;
  place: string;
  time: Date;
  depth: number;
  latitude: number;
  longitude: number;
}

interface SearchResult {
  searchLocation: {
    name: string;
    latitude?: number;
    longitude?: number;
    country?: string;
    fullAddress?: string;
  };
  earthquakes: EarthquakeData[];
  totalFound: number;
  showing: number;
  searchMethod?: string;
}

interface UseEarthquakeDataReturn {
  earthquakeData: EarthquakeData[];
  loading: boolean;
  error: string | null;
  searchResult: SearchResult | null;
  searchEarthquakes: (country: string) => Promise<void>;
  loadDefaultEarthquakes: () => Promise<void>;
}

export const useEarthquakeData = (): UseEarthquakeDataReturn => {
  const [earthquakeData, setEarthquakeData] = useState<EarthquakeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  // Search earthquakes by country
  const searchEarthquakes = async (country: string) => {
    if (!country.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔍 Searching for earthquakes in: "${country}"`);
      const response = await fetch(
        getEndpoint('searchByCountry', {
          country,
          timeframe: 'month',
          limit: '50'
        })
      );
      const result = await response.json();

      if (result.success) {
        setEarthquakeData(result.data.earthquakes);
        setSearchResult(result.data);
        
        console.log(`✅ Search completed for country: ${country}`);
        console.log(`📊 Found ${result.data.totalFound} earthquakes`);
      } else {
        setError(result.error);
        setEarthquakeData([]);
        setSearchResult(null);
      }
    } catch (err) {
      setError('Failed to search earthquakes. Make sure the backend server is running.');
      console.error('Error:', err);
      setEarthquakeData([]);
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Load default earthquakes
  const loadDefaultEarthquakes = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        getEndpoint('earthquakes', {
          timeframe: 'day',
          limit: '20'
        })
      );
      const result = await response.json();

      if (result.success) {
        setEarthquakeData(result.data);
      }
    } catch (err) {
      console.error('Error loading default earthquakes:', err);
      setEarthquakeData([]);
    } finally {
      setLoading(false);
    }
  };

  // Load default earthquakes on component mount
  useEffect(() => {
    loadDefaultEarthquakes();
  }, []);

  return {
    earthquakeData,
    loading,
    error,
    searchResult,
    searchEarthquakes,
    loadDefaultEarthquakes,
  };
};