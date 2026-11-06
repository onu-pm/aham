// Small offline templates so "Break it down" always works, even without AI
const TASKS: [RegExp, string[]][] = [
  [/clean|tidy|declutter|room/, ["Put on one song", "Pick up anything on the floor", "Clear one surface", "Take out the trash", "Put 5 things back in place"]],
  [/laundry|clothes/, ["Gather clothes into one pile", "Load the machine and start it", "Set a timer for when it ends", "Hang or dry everything", "Fold and put away one load"]],
  [/email|inbox/, ["Open your inbox", "Delete obvious junk", "Reply to one quick email", "Star anything that needs time", "Archive the rest you've read"]],
  [/groc|shopping/, ["Check the fridge and cupboards", "Write a short list", "Grab your bag and keys", "Buy what's on the list", "Put everything away"]],
  [/pay|bill/, ["Find the bill or login", "Check the amount and date", "Make the payment", "Save the confirmation"]],
  [/call|phone/, ["Find the number", "Write one line you want to say", "Take a breath and dial", "Note anything to follow up"]],
  [/apply|job|resume|cv/, ["Open the job listing", "Update one line of your CV", "Write a 3-sentence intro", "Submit the application"]],
  [/study|revise|homework|assignment|essay|report/, ["Open the file or notes", "Write the title and headings", "Do 10 focused minutes", "Take a 3 minute break", "Do one more 10 minutes"]],
];

// Habits become a repeatable routine: a cue, a 2-minute start, then the rest
const HABITS: [RegExp, string[]][] = [
  [/gym|workout|exercise|lift/, ["Pack your gym bag the night before", "Put on your workout clothes", "Do a 5-minute warm-up", "Do your main workout"]],
  [/run|jog|walk/, ["Put your shoes by the door", "Step outside", "Walk or run for 2 minutes", "Keep going if it feels good"]],
  [/meditat|breath|calm/, ["Sit somewhere comfy", "Set a 2-minute timer", "Breathe in for 4, out for 6", "Notice how you feel"]],
  [/read|book/, ["Put the book where you'll see it", "Read one page", "Keep going for 10 minutes", "Mark where you stopped"]],
  [/water|hydrat/, ["Fill a bottle in the morning", "Drink a glass with breakfast", "Refill at lunch", "Finish it by evening"]],
  [/morning|routine/, ["Drink a glass of water", "Open the curtains", "Stretch for 2 minutes", "Look at today's plan"]],
  [/study|learn|course|language/, ["Open the lesson or app", "Do 2 minutes", "Keep going for 10 minutes", "Write one thing you learned"]],
  [/journal|write|gratitude/, ["Open your journal", "Write one sentence", "Add anything else on your mind"]],
  [/speech|speak|affirmation|confiden/, ["Stand in front of a mirror", "Take a slow breath", "Speak for 2 minutes", "Note one thing that went well"]],
  [/sleep|bed/, ["Set a wind-down alarm", "Put your phone away", "Dim the lights", "Get into bed"]],
];

export function localBreakdown(title: string, kind: "task" | "habit" = "task"): string[] {
  const t = title.toLowerCase();
  for (const [re, steps] of kind === "habit" ? HABITS : TASKS) if (re.test(t)) return steps;
  return kind === "habit"
    ? ["Pick a time and place for it", "Do the tiniest 2-minute version", "Keep going if it feels okay", "Tick it off and notice how you feel"]
    : ["Get what you need in one place", "Do the easiest 2 minute part", "Keep going for 10 minutes", "Take a short break", "Finish the last bit and tick it off"];
}

export async function breakDown(title: string, kind: "task" | "habit" = "task"): Promise<{ steps: string[]; ai: boolean }> {
  try {
    const res = await fetch("/api/breakdown", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: title, kind }),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.steps) && data.steps.length) return { steps: data.steps, ai: true };
    }
  } catch {
    // offline or server unavailable
  }
  return { steps: localBreakdown(title, kind), ai: false };
}
