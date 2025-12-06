import { type ActionFunctionArgs, data } from "react-router";
import { createSupabaseClient } from "~/lib/supabase";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { posts, insertPostSchema } from "~/db/schema";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { client: supabase, headers } = createSupabaseClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return data({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const rawData = Object.fromEntries(formData);

  // Parse numeric fields
  const dataToValidate = {
    ...rawData,
    userId: user.id,
    latitude: parseFloat(rawData.latitude as string),
    longitude: parseFloat(rawData.longitude as string),
    price: rawData.price ? parseInt(rawData.price as string) : undefined,
    expiresAt: new Date(rawData.expiresAt as string),
  };

  const result = insertPostSchema.safeParse(dataToValidate);

  if (!result.success) {
    return data({ error: result.error.flatten() }, { status: 400 });
  }

  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    const [newPost] = await db
      .insert(posts)
      .values(result.data)
      .returning();

    return data({ post: newPost }, { headers });
  } catch (error) {
    console.error("Error creating post:", error);
    return data({ error: "Failed to create post" }, { status: 500, headers });
  }
};

