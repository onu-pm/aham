"use client";

import { useCallback, useEffect, useState } from "react";
import { detect, type ItemKind, type PillarId } from "./pillars";

export type Step = { id: string; text: string; done: boolean };

export type Item = {
  id: string;
  title: string;
  emoji: string;
  pillar: PillarId;
  kind: ItemKind;
  createdAt: number;
  /** Habits/goals: date keys checked. Tasks: the date it was completed (at most one). */
  done: string[];
  steps: Step[];
  /** Goals only */
  unit: string | null;
  total: number | null;
  progress: number;
  /** Tasks: the day it's planned for. Habits: unused (they repeat daily). */
  date?: string | null;
  /** "HH:MM", optional. Tasks: when. Habits: daily reminder time. */
  time?: string | null;
  remind?: boolean;
  /** Habits: which micro-steps were done on each day, since they reset daily */
  stepLog?: Record<string, string[]>;
  /** Planner: "HH:MM" end time, so a task shows as a block on the calendar */
  end?: string | null;
  /** Habits: how many times a day counts as "met" (default 1), and the tally per day */
  target?: number;
  counts?: Record<string, number>;
  /** Habits: building something up, or quitting something (days clean) */
  mode?: "build" | "quit";
};

/** A to-do; an optional "HH:MM" time makes it a reminder on its list's day */
export type ListItem = { id: string; text: string; done: boolean; time?: string | null };
/** A to-do list stamped with the day it belongs to */
export type TodoList = { id: string; title: string; date: string; createdAt: number; items: ListItem[]; emoji?: string };

/** Whether a step is done; habit steps are tracked per day */
export function stepDone(item: Item, stepId: string, key: string): boolean {
  return item.kind === "habit" ? !!item.stepLog?.[key]?.includes(stepId) : !!item.steps.find((s) => s.id === stepId)?.done;
}

export type Entry = {
  id: string;
  title: string;
  body: string;
  mood: number | null;
  pillar: PillarId | null;
  folderId: string | null;
  createdAt: number;
  updatedAt: number;
};

export type Folder = { id: string; name: string; emoji: string };

export type TextSize = 0 | 1 | 2;
export const TEXT_SIZES_PX = [16, 17.5, 19];

export type Profile = { name: string; avatar: string; textSize: TextSize; onboarded: boolean };

export type State = {
  items: Item[];
  lists: TodoList[];
  entries: Entry[];
  folders: Folder[];
  /** Mood check-in per day, 0-4 */
  moods: Record<string, number>;
  profile: Profile;
};

const STORAGE_KEY = "aham:v2";
const LEGACY_KEY = "aham:v1";

export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

export function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function seedState(): State {
  return {
    // New people pick their own starters in the welcome screen
    items: [],
    lists: [],
    entries: [],
    folders: [
      { id: "f-gratitude", name: "Gratitude", emoji: "🙏" },
      { id: "f-brain", name: "Brain dump", emoji: "🧠" },
    ],
    moods: {},
    profile: { name: "", avatar: "🌱", textSize: 0, onboarded: false },
  };
}

/** Accepts a saved or backed-up state, filling anything missing; returns null if it isn't Aham data */
export function parseState(data: unknown): State | null {
  if (!data || typeof data !== "object" || !Array.isArray((data as State).items)) return null;
  const d = data as Partial<State>;
  const seed = seedState();
  // Anyone with saved data has already been welcomed
  return { ...seed, ...d, lists: Array.isArray(d.lists) ? d.lists : [], profile: { ...seed.profile, onboarded: true, ...d.profile } } as State;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// Carries habits, books, courses and parked thoughts over from the first version
function migrateLegacy(old: any): State {
  const s = seedState();
  s.items = (old.items ?? []).map((i: any): Item => {
    const d = detect(i.title ?? "");
    const isGoal = i.kind === "book" || i.kind === "course";
    return {
      id: i.id ?? uid(),
      title: i.title ?? "Untitled",
      emoji: i.emoji ?? d.emoji,
      pillar: isGoal ? "learn" : d.pillar,
      kind: isGoal ? "goal" : "habit",
      createdAt: i.createdAt ?? Date.now(),
      done: i.done ?? [],
      steps: [],
      unit: i.kind === "book" ? "pages" : i.kind === "course" ? "lessons" : null,
      total: i.total ?? null,
      progress: i.progress ?? 0,
    };
  });
  s.entries = (old.thoughts ?? []).map(
    (t: any): Entry => ({
      id: t.id ?? uid(),
      title: "",
      body: t.text ?? "",
      mood: null,
      pillar: "mind",
      folderId: "f-brain",
      createdAt: t.createdAt ?? Date.now(),
      updatedAt: t.createdAt ?? Date.now(),
    }),
  );
  if (typeof old.textSize === "number") s.profile.textSize = old.textSize as TextSize;
  s.profile.onboarded = true;
  return s;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return parseState(JSON.parse(raw)) ?? seedState();
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) return migrateLegacy(JSON.parse(legacy));
  } catch {
    // fall through to a fresh start
  }
  return seedState();
}

export type NewItem = Pick<Item, "title" | "emoji" | "pillar" | "kind"> &
  Partial<Pick<Item, "steps" | "unit" | "total" | "date" | "time" | "end" | "remind" | "target" | "mode">>;
export type NewEntry = Pick<Entry, "title" | "body" | "mood" | "pillar" | "folderId">;

export function useAham() {
  const [state, setState] = useState<State>(() => ({ ...seedState(), items: [] }));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage unavailable (private mode); state stays in memory
    }
  }, [state, ready]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${TEXT_SIZES_PX[state.profile.textSize]}px`;
  }, [state.profile.textSize]);

  const todayKey = dateKey();

  const mapItem = (id: string, fn: (i: Item) => Item) =>
    setState((s) => ({ ...s, items: s.items.map((i) => (i.id === id ? fn(i) : i)) }));

  const addItem = useCallback((n: NewItem) => {
    const item: Item = {
      steps: [],
      unit: null,
      total: null,
      ...n,
      id: uid(),
      createdAt: Date.now(),
      done: [],
      progress: 0,
    };
    setState((s) => ({ ...s, items: [item, ...s.items] }));
    return item.id;
  }, []);

  const updateItem = useCallback((id: string, patch: Partial<Item>) => mapItem(id, (i) => ({ ...i, ...patch })), []);

  const deleteItem = useCallback((id: string) => setState((s) => ({ ...s, items: s.items.filter((i) => i.id !== id) })), []);

  const restoreItem = useCallback((item: Item) => setState((s) => ({ ...s, items: [item, ...s.items.filter((i) => i.id !== item.id)] })), []);

  const toggleItemDay = useCallback(
    (id: string, key: string = todayKey) =>
      mapItem(id, (i) => {
        if (i.kind === "task") return { ...i, done: i.done.length ? [] : [key] };
        const on = i.done.includes(key);
        const counts = i.kind === "habit" && (i.target ?? 1) > 1 ? { ...i.counts, [key]: on ? 0 : (i.target ?? 1) } : i.counts;
        return { ...i, counts, done: on ? i.done.filter((k) => k !== key) : [...i.done, key] };
      }),
    [todayKey],
  );

  const toggleStep = useCallback(
    (id: string, stepId: string) =>
      mapItem(id, (i) => {
        if (i.kind === "habit") {
          // Habit micro-steps reset each day; finishing them all checks off today
          const log = i.stepLog?.[todayKey] ?? [];
          const next = log.includes(stepId) ? log.filter((s) => s !== stepId) : [...log, stepId];
          const allDone = i.steps.length > 0 && i.steps.every((st) => next.includes(st.id));
          const wasAllDone = i.steps.length > 0 && i.steps.every((st) => log.includes(st.id));
          // Only un-check the day if it was checked by finishing the steps
          const done = allDone ? [...new Set([...i.done, todayKey])] : wasAllDone ? i.done.filter((k) => k !== todayKey) : i.done;
          return { ...i, stepLog: { ...i.stepLog, [todayKey]: next }, done };
        }
        const steps = i.steps.map((st) => (st.id === stepId ? { ...st, done: !st.done } : st));
        // Finishing the last step finishes the task
        const allDone = steps.length > 0 && steps.every((st) => st.done);
        return { ...i, steps, done: i.kind === "task" ? (allDone ? [todayKey] : []) : i.done };
      }),
    [todayKey],
  );

  /** Habits with a daily target: add or take away one, and mark the day met once the target is reached */
  const bumpHabit = useCallback(
    (id: string, delta: number, key: string = todayKey) =>
      mapItem(id, (i) => {
        const target = i.target ?? 1;
        const n = Math.max(0, Math.min(target * 3, (i.counts?.[key] ?? 0) + delta));
        const met = n >= target;
        const done = met ? [...new Set([...i.done, key])] : i.done.filter((k) => k !== key);
        return { ...i, counts: { ...i.counts, [key]: n }, done };
      }),
    [todayKey],
  );

  /* ---------- to-do lists ---------- */

  const mapList = (id: string, fn: (l: TodoList) => TodoList) =>
    setState((s) => ({ ...s, lists: s.lists.map((l) => (l.id === id ? fn(l) : l)) }));

  const addList = useCallback((title: string, date: string, texts: string[] = [], emoji?: string) => {
    const list: TodoList = { id: uid(), title, date, emoji, createdAt: Date.now(), items: texts.map((text) => ({ id: uid(), text, done: false })) };
    setState((s) => ({ ...s, lists: [list, ...s.lists] }));
    return list.id;
  }, []);

  const updateList = useCallback((id: string, patch: Partial<Pick<TodoList, "title" | "date">>) => mapList(id, (l) => ({ ...l, ...patch })), []);

  const deleteList = useCallback((id: string) => setState((s) => ({ ...s, lists: s.lists.filter((l) => l.id !== id) })), []);

  const restoreList = useCallback((list: TodoList) => setState((s) => ({ ...s, lists: [list, ...s.lists.filter((l) => l.id !== list.id)] })), []);

  const addListItem = useCallback(
    (id: string, text: string, time: string | null = null) => mapList(id, (l) => ({ ...l, items: [...l.items, { id: uid(), text, done: false, time }] })),
    [],
  );

  const setListItemTime = useCallback(
    (id: string, itemId: string, time: string | null) => mapList(id, (l) => ({ ...l, items: l.items.map((x) => (x.id === itemId ? { ...x, time } : x)) })),
    [],
  );

  const toggleListItem = useCallback(
    (id: string, itemId: string) => mapList(id, (l) => ({ ...l, items: l.items.map((x) => (x.id === itemId ? { ...x, done: !x.done } : x)) })),
    [],
  );

  const editListItem = useCallback(
    (id: string, itemId: string, text: string) => mapList(id, (l) => ({ ...l, items: l.items.map((x) => (x.id === itemId ? { ...x, text } : x)) })),
    [],
  );

  const removeListItem = useCallback((id: string, itemId: string) => mapList(id, (l) => ({ ...l, items: l.items.filter((x) => x.id !== itemId) })), []);

  /** Carries a list's unchecked items onto a list for another day */
  const carryOver = useCallback((fromId: string, toDate: string) => {
    setState((s) => {
      const from = s.lists.find((l) => l.id === fromId);
      if (!from) return s;
      const left = from.items.filter((x) => !x.done);
      if (!left.length) return s;
      const rest = s.lists.map((l) => (l.id === fromId ? { ...l, items: l.items.filter((x) => x.done) } : l));
      const target = rest.find((l) => l.date === toDate && l.title === from.title);
      const moved = left.map((x) => ({ ...x, id: uid() }));
      if (target) return { ...s, lists: rest.map((l) => (l.id === target.id ? { ...l, items: [...l.items, ...moved] } : l)) };
      return { ...s, lists: [{ id: uid(), title: from.title, emoji: from.emoji, date: toDate, createdAt: Date.now(), items: moved }, ...rest] };
    });
  }, []);

  const setSteps = useCallback((id: string, texts: string[]) => {
    mapItem(id, (i) => ({ ...i, steps: [...i.steps, ...texts.map((text) => ({ id: uid(), text, done: false }))] }));
  }, []);

  const removeStep = useCallback(
    (id: string, stepId: string) => mapItem(id, (i) => ({ ...i, steps: i.steps.filter((st) => st.id !== stepId) })),
    [],
  );

  const setMood = useCallback(
    (mood: number | null, key: string = todayKey) =>
      setState((s) => {
        const moods = { ...s.moods };
        if (mood == null) delete moods[key];
        else moods[key] = mood;
        return { ...s, moods };
      }),
    [todayKey],
  );

  const saveEntry = useCallback((e: NewEntry, id?: string) => {
    const now = Date.now();
    setState((s) =>
      id
        ? { ...s, entries: s.entries.map((x) => (x.id === id ? { ...x, ...e, updatedAt: now } : x)) }
        : { ...s, entries: [{ ...e, id: uid(), createdAt: now, updatedAt: now }, ...s.entries] },
    );
  }, []);

  const deleteEntry = useCallback((id: string) => setState((s) => ({ ...s, entries: s.entries.filter((x) => x.id !== id) })), []);

  const addFolder = useCallback((name: string, emoji: string) => {
    const f: Folder = { id: uid(), name, emoji };
    setState((s) => ({ ...s, folders: [...s.folders, f] }));
    return f.id;
  }, []);

  const deleteFolder = useCallback(
    (id: string) =>
      setState((s) => ({
        ...s,
        folders: s.folders.filter((f) => f.id !== id),
        // Entries stay; they just move back to "All"
        entries: s.entries.map((e) => (e.folderId === id ? { ...e, folderId: null } : e)),
      })),
    [],
  );

  const setProfile = useCallback((patch: Partial<Profile>) => setState((s) => ({ ...s, profile: { ...s.profile, ...patch } })), []);

  const resetAll = useCallback(() => setState(seedState()), []);

  const replaceAll = useCallback((next: State) => setState(next), []);

  return {
    state,
    ready,
    todayKey,
    addItem,
    updateItem,
    deleteItem,
    restoreItem,
    toggleItemDay,
    toggleStep,
    bumpHabit,
    addList,
    updateList,
    deleteList,
    restoreList,
    addListItem,
    setListItemTime,
    toggleListItem,
    editListItem,
    removeListItem,
    carryOver,
    setSteps,
    removeStep,
    setMood,
    saveEntry,
    deleteEntry,
    addFolder,
    deleteFolder,
    setProfile,
    resetAll,
    replaceAll,
  };
}

export type Store = ReturnType<typeof useAham>;

/* ---------- derived ---------- */

export function isDoneOn(item: Item, key: string): boolean {
  return item.done.includes(key);
}

/** The day a task belongs to: its planned date, else today while open */
export function taskDay(item: Item, todayKey: string): string {
  if (item.done.length) return item.done[0];
  const d = item.date ?? todayKey;
  // Unfinished tasks from the past roll forward to today
  return d < todayKey ? todayKey : d;
}

/** What shows on a given day: habits and goals always; tasks on their day */
export function itemsForDay(items: Item[], key: string, todayKey: string): Item[] {
  return items.filter((i) => (i.kind !== "task" ? true : taskDay(i, todayKey) === key));
}

export function byTime(a: Item, b: Item): number {
  return (a.time ?? "99:99").localeCompare(b.time ?? "99:99");
}

function streak(pred: (key: string) => boolean): number {
  const start = pred(dateKey(daysAgo(0))) ? 0 : 1;
  let n = 0;
  while (pred(dateKey(daysAgo(start + n)))) n++;
  return n;
}

export function itemStreak(item: Item): number {
  const set = new Set(item.done);
  return streak((k) => set.has(k));
}

export function itemThisWeek(item: Item): number {
  const set = new Set(item.done);
  let n = 0;
  for (let i = 0; i < 7; i++) if (set.has(dateKey(daysAgo(i)))) n++;
  return n;
}

/** Habit tally for a day; a habit without a target counts 1 when checked */
export function habitCount(item: Item, key: string): number {
  return item.counts?.[key] ?? (item.done.includes(key) ? (item.target ?? 1) : 0);
}

export function activeDays(state: State): number {
  const keys = new Set<string>(Object.keys(state.moods));
  state.lists.forEach((l) => l.items.some((x) => x.done) && keys.add(l.date));
  state.items.forEach((i) => i.done.forEach((k) => keys.add(k)));
  state.entries.forEach((e) => keys.add(dateKey(new Date(e.createdAt))));
  return keys.size;
}

export function showingUpStreak(state: State): number {
  const keys = new Set<string>(Object.keys(state.moods));
  state.lists.forEach((l) => l.items.some((x) => x.done) && keys.add(l.date));
  state.items.forEach((i) => i.done.forEach((k) => keys.add(k)));
  state.entries.forEach((e) => keys.add(dateKey(new Date(e.createdAt))));
  return streak((k) => keys.has(k));
}
