"use client";

import { Check, ChevronRight } from "lucide-react";
import { Card, EmojiTile, Ring, SectionLabel } from "./ui";
import { fmtTime } from "./ItemCard";
import { Figure } from "./Figures";
import { pillarById } from "@/lib/pillars";
import { byTime, dateKey, daysAgo, taskDay, type Item, type State, type Store } from "@/lib/store";

type GoTab = "plan" | "grow" | "lists";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

/** Done and total for one day across habits, plans and list items */
function dayScore(state: State, key: string, todayKey: string) {
  const endOfDay = new Date(key + "T23:59").getTime();
  const habits = state.items.filter((i) => i.kind === "habit" && i.createdAt <= endOfDay);
  const plans = state.items.filter((i) => i.kind === "task" && (key === todayKey ? taskDay(i, todayKey) === key : i.done[0] === key || (!i.done.length && i.date === key)));
  const listItems = state.lists.filter((l) => l.date === key).flatMap((l) => l.items);
  const h = { done: habits.filter((i) => i.done.includes(key)).length, total: habits.length };
  const p = { done: plans.filter((i) => i.done.length).length, total: plans.length };
  const l = { done: listItems.filter((x) => x.done).length, total: listItems.length };
  const total = h.total + p.total + l.total;
  return { h, p, l, pct: total ? (h.done + p.done + l.done) / total : 0, total };
}

export function Home({ store, onOpen, onGo }: { store: Store; onOpen: (item: Item) => void; onGo: (tab: GoTab) => void }) {
  const { state, todayKey } = store;
  const today = dayScore(state, todayKey, todayKey);

  // Up next: the next timed plan still ahead today, else the first unchecked thing
  const nowHM = new Date().toTimeString().slice(0, 5);
  const todays = state.items.filter((i) => (i.kind === "task" ? taskDay(i, todayKey) === todayKey : i.kind === "habit"));
  const open = todays.filter((i) => !i.done.includes(todayKey) && !(i.kind === "task" && i.done.length));
  const next = open.filter((i) => i.time && i.time >= nowHM).sort(byTime)[0] ?? open.sort(byTime)[0];

  return (
    <div className="space-y-3">
      <header className="flex items-center justify-between gap-3 px-1 pt-5">
        <div className="min-w-0">
          <p className="text-[0.9rem] font-semibold text-muted">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1 className="text-[2rem] leading-tight font-medium tracking-tight text-ink">
            {greeting()}
            {state.profile.name ? `, ${state.profile.name}` : ""}
          </h1>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-soft" aria-hidden>
          {state.profile.avatar}
        </span>
      </header>

      {/* Today at a glance */}
      <Card>
        <div className="flex items-center gap-4">
          <Ring value={today.pct} size={88}>
            <span className="text-center">
              <span className="block text-xl leading-none font-extrabold text-ink tabular-nums">{Math.round(today.pct * 100)}%</span>
              <span className="text-[0.65rem] font-bold text-muted">today</span>
            </span>
          </Ring>
          <div className="flex-1 space-y-2">
            <StatBar label="Habits" emoji="🌱" {...today.h} color="bg-moss-400" onClick={() => onGo("grow")} />
            <StatBar label="Plans" emoji="🗓️" {...today.p} color="bg-brand-500" onClick={() => onGo("plan")} />
            <StatBar label="Lists" emoji="📝" {...today.l} color="bg-ochre-400" onClick={() => onGo("lists")} />
          </div>
        </div>
      </Card>

      {next && (
        <section className="flex items-center gap-3 rounded-3xl bg-ink p-3.5 text-white">
          <button type="button" onClick={() => onOpen(next)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
            <EmojiTile emoji={next.emoji} className={pillarById[next.pillar].soft} />
            <span className="min-w-0">
              <span className="block text-[0.7rem] font-bold tracking-wider text-white/60 uppercase">{next.time ? `${next.time >= nowHM ? "Up next" : "Still open"} · ${fmtTime(next.time)}` : "Just this one thing"}</span>
              <span className="block truncate text-[1.05rem] font-extrabold">{next.title}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => (next.kind === "habit" && (next.target ?? 1) > 1 ? store.bumpHabit(next.id, 1) : store.toggleItemDay(next.id))}
            aria-label={`Mark ${next.title} done`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-300 text-ink active:scale-90"
          >
            <Check className="h-5 w-5" strokeWidth={3} />
          </button>
        </section>
      )}

      {state.items.length === 0 && state.lists.length === 0 && (
        <Card className="text-center">
          <Figure name="meditate" className="mx-auto h-36 w-48" />
          <p className="font-display text-xl font-medium text-ink">A fresh start</p>
          <p className="mt-1 text-[0.95rem] text-muted">Add one habit, one plan, or one thing to your list. That&apos;s enough for today.</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {(
              [
                ["grow", "🌱 Habit"],
                ["plan", "🗓️ Plan"],
                ["lists", "📝 List"],
              ] as const
            ).map(([t, l]) => (
              <button key={t} type="button" onClick={() => onGo(t)} className="h-11 rounded-full bg-surface text-[0.9rem] font-bold text-ink active:scale-95">
                {l}
              </button>
            ))}
          </div>
        </Card>
      )}

      <SectionLabel>Last 7 days</SectionLabel>
      <WeekChart state={state} todayKey={todayKey} />

      <HabitChart state={state} onGo={() => onGo("grow")} />
    </div>
  );
}

function StatBar({ label, emoji, done, total, color, onClick }: { label: string; emoji: string; done: number; total: number; color: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="block w-full text-left active:scale-[0.98]">
      <span className="flex items-baseline justify-between text-[0.85rem]">
        <span className="font-bold text-ink">
          <span aria-hidden>{emoji}</span> {label}
        </span>
        <span className="font-extrabold text-muted tabular-nums">
          {done}/{total}
        </span>
      </span>
      <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-surface">
        <span className={`block h-full rounded-full transition-[width] duration-500 ${color}`} style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
      </span>
    </button>
  );
}

/** Bar chart: how much of each day got done */
function WeekChart({ state, todayKey }: { state: State; todayKey: string }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = daysAgo(6 - i);
    const key = dateKey(d);
    return { d, key, ...dayScore(state, key, todayKey) };
  });
  const active = days.filter((d) => d.total);
  const avg = active.length ? active.reduce((n, d) => n + d.pct, 0) / active.length : 0;
  const best = [...active].sort((a, b) => b.pct - a.pct)[0];

  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <p className="text-[0.85rem] font-bold text-muted">Average</p>
        <p className="text-[1.6rem] leading-none font-extrabold text-ink tabular-nums">{Math.round(avg * 100)}%</p>
      </div>
      <div className="relative mt-3 h-36">
        {/* Gridlines at 0, 50 and 100% */}
        {[0, 50, 100].map((g) => (
          <div key={g} className="absolute inset-x-0 border-t border-dashed border-line" style={{ bottom: `${g}%` }}>
            <span className="absolute -top-2 right-0 bg-white pl-1 text-[0.6rem] font-bold text-stone-400">{g}%</span>
          </div>
        ))}
        <div className="absolute inset-0 right-7 grid grid-cols-7 items-end gap-2">
          {days.map(({ d, key, pct, total }) => (
            <div key={key} className="flex h-full flex-col justify-end" aria-label={`${d.toLocaleDateString(undefined, { weekday: "long" })}: ${Math.round(pct * 100)}%`}>
              {total > 0 && pct > 0 && <span className="mb-0.5 text-center text-[0.6rem] font-extrabold text-muted tabular-nums">{Math.round(pct * 100)}</span>}
              <div
                className={`w-full rounded-t-lg transition-all duration-700 ${key === todayKey ? "grad-bar" : "bg-brand-200"}`}
                style={{ height: total ? `${Math.max(4, pct * 100)}%` : "4px", opacity: total ? 1 : 0.4 }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-1.5 grid grid-cols-7 gap-2 pr-7 text-center">
        {days.map(({ d, key }) => (
          <span key={key} className={`text-[0.7rem] font-bold ${key === todayKey ? "text-ink" : "text-muted"}`}>
            {d.toLocaleDateString(undefined, { weekday: "narrow" })}
          </span>
        ))}
      </div>
      {best && best.pct > 0 && (
        <p className="mt-3 text-[0.85rem] text-muted">
          Best day: <span className="font-bold text-ink">{best.d.toLocaleDateString(undefined, { weekday: "long" })}</span> at {Math.round(best.pct * 100)}%.
        </p>
      )}
    </Card>
  );
}

/** Horizontal bars: how often each habit's daily goal was met in the last 14 days */
function HabitChart({ state, onGo }: { state: State; onGo: () => void }) {
  const keys = Array.from({ length: 14 }, (_, i) => dateKey(daysAgo(i)));
  const rows = state.items
    .filter((i) => i.kind === "habit")
    .map((i) => {
      // Only count days since the habit was added
      const since = keys.filter((k) => new Date(k + "T23:59").getTime() >= i.createdAt);
      const met = since.filter((k) => i.done.includes(k)).length;
      return { i, met, of: since.length, pct: since.length ? met / since.length : 0 };
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 6);
  if (!rows.length) return null;

  return (
    <>
      <SectionLabel
        action={
          <button type="button" onClick={onGo} className="flex items-center text-[0.8rem] font-bold text-brand-700">
            All habits <ChevronRight className="h-4 w-4" />
          </button>
        }
      >
        Habit consistency · 14 days
      </SectionLabel>
      <Card className="space-y-3">
        {rows.map(({ i, met, of, pct }) => {
          const p = pillarById[i.pillar];
          return (
            <div key={i.id}>
              <div className="flex items-baseline justify-between gap-2 text-[0.9rem]">
                <span className="min-w-0 truncate font-bold text-ink">
                  <span aria-hidden>{i.emoji}</span> {i.title}
                </span>
                <span className="shrink-0 text-[0.8rem] font-extrabold text-muted tabular-nums">
                  {met}/{of} days
                </span>
              </div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-surface">
                <div className={`h-full rounded-full transition-[width] duration-700 ${p.bar}`} style={{ width: `${Math.max(pct ? 4 : 0, pct * 100)}%` }} />
              </div>
            </div>
          );
        })}
      </Card>
    </>
  );
}
