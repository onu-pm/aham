"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { NATIVE_REDIRECT, authEnabled, supabase } from "./supabase";
import { isNative } from "./native";

export type AuthState = { status: "off" } | { status: "loading" } | { status: "signedOut" } | { status: "signedIn"; session: Session };

/** Friendlier wording for the errors people actually hit */
export function authMessage(e: unknown): string {
  const m = String((e as { message?: string })?.message ?? e);
  if (/invalid login credentials/i.test(m)) return "That email and password don't match. Try again, or reset your password.";
  if (/email not confirmed/i.test(m)) return "Check your inbox and tap the link to confirm your email first.";
  if (/already registered|already been registered/i.test(m)) return "There's already an account with this email. Try signing in.";
  if (/password should be at least/i.test(m)) return "Use a password with at least 8 characters.";
  if (/rate limit/i.test(m)) return "Too many tries. Please wait a minute and try again.";
  if (/network|fetch/i.test(m)) return "No internet connection. Check it and try again.";
  return m;
}

/** The login Supabase saved on this device, read directly so it still works offline */
function savedSession(): Session | null {
  try {
    const key = Object.keys(localStorage).find((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
    const s = key ? JSON.parse(localStorage.getItem(key) ?? "null") : null;
    return s?.user && s?.refresh_token ? (s as Session) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(authEnabled ? { status: "loading" } : { status: "off" });
  // Arrived from a "reset password" email: ask for a new one
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    if (!authEnabled) return;
    const sb = supabase();
    // Offline, Supabase keeps retrying the refresh; don't make people wait on it
    let settled = false;
    const fallback = setTimeout(() => {
      const saved = savedSession();
      if (!settled && saved) setState((s) => (s.status === "loading" ? { status: "signedIn", session: saved } : s));
    }, 3000);
    sb.auth.getSession().then(({ data, error }) => {
      settled = true;
      clearTimeout(fallback);
      if (data.session) return setState({ status: "signedIn", session: data.session });
      // Offline with a saved login: stay signed in and sync once the connection is back
      const saved = savedSession();
      if (saved && (error || !navigator.onLine)) return setState({ status: "signedIn", session: saved });
      setState({ status: "signedOut" });
    });
    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      if (session) return setState({ status: "signedIn", session });
      // Only a real sign-out ends the session; a failed refresh while offline doesn't
      if (event === "SIGNED_OUT") setState({ status: "signedOut" });
    });

    // Android: Google sends people back to the app through a deep link carrying a one-time code
    let remove: (() => void) | undefined;
    if (isNative()) {
      import("@capacitor/app").then(async ({ App }) => {
        const handle = await App.addListener("appUrlOpen", async ({ url }) => {
          if (!url.startsWith(NATIVE_REDIRECT)) return;
          const code = new URL(url.replace(/^com\.onupm\.aham:\/\//, "https://x/")).searchParams.get("code");
          if (code) await sb.auth.exchangeCodeForSession(code).catch(() => {});
          import("@capacitor/browser").then(({ Browser }) => Browser.close().catch(() => {}));
        });
        remove = () => handle.remove();
      });
    }
    return () => {
      clearTimeout(fallback);
      sub.subscription.unsubscribe();
      remove?.();
    };
  }, []);

  const signInGoogle = useCallback(async () => {
    const sb = supabase();
    if (isNative()) {
      const { data, error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: NATIVE_REDIRECT, skipBrowserRedirect: true } });
      if (error) throw error;
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({ url: data.url, presentationStyle: "popover" });
      return;
    }
    const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
    if (error) throw error;
  }, []);

  const signInEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase().auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  /** Returns true when the account still needs its email confirmed */
  const signUpEmail = useCallback(async (email: string, password: string, name: string) => {
    const { data, error } = await supabase().auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: isNative() ? NATIVE_REDIRECT : window.location.origin } });
    if (error) throw error;
    return !data.session;
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase().auth.resetPasswordForEmail(email, { redirectTo: isNative() ? NATIVE_REDIRECT : window.location.origin });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase().auth.updateUser({ password });
    if (error) throw error;
    setRecovering(false);
  }, []);

  const signOut = useCallback(async () => {
    await supabase().auth.signOut();
  }, []);

  /** Deletes the account and everything stored with it (see delete_account in supabase/setup.sql) */
  const deleteAccount = useCallback(async () => {
    const sb = supabase();
    const { error } = await sb.rpc("delete_account");
    if (error) throw error;
    await sb.auth.signOut();
  }, []);

  return { state, recovering, updatePassword, signInGoogle, signInEmail, signUpEmail, resetPassword, signOut, deleteAccount };
}

export type Auth = ReturnType<typeof useAuth>;
