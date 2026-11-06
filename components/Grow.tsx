"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, Chip, HScroll, PageTitle, SectionLabel, primaryBtn } from "./ui";
import { GrowItem } from "./ItemCard";
import { PILLARS, type PillarId } from "@/lib/pillars";
import type { Item, Store } from "@/lib/store";

export function Grow({
  store,
  onAdd,
  openId,
  setOpenId,
  onDeleted,
}: {
  store: Store;
  onAdd: () => void;
  openId: string | null;
  setOpenId: (id: string | null) => void;
  onDeleted: (item: Item) => void;
}) {
  const [filter, setFilter] = useState<PillarId | "all">("all");
  // Grow is for what repeats or builds over time; one-off tasks live in Plan
  const all = store.state.items.filter((i) => i.kind !== "task");
  const used = PILLARS.filter((p) => all.some((i) => i.pillar === p.id));
  const shown = all.filter((i) => filter === "all" || i.pillar === filter);
  const groups = PILLARS.map((p) => ({ p, items: shown.filter((i) => i.pillar === p.id) })).filter((g) => g.items.length);

  const card = (i: Item) => (
    <GrowItem key={i.id} item={i} store={store} open={openId === i.id} onToggle={() => setOpenId(openId === i.id ? null : i.id)} onDeleted={onDeleted} />
  );

  return (
    <div className="space-y-3">
      <PageTitle
        title="Grow"
        subtitle="Habits and goals. Tap one to open its calendar."
        action={
          <button type="button" onClick={onAdd} className="flex h-10 shrink-0 items-center gap-1 rounded-full bg-ink px-4 font-bold text-white active:scale-95">
            <Plus className="h-4 w-4" strokeWidth={3} /> Add
          </button>
        }
      />

      {used.length > 1 && (
        <HScroll>
          <Chip active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </Chip>
          {used.map((p) => (
            <Chip key={p.id} active={filter === p.id} onClick={() => setFilter(p.id)}>
              {p.emoji} {p.label}
            </Chip>
          ))}
        </HScroll>
      )}

      {all.length === 0 ? (
        <Card className="py-8 text-center">
          <p className="text-4xl" aria-hidden>
            🌱
          </p>
          <p className="mt-2 text-lg font-extrabold text-ink">Start with one small thing</p>
          <p className="mt-1 text-muted">Add a habit or a goal. Aham sorts it into a pillar for you.</p>
          <button type="button" onClick={onAdd} className={`${primaryBtn} mt-5`}>
            <Plus className="h-5 w-5" /> Add something
          </button>
        </Card>
      ) : (
        <>
          {groups.map(({ p, items }) => (
            <section key={p.id} className="space-y-2">
              <SectionLabel>
                {p.emoji} {p.label}
              </SectionLabel>
              {items.map(card)}
            </section>
          ))}
        </>
      )}
    </div>
  );
}
