# Your data

Everything stays on your computer, in two places.

| What                    | Where                                                   | Written by   |
| ----------------------- | ------------------------------------------------------- | ------------ |
| Search profile          | `profile/profile.json`                                  | `/setup`     |
| CV text                 | `profile/cv.md`                                         | `/setup`     |
| Found jobs (leads)      | `profile/leads.json`                                    | `/find-jobs` |
| Your own search rules   | `profile/find-jobs.md` (optional)                       | you          |
| Applied, removed, notes | browser `localStorage` on `127.0.0.1:5180`              | the app      |
| View choices            | `localStorage`: `jobhunt-local.tab`, `.sort`, `.accent` | the app      |

`profile/` is gitignored. The shapes are typed in [`src/profile.ts`](../src/profile.ts) and
[`src/store.ts`](../src/store.ts), with fictional samples in [`profile/example/`](../profile/example/).

## Formats

**`leads.json`** is an array of leads, append-only. Each one has a unique, stable kebab-case `leadId`, the strings
`company position location contactName role email source jobUrl salary notes foundAt` (`foundAt` is `YYYY-MM-DD`)
and an optional `fit` from 1 to 5. `email` is a plain address or empty, `jobUrl` an `http(s)` link or empty.
`pnpm leads:check` enforces this with the rules in [`src/validate.ts`](../src/validate.ts).

**App state** (`localStorage` key `jobhunt-local.jobs.v1`) is `{ state: { rows, dismissedLeads }, version }`. A row is
a lead (without `foundAt`) plus `id`, `leadId`, `status` (`todo` or `applied`), `appliedAt`, `updatedAt` and `myNotes`.
`dismissedLeads` lists the leads you removed, so they never come back.

**Backups** (Settings → Backup) are `{ version, exportedAt, rows, dismissedLeads }`. Import also reads older backups
(`{ rows }` or a bare array). Every row is checked; one bad row rejects the whole file.

## Stability promise

Within 1.x, your files, saved state and backups keep working:

- Formats only gain **optional** fields.
- Anything else ships with a migration (a `version` bump and a `migrate` step in `src/store.ts`) and a line in the
  [changelog](../CHANGELOG.md).
- The port (5180) and the storage key don't change, because the browser ties your data to them.

## Moving to another computer

Copy the `profile/` folder, make a **Backup** in Settings, then on the new computer clone the project, put `profile/`
back, start the app and **Import** the backup.

## Deleting everything

Settings → **Delete all jobs** clears the app. Then delete the `profile/` folder (or the whole project folder).
