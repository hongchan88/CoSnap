import { createSupabaseClient } from "~/lib/supabase";
import { getUserAllFlags } from "~/users/queries";

export async function loader({ params }: any) {
  const { userId } = params;
  const { client } = createSupabaseClient();

  // Get current user to verify authentication
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all flags for requested user
  const { success, flags, error } = await getUserAllFlags(client, userId);

  if (!success || error) {
    return Response.json({ error: error || "Failed to fetch user flags" }, { status: 500 });
  }

  return Response.json({ success: true, flags: flags || [] });
}