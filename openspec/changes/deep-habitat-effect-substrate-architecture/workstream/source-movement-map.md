# Source Movement Map

## Scope

This map is the implementation input for the Effect-first source train. It maps
the current `tools/habitat-harness/src/**` tree to the target ownership tree
accepted by this packet. Later implementation packets may split a row into
smaller commits, but they must not invent a second active home for the same
behavior.

Evidence command:

```bash
find tools/habitat-harness/src -type f | sort
```

## Movement Decisions

| Current source | Files | Target home | Decision | Notes |
|---|---:|---|---|---|
| `src/bin/habitat.ts` | 1 | `src/bin/habitat.ts` | preserve host adapter | Oclif/bootstrap edge only; package metadata reads stay host-local. |
| `src/base/HabitatCommand.ts` | 1 | `src/commands/base/HabitatCommand.ts` | move | Base command remains host adapter; it may call runtime runners but must not own domain policy. |
| `src/commands/*.ts` | 6 | `src/commands/*.ts` | preserve host adapters | Commands parse flags/render output and call one runtime-backed program per command. |
| `src/lib/effect-runtime.ts` | 1 | `src/runtime/run.ts`, `src/runtime/layers.ts` | move and narrow | `Effect.run*` remains only at named runtime edges; NodeContext-only layer grows into Habitat live layer assembly. |
| `src/lib/paths.ts` | 1 | `src/config/paths.ts` | move | Root/path derivation becomes config source, not ambient module global for domains. |
| `src/lib/workspace-tools.ts` | 1 | `src/providers/workspace-tools/**`, `src/providers/command/**` | split and delete sync helper | Keep logical tool metadata; delete `materializeHabitatCommand()` after callers use provider effects. |
| `src/lib/spawn.ts` | 1 | `src/providers/command/**` | collapse | General process execution becomes `CommandRunner`; direct `spawnSync` is not retained. |
| `src/lib/habitat-process.ts` | 1 | `src/providers/command/**`, `src/errors/**` | split | Request/result observation survives; direct clock/process execution moves into provider live layer. |
| `src/substrate/providers/grit/**` | 10 | `src/substrate/providers/grit/**`, `src/domains/diagnostic-pattern-catalog/**` | enclose | Command construction, scan-root admission, diagnostics parsing, failure rendering become one self-contained Grit provider plus diagnostic domain facts. |
| `src/lib/grit.ts` | 1 | `src/substrate/providers/grit/index.ts` | delete facade | Public/internal callsites must route through explicit provider exports, then retire broad facade. |
| `src/lib/grit-env.ts` | 1 | `src/substrate/providers/grit/env.ts`, `src/config/**` | move | Grit environment/config is provider-owned and config-fed. |
| `src/lib/grit-failures.ts` | 1 | `src/substrate/providers/grit/failures.ts`, `src/errors/provider-errors.ts` | move | Preserve stable failure tags while introducing tagged provider errors. |
| `src/lib/check/**` | 11 | `src/domains/structural-check/**`, `src/domains/baseline-authority/**`, `src/domains/command-contract/**` | split | Execution/report/render state moves to domains; report output remains public-contract guarded. |
| `src/lib/check-report.ts` | 1 | `src/public/check-report.ts`, `src/domains/command-contract/**` | facade then narrow | Preserve `CheckReport` v1 behavior and exported helpers until public facade packet reclassifies exports. |
| `src/lib/diagnostics.ts` | 1 | `src/public/check-report.ts`, `src/errors/render.ts` | split | Public report schema survives; error rendering moves to errors/public-contract boundary. |
| `src/lib/fix.ts` | 1 | `src/service/modules/fix/**`, later `src/domains/transformation-transaction/**`, `src/domains/pattern-governance/**`, `src/substrate/providers/grit/**` | split and delete | `runFix` package helper export is refused; fix command orchestration moves to the Effect-oRPC service module, and lower-level transaction/pattern/Grit ownership drains in follow-on packets. |
| `src/lib/baseline-core/**` | 7 | `src/domains/baseline-authority/**` | move | Baseline state, integrity, expansion, and application become one domain service consuming Git/FS/rule registry providers. |
| `src/lib/baseline.ts` | 1 | `src/domains/baseline-authority/index.ts`, `src/public/check-report.ts` | facade during cutover | Retain only compatibility exports until public surface is narrowed. |
| `src/rules/registry/**` | 5 | `src/domains/rule-registry/**` | move | TypeBox schema and facts remain domain-owned; expected load/graph failures become tagged domain errors. |
| `src/rules/facts.ts` | 1 | `src/domains/rule-registry/facts.ts` | move | No separate rule facts home after registry domain exists. |
| `src/rules/messages.ts` | 1 | `src/domains/command-contract/render.ts` | move | Human rendering consumes public compatibility fields; does not own rule identity. |
| `src/lib/rule-selection.ts` | 1 | `src/domains/rule-selection/**` | move | Selector parsing/result state becomes explicit domain API. |
| `src/lib/classify-core/**` | 6 | `src/domains/workspace-graph-integration/**` | move | Classify state remains public-output guarded and consumes Nx/workspace graph providers. |
| `src/lib/classify.ts` | 1 | `src/public/classify.ts` | facade during cutover | Preserve current public helper imports until facade packet updates root exports. |
| `src/lib/workspace-graph/**` | 7 | `src/providers/nx/**`, `src/domains/workspace-graph-integration/**` | split | Nx graph/target facts are provider-owned; Habitat routing and target-plan decisions are domain-owned. |
| `src/lib/workspace-graph.ts` | 1 | `src/domains/workspace-graph-integration/index.ts` | facade during cutover | Delete once callsites import explicit domain/public paths. |
| `src/lib/workspace-graph-contract.ts` | 1 | `src/domains/workspace-graph-integration/schema.ts`, `src/public/classify.ts` | split | Public classify contract remains explicit; internal contract moves with domain. |
| `src/lib/nx-projects.ts` | 1 | `src/providers/nx/targets.ts` | move | Nx target metadata belongs to Nx provider. |
| `src/lib/git-state.ts` | 1 | `src/providers/git/**` | move | Git status/head/diff facts become provider operations. |
| `src/lib/graph.ts` | 1 | `src/domains/workspace-graph-integration/**`, `src/resources/temp-dir.ts` | split | Temp lifecycle and graph read/write move out of domain logic. |
| `src/lib/verify/**` | 7 | `src/domains/proof-contract/**`, `src/domains/workspace-graph-integration/**`, `src/providers/nx/**`, `src/providers/git/**` | split | Receipts remain public-contract guarded; affected execution becomes provider/domain composition. |
| `src/lib/hooks.ts` | 1 | `src/service/modules/hook/**`, later `src/domains/local-feedback/**` | split and delete | `runHook` package helper export is refused; hook command orchestration moves to the Effect-oRPC service module, and lower-level staged/restage/provider ownership drains in follow-on packets. |
| `src/lib/hook-runtime/**` | 11 | `src/domains/local-feedback/**`, `src/providers/{git,biome,grit,nx,husky}/**`, `src/resources/write-set.ts` | split | Optional runtime dependency bag is replaced by Effect requirements and fake layers. |
| `src/lib/pattern-apply/**` | 11 | `src/domains/transformation-transaction/**`, `src/substrate/providers/grit/**`, `src/domains/pattern-governance/**` | split | Apply admission, worktree, rollback, record, and render become transaction/domain responsibilities. |
| `src/lib/protected-zones/**` | 9 | `src/domains/protected-zone-authority/**`, `src/resources/filesystem.ts` | move | Protected write decisions are domain-owned; fs mutation is resource/provider-owned. |
| `src/lib/diagnostic-catalog/**` | 7 | `src/domains/diagnostic-pattern-catalog/**` | move | Diagnostic command/outcome identity remains a domain service; command execution goes through providers. |
| `src/rules/patterns/**` | 10 | `src/domains/pattern-governance/**` | move | Pattern manifest schemas, validation, views, admissions, and state are pattern governance. |
| `src/rules/architecture.ts` | 1 | `src/domains/structural-check/**`, architecture guard package if split later | split | Rule execution facts join structural-check; static architecture guard ownership is named in guardrail packet. |
| `src/lib/boundary-taxonomy.ts` | 1 | `src/domains/workspace-graph-integration/**`, future guardrail owner | split | Boundary taxonomy is classification/guard input, not a process helper. |
| `src/lib/host-policy.ts`, `src/lib/host-policy/**` | 6 | `src/domains/protected-zone-authority/**`, `src/domains/command-contract/**` | move | Host policy remains generic Habitat domain language; no product parser semantics. |
| `src/lib/artifact-paths.ts` | 1 | `src/config/paths.ts`, `src/domains/scaffolding/**` | split | Authored artifact paths remain config/domain constants, not hidden globals. |
| `src/generators/project/**` | 6 | `src/generators/project/**`, `src/domains/scaffolding/project.ts`, `src/providers/fs/**`, `src/providers/nx/generators.ts` | split | Nx generator entrypoint stays; reusable decisions/writes move behind domain/provider boundaries. |
| `src/generators/pattern/**` | 4 | `src/generators/pattern/**`, `src/domains/scaffolding/pattern.ts`, `src/domains/pattern-governance/**` | split | Pattern generator host entrypoint stays; manifest decisions use domain service. |
| `src/generators/scaffolding/**` | 2 | `src/domains/scaffolding/refusals.ts` | move | Refusal data becomes domain output with typed errors/refusals. |
| `src/plugin.ts`, `src/plugin/**` | 4 | `src/plugin/**`, `src/providers/nx/**`, `src/public/generators.ts` | preserve host adapter and split helpers | Nx plugin entrypoint remains host adapter; target definitions and schemas route through public/provider contracts. |
| `src/index.ts` | 1 | `src/public/index.ts`, root compatibility facade | narrow | Existing exports are compatibility inventory only; future public facade names stable exports and removes internal barrels. |

## Delete/Collapse Rules

- `src/lib/**`, `src/base/**`, and old adapter roots are staging homes only.
  No implementation packet may add new feature ownership there.
- Broad barrels (`export *`) may remain only as temporary compatibility
  facades named by the public-surface packet.
- An implementation packet that moves a module must classify each affected
  callsite as public contract, internal callsite, test helper, generated
  artifact, or dead code.
- Dead code is deleted in the same packet that proves no public contract or
  internal callsite remains.
