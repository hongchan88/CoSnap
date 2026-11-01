export function canReportMapViewport(
  width: number, height: number,
  south: number, north: number, west: number, east: number,
): boolean {
  return [width, height, south, north, west, east].every(Number.isFinite) &&
    width > 0 && height > 0 && north > south && east > west;
}
