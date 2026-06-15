# Habitat Stage 0 Local Claim Extraction Evidence Pack

Repo root: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-F-habitat-harness-workstream`.
Paths below are repo-relative unless noted. This pack uses repo files and local
commands only. It is evidence extraction, not implementation approval.

## Source Map

Evidence policy used for this extraction:

- Highest authority is fresh command behavior from this worktree, then current
  source/config/tests/package scripts, then active OpenSpec records, then
  canonical project docs, then older phase records. This mirrors
  `docs/projects/habitat-harness/adversarial-audit-recovery-reference.md:31`.
- A phase record is historical evidence, not current proof, per
  `docs/projects/habitat-harness/adversarial-audit-recovery-reference.md:47`.
- Evidence classes used below: `verified current behavior`,
  `current source inspection`, `active OpenSpec target`, `historical claim`,
  `architecture target`, and `hypothesis`.

Primary project sources:

| Source | Lines | Extracted authority |
| --- | ---: | --- |
| `docs/projects/habitat-harness/FRAME.md` | 20-24, 34-41 | Habitat is intended as a repo-local toolkit that makes structure queryable/enforceable. |
| `docs/projects/habitat-harness/FRAME.md` | 45-55 | In-scope surfaces include existing structural enforcement, Nx, Grit, Biome, Husky, ratchet/baselines, and discrepancy logging. |
| `docs/projects/habitat-harness/FRAME.md` | 60-72 | Exterior excludes product/runtime architecture, MapGen semantics, game proof, and publishing Habitat as a shared plugin. |
| `docs/projects/habitat-harness/FRAME.md` | 74-92 | Hard core: enforcement-only, five layers with one owner each, shrink-only ratchet, derived taxonomy, CI authoritative. |
| `docs/projects/habitat-harness/FRAME.md` | 136-153 | Settled decisions: Nx fully, GritQL, Husky/Biome in scope, derived taxonomy, oclif CLI, recorded trade-offs. |
| `docs/projects/habitat-harness/FRAME.md` | 206-223 | RAWR draft is adapted to this repo, with ratchet and migration-first corrections. |
| `docs/projects/habitat-harness/FRAME.md` | 225-247 | Historical grounding: existing enforcement inventory, missing Nx/Biome/Grit/Husky at frame time, OpenSpec maturity. |
| `docs/projects/habitat-harness/FRAME.md` | 249-267 | Companion artifacts and historical status: execution not started at frame time; OpenSpec train is the execution record. |
| `docs/projects/habitat-harness/adversarial-audit-recovery-reference.md` | 14-29 | Later audit found earlier closure claims too strong; old closure language is history with known gaps. |
| `docs/projects/habitat-harness/adversarial-audit-recovery-reference.md` | 31-66 | Source authority, conflict rules, and evidence classes. |
| `docs/projects/habitat-harness/adversarial-audit-recovery-reference.md` | 68-90 | Stage 0 requires a claim ledger before repair branches or Grit backfill. |
| `docs/projects/habitat-harness/adversarial-audit-recovery-reference.md` | 118-123 | Recovery loops to prevent false confidence, bypasses, stale authority, duplicate enforcement, baseline-ratchet hiding, and hook side effects. |
| `docs/projects/habitat-harness/adversarial-audit-recovery-reference.md` | 125-151 | Nine prior closure claims that must be repaired or re-dispositioned. |
| `docs/projects/habitat-harness/adversarial-audit-recovery-reference.md` | 172-405 | H1-H8 repair packets: source traces, accepted outcomes, rejected outcomes, verification commands, and coupling notes. |
| `docs/projects/habitat-harness/adversarial-audit-recovery-reference.md` | 409-488 | Grit workstream rule, source authority requirement, pattern lifecycle, and contract. |
| `docs/projects/habitat-harness/adversarial-audit-recovery-reference.md` | 499-527 | Candidate check patterns and apply codemods are seeds only, not authorized implementation. |
| `docs/projects/habitat-harness/adversarial-audit-recovery-reference.md` | 542-603 | Sequencing, health metrics, and recovery program definition of done. |
| `docs/projects/habitat-harness/workstream-record.md` | 21-28 | Historical claim: gates 5-12 done locally. |
| `docs/projects/habitat-harness/workstream-record.md` | 34-42 | Historical H1-H8 slice scopes. |
| `docs/projects/habitat-harness/workstream-record.md` | 49-64 | Historical claim: H1-H8 locally closed on the Graphite stack. |
| `docs/projects/habitat-harness/workstream-record.md` | 66-72 | Proof classes were predeclared and Graphite/PR state must stay separate. |
| `docs/projects/habitat-harness/workstream-record.md` | 93-112 | Standing rules: discrepancies logged, baselines shrink-only, native budget watched, structural tests migrate to owning layers. |
| `docs/projects/habitat-harness/workstream-record.md` | 114-131 | Historical next-action list marks H1-H8 done locally and next as Graphite commit/restack/submission. |
| `docs/projects/habitat-harness/discrepancy-log.md` | 11-13 | Historical claim: no code-violates-docs cases found in the derivation pass. |
| `docs/projects/habitat-harness/discrepancy-log.md` | 17-32 | Active discrepancy rows DL-1 through DL-16, including generated-zone and package-script proof repairs. |
| `docs/projects/habitat-harness/review-disposition-ledger.md` | 13-18, 24-42, 48-62 | Accepted P1/P2/P3 review findings that shaped H1-H8 proof obligations. |
| `docs/projects/habitat-harness/review-disposition-ledger.md` | 68-75 | Historical claim: all accepted repairs applied and all 8 changes revalidated. |
| `docs/projects/habitat-harness/invariant-corpus.md` | 1-13 | Corpus ledger and owner-layer vocabulary. |
| `docs/projects/habitat-harness/invariant-corpus.md` | 17-27 | Existing lint script migration dispositions. |
| `docs/projects/habitat-harness/invariant-corpus.md` | 31-44 | ESLint rule-family migration dispositions. |
| `docs/projects/habitat-harness/invariant-corpus.md` | 48-56 | Architecture-test dispositions. |
| `docs/projects/habitat-harness/invariant-corpus.md` | 62-64 | CI wiring dispositions. |
| `docs/projects/habitat-harness/invariant-corpus.md` | 68-83 | Generated-zone and promised-but-unenforced invariant dispositions. |
| `docs/projects/habitat-harness/taxonomy.md` | 3-15 | Taxonomy is derived from current implied architecture; project-plane and intra-project planes must not be conflated. |
| `docs/projects/habitat-harness/taxonomy.md` | 19-29 | `kind:*` tag definitions. |
| `docs/projects/habitat-harness/taxonomy.md` | 53-78 | 21 existing projects plus new Habitat harness package. Current local source scan found 22 workspace packages including `tools/habitat-harness`. |
| `docs/projects/habitat-harness/taxonomy.md` | 80-117 | Project-plane constraints and initial empty-baseline expectation. |
| `docs/projects/habitat-harness/taxonomy.md` | 119-130 | Intra-project `scope:*` families remain Grit/file-layer owned. |

Active Habitat OpenSpec records used as target or historical sources:

| Change | Key lines | Claim surface |
| --- | ---: | --- |
| `openspec/changes/habitat-nx-adoption/specs/habitat-harness/spec.md` | 3-18, 20-36, 38-52 | Nx graph authority, Bun package-manager posture, pipeline parity. |
| `openspec/changes/habitat-harness-scaffold/specs/habitat-harness/spec.md` | 3-19, 21-45, 47-58 | Single enforcement entrypoint, shrink-only baselines, wrapped existing checks. |
| `openspec/changes/habitat-boundary-tags/specs/habitat-harness/spec.md` | 3-21, 23-34 | Project-plane graph law and quarantined ESLint boundary-only role. |
| `openspec/changes/habitat-biome-hygiene/specs/habitat-harness/spec.md` | 3-17, 19-27 | Biome owns hygiene; reformat history is blame-shielded. |
| `openspec/changes/habitat-oclif-cli/specs/habitat-harness/spec.md` | 3-19, 21-36, 38-53 | oclif surface, JSON compatibility, lifecycle ownership. |
| `openspec/changes/habitat-grit-catalog/specs/habitat-harness/spec.md` | 3-27, 28-42, 44-57 | Grit syntax layer, codemod safety, generated-zone write protection. |
| `openspec/changes/habitat-enforcement-consolidation/specs/habitat-harness/spec.md` | 3-28 | Only enforcement path and CI diagnostics through Habitat. |
| `openspec/changes/habitat-git-hooks/specs/habitat-harness/spec.md` | 3-28 | Local hooks delegate to Habitat and restage only formatter-touched files. |
| `openspec/changes/habitat-generators-migrations/specs/habitat-harness/spec.md` | 3-14, 16-27, 28-38 | Supported generators, classify-before-author, migrations. |

Supporting active `specs/habitat-harness/spec.md` records also exist for
`adapter-boundary-river-metadata-provenance`, `cli-root-load-test-timeouts`,
`mapgen-studio-root-load-followup`, `mapgen-studio-test-timeouts`,
`mod-swooper-catalog-order-proof`, `plugin-vitest-project-scope`, and
`swooper-recipe-artifact-race`. These mainly support H4 proof repairs and root
test/load reliability rather than Stage 0 repair ordering.

Current source and command evidence:

| Evidence | Lines or command | Current observation |
| --- | --- | --- |
| Root package scripts | `package.json:12`, `package.json:22`, `package.json:53-78` | Root `check` routes to `habitat:verify`; `lint` routes to `habitat:check`; several structural aliases still exist. |
| Habitat package config | `tools/habitat-harness/package.json:8-35`, `tools/habitat-harness/package.json:53-62` | Package has a production `bin/run.js`, a `dev` script, and oclif config. |
| Dev runner | `tools/habitat-harness/bin/dev.ts:13-28`, `tools/habitat-harness/bin/dev.ts:30-41` | Current root script path uses a manual command map and `Command.run`, not full oclif command discovery. |
| Source oclif shim | `tools/habitat-harness/src/bin/habitat.ts:1-5` | Direct source shim renders oclif help correctly when invoked directly. |
| Check engine | `tools/habitat-harness/src/lib/command-engine.ts:65-70`, `78-139`, `157-160` | Rule selection can return zero selected rules, while `baseline-integrity` is still appended; JSON output can write to an arbitrary repo-relative path if `--output` is used. |
| Fix engine | `tools/habitat-harness/src/lib/command-engine.ts:173-182` | `habitat fix` runs Grit apply then Biome, with writes unless `--dry-run` is used. |
| Verify engine | `tools/habitat-harness/src/lib/command-engine.ts:185-202` | `verify` runs Habitat check then Nx affected targets. |
| Classify engine | `tools/habitat-harness/src/lib/command-engine.ts:222-294` | Classify derives owner from package roots and returns static required target strings. |
| Baseline engine | `tools/habitat-harness/src/lib/baseline.ts:7-19`, `25-47`, `71-103` | Missing baseline file is treated as empty locked baseline; shrink-only integrity compares against merge-base and only permits added keys for new rule IDs. |
| Nx plugin | `tools/habitat-harness/src/plugin.js:1-8`, `42-55`, `82-145`, `146-175` | Plugin infers Habitat, boundaries, Biome, Grit, and generated targets. |
| Rules | `tools/habitat-harness/src/rules/rules.json:1-610` | Local summary command found 41 rules: 22 `grit-check`, 4 `file-layer`, 4 `habitat-native`, 3 `wrapped-script`, 6 `wrapped-test`, 1 `nx-boundaries`, 1 `biome`. |
| Baseline files | `tools/habitat-harness/baselines/adapter-boundary.json`; summary command | Only `adapter-boundary` has an explicit harness baseline file; 39 rules with `exceptionPath: "none"` use implicit empty baseline files. |
| Grit adapter | `tools/habitat-harness/src/lib/grit.ts:27-36`, `45-84`, `86-133` | One native Grit JSON scan is adapted into Habitat diagnostics; one apply pattern is allowlisted. |
| Generated zones | `tools/habitat-harness/src/lib/generated-zones.ts:17-38`, `40-70`, `91-114` | Staged file-layer checks protect three generated zones; non-staged runs return no diagnostics. |
| Generated drift script | `tools/habitat-harness/scripts/verify-generated-zones.mjs:7-39`, `67-82` | `generated:check` can run generators, detect drift, restore tracked snapshots, and remove untracked generated outputs. |
| Hooks | `.husky/pre-commit:1`, `.husky/pre-push:1`, `tools/habitat-harness/src/lib/hooks.ts:58-166`, `169-203` | Husky delegates to Habitat; pre-commit runs resource publishing before staged file-layer/Biome/Grit checks; pre-push uses Graphite parent or merge-base. |
| Biome config | `biome.json:8-26`, `37-65`, `79-86` | Biome excludes archives, generated zones, `dist`, `types`, `mod`, `.nx`, `.civ7`; selected linter rules and organize imports are enabled. |
| Boundary config | `eslint.boundaries.config.mjs:1-15`, `19-56`, `85-118` | Root boundary config has only `@nx/enforce-module-boundaries`; a separate mod-local `mods/mod-swooper-civ-dacia/eslint.config.js` still exists with empty rules. |
| Pattern generator | `tools/habitat-harness/src/generators/pattern/schema.json:7-45`, `tools/habitat-harness/src/generators/pattern/generator.cjs:23-37`, `40-55`, `70-72` | Only `ruleId` is required; default authority/proof text is placeholder; generated rules are enforced `grit-check` entries. |
| Project generator | `tools/habitat-harness/src/generators/project/generator.cjs:4-24`, `49-80` | Supports `plugin`, `foundation`, `app`; refuses non-uniform kinds. |
| Tests | `tools/habitat-harness/test/commands/habitat-commands.test.ts:70-160` | Command tests exercise command classes with mocked engine functions, not root script entrypoints. |
| Classify tests | `tools/habitat-harness/test/lib/classify.test.ts:5-38`, `40-55` | Matrix covers four paths and one literal diff. |
| Grit tests | `tools/habitat-harness/test/grit/grit-patterns.test.ts:28-55` | Native pattern tests assert catalog sample count and success. |

Fresh probes run for this pack:

| Command | Exit | Evidence |
| --- | ---: | --- |
| `bun run habitat -- --help` | 2 | Root script path prints `Unknown habitat command: --help`; it does not render root oclif help. |
| `bun run habitat -- check --help` | 2 | Root script path exits 2 without command help output. |
| `bun run habitat:check -- --help` | 2 | Same dev runner help failure through the `habitat:check` script. |
| `bun tools/habitat-harness/src/bin/habitat.ts --help` | 0 | Direct source oclif shim renders root help with command list. |
| `bun tools/habitat-harness/src/bin/habitat.ts check --help` | 0 | Direct source oclif shim renders check help and flags. |
| `bun run habitat classify packages/config/src/index.ts` | 0 | Returns project `@civ7/config`, tag `kind:foundation`, in-scope rules, and required targets. |
| `bun run habitat -- classify <literal diff>` | 0 | Returns diff classification for `packages/config/src/index.ts`. |
| `bun run habitat:check -- --rule file-layer-pnpm-artifacts --json` | 0 | Returns `file-layer-pnpm-artifacts` plus `baseline-integrity`, both passing. |
| `bun run habitat:check -- --json --rule definitely-not-a-rule` | 0 | Returns only `baseline-integrity`; unknown rule selection false-greens. |
| `bun run habitat:check -- --json --tool definitely-not-a-tool` | 0 | Returns only `baseline-integrity`; unknown tool selection false-greens. |

Concurrent state observed but not used as authority:

- Pre-existing modified files at session start:
  `docs/projects/habitat-harness/dra-takeover-frame.md`,
  `docs/projects/habitat-harness/habitat-harness-spec-draft-input.md`, and
  `openspec/changes/habitat-biome-hygiene/workstream/phase-record.md`.
- During the session, other untracked artifacts appeared under
  `docs/projects/habitat-harness/`, including `recovery-claim-ledger.md`,
  `grit-pattern-corpus-ledger.md`, and `research/official-docs-*.md`. They were
  not edited and should be reconciled separately before being treated as tracked
  project authority.

## Claim Rows To Seed

| ID | Claim | Source | Current evidence | Evidence class | Still true? | Disposition | Owner | First verification command |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S0-LEDGER | Stage 0 claim reconciliation must precede repair branches and Grit backfill. | `adversarial-audit-recovery-reference.md:68-90` | A concurrent untracked `docs/projects/habitat-harness/recovery-claim-ledger.md` exists, but this assigned pack is the only write I made. | current source inspection + architecture target | partial | records-only; reconcile tracked ledger shape before implementation | DRA Habitat recovery owner | `git status --porcelain=v1 -- docs/projects/habitat-harness/recovery-claim-ledger.md docs/projects/habitat-harness/research/local-stage0-claim-extraction.md` |
| SYS-ENFORCEMENT-ONLY | Habitat enforces current implied architecture and does not invent product/runtime behavior. | `FRAME.md:60-78` | Current sources are structural: package scripts, Nx plugin, rules, generators, hooks. No runtime/game proof was run. | current source inspection | partial | records-only, with repair triggers if a slice claims runtime/product proof | Habitat recovery owner | `rg -n "runtime proof|in-game|product behavior" docs/projects/habitat-harness openspec/changes/habitat-*` |
| SYS-FIVE-LAYERS | Each structural concern lives in exactly one layer/tool owner. | `FRAME.md:79-83`; `taxonomy.md:8-15`; `rules.json:1-610` | Rule pack has multiple owner tools, but package aliases and wrapped tests/scripts still exist; H6 explicitly keeps some wrapped/direct surfaces. | current source inspection | partial | repair or records-only per mechanism | `habitat-enforcement-surface-cleanup` | `node -e "const r=require('./tools/habitat-harness/src/rules/rules.json').rules; console.log(r.map(x=>[x.id,x.ownerTool,x.ownerProject]).join('\\n'))"` |
| SYS-RATCHET | Baselines are shrink-only; locked rules hard-fail. | `FRAME.md:84-87`; `baseline.ts:7-19`, `71-103` | Code enforces shrink-only via merge-base comparison, but missing files are implicit empty baselines and only one explicit harness baseline file exists. | current source inspection | partial | repair contract language and tests | `habitat-scaffold-contract-repair` | `find tools/habitat-harness/baselines -maxdepth 1 -type f -print` |
| SYS-CI-AUTHORITY | CI is authoritative; hooks are local friction reduction. | `FRAME.md:91-92`; `README.md:123-131`; `.github/workflows/ci.yml` search | CI invokes `bun run habitat:verify` and uploads diagnostics; hooks delegate locally and `--no-verify` remains documented. | current source inspection | yes, with caveat | records-only unless CI command path drifts | H6/H7 owners | `rg -n "habitat:verify|habitat-diagnostics|--no-verify|pre-commit|pre-push" .github tools/habitat-harness docs/projects/habitat-harness` |
| H1-NX-RETIREMENT | H1 fully retired Turbo and made Nx the graph/cache/task authority. | `workstream-record.md:34`; `adversarial-audit-recovery-reference.md:129`, `172-195`; H1 spec `spec.md:3-18` | Root package scripts use Nx/Habitat; no root `turbo.json` was found. Active residue remains in `apps/docs/turbo.json`, comments, docs, type tests, and a mod-local ESLint ignore. | current source inspection + historical claim | partial | repair/records-only after classifying every residue | `habitat-nx-adoption-cleanup` | `rg -n "turbo|turbo.json|bunx turbo|\\.turbo" package.json nx.json .github apps tools packages mods docs/projects/habitat-harness openspec/changes/habitat-nx-adoption` |
| H2-SCAFFOLD-CONTRACT | H2 preserved original rule semantics and provided ratchet/baseline/diagnostic/staged/target-inference behavior. | `workstream-record.md:35`; H2 spec `spec.md:3-58`; `adversarial-audit-recovery-reference.md:130`, `197-222` | Current engine supports JSON, baselines, selected checks, and target inference. Contract tension remains between "every rule explicit baseline" and code's "missing file == empty locked baseline". | current source inspection | partial | repair | `habitat-scaffold-contract-repair` | `bun run habitat:check -- --json --rule adapter-boundary` |
| H3-TAXONOMY | H3 encoded current architecture in project tags and locked `nx-boundaries` empty. | `workstream-record.md:36`; `taxonomy.md:80-117`; H3 spec `spec.md:3-34`; `adversarial-audit-recovery-reference.md:131`, `224-247` | Current boundary config has one Nx boundary rule matching taxonomy constraints. Broad allowances still need current graph/architecture proof, especially app/tooling and control/engine allowances. | current source inspection + active OpenSpec target | unknown | repair if speculative edges remain; records-only if graph proof passes | `habitat-boundary-taxonomy-tightening` | `nx show projects --json` |
| H4-BIOME-HYGIENE | H4 made Biome the single hygiene owner, excluded protected archives, quarantined ESLint, and blame-shielded the reformat. | `workstream-record.md:37`; H4 spec `spec.md:3-27`; `adversarial-audit-recovery-reference.md:132`, `249-272` | `biome.json` excludes nested archives and generated zones; `.git-blame-ignore-revs` records a format commit. Root boundary ESLint is quarantined, but a mod-local `eslint.config.js` and root/package lint aliases remain and need owner classification. | current source inspection | partial | repair/records-only after script/config audit | `habitat-biome-closure-repair` | `find . -name 'eslint.config.*' -o -name 'biome.json'` |
| H4P-ROOT-TEST-REPAIRS | H4 promoted DL-15/DL-16 and related proof repairs so root build/test proof could close. | `discrepancy-log.md:31-32`; `habitat-biome-hygiene/workstream/phase-record.md` status lines from search | Current pack did not rerun root build/test or proof-repair specs. Treat as historical until reverified. | historical claim | unknown | fresh proof before closure claim | H4 proof-repair owners | `bun run test` |
| H45-OCLIF-CLI | H4.5 made Habitat a real oclif CLI through root/dev/production surfaces. | `workstream-record.md:38`; H4.5 spec `spec.md:3-53`; `adversarial-audit-recovery-reference.md:133`, `274-302` | Current root script path fails `bun run habitat -- --help` and `bun run habitat -- check --help` with exit 2, while direct `src/bin/habitat.ts` help succeeds. | verified current behavior | no | repair | `habitat-oclif-entrypoint-repair` | `bun run habitat -- --help` |
| H45-SUBCOMMAND-HELP | H4.5 verified command-specific help through the canonical path. | H4.5 proposal `proposal.md:119-120`; phase record search lines 48-53, 111 | `bun run habitat -- check --help`, `bun run habitat:check -- --help`, and `bun tools/habitat-harness/bin/dev.ts check --help` all exit 2 with no help output. | verified current behavior | no | repair | `habitat-oclif-entrypoint-repair` | `bun run habitat -- check --help` |
| H45-PROD-RUNNER | Production runner help works after build and stale ignored `dist/**` cannot silently define behavior. | `adversarial-audit-recovery-reference.md:290-299`; `package.json:8-35` | Not rerun here. Direct source shim works; production runner requires build/manifests and ignored outputs proof. | hypothesis | unknown | fresh proof; repair if fail | `habitat-oclif-entrypoint-repair` | `nx run @internal/habitat-harness:build && bun tools/habitat-harness/bin/run.js --help` |
| H5-GRIT-FIRST-TRANCHE | H5 should be treated as first locked Grit tranche unless more patterns are proved. | `adversarial-audit-recovery-reference.md:134`, `304-329`, `484-488`; H5 spec `spec.md:3-27` | Current rule pack has 22 Grit rules and one allowlisted apply pattern. Existing proof model must be rechecked before any old mechanism retirement or backlog expansion. | current source inspection + architecture target | partial | repair | `habitat-grit-proof-repair` | `GRIT_TELEMETRY_DISABLED=true grit patterns test --verbose` |
| H5-GENERATED-ZONES | Generated paths are protected by staged checks and repo-runnable drift gates where possible. | H5 spec `spec.md:44-57`; `generated-zones.ts:17-70`; `verify-generated-zones.mjs:7-39` | Staged file-layer rules exist for three zones. Drift script covers map and map-policy generators; Civ7 types remain external workflow. | current source inspection | partial | records-only plus explicit external gap | H5/H6 owners | `nx run @internal/habitat-harness:generated:check` |
| H5-SAFE-TRANSFORMS | Habitat provides safe transformations where appropriate. | `FRAME.md:39-41`, `51`; H5 spec `spec.md:28-42`; `adversarial-audit-recovery-reference.md:518-527` | Only one Grit apply pattern is wired in `grit.ts`; candidate codemods require safety and applied-diff proof. | current source inspection | partial | repair/defer with trigger per codemod | `habitat-grit-proof-repair` and codemod-specific workstreams | `rg -n "gritApplyPatterns|apply/" tools/habitat-harness .grit/patterns/habitat/apply` |
| H6-ONLY-ENFORCEMENT-PATH | H6 consolidated enforcement; direct bypass aliases are removed, wrapped, or documented. | `workstream-record.md:40`; H6 spec `spec.md:3-28`; `adversarial-audit-recovery-reference.md:135`, `331-352` | Root aliases mostly delegate to Habitat, but `lint:domain-refactor-guardrails:strict-core` and `lint:mapgen-docs` still call scripts directly by design or legacy. Needs owner/retirement-trigger table in current records. | current source inspection | partial | repair/records-only per alias | `habitat-enforcement-surface-cleanup` | `node -e "const p=require('./package.json'); for (const [k,v] of Object.entries(p.scripts)) if (/lint|check|verify/.test(k)) console.log(k+'='+v)"` |
| H6-UNKNOWN-SELECTION | Filtered `habitat check` commands fail truthfully when no selected rule/tool exists. | Implied by H2/H4.5 command-trust and H6 only-path claims; `command-engine.ts:65-70`, `78-139` | `--rule definitely-not-a-rule` and `--tool definitely-not-a-tool` exit 0 with only `baseline-integrity`, so invalid selections false-green. | verified current behavior | no | repair | Command trust owner with H5/H6 coordination | `bun run habitat:check -- --json --rule definitely-not-a-rule` |
| H7-HOOKS-BOUNDED | H7 hooks are bounded, scoped, local, and reversible; restaging touches only formatter-touched files. | `workstream-record.md:41`; H7 spec `spec.md:3-28`; `adversarial-audit-recovery-reference.md:136`, `354-375`; `hooks.ts:58-166` | Husky delegates to Habitat. Pre-commit still runs resource publish before staged file-layer/Biome/Grit checks; this side effect needs explicit idempotence/order proof. | current source inspection | partial | repair | `habitat-git-hook-hardening` | `bun run habitat hook pre-commit` |
| H8-CLASSIFY-PRIMITIVE | H8 made `habitat classify <path-or-diff>` an agent primitive. | `workstream-record.md:42`, `49-64`; H8 spec `spec.md:16-27`; `adversarial-audit-recovery-reference.md:137`, `377-401` | Path and literal-diff classify probes pass. Required targets are generated statically; path-specific rule/target accuracy still needs matrix proof across projects and workspace-level paths. | verified current behavior | partial | repair | `habitat-classify-generator-repair` | `bun run habitat classify packages/civ7-adapter/src/index.ts` |
| H8-GENERATORS | Supported structure comes from generators and unsupported kinds refuse. | H8 spec `spec.md:3-14`; `project/generator.cjs:4-24`; `README.md:65-79` | Project generator supports `plugin`, `foundation`, and `app`; non-uniform kinds are refused. That is real but more constrained than any broad "generates structure" claim. | current source inspection | partial | records-only plus repair if docs overstate | `habitat-classify-generator-repair` | `nx g @internal/habitat-harness:project h8-probe --kind=foundation --dry-run` |
| H8-PATTERN-GENERATOR-AUTHORITY | Pattern generator should support backfill standards before new Grit work. | `adversarial-audit-recovery-reference.md:137`, `424-488`; `pattern/schema.json:7-45`; `pattern/generator.cjs:23-55` | Generator only requires `ruleId` and supplies placeholder authority/proof text while creating enforced rules. | current source inspection | no | repair | `habitat-pattern-generator-metadata-repair` or H8 repair | `sed -n '1,120p' tools/habitat-harness/src/generators/pattern/schema.json` |
| REVIEW-ALL-REPAIRS-APPLIED | All accepted P1/P2 repairs were applied before H1 and all 8 changes revalidated. | `review-disposition-ledger.md:72-75` | Records claim closure, but current command behavior contradicts at least H4.5 help claims and selector truthfulness. | historical claim contradicted by current behavior | no | stale-record repair | Habitat recovery records owner | `rg -n "READY|CLOSED|DONE|passed|help" docs/projects/habitat-harness openspec/changes/habitat-* -g '*.md'` |
| DISC-NO-CODE-VS-DOC | Derivation pass found no code-violates-docs cases. | `discrepancy-log.md:11-13` | Current Habitat docs/specs claim root help and closure that current commands contradict. This may be outside the original discrepancy-log scope, but it is now stale if read broadly. | historical claim contradicted by current behavior | no, if applied to Habitat records | records-only repair | Habitat records owner | `bun run habitat -- --help && rg -n "help.*exit|root help|CLOSED|DONE" docs/projects/habitat-harness openspec/changes/habitat-*` |
| WORKSTREAM-H1-H8-CLOSED | H1-H8 are locally closed and final gates green. | `workstream-record.md:21-28`, `49-64`, `114-131` | Current H4.5 root help and selector probes fail truthfulness. Worktree is also dirty with pre-existing and concurrent untracked files. | historical claim contradicted by current behavior | no | repair records alongside code/spec fixes | Habitat recovery owner | `git status --short --branch && bun run habitat -- --help` |
| FRAME-BRANCH-STATUS | Habitat train branch/status in FRAME remains current. | `FRAME.md:260-267` | Current worktree branch is `codex/habitat-dra-takeover-frame`, not `agent-F-habitat-harness-workstream`; Frame status is historical. | current repo state | no | records-only if docs are kept historical; repair if presented as current | Habitat records owner | `git branch --show-current` |
| BACKFILL-CANDIDATES | Grit candidate checks and codemods are authorized implementation targets. | `adversarial-audit-recovery-reference.md:499-527` | The reference says candidates must not be implemented until Stage 0 records authority and evidence status; keyword hits are seeds only. | architecture target | no | defer with trigger | Per-pattern OpenSpec owner | `rg -n "habitat-grit-" docs/projects/habitat-harness/adversarial-audit-recovery-reference.md` |

## Fresh Probe Suggestions

Run these before opening or closing repair workstreams. Prefer stdout-only
commands first; any command that writes generated outputs should run in a clean,
owned branch or scratch worktree.

Command trust:

- `bun run habitat -- --help`
- `bun run habitat -- check --help`
- `bun tools/habitat-harness/src/bin/habitat.ts --help`
- `bun tools/habitat-harness/src/bin/habitat.ts check --help`
- `nx run @internal/habitat-harness:build && bun tools/habitat-harness/bin/run.js --help`
- `bun run habitat:check -- --json --rule definitely-not-a-rule`
- `bun run habitat:check -- --json --tool definitely-not-a-tool`

Graph, taxonomy, and classify:

- `nx show projects --json`
- `nx show project @civ7/adapter --json`
- `nx show project @internal/habitat-harness --json`
- `bun run habitat classify packages/civ7-adapter/src/index.ts`
- `bun run habitat classify apps/mapgen-studio/src/main.tsx`
- `bun run habitat classify docs/projects/habitat-harness/FRAME.md`
- `bun run habitat -- classify "$(git diff -- docs/projects/habitat-harness/FRAME.md)"`

Ratchet and rules:

- `find tools/habitat-harness/baselines -maxdepth 1 -type f -print`
- `bun run habitat:check -- --json --rule adapter-boundary`
- `bun run habitat:check -- --json --rule baseline-integrity`
- `bun run habitat:check -- --json --owner @internal/habitat-harness`
- `bun run --cwd tools/habitat-harness test`

Grit proof:

- `GRIT_TELEMETRY_DISABLED=true grit patterns test --verbose`
- `bun run habitat:check -- --json --tool grit-check`
- `nx run @internal/habitat-harness:grit:check --outputStyle=static`
- Inject one temporary violation per retired mechanism only in an owned scratch branch, then remove it before closure.

Biome, generated zones, and archives:

- `nx run @internal/habitat-harness:biome:ci --outputStyle=static`
- `find . -path '*/_archive/*' -type f | sed -n '1,80p'`
- `find . -name 'eslint.config.*' -o -name 'biome.json'`
- `nx run @internal/habitat-harness:generated:check --outputStyle=static`

Hooks and local mutation:

- `bun run habitat hook pre-commit`
- `bun run habitat hook pre-push --base "$(gt branch info --no-interactive | sed -n 's/^Parent: //p' | head -1)"`
- In an owned scratch branch only: partially staged Biome file probe, generated-zone staged edit probe, and resource-submodule publish no-op/idempotence probe.

Records:

- `rg -n "CLOSED|DONE|passed|green|root help|catalog|complete|fully retired|only enforcement path" docs/projects/habitat-harness openspec/changes/habitat-* -g '*.md'`
- `git status --short --branch`
- `gt log --no-interactive`

## Stale Record Risks

- `openspec/changes/habitat-oclif-cli/workstream/phase-record.md` claims root
  and check help smokes pass, but current root script probes fail. The direct
  source shim works, so the stale claim is specifically about the canonical
  root/dev script path, not about absence of command classes.
- `docs/projects/habitat-harness/workstream-record.md:21-28`,
  `docs/projects/habitat-harness/workstream-record.md:49-64`, and
  `docs/projects/habitat-harness/workstream-record.md:114-131` still read as if
  H1-H8 are locally closed and final gates green. Current command behavior makes
  that unsafe as a current proof claim.
- `docs/projects/habitat-harness/review-disposition-ledger.md:72-75` says all
  accepted repairs were applied and all 8 changes revalidated. Treat as
  historical until each affected row is rechecked against current commands and
  code.
- `docs/projects/habitat-harness/discrepancy-log.md:11-13` says no
  code-violates-docs cases were found. That was true for the derivation pass as
  scoped, but it is misleading if read as current Habitat command-record truth.
- `docs/projects/habitat-harness/FRAME.md:260-267` names the original workstream
  branch/status. Current branch is `codex/habitat-dra-takeover-frame`, with
  pre-existing dirty files and concurrent untracked artifacts.
- Active untracked files appeared during this session:
  `docs/projects/habitat-harness/recovery-claim-ledger.md`,
  `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`, and several
  `docs/projects/habitat-harness/research/official-docs-*.md` files. Do not
  treat them as tracked source authority until reconciled.
- `tools/habitat-harness/test/commands/habitat-commands.test.ts:70-160` uses
  command classes with mocked engine functions. It is useful for adapter logic,
  but it does not prove root script or production runner behavior.
- `tools/habitat-harness/src/lib/generated-zones.ts:40-70` returns pass for
  non-staged generated-zone checks. CI drift proof depends on
  `tools/habitat-harness/scripts/verify-generated-zones.mjs`, not on staged
  file-layer rules alone.
- `tools/habitat-harness/src/generators/pattern/schema.json:45` requires only
  `ruleId`, while the recovery reference requires authority and proving sources
  before Grit work. Pattern generation can currently create enforced scaffold
  rules with placeholder authority text.

## Owner/Proof Grouping

| Proof group | Rows | Owner layer | Required proof before closure |
| --- | --- | --- | --- |
| Command trust | H45-OCLIF-CLI, H45-SUBCOMMAND-HELP, H45-PROD-RUNNER, H6-UNKNOWN-SELECTION | oclif command surface + Habitat command engine | Root script help, subcommand help, production runner help after build, invalid rule/tool selection failure, tests that invoke actual entrypoints. |
| Graph and classify trust | H1-NX-RETIREMENT, H3-TAXONOMY, H8-CLASSIFY-PRIMITIVE | Nx graph, taxonomy docs, Habitat classify | Current project graph, dependency-edge reconstruction, taxonomy allowances with provenance, classify matrix across project and workspace paths. |
| Ratchet and baseline trust | SYS-RATCHET, H2-SCAFFOLD-CONTRACT | Habitat baseline engine, rule pack, tests | Explicit accepted semantics for missing baseline files, shrink-only expansion probe, JSON diagnostic shape validation. |
| Grit syntax trust | H5-GRIT-FIRST-TRANCHE, BACKFILL-CANDIDATES, H8-PATTERN-GENERATOR-AUTHORITY | Grit + Habitat adapter | Native pattern tests, one shared Grit JSON scan through Habitat, scan-root record, baseline action, false-positive/false-negative probes. |
| Safe transformations | H5-SAFE-TRANSFORMS, H8-PATTERN-GENERATOR-AUTHORITY | Grit apply + Biome + typecheck/test proof | Fixture-gated apply pattern, dry-run output, applied diff proof, Biome after rewrite, typecheck/tests, rollback or manual disposition. |
| Hygiene and generated zones | H4-BIOME-HYGIENE, H5-GENERATED-ZONES | Biome + file-layer + generated:check | Biome include/exclude audit, no competing hygiene owners, staged generated-zone probe, regenerate-and-diff proof for repo-runnable zones. |
| Enforcement surface | SYS-FIVE-LAYERS, H6-ONLY-ENFORCEMENT-PATH | Habitat rule pack, package scripts, CI | Alias/bypass inventory, each structural guard mapped to one owner, surviving direct commands documented with owner and retirement trigger. |
| Hook mutation | SYS-CI-AUTHORITY, H7-HOOKS-BOUNDED | Husky + Habitat hook runner | No staged/unstaged corruption, formatter-touched restage proof, resource publish idempotence/order proof, Graphite parent fallback proof, CI remains authoritative. |
| Records truth | S0-LEDGER, REVIEW-ALL-REPAIRS-APPLIED, DISC-NO-CODE-VS-DOC, WORKSTREAM-H1-H8-CLOSED, FRAME-BRANCH-STATUS | Project docs + OpenSpec records | Every lowered/rejected claim updates downstream stale records in the same repair closure; no closure wording without fresh command/source proof. |

## Uncertainties

- I did not run full `bun run habitat:verify`, `bun run build`, `bun run test`,
  `generated:check`, native Grit pattern tests, or OpenSpec validation. Those are
  listed as fresh probes because several can be broad, slow, or write generated
  outputs before restoring them.
- Command evidence is from branch `codex/habitat-dra-takeover-frame` at the time
  of this local probe, not from every historical Graphite branch named in phase
  records.
- Pre-existing dirty files and concurrent untracked artifacts mean this pack
  should not be used to infer final worktree hygiene or branch closure.
- The concurrent untracked `recovery-claim-ledger.md` may overlap this artifact.
  I did not edit it; reconcile row IDs and evidence before choosing a canonical
  ledger.
- I treated official-doc research files under `docs/projects/habitat-harness/research/`
  as concurrent/untracked and out of scope for this repo-local evidence pack.
- Some H4 proof-repair claims depend on root-load/test behavior outside the
  Habitat command surface. They need fresh build/test proof before they can stay
  in a current closure ledger.
- The current source oclif shim works while the root dev runner fails help. A
  repair should preserve the working shim behavior and fix canonical script
  wiring/entrypoint tests rather than discard the command classes.
