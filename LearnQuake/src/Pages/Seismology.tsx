import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import { useEarthquakeData } from '../hooks/useEarthquakeData';
import { useEarthquakeFilters } from '../hooks/useEarthquakeFilters';
import { useFrequencyControls } from '../hooks/useFrequencyControls';
import { useSeismicAnalysis } from '../hooks/useSeismicAnalysis';

export default function Seismology() {
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedEarthquakeId, setSelectedEarthquakeId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Custom hooks
  const {
    earthquakeData,
    loading,
    error,
    searchResult,
    searchEarthquakes,
  } = useEarthquakeData();

  const {
    searchQuery,
    setSearchQuery,
    magnitudeFilter,
    magnitudeError,
    sortOrder,
    setSortOrder,
    filteredEarthquakes,
    handleMagnitudeChange,
  } = useEarthquakeFilters(earthquakeData);

  const {
    frequencyMin,
    frequencyMax,
    setFrequencyMin,
    setFrequencyMax,
    errorMin,
    errorMax,
    setErrorMin,
    setErrorMax,
    noise,
    setNoise,
    handleFrequencyChange,
  } = useFrequencyControls();

  // Get selected earthquake object
  const selectedEarthquake = useMemo(() => {
    return earthquakeData.find(eq => eq.id === selectedEarthquakeId) || null;
  }, [earthquakeData, selectedEarthquakeId]);

  const {
    timeSeriesData,
    spectralData,
    createTimeSeriesPath,
    createSpectralPath,
  } = useSeismicAnalysis(selectedEarthquake, frequencyMin, frequencyMax, noise);

  // Real-time updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const handleLocationSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchEarthquakes(locationSearch);
  };

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

        {/* Responsive Grid Layout - Fixed for proper desktop width */}
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
              <div className="bg-white rounded-lg shadow border border-gray-100 p-3 sm:p-4 flex flex-col h-[50vh] xl:h-[65vh]">
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

          {/* Right Side - Analysis Tools (Fixed for proper desktop width) */}
          <div className="order-2 space-y-3 sm:space-y-4">
            
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
                    <span className="text-[10px] sm:text-xs text-blue-600 ml-1 sm:ml-2 normal-case block lg:inline">
                      - M{selectedEarthquake.magnitude.toFixed(1)} {selectedEarthquake.place.length > 25 ? selectedEarthquake.place.substring(0, 25) + '...' : selectedEarthquake.place}
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
                        <span className="font-roboto font-medium text-[8px] sm:text-[10px] text-gray-400">50</span>
                        <span className="font-roboto font-medium text-[8px] sm:text-[10px] text-gray-400">25</span>
                        <span className="font-roboto font-medium text-[8px] sm:text-[10px] text-gray-400">0</span>
                        <span className="font-roboto font-medium text-[8px] sm:text-[10px] text-gray-400">-25</span>
                        <span className="font-roboto font-medium text-[8px] sm:text-[10px] text-gray-400">-50</span>
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
                    <div className="absolute -bottom-3 sm:-bottom-4 left-0 right-0 flex justify-between text-[7px] sm:text-[8px]">
                      <span className="text-gray-400">0s</span>
                      <span className="text-gray-400">5s</span>
                      <span className="text-gray-400">10s</span>
                      <span className="text-gray-400">15s</span>
                      <span className="text-gray-400">20s</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Graph info - FIXED spacing */}
              <div className="mt-4 text-[10px] sm:text-xs text-gray-500">
                {selectedEarthquake ? (
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
                    <span>Amplitude: ±{(selectedEarthquake.magnitude * 50).toFixed(1)} units</span>
                    <span>Frequency: {frequencyMin}-{frequencyMax} Hz</span>
                    <span>Depth: {selectedEarthquake.depth.toFixed(0)}km</span>
                  </div>
                ) : (
                  <span>💡 Select an earthquake to view its seismic wave pattern</span>
                )}
              </div>
            </div>

            {/* Spectral Analysis - FIXED spacing and removed extra space */}
            <div className="bg-white rounded-lg shadow border border-gray-100 p-3 sm:p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-3 sm:mb-4 gap-2 lg:gap-0">
                <h2 className="font-roboto font-medium text-xs uppercase tracking-wider text-black">
                  Spectral Analysis
                  {selectedEarthquake && (
                    <span className="text-[10px] sm:text-xs text-blue-600 ml-1 sm:ml-2 normal-case block lg:inline">
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
                        <span className="font-roboto font-medium text-[7px] sm:text-[8px] text-gray-400">100</span>
                        <span className="font-roboto font-medium text-[7px] sm:text-[8px] text-gray-400">75</span>
                        <span className="font-roboto font-medium text-[7px] sm:text-[8px] text-gray-400">50</span>
                        <span className="font-roboto font-medium text-[7px] sm:text-[8px] text-gray-400">25</span>
                        <span className="font-roboto font-medium text-[7px] sm:text-[8px] text-gray-400">0</span>
                      </>
                    )}
                  </div>
                  
                  {/* Graph area with overflow clipping */}
                  <div className="flex-1 relative border-l border-b border-gray-200">
                    <div className="absolute inset-0 overflow-hidden">
                      <svg 
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 420 240" 
                        preserveAspectRatio="none"
                      >
                        {/* Clipping path to prevent overflow */}
                        <defs>
                          <clipPath id="graphClip">
                            <rect x="0" y="0" width="420" height="240"/>
                          </clipPath>
                          <pattern id="spectral-grid" width="21" height="24" patternUnits="userSpaceOnUse">
                            <path d="M 21 0 L 0 0 0 24" fill="none" stroke="#f5f5f5" strokeWidth="0.5"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#spectral-grid)" />
                        
                        {/* Everything inside clipping path */}
                        <g clipPath="url(#graphClip)">
                          {/* Wave Markers - Simplified for better mobile display */}
                          {selectedEarthquake && (() => {
                            const baseFreq = Math.max(0.1, parseFloat(frequencyMin) || 0.1);
                            const maxFreq = Math.min(20.0, parseFloat(frequencyMax) || 10.0);
                            const freqRange = maxFreq - baseFreq;
                            
                            if (freqRange <= 0) return null;
                            
                            // Calculate wave frequencies
                            const pWaveFreq = baseFreq * 2;
                            const sWaveFreq = baseFreq * 1.2;
                            const surfaceWaveFreq = baseFreq * 0.7;
                            
                            // Safe positioning - no text overflow
                            const getXPosition = (freq: number) => {
                              if (freq < baseFreq || freq > maxFreq) return null;
                              const position = ((freq - baseFreq) / freqRange) * 420;
                              return Math.max(10, Math.min(410, position));
                            };
                            
                            const pWaveX = getXPosition(pWaveFreq);
                            const sWaveX = getXPosition(sWaveFreq);
                            const surfaceWaveX = getXPosition(surfaceWaveFreq);
                            
                            return (
                              <>
                                {/* P-wave marker - Only line, no text */}
                                {pWaveX !== null && (
                                  <line 
                                    x1={pWaveX} y1="0" 
                                    x2={pWaveX} y2="240" 
                                    stroke="#8B5CF6" 
                                    strokeWidth="2" 
                                    strokeDasharray="3,3"
                                    opacity="0.7"
                                  />
                                )}
                                
                                {/* S-wave marker - Only line, no text */}
                                {sWaveX !== null && (
                                  <line 
                                    x1={sWaveX} y1="0" 
                                    x2={sWaveX} y2="240" 
                                    stroke="#10B981" 
                                    strokeWidth="2" 
                                    strokeDasharray="3,3"
                                    opacity="0.7"
                                  />
                                )}
                                
                                {/* Surface wave marker - Only line, no text */}
                                {surfaceWaveX !== null && (
                                  <line 
                                    x1={surfaceWaveX} y1="0" 
                                    x2={surfaceWaveX} y2="240" 
                                    stroke="#EF4444" 
                                    strokeWidth="2" 
                                    strokeDasharray="3,3"
                                    opacity="0.7"
                                  />
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
                        </g>
                      </svg>
                    </div>
                    
                    {/* X-axis labels (Frequency) */}
                    <div className="absolute -bottom-3 sm:-bottom-4 left-0 right-0 flex justify-between text-[7px] sm:text-[8px]">
                      <span className="text-gray-400">{frequencyMin}Hz</span>
                      <span className="text-gray-400">
                        {((parseFloat(frequencyMin) + parseFloat(frequencyMax)) / 2).toFixed(1)}Hz
                      </span>
                      <span className="text-gray-400">{frequencyMax}Hz</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced spectral info - FIXED spacing */}
              <div className="mt-4 text-[9px] sm:text-xs text-gray-500">
                {selectedEarthquake ? (
                  <div className="space-y-2">
                    {/* Mobile: 2 columns - Wave markers (left) vs Earthquake info (right) with better spacing */}
                    <div className="grid grid-cols-2 gap-4 sm:hidden">
                      {/* Left Column: Wave Markers */}
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0"></div>
                          <span>P: {(parseFloat(frequencyMin) * 2).toFixed(1)}Hz</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></div>
                          <span>S: {(parseFloat(frequencyMin) * 1.2).toFixed(1)}Hz</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></div>
                          <span>Surf: {(parseFloat(frequencyMin) * 0.7).toFixed(1)}Hz</span>
                        </div>
                      </div>
                      
                      {/* Right Column: Earthquake Info */}
                      <div className="space-y-1.5 text-right">
                        <div>Mag: {selectedEarthquake.magnitude.toFixed(1)}</div>
                        <div>Depth: {selectedEarthquake.depth.toFixed(0)}km</div>
                        <div>Range: {frequencyMin}-{frequencyMax}Hz</div>
                      </div>
                    </div>

                    {/* Desktop: Original layout (hidden on mobile, shown on sm+) with better spacing */}
                    <div className="hidden sm:block space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"></div>
                          <span className="truncate">P-waves: ~{(parseFloat(frequencyMin) * 2).toFixed(1)}Hz</span>
                        </div>
                        <div className="sm:text-right">
                          <span>Magnitude: {selectedEarthquake.magnitude.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                          <span className="truncate">S-waves: ~{(parseFloat(frequencyMin) * 1.2).toFixed(1)}Hz</span>
                        </div>
                        <div className="sm:text-right">
                          <span>Depth: {selectedEarthquake.depth.toFixed(0)}km</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                          <span className="truncate">Surface: ~{(parseFloat(frequencyMin) * 0.7).toFixed(1)}Hz</span>
                        </div>
                        <div className="sm:text-right">
                          <span>Range: {frequencyMin}-{frequencyMax}Hz</span>
                        </div>
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
