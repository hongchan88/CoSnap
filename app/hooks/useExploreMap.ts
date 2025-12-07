import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router";
import type { LatLngBounds } from "leaflet";
import { CITY_COORDINATES, POPULAR_DESTINATIONS } from "~/lib/constants";

export function useExploreMap(flags: any[], searchParams: { location: string | null; type: string }) {
  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);
  
  // Initialize selectedCity from URL param if it matches a popular destination
  const initialCity = useMemo(() => {
    if (!searchParams.location) return null;
    const paramLoc = searchParams.location.trim().toLowerCase();

    // 1. Try matching country_code
    const codeMatch = POPULAR_DESTINATIONS.find(
      (d) => d.country_code.toLowerCase() === paramLoc
    );
    if (codeMatch) return codeMatch.city;

    // 2. Try matching city name
    const cityMatch = POPULAR_DESTINATIONS.find(
      (d) => d.city.toLowerCase() === paramLoc
    );
    return cityMatch ? cityMatch.city : null;
  }, [searchParams]);

  // Determine map center based on search location, or fall back to default
  const initialCenter = useMemo(() => {
    const location = searchParams.location;
    if (location) {
      const locationName = location.trim().toLowerCase();

      // 1. Try finding in POPULAR_DESTINATIONS by country_code
      const codeDest = POPULAR_DESTINATIONS.find(
        (d) => d.country_code.toLowerCase() === locationName
      );
      if (codeDest) {
        return { lat: codeDest.lat, lng: codeDest.lng };
      }

      // 2. Try finding in POPULAR_DESTINATIONS by city
      const cityDest = POPULAR_DESTINATIONS.find(
        (d) => d.city.toLowerCase() === locationName
      );
      if (cityDest) {
        return { lat: cityDest.lat, lng: cityDest.lng };
      }

      // 3. Try CITY_COORDINATES
      if (CITY_COORDINATES[locationName]) {
        return CITY_COORDINATES[locationName];
      }

      // 4. Try finding in loaded flags (Dynamic lookup)
      // This handles cases where a city has flags but isn't in our static popular lists
      const flagMatch = flags.find((f: any) => 
        f.city.toLowerCase() === locationName || 
        f.country.toLowerCase() === locationName
      );
      
      if (flagMatch && typeof flagMatch.latitude === 'number' && typeof flagMatch.longitude === 'number') {
        return { lat: flagMatch.latitude, lng: flagMatch.longitude };
      }
    }
    return { lat: 37.5665, lng: 126.978 };
  }, [searchParams, flags]);

  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(searchParams.location ? 5 : 3);

  // Update map center when URL param changes
  useEffect(() => {
    setMapCenter(initialCenter);
    if (searchParams.location) {
      setMapZoom(5);
    }
  }, [initialCenter, searchParams]);

  // Center to user GPS on mount if available, BUT ONLY if no location param
  useEffect(() => {
    if (searchParams.location) return;
    if (!navigator?.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCenter({ lat: latitude, lng: longitude });
        setTimeout(() => setMapZoom((z) => Math.max(z, 8)), 300);
      },
      () => {},
      { timeout: 5000 }
    );
  }, [searchParams]);

  return {
    mapCenter,
    mapZoom,
    mapBounds,
    initialCity,
    setMapCenter,
    setMapZoom,
    setMapBounds,
  };
}
