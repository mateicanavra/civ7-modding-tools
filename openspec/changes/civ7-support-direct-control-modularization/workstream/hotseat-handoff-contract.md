# Hotseat Handoff State Contract

This is a planning contract and runtime-proof checklist for future one-client
hotseat player-agent control. It is not a source implementation, runtime
certification, live-game proof record, CLI semantic envelope, telemetry
contract, AI-ingestion contract, debug/internal service contract, or
Effect/oRPC procedure-core contract.

Hotseat handoff is the preferred product foundation for live external
player-agent control when activation and rotation proof pass. Autoplay and
Automation remain support/debug/native-AI measurement infrastructure; they are
not the primary external-agent executor.

## Scope

The handoff contract covers the live transition between human-visible Civ7 play
and an agent-owned hotseat slot in a single Civ7 client. Direct-control mutation
is allowed only when the current local player is an agent-owned slot. Human
turns remain UI-owned and mutation-refused.

This contract does not authorize play-thread action, source mutation, hotseat
runtime proof, CLI projection work, telemetry persistence, AI ingestion, or
procedure-core implementation by itself.

## Future State Slots

Future implementation should converge on a stable handoff state shape with
these slots or direct equivalents:

| Slot | Purpose |
|---|---|
| `sessionHealth` | Current Tuner/App UI/session readiness and reconnect boundary, without claiming live proof from local fake tests. |
| `currentLocalPlayer` | Current `GameContext.localPlayerID` or equivalent official current-local-player evidence. |
| `slotOwnership` | Human/agent ownership registry for hotseat slots, including unknown/unassigned states. |
| `turnState` | Current turn, active player, handoff phase, blocker state, and safe next-step summary. |
| `blockerState` | Blocking notification, ready unit, ready city, progression, diplomacy, narrative, turn-completion, or none. |
| `curtainState` | Human-visible waiting/curtain/interface state during agent turns. |
| `actionEligibility` | Whether direct-control mutation is allowed, refused, or pending proof for the current local player. |
| `approvalState` | Approval token/reason state required before any mutation-facing send. |
| `postActionState` | Postcondition, turn completion, and human restoration status after an agent action or turn end. |

## Runtime Proof Gates

Before this row can be accepted, runtime evidence must prove or explicitly
defer these gates:

1. Menu/setup snapshot shows hotseat setup availability or the blocker that
   prevents activation.
2. Disposable hotseat activation reaches a game state suitable for handoff
   proof.
3. At least two hotseat slots rotate through official current-local-player
   evidence.
4. Agent-owned current-slot detection is recorded from official evidence.
5. Direct-control mutation is refused for non-agent human turns.
6. One approved agent-slot operation follows approval-first, validator-first,
   no-repeat-after-unverified behavior.
7. Agent turn completion reaches a stable post-turn state.
8. Human UI restoration is observed after the agent turn.
9. Any fallback non-local operation probe is recorded as fallback/support
   evidence only, not the product path.
10. Any Autoplay/Automation measurement is bounded and labeled support/debug
    evidence only.

## Projection Boundaries

Normal CLI may later summarize handoff status as player-agent state:

- current player and slot ownership;
- handoff readiness;
- blocker state;
- action eligibility;
- safe next steps;
- human-turn refusal.

Debug/internal service output may expose raw handoff diagnostics only under the
debug row. Telemetry may record proof details only after the telemetry row is
accepted. AI ingestion may consume source-labeled handoff records only after the
ingestion row is accepted. Procedure cores remain blocked until this row and
procedure schema ownership are accepted.

## Acceptance Gaps

This contract reduces the `contractArtifact` gap for the Hotseat Handoff State
row, but it does not accept the row. Acceptance still needs:

- a named hotseat runtime source owner;
- a live runtime proof owner and gate runner;
- human restoration proof ownership;
- captured runtime evidence for the proof gates above;
- tests or proof guards preventing local fake-runtime tests, target-thread
  evidence, peer reports, docs, logs, or resources from being labeled as live
  hotseat runtime proof;
- stop-condition coverage for Autoplay as product executor, non-agent human
  mutation, missing local-player rotation proof, and missing human restoration.

## Stop Conditions

Stop and reframe if future hotseat work:

- treats Autoplay/Automation as the primary external-agent executor;
- permits direct-control mutation when the current local player is a non-agent
  human slot;
- claims hotseat proof without official local-player rotation evidence;
- hides human-visible waiting or restoration requirements;
- uses local fake-runtime tests, target-thread evidence, peer reports, docs,
  logs, or resources as live runtime proof;
- collapses hotseat handoff state, normal CLI output, debug output, telemetry,
  AI ingestion, and procedure-core contracts into one raw service shape.
