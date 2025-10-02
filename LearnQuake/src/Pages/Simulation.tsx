import Header from '../components/Header';
import { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';

import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import type MapBrowserEvent from 'ol/MapBrowserEvent';
import type { FeatureLike } from 'ol/Feature';

// Add strongly typed interfaces
interface EarthquakeProperties {
  mag?: number;
  place?: string;
  time?: number;
  url?: string;
  [key: string]: unknown;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  boundingbox?: [string, string, string, string];
  class?: string;
  type?: string;
  importance?: number;
}

export default function Simulation() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  const [selected, setSelected] = useState<{
    place?: string;
    mag?: number;
    time?: number;
    url?: string;
  } | null>(null);

  // Search state (remove any)
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const quakeSourceRef = useRef<VectorSource | null>(null);
  const searchMarkerSourceRef = useRef<VectorSource | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new Map({
      target: mapContainerRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: fromLonLat([-122.4194, 37.7749]),
        zoom: 3.2
      })
    });
    mapRef.current = map;

    const quakeSource = new VectorSource();
    quakeSourceRef.current = quakeSource;
    const quakeLayer = new VectorLayer({
      source: quakeSource,
      style: (feature: FeatureLike) => {
        const mag = (feature.get('mag') as number) || 0;
        const radius = 4 + mag * 2;
        let color = '#4ade80';
        if (mag >= 2.5) color = '#fbbf24';
        if (mag >= 4) color = '#fb923c';
        if (mag >= 5.5) color = '#ef4444';
        if (mag >= 7) color = '#9333ea';
        return new Style({
          image: new CircleStyle({
            radius,
            fill: new Fill({ color: color + 'cc' }),
            stroke: new Stroke({ color: '#1f2937', width: 1 })
          })
        });
      }
    });
    map.addLayer(quakeLayer);

    const searchMarkerSource = new VectorSource();
    searchMarkerSourceRef.current = searchMarkerSource;
    const searchMarkerLayer = new VectorLayer({
      source: searchMarkerSource,
      style: new Style({
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({ color: '#2563ebcc' }),
          stroke: new Stroke({ color: '#ffffff', width: 2 })
        })
      })
    });
    map.addLayer(searchMarkerLayer);

    const FEED_URL =
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

    async function loadQuakes() {
      try {
        const res = await fetch(FEED_URL);
        const data = await res.json();
        const features = new GeoJSON().readFeatures(data, {
          featureProjection: 'EPSG:3857'
        });
        quakeSource.clear();
        quakeSource.addFeatures(features);
      } catch (e) {
        console.error('Failed to load earthquakes', e);
      }
    }

    loadQuakes();
    const interval = setInterval(loadQuakes, 300000);

    // Typed click handler
    const handleClick = (evt: MapBrowserEvent<PointerEvent>) => {
      let found = false;
      map.forEachFeatureAtPixel(evt.pixel, feature => {
        const props = feature.getProperties() as EarthquakeProperties;
        if (props.mag !== undefined) {
          setSelected({
            place: props.place,
            mag: props.mag,
            time: props.time,
            url: props.url
          });
          found = true;
          return true;
        }
        return false;
      });
      if (!found) setSelected(null);
    };
    map.on('singleclick', handleClick);

    return () => {
      clearInterval(interval);
      map.un('singleclick', handleClick);
      map.setTarget(undefined);
    };
  }, []);

  async function performSearch(e?: React.FormEvent<HTMLFormElement>) {
    if (e) e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setIsSearching(true);
    setResults([]);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        q
      )}&limit=5`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const data: NominatimResult[] = await res.json();
      setResults(data);
      if (data[0] && mapRef.current) {
        flyToResult(data[0]);
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsSearching(false);
    }
  }

  function flyToResult(item: NominatimResult) {
    if (!mapRef.current) return;
    const lon = parseFloat(item.lon);
    const lat = parseFloat(item.lat);
    if (isNaN(lon) || isNaN(lat)) return;

    const src = searchMarkerSourceRef.current;
    if (src) {
      src.clear();
      const feat = new Feature({
        geometry: new Point(fromLonLat([lon, lat]))
      });
      src.addFeature(feat);
    }

    mapRef.current.getView().animate({
      center: fromLonLat([lon, lat]),
      zoom: 6,
      duration: 1200
    });
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="font-instrument font-bold text-4xl md:text-6xl text-quake-dark-blue mb-8">
            Earthquake Simulation
          </h1>

          <div className="mt-10 text-left">
            {/* Search Bar */}
            <form
              onSubmit={performSearch}
              className="flex flex-col md:flex-row gap-3 mb-4 items-stretch md:items-center"
            >
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search place (e.g. Tokyo, Chile, San Andreas Fault)"
                className="flex-1 border border-quake-light-purple rounded-lg px-4 py-2 font-instrument text-sm focus:outline-none focus:ring-2 focus:ring-quake-light-purple"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="bg-quake-dark-blue text-white font-instrument text-sm px-5 py-2 rounded-lg disabled:opacity-50"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>
            {results.length > 1 && (
              <div className="mb-4 bg-white border border-quake-light-purple rounded-lg p-3 max-h-48 overflow-auto shadow-sm">
                <div className="text-xs font-semibold mb-2 text-gray-700">
                  Results:
                </div>
                <ul className="space-y-1">
                  {results.map((r, i) => (
                    <li key={i}>
                      <button
                        onClick={() => flyToResult(r)}
                        className="w-full text-left text-xs font-instrument bg-white text-black px-3 py-2 rounded-md hover:bg-quake-light-gray hover:underline focus:outline-none focus:ring-2 focus:ring-quake-light-purple"
                      >
                        {r.display_name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <h2 className="font-instrument font-bold text-2xl text-quake-dark-blue mb-4">
              Global Tectonic Map (OpenLayers)
            </h2>
            <div
              ref={mapContainerRef}
              className="rounded-xl border border-quake-light-purple overflow-hidden shadow-sm"
              style={{ width: '100%', height: 480 }}
            />
            <p className="mt-4 text-sm text-gray-500 font-instrument">
              Circles: past 24h earthquakes (USGS). Search uses OpenStreetMap Nominatim.
            </p>

            {selected && (
              <div className="mt-4 p-4 rounded-lg border border-quake-light-purple bg-quake-light-gray font-instrument text-sm">
                <div>
                  <span className="font-semibold">Magnitude:</span>{' '}
                  {selected.mag?.toFixed(1)}
                </div>
                <div>
                  <span className="font-semibold">Location:</span>{' '}
                  {selected.place}
                </div>
                {selected.time && (
                  <div>
                    <span className="font-semibold">Time (UTC):</span>{' '}
                    {new Date(selected.time).toUTCString()}
                  </div>
                )}
                {selected.url && (
                  <a
                    href={selected.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-quake-dark-blue underline"
                  >
                    USGS details
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
