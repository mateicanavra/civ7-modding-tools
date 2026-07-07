# Packet 5 Verification Evidence

Status: Packet 5 implementation and local static/behavior gates are green.
Live Studio endpoint checks for catalog/editor/rejected source variants remain
open and must run before this packet closes.

## Product Evidence

- Public start input is a closed launch-source request:
  `{ source, recipeSettings, worldSettings, setupConfig?, recovery? }`.
- Catalog launches carry only `catalogSourceId`; the Studio app host resolves
  the Swooper catalog source through the app-owned `readRunInGameCatalogSource`
  port and the server-owned resolver builds the launch envelope.
- Editor launches are disposable `studio-current` launches. The contract and
  runtime reject split editor identities where `configId` or `mapScript` claim a
  different generated map.
- The operation runtime owns resolved launch source, launch envelope, source
  digest, envelope digest, canonical prepared request, and private source
  snapshot proof construction.
- Public operation status remains the Packet 1 safe projection. Exact source,
  config, path, digest, and private rejection details stay out of public status
  and error data.

## Static And Behavior Gates

| Gate id | Required | Command/protocol | Preconditions | Result | Artifact | Oracle | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| server-project-test | Required | `nx run control-studio-server:test --skip-nx-cache --outputStyle=static` | Packet 5 source diff applied | `8` files / `116` tests passed | Terminal output from 2026-07-07 run | Server runtime, handler, oRPC serialization, source-resolution rejection, and public/private status behavior remain green. | PASS |
| app-project-test | Required | `nx run mapgen-studio:test --skip-nx-cache --outputStyle=static` | Packet 5 source diff applied | `67` files / `380` tests passed | Terminal output from 2026-07-07 run | App request construction sends launch source variants and request validation reflects the closed source envelope. | PASS |
| contract-check | Required | `nx run studio-contract:check --skip-nx-cache --outputStyle=static` | Packet 5 contract diff applied | TypeScript check passed | Terminal output from 2026-07-07 run | Contract types remain coherent after closed launch-source request changes. | PASS |
| server-check | Required | `nx run control-studio-server:check --skip-nx-cache --outputStyle=static` | Packet 5 server diff applied | TypeScript check passed | Terminal output from 2026-07-07 run | Operation runtime, workflow ports, and canonical prepared request types remain coherent. | PASS |
| app-check | Required | `nx run mapgen-studio:check --skip-nx-cache --outputStyle=static` | Packet 5 app/server-host diff applied | TypeScript check passed | Terminal output from 2026-07-07 run | App hook and app-host materialization code type-check with Packet 5 source resolution. | PASS |
| targeted-biome-check | Required local hygiene | `bunx biome check <Packet 5 changed TS/TSX files>` | Biome write pass completed on Packet 5 changed TS/TSX files | `19` files checked, no fixes applied | Terminal output from 2026-07-07 run | Imports, formatting, and style are clean after Packet 5 edits. | PASS |
| sa05-targeted-habitat | Required | `bun habitat check --rule grit-studio-run-launch-source-boundary --json` | SA-05 rule registered under Habitat | Rule passed with `0` diagnostics | Terminal JSON from 2026-07-07 run | Structural launch-source ownership is enforced by Habitat. | PASS |
| mapgen-studio-habitat | Required | `nx run mapgen-studio:habitat:check --skip-nx-cache --outputStyle=static` | Nx dependency graph runnable; Habitat built | `11` rules passed, `0` failing, `0` advisory findings | Terminal output from 2026-07-07 run | MapGen Studio Habitat authority remains green with SA-05 included. | PASS |
| openspec-strict | Required | `bun run openspec -- validate studio-run-launch-source-resolution --strict` | OpenSpec change present with Packet 5 evidence/task updates | Change is valid | Terminal output from 2026-07-07 run | Packet 5 proposal/design/spec/task/evidence records satisfy OpenSpec strict validation. | PASS |
| diff-whitespace-check | Required local hygiene | `git diff --check` | Packet 5 source and authority diff applied | No whitespace errors | Terminal output from 2026-07-07 run | Commit diff has no whitespace defects. | PASS |
| live-catalog-source-start | Required | oRPC `runInGame.start` over a running Studio server | Direct Studio server running from this packet worktree | Not yet run | Pending | Catalog source variant admits and public status stays safe while private diagnostics remain lookup-only. | OPEN |
| live-editor-source-start | Required | oRPC `runInGame.start` over a running Studio server | Direct Studio server running from this packet worktree | Not yet run | Pending | Editor source variant admits only `studio-current` disposable content. | OPEN |
| live-invalid-source-start | Required | oRPC `runInGame.start` over a running Studio server | Direct Studio server running from this packet worktree | Not yet run | Pending | Invalid source returns declared safe public error data, not framework BAD_REQUEST or private diagnostics. | OPEN |

## Review Lanes

Required review lanes ran after the first implementation pass. Findings were
accepted and repaired before this evidence record.

| Lane | Reviewer focus | Disposition |
| --- | --- | --- |
| TypeScript refactoring / structure | Closed source union, runtime resolver ownership, prepared request typing, stale compatibility paths, public/private surface, JSDoc and anchor comments. | PASS after repairs. Accepted split editor identity finding; editor source identity is now literal `studio-current` in the contract and validated in the runtime. Accepted canonical prepared request finding; server ports now expose `CanonicalRunInGameRequest` with required admitted fields. Removed the legacy `buildStandardRunInGameSourceSnapshotProof` compatibility helper. Residual comment cleanup remains low-risk and can continue in later packet polish. |
| Code quality / Habitat authority | SA-05 authority mechanism, Habitat/Grit registration, positive structural assertions, ledgers, and failure modes. | PASS for this slice. SA-05 is registered under `.habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-launch-source-boundary`, with an empty baseline and positive scoped assertions. No `.grit` authority tree was introduced. |
| oRPC / Effect / library correctness | TypeBox closure, oRPC declared error behavior, Effect failure channels, source-resolution errors, and handler serialization. | PASS after repairs. Top-level raw-control fields now pass schema only far enough for the runtime to reject them as declared `RUN_IN_GAME_INVALID`; handler coverage proves public error data stays safe. `Effect.tryPromise` source-resolution failure mapping was reviewed as correct. |

## Authority Notes

- SA-05 is Habitat-owned. Grit is only the runner selected by the Habitat rule
  manifest.
- The rule intentionally does not ban `sourceSnapshot` across the app. The app
  still owns client/private source relation state; Packet 5 removes those fields
  from the public start request.
- Digest stability, endpoint behavior, and generated-content launch proof remain
  behavior/live gates, not Grit assertions.
