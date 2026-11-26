"use client";

/* Small moments of delight. Respect people who prefer less motion. */

const BITS = ["🌱", "✨", "🍃", "●", "●", "●"];
const COLORS = ["var(--color-moss-400)", "var(--color-ochre-400)", "var(--color-clay-400)", "var(--color-sage-400)", "var(--color-brand-300)"];

function calm(): boolean {
  return typeof window === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/** A little burst of leaves and dots from the centre of an element (or a point) */
export function burst(from: Element | { x: number; y: number } | null | undefined, amount = 10) {
  if (!from || calm()) return;
  const r = "getBoundingClientRect" in from ? from.getBoundingClientRect() : null;
  const x = r ? r.left + r.width / 2 : (from as { x: number }).x;
  const y = r ? r.top + r.height / 2 : (from as { y: number }).y;
  for (let i = 0; i < amount; i++) {
    const el = document.createElement("span");
    const bit = BITS[i % BITS.length];
    const angle = (Math.PI * 2 * i) / amount + Math.random() * 0.6;
    const dist = 28 + Math.random() * 34;
    el.className = "burst-bit";
    el.textContent = bit;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.fontSize = bit === "●" ? `${6 + Math.random() * 5}px` : `${12 + Math.random() * 5}px`;
    el.style.color = COLORS[i % COLORS.length];
    el.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    el.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
    el.style.setProperty("--rot", `${Math.round(Math.random() * 120 - 60)}deg`);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }
}

/** A short tap on the phone, where supported */
export function tick() {
  try {
    navigator.vibrate?.(12);
  } catch {
    // not supported
  }
}

/** Celebrate a completed thing: burst + tiny buzz */
export function celebrate(from: Element | null | undefined) {
  burst(from);
  tick();
}
