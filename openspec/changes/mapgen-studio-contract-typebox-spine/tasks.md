## 1. Packet Entrance

- [x] 1.1 Confirm D2 `mapgen-studio-engine-effect-corpus` is accepted.
- [x] 1.2 Confirm no existing `mapgen-studio-contract-typebox-spine` change exists on this baseline.
- [x] 1.3 Run fresh D2.5 schema/testing review lanes and disposition all P1/P2 findings before acceptance.
- [x] 1.4 Run hardening/prework and black-ice review lanes before acceptance.
- [x] 1.5 Record packet entrance proof: dependency install freshness, baseline build/check, `git status --short --branch`, `gt status`, `gt log --no-interactive`, dirty-file quarantine, and selected baseline.

## 2. Packet Schema Spine Scope

- [x] 2.1 Inventory `packages/studio-server/src/contract/**`, `typeboxStandardSchema.ts`, recipe-DAG schemas, and live-game schemas.
- [x] 2.2 Record current TypeBox coverage and stale Zod/comment residue in `schema-spine-ledger.md`.
- [x] 2.3 Specify the owned TypeBox-to-Standard Schema adapter contract, including recoverable TypeBox origin.
- [x] 2.4 Specify public DTO ownership for Run in Game and Save&Deploy request/status shapes.
- [x] 2.5 Specify app-local UI-helper-only rules for any remaining Run in Game / Save&Deploy app modules.
- [x] 2.6 Specify canonical operation DTO schema reuse for endpoint status, `studio.operations.current`, and operation events.
- [x] 2.7 Classify permissive expected-error `details?: unknown` as D3-bound bridge residue or require TypeBox-backed narrowing in D2.5.
- [x] 2.8 Classify `effect-orpc` import ownership as router/runtime-only, with current recipe-DAG contract/error-builder imports treated as implementation residue.
- [x] 2.9 Specify open mutation input closure or raw-control guard proof for `runInGame.start`.

## 3. Packet Proof Strategy

- [x] 3.1 Define TypeBox `Value.Check` / `Value.Parse` sample coverage for all Studio public contract families.
- [x] 3.2 Define Standard Schema adapter origin, parse, path, and issue tests.
- [x] 3.3 Define declared error data schema tests for every Studio-owned error map.
- [x] 3.4 Define parity tests for closed-object stripping, optional/default/coercion behavior, status-code pins, and permissive failure data.
- [x] 3.5 Define type-derivation checks proving app request/status usage comes from `@civ7/studio-server`.
- [x] 3.6 Define negative searches for Zod residue, stale package/app comments, app-local public DTO authority, direct `/api` operation paths, raw operation fields, and loose duplicate operation schemas.
- [x] 3.7 Define D3 same-stack deletion/narrowing guard for any retained permissive expected-error details bridge.
- [x] 3.8 Define adversarial raw-control rejection tests for any open public mutation input schema.
- [x] 3.9 Record D2.5 prework completed, implementation prework required before code edits, peer-agent prework lanes, and resolved black-ice decisions in `workstream/prework-ledger.md`.

## 3A. Future Implementation Closure Gates

These are D2.5 implementation obligations recorded by this packet, not pre-acceptance authoring tasks.

- [ ] 3A.1 Implement Studio adapter origin recovery and schema extraction tests.
- [ ] 3A.2 Replace stale Zod comments in package and app/server code.
- [ ] 3A.3 Compose canonical Run in Game / Save&Deploy operation DTO schemas into endpoint status, `studio.operations.current`, and operation events.
- [ ] 3A.4 Replace app-local public operation DTO authority and response/event casts with package-derived types.
- [ ] 3A.5 Classify or narrow permissive expected-error `details?: unknown` data.
- [ ] 3A.6 Classify raw-field and direct `/api` search hits, and remove/move `effect-orpc` import hits outside router/runtime implementation ownership.
- [ ] 3A.7 Update D3 `mapgen-studio-error-spine` in the same implementation stack if D2.5 keeps permissive error-detail bridge residue.
- [ ] 3A.8 Close `runInGame.start` input schema or prove raw-control rejection with recovered-schema adversarial samples.

## 4. Verification

- [x] 4.1 `bun run openspec -- validate mapgen-studio-contract-typebox-spine --strict`.
- [x] 4.2 `bun run openspec:validate`.
- [x] 4.3 `git diff --check`.
- [x] 4.4 `bun install --frozen-lockfile`.
- [x] 4.5 Historical pre-settlement packet-authoring base: `bun run build` and `bun run check`. Future migrated Nx/Habitat implementation base: replace with classified repo-local Nx/Habitat targets before code edits.
- [x] 4.6 `git status --short --branch`, `gt status`, and `gt log --no-interactive`.

## 5. Closure

- [x] 5.1 Record review acceptance in `review-disposition-ledger.md`.
- [x] 5.2 Mark D2.5 accepted in `OPENSPEC-PACKET-TRAIN.md`.
- [x] 5.3 Commit accepted D2.5 packet through Graphite with clean/quarantined worktree state.
