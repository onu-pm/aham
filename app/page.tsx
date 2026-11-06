"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BottomNav, type Tab } from "@/components/BottomNav";
import { Home } from "@/components/Home";
import { Grow } from "@/components/Grow";
import { Plan } from "@/components/Plan";
import { Mind } from "@/components/Mind";
import { Profile } from "@/components/Profile";
import { QuickAdd } from "@/components/QuickAdd";
import { useAham, type Item } from "@/lib/store";
import { useReminders } from "@/lib/reminders";

type Toast = { msg: string; undo?: () => void };

export default function Page() {
  const store = useAham();
  const [tab, setTab] = useState<Tab>("home");
  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((t: Toast, ms = 3500) => {
    clearTimeout(timer.current);
    setToast(t);
    timer.current = setTimeout(() => setToast(null), ms);
  }, []);

  const reminders = useReminders(store.state, store.todayKey, store.ready, (msg) => showToast({ msg }, 8000));

  const go = (t: Tab) => {
    setTab(t);
    setOpenId(null);
    window.scrollTo({ top: 0 });
  };

  // From Home, open the item where it lives: tasks in Plan, habits and goals in Grow
  const openItem = (i: Item) => {
    setTab(i.kind === "task" ? "plan" : "grow");
    setOpenId(i.id);
  };

  useEffect(() => {
    if (!openId) window.scrollTo({ top: 0 });
  }, [tab, openId]);

  const onDeleted = (removed: Item) => showToast({ msg: `Removed “${removed.title}”`, undo: () => store.restoreItem(removed) });

  return (
    <div className="min-h-dvh bg-[linear-gradient(to_bottom,var(--color-brand-100)_0,var(--color-canvas)_18rem)]">
      <main className="pt-safe mx-auto max-w-md px-4 pb-32 md:max-w-xl">
        {!store.ready ? (
          <div className="mt-8 h-64 animate-pulse rounded-3xl bg-white/60" />
        ) : (
          <div key={tab} className="animate-in">
            {tab === "home" ? (
              <Home store={store} onOpen={openItem} onGo={go} />
            ) : tab === "grow" ? (
              <Grow store={store} onAdd={() => setAdding(true)} openId={openId} setOpenId={setOpenId} onDeleted={onDeleted} />
            ) : tab === "plan" ? (
              <Plan store={store} openId={openId} setOpenId={setOpenId} onDeleted={onDeleted} notify={reminders.permission} onEnableNotify={reminders.enable} />
            ) : tab === "mind" ? (
              <Mind store={store} />
            ) : (
              <Profile store={store} notify={reminders.permission} onEnableNotify={reminders.enable} />
            )}
          </div>
        )}
      </main>

      <BottomNav tab={tab} onChange={go} />

      <QuickAdd open={adding} onClose={() => setAdding(false)} store={store} defaultKind={null} onAdded={(msg) => showToast({ msg })} />

      {toast && (
        <div role="status" className="animate-sheet fixed inset-x-0 bottom-28 z-50 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-full bg-ink py-2 pr-2 pl-5 text-white shadow-lg">
            <span className="font-bold">{toast.msg}</span>
            {toast.undo ? (
              <button
                type="button"
                onClick={() => {
                  toast.undo?.();
                  setToast(null);
                }}
                className="h-9 rounded-full bg-white/15 px-4 font-extrabold"
              >
                Undo
              </button>
            ) : (
              <button type="button" onClick={() => setToast(null)} className="h-9 rounded-full px-2 text-white/60" aria-label="Dismiss">
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
