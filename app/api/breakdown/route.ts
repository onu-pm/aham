import Anthropic from "@anthropic-ai/sdk";

const SYSTEMS = {
  task: `You help people with ADHD and other neurodivergent minds start tasks that feel too big.
Break the user's task into 3 to 7 tiny, concrete, physical next actions, in order.
Each step should take under 10 minutes, start with a verb, and be at most 8 words.
Make the first step almost effortless so it is easy to begin. Keep the tone kind and plain.`,
  habit: `You help people with ADHD and other neurodivergent minds build habits that stick.
Turn the user's habit into a short daily routine of 2 to 5 tiny micro-steps they repeat each day, in order.
Step one is the cue or setup, and step two is a 2-minute starter version of the habit.
Each step starts with a verb and is at most 8 words. Keep the tone kind and plain.`,
};

const schema = {
  type: "object",
  properties: {
    steps: { type: "array", items: { type: "string" } },
  },
  required: ["steps"],
  additionalProperties: false,
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const task = typeof body?.task === "string" ? body.task.trim() : "";
  const kind: keyof typeof SYSTEMS = body?.kind === "habit" ? "habit" : "task";
  if (!task || task.length > 300) return Response.json({ error: "Send a task under 300 characters." }, { status: 400 });

  let client: Anthropic;
  try {
    client = new Anthropic();
  } catch {
    // No credentials configured; the app falls back to its built-in breakdown
    return Response.json({ error: "AI not configured" }, { status: 503 });
  }

  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema } },
      system: SYSTEMS[kind],
      messages: [{ role: "user", content: task }],
    });

    if (response.stop_reason === "refusal") return Response.json({ error: "Could not break that down." }, { status: 422 });

    const text = response.content.find((b) => b.type === "text");
    const parsed = text && text.type === "text" ? JSON.parse(text.text) : null;
    const steps: string[] = Array.isArray(parsed?.steps)
      ? parsed.steps.filter((s: unknown): s is string => typeof s === "string" && s.trim() !== "").slice(0, 7)
      : [];
    if (!steps.length) return Response.json({ error: "Empty breakdown" }, { status: 502 });
    return Response.json({ steps });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) return Response.json({ error: "AI not configured" }, { status: 503 });
    if (error instanceof Anthropic.RateLimitError) return Response.json({ error: "Busy, try again" }, { status: 429 });
    if (error instanceof Anthropic.APIError) return Response.json({ error: error.message }, { status: 502 });
    // Client-side SDK errors (e.g. no credentials found) mean AI isn't set up here
    console.error("breakdown:", error instanceof Error ? error.message : error);
    return Response.json({ error: "AI not configured" }, { status: 503 });
  }
}
