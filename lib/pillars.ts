export type PillarId =
  | "mind"
  | "body"
  | "learn"
  | "confidence"
  | "focus"
  | "home"
  | "people"
  | "create"
  | "money"
  | "selfcare";

export type ItemKind = "habit" | "task" | "goal";

export type Suggestion = { title: string; emoji: string; kind: ItemKind; unit?: string };

export type Pillar = {
  id: PillarId;
  label: string;
  emoji: string;
  /* Literal class strings so Tailwind can see them */
  tint: string;
  soft: string;
  solid: string;
  text: string;
  bar: string;
  suggestions: Suggestion[];
};

export const PILLARS: Pillar[] = [
  {
    id: "mind",
    label: "Mind & calm",
    emoji: "🌿",
    tint: "bg-violet-50",
    soft: "bg-violet-100",
    solid: "bg-violet-400 text-white",
    text: "text-violet-700",
    bar: "bg-violet-400",
    suggestions: [
      { title: "Meditate 5 min", emoji: "🧘", kind: "habit" },
      { title: "Breathing break", emoji: "🌬️", kind: "habit" },
      { title: "Write one gratitude", emoji: "🙏", kind: "habit" },
      { title: "No phone first hour", emoji: "📵", kind: "habit" },
      { title: "Name my feelings", emoji: "🌤️", kind: "habit" },
    ],
  },
  {
    id: "body",
    label: "Body",
    emoji: "💪",
    tint: "bg-emerald-50",
    soft: "bg-emerald-100",
    solid: "bg-emerald-400 text-white",
    text: "text-emerald-700",
    bar: "bg-emerald-400",
    suggestions: [
      { title: "Drink water", emoji: "💧", kind: "habit" },
      { title: "Walk 10 min", emoji: "🚶", kind: "habit" },
      { title: "Go to the gym", emoji: "🏋️", kind: "habit" },
      { title: "Stretch", emoji: "🤸", kind: "habit" },
      { title: "Sleep by 11pm", emoji: "😴", kind: "habit" },
      { title: "Smoke-free day", emoji: "🚭", kind: "habit" },
    ],
  },
  {
    id: "learn",
    label: "Learn",
    emoji: "📚",
    tint: "bg-sky-50",
    soft: "bg-sky-100",
    solid: "bg-sky-400 text-white",
    text: "text-sky-700",
    bar: "bg-sky-400",
    suggestions: [
      { title: "Read 10 pages", emoji: "📖", kind: "habit" },
      { title: "Read a book", emoji: "📚", kind: "goal", unit: "pages" },
      { title: "Online course", emoji: "🎓", kind: "goal", unit: "lessons" },
      { title: "Learn 5 new words", emoji: "🌍", kind: "habit" },
      { title: "Listen to a podcast", emoji: "🎧", kind: "habit" },
    ],
  },
  {
    id: "confidence",
    label: "Confidence",
    emoji: "✨",
    tint: "bg-amber-50",
    soft: "bg-amber-100",
    solid: "bg-amber-400 text-white",
    text: "text-amber-700",
    bar: "bg-amber-400",
    suggestions: [
      { title: "Speech drill 3 min", emoji: "🗣️", kind: "habit" },
      { title: "Daily affirmation", emoji: "💬", kind: "habit" },
      { title: "Say hi to someone new", emoji: "👋", kind: "habit" },
      { title: "Share one idea out loud", emoji: "💡", kind: "habit" },
      { title: "Power pose 2 min", emoji: "🦸", kind: "habit" },
    ],
  },
  {
    id: "focus",
    label: "Work & focus",
    emoji: "🎯",
    tint: "bg-indigo-50",
    soft: "bg-indigo-100",
    solid: "bg-indigo-400 text-white",
    text: "text-indigo-700",
    bar: "bg-indigo-400",
    suggestions: [
      { title: "Plan my day", emoji: "🗓️", kind: "habit" },
      { title: "25 min deep work", emoji: "🎯", kind: "habit" },
      { title: "Clear my inbox", emoji: "📧", kind: "task" },
      { title: "Review my week", emoji: "📝", kind: "task" },
    ],
  },
  {
    id: "home",
    label: "Home",
    emoji: "🏡",
    tint: "bg-orange-50",
    soft: "bg-orange-100",
    solid: "bg-orange-400 text-white",
    text: "text-orange-700",
    bar: "bg-orange-400",
    suggestions: [
      { title: "Make the bed", emoji: "🛏️", kind: "habit" },
      { title: "10 min tidy", emoji: "✨", kind: "habit" },
      { title: "Clean my room", emoji: "🧹", kind: "task" },
      { title: "Do the laundry", emoji: "🧺", kind: "task" },
      { title: "Buy groceries", emoji: "🛒", kind: "task" },
    ],
  },
  {
    id: "people",
    label: "People",
    emoji: "🤝",
    tint: "bg-rose-50",
    soft: "bg-rose-100",
    solid: "bg-rose-400 text-white",
    text: "text-rose-700",
    bar: "bg-rose-400",
    suggestions: [
      { title: "Text a friend", emoji: "💬", kind: "habit" },
      { title: "Call family", emoji: "📞", kind: "habit" },
      { title: "Plan a hangout", emoji: "☕", kind: "task" },
      { title: "Compliment someone", emoji: "🌼", kind: "habit" },
    ],
  },
  {
    id: "create",
    label: "Create",
    emoji: "🎨",
    tint: "bg-fuchsia-50",
    soft: "bg-fuchsia-100",
    solid: "bg-fuchsia-400 text-white",
    text: "text-fuchsia-700",
    bar: "bg-fuchsia-400",
    suggestions: [
      { title: "Draw for 10 min", emoji: "✏️", kind: "habit" },
      { title: "Write 100 words", emoji: "✍️", kind: "habit" },
      { title: "Play music", emoji: "🎸", kind: "habit" },
      { title: "Photo walk", emoji: "📷", kind: "habit" },
    ],
  },
  {
    id: "money",
    label: "Money",
    emoji: "💰",
    tint: "bg-lime-50",
    soft: "bg-lime-100",
    solid: "bg-lime-500 text-white",
    text: "text-lime-700",
    bar: "bg-lime-500",
    suggestions: [
      { title: "Track my spending", emoji: "💰", kind: "habit" },
      { title: "No-spend day", emoji: "🙅", kind: "habit" },
      { title: "Pay my bills", emoji: "🧾", kind: "task" },
      { title: "Save a little", emoji: "🐷", kind: "habit" },
    ],
  },
  {
    id: "selfcare",
    label: "Self-care",
    emoji: "🛁",
    tint: "bg-cyan-50",
    soft: "bg-cyan-100",
    solid: "bg-cyan-400 text-white",
    text: "text-cyan-700",
    bar: "bg-cyan-400",
    suggestions: [
      { title: "Brush & floss", emoji: "🦷", kind: "habit" },
      { title: "Take my meds", emoji: "💊", kind: "habit" },
      { title: "Skincare", emoji: "🧴", kind: "habit" },
      { title: "Shower", emoji: "🚿", kind: "habit" },
      { title: "Rest without guilt", emoji: "🛋️", kind: "habit" },
    ],
  },
];

export const pillarById = Object.fromEntries(PILLARS.map((p) => [p.id, p])) as Record<PillarId, Pillar>;

/* ---------- auto-detection ---------- */

// First match wins, so more specific phrases come first
const RULES: [RegExp, PillarId, string][] = [
  [/\b(smok|cigarette|vape)/, "body", "🚭"],
  [/\b(speech|speak|public speaking|presentation|pitch)/, "confidence", "🗣️"],
  [/\b(affirmation|confiden|self.?esteem|eye contact|say no|assertive|mirror|posture|power pose)/, "confidence", "✨"],
  [/\b(meditat|mindful)/, "mind", "🧘"],
  [/\b(breath|breathing)/, "mind", "🌬️"],
  [/\b(gratitude|grateful|thankful)/, "mind", "🙏"],
  [/\b(journal|feelings?|emotion|mood)/, "mind", "📓"],
  [/\b(therap|counsel)/, "mind", "💬"],
  [/\b(phone|screen time|social media|doomscroll|detox)/, "mind", "📵"],
  [/\b(anxi|stress|calm|relax)/, "mind", "🍃"],
  [/\b(gym|workout|lift|weights|exercise|training)/, "body", "🏋️"],
  [/\b(run|running|jog)/, "body", "🏃"],
  [/\b(walk|steps|hike)/, "body", "🚶"],
  [/\b(yoga|pilates|stretch)/, "body", "🤸"],
  [/\b(swim)/, "body", "🏊"],
  [/\b(cycl|bike)/, "body", "🚴"],
  [/\b(water|hydrat)/, "body", "💧"],
  [/\b(vegetable|fruit|salad|protein|eat|meal|diet|sugar|junk)/, "body", "🥗"],
  [/\b(sleep|bedtime)/, "body", "😴"],
  [/\b(weigh)/, "body", "⚖️"],
  [/\b(book|novel|chapters?|pages?)\b/, "learn", "📚"],
  [/\b(read)/, "learn", "📖"],
  [/\b(course|class|lesson|module|udemy|coursera)/, "learn", "🎓"],
  [/\b(language|spanish|french|german|hindi|japanese|duolingo|vocab|words)/, "learn", "🌍"],
  [/\b(podcast|audiobook)/, "learn", "🎧"],
  [/\b(learn|study|revise|research|tutorial|documentary)/, "learn", "🧠"],
  [/\b(call|phone (mom|dad))/, "people", "📞"],
  [/\b(friend|family|mom|mum|dad|parents|sister|brother|partner|date|hang ?out|visit|text)/, "people", "💬"],
  [/\b(birthday|gift)/, "people", "🎁"],
  [/\b(volunteer|help someone|kind)/, "people", "🤝"],
  [/\b(code|coding|program)/, "focus", "💻"],
  [/\b(email|inbox)/, "focus", "📧"],
  [/\b(meeting|report|project|deadline|work|job|resume|cv|interview|apply|homework|assignment)/, "focus", "💼"],
  [/\b(plan|planning|schedule|organi[sz]e my|review my week|to.?do)/, "focus", "🗓️"],
  [/\b(focus|deep work|pomodoro)/, "focus", "🎯"],
  [/\b(laundry|clothes)/, "home", "🧺"],
  [/\b(dish|kitchen)/, "home", "🍽️"],
  [/\b(clean|tidy|vacuum|declutter|mop|dust)/, "home", "🧹"],
  [/\b(grocer|shopping)/, "home", "🛒"],
  [/\b(make (the|my) bed)/, "home", "🛏️"],
  [/\b(plant|garden)/, "home", "🪴"],
  [/\b(cook)/, "home", "🍳"],
  [/\b(trash|garbage|recycl)/, "home", "🗑️"],
  [/\b(draw|sketch|doodle)/, "create", "✏️"],
  [/\b(paint)/, "create", "🎨"],
  [/\b(write|writing|blog|poem|story)/, "create", "✍️"],
  [/\b(guitar|piano|music|sing|song|instrument)/, "create", "🎸"],
  [/\b(photo)/, "create", "📷"],
  [/\b(knit|craft|crochet|sew)/, "create", "🧶"],
  [/\b(bill|rent|invoice|tax)/, "money", "🧾"],
  [/\b(budget|spend|expense|money|save|saving|invest|debt)/, "money", "💰"],
  [/\b(teeth|floss|brush)/, "selfcare", "🦷"],
  [/\b(med|medicine|pill|vitamin|supplement)/, "selfcare", "💊"],
  [/\b(skin|skincare|moisturi)/, "selfcare", "🧴"],
  [/\b(shower)/, "selfcare", "🚿"],
  [/\b(bath)/, "selfcare", "🛁"],
  [/\b(doctor|dentist|appointment|checkup)/, "selfcare", "🩺"],
  [/\b(nap|rest|self.?care|hair|nails)/, "selfcare", "🛋️"],
];

const HABIT_WORDS = /\b(every|each|daily|a day|per day|morning|evening|night|weekly|habit|min\b|mins|minutes)/;
const TASK_WORDS =
  /^(do (the |my )?(laundry|dishes|taxes|homework|shopping)|clean|organi[sz]e|call|email|book|schedule|buy|pay|finish|submit|fix|apply|prepare|return|cancel|renew|sort|declutter|pack|move|file|send|reply|plan a|write a|set up|sign up|register|order|pick up|drop off|get)\b/;

export type Detected = { pillar: PillarId; emoji: string; kind: ItemKind; unit: string | null; total: number | null };

export function detect(raw: string): Detected {
  const text = raw.toLowerCase().trim();
  let pillar: PillarId = "mind";
  let emoji = "🌱";
  for (const [re, p, e] of RULES) {
    if (re.test(text)) {
      pillar = p;
      emoji = e;
      break;
    }
  }

  // "finish 300 pages", "a book", "online course" → something with progress
  const amount = text.match(/(\d+)\s*(pages?|chapters?|lessons?|modules?|km|miles|episodes?|videos?)/);
  let kind: ItemKind = "habit";
  let unit: string | null = null;
  let total: number | null = null;

  if (HABIT_WORDS.test(text)) kind = "habit";
  else if (/\b(a|the|this|my) (book|novel)\b/.test(text) || /\bfinish\b.*\b(book|course)\b/.test(text)) {
    kind = "goal";
    unit = "pages";
  } else if (/\b(course|class)\b/.test(text) && !/\b(go to|attend)\b/.test(text)) {
    kind = "goal";
    unit = "lessons";
  } else if (amount && /\b(finish|complete|total)\b/.test(text)) {
    kind = "goal";
    unit = amount[2].replace(/s$/, "") + "s";
    total = parseInt(amount[1]);
  } else if (TASK_WORDS.test(text)) kind = "task";

  return { pillar, emoji, kind, unit, total };
}

export function tidyTitle(raw: string): string {
  const t = raw.trim().replace(/\s+/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export const KIND_LABEL: Record<ItemKind, { label: string; hint: string }> = {
  habit: { label: "Habit", hint: "Repeat it, check it off" },
  task: { label: "Task", hint: "Do it once, in small steps" },
  goal: { label: "Goal", hint: "Track progress over time" },
};

export const MOODS = ["😣", "😕", "😐", "🙂", "😄"];
export const MOOD_LABELS = ["Rough", "Low", "Okay", "Good", "Great"];

export const PROMPTS = [
  "What's one small win from today?",
  "What's taking up space in my head?",
  "Something I'm grateful for…",
  "I felt proud when…",
  "What would make tomorrow a bit easier?",
  "What did I learn today?",
  "Where did I show courage today?",
];
