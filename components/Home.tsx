"use client";

import { useState } from "react";
import { Check, ChevronRight, SkipForward } from "lucide-react";
import { Card, EmojiTile, Ring, SectionLabel } from "./ui";
import { ItemRow, fmtTime } from "./ItemCard";
import { MoodCard } from "./Mind";
import { MOODS, PILLARS, pillarById } from "@/lib/pillars";
import { byTime, dateKey, daysAgo, itemStreak, itemsForDay, showingUpStreak, stepDone, type Item, type State, type Store } from "@/lib/store";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

type Next = { key: string; text: string; from: string | null; emoji: string; tint: string; done: () => void };

export function Home({ store, onOpen, onGo }: { store: Store; onOpen: (item: Item) => void; onGo: (tab: "plan" | "grow" | "mind") => void }) {
  const { state, todayKey } = store;
  const [skip, setSkip] = useState(0);
  const today = itemsForDay(state.items, todayKey, todayKey);
  const habits = today.filter((i) => i.kind !== "task");
  const tasks = today.filter((i) => i.kind === "task");
  const done = (i: Item) => i.done.includes(todayKey);
  const doneCount = today.filter(done).length;
  const mood = state.moods[todayKey];

  // One tiny next thing: the next unfinished micro-step, else the next unchecked item (timed ones first)
  const queue: Next[] = [];
  for (const i of [...today].sort(byTime)) {
    if (done(i)) continue;
    const p = pillarById[i.pillar];
    const step = i.steps.find((s) => !stepDone(i, s.id, todayKey));
    if (step) queue.push({ key: step.id, text: step.text, from: i.title, emoji: i.emoji, tint: p.soft, done: () => store.toggleStep(i.id, step.id) });
    else queue.push({ key: i.id, text: i.title, from: null, emoji: i.emoji, tint: p.soft, done: () => store.toggleItemDay(i.id) });
  }
  const next = queue.length ? queue[skip % queue.length] : null;

  const nowHM = new Date().toTimeString().slice(0, 5);
  const upcoming = today.filter((i) => i.time && !done(i) && i.time >= nowHM).sort(byTime).slice(0, 3);

  return (
    <div className="space-y-3">
      <header className="flex items-center justify-between gap-3 px-1 pt-5">
        <div className="min-w-0">
          <p className="text-[0.9rem] font-semibold text-muted">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1 className="text-[1.75rem] leading-tight font-extrabold tracking-tight text-ink">
            {greeting()}
            {state.profile.name ? `, ${state.profile.name}` : ""}
          </h1>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-soft" aria-hidden>
          {state.profile.avatar}
        </span>
      </header>

      {/* Snapshot */}
      <Card>
        <div className="flex items-center gap-4">
          <Ring value={today.length ? doneCount / today.length : 0} size={76}>
            <span className="text-lg font-extrabold text-ink tabular-nums">{today.length ? Math.round((doneCount / today.length) * 100) : 0}%</span>
          </Ring>
          <div className="grid flex-1 grid-cols-3 gap-2 text-center">
            <Stat label="Habits" value={`${habits.filter(done).length}/${habits.length}`} onClick={() => onGo("grow")} />
            <Stat label="Tasks" value={`${tasks.filter(done).length}/${tasks.length}`} onClick={() => onGo("plan")} />
            <Stat label="Mood" value={mood != null ? MOODS[mood] : "–"} onClick={() => onGo("mind")} />
          </div>
        </div>
        <p className="mt-3 text-[0.9rem] text-muted">
          {today.length === 0
            ? "Nothing planned yet. Add one small thing in Grow or Plan."
            : doneCount === today.length
              ? "Everything's done for today. That's real growth. 🌱"
              : `${today.length - doneCount} left today. One at a time is enough.`}
        </p>
      </Card>

      {mood == null && <MoodCard store={store} compact />}

      {/* One tiny step lowers the "where do I start" barrier */}
      {next && (
        <section className="rounded-3xl bg-ink p-4 text-white">
          <p className="text-[0.75rem] font-bold tracking-wider text-white/60 uppercase">Just this one thing</p>
          <div className="mt-2.5 flex items-center gap-3">
            <EmojiTile emoji={next.emoji} size="lg" className={next.tint} />
            <div className="min-w-0">
              <p className="text-lg leading-snug font-extrabold">{next.text}</p>
              {next.from && <p className="text-[0.85rem] text-white/60">Step of “{next.from}”</p>}
            </div>
          </div>
          <div className="mt-3.5 flex gap-2">
            <button type="button" onClick={next.done} className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-300 font-extrabold text-ink active:scale-[0.98]">
              <Check className="h-5 w-5" strokeWidth={3} /> Done
            </button>
            {queue.length > 1 && (
              <button type="button" onClick={() => setSkip(skip + 1)} className="flex h-11 items-center gap-1.5 rounded-full bg-white/10 px-4 font-bold active:scale-95">
                <SkipForward className="h-4 w-4" /> Not now
              </button>
            )}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <>
          <SectionLabel>Coming up</SectionLabel>
          <Card className="!py-2">
            {upcoming.map((i) => (
              <button key={i.id} type="button" onClick={() => onOpen(i)} className="flex w-full items-center gap-3 py-1.5 text-left">
                <span className="w-16 shrink-0 text-[0.85rem] font-extrabold text-brand-700">{fmtTime(i.time!)}</span>
                <span className="text-lg" aria-hidden>
                  {i.emoji}
                </span>
                <span className="min-w-0 flex-1 truncate font-bold text-ink">{i.title}</span>
              </button>
            ))}
          </Card>
        </>
      )}

      {today.length > 0 && (
        <>
          <SectionLabel>Today</SectionLabel>
          <Card className="!py-2">
            <div className="divide-y divide-line">
              {[...today].sort(byTime).map((i) => (
                <ItemRow key={i.id} item={i} store={store} onOpen={() => onOpen(i)} />
              ))}
            </div>
          </Card>
        </>
      )}

      <SectionLabel>Your week</SectionLabel>
      <WeekSummary state={state} />

      <Insights state={state} />
    </div>
  );
}

function Stat({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-2xl bg-surface py-2 active:scale-95">
      <p className="text-lg leading-tight font-extrabold text-ink tabular-nums">{value}</p>
      <p className="text-[0.75rem] font-bold text-muted">{label}</p>
    </button>
  );
}

/** Seven days: how much got done and how you felt */
function WeekSummary({ state }: { state: State }) {
  const habits = state.items.filter((i) => i.kind !== "task");
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = daysAgo(6 - i);
    const key = dateKey(d);
    const doneHabits = habits.filter((h) => h.done.includes(key)).length;
    const doneTasks = state.items.filter((t) => t.kind === "task" && t.done[0] === key).length;
    return { d, key, pct: habits.length ? doneHabits / habits.length : 0, tasks: doneTasks, mood: state.moods[key] };
  });
  return (
    <Card>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map(({ d, key, pct, tasks, mood }) => (
          <div key={key} className="flex flex-col items-center gap-1">
            <span className="h-5 text-base leading-none" aria-hidden>
              {mood != null ? MOODS[mood] : ""}
            </span>
            <div className="relative flex h-16 w-full items-end overflow-hidden rounded-xl bg-surface" aria-label={`${d.toLocaleDateString(undefined, { weekday: "long" })}: ${Math.round(pct * 100)}% of habits, ${tasks} tasks`}>
              <div className="w-full rounded-xl grad-bar transition-all duration-500" style={{ height: `${pct * 100}%` }} />
              {tasks > 0 && <span className="absolute inset-x-0 top-1 text-center text-[0.65rem] font-extrabold text-ink">+{tasks}</span>}
            </div>
            <span className={`text-[0.7rem] font-bold ${key === dateKey() ? "text-ink" : "text-muted"}`}>{d.toLocaleDateString(undefined, { weekday: "narrow" })}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[0.8rem] text-muted">Bars show habits done, +n is tasks finished, and the face is your mood that day.</p>
    </Card>
  );
}

/** A few plain-language observations, only ones the data actually supports */
function Insights({ state }: { state: State }) {
  const week = new Set(Array.from({ length: 7 }, (_, i) => dateKey(daysAgo(i))));
  const lastWeek = new Set(Array.from({ length: 7 }, (_, i) => dateKey(daysAgo(i + 7))));
  const out: { emoji: string; text: string }[] = [];

  const best = state.items.filter((i) => i.kind !== "task").map((i) => ({ i, s: itemStreak(i) })).sort((a, b) => b.s - a.s)[0];
  if (best && best.s >= 2) out.push({ emoji: "🔥", text: `“${best.i.title}” is on a ${best.s}-day streak.` });

  const show = showingUpStreak(state);
  if (show >= 3) out.push({ emoji: "🌱", text: `You've shown up ${show} days in a row.` });

  const pillarCounts = PILLARS.map((p) => ({
    p,
    n: state.items.filter((i) => i.pillar === p.id).reduce((n, i) => n + i.done.filter((k) => week.has(k)).length, 0),
    has: state.items.some((i) => i.pillar === p.id && i.kind !== "task"),
  })).filter((x) => x.has);
  const top = [...pillarCounts].sort((a, b) => b.n - a.n)[0];
  if (top && top.n > 0) out.push({ emoji: top.p.emoji, text: `${top.p.label} got the most love this week.` });
  const quiet = pillarCounts.find((x) => x.n === 0);
  if (quiet && pillarCounts.length > 1) out.push({ emoji: "🫶", text: `${quiet.p.label} has been quiet this week. Maybe one small step?` });

  const avg = (keys: Set<string>) => {
    const v = [...keys].map((k) => state.moods[k]).filter((m): m is number => m != null);
    return v.length >= 2 ? v.reduce((a, b) => a + b, 0) / v.length : null;
  };
  const a = avg(week);
  const b = avg(lastWeek);
  if (a != null && b != null && Math.abs(a - b) >= 0.5)
    out.push({ emoji: a > b ? "📈" : "💜", text: a > b ? "Your mood is up compared to last week." : "Your mood is a bit lower than last week. Be gentle with yourself." });

  const stepsLeft = state.items
    .filter((i) => i.kind === "task" && !i.done.length && i.steps.length)
    .reduce((n, i) => n + i.steps.filter((s) => !s.done).length, 0);
  if (stepsLeft) out.push({ emoji: "🧩", text: `${stepsLeft} tiny step${stepsLeft === 1 ? "" : "s"} left across your tasks.` });

  if (!out.length) return null;
  return (
    <>
      <SectionLabel>Insights</SectionLabel>
      <Card className="!py-2">
        <ul className="divide-y divide-line">
          {out.slice(0, 4).map((x) => (
            <li key={x.text} className="flex items-center gap-3 py-2.5">
              <span className="text-xl" aria-hidden>
                {x.emoji}
              </span>
              <span className="flex-1 text-[0.95rem] font-semibold text-ink">{x.text}</span>
              <ChevronRight className="h-4 w-4 text-zinc-300" />
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
