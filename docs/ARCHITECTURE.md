# Architecture

## Delivered

Next.js 16.4.5 App Router, React 19.2, strict TypeScript, Tailwind v4 with custom responsive styles. Static export is used for the initial private Sites delivery. Supabase remains the intended single backend, not replaced by Sites storage. Public sample pages are pre-rendered. This export deliberately does not pretend to offer server-side event mutation, request-time SEO for newly created events, or SSR sessions.

`packages` contains shared types, validation, pure rules, brand/entitlements, analytics, and Supabase-facing profile logic. SQL owns access control and atomic capacity. `Dashboard` is an isolated browser-local demo adapter under `forecircle-preview-v1`; it never writes to Supabase and should not become production authorization logic.

Auth uses the official Supabase JavaScript client with persistSession and token refresh. A real profile write verifies the current user through `auth.getUser`, validates input, and then relies on Postgres RLS. Missing public configuration fails closed in the UI.

## Production transition

1. Select/provision a dedicated Supabase project; configure Auth and review/apply the migration.
2. Run hosted two-account and concurrent-join tests. Add server-side rate limits, moderation, blocking, and storage policies before real user activity.
3. Replace the demo data adapter with paginated services; preserve the preview behind an explicit preview route or separate deployment.
4. For Vercel, remove static export and use server rendering / canonical public dynamic routes with authorization-aware metadata. Configure trusted auth redirect URLs, web headers, server secrets, and immutable deployments.
5. Ship the community and tournament phases in order. Native mobile only after production SaaS workflows stabilize.

No mobile UI is shared. Future Expo consumes shared types, input schemas, Supabase APIs/RPCs, and services.
