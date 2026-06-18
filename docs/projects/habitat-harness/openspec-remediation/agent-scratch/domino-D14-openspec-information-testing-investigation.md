# D14 OpenSpec / Information / Testing Investigation

Review lane: OpenSpec, information design, testing design.

Objective: determine whether D14 Authoring Topology Fence is a complete executable design/specification packet rather than an incomplete control shell or documentation backfill.

Verdict: D14 is not acceptable. The packet has the expected file shape and passes OpenSpec validation, but it still reads as an incomplete control shell. It leaves D14's core design choices to a future executor: unsupported action inventory, future acceptance criteria, D13 refusal wording, D4/D12/D13 handoff consumption, write/protected set, public-surface disposition, validation oracles, downstream realignment, and closure state.

## Evidence Read

- D14 change root: `$OPENSPEC_CHANGES/deep-habitat-d14-authoring-topology-fence/**`.
- D14 source packet: `$PHASE2_PACKET_DIR/D14-authoring-topology-fence.md`.
- Remediation context and packet index: `$REMEDIATION_DIR/context.md`, `$REMEDIATION_DIR/packet-index.md`.
- Accepted dependency surfaces: `$D4_CHANGE/**`, `$D12_CHANGE/**`, `$D13_CHANGE/**`, with focus on D14 handoffs.
- Workstream references: `source-map.md`, `phase-loop.md`, `artifact-contracts.md`, `team-and-review-lanes.md`, `validation-checks.md`.

Commands run:

| Command | Result | What It Proves | Non-Claim |
| --- | --- | --- | --- |
| `bun run openspec -- validate deep-habitat-d14-authoring-topology-fence --strict` | exit 0; change is valid | D14 has valid OpenSpec shape. | Does not prove packet completeness, design closure, or implementation readiness. |
| `bun run openspec:validate` | exit 0; 249 passed, 0 failed | Whole OpenSpec corpus validates structurally. | Does not prove D14 imported source-packet requirements or dependency handoffs. |

## P1 Findings

| ID | Finding | Evidence | Required Repair |
| --- | --- | --- | --- |
| D14-OIT-P1-1 | D14 is explicitly still an incomplete blocking packet, not an accepted executable design/specification packet. | `proposal.md:5-9` says it converts the D14 domino into an incomplete OpenSpec packet; `phase-record.md:14-20` requires future review before authorization; `review-disposition-ledger.md:10` records a P1 blocking pending design-time review; packet index marks D14 incomplete and blocking at `packet-index.md:34`. | Rebuild D14 as the actual fence/refusal packet, then replace the review ledger placeholder with lane-specific findings and dispositions. No implementation should consume D14 while this row remains blocking. |
| D14-OIT-P1-2 | The D14 source packet's core gate families were not converted into normative design/spec content. | Source requires explicit unsupported authoring actions, future acceptance criteria, refusal examples, and downstream deferral record (`D14 source:36-40`, `84-92`). Current `design.md:22-27` only repeats generic bullets, and `spec.md:3-13` has one broad requirement with two generic scenarios. | Add closed sections for unsupported action inventory, future acceptance criteria, D13 refusal examples, downstream deferral/trigger record, and non-claims. Encode those as OpenSpec requirement families with scenarios. |
| D14-OIT-P1-3 | D13 remains blocked because D14 does not supply the early-fence language D13 needs. | D13 says Authoring Topology requests ask for recipe/domain/op/stage/step/contract/default/schema/registry/Studio topology and must refuse before writes using D14 language (`D13 design.md:100`, `175-179`; `D13 spec.md:83-98`). D14 only says "Convert unsupported authoring requests into D13 refusal criteria" (`proposal.md:28`, `tasks.md:15`) and never names the blocked actions, refusal reason, owner language, recovery instruction, retry condition, or no-write outcome. | Define D14-owned blocked-action language for every authoring request class D13 names and provide the exact refusal projection D13 must cite. |
| D14-OIT-P1-4 | D4 and D12 handoffs are acknowledged but not consumed. | D4 requires D14 to consume exact examples for `project-path`, `workspace-path`, `diff`, `malformed-or-pathless-diff`, `unresolved-owner`, `graph-refusal`, unavailable targets, D2 unresolved routing, and authoring-looking unsupported requests (`D4 spec.md:141-150`; `D4 design.md:199-218`). D12 limits D14 to target receipt terms, explicit non-claims, approved examples, outcome states, and stop conditions (`D12 design.md:332-342`; `D12 spec.md:183-186`). D14 has no dependency consumption matrix and no example corpus table. | Add a D4/D12/D13 dependency consumption matrix that names each consumed artifact, allowed use, forbidden inference, and exact D14 requirement/scenario that consumes it. |
| D14-OIT-P1-5 | Validation gates are command lists, not falsifying oracles. | Source packet requires expected exits, fresh cache stance, injected bad case, and non-claims (`D14 source:116-128`). Current `proposal.md:73-78`, `tasks.md:18-23`, and `phase-record.md:22-27` list commands without expected status, bad case, cache stance, or exact assertions. `bun run habitat classify mods/mod-swooper-maps/src/recipes/standard` can pass without proving D14 refusal behavior. | Replace command lists with a validation matrix: gate, expected status, oracle, bad case, cache/freshness stance, and non-claims. Include the injected MapGen Authoring Topology request. |

## P2 Findings

| ID | Finding | Evidence | Required Repair |
| --- | --- | --- | --- |
| D14-OIT-P2-1 | Write set, protected paths, and public-surface impact are deferred to implementation. | `proposal.md:52-53` points to `design.md`, but `design.md:47-53` says the executor must have a concrete write/protected list before implementation; `tasks.md:9` asks the executor to record it. Consumer impact is only "refusal/guidance language may change" (`proposal.md:63-65`). | Packet owner must define OpenSpec repair write set, later source write set, protected paths, D0 public surfaces, and docs/test surfaces before acceptance. |
| D14-OIT-P2-2 | Durable artifacts use brittle absolute/stale operational paths and lack D14 context variables. | Context says packet artifacts should reference variables instead of worktree paths (`context.md:3-5`, `289-298`). D14 proposal hardcodes the worktree path at `proposal.md:14-19`; phase record hardcodes worktree/source paths and stale branch `codex/deep-habitat-openspec-remediation` at `phase-record.md:7-9`; context has D13 variables but no D14 variable block (`context.md:248-267`). | Add D14 variables to `$REMEDIATION_DIR/context.md` and rewrite durable D14 refs to `$D14_CHANGE`, `$D14_SOURCE_PACKET`, `$REMEDIATION_DIR`, and `$PHASE2_PACKET_DIR` references. Also update `$ACTIVE_REMEDIATION_BRANCH`, currently stale at `context.md:16`. |
| D14-OIT-P2-3 | Downstream realignment is placeholder state, not a real ledger. | `downstream-realignment-ledger.md:5-9` has every row pending and does not name D13, D4, D12, `AUTHORING-NEXT.md`, deferral record, D0 rows, packet index status, or exact patch/no-patch disposition. | Replace with patch/no-patch/blocked/deferred rows for D13, D4 example corpus, D12 handoff language, D0 compatibility, Habitat docs/examples, tests/fixtures, packet index, and future deferral trigger. |
| D14-OIT-P2-4 | Task sequencing makes review/realignment post-implementation cleanup. | `tasks.md:12-16` puts implementation before `tasks.md:25-31` review and realignment, while packet index says per-domino review is design-time and implementation cannot start from a blocking review ledger (`packet-index.md:37-49`). | Move all packet review/disposition and dependency consumption before any source-facing implementation task. |
| D14-OIT-P2-5 | Product scenario is missing the concrete reader task. | Source scenario says an agent asks Habitat to create MapGen authoring topology and Habitat refuses/routes because current Habitat owns structural orientation, enforcement, validation, guarded repair, and refusal, not domain-specific authoring (`D14 source:9-14`). D14 current scenario says future ambitions must not route MapGen authoring topology through generic structural scaffolding (`proposal.md:21-23`, `design.md:17-19`). | State the concrete reader scenario: exact request classes, who receives the refusal, what the refusal says, what can be retried, and which future product investigation owns acceptance. |

## P3 Findings

| ID | Finding | Evidence | Suggested Repair |
| --- | --- | --- | --- |
| D14-OIT-P3-1 | Some wording is colorful or temporal instead of operational. | "route MapGen authoring topology through generic structural scaffolding" (`proposal.md:23`, `design.md:18`) and "No new authoring domain model in Phase 3" (`proposal.md:34`, `design.md:31`) require stable command-facing contract language. | Replace with stable operational language: "do not route authoring topology requests through generic scaffolding" and "no authoring model is introduced by D14." |
| D14-OIT-P3-2 | Verification commands are formatted inconsistently. | `proposal.md:75-76` and `phase-record.md:24-27` mix unquoted commands and backticked commands. | Use consistent backticked commands in all packet artifacts. |

## Missing Artifact Sections

D14 needs these sections before it can be considered a complete packet:

1. Authority and variable map using `$D14_CHANGE`, `$D14_SOURCE_PACKET`, `$D4_CHANGE`, `$D12_CHANGE`, `$D13_CHANGE`, and `$REMEDIATION_DIR`.
2. Concrete product scenario with the actor request, command/generator surface, refusal recipient, owner, recovery, retry condition, and non-claims.
3. Unsupported authoring action inventory covering recipe, domain, operation, stage, step, contract, default, schema, registry, Studio, MapGen authoring files, and authoring generator requests.
4. D13 early-fence refusal language: blocked action, request class, reason `authoring-topology-owned`, owning authority, recovery instruction, retry condition, empty write set, and non-claims.
5. Future acceptance criteria: product convention, target topology, generator dry-run/result records, classify/check command records, compile result, public-surface disposition, DRA/product acceptance, and deferral trigger.
6. D4/D12/D13 dependency consumption matrix with allowed use and forbidden inference.
7. D0 public-surface table for generator schema/help/error text, command JSON/human output, docs/examples, package exports, tests, and any generated help/manifest surface touched.
8. OpenSpec repair write set, later source write set, protected paths, and generated/lockfile prohibition.
9. Validation matrix with exact expected outcomes, bad cases, cache/freshness stance, and non-claims.
10. Downstream realignment ledger with patch/no-patch/blocked/deferred disposition and exact next action.
11. Closure state separating design/specification acceptance from later source implementation closure.

## Proposed OpenSpec Requirement Families

Add these requirement families under `$D14_CHANGE/specs/habitat-harness/spec.md`:

| Requirement Family | Required Scenarios |
| --- | --- |
| Authoring Topology Requests Are Closed No-Write Refusals | recipe/domain/op/stage/step/contract/default/schema/registry/Studio request; MapGen authoring file request; authoring generator request; malformed mixed scaffold/authoring request. |
| D13 Consumes D14 Early-Fence Language | D13 parses `AuthoringTopologyRequest`; refusal has `authoring-topology-owned`; refusal names D14/future owner; write set is empty; no MapGen/Studio files are written. |
| D4 Examples Are Guidance Only | authoring-looking path classifies/orients; D14 uses example for non-support messaging; D14 does not infer generator support, MapGen authoring support, rule correctness, target freshness, apply safety, or verify closure. |
| D12 Verify Handoff Does Not Open Authoring | D14 cites only receipt terms/outcome states/non-claims; verify success does not imply authoring readiness, product approval, CI, or runtime behavior. |
| Future Acceptance Requires A Separate Authority Packet | future authoring opens only after accepted product convention, target topology, generator dry-run/result records, classify/check command records, compile result, public-surface disposition, and product/DRA acceptance. |
| Public Surface Changes Require D0 Disposition | any changed generator schema/help/error/docs/export/test surface cites concrete D0 rows before source edits. |
| D14 Deferral Is Durable And Triggered | downstream deferral record names trigger, owner, non-trigger states, and exact future packet entry criteria. |

## Validation Matrix Recommendations

| Gate | Expected Status | Oracle | Bad Case | Cache/Freshness | Non-Claims |
| --- | --- | --- | --- | --- | --- |
| `bun run openspec -- validate deep-habitat-d14-authoring-topology-fence --strict` | 0 for design closure | D14 spec/proposal/tasks shape validates after requirement families are added. | Missing D13 refusal scenario or D4/D12 consumption scenario fails validation/review. | Not applicable. | Does not test source behavior. |
| `bun run openspec:validate` | 0 for design closure | Whole OpenSpec corpus remains structurally valid. | D14 conflicts with D4/D12/D13 accepted requirements. | Not applicable. | Does not prove D14 is implemented. |
| D14 wording/control audit | no active forbidden wording and no stale D14 acceptance status | No active incomplete-packet/backfill/forbidden wording, no hardcoded worktree paths in durable docs, no stale branch references. | Any wording that presents D14 as an incomplete control shell after acceptance, or any absolute `$ACTIVE_REMEDIATION_WORKTREE` duplication, blocks acceptance. | Not applicable. | Does not prove command behavior. |
| D13 authoring-topology refusal unit/fixture after D14 acceptance | nonzero/no-write for authoring requests | Refusal contains D14 owner/recovery/retry/non-claims and no MapGen/Studio files are written. | Injected MapGen Authoring Topology implementation request routes to scaffold/write behavior. | Fresh run; assert worktree unchanged. | Does not implement Authoring Topology. |
| D4 classify example consumption | scenario-specific | D14 references D4 example states only for non-support messaging. | Classify orientation is treated as generator or authoring support. | Use D4 accepted examples; do not invent local classify semantics. | Does not prove rule correctness, target freshness, apply safety, or verify closure. |
| D12 verify handoff consumption | scenario-specific | D14 cites only D12 receipt terms, outcome states, and non-claims. | Verify success opens authoring readiness or product acceptance. | Use D12 accepted examples only after D0/D1 approval. | Does not prove CI, root `bun run verify`, product approval, Graphite readiness, runtime behavior, or Authoring Topology acceptance. |
| `git diff --check` | 0 before closure | Patch hygiene. | Whitespace or patch formatting defect. | Not applicable. | Does not prove design correctness. |

## Wording Audit Findings

The original D14 disk state contained forbidden wording and stale control language before the repair pass:

- The old incomplete-packet maturity phrase in `proposal.md:7`, `phase-record.md:14`, and review ledger rows `5-9` signals incomplete artifact maturity.
- `review-disposition-ledger.md:10` correctly says per-domino review is blocking; therefore proposal/design language claiming resolution is overstated until repaired.
- "Before implementation starts, the executor must have" in `design.md:47` and "Record the concrete write set" in `tasks.md:9` defer packet-owner responsibilities.
- Durable path references hardcode the active worktree in `proposal.md:14-19` and `phase-record.md:7-9`; context explicitly requires variables.
- The forbidden shortcut terms at `proposal.md:60-61` are acceptable because they are listed as prohibited strategy, not authorized approach.

## Acceptance Recommendation

Do not accept D14. It is structurally valid OpenSpec, but it is still an incomplete packet and a review placeholder. Under the stated stop condition, D14 remains blocked because it leaves implementation-time design choices for the fence/refusal contract, dependency handoffs, write set, public-surface impact, validation oracles, and downstream realignment.

D14 can be reconsidered only after the packet itself, not a future executor, supplies the unsupported action inventory, D13 early-fence refusal language, future acceptance criteria, D4/D12/D13 consumption matrix, concrete write/protected set, D0 public-surface table, validation matrix, downstream realignment, and final review disposition with no unresolved P1/P2 findings.
