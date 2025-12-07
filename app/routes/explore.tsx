import { useEffect, useMemo, useState, Suspense, lazy } from "react";
import { useLoaderData, Form, useNavigation, redirect, useSearchParams, useFetcher } from "react-router";
import type { LatLngBounds } from "leaflet";
import { createSupabaseClient } from "~/lib/supabase";
import { getAllActiveFlags, getLoggedInUserId, getOfferCountByFlag } from "~/users/queries";
import type { Route } from "./+types/explore";
import CityCard from "~/components/CityCard";
import OfferModal from "~/components/OfferModal";
import ProfileModal from "~/components/ProfileModal";
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
  console.log("🔍 Explore loader started");

  try {
    const { client, headers } = createSupabaseClient(request);
    console.log("✅ Supabase client created successfully");

    // Require authentication similar to flags page
    const userId = await getLoggedInUserId(client).catch(() => null);
    console.log("👤 User ID:", userId || "Not logged in");

    // Parse search params
    const url = new URL(request.url);
    const location = url.searchParams.get("location")?.toLowerCase() || null;
    const startDate = url.searchParams.get("startDate") || null;
    const endDate = url.searchParams.get("endDate") || null;
    const type = url.searchParams.get("type") || "all";
    const travelers = parseInt(url.searchParams.get("travelers") || "1");
    
    // Parse bounds if available
    const minLat = parseFloat(url.searchParams.get("minLat") || "");
    const maxLat = parseFloat(url.searchParams.get("maxLat") || "");
    const minLng = parseFloat(url.searchParams.get("minLng") || "");
    const maxLng = parseFloat(url.searchParams.get("maxLng") || "");

    const bounds = (!isNaN(minLat) && !isNaN(maxLat) && !isNaN(minLng) && !isNaN(maxLng))
      ? { minLat, maxLat, minLng, maxLng }
      : undefined;

    // Fetch active flags
    console.log("🚩 Fetching active flags...", bounds ? `with bounds: ${JSON.stringify(bounds)}` : "no bounds", `type: ${type}`);
    const { success, flags, error } = await getAllActiveFlags(client, 100, bounds, type);

    console.log("📊 Flag fetch results:");
    console.log("  Success:", success);
    console.log("  Error:", error);
    console.log("  Flags count:", flags?.length || 0);
    console.log("  Flags data:", flags);

    if (!success) {
      console.error("❌ Failed to fetch flags:", error);
      throw new Response("Failed to load flags", { status: 500 });
    }

    // If user is logged in, fetch offer counts for their flags
    let flagsWithCounts = flags;
    if (userId) {
      flagsWithCounts = await Promise.all(
        flags.map(async (flag) => {
          if (flag.user_id === userId) {
            const { count } = await getOfferCountByFlag(client, flag.id);
            return { ...flag, offer_count: count };
          }
          return flag;
        })
      );
    }

    // No server-side filtering - return all active flags
    // Aggregate flags by city for map markers
    const cityGroups = flagsWithCounts.reduce(
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
      flags: flagsWithCounts,
      cityGroups: Object.values(cityGroups).sort((a, b) => b.count - a.count),
      searchParams: { location, startDate, endDate, travelers, type },
      currentUserId: userId,
    };
  } catch (error) {
    console.error("💥 Unexpected error in explore loader:", error);
    throw new Response("Internal server error", { status: 500 });
  }
}

export async function action({ request }: Route.ActionArgs) {
  const { client, headers } = createSupabaseClient(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create_offer") {
    const flagId = formData.get("flagId") as string;
    const message = formData.get("message") as string;

    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) {
      return redirect("/login");
    }

    // Check if sender has a profile before allowing offer creation
    const { data: senderProfile } = await client
      .from("profiles")
      .select("profile_id")
      .eq("profile_id", user.id)
      .single();

    if (!senderProfile) {
      return {
        success: false,
        error: "error.profile.notFound"
      };
    }

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

import { CITY_COORDINATES, POPULAR_DESTINATIONS, PHOTO_STYLE_ICONS_RECORD } from "~/lib/constants";
import { useLanguage } from "~/context/language-context";

export default function Explore() {
  const { flags, cityGroups, searchParams, currentUserId } = useLoaderData<typeof loader>();
  const { t } = useLanguage();

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
  const [expandedFlagId, setExpandedFlagId] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>(searchParams?.type || "all");
  const navigation = useNavigation();
  const [, setSearchParams] = useSearchParams();
  const profileFetcher = useFetcher<any>();

  // Sync selectedCity when URL param changes
  useEffect(() => {
    if (initialCity) {
      setSelectedCity(initialCity);
    }
  }, [initialCity]);

  // Handle profile data from fetcher
  useEffect(() => {
    if (profileFetcher.data?.success && profileFetcher.data?.profile) {
      setSelectedProfile(profileFetcher.data.profile);
      setIsProfileModalOpen(true);
    }
  }, [profileFetcher.data]);

  // Update URL params when map bounds change (debounced)
  useEffect(() => {
    if (!mapBounds) return;

    const timeoutId = setTimeout(() => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("minLat", mapBounds.getSouth().toFixed(4));
        newParams.set("maxLat", mapBounds.getNorth().toFixed(4));
        newParams.set("minLng", mapBounds.getWest().toFixed(4));
        newParams.set("maxLng", mapBounds.getEast().toFixed(4));
        if (selectedType && selectedType !== "all") {
          newParams.set("type", selectedType);
        } else {
          newParams.delete("type");
        }
        return newParams;
      });
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [mapBounds, setSearchParams]);

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

  const postsInView = useMemo(() => {
    return [];
  }, []);

  // Prepare markers: Use all city groups (real data)
  const mapCityGroups = useMemo(() => {
    return cityGroups.map((group) => {
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
        type: "city_group"
      };
    });
  }, [cityGroups]);

  const handleMarkerClick = (marker: any) => {
    if (marker.type === "city_group") {
      setMapCenter({ lat: marker.lat, lng: marker.lng });
      setMapZoom(12);
    }
  };

  const handleToggleExpand = (flagId: string) => {
    setExpandedFlagId(prev => prev === flagId ? null : flagId);
  };


  const handleProfileClick = (flag: any) => {
    const userId = flag.user_id;
    
    if (!userId) {
      console.error("No user ID found in flag object");
      // Show basic profile info without flag history
      setSelectedProfile({
        username: flag.profiles?.username || 'Unknown User',
        avatar_url: flag.profiles?.avatar_url,
        focus_score: flag.profiles?.focus_score || 0,
        focus_tier: flag.profiles?.focus_tier || 'Blurry',
        camera_gear: flag.profiles?.camera_gear,
        languages: flag.profiles?.languages,
        bio: flag.profiles?.bio,
        is_verified: flag.profiles?.is_verified || false,
        userFlags: []
      });
      setIsProfileModalOpen(true);
      return;
    }

    // Fetch profile data via SSR
    profileFetcher.load(`/api/user-profile/${userId}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white flex flex-col md:flex-row">
      {/* Left Panel - Search & List */}
      <div className="w-full md:w-[60%] lg:w-[65%] flex flex-col border-r border-gray-200 h-[calc(100vh-4rem)] overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t("explore.title")}
          </h1>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Select
                value={selectedCity || ""}
                onValueChange={(value) => setSelectedCity(value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t("explore.selectDestination")} />
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
                {t("explore.goToMap")}
              </Button>
            </div>

            {/* Type Filter */}
            <Select
              value={selectedType}
              onValueChange={(value) => {
                setSelectedType(value);
                setSearchParams((prev) => {
                  const newParams = new URLSearchParams(prev);
                  if (value && value !== "all") {
                    newParams.set("type", value);
                  } else {
                    newParams.delete("type");
                  }
                  return newParams;
                });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="meet">👋 Meetup</SelectItem>
                <SelectItem value="help">🙏 Help Needed</SelectItem>
                <SelectItem value="emergency">🚨 Emergency</SelectItem>
                <SelectItem value="free">🎁 Free / Giveaway</SelectItem>
                <SelectItem value="photo">📷 Photo Exchange</SelectItem>
                <SelectItem value="offer">🤝 Offer Help</SelectItem>
              </SelectContent>
            </Select>

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
              {t("explore.currentLocation")}
            </Button>
          </div>
        </div>

        {/* City List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Flags List (Visible on Map) */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {mapBounds ? t("explore.travelPlansInArea") : t("explore.loadingMap")}
              </h2>
              <span className="text-sm text-gray-500">
                {mapBounds ? `${flagsInView.length + postsInView.length} items` : ""}
              </span>
            </div>

            <div className="space-y-4">
              {!mapBounds && (
                <div className="text-center py-10 text-gray-500">
                  {t("explore.loadingMap")}
                </div>
              )}

              {mapBounds && flagsInView.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  <p className="mb-2">🗺️</p>
                  <p>{t("explore.noPlansInArea")}</p>
                  <p className="text-sm">{t("explore.moveMapToFind")}</p>
                </div>
              )}

              {flagsInView.map((flag) => {
                const isExpanded = expandedFlagId === flag.id;
                return (
                  <div
                    key={flag.id}
                    className={`bg-white rounded-xl border ${
                      isExpanded ? 'border-blue-300 shadow-lg' : 'border-gray-200'
                    } p-4 hover:shadow-md transition-all cursor-pointer`}
                    onClick={() => {
                      handleToggleExpand(flag.id);
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
                      <div className="flex items-center gap-2">
                        {flag.profiles && (
                          <button
                            className="text-right hover:bg-gray-50 rounded-lg p-2 transition-colors cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProfileClick(flag);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              {flag.profiles.avatar_url ? (
                                <img
                                  src={flag.profiles.avatar_url}
                                  alt={flag.profiles.username}
                                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                                  {flag.profiles.username.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                  {flag.profiles.username}
                                </div>
                                <div className="text-xs text-blue-600">
                                  Focus: {flag.profiles.focus_score}
                                </div>
                              </div>
                            </div>
                          </button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-6 w-6 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleExpand(flag.id);
                          }}
                        >
                          <svg
                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7" />
                          </svg>
                        </Button>
                      </div>
                    </div>

                    {flag.note && (
                      <div className={`${isExpanded ? '' : 'line-clamp-2'}`}>
                        <p className="text-gray-600 text-sm mb-3">
                          {flag.note}
                        </p>
                      </div>
                    )}

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">

                        {/* Photo Styles */}
                        {flag.styles && flag.styles.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">{t("explore.photoStyles")}</h4>
                            <div className="flex flex-wrap gap-2">
                              {flag.styles.map((style: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1"
                                >
                                  <span>{PHOTO_STYLE_ICONS_RECORD[style] || '📷'}</span>
                                  {style}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Flag Details */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">{t("explore.travelDetails")}</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div>
                              <span className="font-medium">{t("explore.startDate")}</span> {new Date(flag.start_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <div>
                              <span className="font-medium">{t("explore.endDate")}</span> {new Date(flag.end_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <div>
                              <span className="font-medium">{t("explore.duration")}</span> {Math.ceil((new Date(flag.end_date).getTime() - new Date(flag.start_date).getTime()) / (1000 * 60 * 60 * 24))} {t("explore.days")}
                            </div>
                            <div>
                              <span className="font-medium">{t("explore.planType")}</span> {flag.source_policy_type === 'premium' ? t("flagCard.premium") : t("explore.free")}
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                      <div className="flex gap-2 flex-wrap">
                        {!isExpanded && flag.styles &&
                          flag.styles
                            .slice(0, 2)
                            .map((style: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center gap-1"
                              >
                                <span>{PHOTO_STYLE_ICONS_RECORD[style] || '📷'}</span>
                                {style}
                              </span>
                            ))}
                      </div>

                      <div className="flex gap-2 ml-auto">
                        {/* 지도에서 가까이 보기 버튼 */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (flag.latitude && flag.longitude) {
                              setMapCenter({ lat: flag.latitude, lng: flag.longitude });
                              setMapZoom(12);
                            }
                          }}
                        >
                          {t("explore.viewOnMap")}
                        </Button>

                        {currentUserId === flag.user_id ? (
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100">
                            <span className="text-xs font-medium text-yellow-700">
                              {t("explore.receivedOffers")} {(flag as any).offer_count || 0}{t("explore.count")}
                            </span>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!currentUserId) {
                                window.location.href = "/login";
                                return;
                              }
                              // Map data to match OfferModal expectations
                              setSelectedFlag({
                                id: flag.id,
                                destination: flag.city,
                                country: flag.country,
                                startDate: flag.start_date,
                                endDate: flag.end_date,
                                ownerName: flag.profiles?.username || "Unknown User",
                              });
                              setIsOfferModalOpen(true);
                            }}
                          >
                            {t("explore.sendOffer")}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
              flags={mapCityGroups}
              center={mapCenter}
              zoom={mapZoom}
              onBoundsChange={setMapBounds}
              onMarkerClick={handleMarkerClick}
              userLocation={
                navigator.geolocation
                  ? {
                      lat: mapCenter.lat,
                      lng: mapCenter.lng,
                    }
                  : undefined
              }
            />
          </Suspense>
        </div>
      </div>
      
      {/* Other Modals... */}
      
      {/* Floating Action Button for Mobile (if needed) */}
      <div className="absolute bottom-8 right-8 md:hidden">
        <Button className="rounded-full shadow-lg w-12 h-12 p-0">🗺️</Button>
      </div>

      {/* Offer Modal */}
      {selectedFlag && (
        <OfferModal
          isOpen={isOfferModalOpen}
          onClose={() => setIsOfferModalOpen(false)}
          flagData={selectedFlag}
        />
      )}

      {/* Profile Modal */}
      {selectedProfile && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          profile={{
            username: selectedProfile.username,
            avatar_url: selectedProfile.avatar_url,
            focus_score: selectedProfile.focus_score,
            focus_tier: selectedProfile.focus_tier,
            camera_gear: selectedProfile.camera_gear,
            languages: selectedProfile.languages,
            bio: selectedProfile.bio,
            is_verified: selectedProfile.is_verified || false,
          }}
          userFlags={selectedProfile.userFlags || []}
        />
      )}
    </div>
  );
}