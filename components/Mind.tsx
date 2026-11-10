"use client";

import { useState } from "react";
import { Shuffle, Trash2 } from "lucide-react";
import { Card, Collapse, PageTitle, SectionLabel, Segmented } from "./ui";
import { MOODS, MOOD_LABELS, PROMPTS } from "@/lib/pillars";
import { dateKey, daysAgo, type Entry, type Store } from "@/lib/store";

function dayLabel(ts: number) {
  const k = dateKey(new Date(ts));
  if (k === dateKey()) return "Today";
  if (k === dateKey(daysAgo(1))) return "Yesterday";
  return new Date(ts).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

export function Mind({ store }: { store: Store }) {
  const { moods, entries } = store.state;
  const [text, setText] = useState("");
  const [promptIdx, setPromptIdx] = useState(new Date().getDate() % PROMPTS.length);
  const [openId, setOpenId] = useState<string | null>(null);
  const todayMood = moods[store.todayKey];

  const save = () => {
    if (!text.trim()) return;
    store.saveEntry({ title: "", body: text.trim(), mood: todayMood ?? null, pillar: null, folderId: null });
    setText("");
  };

  const sorted = [...entries].sort((a, b) => b.createdAt - a.createdAt);
  const groups: { label: string; items: Entry[] }[] = [];
  for (const e of sorted) {
    const label = dayLabel(e.createdAt);
    const g = groups.find((x) => x.label === label);
    if (g) g.items.push(e);
    else groups.push({ label, items: [e] });
  }

  return (
    <div className="space-y-3">
      <PageTitle title="Mind" subtitle="Check in, let it out, notice patterns." />

      <MoodCard store={store} />

      {/* Writing space */}
      <section className="rounded-3xl grad-soft p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="font-extrabold text-ink">What&apos;s on your mind?</p>
          <button
            type="button"
            onClick={() => setPromptIdx((promptIdx + 1) % PROMPTS.length)}
            className="flex h-8 items-center gap-1 rounded-full bg-white/70 px-3 text-[0.8rem] font-bold text-brand-700"
          >
            <Shuffle className="h-3.5 w-3.5" /> Prompt
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder={PROMPTS[promptIdx]}
          aria-label="Write an entry"
          className="w-full resize-none rounded-2xl bg-white/80 p-3.5 leading-relaxed text-ink outline-none placeholder:text-zinc-400 focus:bg-white"
        />
        <Collapse open={text.trim().length > 0}>
          <div className="flex items-center justify-between gap-2 pt-2">
            <span className="text-[0.85rem] text-muted">{todayMood != null ? `Saved with ${MOODS[todayMood]}` : "Private to this device"}</span>
            <button type="button" onClick={save} className="h-10 rounded-full bg-ink px-5 font-bold text-white active:scale-95">
              Save
            </button>
          </div>
        </Collapse>
      </section>

      {groups.length === 0 ? (
        <p className="px-1 pt-2 text-center text-muted">Your entries will collect here. One line is enough.</p>
      ) : (
        groups.map((g) => (
          <section key={g.label} className="space-y-2">
            <SectionLabel>{g.label}</SectionLabel>
            {g.items.map((e) => (
              <EntryCard key={e.id} entry={e} store={store} open={openId === e.id} onToggle={() => setOpenId(openId === e.id ? null : e.id)} />
            ))}
          </section>
        ))
      )}
    </div>
  );
}

function EntryCard({ entry, store, open, onToggle }: { entry: Entry; store: Store; open: boolean; onToggle: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const full = entry.title ? `${entry.title}\n${entry.body}` : entry.body;
  return (
    <div className={`rounded-3xl bg-white shadow-soft ${open ? "ring-2 ring-brand-200" : ""}`}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-start gap-3 p-3.5 text-left">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-lg" aria-hidden>
          {entry.mood != null ? MOODS[entry.mood] : "💭"}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block leading-relaxed whitespace-pre-wrap text-ink ${open ? "hidden" : "line-clamp-3"}`}>{full}</span>
          <span className="mt-0.5 block text-[0.8rem] font-semibold text-muted">
            {new Date(entry.createdAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
          </span>
        </span>
      </button>
      <Collapse open={open}>
        <div className="space-y-2 px-3.5 pb-3.5">
          <textarea
            value={full}
            onChange={(e) => store.saveEntry({ title: "", body: e.target.value, mood: entry.mood, pillar: entry.pillar, folderId: entry.folderId }, entry.id)}
            rows={Math.min(10, Math.max(3, full.split("\n").length + 1))}
            aria-label="Edit entry"
            className="w-full resize-none rounded-2xl bg-surface p-3 leading-relaxed text-ink outline-none focus:bg-white focus:ring-2 focus:ring-brand-300"
          />
          <div className="flex items-center justify-between">
            <span className="text-[0.8rem] text-muted">Changes save as you type</span>
            <button
              type="button"
              onClick={() => (confirm ? store.deleteEntry(entry.id) : setConfirm(true))}
              onBlur={() => setConfirm(false)}
              className={`flex h-9 items-center gap-1 rounded-full px-3.5 text-[0.85rem] font-bold ${confirm ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-600"}`}
            >
              <Trash2 className="h-4 w-4" /> {confirm ? "Sure?" : "Delete"}
            </button>
          </div>
        </div>
      </Collapse>
    </div>
  );
}

/** Today's check-in plus a day-by-day mood view */
export function MoodCard({ store, compact }: { store: Store; compact?: boolean }) {
  const { moods } = store.state;
  const [range, setRange] = useState<"week" | "month">("week");
  const today = moods[store.todayKey];

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = daysAgo(6 - i);
    return { d, m: moods[dateKey(d)] };
  });
  const logged = week.filter((w) => w.m != null);
  const avg = logged.length ? logged.reduce((n, w) => n + (w.m as number), 0) / logged.length : null;

  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  return (
    <Card>
      <p className="mb-2.5 font-extrabold text-ink">{today != null ? `Feeling ${MOOD_LABELS[today].toLowerCase()} today` : "How are you feeling?"}</p>
      <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="Today's mood">
        {MOODS.map((m, i) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={today === i}
            aria-label={MOOD_LABELS[i]}
            onClick={() => store.setMood(today === i ? null : i)}
            className={`flex h-14 flex-col items-center justify-center rounded-2xl transition-all ${
              today === i ? "bg-brand-100 ring-2 ring-ink" : today != null ? "bg-surface opacity-40" : "bg-surface"
            }`}
          >
            <span className={`text-2xl leading-none ${today === i ? "animate-pop" : ""}`} aria-hidden>
              {m}
            </span>
          </button>
        ))}
      </div>

      {!compact && (
        <div className="mt-4 border-t border-line pt-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[0.85rem] font-semibold text-muted">
              {avg == null ? "No check-ins this week yet" : `This week: mostly ${MOODS[Math.round(avg)]} ${MOOD_LABELS[Math.round(avg)].toLowerCase()}`}
            </p>
            <div className="w-36">
              <Segmented
                value={range}
                onChange={setRange}
                options={[
                  { value: "week", label: "Week" },
                  { value: "month", label: "Month" },
                ]}
              />
            </div>
          </div>

          {range === "week" ? (
            <div className="grid h-28 grid-cols-7 items-end gap-2">
              {week.map(({ d, m }) => (
                <div key={d.toISOString()} className="flex h-full flex-col items-center justify-end gap-1">
                  <span className="text-lg leading-none" aria-hidden>
                    {m != null ? MOODS[m] : ""}
                  </span>
                  <div
                    className={`w-full rounded-full transition-all duration-500 ${m != null ? "grad-bar" : "bg-surface"}`}
                    style={{ height: m != null ? `${20 + m * 15}%` : "10%" }}
                    aria-label={`${d.toLocaleDateString(undefined, { weekday: "long" })}: ${m != null ? MOOD_LABELS[m] : "no check-in"}`}
                  />
                  <span className={`text-[0.7rem] font-bold ${dateKey(d) === store.todayKey ? "text-ink" : "text-muted"}`}>
                    {d.toLocaleDateString(undefined, { weekday: "narrow" })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1 text-center">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={i} className="text-[0.7rem] font-bold text-muted">
                  {d}
                </span>
              ))}
              {Array.from({ length: lead }, (_, i) => (
                <span key={`l${i}`} />
              ))}
              {Array.from({ length: days }, (_, i) => {
                const key = dateKey(new Date(now.getFullYear(), now.getMonth(), i + 1, 12));
                const m = moods[key];
                return (
                  <span
                    key={key}
                    title={m != null ? MOOD_LABELS[m] : undefined}
                    className={`flex aspect-square items-center justify-center rounded-full ${m != null ? "bg-brand-50 text-lg" : "text-[0.75rem] font-bold text-zinc-300"} ${
                      key === store.todayKey ? "ring-2 ring-ink" : ""
                    }`}
                  >
                    {m != null ? MOODS[m] : i + 1}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
