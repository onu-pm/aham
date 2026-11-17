"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { Card, CheckCircle, Collapse, EmojiTile, HScroll, PageTitle, ProgressBar, SectionLabel } from "./ui";
import { AddBar } from "./AddBar";
import { Figure } from "./Figures";
import { Details, GrowItem } from "./ItemCard";
import { PILLARS, detect, pillarById, tidyTitle } from "@/lib/pillars";
import { dateKey, daysAgo, habitCount, itemStreak, type Item, type Store } from "@/lib/store";

/** "drink water 8 times", "8 glasses of water", "pushups x20" → a daily target */
function parseTarget(raw: string): { title: string; target: number } {
  const m = raw.match(/\b(?:x\s*(\d+)|(\d+)\s*(?:x|times?(?:\s+a\s+day)?|glasses|cups|reps|times daily))\b/i);
  if (!m) return { title: raw, target: 1 };
  const n = Number(m[1] ?? m[2]);
  if (!(n > 1 && n <= 50)) return { title: raw, target: 1 };
  // Keep "8 glasses of water" readable; drop bare "x8" / "8 times"
  const title = /glasses|cups|reps/i.test(m[0]) ? raw : raw.replace(m[0], " ").replace(/\s+/g, " ").trim();
  return { title, target: n };
}

const QUICK = ["Drink water", "Walk 10 min", "Read 10 pages", "Meditate 5 min", "Take my meds", "Make the bed", "Stretch", "Journal one line"];

export function Grow({
  store,
  openId,
  setOpenId,
  onDeleted,
}: {
  store: Store;
  onAdd?: () => void;
  openId: string | null;
  setOpenId: (id: string | null) => void;
  onDeleted: (item: Item) => void;
}) {
  const today = store.todayKey;
  const habits = store.state.items.filter((i) => i.kind === "habit");
  const goals = store.state.items.filter((i) => i.kind === "goal");
  const met = habits.filter((h) => h.done.includes(today)).length;
  const existing = new Set(store.state.items.map((i) => i.title.toLowerCase()));

  const add = (raw: string) => {
    const { title, target } = parseTarget(raw);
    const t = tidyTitle(title);
    const d = detect(t);
    const sug = PILLARS.flatMap((p) => p.suggestions).find((s) => s.title.toLowerCase() === t.toLowerCase());
    store.addItem({ title: t, emoji: sug?.emoji ?? d.emoji, pillar: d.pillar, kind: "habit", target });
  };

  return (
    <div className="space-y-3">
      <PageTitle title="Habits" subtitle="Small things, most days." />

      <AddBar placeholder="Add a habit… e.g. “drink water 8 times”" onAdd={add} />

      {/* One-tap ideas, for days when typing is too much */}
      <HScroll>
        {QUICK.filter((q) => !existing.has(q.toLowerCase())).map((q) => (
          <button key={q} type="button" onClick={() => add(q)} className="flex h-9 shrink-0 items-center gap-1 rounded-full bg-white px-3.5 text-[0.85rem] font-bold whitespace-nowrap text-ink shadow-soft active:scale-95">
            <Plus className="h-3.5 w-3.5 text-brand-600" strokeWidth={3} /> {q}
          </button>
        ))}
      </HScroll>

      {habits.length > 0 && (
        <Card className="!py-3">
          <div className="flex items-baseline justify-between">
            <p className="font-extrabold text-ink">
              {met === habits.length ? "Every habit met today 🎉" : `${met} of ${habits.length} met today`}
            </p>
            <p className="text-[0.85rem] font-bold text-muted">{Math.round((met / habits.length) * 100)}%</p>
          </div>
          <div className="mt-2">
            <ProgressBar value={met / habits.length} />
          </div>
        </Card>
      )}

      {habits.length === 0 && goals.length === 0 ? (
        <Card className="py-8 text-center">
          <Figure name="water" className="mx-auto h-36 w-48" />
          <p className="mt-1 font-display text-xl font-medium text-ink">Start with one small habit</p>
          <p className="mt-1 text-muted">Type it, say it with the mic, or tap an idea above.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {habits.map((h) => (
            <HabitCard key={h.id} item={h} store={store} open={openId === h.id} onToggle={() => setOpenId(openId === h.id ? null : h.id)} onDeleted={onDeleted} />
          ))}
        </div>
      )}

      {goals.length > 0 && (
        <section className="space-y-2">
          <SectionLabel>Goals</SectionLabel>
          {goals.map((g) => (
            <GrowItem key={g.id} item={g} store={store} open={openId === g.id} onToggle={() => setOpenId(openId === g.id ? null : g.id)} onDeleted={onDeleted} />
          ))}
        </section>
      )}
    </div>
  );
}

function HabitCard({ item, store, open, onToggle, onDeleted }: { item: Item; store: Store; open: boolean; onToggle: () => void; onDeleted: (i: Item) => void }) {
  const p = pillarById[item.pillar];
  const today = store.todayKey;
  const target = item.target ?? 1;
  const count = habitCount(item, today);
  const met = item.done.includes(today);
  const streak = itemStreak(item);
  const ref = useRef<HTMLDivElement>(null);
  const week = Array.from({ length: 7 }, (_, i) => daysAgo(6 - i));

  useLayoutEffect(() => {
    if (open) ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [open]);

  return (
    <div ref={ref} className={`rounded-3xl bg-white shadow-soft ${open ? "ring-2 ring-brand-200" : ""}`}>
      <div className="flex items-center gap-3 p-3">
        <button type="button" onClick={onToggle} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <EmojiTile emoji={item.emoji} className={p.soft} />
          <span className="min-w-0 flex-1">
            <span className={`block truncate leading-snug font-bold ${met ? "text-muted" : "text-ink"}`}>{item.title}</span>
            {/* The last seven days at a glance: filled = goal met that day */}
            <span className="mt-1 flex items-center gap-1">
              {week.map((d) => {
                const k = dateKey(d);
                const on = item.done.includes(k);
                return (
                  <span
                    key={k}
                    title={d.toLocaleDateString(undefined, { weekday: "long" })}
                    className={`flex h-4 w-4 items-center justify-center rounded-full text-[0.5rem] font-extrabold ${on ? p.solid : k === today ? "ring-1 ring-ink/40" : "bg-surface text-muted"}`}
                  >
                    {on ? "" : d.toLocaleDateString(undefined, { weekday: "narrow" })}
                  </span>
                );
              })}
              <span className="ml-1 text-[0.75rem] font-bold whitespace-nowrap text-muted">{streak > 1 ? `🔥 ${streak}` : ""}</span>
              <ChevronDown className={`h-4 w-4 text-muted transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
            </span>
          </span>
        </button>

        {target > 1 ? (
          <button
            type="button"
            onClick={() => store.bumpHabit(item.id, met ? -count : 1)}
            aria-label={`${item.title}: ${count} of ${target}. ${met ? "Reset" : "Add one"}`}
            className={`flex h-11 min-w-16 shrink-0 items-center justify-center gap-1 rounded-full px-3 font-extrabold tabular-nums transition-colors ${met ? `${p.solid} animate-pop` : "bg-surface text-ink"}`}
          >
            {met ? "✓" : <Plus className="h-4 w-4" strokeWidth={3} />} {count}/{target}
          </button>
        ) : (
          <CheckCircle done={met} solid={p.solid} label={`${item.title}: ${met ? "met today" : "mark met"}`} onClick={() => store.toggleItemDay(item.id)} />
        )}
      </div>

      <Collapse open={open}>
        <div className="border-t border-line px-3 pt-3">
          <div className="flex items-center gap-2 rounded-2xl bg-surface p-1.5 pl-3">
            <span className="flex-1 text-[0.9rem] font-semibold text-ink">Daily goal</span>
            <button
              type="button"
              onClick={() => store.updateItem(item.id, { target: Math.max(1, target - 1) })}
              aria-label="Fewer times a day"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-20 text-center text-[0.9rem] font-extrabold text-ink tabular-nums">
              {target} {target === 1 ? "time" : "times"}
            </span>
            <button type="button" onClick={() => store.updateItem(item.id, { target: Math.min(50, target + 1) })} aria-label="More times a day" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {target > 1 && count > 0 && (
            <button type="button" onClick={() => store.bumpHabit(item.id, -1)} className="mt-2 h-9 w-full rounded-full text-[0.85rem] font-bold text-muted">
              Undo one ({count}/{target})
            </button>
          )}
        </div>
        <Details item={item} store={store} onDeleted={onDeleted} />
      </Collapse>
    </div>
  );
}
