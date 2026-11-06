// Small offline templates so "Break it down" always works, even without AI
const TEMPLATES: [RegExp, string[]][] = [
  [/clean|tidy|declutter|room/, ["Put on one song", "Pick up anything on the floor", "Clear one surface", "Take out the trash", "Put 5 things back in place"]],
  [/laundry|clothes/, ["Gather clothes into one pile", "Load the machine and start it", "Set a timer for when it ends", "Hang or dry everything", "Fold and put away one load"]],
  [/email|inbox/, ["Open your inbox", "Delete obvious junk", "Reply to one quick email", "Star anything that needs time", "Archive the rest you've read"]],
  [/groc|shopping/, ["Check the fridge and cupboards", "Write a short list", "Grab your bag and keys", "Buy what's on the list", "Put everything away"]],
  [/pay|bill/, ["Find the bill or login", "Check the amount and date", "Make the payment", "Save the confirmation"]],
  [/call|phone/, ["Find the number", "Write one line you want to say", "Take a breath and dial", "Note anything to follow up"]],
  [/apply|job|resume|cv/, ["Open the job listing", "Update one line of your CV", "Write a 3-sentence intro", "Submit the application"]],
  [/study|revise|homework|assignment|essay|report/, ["Open the file or notes", "Write the title and headings", "Do 10 focused minutes", "Take a 3 minute break", "Do one more 10 minutes"]],
];

export function localBreakdown(task: string): string[] {
  const t = task.toLowerCase();
  for (const [re, steps] of TEMPLATES) if (re.test(t)) return steps;
  return ["Get what you need in one place", "Do the easiest 2 minute part", "Keep going for 10 minutes", "Take a short break", "Finish the last bit and tick it off"];
}

export async function breakDown(task: string): Promise<{ steps: string[]; ai: boolean }> {
  try {
    const res = await fetch("/api/breakdown", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task }),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.steps) && data.steps.length) return { steps: data.steps, ai: true };
    }
  } catch {
    // offline or server unavailable
  }
  return { steps: localBreakdown(task), ai: false };
}
