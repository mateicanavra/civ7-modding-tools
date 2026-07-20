# Review Disposition Ledger

## First Review Wave

### TypeScript Refactoring

- Reviewer: Schrodinger (`019f4409-54d6-7502-8a03-a56120f7b27c`)
- Finding: P2, the hook test asserted the `runCurrentConfigInGame` facade rather
  than the actual public `runInGame.start` request.
- Disposition: accepted.
- Repair: extracted `buildRunInGameStartRequest` from the browser API boundary
  and added a focused request-validation test that checks the constructed DTO
  against the public contract schema, including nested `recovery`.

- Finding: P2, new fixtures used `as never`, hiding public-status type drift.
- Disposition: accepted.
- Repair: typed the new fixtures with `satisfies RunInGameOperationStatus`.

### Code Quality And Structure

- Reviewer: Descartes (`019f4409-6d6e-7e50-92f1-59daa5ec4c51`)
- Finding: P1, unrelated protected local files were dirty in the packet worktree.
- Disposition: accepted as branch-hygiene risk, not as Packet 3 write-set work.
- Repair: kept `scripts/restart-mapgen-studio.sh` and
  `mods/mod-swooper-maps/src/maps/configs/earthlike-wowza.config.json` out of
  all Packet 3 diffs, classify inputs, and staging.

- Finding: P2, task 2.2 claimed a reusable browser-originated harness path while
  the original evidence was only a manual row.
- Disposition: accepted.
- Repair: added `workstream/browser-originated-live-check.md` as the reusable
  protocol for rendered-browser admission and retained the live JSON row as the
  bounded evidence artifact.

- Finding: P2, source and evidence rows used real local absolute paths.
- Disposition: accepted.
- Repair: changed tests to sentinel paths and retained workstream commands with
  `$WORKTREE` redaction.

### Library Correctness

- Reviewer: Kepler (`019f4409-88d8-7590-bae7-8e05f11d8263`)
- Finding: P2, live evidence overclaimed without a retained public RPC/event
  artifact.
- Disposition: accepted.
- Repair: added `workstream/live-browser-originated-admission-2026-07-08.json`
  with admitted request id, public status/current/event snapshots, diagnostics
  lookup result, and private-marker scan results.

- Finding: P3, rendered Play-control unit test title overclaimed admission
  semantics.
- Disposition: accepted.
- Repair: renamed the test to callback wiring language.

## Final Review Wave

### TypeScript Refactoring

- Reviewer: Mill (`019f4412-7662-76e1-a886-fbae0c4a1d8b`)
- Finding: P3, the visible-selection test used `as unknown as PipelineConfig`
  to include `$schema` metadata.
- Disposition: accepted.
- Repair: replaced the cast with a named fixture typed as
  `PipelineConfig & { $schema: string }`, keeping the test focused on schema
  metadata stripping without erasing the surrounding type.

### Code Quality And Structure

- Reviewer: Noether (`019f4412-9a62-7dc3-b844-d5d77d474bd6`)
- Finding: P2, the retained live row selected visible seed/map/player values
  but did not select a saved setup config or retain the start request shape.
- Disposition: accepted.
- Repair: reran the rendered-browser row with visible saved setup config
  `ToT_BasicModsEnabled`, retained exactly one `/rpc/runInGame/start` request,
  recorded the redacted public input shape, and retained full public
  `studio.operations.current` output.

- Finding: P3, the protected dirty root script remains a staging risk.
- Disposition: accepted.
- Repair: Packet 3 staging remains explicit pathspec-only. The protected file
  stays excluded from classify input and commit staging.

### Library Correctness

- Reviewer: Boole (`019f4412-b7db-7270-8a73-cdc5b3d97977`)
- Finding: P1, `runInGame.start` still admitted top-level raw-control tunnel
  fields in the public TypeBox input schema.
- Disposition: accepted.
- Repair: removed the raw-control top-level fields from
  `packages/studio-contract/src/runInGame.ts`; the request-validation test now
  expects those top-level fields to fail the contract and still verifies nested
  raw-control fields are rejected by host validation.

- Finding: P2, retained `studio.operations.current` evidence used a summarized
  shape rather than the public oRPC output shape.
- Disposition: accepted.
- Repair: reran the live row and retained the full public output shape with
  `ok`, server identity fields, `observedAt`, and `runInGame.active/recent` plus
  `saveDeploy.active/recent`.

- Finding: P2, the live protocol did not retain that the rendered browser sent
  exactly one public start request.
- Disposition: accepted.
- Repair: updated the protocol to capture `/rpc/runInGame/start` traffic and
  retained the count plus redacted request shape in the JSON row.

- Finding: P2, `packages/studio-server/test/handler.test.ts` still expected a
  top-level raw-control payload to reach handler-defined invalid-request
  mapping after the public contract was closed.
- Disposition: accepted.
- Repair: changed the handler test to send `rawJs` through nested opaque
  `source.payload.pipelineConfig`, which still passes the public schema and is
  rejected by the runtime raw-control scanner with declared
  `RUN_IN_GAME_INVALID` data. The focused handler and operation-runtime raw
  control tests plus full `control-studio-server:test` now pass.

### Final Re-Review

- TypeScript reviewer: Erdos (`019f441c-2bc2-7a22-9db9-d2548c147b25`)
- Result: no material P1/P2/P3 findings. Residual risk is pre-existing casts
  outside the Packet 3 diff.

- Code quality/structure reviewer: Newton
  (`019f441c-4a8b-7171-a8e8-3a15e0706c1b`)
- Result: no material P1/P2/P3 findings. Retained evidence row is bounded,
  redacted, and does not add topology scripts or authority machinery.

- Library reviewer: Lorentz (`019f441c-6f36-7a51-9e11-83e5861a5d33`)
- Finding: P2, downstream server handler test still expected the old top-level
  raw-control path.
- Disposition: accepted and repaired as recorded above.

- Final library reviewer: Pauli (`019f4420-1354-7802-b360-f0223a00246e`)
- Result: no material P1/P2/P3 findings after server-handler repair.

- Testing-design reviewer: Dalton (`019f4420-33be-7530-b713-3d40eca3b200`)
- Result: no material P1/P2/P3 findings. Residual risk is that the
  browser-originated live protocol is workstream evidence, not CI coverage.

- Habitat/authority reviewer: Russell (`019f4420-52d8-7f30-b24e-e5d4d205b479`)
- Finding: P2/P3 bookkeeping, the generated diff/evidence must include
  classify-reported `control-studio-server` gates and closure rows must close
  after final review.
- Disposition: accepted.
- Repair: regenerated the final classify diff with `packages/studio-server` in
  the write set, recorded `control-studio-server:check` and
  `control-studio-server:test`, and closed tasks 3.5/3.6 plus the review row.
