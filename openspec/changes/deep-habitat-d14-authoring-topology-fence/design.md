# Design: D14 Authoring Topology Fence

## Frame

D14 is the product fence between Habitat's current repo-local structural
substrate and future MapGen Authoring Topology. The solution space is rugged:
Habitat already has generators, classification, verification, Pattern
Governance, and guardrails, so it is easy for implementation to overread those
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
| D8 relation | D8 owns Pattern Governance admission; registered rule health is not authoring workflow support. |
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

Later implementation must collapse the current prose gap inside D13's generic
scaffold/refusal envelope. D14 does not introduce an independent command request
model. D14 supplies the authoring-specific vocabulary and refusal facts that
D13 uses when it parses authoring-looking creation requests.

```ts
type D14BlockedAuthoringAction =
  | "create-mapgen-recipe"
  | "create-mapgen-domain"
  | "create-domain-operation"
  | "create-recipe-stage"
  | "create-recipe-step"
  | "create-step-contract-default-schema"
  | "update-authoring-registry-or-public-surface"
  | "update-studio-recipe-artifact"
  | "migrate-mapgen-authoring-topology";

type D14AuthoringRequestSurface =
  | "project-generator"
  | "pattern-generator"
  | "classify"
  | "verify"
  | "docs-or-example"
  | "ambiguous-user-request";

type D14AuthoringSignal =
  | "recipe"
  | "domain"
  | "operation"
  | "stage"
  | "step"
  | "contract"
  | "default"
  | "schema"
  | "registry"
  | "studio-artifact"
  | "mapgen-authoring-flow";

type D14AuthoringFenceFact =
  | {
      kind: "d14-authoring-refusal-fact";
      requestClass: "authoring-topology-request";
      blockedAction: D14BlockedAuthoringAction;
      sourceSurface: D14AuthoringRequestSurface;
    }
  | {
      kind: "d14-ambiguous-authoring-refusal-fact";
      requestClass: "ambiguous-authoring-topology-request";
      matchedSignals: readonly [D14AuthoringSignal, ...D14AuthoringSignal[]];
      sourceSurface: D14AuthoringRequestSurface;
    };
```

Required invariants:

- D13 parses authoring-looking creation requests into its accepted
  `AuthoringTopologyRequest` or malformed/ambiguous scaffold request state using
  D14's closed vocabulary above.
- D14's `d14-ambiguous-authoring-refusal-fact` is a terminal refusal fact with
  an empty write set; it cannot route to supported project or pattern scaffolds
  through local heuristic fallback.
- Non-authoring requests remain in D13's supported scaffold, pattern candidate,
  classify, or verify flows and cannot carry D14 blocked authoring actions.
- Future Authoring Topology support is an upstream acceptance condition, not a
  Phase 3 runtime variant. It is unreachable until a later accepted authority
  supplies the change id, topology model, generator write contract, D0 rows, and
  validation gates.
- Dispatch over the D14 blocked action and signal vocabulary is exhaustive.

This is a TypeScript state-space reduction: "maybe this scaffold can author
MapGen topology" becomes either a D13-supported non-authoring flow or a
D13 refusal populated with D14-owned facts, instead of a free-form option,
boolean, thrown string, or second request parser.

## Authoring Refusal Fields For D13

D14 provides the authoring-specific values that D13 inserts into the generic
`scaffold refusal` shape:

| D13 field | D14 value contract |
| --- | --- |
| `blocked_action` | One `D14BlockedAuthoringAction` from the inventory above. |
| `request_class` | `authoring-topology-request` or `ambiguous-authoring-topology-request`. |
| `reason` | `authoring-topology-owned` until a later accepted authoring project opens implementation. |
| `owning_authority` | `D14` for the fence; `future Authoring Topology` for implementation. |
| `recovery_instruction` | Use supported Habitat structural tools, or open a future Authoring Topology investigation against the criteria below. |
| `retry_condition` | Accepted future Authoring Topology packet with topology model, generator write contract, D0 compatibility rows, and executable acceptance loop. |
| `write_set` | Empty. |
| `non_claims` | Refusal does not implement authoring, certify MapGen behavior, certify runtime game behavior, certify verify readiness, or register generated artifacts. |

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
7. Non-claims for runtime game behavior, CI/Graphite readiness, and host policy
   unless those are separately owned and accepted.

## Write Set For Later Source Implementation

This remediation packet authorizes no source edits. If Phase 3 later implements
D14/D13 refusal behavior, the allowed write set is limited to:

- `$HABITAT_TOOL/src/generators/project/generator.cjs`;
- `$HABITAT_TOOL/src/generators/project/schema.json` only if D0 rows accept
  public schema/help wording changes;
- `$HABITAT_TOOL/test/generators/project-generator.test.ts`;
- `$HABITAT_TOOL/docs/GAPS.md`;
- `$HABITAT_TOOL/docs/AUTHORING-NEXT.md`;
- `$HABITAT_TOOL/docs/SCENARIOS.md`;
- `$HABITAT_TOOL/docs/IMPLEMENTED-SURFACE.md`;
- `$D13_CHANGE/**` only for downstream D13 citation/realignment, not redesign;
- `$D14_CHANGE/**` and D14 scratch/final review records.

Protected paths:

- MapGen source under `$REPO_ROOT/mods/**` and `$REPO_ROOT/packages/mapgen-core/**`;
- active generated artifacts;
- lockfiles;
- D8 Pattern Governance implementation;
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
| D13 authoring refusal fixture | request text such as `generate a MapGen recipe with a new domain operation and recipe stage` parses to D13 authoring refusal populated with D14 blocked action, owner, recovery, retry, empty write set, and support boundary | Does not implement future Authoring Topology. |
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
- Packet index must keep D14 blocking until first-wave findings are repaired,
  final rereviews pass, and validation records agree. After acceptance, D14 is
  design/specification only, not implementation-complete.

## Non-Claims

- D14 does not implement Authoring Topology.
- D14 does not create or authorize MapGen domain/op/stage/step/recipe
  generators.
- D14 does not make generic Habitat depend on Civ or MapGen authoring semantics.
- D14 does not make D4 classify, D12 verify, D13 scaffolding, D8 Pattern
  Governance, G-HOST, or D10 protected-zone facts sufficient for authoring
  readiness.
- D14 does not authorize source implementation without concrete D0 rows and the
  live upstream facts named in this packet.
