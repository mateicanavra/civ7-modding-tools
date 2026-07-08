# Verification Evidence

Packet 12 remains open. This ledger records the committed sub-slice that
introduces the private runtime-observation boundary and production public `/rpc`
readback path.

| Gate | Evidence | Result | Proof Class | Notes |
| --- | --- | --- | --- | --- |
| Studio contract typecheck | `bun nx run studio-contract:check` | Passed | Typecheck | Added typed `civ7.live.status` and `civ7.live.snapshot` output aliases. |
| Server typecheck | `bun nx run control-studio-server:check` | Passed | Typecheck | Runtime observation port, workflow transition, private operation model, and proof-builder changes compile. |
| App typecheck | `bun nx run mapgen-studio:check` | Passed | Typecheck | Production observer compiles with typed oRPC endpoint outputs and abortable calls. |
| Server behavior tests | `bun nx run control-studio-server:test` | Passed, 8 files / 122 tests | Unit/integration tests | Workflow fakes updated for the private observation record. |
| Targeted observer behavior tests | `bun nx run mapgen-studio:test -- --run test/runInGame/runtimeObservation.test.ts` | Passed, 1 file / 9 tests | Unit/integration tests | Production observer proves HTTP `/rpc` requests reach `civ7.live.status` and `civ7.live.snapshot`, plus matched correlation/deployment/setup/log evidence, shape-only marker rejection, marker mismatch/dimension mismatch, missing setup readback, endpoint unavailable, App UI embedded-error rejection, App UI not-in-game, and live snapshot dimension mismatch. |
| App behavior tests | `bun nx run mapgen-studio:test` | Passed, 69 files / 393 tests | Unit/integration tests | One-mount/server tests updated for the observation port; production runtime-observation helper now has targeted behavior coverage. |
| SA-12 Pattern Authority targeted check | `bun habitat check --rule grit-studio-run-direct-control-observation-boundary --json` | Passed, 0 diagnostics | Habitat/Grit structural authority | Registered the path-scoped source-boundary rule with an empty baseline. The rule guards the observation port, private observation record tokens, workflow call/retention, app-side Studio RPC delegation, live-client status/snapshot calls, and forbidden workflow/observer direct-control imports without converting the invariant into a Habitat structure/topology rule or brittle implementation line shapes. The concrete `/rpc` route prefix is proven by the targeted observer behavior tests. |
| SA-12 rule classification | `bun habitat classify .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-direct-control-observation-boundary` | Passed | Habitat routing | Classified as `habitat-authority`; runnable workspace `lint` plus workspace gates reported. No project-local habitat-authority check target exists. |
| MapGen Studio owner Habitat check | `bun habitat check --owner mapgen-studio --json` | Passed, 15 rules / 0 failing | Habitat authority | Includes SA-12 in the shared Grit batch with 0 diagnostics. |
| MapGen Studio Nx Habitat check | `bun nx run mapgen-studio:habitat:check --skip-nx-cache --outputStyle=static` | Passed, 15 rules / 0 failing | Nx/Habitat authority | Built dependencies and ran owner Habitat gate. Nx reported existing flaky cached tasks for `control-direct:build-bundle` and `mapgen-core:build`; the gate itself passed. |
| OpenSpec strict validation | `bun run openspec -- validate studio-run-runtime-observation --strict` | Passed | OpenSpec validation | Change `studio-run-runtime-observation` is valid. |
| Whitespace/diff sanity | `git diff --check` | Passed | Static guard | No whitespace errors in the slice. |
| TypeScript refactoring review | Reviewer lanes Aquinas, Maxwell the 2nd, Ampere the 2nd, Heisenberg the 2nd | Cleared P1/P2 | Peer review | Initial blockers repaired in the implementation slice; behavior-test slice re-review cleared after direct-control mocks were typed to real exports, log-proof fixtures became discriminated state, and correlation used `RunCorrelation`. SA-12 authority re-review cleared after brittle receiver/local-name anchors were replaced with structural call patterns and `prepared`/`RunCorrelation` positives. |
| Code quality/structure review | Reviewer lanes Aquinas the 2nd, Confucius the 2nd, Peirce the 2nd, Nash the 2nd | Cleared P1/P2 | Peer review | Private runtime observation is retained on the internal complete operation; public projection stays unchanged. Behavior-test P2 repaired by asserting actual HTTP `/rpc` status/snapshot route hits. SA-12 P2 repaired by requiring `prepared` and private `correlation: RunCorrelation` records; no Habitat `structure.toml` change is warranted for this source-boundary rule. |
| oRPC/Effect/library correctness review | Reviewer lanes Tesla the 2nd, Kant the 2nd, Lagrange the 2nd, Boyle | Cleared P1/P2/P3 | Peer review | Production readback uses public `/rpc` via `RPCLink`, not direct-control or an in-process router shortcut; behavior tests prove HTTP `/rpc` route hits while keeping `RPCHandler`, Effect runtime, and Studio procedure routing in play. SA-12 wording now scopes Habitat to the Studio RPC live-client/source boundary and leaves concrete `/rpc` prefix proof to behavior tests. |

## Sub-Slice Coverage

Implemented and locally verified:

- private `RunInGameRuntimeObservation` records for scripting log, setup row,
  loaded-game readback, deployment evidence, and correlation;
- `observeRunInGameRuntime` workflow port between fresh log proof and final proof;
- production observer using the running daemon's public `/rpc` mount for
  `civ7.live.status` and `civ7.live.snapshot`;
- requested map-size dimensions resolved from Civ7 map-size presets, matched
  against the generated runtime marker and live snapshot dimensions;
- loaded-game oracle implementation rejects embedded `status`, `appUi`, and
  `mapSummary` errors and requires App UI `inGame` proof;
- targeted production observer behavior tests proving public `/rpc` readback,
  exact marker correlation, setup-row requirement, marker-dimension requirement,
  shape-only marker rejection, endpoint-unavailable failure, App UI
  embedded-error rejection, App UI not-in-game rejection, and loaded-game
  snapshot dimension mismatch diagnostics;
- successful private observation is retained on the internal operation for
  diagnostics lookup while public status projection remains safe.

Still open for Packet 12 closure:

- remaining production observer edge coverage, if promoted into this packet
  before closure: per-field mapSummary/status embedded-error variants, snapshot
  transport failure, empty-grid/missing-dimension readbacks, and full
  run-correlation field matrix;
- OpenSpec strict validation after the full packet slice;
- Habitat classify-reported packet checks;
- live Studio endpoint plus Civ7-controlled runtime observation gate.
