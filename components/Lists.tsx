"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ListPlus, Pencil, Trash2, X } from "lucide-react";
import { Card, PageTitle, ProgressBar, SectionLabel } from "./ui";
import { AddBar } from "./AddBar";
import { Figure } from "./Figures";
import { dateKey, daysAgo, type Store, type TodoList } from "@/lib/store";

const toDate = (key: string) => new Date(key + "T12:00");
const longDay = (key: string) => toDate(key).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

export function Lists({ store, onRemoved }: { store: Store; onRemoved: (list: TodoList) => void }) {
  const today = store.todayKey;
  const [day, setDay] = useState(today);
  const lists = store.state.lists;
  const onDay = lists.filter((l) => l.date === day).sort((a, b) => a.createdAt - b.createdAt);

  // Two weeks back and one ahead, so every day's lists can be checked
  const strip = Array.from({ length: 21 }, (_, i) => dateKey(daysAgo(13 - i)));
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scroller.current?.querySelector(`[data-key="${today}"]`)?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [today]);

  // Unchecked items left on earlier days, offered to bring forward
  const leftover = lists.filter((l) => l.date < today && l.items.some((x) => !x.done));
  const leftoverCount = leftover.reduce((n, l) => n + l.items.filter((x) => !x.done).length, 0);

  /** The everyday list: adding to a day with no list makes one, stamped with that day */
  const addToDay = (text: string) => {
    const main = onDay.find((l) => l.title === "To-do") ?? onDay[0];
    if (main) store.addListItem(main.id, text);
    else store.addList("To-do", day, [text]);
  };

  return (
    <div className="space-y-3">
      <PageTitle title="Lists" subtitle={day === today ? `Today · ${longDay(day)}` : longDay(day)} />

      <div ref={scroller} className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 py-1">
        {strip.map((k) => {
          const ls = lists.filter((l) => l.date === k);
          const total = ls.reduce((n, l) => n + l.items.length, 0);
          const done = ls.reduce((n, l) => n + l.items.filter((x) => x.done).length, 0);
          const sel = k === day;
          return (
            <button
              key={k}
              data-key={k}
              type="button"
              onClick={() => setDay(k)}
              aria-pressed={sel}
              aria-label={`${longDay(k)}: ${done} of ${total} done`}
              className={`flex h-16 w-12 shrink-0 flex-col items-center justify-center rounded-2xl ${sel ? "bg-ink text-white" : k === today ? "bg-brand-100 text-ink" : "bg-white text-ink shadow-soft"}`}
            >
              <span className={`text-[0.65rem] font-bold uppercase ${sel ? "text-white/70" : "text-muted"}`}>{toDate(k).toLocaleDateString(undefined, { weekday: "short" })}</span>
              <span className="text-[1.05rem] leading-tight font-extrabold">{toDate(k).getDate()}</span>
              <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${!total ? "bg-transparent" : done === total ? "bg-moss-400" : sel ? "bg-brand-300" : "bg-brand-500"}`} />
            </button>
          );
        })}
      </div>

      <AddBar placeholder={day === today ? "Add to today's list…" : `Add to ${toDate(day).toLocaleDateString(undefined, { weekday: "long" })}'s list…`} onAdd={addToDay} />

      {day === today && leftoverCount > 0 && (
        <button
          type="button"
          onClick={() => leftover.forEach((l) => store.carryOver(l.id, today))}
          className="flex w-full items-center gap-3 rounded-3xl bg-ochre-50 p-3 text-left active:scale-[0.99]"
        >
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
        <Card className="py-7 text-center">
          <Figure name="checklist" className="mx-auto h-32 w-44" />
          <p className="mt-1 font-display text-lg font-medium text-ink">{day === today ? "Nothing on today's list yet" : "No list for this day"}</p>
          <p className="mt-1 text-[0.9rem] text-muted">Add an item above. The date and day are filled in for you.</p>
        </Card>
      ) : (
        onDay.map((l) => <ListCard key={l.id} list={l} store={store} today={today} onRemoved={onRemoved} />)
      )}

      <button
        type="button"
        onClick={() => store.addList(`List ${onDay.length + 1}`, day)}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-brand-200 font-bold text-brand-700"
      >
        <ListPlus className="h-5 w-5" /> New list for {day === today ? "today" : toDate(day).toLocaleDateString(undefined, { weekday: "long" })}
      </button>

      <History lists={lists} today={today} onPick={setDay} />
    </div>
  );
}

function ListCard({ list, store, today, onRemoved }: { list: TodoList; store: Store; today: string; onRemoved: (l: TodoList) => void }) {
  const [renaming, setRenaming] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const done = list.items.filter((x) => x.done).length;
  const left = list.items.length - done;

  return (
    <Card className="!p-3">
      <div className="flex items-center gap-2 px-1">
        {renaming ? (
          <input
            autoFocus
            value={list.title}
            onChange={(e) => store.updateList(list.id, { title: e.target.value })}
            onBlur={() => setRenaming(false)}
            onKeyDown={(e) => e.key === "Enter" && setRenaming(false)}
            aria-label="List name"
            className="h-9 min-w-0 flex-1 rounded-xl bg-surface px-2 font-extrabold text-ink outline-none"
          />
        ) : (
          <button type="button" onClick={() => setRenaming(true)} className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
            <span className="truncate font-extrabold text-ink">{list.title || "Untitled"}</span>
            <Pencil className="h-3.5 w-3.5 shrink-0 text-stone-300" />
          </button>
        )}
        <span className="shrink-0 text-[0.8rem] font-bold text-muted tabular-nums">
          {done}/{list.items.length}
        </span>
      </div>
      <p className="px-1 text-[0.75rem] font-semibold text-muted">{longDay(list.date)}</p>
      {list.items.length > 0 && (
        <div className="mt-2 px-1">
          <ProgressBar value={done / list.items.length} color={left === 0 ? "bg-moss-400" : "bg-brand-500"} />
        </div>
      )}

      <ul className="mt-2">
        {/* Unchecked first, so what's left is always at the top */}
        {[...list.items].sort((a, b) => Number(a.done) - Number(b.done)).map((x) => (
          <ListRow key={x.id} text={x.text} done={x.done} onToggle={() => store.toggleListItem(list.id, x.id)} onEdit={(t) => store.editListItem(list.id, x.id, t)} onRemove={() => store.removeListItem(list.id, x.id)} />
        ))}
      </ul>

      {list.title !== "To-do" && <AddBar placeholder={`Add to ${list.title || "this list"}…`} onAdd={(t) => store.addListItem(list.id, t)} className="mt-2 !bg-surface !shadow-none" />}

      <div className="mt-2 flex items-center justify-end gap-1.5">
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
    </Card>
  );
}

function ListRow({ text, done, onToggle, onEdit, onRemove }: { text: string; done: boolean; onToggle: () => void; onEdit: (t: string) => void; onRemove: () => void }) {
  const [editing, setEditing] = useState(false);
  return (
    <li className="flex items-center gap-2.5 border-b border-line py-1.5 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={done}
        aria-label={`${text}: ${done ? "checked" : "check"}`}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${done ? "animate-pop border-moss-400 bg-moss-400 text-white" : "border-stone-300 bg-white"}`}
      >
        {done && <Check className="h-4 w-4" strokeWidth={3.5} />}
      </button>
      {editing ? (
        <input
          autoFocus
          value={text}
          onChange={(e) => onEdit(e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
          aria-label="Edit item"
          className="h-9 min-w-0 flex-1 rounded-xl bg-surface px-2 text-ink outline-none"
        />
      ) : (
        <button type="button" onClick={() => setEditing(true)} className={`min-w-0 flex-1 text-left ${done ? "text-muted line-through" : "text-ink"}`}>
          {text}
        </button>
      )}
      <button type="button" onClick={onRemove} aria-label={`Remove ${text}`} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-300">
        <X className="h-4 w-4" />
      </button>
    </li>
  );
}

/** Earlier days that had lists, newest first */
function History({ lists, today, onPick }: { lists: TodoList[]; today: string; onPick: (k: string) => void }) {
  const days = [...new Set(lists.map((l) => l.date))].filter((k) => k < today).sort().reverse().slice(0, 10);
  if (!days.length) return null;
  return (
    <section className="space-y-2 pt-2">
      <SectionLabel>Earlier lists</SectionLabel>
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
                  <span className={`text-[0.85rem] font-bold tabular-nums ${done === total && total ? "text-moss-700" : "text-muted"}`}>
                    {done}/{total} done
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
