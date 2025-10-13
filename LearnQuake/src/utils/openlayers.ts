import type MapBrowserEvent from 'ol/MapBrowserEvent';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import type Map from 'ol/Map';
import Feature from 'ol/Feature';
import type { EventsKey } from 'ol/events';
import type Geometry from 'ol/geom/Geometry';
import type { Pixel } from 'ol/pixel';
import { unByKey } from 'ol/Observable';

type MapUIEventHandler = (event: MapBrowserEvent<UIEvent>) => void;

export type MapEventKey = EventsKey;

export function addPointerMoveListener(
  map: Map,
  handler: MapUIEventHandler,
): MapEventKey {
  return map.on(MapBrowserEventType.POINTERMOVE, handler as MapUIEventHandler);
}

export function addSingleClickListener(
  map: Map,
  handler: MapUIEventHandler,
): MapEventKey {
  return map.on(MapBrowserEventType.SINGLECLICK, handler as MapUIEventHandler);
}

export function removeMapEventListener(key: MapEventKey): void {
  unByKey(key);
}

export function findVectorFeatureAtPixel(
  map: Map,
  pixel: Pixel,
  predicate?: (feature: Feature<Geometry>) => boolean,
): Feature<Geometry> | null {
  let found: Feature<Geometry> | null = null;

  map.forEachFeatureAtPixel(pixel, candidate => {
    if (candidate instanceof Feature) {
      const casted = candidate as Feature<Geometry>;
      if (!predicate || predicate(casted)) {
        found = casted;
        return true;
      }
    }
    return false;
  });

  return found;
}