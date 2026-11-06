# Aham

A calm, mobile-first habit building and self-growth app for neurodivergent minds (ADHD, autism, cognitive disabilities).

- **Today**: mood check-in, today's progress, one "just this one thing" next step, journal prompt
- **Grow**: type anything and Aham sorts it into a pillar (Mind, Body, Learn, Confidence, Work, Home, People, Create, Money, Self-care) as a habit, task or goal; big tasks break into tiny steps
- **Journal**: notes-style entries with mood, pillar tags and folders
- **Me**: profile, text size, journey stats, backup

Data is stored on the device (localStorage). Nothing is uploaded except a task's title when you use AI breakdown.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. On a phone on the same Wi-Fi, use `http://<your-computer-ip>:3000`.

## AI task breakdown (optional)

Create `.env.local` with:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Without a key, "Break it into tiny steps" uses built-in templates.

## Stack

Next.js, React, Tailwind CSS, Lucide icons, Anthropic SDK.
