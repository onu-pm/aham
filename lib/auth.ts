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

export function useAuth() {
  const [state, setState] = useState<AuthState>(authEnabled ? { status: "loading" } : { status: "off" });
  // Arrived from a "reset password" email: ask for a new one
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    if (!authEnabled) return;
    const sb = supabase();
    sb.auth.getSession().then(({ data }) => setState(data.session ? { status: "signedIn", session: data.session } : { status: "signedOut" }));
    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      setState(session ? { status: "signedIn", session } : { status: "signedOut" });
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
