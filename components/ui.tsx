"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export function EmojiTile({ emoji, className = "", size = "md" }: { emoji: string; className?: string; size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? "h-14 w-14 text-[1.75rem]" : size === "sm" ? "h-10 w-10 text-xl" : "h-12 w-12 text-2xl";
  return (
    <span aria-hidden className={`flex shrink-0 items-center justify-center rounded-full leading-none ${s} ${className}`}>
      {emoji}
    </span>
  );
}

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 px-1 pt-4 pb-2">
      <div className="min-w-0">
        <h1 className="font-display text-[2.25rem] leading-[1.05] text-ink">{title}</h1>
        {subtitle && <p className="mt-1.5 text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  // A tinted card brings its own background and sits flat
  const surface = /(^|\s)bg-/.test(className) ? "" : "bg-white shadow-soft";
  return (
    <section className={`rounded-[1.75rem] p-5 ${surface} ${className}`}>
      {title && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="font-display text-[1.35rem] leading-tight text-ink">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function ProgressBar({ value, color = "bg-brand-500", track = "bg-surface" }: { value: number; color?: string; track?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={`h-2.5 w-full overflow-hidden rounded-full ${track}`}>
      <div className={`h-full rounded-full transition-[width] duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Ring({ value, size = 96, children }: { value: number; size?: number; children?: ReactNode }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="10" className="stroke-white/70" />
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

export function Chip({
  active,
  onClick,
  children,
  className = "",
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-11 shrink-0 items-center gap-1.5 rounded-full px-4 font-medium whitespace-nowrap transition-colors ${
        active ? "bg-ink text-white" : "bg-white text-ink shadow-soft"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function Sheet({
  open,
  onClose,
  title,
  children,
  full,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  full?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center md:items-center">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/25 backdrop-blur-[2px]" />
      <div
        role="dialog"
        aria-modal="true"
        className={`animate-sheet pb-nav relative w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[2rem] bg-white md:rounded-[2rem] ${
          full ? "h-[94dvh]" : "max-h-[92dvh]"
        }`}
      >
        <div className="sticky top-0 z-10 bg-white px-5 pt-3 pb-3">
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-zinc-200 md:hidden" />
          <div className="flex items-center justify-between gap-3">
            <div className="font-display min-w-0 text-[1.5rem] leading-tight text-ink">{title}</div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-ink"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="px-5 pb-6">{children}</div>
      </div>
    </div>
  );
}

export const inputCls =
  "h-14 w-full rounded-2xl bg-surface px-4 text-ink outline-none placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-brand-300";

export const primaryBtn =
  "flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink font-medium text-white transition-transform active:scale-[0.98] disabled:opacity-25";

export const softBtn =
  "flex h-12 items-center justify-center gap-1.5 rounded-full bg-surface font-medium text-ink transition-transform active:scale-[0.97]";

/** Horizontal scroller that bleeds to the screen edge */
export function HScroll({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] ${className}`}>{children}</div>;
}
