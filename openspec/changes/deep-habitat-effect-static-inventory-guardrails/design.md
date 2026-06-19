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
