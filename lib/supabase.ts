"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* Accounts and cloud sync run on Supabase.
   The URL and the public (anon) key come from .env.local; both are safe to ship in the app,
   because every row is protected by row-level security (see supabase/setup.sql).
   Without them, Aham runs as before: on this device only, no sign-in. */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const authEnabled = !!(url && key);

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!authEnabled) throw new Error("Supabase is not configured");
  client ??= createClient(url!, key!, {
    auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}

/** Where Google sends people back to after signing in */
export const NATIVE_REDIRECT = "com.onupm.aham://login-callback";

/** Whether Google sign-in is switched on in the Supabase dashboard */
export async function googleEnabled(): Promise<boolean> {
  try {
    const r = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key! } });
    return !!(await r.json())?.external?.google;
  } catch {
    return true; // offline: keep the button; signing in will explain
  }
}
