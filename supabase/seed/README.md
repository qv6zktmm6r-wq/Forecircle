# Development seeds only

`development-fixtures.json` is a fake-data source for future local/preview adapters: 20 clearly demo golfers, 5 organizer flags, 6 Circles, 15 demo course placeholders, 12 rounds, 5 tournaments, challenge, registration, conversation and Lab examples. It is not a production import and does not create Auth users.

Never apply this file automatically to the connected project. A future seed command must require a local or explicitly disposable preview target, reject the production project ref, create Auth identities through the supported local admin interface, maintain FK order, and tag/remove the entire fixture batch deterministically. Production has no seed trigger or startup seeding.

The current visual demo lives separately in `apps/web/components/demo-data.ts`; it is never copied to Supabase. Sample named courses are context examples, not endorsements or real events.
