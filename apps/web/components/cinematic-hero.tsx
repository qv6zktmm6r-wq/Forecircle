"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowDown,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";

/** Media files are local, reviewed exports. No signed third-party URLs are shipped. */
export function CinematicHero() {
  const section = useRef<HTMLElement>(null);
  const intro = useRef<HTMLVideoElement>(null);
  const ambient = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [phase, setPhase] = useState<"intro" | "ambient">("intro");
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadAmbient, setLoadAmbient] = useState(false);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (!preference.matches && !connection?.saveData) setEnabled(true);
    const reduced = () => {
      if (preference.matches) {
        setPaused(true);
        intro.current?.pause();
        ambient.current?.pause();
      }
    };
    preference.addEventListener("change", reduced);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    if (section.current) observer.observe(section.current);
    const visibility = () => {
      if (document.hidden) {
        intro.current?.pause();
        ambient.current?.pause();
        setVisible(false);
      } else if (section.current) {
        const r = section.current.getBoundingClientRect();
        setVisible(r.bottom > 0 && r.top < window.innerHeight);
      }
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      preference.removeEventListener("change", reduced);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    const video = phase === "intro" ? intro.current : ambient.current;
    if (!video || !enabled || error) return;
    if (paused || !visible) {
      video.pause();
      return;
    }
    let cancelled = false;
    video.play().catch(() => {
      if (!cancelled) {
        setPaused(true);
        setPlaying(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, phase, paused, visible, error]);
  function toggle() {
    if (!enabled || error) {
      setEnabled(true);
      setError(false);
      setPaused(false);
      const video = phase === "intro" ? intro.current : ambient.current;
      video?.load();
      return;
    }
    setPaused(!paused && playing);
  }
  function replay() {
    setReady(false);
    setProgress(0);
    setError(false);
    setPhase("intro");
    setEnabled(true);
    setPaused(false);
    if (intro.current) {
      intro.current.pause();
      intro.current.currentTime = 0;
    }
    ambient.current?.pause();
    if (phase === "intro")
      void intro.current?.play().catch(() => setPaused(true));
  }
  const onError = () => {
    setError(true);
    setReady(false);
    setPlaying(false);
  };
  const mediaEvents = {
    onPlaying: () => {
      setPlaying(true);
      setReady(true);
    },
    onPause: () => setPlaying(false),
    onError,
  };
  const chapter =
    phase === "ambient"
      ? "Your next round starts here"
      : progress < 0.34
        ? "01 / The swing"
        : progress < 0.67
          ? "02 / The flight"
          : "03 / The finish";
  return (
    <section
      className="cinematic-hero"
      ref={section}
      aria-label="ForeCircle — Never golf alone"
    >
      <div className="cinematic-media" aria-hidden="true">
        <img
          className="cinematic-poster"
          src="/videos/forecircle-poster.jpg"
          alt=""
          fetchPriority="high"
          width={1920}
          height={1080}
        />
        <video
          ref={intro}
          className={`cinematic-film ${phase === "intro" && ready && !error ? "is-active" : ""}`}
          src={enabled ? "/videos/forecircle-opening.mp4" : undefined}
          preload={enabled ? "auto" : "none"}
          muted={muted}
          playsInline
          {...mediaEvents}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            setProgress(v.duration ? v.currentTime / v.duration : 0);
            if (v.duration && v.currentTime > v.duration - 3)
              setLoadAmbient(true);
          }}
          onEnded={() => {
            setLoadAmbient(true);
            setReady(false);
            setPhase("ambient");
            setProgress(1);
          }}
        />
        <video
          ref={ambient}
          className={`cinematic-film ${phase === "ambient" && ready && !error ? "is-active" : ""}`}
          src={
            enabled && loadAmbient
              ? "/videos/forecircle-ambient.mp4"
              : undefined
          }
          preload="metadata"
          muted
          loop
          playsInline
          onPlaying={() => {
            if (phaseRef.current === "ambient") {
              setPlaying(true);
              setReady(true);
            }
          }}
          onPause={() => {
            if (phaseRef.current === "ambient") setPlaying(false);
          }}
          onError={onError}
        />
      </div>
      <div className="cinematic-shade" />
      <div className="cinematic-copy section-wrap">
        <span className="cinematic-eyebrow">
          <span /> GOOD GOLF. BETTER COMPANY.
        </span>
        <h1>
          Never golf
          <br />
          <em>alone.</em>
        </h1>
        <p>Find your people. Play more golf.</p>
        <div className="cinematic-actions">
          <Link className="button cinematic-primary" href="/app/rounds">
            Find a Round <ArrowUpRight size={18} />
          </Link>
          <Link className="button cinematic-secondary" href="/organizers">
            Organize Golf <ArrowUpRight size={18} />
          </Link>
        </div>
        <span className="cinematic-invitation">
          Every skill level. One love for the game.
        </span>
      </div>
      {phase === "intro" &&
        progress > 0.09 &&
        progress < 0.31 &&
        playing &&
        !error && (
          <span className="fore-call" aria-hidden="true">
            Fore!
          </span>
        )}
      <div className="cinematic-bottom section-wrap">
        <div className="cinematic-signoff">
          <b>MEET. PLAY. COMPETE.</b>
          <span>
            {error ? "Enjoy the view. Your next round is waiting." : chapter}
          </span>
        </div>
        <a
          href="#rounds"
          className="cinematic-scroll"
          aria-label="Explore open rounds"
        >
          <ArrowDown size={18} />
          <span>Explore your next round</span>
        </a>
        <div className="cinematic-controls" aria-label="Hero video controls">
          <button
            onClick={toggle}
            aria-label={
              playing && !paused
                ? "Pause background video"
                : "Play background video"
            }
          >
            {playing && !paused ? <Pause size={17} /> : <Play size={17} />}
          </button>
          <button onClick={replay} aria-label="Replay golf film">
            <RotateCcw size={17} />
          </button>
          {phase === "intro" && (
            <button
              onClick={() => setMuted(!muted)}
              aria-label={muted ? "Turn film sound on" : "Mute film sound"}
              aria-pressed={!muted}
            >
              {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>
          )}
        </div>
      </div>
      <div className="cinematic-progress" aria-hidden="true">
        <span
          style={{ width: `${phase === "ambient" ? 100 : progress * 100}%` }}
        />
      </div>
    </section>
  );
}
