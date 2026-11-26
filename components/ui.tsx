"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { celebrate } from "@/lib/fx";

/* One design system for every screen:
   page title → section label → white card (rounded-3xl, soft shadow) → rows/chips */

export function EmojiTile({ emoji, className = "", size = "md" }: { emoji: string; className?: string; size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? "h-12 w-12 text-2xl" : size === "sm" ? "h-8 w-8 text-base" : "h-10 w-10 text-xl";
  return (
    <span aria-hidden className={`flex shrink-0 items-center justify-center rounded-full leading-none ${s} ${className}`}>
      {emoji}
    </span>
  );
}

export function PageTitle({ title, subtitle, action, back }: { title: string; subtitle?: ReactNode; action?: ReactNode; back?: ReactNode }) {
  return (
    <header className="flex items-end justify-between gap-3 px-1 pt-5 pb-1">
      <div className="min-w-0">
        {back}
        <h1 className="text-[2rem] leading-tight font-medium tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-0.5 text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function SectionLabel({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-1 pt-2">
      <h2 className="text-[0.8rem] font-bold tracking-wider text-muted uppercase">{children}</h2>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  // A tinted card brings its own background and sits flat
  const surface = /(^|\s)bg-/.test(className) ? "" : "bg-white shadow-soft";
  return <section className={`rounded-3xl p-4 ${surface} ${className}`}>{children}</section>;
}

/** Height-animated drawer; content stays mounted so it can slide closed */
export function Collapse({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div className="drawer" data-open={open} aria-hidden={!open} inert={!open}>
      <div>{children}</div>
    </div>
  );
}

export function ProgressBar({ value, color = "bg-brand-500", track = "bg-surface" }: { value: number; color?: string; track?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full ${track}`}>
      <div className={`h-full rounded-full transition-[width] duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Ring({ value, size = 72, children }: { value: number; size?: number; children?: ReactNode }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="10" className="stroke-brand-100" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          className="stroke-brand-500 transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

export function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[0.9rem] font-semibold whitespace-nowrap transition-colors ${
        active ? "bg-ink text-white" : "bg-white text-ink shadow-soft"
      }`}
    >
      {children}
    </button>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-full bg-surface p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={`h-8 flex-1 rounded-full px-3 text-[0.85rem] font-bold transition-colors ${o.value === value ? "bg-white text-ink shadow-sm" : "text-muted"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    // Keep the field being typed in visible above the keyboard
    const onFocus = (e: FocusEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest?.("[role=dialog]")) setTimeout(() => t.scrollIntoView({ block: "center", behavior: "smooth" }), 250);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocus);
    document.body.style.overflow = "hidden";
    document.body.classList.add("sheet-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocus);
      document.body.style.overflow = "";
      document.body.classList.remove("sheet-open");
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;
  // Rendered at the top of the page, so nothing (menu, page animations) can sit over it
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center">
      <button type="button" aria-label="Close" onClick={onClose} className="animate-backdrop absolute inset-0 bg-ink/30 backdrop-blur-[3px]" />
      <div
        role="dialog"
        aria-modal="true"
        className="animate-sheet relative max-h-[85vh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-3xl bg-white pb-[max(env(safe-area-inset-bottom),1rem)] shadow-2xl md:rounded-3xl"
      >
        <div className="sticky top-0 z-10 bg-white px-4 pt-2 pb-1.5">
          <div className="mx-auto mb-2 h-1 w-9 rounded-full bg-stone-200 md:hidden" />
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 font-display text-[1.05rem] font-medium text-ink">{title}</div>
            <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-ink active:scale-90">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="px-4 pt-1">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export function CheckCircle({ done, solid, onClick, label }: { done: boolean; solid: string; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-pressed={done}
      aria-label={label}
      onClick={(e) => {
        if (!done) celebrate(e.currentTarget);
        onClick();
      }}
      className="-m-1.5 flex h-10 w-10 shrink-0 items-center justify-center"
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 active:scale-90 ${
          done ? `${solid} animate-pop` : "border-[1.5px] border-stone-300 bg-white"
        }`}
      >
        {done && (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        )}
      </span>
    </button>
  );
}

export const inputCls =
  "h-11 w-full rounded-2xl bg-surface px-3.5 text-[0.95rem] text-ink outline-none placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-brand-300";

export const primaryBtn =
  "flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink text-[0.95rem] font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-25";

export const softBtn =
  "flex h-10 items-center justify-center gap-1.5 rounded-full bg-surface text-[0.9rem] font-semibold text-ink transition-transform active:scale-[0.97]";

/** Horizontal scroller that bleeds to the screen edge */
export function HScroll({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1 ${className}`}>{children}</div>;
}
