# Workflow: New Feature Implementation

Structured lifecycle for introducing new functional capabilities, APIs, or user-facing features into a codebase.

## 0. Lifecycle Overview

```text
1. INTAKE & REQUIREMENTS DISCOVERY
   |
   v
2. PRD DRAFTING & OWNER PRD APPROVAL (HUMAN GATE)
   |
   v
3. ARCHITECTURAL & IMPLEMENTATION PLANNING (HUMAN GATE)
   |
   v
4. TEST-DRIVEN DESIGN & CONTRACT SPECIFICATION
   |
   v
5. INCREMENTAL IMPLEMENTATION
   |
   v
6. FULL VERIFICATION SUITE EXECUTION
   |
   v
7. CODE & SECURITY REVIEW
   |
   v
8. DOCUMENTATION RECONCILIATION & CHECKPOINT
   |
   v
9. HAND BACK FOR OWNER COMMIT
```

## Stage 1: Intake & Requirements Discovery
- Clarify feature purpose, target users, inputs, outputs, and edge cases.
- Identify dependencies on existing modules, databases, external APIs, and configurations.
- Formulate explicit non-goals to prevent scope expansion.

## Stage 2: PRD Drafting & Owner Approval (Human Gate)
- For non-trivial features, execute the `create-prd` skill.
- Document functional requirements, non-functional requirements, data models, and acceptance criteria.
- Present PRD to repository owner and wait for explicit approval before proceeding.

## Stage 3: Architectural & Implementation Planning (Human Gate)
- Break down implementation into concrete, sequential tasks.
- Specify exact file paths, modified methods, and interface definitions.
- Identify risk factors, potential regressions, and performance bottlenecks.
- Obtain owner approval on the implementation plan.

## Stage 4: Test-Driven Design (TDD)
- Author unit and integration tests covering:
  - Happy path scenarios
  - Input validation and boundary values
  - Error and failure states
- Confirm that newly written tests fail as expected prior to implementation (Red phase).

## Stage 5: Incremental Implementation
- Implement logic to turn failing tests green (Green phase).
- Ensure code complies with coding standards:
  - Max 400 lines per file; max 50 lines per function.
  - Immutability by default.
  - Comprehensive input validation.
  - Clear, human-readable logging with zero emojis.
- Refactor code for readability and modularity without altering behavior (Refactor phase).

## Stage 6: Full Verification Suite Execution
- Run all automated tests across the codebase.
- Run typechecking, linting, and build verification.
- Ensure 100% pass rate with zero test failures or regressions.

## Stage 7: Code & Security Review
- Audit code changes against security standards:
  - Input sanitization (injection prevention)
  - Zero hardcoded credentials, keys, or sensitive URLs
  - Safe error handling without credential leakage
- Review code style, naming clarity, and module boundaries.

## Stage 8: Documentation Reconciliation
- Update `CHANGELOG.md` with added feature details.
- Update `MEMORY.md` to record the new capability, configuration, and architecture.
- Clear in-flight tasks from `HANDOFF.md`.

## Stage 9: Hand Back for Owner Review
- Present complete summary of:
  - Implemented capability against acceptance criteria
  - Added files and test coverage results
  - Verification run results
- Conclude with: *No git commit was made. Changes are ready for owner review and commit.*
