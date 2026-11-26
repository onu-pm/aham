"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";
import { parseState, type State, type Store } from "./store";
import type { AuthState } from "./auth";

/* Keeps this device and the account in step.
   The whole Aham state is one JSON row per person (table user_state), last write wins.
   Local storage stays the working copy, so Aham works offline and syncs when it can. */

const OWNER = "aham:owner"; // which account the data on this device belongs to
const PUSHED = "aham:pushedAt"; // when this device last saved to the cloud

const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string | null) => {
  try {
    if (v == null) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  } catch {
    // storage unavailable
  }
};

const hasData = (s: State) => s.items.length > 0 || s.lists.length > 0;

export type SyncStatus = "off" | "syncing" | "synced" | "offline";

export function useCloudSync(store: Store, auth: AuthState) {
  const [status, setStatus] = useState<SyncStatus>("off");
  const [loaded, setLoaded] = useState(false); // the account's data is in place
  const userId = auth.status === "signedIn" ? auth.session.user.id : null;
  const stateRef = useRef(store.state);
  stateRef.current = store.state;
  const skipNextPush = useRef(false);

  const push = async (uid: string, state: State) => {
    setStatus("syncing");
    const at = new Date().toISOString();
    const { error } = await supabase().from("user_state").upsert({ user_id: uid, data: state, updated_at: at });
    if (error) return setStatus("offline");
    write(PUSHED, at);
    setStatus("synced");
  };

  const pull = async (uid: string) => {
    // Offline, requests can hang while the login refreshes; give up after a few seconds
    const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("offline")), 4000));
    const { data, error } = await Promise.race([supabase().from("user_state").select("data, updated_at").eq("user_id", uid).maybeSingle(), timeout]);
    if (error) throw error;
    return data as { data: unknown; updated_at: string } | null;
  };

  // Signing in: decide whose copy wins
  useEffect(() => {
    if (!store.ready) return;
    if (!userId) {
      setLoaded(false);
      setStatus("off");
      return;
    }
    let cancelled = false;
    (async () => {
      setStatus("syncing");
      try {
        const remote = await pull(userId);
        if (cancelled) return;
        const remoteState = remote ? parseState(remote.data) : null;
        const owner = read(OWNER);
        const local = stateRef.current;
        const remoteNewer = remote && remote.updated_at > (read(PUSHED) ?? "");

        if (remoteState && (owner !== userId ? hasData(remoteState) || !hasData(local) || !!owner : !!remoteNewer)) {
          skipNextPush.current = true;
          store.replaceAll(remoteState);
          write(PUSHED, remote!.updated_at);
          setStatus("synced");
        } else if (owner && owner !== userId) {
          // Someone else's data was on this phone and this account is new: start fresh
          skipNextPush.current = true;
          store.resetAll();
          await push(userId, { ...stateRef.current, items: [], lists: [] });
        } else {
          await push(userId, local);
        }
        write(OWNER, userId);
      } catch {
        setStatus("offline");
        if (read(OWNER) !== userId && read(OWNER)) store.resetAll();
        write(OWNER, userId);
      }
      if (!cancelled) setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, store.ready]);

  // Every change: save to the cloud a moment later
  useEffect(() => {
    if (!userId || !loaded) return;
    if (skipNextPush.current) {
      skipNextPush.current = false;
      return;
    }
    const t = setTimeout(() => push(userId, store.state), 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.state, userId, loaded]);

  // Coming back to the app: pick up changes made on another device
  useEffect(() => {
    if (!userId || !loaded) return;
    const onVisible = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const remote = await pull(userId);
        const next = remote && remote.updated_at > (read(PUSHED) ?? "") ? parseState(remote.data) : null;
        if (next) {
          skipNextPush.current = true;
          store.replaceAll(next);
          write(PUSHED, remote!.updated_at);
        }
        setStatus("synced");
      } catch {
        setStatus("offline");
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, loaded]);

  return { status, loaded };
}

/** After signing out, this phone keeps nothing of the account */
export function forgetLocalAccount(store: Store) {
  write(OWNER, null);
  write(PUSHED, null);
  store.resetAll();
}
