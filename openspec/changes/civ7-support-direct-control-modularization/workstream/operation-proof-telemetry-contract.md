# Operation/Proof Telemetry Contract

This is a planning contract for future operation/proof telemetry records. It is
not a source implementation, accepted schema, telemetry persistence layer,
AI-ingestion contract, normal CLI semantic envelope, debug/internal service
contract, runtime proof, or Effect/oRPC procedure-core contract.

The telemetry target exists because mutation-facing direct-control work needs a
stable audit vocabulary across approval, validation, send, post-read, and
postcondition evidence. Future AI-intelligence and procedure-core consumers
need explicit outcome evidence; they must not train, act, or close product
claims from a vague `verified: true` flag.

## Scope

The telemetry record applies to future operation/action audit events produced
from repo-owned direct-control atoms. It is designed to describe an attempted or
candidate action and the proof collected around it. It does not authorize
telemetry persistence, background collection, AI corpus generation, or oRPC
middleware implementation by itself.

Telemetry records should be scoped to the operation, player, and agent-owned
hotseat slot when that evidence exists. Human-turn refusal and pending runtime
proof labels must remain visible when relevant.

## Future Record Slots

Future implementation should converge on a stable record shape with these slots
or direct equivalents:

| Slot | Purpose |
|---|---|
| `recordVersion` | Identifies the telemetry contract version once a schema owner exists. |
| `correlationId` | Links validation, send, post-read, and outcome evidence without exposing it in normal CLI by default. |
| `playerScope` | Records local-player, player, agent-slot, observer, or unknown scope. |
| `strategyIntent` | Optional source-labeled intent from a strategy or player-agent layer. |
| `candidateAction` | Stable action candidate identity before approval or send. |
| `operationFamily` | Direct-control operation family such as unit operation, production, narrative, diplomacy, notification dismissal, turn completion, setup, or autoplay support. |
| `target` | Source-labeled target identity, component id, notification id, location, city, unit, or none. |
| `args` | Bounded, schema-owned operation arguments with sensitive/debug-only internals omitted. |
| `approval` | Approval requirement, approval reason, approver/source, and refusal reason when not approved. |
| `validation_pre` | Validator result before send, including no-send blockers and input/evidence policy. |
| `send_receipt` | Send attempt/result, request family, sent/not-sent status, and transport-independent receipt facts. |
| `post_read` | Readback source used for postcondition evaluation, with source/freshness/evidence labels. |
| `validation_post` | Post-send validator result, including stale/unknown/no-state-change classifications. |
| `postcondition` | Explicit classification, reason, blocker state, no-repeat guidance, and confidence boundary. |
| `outcome_delta` | Source-labeled state change, no-state-change, or unknown outcome evidence. |
| `blocker_delta` | Blocking notification, ready-unit, ready-city, turn, or closeout state change. |
| `evidencePolicy` | Which evidence classes were allowed and which proof classes remain pending. |
| `runtimeObservationLinks` | Optional references to live observations, logs, or resources without treating them as equivalent proof classes. |

## Projection Boundaries

Normal CLI may summarize telemetry as player-agent state-machine status:

- approval required/refused;
- not sent because validation failed;
- sent with explicit postcondition classification;
- stale or unknown with reread/no-repeat guidance;
- concise outcome or blocker delta.

Normal CLI must not dump the full telemetry record by default.

Debug/internal service projection may expose raw telemetry details under a
debug-owned command, flag, or future debug procedure. AI ingestion may consume
telemetry only through an accepted machine contract with source, freshness,
evidence, and scope labels. Procedure cores may attach telemetry hooks only
after typed schema/procedure ownership is accepted.

## Proof Classes

Telemetry must keep these evidence classes separate:

- local package or CLI tests;
- target-thread evidence;
- peer reports;
- repo docs and OpenSpec records;
- official resources;
- logs/database artifacts;
- Tuner/App UI reads;
- live runtime proof;
- in-game observations.

No single record field may collapse those into a generic proof claim. Local
tests can prove construction and projection separation; they do not prove live
runtime behavior.

## Current Owner Seed

`packages/civ7-direct-control/src/proof/operation-telemetry.ts` is the current
internal source owner seed for operation/proof telemetry record slot names, the
TypeScript structural constructor, postcondition sanitization, and normal
summary boundary. Its focused proof owner is
`packages/civ7-direct-control/test/operation-telemetry.test.ts`.

The owner seed keeps approval, validation, send receipt, post-read,
postcondition, outcome delta, blocker delta, evidence policy, and runtime
observation links as separate fields. It deliberately strips legacy `verified`
booleans from the postcondition contract and exposes a normal summary that does
not include raw telemetry/debug slots. The summary keeps status and
no-repeat-after-unverified guidance aligned: sent records without confirmed
postcondition proof, including missing postconditions, unverified confidence,
stale/unknown outcomes, and pending runtime proof, remain no-repeat guarded.
The owner also seeds proof-label guards: non-live boundaries reject
`live-runtime-proof` and `in-game-observation` evidence labels, while
`pending-runtime-proof` remains a pending proof class instead of a live proof
claim.

`packages/civ7-direct-control/src/proof/unit-target-telemetry.ts` is the first
operation-atom adapter owner seed. Its focused proof owner is
`packages/civ7-direct-control/test/unit-target-telemetry.test.ts`. It adapts
one unit-target action result shape into separated telemetry approval,
`validation_pre`, `send_receipt`, `post_read`, `validation_post`,
postcondition, and `outcome_delta` slots while treating the legacy top-level
`verified` boolean as source evidence only.

`packages/civ7-direct-control/src/proof/production-choice-telemetry.ts` is the
second operation-atom adapter owner seed. Its focused proof owner is
`packages/civ7-direct-control/test/production-choice-telemetry.test.ts`. It
adapts one production-choice result shape into separated telemetry approval,
`validation_pre`, `send_receipt`, `post_read`, `validation_post`,
postcondition, `outcome_delta`, `blocker_delta`, and evidence-policy slots
while using `productionPostcondition` as the proof/classification owner. It
treats the legacy top-level `verified` boolean as source evidence only and
keeps missing postcondition, validator-blocked no-send, no-state-change,
production-state-changed-blocker-still-live, `validation-changed`, and pending
runtime proof paths no-repeat guarded.

`packages/civ7-direct-control/src/proof/diplomacy-response-telemetry.ts` is the
third operation-atom adapter owner seed. Its focused proof owner is
`packages/civ7-direct-control/test/diplomacy-response-telemetry.test.ts`. It
adapts one diplomacy-response result shape into separated telemetry approval,
`validation_pre`, `send_receipt`, `post_read`, `validation_post`,
postcondition, `outcome_delta`, `blocker_delta`, and evidence-policy slots
while using the source-owned diplomacy response postcondition as the
proof/classification owner. It treats the legacy top-level `verified` boolean
as source evidence only and keeps missing postcondition, validator-blocked
no-send, `no-state-change`, `validation-changed`, and pending runtime proof
paths no-repeat guarded.

`packages/civ7-direct-control/src/proof/narrative-choice-telemetry.ts` is the
fourth operation-atom adapter owner seed. Its focused proof owner is
`packages/civ7-direct-control/test/narrative-choice-telemetry.test.ts`. It
adapts one narrative-choice result shape into separated telemetry approval,
`validation_pre`, `send_receipt`, `post_read`, `validation_post`,
postcondition, `outcome_delta`, `blocker_delta`, and evidence-policy slots
while using the source-owned narrative choice postcondition as the
proof/classification owner. It treats the legacy top-level `verified` boolean
as source evidence only and keeps missing postcondition, validator-blocked
no-send, `no-state-change`, `validation-changed`, and pending runtime proof
paths no-repeat guarded.

`packages/civ7-direct-control/src/play/notifications/postconditions.ts` is a
notification dismissal source-owner prerequisite for a future adapter, not a
telemetry adapter yet. Its focused proof owner is
`packages/civ7-direct-control/test/notification-dismissal.test.ts`. It attaches
explicit dismissal postcondition classification to notification dismissal
results and keeps stale engine-front train-absent or dismissed-flag evidence
unverified, so future telemetry must consume postcondition evidence rather than
treating the legacy top-level `verified` boolean as proof authority.

These are TypeScript structural owner seeds only. They do not choose TypeBox or
Effect Schema, attach broad telemetry adapters to every operation atom,
implement telemetry persistence, implement AI-ingestion, add procedure
middleware, prove runtime/live-game behavior, or accept the matrix row.

## Acceptance Gaps

This contract reduces the `contractArtifact` gap for the Operation/Proof
Telemetry row, and the owner seed reduces the source/proof ownership gap, but
it does not accept the row. Acceptance still needs:

- a schema/test owner and concrete schema choice;
- broader record-construction tests for approval, validation, send receipt,
  post-read, postcondition, outcome delta, blocker delta, stale, and unknown
  cases;
- broader operation-atom adapters that produce records from existing
  direct-control approval, validation, send, post-read, and postcondition owners
  beyond the seeded unit-target, production-choice, diplomacy-response, and
  narrative-choice result adapters, including notification dismissal only after
  its source-owned postcondition classification is consumed directly;
- projection separation tests proving normal CLI, debug/internal service,
  AI-ingestion, and procedure-core outputs remain distinct;
- proof-label guards preventing local tests, thread evidence, docs, logs, or
  resources from being labeled as live runtime proof across all future
  producers and projections;
- fixtures proving no consumer trains or acts on vague `verified: true`.

## Stop Conditions

Stop and reframe if future telemetry work:

- collapses approval, validation, send, post-read, postcondition, and outcome
  evidence into a single `verified` boolean;
- lets AI ingestion consume CLI presentation strings or debug raw output;
- treats local tests, target threads, peer reports, docs, logs, or resources as
  live runtime proof;
- hides stale/unknown/no-repeat-after-unverified classifications;
- turns telemetry persistence, AI ingestion, normal CLI projection, or
  procedure-core middleware into one broad raw JSON surface.
