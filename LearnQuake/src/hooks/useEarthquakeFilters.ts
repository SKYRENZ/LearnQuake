import { useState, useMemo } from 'react';

interface EarthquakeData {
  id: string;
  magnitude: number;
  place: string;
  time: Date;
  depth: number;
  latitude: number;
  longitude: number;
}

type SortOrder = 'recent' | 'oldest' | 'magnitude';

interface UseEarthquakeFiltersReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  magnitudeFilter: string;
  magnitudeError: boolean;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  filteredEarthquakes: EarthquakeData[];
  handleMagnitudeChange: (value: string) => void;
}

export const useEarthquakeFilters = (
  earthquakeData: EarthquakeData[]
): UseEarthquakeFiltersReturn => {
  const [searchQuery, setSearchQuery] = useState('');
  const [magnitudeFilter, setMagnitudeFilter] = useState('');
  const [magnitudeError, setMagnitudeError] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent');

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

  // Filter and sort earthquakes
  const filteredEarthquakes = useMemo(() => {
    return earthquakeData
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
  }, [earthquakeData, searchQuery, magnitudeFilter, sortOrder]);

  return {
    searchQuery,
    setSearchQuery,
    magnitudeFilter,
    magnitudeError,
    sortOrder,
    setSortOrder,
    filteredEarthquakes,
    handleMagnitudeChange,
  };
};