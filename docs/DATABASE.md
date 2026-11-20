# Database

Migration `20261108012152_forecircle_foundation.sql` was generated using Supabase CLI 2.83.0 `migration new`; it has not been applied to a hosted project.

## Foundation tables (20)

Public: profiles, profile_preferences, organizer_profiles, follows, golf_connections, golf_courses, circles, circle_members, rounds, round_participants, round_waitlist, conversations, conversation_members, messages, notifications, feature_requests, feature_request_votes, feature_request_comments.

Private: account_controls, admin_audit_log.

Profiles use the Auth user UUID as their primary key. No duplicate `auth_user_id`, no home address, email, or phone in the public profile table. Organizer activation is the existence of `organizer_profiles`, not a user-editable verified flag. Circle role is a constrained membership attribute. Primary keys prevent duplicate follows, membership, votes, and waitlist entries.

Rounds reference courses, optionally Circles. Capacity includes the host and is constrained to 2–4. Each new round creates its host membership and a private conversation atomically. `join_round` locks the round row before counting participants; it either confirms a golfer and grants conversation access or adds a unique ordered waitlist entry. `leave_round` revokes chat membership and frees the seat. It does not auto-promote waitlists. Host cancellation and manual promotion are next-phase work.

## Planned normalized tournament model

`events`: owner, Circle, course, timing, visibility, capacity, status. `tournaments`: one-to-one event-specific format/rules. `event_registrations`: one authoritative record per event/golfer, including waitlisted/check-in/cancelled states and waitlist ordering; avoid a duplicate tournament_participants source of truth. Additional relational tables: tournament_formats, teams, team_members, flights, flight_members, challenges, scores, results, organizer_reviews, referrals, reports, moderation_actions, favorite_courses, circle_invites. Design before migration; not created in this phase.

Audit records must be append-only via a reviewed server/admin path. Private account controls have no client grants. Server-side suspension is present for foundation mutations, but a complete moderation application is not delivered.

## Rollback

The initial migration is transactional. Before data exists, an isolated disposable development project can be rebuilt. Never execute destructive rollback against production data. Subsequent live changes require forward corrective migrations and backup verification.
