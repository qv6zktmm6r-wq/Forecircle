# ForeCircle engineering handoff for Cursor

## First task

Open the repository root in Cursor and reproduce the existing ForeCircle web preview. Use the current `main` branch as the source of truth. The verified import commit is `f079997a8fd6d9306fc33673d9626ba1b9597d0c`. It contains the Sites v5 app source, Supabase foundation, tests, and brand assets. Continue from that codebase.

For a fresh checkout, run:

```sh
git clone https://github.com/qv6zktmm6r-wq/Forecircle.git
cd Forecircle
```

For an existing checkout, inspect `git status --short --branch` and `git remote -v` first. Fetch `origin` and preserve any local work. Record the SHA of the checkout you actually test with `git rev-parse HEAD`.

## Run the baseline

Use Node 24 and pnpm 11.25.0 from the repository root. The local preview runs without Supabase credentials.

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```

The build produces a static site in `out/`. Serve that directory for the browser checks. With Python 3 available:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory out
```

Open `http://127.0.0.1:4173/`. For interactive development, run `pnpm dev:web` in a separate terminal. The November 8 QA record reports 32 passing tests and 44 pre-rendered pages/routes. Record the actual results of this checkout. [Previous QA results](QA.md)

## Check one complete golfer flow

1. Open `/courses/`, search for ZIP `92584`, and confirm Menifee Lakes appears.
2. Open a course hub and start a round. Confirm the form carries over the selected course, save the round, and find it on that same hub.
3. Reload in the same browser and confirm the preview round persists. Check the course picker and form at a 375 px viewport.
4. Report the checkout SHA, typecheck result, test count, build result, browser results, and any failing command or route. This pass covers the local preview. Report hosted account checks separately when run.

## Where to work

| Area | Repository path |
| --- | --- |
| Page routes and UI | `apps/web/app/`, `apps/web/components/` |
| Course directory and shared rules | `packages/courses/`, `packages/utilities/` |
| Supabase client and profile services | `packages/database/` |
| Database schema and row-level security (RLS) | `supabase/migrations/`, `tests/database.test.ts` |
| Brand sources and existing design handoff | `branding/`, [Cursor branding handoff](CURSOR_BRANDING_HANDOFF.md) |

## Next milestone after the local baseline

Phase 0 still needs hosted verification. The last recorded provisioning attempt did not create a dedicated ForeCircle development database. Check for an existing development project before proposing provisioning. The application already contains signup, sign-in, and profile-save code. Rounds, Circles, chat, and tournaments currently use browser-local preview data.

For the next backend task, use the dedicated development project, the checked-in migration, and the browser-safe variables documented in `.env.example`. Verify email confirmation, sign-in, session refresh, and profile persistence. Use two development accounts to check profile write isolation and round/chat membership permissions under RLS. Record the results and remaining gaps before connecting live community features. [Delivery status](STATUS.md) · [Deployment setup](DEPLOYMENT.md) · [RLS model](RLS.md) · [Phase roadmap](ROADMAP.md)
