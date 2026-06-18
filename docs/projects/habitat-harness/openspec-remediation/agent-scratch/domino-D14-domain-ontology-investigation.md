# D14 Domain/Ontology Investigation

Fresh adversarial review of D14 Authoring Topology Fence for Deep Habitat OpenSpec remediation.

## Findings

### P1: No open domain/ontology blocker on the five stop-condition dimensions

The current D14 packet now specifies the Authoring Topology fence language, ownership, unsupported action model, future acceptance criteria, and D13 refusal handoff.

Evidence:

- D14 frame and acceptance threshold define the product boundary and explicitly prevent current Habitat generators/classify/verify/guardrails from being overread as authoring capability: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:5`, `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:15`.
- Ownership is split cleanly: D14 owns blocked-action language, future criteria, recovery semantics, and non-claims; future Authoring Topology owns any accepted MapGen authoring generator/topology/product loop; D13/D4/D12/D8/G-HOST relations are consumers or adjacent owners, not substitute authorities: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:17`, `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:28`.
- D14-specific accepted/rejected language is present and rejects inherited/lazy terms such as `topology scaffold`, `generator proof` as target code/type language, `authoring-ready classify result`, and `verify proves authoring`: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:29`, `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:42`.
- Unsupported authoring action inventory is explicit and closed enough for implementation: recipe, domain, operation, stage, step, contract/default/schema bundle, registry/public-surface update, Studio artifact update, and broad topology migration all refuse through the D13 envelope with D14 owner: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:44`, `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:65`.
- D14 prevents MapGen/Civ authoring concepts from becoming generic Habitat taxonomy by scoping the inventory to authoring-specific requests and leaving generic unsupported project kinds to D13/D0/D2/G-HOST unless the request also asks for MapGen authoring topology: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:62`, `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:65`.
- State-space model collapses the prose gap into `not-authoring`, `authoring-request`, `ambiguous-authoring-request`, and `future-authoring-opened`, with explicit invariants and empty write sets for refusals: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:67`, `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:93`.
- D13 handoff is concrete: D14 supplies `blocked_action`, `request_class`, `reason`, `owning_authority`, `recovery_instruction`, `retry_condition`, empty `write_set`, and `non_claims`: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:95`, `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:109`.
- Future acceptance criteria are explicit and require current topology investigation, target topology model, vertical slice, generator write contract, D0 handling, validation gates, and non-claims: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:111`, `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:137`.
- Normative OpenSpec scenarios carry the same boundary into requirements for fenced requests, D13 refusal language, future criteria, and non-implementation acceptance: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/specs/habitat-harness/spec.md:3`, `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/specs/habitat-harness/spec.md:113`.
- Tasks now show the key domain/specification repairs as completed and keep final review/validation open: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/tasks.md:18`, `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/tasks.md:50`.

Recommendation: no P1 domain/ontology finding remains against the current design/spec/tasks state.

### P2: Workstream ledgers still lag the repaired D14 contract

The packet's durable control records still carry old scaffold/generic language and stale state even though proposal/design/spec/tasks have been repaired.

Evidence:

- The downstream ledger remains generic and pending for "Habitat docs/examples", "Tests and command fixtures", and "Later domino packets"; it does not record the exact downstream surfaces now named by D14 design, including D13 consumption, D4/D12 non-support examples, Habitat docs, and packet-index status: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/workstream/downstream-realignment-ledger.md:5`, `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/workstream/downstream-realignment-ledger.md:9`.
- The repaired design names downstream realignment more precisely: D13 consumes D14 authoring-specific language, D4/D12 are only context/non-claim examples, Habitat docs are evidence and later realignment surfaces, and packet index must keep D14 blocking until repairs/rereviews pass: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:188`, `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:199`.
- The phase record still says the branch is `codex/deep-habitat-openspec-remediation`, uses old scaffold wording, and lists `classify` as an exact validation gate without the repaired non-support context now present in design: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/workstream/phase-record.md:5`, `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/workstream/phase-record.md:27`.
- The active context now records the correct D14 branch and variables, so the phase-record branch literal is stale relative to the current remediation fixture: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/context.md:15`, `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/context.md:16`, `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/context.md:269`, `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/context.md:288`.

Required repair: update `$D14_DOWNSTREAM_LEDGER` and `$D14_PHASE_RECORD` to match the repaired proposal/design/spec/tasks before claiming packet closure. This is a control-record repair, not a domain-language blocker.

### P2: Review disposition ledger has not yet imported this first-wave finding set

The D14 review ledger still contains only global constraints and a pending per-domino adversarial review gate:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/workstream/review-disposition-ledger.md:3`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/workstream/review-disposition-ledger.md:10`

That matches `tasks.md`, which explicitly leaves first-wave import, accepted P1/P2 repair, wording audit, final rereviews, and blocking status open:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/tasks.md:36`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/tasks.md:50`

Required repair: import this review as the D14 domain/ontology first-wave result, record "no open P1 domain/ontology blocker; P2 control-record repairs required", and keep final rereview pending until all first-wave lanes and validation pass.

### P3: `generator proof` rejection should not obscure the source packet's proof-class intent

D14 correctly rejects `generator proof` as target code/type language:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:39`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:40`

The source packet, however, uses "generator proof" as one future acceptance proof class:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D14-authoring-topology-fence.md:61`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D14-authoring-topology-fence.md:62`

This is not blocking because D14 replaces the broad phrase with concrete acceptance gates: generator tests, Nx dry-run records, generated diff/path classification, package checks/tests, `habitat:check`, and recipe compilation or nearest accepted recipe gate.

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:131`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:134`

Recommended cleanup: if the wording audit flags the phrase, document that D14 rejects `generator proof` only as implementation-facing target language while preserving the source packet's intended proof class through concrete gate names.

## Accepted Terminology Recommendations

Accept:

- `Authoring Topology Fence`: current D14 boundary for authoring-specific blocked actions, future criteria, recovery semantics, and non-claims.
- `future Authoring Topology`: later product layer for accepted MapGen authoring generators and topology model.
- `authoring request`: request to create or modify MapGen recipe/domain/operation/stage/step topology or adjacent registries/artifacts.
- `blocked authoring action`: closed current unsupported write/routing action.
- `authoring refusal`: D13 scaffold refusal populated with D14-owned fields.
- `future acceptance criteria`: required later acceptance threshold, not aspirational prose.
- `ambiguous-authoring-topology-request`: safe refusal state for authoring-looking requests that cannot be classified into a supported D13 scaffold contract.

Constrain:

- `MapGen`, `recipe`, `domain`, `operation`, `stage`, `step`, `contract`, `default`, `schema`, `registry`, `public surface`, `Studio artifact`: valid only as D14 authoring-specific unsupported/future-authoring terms, not generic Habitat taxonomy.
- `generator`: valid for current Nx command mechanics and future accepted authoring generators; current D13 project/pattern generators do not imply authoring capability.
- `proof`: use concrete gate names rather than broad target-language nouns.
- `classify` and `verify`: D4/D12 facts can be consumed as orientation/handoff context only, not authoring readiness.

Reject:

- `topology scaffold`
- `authoring-ready classify result`
- `verify proves authoring`
- `generator proof` as target code/type language
- Civ/MapGen authoring nouns as generic Habitat authority
- using G-HOST, D10, D4, D12, D8, or D13 to redefine Authoring Topology support

## Required Repairs

1. Update `$D14_DOWNSTREAM_LEDGER` with exact D13/D4/D12/docs/packet-index realignment rows from the repaired design.
2. Update `$D14_PHASE_RECORD` to use current remediation variables or current branch metadata and to reflect the repaired validation split.
3. Import this first-wave domain/ontology review into `$D14_REVIEW_LEDGER`.
4. Keep D14 blocking until the remaining first-wave lanes, wording/stale-status audit, OpenSpec validations, and final rereviews pass.

## Acceptance Recommendation

Domain/ontology acceptance: acceptable with no open P1 blockers on the requested stop-condition dimensions.

Packet closure acceptance: not yet acceptable until the P2 control-record repairs are made and D14's remaining review/validation tasks complete. The packet should remain blocking in the remediation index until the review ledger records all first-wave dispositions, final rereviews, and validation results.

Skills used: domain-design, information-design, ontology-design, solution-design, civ7-open-spec-workstream.
