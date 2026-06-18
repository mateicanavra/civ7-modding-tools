# D2 OpenSpec And Testing Investigation

## Objective

Design/specification review for Deep Habitat D2, Rule Registry Metadata
Contract. This is a pre-implementation OpenSpec/testing validation pass. It
does not implement Habitat source code and does not edit the D2 packet.

The decision criterion is strict: if the D2 OpenSpec packet leaves fallback
defaults, inherited terminology, projection ownership, or validation ownership
ambiguous, D2 is not acceptable for implementation.

## Verdict

D2 is not acceptable yet.

The current D2 packet has the right intent and should remain one OpenSpec
change, but its normative contract is still too thin. It names typed facets and
consumer projections without defining the facet ontology, the projection matrix,
the migration/refusal states, the D0/D1 public-surface dependencies, or the
falsifying validation oracles. An implementation agent would still have to
decide what `ownerTool`, `lane`, `scope`, `nxTarget`, `gritPattern`,
`generatedZone`, `hookScope`, and Pattern Authority status mean at target state.

Passing OpenSpec validation is structural evidence only. It does not prove D2
domain acceptance, projection completeness, implementation readiness,
downstream safety, or Habitat behavior.

## Sources Read

Mandatory skills and repo guidance:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/testing-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/civ7-open-spec-workstream/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/civ7-systematic-workstream/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/civ7-open-spec-workstream/references/source-map.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/civ7-open-spec-workstream/references/validation-checks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/civ7-systematic-workstream/references/method-loop.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`

Control and packet sources:

- `docs/projects/habitat-harness/phase2-workstream-packets/D2-rule-registry-metadata-contract.md`
- `docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- `docs/projects/habitat-harness/openspec-remediation/review-disposition-ledger.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D2-review.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D0-final-review.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D1-final-openspec-review.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D1-rereview-validation-openspec.md`
- `openspec/changes/deep-habitat-d0-command-surface-inventory/design.md`
- `openspec/changes/deep-habitat-d0-command-surface-inventory/tasks.md`
- `openspec/changes/deep-habitat-d0-command-surface-inventory/specs/habitat-harness/spec.md`
- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/design.md`
- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/tasks.md`
- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/specs/habitat-harness/spec.md`
- `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/proposal.md`
- `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/design.md`
- `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/tasks.md`
- `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/specs/habitat-harness/spec.md`
- `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/workstream/phase-record.md`
- `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/workstream/review-disposition-ledger.md`
- `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/workstream/downstream-realignment-ledger.md`
- `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/workstream/closure-checklist.md`

Current code and validation evidence:

- `package.json`
- `tools/habitat-harness/package.json`
- `tools/habitat-harness/src/rules/rules.json`
- `tools/habitat-harness/src/rules/architecture.ts`
- `tools/habitat-harness/src/plugin.js`
- `tools/habitat-harness/src/lib/command-engine.ts`
- `tools/habitat-harness/src/lib/baseline.ts`
- `tools/habitat-harness/src/lib/generated-zones.ts`
- `tools/habitat-harness/src/lib/grit.ts`
- `tools/habitat-harness/src/generators/pattern/registration.cjs`
- `tools/habitat-harness/test/lib/rule-selection.test.ts`
- `tools/habitat-harness/test/rules/pattern-authority-manifest.test.ts`
- `tools/habitat-harness/test/lib/enforcement-surface.test.ts`
- `tools/habitat-harness/test/lib/biome-closure.test.ts`
- `tools/habitat-harness/test/commands/habitat-entrypoints.test.ts`
- `tools/habitat-harness/test/lib/classify.test.ts` was identified as an
  existing validation surface.
- `tools/habitat-harness/test/lib/baseline.test.ts` was identified as an
  existing validation surface.
- `tools/habitat-harness/test/lib/grit-adapter.test.ts` and
  `tools/habitat-harness/test/lib/grit-injected-probe.test.ts` were identified
  as existing validation surfaces.
- `tools/habitat-harness/test/generators/pattern-generator.test.ts` was
  identified as an existing validation surface.

Commands run:

| Command | Result | What It Proves |
| --- | --- | --- |
| `git status --short --branch` | Exit 0; worktree already dirty with modified `AGENTS.md` and untracked remediation packet tree | Repo state only. Does not attribute ownership of pre-existing dirty files. |
| `gt status` | Exit 0; passed through to `git status` | Graphite is present enough for `gt status`; no stack readiness claim. |
| `bun run openspec -- validate deep-habitat-d2-rule-registry-metadata-contract --strict` | Exit 0, change valid | D2 OpenSpec syntax/shape only. |
| `bun run openspec:validate` | Exit 0, `249 passed, 0 failed` | All OpenSpec records validate structurally only. |

## Recommended OpenSpec Packet Breakdown

Keep D2 as one OpenSpec change for design/specification.

Rationale: D2 owns one bounded domain, Rule Registry Metadata. Splitting the
OpenSpec authority into separate selector, graph, baseline, Grit,
generated-zone, and Pattern Authority changes would move the core boundary
decision into downstream packet negotiation. That creates exactly the ambiguity
D2 is supposed to remove. The correct shape is one D2 contract with multiple
requirement families and an explicit projection matrix.

Implementation later may be staged as multiple Graphite layers or sub-steps
inside one D2 implementation phase:

1. Registry schema/parser and inventory artifact.
2. Projection functions and refusal states.
3. Consumer migrations and tests.
4. Downstream ledger repairs.

Split into another OpenSpec change only if D2 discovers a separate public
compatibility/versioning decision that D0 says must be owned outside Rule
Registry Metadata. Do not split merely because the implementation is large.

## Requirement Family Outline

The D2 spec delta should replace the single broad requirement with these
normative families.

1. `Versioned Rule Registry Schema Exists`
   - Owns schema version, allowed fields, closed owner/tool/lane vocabulary,
     field requiredness by facet, and malformed-registry refusal.
   - Requires a current registry inventory: 51 rules observed; observed keys are
     `detect`, `exceptionPath`, `forbiddenFileNames`, `forbids`,
     `generatedZone`, `gritPattern`, `hookScope`, `id`, `lane`, `message`,
     `nxTarget`, `ownerProject`, `ownerTool`, `remediate`, `scope`, and `why`.

2. `Registry Terminology Is Classified Before Implementation`
   - Current terms are either target-retained, legacy compatibility,
     projection-only, downstream-owned, or removed.
   - Must classify at least `ownerTool`, `ownerProject`, `lane`, `scope`,
     `nxTarget`, `generatedZone`, `hookScope`, `gritPattern`, `manifestPath`,
     `file-layer`, `wrapped-test`, `wrapped-script`, `habitat-native`, `biome`,
     and `nx-boundaries`.

3. `Consumer Projections Replace Whole Rule Sharing`
   - Each consumer receives the smallest named projection it requires.
   - Whole `HarnessRule` objects are forbidden across domain boundaries unless
     D2 proves a consumer genuinely needs the whole record.

4. `Selector Facts Are Closed And Namespace-Aware`
   - Selector projection owns known owners, tools, rules, wrong namespace, empty
     intersection, and unknown selector behavior.

5. `Routing Facts Do Not Parse Prose Scope`
   - Classify/routing consumes typed routing facts, not `scope` prose.
   - Project-owner, exact-path, workspace-gate, unresolved-metadata, and
     explicit scan-root states need closed definitions.

6. `Graph Facts Own Owner Root And Target Alias Metadata`
   - Nx plugin inference consumes `ruleGraphFacts`.
   - Owner roots, rule target alias policy, dependency target, cache setting,
     and target metadata are structured facts, not `OWNER_ROOTS` duplication or
     colon-string parsing.

7. `Baseline Facts Own Baseline State And Introduction Manifest Relation`
   - Baseline integrity consumes `ruleBaselineFacts`, including rule id,
     exception/baseline state, baseline path, introduction manifest relation,
     and missing/malformed/orphan refusal reasons.

8. `Grit Facts Own Pattern Identity, Scan Roots, And Hook Scope`
   - Grit consumers receive `gritPattern`, approved scan roots, excluded roots,
     hook-scope status, and unexpected-pattern refusal behavior.
   - Grit frontmatter/prose remains non-authoritative.

9. `Generated-Zone Facts Own Host Declaration Link`
   - File-layer/generated-zone guards consume a typed generated-zone projection
     that links rule metadata to the owning host declaration.
   - Unknown or missing generated-zone metadata refuses before silent pass.

10. `Pattern Authority Facts Own Manifest Status Projection`
    - Pattern Governance consumes `rulePatternAuthorityFacts`: rule id, pattern
      name, manifest path, manifest state, accepted authority flag, lifecycle,
      and hook-scope agreement.

11. `Malformed Metadata Uses D1 Command Outcome Boundaries`
    - Missing required facets, contradicted facet states, unknown owner roots,
      and invalid hook/generated/Grit metadata become explicit D1-aligned
      failures or refusals.
    - They do not silently disable a rule and do not report ordinary rule
      execution.

12. `Downstream Dominoes Consume Named D2 Projections`
    - D3, D4, D5, D6, D7, D8, D10, and D13 each cite the projection they consume
      and whether they remain blocked until D2 implementation proof exists.

## Scenario List

Minimum scenarios the spec delta should contain:

- Valid registry row with identity facet: accepted only when `id`,
  `ownerProject`, `ownerTool`, and `lane` match closed vocabulary.
- Rule row missing identity metadata: D1-aligned registry contract failure
  before command execution.
- Unknown `ownerTool`: selector and execution refuse as unresolved registry
  metadata, not as zero matching rules.
- Wrong selector namespace: `--rule grit-check` reports wrong namespace and
  does not execute the Grit catalog.
- Valid selector intersection: selector facts list matching rule ids by
  namespace.
- Empty selector intersection: command emits `rule-selection-integrity` without
  claiming rule execution.
- Exact-path routing: classify uses typed routing paths/globs and records the
  matched path fact.
- Workspace gate routing: classify uses a typed workspace-gate state, not words
  such as "workspace" found in prose `scope`.
- Unresolved routing metadata: a project-owned Grit/wrapped-test rule without
  explicit scan roots reports unresolved metadata and cannot pretend exact
  scope.
- Graph owner root resolution: Nx plugin target inference reads graph owner
  root metadata, not a separate `OWNER_ROOTS` table.
- Graph target alias dependency: a rule alias with a dependency target uses
  structured project/target fields, not colon-string parsing.
- Graph unknown owner root: plugin fails/diagnoses the malformed registry row
  instead of skipping target creation.
- Baseline projection: baseline integrity reads only the baseline projection and
  rejects malformed rule id/exception/manifest state.
- Baseline orphan introduction: introduced baseline keys without accepted
  manifest produce the existing baseline refusal class.
- Grit pattern projection: Grit execution maps `gritPattern` to findings and
  rejects unexpected pattern identity.
- Grit scan roots: approved roots are explicit and cannot fall back to broad
  defaults without a D2-owned state.
- Hook-scoped Grit: staged execution includes only approved pre-commit rules
  whose hook-scope state agrees with Pattern Authority.
- Generated-zone projection: file-layer rules map `generatedZone` to host
  declaration/remediation data.
- Unknown generated zone: command fails with explicit metadata failure before
  silently passing.
- Pattern Authority registered advisory manifest: accepted only when rule-pack
  reference includes rule id, pattern name, manifest path, owner tool, and
  lifecycle.
- Pattern Authority candidate manifest: valid draft but not accepted authority.
- Pattern Authority hook mismatch: contradicted manifest/rule hook scope is
  rejected.
- Whole-record leakage: a consumer test fails if it receives fields outside its
  projection.
- D0 public surface citation missing: implementation stops before source edits.
- OpenSpec validation pass: recorded as shape-only evidence with non-claims.

## Exact Spec Delta Recommendations

Replace the current `specs/habitat-harness/spec.md` with multiple requirements
instead of expanding the single generic requirement. The current sentence
"smallest typed registry projection" is useful as an invariant, but not as the
only oracle.

Recommended requirement headings:

```md
### Requirement: D2 Rule Registry Schema Is Versioned And Faceted
### Requirement: Rule Metadata Terms Have Closed Target Dispositions
### Requirement: Consumer Projections Replace Whole Rule Rows
### Requirement: Selector Facts Are Namespace-Aware
### Requirement: Routing Facts Do Not Parse Prose Scope
### Requirement: Graph Facts Own Owner Roots And Target Aliases
### Requirement: Baseline Facts Own Registry Baseline Relations
### Requirement: Grit Facts Own Pattern Identity And Scan Roots
### Requirement: Generated-Zone Facts Link To Host Declarations
### Requirement: Pattern Authority Facts Project Manifest Status
### Requirement: Malformed Metadata Fails Through D1 Command Outcomes
### Requirement: Downstream Dominoes Consume Named D2 Projections
```

The design should add two normative tables before implementation can start.

`Facet Inventory`:

| Facet | Target Fields | Current Fields | Required When | Refusal If Missing | Owner | Public Surface Impact |
| --- | --- | --- | --- | --- | --- | --- |
| Identity | `id`, `ownerProject`, `ownerTool`, `lane` | same | every row | `registry-identity-metadata-missing` | D2 | check/classify JSON rows via D0 |
| Selector | `id`, `ownerProject`, `ownerTool` | same | selector commands | `unknown-selector` or `wrong-selector-namespace` | D2 | `habitat check --json` |
| Routing | `routing.kind`, `routing.pathGlobs`, `routing.scanRoots`, `routing.workspaceGate` | `scope` prose | classify/D4 | `unresolved-routing-metadata` | D2 | classify JSON/human rows |
| Graph | `ownerRoot`, `targetAlias`, `dependencyTarget`, `cachePolicy` | `ownerProject`, `nxTarget`, plugin `OWNER_ROOTS` | Nx plugin/D3 | `graph-metadata-contract-failure` | D2 with D3 consumer | Nx target metadata |
| Baseline | `baselineState`, `exceptionPath`, `introductionManifest` | `exceptionPath` | baseline/D5 | `base-rule-registry-malformed` or baseline-specific refusal | D2 with D5 consumer | check diagnostics |
| Grit | `gritPattern`, `scanRoots`, `excludedRoots`, `hookScope` | `gritPattern`, `scope`, `hookScope` | Grit/D6/D7 | `grit-metadata-contract-failure` | D2 with D6/D7 consumer | check/hook behavior |
| Generated zone | `generatedZone`, `hostDeclaration`, `remediation` | `generatedZone`, generated zone code table | file-layer/D10 | `generated-zone-metadata-contract-failure` | D2 with D10 consumer | hook/check diagnostics |
| Governance | `manifestPath`, `manifestState`, `authorityAccepted`, `lifecycle` | `manifestPath`, Pattern Authority manifest | D8/D13 | `pattern-authority-contract-failure` | D2 with D8/D13 consumer | generator/check behavior |

`Projection Matrix`:

| Consumer | Projection | May Read | Must Not Read | Required Bad Case | Downstream |
| --- | --- | --- | --- | --- | --- |
| Selector/check | `ruleSelectorFacts` | identity and selector facts | `scope`, `why`, `forbids`, `detect` | wrong selector namespace | D6/D7 |
| Classify/routing | `ruleRoutingFacts` | identity plus routing facts | prose `scope` as authority | workspace-gate prose no longer sufficient | D4 |
| Nx plugin/graph | `ruleGraphFacts` | owner root, alias, dependency target, cache | plugin `OWNER_ROOTS`, `nxTarget` string parsing | unknown owner root refuses | D3 |
| Baseline | `ruleBaselineFacts` | id, exception/baseline state, manifest relation | whole rule row | introduced baseline without manifest | D5 |
| Grit | `ruleGritFacts` | pattern, scan roots, hook scope | Grit markdown frontmatter/prose | unexpected pattern identity | D6/D7 |
| Generated zones | `ruleGeneratedZoneFacts` | zone id and host declaration link | generated zone code table as hidden truth | unknown zone fails | D10 |
| Pattern Governance | `rulePatternAuthorityFacts` | manifest path/status/lifecycle | generator options as authority | orphan registered manifest | D8/D13 |

The proposal should be changed from "resolves scope, owner, public surface
impact, validation gates, downstream realignment, and stop conditions" to a
more accurate current-state sentence unless the packet is repaired in the same
edit. Current wording overclaims readiness.

The design should state that source packet phrases "Proof Classes" and
"Validation Commands / Proof Template" are provenance-only wording and are not
target D2 language.

## Tasks And Checklist Recommendations

Replace the current broad implementation tasks with ordered, bounded tasks.

1. Ground dependencies.
   - Confirm D0 and D1 are accepted for design/specification.
   - Confirm D2 implementation remains blocked until concrete D0 rows exist
     for touched command JSON, human output, package exports, package subpath,
     Nx target metadata, generator behavior, hook behavior, and docs examples.
   - Confirm malformed metadata outcomes cite D1 command/check/refusal
     contracts.

2. Author the D2 registry contract before source edits.
   - Add the facet inventory.
   - Add the terminology disposition table.
   - Add the projection matrix.
   - Add the D0 public-surface impact table.
   - Add the D1 malformed metadata outcome table.

3. Create the implementation write set and protected paths.
   - Expected implementation write set may include
     `tools/habitat-harness/src/rules/**`,
     `tools/habitat-harness/src/lib/command-engine.ts`,
     `tools/habitat-harness/src/plugin.js`,
     `tools/habitat-harness/src/lib/baseline.ts`,
     `tools/habitat-harness/src/lib/generated-zones.ts`,
     `tools/habitat-harness/src/lib/grit.ts`,
     `tools/habitat-harness/src/generators/pattern/**`,
     and targeted tests.
   - Protected paths must include source domino packets, generated outputs,
     lockfiles, unrelated packages, D0/D1 accepted records except explicit
     citations, and downstream domino specs unless the downstream ledger is
     amended.

4. Implement schema/projection layer first.
   - Add versioned registry parser.
   - Add projection functions with consumer-specific return types.
   - Add malformed metadata refusal states.
   - Add tests that fail on whole-row leakage.

5. Migrate consumers in a fixed order.
   - Selector/check facts.
   - Classify/routing facts.
   - Graph/Nx facts.
   - Baseline facts.
   - Grit facts.
   - Generated-zone facts.
   - Pattern Authority facts.

6. Validate bad cases before green-command closure.
   - Each facet class needs at least one injected malformed row.
   - Each projection needs an oracle proving consumers cannot read forbidden
     fields.
   - Each command gate records expected status, actual status, oracle,
     cache/freshness stance, and non-claims in the D2 phase record.

7. Repair workstream ledgers before acceptance.
   - Review ledger imports this investigation as blocking P1/P2 findings.
   - Downstream ledger gets one row per enabled domino.
   - Closure checklist adds "facet inventory complete", "projection matrix
     complete", "terminology dispositions complete", "D0 rows cited", and "D1
     outcomes cited".

## Validation Gates

These are the gates D2 should require after repair. Existing test filenames are
used where possible; new test files are named where current coverage does not
exist.

| Gate | Command | Expected Status | Oracle | Cache/Freshness | Non-Claims |
| --- | --- | --- | --- | --- | --- |
| V0 strict D2 shape | `bun run openspec -- validate deep-habitat-d2-rule-registry-metadata-contract --strict` | 0 | OpenSpec change shape is valid | OpenSpec local parse; no Habitat runtime | Does not prove implementation readiness, domain acceptance, or projection completeness |
| V1 all OpenSpec shape | `bun run openspec:validate` | 0 | All OpenSpec records pass strict validation | OpenSpec local parse | Does not prove Habitat behavior or current-tree cleanliness |
| V2 registry schema/projections | `bun run --cwd tools/habitat-harness test -- test/lib/rule-registry-metadata.test.ts` | 0 after implementation | Versioned parser accepts valid registry, rejects missing identity, unknown owner/tool/lane, invalid facet combinations, and whole-row leakage | Vitest local fixtures; injected registry rows | Does not prove command UX or Nx runtime |
| V3 selector/check compatibility | `bun run --cwd tools/habitat-harness test -- test/lib/rule-selection.test.ts test/commands/habitat-entrypoints.test.ts` | 0 | Unknown selector, wrong namespace, and empty intersection produce D1-aligned `rule-selection-integrity` without execution | Vitest/subprocess local | Does not prove all rules execute correctly |
| V4 classify/routing | `bun run --cwd tools/habitat-harness test -- test/lib/classify.test.ts` | 0 | Classify uses routing projection for exact-path/project-owner/workspace-gate/unresolved states; test fails if prose `scope` remains authority | Vitest local fixtures and Nx metadata stubs | Does not prove D3 graph implementation beyond routing facts |
| V5 graph/Nx metadata | `bun run --cwd tools/habitat-harness test -- test/lib/enforcement-surface.test.ts test/lib/biome-closure.test.ts` | 0 | Plugin projects and target aliases derive from graph facts; unknown owner root is a metadata failure, not skipped target creation | Vitest local createNodes inference | Does not prove Nx task execution |
| V6 live target metadata sample | `nx show project @internal/habitat-harness` | 0 | Habitat targets remain visible and registry-derived target metadata can be cited in the phase record | Nx may use local graph cache; record whether cache was reused or reset | Does not prove target commands run |
| V7 baseline projection | `bun run --cwd tools/habitat-harness test -- test/lib/baseline.test.ts test/commands/habitat-entrypoints.test.ts` | 0 | Baseline reads baseline projection and rejects missing/malformed/orphan states through known diagnostics | Vitest local temp/renamed baseline files | Does not prove rule correctness |
| V8 Grit projection | `bun run --cwd tools/habitat-harness test -- test/lib/grit-adapter.test.ts test/lib/grit-injected-probe.test.ts test/lib/rule-selection.test.ts` | 0 | Grit pattern identity, scan roots, hook scope, cache/freshness stance, and unexpected pattern identity are explicit | Vitest local/fake Grit where available; record fresh/cache state when command-backed | Does not prove all Grit patterns semantically correct |
| V9 generated-zone projection | `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts` plus a new generated-zone projection test if not already covered | 0 | Known zones map to host declarations/remediation; unknown zone fails explicitly before silent pass | Vitest fake staged paths | Does not prove regeneration command output |
| V10 Pattern Authority projection | `bun run --cwd tools/habitat-harness test -- test/rules/pattern-authority-manifest.test.ts test/generators/pattern-generator.test.ts` | 0 | Manifest path/status/lifecycle/hook agreement are projected from registry metadata; candidate is not accepted authority | Vitest tree fixtures | Does not admit new patterns |
| V11 command classify sample | `bun run habitat classify tools/habitat-harness/src/rules/rules.json` | 0 | Command output still discovers registry ownership and routing facts without prose authority | Local command; record worktree path and branch | Does not prove all metadata projections |
| V12 check malformed metadata command | New fixture command or test-owned injected registry path | Nonzero for malformed injected row | Missing required facet fails before ordinary rule execution and cannot silently disable a rule | Test fixture; no current-tree mutation | Does not prove clean current tree |
| V13 whitespace | `git diff --check` | 0 | No whitespace errors in changed files | Git working tree | Does not prove tests or acceptance |
| V14 final state | `git status --short --branch` | 0 | Only D2-owned files dirty before commit, or next packet records handoff | Git working tree | Does not prove Graphite submit readiness |

Current observed validation:

- V0 passed on the current scaffold.
- V1 passed on the current repository.
- V2-V12 are not satisfied by the current D2 OpenSpec packet because the packet
  does not yet require the necessary tests/oracles.

## Downstream Ledger Expectations

Replace the generic downstream row with per-domino rows:

| Downstream | Required D2 Projection | Expected Ledger Disposition |
| --- | --- | --- |
| D3 Workspace Graph Boundary | `ruleGraphFacts` | Blocked until graph owner root, alias, dependency target, and cache metadata are specified. |
| D4 Orientation And Routing | `ruleRoutingFacts` | Blocked until prose `scope` parsing is non-authoritative. |
| D5 Baseline Authority | `ruleBaselineFacts` | Blocked until baseline state and introduction manifest relation are specified. |
| D6 Diagnostic Pattern Catalog | `ruleSelectorFacts`, `ruleGritFacts`, diagnostic handoff metadata | Blocked until selector/Grit facts and malformed metadata diagnostic behavior are specified. |
| D7 Structural Enforcement Pipeline | selector, Grit, generated-zone, and execution-selection facts | Blocked until malformed metadata cannot silently skip rule execution. |
| D8 Pattern Governance | `rulePatternAuthorityFacts` | Blocked until manifest status/lifecycle/accepted authority projection is specified. |
| D10 Generated/Protected Zone Authority | `ruleGeneratedZoneFacts` | Blocked until generated-zone host declaration link is specified. |
| D13 Scaffolding And Refusal Contracts | selector/governance/refusal facts | Blocked until malformed metadata uses D1 refusal/command outcome semantics. |

## P1 Blockers

### P1-1: The facet and projection contract is still unspecified

The packet says "typed rule metadata facets and consumer projections" but does
not define the fields, requiredness, projection return shapes, forbidden source
fields, or refusal conditions. Current code shows multiple consumers reading
different meanings from the same mixed `HarnessRule` record. Implementation
would still decide the domain model.

Repair: add the facet inventory, terminology table, projection matrix, and
consumer-specific refusal table before implementation acceptance.

### P1-2: The normative spec delta cannot control implementation

The current spec has one broad requirement and two scenarios. It does not cover
selector, graph, baseline, Grit, generated-zone, Pattern Authority, schema
versioning, whole-record leakage, or downstream projection dependency.

Repair: replace the spec delta with the requirement families and scenario list
above.

### P1-3: D0/D1 dependency ownership remains implementation-time work

D2 can affect classify/check JSON, human output, package exports/subpaths, Nx
target metadata, hook behavior, generator behavior, and docs examples. The D2
packet says D0/D1 are required but does not list touched D0 rows or malformed
metadata's D1 command/check/refusal owner.

Repair: D2 must either remain design-only until concrete D0 rows exist, or
include a D2 public-surface impact table that names every required D0 row or
`blocked-pending-d0-row` state. It must also cite D1 outcome families for
malformed metadata.

## P2 Blockers

### P2-1: Validation gates are not falsifying enough

The current gates are mostly existing tests and command names. They do not
require injected malformed rows, projection leakage tests, no-prose-routing
tests, graph metadata assertions, generated-zone host link assertions, or D1
malformed metadata outcome checks.

Repair: add V2-V12 as required gates, including expected status, oracle,
cache/freshness stance, and non-claims.

### P2-2: Downstream realignment is too generic for a high-fanout packet

D2 enables eight downstream dominoes, each consuming a different projection.
The current downstream ledger has a generic "Later domino packets" row, which
lets each downstream packet reinterpret D2 independently.

Repair: add one downstream ledger row per enabled domino with required
projection and block/repair disposition.

### P2-3: Inherited terms are not classified

`ownerTool`, `lane`, `scope`, `nxTarget`, `generatedZone`, `hookScope`,
`gritPattern`, `manifestPath`, `file-layer`, and `wrapped-test` are carried
forward without target/compatibility/downstream-owner dispositions. That leaves
the domain language and public compatibility model ambiguous.

Repair: add the terminology disposition table and make implementation stop if
any target term remains unclassified.

### P2-4: Tasks are unresolved design questions

Tasks 2.1-2.3 ask implementation to define facets, move authority, and add
refusal states. Those are the design decisions D2 must settle before source
edits.

Repair: replace the tasks with ordered, file/test/consumer-specific work only
after the design tables exist.

## Repair Recommendations

1. Keep D2 as one OpenSpec change, but mark it blocked until repaired.
2. Amend `design.md` with:
   - registry field inventory;
   - target terminology dispositions;
   - facet inventory;
   - projection matrix;
   - D0 public-surface impact table;
   - D1 malformed metadata outcome table;
   - implementation write set and protected paths.
3. Replace `specs/habitat-harness/spec.md` with the requirement families and
   scenarios listed above.
4. Rewrite `tasks.md` so implementation tasks name files, tests, projections,
   bad cases, and stop conditions instead of broad outcomes.
5. Update `workstream/review-disposition-ledger.md` with this investigation's
   P1/P2 findings as accepted or rejected with evidence.
6. Update `workstream/downstream-realignment-ledger.md` with per-domino
   projection dependencies.
7. Update `workstream/phase-record.md` with validation result recording
   columns: `gate`, `command`, `expected_status`, `actual_status`,
   `oracle`, `cache_freshness`, `non_claims`, and `blocker_disposition`.
8. Keep OpenSpec validation as shape-only proof. Do not let it close D2
   readiness.

## Stop Condition Result

Stop condition triggered.

D2 currently leaves fallback defaults, inherited terms, and validation ownership
ambiguous:

- fallback/default risk: classify can still infer workspace gates from prose
  `scope`, the Nx plugin can still carry owner roots separately, Grit scan roots
  can still rely on broad discovery, and generated-zone truth can still live in
  a code table outside the registry contract;
- inherited term risk: current terms such as `ownerTool`, `lane`, `scope`,
  `nxTarget`, `file-layer`, `wrapped-test`, `generatedZone`, and `hookScope`
  are not classified as target language, compatibility fields, projection-only
  terms, or downstream-owned terms;
- validation ownership risk: current D2 tasks and gates do not say which test or
  command owns each malformed facet, projection leak, D0 compatibility citation,
  D1 failure/refusal outcome, or downstream projection dependency.

Therefore D2 must remain blocking until the OpenSpec packet is repaired.

Skills used: domain-design, information-design, testing-design, civ7-open-spec-workstream, civ7-systematic-workstream.
