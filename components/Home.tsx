"use client";

import { useState } from "react";
import { ArrowRight, Check, Plus, SkipForward } from "lucide-react";
import { Card, EmojiTile, Ring } from "./ui";
import { ItemRow } from "./ItemSheet";
import { MOODS, MOOD_LABELS, PROMPTS, pillarById } from "@/lib/pillars";
import { itemsForDay, showingUpStreak, type Store } from "@/lib/store";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

type Next = { key: string; text: string; from: string | null; emoji: string; tint: string; done: () => void };

export function Home({
  store,
  onAdd,
  onOpen,
  onProfile,
  onWrite,
}: {
  store: Store;
  onAdd: () => void;
  onOpen: (id: string) => void;
  onProfile: () => void;
  onWrite: (opts: { title?: string; mood?: number }) => void;
}) {
  const { state, todayKey } = store;
  const [skip, setSkip] = useState(0);
  const today = itemsForDay(state.items, todayKey, todayKey);
  const doneCount = today.filter((i) => i.done.includes(todayKey)).length;
  const mood = state.moods[todayKey];
  const date = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const prompt = PROMPTS[new Date().getDate() % PROMPTS.length];
  const streak = showingUpStreak(state);

  // One tiny next thing: the next step of an open task, else an unchecked habit
  const queue: Next[] = [];
  for (const i of today) {
    if (i.done.includes(todayKey)) continue;
    const p = pillarById[i.pillar];
    const step = i.kind === "task" ? i.steps.find((s) => !s.done) : undefined;
    if (step)
      queue.push({ key: step.id, text: step.text, from: i.title, emoji: i.emoji, tint: p.soft, done: () => store.toggleStep(i.id, step.id) });
    else queue.push({ key: i.id, text: i.title, from: null, emoji: i.emoji, tint: p.soft, done: () => store.toggleItemDay(i.id) });
  }
  const next = queue.length ? queue[skip % queue.length] : null;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 px-1 pt-4">
        <div className="min-w-0">
          <p className="font-medium text-muted">{date}</p>
          <h1 className="font-display mt-1 text-[2.2rem] leading-[1.05] text-ink">
            {greeting()}
            {state.profile.name ? `, ${state.profile.name}` : ""}.
          </h1>
        </div>
        <button
          type="button"
          onClick={onProfile}
          aria-label="Open your profile"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-2xl shadow-soft"
        >
          {state.profile.avatar}
        </button>
      </div>

      {/* Mood check-in: one tap */}
      <Card>
        <p className="mb-3 font-medium text-ink">How are you feeling?</p>
        <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="Mood">
          {MOODS.map((m, i) => {
            const active = mood === i;
            return (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={MOOD_LABELS[i]}
                onClick={() => store.setMood(active ? null : i)}
                className={`flex h-[4.5rem] flex-col items-center justify-center gap-0.5 rounded-3xl transition-all ${
                  active ? "bg-brand-100 ring-2 ring-ink" : mood != null ? "bg-surface opacity-50" : "bg-surface"
                }`}
              >
                <span className={`text-[1.75rem] leading-none ${active ? "animate-pop" : ""}`} aria-hidden>
                  {m}
                </span>
                <span className="text-xs text-muted">{MOOD_LABELS[i]}</span>
              </button>
            );
          })}
        </div>
        {mood != null && (
          <button
            type="button"
            onClick={() => onWrite({ mood, title: mood <= 1 ? "What's weighing on me" : "" })}
            className="mt-3 flex items-center gap-1 font-medium text-brand-700"
          >
            {mood <= 1 ? "Want to write it out?" : "Add a note about it"} <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </Card>

      {/* Progress */}
      <section className="flex items-center gap-4 rounded-[1.75rem] bg-brand-100 p-5">
        <Ring value={today.length ? doneCount / today.length : 0} size={84}>
          <span className="font-display text-[1.5rem] text-ink tabular-nums">
            {doneCount}
            <span className="text-muted">/{today.length}</span>
          </span>
        </Ring>
        <div>
          <h2 className="font-display text-[1.5rem] leading-tight text-ink">Your day</h2>
          <p className="text-muted">
            {today.length === 0
              ? "Add one small thing to start."
              : doneCount === today.length
                ? "All done. That's real growth. 🌱"
                : doneCount === 0
                  ? "One tap is a great start."
                  : "Nice going. Keep it gentle."}
          </p>
          {streak > 1 && <p className="mt-1 text-sm font-medium text-brand-700">Showed up {streak} days in a row</p>}
        </div>
      </section>

      {/* One tiny step: lowers the "where do I start" barrier */}
      {next && (
        <section className="rounded-[1.75rem] bg-ink p-5 text-white">
          <p className="text-sm font-medium tracking-wide text-white/60 uppercase">Just this one thing</p>
          <div className="mt-3 flex items-center gap-3">
            <EmojiTile emoji={next.emoji} size="lg" className={next.tint} />
            <div className="min-w-0">
              <p className="font-display text-[1.5rem] leading-tight">{next.text}</p>
              {next.from && <p className="text-sm text-white/60">Step of “{next.from}”</p>}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={next.done}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-brand-300 font-semibold text-ink active:scale-[0.98]"
            >
              <Check className="h-5 w-5" strokeWidth={3} /> Done
            </button>
            {queue.length > 1 && (
              <button
                type="button"
                onClick={() => setSkip(skip + 1)}
                className="flex h-12 items-center justify-center gap-1.5 rounded-full bg-white/10 px-5 font-medium active:scale-95"
              >
                <SkipForward className="h-4 w-4" /> Not now
              </button>
            )}
          </div>
        </section>
      )}

      {/* Today */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1 pt-1">
          <h2 className="font-display text-[1.35rem] text-ink">Today</h2>
          <button type="button" onClick={onAdd} className="flex h-10 items-center gap-1 rounded-full px-3 font-medium text-brand-700 active:bg-brand-50">
            <Plus className="h-5 w-5" /> Add
          </button>
        </div>
        {today.length === 0 ? (
          <button type="button" onClick={onAdd} className="w-full rounded-3xl border-2 border-dashed border-brand-200 p-6 text-center">
            <p className="font-medium text-ink">Nothing planned yet</p>
            <p className="text-muted">Tap to add a habit, task or goal</p>
          </button>
        ) : (
          today.map((item) => <ItemRow key={item.id} item={item} dayKey={todayKey} store={store} onOpen={() => onOpen(item.id)} />)
        )}
      </section>

      {/* Journal nudge */}
      <button type="button" onClick={() => onWrite({ title: prompt })} className="block w-full rounded-[1.75rem] bg-amber-50 p-5 text-left active:scale-[0.99]">
        <p className="text-sm font-medium tracking-wide text-amber-700 uppercase">Today&apos;s journal prompt</p>
        <p className="font-display mt-2 text-[1.4rem] leading-snug text-ink">{prompt}</p>
        <p className="mt-3 flex items-center gap-1 font-medium text-ink">
          Write a few lines <ArrowRight className="h-4 w-4" />
        </p>
      </button>
    </div>
  );
}
