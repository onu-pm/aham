"use client";

import { useState } from "react";
import { Download, RotateCcw } from "lucide-react";
import { Card, PageTitle, softBtn } from "./ui";
import { activeDays, showingUpStreak, type Store, type TextSize } from "@/lib/store";

const AVATARS = ["🌱", "🦊", "🐢", "🦉", "🐝", "🌻", "🌙", "⭐", "🐳", "🦋", "🍄", "🐼"];
const SIZES: { label: string; sample: string }[] = [
  { label: "Normal", sample: "text-base" },
  { label: "Large", sample: "text-lg" },
  { label: "Extra large", sample: "text-xl" },
];

export function Profile({ store }: { store: Store }) {
  const { profile, items, entries } = store.state;
  const [confirmReset, setConfirmReset] = useState(false);

  const checkIns = items.reduce((n, i) => n + i.done.length, 0);
  const tasksDone = items.filter((i) => i.kind === "task" && i.done.length).length;

  const badges = [
    { emoji: "🌱", name: "First check-in", got: checkIns > 0 },
    { emoji: "📓", name: "First journal entry", got: entries.length > 0 },
    { emoji: "🧩", name: "Finished a broken-down task", got: items.some((i) => i.kind === "task" && i.steps.length > 0 && i.done.length > 0) },
    { emoji: "🔥", name: "Showed up 7 days", got: showingUpStreak(store.state) >= 7 },
    { emoji: "🌈", name: "Grew in 3 pillars", got: new Set(items.filter((i) => i.done.length).map((i) => i.pillar)).size >= 3 },
    { emoji: "🏅", name: "Finished a goal", got: items.some((i) => i.kind === "goal" && i.total && i.progress >= i.total) },
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
    <div className="space-y-4">
      <PageTitle title="Me" />

      <Card>
        <div className="flex items-center gap-4">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[2.5rem]" aria-hidden>
            {profile.avatar}
          </span>
          <label className="min-w-0 flex-1">
            <span className="text-sm font-medium text-muted">Your name</span>
            <input
              value={profile.name}
              onChange={(e) => store.setProfile({ name: e.target.value })}
              placeholder="What should we call you?"
              className="font-display mt-0.5 w-full bg-transparent text-[1.5rem] text-ink outline-none placeholder:text-zinc-300"
            />
          </label>
        </div>
        <div className="mt-4 grid grid-cols-6 gap-1.5" role="radiogroup" aria-label="Avatar">
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              role="radio"
              aria-checked={a === profile.avatar}
              onClick={() => store.setProfile({ avatar: a })}
              className={`flex aspect-square items-center justify-center rounded-full text-2xl ${a === profile.avatar ? "bg-brand-100 ring-2 ring-brand-500" : "bg-surface"}`}
            >
              {a}
            </button>
          ))}
        </div>
      </Card>

      <Card title="Your journey">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Days you showed up", value: activeDays(store.state) },
            { label: "Check-ins", value: checkIns },
            { label: "Tasks finished", value: tasksDone },
            { label: "Journal entries", value: entries.length },
          ].map((s) => (
            <div key={s.label} className="rounded-3xl bg-surface px-4 py-3">
              <p className="font-display text-[1.9rem] leading-tight text-ink tabular-nums">{s.value}</p>
              <p className="text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
        <ul className="mt-4 grid grid-cols-3 gap-2">
          {badges.map((b) => (
            <li key={b.name} className={`rounded-3xl p-3 text-center ${b.got ? "bg-amber-50" : "bg-surface"}`}>
              <span className={`text-3xl ${b.got ? "" : "opacity-30 grayscale"}`} aria-hidden>
                {b.emoji}
              </span>
              <p className={`mt-1 text-xs leading-tight font-medium ${b.got ? "text-ink" : "text-muted"}`}>{b.name}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Reading comfort">
        <div className="grid grid-cols-3 gap-1 rounded-full bg-surface p-1" role="radiogroup" aria-label="Text size">
          {SIZES.map((s, i) => (
            <button
              key={s.label}
              type="button"
              role="radio"
              aria-checked={profile.textSize === i}
              onClick={() => store.setProfile({ textSize: i as TextSize })}
              className={`h-12 rounded-full font-medium ${profile.textSize === i ? "bg-white text-ink shadow-sm" : "text-muted"}`}
            >
              <span className={s.sample}>Aa</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">Text size: {SIZES[profile.textSize].label}. Animations follow your phone&apos;s Reduce Motion setting.</p>
      </Card>

      <Card title="Your data">
        <p className="mb-3 text-muted">Everything stays on this device. Nothing is uploaded.</p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={exportData} className={softBtn}>
            <Download className="h-5 w-5" /> Back up
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
            <RotateCcw className="h-5 w-5" /> {confirmReset ? "Tap to confirm" : "Start fresh"}
          </button>
        </div>
      </Card>
    </div>
  );
}
