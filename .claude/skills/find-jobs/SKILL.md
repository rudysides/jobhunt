---
name: find-jobs
description: Searches job boards for positions matching profile/profile.json and appends new leads to profile/leads.json. Use when the user runs /find-jobs or asks for more job leads.
argument-hint: '[count, default 15] [extra focus, e.g. "only remote"]'
---

# /find-jobs: find new leads

## Hard rules

- **Append only.** Add new objects at the end of `profile/leads.json`. Never rewrite, reorder or delete existing ones.
  (The app tracks the user's state by `leadId`; changing an id loses their progress.)
- **Stable unique `leadId`**: kebab-case `company-position` (e.g. `acme-junior-frontend`). Add a suffix on collision.
- **No duplicates**: skip a posting whose `leadId` or `jobUrl` is already in the file, or is the same company + role.
- **Never guess e-mails.** Only an address literally printed on the posting page. Otherwise `"email": ""`.
  If the address is a generic company inbox (info@, office@), say so in `notes`.
- **Never send anything**: no e-mails, no forms, no sign-ups. The user applies themselves.
- Only open each posting page. Don't log in, don't scrape behind logins (LinkedIn: public pages only).

## Steps

1. Read `profile/profile.json` and `profile/cv.md`. No profile → tell the user to run `/setup` and stop.
   Read `profile/leads.json` (missing → treat as `[]`) and collect the existing `leadId`s and `jobUrl`s.
2. Target count = first number in `$ARGUMENTS`, else 15. The rest of `$ARGUMENTS` is extra focus.
3. Search each `profile.sources` entry (WebSearch with the site + role + location, then WebFetch the listing/posting).
   Combine `targetRoles` × `locations` (+ "remote" when `remote` is not `no`). Prefer postings from the last ~30 days.
4. **Open every posting** before adding it. Skip it if it hits `exclude.companies` / `exclude.keywords`,
   clearly needs more seniority than `seniority`, or is outside `locations` without matching `remote`.
5. For each kept posting build a lead:
   ```json
   {
   	"leadId": "acme-junior-frontend",
   	"company": "Acme s.r.o.",
   	"position": "exact title from the posting",
   	"location": "city, district / remote / hybrid",
   	"contactName": "only if named on the posting",
   	"role": "HR / hiring manager / …",
   	"email": "",
   	"source": "<sources[].id>",
   	"jobUrl": "https://… (the posting itself, not a search page)",
   	"salary": "only if stated",
   	"notes": "…",
   	"foundAt": "YYYY-MM-DD (today)",
   	"fit": 4
   }
   ```
   - `notes` (2-4 sentences, in the CV's language): what the company does · why it fits **this CV** (name a concrete
     project/skill) · what's missing · how to apply (form vs e-mail) and the posting date.
   - `fit` 1-5: 5 = matches mustHave + seniority + location, 3 = worth a shot, below 3 → don't add it.
6. Append, then run `pnpm leads:check`. Fix any reported error in **your new entries only**.
7. Report: `+N new leads` and a short table (company · position · fit), plus sources that failed or were empty.
   Remind: reload http://127.0.0.1:5180.

## Source hints

| id               | where                                | tip                                                                  |
| ---------------- | ------------------------------------ | -------------------------------------------------------------------- |
| `jobscz`         | jobs.cz                              | Czech, large. Posting URLs `/rpd/<id>/`. Many apply via a form only. |
| `startupjobs`    | startupjobs.cz                       | Czech startups, often remote/hybrid, English postings.               |
| `prace`          | prace.cz                             | Czech, same group as jobs.cz, dedupe by company + title.             |
| `urad-prace`     | uradprace.cz                         | Czech public listings, often with a contact e-mail.                  |
| `linkedin`       | linkedin.com/jobs (public pages)     | Search via WebSearch `site:linkedin.com/jobs/view`.                  |
| `weworkremotely` | weworkremotely.com                   | Remote, international.                                               |
| `remoteok`       | remoteok.com                         | Remote, international.                                               |
| `hn`             | news.ycombinator.com "Who is hiring" | Monthly thread, many direct e-mails.                                 |
| `web`            | company career pages                 | Good for companies the user named.                                   |
