# Review And Realignment

## Review Lanes

Every Habitat workstream needs explicit review lanes:

- product outcome lane: does the change move Habitat toward executable structural control;
- owner-boundary lane: does each invariant belong to exactly one layer;
- proof lane: are proof classes separated and sufficient for the claim;
- stale-record lane: do ledgers, phase records, command logs, generated records, and downstream docs reflect current behavior;
- stack lane: does Graphite state support the closure claim.

Use adversarial reviewers when the work changes commands, pattern semantics, generated records, baselines, hooks, or safe writes.

## Disposition Standard

Every finding gets one disposition:

- accepted and repaired;
- accepted and left open as a blocking item;
- source-rejected with evidence;
- invalidated by later evidence;
- moved outside the active workstream with owner and trigger.

Accepted P1/P2 findings block dependent closure.

## Downstream Realignment

Record updates in the packet downstream realignment ledger when a change affects:

- Habitat frame or takeover frame claims;
- recovery claim ledger;
- Grit pattern corpus ledger;
- command proof log;
- generated pattern metadata or manifests;
- docs that describe commands, baselines, hooks, or enforcement ownership;
- OpenSpec packet state;
- root or subtree `AGENTS.md` routing.

If a downstream record stays unchanged after being considered, record why it remains true.

## Stale Record Signals

Treat these as defects:

- old "closed" prose remains readable as current proof;
- stale green status hides a blocked proof class;
- command logs omit current branch or scan root;
- a generated file claims rules that are not registered;
- downstream docs describe pre-repair behavior;
- phase records and Graphite commits disagree.
