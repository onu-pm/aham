"use client";

import { House, Sprout, ListChecks, CalendarDays, CircleUserRound } from "lucide-react";

export type Tab = "lists" | "plan" | "home" | "grow" | "me";

// Tasks, Plan, Home in the middle, Grow, Me
const tabs: { id: Tab; label: string; icon: typeof House }[] = [
  { id: "lists", label: "Tasks", icon: ListChecks },
  { id: "plan", label: "Plan", icon: CalendarDays },
  { id: "home", label: "Home", icon: House },
  { id: "grow", label: "Grow", icon: Sprout },
  { id: "me", label: "Me", icon: CircleUserRound },
];

export function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="pb-nav pointer-events-none fixed inset-x-0 bottom-0 z-20 px-3" aria-label="Sections">
      <ul className="pointer-events-auto relative mx-auto grid max-w-md grid-cols-5 items-center rounded-full border border-white/60 bg-white/85 p-1.5 shadow-[0_14px_40px_-12px_rgb(40_50_30/0.35)] backdrop-blur-xl md:max-w-lg">
        {/* A soft pill that glides to the active tab */}
        <span
          aria-hidden
          className="absolute top-1.5 bottom-1.5 left-1.5 rounded-full bg-brand-100 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{ width: "calc((100% - 0.75rem) / 5)", transform: `translateX(${tabs.findIndex((t) => t.id === tab) * 100}%)`, opacity: tab === "home" ? 0 : 1 }}
        />
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = id === tab;
          // Home sits in the middle as a raised button
          if (id === "home")
            return (
              <li key={id} className="flex justify-center">
                <button
                  type="button"
                  onClick={() => onChange(id)}
                  aria-current={active ? "page" : undefined}
                  aria-label="Home"
                  className={`relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 active:scale-90 ${
                    active ? "scale-105 bg-ink text-white shadow-[0_8px_20px_-6px_rgb(31_42_34/0.5)]" : "bg-transparent text-muted shadow-none"
                  }`}
                >
                  <Icon key={String(active)} className={`h-6 w-6 ${active ? "animate-pop" : ""}`} strokeWidth={active ? 2.2 : 1.8} />
                </button>
              </li>
            );
          return (
            <li key={id} className="relative">
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={active ? "page" : undefined}
                className={`flex h-[3.4rem] w-full flex-col items-center justify-center gap-0.5 rounded-full text-[0.72rem] font-bold transition-colors duration-300 active:scale-95 ${
                  active ? "text-ink" : "text-muted"
                }`}
              >
                <Icon key={String(active)} className={`h-[1.3rem] w-[1.3rem] ${active ? "animate-pop" : ""}`} strokeWidth={active ? 2.4 : 1.8} />
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
