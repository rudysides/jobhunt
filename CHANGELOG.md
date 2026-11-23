# Changelog

## 1.0.0 (2026-11-23)

First public release.

- Two lists, **To apply** and **Applied**, fed by `/find-jobs` from your CV. Sort by fit, newest or company; undo on
  remove; your own notes on applied jobs.
- `/setup` builds the search profile from your CV; `/find-jobs` appends leads and skips likely scams.
- Backup and import with checks and a confirm step; backups include removed jobs.
- `pnpm demo` with fictional data, `pnpm start` opens the app.
- Add a job by hand (**Add job** above the list), straight to **To apply** or **Applied**, and edit it later.
  Jobs you add stay yours: `leads.json` never changes or removes them, and backups include them.
- Company logos: `/find-jobs` saves them to `profile/logos/` (PNG, JPEG, WebP or ICO, never SVG), initials otherwise.
- Notes on applied jobs are edited in place.
- `/find-jobs` knows job boards across Europe, the UK, the US and Brazil.
- UI in English, German, French, Spanish, Italian, Dutch, Portuguese, Polish and Czech, switchable in Settings.
- The search profile in Settings shows every part, each row copies the `/setup <part>` command that changes just that
  part. `/setup` also takes a change in your own words.
- IBM Plex Sans and Mono bundled with the app (no font CDN), orange accent by default, plain text tabs with
  counts above the list.
- Toasts: a check when a job is marked applied, an undo button when one is removed.
- Security: dev server locked to `127.0.0.1` without CORS and without access to your CV, a build that writes nothing,
  one validator for leads, imports and links, prompt-injection rules in the skills. See
  [docs/security-audit.md](docs/security-audit.md).
