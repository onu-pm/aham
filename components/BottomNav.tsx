"use client";

import { House, Sprout, NotebookPen, CircleUserRound, Plus } from "lucide-react";

export type Tab = "home" | "grow" | "journal" | "me";

const left: { id: Tab; label: string; icon: typeof House }[] = [
  { id: "home", label: "Today", icon: House },
  { id: "grow", label: "Grow", icon: Sprout },
];
const right: { id: Tab; label: string; icon: typeof House }[] = [
  { id: "journal", label: "Journal", icon: NotebookPen },
  { id: "me", label: "Me", icon: CircleUserRound },
];

export function BottomNav({ tab, onChange, onAdd }: { tab: Tab; onChange: (t: Tab) => void; onAdd: () => void }) {
  const item = ({ id, label, icon: Icon }: (typeof left)[number]) => {
    const active = id === tab;
    return (
      <li key={id}>
        <button
          type="button"
          onClick={() => onChange(id)}
          aria-current={active ? "page" : undefined}
          className={`flex h-[3.6rem] w-full flex-col items-center justify-center gap-0.5 rounded-full text-[0.75rem] transition-colors ${
            active ? "bg-brand-100 font-semibold text-ink" : "text-muted"
          }`}
        >
          <Icon className="h-[1.35rem] w-[1.35rem]" strokeWidth={active ? 2.3 : 1.8} />
          {label}
        </button>
      </li>
    );
  };

  return (
    <nav className="pb-nav pointer-events-none fixed inset-x-0 bottom-0 z-20 px-3" aria-label="Sections">
      <ul className="pointer-events-auto mx-auto grid max-w-md grid-cols-5 items-center rounded-full border border-white/60 bg-white/85 p-1.5 shadow-[0_12px_40px_-12px_rgb(60_40_140/0.3)] backdrop-blur-xl md:max-w-lg">
        {left.map(item)}
        <li className="flex justify-center">
          <button
            type="button"
            onClick={onAdd}
            aria-label="Add something new"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white shadow-lg transition-transform active:scale-90"
          >
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </button>
        </li>
        {right.map(item)}
      </ul>
    </nav>
  );
}
