"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Check, Mail } from "lucide-react";
import { Logo } from "./ui";
import { getSupabase } from "@shared/database/client";
import { saveProfile } from "@shared/database/services";
import { profileSchema } from "@shared/validation";
export function AuthPage({
  mode,
}: {
  mode: "signup" | "login" | "onboarding";
}) {
  const db = getSupabase();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(false),
    [sessionReady, setSessionReady] = useState(mode !== "onboarding");
  useEffect(() => {
    if (mode === "onboarding" && db) {
      db.auth.getUser().then(({ data, error }) => {
        if (error || !data.user) {
          setError(
            "Please verify your email and sign in to create your profile.",
          );
        } else setSessionReady(true);
      });
    }
  }, [mode, db]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!db) return;
    setBusy(true);
    setError("");
    const d = new FormData(e.currentTarget);
    try {
      if (mode === "onboarding") {
        const result = profileSchema.safeParse({
          display_name: String(d.get("name")).trim(),
          username: String(d.get("username")).trim(),
          general_region: String(d.get("area")).trim(),
          handicap: d.get("handicap") ? Number(d.get("handicap")) : null,
          golf_style: d.get("style"),
        });
        if (!result.success)
          throw new Error(
            result.error.issues[0]?.message || "Please check your profile.",
          );
        await saveProfile(result.data);
        setSuccess(true);
      } else {
        const email = String(d.get("email")).trim(),
          password = String(d.get("password"));
        const { error } =
          mode === "signup"
            ? await db.auth.signUp({
                email,
                password,
                options: {
                  emailRedirectTo: new URL("/onboarding/", location.origin)
                    .href,
                },
              })
            : await db.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (mode === "login") window.location.assign("/onboarding/");
        else setSuccess(true);
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-layout">
      <section className="auth-image">
        <Logo light />
        <div>
          <span className="eyebrow">MEET. PLAY. COMPETE.</span>
          <h1>
            Find your people.
            <br />
            <em>Play more golf.</em>
          </h1>
          <p>
            Your next favorite golf partner is out there. ForeCircle is where
            your paths cross.
          </p>
        </div>
        <span className="eyebrow">
          ALL SKILL LEVELS. ONE LOVE FOR THE GAME.
        </span>
      </section>
      <section className="auth-form-side">
        <div className="auth-card">
          <Logo />
          <span className="eyebrow">YOUR CIRCLE STARTS HERE</span>
          <h2>
            {mode === "signup"
              ? "Good golf. Better company."
              : mode === "login"
                ? "Welcome back, golfer."
                : "Make this game your own."}
          </h2>
          <p>
            {mode === "signup"
              ? "One profile for everything you love about the game."
              : mode === "login"
                ? "Your people, your rounds, your community."
                : "Just the essentials. You can fill in the rest later."}
          </p>
          {!db ? (
            <>
              <div className="notice">
                <b>The live community is getting ready.</b>
                <br />
                Accounts aren’t open yet. Step inside the preview to explore
                ForeCircle—no account needed.
              </div>
              <Link className="button primary full" href="/app">
                Explore the clubhouse <ArrowUpRight size={17} />
              </Link>
              <div className="auth-divider">OR</div>
              <Link className="button secondary full" href="/">
                Back to ForeCircle <ArrowRight size={17} />
              </Link>
            </>
          ) : success ? (
            <div className="auth-success">
              <Check size={25} />
              <h3>
                {mode === "onboarding"
                  ? "Your profile is saved."
                  : "Check your inbox."}
              </h3>
              <p>
                {mode === "onboarding"
                  ? "The community is still in preview. Your live profile is ready for the next phase."
                  : "Follow the verification link to finish setting up your account."}
              </p>
              <Link
                className="text-link"
                href={mode === "onboarding" ? "/app" : "/login"}
              >
                {mode === "onboarding"
                  ? "Explore the preview"
                  : "Return to sign in"}
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <form onSubmit={submit}>
              {mode === "onboarding" ? (
                <>
                  <label className="field-label">
                    Display name
                    <input
                      name="name"
                      required
                      autoComplete="name"
                      minLength={2}
                      maxLength={60}
                    />
                  </label>
                  <label className="field-label">
                    Username
                    <input
                      name="username"
                      required
                      pattern="[a-z0-9_]{3,24}"
                      title="3–24 lowercase letters, numbers, or underscores"
                      autoCapitalize="none"
                    />
                  </label>
                  <label className="field-label">
                    General area
                    <input
                      name="area"
                      required
                      placeholder="City or region—no home address"
                      maxLength={100}
                    />
                  </label>
                  <div className="form-two">
                    <label className="field-label">
                      Handicap (optional)
                      <input
                        name="handicap"
                        type="number"
                        min={-10}
                        max={54}
                        step="0.1"
                      />
                    </label>
                    <label className="field-label">
                      Your style
                      <select name="style">
                        <option>Casual</option>
                        <option>Social</option>
                        <option>Competitive</option>
                        <option>Beginner friendly</option>
                      </select>
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <label className="field-label">
                    Email address
                    <input
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                    />
                  </label>
                  <label className="field-label">
                    Password
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={12}
                      autoComplete={
                        mode === "signup" ? "new-password" : "current-password"
                      }
                      placeholder={
                        mode === "signup"
                          ? "At least 12 characters"
                          : "Your password"
                      }
                    />
                  </label>
                </>
              )}
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button
                className="button primary full"
                disabled={busy || !sessionReady}
              >
                {busy
                  ? "One moment…"
                  : mode === "signup"
                    ? "Create golfer account"
                    : mode === "login"
                      ? "Log in"
                      : "Save golfer profile"}
                <ArrowRight size={17} />
              </button>
            </form>
          )}
          {db && mode !== "onboarding" && (
            <p className="auth-footer">
              {mode === "signup"
                ? "Already part of the Circle?"
                : "New around here?"}{" "}
              <Link href={mode === "signup" ? "/login" : "/signup"}>
                {mode === "signup" ? "Log in" : "Create an account"}
              </Link>
            </p>
          )}
          <p className="auth-fineprint">
            Built for good company and respectful golf. Read our{" "}
            <Link href="/community-standards">community standards</Link>,{" "}
            <Link href="/privacy">privacy policy</Link>, and{" "}
            <Link href="/terms">terms</Link>. Policy drafts require review
            before launch.
          </p>
        </div>
      </section>
    </main>
  );
}
