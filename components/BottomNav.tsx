"use client";

import { House, Sprout, Brain, CalendarDays, CircleUserRound } from "lucide-react";

export type Tab = "plan" | "grow" | "home" | "mind" | "me";

const tabs: { id: Tab; label: string; icon: typeof House }[] = [
  { id: "plan", label: "Plan", icon: CalendarDays },
  { id: "grow", label: "Grow", icon: Sprout },
  { id: "home", label: "Home", icon: House },
  { id: "mind", label: "Mind", icon: Brain },
  { id: "me", label: "Me", icon: CircleUserRound },
];

export function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="pb-nav pointer-events-none fixed inset-x-0 bottom-0 z-20 px-3" aria-label="Sections">
      <ul className="pointer-events-auto mx-auto grid max-w-md grid-cols-5 items-center rounded-full border border-white/60 bg-white/90 p-1.5 shadow-[0_12px_40px_-12px_rgb(60_40_140/0.3)] backdrop-blur-xl md:max-w-lg">
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
                  className={`flex h-14 w-14 items-center justify-center rounded-full shadow-md transition-all active:scale-90 ${
                    active ? "bg-ink text-white" : "bg-brand-100 text-ink"
                  }`}
                >
                  <Icon className="h-6 w-6" strokeWidth={2.2} />
                </button>
              </li>
            );
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={active ? "page" : undefined}
                className={`flex h-[3.4rem] w-full flex-col items-center justify-center gap-0.5 rounded-full text-[0.72rem] font-bold transition-colors ${
                  active ? "text-ink" : "text-muted"
                }`}
              >
                <Icon className="h-[1.3rem] w-[1.3rem]" strokeWidth={active ? 2.4 : 1.8} />
                {label}
                <span className={`h-1 w-1 rounded-full ${active ? "bg-brand-500" : "bg-transparent"}`} />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
