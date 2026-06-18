# Tasks

## 1. Preconditions Before Source Implementation

- [ ] 1.1 Read `$D4_SOURCE_PACKET`, `$D4_CHANGE/{proposal.md,design.md,tasks.md,specs/habitat-harness/spec.md}`, and the accepted D0/D1/D2/D3 design/specification packets.
- [ ] 1.2 Cite concrete D0 rows for every D4-touched classify command, command-json, human-output, package-export, docs-example, and generated surface.
- [ ] 1.3 Confirm D2 live implementation exposes `ruleRoutingFacts` and that legacy `scope` prose is no longer route authority for classify.
- [ ] 1.4 Confirm D3 live implementation exposes project ownership, target availability, unavailable target, aggregate/workspace target, and `GraphRefusal` facts for classify.
- [ ] 1.5 Keep source implementation blocked if any D0 row, D2 projection, or D3 graph fact prerequisite is missing.

## 2. Characterization And Compatibility

- [ ] 2.1 Characterize current `habitat classify` path JSON, diff JSON, malformed/pathless diff behavior, workspace fallback behavior, unavailable target behavior, package exports, and command adapter output.
- [ ] 2.2 Add target-contract tests that currently fail for malformed/pathless diff and graph-refusal behavior.
- [ ] 2.3 Record whether D0 requires `preserve`, `version`, `facade`, `deprecate`, or `refuse` handling for each classify public surface.
- [ ] 2.4 If D0 requires preserving old surfaces, design a compatibility facade from the target `ClassifyResult` union to legacy `Classification` and `DiffClassification`; do not build the target model by mutating the legacy optional DTO.

## 3. Target State Model

- [ ] 3.1 Add a closed `ClassifyResult` union with states `project-path`, `workspace-path`, `diff`, `malformed-or-pathless-diff`, `unresolved-owner`, and `graph-refusal`.
- [ ] 3.2 Add required/forbidden fields per state so invalid optional combinations from `Classification` cannot compile in target code.
- [ ] 3.3 Add exhaustive switch handling for command rendering and any projection helper.
- [ ] 3.4 Add typed non-claims and recovery instructions to every state that can otherwise overclaim ownership, target availability, rule correctness, safety, or execution.

## 4. D2 And D3 Projection Consumption

- [ ] 4.1 Replace classify rule routing authority with D2 `ruleRoutingFacts`; legacy `scope` may appear only as compatibility text through D0.
- [ ] 4.2 Replace locally constructed target truth with D3 project ownership, available target, unavailable target, aggregate/workspace target, and `GraphRefusal` facts.
- [ ] 4.3 Ensure unavailable targets never appear in runnable target guidance.
- [ ] 4.4 Ensure D3 graph refusal reason values remain D3-owned and are rendered by D4 without renaming the state family.

## 5. Command Adapter And Public Exports

- [ ] 5.1 Update `habitat classify` output/status behavior according to D0/D1 compatibility decisions.
- [ ] 5.2 Preserve, facade, version, or deprecate `Classification`, `DiffClassification`, supporting DTO exports, `classifyPath`, and `classifyTarget` only as D0 records.
- [ ] 5.3 Keep generated help/manifests generated-only if command metadata changes.
- [ ] 5.4 Update docs examples only after source behavior and D0 docs-example rows are aligned.

## 6. Validation

- [ ] 6.1 Run `bun run --cwd tools/habitat-harness test -- test/lib/classify.test.ts`.
- [ ] 6.2 Run command-adapter tests covering classify output/status behavior.
- [ ] 6.3 Run target-contract fixtures for `project-path`, `workspace-path`, `diff`, `malformed-or-pathless-diff`, `unresolved-owner`, and `graph-refusal`.
- [ ] 6.4 Run fixtures for unavailable targets, D2 unresolved routing metadata, D3 missing-project alias, D3 missing-target alias, malformed graph JSON, Nx read failure, and Nx daemon failure.
- [ ] 6.5 Run `bun run openspec -- validate deep-habitat-d4-orientation-routing --strict`.
- [ ] 6.6 Run `bun run openspec:validate`.
- [ ] 6.7 Run `git diff --check`.

## 7. Downstream Realignment

- [ ] 7.1 Update `$D4_DOWNSTREAM_LEDGER` with the D14 example corpus handoff.
- [ ] 7.2 Update `$REMEDIATION_DIR/packet-index.md` only after D4 final review accepts the design/specification packet.
- [ ] 7.3 Keep D5/D6/D8 parallel-safe by omitting or marking baseline, diagnostic, and Pattern Authority facts as non-owned/unresolved until those packets own them.
- [ ] 7.4 Leave the worktree clean and keep Graphite layers reviewable.
