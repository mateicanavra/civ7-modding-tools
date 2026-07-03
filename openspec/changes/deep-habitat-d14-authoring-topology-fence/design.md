# Design: D14 Authoring Topology Fence

## Frame

D14 is the product fence between Habitat's current repo-local structural
substrate and future MapGen Authoring Topology. The solution space is rugged:
Habitat already has generators, classification, verification, pattern
registration, and guardrails, so it is easy for implementation to overread those
tools as authoring capability. D14 prevents that local optimum by making the
unsupported authoring state explicit, closed, and command-facing.

Acceptance threshold: later execution agents can implement D13 refusals and
authoring docs/examples without deciding what counts as an authoring request,
what future work must exist, which upstream domains own adjacent facts, or which
validation gates are authoring readiness versus non-support context.

## Domain Boundary

| Boundary | D14 decision |
| --- | --- |
| Owner | D14 owns authoring-specific blocked-action language, future acceptance criteria, recovery semantics, and current support boundaries. |
| Future owner | Future Authoring Topology owns any accepted MapGen authoring generator, topology model, and product acceptance loop. |
| D13 relation | D13 owns the generic scaffold request/refusal envelope; D13 consumes D14's authoring-specific fields. |
| D4 relation | D4 owns classify/orientation states and may provide examples; D4 does not own authoring capability. |
| D12 relation | D12 owns verify handoff receipt states; D12 success does not imply authoring readiness. |
| D8 relation | D8 owns pattern registration; registered rule health is not authoring workflow support. |
| G-HOST relation | G-HOST owns host policy declarations; host policy does not imply MapGen authoring support unless a later accepted authoring contract consumes it. |

## Accepted And Rejected Language

| Term | Decision | Meaning |
| --- | --- | --- |
| `Authoring Topology Fence` | accepted | Current D14 boundary that classifies authoring requests as unsupported and defines future acceptance criteria. |
| `future Authoring Topology` | accepted | Future product layer that may design and implement MapGen authoring generators after D14's criteria are satisfied. |
| `authoring request` | accepted | Request to create or modify MapGen recipe/domain/operation/stage/step topology or adjacent authoring registries/artifacts. |
| `blocked authoring action` | accepted | A write/routing action D14 declares unsupported in the current Habitat substrate. |
| `authoring refusal` | accepted | D13 generic scaffold refusal populated with D14-owned blocked action, recovery, retry condition, and support-boundary language. |
| `future acceptance criteria` | accepted | Conditions a later project must meet before authoring implementation starts. |
| `topology scaffold` | rejected | Ambiguous blend of D13 scaffold and future Authoring Topology. Use `supported scaffold contract` or `authoring request`. |
| broad generator acceptance noun | rejected as target code/type language | Use generator dry-run record, generated diff, command result, compile/test result, or acceptance gate. |
| `authoring-ready classify result` | rejected | D4 classify can orient paths; it cannot certify authoring readiness. |
| `verify proves authoring` | rejected | D12 verify can report bounded handoff outcomes; it cannot certify future product behavior. |

## Unsupported Authoring Action Inventory

D14 SHALL classify these request families as authoring requests when they are
asked of current Habitat scaffolding, classification, verify, or pattern
surfaces:

| Request family | Blocked action | Current handling |
| --- | --- | --- |
| New MapGen recipe | Create recipe file set, recipe metadata, stage wiring, and recipe artifact contracts. | Refuse through D13 envelope with D14 owner. |
| New MapGen domain | Create domain root, operation registry, public surface, tests, and recipe integration. | Refuse through D13 envelope with D14 owner. |
| Domain operation | Create operation implementation, contract/default/schema, registry entry, and public export. | Refuse through D13 envelope with D14 owner. |
| Recipe stage | Create or insert stage, update recipe topology, and update stage ordering. | Refuse through D13 envelope with D14 owner. |
| Recipe step | Create step, step contract/default/schema bundle, and stage membership. | Refuse through D13 envelope with D14 owner. |
| Step contract/default/schema bundle | Create support files for an authoring step without the owning stage/operation loop. | Refuse through D13 envelope with D14 owner. |
| Registry/public-surface update | Modify operation registry, recipe registry, package exports, or Studio artifacts as part of authoring. | Refuse unless a later accepted Authoring Topology packet owns the change. |
| Studio recipe artifact update | Create or update Studio-facing generated recipe artifacts. | Refuse; D14 does not make generated artifacts hand-editable. |
| Broad MapGen topology migration | Infer or reorganize domain/op/stage/step relationships from intent. | Refuse; future work must investigate current conventions first. |

This inventory is authoring-specific. Unsupported generic project kinds such as
`mod`, `engine`, `control`, `adapter`, `sdk`, or `tooling` remain D13/D0/D2/G-HOST
compatibility and ownership decisions unless the request also asks to create
MapGen authoring topology.

## Closed D13 Authoring Fence State Model

Later implementation must not turn D14 into a repo-specific parser inside the
generic Habitat toolkit. D14 does not introduce an independent command request
model, natural-language request parser, or MapGen/Civ-specific runtime branch.
D14 supplies future authoring-topology vocabulary for later product work; the
current D13 generator remains a generic scaffold surface that refuses unsupported
project kinds before writes.

Current implementation model:

- `tools/habitat-harness/src/generators/scaffolding/schema.ts` owns the generic
  TypeBox scaffold refusal envelope;
- `@internal/habitat-harness:project` supports only the current uniform
  `plugin` project contract;
- unsupported project kinds refuse before writes through D13's existing
  `unsupported-project-kind` refusal;
- no current command/API surface accepts structured recipe/domain/operation/
  stage/step authoring requests, so D14 must not infer those requests from
  project names, path strings, prose, or arbitrary kind values.

Required invariants:

- D13 refuses unsupported project kinds through its existing generic scaffold
  refusal with an empty write set; it must not infer MapGen recipe/domain/
  operation/stage/step topology from generator inputs.
- D14's authoring vocabulary is future product vocabulary, not a current
  generator DTO, hidden parser, or runtime branch in generic Habitat code.
- Supported plugin scaffolds, pattern candidate generation, classify, and verify
  flows cannot carry D14 blocked authoring actions.
- Future Authoring Topology support is an upstream acceptance condition, not a
  Phase 3 runtime variant. It is unreachable until a later accepted packet
  supplies the change id, topology model, generator write contract, D0 rows, and
  validation gates.
- Dispatch over the D14 blocked action and signal vocabulary belongs to the later
  accepted authoring surface, not to current project scaffolding.

This is a TypeScript state-space reduction: "maybe this scaffold can author
MapGen topology" becomes either a D13-supported non-authoring flow or a
D13 refusal populated with D14-owned facts, instead of a free-form option,
boolean, thrown string, or second request parser.

## Authoring Refusal Fields For D13

D14 provides the authoring-specific values that D13 inserts into the generic
`scaffold refusal` shape:

| D13/source concern | D14 value contract |
| --- | --- |
| Current project generator | Refuse unsupported project kinds before writes through the D13 scaffold refusal envelope. |
| Current runtime vocabulary | Stay generic: no MapGen/Civ-specific parser, signal list, authoring DTO, or hidden alternate branch. |
| Current recovery text | Use supported Habitat structural scaffolds or open a future product-specific authoring topology contract. |
| Current retry condition | Retry only after future authoring support exists with a topology model, generator write contract, D0 compatibility rows, and executable validation loop. |
| Current write set | Empty for refused unsupported project kinds. |
| Future authoring surface | May use D14's blocked-action inventory after a later accepted authoring contract owns the command/API surface. |

## Future Authoring Topology Acceptance Criteria

A later authoring project may start only when it defines and accepts:

1. Current MapGen topology investigation over `$REPO_ROOT/docs/system/libs/mapgen`,
   `$REPO_ROOT/mods/mod-swooper-maps/src/domain`,
   `$REPO_ROOT/mods/mod-swooper-maps/src/recipes/standard`,
   `$REPO_ROOT/packages/mapgen-core/src`, and relevant tests.
2. A target topology model naming recipe, domain, operation, stage, step,
   contract, default, schema, registry, public export, and Studio artifact
   responsibilities with one owner per responsibility.
3. A representative authoring loop that crosses generation, wiring, and
   validation end to end, such as domain operation plus recipe step/stage
   wiring when current code shows that loop is the complete authoring unit.
4. Generator write contract: exact files written, registries updated,
   collision policy, create/delete policy, generated/protected-zone policy, and
   rollback/no-residue behavior.
5. Public compatibility handling through D0 for command help, JSON/human output,
   generator schema, exports, docs/examples, scripts, Nx targets, and generated
   surfaces.
6. Validation gates: generator unit tests, Nx generator dry-run command records,
   `habitat classify` over generated diff/paths, owning package `check`, owning
   package `test` where relevant, `habitat:check`, recipe compilation or closest
   current recipe gate, and refusal tests for invalid topology choices.
7. Explicit support boundaries for runtime game behavior, CI/Graphite readiness,
   and host policy unless those are separately owned and accepted.

## Implementation Write Set

This layer records the current refusal fence and keeps product docs aligned with
the implemented surface. The allowed write set is limited to:

- `$HABITAT_TOOL/docs/SCENARIOS.md`;
- `$HABITAT_TOOL/docs/IMPLEMENTED-SURFACE.md`;
- `$HABITAT_TOOL/docs/CAPABILITIES.md`;
- `$D0_MATRIX` for documentation or script-name compatibility corrections only;
- `$D14_CHANGE/**` workstream and spec records.

Protected paths:

- MapGen source under `$REPO_ROOT/mods/**` and `$REPO_ROOT/packages/mapgen-core/**`;
- active generated artifacts;
- lockfiles;
- D8 pattern registration implementation;
- D9 apply transactions;
- D10 protected-zone implementation;
- D12 verify implementation;
- D13 scaffold implementation beyond authoring-refusal citation unless D13's
  own source packet is active and D0 rows exist.

## Validation Model

Design-time gates:

| Gate | Expected state | Non-claim |
| --- | --- | --- |
| `bun run openspec -- validate deep-habitat-d14-authoring-topology-fence --strict` | passes | OpenSpec shape only. |
| `bun run openspec:validate` | passes | Corpus shape only. |
| `git diff --check` | passes | Whitespace only. |
| Complete-standard wording/stale-status audit over `$D14_CHANGE/**`, `$REMEDIATION_DIR/packet-index.md`, `$REMEDIATION_DIR/context.md`, and `$AGENT_SCRATCH/domino-D14-*.md` | no active forbidden wording and no stale D14 acceptance status | Control-surface sanity only. |
| Final rereview lanes | no unresolved P1/P2 findings | Design/specification acceptance only. |

Later implementation gates:

| Gate | Expected state | Non-claim |
| --- | --- | --- |
| `bun run --cwd tools/habitat-harness test -- test/generators/project-generator.test.ts` | covers supported scaffolds plus unsupported authoring refusals and no-write behavior | Generator unit tests do not prove MapGen authoring support. |
| Supported uniform project dry-run | exits 0 and lists only supported project shell paths | Does not create recipe/domain/op/stage/step topology. |
| D13 unsupported scaffold fixture | unsupported project kinds refuse before writes with an empty write set and recovery that does not claim authoring support | Does not implement future Authoring Topology. |
| `bun run habitat classify mods/mod-swooper-maps/src/recipes/standard` | orients existing recipe paths and reports bounded D4 facts | Does not prove authoring readiness. |
| D13 refusal tests | authoring request cannot route to generic project or pattern scaffold | Does not prove D13 source implementation unless D0 rows and live D13 work exist. |

## Downstream Realignment

- D13 consumes D14 authoring-specific blocked action language and future
  criteria; D13 remains the generic refusal-envelope owner.
- D4's example corpus is consumed only as orientation/non-support context.
- D12's examples are consumed only as verify handoff limits.
- Existing Habitat docs (`GAPS.md`, `AUTHORING-NEXT.md`, `SCENARIOS.md`,
  `IMPLEMENTED-SURFACE.md`) are current-state evidence and later source
  realignment surfaces.
- Packet index must keep D14 blocking until findings are repaired, validation
  records agree, and the current source-neutral boundary is verified. After
  acceptance, D14 still does not implement MapGen authoring.

## Non-Claims

- D14 does not implement Authoring Topology.
- D14 does not create or authorize MapGen domain/op/stage/step/recipe
  generators.
- D14 does not make generic Habitat depend on Civ or MapGen authoring semantics.
- D14 does not make D4 classify, D12 verify, D13 scaffolding, D8 pattern
  registration, G-HOST, or D10 protected-zone facts sufficient for authoring
  readiness.
- D14 does not authorize source implementation without concrete D0 rows and the
  live upstream facts named in this packet.
