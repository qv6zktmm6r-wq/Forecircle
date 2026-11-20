# Organizer Mode

One golfer profile remains the identity. Preview activation persists the mode locally and adds dashboard, My Events, Create Tournament, Create Circle, and Organizer Lab. Switching mode does not delete rounds or memberships.

The production schema represents activation with organizer_profiles linked to profiles. Circle management uses founder/admin roles server-side. Self-activation does not imply verified identity, verified events, or a reputation rating.

Current organizer metrics are explicitly illustrative. Participants, teams, flights, check-in, announcements, results, organizer reviews and beta eligibility are upcoming production phases. No fake review average or verified badge is displayed. Shared rating rule requires at least three reviews; real review eligibility must come from completed-event attendance.

Organizer Lab preview supports creating an idea, one local toggleable vote per idea, and status filters. Its SQL framework protects votes and administrator statuses. Attachments, comments UI, live notifications and feedback workflows are not connected.
