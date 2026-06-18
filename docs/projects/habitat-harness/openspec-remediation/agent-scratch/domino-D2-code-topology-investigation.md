# D2 Rule Registry Metadata Contract: Code Topology Investigation

## Objective

Investigate the current Habitat rule registry topology for Deep Habitat D2 and identify the exact metadata contract, owner boundaries, write set, protected paths, and validation oracle that the OpenSpec packet must specify before implementation agents refactor source code.

This is a code/topology investigation only. It does not implement the registry refactor and does not edit the D2 source packet or OpenSpec files.

## Sources Read

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation-frame.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D2-rule-registry-metadata-contract.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/tasks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/specs/habitat-harness/spec.md`
- D2 workstream scaffolding under `/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/workstream/`
- D2 review scratch: `/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D2-review.md`
- D0 packet and OpenSpec design/spec for public command/surface inventory
- D1 packet and OpenSpec design/spec for receipt/proof boundary
- D1 code topology scratch: `/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D1-code-topology-investigation.md`
- Current implementation and tests:
  - `tools/habitat-harness/src/rules/architecture.ts`
  - `tools/habitat-harness/src/rules/rules.json`
  - `tools/habitat-harness/src/plugin.js`
  - `tools/habitat-harness/src/lib/command-engine.ts`
  - `tools/habitat-harness/src/lib/baseline.ts`
  - `tools/habitat-harness/src/lib/grit.ts`
  - `tools/habitat-harness/src/lib/generated-zones.ts`
  - `tools/habitat-harness/src/lib/hooks.ts`
  - `tools/habitat-harness/src/rules/pattern-authority/manifest.ts`
  - `tools/habitat-harness/src/generators/pattern/generator.cjs`
  - `tools/habitat-harness/src/generators/pattern/registration.cjs`
  - `tools/habitat-harness/src/index.ts`
  - `tools/habitat-harness/test/lib/rule-selection.test.ts`
  - `tools/habitat-harness/test/lib/classify.test.ts`
  - `tools/habitat-harness/test/lib/enforcement-surface.test.ts`
  - `tools/habitat-harness/test/lib/biome-closure.test.ts`
  - `tools/habitat-harness/test/lib/grit-adapter.test.ts`
  - `tools/habitat-harness/test/lib/baseline.test.ts`
  - `tools/habitat-harness/test/generators/pattern-generator.test.ts`
  - `tools/habitat-harness/test/rules/pattern-authority-manifest.test.ts`

Mandatory skills read in full:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/typescript-refactoring/SKILL.md`
- TypeScript refactoring references and assets routed by that skill:
  - `references/smell-catalog.md`
  - `references/refactoring-mechanics.md`
  - `references/llm-slop-cleanup.md`
  - `references/paradigms-and-patterns.md`
  - `references/worked-examples.md`
  - `assets/refactor-plan-template.md`
  - `assets/refactor-findings-template.md`

Refactoring bar applied: state-space collapse, deletion before rearrangement, canonical owner, no escape hatches, public type compatibility, behavior-preserving slices, compiler/test gates after each logical move, no whole-record leakage, no optional soup, and no prose-as-authority.

## Current Topology Map

### Registry Data And Loader

`tools/habitat-harness/src/rules/rules.json` is the central data file, but it is not a typed metadata registry today. It is a mixed record set with 51 rules and these observed dimensions:

- `ownerTool`: `grit-check` 31, `wrapped-test` 7, `file-layer` 4, `habitat-native` 4, `wrapped-script` 3, `biome` 1, `nx-boundaries` 1.
- `lane`: `enforced` 49, `advisory` 2.
- Common fields on all 51 rows: `id`, `ownerTool`, `ownerProject`, `lane`, `scope`, `forbids`, `why`, `detect`, `message`, `remediate`, `exceptionPath`.
- Optional fields: `gritPattern` and `hookScope` on 31 Grit rows, `nxTarget` on 7 wrapped tests, `generatedZone` on 3 file-layer rows, `forbiddenFileNames` on 1 file-layer row.
- `manifestPath` exists in the TypeScript interface and generator path, but no current rule has it.

`tools/habitat-harness/src/rules/architecture.ts` is the only TypeScript loader. It casts JSON directly to `{ rules: HarnessRule[] }`; there is no schema parse, versioning, discriminated union, or malformed-registry refusal. The exported `HarnessRule` record mixes identity, diagnostics, routing prose, execution selection, graph target hints, baseline exception state, Grit state, generated-zone state, hook state, and Pattern Authority future state.

### Execution Owner

`architecture.ts` owns `executeRule(rule, options)`. It dispatches by `ownerTool`:

- `grit-check` delegates to `runGritRule`.
- `file-layer` delegates to `runGeneratedZoneRule`.
- Everything else invokes the shell command in `detect`.

This makes `ownerTool` both a public/reporting property and an execution strategy discriminator. There is no separate execution projection.

### Command Engine And Selection

`tools/habitat-harness/src/lib/command-engine.ts` imports `rules`, `ruleById`, `executeRule`, and `HarnessRule`.

Current responsibilities tied to whole `HarnessRule`:

- `selectRules` returns whole `HarnessRule[]`.
- selector facts derive from `id`, `ownerProject`, and `ownerTool`.
- `createCheckReport` emits public report rows using `ruleId`, `ownerTool`, `lane`, `detect`, `message`, `remediate`, and diagnostics.
- staged execution reads `ownerTool` and `hookScope`.
- Grit batching passes whole Grit rules into `runGritRules`.
- baseline integrity passes the whole registry into `loadBaselineState`.
- classification reads the global `rules` array and calls `classifyRuleScope`.

This is the widest current whole-record leak.

### Classification And Routing

`classifyRuleScope` in `command-engine.ts` uses prose `scope` as machine authority:

- `scopePathPatterns(rule)` scrapes paths from `scope` strings using regexes for `apps/`, `docs/`, `mods/`, `packages/`, `scripts/`, and `tools/`.
- `scopeIsMachineParseable` rejects some prose by substring checks such as `outside`, `except`, ` and `, ` or `.
- `isWorkspaceGate` checks `ownerProject` and searches `scope` for prose fragments such as `all `, `live repo`, `workspace`, `staged `, `package.json`, `docs/`, and `package-manager`.
- `requiresExplicitScanRoot` marks `grit-check` and `wrapped-test` as unresolved unless an exact path match exists.

D2 must remove this authority from prose. The current routing states are not explicit metadata states; they are inferred consumer behavior.

### Nx Plugin And Graph

`tools/habitat-harness/src/plugin.js` reads `rules.json` directly and independently. It hard-codes `OWNER_ROOTS` and silently skips rules with unknown owner projects:

- Known owners include `mod-swooper-maps`, `@swooper/mapgen-core`, `@civ7/control-orpc`, `@mateicanavra/civ7-sdk`, and `@internal/habitat-harness`.
- Current `rules.json` also includes `mod-civ7-intelligence-bridge`, which has no owner root and therefore no inferred rule target.

Target aliasing is also hard-coded:

- `nx-boundaries` aliases the harness `boundaries` target.
- `biome-ci` aliases the harness `biome` target.
- `grit-check` aliases harness `grit:check`.
- `file-layer` aliases harness `generated:check`.
- `nxTarget` is parsed by colon string splitting.
- All other rules run `bun tools/habitat-harness/bin/dev.ts check --rule <id>`.

Graph ownership, target aliasing, and dependency target parsing are not registry metadata today.

### Baseline Contract

`tools/habitat-harness/src/lib/baseline.ts` consumes only a narrow `BaselineRuleContractInput` of `id` and `exceptionPath?`, but it obtains that projection through whole-rule callers or a separate permissive JSON parser. `parseRuleRegistry` validates only that a rules array exists and that ids are strings.

External exception source behavior is hard-coded in `defaultExternalExceptionSources` for `adapter-boundary` and `doc-ambiguity`. Current repository state has 49 baseline files for 51 rules, matching those two externally modeled exceptions. The registry does not explicitly say which rules are baseline-file-backed, externally sourced, or intentionally baseline-less.

### Grit Adapter

`tools/habitat-harness/src/lib/grit.ts` accepts whole `HarnessRule` records.

Current metadata inference:

- `projectGritResults` uses `rule.gritPattern ?? rule.id`, creating an implicit fallback from pattern identity to rule id.
- Grit scan roots are hard-coded constants, not per-rule metadata.
- ignored test roots are activated by parsing prose `rule.scope`.
- staged hook filtering elsewhere relies on `hookScope === "pre-commit"`.
- generated/protected root refusal is enforced by Grit scan-root validation, but scan-root ownership is not part of the registry.

D2 must make Grit pattern identity, scan roots, hook policy, and current-tree policy explicit, with no id fallback.

### Generated Zones And File-Layer Rules

`tools/habitat-harness/src/lib/generated-zones.ts` owns a separate `generatedZones` table with `id`, `kind`, `path`, and `remediation`.

The registry only stores `generatedZone` string references for three file-layer rules. A fourth file-layer rule uses `forbiddenFileNames` instead. `runGeneratedZoneRule` treats unknown `generatedZone` as an execution diagnostic, not a registry-load failure.

D2 must model file-layer rules as a union, not as optional `generatedZone` plus optional `forbiddenFileNames`.

### Pattern Governance And Generator Writes

`tools/habitat-harness/src/rules/pattern-authority/manifest.ts` defines richer Pattern Authority types, including scan roots, baseline contract, lifecycle, hook scope, and apply safety.

`patternAuthorityRuleReferenceFromRule` projects current rule fields into Pattern Authority references, but registered manifest validation requires `manifestPath` alignment when rule references are required. Current rules have zero `manifestPath` values, so the current registry is not already a registered-manifest-backed registry.

`tools/habitat-harness/src/generators/pattern/registration.cjs` writes new `rules.json` entries in the current mixed shape. It writes a prose `scope` synthesized from manifest scan roots, plus `gritPattern`, `manifestPath`, and `hookScope` when applicable. The generator must become a D2 registry writer or an adapter to the D2 writer.

### Public/Durable Surfaces

`tools/habitat-harness/src/index.ts` exports `executeRule`, `HarnessRule`, `ruleById`, and `rules`. Public command output also carries rule-shaped facts:

- `CheckReport` and rule report rows expose `ruleId`, `ownerTool`, `lane`, `detect`, `message`, and `remediate`.
- classify output exposes rule ownership and scope-resolution state.
- Nx plugin inferred targets are durable project graph behavior.
- pattern generator output mutates `rules.json`.

These are D0 compatibility surfaces. D2 cannot silently change them.

## Consumer Map

| Consumer | Current reads | Current side effect or durable surface | Target projection |
| --- | --- | --- | --- |
| `architecture.ts` registry loader | whole `rules.json` cast to `HarnessRule[]` | exported `rules`, `ruleById`, `HarnessRule`; execution dispatch | parsed `RuleRegistry` plus compatibility facade only if D0 allows |
| `executeRule` | `ownerTool`, `detect`, file-layer/Grit fields | command execution and diagnostics | `RuleExecutionFacts` discriminated by execution kind |
| `command-engine.ts` selection | `id`, `ownerProject`, `ownerTool`; returns whole rules | selector success/failure JSON and command behavior | `RuleSelectorFacts` and selected rule ids, not whole records |
| `createCheckReport` | `ownerTool`, `lane`, `detect`, `message`, `remediate`, diagnostics | public `CheckReport` JSON | `RuleReportFacts` plus D1 receipt/failure model |
| staged execution | `ownerTool`, `hookScope` | pre-commit/current-tree behavior | `RuleHookFacts` and `RuleExecutionFacts` |
| classify | `scope`, `ownerProject`, `ownerTool` | classify JSON and routing explanations | `RuleRoutingFacts`; no `scope` parsing |
| Nx plugin | raw `rules.json`, `OWNER_ROOTS`, `ownerTool`, `id`, `nxTarget` | inferred Nx targets and graph dependencies | `RuleGraphFacts` with owner root and dependency target policy |
| baseline | `id`, `exceptionPath`, registry ids | baseline contract diagnostics and external exception handling | `RuleBaselineFacts` with explicit state union |
| Grit adapter | whole Grit rules, `gritPattern`, `hookScope`, `scope` | scan roots, pattern projection, staged behavior | `RuleGritFacts`; no id fallback or prose test-root inference |
| generated-zone guards | `generatedZone`, `forbiddenFileNames` | generated/protected path diagnostics | `RuleFileLayerFacts` union |
| Pattern Authority | `id`, `gritPattern`, `manifestPath`, `ownerTool`, `lane`, `hookScope` | registered manifest validation | `RuleGovernanceFacts` and `RuleGritFacts` |
| pattern registration generator | writes current rule object | mutates `rules.json` and baseline files | canonical D2 registry writer or generated projection writer |
| `src/index.ts` consumers | `HarnessRule`, `rules`, `executeRule` | package API | D0-gated legacy facade or explicit break/deprecation |

## Current State-Space Smells

- One mega-record (`HarnessRule`) represents too many states: selector fact, execution plan, route, graph node, baseline entry, Grit rule, generated-zone rule, report row, and governance reference.
- Optional-field soup is encoding union states. Examples: `generatedZone` vs `forbiddenFileNames`, `gritPattern` vs fallback to `id`, `nxTarget` vs direct command, and absent `manifestPath`.
- Prose is machine authority. `scope` drives classify exact matches, workspace-gate decisions, and Grit ignored-test scan roots.
- There are parallel owners for the same facts:
  - registry has `ownerProject`, while plugin has `OWNER_ROOTS`;
  - registry has `generatedZone` ids, while generated-zone path/remediation lives in code;
  - registry has `exceptionPath`, while external exception source rules live in baseline code;
  - registry has Grit hints, while scan roots live in Grit code and manifests;
  - registry has `manifestPath` in type/generator only, while current rows omit it.
- Hard-coded fallbacks silently widen state space:
  - unknown plugin owner roots are skipped;
  - missing `gritPattern` falls back to `id`;
  - baseline parser treats only id/exceptionPath as meaningful;
  - generated-zone link errors are discovered at execution time;
  - classify produces `unresolved-metadata` for broad owner rules rather than reading explicit route state.
- Public/internal boundaries are blurred. `HarnessRule` and `rules` are exported, while the same shape also acts as internal execution state.
- The current tests preserve current counts and behavior, but they do not reject the key bad states D2 is supposed to collapse.

## Concrete Target Slices

D2 should require implementation in behavior-preserving slices, each with compile/test gates before the next slice:

1. Add a canonical registry parser and versioned state model.
   - The parser is the only place that reads raw `rules.json`.
   - It refuses malformed metadata explicitly through the D1 command/refusal model.
   - It preserves legacy exported `HarnessRule` only as a D0-gated compatibility facade, not as the internal state model.

2. Define rule identity and report facts.
   - Required facts: `id`, `ownerProject`, `ownerTool`, `lane`, report-facing `detect`, `message`, and `remediate`.
   - These facts feed selection and `CheckReport` without exposing the whole registry record.

3. Define execution facts as a discriminated union.
   - `grit-check`: requires `patternName`, explicit scan-root policy, hook/current-tree policy, and no fallback to id.
   - `file-layer`: exactly one of `generated-zone` or `forbidden-file-name`.
   - `wrapped-test`: requires structured dependency target fields, not a free colon string.
   - `wrapped-script`, `habitat-native`, `biome`, and `nx-boundaries`: require explicit command or alias behavior.

4. Define routing facts.
   - Explicit path globs, owner-project fallback policy, workspace-gate policy, and unresolved/refusal policy.
   - `scope` may remain as human-readable compatibility/report text only if D0 permits, but it must not drive routing.

5. Define graph facts.
   - Explicit owner root or resolvable project reference.
   - Explicit target alias policy.
   - Unknown owner/project mapping is a validation failure, not a skip.
   - Structured target dependency replaces `nxTarget` string parsing.

6. Define baseline facts.
   - State union: `baseline-file`, `external-exception-source`, `no-baseline-refused` or equivalent explicit states.
   - `adapter-boundary` and `doc-ambiguity` must be represented by explicit registry/baseline metadata instead of hidden defaults.

7. Define generated-zone and protected-path facts.
   - File-layer rules must reference an explicit generated-zone declaration or a forbidden-file-name declaration.
   - Unknown generated-zone ids fail registry validation or a named D1-compatible command refusal before execution.

8. Define Pattern Authority/governance facts.
   - Decide whether current Grit rules without `manifestPath` are legacy-compatible, unregistered, or invalid.
   - Pattern registration must write the canonical D2 registry shape or call a canonical writer.

9. Delete consumer-local inference.
   - Remove classify prose scraping, plugin owner-root map as authority, Grit id fallback, Grit scope parsing, baseline permissive parse, and whole-rule consumer parameters once equivalent projections are in place.

## Likely Write Set For Later Implementation

Implementation will likely need to edit:

- `tools/habitat-harness/src/rules/rules.json`
- `tools/habitat-harness/src/rules/architecture.ts`
- likely new registry/projection modules under `tools/habitat-harness/src/rules/`
- `tools/habitat-harness/src/plugin.js`
- `tools/habitat-harness/src/lib/command-engine.ts`
- `tools/habitat-harness/src/lib/baseline.ts`
- `tools/habitat-harness/src/lib/grit.ts`
- `tools/habitat-harness/src/lib/generated-zones.ts`
- `tools/habitat-harness/src/lib/hooks.ts`
- `tools/habitat-harness/src/rules/pattern-authority/manifest.ts`
- `tools/habitat-harness/src/generators/pattern/generator.cjs`
- `tools/habitat-harness/src/generators/pattern/registration.cjs`
- `tools/habitat-harness/src/index.ts` only after D0 compatibility disposition
- tests under `tools/habitat-harness/test/lib/`, `tools/habitat-harness/test/generators/`, and `tools/habitat-harness/test/rules/`
- docs under `tools/habitat-harness/docs/` when behavior/public contracts change

The D2 packet should name this write set directly instead of asking the implementation agent to infer it.

## Protected Paths

For D2 implementation, these paths should be protected unless their owning packet explicitly authorizes changes:

- D2 source packet and OpenSpec files during investigation-only work.
- Other domino packets and OpenSpec changes, especially D0 and D1.
- `tools/habitat-harness/src/index.ts` until D0 classifies exported package API compatibility.
- Root workspace scripts, `package.json`, `nx.json`, and lockfiles unless D0/graph work explicitly requires a public surface change.
- `tools/habitat-harness/baselines/**` except through an approved baseline migration slice.
- `.grit/patterns/**` and Pattern Authority manifest output except through D8/D13 governance/generator slices.
- generated artifacts such as `dist/`, `mod/`, and official resource submodule content.
- runtime Civ7 control transports outside `@civ7/direct-control`.

## Tests To Update Or Add

Update existing tests:

- `tools/habitat-harness/test/lib/rule-selection.test.ts`
  - selection returns/proves projection use instead of whole-rule dependence.
  - staged Grit behavior uses hook facts, not raw `hookScope` on the mega-record.
- `tools/habitat-harness/test/lib/classify.test.ts`
  - replace prose-scope parsing expectations with explicit routing metadata.
  - add rejection for rules whose routing cannot be resolved from typed metadata.
- `tools/habitat-harness/test/lib/enforcement-surface.test.ts`
  - update owner/tool count expectations if compatibility facade changes.
  - assert unknown owner/project graph metadata fails instead of silently skipping.
  - assert structured graph target facts replace colon-string `nxTarget` parsing.
- `tools/habitat-harness/test/lib/biome-closure.test.ts`
  - verify registry-to-plugin graph closure through projections.
- `tools/habitat-harness/test/lib/grit-adapter.test.ts`
  - reject missing `gritPattern`/pattern name; remove id fallback expectation.
  - replace prose-scope ignored-test-root behavior with explicit Grit scan-root metadata.
- `tools/habitat-harness/test/lib/baseline.test.ts`
  - require explicit baseline facet states.
  - ensure external exception sources are metadata-backed rather than hidden defaults.
- `tools/habitat-harness/test/generators/pattern-generator.test.ts`
  - assert registered pattern generation writes the canonical D2 registry shape.
  - assert manifest/hook/baseline metadata mismatches produce named refusals.
- `tools/habitat-harness/test/rules/pattern-authority-manifest.test.ts`
  - align rule-reference projection with D2 governance facts.

Add new tests:

- registry parser/schema tests for malformed `rules.json`, unknown owner roots, unknown generated-zone ids, missing required facets by owner tool, duplicate ids, and invalid union states.
- projection tests proving each consumer receives only the required projection.
- no-prose-authority regression tests:
  - changing `scope`, `why`, or `forbids` prose must not change classify, Grit scan roots, graph targets, or baseline contract.
- no-whole-rule-leak tests or type-level checks that consumers do not accept `HarnessRule` where a projection is sufficient.
- D1 refusal tests for malformed registry state in check, classify, plugin graph construction if testable, and generator registration.

## D0/D1 Dependencies

D0 is a hard dependency before source implementation. The expected matrix file `docs/projects/habitat-harness/public-surface-compatibility-matrix.md` is absent in this worktree. D2 touches these D0 surfaces:

- exported `HarnessRule`, `rules`, `ruleById`, and `executeRule`;
- public `CheckReport` and rule report JSON fields;
- classify JSON and scoped rule explanation fields;
- Nx inferred targets from `plugin.js`;
- pattern registration generator writes to `rules.json`;
- hook/staged behavior visible through command output and pre-commit workflows;
- docs that describe current command behavior.

D1 is also a hard dependency for malformed registry behavior. D2 must not invent ad hoc failure shapes. Registry parse failures, unknown owner roots, invalid graph facts, missing Grit pattern names, invalid generated-zone references, invalid baseline states, and Pattern Authority mismatches must map to D1 receipt/refusal/report semantics.

## P1 Blockers

1. D2 does not yet specify the concrete registry state model.
   - Implementation would still need to decide required fields, unions by `ownerTool`, whether `scope` remains, how `file-layer` variants work, what Grit scan-root metadata looks like, and how Pattern Authority registration state is represented.

2. D2 does not yet specify the projection contract.
   - The source packet says consumers should receive projections, but the OpenSpec scaffold does not name the projections, fields, consumers, or forbidden whole-record reads.

3. D2 does not yet resolve public compatibility.
   - `HarnessRule` and `rules` are exported today.
   - `CheckReport`, classify output, plugin target inference, and generator output are durable behavior.
   - D0 matrix rows are missing, so implementation cannot safely change or wrap these surfaces.

4. D2 does not yet define a validation oracle that catches the intended failures.
   - Existing tests would not fail if `scope` prose parsing remains.
   - Existing tests would not fail if plugin unknown owners continue to skip.
   - Existing tests would not fail if `gritPattern ?? id` remains.
   - Existing tests would not fail if baseline parsing continues to ignore most registry metadata.

5. D2 does not yet specify the source write set and protected paths.
   - `design.md` currently leaves concrete write set/protected paths to executors.
   - That violates the framed objective: later implementation agents should not need to guess topology.

6. D2 does not yet bind malformed metadata to D1 failure semantics.
   - Without this, implementation agents must decide whether malformed metadata is a thrown error, diagnostic, check failure, selector failure, plugin refusal, or baseline-integrity failure.

## P2 Blockers

- Downstream handoff is too generic. D2 should explicitly hand projections to:
  - D3 graph/Nx via `RuleGraphFacts`;
  - D4 classify/routing via `RuleRoutingFacts`;
  - D5 baseline via `RuleBaselineFacts`;
  - D6 diagnostics/reporting via `RuleReportFacts`;
  - D7 execution via `RuleExecutionFacts`;
  - D8 governance via `RuleGovernanceFacts`;
  - D10 generated-zone/protected paths via `RuleFileLayerFacts`;
  - D13 generator registration via the canonical registry writer.
- Terminology is inherited rather than dispositioned. D2 should list current terms (`ownerTool`, `lane`, `scope`, `nxTarget`, `generatedZone`, `hookScope`, `gritPattern`, `manifestPath`) and mark each as canonical, compatibility-only, renamed, or deleted.
- The OpenSpec scaffold does not state whether `rules.json` receives a schema version or whether current unversioned data is migrated in place.
- The packet does not address the JS plugin consumption problem. `plugin.js` cannot rely on TypeScript-only runtime code unless the packet defines a compiled-free parser or a data-only projection available to Nx plugin loading.
- Pattern Authority current state is contradictory: Pattern Authority expects manifest-backed references for registered rules, but current Grit rows have no `manifestPath`.

## Packet Repair Recommendations

Repair the D2 OpenSpec packet before implementation by adding:

1. A normative registry model section with discriminated facets:
   - identity/selector/report;
   - execution;
   - routing;
   - graph;
   - baseline;
   - Grit;
   - generated-zone/file-layer;
   - governance/Pattern Authority;
   - hook/current-tree policy.

2. A projection matrix that names every projection, its exact fields, its consumer paths, and the current whole-record reads it replaces.

3. A compatibility section tied to D0 rows.
   - If D0 rows are absent, source implementation must stay blocked.
   - If legacy exports remain, define them as generated compatibility facades over the canonical model.

4. A validation/refusal section tied to D1.
   - Name the malformed states and the command/report/plugin/generator behavior for each.
   - Require no silent skip and no fallback metadata.

5. A slice plan ordered by behavior-preserving moves.
   - Parser and projections first.
   - Consumer-by-consumer migration second.
   - Delete inference and fallbacks after equivalent projections are proven.
   - Run typecheck and targeted tests after each logical move.

6. A write-set/protected-path section using the paths in this investigation.

7. Acceptance tests that falsify the old state space:
   - no prose routing authority;
   - no whole-rule consumer leakage;
   - no unknown owner skip;
   - no Grit id fallback;
   - no hidden baseline external source;
   - no generated-zone late discovery;
   - no generator writes in the old mixed shape.

## Stop Verdict

D2 is not acceptable for implementation yet.

An implementation agent would still need to decide the concrete state model, write set, public compatibility strategy, and validation oracle. Those are exactly the design decisions D2 must settle. The repaired D2 packet should be explicit enough that implementation is reduced to behavior-preserving slices over a named registry model and projection contract, not an exploratory refactor.
