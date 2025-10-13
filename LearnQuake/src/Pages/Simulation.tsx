import Header from '../components/Header';
import { useRef, useState } from 'react';
import SimulationMap, {
  type SimulationMapHandle,
} from '../components/Simulation/SimulationMap';
import { useSimulationAnalysis } from '../hooks/useSimulationAnalysis';
import SimulationSidebar from '../components/Simulation/SimulationSidebar';
import type { SelectedSimulationEvent } from '../components/Simulation/types';

const MAP_ENDPOINT = '/map';

export default function Simulation() {
  const simulationMapRef = useRef<SimulationMapHandle | null>(null);
  const [selected, setSelected] = useState<SelectedSimulationEvent | null>(null);
  const [simPlace, setSimPlace] = useState('');
  const [simMag, setSimMag] = useState<number | ''>('');
  const [simRadiusKm, setSimRadiusKm] = useState<number | ''>('');
  const [pickingSimLocation, setPickingSimLocation] = useState(false);

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
