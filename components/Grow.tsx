"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Check, ChevronRight, Play, Plus, Trophy, Users } from "lucide-react";
import { Sheet } from "./ui";
import { AddBar } from "./AddBar";
import { Details } from "./ItemCard";
import { Figure } from "./Figures";
import { Wheel } from "./Wheel";
import { celebrate } from "@/lib/fx";
import { detect, tidyTitle } from "@/lib/pillars";
import {
  DIMENSIONS,
  GOALS,
  LEVELS,
  QUOTES,
  dimensionById,
  dimensionOf,
  goalById,
  goalProgress,
  rankFor,
  totalXp,
  videosUrl,
  weekXp,
  wheel,
  type Dimension,
  type GoalTemplate,
  type Level,
} from "@/lib/goals";
import { useLeague } from "@/lib/league";
import { habitCount, type Item, type Store } from "@/lib/store";

type Starting = { template: GoalTemplate } | null;

export function Grow({
  store,
  openId,
  setOpenId,
  onDeleted,
  userId,
}: {
  store: Store;
  onAdd?: () => void;
  openId: string | null;
  setOpenId: (id: string | null) => void;
  onDeleted: (item: Item) => void;
  userId?: string | null;
}) {
  const today = store.todayKey;
  const habits = store.state.items.filter((i) => i.kind === "habit");
  const [filter, setFilter] = useState<Dimension | null>(null);
  const [starting, setStarting] = useState<Starting>(null);
  const [mode, setMode] = useState<"build" | "quit">("build");
  const [party, setParty] = useState<{ emoji: string; title: string; sub: string } | null>(null);

  const xp = totalXp(store.state.items);
  const rank = rankFor(xp);
  const week = weekXp(store.state.items);
  const wheelValues = useMemo(() => wheel(store.state.items), [store.state.items]);
  const startedIds = new Set(habits.map((h) => h.goal).filter(Boolean));
  const library = GOALS.filter((g) => !startedIds.has(g.id) && (!filter || g.dimension === filter));
  const opened = openId ? habits.find((h) => h.id === openId) : undefined;

  /** Mark today and celebrate a new milestone */
  const checkIn = (item: Item, el: Element | null) => {
    const before = goalProgress(item);
    const wasDone = item.done.includes(today);
    const target = item.target ?? 1;
    if (target > 1 && !wasDone) store.bumpHabit(item.id, 1);
    else store.toggleItemDay(item.id);
    if (wasDone) return;
    celebrate(el);
    // A milestone is reached when this check-in completes the day
    const completesDay = target <= 1 || habitCount(item, today) + 1 >= target;
    const reached = completesDay ? before.milestones.find((m) => !m.reached && before.done + 1 >= m.at) : undefined;
    if (reached) {
      const last = reached === before.milestones[before.milestones.length - 1];
      setTimeout(
        () =>
          setParty({
            emoji: last ? "🏆" : "🏅",
            title: last ? `Goal complete: ${item.title}!` : reached.name,
            sub: last ? "You did it. This is part of you now." : `New milestone in “${item.title}” · +50 XP`,
          }),
        350,
      );
    }
  };

  const start = (t: GoalTemplate, level: Level) => {
    const d = detect(t.title);
    const id = store.addItem({
      title: t.title,
      emoji: t.emoji,
      pillar: d.pillar,
      kind: "habit",
      mode: t.mode,
      goal: t.id.startsWith("custom:") ? undefined : t.id,
      level,
      goalDays: LEVELS[level].days,
    });
    setStarting(null);
    setParty({ emoji: t.emoji, title: `${t.title} started!`, sub: `First milestone in ${Math.max(1, Math.round(LEVELS[level].days * 0.1))} days` });
    setTimeout(() => setOpenId(id), 50);
  };

  const custom = (raw: string) => {
    const title = tidyTitle(raw);
    const d = detect(title);
    setStarting({
      template: {
        id: `custom:${title}`,
        title,
        emoji: d.emoji,
        dimension: dimensionOf({ pillar: d.pillar } as Item),
        mode,
        book: "Your own goal",
        idea: mode === "build" ? "Start tiny and show up most days. Every day you do it counts." : "Notice what triggers it, and plan what you'll do instead.",
        daily: { easy: `${title}: the tiniest version`, medium: title, hard: `${title}, no excuses` },
        how: ["Pick a set time and place", "Make it so small you can't say no", "Never miss twice in a row"],
        milestones: ["Spark", "Kindle", "Glow", "Blaze", "Wildfire"],
        search: title,
      },
    });
  };

  return (
    <div className="stagger space-y-4">
      <header className="flex items-end justify-between px-1 pt-5">
        <div>
          <p className="text-[0.9rem] font-semibold text-muted">Your goals</p>
          <h1 className="text-[2rem] leading-tight font-medium tracking-tight text-ink">Grow</h1>
        </div>
        <span className="mb-1 flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[0.8rem] font-semibold text-ink shadow-soft">⚡ {week} XP this week</span>
      </header>

      {/* Your level */}
      <section className="grad-sunrise relative overflow-hidden rounded-[1.75rem] p-4 shadow-soft">
        <span aria-hidden className="animate-breathe absolute -top-10 -right-8 h-32 w-32 rounded-full bg-ochre-400/40 blur-xl" />
        <div className="relative flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-[2.2rem] shadow-sm">
            <span className="animate-float inline-block">{rank.emoji}</span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[0.72rem] font-semibold tracking-wider text-ink/60 uppercase">Level {rank.level}</p>
            <p className="font-display text-[1.35rem] leading-tight font-medium text-ink">{rank.name}</p>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/70">
              <div className="animate-grow-x h-full rounded-full bg-moss-400" style={{ width: `${Math.max(4, rank.progress * 100)}%` }} />
            </div>
            <p className="mt-1 text-[0.75rem] text-ink/60">{rank.next ? `${xp} XP · ${rank.next.at - xp} to ${rank.next.emoji} ${rank.next.name}` : `${xp} XP · top level`}</p>
          </div>
        </div>
      </section>

      <QuoteCard />

      {/* Active goals as cards */}
      {habits.length > 0 && (
        <section className="space-y-2.5">
          <p className="px-1 text-[0.72rem] font-semibold tracking-wider text-muted uppercase">In progress</p>
          {habits.map((h) => (
            <GoalCard key={h.id} item={h} today={today} onOpen={() => setOpenId(h.id)} onCheck={(el) => checkIn(h, el)} />
          ))}
        </section>
      )}

      {habits.length === 0 && (
        <div className="rounded-3xl bg-white p-5 text-center shadow-soft">
          <Figure name="cheer" className="mx-auto h-32 w-44" />
          <p className="font-display text-lg font-medium text-ink">Pick your first goal</p>
          <p className="mt-1 text-[0.88rem] text-muted">Choose one below. Each comes with milestones, tips and XP.</p>
        </div>
      )}

      {/* The wheel: which parts of life are getting care */}
      <section className="rounded-3xl bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <p className="font-display text-[1.05rem] font-medium text-ink">Wellness wheel</p>
          <span className="text-[0.75rem] text-muted">last 30 days</span>
        </div>
        <div className="mt-1 flex items-center gap-3">
          <Wheel values={wheelValues} size={150} picked={filter} onPick={(d) => setFilter(filter === d ? null : d)} />
          <ul className="grid flex-1 grid-cols-2 gap-x-2 gap-y-1.5">
            {DIMENSIONS.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => setFilter(filter === d.id ? null : d.id)}
                  className={`flex w-full items-center gap-1.5 rounded-full px-1.5 py-0.5 text-left text-[0.75rem] ${filter === d.id ? "bg-surface font-semibold" : ""}`}
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
                  <span className="truncate text-ink">{d.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-2 text-[0.78rem] text-muted">Tap a part of the wheel to find goals for it.</p>
      </section>

      {/* Goal library, around the wheel */}
      <section>
        <div className="flex items-center justify-between px-1">
          <p className="text-[0.72rem] font-semibold tracking-wider text-muted uppercase">{filter ? `Goals for ${dimensionById[filter].label}` : "Start a goal"}</p>
          {filter && (
            <button type="button" onClick={() => setFilter(null)} className="text-[0.75rem] font-semibold text-brand-700">
              Show all
            </button>
          )}
        </div>
        <div className="no-scrollbar -mx-4 mt-2 flex gap-2.5 overflow-x-auto px-4 pb-2">
          {library.map((g) => {
            const dim = dimensionById[g.dimension];
            return (
              <button key={g.id} type="button" onClick={() => setStarting({ template: g })} className={`press flex w-40 shrink-0 flex-col rounded-3xl p-3.5 text-left ${dim.soft}`}>
                <span className="flex items-center justify-between">
                  <span className="text-[1.8rem]" aria-hidden>
                    {g.emoji}
                  </span>
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-[0.62rem] font-semibold text-ink/70">{g.mode === "quit" ? "Quit" : dim.label}</span>
                </span>
                <span className="mt-2 font-display text-[1rem] leading-snug font-medium text-ink">{g.title}</span>
                <span className="mt-1 line-clamp-2 text-[0.72rem] text-ink/60">{g.book}</span>
                <span className="mt-auto flex items-center gap-1 pt-2 text-[0.75rem] font-semibold text-ink">
                  Start <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </button>
            );
          })}
          {library.length === 0 && <p className="px-1 py-6 text-[0.85rem] text-muted">You&apos;ve started every goal here. Amazing!</p>}
        </div>

        <div className="mt-1 flex items-center gap-2">
          <div className="flex shrink-0 rounded-full bg-surface p-1">
            {(["build", "quit"] as const).map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)} className={`h-8 rounded-full px-3 text-[0.78rem] font-semibold transition-colors ${mode === m ? "bg-white text-ink shadow-sm" : "text-muted"}`}>
                {m === "build" ? "Build" : "Quit"}
              </button>
            ))}
          </div>
          <AddBar className="min-w-0 flex-1" placeholder={mode === "build" ? "Your own goal…" : "Something to quit…"} onAdd={custom} />
        </div>
      </section>

      <League userId={userId ?? null} store={store} week={week} />

      <StartSheet starting={starting} onClose={() => setStarting(null)} onStart={start} />
      <GoalSheet item={opened} store={store} onClose={() => setOpenId(null)} onCheck={checkIn} onDeleted={onDeleted} />

      {party && <Party {...party} onDone={() => setParty(null)} />}
    </div>
  );
}

/* ---------- Quote of the moment ---------- */

function QuoteCard() {
  const [i, setI] = useState(() => (new Date().getDate() * 7) % QUOTES.length);
  const [fade, setFade] = useState(false);
  const next = () => {
    setFade(true);
    setTimeout(() => {
      setI((n) => (n + 1) % QUOTES.length);
      setFade(false);
    }, 250);
  };
  useEffect(() => {
    const t = setInterval(next, 9000);
    return () => clearInterval(t);
  }, []);
  const q = QUOTES[i];
  return (
    <button type="button" onClick={next} className="tone-sage block w-full rounded-3xl p-4 text-left" aria-live="polite">
      <span className="text-[0.7rem] font-semibold tracking-wider text-sage-700 uppercase">✨ A little push</span>
      <span className={`mt-1.5 block font-display text-[1.1rem] leading-snug text-ink transition-all duration-300 ${fade ? "translate-y-1 opacity-0" : "opacity-100"}`}>“{q.text}”</span>
      <span className={`mt-1 block text-[0.78rem] text-muted transition-opacity duration-300 ${fade ? "opacity-0" : "opacity-100"}`}>— {q.by}</span>
    </button>
  );
}

/* ---------- A goal as a card ---------- */

function Meter({ item }: { item: Item }) {
  const p = goalProgress(item);
  return (
    <div className="relative">
      <div className="h-2 overflow-hidden rounded-full bg-surface">
        <div className="animate-grow-x grad-bar h-full rounded-full" style={{ width: `${Math.max(3, p.pct * 100)}%` }} />
      </div>
      <div className="absolute inset-x-0 -top-[3px] h-0">
        {p.milestones.map((m) => (
          <span
            key={m.name}
            title={m.name}
            className={`absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-white ${m.reached ? "bg-moss-400" : "bg-stone-200"}`}
            style={{ left: `${Math.min(97, (m.at / p.total) * 100)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function GoalCard({ item, today, onOpen, onCheck }: { item: Item; today: string; onOpen: () => void; onCheck: (el: Element | null) => void }) {
  const p = goalProgress(item);
  const t = item.goal ? goalById[item.goal] : undefined;
  const dim = dimensionById[dimensionOf(item)];
  const done = item.done.includes(today);
  const level = item.level ?? "easy";
  const target = item.target ?? 1;
  const count = habitCount(item, today);
  const btn = useRef<HTMLButtonElement>(null);
  return (
    <div className="rounded-3xl bg-white p-3.5 shadow-soft">
      <div className="flex items-start gap-3">
        <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-start gap-3 text-left">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${dim.soft}`} aria-hidden>
            {item.emoji}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="truncate font-display text-[1.02rem] font-medium text-ink">{item.title}</span>
              {p.complete && <span aria-label="Goal complete">🏆</span>}
            </span>
            <span className="block truncate text-[0.78rem] text-muted">
              {LEVELS[level].emoji} {t ? t.daily[level] : item.mode === "quit" ? "Stay free today" : "Do it today"}
            </span>
          </span>
        </button>
        <button
          ref={btn}
          type="button"
          onClick={() => onCheck(btn.current)}
          aria-pressed={done}
          aria-label={`${item.title}: ${done ? "done today" : "mark done today"}`}
          className={`flex h-9 min-w-9 shrink-0 items-center justify-center gap-1 rounded-full px-2.5 text-[0.78rem] font-medium transition-all duration-300 ${done ? "animate-pop bg-moss-400 text-white" : "border-[1.5px] border-stone-200 bg-white text-ink active:scale-90"}`}
        >
          {done ? <Check className="h-4 w-4" strokeWidth={3} /> : target > 1 ? `${count}/${target}` : <Check className="h-4 w-4 text-stone-300" strokeWidth={3} />}
        </button>
      </div>
      <button type="button" onClick={onOpen} className="mt-3 block w-full text-left">
        <Meter item={item} />
        <span className="mt-2 flex items-center justify-between text-[0.75rem]">
          <span className="text-muted">
            {p.complete ? (
              "Goal reached!"
            ) : p.next ? (
              <>
                Next: <span className="font-semibold text-ink">{p.next.name}</span> in {p.next.at - p.done} {p.next.at - p.done === 1 ? "day" : "days"}
              </>
            ) : null}
          </span>
          <span className="font-semibold text-ink tabular-nums">{Math.round(p.pct * 100)}%</span>
        </span>
      </button>
    </div>
  );
}

/* ---------- Starting a goal ---------- */

function StartSheet({ starting, onClose, onStart }: { starting: Starting; onClose: () => void; onStart: (t: GoalTemplate, level: Level) => void }) {
  const [level, setLevel] = useState<Level>("easy");
  useEffect(() => setLevel("easy"), [starting]);
  const t = starting?.template;
  if (!t) return null;
  const dim = dimensionById[t.dimension];
  const days = LEVELS[level].days;
  return (
    <Sheet
      open
      onClose={onClose}
      title={
        <span>
          {t.emoji} {t.title}
        </span>
      }
    >
      <div className="space-y-3.5">
        <div className={`rounded-2xl p-3 ${dim.soft}`}>
          <p className="flex items-center gap-1.5 text-[0.72rem] font-semibold text-ink/70">
            <BookOpen className="h-3.5 w-3.5" /> {t.book}
          </p>
          <p className="mt-1 text-[0.9rem] text-ink">{t.idea}</p>
        </div>

        <div>
          <p className="mb-1.5 text-[0.7rem] font-semibold tracking-wider text-muted uppercase">How hard?</p>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(LEVELS) as Level[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                aria-pressed={level === l}
                className={`rounded-2xl p-2.5 text-left transition-all duration-200 ${level === l ? "scale-[1.03] bg-ink text-white shadow-md" : "bg-surface text-ink"}`}
              >
                <span className="text-lg" aria-hidden>
                  {LEVELS[l].emoji}
                </span>
                <span className="block text-[0.85rem] font-semibold">{LEVELS[l].label}</span>
                <span className={`block text-[0.68rem] ${level === l ? "text-white/70" : "text-muted"}`}>
                  {LEVELS[l].days} days · {LEVELS[l].xp} XP/day
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-surface p-3">
          <p className="text-[0.7rem] font-semibold tracking-wider text-muted uppercase">Each day, you&apos;ll</p>
          <p className="mt-0.5 font-display text-[1.05rem] font-medium text-ink">{t.daily[level]}</p>
          <p className="mt-1 text-[0.78rem] text-muted">{days} days in total. Missed a day? No reset: every day you do it counts.</p>
        </div>

        <div>
          <p className="mb-1.5 text-[0.7rem] font-semibold tracking-wider text-muted uppercase">Milestones on the way</p>
          <ol className="flex items-start justify-between gap-1">
            {t.milestones.map((m, i) => (
              <li key={m} className="flex flex-1 flex-col items-center text-center">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-[0.9rem] ${i === 4 ? "bg-ochre-100" : "bg-moss-50"}`}>{i === 4 ? "🏆" : "🏅"}</span>
                <span className="mt-1 text-[0.62rem] leading-tight font-semibold text-ink">{m}</span>
                <span className="text-[0.6rem] text-muted">day {Math.max(1, Math.round(days * [0.1, 0.25, 0.5, 0.75, 1][i]))}</span>
              </li>
            ))}
          </ol>
        </div>

        <button type="button" onClick={() => onStart(t, level)} className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink text-[0.95rem] font-semibold text-white active:scale-[0.98]">
          <Plus className="h-4 w-4" strokeWidth={3} /> Start this goal
        </button>
      </div>
    </Sheet>
  );
}

/* ---------- Inside a goal ---------- */

function GoalSheet({ item, store, onClose, onCheck, onDeleted }: { item?: Item; store: Store; onClose: () => void; onCheck: (i: Item, el: Element | null) => void; onDeleted: (i: Item) => void }) {
  const btn = useRef<HTMLButtonElement>(null);
  if (!item) return null;
  const t = item.goal ? goalById[item.goal] : undefined;
  const level = item.level ?? "easy";
  const p = goalProgress(item);
  const done = item.done.includes(store.todayKey);
  const dim = dimensionById[dimensionOf(item)];
  const daily = t ? t.daily[level] : item.mode === "quit" ? `Stay free of “${item.title}” today` : item.title;
  const how = t?.how ?? ["Pick a set time and place", "Make it so small you can't say no", "Never miss twice in a row"];

  return (
    <Sheet
      open
      onClose={onClose}
      title={
        <span>
          {item.emoji} {item.title}
        </span>
      }
    >
      <div className="space-y-4">
        {/* 1. What to do */}
        <div className={`rounded-2xl p-3.5 ${dim.soft}`}>
          <p className="text-[0.7rem] font-semibold tracking-wider text-ink/60 uppercase">Today&apos;s step · {LEVELS[level].label}</p>
          <p className="mt-0.5 font-display text-[1.15rem] font-medium text-ink">{daily}</p>
          <button
            ref={btn}
            type="button"
            onClick={() => onCheck(item, btn.current)}
            className={`mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full text-[0.95rem] font-semibold transition-all ${done ? "bg-moss-400 text-white" : "bg-ink text-white active:scale-[0.98]"}`}
          >
            <Check className="h-5 w-5" strokeWidth={3} /> {done ? `Done today · +${LEVELS[level].xp} XP` : item.mode === "quit" ? "I stayed free today" : "I did it today"}
          </button>
        </div>

        {/* 2. The journey */}
        <div>
          <div className="flex items-baseline justify-between">
            <p className="text-[0.7rem] font-semibold tracking-wider text-muted uppercase">Your journey</p>
            <p className="text-[0.8rem] font-semibold text-ink tabular-nums">
              {p.done}/{p.total} days · {Math.round(p.pct * 100)}%
            </p>
          </div>
          <ol className="mt-2">
            {p.milestones.map((m, i) => {
              const isNext = m === p.next;
              const last = i === p.milestones.length - 1;
              return (
                <li key={m.name} className="flex gap-3">
                  <span className="flex flex-col items-center">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-base transition-all ${m.reached ? "bg-moss-400 text-white" : isNext ? "bg-ochre-100 ring-2 ring-ochre-400" : "bg-surface opacity-60"}`}
                    >
                      {m.reached ? (last ? "🏆" : "🏅") : last ? "🏆" : isNext ? "🎯" : "○"}
                    </span>
                    {!last && <span className={`w-0.5 flex-1 ${m.reached ? "bg-moss-400" : "bg-stone-200"}`} style={{ minHeight: 14 }} />}
                  </span>
                  <span className="pb-3">
                    <span className={`block font-display text-[0.98rem] ${m.reached || isNext ? "font-medium text-ink" : "text-muted"}`}>{last ? `${m.name}: goal complete` : m.name}</span>
                    <span className="text-[0.75rem] text-muted">{m.reached ? `Reached · day ${m.at}` : isNext ? `Day ${m.at} · ${m.at - p.done} to go` : `Day ${m.at}`}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* 3. How to reach it */}
        <div className="rounded-2xl bg-ochre-50 p-3.5">
          <p className="text-[0.7rem] font-semibold tracking-wider text-ochre-700 uppercase">How to reach this goal</p>
          <ol className="mt-1.5 space-y-1.5">
            {how.map((h, i) => (
              <li key={h} className="flex gap-2 text-[0.88rem] text-ink">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[0.7rem] font-semibold text-ochre-700">{i + 1}</span>
                {h}
              </li>
            ))}
          </ol>
          {t && (
            <p className="mt-2.5 border-t border-ochre-100 pt-2 text-[0.8rem] text-muted">
              <span className="font-semibold text-ink">The idea · </span>
              {t.idea} <span className="italic">({t.book})</span>
            </p>
          )}
        </div>

        {/* 4. Learn more */}
        <a href={videosUrl(t?.search ?? item.title)} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-line active:bg-surface">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-terra-50 text-terra-700">
            <Play className="h-5 w-5 fill-current" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.9rem] font-semibold text-ink">Watch the most-viewed videos</span>
            <span className="block text-[0.75rem] text-muted">Opens YouTube, sorted by views</span>
          </span>
          <ChevronRight className="h-4 w-4 text-stone-300" />
        </a>

        {/* 5. Difficulty */}
        <div>
          <p className="mb-1.5 text-[0.7rem] font-semibold tracking-wider text-muted uppercase">Difficulty</p>
          <div className="flex rounded-full bg-surface p-1">
            {(Object.keys(LEVELS) as Level[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => store.updateItem(item.id, { level: l, goalDays: LEVELS[l].days })}
                className={`h-8 flex-1 rounded-full text-[0.78rem] font-semibold transition-colors ${level === l ? "bg-white text-ink shadow-sm" : "text-muted"}`}
              >
                {LEVELS[l].emoji} {LEVELS[l].label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="-mx-4 mt-2">
        <Details item={item} store={store} onDeleted={(i) => (onDeleted(i), onClose())} />
      </div>
    </Sheet>
  );
}

/* ---------- The league ---------- */

function League({ userId, store, week }: { userId: string | null; store: Store; week: number }) {
  const joined = !!store.state.profile.league;
  const me = { name: store.state.profile.name, avatar: store.state.profile.avatar, xp: week };
  const league = useLeague(userId, joined, me);
  const medals = ["🥇", "🥈", "🥉"];
  const myRank = league.rows ? league.rows.findIndex((r) => r.user_id === userId) + 1 : 0;

  return (
    <section className="rounded-3xl bg-white p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ochre-100">
          <Trophy className="h-5 w-5 text-ochre-700" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[1.05rem] font-medium text-ink">Weekly league</p>
          <p className="text-[0.75rem] text-muted">{joined ? (myRank ? `You're #${myRank} this week` : "Points reset every Monday") : "Grow alongside others. Resets every Monday."}</p>
        </div>
        {userId && (
          <button
            type="button"
            onClick={async () => {
              if (joined) await league.leave();
              store.setProfile({ league: !joined });
            }}
            className={`h-8 shrink-0 rounded-full px-3.5 text-[0.78rem] font-semibold ${joined ? "bg-surface text-muted" : "bg-ink text-white"}`}
          >
            {joined ? "Leave" : "Join"}
          </button>
        )}
      </div>

      {!userId && <p className="mt-3 text-[0.82rem] text-muted">Sign in to join the league.</p>}
      {joined && league.state === "unavailable" && <p className="mt-3 rounded-2xl bg-surface p-3 text-[0.82rem] text-muted">The league opens soon. Your points are counting already.</p>}
      {joined && league.state === "ready" && league.rows && (
        <ol className="mt-3 divide-y divide-line">
          {league.rows.slice(0, 10).map((r, i) => (
            <li key={r.user_id} className={`flex items-center gap-3 py-2 ${r.user_id === userId ? "font-semibold" : ""}`}>
              <span className="w-6 text-center text-[0.9rem]">{medals[i] ?? <span className="text-[0.8rem] text-muted">{i + 1}</span>}</span>
              <span className="text-lg" aria-hidden>
                {r.avatar}
              </span>
              <span className="min-w-0 flex-1 truncate text-[0.9rem] text-ink">
                {r.name}
                {r.user_id === userId ? " (you)" : ""}
              </span>
              <span className="text-[0.82rem] text-ink tabular-nums">⚡ {r.xp}</span>
            </li>
          ))}
          {league.rows.length === 1 && (
            <li className="flex items-center gap-2 py-2 text-[0.8rem] text-muted">
              <Users className="h-4 w-4" /> Invite friends to Aham to grow together.
            </li>
          )}
        </ol>
      )}
      {!joined && userId && <p className="mt-3 text-[0.75rem] text-muted">Only your first name, avatar and weekly points are shown to other members.</p>}
    </section>
  );
}

/* ---------- Milestone celebration ---------- */

function Party({ emoji, title, sub, onDone }: { emoji: string; title: string; sub: string; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    celebrate(ref.current);
    const t1 = setTimeout(() => celebrate(ref.current), 250);
    const t2 = setTimeout(onDone, 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);
  return (
    <button type="button" onClick={onDone} className="animate-backdrop fixed inset-0 z-[65] flex items-center justify-center bg-ink/25 px-8 backdrop-blur-[2px]" aria-live="assertive">
      <div ref={ref} className="animate-pop w-full max-w-xs rounded-[2rem] bg-white p-6 text-center shadow-2xl">
        <p className="animate-float text-[3.5rem] leading-none">{emoji}</p>
        <p className="mt-3 font-display text-[1.35rem] leading-tight font-medium text-ink">{title}</p>
        <p className="mt-1 text-[0.85rem] text-muted">{sub}</p>
      </div>
    </button>
  );
}
