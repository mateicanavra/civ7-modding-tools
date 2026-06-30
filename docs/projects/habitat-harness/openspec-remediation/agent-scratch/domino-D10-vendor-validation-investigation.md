# D10 Vendor/Validation Investigation: Protected/Generated Zone Authority

## Frame

This is a design/specification investigation for `deep-habitat-d10-protected-zone-authority`.
It does not authorize source implementation. The target design should keep Habitat as a thin
integration layer over native Grit, Biome, Git, and Nx behavior. D10 should own only the
generated/protected-zone policy join: D2 file-layer rule facts plus G-HOST host declarations,
guard decisions, refusal/recovery rendering, and generated-drift command expectations.

Worktree inspected:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`
- Branch: `codex/d10-protected-zone-authority-packet`
- Initial status: clean

Primary packet inputs read:

- `docs/projects/habitat-harness/phase2-workstream-packets/D10-generated-protected-zone-authority.md`
- `openspec/changes/deep-habitat-d10-protected-zone-authority/{proposal.md,design.md,tasks.md,specs/habitat-harness/spec.md}`
- D10 workstream ledgers under `openspec/changes/deep-habitat-d10-protected-zone-authority/workstream/`
- Remediation frame and packet index

Relevant present-behavior evidence read:

- `tools/habitat/src/lib/generated-zones.ts`
- `tools/habitat/scripts/verify-generated-zones.mjs`
- `tools/habitat/src/lib/hooks.ts`
- `tools/habitat/src/lib/grit.ts`
- `tools/habitat/src/lib/grit-apply.ts`
- `tools/habitat/src/plugin.js`
- `tools/habitat/src/rules/rules.json`
- `biome.json`, `.gritignore`, `.habitat/grit.yaml`, `nx.json`
- `tools/habitat/test/lib/{hooks.test.ts,biome-closure.test.ts,grit-adapter.test.ts,grit-apply.test.ts,enforcement-surface.test.ts,classify.test.ts}`

## Vendor Authority Findings

### Grit Already Owns Pattern Discovery, Ignore, Check, And Apply Mechanics

Official Grit docs say repository configuration lives in `.habitat/grit.yaml`, pattern entries have
`level` values consumed by `grit check`, Markdown or `.grit` patterns under `.grit/patterns` are
auto-merged, and Grit defaults to importing patterns from `.grit/patterns`:
https://docs.grit.io/guides/config

Grit also natively ignores `.gitignore` entries and `.grit/`, supports cascading `.gritignore`
files, and supports inline `grit-ignore` suppressions:
https://docs.grit.io/guides/config

Official CLI behavior is sufficient for the core command surface:

- `grit check [PATHS]...` checks target paths, defaulting to `.`, with `--level`, `--no-cache`,
  `--refresh-cache`, and `--only-in-json`.
- `grit apply <PATTERN_OR_WORKFLOW> [PATHS]...` accepts a named pattern, inline pattern,
  pattern file, or workflow, with path scoping, `--dry-run`, `--force`, `--output`, `--limit`,
  cache flags, and `--only-in-json`.
- Global `--json` is documented as available only on some commands, so Habitat's current JSON
  parsing should remain a pinned adapter contract, not a broad Grit guarantee.

Source: https://docs.grit.io/cli/reference

GritQL also has native `$filename`, `range`, `sequential`, and `multifile` constructs, plus
`$new_files` for creation side effects. Notably, `$new_files` can overwrite existing files, so any
apply path that permits file creation needs Habitat/D8/D9/D10 admission around Grit rather than
trusting GritQL to be a protected-zone policy engine.

Source: https://docs.grit.io/language/patterns

**D10 implication:** D10 should not design a second Grit catalog, Grit ignore system, Grit apply
runner, or Grit pattern-root language. D10 may require Habitat's adapter to validate candidate
scan/apply roots before invoking Grit, but that root safety is Habitat integration policy, not
native Grit authority.

### Biome Already Owns Hygiene Scope, Ignores, And VCS File Selection

Official Biome docs say VCS integration is opt-in through `vcs.enabled` and `vcs.clientKind`.
With `vcs.useIgnoreFile`, Biome reads `.gitignore`, `.ignore`, and Git local excludes; linked
worktrees read excludes from the common Git directory, matching Git behavior:
https://biomejs.dev/guides/integrate-in-vcs/

Biome natively supports changed/staged scopes:

- `biome check --changed`, with optional `--since`, processes files changed from the configured
  default branch or explicit ref.
- `biome check --staged` processes files in the Git index.
- The docs explicitly warn that `--changed` is a file-diff scope reducer and does not prove
  downstream import correctness.

Source: https://biomejs.dev/guides/integrate-in-vcs/

Biome config natively supports `files.includes` with ordered negated patterns. Scanner behavior is
important: ignored generated files can still be indexed for type information when project-domain
rules require dependencies. For output folders such as `build/` or `dist/`, Biome recommends
force-ignore patterns with `!!`; for generated files, Biome advises regular ignore patterns so type
information can still be extracted.

Source: https://biomejs.dev/reference/configuration/

Current repo facts:

- `biome.json` enables Git VCS integration and `useIgnoreFile`.
- `files.includes` excludes `.nx`, `.civ7/outputs`, archives, `mods/mod-swooper-maps/src/maps/generated/**`,
  `packages/civ7-types/generated/**`, and `packages/civ7-map-policy/src/civ7-tables.gen.ts` with
  regular `!` patterns, not `!!`.
- `tools/habitat/test/lib/biome-closure.test.ts` asserts these protected/generated
  exclusions and the single Biome rule-registry row.
- `tools/habitat/src/lib/hooks.ts` does not use Biome's native `--staged`; it passes
  explicit staged file paths to `biome format --write --no-errors-on-unmatched` after a Habitat
  index-worktree split refusal and file-layer check.

**D10 implication:** Biome should remain the formatter/linter/import-organizer owner. D10 should
not model generated/protected zones as a Biome concept. D10 should specify that protected/generated
surfaces are excluded from Biome mutation/check ownership through `biome.json`, while the staged
hand-edit refusal is a Habitat guard. D10 should also require a pinned behavior test for explicit
path formatting against excluded generated files if the hook continues to pass explicit paths
instead of switching to native `--staged`.

### Nx Already Owns Target Orchestration, Dependencies, Inputs, Outputs, And Cache Semantics

Official Nx docs define targets as task definitions with properties that control how Nx runs them:
`cache`, `inputs`, `outputs`, and `dependsOn` are native target properties:
https://nx.dev/docs/reference/project-configuration

Nx docs state:

- `"cache": true` marks a target cacheable.
- Cacheable operations must be side-effect free.
- Inputs define what participates in cache hashing.
- Outputs define files/folders Nx stores and restores.
- `dependsOn` expresses task-order requirements; dependent tasks may be skipped or restored from
  cache when artifacts are already valid.

Sources:

- https://nx.dev/docs/reference/project-configuration
- https://nx.dev/docs/reference/inputs
- https://nx.dev/docs/features/cache-task-results

Resolved current repo metadata proves:

- `nx show projects --with-target generated:check` returns only `@habitat/cli`.
- `nx show target @habitat/cli:generated:check --json` resolves:
  - command: `bun tools/habitat/scripts/verify-generated-zones.mjs`
  - `cache: false`
  - `dependsOn`: `@swooper/mapgen-core:build`, `@civ7/map-policy:verify`
  - inputs over map-generation scripts/configs/generated output, map-policy verify script/table,
    and `.civ7/outputs/resources/**`
- `grit:check` and `biome:ci` are cacheable Nx targets with explicit inputs.

**D10 implication:** D10 should not invent a parallel dependency/cache ledger. The packet should
require resolved Nx target evidence for any generated-zone check, and should say exactly when a
target is intentionally uncached because it mutates/restores generated outputs or reads host
resources.

## Current Habitat Overreach Or Under-Specification

### P1: D10 Currently Lacks A Vendor-Grounded Authority Split

The packet says "Define protected-zone declaration, generated-zone relation, and guard decisions,"
but it does not explicitly assign native tool authority:

- Grit owns pattern discovery, ignore, check, apply, dry-run, path arguments, and pattern tests.
- Biome owns formatting/lint/import organization, `files.includes`, VCS ignore, staged/changed
  file selection, and scanner/indexing behavior.
- Nx owns target resolution, task graph, dependencies, inputs, outputs, cacheability, and cache
  replay semantics.
- Git owns staged-path identity.
- D10 owns only the policy decision over whether a file mutation is allowed, refused, or delegated
  to a declared generator/host policy.

**Repair demand:** Add a "Native Tool Authority" section to `design.md` and make the spec say D10
SHALL consume native Grit/Biome/Nx/Git behavior instead of reimplementing it. The section should
name what D10 owns and what it explicitly does not own.

### P1: Host-Specific Zones Are Still Embedded As Generic Habitat Truth

Present code hard-codes:

- `swooper-map-generated`
- `civ7-types-generated`
- `civ7-map-policy-tables`

in `tools/habitat/src/lib/generated-zones.ts`, with host-specific paths and remediation.
`rules.json` also carries `generatedZone` ids directly in file-layer rows. The packet names
G-HOST as a dependency but does not specify the join shape between D2 rule facts, G-HOST host
declarations, and D10 guard decisions.

**Repair demand:** D10 must require a concrete declaration model:

- generic declaration fields for protected/generator relation and guard behavior;
- host-policy declaration link where a zone is host-specific;
- missing-host-policy refusal state;
- D2 `ruleGeneratedZoneFacts` consumption by id, not whole `HarnessRule` rows;
- no hard-coded host path arrays in generic D10 authority.

### P1: File-Layer Staged Guard And Generated Drift Check Are Conflated

Current behavior has two different workflows:

- `runGeneratedZoneRule(..., { staged: true })` refuses staged hand edits based on `git diff --cached`.
- `verify-generated-zones.mjs` runs generation, compares snapshots, restores files, and exits
  nonzero on drift.

The D10 packet mentions both but does not make their different proof classes normative enough.

**Repair demand:** D10 must define two separate command families:

- staged guard: no regeneration, no generated-output freshness claim, refuses protected/generated
  hand edits before hooks/apply mutate or bless them;
- generated drift check: may run owning generators/verifiers through Nx, compares regenerated
  output to tracked state, restores snapshots, and does not classify staged hand edits.

### P1: Validation Gates Name A Missing Test And Weak Proof Commands

The packet currently requires:

- `bun run --cwd tools/habitat test -- test/lib/generated-zones.test.ts`

but no such current test file exists. Relevant current tests are `hooks.test.ts`,
`biome-closure.test.ts`, `grit-adapter.test.ts`, `grit-apply.test.ts`,
`enforcement-surface.test.ts`, and `classify.test.ts`.

**Repair demand:** Replace placeholder validation with exact design-time and implementation-time
commands. Do not cite a nonexistent test as a required gate.

### P2: Biome Staged Formatting Constraints Are Under-Specified

Biome has native `--staged`, but current hook code manually derives staged paths and invokes
Biome on explicit paths after refusing index-worktree split files. The packet does not decide whether
D11/D10 should preserve that integration, switch to native `--staged`, or add a pinned behavior
test proving excluded generated files stay excluded when passed explicitly.

**Repair demand:** D10 should not own index-worktree split behavior, but it must require D11/local
feedback to prove protected/generated exclusions survive the chosen Biome invocation mode. If the
hook passes explicit paths, add a test for a generated/protected path that is both staged and
Biome-supported.

### P2: Pattern-Root Safety Is Treated As If It Were Grit-Native

Current `validateScanRoots` refuses missing roots, outside-repo roots, generated output,
protected prefixes, and unapproved docs roots before Grit runs. That is good integration policy,
but Grit docs do not make this a built-in protected-zone model.

**Repair demand:** D10 should state that scan/apply root validation is a Habitat adapter guard over
Grit, not Grit semantics. Grit native ignore should do broad exclusion; Habitat root validation
should fail closed when a command asks Grit to scan or apply inside protected/generated zones.

### P2: Nx Cache Language Needs To Use Resolved Target Facts

The packet says "generated-check must record whether dependency targets were cached." Current
resolved `generated:check` is `cache: false`, while its dependencies may be cacheable or
uncached depending on their own targets. The spec should not imply that `generated:check` itself
can be a cache-hit proof.

**Repair demand:** Make D10 validation record:

- resolved target metadata via `nx show target @habitat/cli:generated:check --json`;
- `generated:check` expected `cache: false`;
- dependency target observations separately from D10's own freshness result;
- no claim that Nx cache status proves generated-zone policy correctness.

## Recommended Validation Commands

### Design-Time Grounding Commands

These should be required before packet acceptance, not as source implementation proof:

```sh
git status --short --branch
nx show projects --with-target generated:check
nx show target @habitat/cli:generated:check --json
nx show target @habitat/cli:grit:check --json
nx show target @habitat/cli:biome:ci --json
bun run openspec -- validate deep-habitat-d10-protected-zone-authority --strict
bun run openspec:validate
git diff --check
```

Expected design-time outcomes:

- clean starting and ending worktree unless only scratch/review artifacts are intentionally edited;
- `generated:check` resolves on `@habitat/cli`;
- `generated:check` has `cache: false`;
- `generated:check` has explicit `dependsOn` for `@swooper/mapgen-core:build` and
  `@civ7/map-policy:verify`;
- `grit:check` and `biome:ci` resolve as native-tool wrapper targets with explicit inputs;
- OpenSpec validates.

### Current-Code Regression Commands

These prove present contracts and are appropriate while repairing the packet:

```sh
bun run --cwd tools/habitat test -- test/lib/biome-closure.test.ts
bun run --cwd tools/habitat test -- test/lib/hooks.test.ts
bun run --cwd tools/habitat test -- test/lib/grit-adapter.test.ts test/lib/grit-apply.test.ts
bun run --cwd tools/habitat test -- test/lib/enforcement-surface.test.ts test/lib/classify.test.ts
```

Expected current-code outcomes:

- Biome generated/protected exclusions remain in `biome.json`;
- pre-commit file-layer refusal runs before Biome/Grit formatting/checking;
- index-worktree split refusal runs before Biome writes;
- Grit scan-root protection remains a Habitat adapter guard;
- generated-zone and file-layer rule registry rows remain visible to classification and target
  inference.

### Later Implementation Proof Commands

These should be required only after D10 implementation starts:

```sh
bun run --cwd tools/habitat test -- <new D10 declaration/guard tests>
bun run habitat check --staged --tool file-layer --json
nx run @habitat/cli:generated:check --outputStyle=static
bun run openspec -- validate deep-habitat-d10-protected-zone-authority --strict
bun run openspec:validate
git diff --check
```

Injected bad cases required for implementation:

- stage a protected/generated file mutation and prove nonzero refusal with zone id, owner, and
  recovery instruction;
- stage a generated/protected file whose rule references a missing declaration and prove a
  malformed/missing-declaration refusal rather than a pass;
- stage a host-specific generated file without G-HOST declaration and prove missing-host-policy
  refusal;
- verify generated drift check detects regenerated output drift, restores snapshots, and does not
  leave the worktree dirty;
- verify D11 hook path refuses generated-zone edits before Biome writes or Grit checks.

## Concrete Packet Repair Demands

1. Add a vendor authority matrix to `design.md` covering Grit, Biome, Git, Nx, D2, G-HOST, D10,
   D11, and D9.
2. Replace optional or generic zone state with a discriminated policy model:
   `protected`, `generated`, `forbidden-file`, `missing-zone-declaration`,
   `missing-host-policy`, `authorized-generator-write`, `unauthorized-hand-edit`.
3. Specify the D2/G-HOST/D10 join:
   D2 supplies file-layer rule references; G-HOST supplies host-policy declarations; D10 produces
   guard decisions and recovery instructions.
4. Split staged guard validation from generated drift validation in proposal, design, tasks, spec,
   phase record, and closure checklist.
5. Replace the nonexistent `generated-zones.test.ts` gate with actual existing tests plus a named
   future D10 implementation test file.
6. Require resolved Nx target inspection as design evidence, especially for `generated:check`.
7. Require a pinned Biome invocation decision: native `--staged` or explicit paths with tests that
   prove generated/protected exclusions still hold.
8. State that Grit `.gritignore` and `.gitignore` are the broad native exclusion layer, while
   Habitat root validation is an integration guard for command-request safety.
9. Move any packet language that implies "hook pass proves generated-zone freshness" into
   non-claims. Hooks provide local feedback; generated freshness belongs to `generated:check`.
10. Keep all source implementation blocked until D10 and G-HOST both have no accepted unresolved
    P1/P2 findings.

## Bottom Line

D10 should become more focused and sharper. Native tools already provide most of the mechanics:
Grit scans and applies patterns, Biome formats/checks selected files, Git identifies staged paths,
and Nx resolves/caches/orchestrates targets. The missing D10 design is not a new harness over
those harnesses; it is a declarative protected/generated-zone decision layer that fails closed,
names the owner, gives a safe recovery path, and cleanly separates staged hand-edit refusals from
generated-output freshness checks.
