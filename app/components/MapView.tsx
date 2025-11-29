import { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { renderToString } from "react-dom/server";

// Fix for default marker icon
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapViewProps {
  flags: any[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onMarkerClick?: (city: string) => void;
  interactive?: boolean;
  showControls?: boolean;
  minZoom?: number;
  maxZoom?: number;
  maxBounds?: L.LatLngBoundsExpression;
  noWrap?: boolean;
}

// Component to handle map movements and zoom changes
function MapController({ 
  center, 
  zoom, 
  onZoomChange 
}: { 
  center: { lat: number; lng: number }; 
  zoom: number;
  onZoomChange: (zoom: number) => void;
}) {
  const map = useMap();
  const flyToRef = useRef<{lat: number, lng: number, zoom: number} | null>(null);

  const isFirstRender = useRef(true);

  // Handle external center/zoom changes
  useEffect(() => {
    // Skip the first render to avoid "moving" effect on initialization
    // MapContainer already handles the initial center/zoom
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Avoid re-triggering move if we are already there
    // Increased tolerance to prevent micro-movements
    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();
    
    if (
      Math.abs(currentCenter.lat - center.lat) > 0.005 || 
      Math.abs(currentCenter.lng - center.lng) > 0.005 ||
      currentZoom !== zoom
    ) {
       // Use setView for instant update instead of flyTo animation
       map.setView([center.lat, center.lng], zoom);
    }
  }, [center, zoom, map]);

  useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });

  return null;
}

// Custom Marker Component
function CustomMarker({ 
  position, 
  onClick, 
  children 
}: { 
  position: [number, number]; 
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const icon = L.divIcon({
    className: "custom-leaflet-icon",
    html: renderToString(<>{children}</>),
    iconSize: [0, 0], // Size is controlled by CSS/content
    iconAnchor: [0, 0], // Anchor at top-left of the div, CSS handles the rest
  });

  return (
    <Marker 
      position={position} 
      icon={icon}
      eventHandlers={{
        click: onClick,
        mouseover: (e) => {
          e.target.setZIndexOffset(1000);
        },
        mouseout: (e) => {
          e.target.setZIndexOffset(0);
        }
      }}
    />
  );
}

export default function MapView({
  flags,
  center = { lat: 37.5665, lng: 126.978 },
  zoom = 3,
  onMarkerClick,
  interactive = true,
  showControls = true,
  minZoom,
  maxZoom,
  maxBounds,
  noWrap = false,
}: MapViewProps) {
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Clustering Logic
  const markers = useMemo(() => {
    if (currentZoom < 4) {
      // Country Clustering
      const countryGroups: Record<string, { latSum: number; lngSum: number; count: number; totalFlags: number; country: string; imageUrl?: string }> = {};
      
      flags.forEach(flag => {
        const lat = flag.lat;
        const lng = flag.lng;
        if (typeof lat !== "number" || typeof lng !== "number") return;

        if (!countryGroups[flag.country]) {
          countryGroups[flag.country] = { 
            latSum: 0, 
            lngSum: 0, 
            count: 0, 
            totalFlags: 0, 
            country: flag.country,
            imageUrl: flag.imageUrl 
          };
        }
        countryGroups[flag.country].latSum += lat;
        countryGroups[flag.country].lngSum += lng;
        countryGroups[flag.country].count += 1;
        countryGroups[flag.country].totalFlags += (flag.count || 1);
        
        if (!countryGroups[flag.country].imageUrl && flag.imageUrl) {
          countryGroups[flag.country].imageUrl = flag.imageUrl;
        }
      });

      return Object.values(countryGroups).map(group => ({
        id: `country-${group.country}`,
        lat: group.latSum / group.count,
        lng: group.lngSum / group.count,
        type: 'country',
        data: group
      }));
    } else {
      // City Markers (already grouped by city in parent or individual flags)
      // Assuming 'flags' prop passed from Explore is already city-grouped or individual flags.
      // In Explore.tsx, 'mapMarkers' are already city-grouped.
      return flags.map(flag => ({
        id: flag.id,
        lat: flag.lat,
        lng: flag.lng,
        type: 'city',
        data: flag
      }));
    }
  }, [flags, currentZoom]);

  if (!isClient) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
        Loading Map...
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-100 relative rounded-xl overflow-hidden z-0">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={interactive}
        dragging={interactive}
        doubleClickZoom={interactive}
        zoomControl={showControls}
        attributionControl={false}
        minZoom={minZoom}
        maxZoom={maxZoom}
        maxBounds={maxBounds}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          noWrap={noWrap}
        />
        <MapController 
          center={center} 
          zoom={zoom} 
          onZoomChange={setCurrentZoom} 
        />
        
        {markers.map(marker => {
          if (marker.type === 'country') {
            const group = marker.data;
            return (
              <CustomMarker 
                key={marker.id} 
                position={[marker.lat, marker.lng]}
              >
                <div className="relative group cursor-pointer flex flex-col items-center"
                     style={{ transform: 'translate(-50%, -100%)' }}>
                  
                  {/* Default View: Small Pin */}
                  <div className="group-hover:hidden w-8 h-8 bg-white border-2 border-blue-500 rounded-full shadow-lg flex items-center justify-center relative z-10 transition-transform duration-200">
                    <span className="text-xs font-bold text-blue-600">{group.totalFlags}</span>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r-2 border-b-2 border-blue-500 transform rotate-45"></div>
                  </div>

                  {/* Hover View: Full Card */}
                  <div className="hidden group-hover:block w-40 bg-white rounded-xl shadow-xl overflow-hidden border-2 border-blue-500 relative z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="h-24 bg-gray-200 relative">
                      <img src={group.imageUrl || `https://source.unsplash.com/400x300/?${group.country},travel`} 
                           className="w-full h-full object-cover" 
                           alt={group.country} 
                           onError={(e) => e.currentTarget.src='https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=300&fit=crop'}/>
                      <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm">
                        {group.totalFlags} Flags
                      </div>
                    </div>
                    <div className="p-2 bg-blue-50 text-center">
                      <h3 className="font-bold text-gray-900 text-xs truncate">{group.country}</h3>
                      <span className="text-[10px] font-medium text-blue-700">
                        총 {group.totalFlags}개의 여행 계획
                      </span>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-50 border-r-2 border-b-2 border-blue-500 transform rotate-45 shadow-lg -z-10"></div>
                  </div>
                </div>
              </CustomMarker>
            );
          } else {
            const flag = marker.data;
            return (
              <CustomMarker 
                key={marker.id} 
                position={[marker.lat, marker.lng]}
                onClick={() => onMarkerClick && onMarkerClick(flag.city)}
              >
                <div className="relative group cursor-pointer transform transition-all duration-300 hover:scale-110 hover:z-50"
                     style={{ width: '160px', transform: 'translate(-50%, -100%)' }}>
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="h-24 bg-gray-200 relative">
                      <img src={flag.imageUrl || `https://source.unsplash.com/400x300/?${flag.city},travel`} 
                           className="w-full h-full object-cover" 
                           alt={flag.city} 
                           onError={(e) => e.currentTarget.src='https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=300&fit=crop'}/>
                      <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                        {flag.count} Flags
                      </div>
                    </div>
                    <div className="p-2">
                      <h3 className="font-bold text-gray-900 text-xs truncate">{flag.city}</h3>
                      <p className="text-[10px] text-gray-500 truncate">{flag.country}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          여행자 {flag.count}명
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white transform rotate-45 shadow-lg -z-10"></div>
                </div>
              </CustomMarker>
            );
          }
        })}
      </MapContainer>
    </div>
  );
}
