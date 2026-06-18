# D2 TypeScript State-Space Investigation

## Objective

Review the D2 Rule Registry Metadata Contract packet as a fresh TypeScript
state-space and design-pattern reviewer. The goal is not to implement Habitat
source code. The goal is to make the D2 OpenSpec packet specific enough that
later implementation agents can refactor the registry without choosing between
incompatible type models, projection boundaries, fallback policies, or public
compatibility strategies.

Verdict: D2 is not acceptable yet. The current packet names the right direction,
but it still leaves the core TypeScript model to implementation. If the later
implementation agent must decide whether the target is "ownerTool as the
discriminant", "optional facets on a mega-record", "a separate rule kind", or
"consumer-local parsers over the current record", D2 has failed its stop
condition.

The required repair is a single D2-owned target model: a versioned registry
document parsed into discriminated rule records, with projection functions as
the only cross-domain read surface. Public legacy views may be generated from
the canonical registry only where D0 compatibility requires them.

## Sources Read

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/typescript-refactoring/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/typescript-refactoring/references/smell-catalog.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/typescript-refactoring/references/refactoring-mechanics.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/typescript-refactoring/references/paradigms-and-patterns.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/typescript-refactoring/references/llm-slop-cleanup.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/typescript-refactoring/references/worked-examples.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/typescript-refactoring/assets/refactor-plan-template.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/typescript-refactoring/assets/refactor-findings-template.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation-frame.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D2-rule-registry-metadata-contract.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/tasks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/workstream/phase-record.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/workstream/review-disposition-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D2-review.md`
- D0 and D1 OpenSpec packet excerpts for compatibility constraints.
- Current code surfaces:
  - `tools/habitat-harness/src/rules/rules.json`
  - `tools/habitat-harness/src/rules/architecture.ts`
  - `tools/habitat-harness/src/plugin.js`
  - `tools/habitat-harness/src/lib/command-engine.ts`
  - `tools/habitat-harness/src/lib/baseline.ts`
  - `tools/habitat-harness/src/lib/generated-zones.ts`
  - `tools/habitat-harness/src/lib/grit.ts`
  - `tools/habitat-harness/src/lib/hooks.ts`
  - `tools/habitat-harness/src/lib/grit-injected-probe.ts`
  - `tools/habitat-harness/src/rules/pattern-authority/manifest.ts`

## Current Smells By File And Surface

### Optional/facet soup on the registry record

`tools/habitat-harness/src/rules/architecture.ts:16` defines `HarnessRule` as a
single mixed record. Fields such as `nxTarget`, `gritPattern`, `manifestPath`,
`generatedZone`, `forbiddenFileNames`, and `hookScope` are optional on the whole
type at lines 25 and 29-33. This admits combinations that have no domain
meaning:

- a non-Grit rule with `gritPattern`;
- a Grit rule without `gritPattern`;
- a file-layer rule with neither `generatedZone` nor `forbiddenFileNames`;
- a wrapped-test rule without `nxTarget`;
- a rule with `manifestPath` but no Pattern Authority registration state.

This is TypeScript optional-property soup. The target is not "add more optional
fields". The target is a closed discriminated model where each rule variant
carries only the fields its state permits.

### Untyped JSON parse as registry authority

`tools/habitat-harness/src/rules/architecture.ts:38` casts parsed JSON directly
to `{ rules: HarnessRule[] }`. That cast is the registry trust boundary, but it
does not validate the field/state relationships above. Any later consumer that
narrows through ad hoc checks is repairing this unsound boundary locally.

### Prose fields used as machine routing authority

`tools/habitat-harness/src/lib/command-engine.ts:886` classifies rule scope from
the whole `HarnessRule`. It parses prose `scope` into patterns at
`command-engine.ts:955`, rejects prose qualifiers through string includes at
`command-engine.ts:966`, and detects workspace gates with prose substring checks
at `command-engine.ts:941`. The current state-space smell is not merely regex
fragility. It is that `scope` means both human explanation and routing data, so
each consumer can invent a different semantic interpretation.

### Graph metadata duplicated and silently skipped

`tools/habitat-harness/src/plugin.js:17` hard-codes `OWNER_ROOTS` outside the
registry. `plugin.js:199` silently continues when an owner root is missing.
`plugin.js:213`, `plugin.js:218`, and `plugin.js:223` infer target alias policy
from `ownerTool`, rule ids, and raw `nxTarget`. This is shotgun surgery and
fallback behavior: a malformed graph facet can silently erase targets instead of
emitting a contract failure.

### Consumer-local projection fragments already exist, but are not canonical

Baseline has its own projection parser. `tools/habitat-harness/src/lib/baseline.ts:753`
parses only `id` and `exceptionPath`, normalizing missing `exceptionPath` to
`"none"` at `baseline.ts:788`. Pattern Authority has a partial rule-pack input
shape at `tools/habitat-harness/src/rules/pattern-authority/manifest.ts:161`,
but its fields are optional and are later checked as orphan-manifest issues at
`manifest.ts:680`. Classification already emits a smaller `ScopedRule` shape at
`tools/habitat-harness/src/lib/command-engine.ts:169`, but it is derived from
whole-record heuristics.

These are evidence that projections are viable. They are not authority. D2
should consolidate them under one registry owner.

### Generated-zone authority split across rule records and code table

`tools/habitat-harness/src/lib/generated-zones.ts:17` defines generated zones in
code while file-layer rules reference `generatedZone` from `rules.json`. At
`generated-zones.ts:45`, unknown/missing generated-zone metadata fails only when
the staged rule executes. The target state should make the generated-zone
projection either valid or refused before execution. D10 can own the host
declaration content, but D2 must own the registry link and projection state.

### Hook scope is a hidden Grit-only modifier

`tools/habitat-harness/src/lib/command-engine.ts:400` filters staged execution
by `rule.ownerTool === "grit-check"` and `rule.hookScope === "pre-commit"`.
Because `hookScope` is optional on all rules, the valid state "Grit rule that
participates in pre-commit" is encoded as a field that may or may not exist.
D2 should make hook participation an explicit facet state on the Grit/check
variant, not a globally optional field.

### Pattern Authority and active Grit checks are conflated

Current `rules.json` has 31 `ownerTool=grit-check` rules. Every one has
`gritPattern` and `hookScope`; none has `manifestPath`. The D2 source packet
asks for a governance facet and "Pattern Authority manifest status", but the
current packet does not distinguish active Grit check metadata from registered
Pattern Authority admission. Requiring `manifestPath` for all Grit rows would be
overengineering and would break present behavior; making it optional on all rows
would preserve the soup. The target needs a separate governance state.

## Target Type And State Model

The D2 packet should choose this model explicitly.

### Canonical owner module

Rule Registry Metadata has one canonical owner module for parsing, validating,
and projecting registry records. The packet should name the owner and forbid
new local parsers. A future implementation can choose exact filenames, but the
packet must require one owner module with these responsibilities:

- parse the versioned registry document;
- validate discriminated rule states;
- expose projection functions;
- generate any legacy public compatibility view required by D0;
- export a JS-loadable graph projection or structured graph data that
  `plugin.js` can consume without duplicating owner-root and alias semantics.

Because `plugin.js` is plain ESM JS loaded directly by Nx, D2 must explicitly
resolve that runtime boundary. Acceptable choices are:

- put graph facts directly in the versioned JSON schema so `plugin.js` is a
  generic interpreter over structured graph facets; or
- provide a runtime-loadable ESM JS registry projection module with TypeScript
  declarations/tests.

Leaving `plugin.js` to reimplement a TS-only parser is not acceptable.

### Registry document

The canonical data shape should be versioned:

```ts
interface RuleRegistryDocumentV1 {
  schemaVersion: 1;
  rules: readonly RuleRegistryRecord[];
}
```

The current top-level `$comment` in `rules.json` is compatibility prose, not
schema. After D2, a rule document without `schemaVersion: 1` should be either a
deliberate one-step migration input or a contract failure. It must not become a
permanent dual path.

### Common identity and human-output facets

Every rule has a stable identity and human-facing output copy:

```ts
type RuleLane = "enforced" | "advisory";

interface RuleIdentity {
  id: RuleId;
  ownerProject: OwnerProjectId;
  ownerTool: OwnerTool;
  lane: RuleLane;
}

interface RuleMessageFacet {
  forbids: string;
  why: string;
  message: string;
  remediate: string | null;
}
```

`ownerTool` should remain as the compatibility selector vocabulary unless a D0
row authorizes a public rename. Internally it should also be the rule variant
discriminant for this packet. Introducing a second `ruleKind` while keeping
`ownerTool` as a separate public selector would add a synchronization state
without enough benefit.

### Discriminated rule variants

The registry rule should be a closed union by `ownerTool`. Each variant carries
only its valid fields.

```ts
type RuleRegistryRecord =
  | HabitatNativeRule
  | WrappedScriptRule
  | WrappedTestRule
  | GritCheckRule
  | FileLayerRule
  | BiomeRule
  | NxBoundariesRule;

type CommandRuleBase = RuleIdentity & RuleMessageFacet & {
  routing: RuleRoutingFacet;
  baseline: RuleBaselineFacet;
  graph: RuleGraphFacet;
};

type HabitatNativeRule = CommandRuleBase & {
  ownerTool: "habitat-native";
  execution: { kind: "command"; argv: readonly string[] };
};

type WrappedScriptRule = CommandRuleBase & {
  ownerTool: "wrapped-script";
  execution: { kind: "command"; argv: readonly string[] };
};

type WrappedTestRule = CommandRuleBase & {
  ownerTool: "wrapped-test";
  execution: { kind: "nx-target"; nxTarget: NxTargetRef };
};

type BiomeRule = CommandRuleBase & {
  ownerTool: "biome";
  execution: { kind: "workspace-target"; target: "biome:ci" };
};

type NxBoundariesRule = CommandRuleBase & {
  ownerTool: "nx-boundaries";
  execution: { kind: "workspace-target"; target: "boundaries" };
};

type GritCheckRule = CommandRuleBase & {
  ownerTool: "grit-check";
  grit: {
    pattern: GritPatternName;
    scan: GritScanFacet;
    hook: HookParticipationFacet;
  };
  governance: PatternGovernanceFacet;
};

type FileLayerRule = CommandRuleBase & {
  ownerTool: "file-layer";
  fileLayer:
    | { kind: "generated-zone"; generatedZone: GeneratedZoneId }
    | { kind: "forbidden-file-names"; forbiddenFileNames: NonEmptyReadonlyArray<string> };
};
```

This collapses the key invalid states:

- `wrapped-test` without `nxTarget` becomes unrepresentable.
- `grit-check` without `gritPattern` becomes unrepresentable.
- `file-layer` with neither generated zone nor forbidden filenames becomes
  unrepresentable.
- `manifestPath` exists only in a governance variant that requires it.
- `hookScope` exists as an explicit Grit hook state, not as a global optional.

### Routing facet

Routing must be data, not prose:

```ts
type RuleRoutingFacet =
  | { kind: "path-globs"; globs: NonEmptyReadonlyArray<RepoGlob> }
  | { kind: "project-owner" }
  | { kind: "workspace-gate"; reason: WorkspaceGateReason };
```

`scope` may remain only in the human-output compatibility view if D0 requires
it. It must not be consumed by routing, graph, baseline, Grit, generated-zone,
or governance projections.

The packet should not allow a normal `unresolved-metadata` registry state.
Unresolved metadata is a projection failure:

```ts
type RuleProjectionResult<T> =
  | { ok: true; facts: T }
  | { ok: false; failure: RuleMetadataFailure };
```

That distinction matters. "Unresolved" is not a valid rule. It is a refusal to
claim routing facts.

### Graph facet

Graph projection must remove `OWNER_ROOTS` and target-name string parsing:

```ts
type RuleGraphFacet = {
  ownerRoot: RepoRelativePath;
  alias:
    | { kind: "workspace-target"; target: "boundaries" | "biome:ci" | "grit:check" | "generated:check" }
    | { kind: "owner-nx-target"; target: NxTargetRef }
    | { kind: "habitat-rule-command" };
};
```

For `owner-nx-target`, do not keep `dependencyForTarget` colon parsing as
authority. Store `{ project, target }` or an equivalent structured dependency
object.

### Baseline facet

The current `exceptionPath: "none"` sentinel should become a discriminated
baseline state:

```ts
type RuleBaselineFacet =
  | { kind: "none" }
  | { kind: "baseline-file"; path: RepoRelativePath }
  | { kind: "external-exception-source"; sourcePath: RepoRelativePath; owner: string; migrationOwner: string };
```

Baseline can still project only `id` and baseline facts, but it should receive
that from `ruleBaselineFacts`, not from its own parser over raw JSON.

### Grit and Pattern Governance facets

Do not require Pattern Authority metadata for every active Grit check. Model the
states separately:

```ts
type HookParticipationFacet =
  | { kind: "none" }
  | { kind: "pre-commit" };

type PatternGovernanceFacet =
  | { state: "not-pattern-authority-managed" }
  | {
      state: "registered-pattern-authority";
      manifestPath: RepoRelativePath;
      lifecycle: "advisory" | "enforced";
    };
```

This gives Pattern Authority an exact projection without making current active
Grit checks malformed merely because they do not have manifests.

## Projection Boundaries

Consumers must receive named projections. They must not read whole registry
records unless D2 proves that the whole record is smaller than a projection. No
current consumer met that bar during this review.

| Consumer | Projection | May read | Must not read | Failure mode |
| --- | --- | --- | --- | --- |
| Rule selectors | `ruleSelectorFacts` | `id`, `ownerProject`, `ownerTool`, `lane` | `scope`, `detect`, tool facets, prose | `unknown-selector`, `wrong-selector-namespace`, or malformed registry refusal before selection |
| Classification/routing | `ruleRoutingFacts` | identity plus `routing` | prose `scope`, `forbids`, `why`, `detect` | `unresolved-routing-metadata` in classify output, before claiming a route |
| Nx plugin/graph | `ruleGraphFacts` | identity plus `graph.ownerRoot` and `graph.alias` | local `OWNER_ROOTS`, raw `nxTarget` string parsing, prose | graph metadata contract failure, no silent target skip |
| Rule execution | `ruleExecutionFacts` | execution variant and message facet | graph owner roots, baseline internals, Pattern Authority state unless Grit needs it | malformed execution facet before running a command |
| Baseline | `ruleBaselineFacts` | `id`, `lane`, baseline facet, introduction manifest relation | human prose, execution command, raw optional `exceptionPath` | baseline contract failure with D1-compatible command outcome |
| Grit adapter | `ruleGritFacts` | `id`, `lane`, `grit.pattern`, scan roots, message, hook state | generated-zone fields, raw `scope`, whole `HarnessRule` | malformed Grit metadata before Grit runs |
| Generated/protected zones | `ruleGeneratedZoneFacts` | file-layer variant and D10 host declaration link | raw `generatedZones` lookup divorced from registry, Grit fields | unknown generated zone refusal before staged execution |
| Pattern Authority | `rulePatternGovernanceFacts` | governance state plus pattern identity when registered | active Grit rows that are not registered authority | orphan/contradicted manifest refusal |
| Hooks/local feedback | `ruleHookFacts` | hook participation, selected Grit scan roots, local feedback copy | global optional `hookScope`, non-Grit hook assumptions | hook refusal or local-only feedback outcome |
| Diagnostic catalog handoff | `ruleDiagnosticFacts` | `id`, lane, owner, message/remediation, source projection id | execution internals and graph roots unless cited | diagnostic metadata refusal, not silent omission |

## Safe Refactor Sequence

The implementation sequence should be behavior-preserving and compiler-gated.
Each move should leave the build green before the next move. Do not combine
state-model refactors with behavior changes.

1. Add a focused registry field inventory and fixture matrix in tests. Capture
   the observed 51 rules, seven `ownerTool` values, and current field groups.
   This is characterization, not target design.
2. Introduce the canonical registry types, parser, and projection functions
   behind the existing behavior. The parser must validate the discriminated
   states. Avoid `as any`; any unavoidable cast belongs at the JSON parse
   boundary with a written reason.
3. Generate the legacy `HarnessRule` compatibility view from canonical records
   if D0 requires it. The legacy view is a facade, not a second authority.
4. Migrate selector logic to `ruleSelectorFacts`. Keep current selector output
   stable.
5. Migrate classification to `ruleRoutingFacts`. Delete `scopePathPatterns`,
   prose qualifier parsing, and workspace-gate substring checks when the new
   routing data is authoritative.
6. Migrate `plugin.js` to structured graph facts. Remove `OWNER_ROOTS`, remove
   silent skip on unknown owners, and remove colon-string target parsing as
   authority. Resolve the JS/TS runtime boundary explicitly in the packet before
   implementation starts.
7. Migrate baseline integrity to `ruleBaselineFacts`. Remove the independent
   raw JSON parser once baseline consumes the canonical projection.
8. Migrate Grit, hook filtering, generated-zone checks, and Pattern Authority
   one projection at a time. Each migration must include an injected malformed
   row test for its facet.
9. Shrink exports and whole-record access. After all consumers use projections,
   make whole canonical records private to the owner module unless D0 requires a
   public compatibility facade.
10. Delete legacy fields from the source registry only after all consumers have
    moved and public compatibility rows allow the change.

Stop and re-plan if a step only moves whole-record access into a new helper
without deleting invalid states or local parsing.

## Public Compatibility Strategy

D2 may change internal registry shape, but public compatibility must be
D0-governed.

- Preserve current command JSON fields for `Classification`, `ScopedRule`,
  `CheckReport`, and selector failures unless D0 rows authorize versioning or a
  facade.
- Preserve package exports such as `rules`, `ruleById`, and `HarnessRule` only
  if D0 classifies them as public or compatibility-required. If preserved, they
  must be generated views over the canonical registry, not source authority.
- `ownerTool`, `ownerProject`, `lane`, and `rule id` remain selector vocabulary
  for compatibility. Treat them as stable public values until D0 says otherwise.
- New malformed-metadata behavior must use D1's command outcome/refusal
  language. Do not invent a D2-local receipt/proof/error DTO.
- Human fields `why`, `message`, `forbids`, and `remediate` remain output copy,
  not routing authority.

## Expected Compiler And Test Gates

Baseline gates from the current packet are necessary but insufficient:

- `bun run --cwd tools/habitat-harness check`
- `bun run --cwd tools/habitat-harness test -- test/lib/rule-selection.test.ts test/rules/pattern-authority-manifest.test.ts`
- `bun run --cwd tools/habitat-harness test -- test/lib/classify.test.ts test/lib/baseline.test.ts test/lib/grit-adapter.test.ts test/lib/grit-injected-probe.test.ts test/lib/hooks.test.ts`
- `bun run habitat classify tools/habitat-harness/src/rules/rules.json`
- `nx show project @internal/habitat-harness`
- `bun run openspec -- validate deep-habitat-d2-rule-registry-metadata-contract --strict`
- `bun run openspec:validate`
- `git diff --check`

D2 should add or require these falsifying gates:

- registry parser/projection unit tests for every `ownerTool` variant;
- one malformed row test per facet:
  - Grit rule missing `gritPattern`;
  - file-layer rule with neither generated zone nor forbidden filenames;
  - wrapped-test rule missing structured `nxTarget`;
  - graph facet missing owner root;
  - generated-zone link that has no D10 host declaration;
  - registered Pattern Authority state missing `manifestPath`;
- classification test that fails if prose `scope` parsing remains authoritative;
- Nx graph target assertion proving aliases are generated from structured graph
  facets, not local owner roots or colon parsing;
- baseline projection test proving baseline no longer parses raw registry JSON;
- public compatibility test or snapshot for any command JSON field D2 touches.

## P1 Blockers

### P1: Current packet still leaves the target type model to implementation

`design.md` and `tasks.md` say "Define typed rule metadata facets and consumer
projections", but they do not specify the discriminated union, valid variants,
projection result states, or public compatibility facade. This is the central
TypeScript design decision. D2 must include the target model above or an
equally precise alternative. If it does not, implementation agents will guess.

### P1: Graph projection and JS plugin runtime boundary are unresolved

`plugin.js` is a plain ESM JS Nx plugin. A TS-only registry owner would not, by
itself, remove duplicated graph authority from `plugin.js`. D2 must say whether
graph facts live directly in schema data or in a JS-loadable projection module.
Without this, `OWNER_ROOTS` and alias policy will remain local graph authority.

### P1: Projection failure semantics are not tied to D1

Malformed registry metadata currently produces mixed outcomes: silent target
skip, classify "unresolved metadata", execution-time generated-zone diagnostic,
or Pattern Authority issue. D2 needs one projection failure model and must map
command-visible refusal/reporting through D1. Otherwise each consumer will keep
inventing failure states.

### P1: Pattern Authority registration state is underspecified

Current Grit checks do not have `manifestPath`. D2 must distinguish active Grit
checks from registered Pattern Authority entries. If it simply makes manifest
fields optional, it preserves optional soup. If it requires manifests for all
Grit rows, it changes current behavior and overfits D8/D13 governance into D2.

## P2 Blockers

### P2: Spec delta is too thin

The current spec has one broad requirement and two scenarios. It can pass while
implementation still passes whole rule objects, keeps baseline's local parser,
or leaves generated-zone authority split. D2 needs separate normative
requirements for registry schema, projections, routing, graph, baseline, Grit,
generated-zone, Pattern Authority, hooks, and no whole-record leakage.

### P2: Tasks are outcomes, not safe refactor steps

Tasks 2.1-2.3 are broad goals. They do not name sequence, modules, tests,
compatibility handling, or stop conditions. Replace them with the safe sequence
above after the packet records the target model.

### P2: Validation does not falsify state-space collapse

Existing gates can pass even if optional soup and prose routing remain. Add
malformed facet tests, projection tests, graph alias assertions, and prose
scope-removal tests.

### P2: Downstream handoff is too generic

D2 enables D3, D4, D5, D6, D7, D8, D10, and D13. Each needs a different
projection. The downstream ledger should name the exact projection consumed by
each downstream packet and whether the downstream packet is blocked or must be
repaired after D2.

## Packet Repair Recommendations

1. Add a `Registry State Model` section to `design.md` with the discriminated
   `RuleRegistryRecord` union, routing/graph/baseline/Grit/file-layer/governance
   facets, and projection failure result.
2. Add a `Projection Matrix` section matching the table in this scratch doc.
   For each consumer, list may-read fields, forbidden fields, failure mode, D0
   public impact, D1 refusal/outcome mapping, and downstream domino.
3. Add a `Runtime Boundary For Nx Plugin` section. It must choose schema-owned
   graph facts or a JS-loadable projection module. Do not leave plugin import
   mechanics to implementation.
4. Add a `Compatibility Facade` section. State whether `HarnessRule`, `rules`,
   and `ruleById` are public compatibility views pending D0 rows, and forbid
   consumers from using them as internal authority after projections exist.
5. Expand `specs/habitat-harness/spec.md` into consumer-specific requirements.
   Generic "smallest typed projection" language is acceptable only after the
   projection names and fields are normative.
6. Replace implementation tasks with the safe sequence above and name the
   expected tests after each logical move.
7. Add malformed metadata bad cases as required tests, including one bad case
   for each rule variant and each projection family.
8. Update the downstream ledger with one row per enabled domino:
   - D3 consumes `ruleGraphFacts`.
   - D4 consumes `ruleRoutingFacts`.
   - D5 consumes `ruleBaselineFacts`.
   - D6 consumes `ruleDiagnosticFacts` and Grit pattern facts.
   - D7 consumes execution/selection facts.
   - D8 consumes `rulePatternGovernanceFacts`.
   - D10 consumes generated-zone facts and host declaration links.
   - D13 consumes registry/generator registration refusal facts.
9. Record D0 row citation requirements for every public command, JSON, export,
   Nx target, generator, and hook surface D2 touches.
10. Record D1 outcome/refusal mapping for malformed metadata. Do not add a
    D2-local proof, receipt, or artifact vocabulary.

## Final Acceptability Bar

D2 becomes acceptable for implementation only when an implementation agent can
answer these questions from the packet without invention:

- What is the exact canonical registry type model?
- Which field discriminates each rule variant?
- Which invalid combinations are unrepresentable?
- Which projection does each consumer use?
- What does each projection return when metadata is malformed?
- How does `plugin.js` consume graph facts without local authority?
- Which public compatibility views remain, and under which D0 handling?
- Which D1 command outcome/refusal state reports malformed metadata?
- Which tests fail if optional/prose/fallback soup survives?

Until those answers are written into the OpenSpec packet, D2 remains blocked.
