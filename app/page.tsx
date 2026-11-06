"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BottomNav, type Tab } from "@/components/BottomNav";
import { Home } from "@/components/Home";
import { Grow } from "@/components/Grow";
import { Journal, Composer, type Draft } from "@/components/Journal";
import { Profile } from "@/components/Profile";
import { QuickAdd } from "@/components/QuickAdd";
import { ItemSheet } from "@/components/ItemSheet";
import { useAham, type Item } from "@/lib/store";

type Toast = { msg: string; undo?: () => void };

export default function Page() {
  const store = useAham();
  const [tab, setTab] = useState<Tab>("home");
  const [adding, setAdding] = useState(false);
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [tab]);

  const showToast = useCallback((t: Toast) => {
    clearTimeout(timer.current);
    setToast(t);
    timer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const item = store.state.items.find((i) => i.id === openItem);
  const write = (d: Draft) => {
    setAdding(false);
    setDraft(d);
  };

  return (
    <div className="min-h-dvh bg-[linear-gradient(to_bottom,var(--color-brand-100)_0,var(--color-canvas)_20rem)]">
      <main className="pt-safe mx-auto max-w-md px-4 pb-36 md:max-w-2xl">
        {!store.ready ? (
          <div className="mt-8 h-64 animate-pulse rounded-[1.75rem] bg-white/60" />
        ) : tab === "home" ? (
          <Home
            store={store}
            onAdd={() => setAdding(true)}
            onOpen={setOpenItem}
            onProfile={() => setTab("me")}
            onWrite={(o) => write({ title: o.title, mood: o.mood })}
          />
        ) : tab === "grow" ? (
          <Grow store={store} onAdd={() => setAdding(true)} onOpen={(id) => setOpenItem(id)} />
        ) : tab === "journal" ? (
          <Journal store={store} onWrite={write} />
        ) : (
          <Profile store={store} />
        )}
      </main>

      <BottomNav tab={tab} onChange={setTab} onAdd={() => setAdding(true)} />

      <QuickAdd
        open={adding}
        onClose={() => setAdding(false)}
        store={store}
        onAdded={(msg) => showToast({ msg })}
        onJournal={() => write({})}
      />
      {item && (
        <ItemSheet
          item={item}
          store={store}
          onClose={() => setOpenItem(null)}
          onDeleted={(removed: Item) => showToast({ msg: `Removed “${removed.title}”`, undo: () => store.restoreItem(removed) })}
        />
      )}
      <Composer draft={draft} store={store} onClose={() => setDraft(null)} />

      {toast && (
        <div role="status" className="animate-sheet fixed inset-x-0 bottom-28 z-50 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-full bg-ink py-2 pr-2 pl-5 text-white shadow-lg">
            <span className="font-medium">{toast.msg}</span>
            {toast.undo ? (
              <button
                type="button"
                onClick={() => {
                  toast.undo?.();
                  setToast(null);
                }}
                className="h-9 rounded-full bg-white/15 px-4 font-semibold"
              >
                Undo
              </button>
            ) : (
              <span className="w-2" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
