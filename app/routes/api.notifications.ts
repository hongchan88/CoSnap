import { createSupabaseClient } from "~/lib/supabase";
import { getLoggedInUserId } from "~/users/queries";
import { getNotifications, markAllAsRead, markAsRead } from "~/lib/notifications";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const { client } = createSupabaseClient(request);
  const userId = await getLoggedInUserId(client);

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await getNotifications(client, userId);
  return result;
}

export async function action({ request }: ActionFunctionArgs) {
  const { client } = createSupabaseClient(request);
  const userId = await getLoggedInUserId(client);
  
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "mark_all_read") {
    return await markAllAsRead(client, userId);
  }

  if (intent === "mark_read") {
    const notificationId = formData.get("notificationId") as string;
    if (!notificationId) return { success: false, error: "Missing ID" };
    return await markAsRead(client, notificationId);
  }

  return { success: false, error: "Invalid intent" };
}
