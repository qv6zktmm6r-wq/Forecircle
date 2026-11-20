import Link from "next/link";
export default function NotFound() {
  return (
    <main className="error-page">
      <span className="eyebrow">A LITTLE OFF THE FAIRWAY</span>
      <h1>This page is out of bounds.</h1>
      <p>Let’s get you back to your next round.</p>
      <Link className="button primary" href="/">
        Back to ForeCircle
      </Link>
    </main>
  );
}
