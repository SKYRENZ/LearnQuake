import type { Dispatch, SetStateAction } from 'react';
import type {
  SimulationAnalysis,
  SimulationMeta,
} from '../../hooks/useSimulationAnalysis';
import type { SelectedSimulationEvent } from './types';

interface SimulationSidebarProps {
  simPlace: string;
  simMag: number | '';
  simRadiusKm: number | '';
  setSimPlace: Dispatch<SetStateAction<string>>;
  setSimMag: Dispatch<SetStateAction<number | ''>>;
  setSimRadiusKm: Dispatch<SetStateAction<number | ''>>;
  pickingSimLocation: boolean;
  setPickingSimLocation: Dispatch<SetStateAction<boolean>>;
  isSimAnalyzing: boolean;
  analysisError: string | null;
  commitSimulatedEvent: () => void;
  selected: SelectedSimulationEvent | null;
  simSummaryMeta: SimulationMeta | null;
  simSummaryAnalysis: SimulationAnalysis | null;
}

export default function SimulationSidebar({
  simPlace,
  simMag,
  simRadiusKm,
  setSimPlace,
  setSimMag,
  setSimRadiusKm,
  pickingSimLocation,
  setPickingSimLocation,
  isSimAnalyzing,
  analysisError,
  commitSimulatedEvent,
  selected,
  simSummaryMeta,
  simSummaryAnalysis,
}: SimulationSidebarProps) {
  return (
    <div className="relative flex flex-col md:w-80 lg:w-96 p-4 border-r border-white/10 bg-quake-dark-blue overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Earthquake Simulator</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          commitSimulatedEvent();
        }}
        className="space-y-4"
      >
        {/* Location Input */}
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-white/90"
          >
            Location
          </label>
          <input
            type="text"
            id="location"
            value={simPlace}
            onChange={(e) => setSimPlace(e.target.value)}
            disabled={pickingSimLocation}
            className="mt-1 block w-full p-2 text-sm rounded-md bg-white/5 border border-white/10 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter a location"
          />
        </div>

        {/* Magnitude Input */}
        <div>
          <label
            htmlFor="magnitude"
            className="block text-sm font-medium text-white/90"
          >
            Magnitude
          </label>
          <input
            type="number"
            id="magnitude"
            value={simMag}
            onChange={(e) => {
              const value = e.target.value;
              setSimMag(value === '' ? '' : Number(value));
            }}
            className="mt-1 block w-full p-2 text-sm rounded-md bg-white/5 border border-white/10 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter magnitude (e.g., 5.0)"
            min="0"
            step="0.1"
          />
        </div>

        {/* Radius Input */}
        <div>
          <label
            htmlFor="radius"
            className="block text-sm font-medium text-white/90"
          >
            Radius (km)
          </label>
          <input
            type="number"
            id="radius"
            value={simRadiusKm}
            onChange={(e) => {
              const value = e.target.value;
              setSimRadiusKm(value === '' ? '' : Number(value));
            }}
            className="mt-1 block w-full p-2 text-sm rounded-md bg-white/5 border border-white/10 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter radius in kilometers"
            min="0"
            step="0.1"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPickingSimLocation(!pickingSimLocation)}
            className="flex-1 px-4 py-2 text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-2
                bg-white text-quake-dark-blue hover:bg-gray-100 disabled:opacity-50"
            disabled={isSimAnalyzing}
          >
            {pickingSimLocation ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                </svg>
                Cancel Picking
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Pick Location
              </>
            )}
          </button>

          <button
            type="submit"
            className="flex-1 px-4 py-2 text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-2
                bg-quake-red-600 text-white hover:bg-quake-red-700 disabled:opacity-50"
            disabled={isSimAnalyzing || !simPlace || simMag === '' || simRadiusKm === ''}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Simulate Event
          </button>
        </div>

        {/* Status Messages */}
        {isSimAnalyzing && (
          <p className="text-xs text-gray-300 font-instrument">
            Generating AI impact analysis…
          </p>
        )}
        {analysisError && !isSimAnalyzing && (
          <p className="text-xs text-red-400 font-instrument">{analysisError}</p>
        )}
      </form>

      {/* Event Details */}
      <div className="mt-6">
        <h3 className="text-base font-semibold text-white mb-2">Event Details</h3>
        <div className="bg-white/5 p-4 rounded-lg shadow-md space-y-3">
          {selected ? (
            <>
              <div className="text-sm text-white/80">
                <strong>Location:</strong> {selected.place}
              </div>
              <div className="text-sm text-white/80">
                <strong>Magnitude:</strong> {selected.mag}
              </div>
              <div className="text-sm text-white/80">
                <strong>Time:</strong> {selected.time ? new Date(selected.time).toLocaleString() : '—'}
              </div>
              {selected.url && (
                <div className="text-sm text-white/80">
                  <strong>Details:</strong>{' '}
                  <a href={selected.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    USGS Event Page
                  </a>
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-white/70">
              No event selected. Click on an earthquake on the map to see details.
            </div>
          )}

          {/* Simulated Impact */}
          <div className="pt-3 border-t border-white/10">
            <h4 className="text-sm font-semibold text-white mb-2">Simulated Impact (AI)</h4>
            {simSummaryMeta ? (
              <div className="space-y-2 text-sm text-white/80">
                {simSummaryMeta.place && <p><span className="text-white/60">Location:</span> {simSummaryMeta.place}</p>}
                {simSummaryMeta.magnitude !== undefined && <p><span className="text-white/60">Magnitude:</span> {simSummaryMeta.magnitude}</p>}
                {simSummaryMeta.radiusKm !== undefined && <p><span className="text-white/60">Radius:</span> {simSummaryMeta.radiusKm.toFixed(1)} km</p>}
                {simSummaryMeta.pending ? (
                  <p className="text-white/70">Generating AI impact analysis…</p>
                ) : simSummaryMeta.error ? (
                  <p className="text-red-400">{simSummaryMeta.error}</p>
                ) : simSummaryAnalysis?.impact ? (
                  <ul className="space-y-1">
                    <li>Estimated casualties: {simSummaryAnalysis.impact.estimated_casualties ?? 'unknown'}</li>
                    <li>Estimated injured: {simSummaryAnalysis.impact.estimated_injured ?? 'unknown'}</li>
                    <li>Damaged infrastructure: {simSummaryAnalysis.impact.damaged_infrastructure ?? 'unknown'}</li>
                    <li>Tsunami risk: {simSummaryAnalysis.impact.tsunami_risk ?? 'unknown'}</li>
                    <li>Landslide risk: {simSummaryAnalysis.impact.landslide_risk ?? 'unknown'}</li>
                  </ul>
                ) : (
                  <p className="text-white/70">No AI analysis available.</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-white/70">Run a simulation to generate AI impact estimates.</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <p className="text-xs text-white/70">Data from USGS Earthquake Hazards Program</p>
      </div>
    </div>
  );
}

export type { SelectedSimulationEvent } from './types';
