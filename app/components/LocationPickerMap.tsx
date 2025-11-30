import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in React Leaflet
// @ts-ignore
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

interface LocationPickerMapProps {
  city: string;
  country: string; // expect ISO country code (e.g., "KR", "US")
  onLocationSelect: (lat: number, lng: number) => void;
  onAddressSelect?: (city: string, country: string) => void;
  initialLat?: number | null;
  initialLng?: number | null;
  flyToRequest?: { city: string; country: string; requestId: number } | null;
}

// Component to handle clicks and marker
function LocationMarker({
  position,
  setPosition,
  onLocationSelect,
}: {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      console.log("[LocationMarker] map click", { lat, lng });
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          console.log("[LocationMarker] dragend", { lat, lng });
          setPosition([lat, lng]);
          onLocationSelect(lat, lng);
        }
      },
    }),
    [onLocationSelect, setPosition]
  );

  return position === null ? null : (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={eventHandlers}
      ref={markerRef}
    />
  );
}

// Sync map instance and user-driven moves/zooms back to state
function MapSync({
  onMove,
  mapRef,
}: {
  onMove: (center: [number, number], zoom: number) => void;
  mapRef: React.MutableRefObject<L.Map | null>;
}) {
  const map = useMapEvents({
    moveend() {
      const c = map.getCenter();
      console.log("[MapSync] moveend", {
        center: [c.lat, c.lng],
        zoom: map.getZoom(),
      });
      onMove([c.lat, c.lng], map.getZoom());
    },
    zoomend() {
      const c = map.getCenter();
      console.log("[MapSync] zoomend", {
        center: [c.lat, c.lng],
        zoom: map.getZoom(),
      });
      onMove([c.lat, c.lng], map.getZoom());
    },
  });

  useEffect(() => {
    console.log("[MapSync] mount", map, mapRef, onMove);
    mapRef.current = map;
    const c = map.getCenter();
    console.log("[MapSync] mount", {
      center: [c.lat, c.lng],
      zoom: map.getZoom(),
    });
    onMove([c.lat, c.lng], map.getZoom());
  }, [map, mapRef, onMove]);

  return null;
}

export default function LocationPickerMap({
  city,
  country,
  onLocationSelect,
  onAddressSelect,
  initialLat,
  initialLng,
  flyToRequest,
}: LocationPickerMapProps) {
  console.log("[LocationPickerMap] render start", {
    city,
    country,
    initialLat,
    initialLng,
    flyToRequest,
  });
  const [isClient, setIsClient] = useState(false);
  // Default to Seoul if no initial coords
  const defaultCenter: [number, number] =
    initialLat && initialLng ? [initialLat, initialLng] : [37.5665, 126.978];

  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [mapZoom, setMapZoom] = useState<number>(initialLat ? 9 : 4);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );
  const [userSetMarker, setUserSetMarker] = useState<boolean>(
    Boolean(initialLat && initialLng)
  );
  const [interactionEnabled, setInteractionEnabled] = useState(false);
  // memoized handler to avoid state churn/loops
  const handleMapMove = useCallback(
    (center: [number, number], zoom: number) => {
      setMapCenter((prev) =>
        prev[0] === center[0] && prev[1] === center[1] ? prev : center
      );
      setMapZoom((prev) => (prev === zoom ? prev : zoom));
    },
    []
  );

  // Track last reported address to prevent loop (country stored as code)
  const lastReportedAddress = useRef<{
    city: string;
    countryCode: string;
  } | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    console.log("[LocationPickerMap] setIsClient");
    setIsClient(true);
  }, []);

  // Toggle interaction handlers based on state
  // useEffect(() => {
  //   const map = mapInstanceRef.current;
  //   if (!map) return;
  //   const toggle = (handler: any) => {
  //     if (
  //       !handler ||
  //       typeof handler.enable !== "function" ||
  //       typeof handler.disable !== "function"
  //     )
  //       return;
  //     interactionEnabled ? handler.enable() : handler.disable();
  //   };
  //   toggle((map as any).scrollWheelZoom);
  //   toggle((map as any).doubleClickZoom);
  //   toggle((map as any).touchZoom);
  //   toggle((map as any).boxZoom);
  //   toggle((map as any).keyboard);
  //   toggle((map as any).dragging);
  // }, [interactionEnabled]);

  // Handle location selection (from click or drag)
  const handleLocationSelect = async (lat: number, lng: number) => {
    console.log("[LocationPickerMap] handleLocationSelect", { lat, lng });
    onLocationSelect(lat, lng);
    setUserSetMarker(true);

    if (onAddressSelect) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`
        );
        const data = await response.json();
        if (data && data.address) {
          const newCity =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.county ||
            "";
          const newCountryCode = (
            data.address.country_code || ""
          ).toUpperCase();
          if (newCity || newCountryCode) {
            lastReportedAddress.current = {
              city: newCity,
              countryCode: newCountryCode,
            };
            onAddressSelect(newCity, newCountryCode);
          }
        }
      } catch (error) {
        console.error("Reverse geocoding failed:", error);
      }
    }
  };

  const handleUseMyLocation = () => {
    console.log("[LocationPickerMap] handleUseMyLocation");
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCenter([latitude, longitude]);
        setMapZoom(14);
        setMarkerPosition([latitude, longitude]);
        onLocationSelect(latitude, longitude);
        setUserSetMarker(true);
        mapInstanceRef.current?.flyTo([latitude, longitude], 14, {
          duration: 0.8,
        });
        setInteractionEnabled(true);
      },
      (err) => {
        console.warn("Geolocation failed", err);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Handle explicit fly-to requests (triggered by parent button)
  const lastRequestId = useRef<number | null>(null);

  useEffect(() => {
    if (!flyToRequest) return;
    if (flyToRequest.requestId === lastRequestId.current) return;
    
    lastRequestId.current = flyToRequest.requestId;

    const { city: flyCity, country: flyCountry } = flyToRequest;
    if (!flyCountry) return;

    const query = flyCity ? `${flyCity}, ${flyCountry}` : flyCountry;

    const fetchCoordinates = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=${flyCountry.toLowerCase()}&accept-language=en`
        );
        const data = await response.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);

          setMapCenter([lat, lon]);
          setMapZoom(flyCity ? 12 : 6);
          mapInstanceRef.current?.flyTo([lat, lon], flyCity ? 12 : 6, {
            duration: 1.0,
          });
          // Clear existing marker so user must pick a new precise point after fly-to
          setMarkerPosition(null);
          setUserSetMarker(false);
          setInteractionEnabled(true);
        }
      } catch (error) {
        console.error("Geocoding failed:", error);
      }
    };

    fetchCoordinates();
  }, [flyToRequest]);

  if (!isClient) {
    return (
      <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200 relative z-0 flex items-center justify-center text-sm text-gray-500">
        Loading map…
      </div>
    );
  }

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200 relative z-0">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        boxZoom={true}
        keyboard={true}
        dragging={true}
      >
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
        />
        <MapSync
          mapRef={mapInstanceRef}
          onMove={handleMapMove}
        />
        <LocationMarker
          position={markerPosition}
          setPosition={(pos) => {
            setMarkerPosition(pos);
            setUserSetMarker(true);
          }}
          onLocationSelect={handleLocationSelect}
        />
      </MapContainer>
      <div className="absolute bottom-2 right-2 flex items-center gap-2">
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="bg-white/90 px-3 py-1 rounded text-xs text-gray-700 shadow border border-gray-200 hover:bg-white"
        >
          내 위치로 이동
        </button>
        <div className="bg-white/90 px-2 py-1 rounded text-xs text-gray-600 pointer-events-none border border-gray-200">
          지도 클릭 또는 마커 드래그로 위치 설정
        </div>
      </div>
    </div>
  );
}
