# Wave 2 Public API / CLI Contract Scratch

Role lane: Public API/CLI Contract Analyst.

Scope: prepare evidence for later Phase 2 packets. This is not a final packet
and does not authorize implementation.

## Preflight

- Worktree confirmed:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame`.
- Branch confirmed: `codex/habitat-fast-lint-checks`.
- Initial status confirmed clean: `## codex/habitat-fast-lint-checks`.
- Required domain files confirmed present:
  `docs/projects/habitat-harness/domain-refactor-frame.md`
  and
  `docs/projects/habitat-harness/domain-mapping/domain-design-packet.md`.

## Source Surfaces Read

- Required skill files:
  `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-systematic-workstream/SKILL.md`,
  `/Users/mateicanavra/.codex/skills/investigation-design/SKILL.md`,
  `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-habitat-dra-workstream/SKILL.md`,
  `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`,
  `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`,
  `/Users/mateicanavra/.agents/skills/system-design/SKILL.md`,
  `/Users/mateicanavra/.agents/skills/api-design/SKILL.md`,
  `/Users/mateicanavra/.agents/skills/typescript/SKILL.md`,
  `/Users/mateicanavra/.agents/skills/team-design/SKILL.md`.
- Domain inputs:
  `docs/projects/habitat-harness/domain-refactor-frame.md`,
  `docs/projects/habitat-harness/domain-mapping/domain-design-packet.md`.
- Habitat docs:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat/README.md`,
  `docs/CAPABILITIES.md`,
  `docs/IMPLEMENTED-SURFACE.md`,
  `docs/SCENARIOS.md`,
  `docs/GAPS.md`,
  `docs/AUTHORING-NEXT.md`,
  `docs/DOMAIN-MAPPING.md`.
- Public surface sources:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/package.json`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/nx.json`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/.husky/pre-commit`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/.husky/pre-push`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat/package.json`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat/generators.json`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat/oclif.manifest.json`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat/src/commands/*.ts`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat/src/index.ts`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat/src/lib/command-engine.ts`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat/src/lib/diagnostics.ts`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat/src/plugin.js`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat/src/generators/project/*`,
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat/src/generators/pattern/*`,
  focused command/classify/verify/generator/hook/apply tests under
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat/test`.
- Fresh command evidence:
  `/Users/mateicanavra/.bun/bin/bun /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat/bin/dev.ts --help`,
  `check --help`, `classify --help`, `verify --help`, `fix --help`,
  `graph --help`, `hook --help`, and
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/node_modules/.bin/nx show project @habitat/cli --json`.

## Contract Inventory

### CLI Commands

- `habitat check`: structural enforcement. Flags: `--json`, `--output`,
  `--owner`, `--rule`, `--tool`, `--staged`, `--expand-baseline`, `--base`
  defaulting to `main`. JSON output is `CheckReport` schemaVersion 1. Selector
  failures are represented as a single `rule-selection-integrity` failing rule
  in JSON mode and must fail before baseline expansion writes.
- `habitat classify PATH`: orientation/routing. Required `PATH` accepts
  repo-relative path, absolute path, literal diff, or `.diff`/`.patch` file.
  Always emits JSON. Single-path output has no `schemaVersion`; diff output has
  `schemaVersion: 1` and `inputKind: "diff"`. Output includes project, root,
  tags, scoped rules, required targets, target proof, unavailable target facts,
  and workspace-level notes.
- `habitat verify`: diagnostic handoff proof. Flags: `--base`, `--json`.
  Runs `habitat check` first, then `nx affected -t
  build,check,test,boundaries,biome:ci,grit:check,generated:check --base
  <base>`. JSON output is `VerifyProof` schemaVersion 1 and includes command
  env subset, resolved base, summarized check report, Nx affected execution or
  skipped state, bounded stdout/stderr, post-state, and explicit non-claims.
- `habitat fix`: guarded structural repair. Flag: `--dry-run`. Current public
  claim is not "fix all findings"; it runs the approved Grit apply transaction
  and Biome handoff.
- `habitat graph`: graph export. Flag: `--json`; implementation writes an Nx
  graph file to a temp dir and prints `graph.graph ?? graph`.
- `habitat hook [NAME]`: local Git-hook entrypoint. Optional `NAME`, flag
  `--base`. Supported public names are effectively `pre-commit` and
  `pre-push`; hooks are local feedback and not CI/product proof.

### JSON And TS API

- `CheckReport` and `HabitatDiagnostic` are the normalized diagnostic contract:
  `{ schemaVersion: 1, command, startedAt, ok, rules[] }`, with diagnostics
  `{ ruleId, path, line?, message, severity, baselined }`.
- `VerifyProof` is a broader proof artifact with bounded streams and explicit
  non-claims. It currently summarizes selected selectors as `{}` in verify
  because `verify` does not expose rule selectors.
- `Classification` and `DiffClassification` are exported TS types and emitted
  CLI shapes. Diff classification is versioned; single classification is not.
- Package exports expose `.` as `/tools/habitat/src/index.ts`,
  `./plugin` as `/tools/habitat/src/plugin.js`, and `./rules` as
  `/tools/habitat/src/rules/rules.json`. The root index exports many
  internals: baseline operations, rule selection/reporting, classify, verify,
  fix/graph/hook runners, Grit apply transaction APIs, Effect process boundary,
  proof artifact writers, rules, and Pattern Authority manifest APIs.

### Root Scripts And Nx Targets

- Root scripts expose `habitat`, `habitat:check`, `habitat:fix`, `lint`,
  `verify`, and `check`. Root `verify` is `nx run-many --targets=verify`; it is
  not the same as `habitat verify`.
- Nx loads `/tools/habitat/src/plugin.js`. Public inferred targets
  include `biome:format`, `biome:check`, `biome:ci`, `boundaries`,
  `grit:check`, `generated:check`, `habitat:check:all`, per-rule
  `habitat:rule:<rule-id>`, and per-owner `habitat:check`.
- The target contracts encode authority routing: Biome owns hygiene,
  Nx/enforce-module-boundaries owns project-plane boundaries, Grit catalog
  target routes through `habitat check --tool grit-check`, generated-zone gate
  has build/verify dependencies, and rule aliases are often dependency-only
  `node -e ""` targets.

### Generators

- `@habitat/cli:project <name> --kind=<kind>`: supports
  `foundation`, `plugin`, and `app`, including `kind:` prefixes. Refuses
  `mod`, `engine`, `control`, `adapter`, `sdk`, `tooling`, mismatched roots,
  mismatched package names, non-empty roots, and package-name collisions before
  writes. Writes package metadata, `kind:*` tag, TypeScript config, source stub,
  Bun test stub, and README.
- `@habitat/cli:pattern <ruleId>`: candidate lifecycle by default.
  Candidate output is non-enforcing and not a rule, active Grit check, baseline,
  or hook scope. Registered advisory/enforced modes require `--manifestPath`,
  accepted Pattern Authority Manifest, baseline contract, rule-introduction
  manifest, and hook-scope agreement for `pre-commit`.
- `migrations.json` currently exposes a no-op migration that proves wiring only.

### Hook Entrypoints

- `.husky/pre-commit` delegates to `bun run habitat hook pre-commit`.
- `.husky/pre-push` delegates to `bun run habitat hook pre-push`.
- Pre-commit contract: local-only proof, resource state guard, staged file-layer
  check, partial-staging refusal before formatting, staged Biome format/check,
  restage only formatter-touched paths, staged Grit only for approved scan
  roots.
- Pre-push contract: local-only proof, `--base` override when supplied,
  Graphite parent as default when available, merge-base fallback, `--head=HEAD`,
  affected targets `biome:ci,boundaries,grit:check,habitat:check,test`.

## Stabilization Order

1. Public vocabulary and command purpose: freeze scenario names and proof-class
   language before moving internals. Highest leverage terms are classify,
   check, verify, fix/apply, graph, hook, generator, pattern candidate,
   registered pattern, baseline, and non-claim.
2. JSON contracts: version and document `CheckReport`, `VerifyProof`, and
   classification outputs. Single-path classify needs either `schemaVersion: 1`
   or an explicit decision that only diff classify is versioned.
3. CLI compatibility: preserve command names and flags unless a packet includes
   a migration story. `--json`, `--output`, selectors, `--expand-baseline`,
   `--staged`, `--base`, `--dry-run`, and hook `--base` are externally visible.
4. Nx graph target names: lock target naming and alias behavior before changing
   plugin internals, because root scripts, classify output, hooks, and review
   habits depend on these names.
5. Generator refusal contracts: stabilize project kind support/refusals and
   Pattern Authority lifecycle semantics before splitting scaffolding from
   pattern governance.
6. TS exports: decide which exports are intended public API versus incidental
   test/internal seams before domain refactors move `command-engine.ts`.
7. Hook local-proof contract: stabilize hook outputs, non-claims, staged-scope
   semantics, and Graphite base policy before internal hook decomposition.

## Ambiguity Ledger

- `classify` has JSON output but no `--json` flag and no schema version on
  single-path output. This is contract ambiguity.
- `check --output` writes through `path.resolve(repoRoot, output)`. Absolute
  paths are accepted by Node semantics, but the public contract does not say
  whether output paths are repo-relative or absolute.
- `verify` JSON summarizes requested selectors as `{}` because verify has no
  selector flags. Either keep this as a reserved field or remove/clarify it in
  the schema before downstream proof packets rely on it.
- `verify` and root `verify` are different public surfaces with overlapping
  names. Product language should say "diagnostic Habitat verify" versus
  "root graph-owned verify".
- `graph --json` says compact JSON; non-json mode prints pretty JSON. Both are
  machine-readable, so the flag name is weak unless the contract is "compact".
- `fix` help says "Report hygiene drift" for `--dry-run`, but current domain
  language is guarded Grit apply plus Biome handoff. The public phrase should
  not imply broad hygiene diagnostics.
- `hook` help says wiring is deferred until `habitat-git-hooks`, but Husky
  delegators are present. This is stale language or at least confusing.
- Package export `.` exposes many internals from `src/index.ts`. Without an
  intended-public list, Phase 2 could accidentally break TS consumers or lock
  internal seams as public contracts.
- Nx inferred `habitat:rule:biome-ci` depends on `{ projects: ["biome"],
  target: "ci" }` because colon splitting treats `biome:ci` as project/target.
  The source intended canonical target `biome:ci`; contract analyst should
  verify whether this alias is currently valid or an accidental target-shape
  bug before relying on per-rule Biome alias behavior.
- Project generator schema accepts unsupported kinds in enum only to refuse
  them at runtime. That refusal is intentional but could confuse generated
  docs/tooling that treat enum entries as supported values.

## Likely Domino Impacts

- Orientation and Routing packet: public impact is `habitat classify` JSON,
  target command strings, unavailable target facts, and rule-scope vocabulary.
  Internal refactor can move classification out of `command-engine.ts` if the
  emitted shape and target semantics are held stable or intentionally versioned.
- Structural Enforcement packet: public impact is `habitat check`, selector
  validation, `CheckReport`, rule statuses, advisory/enforced behavior, and
  baseline-integrity inclusion. Internal refactor should not change selector
  failure timing or JSON shape without an API packet.
- Baseline Authority packet: public impact is `--expand-baseline`, baseline
  file contract, rule-introduction guard, and baseline-integrity diagnostics.
  Proof class is baseline contract, not current-tree product behavior.
- Workspace Graph Integration packet: public impact is Nx inferred targets,
  root script expectations, classify target proof, and verify affected target
  list. This should precede or accompany any plugin split.
- Diagnostic Pattern Catalog packet: public impact is `--tool grit-check`,
  Grit failure tags projected through diagnostics, staged Grit scan-root
  behavior, and Pattern Authority references. Keep diagnostics separate from
  registered rule admission.
- Pattern Governance packet: public impact is `@habitat/cli:pattern`,
  candidate/registered lifecycle flags, manifest contract, baseline contract,
  hook-scope decision, and active rule writes. This should not be bundled with
  raw Grit acquisition.
- Transformation Transaction packet: public impact is `habitat fix --dry-run`,
  Grit apply transaction exported APIs, failure tags, proof fields, rollback,
  approved roots, create/delete refusal, and Biome/gate handoff. Do not claim
  broad "fix all" behavior.
- Local Feedback packet: public impact is `habitat hook`, Husky delegators,
  pre-commit/pre-push output and local-proof non-claims, staged mutation policy,
  Graphite base detection, and `--base` override.
- Generated/Protected Zone Authority packet: public impact is staged file-layer
  checks, `generated:check`, generated-zone refusal language, and generated
  artifact proof. Keep this separate from general structural enforcement.
- Scaffolding packet: public impact is `@habitat/cli:project`,
  supported/refused kinds, canonical roots/package names, and generated file
  set. Future Authoring Topology must not backfill meaning into this generator.
- Proof Contract packet: cross-cutting public impact across `check`, `verify`,
  hooks, apply proof, non-claims, and root graph proof. This should be an early
  stabilizer because other packets depend on proof labels.

## P1 / P2 Risks

- P1: Refactoring `command-engine.ts` before locking JSON and CLI contracts can
  silently change all six CLI commands.
- P1: Treating root `verify`, `habitat verify`, hook success, command tests,
  and product/runtime proof as interchangeable will violate the frame hard
  core.
- P1: Package exports currently expose internals. Moving files without an
  explicit public/private export decision risks downstream TS breakage.
- P1: Nx target names are embedded in docs, root scripts, classify output, hooks,
  and review workflows. Rename/split work must include compatibility aliases or
  an intentional contract change.
- P2: Ambiguous classify versioning will make future agent integrations brittle.
- P2: `fix --dry-run` wording can overpromise broad repair/hygiene behavior.
- P2: Generator enum/refusal design can mislead automated tooling unless the
  refusal contract is documented as product behavior.
- P2: Hook help text and current Husky wiring appear out of sync.

## Stop Conditions For Later Packet Authors

- Stop if a packet changes command names, flags, JSON shapes, exported TS names,
  package export paths, Nx target names, generator schemas, or hook entrypoints
  without an explicit public-surface section and compatibility/proof story.
- Stop if a packet can only be described as moving code from
  `/tools/habitat/src/lib/command-engine.ts` into smaller files rather
  than stabilizing a scenario/domain contract.
- Stop if product language uses implementation owner names such as
  `command-engine`, `file-layer`, or `grit-apply` where the public scenario is
  orientation, generated/protected zone authority, or transformation
  transaction.
- Stop if Authoring Topology or MapGen recipe/domain/op/stage/step generation
  is treated as currently supported by `project` or `pattern` generators.
- Stop if tests only prove source functions and do not cover command behavior
  for a changed public surface.
