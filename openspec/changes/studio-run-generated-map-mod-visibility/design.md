# Design

## Stable Generated Mod

Every request renders the same admitted file topology:

- `mod-swooper-studio-run.modinfo`
- `config/config.xml`
- `text/en_us/MapText.xml`
- `maps/studio-run.js`

The script and manifest embed the request id, run artifact id, canonical-config
digest, launch-envelope digest, and generation-manifest digest. A new request
replaces the stable deployment only after its complete generated tree is ready.
Source and deployed tree digests must match.

The modinfo uses module-specific criteria and action-group ids. It must not
reuse the source mod's generic ids or publish duplicate row/action identity.

## Visibility Flow

`lifecycle.singlePlayer.start` owns the only multi-step composition:

1. Admit shell state, exiting an active game only when required.
2. Load and read back an optional saved configuration.
3. Reconcile the exact generated mod id through the direct-control atom.
4. Read the exact stable setup row.
5. Reload setup UI and poll observations only when the row is not yet visible.
6. Apply and read back setup, host once, begin once, and attest the loaded map.

Mutation is never retried. Polling observes only. The lifecycle returns typed
target-mod and row evidence to Studio; Studio does not reconstruct it.

## Ownership

Direct-control owns Civ7 wire commands and observations. Control-oRPC owns the
stateful sequence and its typed failure states. Studio owns the correlated
product operation and its public/private projections. No layer restarts Civ7
for catalog visibility.

## Non-Goals

This change does not introduce provider selection, inventory every enabled mod,
revive a direct-control aggregate helper, or change saved-config semantics.
Saved-config composition is P20 and consumes this same lifecycle path.
