import { redirect } from "react-router";
import { createSupabaseClient } from "~/lib/supabase";
import type { Route } from "./+types/logout";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client, headers } = createSupabaseClient(request);
  const {
    data: { session },
  } = await client.auth.getSession();

  if (session) {
    await client.auth.signOut();
  }

  return redirect("/", { headers: headers });
};
