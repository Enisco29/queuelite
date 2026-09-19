import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";

let browserClient: SupabaseClient | undefined;

export function createClient() {
  if (browserClient) return browserClient;
  const env = publicEnv();
  browserClient = createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
  return browserClient;
}
