import React from 'react';
import { useState, useEffect, useMemo } from 'react';
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
  searchMethod?: string;
}

interface TimeSeriesData {
  time: number;
  amplitude: number;
  frequency: number;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

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
  
  // New filtering states
  const [magnitudeFilter, setMagnitudeFilter] = useState('');
  const [magnitudeError, setMagnitudeError] = useState(false);
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest' | 'magnitude'>('recent');

  // Add new state for selected earthquake
  const [selectedEarthquakeId, setSelectedEarthquakeId] = useState<string | null>(null);

  // Add this state for real-time updates
  const [currentTime, setCurrentTime] = useState(new Date());

  // Generate time series data based on selected earthquake
  const generateTimeSeriesData = (earthquake: EarthquakeData | null): TimeSeriesData[] => {
    if (!earthquake) {
      // Default data when no earthquake is selected
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
      const t = i / 10; // Time in seconds
      
      // Create seismic wave pattern based on earthquake properties
      const primaryWave = Math.sin(t * baseFreq * 2 * Math.PI) * earthquake.magnitude * 10;
      const secondaryWave = Math.sin(t * (baseFreq * 1.7) * 2 * Math.PI) * earthquake.magnitude * 7;
      const surfaceWave = Math.sin(t * (baseFreq * 0.8) * 2 * Math.PI) * earthquake.magnitude * 15;
      
      // Depth affects wave amplitude (deeper = more attenuated)
      const depthFactor = Math.exp(-earthquake.depth / 100);
      
      // Distance effect simulation
      const distanceDecay = Math.exp(-t * 0.1);
      
      // Combine waves with noise
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

  // Create SVG path for the time series graph
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

  // Generate spectral analysis data based on selected earthquake
  const generateSpectralData = (earthquake: EarthquakeData | null) => {
    if (!earthquake) {
      // Default spectral data when no earthquake is selected
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
    
    // Generate FFT data based on earthquake properties
    const fftData = Array.from({ length: 50 }, (_, i) => {
      const freq = baseFreq + (i / 49) * freqRange;
      
      // Main frequency components based on earthquake characteristics
      let amplitude = 0;
      
      // Primary wave frequency (higher frequency, magnitude dependent)
      const pWaveFreq = baseFreq * 2;
      if (Math.abs(freq - pWaveFreq) < 1) {
        amplitude += earthquake.magnitude * 15;
      }
      
      // Secondary wave frequency (medium frequency)
      const sWaveFreq = baseFreq * 1.2;
      if (Math.abs(freq - sWaveFreq) < 0.8) {
        amplitude += earthquake.magnitude * 12;
      }
      
      // Surface wave frequency (lower frequency, highest amplitude)
      const surfaceWaveFreq = baseFreq * 0.7;
      if (Math.abs(freq - surfaceWaveFreq) < 0.5) {
        amplitude += earthquake.magnitude * 20;
      }
      
      // Depth effect - deeper earthquakes have different frequency distribution
      const depthFactor = Math.exp(-earthquake.depth / 200);
      amplitude *= depthFactor;
      
      // Add some background noise
      amplitude += Math.random() * (earthquake.magnitude * 2);
      
      return {
        frequency: freq,
        amplitude: Math.max(0, amplitude)
      };
    });

    // Generate Spectrogram data (time-frequency representation)
    const spectrogramData = Array.from({ length: 50 }, (_, i) => {
      const freq = baseFreq + (i / 49) * freqRange;
      
      let amplitude = 0;
      
      // Different frequency patterns over time
      const timePhase = (i / 50) * Math.PI * 2;
      
      // Lower frequencies dominate early (surface waves arrive later)
      if (freq < baseFreq * 2) {
        amplitude += earthquake.magnitude * 18 * Math.sin(timePhase + Math.PI);
      }
      
      // Higher frequencies appear first (P-waves)
      if (freq > baseFreq * 1.5) {
        amplitude += earthquake.magnitude * 10 * Math.cos(timePhase);
      }
      
      // Magnitude scaling
      amplitude *= (earthquake.magnitude / 7); // Normalize to typical earthquake range
      
      // Depth effect
      const depthFactor = Math.exp(-earthquake.depth / 150);
      amplitude *= depthFactor;
      
      // Add noise
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

  // Generate spectral data
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

  // Updated search function for country-only search
  const searchEarthquakes = async (country: string) => {
    if (!country.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔍 Searching for earthquakes in: "${country}"`);
      const response = await fetch(`http://localhost:5000/api/earthquakes/search-by-country?country=${encodeURIComponent(country)}&timeframe=month&limit=50`);
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
        const response = await fetch(`${API_BASE_URL}/api/earthquakes?timeframe=day&limit=20`);
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

    loadDefaultEarthquakes();
  }, []);

  // Add this useEffect for real-time updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

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

  // Handle magnitude filter change (numbers only)
  const handleMagnitudeChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setMagnitudeFilter(value);
      setMagnitudeError(false);
    } else {
      setMagnitudeFilter(value);
      setMagnitudeError(true);
    }
  };

  // Enhanced filter earthquakes function
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
  }, [currentTime]); // Empty dependency array means this runs once when component mounts

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
        <div className="mb-6 flex items-center justify-between">
          <p className="font-instrument font-bold text-sm md:text-base text-quake-dark-blue">
            <span className="text-quake-dark-blue">{currentDate.dayName}, </span>
            <span className="text-quake-medium-blue">{currentDate.monthDay}</span>
          </p>
          <div className="flex-1 flex justify-center">
            <h1 className="text-2xl font-bold text-center">
              Seismology <span className="text-indigo-700">Tool</span>
            </h1>
          </div>
        </div>

        {/* Updated Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Side - Earthquake Data Selector */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow border border-gray-100 p-4 flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
              <h2 className="font-roboto font-semibold text-xs uppercase tracking-wider text-black mb-2">
                Earthquake Data Selector
              </h2>
              
              {/* Country Search */}
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
                
                <div className="mt-2 text-xs text-gray-500">
                  <strong>Examples:</strong> "Japan", "Chile", "United States", "Turkey", "Indonesia", "Mexico"
                </div>
              </form>

              {/* Search Results Info */}
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
                    <div className="text-xs text-gray-500 ml-2">🌍</div>
                  </div>
                </div>
              )}

              {/* Filtering Section */}
              <div className="mb-4 space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Min magnitude (e.g., 5.0)"
                      value={magnitudeFilter}
                      onChange={(e) => handleMagnitudeChange(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg font-inter font-medium text-xs text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:border-transparent ${
                        magnitudeError 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {magnitudeError && (
                      <span className="absolute -bottom-5 left-0 text-[10px] text-red-500">
                        Only numbers allowed
                      </span>
                    )}
                  </div>

                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'recent' | 'oldest' | 'magnitude')}
                    className="px-3 py-2 border border-gray-300 rounded-lg font-inter font-medium text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="recent">Recent First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="magnitude">By Magnitude</option>
                  </select>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Showing {filteredEarthquakes.length} earthquake{filteredEarthquakes.length !== 1 ? 's' : ''}
                    {magnitudeFilter && ` with magnitude ≥ ${magnitudeFilter}`}
                  </span>
                  {selectedEarthquake && (
                    <span className="text-blue-600 font-medium">
                      📊 Displaying: {selectedEarthquake.place}
                    </span>
                  )}
                </div>
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

              {/* Earthquake Data Display - Now flexible to fill remaining space */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="text-xs text-gray-500">Loading earthquakes...</div>
                    </div>
                  ) : filteredEarthquakes.length > 0 ? (
                    filteredEarthquakes.map((item, index) => (
                      <div
                        key={item.id || index}
                        onClick={() => setSelectedEarthquakeId(item.id === selectedEarthquakeId ? null : item.id)}
                        className={`flex items-center justify-between py-2 px-2 border-b border-gray-200 last:border-b-0 cursor-pointer rounded transition-colors duration-200 ${
                          selectedEarthquakeId === item.id 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex flex-col">
                            <span className="font-roboto font-bold text-xs text-red-600">
                              M {item.magnitude.toFixed(1)}
                            </span>
                            <span className="font-roboto font-medium text-[10px] text-blue-600">
                              {item.depth.toFixed(0)}km deep
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-roboto font-medium text-xs text-black">
                              {item.place}
                            </span>
                            <span className="font-roboto font-medium text-[10px] text-gray-400">
                              {new Date(item.time).toLocaleDateString()} {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <div className={`w-6 h-px transition-colors duration-200 ${
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

          {/* Right Side - Analysis Tools */}
          <div className="space-y-2">
            
            {/* Frequency Range */}
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
                  <label className="absolute -top-4 left-0 text-[10px] text-gray-500">Min (Hz)</label>
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
                  <label className="absolute -top-4 left-0 text-[10px] text-gray-500">Max (Hz)</label>
                  {errorMax && (
                    <span className="absolute -bottom-4 left-0 text-[10px] text-red-500">
                      Only numbers are accepted
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Time Series Filtering */}
            <div className="bg-white rounded-lg shadow border border-gray-100 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h2 className="font-roboto font-medium text-sm uppercase tracking-wider text-black mb-2 sm:mb-0">
                  Time Series Filtering
                  {selectedEarthquake && (
                    <span className="text-xs text-blue-600 ml-2 normal-case">
                      - M{selectedEarthquake.magnitude.toFixed(1)} {selectedEarthquake.place}
                    </span>
                  )}
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
                  {/* Y-axis labels */}
                  <div className="flex flex-col justify-between items-end pr-2 py-2 text-right min-w-[40px]">
                    {selectedEarthquake ? (
                      <>
                        <span className="font-roboto font-medium text-[10px] text-gray-400">
                          {(selectedEarthquake.magnitude * 50).toFixed(0)}
                        </span>
                        <span className="font-roboto font-medium text-[10px] text-gray-400">
                          {(selectedEarthquake.magnitude * 25).toFixed(0)}
                        </span>
                        <span className="font-roboto font-medium text-[10px] text-gray-400">0</span>
                        <span className="font-roboto font-medium text-[10px] text-gray-400">
                          -{(selectedEarthquake.magnitude * 25).toFixed(0)}
                        </span>
                        <span className="font-roboto font-medium text-[10px] text-gray-400">
                          -{(selectedEarthquake.magnitude * 50).toFixed(0)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-roboto font-medium text-[10px] text-gray-400">50</span>
                        <span className="font-roboto font-medium text-[10px] text-gray-400">25</span>
                        <span className="font-roboto font-medium text-[10px] text-gray-400">0</span>
                        <span className="font-roboto font-medium text-[10px] text-gray-400">-25</span>
                        <span className="font-roboto font-medium text-[10px] text-gray-400">-50</span>
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
                      {/* Grid lines */}
                      <defs>
                        <pattern id="grid" width="30" height="32" patternUnits="userSpaceOnUse">
                          <path d="M 30 0 L 0 0 0 32" fill="none" stroke="#f0f0f0" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      
                      {/* Zero line */}
                      <line x1="0" y1="80" x2="600" y2="80" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="2,2"/>
                      
                      {/* Time series path */}
                      <path 
                        d={createTimeSeriesPath(timeSeriesData, 600, 160)}
                        stroke={selectedEarthquake ? "#3B38A0" : "#9CA3AF"} 
                        strokeWidth="1.5" 
                        fill="none"
                      />
                    </svg>
                    
                    {/* X-axis labels */}
                    <div className="absolute -bottom-4 left-0 right-0 flex justify-between text-[8px]">
                      <span className="text-gray-400">0s</span>
                      <span className="text-gray-400">5s</span>
                      <span className="text-gray-400">10s</span>
                      <span className="text-gray-400">15s</span>
                      <span className="text-gray-400">20s</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Graph info */}
              <div className="mt-3 text-xs text-gray-500">
                {selectedEarthquake ? (
                  <div className="flex justify-between">
                    <span>Amplitude: ±{(selectedEarthquake.magnitude * 50).toFixed(1)} units</span>
                    <span>Frequency: {frequencyMin}-{frequencyMax} Hz</span>
                    <span>Depth: {selectedEarthquake.depth.toFixed(0)}km</span>
                  </div>
                ) : (
                  <span>💡 Select an earthquake to view its seismic wave pattern</span>
                )}
              </div>
            </div>

            {/* Spectral Analysis */}
            <div className="bg-white rounded-lg shadow border border-gray-100 p-4 h-[380px]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h2 className="font-roboto font-medium text-xs uppercase tracking-wider text-black mb-2 sm:mb-0">
                  Spectral Analysis
                  {selectedEarthquake && (
                    <span className="text-xs text-blue-600 ml-2 normal-case">
                      - M{selectedEarthquake.magnitude.toFixed(1)}
                    </span>
                  )}
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-0.5 bg-purple-500"></div>
                    <span className="font-roboto font-medium text-[10px] text-gray-400">FFT</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-0.5 bg-pink-500"></div>
                    <span className="font-roboto font-medium text-[10px] text-gray-400">Spectrogram</span>
                  </div>
                </div>
              </div>
              
              <div className="relative h-[240px]">
                <div className="absolute inset-0 flex">
                  {/* Y-axis labels */}
                  <div className="flex flex-col justify-between items-end pr-2 py-2 text-right min-w-[30px]">
                    {selectedEarthquake ? (
                      <>
                        <span className="font-roboto font-medium text-[8px] text-gray-400">
                          {(selectedEarthquake.magnitude * 20).toFixed(0)}
                        </span>
                        <span className="font-roboto font-medium text-[8px] text-gray-400">
                          {(selectedEarthquake.magnitude * 15).toFixed(0)}
                        </span>
                        <span className="font-roboto font-medium text-[8px] text-gray-400">
                          {(selectedEarthquake.magnitude * 10).toFixed(0)}
                        </span>
                        <span className="font-roboto font-medium text-[8px] text-gray-400">
                          {(selectedEarthquake.magnitude * 5).toFixed(0)}
                        </span>
                        <span className="font-roboto font-medium text-[8px] text-gray-400">0</span>
                      </>
                    ) : (
                      <>
                        <span className="font-roboto font-medium text-[8px] text-gray-400">100</span>
                        <span className="font-roboto font-medium text-[8px] text-gray-400">75</span>
                        <span className="font-roboto font-medium text-[8px] text-gray-400">50</span>
                        <span className="font-roboto font-medium text-[8px] text-gray-400">25</span>
                        <span className="font-roboto font-medium text-[8px] text-gray-400">0</span>
                      </>
                    )}
                  </div>
                  
                  {/* Graph area */}
                  <div className="flex-1 relative border-l border-b border-gray-200">
                    <svg 
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 420 240" 
                      preserveAspectRatio="none"
                    >
                      {/* Grid lines */}
                      <defs>
                        <pattern id="spectral-grid" width="21" height="24" patternUnits="userSpaceOnUse">
                          <path d="M 21 0 L 0 0 0 24" fill="none" stroke="#f5f5f5" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#spectral-grid)" />
                      
                      {/* Wave Markers - Vertical Reference Lines */}
                      {selectedEarthquake && (() => {
                        const baseFreq = Math.max(0.1, parseFloat(frequencyMin) || 0.1);
                        const maxFreq = Math.min(20.0, parseFloat(frequencyMax) || 10.0);
                        const freqRange = maxFreq - baseFreq;
                        
                        // Calculate wave frequencies
                        const pWaveFreq = baseFreq * 2;
                        const sWaveFreq = baseFreq * 1.2;
                        const surfaceWaveFreq = baseFreq * 0.7;
                        
                        // Convert frequencies to x positions
                        const getXPosition = (freq: number) => {
                          if (freq < baseFreq || freq > maxFreq) return null;
                          return ((freq - baseFreq) / freqRange) * 420;
                        };
                        
                        const pWaveX = getXPosition(pWaveFreq);
                        const sWaveX = getXPosition(sWaveFreq);
                        const surfaceWaveX = getXPosition(surfaceWaveFreq);
                        
                        return (
                          <>
                            {/* P-wave marker */}
                            {pWaveX !== null && (
                              <g>
                                <line 
                                  x1={pWaveX} y1="0" 
                                  x2={pWaveX} y2="240" 
                                  stroke="#8B5CF6" 
                                  strokeWidth="2" 
                                  strokeDasharray="3,3"
                                  opacity="0.7"
                                />
                                <text 
                                  x={pWaveX + 5} 
                                  y="20" 
                                  fill="#8B5CF6" 
                                  fontSize="10" 
                                  textAnchor="start"
                                  fontWeight="bold"
                                >
                                  P
                                </text>
                              </g>
                            )}
                            
                            {/* S-wave marker */}
                            {sWaveX !== null && (
                              <g>
                                <line 
                                  x1={sWaveX} y1="0" 
                                  x2={sWaveX} y2="240" 
                                  stroke="#10B981" 
                                  strokeWidth="2" 
                                  strokeDasharray="3,3"
                                  opacity="0.7"
                                />
                                <text 
                                  x={sWaveX + 5} 
                                  y="35" 
                                  fill="#10B981" 
                                  fontSize="10" 
                                  textAnchor="start"
                                  fontWeight="bold"
                                >
                                  S
                                </text>
                              </g>
                            )}
                            
                            {/* Surface wave marker */}
                            {surfaceWaveX !== null && (
                              <g>
                                <line 
                                  x1={surfaceWaveX} y1="0" 
                                  x2={surfaceWaveX} y2="240" 
                                  stroke="#EF4444" 
                                  strokeWidth="2" 
                                  strokeDasharray="3,3"
                                  opacity="0.7"
                                />
                                <text 
                                  x={surfaceWaveX + 5} 
                                  y="50" 
                                  fill="#EF4444" 
                                  fontSize="10" 
                                  textAnchor="start"
                                  fontWeight="bold"
                                >
                                  Sur
                                </text>
                              </g>
                            )}
                          </>
                        );
                      })()}
                      
                      {/* FFT Path */}
                      <path 
                        d={createSpectralPath(spectralData.fft, 420, 240)}
                        stroke="#6C60FF" 
                        strokeWidth="1.5" 
                        fill="none"
                      />
                      
                      {/* Spectrogram Path */}
                      <path 
                        d={createSpectralPath(spectralData.spectrogram, 420, 240)}
                        stroke="#CE2A96" 
                        strokeWidth="1.5" 
                        fill="none"
                      />
                    </svg>
                    
                    {/* X-axis labels (Frequency) */}
                    <div className="absolute -bottom-4 left-0 right-0 flex justify-between text-[8px]">
                      <span className="text-gray-400">{frequencyMin}Hz</span>
                      <span className="text-gray-400">
                        {((parseFloat(frequencyMin) + parseFloat(frequencyMax)) / 2).toFixed(1)}Hz
                      </span>
                      <span className="text-gray-400">{frequencyMax}Hz</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced spectral info - Fixed layout */}
              <div className="mt-4 text-xs text-gray-500">
                {selectedEarthquake ? (
                  <div className="space-y-2">
                    {/* First row */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span className="truncate">P-waves: ~{(parseFloat(frequencyMin) * 2).toFixed(1)}Hz</span>
                      </div>
                      <div className="text-right">
                        <span>Magnitude: {selectedEarthquake.magnitude.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    {/* Second row */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="truncate">S-waves: ~{(parseFloat(frequencyMin) * 1.2).toFixed(1)}Hz</span>
                      </div>
                      <div className="text-right">
                        <span>Depth: {selectedEarthquake.depth.toFixed(0)}km</span>
                      </div>
                    </div>
                    
                    {/* Third row */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="truncate">Surface: ~{(parseFloat(frequencyMin) * 0.7).toFixed(1)}Hz</span>
                      </div>
                      <div className="text-right">
                        <span>Range: {frequencyMin}-{frequencyMax}Hz</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <span>💡 Select an earthquake to view its frequency spectrum with wave markers</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
