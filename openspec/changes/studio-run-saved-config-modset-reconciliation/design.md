# Design

## Closed Identity Boundary

The saved-config query returns a `Civ7SavedSetupConfigFile`: a four-field file
identity enriched with filesystem metadata, summary values, and parsed game and
player options. The launch contract accepts only the identity:

```ts
{
  id: savedConfig.id,
  displayName: savedConfig.displayName,
  fileName: savedConfig.fileName,
  path: savedConfig.path,
}
```

The explicit projection is the boundary. The enriched record is not cast,
passed through, or admitted by a wider schema. `setupOptions` and
`playerOptions` populate their own closed fields.

## Lifecycle Flow

One `lifecycle.singlePlayer.start` demand owns the sequence:

1. Reach shell state without replaying uncertain mutation.
2. Load the selected saved configuration once and observe its revision.
3. Reconcile the exact generated target mod.
4. Read the exact stable generated row.
5. Apply and read back the admitted setup values.
6. Host once, begin once, and attest the loaded runtime identity.

This is one lifecycle demand, not one physical setup snapshot. Direct-control
provides the individual wire operations; it does not own an aggregate prepared
session.

## State Invariants

- Strict normalization retains a valid selected identity and rejects unknown
  fields at the launch boundary.
- Selecting a file replaces prior authored setup values with that file's
  parsed values; later user edits truthfully make the selector custom.
- Target-mod and row observations occur after saved-config load.
- Polling observes only. No mutation is retried.
- Start does not load the saved configuration a second time.
- The stable generated row and exact request/deployment correlation remain the
  launch evidence.

## Evidence

Private evidence retains the selected four-field identity, request and run
artifact ids, correlation digests, target mod, stable row, setup readback,
runtime attestation, and Civ7 process identity. Public status remains redacted.

## Non-Goals

No saved-file generation or mutation, alternate setup strategy, full mod
inventory, request-specific map filename, resource-distribution claim, process
restart, retry framework, or new provider/capability is part of this change.
