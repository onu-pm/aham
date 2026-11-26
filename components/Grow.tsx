"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ChevronDown, Minus, Plus, RotateCcw, Sparkles } from "lucide-react";
import { Card, CheckCircle, Collapse, EmojiTile, SectionLabel, Segmented } from "./ui";
import { AddBar } from "./AddBar";
import { Details, GrowItem } from "./ItemCard";
import { Figure } from "./Figures";
import { detect, pillarById, tidyTitle } from "@/lib/pillars";
import { celebrate } from "@/lib/fx";
import { HABIT_IDEAS, ideaFor, stageFor, type HabitMode } from "@/lib/habitTips";
import { dateKey, daysAgo, habitCount, itemStreak, type Item, type Store } from "@/lib/store";

/** "drink water 8 times", "8 glasses of water", "pushups x20" → a daily target */
function parseTarget(raw: string): { title: string; target: number } {
  const m = raw.match(/\b(?:x\s*(\d+)|(\d+)\s*(?:x|times?(?:\s+a\s+day)?|glasses|cups|reps|times daily))\b/i);
  if (!m) return { title: raw, target: 1 };
  const n = Number(m[1] ?? m[2]);
  if (!(n > 1 && n <= 50)) return { title: raw, target: 1 };
  const title = /glasses|cups|reps/i.test(m[0]) ? raw : raw.replace(m[0], " ").replace(/\s+/g, " ").trim();
  return { title, target: n };
}

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
  const [mode, setMode] = useState<HabitMode>("build");
  const [peek, setPeek] = useState<string | null>(null);
  const habits = store.state.items.filter((i) => i.kind === "habit");
  const building = habits.filter((h) => h.mode !== "quit");
  const quitting = habits.filter((h) => h.mode === "quit");
  const goals = store.state.items.filter((i) => i.kind === "goal");
  const met = habits.filter((h) => h.done.includes(today)).length;
  const existing = new Set(habits.map((i) => i.title.toLowerCase()));
  const ideas = HABIT_IDEAS.filter((i) => i.mode === mode && !existing.has(i.title.toLowerCase()));
  const peeked = peek ? HABIT_IDEAS.find((i) => i.title === peek) : null;

  const add = (raw: string, m: HabitMode = mode, emoji?: string) => {
    const { title, target } = m === "build" ? parseTarget(raw) : { title: raw, target: 1 };
    const t = tidyTitle(title);
    const d = detect(t);
    const idea = HABIT_IDEAS.find((i) => i.title.toLowerCase() === t.toLowerCase() || i.match.test(t));
    const id = store.addItem({ title: t, emoji: emoji ?? idea?.emoji ?? d.emoji, pillar: d.pillar, kind: "habit", target, mode: m });
    setPeek(null);
    setOpenId(id);
  };

  return (
    <div className="stagger space-y-3">
      <header className="px-1 pt-5">
        <p className="text-[0.9rem] font-semibold text-muted">Your garden</p>
        <h1 className="text-[2rem] leading-tight font-medium tracking-tight text-ink">Grow</h1>
      </header>

      {/* Every habit is a plant; it grows with each day you keep it */}
      {habits.length > 0 && (
        <section className="rounded-3xl bg-forest p-4 text-white">
          <div className="flex items-baseline justify-between">
            <p className="font-display text-lg font-medium">{met === habits.length ? "Everything watered today 🎉" : `${met} of ${habits.length} cared for today`}</p>
          </div>
          <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1">
            {habits.map((h, idx) => {
              const s = stageFor(h.done.length);
              const on = h.done.includes(today);
              return (
                <button key={h.id} type="button" onClick={() => setOpenId(h.id)} className="flex w-16 shrink-0 flex-col items-center gap-1">
                  <span className={`flex h-14 w-14 items-center justify-center rounded-2xl text-[1.8rem] transition-colors duration-500 ${on ? "bg-moss-400/40" : "bg-white/10"}`}>
                    <span className="animate-float inline-block" style={{ animationDelay: `${idx * -0.6}s` }}>
                      {s.emoji}
                    </span>
                  </span>
                  <span className="w-full truncate text-center text-[0.68rem] font-semibold text-white/75">{h.title}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[0.75rem] text-white/50">🌰 → 🌱 → 🌿 → 🪴 → 🌳 → 🌸 · plants grow with every day you keep a habit</p>
        </section>
      )}

      <Segmented
        value={mode}
        onChange={(v) => (setMode(v), setPeek(null))}
        options={[
          { value: "build", label: "🌱 Build a habit" },
          { value: "quit", label: "🍃 Quit a habit" },
        ]}
      />

      <AddBar key={mode} placeholder={mode === "build" ? "Build… e.g. “drink water 8 times”" : "Quit… e.g. “late-night scrolling”"} onAdd={(t) => add(t)} />

      {/* Ideas: tap to see what helps, then add */}
      <div className="grid grid-cols-2 gap-2">
        {ideas.slice(0, 6).map((i) => (
          <button
            key={i.title}
            type="button"
            onClick={() => setPeek(peek === i.title ? null : i.title)}
            aria-expanded={peek === i.title}
            className={`flex min-h-14 items-center gap-2 rounded-2xl p-2.5 text-left transition-colors ${peek === i.title ? "bg-ink text-white" : mode === "build" ? "bg-moss-50 text-ink" : "bg-clay-50 text-ink"}`}
          >
            <span className="text-xl" aria-hidden>
              {i.emoji}
            </span>
            <span className="text-[0.9rem] leading-snug font-bold">{i.title}</span>
          </button>
        ))}
      </div>

      <Collapse open={!!peeked}>
        {peeked && (
          <Card className="!bg-ochre-50">
            <p className="flex items-center gap-1.5 text-[0.75rem] font-bold tracking-wider text-ochre-700 uppercase">
              <Sparkles className="h-3.5 w-3.5" /> What helps, people say
            </p>
            <p className="mt-1 font-display text-lg font-medium text-ink">
              {peeked.emoji} {peeked.title}
            </p>
            <ul className="mt-2 space-y-1.5">
              {peeked.tips.map((t) => (
                <li key={t} className="flex gap-2 text-[0.92rem] text-ink">
                  <span className="text-ochre-700">•</span> {t}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[0.85rem] text-muted italic">{peeked.note}</p>
            <button type="button" onClick={() => add(peeked.title, peeked.mode, peeked.emoji)} className="mt-3 flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-ink font-bold text-white active:scale-[0.98]">
              <Plus className="h-4 w-4" strokeWidth={3} /> {peeked.mode === "build" ? "Start building this" : "Start quitting this"}
            </button>
            <p className="mt-2 text-center text-[0.7rem] text-muted">Common advice from habit communities like r/getdisciplined, in our words.</p>
          </Card>
        )}
      </Collapse>

      {habits.length === 0 && goals.length === 0 ? (
        <Card className="py-6 text-center">
          <Figure name="water" className="mx-auto h-36 w-48" />
          <p className="mt-1 font-display text-xl font-medium text-ink">Plant your first habit</p>
          <p className="mt-1 text-muted">Pick an idea above, type one, or say it with the mic.</p>
        </Card>
      ) : (
        <>
          {building.length > 0 && (
            <section className="space-y-2">
              <SectionLabel>🌱 Building</SectionLabel>
              {building.map((h) => (
                <HabitCard key={h.id} item={h} store={store} open={openId === h.id} onToggle={() => setOpenId(openId === h.id ? null : h.id)} onDeleted={onDeleted} />
              ))}
            </section>
          )}
          {quitting.length > 0 && (
            <section className="space-y-2">
              <SectionLabel>🍃 Quitting</SectionLabel>
              {quitting.map((h) => (
                <HabitCard key={h.id} item={h} store={store} open={openId === h.id} onToggle={() => setOpenId(openId === h.id ? null : h.id)} onDeleted={onDeleted} />
              ))}
            </section>
          )}
        </>
      )}

      {goals.length > 0 && (
        <section className="space-y-2">
          <SectionLabel>🎯 Goals</SectionLabel>
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
  const quit = item.mode === "quit";
  const target = item.target ?? 1;
  const count = habitCount(item, today);
  const met = item.done.includes(today);
  const streak = itemStreak(item);
  const stage = stageFor(item.done.length);
  const tips = ideaFor(item.title, quit ? "quit" : "build");
  const ref = useRef<HTMLDivElement>(null);
  const week = Array.from({ length: 7 }, (_, i) => daysAgo(6 - i));

  useLayoutEffect(() => {
    if (open) ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [open]);

  return (
    <div ref={ref} className={`rounded-3xl bg-white shadow-soft ${open ? "ring-2 ring-brand-200" : ""}`}>
      <div className="flex items-center gap-3 p-3">
        <button type="button" onClick={onToggle} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className="relative">
            <EmojiTile emoji={item.emoji} className={quit ? "bg-clay-100" : p.soft} />
            <span className="absolute -right-1 -bottom-1 text-[0.9rem]" aria-hidden title={stage.name}>
              {stage.emoji}
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <span className={`block truncate leading-snug font-bold ${met ? "text-muted" : "text-ink"}`}>{item.title}</span>
            {quit ? (
              <span className="block text-[0.8rem] font-semibold text-muted">
                {streak > 0 ? `${streak} ${streak === 1 ? "day" : "days"} clean` : "Day one starts today"} · {stage.name}
              </span>
            ) : (
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
            )}
          </span>
        </button>

        {quit ? (
          <button
            type="button"
            onClick={(e) => {
              if (!met) celebrate(e.currentTarget);
              store.toggleItemDay(item.id);
            }}
            aria-pressed={met}
            className={`flex h-11 shrink-0 items-center gap-1 rounded-full px-3.5 text-[0.85rem] font-extrabold transition-colors ${met ? "animate-pop bg-moss-400 text-white" : "bg-surface text-ink"}`}
          >
            {met ? "✓ Clean" : "Clean today"}
          </button>
        ) : target > 1 ? (
          <button
            type="button"
            onClick={(e) => {
              if (!met && count + 1 >= target) celebrate(e.currentTarget);
              store.bumpHabit(item.id, met ? -count : 1);
            }}
            aria-label={`${item.title}: ${count} of ${target}. ${met ? "Reset" : "Add one"}`}
            className={`flex h-11 min-w-16 shrink-0 items-center justify-center gap-1 rounded-full px-3 font-extrabold tabular-nums transition-colors ${met ? `${p.solid} animate-pop` : "bg-surface text-ink"}`}
          >
            {met ? "✓" : <Plus className="h-4 w-4" strokeWidth={3} />} {count}/{target}
          </button>
        ) : (
          <CheckCircle done={met} solid={p.solid} label={`${item.title}: ${met ? "done today" : "mark done"}`} onClick={() => store.toggleItemDay(item.id)} />
        )}
      </div>

      <Collapse open={open}>
        <div className="space-y-3 border-t border-line px-3 pt-3">
          {/* The plant and how far to the next stage */}
          <div className="flex items-center gap-3 rounded-2xl bg-moss-50 p-3">
            <span className="animate-float text-4xl" aria-hidden>
              {stage.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-ink">
                {stage.name} · {item.done.length} {item.done.length === 1 ? "day" : "days"}
              </p>
              {stage.next ? (
                <>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full bg-moss-400 transition-[width] duration-700" style={{ width: `${Math.max(4, stage.progress * 100)}%` }} />
                  </div>
                  <p className="mt-1 text-[0.78rem] text-muted">
                    {stage.next.at - item.done.length} more {stage.next.at - item.done.length === 1 ? "day" : "days"} to {stage.next.emoji} {stage.next.name}
                  </p>
                </>
              ) : (
                <p className="text-[0.8rem] text-muted">Fully grown. This is part of you now.</p>
              )}
            </div>
          </div>

          {quit && met && (
            <button type="button" onClick={() => store.toggleItemDay(item.id)} className="flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-clay-50 text-[0.85rem] font-bold text-clay-700">
              <RotateCcw className="h-4 w-4" /> I slipped today. That&apos;s okay, keep going
            </button>
          )}

          {!quit && (
            <div className="flex items-center gap-2 rounded-2xl bg-surface p-1.5 pl-3">
              <span className="flex-1 text-[0.9rem] font-semibold text-ink">Daily goal</span>
              <button type="button" onClick={() => store.updateItem(item.id, { target: Math.max(1, target - 1) })} aria-label="Fewer times a day" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-20 text-center text-[0.9rem] font-extrabold text-ink tabular-nums">
                {target} {target === 1 ? "time" : "times"}
              </span>
              <button type="button" onClick={() => store.updateItem(item.id, { target: Math.min(50, target + 1) })} aria-label="More times a day" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}
          {!quit && target > 1 && count > 0 && (
            <button type="button" onClick={() => store.bumpHabit(item.id, -1)} className="h-9 w-full rounded-full text-[0.85rem] font-bold text-muted">
              Undo one ({count}/{target})
            </button>
          )}

          <div className="rounded-2xl bg-ochre-50 p-3">
            <p className="flex items-center gap-1.5 text-[0.72rem] font-bold tracking-wider text-ochre-700 uppercase">
              <Sparkles className="h-3.5 w-3.5" /> What helps, people say
            </p>
            <ul className="mt-1.5 space-y-1">
              {tips.tips.map((t) => (
                <li key={t} className="flex gap-2 text-[0.88rem] text-ink">
                  <span className="text-ochre-700">•</span> {t}
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-[0.8rem] text-muted italic">{tips.note}</p>
          </div>
        </div>
        <Details item={item} store={store} onDeleted={onDeleted} />
      </Collapse>
    </div>
  );
}
