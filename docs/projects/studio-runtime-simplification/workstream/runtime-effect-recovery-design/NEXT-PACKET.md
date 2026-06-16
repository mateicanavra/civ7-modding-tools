# Next Packet - Runtime Effect Recovery Closeout

Status: R4 closeout handoff.

## Next Action

Do not reopen R0-R3. They have been implemented as a docs/OpenSpec Graphite
stack above the prework and design commits:

- R0 `315efbbf1` reconciled D12 final drain.
- R1 `7d98eaaa0` realigned consumed live-proof handoffs and retained only D10's
  narrowed watcher-specific live-game proof gap.
- R2 `04cc86f83` realigned stale historical packet accounting.
- R3 `bc31bf51a` bannered active project doc drift.

The next substantive packet, if the broader runtime-proof goal continues, is a
D10 live-game watcher proof slice. Its owner is
`openspec/changes/mapgen-studio-live-game-watch`, and its initial posture should
be proof execution and evidence capture, not code implementation. Runtime code
changes become in scope only if that live proof finds a current product defect.

## Retained Proof Gap

`openspec list` intentionally still reports
`mapgen-studio-live-game-watch` as `36/37 tasks`. That remaining row is the
watcher-specific live Civ7 proof subclaim that D12 did not independently close:
first retained live-game state, reconnect replay, quiet unchanged state, and
changed-state observation against a real Civ7 process.

## Stop Conditions

- Do not mark the broader runtime-proof goal complete while the D10 proof gap is
  still open.
- Do not claim a fresh live Civ7 pass from the docs-only R0-R4 recovery stack.
- Do not edit runtime source in the D10 proof slice unless the proof run exposes
  a current defect with exact reproduction evidence.
