<p align="center">
  <img src="public/favicon.svg" alt="Jobhunt Local app icon" width="180" />
</p>

<h1 align="center">Jobhunt Local</h1>

<p align="center">
  A job hunt tracker that runs only on your machine. Claude Code finds leads from your CV, you apply.
</p>

<br />

## ✨ What is this?

Claude Code reads your CV, searches job boards for positions that fit it, and writes them as leads. The app shows them
as two lists, **To apply** and **Applied**, with a prefilled e-mail and a link to each posting. You apply yourself;
nothing is ever sent for you.

> 🔒 **Local only, not deployable.** It runs on `127.0.0.1:5180` and nowhere else. Don't host it: a build bakes your
> profile and leads into the bundle. See [Why it isn't deployable](#-why-it-isnt-deployable).

## 🚀 Included

- 📄 `/setup`: reads your CV (pdf, md, docx or txt), asks what's missing and writes your search profile
- 🔎 `/find-jobs`: searches job boards and appends matching postings to `profile/leads.json`
- ⭐ Each lead has a `fit` score from 1 to 5 and `notes` on why it fits and how to apply
- ✉️ Prefilled e-mail per lead, using only addresses printed on the posting
- 📋 Two lists, **To apply** and **Applied**, sorted by fit
- 💾 State in `localStorage`, with **Backup** / **Import** to move it
- 🌍 UI strings in one file, ready for more languages

## 🧰 Tech stack

| Layer       | Choice                                               |
| ----------- | ---------------------------------------------------- |
| UI          | React `19` + Mantine `9`                             |
| State       | Zustand `5` over `localStorage`                      |
| Build       | Vite `8`                                             |
| Language    | TypeScript `7`                                       |
| Lint + fmt  | oxlint + oxfmt                                       |
| Lead finder | [Claude Code](https://claude.com/claude-code) skills |

## 📁 Project layout

```text
jobhunt-local/
├── profile/                   # gitignored, yours (except example/)
│   ├── profile.json           # Roles, locations, remote, sources, exclusions, e-mail template
│   ├── cv.md                  # CV text the agent matches postings against
│   ├── leads.json             # Append-only list of postings found by /find-jobs
│   └── example/               # Committed fictional samples of the three files
├── src/                       # The app: reads profile/*.json at build time, state in localStorage
│   ├── i18n/en.ts             # All UI strings
│   └── check-leads.ts         # Validates profile/*.json
├── .claude/skills/            # /setup and /find-jobs: the job hunting logic, edit to taste
└── docs/                      # Roadmap and security audit
```

## ⚡ Quick start

### Prerequisites

- Node.js `24` or newer
- pnpm `12` (pinned via `packageManager`)
- [Claude Code](https://claude.com/claude-code)

### 1. Install dependencies

```bash
git clone <this repo> jobhunt-local && cd jobhunt-local
pnpm install
```

### 2. Build your profile

```bash
claude
> /setup ~/Documents/cv.pdf
```

Reads your CV, asks a few questions and writes `profile/`. Without a path it looks in `profile/` or asks you.

### 3. Find jobs

```bash
> /find-jobs
```

Finds about 15 matching postings and appends them to `profile/leads.json`. Run it again any time
(`/find-jobs 30 only remote`). New leads appear on top after a reload, and anything you removed stays removed.

### 4. Open the app

```bash
pnpm dev
```

Opens on [http://127.0.0.1:5180](http://127.0.0.1:5180).

## 🧑‍💻 Development scripts

| Command            | Description                             |
| ------------------ | --------------------------------------- |
| `pnpm dev`         | Dev server on `127.0.0.1:5180`          |
| `pnpm check`       | Types, lint, format and `leads:check`   |
| `pnpm leads:check` | Validates `profile/*.json`              |
| `pnpm fmt`         | Formats everything with oxfmt           |
| `pnpm build`       | Compile check only, never a deploy step |

## 🛡️ What leaves your machine

- **Nothing from the app.** No backend, no analytics, no external fonts. The dev server binds to `127.0.0.1`.
- **Claude Code** sends your CV text and profile to the Claude model, and makes web searches and page fetches to job
  boards while running `/find-jobs`.
- App state (applied / removed) is in your browser's `localStorage` for `127.0.0.1:5180`. Use **Backup** / **Import**
  to move it.
- **Watch the agent.** Job postings are written by strangers and can contain text aimed at AI agents. The skills treat
  it as data, and the project settings only pre-approve `pnpm leads:check`. Still read what Claude Code asks to do, and
  say no to anything that sends your CV somewhere or opens unexpected sites. The same goes for postings that ask for
  fees, ID scans or bank details: those are scams, and `/find-jobs` skips them.

## 🚫 Why it isn't deployable

It's local-first by design, not a missing feature:

- `profile/*.json` is read **at build time**. A hosted build would publish your CV-derived profile and leads to anyone
  with the URL.
- Leads come from `/find-jobs` writing a local file. There is no server to fetch them from at runtime.
- State lives in `localStorage` for `127.0.0.1:5180`. Any other origin starts empty, and nothing syncs between devices.

`pnpm build` exists only to check that the app compiles. It isn't a deploy step.

## 🎨 Make it yours

| What                                     | Where                                                        |
| ---------------------------------------- | ------------------------------------------------------------ |
| Search behaviour, sources, `notes` style | `.claude/skills/find-jobs/SKILL.md`                          |
| UI text                                  | `src/i18n/en.ts`                                             |
| Another language                         | Copy `src/i18n/en.ts` and register it in `src/i18n/index.ts` |
| Example data shape                       | `profile/example/`                                           |

## 🩹 Troubleshooting

If `pnpm dev` fails because port `5180` is in use, another dev server is still running. The port is fixed
(`strictPort`) on purpose: `localStorage` belongs to the origin, so another port means an empty app.

If the app shows no leads, run `/find-jobs` and reload. `pnpm leads:check` tells you if `profile/leads.json` is malformed.
