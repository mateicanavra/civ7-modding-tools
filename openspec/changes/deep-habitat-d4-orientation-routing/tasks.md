# Tasks

## 1. Preconditions Before Source Implementation

- [x] 1.1 Read `$D4_SOURCE_PACKET`, `$D4_CHANGE/{proposal.md,design.md,tasks.md,specs/habitat-harness/spec.md}`, and the accepted D0/D1/D2/D3 design/specification packets.
- [x] 1.2 Cite concrete D0 rows for every D4-touched classify command, command-json, human-output, package-export, docs-example, and generated surface.
- [x] 1.3 Confirm D2 live implementation exposes `ruleRoutingFacts` and that old `scope` prose is no longer route authority for classify.
- [x] 1.4 Confirm D3 live implementation exposes project ownership, target availability, unavailable target, aggregate/workspace target, and `GraphRefusal` facts for classify.
- [x] 1.5 Keep source implementation blocked if any D0 row, D2 projection, or D3 graph fact prerequisite is missing.

## 2. Characterization And Compatibility

- [x] 2.1 Characterize current `habitat classify` path JSON, diff JSON, malformed/pathless diff behavior, prior workspace catch-all behavior, unavailable target behavior, package exports, and command adapter output.
- [x] 2.2 Add target-contract tests that currently fail for malformed/pathless diff and graph-refusal behavior.
- [x] 2.3 Record whether D0 requires `preserve`, `version`, `deprecate`, or `refuse` handling for each classify public surface.
- [x] 2.4 Resolve D0 handling for old classify DTO surfaces before source changes; the current stack versions them to the target `ClassifyResult` model rather than adding parallel DTO paths.

## 3. Target State Model

- [x] 3.1 Add a closed `ClassifyResult` union with states `project-path`, `workspace-path`, `diff`, `malformed-or-pathless-diff`, `unresolved-owner`, and `graph-refusal`.
- [x] 3.2 Add required/forbidden fields per state so invalid optional combinations from the prior classify DTO cannot compile in target code.
- [x] 3.3 Add exhaustive switch handling for command rendering and any projection helper.
- [x] 3.4 Add typed non-claims and recovery instructions to every state that can otherwise overclaim ownership, target availability, rule correctness, safety, or execution.

## 4. D2 And D3 Projection Consumption

- [x] 4.1 Replace classify rule routing authority with D2 `ruleRoutingFacts`; old rule `scope` prose is not route authority for classify.
- [x] 4.2 Replace locally constructed target truth with D3 project ownership, available target, unavailable target, aggregate/workspace target, and `GraphRefusal` facts.
- [x] 4.3 Ensure unavailable targets never appear in runnable target guidance.
- [x] 4.4 Ensure D3 graph refusal reason values remain D3-owned and are rendered by D4 without renaming the state family.

## 5. Command Adapter And Public Exports

- [x] 5.1 Update `habitat classify` output/status behavior according to D0/D1 compatibility decisions.
- [x] 5.2 Version old classify DTO exports to the D4 model; keep `classifyPath` and `classifyTarget` as public functions returning the owned D4 result shapes.
- [x] 5.3 Keep generated help/manifests generated-only if command metadata changes.
- [x] 5.4 Update docs examples only after source behavior and D0 docs-example rows are aligned.

## 6. Validation

- [x] 6.1 Run `bun run --cwd tools/habitat-harness test -- test/lib/classify.test.ts`.
- [x] 6.2 Run command-adapter tests covering classify output/status behavior.
- [x] 6.3 Run target-contract fixtures for `project-path`, `workspace-path`, `diff`, `malformed-or-pathless-diff`, `unresolved-owner`, and `graph-refusal`.
- [x] 6.4 Run fixtures for unavailable targets, D2 unresolved routing metadata, D3 missing-project alias, D3 missing-target alias, malformed graph JSON, Nx read failure, and Nx daemon failure.
- [x] 6.5 Run `bun run openspec -- validate deep-habitat-d4-orientation-routing --strict`.
- [x] 6.6 Run `bun run openspec:validate`.
- [x] 6.7 Run `git diff --check`.

## 7. Downstream Realignment

- [x] 7.1 Update `$D4_DOWNSTREAM_LEDGER` with the D14 example corpus handoff.
- [x] 7.2 Update `$REMEDIATION_DIR/packet-index.md` only after D4 final review accepts the source/record packet.
- [x] 7.3 Keep D5/D6/D8 parallel-safe by omitting or marking baseline, diagnostic, and Pattern Authority facts as non-owned/unresolved until those packets own them.
- [x] 7.4 Leave the worktree ready for a clean, reviewable Graphite D4 layer.
