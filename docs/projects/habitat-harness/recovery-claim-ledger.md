# Habitat Harness Recovery Claim Ledger

**Status:** Stage 0 opened; evidence/control artifact for recovery design
**Owner:** DRA Habitat recovery owner
**Created:** 2026-06-14
**Frame:** `docs/projects/habitat-harness/dra-takeover-frame.md`
**Mode:** design/specification only; this ledger does not approve code repair

This ledger is the front door for every repair workstream. A repair branch opens
only after the relevant row has current evidence, an owner, a first falsifier,
and a reviewable design packet.

## Nx Workflow Settlement Update

The later `habitat-nx-worktree-state-contract` branch updated the Stage 0
evidence for graph/workflow ownership:

- root `build`, `check`, `lint`, `test`, `verify`, and `ci` now route through
  Nx DAG targets;
- there is no root `habitat:verify` script;
- root `lint` runs `nx run-many --targets=lint,habitat:check`, so lint is now
  the graph-owned Biome/project-lint plus Habitat structural-check aggregate;
- root `verify` runs `nx run-many --targets=verify`, selecting
  package-owned verifier targets;
- root `check` runs `nx run-many --targets=build,check,lint,test,verify`;
- `bun run build` and `bun run verify` pass on
  `agent-F-habitat-nx-worktree-state`;
- `bun run lint` currently fails on existing locked Habitat/Grit rule
  violations, not on dependency resolution, Nx invocation, or Biome formatting.

Older rows and extraction notes that mention `habitat:verify` or root
`check`/`lint` as direct Habitat aliases are historical inputs to repair
design. Active implementation packets must consume the current Nx workflow
contract above.

## Command Trust Repair Update

The `habitat-oclif-entrypoint-repair` packet on
`agent-HR-habitat-repair-chain` repairs the Stage 0 command trust rows:

- `CLAIM-H45-CLI`, `CLAIM-P0-ROOT-HELP`, `CLAIM-P0-SUBCOMMAND-HELP`,
  `CLAIM-P0-PROD-RUNNER`, and `CLAIM-P0-UNKNOWN-COMMAND`: current proof
  belongs to the packet's root/dev/source/production entrypoint verification.
- `CLAIM-P0-UNKNOWN-RULE` and `CLAIM-P0-UNKNOWN-TOOL`: current proof belongs
  to the typed `RuleSelectionResult` boundary, failing schemaVersion 1
  `rule-selection-integrity` reports in JSON mode, non-zero human-mode
  failures, and no-write `--expand-baseline` failures.

Downstream Grit packets may consume this as command-surface and selector
preservation proof only after the repair branch lands or is explicitly used as
their Graphite parent. It does not close Grit current-tree scan proof, Habitat
baseline proof, injected violation proof, native Grit sample proof, or apply
safety proof.

## Evidence Seed

Initial seed probes captured before the command-surface and classify target
truth repairs:

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
- `nx show project @internal/habitat-harness --json` confirms the
  harness project currently has inferred targets such as `grit:check`,
  `biome:*`, `boundaries`, `generated:check`, and `habitat:check`; it does not
  prove static target strings emitted by `classify` for every project kind.

Current source inspection seed:

- Root package scripts route `habitat`, `habitat:check`, and `habitat:fix`
  through `tools/habitat-harness/bin/dev.ts`; root `verify` now routes through
  Nx package-owned `verify` targets.
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
| CLAIM-H1-NX | "Turbo fully retired; Nx is graph authority." | `docs/projects/habitat-harness/workstream-record.md` H1 row; `docs/projects/habitat-harness/FRAME.md` settled decisions; `openspec/changes/habitat-nx-worktree-state-contract/**`; current root `package.json` | `habitat-nx-worktree-state-contract` removed the root `nx` wrapper, preserved `nx` as root devDependency, moved root workflows into Nx targets, removed root verifier alias sprawl, and proved `bun run build` plus `bun run verify`. No root `turbo.json`, root Turbo dependency, CI Turbo cache block, or active root Turbo workflow remains. Residual `turbo` text is historical docs or domain vocabulary and should not reopen package metadata/cache work. | verified current behavior plus implemented graph-settlement record | yes-with-record-closure-pending | records-only; consume current Nx workflow contract, do not reopen H1 discovery unless new active Turbo workflow appears | `habitat-nx-worktree-state-contract` | `bun run verify` |
| CLAIM-H2-SCAFFOLD | "scaffold preserved ratchet/baseline/diagnostic semantics." | `openspec/changes/habitat-harness-scaffold/**`; `docs/projects/habitat-harness/workstream-record.md` H2 row | H2 remains historical source for `path::message`, shrink-only, and ratchet intent. Current repair branch `agent-HR-habitat-scaffold-contract-repair` replaces missing-file-as-empty with typed baseline states, explicit committed empty baseline files for current non-external rules, modeled external sources for `adapter-boundary` and `doc-ambiguity`, and CheckReport v1 contract diagnostics. H2 by itself is not closure authority. | verified current repair behavior plus historical claim | repair-pending-supervisor-review | repair | `habitat-scaffold-contract-repair` | `bun run habitat:check -- --json --rule adapter-boundary` |
| CLAIM-H3-TAXONOMY | "boundary taxonomy encodes current architecture." | `docs/projects/habitat-harness/taxonomy.md`; `eslint.boundaries.config.mjs`; `tools/habitat-harness/src/lib/boundary-taxonomy.ts`; `openspec/changes/habitat-boundary-tags/**` | Current taxonomy proof parses workspace manifests, project.json/package tags, resolved Nx project metadata, boundary config constraints, and resolved Nx graph edges; the audit reports 23 taxonomy rows, 22 resolved Nx project-plane nodes, 46 graph edges, and zero legality/config/tag issues. Current repair also proves foundation-to-adapter and dual-tag control-to-SDK false-negative probes fail, proves `nx-boundaries` through the Habitat wrapper, and records that `habitat verify --base HEAD` remains current-red on unrelated Biome/map-bundle checks rather than taxonomy failure. | verified current project-plane behavior with non-claims | yes-with-non-claims | records-only unless new resolved graph/config/tag drift appears | `habitat-boundary-taxonomy-tightening` | `bun run --cwd tools/habitat-harness test -- boundary-taxonomy.test.ts` |
| CLAIM-H4-BIOME | "Biome excluded protected archives and quarantined ESLint." | `openspec/changes/habitat-biome-hygiene/workstream/phase-record.md`; `docs/projects/habitat-harness/FRAME.md` H4 trade-off | H4 record says Biome CI and exclusions passed; current proof must re-run config inclusion/exclusion and ESLint role checks. | historical claim | unknown | repair or records-only after fresh proof | `habitat-biome-closure-proof` | `nx run @internal/habitat-harness:biome:ci` |
| CLAIM-H45-CLI | "Habitat is a real oclif CLI through root/dev/production surfaces." | `openspec/changes/habitat-oclif-cli/**`; D7 in `FRAME.md`; current command probes | Root help and subcommand help fail through `bun run habitat`; direct source oclif help works. Current root scripts bypass oclif discovery/help semantics. | verified current behavior contradicts claim | no | repair | `habitat-oclif-entrypoint-repair` | `bun run habitat -- --help` |
| CLAIM-H5-GRIT | "Grit catalog is closed or first-tranche only." | `openspec/changes/habitat-grit-catalog/**`; `adversarial-audit-recovery-reference.md` H5 and Grit program | Current corpus is 22 checks plus 1 apply pattern; native fixtures pass 23 reports / 45 samples; valid `--tool grit-check` returns 22 rules plus `baseline-integrity`; broad current-tree zero-finding and apply safety proof remain unresolved. Treat as first locked tranche pending proof repair. | verified current behavior plus architecture target | mixed-with-blockers | repair | `habitat-grit-proof-repair` | `bun run habitat:check -- --json --tool grit-check` |
| CLAIM-H6-ONE-PATH | "structural enforcement has one canonical Habitat path." | `openspec/changes/habitat-enforcement-consolidation/**`; `workstream-record.md` H6 row; current root `package.json` | Root structural proof now enters the Nx DAG: `lint` runs project lint plus Habitat checks, `verify` runs package-owned verifier targets, and `check` aggregates build/check/lint/test/verify. `lint` fails on locked Habitat/Grit findings, proving structural debt is surfaced. Empty selector behavior in `habitat:check` still blocks direct Habitat command-trust closure. | verified current behavior | mixed-with-blockers | repair | `habitat-enforcement-surface-cleanup` after command trust repair | `bun run lint` |
| CLAIM-H7-HOOKS | "hooks are bounded, local, and reversible." | `openspec/changes/habitat-git-hooks/**`; `tools/habitat-harness/src/lib/hooks.ts` | Current hook hardening removes implicit default pre-commit resource publishing, adds read-only resource-state gates, preserves staged mutation containment, proves local pre-push base/range behavior, records typed trace/reporter/resource-publisher service boundaries, and preserves the local-feedback/non-CI-authority command contract. Current-tree staged probes cover generated-zone and package-manager file-layer refusal, partial-staging refusal, formatter-touched restage, native Grit finding refusal, and native non-JSON Grit parse-output refusal. CI execution, broad Nx affected coverage, Grit row semantics, generated-rule hook-scope activation, product/runtime behavior, and future hook orchestration beyond the accepted synchronous local-feedback surface remain non-claims. | verified current repair behavior with non-claims | yes-with-non-claims | repair | `habitat-git-hook-hardening` | `bun tools/habitat-harness/bin/dev.ts hook pre-commit` |
| CLAIM-H8-CLASSIFY | "classify/generate is an agent primitive." | `openspec/changes/habitat-generators-migrations/**`; `tools/habitat-harness/src/lib/command-engine.ts`; generators | `classify` resolves current owner and project targets through Nx project graph metadata, emits existing project targets with proof, records missing project targets as unavailable instead of commands, and labels rule scope as exact-path, project-owner, workspace-gate, or unresolved-metadata. Project generator support is limited to canonical uniform `plugin`, `foundation`, and `app` contracts, with unsupported kinds, mismatched roots/package names, non-empty roots, and package-name collisions refused before writes. Scratch generated plugin/foundation/app projects are discovered by Nx and expose `build`, `check`, and `test` targets before targeted cleanup removes the scratch roots. The current no-op migration proves wiring only, not convention migration capability. H8's direct registered-pattern write model is historical; candidate pattern scaffolds and registered promotion remain open under Pattern Authority. | verified current repair behavior with blockers | mixed-with-blockers | repair | `habitat-classify-generator-repair` | `bun run habitat -- classify packages/civ7-adapter/src/index.ts` |
| CLAIM-PRODUCT-TRANSFORMS | "Grit transformations exist beyond one codemod." | Original product outcome in `FRAME.md`; `dra-takeover-frame.md`; `.grit/patterns/habitat/apply/**` | Exactly one apply pattern is allowlisted and implemented. Candidate transforms require safety and applied-diff proof before product capability can be claimed. | verified current behavior | no | repair through pattern/codemod workstreams | `habitat-grit-pattern-suite` | `rg -n "gritApplyPatterns" tools/habitat-harness/src/lib/grit.ts` |
| CLAIM-PRODUCT-GENERATORS | "generators can construct or modify all promised structure." | Original product outcome in `FRAME.md`; H8 records; generator source | Project generator supports plugin/foundation/app only through canonical kind/root/package/tag contracts, fails closed before writes for unsupported kinds, mismatched roots/package names, non-empty roots, and package-name collisions, and generated scratch projects for all three supported kinds are discoverable by Nx with `build`, `check`, and `test` targets. Current migration metadata executes as no-op wiring proof only and does not prove convention migration capability. Pattern generator creates non-enforcing candidate drafts by default and refuses registered lifecycles before active pattern, baseline, or rule-pack writes. Registered promotion, full manifest integration, non-uniform domain generators, and convention migrations remain repair work. | verified current repair behavior with blockers | mixed-with-blockers | repair | `habitat-classify-generator-repair` plus pattern-generator metadata repair | `find tools/habitat-harness/src/generators -type f -maxdepth 5` |
| CLAIM-P0-ROOT-HELP | "Root Habitat help is truthful." | H4.5 closure claim; DRA contradiction list | `bun run habitat -- --help` exits 2 with unknown-command output. | verified current behavior | no | repair | `habitat-oclif-entrypoint-repair` | `bun run habitat -- --help` |
| CLAIM-P0-SUBCOMMAND-HELP | "Subcommand help is truthful." | H4.5 closure claim; DRA contradiction list | `bun run habitat -- check --help` exits 2 and emits no help text. | verified current behavior | no | repair | `habitat-oclif-entrypoint-repair` | `bun run habitat -- check --help` |
| CLAIM-P0-PROD-RUNNER | "Production runner help is current-proofed after build." | `tools/habitat-harness/bin/run.js`; H4.5 production proof claim | Not rechecked in this Stage 0 seed; must follow a clean build and avoid ignored stale `dist`. | hypothesis requiring fresh proof | unknown | repair if prod runner fails; otherwise records-only | `habitat-oclif-entrypoint-repair` | `nx run @internal/habitat-harness:build` |
| CLAIM-P0-UNKNOWN-COMMAND | "Unknown command failure is truthful." | Current root dispatcher behavior | `--help` currently routes as an unknown command. Unknown command semantics exist but are mixed with help behavior. | verified current behavior | mixed-with-blockers | repair | `habitat-oclif-entrypoint-repair` | `bun run habitat -- definitely-not-a-command` |
| CLAIM-P0-UNKNOWN-RULE | "Unknown --rule selections fail truthfully." | DRA contradiction list; `selectRules` implementation | `--rule definitely-not-a-rule` exits 0 and returns only `baseline-integrity`. | verified current behavior | no | repair | `habitat-oclif-entrypoint-repair` or `habitat-grit-proof-repair` depending owner split | `bun run habitat:check -- --json --rule definitely-not-a-rule` |
| CLAIM-P0-UNKNOWN-TOOL | "Unknown --tool selections fail truthfully." | DRA contradiction list; `selectRules` implementation | `--tool definitely-not-a-tool` exits 0 and returns only `baseline-integrity`. | verified current behavior | no | repair | `habitat-oclif-entrypoint-repair` or `habitat-grit-proof-repair` depending owner split | `bun run habitat:check -- --json --tool definitely-not-a-tool` |
| CLAIM-P1-BASELINE | "Every hardened baseline is explicit, committed, and has documented missing-file semantics." | `baseline.ts`; `tools/habitat-harness/baselines/**`; H2/H5 records | Current repair branch makes missing registered-rule baselines contract failures, validates malformed/non-string/duplicate/unsorted/orphan files, materializes committed `[]` files for current non-external rules, keeps 22 Grit `[]` files from the accepted Grit proof baseline slice, models `adapter-boundary` and `doc-ambiguity` as external exception sources, and refuses existing-rule `--expand-baseline` growth before write. Pending supervisor review; no generator metadata or pattern-row closure is claimed. | verified current repair behavior | repair-pending-supervisor-review | repair | `habitat-scaffold-contract-repair` | `find tools/habitat-harness/baselines -maxdepth 1 -type f -print` |
| CLAIM-P1-PATTERN-GENERATOR | "Generated Grit patterns carry authority/evidence metadata before enforcement." | `pattern/generator.cjs`; `pattern/schema.json`; `src/rules/pattern-authority/manifest.ts`; DRA frame | Current repair branches change sparse generation into candidate-only output under `tools/habitat-harness/src/rules/pattern-authority/candidates/`, fail-close `registered-advisory` / `registered-enforced` lifecycles before active pattern, baseline, or `rules.json` writes, add a pure Pattern Authority Manifest validator for missing, malformed, placeholder, contradicted, orphan, Grit-only, and Nx-options-only states, and record a supervisor-pending Effect substrate proposal for future registered promotion orchestration. Registered promotion implementation, `rules.json` manifest references, baseline-manifest consumption, native/current-tree proof, and hook scope remain open. | verified current repair behavior with blockers | mixed-with-blockers | repair | `habitat-pattern-generator-metadata-repair` | `bun run --cwd tools/habitat-harness test -- pattern-authority-manifest.test.ts pattern-generator.test.ts` |
| CLAIM-P1-CLASSIFY-TARGETS | "`classify` reports existing targets only." | H8 records; `projectTargets()` in `command-engine.ts` | `classify` reads resolved Nx project graph metadata, emits existing project targets with structured proof, and records missing project targets as unavailable instead of runnable commands. Representative matrix proof covers emitted and refused targets across adapter, foundation, app, tooling, plugin, generated-zone, and mod rows; `@civ7/adapter:test` and `@civ7/types:test` are unavailable instead of emitted. Stale-guidance and downstream realignment are implemented for the current packet record slice, with final supervisor acceptance still pending. | verified current repair behavior with blockers | mixed-with-blockers | repair | `habitat-classify-generator-repair` | `bun run habitat -- classify packages/civ7-adapter/src/index.ts` |
| CLAIM-P1-EFFECT-FIT | "Current Habitat manual orchestration is the right implementation substrate." | User correction on 2026-06-14; `official-docs-effect.md`; `research/local-effect-adoption-fit.md`; current `command-engine.ts`, `spawn.ts`, `hooks.ts`, tests | Local fit evidence shows strong Effect fit for typed selector/policy failures, command provenance, service-injected tests, resource scopes, explicit orchestration modes, Grit adapter hardening, and hook transactions. Oclif help itself was repaired as a targeted dispatcher slice. The accepted Grit adapter substrate now exists in Habitat, and `habitat-pattern-generator-metadata-repair` records a supervisor-pending proposal that future registered Pattern Authority promotion should use that Effect substrate for command/no-write/scoped-file/baseline/hook proof orchestration if accepted. Other command, check, baseline, hook, and promotion implementation surfaces still need their own per-workstream proof. | verified current behavior plus accepted slice decisions | mixed-with-blockers | design evaluation / consume accepted substrate where selected | `habitat-effect-orchestration-evaluation` plus active repair packets | `bun run --cwd tools/habitat-harness test -- effect-parity.test.ts` |
| CLAIM-P1-STALE-RECORDS | "Project records no longer overclaim H1-H8 closure." | `workstream-record.md`; H1-H8 phase records; DRA frame | `workstream-record.md` still says train locally closed while current P0 command behavior contradicts H4.5/H5 closure. | verified current behavior | no | repair records in the same loops as code/spec fixes | `habitat-stale-record-cleanup` | `rg -n "closed|DONE|proof|help" docs/projects/habitat-harness openspec/changes/habitat-* -g '*.md'` |

## Initial Owner Groups

| Group | Rows | Required design output |
| --- | --- | --- |
| Command trust | CLAIM-H45-CLI, CLAIM-P0-ROOT-HELP, CLAIM-P0-SUBCOMMAND-HELP, CLAIM-P0-PROD-RUNNER, CLAIM-P0-UNKNOWN-COMMAND, CLAIM-P0-UNKNOWN-RULE, CLAIM-P0-UNKNOWN-TOOL | `habitat-oclif-entrypoint-repair` OpenSpec with root/dev/prod command proof and false-green filter policy. |
| Rule proof trust | CLAIM-H5-GRIT, CLAIM-H6-ONE-PATH, CLAIM-P1-BASELINE | `habitat-grit-proof-repair` plus scaffold/baseline contract design. Keep native fixture proof, current-tree scan, injected violation, baseline behavior, old-mechanism parity, and apply safety as separate proof classes. |
| Agent routing trust | CLAIM-H3-TAXONOMY, CLAIM-H8-CLASSIFY, CLAIM-P1-CLASSIFY-TARGETS, plus consuming CLAIM-H1-NX as settled graph baseline | classify/generator repair design tied to current Nx graph and taxonomy proof. |
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
