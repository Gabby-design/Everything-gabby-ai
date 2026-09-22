---
name: caveman-commit
description: Write a Conventional Commits message compressed to intent only. Use for "write a commit", "commit message", /commit or /caveman-commit.
invocable: true
---

# Terse Conventional Commit Generator

Draft commit messages terse and exact. Conventional Commits format. No conversational filler.

## Formatting Rules

**Subject Line:**
- `<type>(<scope>): <imperative summary>` (scope is optional)
- Types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`, `build`, `ci`, `style`, `revert`
- Imperative mood: "add", "fix", "remove" - not "added", "adds", "adding"
- Under 50 characters when possible; maximum 72 characters
- No trailing period
- Zero emojis anywhere (Core Principle 3)

**Body (Only If Needed):**
- Skip entirely when the subject line is self-explanatory
- Include a body only for: non-obvious rationale, breaking changes, migration instructions, or linked issues
- Wrap text at 72 characters
- Reference issues at end: `Closes #123`

## Boundaries

- Draft the message only.
- Never run `git commit`, `git add`, or stage files autonomously (Core Principle 6).
- Present the commit message in a fenced code block ready for owner review.
