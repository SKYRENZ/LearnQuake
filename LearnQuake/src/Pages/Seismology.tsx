import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
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

interface TimeSeriesData {
  time: number;
  amplitude: number;
  frequency: number;
}

export default function Seismology() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [frequencyMin, setFrequencyMin] = useState('0.1');
  const [frequencyMax, setFrequencyMax] = useState('10.0');
  const [errorMin, setErrorMin] = useState(false);
  const [errorMax, setErrorMax] = useState(false);
  const [noise, setNoise] = useState(10);
  const [earthquakeData, setEarthquakeData] = useState<EarthquakeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  
  // Filtering states
  const [magnitudeFilter, setMagnitudeFilter] = useState('');
  const [magnitudeError, setMagnitudeError] = useState(false);
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest' | 'magnitude'>('recent');

  // Selected earthquake
  const [selectedEarthquakeId, setSelectedEarthquakeId] = useState<string | null>(null);

  // Real-time updates
  const [currentTime, setCurrentTime] = useState(new Date());

  // Generate time series data based on selected earthquake
  const generateTimeSeriesData = (earthquake: EarthquakeData | null): TimeSeriesData[] => {
    if (!earthquake) {
      return Array.from({ length: 100 }, (_, i) => ({
        time: i,
        amplitude: Math.sin(i * 0.1) * 50 + Math.random() * (noise / 2) - (noise / 4),
        frequency: 1.0
      }));
    }

    const dataPoints = 200;
    const baseFreq = Math.max(0.1, parseFloat(frequencyMin) || 0.1);
    const maxFreq = Math.min(20.0, parseFloat(frequencyMax) || 10.0);
    
    return Array.from({ length: dataPoints }, (_, i) => {
      const t = i / 10;
      const primaryWave = Math.sin(t * baseFreq * 2 * Math.PI) * earthquake.magnitude * 10;
      const secondaryWave = Math.sin(t * (baseFreq * 1.7) * 2 * Math.PI) * earthquake.magnitude * 7;
      const surfaceWave = Math.sin(t * (baseFreq * 0.8) * 2 * Math.PI) * earthquake.magnitude * 15;
      const depthFactor = Math.exp(-earthquake.depth / 100);
      const distanceDecay = Math.exp(-t * 0.1);
      const amplitude = (primaryWave + secondaryWave + surfaceWave) * depthFactor * distanceDecay;
      const noiseComponent = (Math.random() - 0.5) * (noise / 5);
      
      return {
        time: t,
        amplitude: amplitude + noiseComponent,
        frequency: baseFreq + (Math.random() * (maxFreq - baseFreq))
      };
    });
  };

  // Get selected earthquake object
  const selectedEarthquake = useMemo(() => {
    return earthquakeData.find(eq => eq.id === selectedEarthquakeId) || null;
  }, [earthquakeData, selectedEarthquakeId]);

  // Generate time series data
  const timeSeriesData = useMemo(() => {
    return generateTimeSeriesData(selectedEarthquake);
  }, [selectedEarthquake, noise, frequencyMin, frequencyMax]);

  // Create SVG path for time series
  const createTimeSeriesPath = (data: TimeSeriesData[], width: number, height: number) => {
    if (data.length === 0) return '';

    const maxAmplitude = Math.max(...data.map(d => Math.abs(d.amplitude)));
    const minAmplitude = -maxAmplitude;
    
    const xScale = (index: number) => (index / (data.length - 1)) * width;
    const yScale = (amplitude: number) => {
      const normalized = (amplitude - minAmplitude) / (maxAmplitude - minAmplitude);
      return height - (normalized * height);
    };

    let path = `M ${xScale(0)} ${yScale(data[0].amplitude)}`;
    for (let i = 1; i < data.length; i++) {
      path += ` L ${xScale(i)} ${yScale(data[i].amplitude)}`;
    }
    return path;
  };

  // Generate spectral analysis data
  const generateSpectralData = (earthquake: EarthquakeData | null) => {
    if (!earthquake) {
      return {
        fft: Array.from({ length: 50 }, (_, i) => ({
          frequency: i * 0.4,
          amplitude: Math.random() * 50 + 10
        })),
        spectrogram: Array.from({ length: 50 }, (_, i) => ({
          frequency: i * 0.4,
          amplitude: Math.random() * 80 + 20
        }))
      };
    }

    const baseFreq = Math.max(0.1, parseFloat(frequencyMin) || 0.1);
    const maxFreq = Math.min(20.0, parseFloat(frequencyMax) || 10.0);
    const freqRange = maxFreq - baseFreq;
    
    const fftData = Array.from({ length: 50 }, (_, i) => {
      const freq = baseFreq + (i / 49) * freqRange;
      let amplitude = 0;
      
      const pWaveFreq = baseFreq * 2;
      if (Math.abs(freq - pWaveFreq) < 1) {
        amplitude += earthquake.magnitude * 15;
      }
      
      const sWaveFreq = baseFreq * 1.2;
      if (Math.abs(freq - sWaveFreq) < 0.8) {
        amplitude += earthquake.magnitude * 12;
      }
      
      const surfaceWaveFreq = baseFreq * 0.7;
      if (Math.abs(freq - surfaceWaveFreq) < 0.5) {
        amplitude += earthquake.magnitude * 20;
      }
      
      const depthFactor = Math.exp(-earthquake.depth / 200);
      amplitude *= depthFactor;
      amplitude += Math.random() * (earthquake.magnitude * 2);
      
      return {
        frequency: freq,
        amplitude: Math.max(0, amplitude)
      };
    });

    const spectrogramData = Array.from({ length: 50 }, (_, i) => {
      const freq = baseFreq + (i / 49) * freqRange;
      let amplitude = 0;
      const timePhase = (i / 50) * Math.PI * 2;
      
      if (freq < baseFreq * 2) {
        amplitude += earthquake.magnitude * 18 * Math.sin(timePhase + Math.PI);
      }
      if (freq > baseFreq * 1.5) {
        amplitude += earthquake.magnitude * 10 * Math.cos(timePhase);
      }
      
      amplitude *= (earthquake.magnitude / 7);
      const depthFactor = Math.exp(-earthquake.depth / 150);
      amplitude *= depthFactor;
      amplitude += Math.random() * (earthquake.magnitude * 3);
      
      return {
        frequency: freq,
        amplitude: Math.max(0, amplitude)
      };
    });

    return {
      fft: fftData,
      spectrogram: spectrogramData
    };
  };

  const spectralData = useMemo(() => {
    return generateSpectralData(selectedEarthquake);
  }, [selectedEarthquake, frequencyMin, frequencyMax]);

  // Create SVG path for spectral analysis
  const createSpectralPath = (data: { frequency: number; amplitude: number }[], width: number, height: number) => {
    if (data.length === 0) return '';

    const maxAmplitude = Math.max(...data.map(d => d.amplitude));
    const minAmplitude = 0;
    
    const xScale = (index: number) => (index / (data.length - 1)) * width;
    const yScale = (amplitude: number) => {
      const normalized = (amplitude - minAmplitude) / (maxAmplitude - minAmplitude);
      return height - (normalized * height);
    };

    let path = `M ${xScale(0)} ${yScale(data[0].amplitude)}`;
    for (let i = 1; i < data.length; i++) {
      path += ` L ${xScale(i)} ${yScale(data[i].amplitude)}`;
    }
    return path;
  };

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

  // Load default earthquakes on mount
  useEffect(() => {
    async function loadDefaultEarthquakes() {
      const endpoint =
        (import.meta.env.VITE_EARTHQUAKES_ENDPOINT as string) ||
        '/.netlify/functions/earthquakes';

      try {
        const res = await fetch(endpoint);
        const text = await res.text();
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${text}`);
        }
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error('Expected JSON from earthquakes endpoint');
        }
        if (data.success) {
          setEarthquakeData(data.data);
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (err) {
        console.error('Error loading default earthquakes:', err);
        setError('Failed to load default earthquakes. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadDefaultEarthquakes();
  }, []);

  // Real-time clock updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
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

  const handleMagnitudeChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setMagnitudeFilter(value);
      setMagnitudeError(false);
    } else {
      setMagnitudeFilter(value);
      setMagnitudeError(true);
    }
  };

  // Filter earthquakes
  const filteredEarthquakes = earthquakeData
    .filter(earthquake => {
      const textMatch = earthquake.place.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       earthquake.magnitude.toString().includes(searchQuery) ||
                       new Date(earthquake.time).toLocaleDateString().includes(searchQuery);

      const magnitudeMatch = magnitudeFilter === '' || 
                            earthquake.magnitude >= parseFloat(magnitudeFilter);

      return textMatch && magnitudeMatch;
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case 'recent':
          return new Date(b.time).getTime() - new Date(a.time).getTime();
        case 'oldest':
          return new Date(a.time).getTime() - new Date(b.time).getTime();
        case 'magnitude':
          return b.magnitude - a.magnitude;
        default:
          return 0;
      }
    });

  // Get formatted current date
  const currentDate = useMemo(() => {
    const dayName = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
    const monthDay = currentTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    
    return { dayName, monthDay };
  }, [currentTime]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
        {/* Header Section */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <p className="font-instrument font-bold text-sm sm:text-base text-quake-dark-blue">
            <span className="text-quake-dark-blue">{currentDate.dayName}, </span>
            <span className="text-quake-medium-blue">{currentDate.monthDay}</span>
          </p>
          <div className="flex justify-center sm:flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-center">
              Seismology <span className="text-indigo-700">Tool</span>
            </h1>
          </div>
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Left Side - Search + Earthquake Data */}
          <div className="order-1">
            <div className="space-y-4">
              
              {/* Search Bar */}
              <div className="bg-white rounded-lg shadow border border-gray-100 p-3 sm:p-4">
                <h2 className="font-roboto font-semibold text-xs uppercase tracking-wider text-black mb-3">
                  Earthquake Search
                </h2>
                
                <form onSubmit={handleLocationSearch} className="mb-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Search by country: Japan, Chile, United States..."
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-inter font-medium text-xs sm:text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={loading || !locationSearch.trim()}
                      className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                  
                  <div className="mt-2 text-[10px] sm:text-xs text-gray-500">
                    <strong>Examples:</strong> "Japan", "Chile", "United States", "Turkey", "Indonesia", "Mexico"
                  </div>
                </form>

                {/* Search Results Info */}
                {searchResult && (
                  <div className="p-2 sm:p-3 bg-blue-50 rounded-lg text-[10px] sm:text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <strong>Search Results:</strong> Found {searchResult.totalFound} earthquakes in {searchResult.searchLocation.name}
                        {searchResult.showing < searchResult.totalFound && (
                          <div className="mt-1 text-orange-600">
                            <strong>Note:</strong> Showing top {searchResult.showing} results
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="mt-3 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-[10px] sm:text-xs">{error}</p>
                    <p className="text-red-500 text-[10px] sm:text-xs mt-1">
                      Make sure the backend server is running on port 3001
                    </p>
                  </div>
                )}
              </div>

              {/* Earthquake Data Selector */}
              <div className="bg-white rounded-lg shadow border border-gray-100 p-3 sm:p-4 flex flex-col h-[50vh] xl:h-[75vh]">
                <h2 className="font-roboto font-semibold text-xs uppercase tracking-wider text-black mb-3">
                  Earthquake Data Selector
                </h2>
                
                {/* Filtering Section */}
                <div className="mb-3 sm:mb-4 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Min magnitude (e.g., 5.0)"
                        value={magnitudeFilter}
                        onChange={(e) => handleMagnitudeChange(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg font-inter font-medium text-xs sm:text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:border-transparent ${
                          magnitudeError 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      />
                      {magnitudeError && (
                        <span className="absolute -bottom-5 left-0 text-[9px] sm:text-[10px] text-red-500">
                          Only numbers allowed
                        </span>
                      )}
                    </div>

                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'recent' | 'oldest' | 'magnitude')}
                      className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg font-inter font-medium text-xs sm:text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="recent">Recent First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="magnitude">By Magnitude</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[10px] sm:text-xs text-gray-500">
                    <span>
                      Showing {filteredEarthquakes.length} earthquake{filteredEarthquakes.length !== 1 ? 's' : ''}
                      {magnitudeFilter && ` with magnitude ≥ ${magnitudeFilter}`}
                    </span>
                    {selectedEarthquake && (
                      <span className="text-blue-600 font-medium truncate">
                        Displaying: {selectedEarthquake.place}
                      </span>
                    )}
                  </div>
                </div>

                {/* Earthquake Data Display */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="space-y-1 sm:space-y-2 flex-1 overflow-y-auto">
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="text-xs text-gray-500">Loading earthquakes...</div>
                      </div>
                    ) : filteredEarthquakes.length > 0 ? (
                      filteredEarthquakes.map((item, index) => (
                        <div
                          key={item.id || index}
                          onClick={() => setSelectedEarthquakeId(item.id === selectedEarthquakeId ? null : item.id)}
                          className={`flex items-center justify-between py-2 sm:py-3 px-2 sm:px-3 border-b border-gray-200 last:border-b-0 cursor-pointer rounded transition-colors duration-200 ${
                            selectedEarthquakeId === item.id 
                              ? 'bg-blue-50 border-blue-200' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                            <div className="flex flex-col flex-shrink-0">
                              <span className="font-roboto font-bold text-[10px] sm:text-xs text-red-600">
                                M {item.magnitude.toFixed(1)}
                              </span>
                              <span className="font-roboto font-medium text-[9px] sm:text-[10px] text-blue-600">
                                {item.depth.toFixed(0)}km deep
                              </span>
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="font-roboto font-medium text-[10px] sm:text-xs text-black truncate">
                                {item.place}
                              </span>
                              <span className="font-roboto font-medium text-[9px] sm:text-[10px] text-gray-400">
                                {new Date(item.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                          <div className={`w-4 sm:w-6 h-px transition-colors duration-200 flex-shrink-0 ${
                            selectedEarthquakeId === item.id ? 'bg-blue-500' : 'bg-black'
                          }`}></div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <div className="text-xs text-gray-500">
                          {earthquakeData.length === 0 
                            ? "No earthquake data available. Try searching for a country."
                            : "No earthquakes match your current filters."
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Analysis Tools */}
          <div className="order-2 space-y-3 sm:space-y-4">
            
            {/* Selected Earthquake Info */}
            <div className={`rounded-lg p-3 sm:p-4 ${
              selectedEarthquake 
                ? 'bg-blue-50 border border-blue-200' 
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <h2 className={`font-roboto font-medium text-xs uppercase tracking-wider mb-2 ${
                selectedEarthquake ? 'text-blue-800' : 'text-gray-600'
              }`}>
                {selectedEarthquake ? 'Selected Earthquake' : 'Earthquake Preview'}
              </h2>
              {selectedEarthquake ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-roboto font-bold text-sm text-red-600">
                      M {selectedEarthquake.magnitude.toFixed(1)}
                    </span>
                    <span className="font-roboto font-medium text-xs text-blue-600">
                      {selectedEarthquake.depth.toFixed(0)}km deep
                    </span>
                  </div>
                  <div className="font-roboto font-medium text-xs text-gray-700">
                    {selectedEarthquake.place}
                  </div>
                  <div className="font-roboto font-medium text-xs text-gray-500">
                    {new Date(selectedEarthquake.time).toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })} at {new Date(selectedEarthquake.time).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <div className="text-xs text-gray-500">
                    Select an earthquake in earthquake data selector to view its seismic wave pattern and frequency spectrum
                  </div>
                </div>
              )}
            </div>
            
            {/* Frequency Range */}
            <div className="bg-white rounded-lg shadow border border-gray-100 p-3 sm:p-4">
              <h2 className="font-roboto font-medium text-xs uppercase tracking-wider text-black mb-3">
                Frequency Range
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="relative">
                  <input
                    type="text"
                    value={frequencyMin}
                    onChange={(e) => handleFrequencyChange(e.target.value, setFrequencyMin, setErrorMin)}
                    className={`w-full px-2 py-1 sm:py-2 border font-roboto font-medium text-xs sm:text-sm text-black text-center focus:outline-none ${
                      errorMin ? 'border-red-500' : 'border-black'
                    }`}
                  />
                  <label className="absolute -top-3 sm:-top-4 left-0 text-[9px] sm:text-[10px] text-gray-500">Min (Hz)</label>
                  {errorMin && (
                    <span className="absolute -bottom-3 sm:-bottom-4 left-0 text-[8px] sm:text-[10px] text-red-500">
                      Only numbers accepted
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={frequencyMax}
                    onChange={(e) => handleFrequencyChange(e.target.value, setFrequencyMax, setErrorMax)}
                    className={`w-full px-2 py-1 sm:py-2 border font-roboto font-medium text-xs sm:text-sm text-black text-center focus:outline-none ${
                      errorMax ? 'border-red-500' : 'border-black'
                    }`}
                  />
                  <label className="absolute -top-3 sm:-top-4 left-0 text-[9px] sm:text-[10px] text-gray-500">Max (Hz)</label>
                  {errorMax && (
                    <span className="absolute -bottom-3 sm:-bottom-4 left-0 text-[8px] sm:text-[10px] text-red-500">
                      Only numbers accepted
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Time Series Filtering */}
            <div className="bg-white rounded-lg shadow border border-gray-100 p-3 sm:p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-3 sm:mb-4 gap-2 lg:gap-0">
                <h2 className="font-roboto font-medium text-xs sm:text-sm uppercase tracking-wider text-black">
                  Time Series Filtering
                  {selectedEarthquake && (
                    <span className="text-[10px] sm:text-xs text-blue-600 ml-1 sm:ml-2 normal-case">
                      - M{selectedEarthquake.magnitude.toFixed(1)}
                    </span>
                  )}
                </h2>
                <div className="flex items-center space-x-2 w-full lg:w-auto">
                  <span className="font-roboto font-medium text-[10px] sm:text-xs uppercase text-black whitespace-nowrap">
                    Noise
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={noise}
                    onChange={(e) => setNoise(Number(e.target.value))}
                    className="flex-1 lg:w-24 xl:w-32 accent-quake-purple"
                  />
                  <span className="font-roboto font-medium text-[10px] sm:text-xs uppercase text-gray-400 whitespace-nowrap">
                    {noise}%
                  </span>
                </div>
              </div>
              
              <div className="relative h-32 sm:h-40">
                <div className="absolute inset-0 flex">
                  {/* Y-axis labels */}
                  <div className="flex flex-col justify-between items-end pr-1 sm:pr-2 py-1 sm:py-2 text-right min-w-[30px] sm:min-w-[40px]">
                    {selectedEarthquake ? (
                      <>
                        <span className="font-roboto font-medium text-[8px] sm:text-[10px] text-gray-400">
                          {(selectedEarthquake.magnitude * 50).toFixed(0)}
                        </span>
                        <span className="font-roboto font-medium text-[8px] sm:text-[10px] text-gray-400">
                          {(selectedEarthquake.magnitude * 25).toFixed(0)}
                        </span>
                        <span className="font-roboto font-medium text-[8px] sm:text-[10px] text-gray-400">0</span>
                        <span className="font-roboto font-medium text-[8px] sm:text-[10px] text-gray-400">
                          -{(selectedEarthquake.magnitude * 25).toFixed(0)}
                        </span>
                        <span className="font-roboto font-medium text-[8px] sm:text-[10px] text-gray-400">
                          -{(selectedEarthquake.magnitude * 50).toFixed(0)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-roboto font-medium text-[8px] sm:text-[10px] text-gray-300">50</span>
                        <span className="font-roboto font-medium text-[8px] sm:text-[10px] text-gray-300">25</span>
                        <span className="font-roboto font-medium text-[8px] sm:text-[10px] text-gray-300">0</span>
                        <span className="font-roboto font-medium text-[8px] sm:text-[10px] text-gray-300">-25</span>
                        <span className="font-roboto font-medium text-[8px] sm:text-[10px] text-gray-300">-50</span>
                      </>
                    )}
                  </div>
                  
                  {/* Graph area */}
                  <div className="flex-1 relative border-l border-b border-quake-border">
                    <svg 
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 600 160" 
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <pattern id="grid" width="30" height="32" patternUnits="userSpaceOnUse">
                          <path d="M 30 0 L 0 0 0 32" fill="none" stroke="#f0f0f0" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      <line x1="0" y1="80" x2="600" y2="80" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="2,2"/>
                      <path 
                        d={createTimeSeriesPath(timeSeriesData, 600, 160)}
                        stroke={selectedEarthquake ? "#3B38A0" : "#D1D5DB"} 
                        strokeWidth="1.5" 
                        fill="none"
                      />
                    </svg>
                    
                    <div className="absolute -bottom-3 sm:-bottom-4 left-0 right-0 flex justify-between text-[7px] sm:text-[8px]">
                      <span className={selectedEarthquake ? "text-gray-400" : "text-gray-300"}>0s</span>
                      <span className={selectedEarthquake ? "text-gray-400" : "text-gray-300"}>5s</span>
                      <span className={selectedEarthquake ? "text-gray-400" : "text-gray-300"}>10s</span>
                      <span className={selectedEarthquake ? "text-gray-400" : "text-gray-300"}>15s</span>
                      <span className={selectedEarthquake ? "text-gray-400" : "text-gray-300"}>20s</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-[10px] sm:text-xs text-gray-500">
                {selectedEarthquake ? (
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
                    <span>Amplitude: ±{(selectedEarthquake.magnitude * 50).toFixed(1)} units</span>
                    <span>Frequency: {frequencyMin}-{frequencyMax} Hz</span>
                    <span>Depth: {selectedEarthquake.depth.toFixed(0)}km</span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
                    <span className="text-gray-400">Amplitude: -- units</span>
                    <span className="text-gray-400">Frequency: {frequencyMin}-{frequencyMax} Hz</span>
                    <span className="text-gray-400">Depth: -- km</span>
                  </div>
                )}
              </div>
            </div>

            {/* Spectral Analysis */}
            <div className="bg-white rounded-lg shadow border border-gray-100 p-3 sm:p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-3 sm:mb-4 gap-2 lg:gap-0">
                <h2 className="font-roboto font-medium text-xs uppercase tracking-wider text-black">
                  Spectral Analysis
                  {selectedEarthquake && (
                    <span className="text-[10px] sm:text-xs text-blue-600 ml-1 sm:ml-2 normal-case">
                      - M{selectedEarthquake.magnitude.toFixed(1)}
                    </span>
                  )}
                </h2>
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-0.5 bg-purple-500"></div>
                    <span className="font-roboto font-medium text-[9px] sm:text-[10px] text-gray-400">FFT</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-0.5 bg-pink-500"></div>
                    <span className="font-roboto font-medium text-[9px] sm:text-[10px] text-gray-400">Spectrogram</span>
                  </div>
                </div>
              </div>
              
              <div className="relative h-[200px] sm:h-[240px]">
                <div className="absolute inset-0 flex">
                  {/* Y-axis labels */}
                  <div className="flex flex-col justify-between items-end pr-1 sm:pr-2 py-1 sm:py-2 text-right min-w-[25px] sm:min-w-[30px]">
                    {selectedEarthquake ? (
                      <>
                        <span className="font-roboto font-medium text-[7px] sm:text-[8px] text-gray-400">
                          {(selectedEarthquake.magnitude * 20).toFixed(0)}
                        </span>
                        <span className="font-roboto font-medium text-[7px] sm:text-[8px] text-gray-400">
                          {(selectedEarthquake.magnitude * 15).toFixed(0)}
                        </span>
                        <span className="font-roboto font-medium text-[7px] sm:text-[8px] text-gray-400">
                          {(selectedEarthquake.magnitude * 10).toFixed(0)}
                        </span>
                        <span className="font-roboto font-medium text-[7px] sm:text-[8px] text-gray-400">
                          {(selectedEarthquake.magnitude * 5).toFixed(0)}
                        </span>
                        <span className="font-roboto font-medium text-[7px] sm:text-[8px] text-gray-400">0</span>
                      </>
                    ) : (
                      <>
                        <span className="font-roboto font-medium text-[7px] sm:text-[8px] text-gray-300">100</span>
                        <span className="font-roboto font-medium text-[7px] sm:text-[8px] text-gray-300">75</span>
                        <span className="font-roboto font-medium text-[7px] sm:text-[8px] text-gray-300">50</span>
                        <span className="font-roboto font-medium text-[7px] sm:text-[8px] text-gray-300">25</span>
                        <span className="font-roboto font-medium text-[7px] sm:text-[8px] text-gray-300">0</span>
                      </>
                    )}
                  </div>
                  
                  {/* Graph area */}
                  <div className="flex-1 relative border-l border-b border-gray-200">
                    <div className="absolute inset-0 overflow-hidden">
                      <svg 
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 420 240" 
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <clipPath id="graphClip">
                            <rect x="0" y="0" width="420" height="240"/>
                          </clipPath>
                          <pattern id="spectral-grid" width="21" height="24" patternUnits="userSpaceOnUse">
                            <path d="M 21 0 L 0 0 0 24" fill="none" stroke="#f5f5f5" strokeWidth="0.5"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#spectral-grid)" />
                        
                        <g clipPath="url(#graphClip)">
                          {/* Wave Markers */}
                          {(() => {
                            const baseFreq = Math.max(0.1, parseFloat(frequencyMin) || 0.1);
                            const maxFreq = Math.min(20.0, parseFloat(frequencyMax) || 10.0);
                            const freqRange = maxFreq - baseFreq;
                            
                            if (freqRange <= 0) return null;
                            
                            const pWaveFreq = baseFreq * 2;
                            const sWaveFreq = baseFreq * 1.2;
                            const surfaceWaveFreq = baseFreq * 0.7;
                            
                            const getXPosition = (freq: number) => {
                              if (freq < baseFreq || freq > maxFreq) return null;
                              const position = ((freq - baseFreq) / freqRange) * 420;
                              return Math.max(10, Math.min(410, position));
                            };
                            
                            const pWaveX = getXPosition(pWaveFreq);
                            const sWaveX = getXPosition(sWaveFreq);
                            const surfaceWaveX = getXPosition(surfaceWaveFreq);
                            const opacity = selectedEarthquake ? "0.7" : "0.3";
                            
                            return (
                              <>
                                {pWaveX !== null && (
                                  <line 
                                    x1={pWaveX} y1="0" 
                                    x2={pWaveX} y2="240" 
                                    stroke="#8B5CF6" 
                                    strokeWidth="2" 
                                    strokeDasharray="3,3"
                                    opacity={opacity}
                                  />
                                )}
                                {sWaveX !== null && (
                                  <line 
                                    x1={sWaveX} y1="0" 
                                    x2={sWaveX} y2="240" 
                                    stroke="#10B981" 
                                    strokeWidth="2" 
                                    strokeDasharray="3,3"
                                    opacity={opacity}
                                  />
                                )}
                                {surfaceWaveX !== null && (
                                  <line 
                                    x1={surfaceWaveX} y1="0" 
                                    x2={surfaceWaveX} y2="240" 
                                    stroke="#EF4444" 
                                    strokeWidth="2" 
                                    strokeDasharray="3,3"
                                    opacity={opacity}
                                  />
                                )}
                              </>
                            );
                          })()}
                          
                          <path 
                            d={createSpectralPath(spectralData.fft, 420, 240)}
                            stroke={selectedEarthquake ? "#6C60FF" : "#D1D5DB"} 
                            strokeWidth="1.5" 
                            fill="none"
                            opacity={selectedEarthquake ? "1" : "0.5"}
                          />
                          
                          <path 
                            d={createSpectralPath(spectralData.spectrogram, 420, 240)}
                            stroke={selectedEarthquake ? "#CE2A96" : "#D1D5DB"} 
                            strokeWidth="1.5" 
                            fill="none"
                            opacity={selectedEarthquake ? "1" : "0.5"}
                          />
                        </g>
                      </svg>
                    </div>
                    
                    <div className="absolute -bottom-3 sm:-bottom-4 left-0 right-0 flex justify-between text-[7px] sm:text-[8px]">
                      <span className={selectedEarthquake ? "text-gray-400" : "text-gray-300"}>{frequencyMin}Hz</span>
                      <span className={selectedEarthquake ? "text-gray-400" : "text-gray-300"}>
                        {((parseFloat(frequencyMin) + parseFloat(frequencyMax)) / 2).toFixed(1)}Hz
                      </span>
                      <span className={selectedEarthquake ? "text-gray-400" : "text-gray-300"}>{frequencyMax}Hz</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Spectral info */}
              <div className="mt-4 text-[9px] sm:text-xs text-gray-500">
                <div className="space-y-2">
                  {/* Mobile layout */}
                  <div className="grid grid-cols-2 gap-4 sm:hidden">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0"></div>
                        <span className={selectedEarthquake ? "" : "text-gray-400"}>
                          P: {selectedEarthquake ? (parseFloat(frequencyMin) * 2).toFixed(1) : '--'}Hz
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></div>
                        <span className={selectedEarthquake ? "" : "text-gray-400"}>
                          S: {selectedEarthquake ? (parseFloat(frequencyMin) * 1.2).toFixed(1) : '--'}Hz
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></div>
                        <span className={selectedEarthquake ? "" : "text-gray-400"}>
                          Surf: {selectedEarthquake ? (parseFloat(frequencyMin) * 0.7).toFixed(1) : '--'}Hz
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 text-right">
                      <div className={selectedEarthquake ? "" : "text-gray-400"}>
                        Mag: {selectedEarthquake ? selectedEarthquake.magnitude.toFixed(1) : '--'}
                      </div>
                      <div className={selectedEarthquake ? "" : "text-gray-400"}>
                        Depth: {selectedEarthquake ? selectedEarthquake.depth.toFixed(0) : '--'}km
                      </div>
                      <div className={selectedEarthquake ? "" : "text-gray-400"}>
                        Range: {frequencyMin}-{frequencyMax}Hz
                      </div>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden sm:block space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"></div>
                        <span className={`truncate ${selectedEarthquake ? "" : "text-gray-400"}`}>
                          P-waves: {selectedEarthquake ? `~${(parseFloat(frequencyMin) * 2).toFixed(1)}Hz` : '-- Hz'}
                        </span>
                      </div>
                      <div className="sm:text-right">
                        <span className={selectedEarthquake ? "" : "text-gray-400"}>
                          Magnitude: {selectedEarthquake ? selectedEarthquake.magnitude.toFixed(1) : '--'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                        <span className={`truncate ${selectedEarthquake ? "" : "text-gray-400"}`}>
                          S-waves: {selectedEarthquake ? `~${(parseFloat(frequencyMin) * 1.2).toFixed(1)}Hz` : '-- Hz'}
                        </span>
                      </div>
                      <div className="sm:text-right">
                        <span className={selectedEarthquake ? "" : "text-gray-400"}>
                          Depth: {selectedEarthquake ? selectedEarthquake.depth.toFixed(0) : '--'}km
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                        <span className={`truncate ${selectedEarthquake ? "" : "text-gray-400"}`}>
                          Surface: {selectedEarthquake ? `~${(parseFloat(frequencyMin) * 0.7).toFixed(1)}Hz` : '-- Hz'}
                        </span>
                      </div>
                      <div className="sm:text-right">
                        <span className={selectedEarthquake ? "" : "text-gray-400"}>
                          Range: {frequencyMin}-{frequencyMax}Hz
                        </span>
                      </div>
                    </div>
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
