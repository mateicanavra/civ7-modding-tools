# D10 Code/Topology Investigation: Protected/Generated Zone Authority

## Scope And Grounding

- Worktree inspected: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`.
- Branch inspected: `codex/d10-protected-zone-authority-packet`.
- D10 packet inspected: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d10-protected-zone-authority`.
- Source domino packet inspected: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D10-generated-protected-zone-authority.md`.
- This is design/specification evidence only. No Habitat source files or D10 packet files were edited.

## Current Read/Write Surfaces D10 May Affect

### File-Layer Guard

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/generated-zones.ts` is the current guard center.
  - It declares `generatedZones` with three host-specific zones:
    - `mods/mod-swooper-maps/src/maps/generated/`
    - `packages/civ7-types/generated/`
    - `packages/civ7-map-policy/src/civ7-tables.gen.ts`
  - It reads staged paths through `git diff --cached --name-status -z`.
  - It emits `HabitatDiagnostic` rows by combining rule message plus zone remediation.
  - It only runs when `FileLayerContext.staged` is truthy.
  - It also handles `forbiddenFileNames`, currently `pnpm-lock.yaml` and `pnpm-workspace.yaml`, which is not generated/protected-zone authority.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/rules/architecture.ts` dispatches every `ownerTool === "file-layer"` rule to `runGeneratedZoneRule`.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/rules/rules.json` carries four `file-layer` rows:
  - `file-layer-swooper-map-generated`
  - `file-layer-civ7-types-generated`
  - `file-layer-civ7-map-policy-tables`
  - `file-layer-pnpm-artifacts`

### Check/Command Surface

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/commands/check.ts` exposes `--staged` as "Check staged file-layer protected zones."
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts` passes `staged` into rule execution, but its injectable `stagedPaths` option is used for staged Grit roots only. File-layer rules re-read Git state in `generated-zones.ts`.
- Public output affected by D10:
  - `habitat check --staged --tool file-layer --json`
  - `habitat check --json`
  - `RuleReport` / `CheckReport` diagnostics and messages
  - human renderer output through the same reports
  - command exit status for protected-zone refusals

### Hook Consumer

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/hooks.ts` runs the file-layer staged check before Biome, Grit, or formatter restaging:
  - `bun tools/habitat/bin/dev.ts check --staged --tool file-layer --json`
- Hook code owns local feedback sequencing, not zone authority. It currently propagates file-layer stdout/stderr and exits early when file-layer returns nonzero.
- Hook tests mock the file-layer command; they do not prove real D10 zone matching.

### Grit Scan Protection

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/grit.ts` imports `generatedZones` to reject generated roots in `validateScanRoots`.
- The same file has a separate hard-coded protected root prefix list:
  - `.civ7/`
  - `.git/`
  - `.habitat/cache/patterns/`
  - `dist/`
  - `node_modules/`
  - `tools/habitat/dist/`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.gritignore` independently excludes the same generated paths plus other broad roots.

### Biome Exclusion

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/biome.json` excludes:
  - `.civ7/outputs/**`
  - `mods/mod-swooper-maps/src/maps/generated/**`
  - `packages/civ7-types/generated/**`
  - `packages/civ7-map-policy/src/civ7-tables.gen.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/biome-closure.test.ts` snapshot-checks those exclusions.

### Generated Drift Target

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/plugin.js` creates `generated:check` on `@habitat/cli`.
  - Command: `bun tools/habitat/scripts/verify-generated-zones.mjs`
  - Depends on `@swooper/mapgen-core:build` and `@civ7/map-policy:verify`.
  - Inputs repeat Swooper generated/mod artifacts, `packages/civ7-map-policy/src/civ7-tables.gen.ts`, and `.civ7/outputs/resources/**`.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/scripts/verify-generated-zones.mjs` only regenerates/checks Swooper map artifacts. Map-policy freshness is delegated by Nx dependency. Civ7 types are protected but not regenerated by this script.

### Apply/Fix Consumer

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/grit-apply.ts` owns current apply transaction mechanics and changed-path approval, but does not consume a D10 protected-zone decision today.
- D9 requires one generated/protected-zone write blocked by D10 as an injected bad case. Current D9 cannot honestly close that path until D10 publishes a guard decision/write-set contract.

## Existing State-Space Defects And Duplicated Ownership

1. Host-specific generated zones are generic source truth today.
   - The same Swooper/Civ7 paths appear in `generated-zones.ts`, `rules.json`, `biome.json`, `.gritignore`, `plugin.js`, and `verify-generated-zones.mjs`.
   - G-HOST says those paths must move behind host declarations, but G-HOST is still an incomplete blocking packet.

2. The current zone model cannot represent D10 target states.
   - `GeneratedZone` only has `id`, `kind`, `path`, and `remediation`.
   - It cannot distinguish `generated`, `protected`, `forbidden artifact`, `missing host declaration`, `allowed generator write`, or `host policy unavailable`.
   - Optional/prose fields would let command output lack owner or next safe action.

3. Rule metadata and zone declarations duplicate message/remediation ownership.
   - `rules.json` says `file-layer-swooper-map-generated.remediate = "bun run --cwd mods/mod-swooper-maps gen:maps"`.
   - `generated-zones.ts` says `Run nx run mod-swooper-maps:gen:maps`.
   - D10 must specify one source for recovery instructions and one projection to command output.

4. File-layer owns a non-zone rule through the generated-zone executor.
   - `file-layer-pnpm-artifacts` uses `forbiddenFileNames` inside `runGeneratedZoneRule`.
   - This mixes generic forbidden artifact policy with generated/protected-zone authority.

5. Staged-path testing is not injectable for file-layer rules.
   - `CheckOptions.stagedPaths` exists, but file-layer code ignores it and reads Git directly.
   - Current hook tests can only mock the subprocess, not real zone matching.

6. Generated freshness and protected edit refusal are conflated by naming and targets.
   - Staged hand-edit refusal is `file-layer`.
   - Drift/freshness is `generated:check`.
   - Biome/Grit exclusions are separate envelopes.
   - Current packet language must keep these proof classes separate.

7. Grit and Biome exclusion envelopes are not derived from zone authority.
   - `grit.ts` imports `generatedZones`, but `.gritignore` is separate text.
   - `biome.json` is separate text and tested by snapshot.
   - Future implementation must decide whether these are generated projections, schema-validated mirrors, or deliberately manual configs with drift tests.

## Concrete Future D10 Write Set

D10 implementation should be limited to these surfaces unless the phase record is updated with a reviewed reason:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/generated-zones.ts` or a replacement module under `tools/habitat/src/lib/` for D10 declarations, guard decisions, and drift-check projections.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/rules/rules.json` only for D2-generated-zone-facet links or command-facing message/remediation projection changes.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/rules/architecture.ts` only to route file-layer rules through the new D10 projection/guard API.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts` only for staged guard consumption and injectable staged-path/state outcomes.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/grit.ts` only to consume D10 protected/generated scan-root projections, not host literals.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/plugin.js` only to consume D10 drift target inputs or generated-zone target aliases.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/scripts/verify-generated-zones.mjs` only if D10 owns the generic drift-check surface; host-specific regeneration commands must come from G-HOST declarations.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/biome.json` and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.gritignore` only if D10 explicitly records them as projection/check surfaces and D0 classifies public behavior impact.
- Tests under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/` covering generated-zone declarations, staged guard decisions, missing host declarations, Grit scan-root refusal, Biome exclusion projection, hook consumption, and generated drift boundaries.

## Protected Paths For Future Implementation

Implementation must not hand-edit generated/protected outputs while repairing D10:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/mods/mod-swooper-maps/src/maps/generated/**`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/packages/civ7-types/generated/**`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/packages/civ7-map-policy/src/civ7-tables.gen.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.civ7/outputs/resources/**`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/**/dist/**`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/**/mod/**`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/bun.lock`

The D10 packet files under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d10-protected-zone-authority/**` are protected for this investigation because the user requested scratch-only edits.

## Validation Commands That Actually Exist

| Command | Observed result | What it proves | What it does not prove |
| --- | --- | --- | --- |
| `bun run --cwd tools/habitat test -- test/lib/generated-zones.test.ts` | Exit 1: no test files found. | The package test runner exists. | Does not prove D10; the named D10 unit test does not exist. |
| `bun run --cwd tools/habitat test -- test/lib/biome-closure.test.ts test/lib/hooks.test.ts test/lib/grit-adapter.test.ts` | Exit 0; 3 files, 56 tests passed. | Biome exclusion snapshots, hook sequencing with mocked file-layer subprocess, and Grit scan-root validation currently pass. | Does not prove real staged generated-zone matching, missing host declaration refusal, generated drift freshness, or apply protection. |
| `bun run openspec -- validate deep-habitat-d10-protected-zone-authority --strict` | Exit 0. | D10 OpenSpec shape is valid. | Does not prove packet completeness or implementation readiness. |
| `bun run openspec:validate` | Exit 0; all OpenSpec items passed. | Global OpenSpec records are syntactically valid. | Does not resolve D10/G-HOST blocking status or P1/P2 packet gaps. |
| `nx show project @habitat/cli --json` | Exit 0; `generated:check`, `biome:*`, `grit:check`, `habitat:check`, and file-layer alias targets exist. | Nx metadata exposes the relevant targets. | Does not prove targets execute or protect zones correctly. |
| `nx run @habitat/cli:generated:check --outputStyle=static --skipNxCache` | Failed before generated drift proof because `@civ7/map-policy:verify` could not read `.civ7/outputs/resources/Base/modules/base-standard/data/terrain.xml`. | Target wiring starts dependency execution and depends on host resources. | Does not prove generated-zone freshness; also shows G-HOST/resource availability is part of the current generated-check topology. |
| `bun run habitat check --staged --tool file-layer --json` | Exit 0 in clean staged state; reports four file-layer rules plus `baseline-integrity` passing. | The command surface exists and the clean staged case can pass. | Does not prove injected protected-zone refusal, allowed generator writes, missing host declaration refusal, or hook behavior. |
| `bun run habitat check --json` | Exit 1 for unrelated existing failures (`workspace-entrypoints`, `biome-ci`, advisory doc findings). File-layer rules passed because there was no staged mutation. | The aggregate command exists and current tree is not globally green. | It is not a clean D10 closure gate in this worktree. |

## Downstream Consumers And Exact Facts They Need

### G-HOST Host Policy Boundary

G-HOST must provide D10 with:

- declaration location and D0 public/internal classification;
- stable host declaration schema for generated zones, protected zones, regeneration commands, allowed generator owners, and missing-host-policy refusal;
- current host inventory for Swooper map generated files, Civ7 generated types, Civ7 map-policy tables, resource submodule paths, and any host-specific apply gates;
- non-claims: host declarations do not prove generated files are current, runtime behavior, or MapGen product behavior.

Without those facts, D10 cannot remove host path literals from generic Habitat code.

### D7 Structural Enforcement Pipeline

D7 needs from D10:

- closed guard decision states: allowed, refused, not-applicable, missing declaration, and host-policy unavailable;
- a report projection that maps each guard state to `RuleReport` status/diagnostics/exit behavior;
- exact behavior for `--staged --tool file-layer` when no staged paths match, when a protected path is staged, and when rule metadata references an unknown zone;
- recovery guidance fields with owner and next safe action;
- assurance that D7 does not parse D10 internals or downgrade refusals to advisory.

### D9 Transformation Transaction

D9 needs from D10:

- transaction-time write-set guard input for generated/protected paths;
- distinction between user hand edit, approved generator write, approved transaction write, refused write, and missing D10/G-HOST decision;
- exact refusal tag/message family for protected-zone writes so D9 can model rollback and recovery separately;
- a generated/protected injected bad case that D9 can use in apply safety tests;
- non-claim that D10 path allowance is not apply admission and does not prove product/runtime behavior.

### D11 Local Feedback

D11 needs from D10:

- the hook-safe command/API projection for staged file-layer checks;
- human output and JSON fields that name owner, protected zone, path, refusal reason, and next safe action;
- statement that hook success is local feedback only and not generated freshness or CI proof;
- deterministic staged-path behavior that can be tested without real Git mutation where possible;
- ordering guarantee that protected-zone refusal happens before formatter writes/restaging.

### D13 Project Creation And Refusal Contracts

D13 needs from D10/G-HOST:

- protected/generated path inventory so generators refuse unsupported host-specific writes before creating files;
- missing-host-policy refusal shape for project-generation requests that would touch host-owned zones;
- recovery guidance wording compatible with D13 refusal output;
- clear non-claim that project/pattern project and pattern creation does not authorize generated-output hand edits.

## P1/P2 Blockers In The Current D10 Packet

### P1: G-HOST Dependency Is Not Resolved

The D10 packet says it will consume G-HOST declarations, but G-HOST remains an incomplete blocking packet in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md`. D10 cannot claim implementation readiness until host declaration location, schema, and missing-policy refusal are accepted.

### P1: D10 Does Not Specify A Concrete State Model

The current spec only says unauthorized protected edits report a guard refusal and authorized generators are identified. It does not define the closed state model required by the source packet: generated, protected, forbidden artifact, missing host declaration, allowed generator write, refused hand edit, drift check, and remediation guidance.

### P1: Duplicated Zone Authority Is Not Dispositioned

The packet does not name how to collapse or validate duplicated zone data across `generated-zones.ts`, `rules.json`, `biome.json`, `.gritignore`, `plugin.js`, and `verify-generated-zones.mjs`. Without this, implementation can leave multiple owners for the same path.

### P1: Validation Gates Are Not Falsifying

The named D10 test file `tools/habitat/test/lib/generated-zones.test.ts` is missing. `generated:check` currently fails due missing host resources before proving drift. `habitat check --json` is red for unrelated reasons. The packet needs exact D10-specific gates and injected bad cases.

### P1: Public Output Compatibility Is Not Bound To D0/D1 Rows

D10 affects `CheckReport`, file-layer diagnostics, hook output, and maybe apply/fix refusals. The packet references D0/D1 but does not name the concrete rows/output families required before source edits.

### P2: Write Set And Protected Paths Are Deferred

`tasks.md` asks the executor to record write set/protected paths later. The topology is knowable now and should be recorded before implementation to prevent D10 from absorbing D7, D9, D11, or G-HOST ownership.

### P2: Current Phase Record Branch Is Stale

The D10 phase record says branch `codex/deep-habitat-openspec-remediation`, but this investigation is on `codex/d10-protected-zone-authority-packet`.

### P2: `forbiddenFileNames` Needs An Ownership Decision

The pnpm artifact guard currently lives inside the generated-zone runner. D10 must either exclude it from protected/generated authority or explicitly define a separate file-layer forbidden-artifact projection owned outside D10.

### P2: File-Layer Tests Need Real Guard Coverage

Current hook tests prove orchestration with mocked file-layer output. D10 needs tests for actual staged path parsing, exact/prefix matching, rename/copy status handling, unknown zone metadata, host declaration missing, and generated/protected message construction.
