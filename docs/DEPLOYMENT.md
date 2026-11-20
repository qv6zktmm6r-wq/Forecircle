# Deployment

## Current private Site

Next.js static export, built into root `out/`. `.openai/hosting.json` holds the immutable Site project ID. `scripts/copy-export.mjs` copies `apps/web/out/` to root output. The Sites source helper verifies/pushes the source and packages the same revision before deployment. Preserve owner-private access until a public launch is explicitly requested.

Production URL returned by Sites is the source of truth. ForeCircleGolf.com DNS has not been changed. Public pages remain noindex and robots disallows all indexing because sample data must not be indexed as real events.

## Supabase provisioning status

A dedicated ForeCircle Supabase project in `us-west-1` was planned. The November 8, 2026 provisioning attempt did not create a project. The preview still requires database provisioning, migration, and live Auth verification.

## Environments

Local: demo without secrets. Preview: private Site, sample data only, no auth configuration. Production: dedicated Supabase project, reviewed migrations, verified redirect URLs, real transactional email, moderation, secure upload rules, access tests and launch gate.

Required browser-safe build values: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Optional canonical value: `NEXT_PUBLIC_SITE_URL`. Service-role credentials must stay server-only and are neither required nor exposed in this preview. Static export values are embedded at build time, so environment changes require rebuild and republish.

## Vercel path

The project is genuine Next.js App Router and can be hosted on Vercel. For dynamic production public pages and server APIs, remove `output: export`, use the native framework build, and adapt the monorepo build/root settings. Replace demo adapters before enabling community launch. Do not mistake static pre-rendered sample pages for production dynamic routes.

## Domain preparation

Document desired hosts: forecirclegolf.com, www.forecirclegolf.com; future forecircle.app. Add domains only after provider credentials/authorization are available. Use provider-returned records. Configure canonicals, redirects, auth callback allowlists, HTTPS, email SPF/DKIM/DMARC, and later iOS/Android association files. No DNS edits were performed.

## Required launch checks

Real signup/email verification/profile; two-account join/chat/Circle isolation; concurrent capacity; tournament visibility/registration/waitlist/participant management/results; moderation/blocking; uploads/rate limits; hosted Supabase advisors; device Safari/Chrome; privacy/terms/contact details; licensed final imagery; indexing/sitemaps only after sample content is removed.
