"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Card, SectionLabel } from "./ui";
import { fmtTime } from "./ItemCard";
import { Figure } from "./Figures";
import { pillarById } from "@/lib/pillars";
import { byTime, dateKey, daysAgo, showingUpStreak, taskDay, type Item, type State, type Store } from "@/lib/store";
import { goalProgress, rankFor, totalXp, wheel } from "@/lib/goals";
import { Wheel } from "./Wheel";

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
  const nowHM = new Date().toTimeString().slice(0, 5);

  const habits = state.items.filter((i) => i.kind === "habit");
  const plansToday = state.items.filter((i) => i.kind === "task" && taskDay(i, todayKey) === todayKey).sort(byTime);
  const nextPlan = plansToday.find((i) => !i.done.length && i.time && i.time >= nowHM) ?? plansToday.find((i) => !i.done.length);
  const tasksLeft = state.lists.filter((l) => l.date === todayKey).flatMap((l) => l.items.map((x) => ({ ...x, emoji: l.emoji ?? "✅" }))).filter((x) => !x.done);
  const showUp = showingUpStreak(state);
  // The goal closest to its next milestone, and your level
  const closest = habits
    .map((h) => ({ h, p: goalProgress(h) }))
    .filter((x) => x.p.next)
    .sort((a, b) => a.p.next!.at - a.p.done - (b.p.next!.at - b.p.done))[0];
  const xp = totalXp(state.items);
  const rank = rankFor(xp);

  // This month at a glance: the self-growth numbers that matter
  const monthStart = dateKey(new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12));
  const habitDays = habits.reduce((n, h) => n + h.done.filter((k) => k >= monthStart).length, 0);
  const plansDone = state.items.filter((i) => i.kind === "task" && i.done[0] && i.done[0] >= monthStart).length;
  const tasksDone = state.lists.filter((l) => l.date >= monthStart).reduce((n, l) => n + l.items.filter((x) => x.done).length, 0);
  const activeThisMonth = new Set([...habits.flatMap((h) => h.done), ...state.lists.filter((l) => l.items.some((x) => x.done)).map((l) => l.date)].filter((k) => k >= monthStart)).size;

  const pct = Math.round(today.pct * 100);
  // Let the ring fill in after the page appears
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 120);
    return () => clearTimeout(t);
  }, []);
  const cheer = today.total === 0 ? "A fresh page. Add one small thing." : pct === 100 ? "Everything done. Be proud of today 🌸" : pct >= 50 ? "More than halfway. Lovely work." : pct > 0 ? "You've started. That's the hardest part." : "One small step is all it takes.";

  return (
    <div className="stagger space-y-3">
      <header className="flex items-center justify-between gap-3 px-1 pt-5">
        <div className="min-w-0">
          <p className="text-[0.9rem] font-semibold text-muted">
            <span className="animate-float mr-1 inline-block" aria-hidden>
              {new Date().getHours() < 17 ? "☀️" : "🌙"}
            </span>
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="text-[2rem] leading-tight font-medium tracking-tight text-ink">
            {greeting()}
            {state.profile.name ? `, ${state.profile.name}` : ""}
          </h1>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-soft" aria-hidden>
          {state.profile.avatar}
        </span>
      </header>

      {/* Today: the big tile */}
      <section className="grad-sunrise relative overflow-hidden rounded-[1.75rem] p-5 text-ink shadow-soft">
        <span aria-hidden className="animate-breathe absolute -top-10 -right-8 h-36 w-36 rounded-full bg-ochre-400/50 blur-xl" />
        <span aria-hidden className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/50 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="relative h-[5.5rem] w-[5.5rem] shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" stroke="rgb(255 255 255 / 0.7)" />
              <circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" strokeLinecap="round" stroke="var(--color-moss-400)" strokeDasharray={2 * Math.PI * 42} strokeDashoffset={2 * Math.PI * 42 * (1 - (shown ? today.pct : 0))} className="transition-[stroke-dashoffset] duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]" />
            </svg>
            <span className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-2xl leading-none font-medium tabular-nums">
                <CountUp to={pct} />%
              </span>
              <span className="text-[0.62rem] text-ink/60">today</span>
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-display text-[1.25rem] leading-snug font-medium">{cheer}</p>
            <p className="mt-1 text-[0.85rem] text-ink/60">
              {today.total ? `${today.h.done + today.p.done + today.l.done} of ${today.total} things done` : "Nothing planned yet"}
            </p>
          </div>
        </div>
      </section>

      {/* Bento: every tile opens its place */}
      <div className="grid grid-cols-2 gap-2.5">
        <Tile tone="tone-ochre" onClick={() => onGo("lists")} label="Tasks" icon="✅">
          <p className="font-display text-[1.75rem] leading-none font-medium text-ink tabular-nums">
            <CountUp to={tasksLeft.length} />
          </p>
          <p className="text-[0.8rem] font-semibold text-ochre-700">{tasksLeft.length === 1 ? "task left" : "tasks left"}</p>
          <ul className="mt-2 space-y-0.5">
            {tasksLeft.slice(0, 2).map((x) => (
              <li key={x.id} className="truncate text-[0.8rem] text-ink">
                {x.emoji} {x.text}
              </li>
            ))}
            {tasksLeft.length === 0 && <li className="text-[0.8rem] text-ink/70">All clear ✨</li>}
          </ul>
        </Tile>

        <Tile tone="tone-slate" onClick={() => (nextPlan ? onOpen(nextPlan) : onGo("plan"))} label="Plan" icon="🗓️">
          {nextPlan ? (
            <>
              <p className="text-[0.8rem] font-bold text-slate-700">{nextPlan.time ? `${nextPlan.time >= nowHM ? "Next" : "Still open"} · ${fmtTime(nextPlan.time)}` : "Today"}</p>
              <p className="mt-0.5 line-clamp-2 font-display text-[1.05rem] leading-snug font-medium text-ink">
                {nextPlan.emoji} {nextPlan.title}
              </p>
              <p className="mt-1.5 text-[0.75rem] text-muted">
                {plansToday.filter((i) => !i.done.length).length} of {plansToday.length} left today
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-[1.05rem] leading-snug font-medium text-ink">Plan your day</p>
              <p className="mt-1 text-[0.78rem] text-slate-700">Add a few blocks →</p>
            </>
          )}
        </Tile>

        <Tile tone="tone-moss" onClick={() => (closest ? onOpen(closest.h) : onGo("grow"))} label="Goals" icon="🎯" wide>
          {habits.length ? (
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-display text-[1.75rem] leading-none font-medium text-ink tabular-nums">
                  {today.h.done}
                  <span className="text-[1rem] text-muted">/{today.h.total}</span>
                </p>
                <p className="text-[0.8rem] font-semibold text-moss-700">goals done today</p>
                {closest?.p.next && (
                  <p className="mt-2 text-[0.78rem] text-ink/70">
                    🏅 <span className="font-semibold text-ink">{closest.p.next.name}</span> in {closest.p.next.at - closest.p.done}{" "}
                    {closest.p.next.at - closest.p.done === 1 ? "day" : "days"} · {closest.h.title}
                  </p>
                )}
              </div>
              <div className="shrink-0 rounded-full bg-white/70 p-1">
                <Wheel values={wheel(state.items)} size={96} />
              </div>
            </div>
          ) : (
            <p className="font-display text-[1.05rem] font-medium text-ink">Start your first goal →</p>
          )}
        </Tile>

        <Tile tone="tone-clay" onClick={() => onGo("grow")} label="Showing up" icon="🔥">
          <p className="font-display text-[1.75rem] leading-none font-medium text-ink tabular-nums">
            <CountUp to={showUp} />
          </p>
          <p className="text-[0.8rem] font-semibold text-clay-700">{showUp === 1 ? "day in a row" : "days in a row"}</p>
        </Tile>

        <Tile tone="tone-sage" onClick={() => onGo("grow")} label={`Level ${rank.level}`} icon={rank.emoji}>
          <p className="font-display text-[1.15rem] leading-tight font-medium text-ink">{rank.name}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/70">
            <div className="animate-grow-x h-full rounded-full bg-moss-400" style={{ width: `${Math.max(4, rank.progress * 100)}%` }} />
          </div>
          <p className="mt-1 text-[0.75rem] font-semibold text-sage-700">
            <CountUp to={xp} /> XP{rank.next ? ` · ${rank.next.at - xp} to go` : ""}
          </p>
        </Tile>
      </div>

      {/* This month: what growth looks like in numbers */}
      <SectionLabel>This month</SectionLabel>
      <div className="grid grid-cols-4 gap-2">
        {[
          { v: activeThisMonth, l: "Active days", tone: "bg-plum-50 text-plum-700" },
          { v: habitDays, l: "Goal check-ins", tone: "bg-moss-50 text-moss-700" },
          { v: plansDone, l: "Plans done", tone: "bg-slate-50 text-slate-700" },
          { v: tasksDone, l: "Tasks ticked", tone: "bg-ochre-50 text-ochre-700" },
        ].map((x) => (
          <div key={x.l} className={`rounded-2xl px-1 py-2.5 text-center ${x.tone}`}>
            <p className="font-display text-xl font-medium tabular-nums">
              <CountUp to={x.v} />
            </p>
            <p className="text-[0.65rem] leading-tight font-bold">{x.l}</p>
          </div>
        ))}
      </div>

      {state.items.length === 0 && state.lists.length === 0 && (
        <Card className="text-center">
          <Figure name="cheer" className="mx-auto h-36 w-48" />
          <p className="font-display text-xl font-medium text-ink">A fresh start</p>
          <p className="mt-1 text-[0.95rem] text-muted">Add one task, one plan, or one habit. That&apos;s enough for today.</p>
        </Card>
      )}

      <SectionLabel>Last 7 days</SectionLabel>
      <WeekChart state={state} todayKey={todayKey} />

      <HabitChart state={state} onGo={() => onGo("grow")} />
    </div>
  );
}

/** Numbers roll up to their value when they first show */
function CountUp({ to, ms = 900 }: { to: number; ms?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return setN(to);
    let raf = 0;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  return <>{n}</>;
}

/** A bento tile: colourful, tappable, opens the place it's about */
function Tile({ tone, label, icon, wide, onClick, children }: { tone: string; label: string; icon: string; wide?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`press sheen flex min-h-[8.5rem] flex-col rounded-[1.5rem] p-3.5 text-left ${tone} ${wide ? "col-span-2 min-h-0" : ""}`}>
      <span className="mb-2 flex items-center justify-between">
        <span className="text-[0.72rem] font-bold tracking-wider text-ink/60 uppercase">{label}</span>
        <span className="animate-float flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-base shadow-sm" aria-hidden>
          {icon}
        </span>
      </span>
      {children}
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
