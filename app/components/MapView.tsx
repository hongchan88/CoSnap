import { useEffect, useMemo, useState, type ReactNode } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { renderToString } from "react-dom/server";
import { useRef } from "react";
import { POPULAR_DESTINATIONS } from "~/lib/constants";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon - only run on client
if (typeof window !== "undefined") {
  // @ts-ignore
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

interface MapViewProps {
  flags: any[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onMarkerClick?: (city: string) => void;
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
  interactive?: boolean;
  showControls?: boolean;
  minZoom?: number;
  maxZoom?: number;
  maxBounds?: L.LatLngBoundsExpression;
  noWrap?: boolean;
  clusteringThreshold?: number;
}

interface MapControllerProps {
  center: { lat: number; lng: number };
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
}

interface CustomMarkerProps {
  position: [number, number];
  onClick?: () => void;
  children: ReactNode;
}

function MapController({
  center,
  zoom,
  onZoomChange,
  onBoundsChange,
}: MapControllerProps) {
  const hasReportedInitialState = useRef(false);
  const lastPropsRef = useRef<{
    center: { lat: number; lng: number };
    zoom: number;
  } | null>(null);
  const map = useMapEvents({
    zoomend() {
      onZoomChange(map.getZoom());
      onBoundsChange?.(map.getBounds());
    },
    moveend() {
      onBoundsChange?.(map.getBounds());
    },
  });

  useEffect(() => {
    const prev = lastPropsRef.current;
    const centerChanged =
      !prev || prev.center.lat !== center.lat || prev.center.lng !== center.lng;
    const zoomChanged = !prev || prev.zoom !== zoom;

    if (centerChanged || zoomChanged) {
      lastPropsRef.current = { center, zoom };
      map.setView([center.lat, center.lng], zoom, { animate: false });
    }

    if (!hasReportedInitialState.current) {
      onBoundsChange?.(map.getBounds());
      onZoomChange(map.getZoom());
      hasReportedInitialState.current = true;
    }
  }, [center, zoom, map, onBoundsChange, onZoomChange]);

  return null;
}

function CustomMarker({ position, onClick, children }: CustomMarkerProps) {
  const markerRef = useRef<L.Marker | null>(null);
  
  const icon = useMemo(
    () =>
      L.divIcon({
        html: renderToString(<>{children}</>),
        className: "",
        iconAnchor: [0, 0],
      }),
    [children]
  );

  const eventHandlers = useMemo(
    () => ({
      click: onClick ? () => onClick() : undefined,
      mouseover: (e: L.LeafletMouseEvent) => {
        e.target.setZIndexOffset(1000);
      },
      mouseout: (e: L.LeafletMouseEvent) => {
        e.target.setZIndexOffset(0);
      },
    }),
    [onClick]
  );

  return (
    <Marker 
      position={position} 
      icon={icon} 
      eventHandlers={eventHandlers}
      ref={markerRef}
    />
  );
}

export default function MapView({
  flags,
  center = { lat: 37.5665, lng: 126.978 },
  zoom = 3,
  onMarkerClick,
  onBoundsChange,
  interactive = true,
  showControls = true,
  minZoom,
  maxZoom,
  maxBounds,
  noWrap = false,
  clusteringThreshold = 4,
}: MapViewProps) {
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const markers = useMemo(() => {
    const validFlags = flags.filter(
      (flag) => typeof flag.lat === "number" && typeof flag.lng === "number"
    );

    if (currentZoom < clusteringThreshold) {
      const countryGroups: Record<
        string,
        {
          latSum: number;
          lngSum: number;
          count: number;
          totalFlags: number;
          country: string;
          imageUrl?: string;
        }
      > = {};

      validFlags.forEach((flag) => {
        const lat = flag.lat;
        const lng = flag.lng;

        if (!countryGroups[flag.country]) {
          countryGroups[flag.country] = {
            latSum: 0,
            lngSum: 0,
            count: 0,
            totalFlags: 0,
            country: flag.country,
            imageUrl: flag.imageUrl,
          };
        }
        countryGroups[flag.country].latSum += lat;
        countryGroups[flag.country].lngSum += lng;
        countryGroups[flag.country].count += 1;
        countryGroups[flag.country].totalFlags += flag.count ?? 0;

        if (!countryGroups[flag.country].imageUrl && flag.imageUrl) {
          countryGroups[flag.country].imageUrl = flag.imageUrl;
        }
      });

      return Object.values(countryGroups).map((group) => ({
        id: `country-${group.country}`,
        lat: group.latSum / group.count,
        lng: group.lngSum / group.count,
        type: "country" as const,
        data: group,
      }));
    }

    return validFlags.map((flag) => ({
      id: flag.id,
      lat: flag.lat,
      lng: flag.lng,
      type: "city" as const,
      data: flag,
    }));
  }, [flags, currentZoom, clusteringThreshold]);

  if (!isClient) {
    return <div className="w-full h-full bg-gray-100 rounded-xl" />;
  }

  return (
    <div className="w-full h-full bg-gray-100 relative rounded-xl overflow-hidden z-0">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        maxBounds={maxBounds}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
        dragging={interactive}
        touchZoom={interactive}
        zoomControl={showControls}
        attributionControl={false}
        worldCopyJump={!noWrap}
        className="w-full h-full"
      >
        <TileLayer
          attribution="Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          noWrap={noWrap}
        />

        <MapController
          center={center}
          zoom={zoom}
          onZoomChange={setCurrentZoom}
          onBoundsChange={onBoundsChange}
        />

        {markers.map((marker) => {
          if (marker.type === "country") {
            const group = marker.data;
            return (
              <CustomMarker
                key={marker.id}
                position={[marker.lat, marker.lng]}
                onClick={() => {
                  if (onMarkerClick) {
                    // Try to find country code from POPULAR_DESTINATIONS
                    const dest = POPULAR_DESTINATIONS.find(
                      (d) =>
                        d.country.toLowerCase() === group.country.toLowerCase()
                    );
                    onMarkerClick(dest?.country_code || group.country);
                  }
                }}
              >
                <div
                  className="relative group cursor-pointer flex flex-col items-center"
                  style={{ transform: "translate(-50%, -100%)" }}
                >
                  <div className="group-hover:hidden w-8 h-8 bg-white border-2 border-blue-500 rounded-full shadow-lg flex items-center justify-center relative z-10 transition-transform duration-200">
                    <span className="text-xs font-bold text-blue-600">
                      {group.totalFlags}
                    </span>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r-2 border-b-2 border-blue-500 transform rotate-45"></div>
                  </div>

                  <div className="hidden group-hover:block w-40 bg-white rounded-xl shadow-xl overflow-hidden border-2 border-blue-500 relative z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="h-24 bg-gray-200 relative flex justify-center">
                      <img
                        src={
                          group.imageUrl ||
                          `https://source.unsplash.com/400x300/?${group.country},travel`
                        }
                        className="w-full h-full object-cover"
                        alt={group.country}
                        onError={(e) =>
                          (e.currentTarget.src =
                            "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=300&fit=crop")
                        }
                      />
                      <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm">
                        {group.totalFlags} Flags
                      </div>
                    </div>
                    <div className="p-2 bg-blue-50 text-center">
                      <h3 className="font-bold text-gray-900 text-xs truncate">
                        {group.country}
                      </h3>
                      <span className="text-[10px] font-medium text-blue-700">
                        총 {group.totalFlags}개의 여행 계획
                      </span>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-50 border-r-2 border-b-2 border-blue-500 transform rotate-45 shadow-lg -z-10"></div>
                  </div>
                </div>
              </CustomMarker>
            );
          }

          const flag = marker.data;
          return (
            <CustomMarker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              onClick={() => onMarkerClick && onMarkerClick(flag.city)}
            >
              <div
                className="relative cursor-pointer flex flex-col items-center group hover:z-50"
                style={{ transform: "translate(-50%, -100%)" }}
              >
                <div className="px-3 py-2 bg-white/95 backdrop-blur-sm border border-green-500/30 rounded-2xl shadow-lg relative transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl group-hover:border-green-500/50">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xs font-bold text-gray-800 leading-tight whitespace-nowrap">
                      {flag.city}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-semibold text-green-600">
                        {flag.count}
                      </span>
                      <span className="text-[10px] text-gray-500">flags</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 backdrop-blur-sm border-r border-b border-green-500/30 transform rotate-45"></div>
                </div>
              </div>
            </CustomMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
