import Header from '../components/Header';
import { useEffect, useRef, useState, useCallback } from 'react';
import { getEndpoint } from '../api/client';
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
import Overlay from 'ol/Overlay';
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

interface AIImpactData {
  estimated_casualties?: string;
  estimated_injured?: string;
  damaged_infrastructure?: string;
  tsunami_risk?: string;
  landslide_risk?: string;
}

interface AISimulationAnalysis {
  circle?: {
    center?: [number, number];
    radius_km?: number | string;
  };
  impact?: AIImpactData;
  [key: string]: unknown;
}

interface HoveredSimulationMeta {
  place?: string;
  magnitude?: number;
  radiusKm?: number;
  pending?: boolean;
  error?: string | null;
}

const MAP_ENDPOINT = getEndpoint('map');

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
  const [isSimAnalyzing, setIsSimAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [overlayReady, setOverlayReady] = useState(false);
  const [hoveredSimAnalysis, setHoveredSimAnalysis] =
    useState<AISimulationAnalysis | null>(null);
  const [hoveredSimMeta, setHoveredSimMeta] =
    useState<HoveredSimulationMeta | null>(null);
  const [simSummaryMeta, setSimSummaryMeta] =
    useState<HoveredSimulationMeta | null>(null);
  const [simSummaryAnalysis, setSimSummaryAnalysis] =
    useState<AISimulationAnalysis | null>(null);

  const quakeSourceRef = useRef<VectorSource | null>(null);
  const searchMarkerSourceRef = useRef<VectorSource | null>(null);
  const simSourceRef = useRef<VectorSource | null>(null);
  const simCoordRef = useRef<[number, number] | null>(null);
  const popupContainerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<Overlay | null>(null);
  const hoveredSimFeatureRef = useRef<FeatureLike | null>(null);

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

    const popupEl = document.createElement('div');
    popupEl.className =
      'pointer-events-none rounded-lg bg-quake-dark-blue text-white text-xs px-3 py-2 shadow-lg border border-white/10 hidden max-w-[240px]';
    popupContainerRef.current = popupEl;

    const popupOverlay = new Overlay({
      element: popupEl,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -12]
    });
    map.addOverlay(popupOverlay);
    popupRef.current = popupOverlay;
    setOverlayReady(true);

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
      if (popupRef.current) {
        map.removeOverlay(popupRef.current);
        const el = popupContainerRef.current;
        if (el?.parentNode) el.parentNode.removeChild(el);
        popupRef.current = null;
        popupContainerRef.current = null;
        setOverlayReady(false);
      }
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
        center: simCoordRef.current,
        place: simPlace || 'Custom Location'
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

    const magnitude = Number(simMag);
    const radiusKm = Number(simRadiusKm);

    setSimSummaryMeta({
      place: simPlace || 'Custom Location',
      magnitude,
      radiusKm,
      pending: true,
      error: null
    });
    setSimSummaryAnalysis(null);

    const point = new Feature({
      geometry: new Point(coord),
      mag: magnitude,
      place: simPlace || 'Custom Location'
    });

    const radiusMeters = radiusKm * 1000;
    const polygon = createGeodesicPolygon(coord, radiusMeters);
    const circle = new Feature({
      geometry: polygon,
      coverage: true,
      mag: magnitude,
      radius: radiusMeters,
      center: coord,
      place: simPlace || 'Custom Location'
    });
    circle.set('analysis', null);
    circle.set('analysisError', null);

    src.addFeatures([point, circle]);

    if (mapRef.current) {
      mapRef.current.getView().fit(polygon.getExtent(), {
        padding: [80, 80, 80, 80],
        maxZoom: 12,
        duration: 600
      });
    }

    void requestSimulationAnalysis(circle, coord, magnitude, radiusKm);
  }

  const renderAnalysisPopup = useCallback((feature: FeatureLike) => {
    const container = popupContainerRef.current;
    if (!container) return;

    container.replaceChildren();

    const wrapper = document.createElement('div');
    wrapper.className = 'space-y-1';

    const title = document.createElement('div');
    title.className = 'font-semibold uppercase tracking-wide text-[10px] text-white/80';
    title.textContent = 'AI Impact Analysis';
    wrapper.appendChild(title);

    const pending = feature.get('analysisPending') as boolean | undefined;
    const errorMsg = feature.get('analysisError') as string | undefined;
    const analysis = feature.get('analysis') as AISimulationAnalysis | undefined;

    const body = document.createElement('div');
    body.className = 'text-[11px] leading-tight';

    if (pending) {
      body.textContent = 'Generating analysis…';
    } else if (errorMsg) {
      body.textContent = errorMsg;
    } else if (analysis?.impact) {
      const impact = analysis.impact;
      const list = document.createElement('ul');
      list.className = 'space-y-[2px]';
      const rows: Array<[string, string | undefined]> = [
        ['Estimated casualties', impact.estimated_casualties],
        ['Estimated injured', impact.estimated_injured],
        ['Damaged infrastructure', impact.damaged_infrastructure],
        ['Tsunami risk', impact.tsunami_risk],
        ['Landslide risk', impact.landslide_risk]
      ];
      rows.forEach(([label, value]) => {
        const item = document.createElement('li');
        item.textContent = `${label}: ${value ?? 'unknown'}`;
        list.appendChild(item);
      });
      body.appendChild(list);
    } else {
      body.textContent = 'No analysis available.';
    }

    wrapper.appendChild(body);

    const radius = analysis?.circle?.radius_km;
    if (radius !== undefined) {
      const footer = document.createElement('div');
      footer.className = 'text-[10px] text-white/70 pt-1';
      const radiusText =
        typeof radius === 'number' ? radius.toFixed(1) : String(radius);
      footer.textContent = `Radius: ${radiusText} km`;
      wrapper.appendChild(footer);
    }

    container.appendChild(wrapper);
  }, []);

  const requestSimulationAnalysis = useCallback(
    async (
      coverageFeature: Feature<Polygon>,
      coord3857: [number, number],
      magnitude: number,
      radiusKm: number
    ) => {
      setIsSimAnalyzing(true);
      setAnalysisError(null);
      coverageFeature.set('analysisPending', true);
      coverageFeature.set('analysis', null);
      coverageFeature.set('analysisError', null);
      setSimSummaryMeta(prev =>
        prev
          ? { ...prev, pending: true, error: null }
          : {
              place: simPlace || 'Custom Location',
              magnitude,
              radiusKm,
              pending: true,
              error: null
            }
      );
      setSimSummaryAnalysis(null);

      try {
        const [lon, lat] = toLonLat(coord3857);
  const res = await fetch(MAP_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            place: simPlace || 'Custom Location',
            magnitude,
            areaCoverage: radiusKm,
            coordinates: [lon, lat]
          })
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const payload = (await res.json()) as {
          analysis?: AISimulationAnalysis;
        };

        if (payload?.analysis) {
          coverageFeature.set('analysis', payload.analysis);
          setSimSummaryAnalysis(payload.analysis);
          setSimSummaryMeta(prev =>
            prev
              ? { ...prev, pending: false, error: null }
              : {
                  place: simPlace || 'Custom Location',
                  magnitude,
                  radiusKm,
                  pending: false,
                  error: null
                }
          );
        } else {
          coverageFeature.set('analysisError', 'No AI analysis returned.');
          setAnalysisError('AI did not return analysis.');
          setSimSummaryMeta(prev =>
            prev ? { ...prev, pending: false, error: 'No AI analysis returned.' } : null
          );
        }
      } catch (err) {
        console.error('Failed to fetch AI analysis', err);
        coverageFeature.set('analysisError', 'Failed to fetch AI analysis.');
        setAnalysisError('Failed to fetch AI analysis.');
        setSimSummaryMeta(prev =>
          prev ? { ...prev, pending: false, error: 'Failed to fetch AI analysis.' } : null
        );
      } finally {
        coverageFeature.set('analysisPending', false);
        if (hoveredSimFeatureRef.current === coverageFeature) {
          const radiusMeters =
            (coverageFeature.get('radius') as number | undefined) ?? undefined;
          setHoveredSimMeta({
            place:
              (coverageFeature.get('place') as string | undefined) ??
              'Simulated Event',
            magnitude: coverageFeature.get('mag') as number | undefined,
            radiusKm: radiusMeters ? radiusMeters / 1000 : undefined,
            pending: coverageFeature.get('analysisPending') as boolean | undefined,
            error:
              (coverageFeature.get('analysisError') as string | undefined) ?? null
          });
          setHoveredSimAnalysis(
            (coverageFeature.get('analysis') as AISimulationAnalysis | null) ?? null
          );
        }
        setIsSimAnalyzing(false);
      }
    },
    [simPlace]
  );

  useEffect(() => {
    if (!overlayReady) return;

    const map = mapRef.current;
    const overlay = popupRef.current;
    const container = popupContainerRef.current;
    if (!map || !overlay || !container) return;

    const handleMove = (evt: MapBrowserEvent<PointerEvent>) => {
      let targetFeature: FeatureLike | null = null;
      map.forEachFeatureAtPixel(evt.pixel, feature => {
        if (feature.get('coverage')) {
          targetFeature = feature;
          return true;
        }
        return false;
      });

      const targetElement = map.getTargetElement();

      if (targetFeature) {
        hoveredSimFeatureRef.current = targetFeature;
        const radiusMeters = targetFeature.get('radius') as number | undefined;
        setHoveredSimMeta({
          place:
            (targetFeature.get('place') as string | undefined) ??
            'Simulated Event',
          magnitude: targetFeature.get('mag') as number | undefined,
          radiusKm: radiusMeters ? radiusMeters / 1000 : undefined,
          pending: targetFeature.get('analysisPending') as boolean | undefined,
          error:
            (targetFeature.get('analysisError') as string | undefined) ?? null
        });
        setHoveredSimAnalysis(
          (targetFeature.get('analysis') as AISimulationAnalysis | null) ?? null
        );
        renderAnalysisPopup(targetFeature);
        overlay.setPosition(evt.coordinate);
        container.classList.remove('hidden');
        if (targetElement) targetElement.style.cursor = 'pointer';
      } else {
        hoveredSimFeatureRef.current = null;
        setHoveredSimMeta(null);
        setHoveredSimAnalysis(null);
        overlay.setPosition(undefined);
        container.classList.add('hidden');
        if (targetElement) targetElement.style.cursor = '';
      }
    };

    const handleLeave = () => {
      overlay.setPosition(undefined);
      container.classList.add('hidden');
      const targetElement = map.getTargetElement();
      if (targetElement) targetElement.style.cursor = '';
      hoveredSimFeatureRef.current = null;
      setHoveredSimMeta(null);
      setHoveredSimAnalysis(null);
    };

    map.on('pointermove', handleMove);
    const viewport = map.getViewport();
    viewport.addEventListener('mouseleave', handleLeave);

    return () => {
      map.un('pointermove', handleMove);
      viewport.removeEventListener('mouseleave', handleLeave);
    };
  }, [overlayReady, renderAnalysisPopup]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <div className="relative hidden md:flex md:flex-col md:w-80 lg:w-96 p-4 border-r border-white/10 bg-quake-dark-blue overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Earthquake Simulator</h2>
          <form
            onSubmit={e => {
              e.preventDefault();
              commitSimulatedEvent();
            }}
            className="space-y-4"
          >
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
                onChange={e => setSimPlace(e.target.value)}
                disabled={pickingSimLocation}
                className="mt-1 block w-full p-2 text-sm rounded-md bg-white/5 border border-white/10 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter a location"
              />
            </div>
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
                onChange={e => {
                  const value = e.target.value;
                  setSimMag(value === '' ? '' : Number(value));
                }}
                className="mt-1 block w-full p-2 text-sm rounded-md bg-white/5 border border-white/10 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter magnitude (e.g., 5.0)"
                min="0"
                step="0.1"
              />
            </div>
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
                onChange={e => {
                  const value = e.target.value;
                  setSimRadiusKm(value === '' ? '' : Number(value));
                }}
                className="mt-1 block w-full p-2 text-sm rounded-md bg-white/5 border border-white/10 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter radius in kilometers"
                min="0"
                step="0.1"
              />
            </div>
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Pick Location
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Picking Mode
                  </>
                )}
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-2
                bg-quake-red-600 text-white hover:bg-quake-red-700 disabled:opacity-50"
                disabled={
                  isSimAnalyzing ||
                  !simPlace ||
                  simMag === '' ||
                  simRadiusKm === ''
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Simulate Event
              </button>
            </div>
            {isSimAnalyzing && (
              <p className="text-xs text-gray-300 font-instrument">
                Generating AI impact analysis…
              </p>
            )}
            {analysisError && !isSimAnalyzing && (
              <p className="text-xs text-red-400 font-instrument">
                {analysisError}
              </p>
            )}
          </form>

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
                    <strong>Time:</strong>{' '}
                    {new Date(selected.time).toLocaleString()}
                  </div>
                  <div className="text-sm text-white/80">
                    <strong>Details:</strong>{' '}
                    <a
                      href={selected.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      USGS Event Page
                    </a>
                  </div>
                </>
              ) : (
                <div className="text-sm text-white/70">
                  No event selected. Click on an earthquake on the map to see details.
                </div>
              )}

              <div className="pt-3 border-t border-white/10">
                <h4 className="text-sm font-semibold text-white mb-2">Simulated Impact (AI)</h4>
                {simSummaryMeta ? (
                  <div className="space-y-2 text-sm text-white/80">
                    {simSummaryMeta.place && (
                      <p>
                        <span className="text-white/60">Location:</span> {simSummaryMeta.place}
                      </p>
                    )}
                    {simSummaryMeta.magnitude !== undefined && (
                      <p>
                        <span className="text-white/60">Magnitude:</span> {simSummaryMeta.magnitude}
                      </p>
                    )}
                    {simSummaryMeta.radiusKm !== undefined && (
                      <p>
                        <span className="text-white/60">Radius:</span>{' '}
                        {simSummaryMeta.radiusKm.toFixed(1)} km
                      </p>
                    )}
                    {simSummaryMeta.pending ? (
                      <p className="text-white/70">Generating AI impact analysis…</p>
                    ) : simSummaryMeta.error ? (
                      <p className="text-red-400">{simSummaryMeta.error}</p>
                    ) : simSummaryAnalysis?.impact ? (
                      <ul className="space-y-1">
                        <li>
                          Estimated casualties:{' '}
                          {simSummaryAnalysis.impact.estimated_casualties ?? 'unknown'}
                        </li>
                        <li>
                          Estimated injured:{' '}
                          {simSummaryAnalysis.impact.estimated_injured ?? 'unknown'}
                        </li>
                        <li>
                          Damaged infrastructure:{' '}
                          {simSummaryAnalysis.impact.damaged_infrastructure ?? 'unknown'}
                        </li>
                        <li>
                          Tsunami risk:{' '}
                          {simSummaryAnalysis.impact.tsunami_risk ?? 'unknown'}
                        </li>
                        <li>
                          Landslide risk:{' '}
                          {simSummaryAnalysis.impact.landslide_risk ?? 'unknown'}
                        </li>
                      </ul>
                    ) : (
                      <p className="text-white/70">No AI analysis available.</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-white/70">
                    Run a simulation to generate AI impact estimates.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-white/70">
              Data from USGS Earthquake Hazards Program
            </p>
          </div>
        </div>

        <div className="flex-1">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
