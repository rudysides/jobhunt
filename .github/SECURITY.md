# Security

Jobhunt Local runs only on your computer and handles your CV, so leaks of personal data are what matters most.

## Reporting a vulnerability

Use **Report a vulnerability** on the repository's Security tab (GitHub private vulnerability reporting).
Please don't open a public issue, and never attach your own CV, `profile/` files or backups.

## What is in scope

- Anything that lets your CV, profile, leads or app data leave your machine without your approval: through the app,
  the dev server, the repository or the Claude Code skills.
- Crafted leads or backups that run code, inject into `mailto:` links or break the app.

The threat model, past findings and a re-test checklist are in [docs/security-audit.md](../docs/security-audit.md).
