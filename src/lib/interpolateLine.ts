import type { Coordinate } from 'ol/coordinate';
import {linearInterpolate} from "@/lib/linearInterpolate";

export function interpolateLine(coords: Coordinate[], n: number): Coordinate[] {
  if (coords.length < 2 || n <= 0) return coords;

  const result: Coordinate[] = [];

  for (let i = 0; i < coords.length - 1; i++) {
    const segment = linearInterpolate(coords[i] as [number, number], coords[i + 1] as [number, number], n);
    result.push(...segment.slice(0, segment.length - 1));
  }

  result.push(coords[coords.length - 1]);
  return result;
}