# M4 Full-Stack Review Loop Plan (Agent IGNEZ)

## Canonical Context
- Milestone intent anchor: `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md`
- Parsed milestone tasks: `7` (`LOCAL-TBD-PR-M4-001..007`)
- Full stack review scope: PRs `#1201` through `#1348` in current Graphite chain (42 PR branches).

## Repeated Review Rubric (Applied Per PR)
1. Contract and architecture alignment (`truth-vs-projection`, no shims/dual paths, step/op boundaries).
2. Behavioral risk and regression potential in changed runtime paths.
3. Verification signal quality (tests/lints/check commands relevant to slice).
4. Docs/schema/comment parity with current contracts.
5. PR thread status (unresolved/rejected/accepted review concerns).
6. Fix-now vs defer classification and cross-cutting risk extraction.

## Progress Log
- 2026-02-17: Reviewed `#1201` (`codex/prr-stack-pr-comments-ledger`) in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-IGNEZ-stack-pr-1201-review`; docs-only, no fix-now findings.
- 2026-02-17: Reviewed #1242 (agent-SWANKO-PRR-ledger-review-full-chain); unresolved=0, resolved=2; verification: docs-only; no runtime check run.
- 2026-02-17: Reviewed #1243 (agent-SWANKO-PRR-s10-c01-fix-cap-reset-threshold-era-max); unresolved=0, resolved=0; verification: bun run --cwd mods/mod-swooper-maps check: FAIL.
- 2026-02-17: Reviewed #1244 (agent-SWANKO-PRR-s11-c01-fix-belt-influence-distance-contract); unresolved=0, resolved=0; verification: bun run --cwd mods/mod-swooper-maps check: FAIL.
- 2026-02-17: Reviewed #1245 (agent-SWANKO-PRR-s93-c01-fix-round-clampint-knobs); unresolved=0, resolved=0; verification: bun run --cwd mods/mod-swooper-maps check: FAIL.
- 2026-02-17: Reviewed #1246 (agent-SWANKO-PRR-s94-c01-fix-sea-level-constraints-first); unresolved=0, resolved=0; verification: bun run --cwd mods/mod-swooper-maps check: FAIL.
- 2026-02-17: Reviewed #1247 (agent-SWANKO-PRR-s97-c01-fix-polarity-bootstrap-oceanic-only); unresolved=0, resolved=0; verification: bun run --cwd mods/mod-swooper-maps check: FAIL.
- 2026-02-17: Reviewed #1248 (agent-SWANKO-PRR-s98-c01-fix-era-fields-dijkstra); unresolved=0, resolved=0; verification: bun run --cwd mods/mod-swooper-maps check: FAIL.
- 2026-02-17: Reviewed #1249 (agent-SWANKO-PRR-s101-c01-fix-crust-thickness-evolution); unresolved=0, resolved=0; verification: bun run --cwd mods/mod-swooper-maps check: FAIL.
- 2026-02-17: Reviewed #1250 (agent-SWANKO-PRR-s108-c01-fix-plateau-seeding); unresolved=0, resolved=1; verification: bun run --cwd mods/mod-swooper-maps check: FAIL.
- 2026-02-17: Reviewed #1251 (agent-SWANKO-PRR-s112-c01-fix-driverStrength-proportional); unresolved=0, resolved=0; verification: bun run --cwd mods/mod-swooper-maps check: FAIL.
- 2026-02-17: Reviewed #1252 (agent-SWANKO-PRR-s113-c01-fix-mountainThreshold-candidates); unresolved=0, resolved=2; verification: bun run --cwd mods/mod-swooper-maps check: FAIL.
- 2026-02-17: Reviewed #1253 (agent-SWANKO-PRR-s115-c01-fix-hill-cap-floor); unresolved=0, resolved=0; verification: bun run --cwd mods/mod-swooper-maps check: FAIL.
- 2026-02-17: Reviewed #1254 (agent-SWANKO-PRR-s118-c01-fix-studio-artifacts-preflight); unresolved=0, resolved=0; verification: bun run --cwd mods/mod-swooper-maps check: FAIL.
- 2026-02-17: Reviewed #1255 (agent-SWANKO-PRR-s119-c01-fix-pass-plateMotion); unresolved=0, resolved=0; verification: bun run --cwd mods/mod-swooper-maps check: FAIL.
- 2026-02-17: Reviewed #1256 (agent-SWANKO-PRR-s120-c01-fix-era-plateMotion-recompute); unresolved=0, resolved=0; verification: bun run --cwd mods/mod-swooper-maps check: FAIL.
- 2026-02-17: Reviewed #1257 (agent-SWANKO-PRR-s124-c01-fix-diag-analyze-mountains-guard); unresolved=0, resolved=0; verification: bun run --cwd mods/mod-swooper-maps check: FAIL.
- 2026-02-17: Reviewed #1262 (codex/agent-ORCH-foundation-domain-axe-spike); unresolved=0, resolved=0; verification: docs-only; no runtime check run.
- 2026-02-17: Reviewed #1263 (codex/agent-ORCH-foundation-domain-axe-execution); unresolved=0, resolved=2; verification: docs-only; no runtime check run.

## Reusable Review Axes (apply to every PR)
1. Contract integrity: truth vs projection boundaries and artifact-id ownership are not blurred.
2. Topology discipline: steps orchestrate; ops do not orchestrate peer ops.
3. Shim/dual-path posture: no legacy+new dual publish or hidden compatibility shims in final state.
4. Verification posture: changed behavior has direct test/lint/guardrail evidence.
5. Docs-contract parity: docs/spec/tutorials reflect real runtime/config surfaces.
6. PR feedback closure: unresolved comment threads are either fixed or explicitly deferred.
7. Stack safety: restacks preserve behavior and do not silently regress parent invariants.
- PR #1325 codex/prr-m4-s02-contract-freeze-dead-knobs: review appended; verification=FAIL; unresolvedThreads=0
- PR #1326 codex/prr-m4-s03-tectonics-op-decomposition: review appended; verification=FAIL; unresolvedThreads=0
- PR #1327 codex/prr-m4-s05-ci-strict-core-gates: review appended; verification=FAIL; unresolvedThreads=0
- PR #1328 codex/prr-m4-s06-test-rewrite-architecture-scans: review appended; verification=FAIL; unresolvedThreads=0
- PR #1329 codex/prr-m4-s06a-foundation-knobs-surface: review appended; verification=FAIL; unresolvedThreads=0
- PR #1330 codex/prr-m4-s06b-foundation-tectonics-local-rules: review appended; verification=FAIL; unresolvedThreads=0
- PR #1331 codex/prr-m4-s06c-foundation-guardrails-hardening: review appended; verification=FAIL; unresolvedThreads=0
- PR #1332 codex/prr-m4-s06d-foundation-scratch-audit-ledger: review appended; verification=FAIL; unresolvedThreads=0
- PR #1333 codex/prr-m4-s06e-earthlike-studio-typegen-fix: review appended; verification=FAIL; unresolvedThreads=0
- PR #1334 codex/agent-A-placement-s1-runtime-hardening: review appended; verification=FAIL; unresolvedThreads=0
- PR #1335 codex/agent-B-placement-s2-verification-docs: review appended; verification=FAIL; unresolvedThreads=0
- PR #1336 codex/agent-C-baseline-check-test-fixes: review appended; verification=PASS; unresolvedThreads=0
- PR #1338 codex/agent-D-placement-discovery-owned-catalog: review appended; verification=PASS; unresolvedThreads=0
- PR #1340 codex/agent-E-placement-discoveries-wonders-fix: review appended; verification=PASS; unresolvedThreads=0
- PR #1341 codex/agent-F-discovery-official-fallback: review appended; verification=PASS; unresolvedThreads=0
- PR #1342 codex/agent-H-resource-official-primary: review appended; verification=PASS; unresolvedThreads=0
- PR #1343 codex/agent-ORCH-m4-reanchor-docs: review appended; verification=FAIL; unresolvedThreads=0
- PR #1344 codex/prr-m4-s07-lane-split-map-artifacts-rewire: review appended; verification=FAIL; unresolvedThreads=0
- PR #1345 codex/prr-m4-s07-orch-plan-second-leg: review appended; verification=PASS; unresolvedThreads=0
- PR #1346 codex/prr-m4-s08-config-redesign-preset-retune: review appended; verification=PASS; unresolvedThreads=0
- PR #1347 codex/prr-m4-s09-docs-comments-schema-legacy-purge: review appended; verification=PASS; unresolvedThreads=0
- PR #1348 codex/prr-pr-comments-discovery-count-enforcement: review appended; verification=FAIL; unresolvedThreads=1
