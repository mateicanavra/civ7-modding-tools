# Tasks

## 1. Design Acceptance Prerequisites

- [ ] 1.1 Read the D2 source packet, this OpenSpec packet, the remediation frame, D0 accepted design/specification records, and D1 accepted design/specification records.
- [ ] 1.2 Import D2 negative review findings from `domino-D2-review.md` and fresh D2 investigations into the D2 review ledger.
- [ ] 1.3 Confirm D2 remains design/specification only until final D2 rereview finds no unresolved accepted P1/P2 findings.
- [ ] 1.4 Confirm source implementation remains blocked until concrete D0 matrix rows exist for every D2-touched public/durable surface.

## 2. Implementation Grounding Later

- [ ] 2.1 Start implementation from the approved implementation stack with a clean worktree.
- [ ] 2.2 Cite concrete D0 `surface_id` rows for CLI JSON/human output, package exports, Nx target metadata, generator output, hook output, and docs examples touched by D2.
- [ ] 2.3 Cite the D1 command/report/refusal family used by each malformed metadata failure.
- [ ] 2.4 Record the approved write set and protected paths from `design.md` in the implementation phase record before source edits.

## 3. Registry Model Slice

- [ ] 3.1 Introduce a canonical registry owner module that is the only TypeScript owner of raw `rules.json` parsing.
- [ ] 3.2 Add `RuleRegistryDocumentV1` with `schemaVersion: 1`, closed `ownerTool` vocabulary, closed `lane` vocabulary, and discriminated `RuleRegistryRecord` variants.
- [ ] 3.3 Add parser failures for duplicate ids, unknown adapters, unsupported enforcement dispositions, missing identity facts, and contradicted variant fields.
- [ ] 3.4 Preserve any D0-required `HarnessRule`, `rules`, or `ruleById` public compatibility facade from canonical state, not from raw JSON authority.
- [ ] 3.5 Add registry parser tests using current 51 rules and malformed fixture rows.

## 4. Projection Slice

- [ ] 4.1 Implement `ruleSelectorFacts`, `ruleReportFacts`, `ruleExecutionFacts`, `ruleRoutingFacts`, `ruleGraphFacts`, `ruleBaselineFacts`, `ruleGritFacts`, `ruleGeneratedZoneFacts`, `ruleGovernanceFacts`, and `ruleLocalFeedbackFacts`.
- [ ] 4.2 Add projection tests that assert each consumer receives only permitted fields.
- [ ] 4.3 Add whole-row leakage tests or compile-time checks for consumers with D2 projections.
- [ ] 4.4 Add malformed projection tests for identity, routing, graph, baseline, Grit, generated-zone, governance, and local-feedback failures.

## 5. Consumer Migration Slice

- [ ] 5.1 Migrate selector and check report code in `command-engine.ts` to `ruleSelectorFacts` and `ruleReportFacts`.
- [ ] 5.2 Migrate execution dispatch in `architecture.ts` to `ruleExecutionFacts`.
- [ ] 5.3 Migrate classify routing to `ruleRoutingFacts` and remove prose `scope` parsing as authority.
- [ ] 5.4 Migrate `plugin.js` to `ruleGraphFacts`, removing independent `OWNER_ROOTS` authority, silent owner skips, and colon-string target parsing.
- [ ] 5.5 Migrate baseline consumers to `ruleBaselineFacts` without moving D5-owned shrink/growth/debt decisions into D2.
- [ ] 5.6 Migrate Grit consumers to `ruleGritFacts`, removing missing-pattern fallback to rule id and prose-scope scan inference.
- [ ] 5.6.1 Migrate `tools/habitat-harness/src/lib/grit-injected-probe.ts` to consume `ruleGritFacts` and registry projections rather than `HarnessRule`, `rules`, `ruleById`, or raw `gritPattern`.
- [ ] 5.7 Migrate generated-zone/file-layer consumers to `ruleGeneratedZoneFacts`, failing unknown zone references before silent pass.
- [ ] 5.8 Migrate Pattern Authority and pattern generator registry writes to D2 canonical state or a D2 compatibility writer.
- [ ] 5.9 Migrate hook/local-feedback selection to `ruleLocalFeedbackFacts` without owning D11 hook behavior.

## 6. Deletion And Compatibility Slice

- [ ] 6.1 Delete consumer-local registry parsers where D2 projections replace them.
- [ ] 6.2 Delete prose `scope` routing authority and tests that preserve prose parsing as a positive behavior.
- [ ] 6.3 Delete graph owner-root fallback/silent skip paths after graph projection coverage exists.
- [ ] 6.4 Delete optional-field fallback behavior such as `gritPattern ?? id`.
- [ ] 6.5 Keep public legacy output only through D0-cited compatibility facades.

## 7. Validation

- [ ] 7.1 Run `bun run --cwd tools/habitat-harness test -- test/lib/rule-selection.test.ts`.
- [ ] 7.2 Run `bun run --cwd tools/habitat-harness test -- test/lib/classify.test.ts`.
- [ ] 7.3 Run `bun run --cwd tools/habitat-harness test -- test/lib/baseline.test.ts`.
- [ ] 7.4 Run `bun run --cwd tools/habitat-harness test -- test/lib/grit-adapter.test.ts test/lib/grit-injected-probe.test.ts`.
- [ ] 7.5 Run `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts`. This gate covers hook-facing D2 metadata compatibility only; it does not close D11 hook behavior.
- [ ] 7.6 Run `bun run --cwd tools/habitat-harness test -- test/lib/enforcement-surface.test.ts`.
- [ ] 7.7 Run `bun run --cwd tools/habitat-harness test -- test/generators/pattern-generator.test.ts test/rules/pattern-authority-manifest.test.ts`.
- [ ] 7.8 Run `bun run habitat classify tools/habitat-harness/src/rules/rules.json`.
- [ ] 7.9 Run `bun run habitat check -- --json`.
- [ ] 7.10 Run `nx show project @internal/habitat-harness`.
- [ ] 7.11 Run `bun run openspec -- validate deep-habitat-d2-rule-registry-metadata-contract --strict`.
- [ ] 7.12 Run `bun run openspec:validate`.
- [ ] 7.13 Run `git diff --check`.

## 8. Review And Realignment

- [ ] 8.1 Run fresh final D2 domain/ontology, OpenSpec/testing, code topology, TypeScript state-space, information-design, and cross-domino reviews.
- [ ] 8.2 Repair every accepted P1/P2 finding with exact artifact or source evidence before acceptance.
- [ ] 8.3 Update the D2 downstream ledger rows for D3, D4, D5, D6, D7, D8, G-HOST, D10, D13, D9, D11, D12, D14, and D15.
- [ ] 8.4 Update the packet index only after final D2 review accepts the design/specification packet.
- [ ] 8.5 Do not proceed to D3 until D2 is accepted for design/specification or an explicit user/authority decision changes the gate.
