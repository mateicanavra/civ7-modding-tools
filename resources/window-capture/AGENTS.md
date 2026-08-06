# Window Capture Resource

## Role

- `contract.ts` owns provider-neutral window selection, PNG capture facts, and
  typed failure vocabulary for one ready managed capture capability.
- `providers/` contains concrete acquisition, capture, retention, and release mechanics.

## Boundary

- Consumers depend on the resource contract, never provider internals.
- Providers may know operating-system and helper details; the resource contract may not.
- Application selection policy, image interpretation, and retry policy belong to consumers.

## Proof

- `test/contract/` proves consumer assignability and generic naming.
- Each provider owns semantic, execution, and opt-in collaboration proofs below its root.
