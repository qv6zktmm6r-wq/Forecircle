# Golfer and organizer profile preview

## What works

`/app/profile` now provides a richer golf identity with an editable photo, display name, username, general area, biography, availability flag, handicap, skill, handedness, playing style, 9/18-hole preference, walking/riding preference, days, tee-time windows, and up to three favorite courses. Joined Circles and activity counts reflect this browser's preview state.

Organizer Mode remains part of the same golfer identity. Its section supports an optional club/organization name, separate logo, hosting biography, focus areas and an HTTPS website. It shows rounds and tournaments created in this version of the preview and Circles started by this preview golfer. Ownership flags are for demonstration only, not authorization. Earlier preview events lack ownership metadata and are not assigned to a golfer by guessing their names.

Both image pickers support select, crop, zoom, reposition, replace, remove and cancel. File size is limited to 8 MB and MIME/signature checked for JPEG, PNG and WebP before browser decoding. Images above 40 megapixels are rejected. Canvas produces a bounded 512px JPEG, without copying the original file's metadata. HEIC/SVG are not accepted; the form explains how to use JPG. Transparent logos receive an ivory background.

## Persistence and permissions

Everything here uses the existing browser-local preview. No file is uploaded to Supabase or shared with another golfer. The profile save writes to localStorage before reporting success; failures keep the editor open. Existing preview profiles are upgraded with optional defaults. Cancelling edits leaves the saved profile unchanged. Reset preview removes profile details along with the other preview state.

There is no real organization account, claim of business verification, organizer rating, follower count or hosted-player count. Organizer identity fields do not confer production permissions. Existing same-profile Organizer Mode behavior is preserved.

## Code

- `apps/web/components/golfer-profile.tsx`: golfer/organizer display, editor and photo handling.
- `apps/web/components/dashboard.tsx`: preview state integration, owner flags and save handling.
- `apps/web/components/ui.tsx`: photo avatars and labelled modal dialogs.
- `packages/types/index.ts`: shared identity and preview entity types.
- `packages/utilities/profile.ts`: shared validation, legacy normalization, photo input limits.
- `tests/profile.test.ts`: malformed image/link/profile data and legacy compatibility.

## Live integration gate

Supabase project creation is still blocked by the previously recorded billing hold. No new migration was applied or photo storage configured in this change. Before enabling real profiles: extend the normalized foundation schema for remaining fields, persist favorites via favorite_courses, implement ownership-checked Storage policies and constrained server uploads, enforce organizer changes server-side, add a public-profile projection without private contact data, and run two-account/RLS/device checks. Browser-local avatar data URLs must not become the production storage model. Do not turn preview ownership flags into an authorization check.
