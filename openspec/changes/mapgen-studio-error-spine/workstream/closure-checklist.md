# D3 Packet Closure Checklist

Status: packet accepted; D3 implementation committed on `codex/runtime-effect-error-spine`
Date: 2026-06-15

## Packet Shape

- [x] Proposal repaired.
- [x] Design repaired.
- [x] Tasks repaired.
- [x] Spec delta repaired.
- [x] Phase record repaired.
- [x] Error corpus ledger drafted.
- [x] Failure vocabulary ledger drafted.
- [x] Prework ledger drafted.
- [x] Testing ledger drafted.
- [x] Fresh reviews complete.
- [x] Hardening/prework review complete.
- [x] Black-ice review complete.
- [x] Accepted P1/P2 findings repaired or rejected with evidence.
- [x] Packet status moved from draft to accepted.

## Packet Verification Before Acceptance

- [x] `bun install --frozen-lockfile`
- [x] historical pre-settlement packet-authoring base: `bun run build` and `bun run check`
- [x] `git status --short --branch`
- [x] `gt status`
- [x] `gt log --no-interactive`
- [x] `bun run openspec -- validate mapgen-studio-error-spine --strict`
- [x] `bun run openspec:validate`
- [x] `git diff --check`
- [x] selected-baseline and dirty-file quarantine note recorded
- [x] failure corpus recorded in `error-corpus-ledger.md`
- [x] failure vocabulary recorded in `failure-vocabulary-ledger.md`
- [x] failure reason codes are TypeBox-declared before engine/application projections can emit them
- [x] implementation prework and peer-agent prework lanes recorded in `prework-ledger.md`
- [x] future implementation closure gates recorded in `testing-ledger.md`

Dirty-file quarantine note: `bun run build` rewrote the generated `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js` bundle; it was restored from `HEAD` and is not part of D3.

## Future Implementation Closure Gates

- [x] no expected public error data uses `Type.Unknown()` / `details?: unknown`
- [x] no expected failure path uses status-code truth as the domain model
- [x] no raw `ORPCError` construction outside router/runtime mapping ownership
- [x] status-miss identity echo parity remains green
- [x] recovery actions are TypeBox vocabulary values
- [x] operation-state projections use typed failure data and sealed recovery-action values
- [x] mapper totality tests cover all operation namespaces and expected tags
- [x] lifecycle mapper tests cover the exact D3 matrix without implementation-selected mappings
- [x] Autoplay start/stop and verification failures map to typed `AUTOPLAY_FAILED` outcomes
- [x] no unclassified `effect-orpc` imports outside router/runtime ownership
- [x] no production `StudioEngineError` / `RunInGameHttpError` construction, catch, import, or bridge mapping remains
- [x] `@civ7/control-orpc` and `@civ7/direct-control` package gates run when touched, or untouched-package negative scans are recorded
- [x] stale old-S1.2 closure and schema allowance comments are deleted or corrected
- [x] browser feature code does not value-import the root `@civ7/studio-server`
  server/runtime entrypoint for operation DTO constants

## Implementation Evidence

- Package failure spine: `packages/studio-server/src/errors/{failure,errorData,mapping,index}.ts`.
- App conversion: `apps/mapgen-studio/src/server/studio/engines.ts`,
  `context.ts`, and `server/runInGame/operationState.ts` consume
  package-owned `StudioRuntimeFailure` values and guards.
- Deleted bridge: `apps/mapgen-studio/src/server/studio/engineErrors.ts`.
- Focused gates run:
  - `bun run --cwd packages/studio-server check`
  - `bun run --cwd packages/studio-server build`
  - `bun run --cwd packages/studio-server test -- test/handler.test.ts test/errorSpine.test.ts test/contractTypeboxSpine.test.ts`
  - `bun run --cwd packages/civ7-control-orpc check`
  - `bun run --cwd packages/civ7-control-orpc build`
  - repeated `bun run --cwd packages/civ7-control-orpc build`
  - `bun run --cwd packages/civ7-control-orpc test -- test/attention-current-procedure.test.ts test/strategy-front-summary-procedure.test.ts`
  - `bun run --cwd apps/mapgen-studio check`
  - `bun run --cwd apps/mapgen-studio build`
  - `bun run --cwd apps/mapgen-studio test -- test/mapConfigSave/operationState.test.ts test/server/engineErrorSpine.test.ts`
  - `bun run --cwd apps/mapgen-studio test -- test/server/engineErrorSpine.test.ts test/runInGame/operationState.test.ts test/server/engineEffectCorpus.test.ts test/mapConfigSave/operationState.test.ts test/mapConfigSave/status.test.ts`
- Negative bridge scan over active app/package source and tests returned no matches for
  `StudioEngineError`, `RunInGameHttpError`, `toStudioEngineOrpcError`,
  `STUDIO_ENGINE_ERROR_MAPPINGS`, expected-error `details?: unknown`, or
  `details: Type.Optional(Type.Unknown)`. The same scan also rejects old
  `data.details` bridge payloads and public operation-state
  `recoveryActions: Type.Array(Type.String())` schema residue.
- Fresh implementation review disposition: Kepler P1/P2 findings were accepted
  and repaired before staging. Repairs cover Save/Deploy background failure
  projection through `DeployFailed`, Autoplay start/stop and verification
  outcomes through Autoplay-specific failure tags, router-edge
  `UnexpectedDefectData`, bounded Save/Deploy operation details, and sealed
  public recovery-action schemas for Run in Game and Save/Deploy statuses.
- Browser-boundary repair evidence: app build failed because browser feature
  modules value-imported operation constants from the root
  `@civ7/studio-server` server/runtime entrypoint, pulling direct-control Node
  built-ins into Vite. The repair moved those browser DTO/constant imports to
  `@civ7/studio-server/contract`.
- Control contract repair evidence: `@civ7/studio-server/contract` needs the
  Civ7 control contract as a browser-safe value import, so D3 intentionally adds
  `@civ7/control-orpc/contract` in
  `packages/civ7-control-orpc/package.json`, adds `src/contract.ts` to the
  control package build entrypoints, and adds
  `packages/civ7-control-orpc/scripts/build.mjs`. The root cause was a
  repeat-build declaration gap: `tsup` JS output was fine, `tsup` DTS for the
  contract fanout hit TS6307, and the old shell-chained `tsc` declaration emit
  could be skipped by stale `tsconfig.tsbuildinfo` after `tsup` cleaned `dist`.
  The package build now uses `tsup` for JS and `tsc --emitDeclarationOnly` after
  clearing stale `tsconfig.tsbuildinfo`.
- Browser-boundary proof: `bun run --cwd packages/civ7-control-orpc check`,
  repeated `bun run --cwd packages/civ7-control-orpc build`, focused
  control-oRPC tests, `bun run --cwd packages/studio-server build`, and
  `bun run --cwd apps/mapgen-studio build` passed. Multiline-safe exact-root
  scan
  `rg -nU --pcre2 "^import\\s+(?!type)(?:\\{[^}]*\\}|[^\\n;]+)\\s+from\\s+[\\\"']@civ7/studio-server[\\\"']" apps/mapgen-studio/src -g '*.ts' -g '*.tsx'`
  hits only server modules, and the same scan with
  `-g '!apps/mapgen-studio/src/server/**'` returns zero browser/non-server hits.
  `/contract` browser imports are intentional.
- Browser-boundary follow-up review: Rawls/supervisor blockers accepted and
  repaired before Graphite commit. Repairs cover the browser-safe
  `@civ7/control-orpc/contract` subpath, repeatable control declaration build,
  multiline-safe exact-root Studio-server value-import scan, and non-server
  zero-hit scan.
- Control package disposition: `packages/civ7-control-orpc` is intentionally
  touched by D3 for the browser-safe `@civ7/control-orpc/contract` entrypoint
  and repeatable declaration build; `packages/civ7-direct-control` remains
  untouched by the D3 diff.
- Live proof boundary: no fresh live Civ7 Play/Save&Deploy proof claimed in D3.

## Remaining Closure

- [x] Fresh implementation-diff review disposition recorded after browser-boundary follow-up.
- [x] Graphite implementation commit exists: current branch tip `feat(studio): add typed runtime failure spine`.
- [x] Post-commit `git status --short --branch` is clean on `codex/runtime-effect-error-spine`.
