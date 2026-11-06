"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Loader2, Plus, Sparkles, X, PenLine } from "lucide-react";
import { EmojiTile, HScroll, Sheet, primaryBtn } from "./ui";
import { KIND_LABEL, PILLARS, detect, pillarById, tidyTitle, type ItemKind, type PillarId } from "@/lib/pillars";
import { breakDown } from "@/lib/breakdown";
import type { Store } from "@/lib/store";

const EMOJIS = ["🌱", "💧", "🧘", "🏃", "🏋️", "🗣️", "📖", "🎓", "💻", "🎨", "🎸", "🧹", "🛒", "📞", "💰", "💊", "🦷", "😴", "🙏", "✨"];

export function QuickAdd({
  open,
  onClose,
  store,
  onAdded,
  onJournal,
}: {
  open: boolean;
  onClose: () => void;
  store: Store;
  onAdded: (msg: string) => void;
  onJournal: () => void;
}) {
  const [text, setText] = useState("");
  // Manual overrides win over what we detect from the text
  const [pillar, setPillar] = useState<PillarId | null>(null);
  const [emoji, setEmoji] = useState<string | null>(null);
  const [kind, setKind] = useState<ItemKind | null>(null);
  const [total, setTotal] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<"pillar" | "emoji" | null>(null);
  const [browse, setBrowse] = useState<PillarId>("body");
  const [added, setAdded] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const d = useMemo(() => detect(text), [text]);
  const finalPillar = pillar ?? d.pillar;
  const finalEmoji = emoji ?? d.emoji;
  const finalKind = kind ?? d.kind;
  const p = pillarById[finalPillar];
  const hasText = text.trim().length > 0;

  useEffect(() => {
    if (!open) return;
    setText("");
    setPillar(null);
    setEmoji(null);
    setKind(null);
    setTotal("");
    setSteps([]);
    setEditing(null);
    setAdded([]);
  }, [open]);

  const save = () => {
    if (!hasText) return;
    const t = parseInt(total) || d.total;
    store.addItem({
      title: tidyTitle(text),
      emoji: finalEmoji,
      pillar: finalPillar,
      kind: finalKind,
      unit: finalKind === "goal" ? (d.unit ?? "steps") : null,
      total: finalKind === "goal" && t ? t : null,
      steps: steps.map((s) => ({ id: Math.random().toString(36).slice(2), text: s, done: false })),
    });
    onAdded(`Added to ${p.label} ${p.emoji}`);
    onClose();
  };

  const quickAdd = (s: (typeof PILLARS)[number]["suggestions"][number], pid: PillarId) => {
    store.addItem({ title: s.title, emoji: s.emoji, pillar: pid, kind: s.kind, unit: s.unit ?? null });
    setAdded((a) => [...a, s.title]);
  };

  const doBreakdown = async () => {
    setLoading(true);
    const r = await breakDown(tidyTitle(text));
    setSteps(r.steps);
    setKind("task");
    setLoading(false);
  };

  return (
    <Sheet open={open} onClose={onClose} title="What do you want to grow?">
      <div className="space-y-5">
        {/* Type anything */}
        <div className={`flex items-center gap-2 rounded-[1.5rem] p-2 pl-2.5 transition-colors ${hasText ? p.tint : "bg-surface"}`}>
          <button
            type="button"
            onClick={() => setEditing(editing === "emoji" ? null : "emoji")}
            aria-label="Change icon"
            className="shrink-0"
          >
            <EmojiTile emoji={hasText ? finalEmoji : "✍️"} className="bg-white" />
          </button>
          <input
            ref={inputRef}
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            enterKeyHint="done"
            placeholder="e.g. read a book, go to the gym…"
            aria-label="What do you want to add?"
            className="h-12 min-w-0 flex-1 bg-transparent text-[1.05rem] text-ink outline-none placeholder:text-zinc-400"
          />
          {hasText && (
            <button type="button" onClick={() => setText("")} aria-label="Clear" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {editing === "emoji" && (
          <div className="grid grid-cols-10 gap-1">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => {
                  setEmoji(e);
                  setEditing(null);
                }}
                className={`flex aspect-square items-center justify-center rounded-full text-xl ${e === finalEmoji ? "bg-brand-100 ring-2 ring-brand-500" : ""}`}
              >
                {e}
              </button>
            ))}
          </div>
        )}

        {hasText ? (
          <>
            {/* What we understood; every chip is one tap to change */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted">Aham sorted this for you. Tap to change.</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(editing === "pillar" ? null : "pillar")}
                  className={`flex h-11 items-center gap-1.5 rounded-full px-4 font-medium ${p.soft} ${p.text}`}
                >
                  {p.emoji} {p.label}
                </button>
                <div className="flex h-11 rounded-full bg-surface p-1">
                  {(Object.keys(KIND_LABEL) as ItemKind[]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={k === finalKind}
                      onClick={() => setKind(k)}
                      className={`rounded-full px-3.5 text-[0.95rem] font-medium ${k === finalKind ? "bg-white text-ink shadow-sm" : "text-muted"}`}
                    >
                      {KIND_LABEL[k].label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted">{KIND_LABEL[finalKind].hint}</p>
            </div>

            {editing === "pillar" && (
              <div className="grid grid-cols-2 gap-2">
                {PILLARS.map((pl) => (
                  <button
                    key={pl.id}
                    type="button"
                    onClick={() => {
                      setPillar(pl.id);
                      setEditing(null);
                    }}
                    className={`flex h-12 items-center gap-2 rounded-2xl px-3 text-left font-medium ${
                      pl.id === finalPillar ? `${pl.soft} ${pl.text} ring-2 ring-ink` : "bg-surface text-ink"
                    }`}
                  >
                    <span aria-hidden>{pl.emoji}</span> {pl.label}
                  </button>
                ))}
              </div>
            )}

            {finalKind === "goal" && (
              <label className="flex items-center gap-3 rounded-2xl bg-surface px-4">
                <span className="text-muted">Total {d.unit ?? "steps"}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={total || (d.total ?? "")}
                  onChange={(e) => setTotal(e.target.value)}
                  placeholder="optional"
                  className="h-14 min-w-0 flex-1 bg-transparent text-right text-ink outline-none placeholder:text-zinc-400"
                />
              </label>
            )}

            {finalKind === "task" && (
              <div className="rounded-[1.5rem] bg-brand-50 p-4">
                {steps.length === 0 ? (
                  <button
                    type="button"
                    onClick={doBreakdown}
                    disabled={loading}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white font-medium text-brand-700 shadow-sm active:scale-[0.98]"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                    {loading ? "Breaking it down…" : "Break it into tiny steps"}
                  </button>
                ) : (
                  <>
                    <p className="mb-2 font-medium text-ink">Tiny steps</p>
                    <ol className="space-y-1.5">
                      {steps.map((s, i) => (
                        <li key={i} className="flex items-center gap-2 rounded-2xl bg-white py-1.5 pr-1.5 pl-3">
                          <span className="text-sm font-semibold text-brand-600">{i + 1}</span>
                          <span className="flex-1 text-ink">{s}</span>
                          <button
                            type="button"
                            aria-label={`Remove step ${s}`}
                            onClick={() => setSteps(steps.filter((_, j) => j !== i))}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-muted"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ol>
                  </>
                )}
              </div>
            )}

            <button type="button" onClick={save} className={primaryBtn}>
              <Plus className="h-5 w-5" /> Add {KIND_LABEL[finalKind].label.toLowerCase()}
            </button>
          </>
        ) : (
          <>
            {/* No typing needed: tap an idea to add it */}
            <div>
              <p className="mb-2 font-medium text-ink">Or tap an idea to add it</p>
              <HScroll>
                {PILLARS.map((pl) => (
                  <button
                    key={pl.id}
                    type="button"
                    onClick={() => setBrowse(pl.id)}
                    className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[0.95rem] font-medium whitespace-nowrap ${
                      browse === pl.id ? "bg-ink text-white" : "bg-surface text-ink"
                    }`}
                  >
                    <span aria-hidden>{pl.emoji}</span> {pl.label}
                  </button>
                ))}
              </HScroll>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {pillarById[browse].suggestions.map((s) => {
                const isAdded = added.includes(s.title);
                const pl = pillarById[browse];
                return (
                  <button
                    key={s.title}
                    type="button"
                    disabled={isAdded}
                    onClick={() => quickAdd(s, browse)}
                    className={`flex min-h-[4.25rem] items-center gap-2.5 rounded-3xl p-2.5 text-left transition-colors ${isAdded ? pl.soft : pl.tint}`}
                  >
                    <EmojiTile emoji={isAdded ? "✅" : s.emoji} size="sm" className="bg-white" />
                    <span className="min-w-0 flex-1 text-[0.95rem] leading-snug font-medium text-ink">{s.title}</span>
                  </button>
                );
              })}
            </div>
            {added.length > 0 && (
              <button type="button" onClick={onClose} className={primaryBtn}>
                <Check className="h-5 w-5" /> Done · {added.length} added
              </button>
            )}
            <button
              type="button"
              onClick={onJournal}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full font-medium text-brand-700 active:bg-brand-50"
            >
              <PenLine className="h-5 w-5" /> Write in my journal instead
            </button>
          </>
        )}
      </div>
    </Sheet>
  );
}
