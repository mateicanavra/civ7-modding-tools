# Civ7 Tuner Resource

## Role

- `contract.ts` owns provider-neutral named-state execution, lifecycle status,
  and typed failure vocabulary for one ready Civ7 Tuner session.
- `providers/` contains concrete acquisition and release mechanics.

## Boundary

- Consumers depend on the resource contract, never a provider implementation.
- Providers may know transport details; the resource contract may not.
- Gameplay meaning, retries, readiness policy, and public outcomes belong to
  consuming services.

## Proof

- `test/contract/` proves consumer assignability to the neutral capability.
- The provider's public implementation typecheck proves provider assignability;
  concrete transport behavior belongs to the provider proof tree.
