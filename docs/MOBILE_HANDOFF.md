# Mobile handoff

Native development has not started. Use React Native, Expo Router and TypeScript after SaaS stability. Reuse the eventual ForeCircle Supabase project; never create a second backend or identity store.

## Contracts

- Auth: Supabase email/password, email confirmation redirects, persisted tokens; Apple/Google later. Do not scrape web pages. Implement native secure token storage independently.
- Profile service: validated profile fields; auth user UUID equals profile UUID. General region only.
- Foundation entities: see DATABASE.md. Membership and ownership rules live in Postgres RLS.
- RPCs prepared: `join_round(target uuid) -> confirmed|waitlisted`, `leave_round(target uuid) -> void`. Both require a live authenticated, nonsuspended golfer.
- Shared packages: types, validation, rules, brand configuration, analytics interface, database/service interfaces. Web components remain web-only.
- Realtime plan: conversations/messages restricted to current members; notifications restricted to recipient; registration count/score updates scoped to event visibility. Channels/publications are not enabled in this delivery.
- Storage: no buckets configured. Plan avatars, Circle/event covers, controlled message attachments. Enforce owner paths, MIME validation, image dimensions and size limits before enabling uploads.
- Notifications: in-app table exists; email/push/SMS adapters and delivery are future work.
- Deep links: planned ForeCircle.app/r/:id, /c/:slug, /t/:slug, /u/:username. Association files and native app links remain disabled until app IDs and domains are verified.
- Feature flags: payments, live scoring, leagues, organizer beta, verified organizers, course partnerships, native deep links and community launch are false.

Preview local storage is not an API and must never be copied into a production mobile data layer.

## Profile preview additions

Shared `GolferProfile` fields and `packages/utilities/profile.ts` define golfer bio/avatar/preferences/availability and same-account organizer club identity. These currently validate local demo state only. Web crop controls live in `golfer-profile.tsx`; Expo should use its own native picker/crop UI and the shared constraints, then the future common upload/profile API. See PROFILES.md for the live storage and ownership gate. Do not sync browser-local data URLs or trust preview `createdByMe` flags as server authorization.

## Course directory and community preview

Use `packages/courses/index.ts` for `GolfCourse`, canonical IDs/aliases, search/distance logic and the provider-neutral `CourseDirectory` interface. Browser route `/courses/[slug]`; round and tournament creation deep links pass a canonical `course` ID and `create=1`. Legacy preview activity names resolve only on exact normalized aliases; new activity stores `courseId`. Course selection/favorite selection and course-community membership are distinct consent actions. No continuous or current device location is collected. Radius is from a selected venue, not the golfer. The browser-local membership keys are a preview implementation, **not a mobile synchronization API**. Production membership/RLS/blocking and authenticated course APIs must be implemented before a native handoff is considered ready. See COURSES.md.
