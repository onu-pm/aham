"use client";

import { useEffect, useState } from "react";
import { Sprig } from "./Figures";

/** Opening banner: deep forest, white type, a sprig swaying. Fades away by itself, or on a tap. */
export function Splash({ onDone, ms = 2600 }: { onDone: () => void; ms?: number }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), ms);
    const t2 = setTimeout(onDone, ms + 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [ms, onDone]);

  return (
    <button
      type="button"
      onClick={() => (setLeaving(true), setTimeout(onDone, 400))}
      aria-label="Continue to Aham"
      className={`fixed inset-0 z-[70] flex flex-col overflow-hidden bg-forest text-left text-white transition-opacity duration-500 ${leaving ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      {/* Soft light, like morning through leaves */}
      <span aria-hidden className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-moss-400/25 blur-3xl" />
      <span aria-hidden className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-clay-400/15 blur-3xl" />

      <span aria-hidden className="absolute right-[-1.5rem] bottom-[-1rem] h-[62vh] w-[45vw] max-w-56 opacity-50">
        <span className="animate-sway block h-full w-full">
          <Sprig className="h-full w-full" color="#cbd8bd" />
        </span>
      </span>

      <span className="pt-safe relative mx-auto flex w-full max-w-md flex-1 flex-col justify-end px-8 pb-24">
        <span className="animate-rise block text-[0.8rem] font-medium tracking-[0.25em] text-brand-200 uppercase" style={{ animationDelay: "0.1s" }}>
          अहम् · the self
        </span>
        <span className="animate-rise mt-3 block font-display text-[4.25rem] leading-[0.95] font-medium tracking-[-0.04em]" style={{ animationDelay: "0.25s" }}>
          Aham
        </span>
        <span className="animate-rise mt-4 block max-w-[17rem] font-display text-[1.35rem] leading-snug text-white/80" style={{ animationDelay: "0.45s" }}>
          Plan gently. Grow a little every day.
        </span>
        <span className="animate-rise mt-10 flex items-center gap-2 text-[0.8rem] text-white/45" style={{ animationDelay: "0.8s" }}>
          <span className="h-px w-8 bg-white/30" /> Breathe in. You&apos;re here.
        </span>
      </span>
    </button>
  );
}
