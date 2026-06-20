# Design: Static Inventory Guardrails

## Inventory Classes

- Runtime runners: `Effect.run*`, `NodeRuntime.run*`, `process.exit`.
- Process execution: `spawnSync`, `exec*`, `child_process`, shell strings.
- Filesystem and temp resources: direct `readFileSync`, `writeFileSync`,
  `mkdirSync`, `rmSync`, `mkdtempSync`, `existsSync`, `statSync`,
  `readdirSync`.
- Environment/config: direct `process.env`, `process.cwd`, scattered repo roots,
  cache dirs, telemetry toggles.
- Time: direct `Date.now` and `new Date`.
- Error channel: generic `throw new Error` for expected states.
- Public surface: `export *`, root exports of internals, package files/exports.
- Language: process/workstream vocabulary and host/product vocabulary outside
  allowlisted scopes.

The controlling current inventory is `workstream/static-inventory.md`.
Implementation packets must update or cite that inventory for every file they
touch in the blocker scope.

## Disposition Model

Each occurrence SHALL be recorded as one of:

- `host-adapter-edge`
- `runtime-provider-owned`
- `domain-violation`
- `public-contract-risk`
- `test-helper`
- `dead-code-remove`

No occurrence can remain unlabeled when an implementation packet starts.

## Guardrail Owners

- GritQL: syntax-shape and forbidden-call patterns.
- Biome: format/lint hygiene only.
- Nx: import boundaries and resolved target proof.
- Habitat file-layer/rules: `.habitat` file-kind and protected-zone policy.
- Tests: behavior and fixtures for the guardrails, not sole structural owners.

The owner and intended artifact path for each guardrail class is recorded in
`workstream/guardrail-owner-map.md`. This packet does not enable new blocking
guardrails; each later enabling packet must add the guard, injected violation
fixture, baseline decision, and current-tree proof together.

## Non-Overlap With Enforcement Packets

This packet owns inventory, disposition, owner assignment, and any explicit
pre-migration blocker checks needed before source movement. It does not own
post-migration ratchets for authored artifacts, language fences, or public
surface narrowing. Those ratchets are owned by
`deep-habitat-effect-artifact-language-enforcement` and
`deep-habitat-effect-public-surface-guards`.

## Public Surface Rule

Before removing an export, implementation must audit repo callsites and
external package exports. Public removal requires a separate public-contract
decision or a recorded proof that the export is internal-only in this repo.

## Test Scope Rule

Tests and fixtures are `test-helper` by default for direct process/fs/env/time
and generic throw patterns. This does not exempt them from review: a later
packet that edits a test file must classify direct-use occurrences in that
write set.
