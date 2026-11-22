# Changelog

## Unreleased (1.0.0)

First public release.

- Two lists, **To apply** and **Applied**, fed by `/find-jobs` from your CV. Sort by fit, newest or company; undo on
  remove; your own notes on applied jobs.
- `/setup` builds the search profile from your CV; `/find-jobs` appends leads and skips likely scams.
- Backup and import with checks and a confirm step; backups include removed jobs.
- `pnpm demo` with fictional data, `pnpm start` opens the app.
- English and Czech UI, switchable in Settings.
- Toasts: a check when a job is marked applied, an undo button when one is removed.
- Security: dev server locked to `127.0.0.1` without CORS and without access to your CV, a build that writes nothing,
  one validator for leads, imports and links, prompt-injection rules in the skills. See
  [docs/security-audit.md](docs/security-audit.md).
