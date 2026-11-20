# Cinematic landing hero — November 8, 2026

The public landing page now uses a local 15-second generated golf film (swing, flight, cup finish), followed by a 20-second gentle course loop. Opening is muted by default; visitors can enable audio, pause, or replay. The foreground headline and navigation remain interactive throughout. The generated flight is a distant tracking shot, not the close spinning-ball aerial concept; that creative refinement remains for a future cut.

Files: apps/web/components/cinematic-hero.tsx, marketing.tsx, app/globals.css, public/videos/*.mp4 and poster JPG.

Media provenance: Runway generation tasks 4438301f-5dca-42cc-b8ab-6fa58ce6948c and be77fd23-1f02-4225-a6fa-e6fcba3cd314. These depict a fictional course, not a course listing. Opening H.264/AAC ~5 MB; ambient H.264 silent ~4.2 MB; poster ~112 KB. Ambient combines forward and reverse drift for matching loop endpoints. No expiring provider URLs shipped.

Reduced-motion or data-saving preferences show the still poster until explicit play. Hidden/offscreen playback pauses. Failed video loads retain the poster and expose retry. Ambient loads near the end of the opening. No database or backend changes.

Validation: production build and TypeScript passed; browser desktop and 375/430/768px iframe layouts reviewed, mobile menu tested, opening playback and transition into ambient verified. Pause/replay controls exercised. Real iPhone Safari and Android hardware, low-power autoplay behavior, and spoken audio quality still require human review. Current site remains a preview of community workflows; this visual update does not change backend readiness.
