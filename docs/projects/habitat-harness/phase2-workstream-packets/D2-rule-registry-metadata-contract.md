# D2 Rule Registry Metadata Contract

## Intent

Turn the rule registry from a prose-heavy shared object into typed metadata
facets consumed by graph, classify, check, baseline, Patterns, hooks,
and generated-zone guards.

## Product Scenario

An agent classifies a path or runs a rule selector and gets precise rule scope,
owner, tool, hook scope, baseline, manifest, and generated-zone facts without
Habitat guessing from prose.

## Domain Owner

Rule Registry Metadata owner.

Forbidden owners:

- `plugin.js` may not hard-code owner roots as registry truth.
- `classify` may not parse prose `scope` as semantic routing authority.
- baseline and Patterns may not infer admission state from file
  presence alone.

## Consumers

Structural Enforcement, Orientation and Routing, Workspace Graph Integration,
Baseline Authority, Diagnostic Pattern Catalog, Patterns,
Protected Zones, Hook Runtime.

## Contract

Define minimal typed facets:

- identity facet: `id`, `ownerProject`, `ownerTool`, `lane`;
- selector facet: owner/tool/rule selector vocabulary;
- scope/routing facet: structured path globs or owning surfaces;
- graph facet: owning project root, target alias policy, dependency target;
- baseline facet: baseline state contract and introduction manifest relation;
- Grit facet: `gritPattern`, scan root, hook scope;
- generated-zone facet: `generatedZone` and host declaration link;
- governance facet: Patterns manifest status.

Consumers receive projections. They do not consume the whole registry unless a
packet proves that is the smaller state.

## Dependency Order

Blocked by: D0 and D1.

Unblocks: D3, D4, D5, D6, D7, D8, D10, D13.

Parallelism: after the contract is drafted, projections for D3/D5/D6 can be
implemented in parallel if their write sets do not overlap.

## Current State-Space Problem

`/tools/habitat-harness/src/rules/rules.json` mixes stable fields, prose fields,
tool-specific fields, hook fields, generated-zone fields, and wrapped-test
fields. `plugin.js` separately encodes owner roots and alias construction.
`classifyRuleScope` uses string scope heuristics.

The reachable state problem is missing metadata: each consumer creates its own
interpretation, so the same rule can be simultaneously routable, unroutable,
hook-scoped, baseline-owned, or graph-owned depending on which module reads it.

## Solution Design

1. Define a versioned registry schema with typed optional facets, not a single
   mega-record.
2. Add projection functions with consumer-specific return types:
   `ruleSelectorFacts`, `ruleRoutingFacts`, `ruleGraphFacts`,
   `ruleBaselineFacts`, `ruleGritFacts`, `ruleGeneratedZoneFacts`.
3. Move owner-root truth into graph metadata or an explicit registry graph facet.
4. Preserve human `why`, `message`, and `remediate` fields as command output,
   not routing authority.
5. Add malformed-rule refusal states for missing facet fields where a consumer
   requires them.

## TypeScript State-Space Reduction

Replace optional soup with discriminated facet states:

- `ownerTool: "grit-check"` requires `gritPattern`;
- `ownerTool: "file-layer"` requires `generatedZone` or a declared file-layer
  rule kind;
- wrapped Nx rules require `nxTarget`;
- target aliases are generated from a typed graph facet, not target-name string
  parsing.

The rejected alternative is "add more optional fields to rules.json." It would
increase invalid combinations and keep routing logic scattered.

## Public Surface Impact

Internal registry shape changes are possible. Public command output may gain
more precise facts but must preserve D0-classified stable fields. Package export
impact depends on whether registry types are public or internal after D0.

## Receipt Classes

Required design receipt:

- registry field inventory;
- consumer projection matrix;
- malformed rule scenarios.

Later implementation receipt:

- schema validation tests;
- projection tests per consumer;
- classify scope tests;
- Nx target alias metadata tests;
- baseline and Patterns tests that consume facets;
- command behavior for selector errors.

Non-claims:

- D2 does not execute rules.
- D2 does not prove target aliases run.
- D2 does not admit new patterns.

## Review Lanes

- Metadata minimization review.
- API/schema compatibility review.
- Graph consumer review.
- Patterns review.
- TypeScript state-space review.

## Downstream Realignment

Update:

- rule-pack contract record;
- `tools/habitat-harness/docs/DOMAIN-MAPPING.md`;
- taxonomy references if owner roots change;
- OpenSpec packets that cite rule metadata;
- tests that fixture registry records.

## Validation Commands / Receipt Template

- `bun run --cwd tools/habitat-harness test -- test/lib/rule-selection.test.ts test/rules/pattern-authority-manifest.test.ts`:
  expected exit 0; schema and selector receipt for registry facets.
- `bun run habitat classify /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/rules/rules.json`:
  expected exit 0; command behavior receipt that registry ownership remains
  discoverable.
- `nx show project @internal/habitat-harness`: expected exit 0; graph metadata
  receipt that registry-derived targets remain visible.
- Cache stance: graph metadata may be cached, but the packet must record the
  exact JSON target metadata used.
- Injected bad case: include one rule row missing owner/tool/lane metadata and
  prove it fails before command execution.
- Non-claim: this packet does not admit new rules or change baseline debt.

## Graphite/OpenSpec Closure

Use OpenSpec if registry schema or generated target behavior changes. Commit
schema/projection work before consumer refactors.

## Stop Conditions

Stop if:

- consumers still parse prose scope for authoritative routing;
- a whole-rule object is passed where a smaller projection is enough;
- malformed metadata silently disables a rule;
- target aliases depend on colon-string parsing instead of structured facts.
