"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { taskDay, type State } from "./store";
import { isNative, nativePermission, requestNativePermission, setupNativeChrome, syncNativeReminders } from "./native";

export type Permission = NotificationPermission | "unsupported";

/**
 * Reminders for timed habits and tasks.
 * Android app: scheduled as native notifications, so they arrive even when Aham is closed.
 * Web: fire while Aham is open, as a system notification when allowed.
 * Either way, onDue shows the reminder in place while the app is open.
 */
export function useReminders(state: State, todayKey: string, ready: boolean, onDue: (msg: string) => void) {
  const [permission, setPermission] = useState<Permission>("unsupported");
  const native = useRef(false);
  const fired = useRef(new Set<string>());
  const onDueRef = useRef(onDue);
  onDueRef.current = onDue;
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    native.current = isNative();
    if (native.current) {
      setupNativeChrome();
      nativePermission().then(setPermission);
      return;
    }
    if (typeof Notification === "undefined") return;
    setPermission(Notification.permission);
    navigator.serviceWorker?.register("/sw.js").catch(() => {});
  }, []);

  const enable = useCallback(async () => {
    if (native.current) return setPermission(await requestNativePermission());
    if (typeof Notification === "undefined") return;
    setPermission(await Notification.requestPermission());
  }, []);

  // Native: keep the scheduled notifications in step with the plan
  useEffect(() => {
    if (!ready || !native.current || permission !== "granted") return;
    const t = setTimeout(() => syncNativeReminders(state.items, todayKey).catch(() => {}), 800);
    return () => clearTimeout(t);
  }, [state.items, todayKey, ready, permission]);

  // In-app nudge (and the web notification) while Aham is open
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

        onDueRef.current(`⏰ ${i.title}`);
        // The native app already got a system notification from its schedule
        if (native.current || typeof Notification === "undefined" || Notification.permission !== "granted") continue;
        try {
          const reg = await navigator.serviceWorker?.getRegistration();
          const body = `${i.emoji} ${i.title}`;
          if (reg) await reg.showNotification("Aham reminder", { body, tag: key, icon: "/icon.svg" });
          else new Notification("Aham reminder", { body, tag: key });
        } catch {
          // the in-app reminder above still shows
        }
      }
    };
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [ready, todayKey]);

  return { permission, enable };
}
