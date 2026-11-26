/* Goals for growing, arranged around the wellness wheel.
   Each goal is inspired by a well-known book on habits and wellbeing; the ideas are
   summarised in our own words. Progress counts days done, not streaks: missing a day
   never resets anything. */

import { dateKey, daysAgo, type Item } from "./store";

export type Dimension = "physical" | "emotional" | "intellectual" | "social" | "spiritual" | "environmental" | "occupational" | "financial";

export const DIMENSIONS: { id: Dimension; label: string; emoji: string; color: string; soft: string }[] = [
  { id: "physical", label: "Body", emoji: "💪", color: "var(--color-moss-400)", soft: "bg-moss-100" },
  { id: "emotional", label: "Feelings", emoji: "💛", color: "var(--color-ochre-400)", soft: "bg-ochre-100" },
  { id: "intellectual", label: "Mind", emoji: "🧠", color: "var(--color-slate-400)", soft: "bg-slate-100" },
  { id: "social", label: "People", emoji: "🤝", color: "var(--color-rosewood-400)", soft: "bg-rosewood-100" },
  { id: "spiritual", label: "Purpose", emoji: "🌸", color: "var(--color-plum-400)", soft: "bg-plum-100" },
  { id: "environmental", label: "Space", emoji: "🌿", color: "var(--color-sage-400)", soft: "bg-sage-100" },
  { id: "occupational", label: "Work", emoji: "🎯", color: "var(--color-clay-400)", soft: "bg-clay-100" },
  { id: "financial", label: "Money", emoji: "💰", color: "var(--color-olive-400)", soft: "bg-olive-100" },
];
export const dimensionById = Object.fromEntries(DIMENSIONS.map((d) => [d.id, d])) as Record<Dimension, (typeof DIMENSIONS)[number]>;

export type Level = "easy" | "medium" | "hard";
export const LEVELS: Record<Level, { label: string; emoji: string; days: number; xp: number; blurb: string }> = {
  easy: { label: "Easy", emoji: "🌱", days: 21, xp: 10, blurb: "21 days · a gentle start" },
  medium: { label: "Steady", emoji: "🌿", days: 40, xp: 15, blurb: "40 days · real momentum" },
  hard: { label: "Bold", emoji: "🌳", days: 66, xp: 20, blurb: "66 days · it becomes who you are" },
};

export type GoalTemplate = {
  id: string;
  title: string;
  emoji: string;
  dimension: Dimension;
  mode: "build" | "quit";
  /** The book the idea comes from */
  book: string;
  /** The idea in one line, in our words */
  idea: string;
  /** What to do each day, by level */
  daily: Record<Level, string>;
  /** Ways to make it stick */
  how: string[];
  /** Five milestone names, last one is the goal itself */
  milestones: [string, string, string, string, string];
  /** For finding helpful videos */
  search: string;
};

export const GOALS: GoalTemplate[] = [
  {
    id: "rise-early",
    title: "Rise early",
    emoji: "🌅",
    dimension: "physical",
    mode: "build",
    book: "The 5 AM Club · Robin Sharma",
    idea: "A quiet first hour, before the world wakes, sets the tone for the whole day.",
    daily: { easy: "Get up by 7:00", medium: "Get up by 6:00", hard: "Get up at 5:00" },
    how: ["Set your bedtime 8 hours before your wake-up", "Put the alarm across the room", "Spend the first 20 minutes moving, reflecting or learning"],
    milestones: ["Snooze Slayer", "Early Bird", "Dawn Chaser", "Sunrise Keeper", "Dawn Legend"],
    search: "how to wake up early morning routine",
  },
  {
    id: "move-daily",
    title: "Move every day",
    emoji: "🚶",
    dimension: "physical",
    mode: "build",
    book: "Ikigai · García & Miralles",
    idea: "The longest-living people don't work out hard; they simply keep moving through the day.",
    daily: { easy: "Walk 10 minutes", medium: "Walk or move 20 minutes", hard: "Move 30 minutes" },
    how: ["Walk after a meal", "Take calls on your feet", "Stretch while the kettle boils"],
    milestones: ["First Steps", "Wanderer", "Trailblazer", "Mountain Goat", "Ikigai Mover"],
    search: "daily walking benefits motivation",
  },
  {
    id: "sleep-well",
    title: "Sleep well",
    emoji: "🌙",
    dimension: "physical",
    mode: "build",
    book: "Why We Sleep · Matthew Walker",
    idea: "Sleep is the base everything else stands on; a regular bedtime is the simplest fix.",
    daily: { easy: "In bed by midnight", medium: "In bed by 11, phone away", hard: "Same bedtime, 8 hours in bed" },
    how: ["Keep the same bedtime, weekends too", "Dim lights an hour before", "Charge your phone outside the bedroom"],
    milestones: ["Owl Tamed", "Dream Weaver", "Night Keeper", "Rest Master", "Sleep Sage"],
    search: "how to sleep better tips",
  },
  {
    id: "hydrate",
    title: "Drink enough water",
    emoji: "💧",
    dimension: "physical",
    mode: "build",
    book: "Atomic Habits · James Clear",
    idea: "Make it obvious: put the cue where you can't miss it, and the habit follows.",
    daily: { easy: "4 glasses of water", medium: "6 glasses of water", hard: "8 glasses of water" },
    how: ["Keep a full bottle in sight", "A glass right after waking", "One glass with every meal"],
    milestones: ["First Drop", "Little Stream", "Flowing River", "Deep Lake", "Ocean"],
    search: "drink more water habit tips",
  },
  {
    id: "eat-mindful",
    title: "Eat until 80% full",
    emoji: "🥗",
    dimension: "physical",
    mode: "build",
    book: "Ikigai · García & Miralles",
    idea: "Hara hachi bu: stop eating when you're about 80% full, a habit from Okinawa.",
    daily: { easy: "One mindful meal", medium: "Two mindful meals", hard: "Every meal, slow and mindful" },
    how: ["Eat without a screen", "Put the spoon down between bites", "Use a smaller plate"],
    milestones: ["Taster", "Slow Eater", "Mindful Muncher", "Balance Keeper", "Okinawa Spirit"],
    search: "hara hachi bu mindful eating",
  },
  {
    id: "gratitude",
    title: "Write gratitude",
    emoji: "✍️",
    dimension: "emotional",
    mode: "build",
    book: "The Miracle Morning · Hal Elrod",
    idea: "Writing a few good things each morning trains your mind to notice them all day.",
    daily: { easy: "Write 1 good thing", medium: "Write 3 good things", hard: "3 good things + why they mattered" },
    how: ["Keep the notebook by your tea or coffee", "One line counts", "Read last week's page on Sundays"],
    milestones: ["Noticer", "Appreciator", "Silver Liner", "Joy Collector", "Sunshine Soul"],
    search: "gratitude journaling how to start",
  },
  {
    id: "meditate",
    title: "Calm mind",
    emoji: "🧘",
    dimension: "emotional",
    mode: "build",
    book: "The Miracle Morning · Hal Elrod",
    idea: "Silence is the first of the morning practices: a few still minutes steady the day.",
    daily: { easy: "2 minutes of breathing", medium: "5 minutes of meditation", hard: "15 minutes of meditation" },
    how: ["Same spot, same time", "Count 10 breaths, then start again", "A wandering mind is part of it"],
    milestones: ["Settler", "Breather", "Still Water", "Calm Current", "Zen Master"],
    search: "meditation for beginners 5 minutes",
  },
  {
    id: "read",
    title: "Read daily",
    emoji: "📖",
    dimension: "intellectual",
    mode: "build",
    book: "Atomic Habits · James Clear",
    idea: "The two-minute rule: start so small it's easy, like reading just one page.",
    daily: { easy: "Read 1 page", medium: "Read 10 pages", hard: "Read 30 minutes" },
    how: ["Book on your pillow", "Read before opening your phone in bed", "Stop mid-chapter so it's easy to restart"],
    milestones: ["Page Turner", "Bookworm", "Chapter Chaser", "Story Seeker", "Library Legend"],
    search: "how to build a reading habit",
  },
  {
    id: "deep-work",
    title: "Deep focus",
    emoji: "🎯",
    dimension: "intellectual",
    mode: "build",
    book: "Deep Work · Cal Newport",
    idea: "Focused time without distractions creates more value than hours of scattered work.",
    daily: { easy: "25 minutes of focus", medium: "1 hour of focus", hard: "2 hours of deep work" },
    how: ["Phone in another room", "One task, one tab", "Same time each day, like a meeting"],
    milestones: ["Focused", "In the Zone", "Deep Diver", "Flow Finder", "Flow Master"],
    search: "deep work focus techniques",
  },
  {
    id: "reach-out",
    title: "Reach out to someone",
    emoji: "💬",
    dimension: "social",
    mode: "build",
    book: "Ikigai · García & Miralles",
    idea: "Close friendships and a sense of community are part of every long, happy life.",
    daily: { easy: "Send one kind message", medium: "Call or meet someone", hard: "One real conversation, no phones" },
    how: ["Keep a list of 5 people you love", "Message while waiting in a queue", "Plan one meet-up a week"],
    milestones: ["Hello Sayer", "Connector", "Circle Builder", "Heart Friend", "Village Keeper"],
    search: "how to make and keep friends as an adult",
  },
  {
    id: "purpose",
    title: "Find your ikigai",
    emoji: "🌸",
    dimension: "spiritual",
    mode: "build",
    book: "Ikigai · García & Miralles",
    idea: "Your reason for being sits where what you love, what you're good at and what helps others meet.",
    daily: { easy: "1 minute: what gave me joy today?", medium: "Write what you love & are good at", hard: "Do one thing that matters to you" },
    how: ["Notice what makes time fly", "Ask: who did I help today?", "Small daily joys count"],
    milestones: ["Seeker", "Wonderer", "Spark Finder", "Path Walker", "Ikigai Found"],
    search: "ikigai find your purpose explained",
  },
  {
    id: "visualise",
    title: "Affirm & visualise",
    emoji: "🌟",
    dimension: "spiritual",
    mode: "build",
    book: "The Miracle Morning · Hal Elrod",
    idea: "Picturing your best day and saying who you're becoming keeps you pointed the right way.",
    daily: { easy: "Say one affirmation", medium: "Affirm + 2 minutes visualising", hard: "Write your vision, read it daily" },
    how: ["Write it in the present tense", "Read it out loud", "Picture how it feels, not just what happens"],
    milestones: ["Dreamer", "Believer", "Vision Keeper", "Becoming", "Future Self"],
    search: "morning affirmations visualization",
  },
  {
    id: "tidy",
    title: "Calm space",
    emoji: "🏠",
    dimension: "environmental",
    mode: "build",
    book: "Atomic Habits · James Clear",
    idea: "Shape your space and it shapes you: make good habits easy and bad ones hard to reach.",
    daily: { easy: "Tidy 5 minutes", medium: "Tidy 10 minutes", hard: "Reset one room every day" },
    how: ["Set a timer and race it", "Everything gets a home", "Tidy before bed for an easy morning"],
    milestones: ["Declutterer", "Tidy Tiger", "Space Maker", "Calm Keeper", "Zen Home"],
    search: "decluttering tips daily reset",
  },
  {
    id: "nature",
    title: "Time in nature",
    emoji: "🌳",
    dimension: "environmental",
    mode: "build",
    book: "Ikigai · García & Miralles",
    idea: "Gardens, trees and fresh air are part of daily life in the places where people live longest.",
    daily: { easy: "5 minutes outside", medium: "15 minutes outside", hard: "30 minutes in green space" },
    how: ["Morning light on your face", "Eat lunch outside", "Water a plant every day"],
    milestones: ["Fresh Air", "Leaf Lover", "Tree Friend", "Forest Bather", "Earth Keeper"],
    search: "benefits of time in nature",
  },
  {
    id: "eat-frog",
    title: "Eat the frog",
    emoji: "🐸",
    dimension: "occupational",
    mode: "build",
    book: "Eat That Frog! · Brian Tracy",
    idea: "Do your hardest, most important task first, and the rest of the day feels light.",
    daily: { easy: "Name tomorrow's frog tonight", medium: "Do your frog before noon", hard: "Frog first, before email" },
    how: ["Write the frog down the night before", "Start with just 10 minutes", "No phone until it's done"],
    milestones: ["Frog Spotter", "Frog Catcher", "Frog Eater", "Frog Hunter", "Frog Legend"],
    search: "eat that frog productivity summary",
  },
  {
    id: "save",
    title: "Pay yourself first",
    emoji: "💰",
    dimension: "financial",
    mode: "build",
    book: "The Richest Man in Babylon · George S. Clason",
    idea: "Keep a part of everything you earn for yourself, before you spend the rest.",
    daily: { easy: "Note what you spent today", medium: "Put a little aside today", hard: "Save first, then spend" },
    how: ["Automate a small transfer", "Round up purchases into savings", "Track one day of spending"],
    milestones: ["Coin Keeper", "Penny Wise", "Stacker", "Nest Builder", "Wealth Gardener"],
    search: "pay yourself first saving money tips",
  },
  {
    id: "no-spend",
    title: "Fewer impulse buys",
    emoji: "🛍️",
    dimension: "financial",
    mode: "quit",
    book: "The Psychology of Money · Morgan Housel",
    idea: "Wealth is the money you don't spend; enough is a feeling worth learning.",
    daily: { easy: "Wait a day before buying", medium: "No impulse buys today", hard: "No-spend day (essentials only)" },
    how: ["Remove saved cards from shopping apps", "Keep a wish list and wait a week", "Unsubscribe from sale emails"],
    milestones: ["Pause Taker", "Mindful Spender", "Cart Closer", "Content Heart", "Enough Master"],
    search: "how to stop impulse buying",
  },
  {
    id: "less-scroll",
    title: "Less scrolling",
    emoji: "📵",
    dimension: "intellectual",
    mode: "quit",
    book: "Digital Minimalism · Cal Newport",
    idea: "Use technology on purpose, and reclaim the quiet time endless feeds take away.",
    daily: { easy: "No phone the first 30 min", medium: "Social apps under 30 min", hard: "Phone-free evening" },
    how: ["Move apps off your home screen", "Grayscale mode", "A book or walk ready instead"],
    milestones: ["Unplugged", "Present", "Free Mind", "Attention Keeper", "Digital Minimalist"],
    search: "digital minimalism reduce screen time",
  },
  {
    id: "quit-smoking",
    title: "Quit smoking",
    emoji: "🚭",
    dimension: "physical",
    mode: "quit",
    book: "The Easy Way to Stop Smoking · Allen Carr",
    idea: "Seeing that smoking gives you nothing makes stopping feel like freedom, not loss.",
    daily: { easy: "One fewer than yesterday", medium: "Smoke-free until evening", hard: "Smoke-free all day" },
    how: ["Know your triggers: coffee, stress, breaks", "Cravings pass in minutes: water or a walk", "Tell one friend"],
    milestones: ["Day One", "Breathing Easy", "Clearer Lungs", "Craving Crusher", "Free"],
    search: "quit smoking tips that work",
  },
  {
    id: "less-sugar",
    title: "Less sugar",
    emoji: "🍬",
    dimension: "physical",
    mode: "quit",
    book: "Atomic Habits · James Clear",
    idea: "Make it invisible: when the temptation isn't around, there's nothing to resist.",
    daily: { easy: "No sweets after dinner", medium: "No added-sugar snacks", hard: "No added sugar all day" },
    how: ["Don't keep it at home", "Fruit when cravings hit", "Eat a proper meal first"],
    milestones: ["Sweet Skipper", "Craving Tamer", "Clean Plate", "Steady Energy", "Sugar Free"],
    search: "how to quit sugar cravings",
  },
];
export const goalById = Object.fromEntries(GOALS.map((g) => [g.id, g])) as Record<string, GoalTemplate>;

/* ---------- Progress ---------- */

const CUSTOM_STOPS: [string, string, string, string, string] = ["Spark", "Kindle", "Glow", "Blaze", "Wildfire"];
const STOP_AT = [0.1, 0.25, 0.5, 0.75, 1];

export type Milestone = { name: string; at: number; reached: boolean };

export function levelOf(item: Item): Level {
  return item.level ?? "easy";
}

export function goalDays(item: Item): number {
  return item.goalDays ?? LEVELS[levelOf(item)].days;
}

/** Days counted towards the goal: every day done, gaps never reset it */
export function goalProgress(item: Item) {
  const total = goalDays(item);
  const done = Math.min(item.done.length, total);
  const names = (item.goal && goalById[item.goal]?.milestones) || CUSTOM_STOPS;
  const milestones: Milestone[] = STOP_AT.map((f, i) => {
    const at = Math.max(1, Math.round(total * f));
    return { name: names[i], at, reached: done >= at };
  });
  const next = milestones.find((m) => !m.reached) ?? null;
  const current = [...milestones].reverse().find((m) => m.reached) ?? null;
  return { total, done, pct: done / total, milestones, next, current, complete: done >= total };
}

/* ---------- XP, levels, the wheel ---------- */

const RANKS = [
  { at: 0, name: "Seed", emoji: "🌰" },
  { at: 100, name: "Sprout", emoji: "🌱" },
  { at: 300, name: "Sapling", emoji: "🌿" },
  { at: 600, name: "Blossom", emoji: "🌸" },
  { at: 1000, name: "Grove", emoji: "🌳" },
  { at: 1600, name: "Forest", emoji: "🌲" },
  { at: 2500, name: "Evergreen", emoji: "✨" },
];

/** XP from a goal: points per day done (by level) plus a bonus for each milestone reached */
export function goalXp(item: Item, since?: string): number {
  const per = LEVELS[levelOf(item)].xp;
  const days = since ? item.done.filter((k) => k >= since).length : item.done.length;
  const bonus = since ? 0 : goalProgress(item).milestones.filter((m) => m.reached).length * 50;
  return days * per + bonus;
}

export function totalXp(items: Item[]): number {
  return items.filter((i) => i.kind === "habit").reduce((n, i) => n + goalXp(i), 0);
}

/** XP earned this week (Monday onwards), for the league */
export function weekXp(items: Item[]): number {
  const d = new Date();
  const monday = dateKey(daysAgo((d.getDay() + 6) % 7));
  return items.filter((i) => i.kind === "habit").reduce((n, i) => n + goalXp(i, monday), 0);
}

export function rankFor(xp: number) {
  let i = 0;
  while (i + 1 < RANKS.length && xp >= RANKS[i + 1].at) i++;
  const next = RANKS[i + 1];
  return { ...RANKS[i], level: i + 1, next, progress: next ? (xp - RANKS[i].at) / (next.at - RANKS[i].at) : 1 };
}

/** Which part of the wheel a habit belongs to */
export function dimensionOf(item: Item): Dimension {
  if (item.goal && goalById[item.goal]) return goalById[item.goal].dimension;
  const map: Record<string, Dimension> = {
    body: "physical",
    selfcare: "physical",
    mind: "emotional",
    confidence: "emotional",
    learn: "intellectual",
    focus: "occupational",
    create: "occupational",
    people: "social",
    home: "environmental",
    money: "financial",
  };
  return map[item.pillar] ?? "emotional";
}

/** The wheel: how much care each part got in the last 30 days, 0–1 */
export function wheel(items: Item[]): Record<Dimension, number> {
  const since = dateKey(daysAgo(29));
  const out = Object.fromEntries(DIMENSIONS.map((d) => [d.id, 0])) as Record<Dimension, number>;
  for (const i of items.filter((x) => x.kind === "habit")) out[dimensionOf(i)] += i.done.filter((k) => k >= since).length;
  const max = Math.max(10, ...Object.values(out));
  for (const k of Object.keys(out) as Dimension[]) out[k] = out[k] / max;
  return out;
}

/** The most-viewed videos on YouTube for a goal (opens YouTube sorted by view count) */
export function videosUrl(search: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(search)}&sp=CAM%253D`;
}

/* ---------- Quotes ---------- */

export const QUOTES: { text: string; by: string }[] = [
  { text: "A journey of a thousand miles begins with a single step.", by: "Lao Tzu" },
  { text: "It does not matter how slowly you go as long as you do not stop.", by: "Confucius" },
  { text: "Well begun is half done.", by: "Aristotle" },
  { text: "Begin at once to live.", by: "Seneca" },
  { text: "Nature does not hurry, yet everything is accomplished.", by: "Lao Tzu" },
  { text: "Waste no more time arguing what a good man should be. Be one.", by: "Marcus Aurelius" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", by: "Proverb" },
  { text: "Small deeds done are better than great deeds planned.", by: "Peter Marshall" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", by: "Jim Ryun" },
  { text: "Early to bed and early to rise makes one healthy, wealthy and wise.", by: "Benjamin Franklin" },
  { text: "Getting 1% better each day adds up to something remarkable.", by: "Idea from Atomic Habits" },
  { text: "Your first hour shapes your whole day.", by: "Idea from The 5 AM Club" },
  { text: "Keep moving, keep friends close, keep a reason to wake up.", by: "Idea from Ikigai" },
  { text: "Do the hardest thing first, and the day gets lighter.", by: "Idea from Eat That Frog!" },
  { text: "You don't rise to your goals; you fall to your habits.", by: "Idea from Atomic Habits" },
  { text: "Missing once is an accident. Missing twice starts a new habit.", by: "Idea from Atomic Habits" },
];
