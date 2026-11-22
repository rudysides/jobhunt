# Roadmap

Jobhunt Local is a job hunt tracker that runs only on your computer. Claude Code finds postings that fit your CV, the
app shows them as two lists, and you apply yourself.

**1.0 means:** safe by default (nothing leaves your machine without your approval), usable by someone who isn't a
developer, data that keeps working across 1.x updates, and easy to contribute to.

## 0.9 · Public beta (done)

All [security audit](security-audit.md) findings except the optional CSP: a locked-down dev server, prompt-injection
and scam rules in the skills, one validator for leads, import and links, safe import with confirm, an error boundary
with **Download raw data** / **Reset app data**, a build that writes nothing, storage migrations, complete backups,
`LICENSE` and `SECURITY.md`.

## 1.0 · Still to do

- [ ] **Tests and CI.** Vitest for the store (merge, undo, notes, delete all, migration), the validator and backups.
      GitHub Actions running `pnpm check` and the tests on Linux, macOS and Windows. Dependabot.
- [ ] **Demo mode.** `pnpm demo` runs the app with `profile/example/` on another port, for screenshots and trying it out.
- [ ] **README for non-developers.** Install steps per OS, daily use, updating, moving to another computer.
- [ ] **Your tweaks in `profile/`**, not in the skills, so `git pull` never conflicts.
- [ ] **JSON Schema** for `profile.json`, `leads.json` and backups.
- [ ] **Cross-browser pass** (Chrome, Firefox, Safari) and a **fresh-eyes install** by someone else.
- [ ] `CONTRIBUTING.md`, issue templates ("don't paste your CV"), `CHANGELOG.md`, GitHub settings.
- [ ] Optional: Content-Security-Policy, Czech UI.

## After 1.0

Ideas, not promises: interview / offer / rejected stages, adding a job by hand, CSV export, more languages, a desktop
app without Node.
