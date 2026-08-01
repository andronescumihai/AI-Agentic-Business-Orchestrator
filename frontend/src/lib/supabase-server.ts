import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

let client: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Client Supabase folosit DOAR pe server (API route handlers).
 * Cheia service_role bypass-ează RLS, deci nu trebuie NICIODATĂ expusă
 * către browser — de aceea variabilele nu au prefixul NEXT_PUBLIC_ și
 * fișierul e marcat "server-only".
 */
export function getSupabaseServer() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL / SUPABASE_SERVICE_KEY lipsesc din frontend/.env.local"
    );
  }

  client = createClient<Database>(url, key, { auth: { persistSession: false } });
  return client;
}
