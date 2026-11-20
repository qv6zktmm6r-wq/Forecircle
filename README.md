# ForeCircle

**Meet. Play. Compete.** Find your people. Play more golf.

ForeCircle is a social golf community for finding open rounds, joining Circles, and organizing tournaments. This repository contains the Next.js preview, shared packages, Supabase migration, tests, and the Refined Original brand kit.

The preview supports browser-local community workflows. Live multi-user features require a dedicated Supabase project and further implementation. See the [delivery status](docs/STATUS.md) and [roadmap](docs/ROADMAP.md).

The marketing domain is **ForeCircleGolf.com** and the app domain is **ForeCircle.app**.

## Start

Node 24 and pnpm 11.25.0.

```sh
pnpm install
pnpm dev:web
pnpm typecheck
pnpm test
pnpm build
```

`dev` is intentionally empty so Sites previews serve the tested static export. `dev:web` runs Next.js development; the Sites preview harness's Vite-style flags are normalized by `scripts/dev.mjs`. Use `pnpm build` before starting the static Sites preview. Restart that preview after a rebuild replaces `out/`.

## Structure

- `apps/web/`: Next.js App Router, React, TypeScript, Tailwind v4, shared UI and responsive pages.
- `packages/config/`: brand, tokens, feature flags.
- `packages/types/`: platform entities for web and future mobile.
- `packages/validation/`: Zod input schemas.
- `packages/database/`: Supabase client, authenticated profile service, payment interface stub.
- `packages/utilities/`: framework-independent rules and analytics abstraction.
- `supabase/migrations/`: foundation schema and mandatory RLS.
- `supabase/seed/`: development fixture strategy, never automatically applied.
- `tests/`: business rules and SQL/RLS integration tests with PGlite and a mocked Supabase auth schema.

## Setup gate

Copy `.env.example` to `apps/web/.env.local`, configure only the project URL and publishable key, and apply the reviewed migration to a dedicated development project. No service-role key belongs in client code. Configure auth redirect URLs. Run hosted RLS tests and real account verification before enabling any production community workflow.

## Brand files

![ForeCircle brand applications](branding/ForeCircle_Brand_Applications.png)

| File | Purpose |
| --- | --- |
| [Brand guide](branding/ForeCircle_Brand_Guide.pdf) | Seven-page palette, logo, typography, interface, and application guide |
| [Complete brand kit](branding/ForeCircle_Brand_Kit.zip) | Downloadable package of the guide and reusable assets |
| [Transparent logo](branding/ForeCircle_Logo_Transparent.png) | Horizontal PNG logo with tagline |
| [Brand applications](branding/ForeCircle_Brand_Applications.png) | App, apparel, membership-card, and photography concepts |
| [CSS tokens](branding/ForeCircle_Tokens.css) | Colors, fonts, semantic roles, and example button styles |
| [JSON tokens](branding/ForeCircle_Tokens.json) | Machine-readable design settings |
| [Palette CSV](branding/ForeCircle_Palette.csv) | Core hex/RGB colors and usage |
| [Fonts and licenses](branding/fonts/) | Manrope and Inter variable fonts with license notices |
| [Selected concept reference](branding/reference/ForeCircle_Refined_Original.png) | Refined Original concept that anchors this identity |
| [Brand notes](branding/README.md) | Asset details, contrast rules, and production notes |
| [Cursor handoff](docs/CURSOR_BRANDING_HANDOFF.md) | Instructions for applying this identity to future product work |

## Core palette

| Color | Hex | Use |
| --- | --- | --- |
| Forest | `#003D29` | Identity, navigation, primary buttons |
| Fairway | `#65B800` | Flag, active accents, highlights |
| Ivory | `#FFF8EE` | Main background and stationery |
| Sage | `#E8F0E8` | Quiet panels and alternate sections |
| Sand | `#D7CBB8` | Warm editorial accents |
| Charcoal | `#182C24` | Body copy and text on bright green |

Use **Manrope 700-800** for headings and **Inter 400-700** for body copy and interface labels. Keep the supplied wordmark as artwork rather than retyping it.

The exact token values take precedence over colors sampled from generated previews. Use ivory text on forest-green buttons and charcoal text on bright-green buttons.

The original ZIP and its standalone guide were both recovered. The [separate PDF](branding/reference/ForeCircle_Brand_Guide_Standalone.pdf) is preserved alongside the kit edition. The [reference folder](branding/reference/) includes the concept artwork. The supplied wordmark is raster artwork. Vector and embroidery masters remain production follow-ups.

Verify the brand files from the repository root with `sha256sum -c branding/SHA256SUMS.txt`.
