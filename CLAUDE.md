# CLAUDE.md

Jobhunt Local: a local-first job hunt tracker. Vite + React + Mantine, no backend. Claude Code finds leads from the
user's CV (`/setup`, `/find-jobs` in `.claude/skills/`); the app is just two lists over `localStorage`.

## Data

- `profile/`: **gitignored, personal** (except `profile/example/`). `profile.json` (search profile), `cv.md` (CV text), `leads.json` (leads).
- `profile/example/`: committed fictional samples with the same shape. Types: `src/profile.ts`.
- App state (applied / removed) lives in `localStorage` under `jobhunt-local.jobs.v1`.

## Commands

```sh
pnpm dev          # http://127.0.0.1:5180
pnpm check        # typecheck + oxlint + oxfmt --check + leads:check
pnpm leads:check  # validates profile/*.json
pnpm build        # compile check only, writes nothing (build.write: false)
pnpm fmt
```

Run `pnpm check` before finishing a change.

## Rules

- **Local only.** The server binds to 127.0.0.1. No backend, telemetry, analytics or external fonts/CDNs.
  **Not deployable by design:** a build bakes `profile/*.json` into the bundle. Don't add hosting config, CI deploys,
  a `base` path or a runtime fetch of `profile/`. `pnpm build` is only a compile check.
- **Never commit or write personal data outside `profile/`.** `profile/example/` stays fictional; skills never write there.
- **Port 5180 is fixed on purpose.** `localStorage` belongs to the origin; another port = empty app.
  Don't change `strictPort` or the storage key without a migration.
- **One validator:** `src/validate.ts` holds the e-mail, link and text rules for `leads:check`, import and rendering.
  Saved state changes need a `version` bump and a `migrate` step in `src/store.ts`.
- **Leads are append-only.** New entries with a unique, stable `leadId`. Never rewrite or reorder existing ones.
  The store merges new ids on load and never re-adds removed ones.
- **Never guess e-mail addresses.** Only addresses printed on the posting. Never send e-mails or submit forms.
- **UI strings** go to `src/i18n/en.ts`, never inline. Comments in English.
- Style: tabs, single quotes, 120 columns (oxfmt).
