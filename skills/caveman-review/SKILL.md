---
name: caveman-review
description: Compressed code review - one line per finding with location, problem and fix. Use for /caveman-review, "review this PR", or "review the diff".
invocable: true
---

# Terse Code Review Output

Produce code review findings terse and actionable. One line per finding: location, problem, concrete fix. Zero fluff or conversational filler. Zero emojis (Core Principle 3).

## Formatting Rules

**Format:** `<file>:L<line>: [SEVERITY] <problem>. <fix>.`

**Severity prefixes:**
- `[BUG]`: Broken behavior, regression, or crash. Must be fixed.
- `[RISK]`: Works but fragile (race condition, unhandled error, missing check).
- `[NIT]`: Style, naming, minor optimization.
- `[Q]`: Clarifying question.

**Omit:**
- Preamble ("I noticed that...", "You might consider...").
- Decorative praise or per-comment compliments.
- Restating what the code does.

**Keep:**
- Exact line numbers and clickable markdown links.
- Exact symbol/function names in backticks.
- Concrete, actionable fix.

## Examples

- `auth.js:L42: [BUG] user can be null after findById(). Add null guard before user.email.`
- `api.js:L23: [RISK] No retry or backoff on 429 response. Wrap in withBackoff(3).`
- `parser.js:L88: [NIT] 60-line function exceeds single responsibility. Extract validatePayload().`

## Auto-Clarity Exceptions

Drop terse mode for high-severity security vulnerabilities (provide complete rationale and remediation steps) or architectural conflicts.
