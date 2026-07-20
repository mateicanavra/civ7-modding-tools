# Packet 7 Verification Evidence

Packet: `studio-run-generation-manifest`

## Product Proof

Packet 7 creates the private request workspace and writes one generation
manifest before Run in Game materialization starts. The manifest is private
runtime input: public status/current responses expose only safe status fields,
while private operation records and diagnostics keep the manifest path and
digest available for explicit lookup.

Final live endpoint proof used a running Studio daemon on port `5299`.

- `serverInstanceId`: `studio-server-mrbblkxc-1c3o-1-d0eddcb0-8fff-4c02-b06a-eef562bf30ca`
- admitted `requestId`: `studio-run-in-game-mrbblkxs-1c3o-2`
- request seed: `1538316418`
- manifest path:
  `.mapgen-studio/run-in-game/studio-run-in-game-mrbblkxs-1c3o-2/generation-manifest.json`
- `runArtifactId`: `run-69b4aa6c936c03c4b4fd`
- `generationManifestDigest`:
  `86f04fb3c9da35264b8d1af44d099765b90e64a678193d2a41eaa2f689748a3c`
- `runInGame.start` public response: `status: "running"`,
  `phase: "resolving-source"`, `publicLeaksPrivate: false`
- later `runInGame.status`: `status: "running"`,
  `phase: "generating-artifacts"`, `publicLeaksPrivate: false`
- `studio.operations.current`: active request matched the admitted request and
  `publicLeaksPrivate: false`

The live pass also found a real runtime blocker: a development watcher reload
left a stale lease from the same process id but a different daemon heartbeat.
Packet 7 resolved that as product behavior, not test noise: runtime ownership
now treats the daemon heartbeat as the live lease proof, so a reused process id
without the matching heartbeat is dead evidence rather than an ambiguous live
owner.

## Behavior Gates

- `bun run --cwd packages/studio-server test test/generationManifest.test.ts test/operationRuntime.test.ts`
  passed. This covers manifest schema parsing, digest stability, exclusive
  manifest writing, manifest-before-materialization ordering, public/private
  status separation, safe diagnostics ids, dot-segment request rejection, and
  stale same-process lease recovery.
- `nx run control-studio-server:test --skip-nx-cache --outputStyle=static`
  passed.
- `nx run mapgen-studio:test --skip-nx-cache --outputStyle=static`
  passed.

## Contract, App, And Server Gates

- `nx run control-studio-server:check --skip-nx-cache --outputStyle=static`
  passed.
- `nx run mapgen-studio:check --skip-nx-cache --outputStyle=static` passed.
- `bun run lint` passed.
- `git diff --check` passed.

## OpenSpec And Habitat Gates

- `bun run openspec -- validate studio-run-generation-manifest --strict`
  passed.
- `bun habitat check --owner mapgen-studio --json` passed.
- `nx run habitat:test --skip-nx-cache --outputStyle=static` passed.
- Direct rule spot checks passed for:
  `grit-studio-run-operation-identity-owner` and
  `grit-studio-run-public-contract-closed`.

SA-07 is registered as
`structure-studio-run-workspace-topology`. It positively owns the source
topology for request workspace helpers under
`packages/studio-server/src/operationRuntime/runWorkspace`; runtime
`.mapgen-studio/run-in-game/<requestId>` directories remain evidence, not
source topology.

## Review Lanes

- TypeScript refactoring lane: found and resolved unsafe persisted diagnostics
  id admission after restart and missing nested launch-envelope digest
  coherence in manifest parsing.
- Code quality and Habitat structure lane: found and resolved weak SA-02
  operation identity authority and an SA-01 projection escape hatch that could
  have allowed public spread/alias leaks.
- oRPC, Effect, and packet-library lane: no blocking findings after verifying
  Standard Schema unknown-property behavior, Effect `tryPromise` abort-signal
  use for the exclusive manifest write, closed TypeBox schemas, and public
  projection boundaries.

Reviewers also inspected comments and JSDoc. The final shape keeps cornerstone
comments limited to purpose and ownership; it does not add line-by-line
narration.

## Discarded Red Runs

Two red runs were classified as self-inflicted harness races and were not used
as closure evidence:

- `mapgen-studio:check` failed once while `mapgen-studio:test` ran in parallel
  against the same generated build outputs. The serial rerun passed.
- A package-local server Vitest run failed once while a concurrent check graph
  rebuilt shared package output. The serial rerun passed.

Packet closure evidence is based only on serial green gates.
