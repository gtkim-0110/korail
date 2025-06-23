export function linearInterpolate(
  pointA: [number, number],
  pointB: [number, number],
  n: number
): [number, number][] {
  const result: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const x = pointA[0] + ((pointB[0] - pointA[0]) * i) / n;
    const y = pointA[1] + ((pointB[1] - pointA[1]) * i) / n;
    result.push([x, y]);
  }
  return result;
}