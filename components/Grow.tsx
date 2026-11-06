"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Card, HScroll, PageTitle, primaryBtn } from "./ui";
import { ItemRow } from "./ItemSheet";
import { PILLARS, pillarById, type PillarId } from "@/lib/pillars";
import { dateKey, daysAgo, itemsForDay, type Store } from "@/lib/store";

const DAYS_BACK = 60;

function DateStrip({ selected, onSelect, store }: { selected: string; onSelect: (k: string) => void; store: Store }) {
  const ref = useRef<HTMLDivElement>(null);
  const active = new Set<string>();
  store.state.items.forEach((i) => i.done.forEach((k) => active.add(k)));

  // Start scrolled to today, at the right edge
  useLayoutEffect(() => {
    if (ref.current) ref.current.scrollLeft = ref.current.scrollWidth;
  }, []);

  return (
    <div ref={ref} className="-mx-4 flex snap-x gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" aria-label="Pick a day">
      {Array.from({ length: DAYS_BACK + 1 }, (_, i) => {
        const d = daysAgo(DAYS_BACK - i);
        const key = dateKey(d);
        const isSel = key === selected;
        const isToday = i === DAYS_BACK;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            aria-pressed={isSel}
            aria-label={d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            className={`flex h-[4.5rem] w-[3.25rem] shrink-0 snap-end flex-col items-center justify-center gap-0.5 rounded-full transition-colors ${
              isSel ? "bg-ink text-white" : "bg-white text-ink shadow-soft"
            }`}
          >
            <span className={`text-xs ${isSel ? "text-white/70" : "text-muted"}`}>
              {isToday ? "Today" : d.toLocaleDateString(undefined, { weekday: "short" })}
            </span>
            <span className="text-[1.1rem] font-semibold">{d.getDate()}</span>
            <span className={`h-1.5 w-1.5 rounded-full ${active.has(key) ? (isSel ? "bg-brand-300" : "bg-brand-500") : "bg-transparent"}`} />
          </button>
        );
      })}
    </div>
  );
}

export function Grow({ store, onAdd, onOpen }: { store: Store; onAdd: () => void; onOpen: (id: string, dayKey: string) => void }) {
  const [day, setDay] = useState(store.todayKey);
  const [filter, setFilter] = useState<PillarId | "all">("all");

  const all = store.state.items;
  const visible = itemsForDay(all, day, store.todayKey).filter((i) => filter === "all" || i.pillar === filter);
  const used = PILLARS.filter((p) => all.some((i) => i.pillar === p.id));
  const groups = PILLARS.map((p) => ({ p, items: visible.filter((i) => i.pillar === p.id) })).filter((g) => g.items.length);
  const isToday = day === store.todayKey;
  const label = isToday ? "Today" : new Date(day + "T12:00").toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });

  return (
    <div className="space-y-4">
      <PageTitle
        title="Grow"
        subtitle={`${all.length} thing${all.length === 1 ? "" : "s"} across ${used.length} pillar${used.length === 1 ? "" : "s"}`}
        action={
          <button type="button" onClick={onAdd} className="flex h-12 shrink-0 items-center gap-1.5 rounded-full bg-ink px-5 font-medium text-white active:scale-95">
            <Plus className="h-5 w-5" /> Add
          </button>
        }
      />

      <DateStrip selected={day} onSelect={setDay} store={store} />

      {used.length > 1 && (
        <HScroll>
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </FilterChip>
          {used.map((p) => (
            <FilterChip key={p.id} active={filter === p.id} onClick={() => setFilter(p.id)}>
              <span aria-hidden>{p.emoji}</span> {p.label}
            </FilterChip>
          ))}
        </HScroll>
      )}

      {!isToday && <p className="px-1 text-muted">Viewing {label}. Tap a circle to fix a missed check-in.</p>}

      {all.length === 0 ? (
        <Card className="text-center">
          <p className="text-5xl" aria-hidden>
            🌱
          </p>
          <p className="font-display mt-3 text-[1.5rem] text-ink">Start with one small thing</p>
          <p className="mt-1 text-muted">Type anything you want to grow. Aham sorts it for you.</p>
          <button type="button" onClick={onAdd} className={`${primaryBtn} mt-5`}>
            <Plus className="h-5 w-5" /> Add something
          </button>
        </Card>
      ) : groups.length === 0 ? (
        <p className="rounded-3xl bg-white p-6 text-center text-muted shadow-soft">Nothing here for {label.toLowerCase()}.</p>
      ) : (
        groups.map(({ p, items }) => (
          <section key={p.id} className="space-y-2">
            <h2 className="flex items-center gap-2 px-1 pt-1 font-semibold text-ink">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${p.soft}`} aria-hidden>
                {p.emoji}
              </span>
              {p.label}
              <span className="font-normal text-muted">· {items.filter((i) => i.done.includes(day)).length}/{items.length}</span>
            </h2>
            {items.map((item) => (
              <ItemRow key={item.id} item={item} dayKey={day} store={store} onOpen={() => onOpen(item.id, day)} />
            ))}
          </section>
        ))
      )}

      {all.length > 0 && <PillarBalance store={store} />}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-[0.95rem] font-medium whitespace-nowrap ${
        active ? "bg-ink text-white" : "bg-white text-ink shadow-soft"
      }`}
    >
      {children}
    </button>
  );
}

/** This week's check-ins per pillar, a gentle wheel-of-life */
export function PillarBalance({ store }: { store: Store }) {
  const weekKeys = new Set(Array.from({ length: 7 }, (_, i) => dateKey(daysAgo(i))));
  const rows = PILLARS.map((p) => {
    const items = store.state.items.filter((i) => i.pillar === p.id);
    const count = items.reduce((n, i) => n + i.done.filter((k) => weekKeys.has(k)).length, 0);
    return { p, count, has: items.length > 0 };
  }).filter((r) => r.has);
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <Card title="This week's balance">
      <ul className="space-y-3">
        {rows.map(({ p, count }) => (
          <li key={p.id} className="flex items-center gap-3">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${p.soft}`} aria-hidden>
              {p.emoji}
            </span>
            <span className="w-28 shrink-0 truncate font-medium text-ink">{p.label}</span>
            <span className="h-3 flex-1 overflow-hidden rounded-full bg-surface">
              <span className={`block h-full rounded-full ${p.bar}`} style={{ width: `${(count / max) * 100}%` }} />
            </span>
            <span className="w-6 text-right text-muted tabular-nums">{count}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
