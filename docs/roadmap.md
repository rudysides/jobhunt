# Roadmap to 1.0

Jobhunt Local is a job hunt tracker that runs only on your computer. Claude Code finds postings that fit your CV, the
app shows them as two lists, and you apply yourself.

This roadmap is for everyone following the project: people who want to know when it's ready to use, and developers who
want to help. **Where it stands (November 2026):** the app and both skills work end to end on the author's machine,
nothing is released yet, and a [security audit](security-audit.md) found two medium and five low issues plus three
hardening notes, none critical.

Sizes: **S** is an hour or two, **M** about a day, **L** several days. `JL-xx` refers to a finding in the audit.

## What 1.0 means

1. **Safe by default.** Your CV and job search don't leave your computer through the app, the repository or the agent
   unless you approve it.
2. **Usable by anybody.** Someone who isn't a developer gets from zero to a list of jobs by following the README step
   by step. They still need Claude Code, which needs a Claude subscription or an API account.
3. **Stable data.** `profile.json`, `leads.json`, backups and the browser storage keep working across 1.x updates. Any
   change ships with a migration.
4. **Easy to contribute to.** Tests, CI and docs let a newcomer change something without fear of breaking anyone's data.

The repository can go public before 1.0, for example as a 0.9 beta, once Milestone 1 is done and `LICENSE` and
`SECURITY.md` from Milestone 5 are in.

## Milestone 1 · Safe by default

Must land before the repository goes public.

- [ ] **Lock down the dev server** (JL-02) · S. `server.cors: false`; add everything in `profile/` except `*.json`, and
      `dist/`, to `server.fs.deny` while keeping Vite's defaults.
- [ ] **Prompt-injection guardrails** (JL-01) · M. "Untrusted content" rules in the `find-jobs` and `setup` skills, a
      project `.claude/settings.json` that pre-approves only the normal path, a short warning in the README.
- [ ] **One lead validator for everything** (JL-03, JL-05) · M. Shared by `leads:check`, **Import** and rendering:
      strict e-mail, `http(s)` links only, length limits, no control characters.
- [ ] **Safe import** (JL-04) · M. Validate and normalise rows, confirm before replacing, an error boundary with
      **Download raw data** and **Reset app data**.
- [ ] **Build without output** (JL-06) · S. `build.write: false`, drop the `preview` script, delete the local `dist/`.
- [ ] **Personal-data guardrails** (JL-07) · S. Ignore CV files in the repo root; choose the commit e-mail before the
      first commit.
- [ ] **Robustness** (JL-10) · S. `Object.hasOwn` for the locale; a `migrate` function for the stored state.
- [ ] **Content-Security-Policy** (JL-09) · M. Optional for 1.0; ship it if the dev-mode caveats work out.

## Milestone 2 · Tests and CI

- [ ] **Unit tests with Vitest** · M. Vite-native, so `import.meta.glob` just works. Cover the store merge (new leads on
      top, removed leads never return, applied rows survive when their lead disappears, unsent rows refresh from
      `leads.json`), **Delete all**, `mailtoHref` with the JL-03 payloads, a backup round trip and rejected bad files,
      and `leads:check` against valid and invalid fixtures.
- [ ] **Dev-server security test** · S. Start Vite and expect 403 for the CV and `dist/`, and no CORS header for a
      localhost origin.
- [ ] **GitHub Actions CI** · S. `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm test` and the compile check on
      Linux, macOS and Windows. `permissions: contents: read`, actions pinned to commit SHAs. Fail when tracked files
      include `profile/`, `dist/` or CV files.
- [ ] **Dependency updates** (JL-08) · S. Dependabot or Renovate with grouped weekly updates, `minimumReleaseAge` in
      `pnpm-workspace.yaml`, `"engines": { "node": ">=24" }`.

## Milestone 3 · Usable by anybody

- [ ] **Demo mode** · M. `pnpm demo` runs the app with the fictional `profile/example/` data on its own port, so it
      never touches your real data. Try it before `/setup`, take screenshots safely, develop without a profile.
- [ ] **README for non-developers** · M. A screenshot or short GIF from demo mode. What you need: a Claude subscription
      or API account, Git, Node 24+ and pnpm. Step-by-step install for macOS, Windows and Linux (Node 25+ no longer
      ships Corepack, so pnpm is installed separately). First run, daily use, updating, moving to another computer,
      deleting all your data, what `/find-jobs` costs in Claude usage. Troubleshooting: port 5180 taken, an empty app
      after changing port or browser.
- [ ] **One command to start** · S. `pnpm start` opens the browser at `http://127.0.0.1:5180`.
- [ ] **Updates without merge conflicts** · M. The README invites you to edit the skills, which then collide with
      `git pull`. Keep personal tweaks in `profile/` (for example a `profile/find-jobs.md` the skill reads, or more
      fields in `profile.json`) and keep the skills owned by the project.
- [ ] **Scam warnings** · S. `/find-jobs` skips or flags postings that ask for fees, ID or bank details, or use a
      personal free-mail address for a company job. A short safety tip in the README.
- [ ] **Czech UI** · S. Optional: most of the default job boards are Czech. `/setup` offers the language.

## Milestone 4 · Stable data and polish

- [ ] **Complete backups** · S. Include `dismissedLeads`; today, restoring in a new browser brings removed leads back.
      Versioned format `{ version, exportedAt, rows, dismissedLeads }`, old backups still import.
- [ ] **Documented formats** · M. JSON Schema for `profile.json`, `leads.json` and backups in `schema/`, used by
      `leads:check` and editors. A written rule: 1.x only adds optional fields; anything else ships with a migration
      and a changelog entry.
- [ ] **Cross-browser pass** · S. Chrome, Firefox and Safari: backup download (the file URL is revoked right after
      `click()`), long mailto bodies, dark mode, keyboard and screen reader.
- [ ] **Clean-ups** · S. Remove leftovers like the "personal app" comment in `src/store.ts` and the unused `daysSince`.

## Milestone 5 · Release 1.0.0

- [ ] **Project files** · S. `LICENSE` (MIT, as `package.json` says; the file is missing), `SECURITY.md` (how to report
      a vulnerability, threat model summary), `CONTRIBUTING.md` (setup with demo data, `pnpm check`, the rules from
      `CLAUDE.md`), issue templates with a "don't paste your CV, leads or backups" notice, a PR template with a
      checklist, `CHANGELOG.md`.
- [ ] **GitHub settings** · S. Private vulnerability reporting, Dependabot alerts, secret scanning with push
      protection, a ruleset on `main` (CI required, no force pushes), description, topics, a social preview image from
      demo mode.
- [ ] **Fresh-eyes test** · M. Someone who isn't the author, ideally not a developer, installs it on a clean machine
      using only the README. Fix every stumble.
- [ ] **Final checks** · S. Every `JL-xx` finding closed and re-tested with the
      [re-test checklist](security-audit.md#re-test-checklist), `pnpm audit` clean, no personal data and the
      intended author e-mail in `git log -p`.
- [ ] **Release** · S. `"version": "1.0.0"`, tag `v1.0.0`, GitHub release notes (what it is, requirements, privacy
      statement), make the repository public.

## After 1.0

Ideas, not promises:

- More stages than "applied": interview, offer, rejected, follow-up reminders.
- Adding a job by hand, without the agent.
- CSV export.
- More UI languages.
- Instructions for other coding agents that read `AGENTS.md`.
- A desktop app that removes the Node and pnpm requirement.
