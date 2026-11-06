"use client";

import { useState } from "react";
import { Bell, BellOff, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Card, PageTitle, SectionLabel } from "./ui";
import { GrowItem, fmtTime } from "./ItemCard";
import { detect, tidyTitle } from "@/lib/pillars";
import { byTime, dateKey, itemsForDay, taskDay, type Item, type Store } from "@/lib/store";

function startOfWeek(offset: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + offset * 7);
  return d;
}

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
  const [day, setDay] = useState(today);
  const [week, setWeek] = useState(0);
  const [text, setText] = useState("");
  const items = store.state.items;

  const tasks = items.filter((i) => i.kind === "task" && taskDay(i, today) === day);
  // Habits with a reminder time are part of every day's schedule
  const timedHabits = items.filter((i) => i.kind === "habit" && i.time);
  const scheduled = [...tasks.filter((i) => i.time), ...timedHabits].sort(byTime);
  const anytime = tasks.filter((i) => !i.time && !i.done.length);
  const finished = tasks.filter((i) => !i.time && i.done.length);

  const add = () => {
    if (!text.trim()) return;
    const d = detect(text);
    const id = store.addItem({ title: tidyTitle(text), emoji: d.emoji, pillar: d.pillar, kind: "task", date: day });
    setText("");
    setOpenId(id);
  };

  const monday = startOfWeek(week);
  const label =
    day === today ? "today" : new Date(day + "T12:00").toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
  const card = (i: Item) => (
    <GrowItem key={i.id} item={i} store={store} open={openId === i.id} onToggle={() => setOpenId(openId === i.id ? null : i.id)} onDeleted={onDeleted} />
  );

  return (
    <div className="space-y-3">
      <PageTitle title="Plan" subtitle="Your day, one small block at a time." />

      {/* Week picker */}
      <Card className="!p-2">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setWeek(week - 1)} aria-label="Previous week" className="flex h-9 w-7 items-center justify-center text-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="grid flex-1 grid-cols-7 gap-1">
            {Array.from({ length: 7 }, (_, i) => {
              const d = new Date(monday);
              d.setDate(monday.getDate() + i);
              const key = dateKey(d);
              const count = items.filter((x) => x.kind === "task" && taskDay(x, today) === key).length;
              const sel = key === day;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDay(key)}
                  aria-pressed={sel}
                  aria-label={d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                  className={`flex h-14 flex-col items-center justify-center rounded-2xl transition-colors ${sel ? "bg-ink text-white" : key === today ? "bg-brand-50" : ""}`}
                >
                  <span className={`text-[0.7rem] font-bold ${sel ? "text-white/70" : "text-muted"}`}>{d.toLocaleDateString(undefined, { weekday: "narrow" })}</span>
                  <span className="font-extrabold">{d.getDate()}</span>
                  <span className={`h-1 w-1 rounded-full ${count ? (sel ? "bg-brand-300" : "bg-brand-500") : "bg-transparent"}`} />
                </button>
              );
            })}
          </div>
          <button type="button" onClick={() => setWeek(week + 1)} aria-label="Next week" className="flex h-9 w-7 items-center justify-center text-muted">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </Card>

      {/* Quick add for the selected day */}
      <div className="flex items-center gap-2 rounded-full bg-white p-1.5 pl-4 shadow-soft">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          enterKeyHint="done"
          placeholder={`Add a task for ${label}…`}
          aria-label="Add a task"
          className="h-10 min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-zinc-400"
        />
        <button type="button" onClick={add} disabled={!text.trim()} aria-label="Add task" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-white disabled:opacity-25">
          <Plus className="h-5 w-5" strokeWidth={3} />
        </button>
      </div>

      {notify !== "granted" && notify !== "unsupported" && (scheduled.length > 0 || timedHabits.length > 0) && (
        <button type="button" onClick={onEnableNotify} className="flex w-full items-center gap-3 rounded-3xl bg-amber-50 p-3 text-left">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
            {notify === "denied" ? <BellOff className="h-4 w-4 text-amber-700" /> : <Bell className="h-4 w-4 text-amber-700" />}
          </span>
          <span className="text-[0.9rem] font-semibold text-ink">
            {notify === "denied" ? "Reminders are blocked in your browser settings. In-app reminders still show." : "Turn on reminders so Aham can nudge you at the right time"}
          </span>
        </button>
      )}

      {scheduled.length > 0 && (
        <section className="space-y-2">
          <SectionLabel>⏰ Scheduled</SectionLabel>
          {scheduled.map((i) => (
            <div key={i.id} className="flex gap-2">
              <span className="w-14 shrink-0 pt-4 text-right text-[0.8rem] font-bold text-muted">{fmtTime(i.time!)}</span>
              <div className="min-w-0 flex-1">{card(i)}</div>
            </div>
          ))}
        </section>
      )}

      {anytime.length > 0 && (
        <section className="space-y-2">
          <SectionLabel>🗂️ Anytime {day === today ? "today" : ""}</SectionLabel>
          {anytime.map(card)}
        </section>
      )}

      {finished.length > 0 && (
        <section className="space-y-2 opacity-80">
          <SectionLabel>✅ Done</SectionLabel>
          {finished.map(card)}
        </section>
      )}

      {scheduled.length + anytime.length + finished.length === 0 && (
        <Card className="py-7 text-center">
          <p className="text-3xl" aria-hidden>
            🗓️
          </p>
          <p className="mt-2 font-extrabold text-ink">A clear day</p>
          <p className="mt-1 text-[0.9rem] text-muted">Add a task above. Tap it to set a time, a reminder, or break it into tiny steps.</p>
        </Card>
      )}

      {day === today && itemsForDay(items, today, today).some((i) => i.kind === "task" && i.date && i.date < today && !i.done.length) && (
        <p className="px-1 text-[0.85rem] text-muted">Unfinished tasks from earlier days roll over to today. No pressure.</p>
      )}
    </div>
  );
}
