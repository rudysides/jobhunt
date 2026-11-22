---
name: setup
description: Onboarding for Jobhunt Local. Reads the user's CV, asks for what is missing and writes profile/profile.json + profile/cv.md. Use when the user runs /setup or wants to change their job search profile.
argument-hint: '[path to CV]'
---

# /setup: build the job search profile

Everything you write goes to `profile/`, which is gitignored. Never write personal data anywhere else in the repo.
Reference shape: `profile/example/profile.json` (fields are typed in `src/profile.ts` → `Profile`).

## 1. Existing profile?

If `profile/profile.json` exists, show a short summary (roles, locations, remote, sources) and ask what to change.
Edit only those fields, never wipe the file. Skip to step 5.

## 2. Find the CV

In this order: the path in `$ARGUMENTS`, then any `*.pdf|*.md|*.docx|*.txt` in `profile/`, then in the repo root.
If none is found, ask the user for a path or to paste the CV text. A CV is optional: without one, build the profile from questions only.
`profile/` may not exist yet (it is gitignored): create it with `mkdir -p profile`. If the CV lives outside `profile/`, offer to copy it there (from the repo root: move it). Copying is optional because `cv.md` is what the agents read.

## 3. Extract

Write the plain CV text to `profile/cv.md` (Markdown, keep the facts, drop the layout).
From it, draft: `name`, `headline`, `targetRoles` (2-5 realistic titles for this experience),
`seniority`, `locations`, `languages`, `mustHave`/`niceToHave` (from skills, strongest first).

## 4. Ask only what the CV doesn't tell you

Use AskUserQuestion, at most 4 questions per round, with your draft as the first (Recommended) option:

- Target roles and seniority: confirm the draft
- Location + remote: `no` | `hybrid` | `only`
- Sources: suggest the ones that fit the location and roles (see the source list in `.claude/skills/find-jobs/SKILL.md`)
- Exclusions (companies, keywords like "senior"), minimum salary (optional)
- E-mail template: offer a short template in the CV's language with the `{position} {company} {contactName} {name}` placeholders

Set `locale` to `"en"` (the only UI language so far). `contactEmail` only if the user gives it; never guess it.

## 5. Write and verify

Write `profile/profile.json` (valid JSON, tab-indented), then run `pnpm leads:check`.
If `profile/leads.json` doesn't exist, create it as `[]`.

## 6. Finish

Print a 3-5 line summary of the profile and the next step:

```
/find-jobs          # find ~15 leads
pnpm dev            # http://127.0.0.1:5180
```
