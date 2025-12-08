
import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const client = createClient(supabaseUrl, supabaseAnonKey);

async function checkFlagStructure() {
  const { data, error } = await client
    .from("flags")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Flag Structure:", data[0]);
  }
}

checkFlagStructure();
