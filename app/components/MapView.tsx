import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Set Mapbox Access Token
mapboxgl.accessToken = "pk.eyJ1IjoiaG9uZ2NoYW44OCIsImEiOiJjbWllMmRoYmEwODN0Mm1xdmFhcW1hdHVyIn0.wFjo4SjAaY8yL446JUz3aQ";

interface MapViewProps {
  flags: any[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onMarkerClick?: (city: string) => void;
  interactive?: boolean;
  showControls?: boolean;
}

export default function MapView({
  flags,
  center = { lat: 37.5665, lng: 126.978 },
  zoom = 3,
  onMarkerClick,
  interactive = true,
  showControls = true,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      console.log("Initializing Mapbox map...");
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [center.lng, center.lat],
        zoom: zoom,
        projection: "globe" as any,
        interactive: interactive, // Control interactivity
      });

      map.on('load', () => {
        console.log("Mapbox map loaded");
      });

      map.on('error', (e) => {
        console.error("Mapbox error:", e);
        setMapError(e.error.message);
      });

      // Add atmosphere styling for globe effect
      map.on('style.load', () => {
        map.setFog({
          color: 'rgb(186, 210, 235)', // Lower atmosphere
          'high-color': 'rgb(36, 92, 223)', // Upper atmosphere
          'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
          'space-color': 'rgb(11, 11, 25)', // Background color
          'star-intensity': 0.6 // Background star brightness (default 0.35 at low zooms )
        });
      });

      // Add navigation controls if enabled
      if (showControls) {
        map.addControl(new mapboxgl.NavigationControl(), "top-right");
      }

      mapRef.current = map;
    } catch (err: any) {
      console.error("Failed to initialize map:", err);
      setMapError(err.message);
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update map view (flyTo) when center changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.flyTo({
      center: [center.lng, center.lat],
      zoom: zoom,
      duration: 2000,
      essential: true
    });
  }, [center.lat, center.lng, zoom]);

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    console.log("Updating markers with flags:", flags);

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    flags.forEach((flag) => {
      const lat = flag.latitude ?? flag.lat;
      const lng = flag.longitude ?? flag.lng;
      
      if (typeof lat !== "number" || typeof lng !== "number") {
        console.warn("Invalid coordinates for flag:", flag);
        return;
      }

      // Create custom HTML element for the marker
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.innerHTML = `
        <div class="relative group cursor-pointer transform transition-all duration-300 hover:scale-110 hover:z-50">
          <div class="bg-white rounded-xl shadow-lg overflow-hidden w-32 md:w-40">
            <div class="h-20 md:h-24 bg-gray-200 relative">
              <img src="${flag.imageUrl || `https://source.unsplash.com/400x300/?${flag.city},travel`}" 
                   class="w-full h-full object-cover" 
                   alt="${flag.city}" 
                   onerror="this.src='https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=300&fit=crop'"/>
              <div class="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                ${flag.count} Flags
              </div>
            </div>
            <div class="p-2">
              <h3 class="font-bold text-gray-900 text-xs truncate">${flag.city}</h3>
              <p class="text-[10px] text-gray-500 truncate">${flag.country}</p>
              <div class="mt-1.5 flex items-center justify-between">
                <span class="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  여행자 ${flag.count}명
                </span>
              </div>
            </div>
          </div>
          <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white transform rotate-45 shadow-lg -z-10"></div>
        </div>
      `;

      // Add click listener
      el.addEventListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(flag.city);
        }
      });

      // Create marker
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
      })
        .setLngLat([lng, lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [flags, onMarkerClick]);

  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-500 p-4">
        Map Error: {mapError}
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-100 relative rounded-xl overflow-hidden" style={{ minHeight: '400px' }}>
      <div ref={mapContainerRef} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
