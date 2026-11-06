"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Bell, ChevronDown, Loader2, Minus, Plus, Sparkles, Trash2, X } from "lucide-react";
import { CheckCircle, Collapse, EmojiTile, HScroll, ProgressBar, inputCls } from "./ui";
import { PILLARS, pillarById } from "@/lib/pillars";
import { breakDown } from "@/lib/breakdown";
import { dateKey, daysAgo, itemStreak, itemThisWeek, stepDone, taskDay, type Item, type Store } from "@/lib/store";

export function itemMeta(item: Item): string {
  if (item.kind === "task") {
    const d = item.steps.filter((s) => s.done).length;
    return item.steps.length ? `${d} of ${item.steps.length} steps` : "One-off task";
  }
  if (item.kind === "goal") return `${item.progress}${item.total ? ` of ${item.total}` : ""} ${item.unit ?? ""}`.trim();
  const s = itemStreak(item);
  const base = s > 1 ? `${s}-day streak` : `${itemThisWeek(item)} of 7 days this week`;
  if (item.steps.length) {
    const d = item.steps.filter((st) => stepDone(item, st.id, dateKey())).length;
    return `${d}/${item.steps.length} steps · ${base}`;
  }
  return item.time ? `${fmtTime(item.time)} · ${base}` : base;
}

export function fmtTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/** Compact row used on Home */
export function ItemRow({ item, store, onOpen }: { item: Item; store: Store; onOpen: () => void }) {
  const p = pillarById[item.pillar];
  const done = item.done.includes(store.todayKey);
  return (
    <div className="flex items-center gap-3 px-1 py-2">
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <EmojiTile emoji={item.emoji} className={p.soft} />
        <span className="min-w-0 flex-1">
          <span className={`block leading-snug font-bold ${done ? "text-muted line-through" : "text-ink"}`}>{item.title}</span>
          <span className="block text-[0.85rem] text-muted">{itemMeta(item)}</span>
        </span>
      </button>
      <CheckCircle done={done} solid={p.solid} label={`${item.title}: ${done ? "done" : "mark done"}`} onClick={() => store.toggleItemDay(item.id)} />
    </div>
  );
}

/** Grow card: row on top, a drawer with calendar and details slides open below */
export function GrowItem({
  item,
  store,
  open,
  onToggle,
  onDeleted,
}: {
  item: Item;
  store: Store;
  open: boolean;
  onToggle: () => void;
  onDeleted: (item: Item) => void;
}) {
  const p = pillarById[item.pillar];
  const done = item.done.includes(store.todayKey);
  const ref = useRef<HTMLDivElement>(null);

  // Bring a freshly opened card into view (e.g. when arriving from Home)
  useLayoutEffect(() => {
    if (open) ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [open]);

  return (
    <div ref={ref} className={`rounded-3xl bg-white shadow-soft transition-shadow ${open ? "ring-2 ring-brand-200" : ""}`}>
      <div className="flex items-center gap-3 p-3">
        <button type="button" onClick={onToggle} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <EmojiTile emoji={item.emoji} className={p.soft} />
          <span className="min-w-0 flex-1">
            <span className={`block leading-snug font-bold ${done ? "text-muted line-through" : "text-ink"}`}>{item.title}</span>
            <span className="flex items-center gap-1 text-[0.85rem] text-muted">
              {itemMeta(item)}
              <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
            </span>
          </span>
        </button>
        <CheckCircle done={done} solid={p.solid} label={`${item.title}: ${done ? "done" : "mark done"}`} onClick={() => store.toggleItemDay(item.id)} />
      </div>
      <Collapse open={open}>
        <Details item={item} store={store} onDeleted={onDeleted} />
      </Collapse>
    </div>
  );
}

function Details({ item, store, onDeleted }: { item: Item; store: Store; onDeleted: (item: Item) => void }) {
  const p = pillarById[item.pillar];
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="space-y-4 border-t border-line px-3 pt-3 pb-3">
      {item.kind === "task" ? (
        <>
          <Steps item={item} store={store} />
          <DayPicker item={item} store={store} />
          <ReminderRow item={item} store={store} />
        </>
      ) : (
        <>
          {item.kind === "habit" && (
            <>
              <div>
                <p className="mb-1 text-xs font-bold tracking-wider text-muted uppercase">Daily routine</p>
                <Steps item={item} store={store} />
              </div>
              <ReminderRow item={item} store={store} />
            </>
          )}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Streak", value: itemStreak(item) },
              { label: "This week", value: `${itemThisWeek(item)}/7` },
              { label: "All time", value: item.done.length },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl py-2 ${p.tint}`}>
                <p className="text-lg font-extrabold text-ink tabular-nums">{s.value}</p>
                <p className="text-xs font-semibold text-muted">{s.label}</p>
              </div>
            ))}
          </div>
          {item.kind === "goal" && <Progress item={item} store={store} />}
          <Months item={item} store={store} />
        </>
      )}

      <div>
        <p className="mb-1 text-xs font-bold tracking-wider text-muted uppercase">Pillar</p>
        <HScroll>
          {PILLARS.map((pl) => (
            <button
              key={pl.id}
              type="button"
              aria-pressed={pl.id === item.pillar}
              onClick={() => store.updateItem(item.id, { pillar: pl.id })}
              className={`flex h-8 shrink-0 items-center gap-1 rounded-full px-3 text-[0.85rem] font-semibold whitespace-nowrap ${
                pl.id === item.pillar ? `${pl.soft} ${pl.text}` : "bg-surface text-muted"
              }`}
            >
              {pl.emoji} {pl.label}
            </button>
          ))}
        </HScroll>
      </div>

      <div className="flex items-center gap-2">
        <input
          value={item.title}
          onChange={(e) => store.updateItem(item.id, { title: e.target.value })}
          aria-label="Rename"
          className={`${inputCls} !h-10 flex-1 text-[0.95rem]`}
        />
        <button
          type="button"
          onClick={() => {
            if (!confirm) return setConfirm(true);
            store.deleteItem(item.id);
            onDeleted(item);
          }}
          onBlur={() => setConfirm(false)}
          className={`flex h-10 shrink-0 items-center gap-1 rounded-full px-3.5 text-[0.9rem] font-bold ${confirm ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-600"}`}
        >
          <Trash2 className="h-4 w-4" /> {confirm ? "Sure?" : "Remove"}
        </button>
      </div>
    </div>
  );
}

function Months({ item, store }: { item: Item; store: Store }) {
  const p = pillarById[item.pillar];
  const scroller = useRef<HTMLDivElement>(null);
  const set = new Set(item.done);
  const today = dateKey();
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => new Date(now.getFullYear(), now.getMonth() - 5 + i, 1));

  // Open on the current month; earlier months are a swipe away
  useLayoutEffect(() => {
    if (scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth;
  }, []);

  return (
    <div ref={scroller} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto">
      {months.map((first) => {
        const lead = (first.getDay() + 6) % 7;
        const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
        return (
          <div key={first.toISOString()} className="w-full shrink-0 snap-center">
            <p className="mb-1.5 text-[0.9rem] font-bold text-ink">
              {first.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              {first.getMonth() !== now.getMonth() || <span className="ml-1 font-semibold text-muted">· swipe for earlier</span>}
            </p>
            <div className="grid grid-cols-7 gap-1 text-center text-[0.7rem] font-bold text-muted">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={i}>{d}</span>
              ))}
              {Array.from({ length: lead }, (_, i) => (
                <span key={`l${i}`} />
              ))}
              {Array.from({ length: days }, (_, i) => {
                const key = dateKey(new Date(first.getFullYear(), first.getMonth(), i + 1, 12));
                const future = key > today;
                const on = set.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={future}
                    aria-pressed={on}
                    aria-label={`${key}: ${on ? "done" : "not done"}`}
                    onClick={() => store.toggleItemDay(item.id, key)}
                    className={`mx-auto flex aspect-square w-full max-w-9 items-center justify-center rounded-full text-[0.8rem] font-bold transition-colors ${
                      future ? "text-zinc-300" : on ? p.solid : key === today ? "text-ink ring-2 ring-ink" : "bg-surface text-muted"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Progress({ item, store }: { item: Item; store: Store }) {
  const p = pillarById[item.pillar];
  const step = item.unit === "pages" ? 10 : 1;
  const bump = (delta: number) => {
    const next = Math.max(0, item.total ? Math.min(item.total, item.progress + delta) : item.progress + delta);
    store.updateItem(item.id, { progress: next });
    // Moving forward counts as showing up today
    if (delta > 0 && !item.done.includes(store.todayKey)) store.toggleItemDay(item.id);
  };
  return (
    <div className={`space-y-2 rounded-2xl p-3 ${p.tint}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-ink">
          {item.progress}
          <span className="font-semibold text-muted">
            {item.total ? ` / ${item.total}` : ""} {item.unit}
          </span>
        </span>
        <input
          type="number"
          inputMode="numeric"
          value={item.total ?? ""}
          placeholder="Set total"
          aria-label={`Total ${item.unit}`}
          onChange={(e) => store.updateItem(item.id, { total: parseInt(e.target.value) > 0 ? parseInt(e.target.value) : null })}
          className="h-8 w-24 rounded-full bg-white px-3 text-right text-[0.9rem] text-ink outline-none"
        />
      </div>
      {item.total ? <ProgressBar value={item.progress / item.total} color={p.bar} track="bg-white" /> : null}
      <div className="grid grid-cols-[auto_1fr] gap-2">
        <button type="button" onClick={() => bump(-step)} aria-label={`Minus ${step}`} className="flex h-10 w-12 items-center justify-center rounded-full bg-white text-ink">
          <Minus className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => bump(step)} className="flex h-10 items-center justify-center gap-1 rounded-full bg-ink text-[0.9rem] font-bold text-white">
          <Plus className="h-4 w-4" /> {step} {item.unit}
        </button>
      </div>
    </div>
  );
}

function Steps({ item, store }: { item: Item; store: Store }) {
  const p = pillarById[item.pillar];
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const kind = item.kind === "habit" ? "habit" : "task";
  const done = (id: string) => stepDone(item, id, store.todayKey);

  const add = () => {
    if (!text.trim()) return;
    store.setSteps(item.id, [text.trim()]);
    setText("");
  };

  return (
    <div className="space-y-1.5">
      {item.steps.map((s) => (
        <div key={s.id} className="flex items-center gap-2">
          <CheckCircle done={done(s.id)} solid={p.solid} label={`${s.text}: ${done(s.id) ? "done" : "mark done"}`} onClick={() => store.toggleStep(item.id, s.id)} />
          <span className={`flex-1 text-[0.95rem] ${done(s.id) ? "text-muted line-through" : "text-ink"}`}>{s.text}</span>
          <button type="button" aria-label={`Remove ${s.text}`} onClick={() => store.removeStep(item.id, s.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      {item.steps.length === 0 && (
        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            store.setSteps(item.id, (await breakDown(item.title, kind)).steps);
            setLoading(false);
          }}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-brand-50 text-[0.9rem] font-bold text-brand-700"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Breaking it down…" : kind === "habit" ? "Break into a tiny daily routine" : "Break into micro-tasks"}
        </button>
      )}
      <div className="flex gap-2 pt-1">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Add a step" aria-label="Add a step" className={`${inputCls} !h-10 text-[0.95rem]`} />
        <button type="button" onClick={add} aria-label="Add step" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-white">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/** Optional time with a reminder; used by habits here and by tasks in Plan */
export function ReminderRow({ item, store }: { item: Item; store: Store }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-surface p-1.5 pl-3">
      <Bell className="h-4 w-4 text-muted" />
      <span className="flex-1 text-[0.9rem] font-semibold text-ink">{item.kind === "habit" ? "Remind me daily at" : "Time"}</span>
      <input
        type="time"
        value={item.time ?? ""}
        onChange={(e) => store.updateItem(item.id, { time: e.target.value || null, remind: !!e.target.value })}
        aria-label="Time"
        className="h-9 rounded-full bg-white px-3 text-[0.9rem] text-ink outline-none"
      />
      {item.time && (
        <button
          type="button"
          onClick={() => store.updateItem(item.id, { time: null, remind: false })}
          aria-label="Clear time"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function DayPicker({ item, store }: { item: Item; store: Store }) {
  const today = store.todayKey;
  const tomorrow = dateKey(daysAgo(-1));
  const current = taskDay(item, today);
  const opts = [
    { key: today, label: "Today" },
    { key: tomorrow, label: "Tomorrow" },
  ];
  return (
    <div className="flex items-center gap-1.5">
      {opts.map((o) => (
        <button
          key={o.key}
          type="button"
          aria-pressed={current === o.key}
          onClick={() => store.updateItem(item.id, { date: o.key })}
          className={`h-9 rounded-full px-3.5 text-[0.85rem] font-bold ${current === o.key ? "bg-ink text-white" : "bg-surface text-ink"}`}
        >
          {o.label}
        </button>
      ))}
      <input
        type="date"
        value={current}
        min={today}
        onChange={(e) => e.target.value && store.updateItem(item.id, { date: e.target.value })}
        aria-label="Pick a day"
        className={`h-9 min-w-0 flex-1 rounded-full px-3 text-[0.85rem] font-bold outline-none ${
          current !== today && current !== tomorrow ? "bg-ink text-white" : "bg-surface text-muted"
        }`}
      />
    </div>
  );
}
