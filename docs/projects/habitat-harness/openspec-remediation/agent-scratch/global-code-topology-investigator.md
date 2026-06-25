# Global Code Topology Investigator Scratch

## Scope

Objective: ground the Deep Habitat Phase 2 OpenSpec remediation pass in the actual Habitat Toolkit source topology, exported surfaces, command flows, tests, and likely write sets.

Input packets read: every file under `docs/projects/habitat-harness/phase2-workstream-packets/`, including `D0` through `D15`, `G-HOST`, the README, review disposition ledger, and validation results.

Code inspected: `tools/habitat` source, bin entrypoints, package exports, command engine, Grit adapter/apply/probe, hooks, Nx plugin, generators, pattern authority, rule registry, baselines, diagnostics, tests, `.grit/patterns`, root/package scripts, and adjacent Habitat docs.

This note is scratch for OpenSpec authors. It does not propose implementation edits directly.

## High-Level Topology

`@habitat/cli` currently exposes a broad internal implementation surface from `tools/habitat/src/index.ts`. Public package exports in `tools/habitat/package.json` are only `.`, `./plugin`, and `./rules`, but the root index re-exports command engine, baseline, diagnostics, Effect runtime/parity helpers, git state, Grit apply/probe/failures, habitat process, proof artifact, workspace tools, rules, and Pattern Authority types/functions. D0 should treat this as an overexposed compatibility fact until a deliberate public-surface matrix decides what remains stable.

The primary command flow runs through `tools/habitat/bin/dev.ts` into `src/commands/*.ts`, then into `src/lib/command-engine.ts`. `createCheckReport` is the central structural check path. It loads rule selection, applies baseline policy, runs selected rules, expands baselines when requested, and derives report status. `createVerifyProof` wraps check and affected-target results for verify. `classify` maps paths/diffs to projects, likely targets, and rule scope. `fix` delegates to Grit apply transactions. `hook` delegates to hook orchestration. `graph` reports workspace graph facts.

The rule registry is `src/rules/rules.json` plus `src/rules/architecture.ts`. Current registry counts observed: 51 rules total; owner tools include `grit-check`, `file-layer`, `habitat-native`, `nx-boundaries`, `wrapped-script`, `wrapped-test`, and one `biome` rule. Most Grit rules are host/project scoped to Swooper/MapGen. Rule metadata already carries useful discriminants (`ownerProject`, `ownerTool`, `lane`, `scope`, `hookScope`, `gritPattern`, `nxTarget`, `generatedZone`), but some fields are prose or host-specific rather than stable domain authority.

Nx integration is split between root workspace config and `tools/habitat/src/plugin.js`. The plugin constructs inferred targets and dependencies from hard-coded owner roots and target names. Current `nx show project @habitat/cli --json` shows `habitat:rule:biome-ci` depends on project `biome` target `ci`; this is the false-green boundary described by D3 because the target is graph metadata, not proof that the owning tool command exists or is correctly modeled.

Grit topology has three layers:

- Check adapter: `src/lib/grit.ts`, `grit-env.ts`, `grit-failures.ts`, `grit-injected-probe.ts`.
- Apply transaction: `src/lib/grit-apply.ts`.
- Pattern corpus: `.habitat/patterns/active/checks/*.md` and `.habitat/patterns/active/apply/*.md`.

Generated/protected zones are currently declared in `src/lib/generated-zones.ts` and verified by `scripts/verify-generated-zones.mjs`. The declared zones are concrete Civ7/Swooper paths, which is useful evidence but a poor generic Habitat domain boundary unless explicitly modeled as host policy.

Hooks are implemented in `src/lib/hooks.ts` and exposed by `src/commands/hook.ts`. Pre-commit runs resource-state checks, staged file-layer checks, Biome formatting/checking with restage, and staged Grit checks. Pre-push runs `nx affected -t biome:ci,boundaries,grit:check,habitat:check,test`. The hook command currently accepts `--base` only; packets that require `habitat hook ... --dry-run` need a spec correction or command change.

Generators live under `tools/habitat/src/generators`. The project generator schema advertises unsupported kinds (`adapter`, `control`, `engine`, `mod`, `sdk`, `tooling`) even though implementation supports only `plugin`, `foundation`, and `app`. That mismatch is a direct D13 public-contract risk. The pattern generator can create candidates and registered lifecycle artifacts when supplied a Pattern Authority manifest, but the current tree has only the manifest support code, not actual manifest instances.

## Proof/Evidence Naming Guidance

Current code terms like `proof` and `evidence` are compatibility facts where they name existing files, exported functions, serialized report fields, command outputs, test files, or packet language. Do not erase those terms blindly in remediation specs if doing so would hide a real compatibility or migration obligation.

As target-domain names, `proof` and `evidence` are too broad. Prefer names tied to the domain object and consumer:

- Check output: structural report, rule report, baseline report, enforcement report.
- Verify output: handoff receipt, verify receipt, affected-target handoff.
- Hook output: local feedback trace, hook report, advisory local result.
- Grit check output: Grit diagnostic projection, pattern diagnostic.
- Grit apply output: transformation transaction report, rollback receipt, apply transaction proof if the compatibility term must be retained.
- Process capture: execution provenance, command provenance artifact.
- Nx/classify output: graph fact, project classification, target availability fact.

Use `proof` only where the system is asserting an independently reproducible gate result with clear inputs, command, environment, and ownership. Use `evidence` only as provenance input, not as a domain name for everything emitted by Habitat.

## Domino Map

### D0 - Scenario Public Contract Inventory

Likely write sets:

- `tools/habitat/package.json`
- `tools/habitat/src/index.ts`
- `tools/habitat/src/commands/*.ts`
- `tools/habitat/bin/dev.ts`
- `tools/habitat/docs/IMPLEMENTED-SURFACE.md`
- `tools/habitat/test/commands/habitat-entrypoints.test.ts`
- `tools/habitat/test/commands/habitat-commands.test.ts`
- Any OpenSpec changes defining command/JSON output contracts.

Public surfaces affected:

- Package exports `.`, `./plugin`, `./rules`.
- Root index re-export set.
- CLI commands: `check`, `classify`, `verify`, `fix`, `hook`, `graph`.
- JSON report shapes emitted by commands and command engine.
- Root scripts that forward to Habitat, especially `bun run habitat`, `habitat:check`, `habitat:fix`, `check`, `verify`, and `lint`.

Risky current names:

- `VerifyProof`, `createVerifyProof`, `proof-artifact`.
- Generic `rawArgv` forwarding semantics that make docs examples like `bun run habitat check -- --json` ambiguous.
- Root index exports that make internal helpers look public.

Owner boundaries:

- Habitat owns the CLI and public package contract.
- Root package scripts are workspace workflow entrypoints and should remain thin.
- `dist/**` and `oclif.manifest.json` are generated artifacts and should not be hand-edited.

Likely tests/commands:

- `bun run --cwd tools/habitat test -- test/commands/habitat-entrypoints.test.ts`
- `bun run --cwd tools/habitat test -- test/commands/habitat-commands.test.ts`
- `bun run habitat check --json`
- `bun run habitat classify tools/habitat/src/index.ts --json`

OpenSpec correction: make D0 a hard prerequisite before any internal movement. The current export shape is broad enough that implementation refactors may otherwise become accidental breaking changes.

### D1 - Proof Contract Boundary

Likely write sets:

- `tools/habitat/src/lib/proof-artifact.ts`
- `tools/habitat/src/lib/command-engine.ts`
- `tools/habitat/src/lib/habitat-process.ts`
- `tools/habitat/src/lib/effect-parity.ts`
- `tools/habitat/src/lib/effect-runtime.ts`
- `tools/habitat/test/lib/proof-artifact.test.ts`
- `tools/habitat/test/lib/verify-proof.test.ts`
- `tools/habitat/test/lib/habitat-process.test.ts`
- `tools/habitat/test/lib/effect-parity.test.ts`

Public surfaces affected:

- Verify JSON output and any exported `VerifyProof` type.
- Execution provenance capture structures.
- Test fixture expectations for proof/evidence wording.

Risky current names:

- `VerifyProof`, `ProofArtifact`, `createVerifyProof`, `proof` fields.
- `localHookProofNotice` in hooks.
- Overloaded `ok: boolean` result names that do not distinguish diagnostic report success from proof-class success.

Owner boundaries:

- Habitat owns proof/receipt contracts.
- Nx owns affected target calculation; Habitat can record it but should not rename it into stronger proof.
- Hook results are local feedback, not CI proof.

Likely tests/commands:

- `bun run --cwd tools/habitat test -- test/lib/proof-artifact.test.ts test/lib/verify-proof.test.ts`
- `bun run --cwd tools/habitat test -- test/lib/habitat-process.test.ts test/lib/effect-parity.test.ts`
- `bun run habitat verify --json`

OpenSpec correction: split compatibility fields from target domain names. D1 should define migration/alias behavior for existing public JSON names if those names change.

### D2 - Rule Registry Metadata Contract

Likely write sets:

- `tools/habitat/src/rules/rules.json`
- `tools/habitat/src/rules/architecture.ts`
- `tools/habitat/src/rules/messages.ts`
- `tools/habitat/src/lib/command-engine.ts`
- `tools/habitat/test/lib/rule-selection.test.ts`
- `tools/habitat/test/lib/enforcement-surface.test.ts`

Public surfaces affected:

- Rule IDs and selectors used by `habitat check --rule`, `--owner`, and `--tool`.
- JSON rule metadata in check reports.
- Baseline IDs under `tools/habitat/baselines`.

Risky current names:

- `scope` is prose-like and used by `classify` matching.
- `ownerTool` mixes actual tools (`grit-check`, `nx-boundaries`) with wrapped scripts.
- `ownerProject` includes host/project names, mostly Swooper/MapGen, directly in the generic registry.

Owner boundaries:

- Habitat owns registry schema and rule execution semantics.
- Host projects own host-specific rule intent, paths, and generated-zone policy.
- Baseline files are rule-owned compatibility artifacts.

Likely tests/commands:

- `bun run --cwd tools/habitat test -- test/lib/rule-selection.test.ts test/lib/enforcement-surface.test.ts`
- `bun run habitat check --json`
- `bun run habitat check --tool grit-check --json`

OpenSpec correction: specify whether rule metadata is a public API, internal implementation detail, or serialized report contract. Current usage makes parts of it externally observable.

### D3 - Workspace Graph Integration Boundary

Likely write sets:

- `tools/habitat/src/plugin.js`
- `tools/habitat/src/lib/nx-projects.ts`
- `tools/habitat/src/lib/command-engine.ts`
- `tools/habitat/test/lib/classify.test.ts`
- `tools/habitat/test/lib/workspace-tools.test.ts`
- Root `nx.json` only if target defaults change.

Public surfaces affected:

- Inferred Nx targets like `habitat:check`, `habitat:rule:*`, `grit:check`, `biome:ci`.
- `habitat classify --json` project/target output.
- `habitat graph --json`.

Risky current names:

- `habitat:rule:biome-ci` looks like proof of a Biome CI command but can be only a graph edge to project `biome` target `ci`.
- `availableTargets` vs runnable commands are currently easy to conflate.
- `dependencyForTarget` parses target strings by splitting on colons, which is brittle around namespaced target semantics.

Owner boundaries:

- Nx owns graph topology and target scheduling.
- Habitat owns interpretation of graph facts.
- Biome owns actual Biome checks; Habitat should not imply more than a handoff/dependency.

Likely tests/commands:

- `nx show project @habitat/cli --json`
- `bun run --cwd tools/habitat test -- test/lib/classify.test.ts test/lib/workspace-tools.test.ts`
- `bun run habitat graph --json`

OpenSpec correction: require target availability facts to be distinguished from command execution proof.

### D4 - Orientation and Routing

Likely write sets:

- `tools/habitat/src/lib/command-engine.ts`
- `tools/habitat/docs/DOMAIN-MAPPING.md`
- `tools/habitat/docs/SCENARIOS.md`
- `tools/habitat/docs/CAPABILITIES.md`
- `tools/habitat/test/lib/classify.test.ts`

Public surfaces affected:

- `habitat classify` JSON output.
- Scenario docs used by agents and humans to route work.
- Rule scope matching and target suggestions.

Risky current names:

- `Classification`, `DiffClassification`, `likelyTargets`, and `rulesInScope` sound stronger than current path-based heuristics.
- `domain` appears in docs and paths with both Habitat-domain and host-domain meanings.

Owner boundaries:

- Habitat owns routing based on workspace metadata and rule scope.
- Host projects own their domain semantics and should not be embedded as generic Habitat concepts.

Likely tests/commands:

- `bun run --cwd tools/habitat test -- test/lib/classify.test.ts`
- `bun run habitat classify <path> --json`

OpenSpec correction: classify output should be described as routing guidance unless it can prove runnable targets from resolved Nx metadata.

### D5 - Baseline Authority

Likely write sets:

- `tools/habitat/src/lib/baseline.ts`
- `tools/habitat/src/lib/command-engine.ts`
- `tools/habitat/baselines/*.json`
- `tools/habitat/test/lib/baseline.test.ts`
- `tools/habitat/test/lib/enforcement-surface.test.ts`

Public surfaces affected:

- `--expand-baseline`
- Baseline report JSON fields.
- Baseline file format and shrink-only integrity policy.

Risky current names:

- `BaselineExpansionGuardResult` uses `ok: boolean` instead of a discriminated authority decision.
- `ExternalExceptionSourceModel` is explicit but optional, so projection/validation authority may be under-specified.
- Baseline integrity is implemented as a built-in check rule inside `createCheckReport`.

Owner boundaries:

- Habitat owns baseline contracts and expansion guardrails.
- Rule owners own the semantics behind each exception.
- Git merge-base is provenance input, not policy authority by itself.

Likely tests/commands:

- `bun run --cwd tools/habitat test -- test/lib/baseline.test.ts`
- `bun run habitat check --expand-baseline --json`
- `bun run habitat check --json`

OpenSpec correction: specify baseline authority as a contract over exception sources, shrink-only behavior, and generated baseline artifacts.

### D6 - Diagnostic Pattern Catalog

Likely write sets:

- `.habitat/patterns/active/checks/*.md`
- `tools/habitat/src/lib/grit.ts`
- `tools/habitat/src/lib/grit-env.ts`
- `tools/habitat/src/lib/grit-failures.ts`
- `tools/habitat/src/lib/grit-injected-probe.ts`
- `tools/habitat/test/lib/grit-adapter.test.ts`
- `tools/habitat/test/lib/grit-injected-probe.test.ts`
- `tools/habitat/test/lib/grit-failures.test.ts`

Public surfaces affected:

- Grit diagnostic shape in check reports.
- Pattern IDs in registry and baselines.
- Probe command/environment behavior.

Risky current names:

- Grit patterns are markdown `.md` files, not `.grit` files. Specs should not require nonexistent `.grit` files unless intentionally changing corpus format.
- `proof` language should not be used for pattern diagnostics.
- Injected probe behavior is adapter validation, not a structural rule outcome.

Owner boundaries:

- Grit owns pattern syntax and engine behavior.
- Habitat owns adapter, normalization, and diagnostics projection.
- Host projects own pattern intent where patterns encode host-specific architecture.

Likely tests/commands:

- `bun run --cwd tools/habitat test -- test/lib/grit-adapter.test.ts test/lib/grit-injected-probe.test.ts test/lib/grit-failures.test.ts`
- `bun run habitat check --tool grit-check --json`

OpenSpec correction: call the catalog a diagnostic pattern catalog and model adapter/probe separately.

### D7 - Structural Enforcement Pipeline

Likely write sets:

- `tools/habitat/src/lib/command-engine.ts`
- `tools/habitat/src/rules/architecture.ts`
- `tools/habitat/src/rules/rules.json`
- `tools/habitat/src/lib/diagnostics.ts`
- `tools/habitat/test/lib/enforcement-surface.test.ts`
- `tools/habitat/test/lib/rule-selection.test.ts`

Public surfaces affected:

- `habitat check` status logic.
- Rule lanes (`enforced`, `advisory`) and baseline application.
- JSON check report.

Risky current names:

- `ok`, `status`, `violations`, and baseline fields need precise meanings.
- `requestedSelectors` is empty in `summarizeVerifyCheckReport`, which could undercut selector reporting in verify receipts.

Owner boundaries:

- Habitat owns pipeline order and report semantics.
- Each tool adapter owns raw command diagnostics.
- Baseline policy should not silently reclassify tool failures as success without report clarity.

Likely tests/commands:

- `bun run --cwd tools/habitat test -- test/lib/enforcement-surface.test.ts test/lib/rule-selection.test.ts`
- `bun run habitat check --json`
- `bun run habitat check --staged --tool grit-check --json`

OpenSpec correction: D7 should be sequenced after D5, D6, and D10 so enforcement semantics are not specified before baseline, diagnostic, and protected-zone authority are settled.

### D8 - Pattern Governance

Likely write sets:

- `tools/habitat/src/pattern-authority/manifest.ts`
- `tools/habitat/src/generators/pattern/*`
- `.grit/patterns/habitat/**`
- `tools/habitat/test/lib/pattern-authority.test.ts`
- `tools/habitat/test/generators/pattern.test.ts`

Public surfaces affected:

- Pattern generator schema and outputs.
- Pattern Authority manifest type exports.
- Candidate vs registered pattern lifecycle.

Risky current names:

- Current pattern generator can draft candidates, but registered enforcement requires manifest and baseline contract. Specs should not imply a candidate is enforceable.
- No actual Pattern Authority manifests were found in the inspected tree; only manifest support exists.

Owner boundaries:

- Habitat owns governance mechanics.
- Pattern authors own candidate content.
- Enforcement owners approve registration, baseline, hook scope, and false-positive model.

Likely tests/commands:

- `bun run --cwd tools/habitat test -- test/lib/pattern-authority.test.ts test/generators/pattern.test.ts`
- `nx g @habitat/cli:pattern <rule-id>` for generator behavior when appropriate.

OpenSpec correction: separate candidate drafting from registered enforcement as explicit lifecycle states.

### D9 - Transformation Transaction

Likely write sets:

- `tools/habitat/src/lib/grit-apply.ts`
- `.habitat/patterns/active/apply/*.md`
- `tools/habitat/src/commands/fix.ts`
- `tools/habitat/test/lib/grit-apply.test.ts`

Public surfaces affected:

- `habitat fix --dry-run`.
- Grit apply transaction report.
- Rollback and Biome handoff behavior.

Risky current names:

- `GritApplyProof` and `proof` fields are compatibility facts but broad target-domain names.
- Generic transaction code contains host-specific MapGen source-root discovery and `@mapgen/domain/.../ops` rewrite assumptions.
- `ok: boolean` does not describe which transaction phase failed.

Owner boundaries:

- Habitat owns transaction orchestration, dirty-worktree refusal, rollback, and provenance capture.
- Grit owns pattern application.
- Host policy owns source-root discovery and public import target choices.

Likely tests/commands:

- `bun run --cwd tools/habitat test -- test/lib/grit-apply.test.ts`
- `bun run habitat fix --dry-run`

OpenSpec correction: D9 depends on G-HOST if host-specific apply policy is to leave generic Habitat code.

### G-HOST - Host Policy Boundary Gate

Likely write sets:

- `tools/habitat/src/lib/grit-apply.ts`
- `tools/habitat/src/lib/generated-zones.ts`
- `tools/habitat/scripts/verify-generated-zones.mjs`
- `tools/habitat/src/rules/rules.json`
- `tools/habitat/src/plugin.js`
- OpenSpec host/generic boundary docs.

Public surfaces affected:

- Generic Habitat package exports and docs.
- Host-specific rules, generated-zone definitions, and apply policies.
- Nx inferred target ownership.

Risky current names:

- Host project names and paths currently live in generic Habitat code: `mods/mod-swooper-maps`, `packages/civ7-types/generated`, `packages/civ7-map-policy`, `@mapgen/domain`, recipe/map source roots.
- Registry owner names are concrete project names and must be treated as host metadata, not Habitat taxonomy.

Owner boundaries:

- Habitat owns the generic structural substrate.
- Civ7/Swooper/MapGen owners own host policies, generated zones, and transformations.
- OpenSpec should not move host policy under generic names without a migration target.

Likely tests/commands:

- `bun run --cwd tools/habitat test -- test/lib/grit-apply.test.ts`
- `bun run habitat check --tool file-layer --json`
- Any generated-zone verification command once its owning target is clarified.

OpenSpec correction: G-HOST should happen after D0/D1 and before D10/D9 where current host-specific paths directly shape generated-zone and apply behavior.

### D10 - Generated Protected Zone Authority

Likely write sets:

- `tools/habitat/src/lib/generated-zones.ts`
- `tools/habitat/scripts/verify-generated-zones.mjs`
- `tools/habitat/src/rules/architecture.ts`
- `tools/habitat/src/rules/rules.json`
- `tools/habitat/test/lib/enforcement-surface.test.ts`
- Potential new test file, because `test/lib/generated-zones.test.ts` does not currently exist.

Public surfaces affected:

- File-layer rule diagnostics.
- Generated zone metadata in rule reports.
- Any script or docs that define resource generation as an explicit workflow.

Risky current names:

- `generatedZone` currently points to concrete Civ7/Swooper resources.
- `verify-generated-zones.mjs` invokes Swooper map artifact generation and checks drift; it is host workflow logic inside Habitat tooling.
- Packet references to `test/lib/generated-zones.test.ts` are not grounded in current test topology.

Owner boundaries:

- Habitat can own protected-zone rule machinery.
- Host project owns the actual zones and regeneration commands.
- Generated artifacts remain read-only and regenerated by scripts.

Likely tests/commands:

- Existing: `bun run --cwd tools/habitat test -- test/lib/enforcement-surface.test.ts`
- Likely new: `bun run --cwd tools/habitat test -- test/lib/generated-zones.test.ts`
- `bun run habitat check --tool file-layer --json`

OpenSpec correction: either specify creation of `generated-zones.test.ts` or reference existing enforcement-surface coverage.

### D11 - Local Feedback

Likely write sets:

- `tools/habitat/src/lib/hooks.ts`
- `tools/habitat/src/commands/hook.ts`
- `.husky/pre-commit`
- `.husky/pre-push`
- `tools/habitat/test/lib/hooks.test.ts`
- `tools/habitat/test/commands/habitat-commands.test.ts`

Public surfaces affected:

- `habitat hook pre-commit`
- `habitat hook pre-push`
- Hook output text and local advisory status.
- Husky delegator scripts.

Risky current names:

- `localHookProofNotice` says "hook proof: local feedback only; CI remains authoritative." The content has the right caveat but the label is a poor target name.
- Hook command currently lacks `--dry-run`; only `--base` is accepted. D11 packet examples requiring dry-run are currently ungrounded.
- Hook stages run concrete commands (`check --staged --tool file-layer`, Biome, `check --staged --tool grit-check`, `nx affected ...`).

Owner boundaries:

- Hooks provide local feedback only.
- CI remains authoritative for gates.
- Habitat owns hook orchestration; individual tools own actual checks.

Likely tests/commands:

- `bun run --cwd tools/habitat test -- test/lib/hooks.test.ts`
- `bun run habitat hook pre-commit`
- `bun run habitat hook pre-push --base origin/main`

OpenSpec correction: either remove `--dry-run` from D11 or require adding it as a new command contract.

### D12 - Verify Handoff Receipt

Likely write sets:

- `tools/habitat/src/commands/verify.ts`
- `tools/habitat/src/lib/command-engine.ts`
- `tools/habitat/src/lib/proof-artifact.ts`
- `tools/habitat/test/lib/verify-proof.test.ts`
- `tools/habitat/test/commands/habitat-commands.test.ts`

Public surfaces affected:

- `habitat verify --json`
- Verify receipt schema and command failure semantics.
- Affected target handoff output.

Risky current names:

- `createVerifyProof`, `VerifyProof`.
- `summarizeVerifyCheckReport` currently returns `requestedSelectors: {}`, which may drop selector context.
- Verify first runs `createCheckReport`; affected target proof only runs if check result is OK.

Owner boundaries:

- Habitat owns orchestration and receipt structure.
- Nx owns affected target calculation.
- Verify receipt should record handoff and results, not overclaim full CI equivalence unless commands match CI.

Likely tests/commands:

- `bun run --cwd tools/habitat test -- test/lib/verify-proof.test.ts`
- `bun run habitat verify --json`

OpenSpec correction: call this a verify handoff receipt unless it captures all proof inputs required by D1.

### D13 - Scaffolding and Refusal Contracts

Likely write sets:

- `tools/habitat/src/generators/project/schema.json`
- `tools/habitat/src/generators/project/index.ts`
- `tools/habitat/src/generators/pattern/schema.json`
- `tools/habitat/src/generators/pattern/index.ts`
- `tools/habitat/test/generators/project.test.ts`
- `tools/habitat/test/generators/pattern.test.ts`
- `tools/habitat/generators.json`

Public surfaces affected:

- Nx generator schemas and validation errors.
- Project generator refusal behavior.
- Pattern generator candidate/registered lifecycle.

Risky current names:

- Project schema advertises unsupported kinds that implementation refuses.
- Unsupported generator kinds are an intentional policy but currently exposed in schema as choices.
- Pattern generator outputs can look like registered enforcement unless lifecycle is explicit.

Owner boundaries:

- Habitat owns scaffold shape for supported uniform project kinds.
- Owning domains define unsupported kinds before Habitat scaffolds them.
- Pattern Authority owns registration criteria.

Likely tests/commands:

- `bun run --cwd tools/habitat test -- test/generators/project.test.ts test/generators/pattern.test.ts`
- `nx g @habitat/cli:project <name> --kind=<plugin|foundation|app> --dry-run`

OpenSpec correction: schema and implementation must agree. If refusal is the desired contract, unsupported kinds should not be advertised as normal enum choices unless the generator deliberately emits refusal diagnostics for them.

### D14 - Authoring Topology Fence

Likely write sets:

- `tools/habitat/src/lib/command-engine.ts`
- `tools/habitat/src/lib/nx-projects.ts`
- `tools/habitat/docs/DOMAIN-MAPPING.md`
- `docs/projects/habitat-harness/taxonomy.md`
- `tools/habitat/test/lib/classify.test.ts`

Public surfaces affected:

- `habitat classify` and routing docs.
- Topology fence guidance around supported project kinds, owner roots, and likely targets.
- Nx project tags/kind interpretation.

Risky current names:

- `OWNER_ROOTS` in `plugin.js` is hard-coded and may become de facto topology authority.
- `likelyTargets` could be mistaken for runnable targets unless tied to resolved metadata.
- Domain docs distinguish Habitat as structural substrate, not MapGen authoring toolkit; specs should preserve that.

Owner boundaries:

- Habitat owns structural topology fences.
- Domains own authoring semantics.
- Nx metadata is the source for project tags and targets once resolved.

Likely tests/commands:

- `bun run --cwd tools/habitat test -- test/lib/classify.test.ts`
- `bun run habitat classify <path> --json`
- `nx show project <project> --json`

OpenSpec correction: do not make `plugin.js` hard-coded owner roots the long-term topology authority without a contract.

### D15 - Execution Provenance Substrate Trigger

Likely write sets:

- `tools/habitat/src/lib/habitat-process.ts`
- `tools/habitat/src/lib/effect-runtime.ts`
- `tools/habitat/src/lib/effect-parity.ts`
- `tools/habitat/src/lib/workspace-tools.ts`
- `tools/habitat/src/lib/grit-apply.ts`
- `tools/habitat/test/lib/habitat-process.test.ts`
- `tools/habitat/test/lib/effect-parity.test.ts`
- `tools/habitat/test/lib/workspace-tools.test.ts`

Public surfaces affected:

- Process/provenance artifacts captured during Grit apply, Git checks, platform parity, and tool handoff.
- Any exported Effect runtime helpers from `src/index.ts`.

Risky current names:

- `HabitatCommandKind` includes concrete command categories but not every CLI path.
- Provenance capture can be mistaken for proof unless tied to D1 semantics.
- `workspace-tools` and process helpers are currently exported broadly.

Owner boundaries:

- Habitat owns command provenance capture.
- Individual tools own command semantics and stdout/stderr.
- Effect is implementation substrate; public contract should avoid leaking runtime details unless deliberately exported.

Likely tests/commands:

- `bun run --cwd tools/habitat test -- test/lib/habitat-process.test.ts test/lib/effect-parity.test.ts test/lib/workspace-tools.test.ts`
- `bun run habitat fix --dry-run`

OpenSpec correction: D15 should trigger after D1 defines what provenance is allowed to support, prove, or merely record.

## Cross-Cutting OpenSpec Corrections

- The packets should not reference `test/lib/generated-zones.test.ts` as existing coverage. It does not exist in the inspected tree. Either specify it as a new test or point to `test/lib/enforcement-surface.test.ts`.
- D11 currently conflicts with command reality: `habitat hook` has `--base` but no `--dry-run`.
- `.grit/patterns` are markdown pattern files, not `.grit` files. Specs should use current file format language unless changing it intentionally.
- `dist/**`, `oclif.manifest.json`, generated resources, and lockfiles should be treated as generated/read-only unless regenerated by owning scripts.
- Public export remediation is a D0 prerequisite. The root index exports too many internals to safely treat internal file movement as private.
- Host-specific paths in `grit-apply.ts`, `generated-zones.ts`, `verify-generated-zones.mjs`, registry owner metadata, and `plugin.js` should be explicitly classified before D9/D10/D14 implementation specs.
- Rule graph facts must not be described as command execution proof. The `habitat:rule:biome-ci` current behavior is the clearest example.

## Suggested Remediation Order

1. D0: freeze/export matrix and CLI JSON compatibility inventory.
2. D1: proof/receipt/provenance vocabulary and compatibility aliases.
3. G-HOST: classify generic Habitat versus Civ7/Swooper/MapGen host policy.
4. D2, D3, D5, D6: registry, graph, baseline, and diagnostics contracts.
5. D10 and D9: protected zones and transformation transactions after host policy is explicit.
6. D7 and D12: structural pipeline and verify receipt after the underlying authorities are stable.
7. D11, D13, D14, D15: local feedback, scaffold refusal, topology fence, and provenance substrate.

## Skill Anchoring Used

Read before task work: Domain Design, Information Design, TypeScript, TypeScript refactoring patterns, TypeScript module organization, OpenSpec/Systematic Workstream entrypoints and references, Testing Design, Solution Design, and System Design.
