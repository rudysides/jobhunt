# Jobhunt Local

A job hunt tracker that runs only on your machine. Claude Code reads your CV, searches job boards for positions that
fit it, and writes them as leads. The app shows them as two lists, **To apply** and **Applied**, with a prefilled e-mail and
a link to each posting. You apply yourself; nothing is ever sent for you.

> **Local only, not deployable.** It runs on `127.0.0.1:5180` and nowhere else. Don't host it: a build bakes your
> profile and leads into the bundle. See [Why it isn't deployable](#why-it-isnt-deployable).

## Quickstart

Needs Node 24+, pnpm and [Claude Code](https://claude.com/claude-code).

```sh
git clone <this repo> jobhunt-local && cd jobhunt-local
pnpm install
claude
> /setup ~/Documents/cv.pdf   # reads your CV (pdf/md/docx/txt), asks a few questions, writes profile/
                              # no path? it looks in profile/ or asks you
> /find-jobs      # finds ~15 matching postings → profile/leads.json

pnpm dev          # http://127.0.0.1:5180
```

Run `/find-jobs` again any time (`/find-jobs 30 only remote`). New leads appear on top after a reload, and anything you
removed stays removed.

## How it works

```
profile/            gitignored, yours
  profile.json      roles, locations, remote, sources, exclusions, e-mail template
  cv.md             CV text the agent matches postings against
  leads.json        append-only list of postings found by /find-jobs
src/                the app: reads profile/*.json at build time, state in localStorage
.claude/skills/     /setup and /find-jobs: the actual job hunting logic, edit them to taste
```

Each lead carries `notes` (why it fits your CV, how to apply) and a `fit` score from 1 to 5. The list is sorted by fit.
The agent only uses e-mail addresses printed on the posting. Otherwise you apply through the posting's form.

## What leaves your machine

- **Nothing from the app.** No backend, no analytics, no external fonts. The dev server binds to `127.0.0.1`.
- **Claude Code** sends your CV text and profile to the Claude model, and makes web searches and page fetches to job
  boards while running `/find-jobs`.
- App state (applied / removed) is in your browser's `localStorage` for `127.0.0.1:5180`. Use **Backup** / **Import**
  to move it.

## Why it isn't deployable

It's local-first by design, not a missing feature:

- `profile/*.json` is read **at build time**. A hosted build would publish your CV-derived profile and leads to anyone
  with the URL.
- Leads come from `/find-jobs` writing a local file. There is no server to fetch them from at runtime.
- State lives in `localStorage` for `127.0.0.1:5180`. Any other origin starts empty, and nothing syncs between devices.

`pnpm build` exists only to check that the app compiles. It isn't a deploy step.

## Customize

- Search behaviour, sources and the `notes` style: `.claude/skills/find-jobs/SKILL.md`
- UI text: `src/i18n/en.ts` (add a language by copying it and registering it in `src/i18n/index.ts`)
- Example data shape: `profile.example/`

## Scripts

`pnpm dev` · `pnpm build` (compile check only) · `pnpm check` (types, lint, format, `leads:check`) · `pnpm leads:check` · `pnpm fmt`
