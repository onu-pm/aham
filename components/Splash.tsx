"use client";

import { useEffect, useState } from "react";
import { Sprig } from "./Figures";

/** Opening banner: deep forest, white type, a sprig swaying. Fades away by itself, or on a tap. */
export function Splash({ onDone, ms = 3000 }: { onDone: () => void; ms?: number }) {
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
      className={`fixed inset-0 z-[70] flex flex-col overflow-hidden bg-forest text-left text-white transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${leaving ? "pointer-events-none scale-110 opacity-0 blur-sm" : "opacity-100"}`}
    >
      {/* Sunrise: a warm sun climbs behind the leaves */}
      <span aria-hidden className="animate-sun absolute top-[14%] left-1/2 h-64 w-64 -translate-x-1/2">
        <span className="absolute inset-0 rounded-full bg-ochre-400/30 blur-3xl" />
        <span className="animate-breathe absolute inset-12 rounded-full bg-ochre-400/90" style={{ boxShadow: "0 0 80px 20px rgb(210 165 72 / 0.45)" }} />
      </span>
      <span aria-hidden className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-clay-400/20 blur-3xl" />

      {/* A seedling draws itself in front of the sun */}
      <svg aria-hidden viewBox="0 0 120 140" className="absolute top-[22%] left-1/2 h-40 w-36 -translate-x-1/2">
        <path d="M60 136 C60 110 58 92 60 70" fill="none" stroke="#f8f5ef" strokeWidth="4" strokeLinecap="round" className="draw" style={{ animationDelay: "0.5s" }} />
        <path d="M60 86 C40 84 26 70 24 50 C44 52 58 64 60 86 Z" fill="#aec29a" stroke="#f8f5ef" strokeWidth="3" strokeLinejoin="round" className="leaf-pop" style={{ animationDelay: "1.15s", transformOrigin: "60px 86px" }} />
        <path d="M60 76 C78 74 94 60 96 38 C74 40 62 54 60 76 Z" fill="#cbd8bd" stroke="#f8f5ef" strokeWidth="3" strokeLinejoin="round" className="leaf-pop" style={{ animationDelay: "1.35s", transformOrigin: "60px 76px" }} />
      </svg>

      {/* Leaves drifting down, here and there */}
      {[
        { l: "12%", d: "0s", c: "#cbd8bd" },
        { l: "78%", d: "-2.2s", c: "#f5e5bf" },
        { l: "45%", d: "-4s", c: "#f3dccd" },
      ].map((f) => (
        <span key={f.l} aria-hidden className="leaf-fall absolute top-0 text-xl" style={{ left: f.l, animationDelay: f.d, color: f.c }}>
          🍃
        </span>
      ))}

      <span aria-hidden className="absolute right-[-1.5rem] bottom-[-1rem] h-[58vh] w-[45vw] max-w-56 opacity-60">
        <span className="animate-sway block h-full w-full">
          <Sprig className="h-full w-full" color="#cbd8bd" />
        </span>
      </span>

      <span className="pt-safe relative mx-auto flex w-full max-w-md flex-1 flex-col justify-end px-8 pb-24">
        {/* Aham, written like Sanskrit: letters hang from a headline bar (shirorekha) and end with a danda */}
        <span className="vedic-mark relative inline-flex items-start self-start text-[4.4rem] leading-none tracking-[0.02em]" aria-label="Aham">
          <span className="shirorekha" aria-hidden />
          {"AHAM".split("").map((ch, i) => (
            <span key={i} className="letter-drop" style={{ animationDelay: `${0.55 + i * 0.1}s` }} aria-hidden>
              {ch}
            </span>
          ))}
          <span className="danda letter-drop text-ochre-400" style={{ animationDelay: "1s" }} aria-hidden>
            ।
          </span>
        </span>
        <span className="animate-rise mt-5 flex gap-3 font-display text-[1.35rem] font-medium tracking-wide text-white/90" style={{ animationDelay: "1.1s" }}>
          <span>Plan.</span>
          <span className="text-brand-200">Grow.</span>
          <span className="text-ochre-100">Live.</span>
        </span>
      </span>

      <span className="animate-rise pb-nav absolute inset-x-0 bottom-0 pb-6 text-center text-[0.78rem] text-white/55" style={{ animationDelay: "1.3s" }}>
        Made with Poums ❤️
      </span>
    </button>
  );
}
