# Workflow: Bug Fix and Defect Resolution

Systematic diagnostic and resolution procedure for software defects, unexpected regressions, and broken invariant states.

## 0. Lifecycle Overview

```text
1. INTAKE & TRIAGE
   |
   v
2. AUTHORITATIVE BEHAVIOR IDENTIFICATION
   |
   v
3. REPRODUCTION & FAILING TEST WRITING
   |
   v
4. ROOT CAUSE ISOLATION
   |
   v
5. MINIMAL TARGETED FIX
   |
   v
6. REGRESSION VERIFICATION & ADJACENCY AUDIT
   |
   v
7. DOCUMENTATION RECONCILIATION
   |
   v
8. HAND BACK FOR OWNER COMMIT
```

## Stage 1: Intake & Triage
- Collect symptom description, error messages, stack traces, and environment details.
- Identify whether the defect affects production stability, user data, or security.
- Determine if the issue is a regression (previously working) or a missing feature disguised as a bug.

## Stage 2: Authoritative Behavior Identification
- Establish intended behavior from specifications, PRD, tests, or documentation.
- If specification is ambiguous, ask the owner before guessing intent.
- Record the expected vs actual contract violation.

## Stage 3: Reproduction & Failing Test Writing
- Write a minimal, deterministic reproduction test case.
- Confirm the test reproduces the issue by failing with the expected symptom.
- Do not modify production source code until the reproduction test exists and fails.

## Stage 4: Root Cause Isolation
- Inspect the stack trace, relevant modules, and data flow.
- Locate the primary defect mechanism rather than applying superficial guard checks.
- Verify why existing unit and integration tests did not catch this defect.

## Stage 5: Minimal Targeted Fix
- Apply the smallest correct change that fixes the root cause without side effects.
- Avoid incidental refactorings or cosmetic edits in the same changeset.
- Keep all files within architectural size constraints (< 400 lines).

## Stage 6: Regression Verification & Adjacency Audit
- Execute the reproduction test and confirm it now passes.
- Execute the full test suite to guarantee zero regressions.
- Audit adjacent code paths and callers that handle similar data to ensure identical defects do not exist elsewhere.

## Stage 7: Documentation Reconciliation
- Record the fix in `CHANGELOG.md` with:
  - Symptom observed
  - Root cause identified
  - Corrective action taken
  - Tests added
- Update `MEMORY.md` if assumptions or invariants changed.
- Clear in-flight task notes from `HANDOFF.md`.

## Stage 8: Hand Back for Owner Review
- Output clear summary:
  - Defect description and root cause
  - Reproduction test file and line
  - Modified files and rationale
  - Full test suite execution status
- Explicitly state: *No git commit was made. Changes are ready for owner review and commit.*
