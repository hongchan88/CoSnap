import { useEffect, useMemo, useState, Suspense, lazy } from "react";
import { useLoaderData, Form, useNavigation } from "react-router";
import type { LatLngBounds } from "leaflet";
import { createSupabaseClient } from "~/lib/supabase";
import { getAllActiveFlags, getLoggedInUserId } from "~/users/queries";
import type { Route } from "./+types/explore";
import CityCard from "~/components/CityCard";
import OfferModal from "~/components/OfferModal";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { createOffer } from "~/users/mutations";

// Lazy load MapView to avoid SSR issues with Leaflet
const MapView = lazy(() => import("~/components/MapView"));

export async function loader({ request }: Route.LoaderArgs) {
  const { client, headers } = createSupabaseClient(request);
  // Require authentication similar to flags page
  await getLoggedInUserId(client);

  // Fetch active flags
  const { success, flags, error } = await getAllActiveFlags(client, 100);

  if (!success) {
    console.error("Failed to fetch flags:", error);
    throw new Response("Failed to load flags", { status: 500 });
  }

  // Parse search params to pass back to client
  const url = new URL(request.url);
  const location = url.searchParams.get("location")?.toLowerCase() || null;
  const startDate = url.searchParams.get("startDate") || null;
  const endDate = url.searchParams.get("endDate") || null;
  const travelers = parseInt(url.searchParams.get("travelers") || "1");

  // No server-side filtering - return all active flags
  // Aggregate flags by city for map markers
  const cityGroups = flags.reduce(
    (acc, flag) => {
      const key = `${flag.city}, ${flag.country}`;
      if (!acc[key]) {
        acc[key] = {
          city: flag.city,
          country: flag.country,
          count: 0,
          flags: [],
          imageUrl: flag.avatar_url, // Using user avatar as placeholder if no city image
          lat: flag.latitude,
          lng: flag.longitude,
        };
      }
      // If the group doesn't have coordinates yet but this flag does, update it
      if ((!acc[key].lat || !acc[key].lng) && flag.latitude && flag.longitude) {
        acc[key].lat = flag.latitude;
        acc[key].lng = flag.longitude;
      }

      acc[key].count++;
      acc[key].flags.push(flag);
      return acc;
    },
    {} as Record<
      string,
      {
        city: string;
        country: string;
        count: number;
        flags: any[];
        imageUrl?: string;
        lat?: number;
        lng?: number;
      }
    >
  );

  return {
    flags,
    cityGroups: Object.values(cityGroups).sort((a, b) => b.count - a.count),
    searchParams: { location, startDate, endDate, travelers },
  };
}

export async function action({ request }: Route.ActionArgs) {
  // ... (action remains same)
  const { client, headers } = createSupabaseClient(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create_offer") {
    const flagId = formData.get("flagId") as string;
    const message = formData.get("message") as string;
    // ...
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user)
      return {
        success: false,
        error: "You must be logged in to send an offer",
      };

    const { data: flag } = await client
      .from("flags")
      .select("user_id")
      .eq("id", flagId)
      .single();
    if (!flag) return { success: false, error: "Flag not found" };

    const result = await createOffer(client, {
      senderId: user.id,
      receiverId: flag.user_id,
      flagId: flagId,
      message,
    });

    return result;
  }

  return null;
}

import { CITY_COORDINATES, POPULAR_DESTINATIONS } from "~/lib/constants";

export default function Explore() {
  const { flags, cityGroups, searchParams } = useLoaderData<typeof loader>();

  // Initialize selectedCity from URL param if it matches a popular destination
  const initialCity = useMemo(() => {
    if (!searchParams?.location) return null;
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
  }, [searchParams?.location]);

  const [selectedCity, setSelectedCity] = useState<string | null>(initialCity);
  const [selectedFlag, setSelectedFlag] = useState<any | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);
  const navigation = useNavigation();

  // Sync selectedCity when URL param changes
  useEffect(() => {
    if (initialCity) {
      setSelectedCity(initialCity);
    }
  }, [initialCity]);

  // Determine map center based on search location, or fall back to default
  const initialCenter = useMemo(() => {
    if (searchParams?.location) {
      const locationName = searchParams.location.trim().toLowerCase();

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
    }
    return { lat: 37.5665, lng: 126.978 };
  }, [searchParams?.location]);

  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(searchParams?.location ? 5 : 3);

  // Update map center when URL param changes
  useEffect(() => {
    setMapCenter(initialCenter);
    if (searchParams?.location) {
      setMapZoom(5);
    }
  }, [initialCenter, searchParams?.location]);

  // Update map center when URL param changes
  useEffect(() => {
    setMapCenter(initialCenter);
    if (searchParams?.location) {
      setMapZoom(5);
    }
  }, [initialCenter, searchParams?.location]);

  // Center to user GPS on mount if available, BUT ONLY if no location param
  useEffect(() => {
    if (searchParams?.location) return;
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
  }, [searchParams?.location]);

  const flagsInView = useMemo(() => {
    if (!mapBounds) return [];

    return flags.filter((flag) => {
      const lat = (flag as any).latitude ?? (flag as any).lat;
      const lng = (flag as any).longitude ?? (flag as any).lng;

      if (typeof lat !== "number" || typeof lng !== "number") return false;
      return mapBounds.contains({ lat, lng });
    });
  }, [flags, mapBounds]);

  // Prepare markers: Use all city groups (real data)
  const mapMarkers = cityGroups.map((group) => {
    let lat = group.lat;
    let lng = group.lng;

    // Fallback to CITY_COORDINATES if no lat/lng in data
    if (!lat || !lng) {
      const coords =
        CITY_COORDINATES[group.city.toLowerCase()] ||
        CITY_COORDINATES[group.city];
      if (coords) {
        lat = coords.lat;
        lng = coords.lng;
      } else {
        lat = 37.5665;
        lng = 126.978;
      }
    }

    return {
      id: `${group.city}-${group.country}`,
      lat: lat,
      lng: lng,
      city: group.city,
      country: group.country,
      imageUrl: group.imageUrl,
      count: group.count,
      flags: group.flags,
    };
  });

  const handleMarkerClick = (city: string) => {
    // Just center the map on the clicked marker
    const hit = mapMarkers.find((m) => m.city === city);
    if (hit) {
      setMapCenter({ lat: hit.lat, lng: hit.lng });
      setMapZoom(12);
    }
  };

  const handleOfferSubmit = async (offerData: any) => {
    // In a real app, we would submit via useSubmit or fetcher
    // For this demo, we'll just close the modal
    console.log("Submitting offer:", offerData);
    setIsOfferModalOpen(false);
    // TODO: Implement actual submission logic using useFetcher
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white flex flex-col md:flex-row">
      {/* Left Panel - Search & List */}
      {/* Left Panel - Search & List */}
      <div className="w-full md:w-[60%] lg:w-[65%] flex flex-col border-r border-gray-200 h-[calc(100vh-4rem)] overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Explore Flags
          </h1>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Select
                value={selectedCity || ""}
                onValueChange={(value) => setSelectedCity(value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="여행지 선택..." />
                </SelectTrigger>
                <SelectContent>
                  {POPULAR_DESTINATIONS.map((dest) => (
                    <SelectItem key={dest.city} value={dest.city}>
                      {dest.country} - {dest.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  if (selectedCity) {
                    const dest = POPULAR_DESTINATIONS.find(
                      (d) => d.city === selectedCity
                    );
                    if (dest) {
                      setMapCenter({ lat: dest.lat, lng: dest.lng });
                      setMapZoom(5);
                    }
                  }
                }}
                disabled={!selectedCity}
              >
                지도로 이동
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      const { latitude, longitude } = pos.coords;
                      setMapCenter({ lat: latitude, lng: longitude });
                      setMapZoom(12);
                    },
                    (err) => console.error(err),
                    { enableHighAccuracy: true }
                  );
                }
              }}
            >
              📍 현재 내 위치로 이동
            </Button>
          </div>
        </div>

        {/* City List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Flags List (Visible on Map) */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {mapBounds ? "이 지역의 여행 계획" : "지도 로딩 중..."}
              </h2>
              <span className="text-sm text-gray-500">
                {mapBounds ? `${flagsInView.length}개` : ""}
              </span>
            </div>

            <div className="space-y-4">
              {!mapBounds && (
                <div className="text-center py-10 text-gray-500">
                  지도를 불러오는 중입니다...
                </div>
              )}

              {mapBounds && flagsInView.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  <p className="mb-2">🗺️</p>
                  <p>이 지역에는 아직 등록된 여행 계획이 없어요.</p>
                  <p className="text-sm">지도를 움직여 다른 곳을 찾아보세요!</p>
                </div>
              )}

              {flagsInView.map((flag) => (
                <div
                  key={flag.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    // Optional: Center map on this flag when clicked
                    if (flag.latitude && flag.longitude) {
                      setMapCenter({ lat: flag.latitude, lng: flag.longitude });
                      setMapZoom(12);
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {flag.city}, {flag.country}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(flag.start_date).toLocaleDateString()} -{" "}
                        {new Date(flag.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    {flag.profiles && (
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {flag.profiles.username}
                        </div>
                        <div className="text-xs text-blue-600">
                          Focus: {flag.profiles.focus_score}
                        </div>
                      </div>
                    )}
                  </div>

                  {flag.note && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {flag.note}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-2">
                      {flag.photo_styles &&
                        flag.photo_styles
                          .slice(0, 2)
                          .map((style: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                            >
                              {style}
                            </span>
                          ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800 p-0 h-auto font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFlag(flag);
                        setIsOfferModalOpen(true);
                      }}
                    >
                      오퍼 보내기 →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Map */}
      <div className="hidden md:block w-[40%] lg:w-[35%] bg-gray-100 relative">
        <div className="absolute inset-0 p-4">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Loading Map...
              </div>
            }
          >
            <MapView
              flags={mapMarkers}
              center={mapCenter}
              zoom={mapZoom}
              onMarkerClick={handleMarkerClick}
              onBoundsChange={setMapBounds}
            />
          </Suspense>
        </div>

        {/* Floating Action Button for Mobile (if needed) */}
        <div className="absolute bottom-8 right-8 md:hidden">
          <Button className="rounded-full shadow-lg w-12 h-12 p-0">🗺️</Button>
        </div>
      </div>

      {/* Offer Modal */}
      {selectedFlag && (
        <OfferModal
          isOpen={isOfferModalOpen}
          onClose={() => setIsOfferModalOpen(false)}
          flagData={{
            id: selectedFlag.id,
            destination: selectedFlag.city,
            country: selectedFlag.country,
            startDate: selectedFlag.start_date,
            endDate: selectedFlag.end_date,
            ownerName: selectedFlag.profiles.username,
          }}
          onSubmit={handleOfferSubmit}
        />
      )}
    </div>
  );
}
