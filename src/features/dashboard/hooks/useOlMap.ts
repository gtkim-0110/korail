'use client';
import {useEffect, useRef, useState} from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';

type Options = {
  center?: [number, number]; // lon, lat
  zoom?: number;
};

export function useOpenLayersMap(mapRef: React.RefObject<HTMLDivElement | null>, options: Options = {}) {

  const mapObjRef = useRef<Map | null>(null);
  const [map, setMap] = useState<Map | null>(null);

  useEffect(() => {
    if (!mapRef?.current || mapObjRef.current) return;

    const {
      center = [126.9780, 37.5665],
      zoom = 10,
    } = options;

    const mapInstance = new Map({
      target: mapRef.current,
      layers: [
        // new TileLayer({ source: new OSM() }),
      ],
      view: new View({
        center: fromLonLat(center),
        zoom,
      }),
    });

    mapObjRef.current = mapInstance;
    setMap(mapInstance);

    return () => {
      mapInstance.setTarget(undefined);
      mapObjRef.current = null;
      setMap(null);
    };
  }, [mapRef, options.center?.[0], options.center?.[1], options.zoom]);

  return mapObjRef.current
}