# Course discovery and communities — November 8, 2026

## Implemented in the private preview

- Six real launch-area records: Temecula Creek, Redhawk, Cross Creek, Menifee Lakes, Rancho California, and Journey at Pechanga. Official contact sources, approximate coordinate sources, and review dates are retained per record. These records are factual directory content, not fabricated course names and not claimed course partnerships.
- `/courses/`: course-name/alias, city/state and ZIP text search; 10/25/50-mile straight-line radius from a selected course; local joined-community filter; empty states; browser-local course suggestion drafts (last 20). No national coverage or ZIP geocoding is claimed.
- `/courses/[slug]/`: official website, address, phone, directions, source disclosure, explicit join/leave, course-linked rounds and tournaments, sample opt-in golfers, browser-local My Circle add/remove.
- A shared course picker replaces free text in both creation wizards and in profile favorites. Favorite courses link to their hubs. Favorite selection and event creation **do not** implicitly opt a golfer into a community.
- A course hub opens its creation wizard with that course selected. New rounds/tournaments retain `courseId` and the actual course city/state. Old local activity still resolves through an exact normalized name/alias match. An unknown explicit ID never falls back to a conflicting name.
- Profiles show joined course communities and saved sample My Circle connections. Leaving a community removes the golfer from that community preview. Removing a My Circle connection remains possible after leaving.
- Community state is saved only after localStorage succeeds. Read failures and storage-write failures have visible states. Profile reset clears local course preferences and suggestion drafts and refreshes mounted membership views. Other browser tabs refresh preferences via storage events.

## Architecture and files

`packages/courses/index.ts`: provider-independent `GolfCourse` types, stable UUIDs, canonical slugs/aliases, curated directory, search, Haversine distance, activity matching, membership restoration, `CourseDirectory` adapter interface. The web UI imports this shared module; a future Expo client can reuse it without importing React components.

`apps/web/components/course-picker.tsx`: labeled search, selectable result buttons, keyboard tab/Enter/Escape support, selected full address and course-community link.

`apps/web/components/course-community.tsx`: directory, hub, joined communities and sample My Circle. Route entries live under `apps/web/app/courses/`. Existing dashboard/profile/marketing/detail components expose these routes and the shared picker.

No new dependency, proprietary course API, API credential, location permission, continuous tracking, map SDK, or tee-time booking was introduced. Directions leave ForeCircle for Google Maps only when clicked. Published course coordinates are approximate static venue points; they are not golfer locations or guaranteed arrival entrances.

## Source provenance

Each record carries `sourceUrl`, `coordinateSource`, and `checkedAt`. Addresses and contacts were checked against official course pages on November 8, 2026. Static coordinate references are intentionally linked for review. Journey's approximate clubhouse map point derives from OpenStreetMap via Mapcarta, with attribution in the hub; its street address is the resort's published address. No course photography, logos, reviews, pricing, ratings, or tee-time inventory were copied. Directory cards use ForeCircle's own design. Existing activity photography is illustrative sample imagery.

Before expanding or importing bulk data, review provider licensing and refresh the sources. An external provider must map to ForeCircle-owned IDs, through the adapter, not become the only source of business identity.

## Database status and production boundary

**No hosted database changes. No migration was applied or newly claimed complete.** The existing foundation `golf_courses` table and `rounds.course_id` are the future integration points. The curated UUIDs can be reviewed and imported through an admin-controlled importer; none have been inserted into any Supabase project.

The live Supabase project remains blocked by the provider billing hold documented in STATUS.md. Course membership, golfer connections, suggestions, profile sharing, registration and messages remain private browser-local examples. Sample golfers are explicitly fictional, and their course memberships are sample data. No actual user is contacted or exposed.

Before production:

1. Provision the dedicated approved Supabase project and validate the foundation.
2. Add normalized favorite-course and opt-in course-membership tables with unique `(profile_id, course_id)` constraints. Membership must be independently revocable and must not be inferred from favorites, registrations, device location or course search.
3. Enforce own-row membership writes and blocked/suspended-golfer visibility rules in RLS/server APIs. Read discoverable golfer fields only; private email, phone and home address must remain unavailable.
4. Define course-community visibility consent and real My Circle consent/blocking behavior. Add authorization, race/concurrency, pagination and privacy tests against actual Supabase Auth.
5. Connect real round/tournament list queries by canonical foreign key, authenticated APIs, and profiles. Do not reuse sample golfer records in production.
6. Implement moderated missing-course submissions and trusted source updates; the preview's suggestion form does not send requests.

## Verification

Six new automated tests cover canonical/legacy identity, name/city/ZIP search, geographic distance/radius, exact activity matching, explicit membership restoration and directory record/adapter integrity. Full suite: 32 passing tests. Production static build: 44 pages/routes. Browser verification details are in QA.md.
