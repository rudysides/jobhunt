# Roadmap

Jobhunt Local is a job hunt tracker that runs only on your computer. Claude Code finds postings that fit your CV, the
app shows them as two lists, and you apply yourself.

**1.0 means:** safe by default (nothing leaves your machine without your approval), usable by someone who isn't a
developer, data that keeps working across 1.x updates, and easy to contribute to.

## Done

- All [security audit](security-audit.md) findings except the optional CSP.
- Tests (Vitest) for the store, validator, backups, `leads:check` and the dev-server lockdown; CI on Linux, macOS and
  Windows; Dependabot.
- `pnpm demo` with fictional data, `pnpm start`, a README for non-developers, [data formats and the stability
  promise](data.md), your own search rules in `profile/find-jobs.md`.
- `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, issue and PR templates.

## Before 1.0.0

- [ ] **Cross-browser pass** in Firefox and Safari: backup download, long mailto bodies, dark mode, keyboard.
- [ ] **Fresh-eyes install** by someone else on a clean machine, using only the README.
- [ ] **GitHub settings:** private vulnerability reporting, secret scanning with push protection, a ruleset on `main`
      (CI required), description and topics.
- [ ] **Release:** `"version": "1.0.0"`, tag `v1.0.0`, release notes from the changelog, make the repository public.

Optional: Content-Security-Policy, Czech UI.

## After 1.0

Ideas, not promises: interview / offer / rejected stages, adding a job by hand, CSV export, more languages, a desktop
app without Node.
