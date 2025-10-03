import React from 'react';
import { useState, useEffect } from 'react';
import Header from '../components/Header';

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
  searchMethod?: string; // Add this property
}

export default function Seismology() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [frequencyMin, setFrequencyMin] = useState('0.1');
  const [frequencyMax, setFrequencyMax] = useState('0.1');
  const [errorMin, setErrorMin] = useState(false);
  const [errorMax, setErrorMax] = useState(false);
  const [noise, setNoise] = useState(10);
  const [earthquakeData, setEarthquakeData] = useState<EarthquakeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  // Updated search function for country-only search
  const searchEarthquakes = async (country: string) => {
    if (!country.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔍 Searching for earthquakes in: "${country}"`);
      const response = await fetch(`http://localhost:3001/api/earthquakes/search-by-country?country=${encodeURIComponent(country)}&timeframe=month&limit=50`);
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

  // Load default earthquakes on component mount
  useEffect(() => {
    const loadDefaultEarthquakes = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3001/api/earthquakes?timeframe=day&limit=20');
        const result = await response.json();

        if (result.success) {
          setEarthquakeData(result.data);
        }
      } catch (err) {
        console.error('Error loading default earthquakes:', err);
        // Fallback to empty array if backend is not available
        setEarthquakeData([]);
      } finally {
        setLoading(false);
      }
    };

    loadDefaultEarthquakes();
  }, []);

  const handleFrequencyChange = (
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>>,
    setError: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setValue(value);
      setError(false);
    } else {
      setValue(value);
      setError(true);
    }
  };

  const handleLocationSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchEarthquakes(locationSearch);
  };

  // Filter earthquakes based on search query
  const filteredEarthquakes = earthquakeData.filter(earthquake =>
    earthquake.place.toLowerCase().includes(searchQuery.toLowerCase()) ||
    earthquake.magnitude.toString().includes(searchQuery) ||
    new Date(earthquake.time).toLocaleDateString().includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
        <div className="mb-6 flex items-center justify-between">
          <p className="font-instrument font-bold text-sm md:text-base text-quake-dark-blue">
            <span className="text-quake-dark-blue">Friday, </span>
            <span className="text-quake-medium-blue">September 29</span>
          </p>
          <div className="flex-1 flex justify-center">
            <h1 className="text-2xl font-bold text-center">
              Seismology <span className="text-indigo-700">Tool</span>
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-7 space-y-4">
            <div className="bg-white rounded-lg shadow border border-gray-100 p-4">
              <h2 className="font-roboto font-semibold text-xs uppercase tracking-wider text-black mb-2">
                Earthquake Data Selector
              </h2>
              
              {/* Updated Country Search */}
              <form onSubmit={handleLocationSearch} className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search by country: Japan, Chile, United States, Turkey, etc..."
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-inter font-medium text-xs text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={loading || !locationSearch.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
                
                {/* Updated Search Examples */}
                <div className="mt-2 text-xs text-gray-500">
                  <strong>Examples:</strong> "Japan", "Chile", "United States", "Turkey", "Indonesia", "Mexico"
                </div>
              </form>

              {/* Updated Search Results Info */}
              {searchResult && (
                <div className="mb-3 p-3 bg-blue-50 rounded-lg text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <strong>Search Results:</strong> Found {searchResult.totalFound} earthquakes in {searchResult.searchLocation.name}
                      {searchResult.showing < searchResult.totalFound && (
                        <div className="mt-1 text-orange-600">
                          <strong>Note:</strong> Showing top {searchResult.showing} results
                        </div>
                      )}
                    </div>
                    
                    {/* Country Search Indicator */}
                    <div className="text-xs text-gray-500 ml-2">
                      🌍
                    </div>
                  </div>
                </div>
              )}

              {/* Filter Search */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Filter results by magnitude, date, or location"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-inter font-medium text-xs text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-quake-purple focus:border-transparent"
                />
                <svg 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-xs">{error}</p>
                  <p className="text-red-500 text-xs mt-1">
                    Make sure the backend server is running on port 3001
                  </p>
                </div>
              )}

              {/* Earthquake Data Display */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="text-xs text-gray-500">Loading earthquakes...</div>
                  </div>
                ) : filteredEarthquakes.length > 0 ? (
                  filteredEarthquakes.map((item, index) => (
                    <div
                      key={item.id || index}
                      onClick={() => setSearchQuery(`${item.magnitude} ${new Date(item.time).toLocaleDateString()} ${item.depth}km`)}
                      className="flex items-center justify-between py-2 px-2 border-b border-gray-200 last:border-b-0 cursor-pointer hover:bg-gray-50 rounded"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="font-inter font-bold text-xs text-red-600">
                          M{item.magnitude?.toFixed(1) || 'N/A'}
                        </span>
                        <span className="font-inter font-medium text-xs text-black">
                          {new Date(item.time).toLocaleDateString()}
                        </span>
                        <span className="font-inter font-medium text-xs text-blue-600">
                          {item.depth?.toFixed(1) || 'N/A'}km deep
                        </span>
                        <span className="font-inter font-medium text-xs text-gray-600 truncate max-w-xs" title={item.place}>
                          {item.place}
                        </span>
                      </div>
                      <div className="w-6 h-px bg-black"></div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <div className="text-xs text-gray-500">
                      {searchResult ? 'No earthquakes found for this search' : 'Search for a location to see earthquake data'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-100 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h2 className="font-roboto font-medium text-sm uppercase tracking-wider text-black mb-2 sm:mb-0">
                  Time Series Filtering
                </h2>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <span className="font-roboto font-medium text-xs uppercase text-black">
                    Noise
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={noise}
                    onChange={(e) => setNoise(Number(e.target.value))}
                    className="flex-1 sm:w-32 accent-quake-purple"
                  />
                  <span className="font-roboto font-medium text-xs uppercase text-gray-400">
                    {noise}%
                  </span>
                </div>
              </div>
              <div className="relative h-40">
                <div className="absolute inset-0 flex">
                  <div className="flex flex-col justify-between items-end pr-2 py-2 text-right min-w-[40px]">
                    <span className="font-roboto font-medium text-[10px] text-gray-400">5000</span>
                    <span className="font-roboto font-medium text-[10px] text-gray-400">4000</span>
                    <span className="font-roboto font-medium text-[10px] text-gray-400">3000</span>
                    <span className="font-roboto font-medium text-[10px] text-gray-400">2000</span>
                    <span className="font-roboto font-medium text-[10px] text-gray-400">1000</span>
                  </div>
                  <div className="flex-1 relative border-l border-b border-quake-border">
                    <svg 
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 600 200" 
                      preserveAspectRatio="none"
                    >
                      <path 
                        d="M10 136L108.881 120.082L221.511 20L320.921 120.082L416.101 78.9224L496.475 38.1616L598 69.5214" 
                        stroke="#3B38A0" 
                        strokeWidth="1.5" 
                        fill="none"
                      />
                    </svg>
                    <div className="absolute -bottom-4 left-0 right-0 flex justify-between text-[8px]">
                      <span className="text-gray-400">Jan</span>
                      <span className="text-gray-400">Feb</span>
                      <span className="text-gray-400">Wed</span>
                      <span className="text-gray-400">Thu</span>
                      <span className="text-gray-400">Fri</span>
                      <span className="text-gray-400">Sat</span>
                      <span className="text-gray-400">Sun</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-5 space-y-4">
            <div className="bg-white rounded-lg shadow border border-gray-100 p-4">
              <h2 className="font-roboto font-medium text-xs uppercase tracking-wider text-black mb-3">
                Frequency Range
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={frequencyMin}
                    onChange={(e) => handleFrequencyChange(e.target.value, setFrequencyMin, setErrorMin)}
                    className={`w-full px-2 py-1 border font-roboto font-medium text-xs text-black text-center focus:outline-none ${
                      errorMin ? 'border-red-500' : 'border-black'
                    }`}
                  />
                  {errorMin && (
                    <span className="absolute -bottom-4 left-0 text-[10px] text-red-500">
                      Only numbers are accepted
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={frequencyMax}
                    onChange={(e) => handleFrequencyChange(e.target.value, setFrequencyMax, setErrorMax)}
                    className={`w-full px-2 py-1 border font-roboto font-medium text-xs text-black text-center focus:outline-none ${
                      errorMax ? 'border-red-500' : 'border-black'
                    }`}
                  />
                  {errorMax && (
                    <span className="absolute -bottom-4 left-0 text-[10px] text-red-500">
                      Only numbers are accepted
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-100 p-4 h-[338px]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h2 className="font-roboto font-medium text-xs uppercase tracking-wider text-black mb-2 sm:mb-0">
                  Spectral Analysis
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-0.5 bg-purple-500"></div>
                    <span className="font-roboto font-medium text-[10px] text-gray-400">FFT</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-0.5 bg-pink-500"></div>
                    <span className="font-roboto font-medium text-[10px] text-gray-400">Spectogram</span>
                  </div>
                </div>
              </div>
              <div className="relative h-[260px]">
                <div className="absolute inset-0 flex">
                  <div className="flex-1 relative border-l border-b border-quake-border">
                    <svg 
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 420 338" 
                      preserveAspectRatio="none"
                    >
                      <path 
                        d="M0.5 310L41.6663 301C48.6168 299.5 55.6697 303.5 60.2313 312L80.9736 330C91.3301 338 111.107 332 115.464 314L131.437 246L144.152 150C147.501 125 176.683 122 182.987 146L189.124 170C195.127 193 222.518 192 227.57 168L248.3 72C253.022 50 277.956 47 285.822 67L299.704 102C306.267 119 325.918 121 334.557 105L362.332 56C365.389 50 370.232 47 375.703 46L419.5 37" 
                        stroke="#6C60FF" 
                        strokeWidth="1.5" 
                        fill="none"
                      />
                      <path 
                        d="M0.5 286L48.471 281C51.372 280.5 54.2946 281 57.0346 282L88.9543 296C98.3078 300 108.718 295 113.39 284L129.021 246C130.606 242 132.919 238 135.744 236L140.081 232C149.636 224 162.463 228 168.25 240L188.738 284C197.27 302 218.804 299 224.705 279L254.91 178C258.956 164 271.275 158 281.805 164L295.333 172C305.858 178 318.172 172 322.223 158L362.707 22C365.408 14 371.994 7 379.65 6L419.5 1" 
                        stroke="#CE2A96" 
                        strokeWidth="1.5" 
                        fill="none"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
