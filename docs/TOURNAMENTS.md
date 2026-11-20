# Tournaments

The guided preview collects name, course, date, start time, format, capacity, and optional side competitions, then creates a browser-local record. Sample public tournament pages have working link copying and QR generation/download. Original sample registrations can be toggled in the preview. These actions are not real reservations.

Formats shown: Stroke Play, Match Play, Scramble, 2-Man Scramble, 4-Man Scramble, Best Ball, Stableford, Team vs Team, Ryder Cup Style, Charity Tournament, Custom. Selecting a format is not implementation of its scoring algorithm.

Next phase requires normalized event registrations, idempotent atomic capacity decisions, ordered waitlisting/promotion, visibility checks, deadlines, teams/flights, check-in, announcements, basic results and review eligibility. There is no production tournament registration endpoint yet. Payment interfaces are stubs and feature flags remain off. No fee collection, pool, automatic payout, gambling or unrestricted P2P wagering is provided.

New preview tournaments deliberately have no public share URL because they exist only on one browser. Static example pages do, and their preview/private status is disclosed in the share dialog.
