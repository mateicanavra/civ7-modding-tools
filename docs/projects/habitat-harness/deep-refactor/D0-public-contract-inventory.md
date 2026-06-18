# D0 Public Contract Inventory

**Status:** active compatibility ledger for Phase 3 implementation
**Packet:** `D0-scenario-public-contract-inventory`
**OpenSpec change:** `deep-habitat-d0-public-contract-inventory`
**Owner:** Command/API Contract
**Scope:** current Habitat command, JSON, package export, root script, Nx target,
generator, and hook surfaces

## Purpose

D0 records the compatibility surface that later Deep Habitat packets must
preserve, intentionally version, or deliberately retire. It is not a behavior
change packet. It is the ledger that prevents internal refactors from hardening
or breaking accidental contracts without naming the compatibility decision.

The product scenario is an agent or human using Habitat before, during, and
after a repo edit without guessing command shape, JSON shape, package export,
root script, Nx target, generator, or hook behavior.

## Contract States

| State | Meaning | Later packet handling |
| --- | --- | --- |
| Public stable | Intended current user-facing behavior. Preserve unless an accepted packet explicitly changes it. | Tests and docs must stay aligned. |
| Public versioned | Public or machine-facing surface whose schema/shape may evolve only with explicit versioning or migration notes. | Preserve current shape or add a versioned replacement. |
| Package-internal | Exported or reachable for in-repo implementation convenience, but not a stable package API. | May move after local imports/tests are realigned and the packet records the move. |
| Command-only DTO | Machine shape emitted or consumed by commands/receipts. The DTO, not the helper implementation, is the contract. | Preserve JSON fields or version the command DTO. |
| Test-only | Exists for tests, probes, parity checks, or fixture control. | May move with tests; must not be documented as user/product API. |
| Generated/derived | Loaded by tools or generated from another source of truth. | Edit the source/generator, not generated output by hand. |
| Deprecated | Existing surface retained only for compatibility until a named removal/migration packet. | Keep compatibility notes and removal trigger. |
| Refused | Deliberately unsupported invocation, shape, generator kind, receipt substitution, or workflow. | Fail with a useful reason; do not silently accept. |

## CLI Command Surface

Canonical local invocation is `bun run habitat <command> ...`, which routes to
the repo-local Habitat source runner. The production bin is `habitat` after the
package is built.

| Verb | Arguments and flags | Human output contract | Machine output contract | State | Stability notes |
| --- | --- | --- | --- | --- | --- |
| `check` | Flags: `--json`, `--output <file>`, `--owner <project>`, `--rule <id>`, `--tool <tool>`, `--staged`, `--expand-baseline`, `--base <ref>` defaulting to `main`. | `renderReport(CheckReport)` summary and diagnostics. Exact prose is not stable beyond useful failure/remediation content. | `CheckReport` schema version 1 via `--json` or `--output`. Selector failures also return schema version 1 with `rule-selection-integrity`. | Public stable command; `CheckReport` is command-only DTO. | Canonical JSON invocation is `bun run habitat check --json`. `bun run habitat check -- --json` is an argument-forwarding ambiguity and is not a stable example. |
| `classify` | Required `path` argument: repo-relative path, absolute path, literal diff, or `.diff`/`.patch` file. No flags today. | None; command prints formatted JSON. | `Classification` for a single path or `DiffClassification` schema version 1 for diffs. | Public stable command; output is command-only DTO and public versioned. | `Classification` currently has no top-level `schemaVersion`; D4 must preserve or explicitly version the classify DTO before changing fields. |
| `verify` | Flags: `--base <ref>`, `--json`. | Runs `check`; when check passes, runs affected Nx verification and streams output. | `VerifyProof` schema version 1 with check summary, affected status, post-state, and non-claims. | Public stable command; `VerifyProof` is command-only receipt DTO. | Current behavior skips the affected Nx receipt when check fails and records `habitat-check-failed` in JSON mode. |
| `fix` | Flag: `--dry-run`. | Streams approved Grit apply transaction output and formatter/gate output. | Direct CLI JSON is not implemented. Underlying transaction receipt is `GritApplyTransactionProof`. | Public stable command; receipt DTO is public versioned for D9. | Live writes require clean worktree unless the transaction path provides isolated-copy receipt data. |
| `graph` | Flag: `--json`. | Prints Nx graph JSON, pretty by default. | Compact JSON when `--json` is supplied. | Public stable command. | This is a graph introspection command, not a receipt that all graph tasks pass. |
| `hook` | Optional `name` argument, valid values `pre-commit` and `pre-push`; flag `--base <ref>` for pre-push probes. | Local hook feedback with explicit local-only receipt language. | `HookTrace` is available to hook runtime/tests, but the CLI does not emit trace JSON by default. | Public stable command; `HookTrace` is command-only/test DTO. | Unknown or missing hook names are refused with exit 2 and a named expected set. |

### Invocation Ambiguity

Use `bun run habitat check --json`, not `bun run habitat check -- --json`, in
docs, tests, and future packets. If a future packet changes root script or Bun
forwarding behavior, it must treat the `--` mismatch as a product command
compatibility issue, not a typo.

This does not make every double-dash form non-canonical. Root alias scripts
such as `bun run habitat:check -- --json` are a separate public compatibility
surface because they depend on Bun forwarding through a root script that already
contains the Habitat subcommand.

## Command-Entrypoint Grounding Note

D0 found that command receipts are sensitive to generated command artifact and
workspace dependency state. Before dependency/build grounding, stale or missing
`tools/habitat-harness/dist/**` output produced false command-surface results:
unknown selectors either appeared to pass against old generated code or failed
because commands were unavailable. After `bun install --frozen-lockfile` and
`bun run --cwd tools/habitat-harness build`, the command-entrypoint suite passed
without source changes.

Compatibility expectation: unknown `--owner`, `--rule`, and `--tool` selectors
refuse before rule execution and return the `rule-selection-integrity`
`CheckReport` receipt. Later packets must ground command receipts against a
coherent dependency/build state before claiming command behavior.

## Command DTO Compatibility

Some current DTOs and helper names are proof/artifact-shaped because that is
the present code surface. D0 records those names as compatibility facts only. It
does not bless proof/artifact generation as Habitat's target domain model.
Downstream packets should simplify these surfaces into minimal command receipts
only where a real classify/check/maintain/evolve/scaffold/guard/refuse/recover
scenario needs them, and should remove or collapse artifact-generation concepts
that do not carry product value.

| DTO | Source | Current producer | Current consumer | State | Compatibility rule |
| --- | --- | --- | --- | --- | --- |
| `CheckReport` | `tools/habitat-harness/src/lib/diagnostics.ts` | `check`, `verify`, tests | agents, tests, `VerifyProof`, report renderer | Command-only DTO; public versioned | Preserve `schemaVersion: 1`, `command`, `startedAt`, `ok`, and `rules` fields unless a versioned DTO is introduced. |
| `RuleReport` | `diagnostics.ts` | rule execution/check report | agents/tests/report renderer | Command-only DTO | Preserve rule id, owner tool, lane, status, locked, diagnostics, detect, message, and remediation semantics or version `CheckReport`. |
| `HabitatDiagnostic` | `diagnostics.ts` | rules and built-ins | report/JSON consumers | Command-only DTO | Preserve normalized diagnostic shape `{ ruleId, path, line?, message, severity, baselined }`. |
| `Classification` | `command-engine.ts` | `classify` | agents/tests/future routing packets | Command-only DTO; public versioned | Preserve existing fields or introduce schema versioning in D4 before removing/renaming fields. |
| `DiffClassification` | `command-engine.ts` | `classify` for literal/file diffs | agents/tests | Command-only DTO; public versioned | Preserve `schemaVersion: 1`, `inputKind: "diff"`, and sorted `paths`. |
| `ClassifiedTarget` | `command-engine.ts` | `classify` | agents/tests | Command-only DTO | Preserve distinction between project, workspace, and Habitat-owned targets. |
| `UnavailableClassifiedTarget` | `command-engine.ts` | `classify` | agents/tests | Command-only DTO | Missing targets are routing facts, not commands to run. |
| `ScopedRule` | `command-engine.ts` | `classify` | agents/tests | Command-only DTO | Preserve exact-path, project-owner, workspace-gate, and unresolved-metadata distinction. |
| `VerifyProof` | `command-engine.ts` | `verify --json` | agents/review handoff/tests | Command-only DTO; public versioned current surface | Preserve `schemaVersion: 1`, explicit affected executed/skipped states, bounded streams, post-state, and non-claims until D12 reassesses whether the proof-shaped DTO should become a minimal verify receipt. |
| `GritApplyTransactionProof` | `grit-apply.ts` | `fix` internals/tests/receipt artifacts | D9 transaction consumers | Current transaction DTO; downstream reassessment required | D9 must decide which fields are product-bearing transaction receipts and collapse artifact-generation concepts that do not serve guarded maintenance/evolution workflows. |
| `HookTrace` | `hooks.ts` | hook runtime/tests | local feedback tests/future D11 | Command-only/test DTO | D11 owns trace stabilization; do not claim CLI trace output until implemented, and keep hook receipts local-feedback scoped. |

## Package Export Surface

The package is private, but `exports` and `src/index.ts` still create
reachable TypeScript surfaces for in-repo consumers and tests. Later packets
must not move, remove, or narrow these names without either preserving the
import path, replacing it with a deliberate facade, or recording a compatibility
decision in the packet.

| Package export | Target | State | Compatibility rule |
| --- | --- | --- | --- |
| `@internal/habitat-harness` / `.` | `./src/index.ts` | Public versioned envelope over mixed internals | Keep import path until a curated public facade replaces it. Individual names below decide stability. |
| `main` | `dist/index.js` | Generated/derived build surface | Production build artifact path. Do not hand-edit generated `dist`; regenerate through the owning build target when build repair is in scope. |
| `@internal/habitat-harness/plugin` / `./plugin` | `./src/plugin.js` | Generated/derived graph integration surface | Nx loads this as workspace plugin. Keep path stable or update `nx.json` and graph receipt checks together. |
| `@internal/habitat-harness/rules` / `./rules` | `./src/rules/rules.json` | Generated/derived rule manifest surface | Treat `rules.json` as rule registry data, not hand-authored package API. |
| `bin.habitat` | `./bin/run.js` | Public stable production command bin after build | Preserve `habitat` command name unless a command-surface packet changes it. |
| `generators` | `./generators.json` | Public stable Nx generator surface | Preserve generator names or version/refuse with Nx generator docs. |
| `migrations` | `./migrations.json` | Public versioned Nx migration surface | Current no-op records wiring only; convention migrations require separate receipt criteria. |
| Package-local scripts | `build`, `dev`, `check`, `test`, `clean`, `build:*` | Package-internal developer surface | Useful for local debugging/building; root Nx scripts remain the repo-level handoff surface. |
| Package Nx targets | `build:tsc`, `build:manifest`, `build:bin-mode`, `build` | Generated/build orchestration surface | Build target contract belongs to package build ownership and Graph/Nx packets, not the command DTO contract. |
| `files` allowlist | `bin`, `dist`, manifests, source generator/migration/plugin/rules/baselines | Generated/derived package publication shape | Private repo-local package surface; update only with package build/generator ownership. |

## `src/index.ts` Export Matrix

| Export(s) | Source module | State | Compatibility handling |
| --- | --- | --- | --- |
| `BaselineContractFailure`, `BaselineContractFailureReason`, `BaselineContractValidation`, `BaselineState`, `RuleIntroductionBaselineManifest` | `./lib/baseline.js` | Package-internal | D5 may replace with a baseline authority facade. Preserve local consumers until then. |
| `applyBaseline`, `baselineFailureDiagnostic`, `checkBaselineIntegrity`, `guardBaselineExpansion`, `isBaselineLocked`, `loadBaseline`, `loadBaselineState`, `mergeBase`, `validateBaselineContract`, `violationKey` | `./lib/baseline.js` | Package-internal | Baseline mechanics are not a stable package API. D5 owns extraction and any public facade. |
| `Classification`, `ClassifiedTarget`, `DiffClassification`, `RuleScopeKind`, `ScopedRule`, `UnavailableClassifiedTarget` | `./lib/command-engine.js` | Command-only DTO | Preserve classify JSON compatibility or explicitly version in D4. |
| `ClassifyOptions` | `./lib/command-engine.js` | Package-internal | Test/control injection shape, not classify JSON. D4 may replace it while preserving command output. |
| `buildHabitatCommand`, `commandSummary`, `selectRules` | `./lib/command-engine.js` | Package-internal | Internal helpers. Later packets may move after imports/tests are realigned. |
| `classifyPath`, `classifyTarget` | `./lib/command-engine.js` | Package-internal | Callable helpers used by the command/tests. D4 may introduce a deliberate facade before treating callable classify APIs as public. |
| `createCheckReport`, `renderCheckReport`, `stringifyCheckReport` | `./lib/command-engine.js` | Command-only DTO helpers | Structural Enforcement may move helpers in D7 only if `CheckReport` JSON compatibility is preserved. |
| `expandBaselines` | `./lib/command-engine.js` | Package-internal | Authoring-only baseline expansion helper. D5 owns future authority and refusal behavior. |
| `resolveVerifyBase`, `runAffectedVerification` | `./lib/command-engine.js` | Package-internal | D12 owns verify receipt assembly; direct helper API is not stable. |
| `runFix`, `runGraph`, `runHook` | `./lib/command-engine.js` / `./lib/hooks.js` | Package-internal command runners | CLI behavior is public; direct function shape may change in D9/D11 after local imports/tests update. |
| `CheckReport`, `HabitatDiagnostic`, `HabitatSeverity`, `RuleReport` | `./lib/diagnostics.js` | Command-only DTO | Preserve schema version 1 JSON contract or version it. |
| `validateCheckReport` | `./lib/diagnostics.js` | Command-only DTO helper | Keep while tests/probes consume it; D7 may move behind report facade. |
| `effectParityProbeProgram`, `runEffectParityProbe` | `./lib/effect-parity.js` | Test-only | Effect parity probes are not product APIs. |
| `runHabitatEffect` | `./lib/effect-runtime.js` | Package-internal | Effect substrate helper; D15 trigger governs broader provenance decisions. |
| `readGitState` | `./lib/git-state.js` | Package-internal | Used by transaction/receipt internals; not a stable package API. |
| `injectedProbeRoot` | `./lib/grit.js` | Test-only | Probe fixture root. Do not expose as product command contract. |
| `GritApplyTransactionProof` | `./lib/grit-apply.js` | Current transaction DTO; downstream reassessment required | D9 must keep only product-bearing transaction receipt fields and collapse artifact-generation concepts that do not serve guarded maintenance/evolution workflows. |
| `GritApplyRewriteInventoryEntry`, `GritApplyTransactionOptions`, `GritApplyTransactionResult` | `./lib/grit-apply.js` | Package-internal | Transaction implementation/control shapes until D9 decides a facade. |
| `classifyApplyRewriteInventory`, `parseApplyRewriteInventory`, `runGritApplyTransaction` | `./lib/grit-apply.js` | Package-internal | D9 owns transaction extraction. Preserve tests or provide a D9 facade before moving. |
| `GritAdapterFailure`, `GritAdapterFailureTag`, `createGritAdapterFailure`, `gritAdapterFailureTags`, `isGritAdapterFailureTag`, `renderGritAdapterFailure` | `./lib/grit-failures.js` | Package-internal | D6 owns diagnostic adapter failure model. |
| `InjectedGritProbeFailure`, `InjectedGritProbeInput`, `InjectedGritProbeResult`, `InjectedProbeScope`, `injectedGritProbeProgram`, `runInjectedGritProbe` | `./lib/grit-injected-probe.js` | Test-only / package-internal receipt helpers | D6 may preserve as receipt fixtures or move behind diagnostic catalog tests. |
| `CommandCachePolicy`, `GritParseStatus`, `HabitatCommandKind`, `HabitatCommandResult`, `HabitatProcessRequest`, `GritToolUnavailable`, `HabitatProcess`, `HabitatProcessLive`, `makeFakeHabitatProcessLayer`, `makeHabitatCommandResult` | `./lib/habitat-process.js` | Package-internal; `makeFakeHabitatProcessLayer` is test-only | D6/D9/D11/D15 own process/provenance boundaries. Not a public command API. |
| `AdapterProofArtifact`, `AdapterProofClass`, `WriteAdapterProofArtifactInput`, `adapterProofArtifactPath`, `buildAdapterProofArtifact`, `ProofArtifactWriteFailure`, `ProofArtifactWriter`, `ProofArtifactWriterLive`, `writeAdapterProofArtifact` | `./lib/proof-artifact.js` | Package-internal proof/artifact-shaped current surface | D1 must reassess whether artifact writing serves a concrete repo-maintenance workflow. Preserve current consumers until then, but do not treat artifact generation as target-domain authority. |
| `HabitatToolExecutionPlane`, `MaterializedHabitatCommand`, `materializeHabitatCommand` | `./lib/workspace-tools.js` | Package-internal | Workspace tool materialization is not a user API; D3/D12 may realign. |
| `executeRule`, `HarnessRule`, `ruleById`, `rules` | `./rules/architecture.js` | Package-internal / generated-derived registry | D2 owns rule registry metadata. `rules` is registry data, not a generic API. |
| `CandidatePatternAuthorityManifest`, `PatternAuthorityManifest`, `PatternAuthorityRuleReference`, `PatternAuthorityValidationFailureReason`, `PatternAuthorityValidationIssue`, `PatternAuthorityValidationOptions`, `PatternAuthorityValidationResult`, `RegisteredPatternAuthorityManifest` | `./rules/pattern-authority/manifest.js` | Public versioned Pattern Governance contract | D8 owns future manifest changes. Preserve versioned manifest compatibility or add migration/refusal behavior. |
| `patternAuthorityManifestSchemaVersion`, `validatePatternAuthorityManifest` | `./rules/pattern-authority/manifest.js` | Public versioned Pattern Governance contract | Schema version and validation remain stable or migrate through D8 governance. |
| `patternAuthorityCandidateRoot`, `patternAuthorityManifestPath`, `patternAuthorityManifestRoot` | `./rules/pattern-authority/manifest.js` | Package-internal | Path helpers may move only with generator/manifest realignment. |

## Root Script Surface

| Root script | Current command | State | Compatibility rule |
| --- | --- | --- | --- |
| `habitat` | repo-local Habitat CLI source runner | Public stable | Canonical agent entrypoint for command examples. |
| `habitat:check` | `bun run habitat check` | Public stable | Root alias for diagnostic full Habitat rule aggregate. Preserve `bun run habitat:check -- <flags>` forwarding as a distinct root-alias surface from nested `bun run habitat check -- --<flag>`. |
| `habitat:fix` | `bun run habitat fix` | Public stable | Preserve dry-run forwarding examples through command-surface tests. |
| `biome:format`, `biome:check`, `biome:ci` | root Biome hygiene scripts | Public stable workspace scripts | Root script contract for Biome-owned formatting/check/CI surfaces; target names are also present in the Nx target matrix. |
| `lint` | `nx run @internal/habitat-harness:biome:ci` | Public stable workspace gate | May use Nx cache when inputs match; not just style lint. |
| `verify` | `nx run-many --targets=verify` | Public stable graph aggregate | Graph-owned verifier aggregate, separate from `habitat verify`. |
| `check` | `nx run-many --targets=build,check,lint,test,verify` | Public stable graph aggregate | Full root aggregate; not a replacement for command DTO receipts. |
| Legacy or package-local scripts | package-local commands | Package-internal or project-local | Use only after Habitat classify/graph tells the agent the target exists. |

## Nx Target Surface

Habitat is loaded as an Nx inference plugin from `nx.json` through
`./tools/habitat-harness/src/plugin.js`.

| Target family | Owner | State | Compatibility rule |
| --- | --- | --- | --- |
| `boundaries` | `@internal/habitat-harness` | Public stable workspace target | Project-plane import boundary gate. |
| `biome:format`, `biome:check`, `biome:ci` | `@internal/habitat-harness` | Public stable workspace targets | Biome owns formatting/hygiene; target names are intentionally namespaced. |
| `grit:check` | `@internal/habitat-harness` | Public stable workspace target | Diagnostic Grit catalog gate, not apply approval. |
| `generated:check` | `@internal/habitat-harness` | Public stable workspace target name/role | Stable contract is the workspace target name and generated/protected-zone drift-gate role. Current Civ7/MapGen policy details are not generic Habitat API; D10 owns the host-policy boundary. |
| `habitat:check:all` | `@internal/habitat-harness` | Public stable aggregate target | Runs broad Habitat rule check once. |
| `habitat:check` | each rule owner with registered rules | Public stable owner target | Runs rules owned by that project; D2/D7 may refine after registry metadata. |
| `habitat:rule:<rule-id>` | each rule owner with registered rule | Public versioned generated target | Alias target generated from rule registry. Target existence depends on registry metadata. |

Known D0 compatibility risk: plugin alias dependency parsing for colon-bearing
target names remains current behavior record, not a D0 repair. D3 owns graph
integration fixes and false-green target alias reduction.

## Generator Surface

| Generator | Schema surface | State | Compatibility rule |
| --- | --- | --- | --- |
| `@internal/habitat-harness:project` | `name`, `kind`, optional `packageName`, optional `directory`; kind enum includes uniform and refused non-uniform kinds, with optional `kind:` prefixes. | Public stable generator with refused states | Supported kinds are `foundation`, `kind:foundation`, `plugin`, `kind:plugin`, `app`, and `kind:app`. Non-uniform `mod`, `engine`, `control`, `adapter`, `sdk`, `tooling`, and their `kind:*` forms remain refused until owning domains define uniform generator contracts. |
| `@internal/habitat-harness:pattern` | `ruleId`, `ownerProject`, `patternName`, `lifecycle`, `openspecChangeId`, `manifestPath`, `hookScope`; lifecycle values are `candidate`, `registered-advisory`, and `registered-enforced`. | Public versioned Pattern Governance generator | Candidate generation writes a non-active draft. Registered advisory/enforced modes may write active Grit patterns and rule-pack entries only after Pattern Authority Manifest, baseline, current-tree, fixture, false-positive, and hook-scope gates pass. D8 owns future governance changes. |

Unsupported scenario fixture for D0 receipt: invoking the project generator with
`--kind=mod` must refuse before writes with the owning-domain/non-uniform-kind
reason.

## Hook Surface

| Hook file | Delegation | State | Compatibility rule |
| --- | --- | --- | --- |
| `.husky/pre-commit` | `bun run habitat hook pre-commit` | Public stable local feedback entrypoint | Hook remains local feedback only. It may format/restage eligible staged files but must not claim a CI receipt. |
| `.husky/pre-push` | `bun run habitat hook pre-push` | Public stable local feedback entrypoint | Uses affected verification for the local branch slice. CI and explicit verification remain authoritative. |

`HookTrace` is a runtime/test receipt shape for D11. The hook CLI does not yet
promise trace JSON output.

Current stale command help: `tools/habitat-harness/src/commands/hook.ts` still
describes hook wiring as deferred even though Husky delegation is implemented.
D0 records this as stale human output text; a command-surface/docs packet should
align help text without changing hook behavior.

## Stability Requirements For Later Packets

No later packet may:

- move or narrow `src/index.ts` exports without a facade, import realignment, or
  explicit compatibility disposition;
- change command JSON fields without preserving the current DTO or adding a
  versioned replacement;
- treat `Classification` as schema-versioned until D4 adds that contract;
- treat direct command helper functions as public user API merely because they
  are exported today;
- treat generated/derived rule and Nx surfaces as hand-editable contracts;
- document `bun run habitat check -- --json` as canonical before resolving the
  forwarding ambiguity;
- collapse unsupported generator kinds into best-effort scaffolds;
- claim hook, verify, Grit apply, or graph output establishes product/runtime
  behavior unless the owning packet adds that receipt.

## D0 Done Criteria

D0 is done when:

- this matrix exists and classifies the current command/API contract surface;
- the OpenSpec change records D0 requirements and non-claims;
- Habitat implemented-surface docs point future readers to this ledger;
- command entrypoint tests, representative classify, OpenSpec validation, lint,
  and unsupported generator refusal receipt have been run and explicitly
  recorded;
- review lanes have no unresolved accepted P1/P2 findings;
- the Graphite branch is clean and submitted;
- supervisor/product authority approves advancing to D1.
