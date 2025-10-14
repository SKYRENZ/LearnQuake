import Header from '../components/Header';
import { useRef, useState } from 'react';
import SimulationMap, {
  type SimulationMapHandle,
} from '../components/Simulation/SimulationMap';
import { useSimulationAnalysis } from '../hooks/useSimulationAnalysis';
import SimulationSidebar from '../components/Simulation/SimulationSidebar';
import type { SelectedSimulationEvent } from '../components/Simulation/types';
import { useIsMobile } from '../hooks/use-mobile';

const MAP_ENDPOINT =
  import.meta.env.VITE_MAP_ENDPOINT ?? 'http://localhost:5000/map';

export default function Simulation() {
  const simulationMapRef = useRef<SimulationMapHandle | null>(null);
  const [selected, setSelected] = useState<SelectedSimulationEvent | null>(null);
  const [simPlace, setSimPlace] = useState('');
  const [simMag, setSimMag] = useState<number | ''>('');
  const [simRadiusKm, setSimRadiusKm] = useState<number | ''>('');
  const [pickingSimLocation, setPickingSimLocation] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isMobile = useIsMobile();

  const {
    isSimAnalyzing,
    analysisError,
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

  const searchLocationOnMap = async (location: string) => {
    if (!location.trim()) return;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        location
      )}&limit=1`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const data = await res.json();
      if (data[0]) {
        const lon = parseFloat(data[0].lon);
        const lat = parseFloat(data[0].lat);
        setSimPlace(data[0].display_name);
        // Move map if ref is available
        if (simulationMapRef.current && simulationMapRef.current.flyToLocation) {
          simulationMapRef.current.flyToLocation([lon, lat]);
        }
      } else {
        alert('Location not found.');
      }
    } catch (err) {
      alert('Location search failed.');
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop sidebar (unchanged) */}
        {!isMobile && (
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
        )}

        {/* Mobile sidebar */}
        {isMobile && (
          <div
            className={`fixed top-16 left-0 bottom-0 z-40 w-80 bg-quake-dark-blue p-4 transform transition-transform duration-300 flex flex-col ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
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
              commitSimulatedEvent={() => {
                commitSimulatedEvent();
                setSidebarOpen(false);
              }}
              selected={selected}
              simSummaryMeta={simSummaryMeta}
              simSummaryAnalysis={simSummaryAnalysis}
            />

            {/* Arrow toggle attached to sidebar */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="absolute top-1/2 right-[-1.5rem] transform -translate-y-1/2 z-50 p-2 bg-quake-dark-blue text-white rounded-l-md shadow-md"
            >
              {sidebarOpen ? '←' : '→'}
            </button>
          </div>
        )}

        {/* Map */}
        <div className="flex-1 relative">
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
