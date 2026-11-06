"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, Loader2, Minus, Plus, Sparkles, Trash2, X } from "lucide-react";
import { EmojiTile, ProgressBar, Sheet, inputCls, softBtn } from "./ui";
import { PILLARS, pillarById, KIND_LABEL } from "@/lib/pillars";
import { breakDown } from "@/lib/breakdown";
import { dateKey, itemStreak, itemThisWeek, type Item, type Store } from "@/lib/store";

/** One tappable row used on Today and Grow */
export function ItemRow({
  item,
  dayKey,
  store,
  onOpen,
}: {
  item: Item;
  dayKey: string;
  store: Store;
  onOpen: () => void;
}) {
  const p = pillarById[item.pillar];
  const done = item.done.includes(dayKey);
  const stepsDone = item.steps.filter((s) => s.done).length;
  const streak = itemStreak(item);

  let meta = "";
  if (item.kind === "task") meta = item.steps.length ? `${stepsDone}/${item.steps.length} steps` : "Task";
  else if (item.kind === "goal") meta = `${item.progress}${item.total ? `/${item.total}` : ""} ${item.unit ?? ""}`.trim();
  else meta = streak > 1 ? `🔥 ${streak} days` : `${itemThisWeek(item)}/7 this week`;

  return (
    <div className={`flex items-center gap-3 rounded-3xl p-2.5 pr-3 transition-colors ${done ? p.tint : "bg-white shadow-soft"}`}>
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <EmojiTile emoji={item.emoji} className={p.soft} />
        <span className="min-w-0 flex-1">
          <span className={`block leading-snug font-semibold ${done ? "text-muted line-through" : "text-ink"}`}>{item.title}</span>
          <span className="block text-sm text-muted">{meta}</span>
          {item.kind === "task" && item.steps.length > 0 && !done && (
            <span className="mt-1.5 block">
              <ProgressBar value={stepsDone / item.steps.length} color={p.bar} />
            </span>
          )}
        </span>
      </button>
      <button
        type="button"
        aria-pressed={done}
        aria-label={`${item.title}: ${done ? "done" : "mark done"}`}
        onClick={() => store.toggleItemDay(item.id, dayKey)}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors ${
          done ? `${p.solid} animate-pop` : "border-2 border-zinc-300 bg-white"
        }`}
      >
        {done && <Check className="h-5 w-5" strokeWidth={3} />}
      </button>
    </div>
  );
}

function MonthGrid({ item, year, month, store }: { item: Item; year: number; month: number; store: Store }) {
  const p = pillarById[item.pillar];
  const set = new Set(item.done);
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const today = dateKey();

  return (
    <div className="w-full shrink-0 snap-center px-0.5">
      <p className="mb-2 font-semibold text-ink">{first.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs text-muted">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: lead }, (_, i) => (
          <span key={`l${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const key = dateKey(new Date(year, month, i + 1, 12));
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
              className={`flex aspect-square items-center justify-center rounded-full text-sm font-medium transition-colors ${
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
}

export function ItemSheet({ item, store, onClose, onDeleted }: { item: Item; store: Store; onClose: () => void; onDeleted: (item: Item) => void }) {
  const p = pillarById[item.pillar];
  const [pickPillar, setPickPillar] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newStep, setNewStep] = useState("");
  const [loading, setLoading] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  // Last 6 months, oldest first; opens on the current month
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  useLayoutEffect(() => {
    if (scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth;
  }, [item.kind]);

  useEffect(() => setConfirmDelete(false), [item.id]);

  const step = item.unit === "pages" ? 10 : 1;
  const bump = (delta: number) => {
    const next = Math.max(0, item.total ? Math.min(item.total, item.progress + delta) : item.progress + delta);
    store.updateItem(item.id, { progress: next });
    // Moving forward counts as showing up today
    if (delta > 0 && !item.done.includes(store.todayKey)) store.toggleItemDay(item.id);
  };

  const addStep = () => {
    if (!newStep.trim()) return;
    store.setSteps(item.id, [newStep.trim()]);
    setNewStep("");
  };

  const autoSteps = async () => {
    setLoading(true);
    const r = await breakDown(item.title);
    store.setSteps(item.id, r.steps);
    setLoading(false);
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title={
        <span className="flex items-center gap-3">
          <EmojiTile emoji={item.emoji} className={p.soft} />
          <input
            value={item.title}
            onChange={(e) => store.updateItem(item.id, { title: e.target.value })}
            aria-label="Name"
            className="font-display min-w-0 flex-1 bg-transparent text-[1.4rem] outline-none"
          />
        </span>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPickPillar(!pickPillar)}
            className={`flex h-10 items-center gap-1.5 rounded-full px-3.5 font-medium ${p.soft} ${p.text}`}
          >
            {p.emoji} {p.label}
          </button>
          <span className="flex h-10 items-center rounded-full bg-surface px-3.5 font-medium text-muted">{KIND_LABEL[item.kind].label}</span>
        </div>

        {pickPillar && (
          <div className="grid grid-cols-2 gap-2">
            {PILLARS.map((pl) => (
              <button
                key={pl.id}
                type="button"
                onClick={() => {
                  store.updateItem(item.id, { pillar: pl.id });
                  setPickPillar(false);
                }}
                className={`flex h-12 items-center gap-2 rounded-2xl px-3 text-left font-medium ${
                  pl.id === item.pillar ? `${pl.soft} ${pl.text} ring-2 ring-ink` : "bg-surface text-ink"
                }`}
              >
                <span aria-hidden>{pl.emoji}</span> {pl.label}
              </button>
            ))}
          </div>
        )}

        {item.kind === "task" ? (
          <div className="space-y-2">
            <p className="font-semibold text-ink">Tiny steps</p>
            {item.steps.map((s) => (
              <div key={s.id} className={`flex items-center gap-2 rounded-2xl p-1.5 pl-1.5 ${s.done ? p.tint : "bg-surface"}`}>
                <button
                  type="button"
                  aria-pressed={s.done}
                  aria-label={`${s.text}: ${s.done ? "done" : "mark done"}`}
                  onClick={() => store.toggleStep(item.id, s.id)}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${s.done ? p.solid : "border-2 border-zinc-300 bg-white"}`}
                >
                  {s.done && <Check className="h-5 w-5" strokeWidth={3} />}
                </button>
                <span className={`flex-1 ${s.done ? "text-muted line-through" : "text-ink"}`}>{s.text}</span>
                <button
                  type="button"
                  aria-label={`Remove ${s.text}`}
                  onClick={() => store.removeStep(item.id, s.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {item.steps.length === 0 && (
              <button
                type="button"
                onClick={autoSteps}
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-50 font-medium text-brand-700"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                {loading ? "Breaking it down…" : "Break it into tiny steps"}
              </button>
            )}
            <div className="flex gap-2">
              <input
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addStep()}
                placeholder="Add a step"
                aria-label="Add a step"
                className={`${inputCls} !h-12`}
              />
              <button type="button" onClick={addStep} aria-label="Add step" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink text-white">
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => store.toggleItemDay(item.id)}
              className={`${softBtn} w-full ${item.done.length ? "" : "!bg-ink !text-white"}`}
            >
              <Check className="h-5 w-5" /> {item.done.length ? "Mark as not done" : "Mark whole task done"}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Streak", value: itemStreak(item) },
                { label: "This week", value: `${itemThisWeek(item)}/7` },
                { label: "All time", value: item.done.length },
              ].map((s) => (
                <div key={s.label} className={`rounded-3xl p-3 text-center ${p.tint}`}>
                  <p className="font-display text-[1.75rem] leading-tight text-ink tabular-nums">{s.value}</p>
                  <p className="text-sm text-muted">{s.label}</p>
                </div>
              ))}
            </div>

            {item.kind === "goal" && (
              <div className={`rounded-3xl p-4 ${p.tint}`}>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-muted">
                    <span className="font-display text-[1.6rem] text-ink">{item.progress}</span>
                    {item.total ? ` / ${item.total}` : ""} {item.unit}
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={item.total ?? ""}
                    placeholder="Total"
                    aria-label={`Total ${item.unit}`}
                    onChange={(e) => store.updateItem(item.id, { total: parseInt(e.target.value) > 0 ? parseInt(e.target.value) : null })}
                    className="h-10 w-24 rounded-full bg-white px-3 text-right text-ink outline-none"
                  />
                </div>
                {item.total ? <ProgressBar value={item.progress / item.total} color={p.bar} track="bg-white" /> : null}
                <div className="mt-3 grid grid-cols-[auto_1fr] gap-2">
                  <button
                    type="button"
                    onClick={() => bump(-step)}
                    aria-label={`Minus ${step}`}
                    className="flex h-12 w-14 items-center justify-center rounded-full bg-white text-ink"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <button type="button" onClick={() => bump(step)} className="flex h-12 items-center justify-center gap-1.5 rounded-full bg-ink font-medium text-white">
                    <Plus className="h-5 w-5" /> {step} {item.unit}
                  </button>
                </div>
              </div>
            )}

            <div>
              <p className="mb-2 text-sm text-muted">Swipe to see earlier months. Tap any day to fix it.</p>
              <div ref={scroller} className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [scrollbar-width:none]">
                {months.map(({ y, m }) => (
                  <MonthGrid key={`${y}-${m}`} item={item} year={y} month={m} store={store} />
                ))}
              </div>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => {
            if (!confirmDelete) return setConfirmDelete(true);
            store.deleteItem(item.id);
            onDeleted(item);
            onClose();
          }}
          className={`${softBtn} w-full ${confirmDelete ? "!bg-rose-600 !text-white" : "!bg-transparent !text-rose-600"}`}
        >
          <Trash2 className="h-5 w-5" />
          {confirmDelete ? "Tap again to remove" : "Remove"}
        </button>
      </div>
    </Sheet>
  );
}
