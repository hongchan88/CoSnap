export type ExploreBounds = { minLat: number; maxLat: number; minLng: number; maxLng: number };

const wrapLongitude = (longitude: number) => ((longitude + 180) % 360 + 360) % 360 - 180;

export function normalizeExploreBounds(south: number, north: number, west: number, east: number): ExploreBounds {
  return {
    minLat: Math.max(-90, south), maxLat: Math.min(90, north),
    minLng: east - west >= 360 ? -180 : wrapLongitude(west),
    maxLng: east - west >= 360 ? 180 : wrapLongitude(east),
  };
}

export function containsExplorePoint(bounds: ExploreBounds, latitude: number, longitude: number) {
  if (latitude < bounds.minLat || latitude > bounds.maxLat) return false;
  const lng = wrapLongitude(longitude);
  return bounds.minLng <= bounds.maxLng
    ? lng >= bounds.minLng && lng <= bounds.maxLng
    : lng >= bounds.minLng || lng <= bounds.maxLng;
}
