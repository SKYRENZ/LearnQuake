import Header from '../components/Header';
import { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';

// New imports for vector earthquakes
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';

export default function Simulation() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<{
    place?: string;
    mag?: number;
    time?: number;
    url?: string;
  } | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Base map
    const map = new Map({
      target: mapRef.current,
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

    // Earthquake vector source & layer
    const quakeSource = new VectorSource();
    const quakeLayer = new VectorLayer({
      source: quakeSource,
      style: feature => {
        const mag = feature.get('mag') || 0;
        const radius = 4 + mag * 2; // scale
        let color = '#4ade80'; // green
        if (mag >= 2.5) color = '#fbbf24'; // yellow
        if (mag >= 4) color = '#fb923c'; // orange
        if (mag >= 5.5) color = '#ef4444'; // red
        if (mag >= 7) color = '#9333ea'; // purple
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

    const FEED_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

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
    const interval = setInterval(loadQuakes, 300000); // 5 min

    // Click selection
    const handleClick = (evt: any) => {
      let found = false;
      map.forEachFeatureAtPixel(evt.pixel, feature => {
        const props = feature.getProperties();
        setSelected({
          place: props.place,
          mag: props.mag,
          time: props.time,
          url: props.url
        });
        found = true;
        return true;
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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="font-instrument font-bold text-4xl md:text-6xl text-quake-dark-blue mb-8">
            Earthquake Simulation
          </h1>

          <div className="mt-16 text-left">
            <h2 className="font-instrument font-bold text-2xl text-quake-dark-blue mb-4">
              Global Tectonic Map (OpenLayers)
            </h2>
            <div
              ref={mapRef}
              className="rounded-xl border border-quake-light-purple overflow-hidden shadow-sm"
              style={{ width: '100%', height: 480 }}
            />
            <p className="mt-4 text-sm text-gray-500 font-instrument">
              Circles show past 24h earthquakes (USGS). Size & color scale with magnitude.
            </p>

            {selected && (
              <div className="mt-4 p-4 rounded-lg border border-quake-light-purple bg-quake-light-gray font-instrument text-sm">
                <div><span className="font-semibold">Magnitude:</span> {selected.mag?.toFixed(1)}</div>
                <div><span className="font-semibold">Location:</span> {selected.place}</div>
                {selected.time && (
                  <div><span className="font-semibold">Time (UTC):</span> {new Date(selected.time).toUTCString()}</div>
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
