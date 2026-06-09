# Play Agent Workstream

Status: project workstream reference.

This folder is the single home for play-agent documents in the Civ7 Direct
Control project. It collects the active control-surface research, the
single-client hotseat solution frame, the proof phase packet, and the live
strategy ledgers that existed before consolidation.

## Document Set

Keep these nine documents together:

1. `hotseat-solution.md` - primary solution architecture for single-client
   playable-AI support.
2. `control-surface-reference.md` - evidence ledger for Automation, Autoplay,
   Hotseat, local multiplayer, FireTuner, and direct-control surfaces.
3. `hotseat-phase-packet.md` - proof-gated phase packet imported from the
   Graphite hotseat phase branch.
4. `output-contract.md` - play-agent output contract and response shape.
5. `operational-reference.md` - cross-game operational doctrine for the
   validator-backed play loop.
6. `strategy-notes.md` - active-loop strategic advisory ledger.
7. `current-launch-netnew-strategy.md` - launch-specific ledger for one active
   new-game run.
8. `restart-strategy-brief.md` - restart/relaunch strategy handoff.
9. `session-reference.md` - session-oriented reference and handoff notes.

## Authority Order

Use `hotseat-solution.md` as the current design entrypoint. It should cite
`control-surface-reference.md` for proof and uncertainty. Use
`hotseat-phase-packet.md` to plan the next proof work.

The live ledgers are retained for continuity, but they are not the normative
architecture source. If a live ledger conflicts with the solution or evidence
reference, treat the ledger as time-bound runtime context and update the
normative docs only after a fresh proof.

## Current Recommendation

The leading path is hotseat-backed agent turns in one Civ7 client:

- configure the human and agent-controlled civs as hotseat human slots;
- let Civ7 rotate `GameContext.localPlayerID`;
- leave the real human UI alone on the human slot;
- run direct-control actions only when an agent slot is the current local
  player;
- complete the agent turn and wait for the next handoff.

Fallback remains single-client non-local operation authority, but only if
hotseat activation or local-player rotation is falsified.

## Placement Rule

New play-agent research, proof packets, and implementation notes belong in this
folder. Do not add more root-level `play-agent-*.md` files under
`docs/projects/civ7-direct-control/workstream/`.
