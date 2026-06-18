# Design: D13 Scaffolding And Refusal Contracts

## Frame

D13 is the Scaffolding and Refusal design/specification packet. It answers one
product question before any generator writes: can Habitat create this requested
repo structure now, and if not, which owner controls the missing authority and
what recovery path is available?

The source domino packet is controlling input. Current generator code is
present-behavior input, not target-domain authority. The design uses standard
engineering language for creation requests, pre-write decisions, receipts,
diagnostics, refusals, command outcomes, and handoff records. Legacy
proof/evidence-shaped vocabulary is not accepted as D13 product code/type
language unless a D0 compatibility row later preserves it for an existing public
surface.

## Domain Boundary

Owner: Scaffolding and Refusal.

D13 owns:

- request classification for Habitat structural creation commands;
- pre-write decisions for supported project scaffolds, candidate pattern drafts,
  governed pattern promotion requests, and refusals;
- supported-scaffold receipt shape and non-claims;
- refusal shape, owner routing, recovery instructions, retry condition, and
  no-write result;
- command-facing wording for D13-owned scaffold/refusal states.

D13 does not own:

- D0 public compatibility decisions;
- D2 registry metadata, generated-zone facts, or governance facts;
- D8 Pattern Governance admission, baseline acceptance, hook eligibility,
  diagnostic admission, local-feedback admission, apply safety, or retirement;
- G-HOST host declarations or host-owned scaffold policy;
- D10 generated/protected-zone semantics;
- D14 Authoring Topology design or MapGen authoring implementation.

## Ontology Decisions

| Term | D13 status | Meaning |
| --- | --- | --- |
| `scaffold request` | accepted | Request to create a supported Habitat-owned structural shell or candidate artifact set. |
| `supported scaffold contract` | accepted | Closed contract that D13 may write after preconditions pass. |
| `uniform workspace project scaffold` | accepted | Generic project shell for the supported D13 project-kind set. Current supported kinds are `plugin`, `foundation`, and `app`; package namespace/root conventions remain public compatibility and workspace-policy facts until D0/D2/G-HOST make them live. |
| `candidate pattern draft` | accepted | Non-active Pattern Authority candidate output. It is not an active Grit rule, not a baseline, not hook scoped, not admitted diagnostics, and not apply capable. |
| `registered pattern promotion request` | accepted as routed request | Request to turn a candidate/manifest into active Pattern Governance state. D13 may route/refuse the request; D8 owns admission. |
| `pre-write decision` | accepted | Closed decision made before any file mutation. |
| `scaffold receipt` | accepted | Command outcome for a write decision, naming the contract, paths, follow-up checks, consumed upstream facts, and non-claims. |
| `scaffold refusal` | accepted | Command outcome with blocked action, request class, reason, owning authority, recovery instruction, retry condition, no-write result, and non-claims. |
| `generator` | implementation term only | Nx surface that executes the D13 contract; not the domain owner. |
| `kind` | constrained | Public option/input that must parse to a closed supported kind or refusal. It is not a free string. |
| `artifact` | rejected as broad target language | Use project shell, candidate draft, manifest, receipt, command outcome, or refusal. |
| `rule-pack entry` for candidate output | rejected | Candidate generation does not create registered enforcement state. |
| `lifecycle` as D13 authority | constrained | Pattern lifecycle belongs to D8; D13 consumes/routs command states only. |
| Civ/MapGen names as generic Habitat taxonomy | rejected unless upstream accepts | Current names such as `mod`, `engine`, `control`, `adapter`, `sdk`, `tooling`, and `@civ7` are current-repo compatibility/workspace facts, not generic Habitat semantics by default. |

The owner name `Scaffolding and Refusal` supersedes the incomplete inherited
label `Scaffolding owner` because refusal is a first-class product outcome.

## Target State Model

Later implementation must parse raw generator options into this closed request
space before any write code runs:

```ts
type SupportedProjectKind = "plugin" | "foundation" | "app";

type ScaffoldingRequest =
  | ProjectScaffoldRequest
  | PatternCandidateDraftRequest
  | RegisteredPatternPromotionRequest
  | UnsupportedProjectKindRequest
  | HostOwnedScaffoldRequest
  | AuthoringTopologyRequest
  | MalformedScaffoldRequest;

type ScaffoldingDecision =
  | WriteProjectScaffoldDecision
  | WritePatternCandidateDraftDecision
  | RouteRegisteredPatternPromotionDecision
  | RefuseScaffoldDecision;
```

Only write decisions carry a write set. Refusal decisions carry an empty write
set and cannot call write helpers. Dispatch over `ScaffoldingDecision` must be
exhaustive.

## Request And Outcome Matrix

| Request class | Preconditions | D13 decision | Owner if refused/routed | Required outcome |
| --- | --- | --- | --- | --- |
| Supported uniform project scaffold | Kind is `plugin`, `foundation`, or `app`; root and package name match the supported contract; target root is empty; package name is unique; touched public surfaces have D0 rows. | Write project scaffold. | D13 for scaffold contract; D0/D2/G-HOST/D10 for consumed facts. | Scaffold receipt with written paths, contract id, follow-up checks, consumed upstream projections, and non-claims. |
| Unsupported project kind | Kind is outside the supported D13 set and no accepted upstream owner declares it supported. | Refuse before writes. | D13 for generic refusal; D2/G-HOST/domain owner where known. | Refusal names unsupported kind, owner/recovery, no-write result, and retry condition. |
| Schema-admitted unsupported kind | Current schema admits `mod`, `engine`, `control`, `adapter`, `sdk`, or `tooling`; runtime does not support it. | Refuse before writes unless a later accepted upstream contract changes ownership. | D13/D0/D2/G-HOST as applicable. | Refusal is intentional compatibility behavior, not accidental thrown text. |
| Host-owned scaffold request | Request requires host-specific declaration or host-owned path/gate policy. | Refuse or remain source-blocked until G-HOST publishes a consumable host projection. | G-HOST. | Host-policy-missing refusal with non-claim that Habitat did not infer host semantics. |
| Authoring Topology request | Request asks for recipe/domain/op/stage/step/contract/default/schema/registry/Studio topology. | Refuse before writes using D14 early-fence language when available; source implementation remains blocked behind D14 for authoring-specific wording. | D14/future Authoring Topology. | Refusal says D13 does not implement authoring topology and points to future authoring design. |
| Pattern candidate draft | Rule id/pattern name is normalized; candidate and active surfaces do not collide; candidate root is allowed. | Write candidate draft and candidate manifest only. | D13 owns candidate-file scaffold; D8 owns future registration. | Receipt states candidate-only output and no active rule, baseline, hook, diagnostic admission, local feedback, or apply admission. |
| Candidate preflight conflict | Candidate, active pattern, active rule, or baseline already exists. | Refuse before writes. | D13 for candidate collision; D8 where active authority interpretation is needed. | Refusal names collision path/state and recovery action. |
| Registered pattern promotion request | Registered lifecycle is requested; accepted D8 Pattern Authority manifest and required baseline/hook facts are available. | Route to governed promotion implementation only through D8 contract. | D8. | Handoff record or D8-sourced refusal; D13 does not decide pattern authority. |
| Registered promotion missing or rejected manifest | Manifest path is absent or D8 validation rejects manifest/baseline/hook/source facts. | Refuse before active writes. | D8 for admission reason; D13 for command refusal projection. | Refusal includes D8 reason projection, no active writes, and recovery action. |
| Root/package mismatch | Request overrides canonical root or package name. | Refuse before writes. | D13, with D0/D2 compatibility if public behavior changes. | Refusal names expected and received values. |
| Non-empty root or package collision | Target root contains files or package name already exists. | Refuse before writes. | D13. | Refusal identifies conflict and recovery action. |
| Missing upstream prerequisite | D0 rows, live D2 facts, live D8 projection, G-HOST declaration, or D14 early-fence wording is required but unavailable. | Stop source implementation; command behavior fails closed if implemented. | Missing upstream owner. | Stop condition, not local workaround. |

## Refusal Contract

Every D13 refusal SHALL include:

- `blocked_action`: the write or routing action that did not happen;
- `request_class`: the parsed request class;
- `reason`: one closed reason such as `unsupported-project-kind`,
  `host-policy-missing`, `authoring-topology-owned`, `candidate-collision`,
  `registered-manifest-missing`, `registered-manifest-rejected`,
  `root-mismatch`, `package-name-mismatch`, `non-empty-root`,
  `package-name-collision`, `malformed-request`, or
  `upstream-prerequisite-unavailable`;
- `owning_authority`: D13, D8, G-HOST, D10, D14, D0, D2, or another named
  upstream owner;
- `recovery_instruction`: the next safe action for an agent or maintainer;
- `retry_condition`: the upstream repair or request change that can make retry
  meaningful;
- `write_set`: empty;
- `non_claims`: explicit statements about what the refusal does not prove or
  implement.

No D13 refusal may be represented only by an unstructured thrown error after
write code has started.

## Receipt Contract

Every D13 write decision SHALL produce a scaffold receipt that includes:

- supported contract id;
- normalized request;
- written paths;
- skipped active-authority surfaces where relevant;
- consumed upstream projections;
- follow-up checks such as classify/check/Nx discovery where applicable;
- non-claims.

Project scaffold receipts SHALL state that the scaffold does not prove package,
application, product, or runtime behavior. Candidate pattern receipts SHALL
state that the candidate is not active authority and requires D8 before
registration, baseline, hook, diagnostic, local-feedback, or apply surfaces are
allowed.

## D8 Pattern Governance Boundary

D13 may create candidate drafts and candidate manifests. It must not treat those
outputs as active Pattern Governance state.

D13 may route registered promotion requests only after D8 live projections
provide the accepted Pattern Authority manifest, baseline relation, hook-scope
compatibility where relevant, and refusal reason vocabulary. Missing, malformed,
placeholder, contradicted, or candidate-only manifests produce a D8-owned refusal
projected through D13's command surface.

The current `generators.json` description that implies the pattern generator
creates a matching rule-pack entry is a public-surface compatibility issue.
Later source work must either correct the description through D0 handling or
preserve it as an explicitly deprecated/facaded compatibility surface. It must
not remain an accidental candidate/registered ambiguity.

## G-HOST And D14 Blocking Boundaries

Host-specific scaffold behavior remains source-blocked behind accepted/live
G-HOST declarations. D13 may design the generic host-policy-missing refusal
shape, but it must not encode Civ, MapGen, or host-specific literals as generic
Habitat semantics.

Authoring Topology refusal implementation remains source-blocked behind D14
early-fence language. D13 owns the generic refusal shape; D14 owns the
authoring-specific blocked actions, future acceptance criteria, and owner
language. Until D14 supplies that input, D13 may only state the source blocker
and reject authoring topology implementation.

## Write Set For Later Implementation

D13 source implementation may touch only these surfaces unless a later accepted
packet changes the write set:

- `tools/habitat-harness/src/generators/project/schema.json`
- `tools/habitat-harness/src/generators/project/generator.cjs`
- `tools/habitat-harness/test/generators/project-generator.test.ts`
- `tools/habitat-harness/src/generators/pattern/schema.json`
- `tools/habitat-harness/src/generators/pattern/generator.cjs`
- `tools/habitat-harness/src/generators/pattern/registration.cjs`, only for
  command-facing refusal projection and only without weakening D8 validation
- `tools/habitat-harness/test/generators/pattern-generator.test.ts`
- `tools/habitat-harness/test/rules/pattern-authority-manifest.test.ts`, only
  for D13/D8 boundary fixtures
- `tools/habitat-harness/generators.json`
- `tools/habitat-harness/docs/CAPABILITIES.md`
- `tools/habitat-harness/docs/SCENARIOS.md`
- `tools/habitat-harness/README.md`
- `tools/habitat-harness/docs/AUTHORING-NEXT.md`, only for refusal/future-fence
  clarification
- D13 OpenSpec/workstream files and D0 matrix rows in the owning implementation
  phase

Protected unless another accepted owner explicitly allows edits:

- `.grit/patterns/habitat/checks/**` except through D8-governed registered
  promotion tests;
- `tools/habitat-harness/src/rules/rules.json` except through D8-governed
  registered promotion tests;
- `tools/habitat-harness/baselines/**` except through D5/D8 baseline authority;
- `tools/habitat-harness/src/rules/pattern-authority/manifest.ts` unless D8
  requests a manifest contract change;
- `mods/**`, `packages/civ7-*`, `packages/mapgen-*`, and MapGen authoring
  topology paths;
- generated artifacts, lockfiles, `dist/**`, `mod/**`, `.nx/**`,
  `.civ7/outputs/**`, `tools/habitat-harness/oclif.manifest.json`,
  `mods/mod-swooper-maps/src/maps/generated/**`,
  `packages/civ7-types/generated/**`, and
  `packages/civ7-map-policy/src/civ7-tables.gen.ts`;
- other OpenSpec packets except dependency/status rows explicitly named by D13.

## Public Compatibility Blockers

Source implementation must cite concrete D0 rows before changing:

- `@internal/habitat-harness:project` name/schema/factory/help/output;
- project generator option enum, default, description, thrown message, dry-run
  output, and generated layout;
- `@internal/habitat-harness:pattern` name/schema/factory/help/output;
- pattern lifecycle option wording, candidate/registered behavior, thrown
  message, and generated path;
- `tools/habitat-harness/generators.json` descriptions;
- public docs/examples and README command snippets;
- package exports for generator or Pattern Authority types.

If a D0 row is absent, the implementation step is blocked; D13 may not silently
change compatibility shape.

## Validation Model

Design-time validation:

- `bun run openspec -- validate deep-habitat-d13-scaffolding-refusal-contracts --strict`
- `bun run openspec:validate`
- `git diff --check`
- complete-standard wording audit over `$D13_CHANGE/**`,
  `$REMEDIATION_DIR/packet-index.md`, and `$AGENT_SCRATCH/domino-D13-*.md`

Later implementation validation:

| Gate | Expected result | Required oracle | Non-claim |
| --- | --- | --- | --- |
| `bun run --cwd tools/habitat-harness test -- test/generators/project-generator.test.ts test/generators/pattern-generator.test.ts test/rules/pattern-authority-manifest.test.ts` | exit 0 | Unit coverage for project refusals, candidate/registered separation, Pattern Authority boundary, and no-write outcomes. | Does not prove live Nx CLI behavior alone. |
| `bun run nx g @internal/habitat-harness:project d13-plugin-smoke --kind=plugin --dry-run --no-interactive` | exit 0 | Dry-run lists only supported plugin scaffold paths and leaves status clean. | Does not prove product/runtime behavior. |
| `bun run nx g @internal/habitat-harness:project d13-mod-refusal --kind=mod --dry-run --no-interactive` | nonzero | Refusal names unsupported kind and no files are written. | Does not implement mod scaffolding. |
| Parameterized unsupported kind tests for `engine`, `control`, `adapter`, `sdk`, `tooling`, and schema-admitted aliases | nonzero per case | Each refusal is structured and no-write. | Does not decide future support forever. |
| Root/package mismatch and collision tests | nonzero | Existing tree is byte-preserved and no target files are written. | Does not prove every filesystem race. |
| Candidate pattern dry-run | exit 0 | Candidate paths only; no active `.grit`, `rules.json`, baseline, hook, local-feedback, diagnostic, or apply state. | Candidate is not registered. |
| Registered advisory/enforced without manifest | nonzero | D8-owned missing-manifest refusal; no active writes. | Does not admit Pattern Governance. |
| Rejected/placeholder manifest fixture | nonzero | D8-owned manifest refusal; no active writes. | Does not weaken manifest authority. |
| Host-specific request after G-HOST | nonzero until host contract accepted | Host-policy-missing refusal; no writes. | Does not infer host semantics. |
| Authoring Topology request after D14 early fence | nonzero | D14-owned authoring-topology refusal; no MapGen authoring files. | Does not implement authoring topology. |

`bun run habitat generate --help` is rejected as a D13 gate because Habitat does
not expose a `generate` command. Generator validation uses Nx generator commands.

## Structural Alternatives Rejected

- Implementing current code module-by-module: rejected because it preserves the
  accidental generator/pattern/host vocabulary that caused the domain confusion.
- Treating Nx schema enum values as authority: rejected because schema values are
  command input and compatibility surface, not Pattern Governance, Host Policy, or
  Authoring Topology authority.
- Creating a broad artifact abstraction: rejected because D13 needs fewer states,
  not more generic containers.
