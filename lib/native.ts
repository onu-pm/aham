"use client";

import { Capacitor } from "@capacitor/core";
import { taskDay, dateKey, daysAgo, type Item } from "./store";

export const isNative = () => Capacitor.isNativePlatform();

export type NativePermission = "granted" | "denied" | "default";

// Plugins are loaded on demand so the web build never touches them.
// Hand back the module, not the plugin: a Capacitor plugin proxy answers to `.then`,
// so resolving a promise with it never settles.
const notificationsModule = () => import("@capacitor/local-notifications");

function toPermission(state: string): NativePermission {
  return state === "granted" ? "granted" : state === "denied" ? "denied" : "default";
}

export async function nativePermission(): Promise<NativePermission> {
  const { LocalNotifications: ln } = await notificationsModule();
  return toPermission((await ln.checkPermissions()).display);
}

export async function requestNativePermission(): Promise<NativePermission> {
  const { LocalNotifications: ln } = await notificationsModule();
  return toPermission((await ln.requestPermissions()).display);
}

/** Notification ids must be 32-bit ints; derive a stable one per item and day */
function idFor(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (Math.imul(31, h) + key.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}

function at(day: string, time: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm);
}

const DAYS_AHEAD = 7;

/**
 * Replaces all pending reminders with ones for the next week, so they fire even when Aham is closed.
 * Habits skip days already checked off; tasks fire once on their day.
 */
export async function syncNativeReminders(items: Item[], todayKey: string): Promise<void> {
  const { LocalNotifications: ln } = await notificationsModule();
  if ((await ln.checkPermissions()).display !== "granted") return;

  const pending = await ln.getPending();
  if (pending.notifications.length) await ln.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });

  const now = Date.now();
  const list: { id: number; title: string; body: string; schedule: { at: Date; allowWhileIdle: boolean } }[] = [];
  for (const i of items) {
    if (!i.remind || !i.time) continue;
    if (i.kind === "habit") {
      for (let n = 0; n < DAYS_AHEAD; n++) {
        const day = dateKey(daysAgo(-n));
        const when = at(day, i.time);
        if (when.getTime() <= now || i.done.includes(day)) continue;
        list.push({ id: idFor(`${i.id}:${day}`), title: `${i.emoji} ${i.title}`, body: "A gentle nudge for your habit. Tiny counts.", schedule: { at: when, allowWhileIdle: true } });
      }
    } else if (i.kind === "task" && !i.done.length) {
      const day = taskDay(i, todayKey);
      const when = at(day, i.time);
      if (when.getTime() > now)
        list.push({ id: idFor(`${i.id}:${day}`), title: `${i.emoji} ${i.title}`, body: i.steps.length ? `Start with: ${i.steps.find((s) => !s.done)?.text ?? i.steps[0].text}` : "It's time. Just the first tiny step.", schedule: { at: when, allowWhileIdle: true } });
    }
  }
  if (list.length) await ln.schedule({ notifications: list });
}

/** Dark status bar text over the light lavender header */
export async function setupNativeChrome(): Promise<void> {
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Light });
  } catch {
    // not critical
  }
}

/** Saves a backup through the Android share sheet (Drive, Files, email…) */
export async function shareBackup(json: string, filename: string): Promise<void> {
  const { Filesystem, Directory, Encoding } = await import("@capacitor/filesystem");
  const { Share } = await import("@capacitor/share");
  const { uri } = await Filesystem.writeFile({ path: filename, data: json, directory: Directory.Cache, encoding: Encoding.UTF8 });
  await Share.share({ title: "Aham backup", files: [uri] });
}
