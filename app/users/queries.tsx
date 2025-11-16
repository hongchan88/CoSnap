import { redirect } from "react-router";
import type { SupabaseClient } from "@supabase/supabase-js";

export const getLoggedInUserId = async (client: SupabaseClient) => {
  const { data, error } = await client.auth.getUser();
  console.log(data, "data in getLoggedInUserId");
  console.log(error, "error in getLoggedInUserId");
  if (error || data.user === null) {
    throw redirect("/login");
  }
  return data.user.id;
};
