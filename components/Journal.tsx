"use client";

import { useEffect, useRef, useState } from "react";
import { FolderPlus, PenLine, Search, Trash2, X } from "lucide-react";
import { HScroll, PageTitle, Sheet, inputCls, primaryBtn } from "./ui";
import { MOODS, PILLARS, PROMPTS, pillarById, type PillarId } from "@/lib/pillars";
import { dateKey, daysAgo, type Entry, type Store } from "@/lib/store";

export type Draft = { id?: string; title?: string; mood?: number | null; folderId?: string | null };

function dayLabel(ts: number) {
  const k = dateKey(new Date(ts));
  if (k === dateKey()) return "Today";
  if (k === dateKey(daysAgo(1))) return "Yesterday";
  return new Date(ts).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

export function Journal({ store, onWrite }: { store: Store; onWrite: (d: Draft) => void }) {
  const { entries, folders } = store.state;
  const [folder, setFolder] = useState<string | "all">("all");
  const [query, setQuery] = useState("");
  const [newFolder, setNewFolder] = useState(false);
  const [confirmFolder, setConfirmFolder] = useState(false);

  const q = query.trim().toLowerCase();
  const shown = entries
    .filter((e) => folder === "all" || e.folderId === folder)
    .filter((e) => !q || `${e.title} ${e.body}`.toLowerCase().includes(q))
    .sort((a, b) => b.createdAt - a.createdAt);

  const groups: { label: string; items: Entry[] }[] = [];
  for (const e of shown) {
    const label = dayLabel(e.createdAt);
    const g = groups.find((x) => x.label === label);
    if (g) g.items.push(e);
    else groups.push({ label, items: [e] });
  }

  const activeFolder = folders.find((f) => f.id === folder);

  return (
    <div className="space-y-4">
      <PageTitle
        title="Journal"
        subtitle="A private place for your thoughts."
        action={
          <button
            type="button"
            onClick={() => onWrite({ folderId: folder === "all" ? null : folder })}
            className="flex h-12 shrink-0 items-center gap-1.5 rounded-full bg-ink px-5 font-medium text-white active:scale-95"
          >
            <PenLine className="h-5 w-5" /> Write
          </button>
        }
      />

      <label className="flex h-12 items-center gap-2 rounded-full bg-white px-4 shadow-soft">
        <Search className="h-5 w-5 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your journal"
          aria-label="Search your journal"
          className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-zinc-400"
        />
      </label>

      <HScroll>
        <FolderChip active={folder === "all"} onClick={() => setFolder("all")}>
          📓 All <span className="opacity-60">{entries.length}</span>
        </FolderChip>
        {folders.map((f) => (
          <FolderChip
            key={f.id}
            active={folder === f.id}
            onClick={() => {
              setFolder(f.id);
              setConfirmFolder(false);
            }}
          >
            {f.emoji} {f.name} <span className="opacity-60">{entries.filter((e) => e.folderId === f.id).length}</span>
          </FolderChip>
        ))}
        <button
          type="button"
          onClick={() => setNewFolder(true)}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-full border-2 border-dashed border-brand-200 px-4 font-medium whitespace-nowrap text-brand-700"
        >
          <FolderPlus className="h-4 w-4" /> Folder
        </button>
      </HScroll>

      {activeFolder && (
        <button
          type="button"
          onClick={() => {
            if (!confirmFolder) return setConfirmFolder(true);
            store.deleteFolder(activeFolder.id);
            setFolder("all");
            setConfirmFolder(false);
          }}
          className={`flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium ${confirmFolder ? "bg-rose-600 text-white" : "text-rose-600"}`}
        >
          <Trash2 className="h-4 w-4" /> {confirmFolder ? "Tap again: entries move to All" : `Delete “${activeFolder.name}” folder`}
        </button>
      )}

      {groups.length === 0 ? (
        <button
          type="button"
          onClick={() => onWrite({ folderId: folder === "all" ? null : folder })}
          className="w-full rounded-[1.75rem] bg-white p-8 text-center shadow-soft"
        >
          <p className="text-4xl" aria-hidden>
            📓
          </p>
          <p className="font-display mt-2 text-[1.4rem] text-ink">{q ? "No matches" : "Nothing here yet"}</p>
          <p className="mt-1 text-muted">{q ? "Try another word." : "Tap to write your first entry. One line is enough."}</p>
        </button>
      ) : (
        groups.map((g) => (
          <section key={g.label} className="space-y-2">
            <h2 className="px-1 pt-1 font-semibold text-muted">{g.label}</h2>
            {g.items.map((e) => {
              const p = e.pillar ? pillarById[e.pillar] : null;
              const f = folders.find((x) => x.id === e.folderId);
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => onWrite({ id: e.id })}
                  className="block w-full rounded-[1.75rem] bg-white p-4 text-left shadow-soft active:scale-[0.99]"
                >
                  <div className="flex items-start gap-3">
                    {e.mood != null && (
                      <span className="text-2xl leading-none" aria-hidden>
                        {MOODS[e.mood]}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="leading-snug font-semibold text-ink">{e.title || e.body.split("\n")[0] || "Untitled"}</p>
                      {(e.title ? e.body : e.body.split("\n").slice(1).join(" ")) && (
                        <p className="mt-0.5 line-clamp-2 text-muted">{e.title ? e.body : e.body.split("\n").slice(1).join(" ")}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-sm">
                        <span className="text-muted">{new Date(e.createdAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span>
                        {p && <span className={`rounded-full px-2 py-0.5 font-medium ${p.soft} ${p.text}`}>{p.emoji} {p.label}</span>}
                        {f && folder === "all" && <span className="rounded-full bg-surface px-2 py-0.5 text-muted">{f.emoji} {f.name}</span>}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </section>
        ))
      )}

      <NewFolderSheet
        open={newFolder}
        onClose={() => setNewFolder(false)}
        onCreate={(name, emoji) => {
          setFolder(store.addFolder(name, emoji));
          setNewFolder(false);
        }}
      />
    </div>
  );
}

function FolderChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 font-medium whitespace-nowrap ${
        active ? "bg-ink text-white" : "bg-white text-ink shadow-soft"
      }`}
    >
      {children}
    </button>
  );
}

const FOLDER_EMOJIS = ["📁", "💭", "🌙", "☀️", "💼", "❤️", "🎯", "🌱", "✨", "🧠", "📚", "🙏"];

function NewFolderSheet({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (name: string, emoji: string) => void }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📁");
  useEffect(() => {
    if (open) {
      setName("");
      setEmoji("📁");
    }
  }, [open]);
  return (
    <Sheet open={open} onClose={onClose} title="New folder">
      <div className="space-y-4">
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && name.trim() && onCreate(name.trim(), emoji)} placeholder="e.g. Dreams, Work wins, Therapy" aria-label="Folder name" className={inputCls} />
        <div className="grid grid-cols-6 gap-2">
          {FOLDER_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`flex aspect-square items-center justify-center rounded-full text-2xl ${e === emoji ? "bg-brand-100 ring-2 ring-brand-500" : "bg-surface"}`}
            >
              {e}
            </button>
          ))}
        </div>
        <button type="button" disabled={!name.trim()} onClick={() => onCreate(name.trim(), emoji)} className={primaryBtn}>
          Create folder
        </button>
      </div>
    </Sheet>
  );
}

/** Full-height writing sheet: mood, optional title, body, tags. */
export function Composer({ draft, store, onClose }: { draft: Draft | null; store: Store; onClose: () => void }) {
  const existing = draft?.id ? store.state.entries.find((e) => e.id === draft.id) : undefined;
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mood, setMood] = useState<number | null>(null);
  const [pillar, setPillar] = useState<PillarId | null>(null);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!draft) return;
    setTitle(existing?.title ?? draft.title ?? "");
    setBody(existing?.body ?? "");
    setMood(existing?.mood ?? draft.mood ?? store.state.moods[store.todayKey] ?? null);
    setPillar(existing?.pillar ?? null);
    setFolderId(existing?.folderId ?? draft.folderId ?? null);
    setConfirmDelete(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const empty = !title.trim() && !body.trim();
  const save = () => {
    if (!empty) store.saveEntry({ title: title.trim(), body: body.trim(), mood, pillar, folderId }, existing?.id);
    onClose();
  };

  const usePrompt = (p: string) => {
    setTitle(p);
    bodyRef.current?.focus();
  };

  return (
    <Sheet open={!!draft} onClose={save} title={existing ? dayLabel(existing.createdAt) : "New entry"} full>
      <div className="flex min-h-[calc(94dvh-7rem)] flex-col gap-4">
        <div className="flex justify-between gap-1" role="radiogroup" aria-label="Mood">
          {MOODS.map((m, i) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mood === i}
              onClick={() => setMood(mood === i ? null : i)}
              className={`flex h-12 flex-1 items-center justify-center rounded-full text-2xl transition-all ${
                mood === i ? "bg-brand-100 ring-2 ring-ink" : mood != null ? "opacity-40" : "bg-surface"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          aria-label="Title"
          className="font-display bg-transparent text-[1.6rem] leading-tight text-ink outline-none placeholder:text-zinc-300"
        />

        {!existing && !title && !body && (
          <HScroll>
            {PROMPTS.slice(0, 5).map((p) => (
              <button key={p} type="button" onClick={() => usePrompt(p)} className="h-10 shrink-0 rounded-full bg-amber-50 px-4 text-[0.95rem] whitespace-nowrap text-ink">
                {p}
              </button>
            ))}
          </HScroll>
        )}

        <textarea
          ref={bodyRef}
          autoFocus={!!existing || !!draft?.title}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Start writing. No rules, no judgement."
          aria-label="Entry"
          className="min-h-[30dvh] w-full flex-1 resize-none bg-transparent text-[1.05rem] leading-relaxed text-ink outline-none placeholder:text-zinc-400"
        />

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted">Relates to</p>
          <HScroll>
            {PILLARS.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={pillar === p.id}
                onClick={() => setPillar(pillar === p.id ? null : p.id)}
                className={`flex h-10 shrink-0 items-center gap-1 rounded-full px-3.5 text-[0.95rem] font-medium whitespace-nowrap ${
                  pillar === p.id ? `${p.soft} ${p.text} ring-2 ring-ink` : "bg-surface text-ink"
                }`}
              >
                {p.emoji} {p.label}
              </button>
            ))}
          </HScroll>
          {store.state.folders.length > 0 && (
            <>
              <p className="pt-1 text-sm font-medium text-muted">Folder</p>
              <HScroll>
                {store.state.folders.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={folderId === f.id}
                    onClick={() => setFolderId(folderId === f.id ? null : f.id)}
                    className={`flex h-10 shrink-0 items-center gap-1 rounded-full px-3.5 text-[0.95rem] font-medium whitespace-nowrap ${
                      folderId === f.id ? "bg-ink text-white" : "bg-surface text-ink"
                    }`}
                  >
                    {f.emoji} {f.name}
                  </button>
                ))}
              </HScroll>
            </>
          )}
        </div>

        <div className="flex gap-2">
          {existing && (
            <button
              type="button"
              aria-label="Delete entry"
              onClick={() => {
                if (!confirmDelete) return setConfirmDelete(true);
                store.deleteEntry(existing.id);
                onClose();
              }}
              className={`flex h-14 shrink-0 items-center justify-center gap-1.5 rounded-full px-5 font-medium ${
                confirmDelete ? "bg-rose-600 text-white" : "bg-surface text-rose-600"
              }`}
            >
              <Trash2 className="h-5 w-5" /> {confirmDelete && "Delete"}
            </button>
          )}
          <button type="button" onClick={save} className={primaryBtn}>
            {empty ? (
              <>
                <X className="h-5 w-5" /> Close
              </>
            ) : (
              "Save entry"
            )}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
