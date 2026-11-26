"use client";

import { useCallback, useEffect, useState } from "react";
import { authEnabled, supabase } from "./supabase";
import { dateKey, daysAgo } from "./store";

/* The weekly league: people who opt in see each other's first name, avatar and
   points earned this week. Nothing else is shared. Needs supabase/league.sql. */

export type LeagueRow = { user_id: string; name: string; avatar: string; xp: number };

export function weekKey(): string {
  const d = new Date();
  return dateKey(daysAgo((d.getDay() + 6) % 7));
}

export function useLeague(userId: string | null, joined: boolean, me: { name: string; avatar: string; xp: number }) {
  const [rows, setRows] = useState<LeagueRow[] | null>(null);
  const [state, setState] = useState<"off" | "loading" | "ready" | "unavailable">("off");

  const load = useCallback(async () => {
    if (!authEnabled || !userId) return setState("unavailable");
    setState("loading");
    const { data, error } = await supabase().from("league").select("user_id, name, avatar, xp").eq("week", weekKey()).order("xp", { ascending: false }).limit(20);
    if (error) return setState("unavailable");
    setRows(data as LeagueRow[]);
    setState("ready");
  }, [userId]);

  // Keep my row up to date while I'm in the league
  useEffect(() => {
    if (!joined || !authEnabled || !userId) return;
    const t = setTimeout(async () => {
      await supabase()
        .from("league")
        .upsert({ user_id: userId, name: (me.name || "Grower").split(" ")[0].slice(0, 20), avatar: me.avatar, week: weekKey(), xp: me.xp, updated_at: new Date().toISOString() })
        .then(() => load());
    }, 1200);
    return () => clearTimeout(t);
  }, [joined, userId, me.name, me.avatar, me.xp, load]);

  useEffect(() => {
    if (joined) load();
    else setState("off");
  }, [joined, load]);

  const leave = useCallback(async () => {
    if (authEnabled && userId) await supabase().from("league").delete().eq("user_id", userId);
  }, [userId]);

  return { rows, state, reload: load, leave };
}
