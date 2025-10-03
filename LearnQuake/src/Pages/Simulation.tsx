import Header from '../components/Header';
import { useEffect, useRef, useState, useCallback } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';

import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Polygon, { circular as polygonCircular } from 'ol/geom/Polygon';
import type MapBrowserEvent from 'ol/MapBrowserEvent';
import type { FeatureLike } from 'ol/Feature';
import { unByKey } from 'ol/Observable';

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

  // Simulation form state
  const [simPlace, setSimPlace] = useState('');
  const [simMag, setSimMag] = useState<number | ''>('');
  const [simRadiusKm, setSimRadiusKm] = useState<number | ''>('');
  const [pickingSimLocation, setPickingSimLocation] = useState(false);

  const quakeSourceRef = useRef<VectorSource | null>(null);
  const searchMarkerSourceRef = useRef<VectorSource | null>(null);
  const simSourceRef = useRef<VectorSource | null>(null);
  const simCoordRef = useRef<[number, number] | null>(null);

  // Init map only once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

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

    const simSource = new VectorSource();
    simSourceRef.current = simSource;
    const simLayer = new VectorLayer({
      source: simSource,
      style: (feature, resolution) => {
        if (feature.get('coverage')) {
          const polygon = feature.getGeometry() as Polygon;
          const center = (feature.get('center') as [number, number]) ?? polygon.getInteriorPoint().getCoordinates();
          const radiusMeters = (feature.get('radius') as number) ?? 0;
          const radiusPx = radiusMeters
            ? Math.max(60, Math.min(radiusMeters / resolution, 320))
            : 120;

          return [
            new Style({
              geometry: polygon,
              stroke: new Stroke({ color: '#dc2626', width: 3, lineDash: [6, 4] }),
              fill: new Fill({ color: 'rgba(220,38,38,0.15)' }),
              zIndex: 5
            }),
            new Style({
              geometry: () => new Point(center),
              image: new CircleStyle({
                radius: radiusPx,
                stroke: new Stroke({ color: '#dc2626', width: 2 }),
                fill: new Fill({ color: 'rgba(220,38,38,0.04)' })
              }),
              zIndex: 6
            })
          ];
        }
        const m = feature.get('mag') as number | undefined;
        const r = 6 + (m ? m * 2 : 0);
        return new Style({
          image: new CircleStyle({
            radius: r,
            fill: new Fill({ color: '#dc2626' }),
            stroke: new Stroke({ color: '#ffffff', width: 1 })
          }),
          zIndex: 10 // draw above coverage circle
        });
      }
    });
    map.addLayer(simLayer);

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

    return () => {
      clearInterval(interval);
      map.setTarget(undefined);
      mapRef.current = null; // allow re-initialisation after refresh
    };
  }, []); // no deps → runs once

  const createGeodesicPolygon = useCallback(
    (center3857: [number, number], radiusMeters: number) => {
      const centerLonLat = toLonLat(center3857);
      const poly = polygonCircular(centerLonLat, radiusMeters, 128);
      poly.transform('EPSG:4326', 'EPSG:3857');
      return poly;
    },
    []
  );

  // Stable preview builder (dependencies: mag, radius)
  const refreshSimPreview = useCallback(() => {
    const src = simSourceRef.current;
    if (!src || !simCoordRef.current) return;
    src.clear();
    const pt = new Feature({
      geometry: new Point(simCoordRef.current),
      mag: simMag || undefined,
      temp: true
    });
    src.addFeature(pt);
    if (simMag !== '' && simRadiusKm !== '') {
      const radiusMeters = Number(simRadiusKm) * 1000;
      const polygon = createGeodesicPolygon(simCoordRef.current, radiusMeters);
      const circle = new Feature({
        geometry: polygon,
        coverage: true,
        mag: simMag,
        radius: radiusMeters,
        center: simCoordRef.current
      });
      src.addFeature(circle);
    }
  }, [simMag, simRadiusKm, createGeodesicPolygon]);

  async function reverseGeocode(coord3857: [number, number]) {
    const [lon, lat] = toLonLat(coord3857);
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'LearnQuake Demo (educational)'
        }
      });
      const data = await res.json();
      if (data?.display_name) setSimPlace(data.display_name);
    } catch {
      /* ignore */
    }
  }

  // Bind (or re-bind) click handler when relevant state changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleClick = (evt: MapBrowserEvent<PointerEvent>) => {
      if (pickingSimLocation) {
        simCoordRef.current = evt.coordinate as [number, number];
        reverseGeocode(evt.coordinate as [number, number]);
        refreshSimPreview();
        setPickingSimLocation(false);
        return;
      }
      let found = false;
      map.forEachFeatureAtPixel(evt.pixel, feature => {
        const props = feature.getProperties() as EarthquakeProperties;
        if (
          props.mag !== undefined &&
          !feature.get('coverage') &&
            !feature.get('temp')
        ) {
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

    const key = map.on('singleclick', handleClick);
    return () => {
      unByKey(key);
    };
  }, [pickingSimLocation, refreshSimPreview]); // refreshSimPreview covers mag & radius

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

  // Update preview when mag or radius change
  useEffect(() => {
    if (!simCoordRef.current) return;
    refreshSimPreview();
  }, [refreshSimPreview]);

  function commitSimulatedEvent() {
    const src = simSourceRef.current;
    if (!src || !simCoordRef.current || simMag === '' || simRadiusKm === '') return;

    const coord = simCoordRef.current;
    src.clear();

    const point = new Feature({
      geometry: new Point(coord),
      mag: simMag,
      place: simPlace || 'Custom Location'
    });

    const radiusMeters = Number(simRadiusKm) * 1000;
    const polygon = createGeodesicPolygon(coord, radiusMeters);
    const circle = new Feature({
      geometry: polygon,
      coverage: true,
      mag: simMag,
      radius: radiusMeters,
      center: coord
    });

    src.addFeatures([point, circle]);

    if (mapRef.current) {
      mapRef.current.getView().fit(circle.getGeometry().getExtent(), {
        padding: [80, 80, 80, 80],
        maxZoom: 12,
        duration: 600
      });
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="text-left">
          <h1 className="font-instrument font-bold text-2xl md:text-4xl text-quake-dark-blue mb-8">
            Earthquake Simulation
          </h1>

          <div className="mt-10 text-left">
            {/* Search Bar */}
            <form
              onSubmit={performSearch}
              className="w-full max-w-3xl flex flex-col md:flex-row gap-3 mb-4 items-stretch md:items-center"
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
            <div className="mb-6 space-y-3 font-instrument text-sm">
              <div className="flex flex-wrap gap-3 items-end">
                <button
                  type="button"
                  onClick={() => setPickingSimLocation(true)}
                  className="px-3 py-2 rounded bg-quake-dark-blue text-white disabled:opacity-40"
                  disabled={pickingSimLocation}
                >
                  {pickingSimLocation ? 'Click map…' : 'Pick Location'}
                </button>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold">Place</label>
                  <input
                    value={simPlace}
                    onChange={e => setSimPlace(e.target.value)}
                    placeholder="Pick or type"
                    className="border rounded px-2 py-1"
                    style={{ minWidth: 220 }}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold">Magnitude</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={simMag}
                    onChange={e => setSimMag(e.target.value === '' ? '' : Number(e.target.value))}
                    className="border rounded px-2 py-1 w-24"
                  />
                </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold">Radius (km)</label>
                    <input
                      type="number"
                      min="1"
                      value={simRadiusKm}
                      onChange={e => setSimRadiusKm(e.target.value === '' ? '' : Number(e.target.value))}
                      className="border rounded px-2 py-1 w-24"
                    />
                  </div>
                <button
                  type="button"
                  onClick={commitSimulatedEvent}
                  disabled={!simCoordRef.current || simMag === '' || simRadiusKm === ''}
                  className="px-3 py-2 rounded bg-green-600 text-white disabled:opacity-40"
                >
                  Add Simulated Event
                </button>
              </div>
              <p className="text-gray-500">
                Pick location, enter magnitude & radius to visualize a hypothetical event.
              </p>
            </div>
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
