"use client";

import { isNative } from "./native";

/* Speech to text for the add boxes.
   Android app: the phone's own speech recogniser through a Capacitor plugin.
   Web: the browser's SpeechRecognition (Chrome, Edge, Safari). */

const speechModule = () => import("@capacitor-community/speech-recognition");

/* eslint-disable @typescript-eslint/no-explicit-any */
function webRecognition(): any {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function speechSupported(): boolean {
  return isNative() || !!webRecognition();
}

const lang = () => (typeof navigator !== "undefined" && navigator.language) || "en-US";

export type Listening = { stop: () => void; result: Promise<string> };

/** Starts listening; `result` resolves with what was said ("" if nothing), or rejects with a readable reason */
export async function listen(onPartial?: (text: string) => void): Promise<Listening> {
  if (isNative()) {
    const { SpeechRecognition: sr } = await speechModule();
    const { available } = await sr.available();
    if (!available) throw new Error("Speech recognition isn't available on this phone.");
    let perm = await sr.checkPermissions();
    if (perm.speechRecognition !== "granted") perm = await sr.requestPermissions();
    if (perm.speechRecognition !== "granted") throw new Error("Allow microphone access to speak instead of typing.");
    // Live results: words show up while speaking, and the last ones win when listening stops
    let heard = "";
    const result = new Promise<string>((resolve, reject) => {
      const done = async (text: string) => {
        await partial.then((h) => h.remove()).catch(() => {});
        await state.then((h) => h.remove()).catch(() => {});
        resolve(text.trim());
      };
      const partial = sr.addListener("partialResults", (d: { matches?: string[] }) => {
        if (d.matches?.[0]) heard = d.matches[0];
        onPartial?.(heard);
      });
      const state = sr.addListener("listeningState", (d: { status: string }) => {
        if (d.status === "stopped") setTimeout(() => done(heard), 250);
      });
      sr.start({ language: lang(), maxResults: 1, partialResults: true, popup: false }).catch((e: unknown) => {
        const msg = String((e as Error)?.message ?? e);
        if (/no match|no speech|cancel|client side/i.test(msg)) return done(heard);
        reject(new Error("Couldn't hear that. Try again?"));
      });
    });
    return { stop: () => void sr.stop().catch(() => {}), result };
  }

  const Rec = webRecognition();
  if (!Rec) throw new Error("This browser can't do speech to text.");
  const rec = new Rec();
  rec.lang = lang();
  rec.interimResults = true;
  rec.maxAlternatives = 1;
  const result = new Promise<string>((resolve, reject) => {
    let text = "";
    rec.onresult = (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => {
      text = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ");
      onPartial?.(text);
    };
    rec.onerror = (e: { error: string }) =>
      e.error === "no-speech" || e.error === "aborted"
        ? resolve("")
        : reject(new Error(e.error === "not-allowed" ? "Allow microphone access to speak instead of typing." : "Couldn't hear that. Try again?"));
    rec.onend = () => resolve(text.trim());
  });
  rec.start();
  return { stop: () => rec.stop(), result };
}
