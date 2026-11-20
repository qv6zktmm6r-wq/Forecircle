import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "ForeCircle — Meet. Play. Compete.",
    template: "%s | ForeCircle",
  },
  description:
    "Find your people. Play more golf. Discover open rounds, golf Circles, and community tournaments with ForeCircle.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      "https://forecircle-golf.mejia1604.chatgpt.site",
  ),
  openGraph: {
    title: "ForeCircle — Never golf alone.",
    description: "Find golfers. Join rounds. Build your Circle.",
    images: ["/images/hero.jpg"],
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
  manifest: "/manifest.webmanifest",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#003D29",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
