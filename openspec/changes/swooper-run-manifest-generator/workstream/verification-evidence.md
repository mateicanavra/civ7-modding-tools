# Packet 8 Verification Evidence

Packet: `swooper-run-manifest-generator`

Status: Packet 8 local static and behavior verification is closed-passed for
the declared OpenSpec, Habitat, classify-reported, direct fixture CLI, Nx
target, package, workspace, and review-lane gates below. No live Studio
endpoint call or Civ7 in-game run is claimed by Packet 8; those remain
initiative-level closure gates after the later integration packets.

## Product Proof

Packet 8 makes Swooper request generation manifest-only: one private
`StudioRunGenerationManifest` path goes in, one request-local generated mod
tree comes out. The generator does not scan the shipped catalog, does not use
ambient request environment, and does not write shared generated/mod outputs.

The request workspace contract now lives in `@civ7/studio-run-workspace`, so
the Studio server and Swooper generator read and write the same manifest shape
without coupling Swooper to server internals. Generated runtime assets embed one
`RunCorrelation` tuple, and SDK proof payload fields are derived from that tuple
instead of accepted as parallel truths.

Direct fixture CLI proof used:

`openspec/changes/swooper-run-manifest-generator/workstream/logs/packet-8-verification-remainder-2026-07-08.log`

Final post-repair Nx target proof used:

`openspec/changes/swooper-run-manifest-generator/workstream/logs/packet-8-nx-output-repair-final-2026-07-08.log`

Final ledger validation after this evidence file was updated used:

`openspec/changes/swooper-run-manifest-generator/workstream/logs/packet-8-ledger-finalization-2026-07-08.log`

The final repair proof generated request artifact
`run-a8ee760cfce35373c69e` under the manifest's request-local `generated-mod`
root.

## Static And Behavior Gates

| Gate id | Required | Command/protocol | Preconditions | Result | Artifact | Oracle | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| workspace-contract-check | Required shared contract gate | `nx run studio-run-workspace:check --skip-nx-cache --outputStyle=static` | `@civ7/studio-run-workspace` package introduced | Exit `0` | `workstream/logs/packet-8-verification-2026-07-08.log` | Shared manifest/path/correlation contract typechecks. | PASS |
| workspace-contract-tests | Required shared contract gate | `nx run studio-run-workspace:test --skip-nx-cache --outputStyle=static` | Manifest parsing, digest, and path helpers implemented | Exit `0` | `workstream/logs/packet-8-verification-2026-07-08.log` | Manifest digest, parsing, safe ids, and workspace path behavior are covered at the owning package. | PASS |
| workspace-contract-build | Required shared contract gate | `nx run studio-run-workspace:build --skip-nx-cache --outputStyle=static` | Package is consumed by server and Swooper | Exit `0` | `workstream/logs/packet-8-verification-2026-07-08.log` | Shared package can be built for downstream consumers. | PASS |
| focused-generator-tests | Required | `bun test mods/mod-swooper-maps/test/config/run-manifest-generator.test.ts` | Manifest-only generator implemented | Exit `0`; `5` tests passed; `18` expects | `workstream/logs/packet-8-verification-2026-07-08.log` | Fixture manifests verify generated content, recipe rejection, single manifest behavior, request-local output, and invalid manifest failures. | PASS |
| focused-file-plan-and-generator-tests | Required regression gate | `bun test mods/mod-swooper-maps/test/config/map-artifact-file-plan.test.ts mods/mod-swooper-maps/test/config/run-manifest-generator.test.ts` | File plan extended for request generation and output root safety | Exit `0`; `13` tests passed; `104` expects | `workstream/logs/packet-8-verification-2026-07-08.log` | Existing file-plan writer safety and new run generator behavior remain coherent together. | PASS |
| mod-check | Required classify-reported package gate | `nx run mod-swooper-maps:check --skip-nx-cache --outputStyle=static` | Generator target, package deps, and shared manifest package wired | Exit `0` | Final post-repair pass in `workstream/logs/packet-8-nx-output-repair-final-2026-07-08.log` | Swooper package type/build surface remains green after the target-output repair. | PASS |
| mod-studio-run-tests | Required packet-specific package gate | `nx run mod-swooper-maps:test:studio-run-in-game --skip-nx-cache --outputStyle=static` | Packet 8 focused tests included in target | Exit `0`; `17` tests passed; `234` expects | Final post-repair pass in `workstream/logs/packet-8-nx-output-repair-final-2026-07-08.log` | Swooper Run in Game behavior remains green through the package target after the target-output repair. | PASS |
| sdk-check | Required consumer contract gate | `nx run civ7-sdk:check --skip-nx-cache --outputStyle=static` | SDK generated-map proof payload now derives from `runCorrelation` | Exit `0` | `workstream/logs/packet-8-verification-2026-07-08.log` | SDK public types compile with collapsed run correlation truth. | PASS |
| sdk-tests | Required consumer contract gate | `nx run civ7-sdk:test --skip-nx-cache --outputStyle=static` | SDK map creation tests updated | Exit `0`; `6` files and `10` tests passed | `workstream/logs/packet-8-verification-2026-07-08.log` | SDK behavior proves generated map proof payload derives from correlation. | PASS |
| server-check | Required server consumer gate | `nx run control-studio-server:check --skip-nx-cache --outputStyle=static` | Server consumes shared workspace package | Exit `0` | `workstream/logs/packet-8-verification-2026-07-08.log` | Server operation-runtime types remain green after moving manifest helpers out of server internals. | PASS |
| server-tests | Required server consumer gate | `nx run control-studio-server:test --skip-nx-cache --outputStyle=static` | Server operation-runtime tests updated to shared reader | Exit `0`; `8` files and `118` tests passed | `workstream/logs/packet-8-verification-2026-07-08.log` | Existing public/private status, diagnostics, registry, and manifest behavior survive the package extraction. | PASS |
| app-check | Required app gate | `nx run mapgen-studio:check --skip-nx-cache --outputStyle=static` | Server and app packages updated | Exit `0` | `workstream/logs/packet-8-verification-2026-07-08.log` | Studio app type/build surface remains green. | PASS |
| app-tests | Required app gate | `nx run mapgen-studio:test --skip-nx-cache --outputStyle=static` | Packet changes applied | Exit `0`; `67` files and `381` tests passed | `workstream/logs/packet-8-verification-2026-07-08.log` | MapGen Studio unit/integration tests passed; no live endpoint or Civ7 run exercised by this packet gate. | PASS |
| direct-generator-command | Required direct fixture CLI proof | `bun ./scripts/generate-run-manifest.ts <manifest path>` from `mods/mod-swooper-maps` | Fixture manifest points at request-local workspace | Exit `0`; generated `run-bd651b6cced8c0299c24` | `workstream/logs/packet-8-verification-remainder-2026-07-08.log` | CLI accepts exactly one manifest path and writes the generated mod under the manifest's output root. | PASS |
| nx-generator-target | Required Nx target proof | `nx run mod-swooper-maps:gen:run-manifest --skip-nx-cache --outputStyle=static -- <manifest path>` | `gen:run-manifest` target registered and deps available | Exit `0`; final repair pass generated `run-a8ee760cfce35373c69e` | Final post-repair pass in `workstream/logs/packet-8-nx-output-repair-final-2026-07-08.log` | Nx can invoke the manifest-only generator path with declared build deps after the target-output repair. | PASS |
| sa07-shared-topology | Required authority gate | `bun habitat check --rule structure-studio-run-workspace-topology --json` | SA-07 retargeted to `packages/studio-run-workspace/src` | Exit `0`; rule status `pass` | `workstream/logs/packet-8-verification-remainder-2026-07-08.log` | Shared request workspace contract source topology is Habitat-owned; runtime workspaces remain evidence, not source topology. | PASS |
| sa08-boundary | Required authority gate | `bun habitat check --rule grit-swooper-run-manifest-generator-boundary --json` | SA-08 registered in Habitat | Exit `0`; rule status `pass` | `workstream/logs/packet-8-verification-remainder-2026-07-08.log` | Generator topology has one manifest-input command and one manifest-path port that uses the file-plan writer. | PASS |
| sa06-writer-regression | Required because writer boundary changed | `bun habitat check --rule grit-swooper-map-render-file-plan-boundary --json` | File-plan writer gained output-root symlink refusal | Exit `0`; rule status `pass` | `workstream/logs/packet-8-verification-remainder-2026-07-08.log` | Existing file-plan writer filesystem boundary remains green. | PASS |
| mapgen-owner-habitat | Required owner gate | `bun habitat check --owner mapgen-studio --json` | Shared manifest package and server changes applied | Exit `0`; owner check `ok: true` | `workstream/logs/packet-8-verification-remainder-2026-07-08.log` | MapGen Studio Habitat authority remains green. | PASS |
| swooper-owner-habitat | Required owner gate | `bun habitat check --owner mod-swooper-maps --json` | SA-08 registered under `mod-swooper-maps` owner and target-output repair applied | Exit `0`; owner check `ok: true`; SA-06 and SA-08 enforced rules passed | Final post-repair pass in `workstream/logs/packet-8-nx-output-repair-final-2026-07-08.log` | Swooper owner authority remains green after the bundle target no longer deletes/generated-cache-claims `standard-artifacts.js`. Existing Packet 4 catalog-index advisory remains advisory-only and nonblocking. | PASS |
| openspec-strict | Required | `bun run openspec -- validate swooper-run-manifest-generator --strict` | Packet 8 implementation and tasks/evidence in place | Exit `0`; change is valid | Final post-repair pass in `workstream/logs/packet-8-nx-output-repair-final-2026-07-08.log` | OpenSpec packet remains valid. | PASS |
| workspace-lint | Required workspace hygiene gate | `bun run lint` | Packet 8 code, tests, and authority files formatted | Exit `0`; lint succeeded for `9` projects | Final post-repair pass in `workstream/logs/packet-8-nx-output-repair-final-2026-07-08.log` | Workspace lint remains green. | PASS |
| diff-whitespace | Required hygiene gate | `git diff --check` | Packet 8 diff staged in working tree | Exit `0` | Final post-repair pass in `workstream/logs/packet-8-nx-output-repair-final-2026-07-08.log` | Diff has no whitespace errors. | PASS |

After the evidence ledger edits, `workstream/logs/packet-8-ledger-finalization-2026-07-08.log`
reran OpenSpec strict validation, workspace lint, and `git diff --check`; all
three passed.

## Discarded Red Captures

- `workstream/logs/packet-8-verification-2026-07-08.log` ends red only after
  the listed gates through `mapgen-studio:test` had passed. The red command was
  a root `bun --eval` evidence harness that could not resolve
  `@civ7/studio-run-workspace`; it was not a product or authority gate. The
  direct fixture manifest capture was rerun through source imports in the
  remainder log.
- `workstream/logs/packet-8-verification-remainder-2026-07-08.log` exposed a
  real target-output ownership bug: after `build:studio-recipes:bundle`,
  `bun habitat check --owner mod-swooper-maps --json` failed because
  `dist/recipes/standard-artifacts.js` had been deleted.
- `workstream/logs/packet-8-nx-output-repair-2026-07-08.log` is discarded as
  proof because it used a stale temp manifest path after cleanup and failed with
  `ENOENT`. The final repair log replaces it.

## Nx Artifact Topology Repair

The red owner check was not a reason to waive Habitat. It showed that
`mod-swooper-maps:build:studio-recipes:bundle` had been claiming and cleaning
too much. That target bundles only `dist/recipes/standard.js`, while
`gen:studio-recipes-types` owns `dist/recipes/standard-artifacts.js` and
`standard-artifacts.d.ts`.

The authority-correct repair was to narrow output ownership and stop the bundle
from cleaning sibling generated artifacts: `build:studio-recipes:bundle` now
declares only `{projectRoot}/dist/recipes/standard.js`, and
`tsup.studio-recipes.config.ts` uses `clean: false`. Ptolemy reviewed this as
the minimal topology fix and explicitly rejected adding
`gen:studio-recipes-types` as a dependency of `gen:run-manifest`, because the
run-manifest generator does not consume the artifact.

Final proof lives in
`workstream/logs/packet-8-nx-output-repair-final-2026-07-08.log`: after a fresh
`build:studio-recipes`, fresh `gen:run-manifest`, and artifact preservation
probe, `standard.js`, `standard-artifacts.js`, and `standard-artifacts.d.ts`
were all present; `bun habitat check --owner mod-swooper-maps --json`,
`nx run mod-swooper-maps:check`, `nx run mod-swooper-maps:test:studio-run-in-game`,
OpenSpec strict validation, workspace lint, and `git diff --check` all passed.

## Pattern Authority Evidence

SA-08 is a registered enforced Habitat rule:

- Rule: `grit-swooper-run-manifest-generator-boundary`
- Owner project: `mod-swooper-maps`
- Runner: Grit through Habitat, not a standalone `.grit` authority tree
- Owner surface: CLI shim, manifest generator port, and Nx target registration
- Exact scan roots: `mods/mod-swooper-maps/scripts/generate-run-manifest.ts`,
  `mods/mod-swooper-maps/scripts/run-manifest-generator.ts`, and
  `mods/mod-swooper-maps/project.json`
- Baseline contract: `baseline.json` is an empty `[]`; current-tree violations
  are not grandfathered
- Fixture strategy: `pattern.md` contains Matches and Ignores fixtures for the
  topology. Behavior tests own generated content and invalid-input semantics.
- Current-tree proof: `sa08-boundary` passed in
  `workstream/logs/packet-8-verification-remainder-2026-07-08.log`
- Hook scope: no separate hook scope. Enforcement runs through Habitat rule and
  owner checks.
- Promotion/removal: permanent positive topology assertion for Packet 8's
  manifest-only generator boundary

## Review Lanes

| Lane | Reviewer focus | Disposition |
| --- | --- | --- |
| TypeScript refactoring | Lagrange (`019f3f29-eec1-7450-acae-946db1871ef4`) reviewed shared manifest package extraction, type-level run correlation, duplicate proof payload truths, reachable state, public type drift, JSDoc and anchor comments. | PASS. The duplicated-correlation finding was accepted and repaired by making `RunCorrelation` the single proof tuple and deriving SDK proof fields from it. |
| Code quality / structure / Habitat | Darwin (`019f3f2a-1a23-7df0-97b7-37dae554cba0`) reviewed SA-08 authority shape, scan roots, non-brittle Grit pattern use, file-plan writer safety, shared package topology, JSDoc and anchor comments. | PASS. Findings were accepted and repaired: SA-08 now targets durable generator topology with exact owned scan roots, and the writer refuses symlinked output roots before cleanup or writes. |
| oRPC / Effect / library correctness | Gauss (`019f3f2a-3e38-73b1-ace8-f9cf0ac859be`) reviewed server contract drift, oRPC surface stability, Effect/resource implications, esbuild usage, TypeScript path jail semantics, manifest recipe validity, JSDoc and anchor comments. | PASS. No oRPC contract drift found. Library findings were accepted and repaired: the generator rejects non-standard recipe manifests before writes, path jail uses absolute/parent-segment checks, and `fileCount` includes bundled output. |
| Proof ledger / closure | Locke (`019f3f38-db72-7412-bcf5-d24bc5b63022`) reviewed evidence durability, Pattern Authority metadata, review-lane specificity, live-proof wording, and deferral clarity. | PASS. Accepted findings were repaired in this evidence ledger by citing durable log files, separating discarded red captures from proof, recording SA-08 authority metadata, and narrowing Packet 8 claims to local static/behavior proof. |
| Nx target topology | Ptolemy (`019f3f41-e367-7db0-bbee-9feebf33fe47`) reviewed the `standard-artifacts.js` owner-check failure and target-output repair. | PASS. The narrow output ownership repair is accepted as the minimal authority-correct fix. |

## Review Finding Disposition

| Reviewer | Finding | Disposition | Repair proof |
| --- | --- | --- | --- |
| Darwin / Code quality + Habitat | SA-08 was red because the Grit function signature pattern was too exact for TypeScript return annotations. | Accepted. Pattern now matches the durable exported port shape without freezing the full function body. | `sa08-boundary` and `swooper-owner-habitat` green. |
| Darwin / Code quality + Habitat | SA-08 scan roots were broader than the packet's authority claim. | Accepted. Rule metadata and the structural authority matrix now scan only `generate-run-manifest.ts`, `run-manifest-generator.ts`, and `project.json`. | `sa08-boundary` green. |
| Darwin / Code quality + Habitat | A symlinked generated-mod output root could escape the request workspace before cleanup or writes. | Accepted. The file-plan writer now refuses a symlinked output root before resolving, deleting, or writing below it. | `focused-file-plan-and-generator-tests`, `sa06-writer-regression`, and `mod-studio-run-tests` green. |
| Darwin / Code quality + Habitat | SA-07 does not yet enforce package metadata around the shared workspace contract package. | Rejected as a Packet 8 closure requirement. SA-07's Packet 8 claim is source topology under `packages/studio-run-workspace/src`; package metadata hardening is a future authority expansion, not evidence required by SA-07/SA-08. Risk: package exports/deps can drift without SA-07. Trigger: a packet that changes package publication/import authority or a failing consumer due metadata drift. Repair: add a separate Habitat metadata rule or extend SA-07 with `package.json`/`project.json` scope after source-map authority is updated. | Recorded here so it is not silently treated as proof. |
| Lagrange / TypeScript | Generated map proof payload duplicated request id, artifact id, and digests as loose truths beside `runCorrelation`, and SDK accepted untyped `unknown` correlation. | Accepted. SDK now exposes typed `MapRunCorrelation`; generated sources pass one `runCorrelation`, and flat proof fields are derived inside `createMap`. | `sdk-check`, `sdk-tests`, and `mod-studio-run-tests` green. |
| Gauss / oRPC + Effect + library correctness | Generator accepted any manifest recipe while emitting standard Swooper content. | Accepted. Generator now rejects manifests unless both manifest request recipe and launch-envelope recipe are `mod-swooper-maps/standard`. | `focused-generator-tests` includes non-standard recipe rejection; `direct-generator-command` still passes for standard fixture. |
| Gauss / oRPC + Effect + library correctness | Path jail should use platform path semantics instead of only a string prefix. | Accepted. Shared workspace path jail now rejects absolute root-relative values and parent-segment escapes with `path.isAbsolute` and platform separators. | `workspace-contract-tests` green. |
| Gauss / oRPC + Effect + library correctness | Generator `fileCount` underreported bundled map output. | Accepted. Return value now counts planned files plus the bundled map file plan. | `focused-generator-tests` green. |
| Locke / Proof ledger | Evidence rows cited inline terminal output instead of durable log artifacts, and mixed discarded red harness captures with proof. | Accepted. The ledger now points each gate to a durable log, records discarded red captures separately, and cites the final repair log for post-repair gates. | This document plus final OpenSpec validation. |
| Ptolemy / Nx topology | The owner-check failure was caused by broad bundle output ownership and cleaning, not by a missing `gen:run-manifest` dependency on `gen:studio-recipes-types`. | Accepted. `build:studio-recipes:bundle` now owns only `dist/recipes/standard.js`, and tsup no longer cleans sibling generated artifacts. | `workstream/logs/packet-8-nx-output-repair-final-2026-07-08.log`. |

## Authority Notes

- Habitat remains the authority plane. SA-08 uses Grit only as the runner
  registered by the Habitat rule manifest; no parallel `.grit` authority tree
  was introduced.
- SA-08 deliberately asserts the durable generator boundary rather than the
  exact implementation body: CLI shim has one manifest argument, generator port
  reads one manifest path, output root comes from the manifest, and all
  filesystem mutation routes through the Swooper file-plan writer.
- Behavior tests own generated content semantics, invalid input behavior, and
  recipe compatibility. Habitat owns topology and boundary assertions.
- Packet 8 does not connect the Studio workflow to the Swooper generator. That
  integration remains for the next packet.
