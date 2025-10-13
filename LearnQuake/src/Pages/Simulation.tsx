import Header from '../components/Header';
import { useRef, useState } from 'react';
import SimulationMap, {
  type SimulationMapHandle,
} from '../components/Simulation/SimulationMap';
import {
  useSimulationAnalysis,
  type SimulationAnalysis,
  type SimulationMeta,
} from '../hooks/useSimulationAnalysis';
import SimulationSidebar from '../components/Simulation/SimulationSidebar';
import SimulationSearchPanel from '../components/Simulation/SimulationSearchPanel';
import type {
  SelectedSimulationEvent,
  NominatimResult,
} from '../components/Simulation/types';

const MAP_ENDPOINT = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

export default function Simulation() {
  const simulationMapRef = useRef<SimulationMapHandle | null>(null);

  const [selected, setSelected] = useState<SelectedSimulationEvent | null>(null);

  // Search state (remove any)
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Simulation form state
  const [simPlace, setSimPlace] = useState('');
  const [simMag, setSimMag] = useState<number | ''>('');
  const [simRadiusKm, setSimRadiusKm] = useState<number | ''>('');
  const [pickingSimLocation, setPickingSimLocation] = useState(false);
  const {
    isSimAnalyzing,
    analysisError,
    hoveredSimAnalysis,
    hoveredSimMeta,
    simSummaryMeta,
    simSummaryAnalysis,
    setHoveredSimMeta,
    setHoveredSimAnalysis,
    setSimSummaryMeta,
    setSimSummaryAnalysis,
    requestSimulationAnalysis,
    hoveredSimFeatureRef,
  } = useSimulationAnalysis(MAP_ENDPOINT, simPlace);

  const commitSimulatedEvent = () => {
    simulationMapRef.current?.commitSimulation();
  };

  const performSearch = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setIsSearching(true);
    setResults([]);

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        q,
      )}&limit=5`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const data: NominatimResult[] = await res.json();
      setResults(data);
      if (data[0]) {
        const lon = parseFloat(data[0].lon);
        const lat = parseFloat(data[0].lat);
        if (!Number.isNaN(lon) && !Number.isNaN(lat)) {
          simulationMapRef.current?.flyToLocation([lon, lat]);
        }
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (item: NominatimResult) => {
    setSimPlace(item.display_name);
    setQuery(item.display_name);
    setResults([]);
    const lon = parseFloat(item.lon);
    const lat = parseFloat(item.lat);
    if (!Number.isNaN(lon) && !Number.isNaN(lat)) {
      simulationMapRef.current?.flyToLocation([lon, lat]);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <SimulationSidebar
          simPlace={simPlace}
          simMag={simMag}
          simRadiusKm={simRadiusKm}
          setSimPlace={setSimPlace}
          setSimMag={setSimMag}
          setSimRadiusKm={setSimRadiusKm}
          pickingSimLocation={pickingSimLocation}
          setPickingSimLocation={setPickingSimLocation}
          isSimAnalyzing={isSimAnalyzing}
          analysisError={analysisError}
          commitSimulatedEvent={commitSimulatedEvent}
          selected={selected}
          simSummaryMeta={simSummaryMeta}
          simSummaryAnalysis={simSummaryAnalysis}
        />
        <div className="flex-1">
          <SimulationMap
            ref={simulationMapRef}
            simPlace={simPlace}
            simMag={simMag}
            simRadiusKm={simRadiusKm}
            setSimPlace={setSimPlace}
            pickingSimLocation={pickingSimLocation}
            setPickingSimLocation={setPickingSimLocation}
            setSelected={setSelected}
            setSimSummaryMeta={setSimSummaryMeta}
            setSimSummaryAnalysis={setSimSummaryAnalysis}
            setHoveredSimMeta={setHoveredSimMeta}
            setHoveredSimAnalysis={setHoveredSimAnalysis}
            requestSimulationAnalysis={requestSimulationAnalysis}
            hoveredSimFeatureRef={hoveredSimFeatureRef}
          />
        </div>
      </div>
    </div>
  );
}
