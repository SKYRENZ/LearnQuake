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
import Heatmap from 'ol/layer/Heatmap';
import { Text } from 'ol/style';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { GeoJSON } from 'ol/format';
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
import MapBrowserEventType from 'ol/MapBrowserEventType';
import Icon from 'ol/style/Icon';

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
const FAULT_LINES_URL =
  'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';

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
    const faultLineSourceRef = useRef<VectorSource | null>(null);
    const faultLineLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
    const heatmapLayerRef = useRef<Heatmap | null>(null);
    const heatmapSourceRef = useRef<VectorSource | null>(null);
    const volcanoSourceRef = useRef<VectorSource | null>(null);
    const volcanoLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
    const tsunamiSourceRef = useRef<VectorSource | null>(null);
    const tsunamiLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
    const seismicStationSourceRef = useRef<VectorSource | null>(null);
    const seismicStationLayerRef = useRef<VectorLayer<VectorSource> | null>(null);

    const [overlayReady, setOverlayReady] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<NominatimResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [layersDrawerOpen, setLayersDrawerOpen] = useState(true); // Add this
    const [faultLinesVisible, setFaultLinesVisible] = useState(false);
    const [faultLinesLoading, setFaultLinesLoading] = useState(false);
    const [faultLinesError, setFaultLinesError] = useState<string | null>(null);
    const [faultLinesLoaded, setFaultLinesLoaded] = useState(false);
    const [heatmapVisible, setHeatmapVisible] = useState(false);
    const [heatmapLoading, setHeatmapLoading] = useState(false);
    const [heatmapLoaded, setHeatmapLoaded] = useState(false);
    const [volcanoesVisible, setVolcanoesVisible] = useState(false);
    const [volcanoesLoading, setVolcanoesLoading] = useState(false);
    const [volcanoesLoaded, setVolcanoesLoaded] = useState(false);
    const [tsunamiVisible, setTsunamiVisible] = useState(false);
    const [tsunamiLoading, setTsunamiLoading] = useState(false);
    const [tsunamiLoaded, setTsunamiLoaded] = useState(false);
    const [seismicStationsVisible, setSeismicStationsVisible] = useState(false);
    const [seismicStationsLoading, setSeismicStationsLoading] = useState(false);
    const [seismicStationsLoaded, setSeismicStationsLoaded] = useState(false);

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

      const faultLineSource = new VectorSource();
      faultLineSourceRef.current = faultLineSource;
      const faultLineLayer = new VectorLayer({
        source: faultLineSource,
        visible: false,
        zIndex: 5,
        style: () => [
          new Style({
            stroke: new Stroke({
              color: 'rgba(249,115,22,0.18)',
              width: 12,
              lineCap: 'round',
            }),
          }),
          new Style({
            stroke: new Stroke({
              color: 'rgba(249,115,22,0.55)',
              width: 6,
              lineCap: 'round',
            }),
          }),
          new Style({
            stroke: new Stroke({
              color: '#f97316',
              width: 3,
              lineCap: 'round',
            }),
          }),
          new Style({
            stroke: new Stroke({
              color: '#fff7ed',
              width: 1.6,
              lineCap: 'round',
            }),
          }),
        ],
      });
      map.addLayer(faultLineLayer);
      faultLineLayerRef.current = faultLineLayer;

      // Add Heatmap Layer
      const heatmapSource = new VectorSource();
      heatmapSourceRef.current = heatmapSource;
      const heatmapLayer = new Heatmap({
        source: heatmapSource,
        visible: false,
        blur: 15,
        radius: 8,
        weight: (feature) => {
          const mag = (feature.get('mag') as number) || 0;
          return Math.pow(2, mag) / 128; // Weight by magnitude
        },
        gradient: ['#00f', '#0ff', '#0f0', '#ff0', '#f00'],
        opacity: 0.6,
      });
      map.addLayer(heatmapLayer);
      heatmapLayerRef.current = heatmapLayer;

      // Add Tsunami Zones Layer
      const tsunamiSource = new VectorSource();
      tsunamiSourceRef.current = tsunamiSource;
      const tsunamiLayer = new VectorLayer({
        source: tsunamiSource,
        visible: false,
        style: (feature) => {
          const risk = feature.get('risk') as string;
          let color = 'rgba(59, 130, 246, 0.2)'; // Medium - blue
          if (risk === 'High') color = 'rgba(239, 68, 68, 0.25)'; // High - red
          if (risk === 'Low') color = 'rgba(34, 197, 94, 0.15)'; // Low - green
          
          return new Style({
            fill: new Fill({ color }),
            stroke: new Stroke({
              color: risk === 'High' ? '#ef4444' : '#3b82f6',
              width: 2,
              lineDash: [5, 5],
            }),
          });
        },
      });
      map.addLayer(tsunamiLayer);
      tsunamiLayerRef.current = tsunamiLayer;

      // Add Volcanoes Layer
      const volcanoSource = new VectorSource();
      volcanoSourceRef.current = volcanoSource;
      const volcanoLayer = new VectorLayer({
        source: volcanoSource,
        visible: false,
        style: (feature) => {
          const alert = (feature.get('alert') as string) || 'Normal';
          let iconColor = '#f97316'; // orange
          if (alert.includes('Level 2')) iconColor = '#ef4444'; // red
          if (alert.includes('Level 1')) iconColor = '#fbbf24'; // yellow
          
          return new Style({
            image: new CircleStyle({
              radius: 8,
              fill: new Fill({ color: iconColor }),
              stroke: new Stroke({ color: '#ffffff', width: 2 }),
            }),
            text: new Text({
              text: '🌋',
              font: '20px sans-serif',
              offsetY: -2,
            }),
          });
        },
      });
      map.addLayer(volcanoLayer);
      volcanoLayerRef.current = volcanoLayer;

      // Add Seismic Stations Layer
      const seismicStationSource = new VectorSource();
      seismicStationSourceRef.current = seismicStationSource;
      const seismicStationLayer = new VectorLayer({
        source: seismicStationSource,
        visible: false,
        style: (feature) => {
          const stationType = (feature.get('type') as string) || 'Unknown';
          const status = (feature.get('status') as string) || 'Unknown';
          
          // Color based on station type
          let iconColor = '#3b82f6'; // blue for broadband
          if (stationType === 'Strong Motion') iconColor = '#8b5cf6'; // purple
          if (status !== 'Active') iconColor = '#9ca3af'; // gray for inactive
          
          return new Style({
            image: new CircleStyle({
              radius: 6,
              fill: new Fill({ color: iconColor }),
              stroke: new Stroke({ color: '#ffffff', width: 2 }),
            }),
            text: new Text({
              text: '📡',
              font: '16px sans-serif',
              offsetY: -1,
            }),
          });
        },
      });
      map.addLayer(seismicStationLayer);
      seismicStationLayerRef.current = seismicStationLayer;

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

      const key = map.on(
        MapBrowserEventType.SINGLECLICK,
        handleClick as unknown as (event: MapBrowserEvent<unknown>) => void,
      );
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

      const moveKey = map.on(
        MapBrowserEventType.POINTERMOVE,
        handleMove as unknown as (event: MapBrowserEvent<unknown>) => void,
      );

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

    useEffect(() => {
      const layer = faultLineLayerRef.current;
      if (!layer) return;

      layer.setVisible(faultLinesVisible);

      if (faultLinesVisible && !faultLinesLoaded) {
        setFaultLinesLoading(true);
        setFaultLinesError(null);

        console.log('Fetching fault lines from:', FAULT_LINES_URL);

        fetch(FAULT_LINES_URL)
          .then((res) => {
            console.log('Fault lines response status:', res.status);
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          })
          .then((data) => {
            console.log('Fault lines data loaded:', data);
            console.log('Feature count:', data.features?.length);
            
            const features = new GeoJSON().readFeatures(data, {
              featureProjection: 'EPSG:3857',
            });
            
            console.log('Parsed features:', features.length);
            
            faultLineSourceRef.current?.clear();
            faultLineSourceRef.current?.addFeatures(features);
            setFaultLinesLoaded(true);
            setFaultLinesError(null);
          })
          .catch((error) => {
            console.error('Failed to load fault lines:', error);
            setFaultLinesError(`Failed to load: ${error.message}`);
          })
          .finally(() => {
            setFaultLinesLoading(false);
          });
      }
    }, [faultLinesVisible, faultLinesLoaded]);

    // Load Historical Earthquakes for Heatmap
    useEffect(() => {
      const layer = heatmapLayerRef.current;
      const source = heatmapSourceRef.current;
      if (!layer || !source) return;

      layer.setVisible(heatmapVisible);

      if (heatmapVisible && !heatmapLoaded) {
        setHeatmapLoading(true);
        
        fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson')
          .then(res => res.json())
          .then(data => {
            const format = new GeoJSON();
            const features = format.readFeatures(data, {
              featureProjection: 'EPSG:3857',
            });
            source.addFeatures(features);
            setHeatmapLoaded(true);
            setHeatmapLoading(false);
          })
          .catch(err => {
            console.error('Failed to load earthquake heatmap data', err);
            setHeatmapLoading(false);
          });
      }
    }, [heatmapVisible, heatmapLoaded]);

    // Load Tsunami Zones
    useEffect(() => {
      const layer = tsunamiLayerRef.current;
      const source = tsunamiSourceRef.current;
      if (!layer || !source) return;

      layer.setVisible(tsunamiVisible);

      if (tsunamiVisible && !tsunamiLoaded) {
        setTsunamiLoading(true);
        
        fetch('/data/tsunami-zones-philippines.geojson')
          .then(res => res.json())
          .then(data => {
            const format = new GeoJSON();
            const features = format.readFeatures(data, {
              featureProjection: 'EPSG:3857',
            });
            source.addFeatures(features);
            setTsunamiLoaded(true);
            setTsunamiLoading(false);
          })
          .catch(err => {
            console.error('Failed to load tsunami zones', err);
            setTsunamiLoading(false);
          });
      }
    }, [tsunamiVisible, tsunamiLoaded]);

    // Load Active Volcanoes
    useEffect(() => {
      const layer = volcanoLayerRef.current;
      const source = volcanoSourceRef.current;
      if (!layer || !source) return;

      layer.setVisible(volcanoesVisible);

      if (volcanoesVisible && !volcanoesLoaded) {
        setVolcanoesLoading(true);
        
        fetch('/data/philippines-volcanoes.geojson')
          .then(res => res.json())
          .then(data => {
            const format = new GeoJSON();
            const features = format.readFeatures(data, {
              featureProjection: 'EPSG:3857',
            });
            source.addFeatures(features);
            setVolcanoesLoaded(true);
            setVolcanoesLoading(false);
          })
          .catch(err => {
            console.error('Failed to load volcanoes', err);
            setVolcanoesLoading(false);
          });
      }
    }, [volcanoesVisible, volcanoesLoaded]);

    // Load Seismic Stations
    useEffect(() => {
      const layer = seismicStationLayerRef.current;
      const source = seismicStationSourceRef.current;
      if (!layer || !source) return;

      layer.setVisible(seismicStationsVisible);

      if (seismicStationsVisible && !seismicStationsLoaded) {
        setSeismicStationsLoading(true);
        
        fetch('/data/philippines-seismic-stations.geojson')
          .then(res => res.json())
          .then(data => {
            const format = new GeoJSON();
            const features = format.readFeatures(data, {
              featureProjection: 'EPSG:3857',
            });
            source.addFeatures(features);
            setSeismicStationsLoaded(true);
            setSeismicStationsLoading(false);
          })
          .catch(err => {
            console.error('Failed to load seismic stations', err);
            setSeismicStationsLoading(false);
          });
      }
    }, [seismicStationsVisible, seismicStationsLoaded]);

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
        
        {/* Layer Controls Drawer */}
        <div className="absolute top-4 right-4 z-10 flex flex-col items-end">
          {/* Toggle Button - Always Visible */}
          <button
            onClick={() => setLayersDrawerOpen(!layersDrawerOpen)}
            className="bg-white rounded-lg shadow-lg p-2 hover:bg-gray-50 transition-colors flex items-center justify-center w-10 h-10 mb-2"
            title={layersDrawerOpen ? "Hide layers" : "Show layers"}
          >
            <span className="text-lg">
              {layersDrawerOpen ? '✕' : '☰'}
            </span>
          </button>

          {/* Drawer Content - Slides from right */}
          <div
            className={`bg-white rounded-lg shadow-lg transition-all duration-300 ease-in-out transform ${
              layersDrawerOpen 
                ? 'translate-x-0 opacity-100' 
                : 'translate-x-[120%] opacity-0 pointer-events-none'
            }`}
          >
            <div className="p-2 space-y-1 w-40">
              <h3 className="font-semibold text-xs mb-1 px-2">Map Layers</h3>
              
              {/* Fault Lines Toggle */}
              <button
                onClick={() => setFaultLinesVisible(!faultLinesVisible)}
                className={`w-full text-left px-2 py-1.5 rounded text-xs transition ${
                  faultLinesVisible ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1.5">🗺️</span>
                Fault Lines
                {faultLinesLoading && <span className="ml-1 text-[10px]">(Loading...)</span>}
              </button>

              {/* Heatmap Toggle */}
              <button
                onClick={() => setHeatmapVisible(!heatmapVisible)}
                className={`w-full text-left px-2 py-1.5 rounded text-xs transition ${
                  heatmapVisible ? 'bg-red-100 text-red-700' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1.5">🔥</span>
                EQ Heatmap
                {heatmapLoading && <span className="ml-1 text-[10px]">(Loading...)</span>}
              </button>

              {/* Seismic Stations Toggle */}
              <button
                onClick={() => setSeismicStationsVisible(!seismicStationsVisible)}
                className={`w-full text-left px-2 py-1.5 rounded text-xs transition ${
                  seismicStationsVisible ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1.5">📡</span>
                Seismic Stations
                {seismicStationsLoading && <span className="ml-1 text-[10px]">(Loading...)</span>}
              </button>

              {/* Tsunami Zones Toggle */}
              <button
                onClick={() => setTsunamiVisible(!tsunamiVisible)}
                className={`w-full text-left px-2 py-1.5 rounded text-xs transition ${
                  tsunamiVisible ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1.5">🌊</span>
                Tsunami Zones
                {tsunamiLoading && <span className="ml-1 text-[10px]">(Loading...)</span>}
              </button>

              {/* Volcanoes Toggle */}
              <button
                onClick={() => setVolcanoesVisible(!volcanoesVisible)}
                className={`w-full text-left px-2 py-1.5 rounded text-xs transition ${
                  volcanoesVisible ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1.5">🌋</span>
                Volcanoes
                {volcanoesLoading && <span className="ml-1 text-[10px]">(Loading...)</span>}
              </button>
            </div>
          </div>
        </div>

        <div ref={mapContainerRef} className="w-full h-full" />
      </div>
    );
  },
);

SimulationMap.displayName = 'SimulationMap';

export default SimulationMap;