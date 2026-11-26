"use client";

import { useEffect, useState } from "react";
import { DIMENSIONS, type Dimension } from "@/lib/goals";

/** The wellness wheel: eight petals that grow with the care each part of life gets */
export function Wheel({ values, size = 200, onPick, picked }: { values: Record<Dimension, number>; size?: number; onPick?: (d: Dimension) => void; picked?: Dimension | null }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 150);
    return () => clearTimeout(t);
  }, []);
  const c = 100;
  const inner = 26;
  const outer = 92;
  const n = DIMENSIONS.length;
  const balance = Math.round((DIMENSIONS.reduce((s, d) => s + Math.min(1, values[d.id] * 1.6), 0) / n) * 100);

  const petal = (i: number, r: number) => {
    const a0 = (i / n) * Math.PI * 2 - Math.PI / 2 + 0.04;
    const a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2 - 0.04;
    const p = (a: number, rad: number) => `${c + Math.cos(a) * rad} ${c + Math.sin(a) * rad}`;
    return `M ${p(a0, inner)} L ${p(a0, r)} A ${r} ${r} 0 0 1 ${p(a1, r)} L ${p(a1, inner)} A ${inner} ${inner} 0 0 0 ${p(a0, inner)} Z`;
  };

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={`Wellness wheel, ${balance}% balanced`}>
      {DIMENSIONS.map((d, i) => {
        const v = shown ? Math.max(0.06, values[d.id]) : 0.06;
        const r = inner + (outer - inner) * Math.min(1, v);
        const a = ((i + 0.5) / n) * Math.PI * 2 - Math.PI / 2;
        return (
          <g key={d.id} onClick={() => onPick?.(d.id)} style={{ cursor: onPick ? "pointer" : undefined }}>
            <path d={petal(i, outer)} fill={d.color} opacity={0.14} />
            <path
              d={petal(i, r)}
              fill={d.color}
              opacity={picked && picked !== d.id ? 0.35 : 0.9}
              style={{ transition: "d 1s cubic-bezier(0.16,1,0.3,1), opacity 0.3s" }}
            />
            <text x={c + Math.cos(a) * (outer - 14)} y={c + Math.sin(a) * (outer - 14) + 5} textAnchor="middle" fontSize="14" aria-hidden>
              {d.emoji}
            </text>
          </g>
        );
      })}
      <circle cx={c} cy={c} r={inner - 2} fill="#fff" />
      <text x={c} y={c + 2} textAnchor="middle" fontSize="16" fontWeight="600" fill="var(--color-ink)" className="font-display">
        {balance}%
      </text>
      <text x={c} y={c + 14} textAnchor="middle" fontSize="7" fill="var(--color-muted)">
        balance
      </text>
    </svg>
  );
}
