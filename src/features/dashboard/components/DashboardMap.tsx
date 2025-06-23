'use client';
import {useEffect, useRef, useState} from 'react';
import { useOpenLayersMap } from '../hooks/useOlMap';
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {fromLonLat} from "ol/proj";
import {Feature} from "ol";
import {LineString} from "ol/geom";
import {Stroke, Style} from "ol/style";
import {interpolateLine} from "@/lib/interpolateLine";
import _ from 'lodash';

const stationColors = {
  1: '#0052A4',
  2: '#009D3E',
  3: '#EF7C1C',
  4: '#00A5DE',
  5: '#996CAC',
  6: '#CD7C2F',
  7: '#747F00',
  8: '#EA5455',
  9: '#BDB092'
}

export default function DashboardMap({data}: any) {
  const mapRef = useRef<HTMLDivElement>(null);

  const [vectorSource] = useState(() => new VectorSource());
  const [vectorLayer] = useState(() => new VectorLayer({ source: vectorSource }));

  const map = useOpenLayersMap(mapRef, {
    center: [126.9780, 37.5665],
    zoom: 11,
  });

  useEffect(()=> {
    if(!map) return ;

    if (!map.getLayers().getArray().includes(vectorLayer)) {
      map.addLayer(vectorLayer);
    }

    const obj = _.groupBy(data,'line');

    console.log(obj);

    Object.entries(obj).map(i=> {

      const projCoords = i[1].map(st=> fromLonLat([parseFloat(st['lng']), parseFloat(st['lat'])]))
      const interpolatedCoords = interpolateLine(projCoords, 1000);

      console.log(interpolatedCoords);

      // const coordinates = data.map(st=>
      //   fromLonLat([parseFloat(st['경도']), parseFloat(st['위도'])])
      // )

      const lineFeature = new Feature({
        geometry: new LineString(interpolatedCoords),
      });

      console.log(i[0])

      lineFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: stationColors[i[0].slice(1,2)],
            width: 3,
          }),
        })
      );

      // vectorSource.clear();
      vectorSource.addFeature(lineFeature)
    })

    // const projCoords = data.data.map(st=> fromLonLat([parseFloat(st['경도']), parseFloat(st['위도'])]))
    // const interpolatedCoords = interpolateLine(projCoords, 1000);
    //
    // console.log(interpolatedCoords);
    //
    // // const coordinates = data.map(st=>
    // //   fromLonLat([parseFloat(st['경도']), parseFloat(st['위도'])])
    // // )
    //
    // const lineFeature = new Feature({
    //   geometry: new LineString(interpolatedCoords),
    // });
    //
    // lineFeature.setStyle(
    //   new Style({
    //     stroke: new Stroke({
    //       color: '#1e90ff',
    //       width: 5,
    //     }),
    //   })
    // );

    // vectorSource.clear();
    // vectorSource.addFeature(lineFeature)
  },[map, vectorLayer, vectorSource, data])


  return <div ref={mapRef} style={{ width: '100%', height: '100%', background:'#fff' }} />;
}