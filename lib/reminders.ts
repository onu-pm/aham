"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { taskDay, type State } from "./store";

export type Permission = NotificationPermission | "unsupported";

/**
 * Fires reminders for timed habits and tasks while Aham is open.
 * Uses a system notification when allowed, and always calls onDue so the app can show it in place.
 */
export function useReminders(state: State, todayKey: string, ready: boolean, onDue: (msg: string) => void) {
  const [permission, setPermission] = useState<Permission>("unsupported");
  const fired = useRef(new Set<string>());
  const onDueRef = useRef(onDue);
  onDueRef.current = onDue;
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (typeof Notification === "undefined") return;
    setPermission(Notification.permission);
    navigator.serviceWorker?.register("/sw.js").catch(() => {});
  }, []);

  const enable = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    setPermission(await Notification.requestPermission());
  }, []);

  useEffect(() => {
    if (!ready) return;
    const check = async () => {
      const now = new Date();
      const hm = now.toTimeString().slice(0, 5);
      for (const i of stateRef.current.items) {
        if (!i.remind || !i.time || i.time > hm || i.done.includes(todayKey)) continue;
        if (i.kind === "task" && taskDay(i, todayKey) !== todayKey) continue;
        // Only nudge within 30 minutes of the time, once per day
        const [h, m] = i.time.split(":").map(Number);
        if (now.getHours() * 60 + now.getMinutes() - (h * 60 + m) > 30) continue;
        const key = `${i.id}:${todayKey}`;
        if (fired.current.has(key)) continue;
        fired.current.add(key);

        const body = `${i.emoji} ${i.title}`;
        onDueRef.current(`⏰ ${i.title}`);
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          try {
            const reg = await navigator.serviceWorker?.getRegistration();
            if (reg) await reg.showNotification("Aham reminder", { body, tag: key, icon: "/icon.svg" });
            else new Notification("Aham reminder", { body, tag: key });
          } catch {
            // the in-app reminder above still shows
          }
        }
      }
    };
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [ready, todayKey]);

  return { permission, enable };
}
