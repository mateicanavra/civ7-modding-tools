# Packet 5 Verification Evidence

Status: Packet 5 source-resolution implementation, local gates, and live
endpoint source-resolution probes are green. The live probes prove request
validation, admission, public/private surface separation, and server-owned
catalog/editor launch-source resolution. They do not claim completed Civ7 game
launch.

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
- Live follow-up also repaired downstream proof-surface mismatches exposed by
  the probes: disposable cleanup now rebuilds the local deploy bundle through
  `mod-swooper-maps:build:studio-deploy --skip-nx-cache` with proof env scrubbed
  (including its `gen:maps` dependency), durable catalog materialization skips
  semantically identical config writes, and run deploy builds thread request id
  plus launch envelope digest only into the generated map script for the selected
  config id.

## Static And Behavior Gates

| Gate id | Required | Command/protocol | Preconditions | Result | Artifact | Oracle | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| server-project-test | Required | `nx run control-studio-server:test --skip-nx-cache --outputStyle=static` | Packet 5 source diff applied | `8` files / `116` tests passed | Terminal output from 2026-07-07 run | Server runtime, handler, oRPC serialization, source-resolution rejection, and public/private status behavior remain green. | PASS |
| app-project-test | Required | `nx run mapgen-studio:test --skip-nx-cache --outputStyle=static` | Packet 5 source diff applied | `67` files / `380` tests passed | Terminal output from 2026-07-07 run | App request construction sends launch source variants and request validation reflects the closed source envelope. | PASS |
| contract-check | Required | `nx run studio-contract:check --skip-nx-cache --outputStyle=static` | Packet 5 contract diff applied | TypeScript check passed | Terminal output from 2026-07-07 run | Contract types remain coherent after closed launch-source request changes. | PASS |
| server-check | Required | `nx run control-studio-server:check --skip-nx-cache --outputStyle=static` | Packet 5 server diff applied | TypeScript check passed | Terminal output from 2026-07-07 run | Operation runtime, workflow ports, and canonical prepared request types remain coherent. | PASS |
| app-check | Required | `nx run mapgen-studio:check --skip-nx-cache --outputStyle=static` | Packet 5 app/server-host diff applied | TypeScript check passed | Terminal output from 2026-07-07 run | App hook and app-host materialization code type-check with Packet 5 source resolution. | PASS |
| targeted-biome-check | Required local hygiene | `bunx biome check <Packet 5 changed TS/TSX files>` | Biome write pass completed on Packet 5 changed TS/TSX files | `19` files checked, no fixes applied | Terminal output from 2026-07-07 run | Imports, formatting, and style are clean after Packet 5 edits. | PASS |
| classify-diff-routing | Required Habitat routing | `bun habitat classify /tmp/mapgen-studio-runtime-packet5.diff` | Packet 5 source and authority diff captured | Classification completed and reported affected project/workspace targets | Terminal output from 2026-07-07 run | Habitat classify identified the Packet 5 verification surface instead of relying on ad hoc target selection. | PASS |
| deploy-plan-targeted-tests | Required downstream fix proof | `bun vitest run --config ../../vitest.config.ts --project mapgen-studio test/mapConfigSave/deployCommand.test.ts test/devServer/daemonDeployIsolation.test.ts test/server/engineEffectCorpus.test.ts` | Launch envelope digest and Nx cleanup command fix applied | `3` files / `8` tests passed | Terminal output from 2026-07-07 run | Deploy plan exposes run id, selected launch config id, and launch envelope digest only for proof-correlated launches; corpus still names the runtime deploy/cleanup functions. | PASS |
| selected-map-marker-build | Required downstream fix proof | `SWOOPER_INCLUDE_STUDIO_CURRENT=1 SWOOPER_STUDIO_RUN_ID=studio-proof-probe SWOOPER_STUDIO_LAUNCH_CONFIG_ID=swooper-earthlike SWOOPER_STUDIO_LAUNCH_ENVELOPE_DIGEST=launch-envelope-digest-test nx run mod-swooper-maps:build:studio-deploy --skip-nx-cache --outputStyle=static` plus selected/non-selected `rg` marker checks | Downstream marker fix applied | Build passed; selected `swooper-earthlike` generated and bundled scripts contained request id and launch envelope digest; every non-selected generated/bundled map script contained neither marker | Terminal output from 2026-07-07 run | Generated map proof markers match exactly one selected launch source without leaking private proof identity into unrelated map entries. | PASS |
| proof-cleanup-build | Required downstream fix proof | `nx run mod-swooper-maps:build:studio-deploy --skip-nx-cache --outputStyle=static` followed by `rg "studio-proof-probe\|launch-envelope-digest-test" mods/mod-swooper-maps/src/maps/generated mods/mod-swooper-maps/mod/maps mods/mod-swooper-maps/src/maps/configs` | Selected marker proof build completed | Clean build passed; marker search returned no matches; `swooper-earthlike.config.json` diff remained empty; config directory contained only `swooper-earthlike.config.json` for the run probe keys | Terminal output from 2026-07-07 run | Cleanup removes transient proof identity from repo-local generated and bundled artifacts without rewriting durable catalog config. | PASS |
| partial-proof-env-negative | Required downstream fix proof | `SWOOPER_STUDIO_RUN_ID=partial-proof nx run mod-swooper-maps:gen:map-artifacts --skip-nx-cache --outputStyle=static` | Generator all-or-nothing proof env applied | Command failed as expected with `Studio run proof env must set SWOOPER_STUDIO_RUN_ID, SWOOPER_STUDIO_LAUNCH_CONFIG_ID, and SWOOPER_STUDIO_LAUNCH_ENVELOPE_DIGEST together` | Terminal output from 2026-07-07 run | The generator rejects partial proof identity instead of producing ambiguous generated artifacts. | PASS |
| classify-mod-check | Required Habitat-routed target | `nx run mod-swooper-maps:check --skip-nx-cache --outputStyle=static` | Habitat classify reported `mod-swooper-maps:check` for the Packet 5 diff | Target passed | Terminal output from 2026-07-07 run | Downstream Swooper Maps type/build surface remains coherent after proof env and deploy cleanup changes. | PASS |
| classify-mod-test | Required Habitat-routed target | `nx run mod-swooper-maps:test --skip-nx-cache --outputStyle=static` | Habitat classify reported `mod-swooper-maps:test` for the Packet 5 diff | `498` tests passed, `2` skipped, `0` failed | Terminal output from 2026-07-07 run | Downstream Swooper Maps behavior remains green after proof env and generated artifact cleanup changes. | PASS |
| workspace-lint | Required Habitat-routed workspace target | `bun run lint` | Habitat classify reported the workspace lint gate | `9` project lint targets passed | Terminal output from 2026-07-07 run | Workspace lint remains green with Packet 5 authority and runtime changes. | PASS |
| sa05-targeted-habitat | Required | `bun habitat check --rule grit-studio-run-launch-source-boundary --json` | SA-05 rule registered under Habitat | Rule passed with `0` diagnostics | Terminal JSON from 2026-07-07 run | Structural launch-source ownership is enforced by Habitat. | PASS |
| mapgen-studio-habitat | Required | `nx run mapgen-studio:habitat:check --skip-nx-cache --outputStyle=static` | Nx dependency graph runnable; Habitat built | `11` rules passed, `0` failing, `0` advisory findings | Terminal output from 2026-07-07 run | MapGen Studio Habitat authority remains green with SA-05 included. | PASS |
| openspec-strict | Required | `bun run openspec -- validate studio-run-launch-source-resolution --strict` | OpenSpec change present with Packet 5 evidence/task updates | Change is valid | Terminal output from 2026-07-07 run | Packet 5 proposal/design/spec/task/evidence records satisfy OpenSpec strict validation. | PASS |
| diff-whitespace-check | Required local hygiene | `git diff --check` | Packet 5 source and authority diff applied | No whitespace errors | Terminal output from 2026-07-07 run | Commit diff has no whitespace defects. | PASS |
| live-catalog-source-start | Required | oRPC `runInGame.start` over a running Studio server on `127.0.0.1:58176` | Direct Studio server running from this packet worktree | Start admitted as `running` / `resolving-source`; public status exposed no private launch-source/path/digest fields; diagnostics lookup contained `resolvedLaunchSource.kind=catalog`, `launchEnvelope`, `launchSourceDigest`, `launchEnvelopeDigest`, `localModScriptContent`, and `deployedModScriptContent`; run reached runtime-control boundary after source resolution, generation, deployment, and materialization proof | Terminal output from 2026-07-07 run; request id `studio-run-in-game-mrb4sue6-177i-7`; diagnostics id `run-diagnostics-048a0f35-3896-4640-b045-419ce58decc2` | Catalog source variant admits, resolves privately, and keeps public status safe. Downstream Civ7 direct-control availability is outside Packet 5 source-resolution closure. | PASS |
| live-editor-source-start | Required | oRPC `runInGame.start` over a running Studio server on `127.0.0.1:58176` | Direct Studio server running from this packet worktree | Start admitted as `running` / `resolving-source`; public status exposed no private launch-source/path/digest fields; diagnostics lookup contained `resolvedLaunchSource.kind=editor`, `launchEnvelope`, `launchSourceDigest`, `launchEnvelopeDigest`, `pipelineConfig`, `localModScriptContent`, and `deployedModScriptContent`; run completed source resolution, generation, deployment, and materialization proof before failing at direct-control availability | Terminal output from 2026-07-07 run; request id `studio-run-in-game-mrb4tc8w-177i-8`; diagnostics id `run-diagnostics-c665af88-6480-4afd-a524-87dc5c61c380` | Editor source variant admits only `studio-current` disposable content, resolves privately, and keeps public status safe. | PASS |
| live-invalid-source-start | Required | oRPC `runInGame.start` with raw-control sentinel over a running Studio server on `127.0.0.1:58176` | Direct Studio server running from this packet worktree | Declared `RUN_IN_GAME_INVALID` `400`; public error data limited to `namespace`, `recoveryActions`, and `safeFailureCategory=request-validation`; no private diagnostics/source fields appeared | Terminal output from 2026-07-07 run | Invalid source/control input returns declared safe public error data, not framework `BAD_REQUEST` or private diagnostics. | PASS |

## Review Lanes

Required review lanes ran after the first implementation pass. Findings were
accepted and repaired before this evidence record.

| Lane | Reviewer focus | Disposition |
| --- | --- | --- |
| TypeScript refactoring / structure | Closed source union, runtime resolver ownership, prepared request typing, stale compatibility paths, public/private surface, proof env state-space, JSDoc and anchor comments. | PASS after repairs. Accepted split editor identity finding; editor source identity is now literal `studio-current` in the contract and validated in the runtime. Accepted canonical prepared request finding; server ports now expose `CanonicalRunInGameRequest` with required admitted fields. Removed the legacy `buildStandardRunInGameSourceSnapshotProof` compatibility helper. Final proof env review found the all-or-nothing deploy/generator state-space clear. |
| Code quality / Habitat authority | SA-05 authority mechanism, Habitat/Grit registration, positive structural assertions, ledgers, selected proof-marker leakage, and failure modes. | PASS after repairs. SA-05 is registered under `.habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-launch-source-boundary`, with an empty baseline and positive scoped assertions. No `.grit` authority tree was introduced. Accepted final selected-marker finding; both request id and launch envelope digest are now gated to the selected config only. |
| oRPC / Effect / library correctness | TypeBox closure, oRPC declared error behavior, Effect failure channels, source-resolution errors, Nx env inputs, cleanup build semantics, and handler serialization. | PASS after repairs. Top-level raw-control fields now pass schema only far enough for the runtime to reject them as declared `RUN_IN_GAME_INVALID`; live coverage proves public error data stays safe. Cleanup rebuilds the local deploy bundle with proof env scrubbed after materialization proof capture without invalidating the deployed mod proof. |

## Authority Notes

- SA-05 is Habitat-owned. Grit is only the runner selected by the Habitat rule
  manifest.
- The rule intentionally does not ban `sourceSnapshot` across the app. The app
  still owns client/private source relation state; Packet 5 removes those fields
  from the public start request.
- Digest stability, endpoint behavior, and generated-content launch proof remain
  behavior/live gates, not Grit assertions.
- The full initiative's ultimate Civ7 in-game proof remains open beyond Packet
  5: the patched live probes reached the runtime-control/direct-control
  boundary but did not prove post-start in-game content.
