# Google Play listing: drafts and answers

Everything below is a draft to paste into Play Console. Edit freely.

## Store listing

**App name** (30 max): `Aham: Habits, Plans & Mood`

**Short description** (80 max):
`Gentle habits, tiny steps and a calmer mind. Built for ADHD and busy brains.`

**Full description** (4000 max):

```
Aham is a calm, simple companion for building habits, planning your day and looking after your mind, made with neurodivergent people in mind (ADHD, autism and anyone whose brain feels busy).

🌱 GROW HABITS THAT STICK
Add anything in plain words, like "go to the gym" or "read a book", and Aham sorts it for you: the right pillar, an icon, and whether it's a habit or a goal. Turn any habit into a tiny daily routine that starts with a 2-minute version, so starting feels easy.

🗓️ PLAN YOUR DAY, ONE BLOCK AT A TIME
See your week at a glance, add tasks for any day, and set a time with a gentle reminder. Big tasks feel lighter when you break them into micro-tasks with one tap. Unfinished tasks roll over to today, with no guilt.

💭 MIND: MOOD AND REFLECTION
Check in with one tap, see your mood across the week or month, and write out whatever is on your mind. Shuffle a prompt when the page feels blank.

🏡 A HOME THAT ACTUALLY HELPS
• "Just this one thing": the single next tiny step
• Today's snapshot of habits, tasks and mood
• Your week at a glance
• Gentle insights, like your best streak or a pillar that's been quiet

🎯 TEN GROWTH PILLARS
Mind & calm, Body, Learn, Confidence, Work & focus, Home, People, Create, Money and Self-care.

🔒 PRIVATE BY DEFAULT
No account. No ads. No tracking. Everything stays on your phone, and you can back it up whenever you like.

Designed to be gentle: soft colours, friendly rounded text, adjustable text size, and no shame for missed days. Gaps are rest, not failure.

Aham supports focus and routines. It is not a medical device and does not replace professional care.
```

**Category:** Productivity (or Health & Fitness)
**Tags to consider:** Habit tracker, Planner, Self-care, Mood tracker

**Graphics** (in this folder):
- App icon 512×512: `play-icon-512.png`
- Feature graphic 1024×500: `feature-graphic-1024x500.png`
- Phone screenshots: still needed (at least 2; 4–8 recommended). Take them from the app on a phone or emulator: Home, Grow with a drawer open, Plan, Mind.

**Privacy policy URL:** `https://github.com/onu-pm/aham/blob/main/PRIVACY.md`
(Fill in the support email in PRIVACY.md first.)

## Data safety form (suggested answers)

Check these against the final build before submitting.

- **Does your app collect or share any of the required user data types?**
  - If the AI breakdown is **off** in the Android build (the current default): **No.**
  - If you turn AI breakdown **on**: the task or habit title is sent to your server and Anthropic to generate steps. Declare **App activity → Other user-generated content**, collected, **not shared for advertising**, purpose **App functionality**, **processed ephemerally**, sent **encrypted in transit**.
- **Is all user data encrypted in transit?** Yes (HTTPS only).
- **Can users request data deletion?** Data lives only on the device; uninstalling or using Me → Reset deletes it.
- **Account creation:** None.

## Other Play Console declarations

- **Ads:** No ads.
- **App access:** All features available without login.
- **Content rating questionnaire:** No violence, sexual content, gambling, user-to-user chat or location sharing. Expect "Everyone" / PEGI 3.
- **Target audience:** 18+ (or 13+). Avoid selecting under-13 age groups so the Families policy doesn't apply.
- **Health apps declaration:** If asked, describe Aham as a habit, planner and mood journaling app that does **not** provide medical diagnosis or treatment.
- **Notifications:** Used only for reminders the user sets.

## Closed testing (personal developer accounts)

- Recruit at least **12 testers** (aim for 15) with Gmail addresses.
- Create a **Closed testing** track, add testers by email list, upload the AAB, and share the opt-in link.
- Keep at least 12 opted in for **14 consecutive days**, and ask them to actually use the app.
- Then apply for production access from the Dashboard.
