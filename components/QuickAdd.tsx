"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Plus, Sparkles, X } from "lucide-react";
import { EmojiTile, HScroll, Segmented, Sheet, primaryBtn } from "./ui";
import { KIND_LABEL, PILLARS, detect, pillarById, tidyTitle, type ItemKind, type PillarId } from "@/lib/pillars";
import { breakDown } from "@/lib/breakdown";
import { dateKey, daysAgo, uid, type Store } from "@/lib/store";

export function QuickAdd({
  open,
  onClose,
  store,
  defaultKind,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  store: Store;
  defaultKind: ItemKind | null;
  onAdded: (msg: string) => void;
}) {
  const [text, setText] = useState("");
  // Manual overrides win over what we detect from the text
  const [pillar, setPillar] = useState<PillarId | null>(null);
  const [kind, setKind] = useState<ItemKind | null>(null);
  const [day, setDay] = useState(dateKey());
  const [time, setTime] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [pickPillar, setPickPillar] = useState(false);
  const [browse, setBrowse] = useState<PillarId>("body");
  const [added, setAdded] = useState<string[]>([]);

  const d = useMemo(() => detect(text), [text]);
  const finalPillar = pillar ?? d.pillar;
  const finalKind = kind ?? (defaultKind === "task" && d.kind === "habit" ? "task" : d.kind);
  const p = pillarById[finalPillar];
  const hasText = text.trim().length > 0;
  const today = dateKey();
  const tomorrow = dateKey(daysAgo(-1));

  useEffect(() => {
    if (!open) return;
    setText("");
    setPillar(null);
    setKind(defaultKind);
    setDay(dateKey());
    setTime("");
    setSteps([]);
    setPickPillar(false);
    setAdded([]);
  }, [open, defaultKind]);

  // Steps from a breakdown belong to the kind they were made for
  useEffect(() => setSteps([]), [finalKind]);

  const save = () => {
    if (!hasText) return;
    store.addItem({
      title: tidyTitle(text),
      emoji: d.emoji,
      pillar: finalPillar,
      kind: finalKind,
      unit: finalKind === "goal" ? (d.unit ?? "steps") : null,
      total: finalKind === "goal" ? d.total : null,
      date: finalKind === "task" ? day : null,
      time: finalKind !== "goal" && time ? time : null,
      remind: finalKind !== "goal" && !!time,
      steps: steps.map((s) => ({ id: uid(), text: s, done: false })),
    });
    onAdded(finalKind === "task" ? `Added to your plan 🗓️` : `Added to ${p.label} ${p.emoji}`);
    onClose();
  };

  const doBreakdown = async () => {
    setLoading(true);
    setSteps((await breakDown(tidyTitle(text), finalKind === "habit" ? "habit" : "task")).steps);
    setLoading(false);
  };

  return (
    <Sheet open={open} onClose={onClose} title={defaultKind === "task" ? "Add to your plan" : "Add something new"}>
      <div className="space-y-4">
        <div className={`flex items-center gap-2 rounded-2xl p-1.5 pl-2 transition-colors ${hasText ? p.tint : "bg-surface"}`}>
          <EmojiTile emoji={hasText ? d.emoji : "✍️"} className="bg-white" />
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            enterKeyHint="done"
            placeholder={defaultKind === "task" ? "e.g. clean my room, call the bank…" : "e.g. read a book, go to the gym…"}
            aria-label="What do you want to add?"
            className="h-10 min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-zinc-400"
          />
          {hasText && (
            <button type="button" onClick={() => setText("")} aria-label="Clear" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {hasText ? (
          <div className="animate-in space-y-3">
            <Segmented value={finalKind} onChange={setKind} options={(Object.keys(KIND_LABEL) as ItemKind[]).map((k) => ({ value: k, label: KIND_LABEL[k].label }))} />

            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setPickPillar(!pickPillar)} className={`flex h-9 items-center gap-1 rounded-full px-3.5 text-[0.9rem] font-bold ${p.soft} ${p.text}`}>
                {p.emoji} {p.label}
              </button>
              <span className="text-[0.85rem] text-muted">{KIND_LABEL[finalKind].hint}</span>
            </div>
            {pickPillar && (
              <div className="grid grid-cols-2 gap-1.5">
                {PILLARS.map((pl) => (
                  <button
                    key={pl.id}
                    type="button"
                    onClick={() => {
                      setPillar(pl.id);
                      setPickPillar(false);
                    }}
                    className={`flex h-10 items-center gap-2 rounded-2xl px-3 text-left text-[0.9rem] font-bold ${pl.id === finalPillar ? `${pl.soft} ${pl.text}` : "bg-surface text-ink"}`}
                  >
                    {pl.emoji} {pl.label}
                  </button>
                ))}
              </div>
            )}

            {finalKind === "task" && (
              <div className="flex gap-1.5">
                {[
                  { k: today, l: "Today" },
                  { k: tomorrow, l: "Tomorrow" },
                ].map((o) => (
                  <button
                    key={o.k}
                    type="button"
                    onClick={() => setDay(o.k)}
                    className={`h-9 rounded-full px-3.5 text-[0.85rem] font-bold ${day === o.k ? "bg-ink text-white" : "bg-surface text-ink"}`}
                  >
                    {o.l}
                  </button>
                ))}
                <input
                  type="date"
                  value={day}
                  min={today}
                  onChange={(e) => e.target.value && setDay(e.target.value)}
                  aria-label="Pick a day"
                  className={`h-9 min-w-0 flex-1 rounded-full px-3 text-[0.85rem] font-bold outline-none ${day !== today && day !== tomorrow ? "bg-ink text-white" : "bg-surface text-muted"}`}
                />
              </div>
            )}

            {finalKind !== "goal" && (
              <label className="flex items-center gap-2 rounded-2xl bg-surface p-1.5 pl-3">
                <span className="flex-1 text-[0.9rem] font-semibold text-ink">{finalKind === "habit" ? "⏰ Daily reminder (optional)" : "⏰ Time & reminder (optional)"}</span>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Time" className="h-9 rounded-full bg-white px-3 text-[0.9rem] outline-none" />
              </label>
            )}

            {finalKind !== "goal" && (
              <div className="rounded-2xl bg-brand-50 p-3">
                {steps.length === 0 ? (
                  <button
                    type="button"
                    onClick={doBreakdown}
                    disabled={loading}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-white text-[0.9rem] font-bold text-brand-700 shadow-sm"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {loading ? "Breaking it down…" : finalKind === "habit" ? "Break into a tiny daily routine" : "Break into micro-tasks"}
                  </button>
                ) : (
                  <ol className="space-y-1">
                    {steps.map((s, i) => (
                      <li key={i} className="flex items-center gap-2 rounded-xl bg-white py-1 pr-1 pl-3 text-[0.95rem]">
                        <span className="font-extrabold text-brand-600">{i + 1}</span>
                        <span className="flex-1 text-ink">{s}</span>
                        <button type="button" aria-label={`Remove ${s}`} onClick={() => setSteps(steps.filter((_, j) => j !== i))} className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400">
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}

            <button type="button" onClick={save} className={primaryBtn}>
              <Plus className="h-5 w-5" strokeWidth={3} /> Add {KIND_LABEL[finalKind].label.toLowerCase()}
            </button>
          </div>
        ) : (
          <>
            <p className="text-[0.9rem] font-bold text-muted">Or tap an idea, no typing needed</p>
            <HScroll>
              {PILLARS.map((pl) => (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => setBrowse(pl.id)}
                  className={`flex h-9 shrink-0 items-center gap-1 rounded-full px-3.5 text-[0.85rem] font-bold whitespace-nowrap ${browse === pl.id ? "bg-ink text-white" : "bg-surface text-ink"}`}
                >
                  {pl.emoji} {pl.label}
                </button>
              ))}
            </HScroll>
            <div className="grid grid-cols-2 gap-2">
              {pillarById[browse].suggestions.map((s) => {
                const isAdded = added.includes(s.title);
                const pl = pillarById[browse];
                return (
                  <button
                    key={s.title}
                    type="button"
                    disabled={isAdded}
                    onClick={() => {
                      store.addItem({ title: s.title, emoji: s.emoji, pillar: browse, kind: s.kind, unit: s.unit ?? null, date: s.kind === "task" ? today : null });
                      setAdded((a) => [...a, s.title]);
                    }}
                    className={`flex min-h-14 items-center gap-2 rounded-2xl p-2 text-left ${isAdded ? pl.soft : pl.tint}`}
                  >
                    <EmojiTile emoji={isAdded ? "✅" : s.emoji} size="sm" className="bg-white" />
                    <span className="min-w-0 flex-1 text-[0.9rem] leading-snug font-bold text-ink">{s.title}</span>
                  </button>
                );
              })}
            </div>
            {added.length > 0 && (
              <button type="button" onClick={onClose} className={primaryBtn}>
                <Check className="h-5 w-5" /> Done · {added.length} added
              </button>
            )}
          </>
        )}
      </div>
    </Sheet>
  );
}
