"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { primaryBtn } from "./ui";
import { pillarById, type PillarId } from "@/lib/pillars";
import type { Store } from "@/lib/store";

// A small, varied starter set; every pick is one tap and can be removed later
const STARTERS: { pillar: PillarId; title: string }[] = [
  { pillar: "body", title: "Drink water" },
  { pillar: "mind", title: "Breathing break" },
  { pillar: "learn", title: "Read 10 pages" },
  { pillar: "body", title: "Walk 10 min" },
  { pillar: "confidence", title: "Daily affirmation" },
  { pillar: "home", title: "Make the bed" },
  { pillar: "selfcare", title: "Take my meds" },
  { pillar: "focus", title: "Plan my day" },
];

export function Welcome({ store }: { store: Store }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [picked, setPicked] = useState<string[]>([]);

  const finish = () => {
    for (const s of STARTERS.filter((x) => picked.includes(x.title))) {
      const sug = pillarById[s.pillar].suggestions.find((x) => x.title === s.title)!;
      store.addItem({ title: sug.title, emoji: sug.emoji, pillar: s.pillar, kind: sug.kind });
    }
    store.setProfile({ name: name.trim(), onboarded: true });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[linear-gradient(to_bottom,var(--color-brand-100),var(--color-canvas)_60%)]">
      <div className="pt-safe pb-nav mx-auto flex min-h-full max-w-md flex-col px-6">
        {step === 0 ? (
          <div key="intro" className="animate-in flex flex-1 flex-col justify-center py-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="" className="h-20 w-20 rounded-3xl shadow-soft" />
            <h1 className="mt-6 text-[2rem] leading-tight font-extrabold tracking-tight text-ink">Welcome to Aham</h1>
            <p className="mt-2 text-lg text-muted">A calm place to build habits, plan your day and look after your mind. One tiny step at a time.</p>
            <ul className="mt-8 space-y-3">
              {[
                ["🗓️", "Plan", "Your day, with gentle reminders"],
                ["🌱", "Grow", "Habits and goals that break into tiny steps"],
                ["💭", "Mind", "Check in on your mood and let thoughts out"],
              ].map(([e, t, d]) => (
                <li key={t} className="flex items-center gap-3 rounded-3xl bg-white p-3 shadow-soft">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-xl" aria-hidden>
                    {e}
                  </span>
                  <span>
                    <span className="block font-extrabold text-ink">{t}</span>
                    <span className="block text-[0.9rem] text-muted">{d}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[0.85rem] text-muted">🔒 Everything stays on your phone. No account, no ads.</p>
            <button type="button" onClick={() => setStep(1)} className={`${primaryBtn} mt-6`}>
              Let&apos;s begin <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div key="setup" className="animate-in flex flex-1 flex-col py-10">
            <h1 className="text-[1.75rem] leading-tight font-extrabold tracking-tight text-ink">What should we call you?</h1>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              aria-label="Your name"
              className="mt-3 h-12 w-full rounded-2xl bg-white px-4 text-ink shadow-soft outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-brand-300"
            />

            <h2 className="mt-8 text-xl font-extrabold text-ink">Pick a few small habits</h2>
            <p className="mt-1 text-muted">Start with one to three. You can add or change anything later.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {STARTERS.map((s) => {
                const p = pillarById[s.pillar];
                const sug = p.suggestions.find((x) => x.title === s.title)!;
                const on = picked.includes(s.title);
                return (
                  <button
                    key={s.title}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setPicked(on ? picked.filter((x) => x !== s.title) : [...picked, s.title])}
                    className={`flex min-h-14 items-center gap-2 rounded-2xl p-2.5 text-left transition-all ${on ? `${p.soft} ring-2 ring-ink` : "bg-white shadow-soft"}`}
                  >
                    <span className="text-xl" aria-hidden>
                      {on ? "✅" : sug.emoji}
                    </span>
                    <span className="text-[0.9rem] leading-snug font-bold text-ink">{s.title}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-auto pt-8">
              <button type="button" onClick={finish} className={primaryBtn}>
                <Check className="h-5 w-5" /> {picked.length ? `Start with ${picked.length}` : "Skip for now"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
