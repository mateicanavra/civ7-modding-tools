# Strategy/Intelligence Ingestion Contract

This is a planning contract for future AI-intelligence ingestion records. It is
not a source implementation, accepted schema, generated corpus artifact, static
profile generator, telemetry persistence layer, normal CLI semantic envelope,
debug/internal service contract, runtime proof, or Effect/oRPC procedure-core
contract.

The ingestion target exists because the AI-intelligence model thread is built
on top of the hotseat/autoplay foundation but needs more than normal CLI
presentation text. It needs source-labeled machine records over repo-owned
direct-control atoms, proof summaries, strategy observations, and static
native-AI profile inputs. Live external play authority remains with
`@civ7/direct-control`; static native-AI shaping remains a separate generated
profile lane.

## Scope

Future ingestion records may describe:

- semantic turn/player state from direct-control read atoms;
- available decisions, blockers, and candidate actions;
- source-labeled operation/proof telemetry once that row is accepted;
- loaded `GameInfo`, resource, log, debug database, or run metric evidence as
  enrichment, not as a complete action diary;
- strategy/playbook/cookbook signals from human or agent play patterns;
- static native-AI profile recipes that are separate from live action records.

This contract does not authorize AI corpus generation, telemetry persistence,
profile output generation, raw database ingestion, CLI output rewrites, or
procedure-core implementation by itself.

## Future Record Families

Future implementation should converge on stable record families such as these
or direct equivalents:

| Record family | Purpose | Required labels |
|---|---|---|
| `StrategyPlan` | Captures source-labeled strategic intent, priorities, assumptions, and candidate lines of play. | source, freshness, player scope, evidence class, model/thread provenance. |
| `ActionCandidate` | Represents a candidate direct-control action before send. | operation family, target, args, mutation requirement, validator evidence, stale/unknown risk. |
| `ActionOutcome` | Represents post-read/postcondition and outcome evidence after an action attempt. | validation_pre, send_receipt, validation_post, outcome_delta, blocker_delta, evidence policy. |
| `LoadedRowProof` | Captures source-labeled GameInfo/resource/log/debug DB rows used as evidence. | data source, load time, freshness, schema/version, row key, proof class. |
| `RunMetric` | Captures measured-run or benchmark signals without replacing action diaries. | run id, player scope, metric source, collection window, evidence class. |
| `PromotionDecision` | Captures promotion or build/choice decision evidence for strategy learning. | candidate options, selected option, blocker/decision source, outcome evidence when available. |
| `ProfileRecipe` | Describes static native-AI profile shaping inputs and generated SQL/XML intent. | static-profile lane, source evidence, generation policy, non-live-action marker. |

## Required Labels

Every ingestion record must preserve:

- `source`: direct-control atom, telemetry record, official resource,
  GameInfo row, log marker, debug database, save/run artifact, or human/agent
  annotation;
- `freshness`: live read, post-read, snapshot, historical log, static resource,
  or unknown;
- `evidenceClass`: target-thread evidence, repo docs, local tests, official
  resources, logs/database artifacts, Tuner/App UI reads, live runtime proof, or
  in-game observations;
- `playerScope`: global, player, local-player, agent-slot, human-turn, observer,
  or unknown;
- `authorityLane`: live external play through `@civ7/direct-control` or static
  native-AI profile shaping;
- `proofBoundary`: local/test/planning evidence, pending runtime proof, or live
  runtime proof when separately proven.

## Exclusions

AI ingestion must not depend on:

- normal CLI presentation strings;
- raw embedded JavaScript command strings or raw `game exec` payloads;
- raw SQL rows without source/freshness/evidence labels;
- runtime reflection or debug probes as product action authority;
- companion/App UI mutation surfaces as ingestion authority;
- unlabeled saves, logs, or debug database rows;
- vague `verified: true` flags without validation, send, post-read,
  outcome, blocker, and stale/unknown evidence.

## Projection Boundaries

Normal CLI may present semantic summaries for player-agent use, but ingestion
must use a separate machine contract. Debug/internal service output may enrich
ingestion only when wrapped with source/freshness/evidence labels. Telemetry may
feed ingestion only after the Operation/Proof Telemetry row is accepted.
Procedure cores may serve ingestion only after typed schema/procedure ownership
is accepted.

## Acceptance Gaps

This contract reduces the `contractArtifact` gap for the Strategy/Intelligence
Ingestion row, but it does not accept the row. Acceptance still needs:

- a named AI-ingestion contract source owner;
- a schema/test owner and concrete schema choice;
- fixture owners for source/freshness/evidence labels;
- contract tests for record families such as `StrategyPlan`,
  `ActionCandidate`, `ActionOutcome`, `LoadedRowProof`, `RunMetric`,
  `PromotionDecision`, and `ProfileRecipe`;
- tests proving ingestion does not consume CLI strings, raw command strings,
  raw SQL, runtime reflection, unlabeled artifacts, or vague `verified: true`;
- separation tests for normal CLI, debug/internal service, telemetry,
  procedure-core, live external play, and static native-AI profile lanes.

## Stop Conditions

Stop and reframe if future AI-ingestion work:

- treats CLI output text as the machine-ingestion contract;
- imports raw debug/service output without source/freshness/evidence labels;
- treats logs, saves, resources, or debug DB rows as complete action diaries;
- collapses live external play records with static native-AI profile recipes;
- trains or acts on `verified: true` without explicit outcome evidence;
- uses raw `game exec`, runtime reflection, SQL, or companion/App UI mutation as
  product action authority.
