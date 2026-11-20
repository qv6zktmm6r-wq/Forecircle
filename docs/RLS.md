# Row level security

Every foundation table has RLS enabled. Anonymous access is limited to public-safe profiles, organizer profiles, active courses, public/request Circles, and non-draft public rounds. Other table access requires authentication and relationship checks.

- Profiles/preferences: owner write; preferences owner read. Profile updates cannot change the owner ID.
- Organizer Mode: own activation; no client-controlled verified/administrator field.
- Circles: only organizers create; founder/admin manage. Public join inserts only self with role member. Private membership cannot be self-created. Founder role cannot be reassigned through client updates.
- Rounds: own creation; circle-linked activity requires membership. Direct participant/waitlist writes are not granted. Authorized RPCs manage capacity and conversation membership under row locks.
- Messages: current conversation members only; sender must match auth.uid. Leaving revokes read/write access. No group-membership self-insertion path.
- Notifications: only recipient reads and changes read_at. Clients cannot forge notifications.
- Lab: organizer-only read/write; one vote per organizer. Client grants exclude roadmap status and admin_response.
- Account controls/audit: private schema, no client table grants.

Internal SECURITY DEFINER helpers are narrowly scoped, use an empty search_path, qualify every reference, and derive identity from auth.uid rather than supplied actor IDs. Policy helpers return booleans only. Default PUBLIC execution is revoked. Public RPC wrappers use SECURITY INVOKER. Trigger functions are not client executable.

Local PGlite tests execute the complete migration and verify isolation with independent authenticated roles and mocked auth.uid. They verify sequential capacity and waiting behavior, but are not hosted Supabase, Realtime, token, storage, or concurrency certification. Hosted advisors and concurrent multi-connection tests remain release gates.

No user_metadata claim participates in authorization. Never use a service-role key in the browser. Add rate limiting, storage constraints, block/report enforcement, resource quotas, and full lifecycle RPCs before enabling live community activity.
