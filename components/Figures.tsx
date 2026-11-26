/* Hand-drawn style figures: ink outlines, flat earthy fills.
   Used while things load and on empty pages, so the app feels calm and human. */

const ink = "var(--color-ink)";
const S = { stroke: ink, strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function Leaf({ x, y, r = 0, s = 1, fill = "var(--color-moss-100)" }: { x: number; y: number; r?: number; s?: number; fill?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M0 0 Q9 -13 0 -28 Q-9 -13 0 0 Z" fill={fill} {...S} />
      <path d="M0 -3 L0 -22" {...S} strokeWidth={1.6} />
    </g>
  );
}

function Head({ x, y, bun }: { x: number; y: number; bun?: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r={15} fill="#fff" {...S} />
      <path d={`M${x - 15} ${y - 1} Q${x - 15} ${y - 19} ${x} ${y - 19} Q${x + 16} ${y - 19} ${x + 15} ${y - 3} Q${x + 7} ${y - 11} ${x - 4} ${y - 8} Q${x - 10} ${y - 6} ${x - 15} ${y - 1} Z`} fill={ink} />
      {bun && <circle cx={x + 2} cy={y - 22} r={6} fill={ink} />}
    </g>
  );
}

/** Sitting cross-legged, eyes closed, breathing: the loading figure */
function Meditate() {
  return (
    <>
      <ellipse cx={100} cy={124} rx={74} ry={22} fill="var(--color-brand-100)" />
      <g className="animate-sway" style={{ transformOrigin: "40px 132px" }}>
        <Leaf x={40} y={132} r={-28} fill="var(--color-sage-100)" />
        <Leaf x={34} y={128} r={-62} s={0.75} />
      </g>
      <g className="animate-sway" style={{ transformOrigin: "160px 132px", animationDelay: "-2s" }}>
        <Leaf x={160} y={132} r={28} fill="var(--color-sage-100)" />
        <Leaf x={166} y={128} r={62} s={0.75} />
      </g>
      <g className="animate-breathe" style={{ transformOrigin: "100px 110px" }}>
        <path d="M58 128 Q100 110 142 128 Q130 142 100 142 Q70 142 58 128 Z" fill="var(--color-sage-400)" {...S} />
        <path d="M78 128 Q75 92 100 86 Q125 92 122 128 Z" fill="var(--color-clay-100)" {...S} />
        <path d="M81 100 Q66 116 76 127" fill="none" {...S} />
        <path d="M119 100 Q134 116 124 127" fill="none" {...S} />
        <path d="M100 80 L100 86" {...S} />
        <Head x={100} y={64} bun />
        <path d="M92 66 q3 2.5 6 0 M102 66 q3 2.5 6 0" fill="none" {...S} strokeWidth={1.8} />
        <path d="M96 73 q4 3 8 0" fill="none" {...S} strokeWidth={1.8} />
      </g>
      <path d="M148 52 l0 8 M144 56 l8 0" {...S} strokeWidth={1.8} />
      <path d="M52 46 l0 6 M49 49 l6 0" {...S} strokeWidth={1.6} />
    </>
  );
}

/** Watering a little plant: empty habits */
function Water() {
  return (
    <>
      <ellipse cx={100} cy={142} rx={78} ry={10} fill="var(--color-brand-100)" />
      <path d="M130 116 h34 l-4 26 h-26 Z" fill="var(--color-terra-400)" {...S} />
      <path d="M147 116 Q145 98 147 82" fill="none" {...S} />
      <g className="animate-sway" style={{ transformOrigin: "147px 100px" }}>
        <Leaf x={147} y={100} r={-48} s={0.9} />
        <Leaf x={147} y={92} r={42} s={0.8} />
        <Leaf x={147} y={84} r={-8} s={0.75} fill="var(--color-sage-100)" />
      </g>
      <path d="M62 112 L60 140 M78 112 L80 140" {...S} />
      <path d="M54 141 h8 M78 141 h8" {...S} />
      <path d="M54 72 Q68 64 82 72 L88 114 H48 Z" fill="var(--color-sage-400)" {...S} />
      <path d="M57 78 Q48 94 54 106" fill="none" {...S} />
      <path d="M80 78 Q94 88 104 88" fill="none" {...S} />
      <path d="M100 80 h20 v15 h-20 Z" fill="var(--color-ochre-100)" {...S} />
      <path d="M120 84 L134 74" {...S} />
      <path d="M104 80 Q110 70 116 80" fill="none" {...S} strokeWidth={2} />
      <circle cx={139} cy={80} r={1.8} fill="var(--color-slate-400)" />
      <circle cx={142} cy={88} r={1.8} fill="var(--color-slate-400)" />
      <circle cx={137} cy={92} r={1.6} fill="var(--color-slate-400)" />
      <path d="M68 66 L68 72" {...S} />
      <Head x={68} y={50} />
      <circle cx={63} cy={52} r={1.4} fill={ink} />
      <circle cx={73} cy={52} r={1.4} fill={ink} />
      <path d="M65 58 q3 2 6 0" fill="none" {...S} strokeWidth={1.8} />
    </>
  );
}

/** Pointing at a big calendar: empty planner */
function Calendar() {
  return (
    <>
      <ellipse cx={100} cy={142} rx={78} ry={10} fill="var(--color-brand-100)" />
      <rect x={96} y={42} width={78} height={80} rx={9} fill="#fff" {...S} />
      <path d="M96 60 h78 M96 51 a9 9 0 0 1 9 -9 h60 a9 9 0 0 1 9 9 v9 h-78 Z" fill="var(--color-clay-100)" {...S} />
      <path d="M114 36 v12 M156 36 v12" {...S} />
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <circle key={`${r}${c}`} cx={110 + c * 17} cy={76 + r * 16} r={r === 1 && c === 2 ? 6 : 2.4} fill={r === 1 && c === 2 ? "var(--color-moss-400)" : "var(--color-sand-400)"} />
        )),
      )}
      <path d="M141 92 l2.5 2.5 l5 -5" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M44 112 Q44 128 62 128 L76 128 L78 142" fill="none" {...S} />
      <path d="M50 112 Q52 132 58 132 L60 142" fill="none" {...S} />
      <path d="M72 142 h10 M54 142 h8" {...S} />
      <path d="M42 80 Q56 72 70 80 L72 114 H40 Z" fill="var(--color-sage-400)" {...S} />
      <path d="M68 86 Q84 82 98 72" fill="none" {...S} />
      <path d="M45 86 Q38 100 46 110" fill="none" {...S} />
      <path d="M56 74 L56 80" {...S} />
      <Head x={56} y={58} bun />
      <circle cx={52} cy={60} r={1.4} fill={ink} />
      <circle cx={61} cy={60} r={1.4} fill={ink} />
      <path d="M53 66 q3 2 6 0" fill="none" {...S} strokeWidth={1.8} />
    </>
  );
}

/** Holding a clipboard with ticks: empty lists */
function Checklist() {
  return (
    <>
      <ellipse cx={100} cy={142} rx={78} ry={10} fill="var(--color-brand-100)" />
      <path d="M66 114 L64 140 M80 114 L82 140" {...S} />
      <path d="M58 141 h8 M80 141 h8" {...S} />
      <path d="M52 74 Q66 66 80 74 L86 116 H46 Z" fill="var(--color-clay-400)" {...S} />
      <path d="M55 80 Q46 96 52 108" fill="none" {...S} />
      <path d="M66 68 L66 74" {...S} />
      <Head x={66} y={52} />
      <circle cx={61} cy={54} r={1.4} fill={ink} />
      <circle cx={71} cy={54} r={1.4} fill={ink} />
      <path d="M63 60 q3 2 6 0" fill="none" {...S} strokeWidth={1.8} />
      <g transform="rotate(6 124 88)">
        <rect x={96} y={50} width={56} height={74} rx={7} fill="#fff" {...S} />
        <rect x={113} y={44} width={22} height={11} rx={3} fill="var(--color-ochre-400)" {...S} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={105} y={66 + i * 17} width={9} height={9} rx={2.5} fill={i < 2 ? "var(--color-moss-400)" : "#fff"} {...S} strokeWidth={1.8} />
            {i < 2 && <path d={`M107 ${71 + i * 17} l2 2 l3.5 -4`} fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />}
            <path d={`M120 ${70.5 + i * 17} h${i === 1 ? 18 : 24}`} {...S} strokeWidth={1.8} stroke={i < 2 ? "var(--color-sand-400)" : ink} />
          </g>
        ))}
      </g>
      <path d="M80 82 Q92 92 100 92" fill="none" {...S} />
      <path d="M164 60 l0 8 M160 64 l8 0" {...S} strokeWidth={1.8} />
    </>
  );
}

/** Arms up, mid-hop, leaves and sparkles around: pure joy */
function Cheer() {
  return (
    <>
      <circle cx={150} cy={44} r={20} fill="var(--color-ochre-100)" className="animate-twinkle" style={{ animationDuration: "4s" }} />
      <ellipse cx={100} cy={146} rx={44} ry={6} fill="var(--color-brand-100)" className="animate-breathe" style={{ transformOrigin: "100px 146px" }} />
      <g className="animate-hop">
        <path d="M84 112 L74 136 M116 112 L126 136" {...S} />
        <path d="M68 137 h10 M122 137 h10" {...S} />
        <path d="M80 76 Q100 68 120 76 L124 116 H76 Z" fill="var(--color-clay-400)" {...S} />
        <path d="M82 80 Q66 64 62 44" fill="none" {...S} />
        <path d="M118 80 Q134 64 138 44" fill="none" {...S} />
        <circle cx={61} cy={41} r={4} fill="#fff" {...S} />
        <circle cx={139} cy={41} r={4} fill="#fff" {...S} />
        <path d="M100 64 L100 70" {...S} />
        <Head x={100} y={48} bun />
        <path d="M93 47 q2.5 -2.5 5 0 M102 47 q2.5 -2.5 5 0" fill="none" {...S} strokeWidth={1.8} />
        <path d="M94 54 q6 6 12 0 Z" fill={ink} {...S} strokeWidth={1.6} />
      </g>
      <g className="animate-twinkle" style={{ animationDelay: "-0.4s" }}>
        <path d="M40 40 l0 10 M35 45 l10 0" {...S} strokeWidth={2} />
      </g>
      <g className="animate-twinkle" style={{ animationDelay: "-1.2s" }}>
        <path d="M168 92 l0 8 M164 96 l8 0" {...S} strokeWidth={2} />
      </g>
      <g className="animate-sway" style={{ transformOrigin: "36px 120px" }}>
        <Leaf x={36} y={120} r={-30} fill="var(--color-moss-100)" />
      </g>
      <g className="animate-sway" style={{ transformOrigin: "166px 128px", animationDelay: "-2s" }}>
        <Leaf x={166} y={128} r={34} s={0.85} fill="var(--color-ochre-100)" />
      </g>
      <circle cx={52} cy={78} r={3} fill="var(--color-terra-400)" className="animate-twinkle" style={{ animationDelay: "-0.8s" }} />
      <circle cx={152} cy={74} r={2.6} fill="var(--color-moss-400)" className="animate-twinkle" style={{ animationDelay: "-1.6s" }} />
    </>
  );
}

const FIGURES = { meditate: Meditate, water: Water, calendar: Calendar, checklist: Checklist, cheer: Cheer };
export type FigureName = keyof typeof FIGURES;

export function Figure({ name, className = "" }: { name: FigureName; className?: string }) {
  const F = FIGURES[name];
  return (
    <svg viewBox="0 0 200 156" className={className} aria-hidden>
      <F />
    </svg>
  );
}

/** Full-area loader: a breathing figure and a gentle line */
export function Loading({ text = "Getting your day ready…" }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" role="status">
      <Figure name="cheer" className="h-44 w-56" />
      <p className="mt-2 font-display text-[1.05rem] text-ink">{text}</p>
      <span className="mt-3 flex gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-2 w-2 rounded-full bg-brand-500 animate-hop" style={{ animationDelay: `${i * 0.15}s`, animationDuration: "1s" }} />
        ))}
      </span>
    </div>
  );
}

/** A sprig of leaves in line art, for the dark banner */
export function Sprig({ className = "", color = "#fff" }: { className?: string; color?: string }) {
  const L = { stroke: color, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  const leaf = (x: number, y: number, r: number, s = 1) => (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M0 0 Q11 -16 0 -34 Q-11 -16 0 0 Z" {...L} />
      <path d="M0 -4 L0 -27" {...L} strokeWidth={1.1} />
    </g>
  );
  return (
    <svg viewBox="0 0 120 200" className={className} aria-hidden>
      <path d="M60 198 Q58 140 64 96 Q68 60 62 18" {...L} />
      {leaf(60, 170, -55)}
      {leaf(61, 150, 52, 0.95)}
      {leaf(62, 126, -50, 0.9)}
      {leaf(64, 104, 48, 0.85)}
      {leaf(65, 80, -44, 0.8)}
      {leaf(64, 58, 40, 0.75)}
      {leaf(62, 20, 0, 0.7)}
    </svg>
  );
}
