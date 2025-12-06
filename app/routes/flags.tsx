import { createSupabaseClient } from "~/lib/supabase";
import type { Route } from "./+types/flags";
import { useState, Suspense, useMemo, useEffect } from "react";
import {
  useActionData,
  useNavigation,
  useLoaderData,
  Await,
  useFetcher,
} from "react-router";
import FlagForm from "../components/FlagForm";
import FlagCard from "../components/FlagCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Notification from "../components/ui/Notification";
import { Skeleton } from "../components/ui/skeleton";
import Modal from "../components/ui/Modal";
import {
  getLoggedInUserId,
  getUserFlags,
  getUserOffers,
} from "~/users/queries";
import { createFlag, updateFlag, deleteFlag } from "~/users/mutations";
import { useLanguage } from "~/context/language-context";

// Flag data interface for form handling
interface FlagData {
  id: string;
  city: string;
  country: string;
  flag: string;
  startDate: string;
  endDate: string;
  note?: string;
  status: "active" | "expired" | "hidden";
  offerCount: number;
  styles: string[];
  languages: string[];
  offers: any[];
  sentOffers?: any[];
  latitude?: number;
  longitude?: number;
  isSentOfferFlag?: boolean;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Travel Plans - CoSnap" },
    {
      name: "description",
      content: "Create and manage your travel plans (Flags)",
    },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = createSupabaseClient(request);
  const userId = await getLoggedInUserId(client);
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 5; // Load 5 flags per page

  // Fetch real user flags and offers from database
  // If it's a pagination request (page > 1), return JSON directly
  if (page > 1) {
    const [flagsResult, offersResult, offersCount] = await Promise.all([
      getUserFlags(client, userId, page, limit),
      getUserOffers(client, userId),
      client.from("offers").select("*", { count: "exact", head: true }),
    ]);

    if (!flagsResult.success) {
      return {
        flags: [],
        count: 0,
        receivedOffers: [],
        sentOffers: [],
        userId,
        page,
      };
    }

    return {
      flags: flagsResult.flags,
      count: flagsResult.count || 0,
      receivedOffers: offersResult.success ? offersResult.received : [],
      sentOffers: offersResult.success ? offersResult.sent : [],
      userId,
      page,
    };
  }

  // Initial load: use defer for better UX
  const dataPromise = Promise.all([
    getUserFlags(client, userId, page, limit),
    getUserOffers(client, userId),
    // Debug: Check total offers in database
    client.from("offers").select("*", { count: "exact", head: true }),
  ]).then(([flagsResult, offersResult, offersCount]) => {
    if (!flagsResult.success) {
      console.error("Failed to fetch user flags:", flagsResult.error);
      return {
        flags: [],
        count: 0,
        receivedOffers: [],
        sentOffers: [],
        userId,
        page,
      };
    }

    console.log("=== FLAGS LOADER DEBUG ===");
    console.log("User ID:", userId);
    console.log("Page:", page);
    console.log("User Flags Fetched:", flagsResult.flags.length);
    console.log("Total User Flags:", flagsResult.count);

    return {
      flags: flagsResult.flags,
      count: flagsResult.count || 0,
      receivedOffers: offersResult.success ? offersResult.received : [],
      sentOffers: offersResult.success ? offersResult.sent : [],
      userId,
      page,
    };
  });

  return { dataPromise };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = createSupabaseClient(request);
  const formData = await request.formData();
  const userId = await getLoggedInUserId(client);
  const intent = formData.get("intent");
  if (intent === "create") {
    // Create flag
    const city = formData.get("city") as string;
    const country = formData.get("country") as string;

    // Get coordinates from form (client-side picker) or fallback to server-side geocoding
    let lat = formData.get("latitude")
      ? parseFloat(formData.get("latitude") as string)
      : null;
    let lng = formData.get("longitude")
      ? parseFloat(formData.get("longitude") as string)
      : null;


    const { success, data, error } = await createFlag(client, {
      city: city,
      country: country,
      latitude: lat,
      longitude: lng,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      note: (formData.get("note") as string) || undefined,
      styles: JSON.parse((formData.get("photoStyles") as string) || "[]"),
      languages: JSON.parse((formData.get("languages") as string) || "[]"),
      user_id: userId,
    });

    if (!success) {
      return { success: false, error: error || "Failed to create flag" };
    }

    return { success: true, data, action: "create" };
  }

  if (intent === "update") {
    // Update flag
    const flagId = formData.get("flagId") as string;

    // Check if coordinates are updated
    let lat = formData.get("latitude")
      ? parseFloat(formData.get("latitude") as string)
      : undefined;
    let lng = formData.get("longitude")
      ? parseFloat(formData.get("longitude") as string)
      : undefined;

    // If city/country changed but no coordinates sent (unlikely with new form, but possible),
    // we might want to re-geocode?
    // For now, assume client sends coordinates if they picked a location.
    // If they just changed text, client form should have updated coordinates via map.

    const { success, data, error } = await updateFlag(client, flagId, {
      city: formData.get("city") as string,
      country: formData.get("country") as string,
      latitude: lat,
      longitude: lng,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      note: (formData.get("note") as string) || undefined,
      styles: JSON.parse((formData.get("photoStyles") as string) || "[]"),
      languages: JSON.parse((formData.get("languages") as string) || "[]"),
    });

    if (!success) {
      return { success: false, error: error || "Failed to update flag" };
    }

    return { success: true, data, action: "update" };
  }

  if (intent === "delete") {
    // Delete flag
    const flagId = formData.get("flagId") as string;
    const { success, error } = await deleteFlag(client, flagId, userId);

    if (!success) {
      return { success: false, error: error || "Failed to delete flag" };
    }

    return { success: true, action: "delete" };
  }

  return { success: false, error: "Invalid action" };
};

function FlagsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  <Skeleton className="w-16 h-12 rounded-md" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FlagsContent({
  initialFlags,
  receivedOffers,
  sentOffers,
  userId,
}: {
  initialFlags: any[];
  receivedOffers: any[];
  sentOffers: any[];
  userId: string;
}) {
  const { t } = useLanguage();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [isCreatingFlag, setIsCreatingFlag] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FlagData | null>(null);
  const isSubmitting = navigation.state === "submitting";

  const getCountryFlag = (countryCode: string): string => {
    const flags: { [key: string]: string } = {
      JP: "🇯🇵",
      KR: "🇰🇷",
      US: "🇺🇸",
      FR: "🇫🇷",
      IT: "🇮🇹",
      GB: "🇬🇧",
      CN: "🇨🇳",
      TH: "🇹🇭",
      VN: "🇻🇳",
      TW: "🇹🇼",
    };
    return flags[countryCode] || "🌍";
  };

  // Group received offers by flag
  const receivedOffersByFlag = receivedOffers.reduce((acc: any, offer: any) => {
    if (!acc[offer.flag_id]) {
      acc[offer.flag_id] = [];
    }
    acc[offer.flag_id].push(offer);
    return acc;
  }, {});

  // Group sent offers by flag
  const sentOffersByFlag = sentOffers.reduce((acc: any, offer: any) => {
    if (!acc[offer.flag_id]) {
      acc[offer.flag_id] = [];
    }
    acc[offer.flag_id].push(offer);
    return acc;
  }, {});

  // Get flags where user sent offers (but doesn't own)
  const flagsWithSentOffers = sentOffers
    .filter((offer: any) => {
      const hasFlag = !!offer.flag;
      const flagUserId = offer.flag?.user_id;
      const isNotOwner = flagUserId && flagUserId !== userId;
      return hasFlag && isNotOwner;
    })
    .map((offer: any) => ({
      ...offer.flag,
      sentOffers: sentOffersByFlag[offer.flag_id] || [],
      isSentOfferFlag: true,
    }));

  // Remove duplicates
  const uniqueFlagsWithSentOffers = Array.from(
    new Map(flagsWithSentOffers.map((flag: any) => [flag.id, flag])).values()
  );

  const getCountryName = (countryCode: string): string => {
    const names: { [key: string]: string } = {
      JP: "일본",
      KR: "한국",
      US: "미국",
      FR: "프랑스",
      IT: "이탈리아",
      GB: "영국",
      CN: "중국",
      TH: "태국",
      VN: "베트남",
      TW: "대만",
    };
    return names[countryCode] || countryCode;
  };

  // Convert database flags to FlagData format
  const formatDateOnly = (value: string | undefined) =>
    value ? new Date(value).toISOString().slice(0, 10) : "";

  // Pagination state
  const [allFlags, setAllFlags] = useState<FlagData[]>(() => {
    // Initial flags from loader
    const initialFlagData = [
      ...initialFlags.map((flag: any) => ({
        id: flag.id,
        city: flag.city,
        country: flag.country,
        flag: getCountryFlag(flag.country),
        startDate: formatDateOnly(flag.start_date || flag.startDate),
        endDate: formatDateOnly(flag.end_date || flag.endDate),
        note: flag.note || undefined,
        status: flag.visibility_status as "active" | "expired" | "hidden",
        offerCount: (receivedOffersByFlag[flag.id] || []).length,
        styles: flag.styles || [],
        languages: flag.languages || [],
        offers: receivedOffersByFlag[flag.id] || [],
        latitude: flag.latitude,
        longitude: flag.longitude,
        isSentOfferFlag: false,
      })),
      ...uniqueFlagsWithSentOffers.map((flag: any) => ({
        id: flag.id,
        city: flag.city,
        country: flag.country,
        flag: getCountryFlag(flag.country),
        startDate: formatDateOnly(flag.start_date || flag.startDate),
        endDate: formatDateOnly(flag.end_date || flag.endDate),
        note: flag.note || undefined,
        status: flag.visibility_status as "active" | "expired" | "hidden",
        offerCount: (flag.sentOffers || []).length,
        styles: flag.styles || [],
        languages: flag.languages || [],
        offers: flag.sentOffers || [],
        latitude: flag.latitude,
        longitude: flag.longitude,
        isSentOfferFlag: true,
      })),
    ];
    return initialFlagData;
  });

  const [page, setPage] = useState(1);
  const fetcher = useFetcher();
  const [hasMore, setHasMore] = useState(true); // Assume true initially or check count

  // Update flags when fetcher loads more data
  useEffect(() => {
    if (fetcher.data && fetcher.data.flags) {
      const newFlags = fetcher.data.flags;
      if (newFlags.length === 0) {
        setHasMore(false);
        return;
      }

      const newFlagData = newFlags.map((flag: any) => ({
        id: flag.id,
        city: flag.city,
        country: flag.country,
        flag: getCountryFlag(flag.country),
        startDate: formatDateOnly(flag.start_date || flag.startDate),
        endDate: formatDateOnly(flag.end_date || flag.endDate),
        note: flag.note || undefined,
        status: flag.visibility_status as "active" | "expired" | "hidden",
        offerCount: (receivedOffersByFlag[flag.id] || []).length, // Note: offers might need refetching or separate handling
        styles: flag.styles || [],
        languages: flag.languages || [],
        offers: receivedOffersByFlag[flag.id] || [],
        latitude: flag.latitude,
        longitude: flag.longitude,
        isSentOfferFlag: false,
      }));

      setAllFlags((prev) => {
        // Filter out duplicates just in case
        const existingIds = new Set(prev.map((f) => f.id));
        const uniqueNewFlags = newFlagData.filter(
          (f: any) => !existingIds.has(f.id)
        );
        return [...prev, ...uniqueNewFlags];
      });

      if (newFlags.length < 5) {
        // Assuming limit is 5
        setHasMore(false);
      }
    }
  }, [fetcher.data]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetcher.load(`/flags?page=${nextPage}`);
  };

  // Use allFlags instead of flags state for rendering
  const flags = allFlags;

  const handleSubmitFlag = async (formData: any) => {
    // Create a form and submit it
    const form = document.createElement("form");
    form.method = "post";
    // Add hidden inputs for all form data
    const formInputs = {
      intent: editingFlag ? "update" : "create",
      flagId: editingFlag?.id || "",
      city: formData.city,
      country: formData.country,
      startDate: formData.startDate,
      endDate: formData.endDate,
      note: formData.note || "",
      photoStyles: JSON.stringify(formData.photoStyles),
      languages: JSON.stringify(formData.languages),
      latitude: formData.latitude,
      longitude: formData.longitude,
    };

    Object.entries(formInputs).forEach(([key, value]) => {
      if (value) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value.toString();
        form.appendChild(input);
      }
    });

    document.body.appendChild(form);
    form.submit();
  };

  const handleEditFlagClick = (flag: FlagData) => {
    setEditingFlag(flag);
    setIsCreatingFlag(false);
  };

  const handleDeleteFlag = (flagId: string) => {
    if (confirm(t("flags.deleteConfirm"))) {
      const form = document.createElement("form");
      form.method = "post";
      form.innerHTML = `
        <input type="hidden" name="intent" value="delete">
        <input type="hidden" name="flagId" value="${flagId}">
      `;
      document.body.appendChild(form);
      form.submit();
    }
  };

  // Combine user's own flags with flags they sent offers to
  const allActiveFlags = [
    ...flags.filter(
      (flag) => flag.status === "active" && !flag.isSentOfferFlag
    ), // User's own active flags
    ...flags.filter((flag) => flag.status === "active" && flag.isSentOfferFlag), // Active flags where user sent offers
  ];

  const activeFlags = allActiveFlags.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const pastFlags = flags
    .filter(
      (flag) => flag.status === "expired" || new Date(flag.endDate) < new Date()
    )
    .sort(
      (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
    ); // Sort past flags by end date descending

  const formInitialData = useMemo(
    () =>
      editingFlag
        ? {
            id: editingFlag.id,
            city: editingFlag.city.split(", ")[0],
            country: editingFlag.country,
            startDate: formatDateOnly(editingFlag.startDate),
            endDate: formatDateOnly(editingFlag.endDate),
            note: editingFlag.note,
            photoStyles: editingFlag.styles,
            languages: editingFlag.languages,
            latitude: (editingFlag as any).latitude,
            longitude: (editingFlag as any).longitude,
          }
        : undefined,
    [editingFlag]
  );

  return (
    <>
      {/* 알림 */}
      {actionData && (
        <div className="mb-6">
          <Notification
            type={actionData.success ? "success" : "error"}
            message={
              actionData.error ||
              (actionData.action === "create"
                ? t("flags.notification.created")
                : actionData.action === "update"
                  ? t("flags.notification.updated")
                  : actionData.action === "delete"
                    ? t("flags.notification.deleted")
                    : "")
            }
            onClose={() => window.location.reload()}
            autoClose={actionData.success}
          />
        </div>
      )}

      {/* Flag 생성 폼 (상단) */}
      {isCreatingFlag && !editingFlag && (
        <div className="mb-8">
          <FlagForm
            key="create"
            onSubmit={handleSubmitFlag}
            onCancel={() => {
              setIsCreatingFlag(false);
              setEditingFlag(null);
            }}
            isEditing={false}
          />
        </div>
      )}

      {/* 새 Flag 만들기 버튼 */}
      {!isCreatingFlag && !editingFlag && (
        <div className="mb-8">
          <button
            onClick={() => {
              setIsCreatingFlag(true);
              setEditingFlag(null);
            }}
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                {t("flags.processing")}
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {t("flags.createButton")}
              </>
            )}
          </button>
        </div>
      )}

      {/* 활성 Flag 목록 */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">
            {t("flags.activeSection")} ({activeFlags.length})
          </h2>

          {activeFlags.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-500">{t("flags.emptyActive")}</p>
              <p className="text-sm text-gray-400 mt-2">
                {t("flags.emptyActiveSub")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeFlags.map((flag) =>
                editingFlag?.id === flag.id ? (
                  <div
                    key={flag.id}
                    className="border rounded-xl p-4 bg-white shadow-sm ring-2 ring-blue-500 ring-offset-2"
                  >
                    <FlagForm
                      key={flag.id}
                      onSubmit={handleSubmitFlag}
                      onCancel={() => setEditingFlag(null)}
                      initialData={formInitialData}
                      isEditing={true}
                    />
                  </div>
                ) : (
                  <FlagCard
                    key={flag.id}
                    id={flag.id}
                    destination={flag.city}
                    country={getCountryName(flag.country)}
                    flag={flag.flag}
                    startDate={flag.startDate}
                    endDate={flag.endDate}
                    status={flag.status}
                    offerCount={
                      flag.isSentOfferFlag
                        ? (flag.sentOffers || []).length
                        : flag.offerCount
                    }
                    styles={flag.styles}
                    note={flag.note}
                    canEdit={!flag.isSentOfferFlag}
                    onEdit={
                      !flag.isSentOfferFlag
                        ? () => handleEditFlagClick(flag)
                        : undefined
                    }
                    onDelete={
                      !flag.isSentOfferFlag
                        ? () => handleDeleteFlag(flag.id)
                        : undefined
                    }
                    offers={
                      flag.isSentOfferFlag
                        ? flag.sentOffers || []
                        : flag.offers || []
                    }
                    isSentOfferFlag={flag.isSentOfferFlag}
                  />
                )
              )}
            </div>
          )}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleLoadMore}
              disabled={fetcher.state === "loading"}
              className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-full font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {fetcher.state === "loading" ? (
                <>
                  <LoadingSpinner size="sm" />
                  {t("common.loading")}
                </>
              ) : (
                t("common.loadMore")
              )}
            </button>
          </div>
        )}

        {/* 지난 여행 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">
            {t("flags.pastSection")} ({pastFlags.length})
          </h2>

          {pastFlags.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-500">{t("flags.emptyPast")}</p>
              <p className="text-sm text-gray-400 mt-2">
                {t("flags.emptyPastSub")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastFlags.map((flag) => (
                <FlagCard
                  key={flag.id}
                  id={flag.id}
                  destination={flag.city}
                  country={getCountryName(flag.country)}
                  flag={flag.flag}
                  startDate={flag.startDate}
                  endDate={flag.endDate}
                  status={flag.status}
                  offerCount={flag.offerCount}
                  styles={flag.styles}
                  note={flag.note}
                  canEdit={false}
                  offers={flag.offers}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 프리미엄 업그레이드 배너 */}
      <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">
              {t("flags.premium.title")}
            </h3>
            <p className="text-blue-100">{t("flags.premium.desc")}</p>
          </div>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            {t("flags.premium.learnMore")}
          </button>
        </div>
      </div>
    </>
  );
}

export default function FlagsPage() {
  const { t } = useLanguage();
  const { dataPromise } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("flags.title")}
          </h1>
          <p className="text-gray-600">{t("flags.description")}</p>
        </div>

        <Suspense fallback={<FlagsSkeleton />}>
          <Await resolve={dataPromise}>
            {(data) => (
              <FlagsContent
                initialFlags={data?.flags || []}
                receivedOffers={data?.receivedOffers || []}
                sentOffers={data?.sentOffers || []}
                userId={data?.userId || ""}
              />
            )}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}
