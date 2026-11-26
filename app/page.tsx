"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BottomNav, type Tab } from "@/components/BottomNav";
import { Home } from "@/components/Home";
import { Grow } from "@/components/Grow";
import { Plan } from "@/components/Plan";
import { Lists } from "@/components/Lists";
import { Profile } from "@/components/Profile";
import { Welcome } from "@/components/Welcome";
import { useAham, type Item, type TodoList } from "@/lib/store";
import { useReminders } from "@/lib/reminders";
import { useAuth } from "@/lib/auth";
import { useCloudSync } from "@/lib/sync";
import { AuthScreen, NewPassword } from "@/components/Auth";
import { Splash } from "@/components/Splash";
import { Loading } from "@/components/Figures";

type Toast = { msg: string; undo?: () => void };

export default function Page() {
  const store = useAham();
  const auth = useAuth();
  const sync = useCloudSync(store, auth.state);
  const signedIn = auth.state.status === "signedIn";
  // With accounts switched on, the app waits for sign-in and the account's data
  const gated = auth.state.status !== "off" && !(signedIn && sync.loaded);
  const meta = auth.state.status === "signedIn" ? auth.state.session.user.user_metadata : undefined;
  const accountName = (meta?.name as string | undefined) || (meta?.full_name as string | undefined);

  // A new account starts with the name it signed up with
  useEffect(() => {
    if (sync.loaded && accountName && !store.state.profile.name) store.setProfile({ name: accountName.split(" ")[0] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sync.loaded, accountName]);
  const [splash, setSplash] = useState(true);
  const endSplash = useCallback(() => setSplash(false), []);
  const [tab, setTab] = useState<Tab>("home");
  const [openId, setOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((t: Toast, ms = 3500) => {
    clearTimeout(timer.current);
    setToast(t);
    timer.current = setTimeout(() => setToast(null), ms);
  }, []);

  const reminders = useReminders(store.state, store.todayKey, store.ready, (msg) => showToast({ msg }, 8000));

  // Pages glide in from the side of the tab you came from
  const ORDER: Tab[] = ["lists", "plan", "home", "grow", "me"];
  const [dir, setDir] = useState<"left" | "right">("right");
  const go = (t: Tab) => {
    setDir(ORDER.indexOf(t) < ORDER.indexOf(tab) ? "left" : "right");
    setTab(t);
    setOpenId(null);
    window.scrollTo({ top: 0 });
  };

  // From Home, open the item where it lives: tasks in Plan, habits and goals in Grow
  const openItem = (i: Item) => {
    const t: Tab = i.kind === "task" ? "plan" : "grow";
    setDir(ORDER.indexOf(t) < ORDER.indexOf(tab) ? "left" : "right");
    setTab(t);
    setOpenId(i.id);
  };

  useEffect(() => {
    if (!openId) window.scrollTo({ top: 0 });
  }, [tab, openId]);

  const onDeleted = (removed: Item) => showToast({ msg: `Removed “${removed.title}”`, undo: () => store.restoreItem(removed) });
  const onListRemoved = (removed: TodoList) => showToast({ msg: `Deleted “${removed.title}”`, undo: () => store.restoreList(removed) });

  return (
    <div className="min-h-dvh bg-page">
      <main className="pt-safe mx-auto max-w-md px-4 pb-32 md:max-w-xl">
        {!store.ready || gated ? (
          <div className="pt-16">
            <Loading text={signedIn ? "Bringing your sunshine back…" : "Getting your day ready…"} />
          </div>
        ) : (
          <div key={tab} className={dir === "left" ? "page-left" : "page-right"}>
            {tab === "home" ? (
              <Home store={store} onOpen={openItem} onGo={go} />
            ) : tab === "grow" ? (
              <Grow store={store} openId={openId} setOpenId={setOpenId} onDeleted={onDeleted} userId={auth.state.status === "signedIn" ? auth.state.session.user.id : null} />
            ) : tab === "plan" ? (
              <Plan store={store} openId={openId} setOpenId={setOpenId} onDeleted={onDeleted} notify={reminders.permission} onEnableNotify={reminders.enable} />
            ) : tab === "lists" ? (
              <Lists store={store} onRemoved={onListRemoved} />
            ) : (
              <Profile store={store} notify={reminders.permission} onEnableNotify={reminders.enable} auth={auth} syncStatus={sync.status} />
            )}
          </div>
        )}
      </main>

      <BottomNav tab={tab} onChange={go} />

      {auth.state.status === "signedOut" && <AuthScreen auth={auth} />}
      {auth.recovering && signedIn && <NewPassword auth={auth} />}
      {store.ready && !gated && !store.state.profile.onboarded && <Welcome store={store} />}

      {splash && <Splash onDone={endSplash} />}

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
