Status: ACCEPTED

## Review Scope

Final D7 code-topology/cross-domino rereview of the repaired packet at `$D7_CHANGE`.
This review is design/specification-only. It does not approve source implementation.

Inputs read:

- Required skills: Domain Design, Information Design, Solution Design, TypeScript Refactoring, and all TypeScript refactoring references.
- Repaired D7 packet: `proposal.md`, `design.md`, `specs/habitat-harness/spec.md`, `tasks.md`, and workstream ledgers.
- Shared context: `$REMEDIATION_DIR/context.md`.
- Current topology: `$HABITAT_TOOL/src/lib/command-engine.ts`, `$HABITAT_TOOL/src/lib/diagnostics.ts`, `$HABITAT_TOOL/src/rules/messages.ts`, `$HABITAT_TOOL/src/commands/check.ts`, `$HABITAT_TOOL/src/commands/verify.ts`, `$HABITAT_TOOL/src/rules/architecture.ts`, `$HABITAT_TOOL/src/plugin.js`, and packet-referenced tests.
- First-wave D7 code/topology and cross-domino scratch files as negative-control input only.

## Decision

No unresolved P1/P2 remain for D7 design/specification acceptance from current code topology, vendor/native behavior, or cross-domino dependency standpoint.

The repaired packet is acceptable because it no longer asks implementation to discover the core structural pipeline. It now records the live current-state inventory, the D7-owned state model, consumed upstream projections, public-surface blockers, downstream D11/D12 projections, write set/protected paths, and falsifying validation gates with enough precision to prevent broad source movement or adjacent-domain reownership.

## Evidence

Current live topology matches the repaired inventory:

- `CheckOptions`, selector state, report orchestration, baseline/Grit/native execution, and final `ok` derivation currently sit inside `createCheckReport` in `$HABITAT_TOOL/src/lib/command-engine.ts` lines 219-343. D7 records this in `design.md` Current Enforcement Inventory and treats it as the state space to collapse, not as target authority.
- `validateCheckReport` is shape-only in `$HABITAT_TOOL/src/lib/diagnostics.ts` lines 44-66. D7 now explicitly requires construction/semantic rejection for `ok`/status contradictions in `design.md` lines 177-190 and `spec.md` lines 139-154.
- `habitat check` still forwards flags into `createCheckReport` and exits from `report.ok` in `$HABITAT_TOOL/src/commands/check.ts` lines 36-53. D7 captures this as public command behavior requiring D0 rows before source changes.
- `verify` still derives affected execution from raw `report.ok` in `$HABITAT_TOOL/src/commands/verify.ts` lines 29-64. D7 now publishes `VerifyCheckSummaryProjection` instead of leaving D12 to infer semantics from `CheckReport`.
- Nx alias targets use `node -e ""` plus `dependsOn` in `$HABITAT_TOOL/src/plugin.js` lines 190-238. D7 now scopes D3 consumption to check-related Nx invocation surfaces and false-green alias prevention, not direct `habitat check` report truth.

The write/protected set is concrete enough:

- `design.md` lines 246-264 limits the design packet write set and later implementation areas.
- `design.md` lines 266-276 protects baseline, registry, Grit, generated-zone, plugin, `.grit`, generated artifact, lockfile, and non-Habitat product domains.
- `tasks.md` lines 17-33 blocks source implementation on D0/D1/D2/D3/D5/D6/D10 prerequisites before deleting current coupling.

Cross-domino dependencies are precise enough:

- `design.md` lines 33-45 assigns D0/D1/D2/D3/D5/D6/D10/D11/D12 owners and D7 use.
- `design.md` lines 87-95 records the consumed contract matrix and the adjacent-domain actions D7 must not perform.
- `spec.md` lines 3-31 normatively requires upstream projection consumption without recomputing registry, graph, baseline, diagnostic, or protected-zone authority.
- `spec.md` lines 203-216 blocks public-surface changes until concrete D0 rows exist and touched rows are no longer `blocked-pending-d0-row`.

D11/D12 handoffs are no longer dependent on current JSON/human parsing:

- `design.md` lines 214-244 defines `LocalFeedbackCheckProjection` and `VerifyCheckSummaryProjection`.
- `spec.md` lines 175-201 requires D11 and D12 to consume those projections and preserves non-claims/skip behavior.
- The downstream ledger records D11/D12 consumer actions and prevents inference from current raw JSON/human output.

The validation matrix falsifies the live risks it claims to cover:

- `design.md` lines 278-298 includes current selector tests, entrypoint tests, enforcement-surface tests, baseline tests, Grit adapter/probe/native tests, plus new D7 report, lane, render, protected-zone, D11, and D12 projection tests.
- The matrix explicitly records current red/drift facts for command help and inventory as repair/disposition prerequisites instead of treating them as green source proof.
- The packet correctly rejects `bun run habitat:check -- --json --rule baseline-integrity` as a current valid gate because `baseline-integrity` is a built-in row today, not a selectable rule.

Design-time validation run in this review:

- `bun run openspec -- validate deep-habitat-d7-structural-enforcement-pipeline --strict` exited 0.
- `bun run openspec:validate` exited 0, 249/249 passed.
- `git diff --check` exited 0.

## P3 Polish

- `spec.md` D12 blocking scenario names `diagnostic-refused`, `baseline-refused`, and `protected-zone-refused` alongside `dependency-refused`; the state model represents those through diagnostic/baseline/D10 dispositions and dependency/refusal projections. This is acceptable, but later implementation docs could make that projection mapping explicit in one sentence.
- `tasks.md` validation items remain unchecked even after this rereview ran the design-time gates. That is consistent with the packet's closure process, but the owner who updates packet index/closure records should record the validation results rather than infer them from this scratch file.

## Non-Claims

- This review does not approve source implementation.
- This review does not prove current-tree structural cleanliness.
- This review does not prove CI, runtime/product behavior, apply safety, Graphite readiness, OpenSpec acceptance for downstream packets, or D10 protected-zone closure.
- D7 implementation remains blocked until concrete D0 rows, D1 output-family handling, live D2/D3/D5/D6 projections, and accepted D10 guard/refusal contracts exist wherever touched.
