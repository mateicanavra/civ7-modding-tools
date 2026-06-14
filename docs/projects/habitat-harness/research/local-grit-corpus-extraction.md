# Local Grit Corpus Extraction Evidence Pack

All paths are repo-relative to
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-F-habitat-harness-workstream`.

Evidence standard: current source and fresh local commands win over historical
phase records; historical records are cited as context unless current code or a
fresh command still supports the claim. This follows the recovery source order in
`docs/projects/habitat-harness/adversarial-audit-recovery-reference.md:31` and
the DRA takeover frame in
`docs/projects/habitat-harness/dra-takeover-frame.md:18`.

Local repo state observed before writing: current branch
`codex/habitat-dra-takeover-frame` with pre-existing modified
`docs/projects/habitat-harness/dra-takeover-frame.md`,
`docs/projects/habitat-harness/habitat-harness-spec-draft-input.md`, and
`openspec/changes/habitat-biome-hygiene/workstream/phase-record.md`, plus
pre-existing untracked Habitat research/ledger files. This artifact only writes
this file.

Fresh command proof captured in this pass:

- `rg --files -uu .grit/patterns/habitat` found 23 pattern files: 22 under
  `checks/` and 1 under `apply/`.
- `GRIT_TELEMETRY_DISABLED=true GRIT_CACHE_DIR=<tmp> grit patterns test --json`
  returned exit 0 and parsed 23 successful pattern reports with 45 passing
  samples.
- A broad raw current-tree `grit --json check` probe was stopped after it ran
  longer than useful for this read-only extraction. Current-tree zero-finding
  proof is therefore not claimed here.

## Current Implemented Corpus

Current implemented count:

- Check corpus: 22 markdown patterns under `.grit/patterns/habitat/checks/`.
- Apply corpus: 1 markdown pattern under `.grit/patterns/habitat/apply/`.
- `.grit/grit.yaml` currently contains only `version: 0.0.2` and
  `patterns: []` at `.grit/grit.yaml:1`, yet native `grit patterns test` still
  discovers `.grit/patterns/habitat/**`.
- The pattern layout expected by H5 is documented at
  `openspec/changes/habitat-grit-catalog/design.md:3`.
- The implemented tranche is explicitly "first locked tranche", not a complete
  catalog, per
  `docs/projects/habitat-harness/adversarial-audit-recovery-reference.md:484`
  and `docs/projects/habitat-harness/dra-takeover-frame.md:259`.

Current check patterns and rule-pack registrations:

| Group | Pattern file | Habitat rule / registry evidence | Owner project and scan intent | Ledger seed |
| --- | --- | --- | --- | --- |
| Domain surface | `.grit/patterns/habitat/checks/domain_deep_import.md:4` | `grit-domain-deep-import`, `rules.json:120` | `mod-swooper-maps`; recipes/maps deep domain imports | `habitat-grit-proof-domain-deep-import` |
| Domain surface | `.grit/patterns/habitat/checks/recipe_domain_surface.md:4` | `grit-recipe-domain-surface`, `rules.json:135` | `mod-swooper-maps`; recipes import approved domain surfaces | `habitat-grit-proof-recipe-domain-surface` |
| Domain surface | `.grit/patterns/habitat/checks/studio_recipe_artifacts.md:4` | `grit-studio-recipe-artifacts`, `rules.json:150` | `@internal/habitat-harness`; Studio UI recipe artifact imports | `habitat-grit-proof-studio-recipe-artifacts` |
| Domain surface | `.grit/patterns/habitat/checks/step_contract_domain_surface.md:4` | `grit-step-contract-domain-surface`, `rules.json:165` | `mod-swooper-maps`; step contract imports | `habitat-grit-proof-step-contract-domain-surface` |
| Domain surface | `.grit/patterns/habitat/checks/recipe_runtime_domain_ops.md:4` | `grit-recipe-runtime-domain-ops`, `rules.json:180` | `mod-swooper-maps`; recipe runtime domain ops imports | `habitat-grit-proof-recipe-runtime-domain-ops` |
| Domain surface | `.grit/patterns/habitat/checks/contract_export_all.md:4` | `grit-contract-export-all`, `rules.json:70` | `mod-swooper-maps`; contract/public-surface value export stars | `habitat-grit-proof-contract-export-all` |
| Runtime purity | `.grit/patterns/habitat/checks/runtime_validation_imports.md:4` | `grit-runtime-validation-imports`, `rules.json:195` | `mod-swooper-maps`; runtime validation imports | `habitat-grit-proof-runtime-validation-imports` |
| Runtime purity | `.grit/patterns/habitat/checks/runtime_run_validated.md:4` | `grit-runtime-run-validated`, `rules.json:210` | `mod-swooper-maps`; runtime `runValidated` calls | `habitat-grit-proof-runtime-run-validated` |
| Runtime purity | `.grit/patterns/habitat/checks/runtime_helper_redeclarations.md:4` | `grit-runtime-helper-redeclarations`, `rules.json:225` | `mod-swooper-maps`; helper redeclarations | `habitat-grit-proof-runtime-helper-redeclarations` |
| Runtime purity | `.grit/patterns/habitat/checks/empty_schema_default.md:4` | `grit-empty-schema-default`, `rules.json:240` | `mod-swooper-maps`; empty object defaults in schemas | `habitat-grit-proof-empty-schema-default` |
| Runtime purity | `.grit/patterns/habitat/checks/mapgen_core_runtime_civ7.md:4` | `grit-mapgen-core-runtime-civ7`, `rules.json:255` | `@swooper/mapgen-core`; Civ7 runtime coupling in core/engine | `habitat-grit-proof-mapgen-core-runtime-civ7` |
| Stage isolation | `.grit/patterns/habitat/checks/sibling_stage_step_imports.md:4` | `grit-sibling-stage-step-imports`, `rules.json:270` | `mod-swooper-maps`; sibling stage step imports | `habitat-grit-proof-sibling-stage-step-imports` |
| Stage isolation | `.grit/patterns/habitat/checks/domain_root_catalogs.md:4` | `grit-domain-root-catalogs`, `rules.json:285` | `mod-swooper-maps`; domain-root tag/artifact catalogs | `habitat-grit-proof-domain-root-catalogs` |
| Stage isolation | `.grit/patterns/habitat/checks/wrapper_advanced_stage_config.md:4` | `grit-wrapper-advanced-stage-config`, `rules.json:300` | `mod-swooper-maps`; wrapper-only advanced config | `habitat-grit-proof-wrapper-advanced-stage-config` |
| Stage isolation | `.grit/patterns/habitat/checks/placement_outcome_boundary.md:4` | `grit-placement-outcome-boundary`, `rules.json:315` | `mod-swooper-maps`; placement outcome boundary | `habitat-grit-proof-placement-outcome-boundary` |
| Ownership | `.grit/patterns/habitat/checks/adapter_base_standard_import.md:4` | `grit-adapter-base-standard-import`, `rules.json:330` | `@internal/habitat-harness`; `/base-standard/` imports outside adapter | `habitat-grit-proof-adapter-base-standard-import` |
| Ownership | `.grit/patterns/habitat/checks/control_orpc_contract_ownership.md:4` | `grit-control-orpc-contract-ownership`, `rules.json:345` | `@civ7/control-orpc`; transport-pure contracts | `habitat-grit-proof-control-orpc-contract-ownership` |
| Ownership | `.grit/patterns/habitat/checks/viz_contract_ownership.md:4` | `grit-viz-contract-ownership`, `rules.json:360` | `mod-swooper-maps`; stage visualization ownership | `habitat-grit-proof-viz-contract-ownership` |
| Ownership | `.grit/patterns/habitat/checks/sdk_mapgen_entrypoint.md:4` | `grit-sdk-mapgen-entrypoint`, `rules.json:375` | `@mateicanavra/civ7-sdk`; SDK mapgen subpath isolation | `habitat-grit-proof-sdk-mapgen-entrypoint` |
| Domain ops boundary | `.grit/patterns/habitat/checks/domain_ops_boundary_imports.md:4` | `grit-domain-ops-boundary-imports`, `rules.json:390` | `mod-swooper-maps`; ops adapter/context crossing | `habitat-grit-proof-domain-ops-boundary-imports` |
| Domain ops boundary | `.grit/patterns/habitat/checks/domain_ops_projection_effects.md:4` | `grit-domain-ops-projection-effects`, `rules.json:405` | `mod-swooper-maps`; ops map artifact/effect deps | `habitat-grit-proof-domain-ops-projection-effects` |
| Domain ops boundary | `.grit/patterns/habitat/checks/domain_ops_root_config.md:4` | `grit-domain-ops-root-config`, `rules.json:420` | `mod-swooper-maps`; ops importing domain-root config facades | `habitat-grit-proof-domain-ops-root-config` |

All current check patterns have native markdown samples. The test harness reads
check and apply pattern names from the filesystem at
`tools/habitat-harness/test/grit/grit-patterns.test.ts:20`, invokes
`grit patterns test --json` at
`tools/habitat-harness/test/grit/grit-patterns.test.ts:30`, and requires report
count plus all sample states to pass at
`tools/habitat-harness/test/grit/grit-patterns.test.ts:50`.

## Current Apply Surface

Current apply corpus:

| Pattern | File | Current allowlist | Apply roots | Safety status |
| --- | --- | --- | --- | --- |
| `deep_import_to_public_surface` | `.grit/patterns/habitat/apply/deep_import_to_public_surface.md:4` | hardcoded at `tools/habitat-harness/src/lib/grit.ts:35` | discovered `mods/*/src/{recipes,maps}` via `tools/habitat-harness/src/lib/grit.ts:136` | implemented, under-proof |

Apply execution details:

- The hardcoded apply list contains only
  `.grit/patterns/habitat/apply/deep_import_to_public_surface.md` at
  `tools/habitat-harness/src/lib/grit.ts:35`.
- `runGritApplyPatterns` loops that allowlist and invokes
  `grit apply <pattern> ... --force --output compact` with optional `--dry-run`
  at `tools/habitat-harness/src/lib/grit.ts:86`.
- Apply scan roots are discovered from `mods/*/src`, then constrained to existing
  `recipes` and `maps` children at `tools/habitat-harness/src/lib/grit.ts:136`.
  The current discovered roots are `mods/mod-swooper-maps/src/recipes` and
  `mods/mod-swooper-maps/src/maps`.
- `habitat fix` runs the allowlisted Grit apply patterns first, then runs
  `biome check .` for dry-run or `biome check --write .` for writes at
  `tools/habitat-harness/src/lib/command-engine.ts:173`.
- H5 approved only this mechanical deep-domain-ops import rewrite and rejected
  `export *` to named exports because pure Grit cannot synthesize cross-file
  export lists safely, per
  `openspec/changes/habitat-grit-catalog/tasks.md:45`.

Apply safety disposition:

- Current apply pattern is allowed only for mechanical
  `@mapgen/domain/<domain>/ops/<private>` to `/ops` import normalization.
- It needs a ledger row that proves target export existence, type-only
  preservation, dry-run/apply diff behavior, rollback by Git review, and
  typecheck/test proof before further retirement or broader use.
- The DRA frame explicitly says every Grit apply pattern still needs
  applied-diff proof or manual/generator-owned disposition at
  `docs/projects/habitat-harness/dra-takeover-frame.md:389`.

## Tests/Baselines

Current tests and proof surfaces:

| Surface | Current evidence | What it proves | What it does not prove |
| --- | --- | --- | --- |
| Native pattern samples | `tools/habitat-harness/test/grit/grit-patterns.test.ts:20` and fresh command: 23 reports / 45 samples passed | Pattern markdown is discoverable and sample cases pass | Current-tree scan scope, baseline semantics, parity with old checks, apply safety |
| Command plumbing | `tools/habitat-harness/test/commands/habitat-commands.test.ts:70`, `:103`, `:115` | Oclif command flags call the engine for check, baseline expansion, and fix dry-run | Real engine behavior, real Grit apply, real Biome output |
| Classify matrix | `tools/habitat-harness/test/lib/classify.test.ts:5` | Representative paths map to project/tags/rules/targets | Complete path-specific rule precision across repo |
| H5 historical proof | `openspec/changes/habitat-grit-catalog/workstream/phase-record.md:148` | Historical H5 closure claimed native samples, probes, current-tree Grit target, generated-zone probe, build/check/test | Current behavior in this worktree unless re-run |
| H6 historical proof | `openspec/changes/habitat-enforcement-consolidation/workstream/phase-record.md:164` | Historical H6 closure claimed 23 patterns / 45 samples and retired-script probes | Current behavior in this worktree unless re-run |

Baseline behavior:

- Baseline code says one file per rule lives under
  `tools/habitat-harness/baselines/<rule-id>.json`, and missing file means empty
  baseline / locked rule at `tools/habitat-harness/src/lib/baseline.ts:7`.
- `habitat check` marks a rule locked when its baseline set is empty and
  `exceptionPath` is `none` at
  `tools/habitat-harness/src/lib/command-engine.ts:78`.
- Baseline expansion is explicit and local via `--expand-baseline`, but CI-style
  integrity rejects added baseline entries for existing rules unless the rule id
  is new at the merge base, per `tools/habitat-harness/src/lib/baseline.ts:71`.
- Current live baseline files: only
  `tools/habitat-harness/baselines/adapter-boundary.json:1`, containing one
  entry for `packages/civ7-map-policy/src/river-type-metadata.source.ts`.
- The legacy broad adapter allowlist remains in
  `scripts/lint/lint-adapter-boundary.sh:24` with seven listed files at
  `scripts/lint/lint-adapter-boundary.sh:26`. The Grit runtime-import rule is a
  separate empty-baseline rule.

Retired and remaining guardrail surfaces:

- Live `scripts/lint/` files are only
  `lint-adapter-boundary.sh`, `lint-domain-refactor-guardrails.sh`,
  `lint-mapgen-docs.py`, and `no-legacy-m4-foundation-tokens.txt`.
- H6 records `lint-mapgen-recipe-imports.sh` as deleted and retired to
  `grit-recipe-domain-surface` at
  `openspec/changes/habitat-enforcement-consolidation/workstream/phase-record.md:102`.
- H6 records `lint-control-orpc-contract-ownership.mjs` as deleted and retired
  to `grit-control-orpc-contract-ownership` at
  `openspec/changes/habitat-enforcement-consolidation/workstream/phase-record.md:105`.
- H6 records root non-boundary `eslint.config.js` rules as deleted/retired to
  H5 Grit plus H6 `grit-contract-export-all`, while `eslint.boundaries.config.mjs`
  remains for Nx boundaries at
  `openspec/changes/habitat-enforcement-consolidation/workstream/phase-record.md:106`.
- H6 records `recipe-import-boundary.test.ts` as deleted and
  `ecology-step-import-guardrails.test.ts` as slimmed to directory absence at
  `openspec/changes/habitat-enforcement-consolidation/workstream/phase-record.md:110`.
- Current wrapped/kept tests include `core-purity`, `rng-authority-boundary`,
  `ecology-step-import-guardrails`, `m11-projection-boundary-band`,
  `map-bundle-runtime-imports`, and `test:architecture-cutover`, as registered
  in `tools/habitat-harness/src/rules/rules.json:491`.

## Recovery Candidates

Recovery candidates must not be implemented from keyword hits alone. The
recovery reference requires at least one normative source plus one proving source
for every Grit candidate at
`docs/projects/habitat-harness/adversarial-audit-recovery-reference.md:424`,
and it requires scan roots, fixtures, baseline action, and apply disposition at
`docs/projects/habitat-harness/adversarial-audit-recovery-reference.md:468`.

Candidate check families from the recovery reference:

| Candidate OpenSpec id | Candidate obligation | Owner layer disposition | Evidence status |
| --- | --- | --- | --- |
| `habitat-grit-domain-engine-imports` | Non-type engine imports stay out of domain ops | grit-check | Needs architecture citation and scan |
| `habitat-grit-runtime-config-merge` | Runtime config merge/default shapes move to contract-owned inputs | grit-check | Needs examples and false-positive study |
| `habitat-grit-op-calls-op` | Private sibling op composition does not bypass orchestration | grit-check | Needs current scan and authority |
| `habitat-grit-ops-bind-runvalidated` | `ops.bind` / `runValidated` forbidden in runtime layers | grit-check | Must compare with existing `runtime_run_validated` |
| `habitat-grit-stage-contract-dependencies` | Stage contract dependency-key drift | grit-check or test | Strong pilot candidate if old/new parity is proven |
| `habitat-grit-domain-deep-import-tests` | Test-only deep imports use public surfaces unless explicitly allowed | grit-check or manual | Needs architecture/testing decision |
| `habitat-grit-recipe-imports-in-domain` | Domain code does not import recipe modules | grit-check | Needs taxonomy/domain authority |
| `habitat-grit-rng-authority-static` | RNG and official-generator authority remains in approved generation surfaces | grit-check or test | Needs product/architecture authority |
| `habitat-grit-shim-cutover-terms` | Cutover/shim terms do not hide untracked debt | manual unless precise authority exists | Keyword risk is high |
| `habitat-grit-control-app-surface` | App/browser code does not add bespoke control/RPC paths | grit-check | Needs control architecture authority |
| `habitat-grit-generated-bundle-node-builtins` | Generated UI/game bundles remain free of Node builtins and runtime transports | file-layer or grit-check | Strong pilot if current issue remains |

These rows come from
`docs/projects/habitat-harness/adversarial-audit-recovery-reference.md:499`.

Candidate apply codemods from the recovery reference:

| Candidate OpenSpec id | Transform | Owner layer | Safety gate |
| --- | --- | --- | --- |
| `habitat-grit-apply-domain-public-imports` | Normalize approved deep domain imports to public surfaces | grit-apply | Target export exists, no symbol rename, typecheck proof |
| `habitat-grit-apply-type-only-imports` | Convert value imports to `import type` where usage is provably type-only | grit-apply or Biome if Biome owns it | No name guessing, typecheck proves behavior |
| `habitat-grit-apply-helper-redeclarations` | Replace exact helper redeclarations with canonical helper imports | grit-apply | Exact body match and unambiguous import target |

These rows come from
`docs/projects/habitat-harness/adversarial-audit-recovery-reference.md:518`.

Legacy full-profile guardrail candidate families still live in
`scripts/lint/lint-domain-refactor-guardrails.sh` and should be dispositioned
row-by-row, not ported wholesale:

- Boundary-profile families already ported or wrapped: ops adapter/context
  crossing, ops map projection/effect dependencies, and ops domain-root config
  imports at `scripts/lint/lint-domain-refactor-guardrails.sh:257`.
- Full-profile general families: domain entrypoint re-exports, RNG callbacks,
  engine imports, non-type engine imports, runtime config merges, op-calls-op,
  `ops.bind`/`runValidated`, stage contract dependency keys, and stage runtime
  config merges at `scripts/lint/lint-domain-refactor-guardrails.sh:262`.
- Hydrology/narrative families: authored climate interventions, narrative
  domain imports, narrative swatches stage, and hydrology bag/step-id config
  shapes at `scripts/lint/lint-domain-refactor-guardrails.sh:279`.
- Foundation families: stage cast-merge hacks, sentinel passthrough, legacy
  aggregate tectonic-history surfaces, shared tectonics import/re-export shims,
  non-local strategy imports, and duplicate math helper redeclarations at
  `scripts/lint/lint-domain-refactor-guardrails.sh:300`.
- Ecology families: step contract deep imports, rules importing op contracts,
  type exports from rules, inner-config `runValidated`, custom strategy envelope
  schemas, schema descriptions, JSDoc coverage, and canonical op module files at
  `scripts/lint/lint-domain-refactor-guardrails.sh:360`.
- Full-profile trailing families: runtime typebox/value imports, domain
  deep-imports outside domain roots including tests, recipe imports in domain,
  domain tag/artifact shims, unknown bag config usage, and domain artifacts
  modules at `scripts/lint/lint-domain-refactor-guardrails.sh:425`.

## Generator/Migration/Manual Dispositions

Generator and migration surfaces:

- `@internal/habitat-harness:pattern` is declared in
  `tools/habitat-harness/generators.json:11`.
- The current pattern generator writes a check pattern, an empty baseline, and a
  rule-pack entry at `tools/habitat-harness/src/generators/pattern/generator.cjs:5`.
- The generator currently supplies placeholder authority text when `why` is
  omitted at `tools/habitat-harness/src/generators/pattern/generator.cjs:23`.
  The DRA frame calls this out as a repair need at
  `docs/projects/habitat-harness/dra-takeover-frame.md:194`.
- The README describes the pattern generator as writing the native pattern,
  empty locked baseline, and `grit-check` rule-pack entry at
  `tools/habitat-harness/README.md:81`.
- H8 verifies supported project generators and pattern generator probes at
  `openspec/changes/habitat-generators-migrations/workstream/phase-record.md:57`.
- Harness migrations are declared in `tools/habitat-harness/migrations.json:5`;
  the current migration is a no-op proof of wiring, not a real structural
  migration.

Disposition boundaries:

| Surface | Disposition | Rationale |
| --- | --- | --- |
| Project scaffolds and package tags | generator | Filesystem/package topology exceeds safe Grit replacement |
| Domain op skeletons | generator or manual | Needs domain semantics and file topology |
| Stage/step topology | generator or migration | Cross-file recipe topology is not a safe single-pattern rewrite |
| Contract file creation | generator | File creation and naming require owner authority |
| Generated artifact updates | generator/build owner plus file-layer check | Generated outputs are read-only to agents |
| Broad export-surface normalization | migration/manual unless exact safe subcase is proven | Cross-file symbol synthesis is unsafe for generic Grit apply |
| Doc/code sync, ADR quality, schema prose | manual, test, or habitat-native | Natural language and authority decisions are not source-shape rewrites |
| Runtime proof and product acceptance | runtime/test proof | Grit cannot prove live Civ7 behavior |

These match the recovery reference at
`docs/projects/habitat-harness/adversarial-audit-recovery-reference.md:529`.

## Proposed Ledger Rows

Seed the formal ledger with these row groups. Each row must keep the full row
contract from `docs/projects/habitat-harness/dra-takeover-frame.md:237`.

| Row group | Rows to seed | Authority | Proving source | Owner layer | Scan roots | Fixture strategy | Baseline action | Apply safety | Proposed OpenSpec ids |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Existing check tranche | All 22 check patterns listed in Current Implemented Corpus | `FRAME.md`, `invariant-corpus.md`, `taxonomy.md`, H5/H6 records, current `rules.json` | Native samples, retired mechanism probes, current source scan still needed | grit-check | `packages`, `apps/mapgen-studio/src`, `mods/mod-swooper-maps/src/{recipes,maps,domain}` | Positive and negative native samples already exist; add parser-edge and false-positive breadth where thin | Empty locked unless a current scan proves findings; adapter broad allowlist remains separate | Non-apply unless a separate apply row proves safety | `habitat-grit-proof-<pattern-name>` per rule |
| Existing apply tranche | `deep_import_to_public_surface` | Domain public-surface rules, H5 records, current exports | Native apply sample, dry-run/apply diff, typecheck/test proof needed | grit-apply | discovered `mods/*/src/{recipes,maps}` | Positive value and type imports, negative public imports, mixed aliases, missing-target false positives | Not baseline-owned | Mechanical only; target export exists; type-only preserved; diff reviewable | `habitat-grit-apply-deep-import-public-surface-proof` |
| File-layer generated zones | `swooper-map-generated`, `civ7-types-generated`, `civ7-map-policy-tables`, `pnpm-artifacts` | root AGENTS generated-artifact rule, H5/H7 records | staged-file probes and generated-check targets | file-layer | staged diff paths only | staged positive probes and allowed generated-output workflow checks | Empty locked | Non-apply; remediation is generator/workflow | `habitat-file-layer-generated-zone-proof` or per-zone rows |
| Recovery check candidates | 11 rows from Recovery Candidates | recovery reference plus specific taxonomy/invariant/docs | current scans, old scripts/tests, injected probes | grit-check, file-layer, test, or manual by row | exact row roots, not global | positive, negative, parser-edge, false-positive samples | empty locked, shrink-only, remediation, or rejected | non-apply unless a separate apply row exists | candidate ids in Recovery Candidates table |
| Recovery apply candidates | 3 rows from Candidate Apply Codemods | public-surface/type/helper authority | dry-run, applied diff, typecheck/test proof | grit-apply or generator/manual | exact safe roots only | positive rewrite, negative unsafe, parser-edge samples | not baseline-owned | explicit safety condition per row | candidate ids in Candidate Apply Codemods table |
| Full-profile guardrail backlog | families from `lint-domain-refactor-guardrails.sh` full profile | script plus domain docs/taxonomy to verify | current full-profile scan and exemplars | mixed: grit-check, generator, file-layer, test, manual | domain/stage-specific roots | one fixture set per shared false-positive model | decide per row after scan | mostly non-apply; helper and import rows may become apply rows | split into one id per shared authority/owner/safety boundary |
| Generator/migration/manual dispositions | project scaffolds, domain skeletons, topology, contracts, generated outputs, doc/proof work | README, H8 spec, recovery reference | generator probes, migration proof, manual review | generator, migration, file-layer, test, manual | owning generated or doc roots | generator fixtures/probes, not Grit markdown unless syntax-only | no Grit baseline | Grit apply rejected unless exact syntactic rewrite is proven | `habitat-classify-generator-repair` plus later domain-specific ids |

Grouping boundaries to preserve:

- Do not combine rows unless they share the same architecture authority, owner
  layer, false-positive model, scan roots, fixture strategy, and remediation or
  rollback story. This is the recovery rule at
  `docs/projects/habitat-harness/adversarial-audit-recovery-reference.md:409`.
- Keep check rows and apply rows separate even when the same source pattern is
  involved. A diagnostic is not proof that a rewrite is safe.
- Keep file-layer generated-zone protection separate from Grit syntax checks.
  Generated output correctness belongs to generator/build proof; staged edits
  belong to file-layer.
- Keep runtime/product claims out of Grit rows unless the row only detects a
  source-shape precondition. Live Civ7 behavior requires runtime proof.

## Uncertainties

- Current-tree zero-finding proof is unresolved in this extraction. Native
  pattern samples passed now, but the broad current-tree Grit scan was not
  completed in this pass.
- `.grit/grit.yaml` currently has `patterns: []`, while native discovery still
  finds 23 patterns. This may be normal Grit convention, but the H5 language
  saying `.grit/grit.yaml` "loads" patterns should be made precise.
- Baseline semantics are implemented as missing file equals empty locked
  baseline. The DRA frame flags this as a current contradiction/repair target at
  `docs/projects/habitat-harness/dra-takeover-frame.md:191`.
- A pre-existing untracked
  `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` is present in
  this worktree. It appears to be a Stage 0 ledger draft, but because it is
  untracked and outside my assigned write path, this evidence pack treats it as
  local supporting evidence only and does not edit it.
- H5/H6 phase records contain useful historical proof, but the recovery
  reference explicitly says old phase records do not prove current truth. Any
  closure or retirement claim should be re-run under `habitat-grit-proof-repair`.
- The one existing apply pattern is implemented but under-proven for production
  safety. The next proof pass should include dry-run output, a controlled
  applied diff, target export existence checks, typecheck/test proof, and
  rollback notes.
