# D8 Code/Vendor Topology Investigation

Status: BLOCKING

## Blocking Reason

The current D8 disk packet is an incomplete packet, not a complete executable
Pattern Governance topology contract. The current source tree contains incomplete
Pattern Authority implementation facts, but those facts are present-behavior
evidence only. They do not satisfy the Phase 2 D8 source packet as a complete
OpenSpec target.

The packet remains blocking because it does not yet normatively specify the full
D8 lifecycle state model, current code topology, public surfaces, write set,
protected paths, vendor ownership split, upstream/downstream contracts, stale
outputs, or validation gates that a later implementation agent must follow
without inventing product or domain decisions.

## Sources Read

Mandatory skill anchors:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/testing-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/source-map.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/validation-checks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/artifact-contracts.md`

Repo and OpenSpec sources:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/process/GRAPHITE.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D8-pattern-governance.md`
- All current files under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d8-pattern-governance/`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- Relevant upstream/downstream OpenSpec packet files for D0-D7, D9, D11, and D13.

Current code, tests, and docs:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/pattern-authority/manifest.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/generators/pattern/generator.cjs`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/generators/pattern/registration.cjs`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/generators/pattern/schema.json`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/rules.json`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/plugin.js`
- Relevant slices of `tools/habitat-harness/src/lib/command-engine.ts`, `tools/habitat-harness/src/lib/hooks.ts`, `tools/habitat-harness/src/lib/grit.ts`, `tools/habitat-harness/src/lib/grit-apply.ts`, and `tools/habitat-harness/src/lib/baseline.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/rules/pattern-authority-manifest.test.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/generators/pattern-generator.test.ts`
- Grit check/apply pattern inventory under `.grit/patterns/habitat/**`
- Baseline inventory under `tools/habitat-harness/baselines/**`
- `tools/habitat-harness/README.md`, `tools/habitat-harness/docs/CAPABILITIES.md`, and `tools/habitat-harness/docs/SCENARIOS.md`

## Vendor Docs Consulted

- Grit CLI Reference: https://docs.grit.io/cli/reference
- Grit authoring guide: https://docs.grit.io/guides/authoring
- GritQL testing guide: https://docs.grit.io/guides/testing
- Grit target languages: https://docs.grit.io/language/target-languages
- Grit configuration and Markdown pattern rules: https://docs.grit.io/guides/config
- Biome CLI reference: https://biomejs.dev/reference/cli/
- Biome Continuous Integration recipe: https://biomejs.dev/recipes/continuous-integration/
- Nx Local Generators: https://nx.dev/docs/extending-nx/local-generators
- Nx Project Graph Plugins: https://nx.dev/docs/extending-nx/project-graph-plugins
- Nx CreateNodesV2 reference: https://nx.dev/docs/reference/devkit/CreateNodesV2
- Nx inferred tasks: https://nx.dev/docs/concepts/inferred-tasks
- Nx run tasks: https://nx.dev/docs/features/run-tasks

Vendor ownership facts D8 must respect:

- Grit owns GritQL syntax, target-language declarations, Markdown pattern
  loading, pattern frontmatter interpretation, native fixture execution through
  `grit patterns test`, diagnostic observation through `grit check`, and write
  transforms through `grit apply`.
- Grit documentation makes Markdown pattern filename/title/body/frontmatter/test
  conventions native Grit facts. Habitat may require additional Pattern
  Authority metadata, but it must not pretend Grit frontmatter or prose is
  Habitat authority.
- `grit check` and `grit apply` are different vendor commands. Diagnostic
  registration must not imply apply approval.
- Biome owns `biome check`, `biome ci`, formatter/linter/import sorting
  behavior, and CI-oriented no-write command semantics. D8 should not treat
  Biome hygiene as Pattern Governance.
- Nx owns generator mechanics, generator schema/default conventions, project
  graph plugin `createNodesV2` mechanics, inferred task creation, target
  inputs/outputs/cache metadata, and task running. Habitat owns which generator
  requests it supports and which generated candidate states are non-enforcing.

## Current Code Topology

### Pattern Authority Manifest

`tools/habitat-harness/src/rules/pattern-authority/manifest.ts` is the current
core Pattern Authority surface.

Current exported model:

- `PatternAuthorityLifecycle` is only
  `candidate | registered-advisory | registered-enforced`.
- `PatternAuthorityOwnerTool` is `grit-check | grit-apply`.
- Registered manifests require normative sources, proving sources, language,
  scan roots, fixture strategy, false-positive model, current-tree scan,
  baseline contract, hook scope, and apply safety.
- `PatternAuthorityApplySafety` already separates `not-apply` from `apply`
  proof fields, but apply approval is not a lifecycle state.
- Candidate manifests contain candidate artifact paths, rejected registration,
  and required registration items.
- Validation reasons include missing, malformed, placeholder, contradiction,
  orphan, Grit-metadata-only, and Nx-options-only reasons.

Current validator behavior:

- `validatePatternAuthorityManifest(undefined)` reports `missing-manifest`.
- Candidate manifests can be valid drafts while `authorityAccepted` is false.
- Registered manifests are accepted only when structured fields pass and, when
  requested, the rule-pack reference matches rule id, pattern name, manifest
  path, owner tool, lane, and hook scope.
- Registered manifests outside the canonical `pattern-authority/<rule-id>.json`
  path are rejected.
- Candidate manifests outside the candidate root are rejected when a manifest
  path is provided.
- Grit frontmatter/prose and Nx generator options are rejected as standalone
  Habitat authority metadata.

D8 gap:

- The Phase 2 D8 source packet requires a complete lifecycle including candidate
  draft, manifest-invalid candidate, registered diagnostic pattern, registered
  hook-scoped pattern, registered apply-approved pattern, refused pattern, and
  retired pattern. Current code has three lifecycle strings plus validation
  failure reasons. The current union does not model refused or retired patterns
  as durable states, and it does not model manifest-invalid candidate or
  apply-approved registered pattern as lifecycle states.

### Pattern Generator And Promotion

`tools/habitat-harness/src/generators/pattern/generator.cjs` is the current Nx
generator entrypoint for pattern work.

Current candidate generation:

- Normalizes `ruleId`, `patternName`, lifecycle, owner project, OpenSpec change
  id, manifest path, and hook scope.
- Defaults lifecycle to `candidate`.
- Refuses active rule collisions in `.habitat/patterns/active/checks`, baseline
  collisions under `tools/habitat-harness/baselines`, and duplicate `rules.json`
  ids.
- Writes candidate pattern and candidate manifest under
  `tools/habitat-harness/src/rules/pattern-authority/candidates`.
- Candidate output explicitly says it is not an active Grit check, not a
  `rules.json` entry, not baselined, and not hook-scoped.

Current registered promotion:

- Non-candidate lifecycle routes into `registration.cjs`.
- Registered promotion requires `--manifestPath`.
- Reads and validates the manifest with a required rule-pack reference.
- Requires an explicit baseline file and rule-introduction baseline manifest
  before writing registered output.
- Refuses active pattern collisions and candidate-artifact collisions.
- Writes `.habitat/patterns/active/checks/<pattern>.md`.
- Appends a rule entry to `tools/habitat-harness/src/rules/rules.json`.
- Records `hookScope: "pre-commit"` only when the accepted manifest and
  invocation agree.

D8 gap:

- The generator currently performs both candidate starter packeting and registered
  promotion. D8 must decide whether this remains one generator surface with
  lifecycle states or becomes separated by D13 generator/refusal and D8
  Pattern Governance. D13 consumes D8 and explicitly says project starter packeting
  must be separated from Pattern Governance candidate generation.

### Rule Registry And Active Grit Catalog

`tools/habitat-harness/src/rules/rules.json` is the current Habitat rule pack.
Current disk inventory:

- 52 total registered Habitat rules.
- 32 rules with `ownerTool: "grit-check"`.
- 31 `grit-check` rules are enforced and hook-scoped to `pre-commit`.
- `docs-local-checkout-paths` is the advisory `grit-check` rule and is not
  hook-scoped.
- Current Grit check pattern directory contains 32 Markdown files under
  `.habitat/patterns/active/checks`.
- Current Grit apply pattern directory contains 3 Markdown files under
  `.habitat/patterns/active/apply`.
- No committed candidate files currently exist under
  `tools/habitat-harness/src/rules/pattern-authority/candidates`.
- No committed registered Pattern Authority JSON manifests currently exist
  under `tools/habitat-harness/src/rules/pattern-authority/*.json`.

D8 gap:

- Active rule rows generally have `gritPattern` and `hookScope`, but they do not
  have `manifestPath`. Existing registered Grit rules therefore predate the
  target Pattern Authority Manifest contract. D8 must specify whether and how
  legacy registered rules are represented, grandfathered, refused, migrated, or
  retired without confusing current enforcement with complete Pattern Authority
  admission.

### Execution Consumers

Current consumers of D8-adjacent state:

- `tools/habitat-harness/src/lib/grit.ts` consumes `rules.json` Grit facts and
  `.grit` patterns to run/project diagnostics.
- `tools/habitat-harness/src/lib/baseline.ts` consumes registered rule ids and
  baseline JSON files, and enforces rule-introduction baseline manifests for
  seeded new-rule baselines.
- `tools/habitat-harness/src/lib/command-engine.ts` selects rules, reduces
  staged Grit execution to hook-scoped rules, executes rule owners, applies
  baselines, and assembles `CheckReport`.
- `tools/habitat-harness/src/lib/hooks.ts` uses `hookScope` and staged Grit
  roots for pre-commit local feedback.
- `tools/habitat-harness/src/plugin.js` uses `rules.json` to infer
  `habitat:check`, `habitat:rule:*`, `grit:check`, `generated:check`, and
  owner-specific targets.
- `tools/habitat-harness/src/lib/grit-apply.ts` consumes apply patterns for fix
  transactions. D9 owns transaction safety, rollback, and recovery states.

D8 does not own final report assembly, baseline application, diagnostic
projection, hook-local sequencing, Nx target inference, or apply transaction
execution. It owns the admission/lifecycle contract that these consumers may
trust.

## Public/Durable Surfaces

### Public Or Durable D8-Adjacent Surfaces

- Package exports from `tools/habitat-harness/src/index.ts`:
  `CandidatePatternAuthorityManifest`, `RegisteredPatternAuthorityManifest`,
  `PatternAuthorityManifest`, `PatternAuthorityRuleReference`,
  `PatternAuthorityValidationFailureReason`,
  `PatternAuthorityValidationIssue`,
  `PatternAuthorityValidationOptions`, `PatternAuthorityValidationResult`,
  `patternAuthorityCandidateRoot`, `patternAuthorityManifestPath`,
  `patternAuthorityManifestRoot`, `patternAuthorityManifestSchemaVersion`,
  `patternAuthorityRuleReferenceFromRule`, and
  `validatePatternAuthorityManifest`.
- Nx generator surface from `tools/habitat-harness/generators.json`:
  `@internal/habitat-harness:pattern`, its schema, and its factory.
- Generator schema fields in
  `tools/habitat-harness/src/generators/pattern/schema.json`: `ruleId`,
  `ownerProject`, `patternName`, `lifecycle`, `openspecChangeId`,
  `manifestPath`, and `hookScope`.
- Current active rule registry fields in `rules.json`: `id`, `ownerTool`,
  `ownerProject`, `lane`, `scope`, `forbids`, `why`, `detect`, `remediate`,
  `message`, `exceptionPath`, `gritPattern`, `manifestPath`, and `hookScope`.
- Grit pattern file paths under `.habitat/patterns/active/checks/**` and
  `.habitat/patterns/active/apply/**`.
- Baseline JSON files under `tools/habitat-harness/baselines/<rule-id>.json`.
- Human guidance in `tools/habitat-harness/README.md`,
  `tools/habitat-harness/docs/SCENARIOS.md`, and
  `tools/habitat-harness/docs/CAPABILITIES.md`.
- OpenSpec D8 artifacts under
  `openspec/changes/deep-habitat-d8-pattern-governance/**`.

Any D8 implementation that changes these surfaces needs D0 public-surface
compatibility rows and compatibility handling before source edits.

### Upstream Contracts Consumed By D8

- D0 Public Surface Compatibility: D8 must cite D0 rows before changing command
  behavior, command JSON, exports, root scripts, Nx target metadata, generator
  schema/behavior, hook output, or public examples.
- D1 Receipt Contract Boundary: D8 must not reuse proof/receipt/handoff
  language for Pattern Governance unless D1 makes that output family explicit.
- D2 Rule Registry Metadata: D8 consumes rule identity, owner tool, owner
  project, lane, Grit facts, baseline facts, hook-scope facts, and generated
  registry projections. D8 must not parse whole `rules.json` rows as target
  authority if D2 provides narrower projections.
- D3 Workspace Graph Boundary: D8 should treat Nx project/target facts as graph
  metadata owned by D3, especially when generator or plugin targets appear in
  validation gates.
- D4 Classify Orientation And Routing: D8 can be routed by classification but
  does not own classify output semantics.
- D5 Baseline Authority: D8 consumes explicit baseline contract, shrink-only
  rules, rule-introduction manifests, and baseline-integrity gates. D8 does not
  own baseline JSON semantics.
- D6 Diagnostic Pattern Catalog: D8 consumes diagnostic pattern identity,
  native Grit fixture/probe evidence, Grit command/projection facts, and
  diagnostic non-claims. D8 does not own diagnostic acquisition or projection.
- D7 Structural Enforcement Pipeline: D8 supplies admitted pattern state to
  enforcement but does not own final check report construction, exit policy, or
  enforcement report invariants.

### Downstream Consumers

- D9 Transformation Transaction consumes D8 apply-safety decisions. D9 requires
  D8 and must not infer write safety from diagnostic registration.
- D11 Local Feedback consumes D7/D9/D10 decisions and hook-scoped rule facts. It
  will observe D8 hook-scope admission through enforcement outputs, but it must
  not decide pattern lifecycle locally.
- D13 Generator And Refusal consumes D8 candidate semantics. It must keep
  generator/refusal separate from Pattern Governance and must not register
  generated pattern candidates automatically.

## D8 Write Set

This investigation writes only this scratch document. It does not authorize
source refactor code.

Candidate later D8 implementation write set, after packet acceptance:

- `openspec/changes/deep-habitat-d8-pattern-governance/**` for packet repair,
  phase records, review disposition, downstream realignment, and closure
  evidence.
- `tools/habitat-harness/src/rules/pattern-authority/manifest.ts` for the
  lifecycle union, manifest validation, refusal-state shape, retired-state
  shape, and rule-reference projection.
- `tools/habitat-harness/src/generators/pattern/generator.cjs` only for
  generator behavior that creates candidate states or routes promotion through
  accepted D8 governance.
- `tools/habitat-harness/src/generators/pattern/registration.cjs` only for
  registered promotion admission gates, refusal output, and baseline/manifest
  consumption.
- `tools/habitat-harness/src/generators/pattern/schema.json` only if D0/D13
  compatibility allows generator schema changes.
- `tools/habitat-harness/src/index.ts` only for explicit public export
  additions/versioning approved through D0.
- `tools/habitat-harness/test/rules/pattern-authority-manifest.test.ts` for
  lifecycle, refusal, retired-state, manifest-invalid candidate, hook-scope,
  apply-safety, and rule-reference tests.
- `tools/habitat-harness/test/generators/pattern-generator.test.ts` for
  candidate and promotion write/refusal tests.
- A new focused D8 test file may be justified if lifecycle state explosion makes
  the two existing test files too broad.
- `tools/habitat-harness/README.md`,
  `tools/habitat-harness/docs/SCENARIOS.md`, and
  `tools/habitat-harness/docs/CAPABILITIES.md` only for public guidance
  updates caused by accepted D8 semantics.
- `docs/projects/habitat-harness/openspec-remediation/packet-index.md` and
  D8 downstream ledgers only after D8 review/repair facts change packet status.

Conditional write set requiring extra authority:

- `tools/habitat-harness/src/rules/rules.json` only when D2 registry facts,
  D5 baseline contract, and D8 admission state explicitly authorize a rule
  registration or migration.
- `.habitat/patterns/active/checks/**` only when D6 diagnostic catalog and D8
  admission both authorize active pattern creation or migration.
- `.habitat/patterns/active/apply/**` only when D9 apply-safety authority
  authorizes a transformation pattern; D8 alone cannot approve apply writes.
- `tools/habitat-harness/baselines/**` only through D5-approved
  rule-introduction or baseline-integrity paths.

## Protected Paths

D8 must protect these paths from direct edits unless the named owner contract
explicitly authorizes the change:

- `tools/habitat-harness/dist/**` and
  `tools/habitat-harness/oclif.manifest.json`: generated build artifacts.
- `node_modules/**`, `.nx/**`, `.habitat/cache/patterns/**`, and `.grit/.gritmodules/**`:
  vendor/cache output.
- Root lockfiles and package manager generated state.
- `tools/habitat-harness/baselines/**`: D5 baseline authority. Do not edit
  baseline JSON as a side effect of Pattern Governance design.
- Existing `.habitat/patterns/active/checks/**`: D6 diagnostic catalog and
  current enforcement state. D8 must not treat file presence as lifecycle
  authority.
- Existing `.habitat/patterns/active/apply/**`: D9 transformation authority.
  Diagnostic registration does not imply apply approval.
- `tools/habitat-harness/src/rules/rules.json`: D2 rule registry metadata.
  D8 may consume and reference registry facts, but schema/row changes need D2
  and D0 compatibility.
- `tools/habitat-harness/src/plugin.js`, `nx.json`, and root Nx target
  configuration: D3 graph/Nx topology and D0 public surfaces.
- `tools/habitat-harness/src/lib/command-engine.ts`,
  `tools/habitat-harness/src/lib/hooks.ts`,
  `tools/habitat-harness/src/lib/grit.ts`,
  `tools/habitat-harness/src/lib/grit-apply.ts`, and
  `tools/habitat-harness/src/lib/baseline.ts`: owned primarily by D7, D11, D6,
  D9, and D5 respectively.
- Generated or protected product outputs outside Habitat, including `mod/**`,
  `dist/**`, `mods/mod-swooper-maps/src/maps/generated/**`, and
  `packages/civ7-map-policy/src/civ7-tables.gen.ts`.

Stale/generated-output concerns:

- `tools/habitat-harness/docs/CAPABILITIES.md` says there are 31 active
  `grit-check` rules and 2 apply patterns, while current disk inventory shows
  32 `grit-check` rules and 3 apply pattern files. D8 must treat that as stale
  guidance evidence, not a source of truth, and should repair docs only if D8
  implementation changes public guidance.
- Candidate and registered generated pattern files are generated by the pattern
  generator. A later D8 implementation must prove generated output through the
  generator/tests, not by hand-editing candidate or active pattern output.

## Validation Gates

Current D8 validation gates:

- `bun run --cwd tools/habitat-harness test -- test/rules/pattern-authority-manifest.test.ts`
- `bun run habitat classify tools/habitat-harness/src/rules/rules.json`
- `bun run openspec -- validate deep-habitat-d8-pattern-governance --strict`
- `bun run openspec:validate`
- `git diff --check`

Required D8 topology gates before implementation readiness:

- `bun run --cwd tools/habitat-harness test -- test/rules/pattern-authority-manifest.test.ts test/generators/pattern-generator.test.ts`: must cover candidate draft, manifest-invalid candidate, registered diagnostic, hook-scoped registered, apply-approved registered, refused, retired, missing manifest, missing fixtures, missing baseline contract, missing hook decision, apply-safety absence, and no-write refusal cases.
- `bun run habitat check --rule baseline-integrity --json`: must prove D5
  baseline contract state for any registered pattern touched by D8. Broad
  `habitat check --json` is not a substitute for the D5-focused gate.
- `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --verbose`
  or a narrowed accepted equivalent: must prove native Grit fixture behavior
  for pattern files touched by D8. This proves pattern fixture syntax/behavior,
  not Pattern Governance admission.
- `bun run habitat classify tools/habitat-harness/src/rules/rules.json` and
  `bun run habitat classify tools/habitat-harness/src/rules/pattern-authority/manifest.ts`: must record path routing facts and available targets.
- `bun run openspec -- validate deep-habitat-d8-pattern-governance --strict`
- `bun run openspec:validate`
- `git diff --check`
- `git status --short --branch`
- `gt status`

Required non-claims:

- Passing native Grit pattern tests does not prove current-tree enforcement,
  baseline acceptance, hook scope, or apply safety.
- Passing manifest validation does not prove the active Grit catalog, baseline
  contract, or current-tree diagnostic behavior unless those gates are also
  present.
- Candidate generation does not prove registration, hook scope, baseline state,
  or apply approval.
- Registered diagnostic state does not prove apply approval.
- Hook-scoped state does not prove CI authority or D11 local feedback closure.

## P1/P2 Blockers

| ID | Severity | Finding | Required Repair |
| --- | --- | --- | --- |
| D8-P1-001 | P1 | The D8 OpenSpec spec has only broad candidate/registered scenarios and does not encode the full Phase 2 lifecycle state set. | Add normative lifecycle requirements and scenarios for candidate draft, manifest-invalid candidate, registered diagnostic pattern, registered hook-scoped pattern, registered apply-approved pattern, refused pattern, and retired pattern. |
| D8-P1-002 | P1 | The current packet does not declare a concrete D8 write set and protected path list. | Move the write/protected set from investigation into `design.md` and `phase-record.md`, including conditional owners for `rules.json`, `.grit` patterns, baselines, and generator schema changes. |
| D8-P1-003 | P1 | Current implementation topology has incomplete Pattern Authority code, but the packet does not classify which parts are target contract versus compatibility facts. | Add current topology inventory to the packet and explicitly mark existing three-state lifecycle, current generated messages, and legacy rule rows as present behavior until accepted as target. |
| D8-P1-004 | P1 | The packet does not name the vendor ownership split. | Record Grit, Biome, and Nx ownership boundaries with exact official URLs and state what D8 owns around those vendor tools. |
| D8-P1-005 | P1 | Validation gates omit `pattern-generator.test.ts`, the D5 `baseline-integrity` focused gate, native Grit fixture proof, and bad-case refusal coverage required by the source packet. | Repair proposal/tasks/phase record gates and require exact command expectations plus non-claims. |
| D8-P1-006 | P1 | Existing active Grit rules generally have no `manifestPath`, while current code can require one for registered promotion. The packet does not define legacy registered-rule disposition. | Specify legacy active pattern disposition: grandfathered compatibility, migration, refused, retired, or accepted manifest path. Do not let file presence imply lifecycle. |
| D8-P1-007 | P1 | D8 dependencies are underspecified. The source packet says blocked by D1, D2, D5, and D6, while current OpenSpec proposal says D0, D2, D5, and D6. | Reconcile consumed upstream contracts explicitly: D0 for public surfaces, D1 for receipt/output language, D2 for registry facts, D5 for baseline contracts, D6 for diagnostic pattern facts, and D7 as enforcement consumer boundary. |
| D8-P1-008 | P1 | The D8 phase record records branch `codex/deep-habitat-openspec-remediation`, but the active requested branch is `codex/d8-pattern-governance-packet`. | Update phase record state before claiming review/implementation readiness. |
| D8-P2-001 | P2 | Docs guidance appears stale against current inventory counts: current disk has 32 `grit-check` rules and 3 apply pattern files, while `CAPABILITIES.md` records 31 and 2. | Decide whether D8 or a docs realignment pass repairs the counts; until then, treat docs counts as stale guidance, not topology truth. |
| D8-P2-002 | P2 | The current generator description says it starter packets a Grit pattern and matching rule-pack entry, but candidate behavior does not write `rules.json`. | Repair public docs/schema/description through D0/D13 compatibility so candidate generation is described as non-registering unless promotion is explicitly requested and accepted. |
| D8-P2-003 | P2 | The packet does not yet name D9, D11, and D13 consumer non-claims in one place. | Add downstream consumer section: D9 consumes apply-safety only, D11 consumes hook-scoped enforcement facts only through D7/D9/D10, and D13 consumes candidate/refusal semantics without automatic registration. |
| D8-P2-004 | P2 | Refusal reasons exist as validator issues but not as durable lifecycle/output states. | Decide target shape for refused states and require tests that prove missing manifest, malformed manifest, placeholder manifest, missing baseline, missing hook-scope decision, missing fixtures, and apply-safety absence fail closed before writes. |
