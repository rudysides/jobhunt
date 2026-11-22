# Contributing

Thanks for helping. The one rule that matters most: **nobody's personal data goes into the repository**, not in code,
tests, issues or screenshots.

## Setup

You need Node 24+, pnpm and Git.

```sh
pnpm install
pnpm demo     # the app with the fictional profile/example/ data on http://127.0.0.1:5181
```

You don't need a profile or Claude Code to work on the app. Demo mode runs on its own port, so it never touches the data
in your real app on 5180.

## Before you open a PR

```sh
pnpm check    # types, lint, format, leads:check and the tests
```

CI runs the same on Linux, macOS and Windows.

## Rules

They are in [CLAUDE.md](../CLAUDE.md), which both people and agents follow. In short:

- Local only: no backend, network requests, telemetry, CDNs or hosting config.
- `profile/` is personal and gitignored. `profile/example/` is fictional; keep it that way.
- Saved data keeps working across 1.x: a format change needs a `version` bump and a `migrate` step in `src/store.ts`,
  plus a line in [CHANGELOG.md](../CHANGELOG.md). See [docs/data.md](../docs/data.md).
- Lead, import and link rules live in one place, `src/validate.ts`.
- UI strings go to `src/i18n/en.ts`. Tabs, single quotes, 120 columns (`pnpm fmt`).

Security problems: see [SECURITY.md](SECURITY.md), never a public issue.
