"use client";

import { useState } from "react";
import { Bell, Download, RotateCcw } from "lucide-react";
import { Card, PageTitle, SectionLabel, Segmented, softBtn } from "./ui";
import { activeDays, showingUpStreak, type Store, type TextSize } from "@/lib/store";

const AVATARS = ["🌱", "🦊", "🐢", "🦉", "🐝", "🌻", "🌙", "⭐", "🐳", "🦋", "🍄", "🐼"];

export function Profile({
  store,
  notify,
  onEnableNotify,
}: {
  store: Store;
  notify: NotificationPermission | "unsupported";
  onEnableNotify: () => void;
}) {
  const { profile, items, entries } = store.state;
  const [confirmReset, setConfirmReset] = useState(false);

  const checkIns = items.reduce((n, i) => n + i.done.length, 0);
  const tasksDone = items.filter((i) => i.kind === "task" && i.done.length).length;

  const badges = [
    { emoji: "🌱", name: "First check-in", got: checkIns > 0 },
    { emoji: "💭", name: "First Mind entry", got: entries.length > 0 },
    { emoji: "🧩", name: "Finished micro-tasks", got: items.some((i) => i.kind === "task" && i.steps.length > 0 && i.done.length > 0) },
    { emoji: "🔥", name: "Showed up 7 days", got: showingUpStreak(store.state) >= 7 },
    { emoji: "🌈", name: "Grew in 3 pillars", got: new Set(items.filter((i) => i.done.length).map((i) => i.pillar)).size >= 3 },
    { emoji: "🏅", name: "Reached a goal", got: items.some((i) => i.kind === "goal" && i.total && i.progress >= i.total) },
  ];

  const exportData = () => {
    const blob = new Blob([JSON.stringify(store.state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `aham-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-3">
      <PageTitle title="Me" />

      <Card>
        <div className="flex items-center gap-3">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[2rem]" aria-hidden>
            {profile.avatar}
          </span>
          <label className="min-w-0 flex-1">
            <span className="text-[0.8rem] font-bold text-muted">Your name</span>
            <input
              value={profile.name}
              onChange={(e) => store.setProfile({ name: e.target.value })}
              placeholder="What should we call you?"
              className="w-full bg-transparent text-xl font-extrabold text-ink outline-none placeholder:text-zinc-300"
            />
          </label>
        </div>
        <div className="mt-3 grid grid-cols-6 gap-1.5" role="radiogroup" aria-label="Avatar">
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              role="radio"
              aria-checked={a === profile.avatar}
              onClick={() => store.setProfile({ avatar: a })}
              className={`flex aspect-square items-center justify-center rounded-full text-xl ${a === profile.avatar ? "bg-brand-100 ring-2 ring-brand-500" : "bg-surface"}`}
            >
              {a}
            </button>
          ))}
        </div>
      </Card>

      <SectionLabel>Your journey</SectionLabel>
      <Card>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: "Days", value: activeDays(store.state) },
            { label: "Check-ins", value: checkIns },
            { label: "Tasks", value: tasksDone },
            { label: "Entries", value: entries.length },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-surface py-2">
              <p className="text-lg font-extrabold text-ink tabular-nums">{s.value}</p>
              <p className="text-[0.7rem] font-bold text-muted">{s.label}</p>
            </div>
          ))}
        </div>
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {badges.map((b) => (
            <li key={b.name} className={`rounded-2xl p-2.5 text-center ${b.got ? "bg-amber-50" : "bg-surface"}`}>
              <span className={`text-2xl ${b.got ? "" : "opacity-30 grayscale"}`} aria-hidden>
                {b.emoji}
              </span>
              <p className={`mt-0.5 text-[0.7rem] leading-tight font-bold ${b.got ? "text-ink" : "text-muted"}`}>{b.name}</p>
            </li>
          ))}
        </ul>
      </Card>

      <SectionLabel>Settings</SectionLabel>
      <Card className="space-y-4">
        <div>
          <p className="mb-2 font-bold text-ink">Text size</p>
          <Segmented
            value={String(profile.textSize)}
            onChange={(v) => store.setProfile({ textSize: Number(v) as TextSize })}
            options={[
              { value: "0", label: "Normal" },
              { value: "1", label: "Large" },
              { value: "2", label: "Larger" },
            ]}
          />
        </div>
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-muted" />
          <div className="flex-1">
            <p className="font-bold text-ink">Reminders</p>
            <p className="text-[0.85rem] text-muted">
              {notify === "granted"
                ? "On. Aham nudges you at the times you set."
                : notify === "denied"
                  ? "Blocked in browser settings. In-app reminders still show."
                  : notify === "unsupported"
                    ? "This browser can't show notifications. In-app reminders still show."
                    : "Off. Turn on to get nudges at the times you set."}
            </p>
          </div>
          {notify === "default" && (
            <button type="button" onClick={onEnableNotify} className="h-9 rounded-full bg-ink px-4 text-[0.85rem] font-bold text-white">
              Turn on
            </button>
          )}
        </div>
      </Card>

      <SectionLabel>Your data</SectionLabel>
      <Card>
        <p className="mb-3 text-[0.9rem] text-muted">Everything stays on this device. Nothing is uploaded.</p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={exportData} className={softBtn}>
            <Download className="h-4 w-4" /> Back up
          </button>
          <button
            type="button"
            onClick={() => {
              if (!confirmReset) return setConfirmReset(true);
              store.resetAll();
              setConfirmReset(false);
            }}
            className={`${softBtn} ${confirmReset ? "!bg-rose-600 !text-white" : "!text-rose-600"}`}
          >
            <RotateCcw className="h-4 w-4" /> {confirmReset ? "Tap to confirm" : "Start fresh"}
          </button>
        </div>
      </Card>
    </div>
  );
}
