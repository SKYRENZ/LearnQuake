import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type {
  Dispatch,
  FormEvent,
  MutableRefObject,
  SetStateAction,
} from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Polygon, { circular as polygonCircular } from 'ol/geom/Polygon';
import type Geometry from 'ol/geom/Geometry';
import Overlay from 'ol/Overlay';
import { fromLonLat, toLonLat } from 'ol/proj';
import type MapBrowserEvent from 'ol/MapBrowserEvent';
import SimulationSearchPanel from './SimulationSearchPanel';
import type { NominatimResult, SelectedSimulationEvent } from './types';
import type {
  SimulationAnalysis,
  SimulationMeta,
} from '../../hooks/useSimulationAnalysis';
import {
  addPointerMoveListener,
  addSingleClickListener,
  findVectorFeatureAtPixel,
  removeMapEventListener,
} from '../../utils/openlayers';

interface SimulationMapProps {
  simPlace: string;
  simMag: number | '';
  simRadiusKm: number | '';
  setSimPlace: Dispatch<SetStateAction<string>>;
  pickingSimLocation: boolean;
  setPickingSimLocation: Dispatch<SetStateAction<boolean>>;
  setSelected: Dispatch<SetStateAction<SelectedSimulationEvent | null>>;
  setSimSummaryMeta: Dispatch<SetStateAction<SimulationMeta | null>>;
  setSimSummaryAnalysis: Dispatch<SetStateAction<SimulationAnalysis | null>>;
  setHoveredSimMeta: Dispatch<SetStateAction<SimulationMeta | null>>;
  setHoveredSimAnalysis: Dispatch<SetStateAction<SimulationAnalysis | null>>;
  requestSimulationAnalysis: (
    coverageFeature: Feature<Polygon>,
    coord3857: [number, number],
    magnitude: number,
    radiusKm: number,
  ) => Promise<void>;
  hoveredSimFeatureRef: MutableRefObject<Feature<Geometry> | null>;
}

export interface SimulationMapHandle {
  commitSimulation: () => void;
}

interface EarthquakeProperties {
  mag?: number;
  place?: string;
  time?: number;
  url?: string;
  [key: string]: unknown;
}

const FEED_URL =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

const SimulationMap = forwardRef<SimulationMapHandle, SimulationMapProps>(
  (
    {
      simPlace,
      simMag,
      simRadiusKm,
      setSimPlace,
      pickingSimLocation,
      setPickingSimLocation,
      setSelected,
      setSimSummaryMeta,
      setSimSummaryAnalysis,
      setHoveredSimMeta,
      setHoveredSimAnalysis,
      requestSimulationAnalysis,
      hoveredSimFeatureRef,
    },
    ref,
  ) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<Map | null>(null);
    const quakeSourceRef = useRef<VectorSource | null>(null);
    const searchMarkerSourceRef = useRef<VectorSource | null>(null);
    const simSourceRef = useRef<VectorSource | null>(null);
    const simCoordRef = useRef<[number, number] | null>(null);
    const popupContainerRef = useRef<HTMLDivElement | null>(null);
    const popupRef = useRef<Overlay | null>(null);

    const [overlayReady, setOverlayReady] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<NominatimResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const createGeodesicPolygon = useCallback(
      (center3857: [number, number], radiusMeters: number) => {
        const centerLonLat = toLonLat(center3857);
        const poly = polygonCircular(centerLonLat, radiusMeters, 128);
        poly.transform('EPSG:4326', 'EPSG:3857');
        return poly;
      },
      [],
    );

    const refreshSimPreview = useCallback(() => {
      const src = simSourceRef.current;
      if (!src || !simCoordRef.current) return;

      src.clear();

      const pointFeature = new Feature({
        geometry: new Point(simCoordRef.current),
        mag: simMag || undefined,
        temp: true,
      });
      src.addFeature(pointFeature);

      if (simMag !== '' && simRadiusKm !== '') {
        const radiusMeters = Number(simRadiusKm) * 1000;
        const polygon = createGeodesicPolygon(simCoordRef.current, radiusMeters);
        const circleFeature = new Feature({
          geometry: polygon,
          coverage: true,
          mag: simMag,
          radius: radiusMeters,
          center: simCoordRef.current,
          place: simPlace || 'Custom Location',
        });
        src.addFeature(circleFeature);
      }
    }, [simMag, simRadiusKm, simPlace, createGeodesicPolygon]);

    const reverseGeocode = useCallback(
      async (coord3857: [number, number]) => {
        const [lon, lat] = toLonLat(coord3857);
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
          const res = await fetch(url, {
            headers: {
              Accept: 'application/json',
              'User-Agent': 'LearnQuake Demo (educational)',
            },
          });
          const data = await res.json();
          if (data?.display_name) setSimPlace(data.display_name);
        } catch {
          /* ignore */
        }
      },
      [setSimPlace],
    );

    const renderAnalysisPopup = useCallback((feature: Feature<Geometry>) => {
      const container = popupContainerRef.current;
      if (!container) return;

      container.replaceChildren();

      const wrapper = document.createElement('div');
      wrapper.className = 'space-y-1';

      const title = document.createElement('div');
      title.className =
        'font-semibold uppercase tracking-wide text-[10px] text-white/80';
      title.textContent = 'AI Impact Analysis';
      wrapper.appendChild(title);

      const pending = feature.get('analysisPending') as boolean | undefined;
      const errorMsg = feature.get('analysisError') as string | undefined;
      const analysis = feature.get('analysis') as SimulationAnalysis | undefined;

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
          ['Landslide risk', impact.landslide_risk],
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

    const flyToResult = useCallback((item: NominatimResult) => {
      if (!mapRef.current) return;

      const lon = parseFloat(item.lon);
      const lat = parseFloat(item.lat);
      if (Number.isNaN(lon) || Number.isNaN(lat)) return;

      const source = searchMarkerSourceRef.current;
      if (source) {
        source.clear();
        source.addFeature(
          new Feature({
            geometry: new Point(fromLonLat([lon, lat])),
          }),
        );
      }

      mapRef.current.getView().animate({
        center: fromLonLat([lon, lat]),
        zoom: 6,
        duration: 1200,
      });
    }, []);

    const performSearch = useCallback(
      async (event?: FormEvent<HTMLFormElement>) => {
        if (event) event.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) return;

        setIsSearching(true);
        setResults([]);

        try {
          const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            trimmed,
          )}&limit=5`;
          const res = await fetch(url, {
            headers: { Accept: 'application/json' },
          });
          const data: NominatimResult[] = await res.json();
          setResults(data);
          if (data[0]) {
            flyToResult(data[0]);
          }
        } catch (error) {
          console.error('Search failed', error);
        } finally {
          setIsSearching(false);
        }
      },
      [query, flyToResult],
    );

    const handleSelectSearchResult = useCallback(
      (item: NominatimResult) => {
        setSimPlace(item.display_name);
        setQuery(item.display_name);
        setResults([]);
        flyToResult(item);
      },
      [flyToResult, setSimPlace],
    );

    useEffect(() => {
      if (!mapContainerRef.current || mapRef.current) return;

      const map = new Map({
        target: mapContainerRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: fromLonLat([-122.4194, 37.7749]),
          zoom: 3.2,
        }),
      });
      mapRef.current = map;

      const quakeSource = new VectorSource();
      quakeSourceRef.current = quakeSource;
      map.addLayer(
        new VectorLayer({
          source: quakeSource,
          style: featureLike => {
            const feature = featureLike as Feature<Geometry>;
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
                fill: new Fill({ color: `${color}cc` }),
                stroke: new Stroke({ color: '#1f2937', width: 1 }),
              }),
            });
          },
        }),
      );

      const searchMarkerSource = new VectorSource();
      searchMarkerSourceRef.current = searchMarkerSource;
      map.addLayer(
        new VectorLayer({
          source: searchMarkerSource,
          style: new Style({
            image: new CircleStyle({
              radius: 8,
              fill: new Fill({ color: '#2563ebcc' }),
              stroke: new Stroke({ color: '#ffffff', width: 2 }),
            }),
          }),
        }),
      );

      const simSource = new VectorSource();
      simSourceRef.current = simSource;
      map.addLayer(
        new VectorLayer({
          source: simSource,
          style: (featureLike, resolution) => {
            const feature = featureLike as Feature<Geometry>;
            if (feature.get('coverage')) {
              const polygon = feature.getGeometry() as Polygon;
              const center =
                (feature.get('center') as [number, number]) ??
                polygon.getInteriorPoint().getCoordinates();
              const radiusMeters = (feature.get('radius') as number) ?? 0;
              const radiusPx = radiusMeters
                ? Math.max(60, Math.min(radiusMeters / resolution, 320))
                : 120;

              return [
                new Style({
                  geometry: polygon,
                  stroke: new Stroke({
                    color: '#dc2626',
                    width: 3,
                    lineDash: [6, 4],
                  }),
                  fill: new Fill({ color: 'rgba(220,38,38,0.15)' }),
                  zIndex: 5,
                }),
                new Style({
                  geometry: () => new Point(center),
                  image: new CircleStyle({
                    radius: radiusPx,
                    stroke: new Stroke({ color: '#dc2626', width: 2 }),
                    fill: new Fill({ color: 'rgba(220,38,38,0.04)' }),
                  }),
                  zIndex: 6,
                }),
              ];
            }
            const magnitude = feature.get('mag') as number | undefined;
            const markerRadius = 6 + (magnitude ? magnitude * 2 : 0);
            return new Style({
              image: new CircleStyle({
                radius: markerRadius,
                fill: new Fill({ color: '#dc2626' }),
                stroke: new Stroke({ color: '#ffffff', width: 1 }),
              }),
              zIndex: 10,
            });
          },
        }),
      );

      const popupElement = document.createElement('div');
      popupElement.className =
        'pointer-events-none rounded-lg bg-quake-dark-blue text-white text-xs px-3 py-2 shadow-lg border border-white/10 hidden max-w-[240px]';
      popupContainerRef.current = popupElement;

      const popupOverlay = new Overlay({
        element: popupElement,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -12],
      });
      map.addOverlay(popupOverlay);
      popupRef.current = popupOverlay;
      setOverlayReady(true);

      async function loadQuakes() {
        try {
          const res = await fetch(FEED_URL);
          const data = await res.json();
          const features = new GeoJSON().readFeatures(data, {
            featureProjection: 'EPSG:3857',
          });
          quakeSource.clear();
          quakeSource.addFeatures(features);
        } catch (error) {
          console.error('Failed to load earthquakes', error);
        }
      }

      loadQuakes();
      const interval = setInterval(loadQuakes, 300000);

      return () => {
        clearInterval(interval);
        if (popupRef.current) {
          map.removeOverlay(popupRef.current);
          const element = popupContainerRef.current;
          if (element?.parentNode) {
            element.parentNode.removeChild(element);
          }
          popupRef.current = null;
          popupContainerRef.current = null;
          setOverlayReady(false);
        }
        map.setTarget(undefined);
        mapRef.current = null;
      };
    }, []);

    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;

      const handleClick = (event: MapBrowserEvent<UIEvent>) => {
        const pointerEvent = event as MapBrowserEvent<PointerEvent>;
        if (pickingSimLocation) {
          simCoordRef.current = pointerEvent.coordinate as [number, number];
          reverseGeocode(pointerEvent.coordinate as [number, number]);
          refreshSimPreview();
          setPickingSimLocation(false);
          return;
        }

        const quakeFeature = findVectorFeatureAtPixel(
          map,
          pointerEvent.pixel,
          feature => {
            const props = feature.getProperties() as EarthquakeProperties;
            return (
              props.mag !== undefined &&
              !feature.get('coverage') &&
              !feature.get('temp')
            );
          },
        );

        if (quakeFeature) {
          const props = quakeFeature.getProperties() as EarthquakeProperties;
          setSelected({
            place: props.place,
            mag: props.mag,
            time: props.time,
            url: props.url,
          });
        } else {
          setSelected(null);
        }
      };

      const key = addSingleClickListener(map, handleClick);
      return () => {
        removeMapEventListener(key);
      };
    }, [
      pickingSimLocation,
      refreshSimPreview,
      reverseGeocode,
      setPickingSimLocation,
      setSelected,
    ]);

    useEffect(() => {
      if (!simCoordRef.current) return;
      refreshSimPreview();
    }, [refreshSimPreview]);

    useEffect(() => {
      if (!overlayReady) return;

      const map = mapRef.current;
      const overlay = popupRef.current;
      const container = popupContainerRef.current;
      if (!map || !overlay || !container) return;

      const handleMove = (event: MapBrowserEvent<UIEvent>) => {
        const pointerEvent = event as MapBrowserEvent<PointerEvent>;
        const simFeature = findVectorFeatureAtPixel(
          map,
          pointerEvent.pixel,
          feature => Boolean(feature.get('coverage')),
        );

        const targetElement = map.getTargetElement();

        if (simFeature) {
          hoveredSimFeatureRef.current = simFeature;
          const radiusMeters = simFeature.get('radius') as number | undefined;
          setHoveredSimMeta({
            place:
              (simFeature.get('place') as string | undefined) ??
              'Simulated Event',
            magnitude: simFeature.get('mag') as number | undefined,
            radiusKm: radiusMeters ? radiusMeters / 1000 : undefined,
            pending: simFeature.get('analysisPending') as boolean | undefined,
            error:
              (simFeature.get('analysisError') as string | undefined) ?? null,
          });
          setHoveredSimAnalysis(
            (simFeature.get('analysis') as SimulationAnalysis | null) ?? null,
          );
          renderAnalysisPopup(simFeature);
          overlay.setPosition(pointerEvent.coordinate);
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

      const moveKey = addPointerMoveListener(map, handleMove);

      const handleLeave = () => {
        overlay.setPosition(undefined);
        container.classList.add('hidden');
        const targetElement = map.getTargetElement();
        if (targetElement) targetElement.style.cursor = '';
        hoveredSimFeatureRef.current = null;
        setHoveredSimMeta(null);
        setHoveredSimAnalysis(null);
      };

      const viewport = map.getViewport();
      viewport.addEventListener('mouseleave', handleLeave);

      return () => {
        removeMapEventListener(moveKey);
        viewport.removeEventListener('mouseleave', handleLeave);
      };
    }, [
      overlayReady,
      hoveredSimFeatureRef,
      renderAnalysisPopup,
      setHoveredSimAnalysis,
      setHoveredSimMeta,
    ]);

    const commitSimulatedEvent = useCallback(() => {
      const source = simSourceRef.current;
      if (!source || !simCoordRef.current || simMag === '' || simRadiusKm === '')
        return;

      const coord = simCoordRef.current;
      source.clear();

      const magnitude = Number(simMag);
      const radiusKm = Number(simRadiusKm);

      setSimSummaryMeta({
        place: simPlace || 'Custom Location',
        magnitude,
        radiusKm,
        pending: true,
        error: null,
      });
      setSimSummaryAnalysis(null);

      const point = new Feature({
        geometry: new Point(coord),
        mag: magnitude,
        place: simPlace || 'Custom Location',
      });

      const radiusMeters = radiusKm * 1000;
      const polygon = createGeodesicPolygon(coord, radiusMeters);
      const circle = new Feature({
        geometry: polygon,
        coverage: true,
        mag: magnitude,
        radius: radiusMeters,
        center: coord,
        place: simPlace || 'Custom Location',
      });
      circle.set('analysis', null);
      circle.set('analysisError', null);

      source.addFeatures([point, circle]);

      if (mapRef.current) {
        mapRef.current.getView().fit(polygon.getExtent(), {
          padding: [80, 80, 80, 80],
          maxZoom: 12,
          duration: 600,
        });
      }

      void requestSimulationAnalysis(circle, coord, magnitude, radiusKm);
    }, [
      simMag,
      simRadiusKm,
      simPlace,
      createGeodesicPolygon,
      requestSimulationAnalysis,
      setSimSummaryAnalysis,
      setSimSummaryMeta,
    ]);

    useImperativeHandle(
      ref,
      () => ({
        commitSimulation: commitSimulatedEvent,
      }),
      [commitSimulatedEvent],
    );

    return (
      <div className="relative w-full h-full">
        <SimulationSearchPanel
          query={query}
          setQuery={setQuery}
          isSearching={isSearching}
          results={results}
          onSearch={performSearch}
          onSelectResult={handleSelectSearchResult}
        />
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>
    );
  },
);

SimulationMap.displayName = 'SimulationMap';

export default SimulationMap;