"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Plus, Square } from "lucide-react";
import { listen, speechSupported, type Listening } from "@/lib/speech";

/** Microphone button: speak, and the words land in the box */
export function MicButton({ onText, className = "" }: { onText: (text: string) => void; className?: string }) {
  const [supported, setSupported] = useState(false);
  const [on, setOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState("");
  const session = useRef<Listening | null>(null);

  useEffect(() => setSupported(speechSupported()), []);
  useEffect(() => () => session.current?.stop(), []);

  if (!supported) return null;

  const start = async () => {
    if (on) return session.current?.stop();
    setError(null);
    setLive("");
    try {
      const s = await listen(setLive);
      session.current = s;
      setOn(true);
      const text = await s.result;
      // Kept for troubleshooting what the phone actually heard
      (window as unknown as { __ahamHeard?: string }).__ahamHeard = text;
      if (text) onText(text.charAt(0).toUpperCase() + text.slice(1));
    } catch (e) {
      setError((e as Error).message);
      setTimeout(() => setError(null), 4000);
    } finally {
      session.current = null;
      setOn(false);
    }
  };

  return (
    <span className="relative shrink-0">
      <button
        type="button"
        onClick={start}
        aria-label={on ? "Stop listening" : "Speak instead of typing"}
        aria-pressed={on}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${on ? "animate-pulse bg-terra-400 text-white" : "bg-brand-50 text-brand-700"} ${className}`}
      >
        {on ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-5 w-5" />}
      </button>
      {(on || error) && (
        <span role="status" className="absolute right-0 bottom-12 z-30 w-max max-w-60 rounded-2xl bg-ink px-3 py-1.5 text-[0.8rem] font-bold text-white shadow-lg">
          {error ?? (live ? `“${live}”` : "Listening… speak now")}
        </span>
      )}
    </span>
  );
}

/** The one add box used across Aham: type or speak, then Enter or + */
export function AddBar({
  placeholder,
  onAdd,
  autoFocus,
  className = "",
}: {
  placeholder: string;
  onAdd: (text: string) => void;
  autoFocus?: boolean;
  className?: string;
}) {
  const [text, setText] = useState("");
  const submit = (t = text) => {
    if (!t.trim()) return;
    onAdd(t.trim());
    setText("");
  };
  return (
    <div className={`flex items-center gap-1.5 rounded-full bg-white p-1.5 pl-4 shadow-soft ${className}`}>
      <input
        value={text}
        autoFocus={autoFocus}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        enterKeyHint="done"
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-stone-400"
      />
      {/* Spoken words are added straight away: no typing, no extra tap */}
      <MicButton onText={(t) => submit(t)} />
      <button type="button" onClick={() => submit()} disabled={!text.trim()} aria-label="Add" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-white disabled:opacity-25">
        <Plus className="h-5 w-5" strokeWidth={3} />
      </button>
    </div>
  );
}
