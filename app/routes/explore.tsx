import { useState } from "react";
import { useLoaderData, Form, useNavigation } from "react-router";
import { createSupabaseClient } from "~/lib/supabase";
import { getAllActiveFlags, getLoggedInUserId } from "~/users/queries";
import type { Route } from "./+types/explore";
import CityCard from "~/components/CityCard";
import MapView from "~/components/MapView";
import OfferModal from "~/components/OfferModal";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { createOffer } from "~/users/mutations";

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

  // Aggregate flags by city
  const cityGroups = flags.reduce((acc, flag) => {
    const key = `${flag.city}, ${flag.country}`;
    if (!acc[key]) {
      acc[key] = {
        city: flag.city,
        country: flag.country,
        count: 0,
        flags: [],
        imageUrl: flag.avatar_url // Using user avatar as placeholder if no city image
      };
    }
    acc[key].count++;
    acc[key].flags.push(flag);
    return acc;
  }, {} as Record<string, { city: string; country: string; count: number; flags: any[]; imageUrl?: string }>);

  return { 
    flags, 
    cityGroups: Object.values(cityGroups).sort((a, b) => b.count - a.count) 
  };
}

export async function action({ request }: Route.ActionArgs) {
  const { client, headers } = createSupabaseClient(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create_offer") {
    const flagId = formData.get("flagId") as string;
    const message = formData.get("message") as string;
    const location = formData.get("location") as string;
    // Parse JSON arrays
    const preferredDates = JSON.parse(formData.get("preferredDates") as string || "[]");
    const photoStyles = JSON.parse(formData.get("photoStyles") as string || "[]");

    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      return { success: false, error: "You must be logged in to send an offer" };
    }

    // Get flag details to find receiver
    const { data: flag } = await client.from("flags").select("user_id").eq("id", flagId).single();
    if (!flag) {
      return { success: false, error: "Flag not found" };
    }

    const result = await createOffer(client, {
      senderId: user.id,
      receiverId: flag.user_id,
      flagId: flagId,
      message,
      // location_hint: location, // location_hint is not in CreateOfferInput, need to check if we should add it or put in message
      // For now, let's append location to message as a workaround or update the mutation type
    });

    return result;
  }

  return null;
}

export default function Explore() {
  const { flags, cityGroups } = useLoaderData<typeof loader>();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFlag, setSelectedFlag] = useState<any | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const navigation = useNavigation();

  const filteredCities = cityGroups.filter(group => 
    group.city.toLowerCase().includes(searchQuery.toLowerCase()) || 
    group.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="w-full md:w-[400px] lg:w-[450px] flex flex-col border-r border-gray-200 h-[calc(100vh-4rem)] overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Explore Flags</h1>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>

        {/* City List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {filteredCities.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredCities.map((group) => (
                <CityCard
                  key={`${group.city}-${group.country}`}
                  city={group.city}
                  country={group.country}
                  flagCount={group.count}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No destinations found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Map */}
      <div className="hidden md:block flex-1 bg-gray-100 relative">
        <div className="absolute inset-0 p-4">
          <MapView flags={flags} />
        </div>
        
        {/* Floating Action Button for Mobile (if needed) */}
        <div className="absolute bottom-8 right-8 md:hidden">
          <Button className="rounded-full shadow-lg w-12 h-12 p-0">
            🗺️
          </Button>
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
            ownerName: selectedFlag.profiles.username
          }}
          onSubmit={handleOfferSubmit}
        />
      )}
    </div>
  );
}
