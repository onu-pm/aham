"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Bell, BellOff, CalendarDays, ChevronLeft, ChevronRight, Clock, Plus, Trash2, X } from "lucide-react";
import { CheckCircle, Segmented, Sheet, inputCls, primaryBtn } from "./ui";
import { AddBar, MicButton } from "./AddBar";
import { Steps, fmtTime } from "./ItemCard";
import { Figure } from "./Figures";
import { detect, pillarById, tidyTitle } from "@/lib/pillars";
import { addMinutes, parseWhen } from "@/lib/when";
import { byTime, dateKey, taskDay, type Item, type Store } from "@/lib/store";

type View = "day" | "week" | "month";

const HOUR_PX = 52;
const toDate = (key: string) => new Date(key + "T12:00");
const shiftDays = (key: string, n: number) => {
  const d = toDate(key);
  d.setDate(d.getDate() + n);
  return dateKey(d);
};
const mondayOf = (key: string) => shiftDays(key, -((toDate(key).getDay() + 6) % 7));
const mins = (hm: string) => {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
};
const endOf = (i: Item) => (i.end && i.time && i.end > i.time ? i.end : addMinutes(i.time ?? "09:00", 60));

/** What the editor sheet is showing: an existing task, or a new one at a day and time */
type Editing = { id: string } | { date: string; time: string | null };

export function Plan({
  store,
  openId,
  setOpenId,
  onDeleted,
  notify,
  onEnableNotify,
}: {
  store: Store;
  openId: string | null;
  setOpenId: (id: string | null) => void;
  onDeleted: (item: Item) => void;
  notify: NotificationPermission | "unsupported";
  onEnableNotify: () => void;
}) {
  const today = store.todayKey;
  const [view, setView] = useState<View>("week");
  const [day, setDay] = useState(today);
  const [editing, setEditing] = useState<Editing | null>(null);
  const tasks = store.state.items.filter((i) => i.kind === "task");
  const on = (key: string) => tasks.filter((i) => taskDay(i, today) === key).sort(byTime);

  // Arriving from Home with a task: open it on its day
  useEffect(() => {
    if (!openId) return;
    const t = store.state.items.find((i) => i.id === openId);
    if (t?.kind === "task") {
      setDay(taskDay(t, today));
      setEditing({ id: t.id });
    }
    setOpenId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);

  const step = (dir: number) => {
    if (view === "day") setDay(shiftDays(day, dir));
    else if (view === "week") setDay(shiftDays(day, dir * 7));
    else {
      const d = toDate(day);
      d.setDate(1);
      d.setMonth(d.getMonth() + dir);
      setDay(dateKey(d));
    }
  };

  const quickAdd = (raw: string) => {
    const w = parseWhen(raw);
    const title = tidyTitle(w.title);
    const d = detect(title);
    store.addItem({
      title,
      emoji: d.emoji,
      pillar: d.pillar,
      kind: "task",
      date: w.date ?? day,
      time: w.time,
      end: w.end,
      remind: !!w.time,
    });
    if (w.date) setDay(w.date);
  };

  const sameYear = toDate(day).getFullYear() === new Date().getFullYear();
  const heading = toDate(day).toLocaleDateString(
    undefined,
    view === "day" ? { weekday: "short", day: "numeric", month: "short" } : sameYear ? { month: "long" } : { month: "short", year: "numeric" },
  );
  const hasTimed = tasks.some((i) => i.time && !i.done.length);

  return (
    <div className="space-y-3">
      <header className="flex items-center justify-between gap-2 px-1 pt-5">
        <div className="min-w-0">
          <p className="text-[0.9rem] font-semibold text-muted">Planner</p>
          <h1 className="truncate text-[1.6rem] leading-tight font-medium tracking-tight text-ink">{heading}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={() => step(-1)} aria-label="Previous" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-soft">
            <ChevronLeft className="h-5 w-5" />
          </button>
          {day !== today && (
            <button type="button" onClick={() => setDay(today)} className="h-10 rounded-full bg-white px-3 text-[0.85rem] font-bold text-ink shadow-soft">
              Today
            </button>
          )}
          <button type="button" onClick={() => step(1)} aria-label="Next" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-soft">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </header>

      <Segmented
        value={view}
        onChange={setView}
        options={[
          { value: "day", label: "Day" },
          { value: "week", label: "Week" },
          { value: "month", label: "Month" },
        ]}
      />

      <AddBar placeholder="Add… e.g. “call mum tomorrow at 5pm”" onAdd={quickAdd} />

      {notify !== "granted" && notify !== "unsupported" && hasTimed && (
        <button type="button" onClick={onEnableNotify} className="flex w-full items-center gap-3 rounded-3xl bg-ochre-50 p-3 text-left">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
            {notify === "denied" ? <BellOff className="h-4 w-4 text-ochre-700" /> : <Bell className="h-4 w-4 text-ochre-700" />}
          </span>
          <span className="text-[0.9rem] font-semibold text-ink">
            {notify === "denied" ? "Reminders are blocked in settings. In-app reminders still show." : "Turn on reminders so Aham can nudge you at the right time"}
          </span>
        </button>
      )}

      {view === "month" ? (
        <MonthView day={day} today={today} on={on} onPick={setDay} onOpenDay={(k) => (setDay(k), setView("day"))} />
      ) : (
        <TimeGrid
          days={view === "day" ? [day] : Array.from({ length: 7 }, (_, i) => shiftDays(mondayOf(day), i))}
          today={today}
          selected={day}
          on={on}
          store={store}
          onPickDay={(k) => (setDay(k), setView("day"))}
          onSlot={(date, time) => setEditing({ date, time })}
          onOpen={(i) => setEditing({ id: i.id })}
        />
      )}

      {view === "month" && <Agenda day={day} today={today} items={on(day)} store={store} onOpen={(i) => setEditing({ id: i.id })} onAdd={() => setEditing({ date: day, time: null })} />}

      <EventSheet editing={editing} onClose={() => setEditing(null)} store={store} onDeleted={onDeleted} />
    </div>
  );
}

/* ---------- Day & week: an hour grid like a calendar ---------- */

function TimeGrid({
  days,
  today,
  selected,
  on,
  store,
  onPickDay,
  onSlot,
  onOpen,
}: {
  days: string[];
  today: string;
  selected: string;
  on: (key: string) => Item[];
  store: Store;
  onPickDay: (key: string) => void;
  onSlot: (date: string, time: string) => void;
  onOpen: (i: Item) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const single = days.length === 1;
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Open around the current hour (or the first event), not at midnight
  useLayoutEffect(() => {
    const first = days.flatMap(on).filter((i) => i.time).sort(byTime)[0];
    const hour = days.includes(today) ? Math.max(0, now.getHours() - 1) : first?.time ? Math.max(0, mins(first.time) / 60 - 1) : 8;
    scroller.current?.scrollTo({ top: hour * HOUR_PX });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days.join()]);

  const nowTop = ((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR_PX;
  const anytime = days.map((k) => on(k).filter((i) => !i.time));
  const showAnytime = anytime.some((a) => a.length);

  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-soft">
      {/* Day headers */}
      {!single && (
        <div className="grid grid-cols-[2.25rem_repeat(7,1fr)] border-b border-line px-1 pt-2 pb-1.5">
          <span />
          {days.map((k) => {
            const d = toDate(k);
            const isToday = k === today;
            return (
              <button key={k} type="button" onClick={() => onPickDay(k)} className="flex flex-col items-center gap-0.5" aria-label={d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}>
                <span className="text-[0.65rem] font-bold text-muted uppercase">{d.toLocaleDateString(undefined, { weekday: "narrow" })}</span>
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[0.85rem] font-extrabold ${isToday ? "bg-ink text-white" : k === selected ? "bg-brand-100 text-ink" : "text-ink"}`}>{d.getDate()}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Untimed tasks for each day */}
      {showAnytime && (
        <div className={`grid gap-1 border-b border-line p-1.5 ${single ? "grid-cols-1" : "grid-cols-[2.25rem_repeat(7,1fr)]"}`}>
          {!single && <span className="self-center text-center text-[0.6rem] font-bold text-muted">any</span>}
          {anytime.map((list, n) => (
            <div key={days[n]} className={`min-w-0 space-y-1 ${single ? "" : ""}`}>
              {list.map((i) =>
                single ? (
                  <AnytimeRow key={i.id} item={i} store={store} onOpen={() => onOpen(i)} />
                ) : (
                  <button key={i.id} type="button" onClick={() => onOpen(i)} className={`block w-full truncate rounded-md px-1 py-0.5 text-left text-[0.62rem] leading-tight font-bold ${i.done.length ? "bg-surface text-muted line-through" : `${pillarById[i.pillar].soft} text-ink`}`}>
                    {i.title}
                  </button>
                ),
              )}
            </div>
          ))}
        </div>
      )}

      <div ref={scroller} className="no-scrollbar relative max-h-[58vh] overflow-y-auto">
        <div className={`relative grid ${single ? "grid-cols-[3rem_1fr]" : "grid-cols-[2.25rem_repeat(7,1fr)]"}`} style={{ height: 24 * HOUR_PX }}>
          {/* Hour labels */}
          <div className="relative">
            {Array.from({ length: 24 }, (_, h) => (
              <span key={h} className="absolute right-1.5 -translate-y-1/2 text-[0.62rem] font-bold text-muted" style={{ top: h * HOUR_PX }}>
                {h === 0 ? "" : `${h % 12 || 12}${h < 12 ? "am" : "pm"}`}
              </span>
            ))}
          </div>

          {days.map((k) => (
            <DayColumn key={k} dayKey={k} items={on(k).filter((i) => i.time)} compact={!single} store={store} onSlot={onSlot} onOpen={onOpen} />
          ))}

          {/* Hour lines */}
          <div className="pointer-events-none absolute inset-0">
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="absolute right-0 left-[2.25rem] border-t border-line" style={{ top: h * HOUR_PX }} />
            ))}
          </div>

          {days.includes(today) && (
            <div
              className="pointer-events-none absolute z-10 h-0.5 bg-terra-400"
              style={{
                top: nowTop,
                left: single ? "3rem" : `calc(2.25rem + (100% - 2.25rem) / 7 * ${days.indexOf(today)})`,
                width: single ? "calc(100% - 3rem)" : "calc((100% - 2.25rem) / 7)",
              }}
            >
              <span className="absolute -top-1 -left-1 h-2.5 w-2.5 rounded-full bg-terra-400" />
            </div>
          )}
        </div>
      </div>
      <p className="border-t border-line px-3 py-2 text-center text-[0.75rem] font-semibold text-muted">Tap any empty time to add something there</p>
    </section>
  );
}

function DayColumn({
  dayKey,
  items,
  compact,
  store,
  onSlot,
  onOpen,
}: {
  dayKey: string;
  items: Item[];
  compact: boolean;
  store: Store;
  onSlot: (date: string, time: string) => void;
  onOpen: (i: Item) => void;
}) {
  // Side-by-side lanes for overlapping blocks
  const lanes = useMemo(() => {
    const sorted = [...items].sort(byTime);
    const ends: number[] = [];
    return sorted.map((i) => {
      const s = mins(i.time!);
      let lane = ends.findIndex((e) => e <= s);
      if (lane < 0) lane = ends.length;
      ends[lane] = mins(endOf(i));
      return { i, lane };
    });
  }, [items]);
  const width = Math.max(1, ...lanes.map((l) => l.lane + 1));

  return (
    <div
      className={`relative ${compact ? "border-l border-line" : ""}`}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        const y = e.nativeEvent.offsetY;
        const half = Math.floor(y / (HOUR_PX / 2));
        onSlot(dayKey, `${String(Math.floor(half / 2)).padStart(2, "0")}:${half % 2 ? "30" : "00"}`);
      }}
    >
      {lanes.map(({ i, lane }) => {
        const p = pillarById[i.pillar];
        const top = (mins(i.time!) / 60) * HOUR_PX;
        const height = Math.max(compact ? 20 : 26, ((mins(endOf(i)) - mins(i.time!)) / 60) * HOUR_PX - 2);
        const done = i.done.length > 0;
        return (
          <div
            key={i.id}
            className={`absolute overflow-hidden rounded-lg ${done ? "bg-surface opacity-70" : p.soft} ${compact ? "px-0.5 py-px" : "flex gap-1.5 px-2 py-1"}`}
            style={{ top: top + 1, height, left: `calc(${(lane / width) * 100}% + 2px)`, width: `calc(${100 / width}% - 4px)` }}
          >
            <button type="button" onClick={() => onOpen(i)} className="min-w-0 flex-1 text-left">
              <span className={`block truncate leading-tight font-bold text-ink ${compact ? "text-[0.6rem]" : "text-[0.85rem]"} ${done ? "line-through" : ""}`}>
                {compact ? i.title : `${i.emoji} ${i.title}`}
              </span>
              {!compact && height > 36 && (
                <span className="block text-[0.72rem] font-semibold text-muted">
                  {fmtTime(i.time!)} – {fmtTime(endOf(i))}
                </span>
              )}
            </button>
            {!compact && (
              <button
                type="button"
                onClick={() => store.toggleItemDay(i.id)}
                aria-label={`${i.title}: ${done ? "done" : "mark done"}`}
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${done ? p.solid : "border-2 border-ink/25 bg-white/70"}`}
              >
                {done && (
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="4">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AnytimeRow({ item, store, onOpen }: { item: Item; store: Store; onOpen: () => void }) {
  const p = pillarById[item.pillar];
  const done = item.done.length > 0;
  return (
    <div className={`flex items-center gap-2 rounded-xl py-1 pr-1 pl-2.5 ${done ? "bg-surface" : p.tint}`}>
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 truncate text-left text-[0.9rem] font-bold">
        <span className={done ? "text-muted line-through" : "text-ink"}>
          {item.emoji} {item.title}
        </span>
      </button>
      <CheckCircle done={done} solid={p.solid} label={`${item.title}: ${done ? "done" : "mark done"}`} onClick={() => store.toggleItemDay(item.id)} />
    </div>
  );
}

/* ---------- Month ---------- */

function MonthView({ day, today, on, onPick, onOpenDay }: { day: string; today: string; on: (key: string) => Item[]; onPick: (k: string) => void; onOpenDay: (k: string) => void }) {
  const d = toDate(day);
  const first = dateKey(new Date(d.getFullYear(), d.getMonth(), 1, 12));
  const start = mondayOf(first);
  const cells = Array.from({ length: 42 }, (_, i) => shiftDays(start, i));
  const rows = cells.slice(35).some((k) => toDate(k).getMonth() === d.getMonth()) ? 6 : 5;

  return (
    <section className="rounded-3xl bg-white p-2 shadow-soft">
      <div className="grid grid-cols-7 pb-1 text-center text-[0.65rem] font-bold text-muted uppercase">
        {["M", "T", "W", "T", "F", "S", "S"].map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-2xl bg-line">
        {cells.slice(0, rows * 7).map((k) => {
          const inMonth = toDate(k).getMonth() === d.getMonth();
          const list = on(k);
          const sel = k === day;
          return (
            <button
              key={k}
              type="button"
              onClick={() => (sel ? onOpenDay(k) : onPick(k))}
              aria-label={`${toDate(k).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}, ${list.length} planned`}
              className={`flex min-h-[4.25rem] flex-col items-stretch gap-0.5 p-1 text-left ${sel ? "bg-brand-50" : "bg-white"}`}
            >
              <span
                className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full text-[0.75rem] font-extrabold ${
                  k === today ? "bg-ink text-white" : inMonth ? "text-ink" : "text-stone-300"
                }`}
              >
                {toDate(k).getDate()}
              </span>
              {list.slice(0, 2).map((i) => (
                <span key={i.id} className={`truncate rounded px-0.5 text-[0.55rem] leading-tight font-bold ${i.done.length ? "text-muted line-through" : `${pillarById[i.pillar].soft} text-ink`}`}>
                  {i.title}
                </span>
              ))}
              {list.length > 2 && <span className="text-center text-[0.55rem] font-bold text-muted">+{list.length - 2}</span>}
            </button>
          );
        })}
      </div>
      <p className="pt-2 text-center text-[0.75rem] font-semibold text-muted">Tap a day to see it · tap again to open it</p>
    </section>
  );
}

function Agenda({ day, today, items, store, onOpen, onAdd }: { day: string; today: string; items: Item[]; store: Store; onOpen: (i: Item) => void; onAdd: () => void }) {
  const label = day === today ? "Today" : toDate(day).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" });
  return (
    <section className="space-y-2 rounded-3xl bg-white p-3 shadow-soft">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-extrabold text-ink">{label}</h2>
        <button type="button" onClick={onAdd} className="flex h-9 items-center gap-1 rounded-full bg-ink px-3.5 text-[0.85rem] font-bold text-white">
          <Plus className="h-4 w-4" strokeWidth={3} /> Add
        </button>
      </div>
      {items.length === 0 ? (
        <div className="pb-1 text-center">
          <Figure name="calendar" className="mx-auto h-28 w-40" />
          <p className="text-[0.9rem] text-muted">Nothing planned. A clear day is fine too.</p>
        </div>
      ) : (
        [...items].sort(byTime).map((i) => (
          <div key={i.id} className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-right text-[0.75rem] font-bold text-muted">{i.time ? fmtTime(i.time) : "Any"}</span>
            <div className="min-w-0 flex-1">
              <AnytimeRow item={i} store={store} onOpen={() => onOpen(i)} />
            </div>
          </div>
        ))
      )}
    </section>
  );
}

/* ---------- Add / edit sheet ---------- */

function EventSheet({ editing, onClose, store, onDeleted }: { editing: Editing | null; onClose: () => void; store: Store; onDeleted: (i: Item) => void }) {
  const existing = editing && "id" in editing ? store.state.items.find((i) => i.id === editing.id) : undefined;
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [end, setEnd] = useState("");
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (!editing || "id" in editing) return;
    setTitle("");
    setDate(editing.date);
    setTime(editing.time ?? "");
    setEnd(editing.time ? addMinutes(editing.time, 60) : "");
  }, [editing]);
  useEffect(() => setConfirm(false), [editing]);

  if (!editing) return null;

  // Editing: every change saves straight away
  if (existing) {
    const p = pillarById[existing.pillar];
    const day = taskDay(existing, store.todayKey);
    const set = (patch: Partial<Item>) => store.updateItem(existing.id, patch);
    return (
      <Sheet open onClose={onClose} title={<span className="flex items-center gap-2">{existing.emoji} Edit</span>}>
        <div className="space-y-4">
          <div className="flex items-center gap-1.5">
            <input value={existing.title} onChange={(e) => set({ title: e.target.value })} aria-label="Title" className={`${inputCls} flex-1 font-bold`} />
            <MicButton onText={(t) => set({ title: t })} />
          </div>
          <WhenFields
            date={day}
            time={existing.time ?? ""}
            end={existing.time ? endOf(existing) : ""}
            onDate={(v) => set({ date: v })}
            onTime={(v) => set({ time: v || null, end: v ? addMinutes(v, 60) : null, remind: !!v })}
            onEnd={(v) => set({ end: v || null })}
          />
          {existing.time && (
            <label className="flex items-center gap-2 rounded-2xl bg-surface p-3">
              <Bell className="h-4 w-4 text-muted" />
              <span className="flex-1 text-[0.9rem] font-semibold text-ink">Remind me at {fmtTime(existing.time)}</span>
              <input type="checkbox" checked={!!existing.remind} onChange={(e) => set({ remind: e.target.checked })} className="h-5 w-5 accent-[var(--color-brand-500)]" />
            </label>
          )}
          <div>
            <p className="mb-1 text-xs font-bold tracking-wider text-muted uppercase">Tiny steps</p>
            <Steps item={existing} store={store} />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => store.toggleItemDay(existing.id, day)} className={`${primaryBtn} flex-1 ${existing.done.length ? "!bg-surface !text-ink" : ""}`}>
              {existing.done.length ? "Mark not done" : "Mark done"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!confirm) return setConfirm(true);
                store.deleteItem(existing.id);
                onDeleted(existing);
                onClose();
              }}
              className={`flex h-12 shrink-0 items-center gap-1 rounded-full px-4 font-bold ${confirm ? "bg-terra-700 text-white" : "bg-terra-50 text-terra-700"}`}
            >
              <Trash2 className="h-4 w-4" /> {confirm ? "Sure?" : "Delete"}
            </button>
          </div>
          <p className={`text-center text-[0.8rem] font-semibold ${p.text}`}>Changes save automatically</p>
        </div>
      </Sheet>
    );
  }

  const save = () => {
    if (!title.trim()) return;
    const w = parseWhen(title);
    const t = tidyTitle(w.title);
    const d = detect(t);
    const start = w.time ?? (time || null);
    store.addItem({ title: t, emoji: d.emoji, pillar: d.pillar, kind: "task", date: w.date ?? date, time: start, end: w.end ?? (start ? end || addMinutes(start, 60) : null), remind: !!start });
    onClose();
  };

  return (
    <Sheet open onClose={onClose} title="New plan">
      <div className="space-y-4">
        <div className="flex items-center gap-1.5">
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && save()} placeholder="What's the plan?" aria-label="Title" className={`${inputCls} flex-1`} />
          <MicButton onText={(t) => setTitle(t)} />
        </div>
        <WhenFields date={date} time={time} end={end} onDate={setDate} onTime={(v) => (setTime(v), setEnd(v ? addMinutes(v, 60) : ""))} onEnd={setEnd} />
        <button type="button" onClick={save} disabled={!title.trim()} className={primaryBtn}>
          <Plus className="h-5 w-5" strokeWidth={3} /> Add to planner
        </button>
      </div>
    </Sheet>
  );
}

function WhenFields({ date, time, end, onDate, onTime, onEnd }: { date: string; time: string; end: string; onDate: (v: string) => void; onTime: (v: string) => void; onEnd: (v: string) => void }) {
  const field = "h-11 min-w-0 rounded-2xl bg-surface px-3 text-[0.95rem] font-semibold text-ink outline-none";
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 shrink-0 text-muted" />
        <input type="date" value={date} onChange={(e) => e.target.value && onDate(e.target.value)} aria-label="Date" className={`${field} flex-1`} />
      </label>
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 shrink-0 text-muted" />
        {time ? (
          <>
            <input type="time" value={time} onChange={(e) => onTime(e.target.value)} aria-label="Start time" className={`${field} w-0 flex-1 px-2`} />
            <span className="text-muted">–</span>
            <input type="time" value={end} min={time} onChange={(e) => onEnd(e.target.value)} aria-label="End time" className={`${field} w-0 flex-1 px-2`} />
            <button type="button" onClick={() => onTime("")} aria-label="No set time" className="flex h-11 w-8 shrink-0 items-center justify-center text-muted">
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button type="button" onClick={() => onTime("09:00")} className={`${field} flex-1 text-left text-muted`}>
            Any time · tap to set a time
          </button>
        )}
      </div>
    </div>
  );
}
