# Static Inventory

## Scope

Blocker scope for direct-use code smells is production Habitat source and
package-local scripts:

- `tools/habitat-harness/src/**`
- `tools/habitat-harness/scripts/**`

Authored-artifact scope is `.habitat/rules/**` and `.habitat/patterns/**`.
Those files are not runtime source, but they are public Habitat authored data
and must be inventoried for file kind, executable-code risk, product/workstream
vocabulary, and rule/pattern count.

Tests and fixtures are classified as `test-helper` by default. A later
implementation packet that edits a test file must still account for direct-use
matches in that write set.

Inventory command:

```bash
rg -n "Effect\\.run|NodeRuntime\\.run|process\\.exit\\(|spawnSync|execSync|execFileSync|Bun\\.spawn|Bun\\.spawnSync|node:child_process|Command\\.make|Command\\.start|process\\.(stdout|stderr|stdin|argv|exitCode)|from \"node:fs\"|from \"node:fs/promises\"|readFileSync|writeFileSync|mkdirSync|rmSync|mkdtempSync|existsSync|statSync|readdirSync|process\\.env|process\\.cwd|Date\\.now|new Date|throw new Error|export \\*|ownerTool" tools/habitat-harness/src tools/habitat-harness/scripts
find .habitat/rules -mindepth 2 -maxdepth 2 -name rule.json
find .habitat/patterns/checks -type f -name "*.md"
find .habitat/patterns/apply -type f -name "*.md"
find .habitat -type f | rg "\\.(ts|tsx|js|jsx|mjs|cjs|sh|bash|zsh)$"
```

## Summary

| Class | Hits | Files | Default disposition |
|---|---:|---:|---|
| Runtime runner | 3 | 3 | host-adapter-edge or domain-violation |
| Process execution and process stream edge | 15 | 9 | runtime-provider-owned, host-adapter-edge, or script-helper |
| Filesystem/temp | 60 | 17 | runtime-provider-owned, host-adapter-edge, or domain-violation |
| Environment/config | 4 | 4 | runtime-provider-owned or config/provider-owned |
| Time | 24 | 6 | runtime-provider-owned or host-adapter-edge |
| Generic expected errors | 23 | 16 | domain-violation unless impossible invariant |
| Public/internal broad exports | 6 | 4 | public-contract-risk |
| Mixed `ownerTool` authority | 68 | 21 | public-contract-risk until command-contract facade exists |
| Vocabulary leakage | 168 | 54 | allowlisted authored rule/pattern examples or domain-violation |
| Authored `.habitat` rule records | 50 | 50 | authored-data |
| Authored `.habitat` check patterns | 33 | 33 | authored-data |
| Authored `.habitat` apply patterns | 3 | 3 | authored-data |
| Executable code files under `.habitat` | 0 | 0 | no current executable-code violation |

## Runtime Runner Hits

| File | Lines | Disposition | Repair owner |
|---|---|---|---|
| `tools/habitat-harness/src/lib/effect-runtime.ts` | 12 | host-adapter-edge | Move to `src/runtime/run.ts`. |
| `tools/habitat-harness/src/lib/workspace-tools.ts` | 73 | domain-violation | Delete sync helper after `WorkspaceToolProvider` consumers use Effects. |
| `tools/habitat-harness/scripts/validate-cli-smoke.ts` | 75 | script-helper | None; script may exit. |

## Process Execution And Process Stream Hits

| File | Lines | Disposition | Repair owner |
|---|---|---|---|
| `tools/habitat-harness/scripts/validate-cli-smoke.ts` | 35 | script-helper | None. |
| `tools/habitat-harness/scripts/write-generator-schemas.ts` | 1, 16 | script-helper | None unless promoted into runtime. |
| `tools/habitat-harness/src/bin/habitat.ts` | 13 | host-adapter-edge | Oclif bootstrap owns argv handoff. |
| `tools/habitat-harness/src/commands/fix.ts` | 23, 24 | host-adapter-edge | Command adapter writes rendered output only. |
| `tools/habitat-harness/src/commands/graph.ts` | 18, 19 | host-adapter-edge | Command adapter writes rendered output only. |
| `tools/habitat-harness/src/commands/hook.ts` | 24, 25 | host-adapter-edge | Command adapter writes rendered output only. |
| `tools/habitat-harness/src/commands/verify.ts` | 84, 85 | host-adapter-edge | Command adapter writes rendered output only. |
| `tools/habitat-harness/src/lib/habitat-process.ts` | 170, 174, 176 | runtime-provider-owned | `CommandRunner` owns Effect platform command execution and stream collection. |
| `tools/habitat-harness/src/lib/spawn.ts` | 1, 21 | runtime-provider-owned | Collapse into `src/providers/command/**`. |

## Filesystem And Temp Hits

| File | Lines | Disposition | Repair owner |
|---|---|---|---|
| `tools/habitat-harness/scripts/write-generator-schemas.ts` | 2, 22 | script-helper | None unless promoted into runtime. |
| `tools/habitat-harness/src/adapters/grit/docs-apply.ts` | 1, 179 | runtime-provider-owned | `GritProvider` plus `ResourceScope`. |
| `tools/habitat-harness/src/adapters/grit/request.ts` | 1, 149, 175, 176 | runtime-provider-owned | `GritProvider` plus `ResourceScope`. |
| `tools/habitat-harness/src/adapters/grit/scan-roots/index.ts` | 1, 34, 86, 144, 146, 155, 172, 174, 184, 185, 191 | runtime-provider-owned | `GritProvider` scan-root admission. |
| `tools/habitat-harness/src/bin/habitat.ts` | 3, 10 | host-adapter-edge | Oclif bootstrap may read package metadata. |
| `tools/habitat-harness/src/lib/baseline-core/context.ts` | 1, 96 | domain-violation | `BaselineAuthority` consumes `HabitatFileSystem`. |
| `tools/habitat-harness/src/lib/baseline-core/integrity.ts` | 1, 35, 36 | domain-violation | `BaselineAuthority` consumes `HabitatFileSystem`. |
| `tools/habitat-harness/src/lib/baseline-core/state.ts` | 1, 32, 61, 62 | domain-violation | `BaselineAuthority` consumes `HabitatFileSystem`. |
| `tools/habitat-harness/src/lib/boundary-taxonomy.ts` | 1 | domain-violation | Workspace graph integration consumes config/fs provider. |
| `tools/habitat-harness/src/lib/check/render.ts` | 1, 11 | public-contract-risk | `CommandContract` writes through reporter/fs provider. |
| `tools/habitat-harness/src/lib/classify-core/diff.ts` | 1, 8, 9 | domain-violation | `WorkspaceGraphIntegration` consumes fs provider. |
| `tools/habitat-harness/src/lib/classify-core/path.ts` | 1, 120, 122 | domain-violation | `WorkspaceGraphIntegration` consumes fs provider. |
| `tools/habitat-harness/src/lib/graph.ts` | 1, 9, 16, 23 | domain-violation | `ResourceScope` temp dir plus `NxProvider`. |
| `tools/habitat-harness/src/lib/hook-runtime/resource-inspection.ts` | 1, 27 | domain-violation | `LocalFeedback` consumes fs/resource provider. |
| `tools/habitat-harness/src/lib/hook-runtime/staged-worktree.ts` | 2, 27, 60, 61 | domain-violation | `GitProvider` and `HabitatFileSystem`. |
| `tools/habitat-harness/src/lib/workspace-graph/inventory.ts` | 1, 58, 63, 97, 99, 100 | domain-violation | `NxProvider`/workspace inventory provider. |
| `tools/habitat-harness/src/rules/registry/load.ts` | 1, 77, 79, 129, 147 | domain-violation | `RuleRegistry` consumes fs provider. |

## Environment And Config Hits

| File | Lines | Disposition | Repair owner |
|---|---|---|---|
| `tools/habitat-harness/scripts/validate-cli-smoke.ts` | 37 | script-helper | None. |
| `tools/habitat-harness/src/lib/grit-failures.ts` | 89 | runtime-provider-owned | `GritProviderError` context from config/provider request. |
| `tools/habitat-harness/src/lib/spawn.ts` | 19 | runtime-provider-owned | `CommandRunner` environment delta. |
| `tools/habitat-harness/src/lib/verify/command-output.ts` | 26 | domain-violation | `ProofContract` consumes `HabitatConfig`. |

## Time Hits

| File | Lines | Disposition | Repair owner |
|---|---|---|---|
| `tools/habitat-harness/src/commands/verify.ts` | 37, 38, 61 | host-adapter-edge until verify cutover | Then `ProofContract` consumes `HabitatClock`. |
| `tools/habitat-harness/src/lib/check/execution.ts` | 93, 95, 168, 170, 187, 189, 205 | domain-violation | `StructuralCheck` consumes `HabitatClock`. |
| `tools/habitat-harness/src/lib/check/report.ts` | 165, 176 | domain-violation | `StructuralCheck`/`CommandContract` consume `HabitatClock`. |
| `tools/habitat-harness/src/lib/check/selection.ts` | 8, 18, 45 | domain-violation | `RuleSelection`/`StructuralCheck` consume `HabitatClock`. |
| `tools/habitat-harness/src/lib/habitat-process.ts` | 65, 122, 141, 167, 168, 179, 188, 190 | runtime-provider-owned | `CommandRunner` consumes `HabitatClock`. |
| `tools/habitat-harness/src/lib/hook-runtime/runtime.ts` | 46 | domain-violation | `LocalFeedback` consumes `HabitatClock`. |

## Generic Error Hits

| File | Lines | Disposition | Repair owner |
|---|---|---|---|
| `tools/habitat-harness/src/generators/pattern/generator.ts` | 150 | domain-violation | `Scaffolding` typed refusal/error. |
| `tools/habitat-harness/src/generators/project/decision.ts` | 157 | domain-violation | `Scaffolding` typed refusal/error. |
| `tools/habitat-harness/src/lib/baseline-core/integrity.ts` | 189 | domain-violation | `BaselineAuthority` typed error. |
| `tools/habitat-harness/src/lib/baseline-core/state.ts` | 97 | domain-violation | `BaselineAuthority` typed error. |
| `tools/habitat-harness/src/lib/boundary-taxonomy.ts` | 429 | domain-violation | Workspace graph typed error. |
| `tools/habitat-harness/src/lib/check/baseline.ts` | 42, 53 | invariant-violation | Convert to `InvariantViolation` or eliminate state. |
| `tools/habitat-harness/src/lib/check/render.ts` | 18 | public-contract-risk | `PublicContractError`. |
| `tools/habitat-harness/src/lib/check/report.ts` | 45, 48, 51 | invariant-violation | Convert to `InvariantViolation` or eliminate state. |
| `tools/habitat-harness/src/lib/classify-core/schema.ts` | 198 | domain-violation | Classify typed error. |
| `tools/habitat-harness/src/lib/diagnostic-catalog/command.ts` | 276 | invariant-violation | Diagnostic command invariant. |
| `tools/habitat-harness/src/lib/verify/schema.ts` | 307 | public-contract-risk | `PublicContractError`. |
| `tools/habitat-harness/src/lib/workspace-graph/states.ts` | 213 | domain-violation | Workspace graph typed error. |
| `tools/habitat-harness/src/plugin/nx-plugin.ts` | 89 | host-adapter-edge | Nx plugin adapter error boundary. |
| `tools/habitat-harness/src/rules/patterns/apply-admissions.ts` | 39 | invariant-violation | Pattern governance invariant. |
| `tools/habitat-harness/src/rules/registry/graph.ts` | 19, 64 | domain-violation | Rule registry typed error. |
| `tools/habitat-harness/src/rules/registry/load.ts` | 81, 117, 131, 137 | domain-violation | Rule registry typed error. |

## Public/Internal Export Hits

### Broad Barrels

| File | Lines | Disposition | Repair owner |
|---|---|---|---|
| `tools/habitat-harness/src/lib/classify.ts` | 1 | public-contract-risk | Public facade packet. |
| `tools/habitat-harness/src/lib/host-policy.ts` | 1 | public-contract-risk | Public facade or internal-only proof. |
| `tools/habitat-harness/src/lib/host-policy/index.ts` | 20 | public-contract-risk | Internal facade narrowing. |
| `tools/habitat-harness/src/rules/registry/index.ts` | 2, 3, 4 | public-contract-risk | Rule registry public/internal split. |

### Root Package Barrel

`tools/habitat-harness/src/index.ts` exports the current package root surface.
This packet does not reclassify each symbol; the row-level authority is the
second-domino ledger:

- `openspec/changes/deep-habitat-effect-substrate-architecture/workstream/public-surface-ledger.md`
- `docs/projects/habitat-harness/public-surface-compatibility-matrix.md`

High-risk export families for this guardrail packet:

- root runtime/process symbols: `D0-package-export-symbol-runhabitateffect`,
  `D0-package-export-symbol-habitatprocess`,
  `D0-package-export-symbol-habitatprocesslive`,
  `D0-package-export-symbol-makefakehabitatprocesslayer`,
  `D0-package-export-symbol-materializehabitatcommand`;
- graph/git/fix symbols: `D0-package-export-symbol-runfix`,
  `D0-package-export-symbol-rungraph`,
  `D0-package-export-symbol-readgitstate`;
- check/classify/verify DTO and helper rows named in the second-domino ledger;
- rule and pattern rows named in the second-domino ledger.

### Plugin And Package Manifest

| Surface | Evidence | Disposition | Repair owner |
|---|---|---|---|
| Package root export | `tools/habitat-harness/package.json` `exports["."]` -> `./src/index.ts` | public-contract-risk | Public surface facade packet. |
| Plugin subpath export | `tools/habitat-harness/package.json` `exports["./plugin"]` -> `./src/plugin.ts` | generated/plugin contract risk | Nx provider/plugin cutover. |
| Package files allowlist | `tools/habitat-harness/package.json` `files[]` | package-export risk | Public surface facade packet. |
| Plugin entrypoint | `tools/habitat-harness/src/plugin.ts` exports `createNodesV2` | plugin contract risk | Nx provider/plugin cutover. |

## Mixed `ownerTool` Authority

`ownerTool` has 68 hits across 21 production files. These are public-contract
risk until `CommandContract` owns the v1 facade and internals use
`domainAuthorityId`, `providerId`, and `capabilityId`.

Affected files:

- `tools/habitat-harness/src/generators/pattern/generator.ts`
- `tools/habitat-harness/src/lib/baseline-core/context.ts`
- `tools/habitat-harness/src/lib/baseline-core/integrity.ts`
- `tools/habitat-harness/src/lib/baseline-core/schema.ts`
- `tools/habitat-harness/src/lib/check/baseline.ts`
- `tools/habitat-harness/src/lib/check/report.ts`
- `tools/habitat-harness/src/lib/check/schema.ts`
- `tools/habitat-harness/src/lib/check/selection.ts`
- `tools/habitat-harness/src/lib/check/state.ts`
- `tools/habitat-harness/src/lib/check/summaries.ts`
- `tools/habitat-harness/src/lib/classify-core/routing.ts`
- `tools/habitat-harness/src/lib/classify-core/schema.ts`
- `tools/habitat-harness/src/lib/rule-selection.ts`
- `tools/habitat-harness/src/rules/messages.ts`
- `tools/habitat-harness/src/rules/patterns/rule-reference.ts`
- `tools/habitat-harness/src/rules/patterns/schema.ts`
- `tools/habitat-harness/src/rules/patterns/state.ts`
- `tools/habitat-harness/src/rules/patterns/validation.ts`
- `tools/habitat-harness/src/rules/registry/facts.ts`
- `tools/habitat-harness/src/rules/registry/graph.ts`
- `tools/habitat-harness/src/rules/registry/schema.ts`

## Option Bags And One-Implementation Abstractions

| Surface | Evidence | Disposition | Repair owner |
|---|---|---|---|
| Grit options | `src/adapters/grit/runner.ts`, `request.ts`, `types.ts`, `diagnostics.ts`, `scan-roots/index.ts` | domain-violation | Replace loose option bags with `GritProvider` requests and fake layers. |
| Hook runtime bag | `src/lib/hook-runtime/runtime.ts`, `src/lib/hooks.ts`, hook-runtime helpers | domain-violation | Replace with `LocalFeedback` requirements and provider layers. |
| Baseline context bag | `src/lib/baseline-core/context.ts` | domain-violation | Replace with `BaselineAuthority` requirements. |
| Fix/pattern apply process layer option | `src/lib/fix.ts`, `src/lib/pattern-apply/run.ts` | domain-violation | Replace with `TransformationTransaction` requirements. |
| Classify Nx reader option | `src/lib/classify-core/index.ts` | domain-violation | Replace with `NxProvider` fake/live layers. |
| Workspace tool provider | `src/lib/workspace-tools.ts` | one-implementation abstraction | Convert to provider service with no sync materializer. |
| Hook reporter | `src/lib/hook-runtime/runtime.ts` | one-method abstraction | Fold into reporter provider or event capture service. |

## Vocabulary Hits

The vocabulary scan finds 168 hits across 54 files. Most are expected in
authored rule/pattern examples under `.habitat/**` or host-policy declarations.
Production source hits that remain relevant to this packet:

- `tools/habitat-harness/src/lib/host-policy/declarations.ts`: explicit
  host declarations for Swooper Maps, Civ7 resources, Civ7 map policy, and
  MapGen workflows; disposition `host-declaration-allowlist`.
- `tools/habitat-harness/src/lib/verify/schema.ts`: "step" appears in verify
  receipt descriptions; disposition `public-contract-risk` until
  `ProofContract` owns wording.

Future language guardrails belong to
`deep-habitat-effect-artifact-language-enforcement`; this packet only records
the current inventory and owner paths.

## `.habitat` Authored Artifact Inventory

| Artifact class | Count | File kinds | Disposition |
|---|---:|---|---|
| Rule records | 50 | `rule.json` | authored-data; no executable-code files. |
| Check patterns | 33 | Markdown-backed Grit patterns | authored-data; product vocabulary allowed inside domain-specific rule examples. |
| Apply patterns | 3 | Markdown-backed Grit apply patterns | authored-data; worktree path examples allowed only where pattern intent requires them. |
| Executable code under `.habitat` | 0 | none | no current executable-code violation. |

Allowed vocabulary in `.habitat/**`:

- Product/host vocabulary when the rule or pattern is product-specific.
- Workstream vocabulary inside pattern examples only when the rule's purpose is
  to detect or rewrite that vocabulary, such as docs-local-checkout paths.

Disallowed future vocabulary:

- Runtime implementation instructions under `.habitat/**`.
- Managing TypeScript/JavaScript/shell code under `.habitat/**`.
- Generic Habitat runtime files importing product parser semantics from
  authored authority data.
