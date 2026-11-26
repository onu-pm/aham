"use client";

import { useEffect, useRef, useState } from "react";
import { AlarmClock, ArrowRight, Check, ChevronDown, Pencil, Plus, Trash2, X } from "lucide-react";
import { Card, Collapse, SectionLabel } from "./ui";
import { AddBar } from "./AddBar";
import { Figure } from "./Figures";
import { fmtTime } from "./ItemCard";
import { parseWhen } from "@/lib/when";
import { celebrate } from "@/lib/fx";
import { tidyTitle } from "@/lib/pillars";
import { dateKey, daysAgo, type Store, type TodoList } from "@/lib/store";

const toDate = (key: string) => new Date(key + "T12:00");
const longDay = (key: string) => toDate(key).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

/** One tap makes a list; each comes with ideas so there's little to type */
const KINDS: { title: string; emoji: string; tint: string; ideas: string[] }[] = [
  { title: "Today", emoji: "✅", tint: "bg-brand-100", ideas: ["Call someone", "Reply to messages", "Pay a bill", "Tidy up 10 min", "Take medicines"] },
  { title: "Groceries", emoji: "🛒", tint: "bg-moss-100", ideas: ["Milk", "Eggs", "Bread", "Rice", "Dal", "Atta", "Vegetables", "Fruit", "Onions", "Tomatoes", "Oil", "Curd"] },
  { title: "Shopping", emoji: "🛍️", tint: "bg-rosewood-100", ideas: ["Clothes", "Shoes", "Gift", "Toiletries", "Phone charger", "Stationery"] },
  { title: "Errands", emoji: "🏃", tint: "bg-ochre-100", ideas: ["Bank", "Post office", "Pharmacy", "Pick up laundry", "Recharge phone", "Fuel"] },
  { title: "Home", emoji: "🏠", tint: "bg-sand-100", ideas: ["Laundry", "Dishes", "Clean kitchen", "Change bedsheets", "Water plants", "Take out trash"] },
  { title: "Work", emoji: "💼", tint: "bg-slate-100", ideas: ["Check email", "Team update", "Finish report", "Plan tomorrow", "Follow up"] },
  { title: "Bills", emoji: "💸", tint: "bg-olive-100", ideas: ["Electricity", "Rent", "Internet", "Credit card", "Phone bill", "Insurance"] },
  { title: "Self-care", emoji: "🌿", tint: "bg-clay-100", ideas: ["Drink water", "Stretch", "Short walk", "Early night", "Call a friend"] },
];
const kindOf = (l: TodoList) => KINDS.find((k) => k.title === l.title);

export function Lists({ store, onRemoved }: { store: Store; onRemoved: (list: TodoList) => void }) {
  const today = store.todayKey;
  const [day, setDay] = useState(today);
  const [openId, setOpenId] = useState<string | null>(null);
  const [custom, setCustom] = useState(false);
  const lists = store.state.lists;
  const onDay = lists.filter((l) => l.date === day).sort((a, b) => a.createdAt - b.createdAt);
  // Two weeks either side of today, scrollable
  const strip = Array.from({ length: 29 }, (_, i) => dateKey(daysAgo(14 - i)));
  const stripRef = useRef<HTMLDivElement>(null);
  // An always-visible scroll indicator (phones hide real scrollbars until you scroll)
  const [bar, setBar] = useState({ left: 0, width: 0.3 });
  const onStripScroll = () => {
    const el = stripRef.current;
    if (!el) return;
    const width = el.clientWidth / el.scrollWidth;
    setBar({ width, left: (el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth)) * (1 - width) });
  };
  useEffect(() => {
    stripRef.current?.querySelector(`[data-key="${day}"]`)?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    const t = setTimeout(onStripScroll, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);

  // Open the first list with something left, so the day starts in the right place
  useEffect(() => {
    const first = onDay.find((l) => l.items.some((x) => !x.done)) ?? onDay[0];
    setOpenId(first?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);

  const leftover = lists.filter((l) => l.date < today && l.items.some((x) => !x.done));
  const leftoverCount = leftover.reduce((n, l) => n + l.items.filter((x) => !x.done).length, 0);
  const total = onDay.reduce((n, l) => n + l.items.length, 0);
  const done = onDay.reduce((n, l) => n + l.items.filter((x) => x.done).length, 0);

  // Lists still waiting to be finished (the quick "Today" list doesn't count)
  const MAX_OPEN = 5;
  const openLists = lists.filter((l) => l.title !== "Today" && !(l.items.length > 0 && l.items.every((x) => x.done)));
  const full = openLists.length >= MAX_OPEN;
  const [nudge, setNudge] = useState(false);

  /** Tapping a kind opens that day's list of it, or makes one, while fewer than 5 are open */
  const openKind = (title: string, emoji: string) => {
    const existing = onDay.find((l) => l.title === title);
    if (existing) return setOpenId(existing.id);
    if (full) return setNudge(true);
    setOpenId(store.addList(title, day, [], emoji));
  };

  /** The quick box adds to the day's "Today" list; "at 5pm" turns it into a reminder */
  const quickAdd = (raw: string) => {
    const w = parseWhen(raw);
    const target = w.date ?? day;
    const list = lists.find((l) => l.date === target && l.title === "Today");
    const text = tidyTitle(w.title);
    if (list) store.addListItem(list.id, text, w.time);
    else {
      const id = store.addList("Today", target, [], "✅");
      store.addListItem(id, text, w.time);
    }
    if (target !== day) setDay(target);
  };

  return (
    <div className="stagger space-y-3">
      <header className="flex items-end justify-between gap-3 px-1 pt-5">
        <div className="min-w-0">
          <p className="text-[0.9rem] font-semibold text-muted">{day === today ? "Today" : toDate(day).toLocaleDateString(undefined, { weekday: "long" })}</p>
          <h1 className="text-[2rem] leading-tight font-medium tracking-tight text-ink">Tasks</h1>
        </div>
        {total > 0 && (
          <span className="mb-1 rounded-full bg-white px-3 py-1.5 text-[0.8rem] font-medium text-ink shadow-soft tabular-nums">
            {Math.round((done / total) * 100)}% done
          </span>
        )}
      </header>

      {/* Status at a glance */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { v: total - done, l: "To do", tone: "tone-ochre", c: "text-ochre-700" },
          { v: done, l: "Done", tone: "tone-moss", c: "text-moss-700" },
          { v: `${openLists.length}/${MAX_OPEN}`, l: "Open lists", tone: "tone-slate", c: "text-slate-700" },
          { v: onDay.reduce((n, l) => n + l.items.filter((x) => x.time && !x.done).length, 0), l: "Reminders", tone: "tone-clay", c: "text-clay-700" },
        ].map((x) => (
          <div key={x.l} className={`rounded-2xl px-1 py-2.5 text-center ${x.tone}`}>
            <p className="font-display text-[1.3rem] leading-none font-medium text-ink tabular-nums">{x.v}</p>
            <p className={`mt-1 text-[0.66rem] font-medium ${x.c}`}>{x.l}</p>
          </div>
        ))}
      </div>

      {/* Dates: scroll back and forward */}
      <div>
      <div ref={stripRef} onScroll={onStripScroll} className="no-scrollbar -mx-4 flex snap-x gap-1.5 overflow-x-auto px-4 py-1">
        {strip.map((k) => {
          const ls = lists.filter((l) => l.date === k);
          const t = ls.reduce((n, l) => n + l.items.length, 0);
          const d = ls.reduce((n, l) => n + l.items.filter((x) => x.done).length, 0);
          const sel = k === day;
          return (
            <button
              key={k}
              data-key={k}
              type="button"
              onClick={() => setDay(k)}
              aria-pressed={sel}
              aria-label={`${longDay(k)}: ${d} of ${t} done`}
              className={`flex h-[3.6rem] w-12 shrink-0 snap-center flex-col items-center justify-center rounded-2xl transition-all duration-300 ${sel ? "scale-105 bg-ink text-white" : k === today ? "bg-brand-100 text-ink" : "bg-white text-ink shadow-soft"}`}
            >
              <span className={`text-[0.62rem] font-bold uppercase ${sel ? "text-white/70" : "text-muted"}`}>{toDate(k).toLocaleDateString(undefined, { weekday: "short" })}</span>
              <span className="font-display text-[1rem] leading-tight font-medium">{toDate(k).getDate()}</span>
              <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${!t ? "bg-transparent" : d === t ? "bg-moss-400" : sel ? "bg-brand-300" : "bg-brand-500"}`} />
            </button>
          );
        })}
      </div>
      <div className="mx-auto mt-1.5 h-1 w-28 overflow-hidden rounded-full bg-ink/8" aria-hidden>
        <div className="h-full rounded-full bg-brand-500 transition-[margin] duration-150" style={{ width: `${bar.width * 100}%`, marginLeft: `${bar.left * 100}%` }} />
      </div>
      </div>

      <AddBar placeholder="Add a task… e.g. “call bank at 5pm”" onAdd={quickAdd} />

      {/* One tap to start a list */}
      <section>
        <SectionLabel>Start a list</SectionLabel>
        <div className="no-scrollbar -mx-4 mt-1.5 flex gap-2 overflow-x-auto px-4 pb-1">
          {KINDS.filter((k) => k.title !== "Today").map((k) => {
            const has = onDay.some((l) => l.title === k.title);
            return (
              <button
                key={k.title}
                type="button"
                onClick={() => openKind(k.title, k.emoji)}
                className={`flex h-[4.5rem] w-[4.75rem] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl ${k.tint} active:scale-95 ${has ? "ring-2 ring-ink/70" : ""}`}
              >
                <span className="text-2xl leading-none" aria-hidden>
                  {k.emoji}
                </span>
                <span className="text-[0.72rem] font-bold text-ink">{k.title}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => (full ? setNudge(true) : setCustom(true))}
            className="flex h-[4.5rem] w-[4.75rem] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-brand-200 text-brand-700 active:scale-95"
          >
            <Plus className="h-5 w-5" />
            <span className="text-[0.72rem] font-bold">Your own</span>
          </button>
        </div>
        {nudge && full && (
          <div role="status" className="animate-in mt-2 flex items-start gap-3 rounded-2xl bg-ochre-50 p-3">
            <span className="text-xl" aria-hidden>
              🧺
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[0.9rem] font-semibold text-ink">Mark your previous {MAX_OPEN} lists complete to add a new one.</p>
              <p className="mt-0.5 text-[0.8rem] text-muted">
                Still open: {openLists.slice(0, MAX_OPEN).map((l) => `${l.emoji ?? "📋"} ${l.title}`).join(", ")}
              </p>
            </div>
            <button type="button" onClick={() => setNudge(false)} aria-label="Dismiss" className="flex h-7 w-7 shrink-0 items-center justify-center text-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {custom && !full && (
          <AddBar
            autoFocus
            className="mt-2"
            placeholder="Name your list… e.g. “Trip packing”"
            onAdd={(t) => {
              setOpenId(store.addList(tidyTitle(t), day, [], "📋"));
              setCustom(false);
            }}
          />
        )}
      </section>

      {day === today && leftoverCount > 0 && (
        <button type="button" onClick={() => leftover.forEach((l) => store.carryOver(l.id, today))} className="flex w-full items-center gap-3 rounded-3xl bg-ochre-50 p-3 text-left active:scale-[0.99]">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lg" aria-hidden>
            📥
          </span>
          <span className="flex-1 text-[0.9rem] font-semibold text-ink">
            {leftoverCount} unchecked from earlier days. Bring {leftoverCount === 1 ? "it" : "them"} to today?
          </span>
          <ArrowRight className="h-4 w-4 text-ochre-700" />
        </button>
      )}

      {onDay.length === 0 ? (
        <Card className="py-6 text-center">
          <Figure name="checklist" className="mx-auto h-32 w-44" />
          <p className="mt-1 font-display text-lg font-medium text-ink">{day === today ? "A clear list for today" : "Nothing for this day yet"}</p>
          <p className="mt-1 text-[0.9rem] text-muted">Type a task above, or tap Groceries, Shopping and more to start a list.</p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {onDay.map((l) => (
            <ListCard key={l.id} list={l} store={store} today={today} open={openId === l.id} onToggle={() => setOpenId(openId === l.id ? null : l.id)} onRemoved={onRemoved} />
          ))}
        </div>
      )}

      <History lists={lists} today={today} onPick={setDay} />
    </div>
  );
}

/** A list as an accordion: the header shows progress, the body slides open */
function ListCard({ list, store, today, open, onToggle, onRemoved }: { list: TodoList; store: Store; today: string; open: boolean; onToggle: () => void; onRemoved: (l: TodoList) => void }) {
  const [renaming, setRenaming] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const kind = kindOf(list);
  const done = list.items.filter((x) => x.done).length;
  const left = list.items.length - done;
  const pct = list.items.length ? done / list.items.length : 0;
  const have = new Set(list.items.map((x) => x.text.toLowerCase()));
  const ideas = (kind?.ideas ?? []).filter((i) => !have.has(i.toLowerCase())).slice(0, 8);

  useEffect(() => {
    if (open) ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [open]);

  const add = (raw: string) => {
    const w = parseWhen(raw);
    store.addListItem(list.id, tidyTitle(w.title), w.time);
  };

  return (
    <div
      ref={ref}
      data-open={open}
      className={`accordion overflow-hidden rounded-3xl bg-white transition-all duration-500 ${open ? "shadow-[0_18px_40px_-20px_rgb(64_52_30/0.45)] ring-1 ring-brand-200" : "shadow-soft"}`}
    >
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 p-3 text-left">
        <span className={`accordion-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl ${kind?.tint ?? "bg-surface"}`} aria-hidden>
          {list.emoji ?? kind?.emoji ?? "📋"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-[1.05rem] font-medium text-ink">{list.title || "Untitled"}</span>
          <span className="mt-1 flex items-center gap-2">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
              <span className={`block h-full rounded-full transition-[width] duration-500 ${left === 0 && list.items.length ? "bg-moss-400" : "bg-brand-500"}`} style={{ width: `${pct * 100}%` }} />
            </span>
            <span className="text-[0.78rem] font-bold text-muted tabular-nums">
              {list.items.length ? (left === 0 ? "All done ✓" : `${done}/${list.items.length}`) : "Empty"}
            </span>
          </span>
        </span>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${open ? "rotate-180 bg-ink text-white" : "bg-surface text-muted"}`}>
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>

      <Collapse open={open}>
        <div className="border-t border-line px-3 pt-1 pb-3">
          <ul className="rows">
            {[...list.items]
              .sort((a, b) => Number(a.done) - Number(b.done) || (a.time ?? "99").localeCompare(b.time ?? "99"))
              .map((x, i) => (
                <Row
                  key={x.id}
                  index={i}
                  text={x.text}
                  done={x.done}
                  time={x.time ?? null}
                  onToggle={() => store.toggleListItem(list.id, x.id)}
                  onEdit={(t) => store.editListItem(list.id, x.id, t)}
                  onTime={(t) => store.setListItemTime(list.id, x.id, t)}
                  onRemove={() => store.removeListItem(list.id, x.id)}
                />
              ))}
          </ul>

          <AddBar placeholder={`Add to ${list.title || "this list"}…`} onAdd={add} className="mt-2 !bg-surface !shadow-none" />

          {ideas.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ideas.map((i) => (
                <button key={i} type="button" onClick={() => store.addListItem(list.id, i)} className="flex h-8 items-center gap-1 rounded-full bg-surface px-3 text-[0.8rem] font-semibold text-ink active:scale-95">
                  <Plus className="h-3 w-3 text-brand-600" strokeWidth={3} /> {i}
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-1.5">
            {renaming ? (
              <input
                autoFocus
                value={list.title}
                onChange={(e) => store.updateList(list.id, { title: e.target.value })}
                onBlur={() => setRenaming(false)}
                onKeyDown={(e) => e.key === "Enter" && setRenaming(false)}
                aria-label="List name"
                className="h-9 min-w-0 flex-1 rounded-full bg-surface px-3 text-[0.9rem] font-bold text-ink outline-none"
              />
            ) : (
              <button type="button" onClick={() => setRenaming(true)} className="flex h-9 items-center gap-1 rounded-full px-3 text-[0.8rem] font-bold text-muted">
                <Pencil className="h-3.5 w-3.5" /> Rename
              </button>
            )}
            <span className="flex-1" />
            {list.date < today && left > 0 && (
              <button type="button" onClick={() => store.carryOver(list.id, today)} className="flex h-9 items-center gap-1 rounded-full bg-brand-50 px-3 text-[0.8rem] font-bold text-brand-700">
                Move {left} to today <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (!confirm) return setConfirm(true);
                store.deleteList(list.id);
                onRemoved(list);
              }}
              onBlur={() => setConfirm(false)}
              className={`flex h-9 items-center gap-1 rounded-full px-3 text-[0.8rem] font-bold ${confirm ? "bg-terra-700 text-white" : "text-terra-700"}`}
            >
              <Trash2 className="h-3.5 w-3.5" /> {confirm ? "Delete list?" : "Delete"}
            </button>
          </div>
        </div>
      </Collapse>
    </div>
  );
}

/** A big checkbox; checking strikes the line through */
function Row({
  index = 0,
  text,
  done,
  time,
  onToggle,
  onEdit,
  onTime,
  onRemove,
}: {
  index?: number;
  text: string;
  done: boolean;
  time: string | null;
  onToggle: () => void;
  onEdit: (t: string) => void;
  onTime: (t: string | null) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <li className="flex min-h-11 items-center gap-2.5 border-b border-line py-1.5 last:border-0" style={{ ["--i" as string]: index }}>
      <button
        type="button"
        onClick={(e) => {
          if (!done) celebrate(e.currentTarget);
          onToggle();
        }}
        aria-pressed={done}
        aria-label={`${text}: ${done ? "checked" : "check"}`}
        className="-m-2 flex h-10 w-10 shrink-0 items-center justify-center"
      >
        <span className={`flex h-[1.35rem] w-[1.35rem] items-center justify-center rounded-md border-[1.5px] transition-all duration-300 ${done ? "animate-pop border-moss-400 bg-moss-400 text-white" : "border-stone-300 bg-white"}`}>
          {done && <Check className="h-3.5 w-3.5" strokeWidth={3.5} />}
        </span>
      </button>
      {editing ? (
        <input
          autoFocus
          value={text}
          onChange={(e) => onEdit(e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
          aria-label="Edit task"
          className="h-9 min-w-0 flex-1 rounded-xl bg-surface px-2 text-ink outline-none"
        />
      ) : (
        <button type="button" onClick={() => setEditing(true)} className="min-w-0 flex-1 text-left">
          <span className={`block text-[0.95rem] leading-snug transition-colors duration-300 ${done ? "text-muted line-through decoration-[1.5px]" : "text-ink"}`}>{text}</span>
        </button>
      )}
      {time ? (
        <button type="button" onClick={() => onTime(null)} aria-label={`Reminder at ${fmtTime(time)}. Tap to remove`} className="flex h-7 shrink-0 items-center gap-1 rounded-full bg-ochre-50 px-2 text-[0.72rem] font-bold text-ochre-700">
          <AlarmClock className="h-3.5 w-3.5" /> {fmtTime(time)}
        </button>
      ) : (
        !done && (
          <label className="relative flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-stone-300" aria-label="Set a reminder time">
            <AlarmClock className="h-4 w-4" />
            <input type="time" onChange={(e) => e.target.value && onTime(e.target.value)} className="absolute inset-0 opacity-0" />
          </label>
        )
      )}
      <button type="button" onClick={onRemove} aria-label={`Remove ${text}`} className="flex h-8 w-6 shrink-0 items-center justify-center text-stone-300">
        <X className="h-4 w-4" />
      </button>
    </li>
  );
}

/** Earlier days that had lists, newest first */
function History({ lists, today, onPick }: { lists: TodoList[]; today: string; onPick: (k: string) => void }) {
  const days = [...new Set(lists.map((l) => l.date))].filter((k) => k < dateKey(daysAgo(3))).sort().reverse().slice(0, 10);
  if (!days.length) return null;
  return (
    <section className="space-y-2 pt-2">
      <SectionLabel>Earlier</SectionLabel>
      <Card className="!py-1">
        <ul className="divide-y divide-line">
          {days.map((k) => {
            const ls = lists.filter((l) => l.date === k);
            const total = ls.reduce((n, l) => n + l.items.length, 0);
            const done = ls.reduce((n, l) => n + l.items.filter((x) => x.done).length, 0);
            return (
              <li key={k}>
                <button type="button" onClick={() => (onPick(k), window.scrollTo({ top: 0, behavior: "smooth" }))} className="flex w-full items-center gap-3 py-2.5 text-left">
                  <span className="flex-1 font-bold text-ink">{longDay(k)}</span>
                  <span className="text-[0.85rem]" aria-hidden>
                    {ls.map((l) => l.emoji ?? "📋").join(" ")}
                  </span>
                  <span className={`text-[0.85rem] font-bold tabular-nums ${done === total && total ? "text-moss-700" : "text-muted"}`}>
                    {done}/{total}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Card>
    </section>
  );
}
