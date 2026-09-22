# Workflow: Comprehensive Code Audit

Systematic auditing procedure for code health, security vulnerabilities, performance bottlenecks, and architectural integrity.

## 0. Lifecycle Overview

```text
1. SCOPE & BASELINE DEFINITION
   |
   v
2. STATIC ANALYSIS & AUTOMATED METRICS
   |
   v
3. SECURITY & VULNERABILITY AUDIT
   |
   v
4. PERFORMANCE & RESOURCE CONSUMPTION AUDIT
   |
   v
5. CODE QUALITY & ARCHITECTURAL DRIFT INSPECTION
   |
   v
6. FINDINGS COMPILATION & SEVERITY CLASSIFICATION
   |
   v
7. REMEDIATION PROPOSAL & REPORTING
```

## Stage 1: Scope & Baseline Definition
- Determine audit boundaries: entire repository, specific package, or recently modified diff.
- Verify that current test suites pass to establish a clean baseline.
- Note any known limitations or out-of-scope third-party dependencies.

## Stage 2: Static Analysis & Automated Metrics
- Execute compiler / typechecker checks (e.g. `tsc --noEmit`).
- Run code linters to flag mechanical style and formatting discrepancies.
- Check file size thresholds: flag any files exceeding 400 lines or functions exceeding 50 lines.

## Stage 3: Security & Vulnerability Audit
- Check for OWASP Top 10 vulnerabilities:
  - Injection risks (SQL, shell, template)
  - Broken authentication or session management
  - Sensitive data exposure or hardcoded credentials
  - Insecure direct object references
- Inspect dependency vulnerability reports if package manifest is present.
- Confirm all external input is validated using strict schemas.

## Stage 4: Performance & Resource Consumption Audit
- Check for unnecessary synchronous I/O operations in high-throughput paths.
- Inspect loops and recursive routines for potential algorithmic complexity hotspots.
- Identify memory leak risks: unclosed file handles, uncleared intervals, or unbounded caches.

## Stage 5: Code Quality & Architectural Integrity
- Verify adherence to immutability and functional decomposition patterns.
- Check error handling: ensure errors provide descriptive diagnostic context rather than empty catch blocks.
- Check documentation freshness: verify whether `MEMORY.md`, `ARCHITECTURE.md`, and README reflect actual codebase reality.
- Detect dead code, orphaned exports, or redundant dependencies.

## Stage 6: Findings Classification
Format audit findings with explicit severity tags:
- `[CRITICAL]`: Active security risk, data loss hazard, or severe production blocker.
- `[HIGH]`: Reliability issue, unhandled error condition, or significant memory/performance degradation.
- `[MEDIUM]`: Code smell, boundary leak, file size limit violation, or missing test coverage on non-critical path.
- `[LOW]`: Minor style discrepancy, redundant comment, or non-blocking cosmetic detail.

## Stage 7: Remediation Proposal & Reporting
- Compile the findings into an actionable audit report.
- For each finding, provide:
  - File path and line number
  - Violation description
  - Recommended concrete fix
  - Risk assessment of applying the fix
- Do not make autonomous changes during an audit. Submit the report for owner evaluation.
