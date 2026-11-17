"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { inputCls, primaryBtn } from "./ui";
import { authMessage, type Auth } from "@/lib/auth";
import { googleEnabled } from "@/lib/supabase";
import { Figure } from "./Figures";

type Mode = "start" | "signIn" | "signUp" | "reset" | "sent";

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}

/** Sign in or create an account: Google in one tap, or email and password */
export function AuthScreen({ auth }: { auth: Auth }) {
  const [mode, setMode] = useState<Mode>("start");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentMsg, setSentMsg] = useState("");
  const [google, setGoogle] = useState(false);

  useEffect(() => {
    googleEnabled().then(setGoogle);
  }, []);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(authMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const submit = () =>
    run(async () => {
      const e = email.trim();
      if (mode === "reset") {
        await auth.resetPassword(e);
        setSentMsg(
          `We've sent a link to ${e}. Open it on this phone to choose a new password.`
        );
        setMode("sent");
      } else if (mode === "signUp") {
        if (password.length < 8)
          throw new Error("Password should be at least 8 characters");
        const needsConfirm = await auth.signUpEmail(e, password, name.trim());
        if (needsConfirm) {
          setSentMsg(
            `Almost there! We've sent a link to ${e}. Tap it to confirm, then sign in.`
          );
          setMode("sent");
        }
      } else await auth.signInEmail(e, password);
    });

  const canSubmit =
    /\S+@\S+\.\S+/.test(email) &&
    (mode === "reset" || password.length > 0) &&
    !busy;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-page">
      <div className="pt-safe pb-nav mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-10">
        {mode === "start" ? (
          <div className="animate-in">
            <Figure name="meditate" className="-ml-4 h-40 w-52" />
            <h1 className="mt-2 text-[2.25rem] leading-tight font-medium tracking-tight text-ink">
              Welcome to Aham
            </h1>
            <p className="mt-2 text-lg text-muted">
              Plan your days, build habits and keep simple lists. Sign in to
              keep everything safe across phones.
            </p>

            <div className="mt-8 space-y-2.5">
              {google && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(auth.signInGoogle)}
                  className="flex h-13 w-full items-center justify-center gap-3 rounded-full bg-white py-3.5 font-bold text-ink shadow-soft active:scale-[0.98] disabled:opacity-50"
                >
                  {busy ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <GoogleMark />
                  )}{" "}
                  Continue with Google
                </button>
              )}
              <button
                type="button"
                onClick={() => setMode("signUp")}
                className={primaryBtn}
              >
                <Mail className="h-5 w-5" /> Sign up with email
              </button>
              <button
                type="button"
                onClick={() => setMode("signIn")}
                className="h-12 w-full rounded-full font-bold text-brand-700"
              >
                I already have an account
              </button>
            </div>
            {error && (
              <p className="mt-3 rounded-2xl bg-terra-50 p-3 text-[0.9rem] font-semibold text-terra-700">
                {error}
              </p>
            )}
            <p className="mt-6 text-center text-[0.8rem] text-muted">
              By continuing you agree to our{" "}
              <a
                href="https://github.com/onu-pm/aham/blob/main/PRIVACY.md"
                target="_blank"
                rel="noreferrer"
                className="font-bold underline"
              >
                privacy policy
              </a>
              .
            </p>
          </div>
        ) : mode === "sent" ? (
          <div className="animate-in text-center">
            <p className="text-5xl" aria-hidden>
              📬
            </p>
            <h1 className="mt-4 text-2xl font-medium text-ink">
              Check your email
            </h1>
            <p className="mt-2 text-muted">{sentMsg}</p>
            <button
              type="button"
              onClick={() => setMode("signIn")}
              className={`${primaryBtn} mt-8`}
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <div className="animate-in">
            <button
              type="button"
              onClick={() => (setMode("start"), setError(null))}
              className="-ml-2 flex h-10 items-center gap-1 rounded-full px-2 font-bold text-muted"
            >
              <ArrowLeft className="h-5 w-5" /> Back
            </button>
            <h1 className="mt-3 text-[2rem] leading-tight font-medium tracking-tight text-ink">
              {mode === "signUp"
                ? "Create your account"
                : mode === "reset"
                ? "Reset your password"
                : "Welcome back"}
            </h1>
            <form
              className="mt-6 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (canSubmit) submit();
              }}
            >
              {mode === "signUp" && (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  autoComplete="given-name"
                  aria-label="Your name"
                  className={`${inputCls} !bg-white shadow-soft`}
                />
              )}
              <input
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                aria-label="Email"
                className={`${inputCls} !bg-white shadow-soft`}
              />
              {mode !== "reset" && (
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      mode === "signUp"
                        ? "Password (8+ characters)"
                        : "Password"
                    }
                    autoComplete={
                      mode === "signUp" ? "new-password" : "current-password"
                    }
                    aria-label="Password"
                    className={`${inputCls} !bg-white pr-12 shadow-soft`}
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute top-1 right-1 flex h-10 w-10 items-center justify-center text-muted"
                  >
                    {show ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              )}
              {error && (
                <p className="rounded-2xl bg-terra-50 p-3 text-[0.9rem] font-semibold text-terra-700">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={!canSubmit}
                className={primaryBtn}
              >
                {busy && <Loader2 className="h-5 w-5 animate-spin" />}
                {mode === "signUp"
                  ? "Create account"
                  : mode === "reset"
                  ? "Send reset link"
                  : "Sign in"}
              </button>
            </form>
            {mode === "signIn" && (
              <button
                type="button"
                onClick={() => (setMode("reset"), setError(null))}
                className="mt-3 h-10 w-full font-bold text-brand-700"
              >
                Forgot password?
              </button>
            )}
            {mode !== "reset" && (
              <button
                type="button"
                onClick={() => (
                  setMode(mode === "signUp" ? "signIn" : "signUp"),
                  setError(null)
                )}
                className="mt-1 h-10 w-full text-[0.9rem] font-semibold text-muted"
              >
                {mode === "signUp"
                  ? "Already have an account? Sign in"
                  : "New here? Create an account"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Shown after opening a password reset link */
export function NewPassword({ auth }: { auth: Auth }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/30 px-6 backdrop-blur-sm">
      <form
        className="w-full max-w-sm space-y-3 rounded-3xl bg-white p-5 shadow-soft"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await auth.updatePassword(password);
          } catch (err) {
            setError(authMessage(err));
          } finally {
            setBusy(false);
          }
        }}
      >
        <h2 className="text-xl font-extrabold text-ink">
          Choose a new password
        </h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password (8+ characters)"
          autoComplete="new-password"
          aria-label="New password"
          className={inputCls}
        />
        {error && (
          <p className="text-[0.9rem] font-semibold text-terra-700">{error}</p>
        )}
        <button
          type="submit"
          disabled={password.length < 8 || busy}
          className={primaryBtn}
        >
          Save password
        </button>
      </form>
    </div>
  );
}
