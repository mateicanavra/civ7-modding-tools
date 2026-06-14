# Habitat Harness Recovery Claim Ledger

**Status:** Stage 0 opened; evidence/control artifact for recovery design
**Owner:** DRA Habitat recovery owner
**Created:** 2026-06-14
**Frame:** `docs/projects/habitat-harness/dra-takeover-frame.md`
**Mode:** design/specification only; this ledger does not approve code repair

This ledger is the front door for every repair workstream. A repair branch opens
only after the relevant row has current evidence, an owner, a first falsifier,
and a reviewable design packet.

## Evidence Seed

Fresh probes run on branch `codex/habitat-dra-takeover-frame`:

- `bun run habitat -- --help` exited 2 with `Unknown habitat command: --help`.
- `bun run habitat -- check --help` exited 2 without help output.
- `bun run habitat:check -- --json --rule grit-check` exited 0 and returned
  only the built-in `baseline-integrity` rule.
- `bun run habitat:check -- --json --tool grit-check` exited 0 and returned
  22 Grit rules plus `baseline-integrity`.
- `bun run habitat:check -- --json --rule definitely-not-a-rule` exited 0 and
  returned only `baseline-integrity`.
- `bun run habitat:check -- --json --tool definitely-not-a-tool` exited 0 and
  returned only `baseline-integrity`.
- Direct source oclif probes
  `bun tools/habitat-harness/src/bin/habitat.ts --help` and
  `bun tools/habitat-harness/src/bin/habitat.ts check --help` exited 0 with
  help output, so the current failure is the canonical root/dev dispatcher path
  rather than absence of oclif command classes.
- Native Grit fixture proof from
  `GRIT_TELEMETRY_DISABLED=true grit patterns test --json` passed 23 pattern
  reports and 45 samples; broad current-tree zero-finding proof remains
  unresolved and cannot be inferred from fixture success.
- `bun run --cwd tools/habitat-harness test habitat-commands.test.ts` passed,
  but those tests mock the command engine and do not prove root/dev/production
  entrypoints.
- `bun run habitat -- classify tools/habitat-harness/src/commands/check.ts`
  returned owner `@internal/habitat-harness`, tag `kind:tooling`, and a static
  required-target list.
- `bun run nx show project @internal/habitat-harness --json` confirms the
  harness project currently has inferred targets such as `grit:check`,
  `biome:*`, `boundaries`, `generated:check`, and `habitat:check`; it does not
  prove static target strings emitted by `classify` for every project kind.

Current source inspection seed:

- Root package scripts route `habitat`, `habitat:check`, `habitat:fix`, and
  `habitat:verify` through `tools/habitat-harness/bin/dev.ts`.
- `tools/habitat-harness/src/lib/command-engine.ts` filters rules without
  rejecting empty rule selections, then always appends `baseline-integrity`.
- `tools/habitat-harness/src/lib/baseline.ts` treats a missing baseline file as
  an empty locked baseline.
- `tools/habitat-harness/src/lib/grit.ts` hardcodes one apply pattern:
  `.grit/patterns/habitat/apply/deep_import_to_public_surface.md`.
- `tools/habitat-harness/src/lib/hooks.ts` runs
  `scripts/civ7-resources/publish-submodule.sh` during pre-commit.
- `tools/habitat-harness/src/generators/pattern/generator.cjs` creates an
  enforced `grit-check` rule with default scaffold authority text unless the
  caller supplies stronger metadata.

Official documentation evidence packs opened under
`docs/projects/habitat-harness/research/`:

- Nx: use resolved Nx project/task metadata as graph and target evidence; do
  not infer target existence from `targetDefaults`, tags, or static strings.
- GritQL: use native pattern tests and local current-tree proof separately;
  local shrink-only baselines remain Habitat-owned.
- Biome: separate report-only, safe-write, and unsafe/manual lanes; `biome ci`
  is read-only and Biome file includes form the outer write envelope.
- Effect: no current Habitat dependency, but it is now a first-class design
  option. If current manual orchestration structurally causes false-green
  filters, untyped failures, weak test seams, resource side effects, or stale
  proof claims, the repair design must evaluate whether Effect should own typed
  command orchestration, error channels, service boundaries, resource cleanup,
  and proof-friendly execution.
- Local Stage 0 extraction: command trust, graph/classify trust, ratchet and
  baseline trust, Grit syntax trust, safe transformations, hygiene/generated
  zones, enforcement surface, hook mutation, and records truth have distinct
  owner/proof groups. They must not collapse into one broad "green" result.
- Local Grit corpus extraction: current implemented corpus is 22 check patterns
  plus one allowlisted apply pattern; native fixture proof is green now, but
  current-tree scan, injected violation, baseline, old-mechanism parity, and
  apply-safety proof remain separate claims.
- Local Effect fit extraction: Effect is strongest where Habitat needs typed
  selector and policy failures, command provenance, service-injected tests,
  resource scopes, explicit orchestration modes, hardened Grit adapters, and
  hook transaction boundaries. It is not required merely to fix oclif help, and
  it cannot supply Grit/Biome/Nx/architecture semantics.

## Row Contract

| Field | Required content |
| --- | --- |
| Claim | Exact closure/capability claim, quoted where possible. |
| Source | Path and section, phase record, task, code, command, or user-facing claim. |
| Current evidence | Fresh command output or direct code inspection summary. |
| Evidence class | verified current behavior / historical claim / architecture target / hypothesis. |
| Still true? | yes / no / mixed-with-blockers / unknown. |
| Disposition | repair / records-only / reject / defer with trigger. |
| Owner | accountable workstream owner. |
| First verification command | first command or inspection that can disprove the row. |

## Stage 0 Rows

| ID | Claim | Source | Current evidence | Evidence class | Still true? | Disposition | Owner | First verification command |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CLAIM-H1-NX | "Turbo fully retired; Nx is graph authority." | `docs/projects/habitat-harness/workstream-record.md` H1 row; `docs/projects/habitat-harness/FRAME.md` settled decisions | Root scripts now use Nx/Habitat surfaces, but this row still needs current project-graph and retired-Turbo proof. | historical claim with source indicators | unknown | repair if graph/retirement proof fails; records-only if fresh proof passes | `habitat-nx-adoption-cleanup` | `bun run nx show projects --json` |
| CLAIM-H2-SCAFFOLD | "scaffold preserved ratchet/baseline/diagnostic semantics." | `openspec/changes/habitat-harness-scaffold/**`; `docs/projects/habitat-harness/workstream-record.md` H2 row | `baseline.ts` documents missing file as empty locked baseline; only `adapter-boundary.json` exists under baselines. Contract needs explicit acceptance or repair. | verified current behavior plus historical claim | mixed-with-blockers | repair | `habitat-scaffold-contract-repair` | `bun run habitat:check -- --json --rule adapter-boundary` |
| CLAIM-H3-TAXONOMY | "boundary taxonomy encodes current architecture." | `docs/projects/habitat-harness/taxonomy.md`; `openspec/changes/habitat-boundary-tags/**` | Taxonomy exists and rules consume tags, but Stage 0 has not yet proven every edge against current package graph and current architecture docs. | historical claim | unknown | repair if graph/taxonomy audit finds speculative edges | `habitat-boundary-taxonomy-tightening` | `bun run nx graph --file /tmp/habitat-nx-graph.json` |
| CLAIM-H4-BIOME | "Biome excluded protected archives and quarantined ESLint." | `openspec/changes/habitat-biome-hygiene/workstream/phase-record.md`; `docs/projects/habitat-harness/FRAME.md` H4 trade-off | H4 record says Biome CI and exclusions passed; current proof must re-run config inclusion/exclusion and ESLint role checks. | historical claim | unknown | repair or records-only after fresh proof | `habitat-biome-closure-proof` | `bun run nx run @internal/habitat-harness:biome:ci` |
| CLAIM-H45-CLI | "Habitat is a real oclif CLI through root/dev/production surfaces." | `openspec/changes/habitat-oclif-cli/**`; D7 in `FRAME.md`; current command probes | Root help and subcommand help fail through `bun run habitat`; direct source oclif help works. Current root scripts bypass oclif discovery/help semantics. | verified current behavior contradicts claim | no | repair | `habitat-oclif-entrypoint-repair` | `bun run habitat -- --help` |
| CLAIM-H5-GRIT | "Grit catalog is closed or first-tranche only." | `openspec/changes/habitat-grit-catalog/**`; `adversarial-audit-recovery-reference.md` H5 and Grit program | Current corpus is 22 checks plus 1 apply pattern; native fixtures pass 23 reports / 45 samples; valid `--tool grit-check` returns 22 rules plus `baseline-integrity`; broad current-tree zero-finding and apply safety proof remain unresolved. Treat as first locked tranche pending proof repair. | verified current behavior plus architecture target | mixed-with-blockers | repair | `habitat-grit-proof-repair` | `bun run habitat:check -- --json --tool grit-check` |
| CLAIM-H6-ONE-PATH | "structural enforcement has one canonical Habitat path." | `openspec/changes/habitat-enforcement-consolidation/**`; `workstream-record.md` H6 row | Root scripts include `lint:mapgen-recipe-imports` aliasing `habitat:check -- --tool grit-check`; empty filter behavior can make this alias false-green. | verified current behavior | mixed-with-blockers | repair | `habitat-enforcement-surface-cleanup` | `bun run habitat:verify` |
| CLAIM-H7-HOOKS | "hooks are bounded, local, and reversible." | `openspec/changes/habitat-git-hooks/**`; `tools/habitat-harness/src/lib/hooks.ts` | Pre-commit performs resource publishing before staged checks. Hook side-effect policy needs explicit retain/remove decision with proof. | verified current behavior | mixed-with-blockers | repair | `habitat-git-hook-hardening` | `bun tools/habitat-harness/bin/dev.ts hook pre-commit` |
| CLAIM-H8-CLASSIFY | "classify/generate is an agent primitive." | `openspec/changes/habitat-generators-migrations/**`; `tools/habitat-harness/src/lib/command-engine.ts`; generators | `classify` resolves current owner for one path, but required targets are static and generator support is limited to uniform project kinds plus pattern scaffolds. | verified current behavior | mixed-with-blockers | repair | `habitat-classify-generator-repair` | `bun run habitat -- classify packages/civ7-adapter/src/index.ts` |
| CLAIM-PRODUCT-TRANSFORMS | "Grit transformations exist beyond one codemod." | Original product outcome in `FRAME.md`; `dra-takeover-frame.md`; `.grit/patterns/habitat/apply/**` | Exactly one apply pattern is allowlisted and implemented. Candidate transforms require safety and applied-diff proof before product capability can be claimed. | verified current behavior | no | repair through pattern/codemod workstreams | `habitat-grit-pattern-suite` | `rg -n "gritApplyPatterns" tools/habitat-harness/src/lib/grit.ts` |
| CLAIM-PRODUCT-GENERATORS | "generators can construct or modify all promised structure." | Original product outcome in `FRAME.md`; H8 records; generator source | Project generator supports plugin/foundation/app only; pattern generator does not require authority/proof metadata; migration is no-op. | verified current behavior | no | repair | `habitat-classify-generator-repair` plus pattern-generator metadata repair | `find tools/habitat-harness/src/generators -type f -maxdepth 5` |
| CLAIM-P0-ROOT-HELP | "Root Habitat help is truthful." | H4.5 closure claim; DRA contradiction list | `bun run habitat -- --help` exits 2 with unknown-command output. | verified current behavior | no | repair | `habitat-oclif-entrypoint-repair` | `bun run habitat -- --help` |
| CLAIM-P0-SUBCOMMAND-HELP | "Subcommand help is truthful." | H4.5 closure claim; DRA contradiction list | `bun run habitat -- check --help` exits 2 and emits no help text. | verified current behavior | no | repair | `habitat-oclif-entrypoint-repair` | `bun run habitat -- check --help` |
| CLAIM-P0-PROD-RUNNER | "Production runner help is current-proofed after build." | `tools/habitat-harness/bin/run.js`; H4.5 production proof claim | Not rechecked in this Stage 0 seed; must follow a clean build and avoid ignored stale `dist`. | hypothesis requiring fresh proof | unknown | repair if prod runner fails; otherwise records-only | `habitat-oclif-entrypoint-repair` | `bun run nx run @internal/habitat-harness:build` |
| CLAIM-P0-UNKNOWN-COMMAND | "Unknown command failure is truthful." | Current root dispatcher behavior | `--help` currently routes as an unknown command. Unknown command semantics exist but are mixed with help behavior. | verified current behavior | mixed-with-blockers | repair | `habitat-oclif-entrypoint-repair` | `bun run habitat -- definitely-not-a-command` |
| CLAIM-P0-UNKNOWN-RULE | "Unknown --rule selections fail truthfully." | DRA contradiction list; `selectRules` implementation | `--rule definitely-not-a-rule` exits 0 and returns only `baseline-integrity`. | verified current behavior | no | repair | `habitat-oclif-entrypoint-repair` or `habitat-grit-proof-repair` depending owner split | `bun run habitat:check -- --json --rule definitely-not-a-rule` |
| CLAIM-P0-UNKNOWN-TOOL | "Unknown --tool selections fail truthfully." | DRA contradiction list; `selectRules` implementation | `--tool definitely-not-a-tool` exits 0 and returns only `baseline-integrity`. | verified current behavior | no | repair | `habitat-oclif-entrypoint-repair` or `habitat-grit-proof-repair` depending owner split | `bun run habitat:check -- --json --tool definitely-not-a-tool` |
| CLAIM-P1-BASELINE | "Every hardened baseline is explicit, committed, and has documented missing-file semantics." | `baseline.ts`; `tools/habitat-harness/baselines/**`; H2/H5 records | Missing baseline file is empty locked baseline by code comment; only one JSON baseline file exists. Needs accepted contract and docs/tests. | verified current behavior | mixed-with-blockers | repair | `habitat-scaffold-contract-repair` | `find tools/habitat-harness/baselines -maxdepth 1 -type f -print` |
| CLAIM-P1-PATTERN-GENERATOR | "Generated Grit patterns carry authority/evidence metadata before enforcement." | `pattern/generator.cjs`; `pattern/schema.json`; DRA frame | Generator creates enforced rules with default scaffold authority text. This is opposite of the recovery standard until repaired. | verified current behavior | no | repair | `habitat-pattern-generator-metadata-repair` | `sed -n '1,220p' tools/habitat-harness/src/generators/pattern/generator.cjs` |
| CLAIM-P1-CLASSIFY-TARGETS | "`classify` reports existing targets only." | H8 records; `projectTargets()` in `command-engine.ts` | Required targets are constructed statically from project name and workspace targets. Needs Nx target-existence proof across project kinds. | verified current behavior | unknown | repair | `habitat-classify-generator-repair` | `bun run nx show project @civ7/adapter --json` |
| CLAIM-P1-EFFECT-FIT | "Current Habitat manual orchestration is the right implementation substrate." | User correction on 2026-06-14; `official-docs-effect.md`; `research/local-effect-adoption-fit.md`; current `command-engine.ts`, `spawn.ts`, `hooks.ts`, tests | Local fit evidence shows strong Effect fit for typed selector/policy failures, command provenance, service-injected tests, resource scopes, explicit orchestration modes, Grit adapter hardening, and hook transactions. Oclif help itself may be a targeted dispatcher repair. Needs accepted per-workstream decision before implementation. | verified current behavior plus design hypothesis | mixed-with-blockers | design evaluation | `habitat-effect-orchestration-evaluation` | `sed -n '1,260p' docs/projects/habitat-harness/research/local-effect-adoption-fit.md` |
| CLAIM-P1-STALE-RECORDS | "Project records no longer overclaim H1-H8 closure." | `workstream-record.md`; H1-H8 phase records; DRA frame | `workstream-record.md` still says train locally closed while current P0 command behavior contradicts H4.5/H5 closure. | verified current behavior | no | repair records in the same loops as code/spec fixes | `habitat-stale-record-cleanup` | `rg -n "closed|DONE|proof|help" docs/projects/habitat-harness openspec/changes/habitat-* -g '*.md'` |

## Initial Owner Groups

| Group | Rows | Required design output |
| --- | --- | --- |
| Command trust | CLAIM-H45-CLI, CLAIM-P0-ROOT-HELP, CLAIM-P0-SUBCOMMAND-HELP, CLAIM-P0-PROD-RUNNER, CLAIM-P0-UNKNOWN-COMMAND, CLAIM-P0-UNKNOWN-RULE, CLAIM-P0-UNKNOWN-TOOL | `habitat-oclif-entrypoint-repair` OpenSpec with root/dev/prod command proof and false-green filter policy. |
| Rule proof trust | CLAIM-H5-GRIT, CLAIM-H6-ONE-PATH, CLAIM-P1-BASELINE | `habitat-grit-proof-repair` plus scaffold/baseline contract design. Keep native fixture proof, current-tree scan, injected violation, baseline behavior, old-mechanism parity, and apply safety as separate proof classes. |
| Agent routing trust | CLAIM-H1-NX, CLAIM-H3-TAXONOMY, CLAIM-H8-CLASSIFY, CLAIM-P1-CLASSIFY-TARGETS | classify/generator repair design tied to current Nx graph and taxonomy proof. |
| Mutation containment | CLAIM-H7-HOOKS, CLAIM-PRODUCT-TRANSFORMS, CLAIM-PRODUCT-GENERATORS, CLAIM-P1-PATTERN-GENERATOR | hook hardening, pattern-generator metadata repair, and per-codemod safety packets. |
| Implementation substrate | CLAIM-P1-EFFECT-FIT plus command/rule/hook rows if evidence connects them | decide whether repair slices preserve current manual internals, introduce Effect behind oclif, or open a larger command orchestration redesign before dependent implementation. |
| Records truth | CLAIM-P1-STALE-RECORDS plus every repaired row | stale-record cleanup in each repair loop, not a trailing prose sweep. |

## Official-Docs Constraints On Repair Design

| Source pack | Repair constraint |
| --- | --- |
| `research/official-docs-nx.md` | `classify` and generator specs must prove target existence from resolved Nx output such as `nx show projects --with-target`, `nx show project`, or `nx show target`; `nx affected` may reduce verification work but must not be recorded as architecture/product proof. |
| `research/official-docs-gritql.md` | Grit repair must treat `grit patterns test`, current-tree scan, injected violation proof, and Habitat baseline behavior as separate proof classes. Unknown rule/tool filters cannot pass by selecting only `baseline-integrity`. |
| `research/official-docs-biome.md` | Biome repair and hook design must distinguish report-only commands from write commands. `biome ci` remains CI/read-only; write paths must be constrained by file includes, staged-file policy, and safe-fix semantics. |
| `research/official-docs-effect.md` and `research/local-effect-adoption-fit.md` | Effect is not current Habitat behavior, but it may be the correct repair substrate if the manual system is structurally producing the observed failures. Any Effect slice must be framed explicitly with parity proof, typed error channels, runtime-edge discipline, service injection, resource cleanup, command provenance, and a decision on whether oclif remains an outer adapter or is replaced by an accepted command-surface redesign. |

## Review Gates Before Repair Implementation

Each repair workstream must produce:

1. Claim rows moved from seed to reviewed with current evidence.
2. OpenSpec proposal/design/tasks/workstream packet.
3. Owner layer and forbidden owner statement.
4. Write set and protected paths.
5. Proof classes with exact commands and non-claims.
6. Product/evidence/system review findings and dispositions.
7. Implementation packet that can be executed without rediscovering the product
   outcome.
