import type { FormEvent } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { NominatimResult } from './types';

interface SimulationSearchPanelProps {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  isSearching: boolean;
  results: NominatimResult[];
  onSearch: (event?: FormEvent<HTMLFormElement>) => Promise<void> | void;
  onSelectResult: (result: NominatimResult) => void;
}

export default function SimulationSearchPanel({
  query,
  setQuery,
  isSearching,
  results,
  onSearch,
  onSelectResult,
}: SimulationSearchPanelProps) {
  return (
    <div className="pointer-events-none absolute top-4 left-4 w-full max-w-xs sm:max-w-sm">
      <div className="pointer-events-auto rounded-lg bg-quake-dark-blue/90 border border-white/10 shadow-xl p-4 space-y-3 backdrop-blur">
        <form onSubmit={onSearch} className="space-y-2">
          <label
            htmlFor="simulation-search"
            className="text-xs font-semibold uppercase tracking-wider text-white/60"
          >
            Search Location
          </label>
          <div className="flex gap-2">
            <input
              id="simulation-search"
              type="text"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search cities or landmarks"
              className="flex-1 rounded-md bg-white/10 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-2 text-sm font-semibold rounded-md bg-quake-red-600 hover:bg-quake-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!query.trim() || isSearching}
            >
              {isSearching ? 'Searching…' : 'Search'}
            </button>
          </div>
        </form>

        {(results.length > 0 || isSearching) && (
          <div className="max-h-64 overflow-y-auto space-y-2">
            {isSearching && results.length === 0 ? (
              <p className="text-xs text-white/70">Looking for matches…</p>
            ) : (
              results.map((item, index) => {
                const key =
                  item.place_id ?? `${item.lat}-${item.lon}-${index}`;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSelectResult(item)}
                    className="w-full text-left px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 text-sm text-white/80 border border-white/10 transition-colors"
                  >
                    {item.display_name}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}