"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="error-page">
      <h1>Let’s take another swing.</h1>
      <p>Something didn’t load. Your preview is still here.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
