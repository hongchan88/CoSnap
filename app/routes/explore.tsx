import { useEffect, useMemo, useState, Suspense, lazy } from "react";
import { useLoaderData, useNavigation, useRevalidator, data, redirect, useSearchParams, useFetcher, Await } from "react-router";
import { createSupabaseClient } from "~/lib/supabase";
import { getAllActiveFlags, getLoggedInUserId, getOfferCountByFlag, getUserOffers, getUserConversations } from "~/users/queries";
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
import { ClientOnly } from "~/components/ClientOnly";
import { parseExploreDates } from "~/lib/explore-dates";
import { normalizeExploreBounds, containsExplorePoint } from "~/lib/explore-bounds";
import { useLanguage } from "~/context/language-context";

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

  const bounds = ([minLat, maxLat, minLng, maxLng].every(Number.isFinite) && minLat >= -90 && maxLat <= 90 && minLat <= maxLat && minLng >= -180 && minLng <= 180 && maxLng >= -180 && maxLng <= 180)
    ? { minLat, maxLat, minLng, maxLng }
    : undefined;

  // Promise for flags data
  const flagsPromise = (async () => {
    try {
        const dates = parseExploreDates(startDate, endDate);
        if (!dates.valid) return { flags: [], error: "invalid_dates" };
        const { success, flags, error } = await getAllActiveFlags(client, 100, bounds, type, dates);
        
        if (!success) {
            console.error("❌ Failed to fetch flags:", error);
            throw new Error("Failed to load flags");
        }

        let flagsWithCounts = flags;
        if (userId) {
          // Optimization: Fetch all my sent offers and conversations once
          const [offersRes, conversationsRes] = await Promise.all([
             getUserOffers(client, userId),
             getUserConversations(client, userId)
          ]);

          const myOffers = offersRes.success ? offersRes.sent : [];
          const myConversations = conversationsRes.success ? conversationsRes.conversations : [];

          // Create lookup maps
          const offerMap = new Map();
          myOffers.forEach((o: any) => {
              offerMap.set(o.flag_id, o);
          });
          
          const conversationMap = new Map();
          // Map conversation by offer_id (most reliable link for this flow)
          myConversations.forEach((c: any) => {
              if (c.offer_id) conversationMap.set(c.offer_id, c);
          });

          flagsWithCounts = await Promise.all(
            flags.map(async (flag) => {
              // If I am the owner, get received offer count
              if (flag.user_id === userId) {
                const { count } = await getOfferCountByFlag(client, flag.id);
                return { ...flag, offer_count: count };
              }
              
              // If I am a viewer, attach my interaction status
              const myOffer = offerMap.get(flag.id);
              let myConversationId = undefined;
              
              if (myOffer && myOffer.status === 'accepted') {
                  const conv = conversationMap.get(myOffer.id);
                  if (conv) myConversationId = conv.id;
              }

              return { 
                  ...flag, 
                  my_offer_status: myOffer?.status,
                  my_conversation_id: myConversationId 
              };
            })
          );
        }
        return { flags: flagsWithCounts, error: null };
    } catch (error) {
        console.error("💥 Unexpected error in explore loader:", error);
        return { flags: [], error: "load_failed" };
    }
  })();

  return data({
    flags: flagsPromise,
    searchParams: { location, startDate, endDate, travelers, type },
    currentUserId: userId,
  }, { headers });
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

function ExploreContent({ flags, error, loaderSearchParams, currentUserId }: { flags: any[], error: string | null, loaderSearchParams: any, currentUserId: string | null }) {
    // Hooks
    const [urlSearchParams, setSearchParams] = useSearchParams();
    const { language, t } = useLanguage();
    const navigation = useNavigation();
    const revalidator = useRevalidator();
    const [mobileMapOpen, setMobileMapOpen] = useState(false);
    const [locationError, setLocationError] = useState(false);
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
        return containsExplorePoint(normalizeExploreBounds(mapBounds.getSouth(), mapBounds.getNorth(), mapBounds.getWest(), mapBounds.getEast()), lat, lng);
      });
    }, [flags, mapBounds]);
  
    // Debounce map requests; rounded bounds avoid subpixel revalidation loops.
    useEffect(() => {
      if (!mapBounds) return;
      const normalized = normalizeExploreBounds(mapBounds.getSouth(), mapBounds.getNorth(), mapBounds.getWest(), mapBounds.getEast());
      const bounds = Object.fromEntries(Object.entries(normalized).map(([key, value]) => [key, value.toFixed(4)]));
      if (Object.entries(bounds).every(([key, value]) => urlSearchParams.get(key) === value)) return;
      const timer = setTimeout(() => {
        setSearchParams(prev => {
          const next = new URLSearchParams(prev);
          Object.entries(bounds).forEach(([key, value]) => next.set(key, value));
          return next;
        }, { replace: true, preventScrollReset: true });
      }, 400);
      return () => clearTimeout(timer);
    }, [mapBounds, urlSearchParams, setSearchParams]);

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

      const handleDateChange = (key: "startDate" | "endDate", value: string) => {
        setSearchParams(prev => {
          const next = new URLSearchParams(prev);
          if (value) next.set(key, value); else next.delete(key);
          return next;
        }, { preventScrollReset: true });
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
            setMapZoom(8);
            setSearchParams(prev => {
              const next = new URLSearchParams(prev);
              next.set("location", selectedCity);
              ["minLat", "maxLat", "minLng", "maxLng"].forEach(key => next.delete(key));
              return next;
            }, { preventScrollReset: true });
          }
        }
      };
    
      const handleCurrentLocation = () => {
        setLocationError(false);
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              setMapCenter({ lat: latitude, lng: longitude });
              setMapZoom(12);
              setUserLocation({ lat: latitude, lng: longitude }); // Update user location here too
            },
            () => setLocationError(true),
            { enableHighAccuracy: true, timeout: 10000 }
          );
        } else {
          setLocationError(true);
        }
      };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-white flex flex-col md:flex-row">
        {/* Left Panel - Search & List */}
        <div className={`${mobileMapOpen ? "hidden md:flex" : "flex"} w-full md:w-[60%] lg:w-[65%] flex-col border-r border-gray-200 h-[calc(100vh-4rem)] overflow-hidden`}>
        
        <ExploreFilters
            selectedCity={selectedCity}
            selectedType={selectedType}
            onCityChange={handeCityChange}
            onTypeChange={handleTypeChange}
            onGoToMap={handleGoToMap}
            onCurrentLocation={handleCurrentLocation}
            startDate={loaderSearchParams.startDate || ""}
            endDate={loaderSearchParams.endDate || ""}
            onDateChange={handleDateChange}
        />
        {locationError && <p role="status" className="px-4 py-2 text-sm text-amber-800">{language === "ko" ? "위치를 가져올 수 없습니다. 도시를 선택해 주세요." : "Location unavailable. Please select a city instead."}</p>}
        {navigation.state !== "idle" && <p role="status" className="px-4 py-2 text-sm">{language === "ko" ? "검색 중…" : "Searching…"}</p>}
        {error && <div role="alert" className="m-4 rounded-lg border border-red-200 p-4 text-sm text-red-800">
          <p>{error === "invalid_dates" ? (language === "ko" ? "시작일과 종료일을 확인해 주세요." : "Please check your start and end dates.") : (language === "ko" ? "일정을 불러오지 못했습니다." : "Could not load travel plans.")}</p>
          {error !== "invalid_dates" && <Button variant="outline" className="mt-2" onClick={() => revalidator.revalidate()} disabled={revalidator.state !== "idle"}>{language === "ko" ? "다시 시도" : "Try again"}</Button>}
        </div>}
        {!error && <>

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
        {flags.length >= 100 && <p className="px-4 pb-4 text-sm text-gray-600">{language === "ko" ? "현재 지역의 최대 100개 결과입니다. 지도를 확대하거나 날짜를 선택해 주세요." : "Showing up to 100 results. Zoom in or select dates to narrow your search."}</p>}
        </>}
        </div>

        {/* Right Panel - Map */}
        <div className={`${mobileMapOpen ? "block w-full h-[calc(100dvh-4rem)]" : "hidden"} md:block md:w-[40%] lg:w-[35%] bg-gray-100 relative`}>
        <div className="absolute inset-0 p-4">
            <ClientOnly fallback={<div className="p-4 text-gray-500">{t("explore.loadingMap")}</div>}>
            {() => <Suspense
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
            </Suspense>}
            </ClientOnly>
        </div>
        </div>
        
        {/* Floating Action Button for Mobile (if needed) */}
        <div className="fixed bottom-8 right-8 z-[1000] md:hidden">
        <Button aria-label={mobileMapOpen ? t("explore.travelPlansInArea") : t("explore.goToMap")} aria-pressed={mobileMapOpen} onClick={() => setMobileMapOpen(open => !open)} className="rounded-full shadow-lg px-5">{mobileMapOpen ? (language === "ko" ? "목록 보기" : "Show list") : (language === "ko" ? "지도 보기" : "Show map")}</Button>
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
             <div className="hidden md:block md:w-[40%] lg:w-[35%] bg-gray-100 relative">
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
            {(result) => <ExploreContent flags={result.flags} error={result.error} loaderSearchParams={searchParams} currentUserId={currentUserId} />}
        </Await>
    </Suspense>
  );
}