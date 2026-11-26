/* Advice that people commonly share in habit-building and quitting communities
   (for example r/getdisciplined, r/DecidingToBeBetter, r/nosurf, r/stopsmoking, r/stopdrinking).
   These are paraphrased summaries of recurring advice, written for Aham, not quotes from posts. */

export type HabitMode = "build" | "quit";

export type HabitIdea = {
  title: string;
  emoji: string;
  mode: HabitMode;
  match: RegExp;
  /** What people say actually helps */
  tips: string[];
  /** A small truth people find encouraging */
  note: string;
};

export const HABIT_IDEAS: HabitIdea[] = [
  {
    title: "Drink water",
    emoji: "💧",
    mode: "build",
    match: /water|hydrat/i,
    tips: ["Keep a filled bottle where you can see it", "Drink a glass right after you wake up", "Pair a glass with every meal"],
    note: "Most people find it sticks once the bottle is always in sight.",
  },
  {
    title: "Walk 10 min",
    emoji: "🚶",
    mode: "build",
    match: /walk|steps/i,
    tips: ["Walk straight after lunch or dinner", "Put your shoes by the door the night before", "Count it even if it's 5 minutes"],
    note: "A short walk on a bad day beats a perfect plan you skip.",
  },
  {
    title: "Exercise",
    emoji: "🏋️",
    mode: "build",
    match: /gym|exercis|workout|run|yoga|push.?up/i,
    tips: ["Lay out your clothes the night before", "Start so small it feels silly: one push-up", "Same time every day, so it needs no decision"],
    note: "Showing up matters more than the workout in the first month.",
  },
  {
    title: "Read 10 pages",
    emoji: "📖",
    mode: "build",
    match: /read|book/i,
    tips: ["Keep the book on your pillow", "Read before you're allowed to open your phone in bed", "Stop mid-chapter so starting again is easy"],
    note: "Ten pages a day is about a dozen books a year.",
  },
  {
    title: "Meditate 5 min",
    emoji: "🧘",
    mode: "build",
    match: /meditat|breath|mindful/i,
    tips: ["Start with 2 minutes, not 20", "Do it at the same spot each day", "A wandering mind is the practice, not a failure"],
    note: "People say the habit forms long before the calm does.",
  },
  {
    title: "Sleep by 11",
    emoji: "🌙",
    mode: "build",
    match: /sleep|bed|night/i,
    tips: ["Set an alarm for bedtime, not just waking", "Phone charges outside the bedroom", "Dim the lights an hour before"],
    note: "The morning gets easier when the night has a plan.",
  },
  {
    title: "Journal one line",
    emoji: "✍️",
    mode: "build",
    match: /journal|writ|gratitude|diary/i,
    tips: ["One line counts", "Write at the same time as another habit, like tea", "Keep the notebook open on the table"],
    note: "Small entries add up to a record you'll be glad to have.",
  },
  {
    title: "Take my meds",
    emoji: "💊",
    mode: "build",
    match: /med|pill|vitamin|tablet/i,
    tips: ["Keep them next to your toothbrush", "Use a weekly pill box", "Set a daily reminder in Aham"],
    note: "Linking it to something you already do makes it automatic.",
  },
  {
    title: "Quit smoking",
    emoji: "🚭",
    mode: "quit",
    match: /smok|cigar|vape|nicotine/i,
    tips: ["Know your triggers: coffee, stress, breaks", "Cravings pass in a few minutes: wait them out with water or a walk", "Tell one friend; it helps to be accountable"],
    note: "Many people say the first 3 days are the hardest, then it eases.",
  },
  {
    title: "Less sugar",
    emoji: "🍬",
    mode: "quit",
    match: /sugar|sweet|chocolate|dessert/i,
    tips: ["Don't keep it at home", "Eat a proper meal so cravings are weaker", "Swap for fruit, not willpower"],
    note: "Cravings usually drop noticeably after a couple of weeks.",
  },
  {
    title: "Less doomscrolling",
    emoji: "📵",
    mode: "quit",
    match: /scroll|phone|social|instagram|reel|youtube|screen/i,
    tips: ["Move the apps off your home screen", "Grayscale mode makes the phone boring", "Have a 'replacement' ready: a book, a walk"],
    note: "People find it's easier to make the phone less fun than to resist it.",
  },
  {
    title: "No alcohol",
    emoji: "🍷",
    mode: "quit",
    match: /alcohol|drink(ing)? less|beer|wine|sober/i,
    tips: ["Plan what you'll drink instead before you go out", "Notice how much better mornings feel", "Count the money saved"],
    note: "Every day counts, and slipping once doesn't erase the progress.",
  },
  {
    title: "No junk food",
    emoji: "🍟",
    mode: "quit",
    match: /junk|fast food|chips|fried/i,
    tips: ["Keep easy healthy snacks nearby", "Don't shop hungry", "Cook a little extra for tomorrow"],
    note: "Making the good choice the easy choice is most of the work.",
  },
  {
    title: "Stop snoozing",
    emoji: "⏰",
    mode: "quit",
    match: /snooz|wake|alarm/i,
    tips: ["Put the alarm across the room", "Open the curtains straight away", "Same wake-up time, even on weekends"],
    note: "It gets easier once your body learns the time.",
  },
  {
    title: "Less caffeine",
    emoji: "☕",
    mode: "quit",
    match: /caffeine|coffee|chai|tea|energy drink/i,
    tips: ["Cut down slowly to avoid headaches", "No caffeine after 2pm", "Swap one cup for water or herbal tea"],
    note: "A slow cut-down tends to stick better than stopping overnight.",
  },
  {
    title: "Stop nail biting",
    emoji: "💅",
    mode: "quit",
    match: /nail|bite|biting/i,
    tips: ["Notice when it happens: boredom, stress, screens", "Keep your hands busy with something", "Short nails leave less to bite"],
    note: "Spotting the trigger is half the battle, people say.",
  },
];

const GENERAL: Record<HabitMode, { tips: string[]; note: string }> = {
  build: {
    tips: ["Make it tiny: two minutes is enough to start", "Attach it to something you already do every day", "Never miss twice in a row"],
    note: "Consistency beats intensity, especially in the first few weeks.",
  },
  quit: {
    tips: ["Know what triggers it, and plan for that moment", "Replace it with something, don't just remove it", "A slip is one day, not the end. Keep going."],
    note: "Progress isn't erased by one bad day.",
  },
};

export function ideaFor(title: string, mode: HabitMode = "build"): { tips: string[]; note: string; emoji?: string } {
  const hit = HABIT_IDEAS.find((i) => i.match.test(title));
  return hit ?? GENERAL[mode];
}

/** A plant that grows with every day the habit is kept */
export const STAGES = [
  { at: 0, emoji: "🌰", name: "Seed" },
  { at: 1, emoji: "🌱", name: "Sprout" },
  { at: 3, emoji: "🌿", name: "Seedling" },
  { at: 7, emoji: "🪴", name: "Young plant" },
  { at: 21, emoji: "🌳", name: "Tree" },
  { at: 66, emoji: "🌸", name: "In bloom" },
];

export function stageFor(days: number) {
  let i = 0;
  while (i + 1 < STAGES.length && days >= STAGES[i + 1].at) i++;
  const next = STAGES[i + 1];
  return { ...STAGES[i], next, progress: next ? (days - STAGES[i].at) / (next.at - STAGES[i].at) : 1 };
}
