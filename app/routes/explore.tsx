import { useEffect, useMemo, useState, Suspense, lazy } from "react";
import { useLoaderData, useNavigation, redirect, useSearchParams, useFetcher, Await } from "react-router";
import { createSupabaseClient } from "~/lib/supabase";
import { getAllActiveFlags, getLoggedInUserId, getOfferCountByFlag } from "~/users/queries";
import type { Route } from "./+types/explore";
import OfferModal from "~/components/OfferModal";
import ProfileModal from "~/components/ProfileModal";
import { createOffer } from "~/users/mutations";
import { POPULAR_DESTINATIONS } from "~/lib/constants";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";

// Extracted Components & Hooks
import ExploreFilters from "~/components/explore/ExploreFilters";
import FlagList from "~/components/explore/FlagList";
import { useExploreMap } from "~/hooks/useExploreMap";

// Lazy load MapView to avoid SSR issues with Leaflet
const MapView = lazy(() => import("~/components/MapView"));

export async function loader({ request }: Route.LoaderArgs) {
  const { client, headers } = createSupabaseClient(request);

  // Require authentication similar to flags page
  const userId = await getLoggedInUserId(client).catch(() => null);

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

  // Promise for flags data
  const flagsPromise = (async () => {
    try {
        const { success, flags, error } = await getAllActiveFlags(client, 100, bounds, type);
        
        if (!success) {
            console.error("❌ Failed to fetch flags:", error);
            throw new Error("Failed to load flags");
        }

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
        return flagsWithCounts;
    } catch (error) {
        console.error("💥 Unexpected error in explore loader:", error);
        return [];
    }
  })();

  return {
    flags: flagsPromise,
    searchParams: { location, startDate, endDate, travelers, type },
    currentUserId: userId,
  };
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

function ExploreContent({ flags, loaderSearchParams, currentUserId }: { flags: any[], loaderSearchParams: any, currentUserId: string | null }) {
    // Hooks
    const [, setSearchParams] = useSearchParams();
    const profileFetcher = useFetcher<any>();
    const {
      mapCenter,
      mapZoom,
      mapBounds,
      initialCity,
      setMapCenter,
      setMapZoom,
      setMapBounds
    } = useExploreMap(flags, loaderSearchParams);
  
    // State
    const [selectedCity, setSelectedCity] = useState<string | null>(initialCity);
    const [selectedFlag, setSelectedFlag] = useState<any | null>(null);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [expandedFlagId, setExpandedFlagId] = useState<string | null>(null);
    const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<string>(loaderSearchParams?.type || "all");
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);
    const [highlightedFlagId, setHighlightedFlagId] = useState<string | null>(null);
  
    // Derived State
    const flagsInView = useMemo(() => {
      if (!mapBounds) return [];
  
      return flags.filter((flag) => {
        const lat = (flag as any).latitude ?? (flag as any).lat;
        const lng = (flag as any).longitude ?? (flag as any).lng;
  
        if (typeof lat !== "number" || typeof lng !== "number") return false;
        return mapBounds.contains({ lat, lng });
      });
    }, [flags, mapBounds]);
  
    // Effects
    useEffect(() => {
      if (initialCity) {
        setSelectedCity(initialCity);
      }
    }, [initialCity]);
  
    // Fetch real user location on mount
    useEffect(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            });
          },
          (err) => {
            console.log("Geolocation permission denied or error:", err);
            setUserLocation(undefined);
          }
        );
      }
    }, []);
  
    useEffect(() => {
      if (profileFetcher.data?.success && profileFetcher.data?.profile) {
        setSelectedProfile(profileFetcher.data.profile);
        setIsProfileModalOpen(true);
      }
    }, [profileFetcher.data]);
  
    // Handlers
    const handleMarkerClick = (marker: any) => {
      // Check if it's a city group (interpolated lat/lng) or individual flag
      
      // If it's a cluster (has 'count' property)
      if (marker.count && marker.latSum) {
          const lat = marker.latSum / marker.count;
          const lng = marker.lngSum / marker.count;
          setMapCenter({ lat, lng });
          
          if (mapZoom < 5) {
              setMapZoom(7);
          } else {
              setMapZoom(13);
          }
          return;
      }
  
      // Individual flag
      const lat = typeof marker.lat === 'number' ? marker.lat : marker.latitude;
      const lng = typeof marker.lng === 'number' ? marker.lng : marker.longitude;
      
      if (typeof lat === 'number' && typeof lng === 'number') {
        setMapCenter({ lat, lng });
        setMapZoom(14); // Zoom close to individual flag
        // Optional: Expand the flag in the list if it's an individual flag
        if (marker.id) {
           // Check if visible in list logic (handled by list component usually)
        }
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
  
    const handleViewOnMap = (flag: any) => {
        if (typeof flag.latitude === 'number' && typeof flag.longitude === 'number') {
          setMapCenter({ lat: flag.latitude, lng: flag.longitude });
          setMapZoom(12);
        }
      };
    
      const handleSendOffer = (flag: any) => {
        if (!currentUserId) {
          window.location.href = "/login";
          return;
        }
        setSelectedFlag({
          id: flag.id,
          destination: flag.city,
          country: flag.country,
          startDate: flag.start_date,
          endDate: flag.end_date,
          ownerName: flag.profiles?.username || "Unknown User",
        });
        setIsOfferModalOpen(true);
      };
    
      const handeCityChange = (value: string) => {
        setSelectedCity(value);
      };
    
      const handleTypeChange = (value: string) => {
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
      };
    
      const handleGoToMap = () => {
        if (selectedCity) {
          const dest = POPULAR_DESTINATIONS.find(
            (d) => d.city === selectedCity
          );
          if (dest) {
            setMapCenter({ lat: dest.lat, lng: dest.lng });
            setMapZoom(5);
          }
        }
      };
    
      const handleCurrentLocation = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              setMapCenter({ lat: latitude, lng: longitude });
              setMapZoom(12);
              setUserLocation({ lat: latitude, lng: longitude }); // Update user location here too
            },
            (err) => console.error(err),
            { enableHighAccuracy: true }
          );
        }
      };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-white flex flex-col md:flex-row">
        {/* Left Panel - Search & List */}
        <div className="w-full md:w-[60%] lg:w-[65%] flex flex-col border-r border-gray-200 h-[calc(100vh-4rem)] overflow-hidden">
        
        <ExploreFilters
            selectedCity={selectedCity}
            selectedType={selectedType}
            onCityChange={handeCityChange}
            onTypeChange={handleTypeChange}
            onGoToMap={handleGoToMap}
            onCurrentLocation={handleCurrentLocation}
        />

        <FlagList
            flags={flagsInView}
            mapBounds={mapBounds}
            expandedFlagId={expandedFlagId}
            currentUserId={currentUserId}
            onToggleExpand={handleToggleExpand}
            onViewOnMap={handleViewOnMap}
            onProfileClick={handleProfileClick}
            onSendOffer={handleSendOffer}
            highlightedFlagId={highlightedFlagId}
        />
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
                flags={flags}
                center={mapCenter}
                zoom={mapZoom}
                onBoundsChange={setMapBounds}
                onMarkerClick={handleMarkerClick}
                userLocation={userLocation}
                selectedFlagId={expandedFlagId}
                onMarkerHover={setHighlightedFlagId}
            />
            </Suspense>
        </div>
        </div>
        
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
            is_verified: selectedProfile.is_verified,
            }}
            userFlags={selectedProfile.userFlags}
        />
        )}
    </div>
    )
}

function ExploreSkeleton() {
    return (
        <div className="min-h-[calc(100vh-4rem)] bg-white flex flex-col md:flex-row">
            <div className="w-full md:w-[60%] lg:w-[65%] flex flex-col border-r border-gray-200 h-[calc(100vh-4rem)] overflow-hidden">
                <div className="p-4 border-b space-y-4">
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-1/3" />
                         <Skeleton className="h-10 w-1/4" />
                    </div>
                </div>
                <div className="p-4 space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))}
                </div>
            </div>
             <div className="hidden md:block w-[40%] lg:w-[35%] bg-gray-100 relative">
                 <Skeleton className="w-full h-full" />
             </div>
        </div>
    )
}

export default function Explore() {
  const { flags, searchParams, currentUserId } = useLoaderData<typeof loader>();

  return (
    <Suspense fallback={<ExploreSkeleton />}>
        <Await resolve={flags}>
            {(resolvedFlags) => <ExploreContent flags={resolvedFlags} loaderSearchParams={searchParams} currentUserId={currentUserId} />}
        </Await>
    </Suspense>
  );
}