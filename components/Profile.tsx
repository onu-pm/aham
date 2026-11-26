"use client";

import { useRef, useState, type ReactNode } from "react";
import { Bell, ChevronRight, Cloud, CloudOff, Download, LogOut, Pencil, RotateCcw, Shield, Trash2, Upload } from "lucide-react";
import { isNative, shareBackup } from "@/lib/native";
import { activeDays, parseState, showingUpStreak, type Store } from "@/lib/store";
import { authMessage, type Auth } from "@/lib/auth";
import { forgetLocalAccount, type SyncStatus } from "@/lib/sync";

const AVATARS = ["🌱", "🦊", "🐢", "🦉", "🐝", "🌻", "🌙", "⭐", "🐳", "🦋", "🍄", "🐼"];

export function Profile({
  store,
  notify,
  onEnableNotify,
  auth,
  syncStatus,
}: {
  store: Store;
  notify: NotificationPermission | "unsupported";
  onEnableNotify: () => void;
  auth: Auth;
  syncStatus: SyncStatus;
}) {
  const session = auth.state.status === "signedIn" ? auth.state.session : null;
  const { profile, items, lists } = store.state;
  const [picking, setPicking] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [confirm, setConfirm] = useState<null | "reset" | "delete" | "delete2">(null);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const restore = async (file: File) => {
    try {
      const next = parseState(JSON.parse(await file.text()));
      if (!next) return setMsg("That file isn't an Aham backup.");
      if (!window.confirm("Replace everything on this phone with this backup?")) return;
      store.replaceAll(next);
      setMsg(`Restored ${next.items.length} habits and plans and ${next.lists.length} lists.`);
    } catch {
      setMsg("Couldn't read that file.");
    }
  };

  const exportData = async () => {
    const json = JSON.stringify(store.state, null, 2);
    const filename = `aham-backup-${new Date().toISOString().slice(0, 10)}.json`;
    if (isNative()) return shareBackup(json, filename).catch(() => setMsg("Backup was cancelled."));
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const checkIns = items.filter((i) => i.kind !== "task").reduce((n, i) => n + i.done.length, 0);
  const tasksTicked = lists.reduce((n, l) => n + l.items.filter((x) => x.done).length, 0);
  const plansDone = items.filter((i) => i.kind === "task" && i.done.length).length;

  const badges = [
    { emoji: "🌱", name: "First check-in", got: checkIns > 0 },
    { emoji: "📝", name: "A full list", got: lists.some((l) => l.items.length > 0 && l.items.every((x) => x.done)) },
    { emoji: "🧩", name: "Tiny steps", got: items.some((i) => i.kind === "task" && i.steps.length > 0 && i.done.length > 0) },
    { emoji: "🔥", name: "7 days in a row", got: showingUpStreak(store.state) >= 7 },
    { emoji: "🌳", name: "Grew a tree", got: items.some((i) => i.kind === "habit" && i.done.length >= 21) },
    { emoji: "🏅", name: "Reached a goal", got: items.some((i) => i.kind === "goal" && i.total && i.progress >= i.total) },
  ];

  return (
    <div className="stagger pb-4">
      {/* Who you are */}
      <header className="flex flex-col items-center px-4 pt-8 text-center">
        <button type="button" onClick={() => setPicking(!picking)} aria-label="Change avatar" className="press relative">
          <span className="flex h-24 w-24 items-center justify-center rounded-full grad-warm text-[3rem] shadow-soft ring-4 ring-white">
            <span className="animate-float inline-block">{profile.avatar}</span>
          </span>
          <span className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white ring-4 ring-canvas">
            <Pencil className="h-3.5 w-3.5" />
          </span>
        </button>

        {picking && (
          <div className="animate-in mt-4 grid grid-cols-6 gap-1.5" role="radiogroup" aria-label="Avatar">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                role="radio"
                aria-checked={a === profile.avatar}
                onClick={() => (store.setProfile({ avatar: a }), setPicking(false))}
                className={`flex h-11 w-11 items-center justify-center rounded-full text-xl transition-transform active:scale-90 ${a === profile.avatar ? "bg-brand-100 ring-2 ring-brand-500" : "bg-white"}`}
              >
                {a}
              </button>
            ))}
          </div>
        )}

        {editingName ? (
          <input
            autoFocus
            value={profile.name}
            onChange={(e) => store.setProfile({ name: e.target.value })}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
            placeholder="Your name"
            aria-label="Your name"
            className="mt-4 w-56 border-b-2 border-brand-300 bg-transparent pb-1 text-center font-display text-[1.6rem] font-medium text-ink outline-none"
          />
        ) : (
          <button type="button" onClick={() => setEditingName(true)} className="mt-4 flex items-center gap-1.5">
            <span className="font-display text-[1.6rem] leading-tight font-medium text-ink">{profile.name || "Add your name"}</span>
            <Pencil className="h-3.5 w-3.5 text-stone-400" />
          </button>
        )}
        {session?.user.email && <p className="mt-0.5 text-[0.85rem] text-muted">{session.user.email}</p>}
        {session && (
          <p className={`mt-2 flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.72rem] font-semibold ${syncStatus === "offline" ? "bg-ochre-50 text-ochre-700" : "bg-moss-50 text-moss-700"}`}>
            {syncStatus === "offline" ? <CloudOff className="h-3 w-3" /> : <Cloud className="h-3 w-3" />}
            {syncStatus === "syncing" ? "Saving…" : syncStatus === "offline" ? "Offline · saves when you're back" : "Saved to your account"}
          </p>
        )}
      </header>

      {/* Your journey, in numbers */}
      <div className="mx-auto mt-6 grid max-w-sm grid-cols-4 divide-x divide-line">
        {[
          { v: activeDays(store.state), l: "Days" },
          { v: checkIns, l: "Habits" },
          { v: tasksTicked, l: "Tasks" },
          { v: plansDone, l: "Plans" },
        ].map((x) => (
          <div key={x.l} className="text-center">
            <p className="font-display text-[1.35rem] font-medium text-ink tabular-nums">{x.v}</p>
            <p className="text-[0.72rem] text-muted">{x.l}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      <p className="mt-7 px-1 text-[0.72rem] font-semibold tracking-wider text-muted uppercase">Badges</p>
      <div className="no-scrollbar -mx-4 mt-2 flex gap-3 overflow-x-auto px-4 pb-1">
        {badges.map((b) => (
          <div key={b.name} className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1 text-center">
            <span className={`flex h-14 w-14 items-center justify-center rounded-full text-[1.6rem] ${b.got ? "grad-badge shadow-soft" : "bg-surface opacity-40 grayscale"}`} aria-hidden>
              {b.emoji}
            </span>
            <span className={`text-[0.68rem] leading-tight ${b.got ? "font-semibold text-ink" : "text-muted"}`}>{b.name}</span>
          </div>
        ))}
      </div>

      {/* Settings: a plain list */}
      <Group title="Settings">
        <Row
          icon={<Bell className="h-4 w-4" />}
          label="Reminders"
          hint={notify === "granted" ? "On" : notify === "denied" ? "Blocked in phone settings" : notify === "unsupported" ? "In-app only" : "Off"}
          action={
            notify === "default" ? (
              <button type="button" onClick={onEnableNotify} className="h-8 rounded-full bg-ink px-3.5 text-[0.8rem] font-semibold text-white">
                Turn on
              </button>
            ) : undefined
          }
        />
      </Group>

      <Group title="Your data">
        <Row icon={<Download className="h-4 w-4" />} label="Back up to a file" onClick={exportData} />
        <Row icon={<Upload className="h-4 w-4" />} label="Restore from a file" onClick={() => fileRef.current?.click()} />
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) restore(f);
            e.target.value = "";
          }}
        />
        <Row
          icon={<RotateCcw className="h-4 w-4" />}
          label={confirm === "reset" ? "Tap again to erase everything" : "Start fresh"}
          danger={confirm === "reset"}
          onClick={() => {
            if (confirm !== "reset") return setConfirm("reset");
            store.resetAll();
            setConfirm(null);
          }}
        />
        {msg && <p className="px-1 py-2 text-[0.82rem] font-semibold text-brand-700">{msg}</p>}
      </Group>

      <Group title="About">
        <Row icon={<Shield className="h-4 w-4" />} label="Privacy policy" href="https://github.com/onu-pm/aham/blob/main/PRIVACY.md" />
      </Group>

      {session && (
        <Group title="Account">
          <Row
            icon={<LogOut className="h-4 w-4" />}
            label="Sign out"
            onClick={async () => {
              await auth.signOut();
              forgetLocalAccount(store);
            }}
          />
          <Row
            icon={<Trash2 className="h-4 w-4" />}
            label={confirm === "delete2" ? "Yes, delete everything" : confirm === "delete" ? "Delete account and all data?" : "Delete account"}
            danger
            onClick={async () => {
              if (confirm !== "delete" && confirm !== "delete2") return setConfirm("delete");
              if (confirm === "delete") return setConfirm("delete2");
              try {
                await auth.deleteAccount();
                forgetLocalAccount(store);
              } catch (e) {
                setMsg(authMessage(e));
              }
            }}
          />
          {(confirm === "delete" || confirm === "delete2") && (
            <p className="px-1 py-2 text-[0.8rem] text-terra-700">This permanently deletes your habits, plans and lists. It can&apos;t be undone.</p>
          )}
        </Group>
      )}

      <p className="mt-8 text-center text-[0.75rem] text-muted">Made with Poums ❤️</p>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-7">
      <p className="px-1 text-[0.72rem] font-semibold tracking-wider text-muted uppercase">{title}</p>
      <div className="mt-1 divide-y divide-line border-y border-line">{children}</div>
    </section>
  );
}

function Row({
  icon,
  label,
  hint,
  action,
  danger,
  href,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  hint?: string;
  action?: ReactNode;
  danger?: boolean;
  href?: string;
  onClick?: () => void;
}) {
  const body = (
    <>
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${danger ? "bg-terra-50 text-terra-700" : "bg-surface text-ink"}`}>{icon}</span>
      <span className={`min-w-0 flex-1 text-[0.95rem] ${danger ? "text-terra-700" : "text-ink"}`}>{label}</span>
      {hint && <span className="text-[0.82rem] text-muted">{hint}</span>}
      {action}
      {!action && (onClick || href) && <ChevronRight className="h-4 w-4 text-stone-300" />}
    </>
  );
  const cls = "flex w-full items-center gap-3 px-1 py-3 text-left transition-colors active:bg-surface";
  if (href)
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {body}
      </a>
    );
  if (onClick)
    return (
      <button type="button" onClick={onClick} className={cls}>
        {body}
      </button>
    );
  return <div className={cls}>{body}</div>;
}
