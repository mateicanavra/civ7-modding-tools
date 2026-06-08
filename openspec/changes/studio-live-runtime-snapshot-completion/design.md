## Design

This is a completion slice over `studio-live-civ7-map-sync`, not a replacement
for that change.

## Runtime Snapshot Identity

Each live runtime snapshot is keyed by:

- Civ turn or available turn-like runtime marker;
- Civ `Game.getHash()` when direct-control exposes it;
- bounded map/source request shape;
- stable hash over selected fields, bounds, and readback metadata;
- binding status: proven Studio run, unbound runtime, stale, partial, or failed.

When `Game.getHash()` is present in live status, Studio includes it in the
status snapshot hash and source snapshot id so same-turn runtime observations
with different game state cannot share an identity.

The UI may render stale or partial data only when the state label is explicit.

## Polling And Cancellation

Live status remains lightweight and frequent. Heavy snapshot/entity reads are
cancelable and tied to the current bounds/filters. A newer request makes older
results non-committable unless the UI explicitly stores them as historical
evidence.

Repeated failures increase polling intervals and surface a stale/read-failure
state instead of silently reusing old facts as current proof.

## Suggestion Records

Runtime-to-config translation is not an automatic mutation path. If a user
action exposes a translation from runtime evidence toward authored config, the
translation creates a suggestion record with source snapshot id, confidence,
affected config path, and explicit apply path through the normal config editor.

If no runtime-to-config translation is exposed in the current UI, the
workstream records a not-applicable disposition for this slice.

## Review Lanes

- Studio state/model review: snapshot identity, cancellation, and stale-state
  handling.
- Product-proof review: no authored config mutation from runtime evidence.
- Direct-control read-boundary review if package read wrappers are touched.
