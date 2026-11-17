import { dateKey } from "./store";

/* Reads a day and time out of everyday words, so "call mum tomorrow at 5pm"
   becomes "Call mum" on tomorrow's date at 17:00. Works the same for typed and spoken text. */

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const SHORT = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

export type Parsed = { title: string; date: string | null; time: string | null; end: string | null };

const pad = (n: number) => String(n).padStart(2, "0");

function toHM(h: number, m: number, mer: string | undefined): string | null {
  if (mer) {
    const pm = mer.startsWith("p");
    if (h < 1 || h > 12) return null;
    h = (h % 12) + (pm ? 12 : 0);
  }
  if (h > 23 || m > 59) return null;
  return `${pad(h)}:${pad(m)}`;
}

export function addMinutes(hm: string, mins: number): string {
  const [h, m] = hm.split(":").map(Number);
  const t = Math.min(23 * 60 + 59, h * 60 + m + mins);
  return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
}

const NUMBER_WORDS = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

/** Speech often writes times as words: "at five pm", "seven o'clock" */
function numbersFromWords(t: string): string {
  const w = NUMBER_WORDS.join("|");
  return t
    .replace(new RegExp(`\\b(${w})(?=\\s*(?:a\\.?m\\.?|p\\.?m\\.?|o'?clock)(?![a-z]))`, "gi"), (m) => String(NUMBER_WORDS.indexOf(m.toLowerCase()) + 1))
    .replace(new RegExp(`\\b(at)\\s+(${w})\\b`, "gi"), (_m, at, n) => `${at} ${NUMBER_WORDS.indexOf(n.toLowerCase()) + 1}`)
    .replace(/(\d{1,2})\s*o'?clock/gi, "at $1");
}

export function parseWhen(raw: string, base: Date = new Date()): Parsed {
  let text = ` ${numbersFromWords(raw)} `;
  let date: string | null = null;
  let time: string | null = null;
  let end: string | null = null;
  const at = (d: Date) => dateKey(d);
  const shift = (n: number) => {
    const d = new Date(base);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + n);
    return d;
  };
  const take = (re: RegExp, fn: (m: RegExpMatchArray) => boolean) => {
    const m = text.match(re);
    if (m && fn(m)) text = text.replace(m[0], " ");
  };

  // Days
  take(/\s(day after tomorrow)\s/i, () => ((date = at(shift(2))), true));
  take(/\s(today|tonight)\s/i, (m) => {
    date = at(shift(0));
    if (m[1].toLowerCase() === "tonight" && !time) time = "20:00";
    return true;
  });
  take(/\s(tomorrow|tmrw|tmr)\s/i, () => ((date = at(shift(1))), true));
  take(/\s(?:on\s+)?(next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday|sun|mon|tue|tues|wed|thu|thur|thurs|fri|sat)\s/i, (m) => {
    const word = m[2].toLowerCase();
    const idx = DAYS.indexOf(word) >= 0 ? DAYS.indexOf(word) : SHORT.indexOf(word.slice(0, 3));
    if (idx < 0) return false;
    let n = (idx - base.getDay() + 7) % 7;
    if (n === 0 || m[1]) n += 7;
    date = at(shift(n));
    return true;
  });
  take(/\s(?:on\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s/i, (m) => {
    const d = new Date(base.getFullYear(), MONTHS.indexOf(m[2].toLowerCase().slice(0, 3)), Number(m[1]), 12);
    if (dateKey(d) < dateKey(base)) d.setFullYear(d.getFullYear() + 1);
    date = at(d);
    return true;
  });
  take(/\sin\s+(\d+)\s+days?\s/i, (m) => ((date = at(shift(Number(m[1])))), true));

  // Times: "5-6pm", "from 5 to 6 pm", "at 5:30pm", "17:00", "5 pm", "at 9"
  take(/\s(?:from\s+)?(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?\s*(?:-|–|to|until|till)\s*(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)\s/i, (m) => {
    const mer2 = m[6].toLowerCase();
    const s = toHM(Number(m[1]), Number(m[2] ?? 0), (m[3] ?? mer2).toLowerCase());
    const e = toHM(Number(m[4]), Number(m[5] ?? 0), mer2);
    if (!s || !e) return false;
    time = s;
    end = e > s ? e : null;
    return true;
  });
  if (!time)
    take(/\s(?:at\s+|@\s*)?(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)\s/i, (m) => {
      const t = toHM(Number(m[1]), Number(m[2] ?? 0), m[3].toLowerCase());
      return t ? ((time = t), true) : false;
    });
  if (!time)
    take(/\s(?:at\s+)?(\d{1,2})[:.](\d{2})\s/i, (m) => {
      const t = toHM(Number(m[1]), Number(m[2]), undefined);
      return t ? ((time = t), true) : false;
    });
  if (!time)
    take(/\sat\s+(\d{1,2})\s/i, (m) => {
      // "at 9" means the next sensible 9: mornings until 7, then afternoons
      const h = Number(m[1]);
      if (h < 1 || h > 12) return false;
      time = `${pad(h < 7 ? h + 12 : h)}:00`;
      return true;
    });
  take(/\s(morning)\s/i, () => (time ? false : ((time = "09:00"), true)));
  take(/\s(afternoon)\s/i, () => (time ? false : ((time = "14:00"), true)));
  take(/\s(evening)\s/i, () => (time ? false : ((time = "18:00"), true)));
  take(/\sfor\s+(\d+)\s*(min|mins|minutes|hour|hours|hr|hrs|h)\s/i, (m) => {
    if (!time) return false;
    const n = Number(m[1]) * (m[2].toLowerCase().startsWith("h") ? 60 : 1);
    end = addMinutes(time, n);
    return true;
  });

  const title = text.replace(/\s+(on|at|by)\s*$/i, " ").replace(/\s+/g, " ").trim();
  return { title: title || raw.trim(), date, time, end };
}
