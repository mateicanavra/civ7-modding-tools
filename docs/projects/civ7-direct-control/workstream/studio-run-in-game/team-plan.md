# Studio Run in Game Team Plan

## Objective

Prove and implement Studio-driven Civ7 game setup/start plus live runtime sync
through `@civ7/direct-control`. The owner keeps synthesis, repo state, Graphite
stack shape, OpenSpec quality, and final integration.

## Team Shape

This is a specified, tightly coupled, process-traced AI team. Agents work in
parallel discovery lanes first. Implementation agents are introduced only after
reviewed OpenSpec changes define disjoint write sets.

| Agent | Accountable Output | Output Path | Consumes | Hands Off To |
|---|---|---|---|---|
| Setup API investigator | App UI setup/start primitives, shell/running-game flow, reload proof plan | `agent-setup-api.md` | official UI/automation resources, direct-control package, runtime probes | owner, setup wrapper implementer |
| Studio materialization mapper | Studio config/seed/map row materialization and deploy/reload contract | `agent-studio-materialization.md` | Studio app/server, Swooper generation/deploy scripts, config docs | owner, Studio implementer |
| Live sync designer | Studio live map/player/unit/city/resource/visibility read model and UI shape | `agent-live-sync.md` | direct-control reads, Studio UI/store, mapgen debugging scenarios | owner, Studio implementer |
| Proof/test reviewer | Verification gates, live proof ledger schema, adversarial acceptance review | `agent-proof-test.md` | objective, acceptance criteria, prior proof docs, test suites | owner, reviewers |

## Coordination Contracts

- Agents must receive a framed objective, evidence policy, artifact contract,
  output path, and review responsibility.
- Agents write reports into this directory.
- Agents may not add bridge fallback, raw Studio JS, or hidden seed-in-config
  recommendations.
- Agents must label each claim as source-proven, live-proven, inferred,
  unresolved, or rejected.
- P1/P2 findings block dependent implementation until dispositioned.

## Feedback Loops

- Owner reads each report and resolves conflicts in OpenSpec.
- Proof/test reviewer audits spec readiness before implementation.
- Live proof ledger is updated immediately after each runtime mutation attempt.
- Closure requires no stale running agents and a clean Graphite state.

## Failure Plan

- If setup/start cannot be live-proven, the owner documents failed proof and
  triggers the user-specified reframe path.
- If reload semantics require a full process restart, the owner designs the
  closest truthful Run in Game contract instead of masking the boundary.
- If Studio live sync risks corrupting authored config, runtime observations
  remain overlays/suggestions only.
