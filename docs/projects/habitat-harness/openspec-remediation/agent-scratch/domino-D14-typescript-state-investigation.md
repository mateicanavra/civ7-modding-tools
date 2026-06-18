# D14 TypeScript State Investigation

## Verdict

**Acceptance recommendation: approved with changes.**

The current D14 packet now specifies the future implementation model well enough for the main TypeScript state-space objective: current Habitat must not preserve the ambiguous state "generic scaffold/orientation/verify/pattern tools imply MapGen authoring support." D14 now names the product boundary, unsupported authoring action inventory, D13 refusal field values, future acceptance criteria, write set, protected paths, D4/D12/D13 consumption limits, and non-claims.

The remaining findings are not "build a bigger authoring type system." They are the opposite: tighten the few invented helper states and validation placeholders so later implementation cannot create a parallel D14 request model beside D13 or choose vague test fixtures later.

## State-Space Smell D14 Collapses

The smell is optional/prose state around authoring support:

- `classify` can orient MapGen paths, so an agent might infer authoring support.
- D13 can scaffold generic projects and pattern candidates, so an agent might route MapGen recipe/domain/stage/step generation through generic scaffolding.
- D12 can emit verify/handoff records, so a future packet might overread verify success as product readiness.
- Existing docs contain future authoring aspirations, so a later implementation might treat roadmap prose as accepted current capability.

D14's repaired packet mostly collapses that into a closed refusal/future-work state:

- authoring-like creation requests refuse before writes through D13;
- current generic workflows stay `not authoring`;
- D4 orientation and D12 verify are compatibility/context facts only;
- future authoring opens only after accepted topology investigation, target model, vertical slice, write contract, D0 handling, validation matrix, and non-claims.

## P1 Findings

No unresolved P1 after the current packet repair. The earlier blockers around missing unsupported-action inventory, missing future criteria, missing D13 refusal fields, missing write set, and missing protected paths have been addressed in the on-disk packet.

## P2 Findings

### P2: The proposed D14-owned request union introduces a parallel request model with undeclared helper types

Evidence:

- D14 already says D13 owns the generic scaffold request/refusal envelope at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:23`.
- D13 already defines `AuthoringTopologyRequest` inside the closed `ScaffoldingRequest` model at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/design.md:72`.
- D14 then adds a separate D14-owned request union with `not-authoring`, `authoring-request`, `ambiguous-authoring-request`, and `future-authoring-opened` variants at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:72`.
- That model references `BlockedAuthoringAction`, `AuthoringRequestSurface`, and `AuthoringSignal`, but the packet does not define these as closed literal sets.

Why this matters:

The state-space reduction should land in D13's request/decision union, with D14 supplying authoring-specific refusal facts. A second D14-owned request model risks becoming new type machinery with unclear ownership: does D13 parse to `ScaffoldingRequest` first, or D14 parse to another request union first? Where does `not-authoring` live? Who owns `future-authoring-opened`? Those states may be useful as explanatory design language, but they should not become a separate TypeScript implementation requirement unless D14 defines the missing helper unions and the integration point with D13.

Recommended repair:

- Replace the D14-owned request union with "Later D13 implementation must parse authoring-looking creation requests into D13 `AuthoringTopologyRequest` or `MalformedScaffoldRequest`, using D14's closed blocked-action and signal vocabulary."
- Define `BlockedAuthoringAction` as a literal vocabulary matching the inventory rows, or state that `blocked_action` is a stable string from the inventory table.
- Define `AuthoringSignal` as a closed list only if implementation truly needs signal-level reporting; otherwise remove it.
- Treat `future-authoring-opened` as an upstream acceptance condition, not a Phase 3 runtime variant.

### P2: Later implementation gates still leave the authoring bad-case fixture shape to the implementer

Evidence:

- D14 proposal requires supported uniform generator dry-runs plus an authoring refusal fixture at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/proposal.md:139`.
- D14 design says the D13 authoring refusal fixture should exit through D13/D14 refusal at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:184`.
- D14 tasks say to add/repair tests for "unsupported authoring-looking requests" if source behavior changes at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/tasks.md:68`.

Why this matters:

The validation oracle is conceptually right but still not exact. If no current command shape can express "generate MapGen recipe/domain/op/stage/step," say the implementation gate is a unit-level D13 parser/refusal fixture. If a current generator dry-run is the intended public route, name the exact command and expected output. Otherwise, later source work still decides the test surface.

Recommended repair:

- Add one exact bad-case fixture contract. Example: `rawRequest` or generator options containing `"generate MapGen recipe stage step"` must parse to `AuthoringTopologyRequest` and then `RefuseScaffoldDecision`.
- If using an Nx command record, name the exact command. If no command exists, explicitly reject command-based closure and require a unit fixture against the D13 parser/refusal function.
- The oracle should assert: nonzero/refused outcome, D14/future owner, reason `authoring-topology-owned`, empty write set, no MapGen source/registry/generated writes, retry condition naming future Authoring Topology criteria, and D4/D12 non-claims preserved.

## P3 Findings

### P3: `ambiguous-authoring-request` is acceptable only as a closed refusal state

Evidence:

- D14 includes `ambiguous-authoring-request` in the state model at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:76`.
- The spec says ambiguous authoring signals refuse before writes at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/specs/habitat-harness/spec.md:56`.

Why this matters:

The user's objective is to prevent ambiguous states from surviving. This variant is safe only if ambiguity is not a maybe-success state. The packet should say ambiguous authoring requests are terminal refusals with empty write sets, not a state that can later route to generic scaffolding.

Recommended repair:

- Rename or clarify to `ambiguous-authoring-refusal`.
- Require the same refusal fields as `authoring-topology-request`.
- State that ambiguity cannot be resolved by local heuristic fallback during Phase 3.

### P3: MapGen terms are correctly scoped, but keep them out of generic command taxonomy

Evidence:

- D14's inventory is explicitly authoring-specific and says unsupported generic project kinds remain D13/D0/D2/G-HOST compatibility and ownership decisions unless the request also asks for MapGen authoring topology at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:62`.

This is the right direction. Keep it that way in source work: MapGen recipe/domain/op/stage/step words may appear in D14 blocked actions and docs, but they must not become generic `kind` values, generic project-scaffold tags, or broad Habitat command types.

## Target State Model

The target should be D13-first:

```ts
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

D14 should supply closed values for the authoring-specific part:

```ts
type BlockedAuthoringAction =
  | "generate-mapgen-recipe"
  | "generate-mapgen-domain"
  | "generate-domain-operation"
  | "generate-recipe-stage"
  | "generate-recipe-step"
  | "create-step-contract-default-schema"
  | "update-authoring-registry-public-surface"
  | "update-studio-recipe-artifact"
  | "migrate-mapgen-topology";

type AuthoringRequestClass =
  | "authoring-topology-request"
  | "ambiguous-authoring-topology-request";

type AuthoringRefusalReason = "authoring-topology-owned";
```

D14 does not need to implement a standalone authoring module now. A D13 refusal variant plus D14's blocked-action vocabulary, future criteria, docs/deferral record, and validation oracle are sufficient.

## Later Write Set And Protected Paths

The current packet's write set is mostly correct:

- D14/D13 packet and review records for design/specification.
- D13 project generator source/tests only if later D13 source work implements refusal behavior and D0 rows exist.
- Authoring gap docs: `GAPS.md`, `AUTHORING-NEXT.md`, `SCENARIOS.md`, and `IMPLEMENTED-SURFACE.md`.

Keep protected:

- MapGen product/source implementation paths.
- D4 classify and D12 verify source, except consuming examples/non-claims in docs.
- D8 Pattern Governance implementation, D9 apply transactions, D10 protected zones.
- Generated artifacts, lockfiles, and active generated outputs.

## Validation Gates

Design-time gates in the current packet are adequate for packet shape:

- `bun run openspec -- validate deep-habitat-d14-authoring-topology-fence --strict`
- `bun run openspec:validate`
- `git diff --check`
- stale-status/wording audit
- final rereview lanes with no unresolved P1/P2

Later implementation gates need one more concrete fixture definition:

- D13 authoring refusal unit fixture or exact Nx dry-run command.
- Assertions: refused/nonzero, reason `authoring-topology-owned`, owner D14/future Authoring Topology, empty write set, no MapGen writes, retry condition points to future criteria, D4 classify not overclaimed, D12 verify not overclaimed.

## Acceptance Recommendation

Approve D14 after the P2 repairs above. The packet now specifies the product boundary and state-space direction, and it avoids authoring implementation. The remaining work is to tighten the few unclosed type names and fixture placeholders so the implementation lane cannot invent a parallel request model or validation oracle.

Skills used: domain-design, information-design, typescript-refactoring, testing-design.
