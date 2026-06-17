# Habitat Harness H8 Phase Record - Generators, Migrations, Classify

## Phase

- Project: Habitat Harness
- Phase: H8 `habitat-generators-migrations`
- Owner: workstream owner agent
- Branch/Graphite stack: `agent-F-habitat-generators-migrations` stacked above locally closed H7 `agent-F-habitat-git-hooks`
- Started: 2026-06-14T00:00:00Z
- Status: historical H8 closure record; superseded where later Habitat repair
  packets define stricter classify target truth, Pattern Authority registration,
  baseline, and migration proof boundaries.

## Objective

- Target movement: make supported new structure generative, make `habitat classify` the agent orientation entry point, and wire harness migrations so future convention changes can propagate mechanically.
- Current interpretation: later repair packets refine this H8 closure. Classify
  targets must be resolved from current Nx metadata; sparse pattern generation
  is candidate-only until registered-promotion gates are accepted; no-op
  migration proof remains wiring-only.
- Non-goals: no retroactive restructuring of existing projects, no domain-specific mod/engine/control scaffolding, no new enforcement semantics beyond generated clean output, no generated-output hand edits.
- Done condition: project and pattern generators exist with probes removed after verification, no-op migration wiring executes via local migration run file, classify returns project/tags/rules/targets for path and diff inputs, AGENTS/README procedure is current, OpenSpec/tasks/records are aligned, gates pass, and the branch is committed via Graphite with a clean worktree.

## Authority

- Root `AGENTS.md`: Graphite discipline, generated artifact hygiene, Tooling Defaults.
- Product refs: `docs/projects/habitat-harness/FRAME.md`, spec draft §10/§11/§14 referenced by the proposal.
- Architecture refs: `docs/projects/habitat-harness/taxonomy.md`, H6/H7 phase records, Habitat README and rule pack.
- Project refs: `docs/projects/habitat-harness/workstream-record.md`, `openspec/changes/habitat-generators-migrations/{proposal.md,tasks.md,specs/habitat-harness/spec.md}`.
- Excluded/stale inputs: prior H5/H7 wrapper experiments are historical evidence only; current source and command output are authoritative.

## Current State

- Repo/Graphite state: H8 branch created on H7 commit `9c20ffd99`; worktree clean at phase open.
- Dirty files and owner: H8 implementation/docs/records only; temporary
  generator and migration probes were removed after verification.
- Current code evidence: `habitat classify` now supports paths and literal
  diffs/`.diff`/`.patch` files; Habitat package exposes native Nx
  `project` and `pattern` generators plus migration metadata.
- Current recovery interpretation: the no-op migration is wiring proof only.
  It demonstrates that Habitat migrations can be declared and executed through
  a hand-authored Nx run file; it is not evidence that any convention migration
  updates downstream project files.
- Generated outputs affected: none expected in final diff; generator probes must be removed after verification.
- Tests/guards affected: Habitat harness package tests/checks, OpenSpec validation, generated-project probe build/check/test, pattern generator native Grit fixture proof, migration execution proof, classify spot-check matrix.

## Scope

- Write set: `tools/habitat-harness/**`, `.grit/patterns/**` only via temporary probe removal or generator templates as needed, `docs/projects/habitat-harness/**`, `openspec/changes/habitat-generators-migrations/**`, root `AGENTS.md`.
- Protected files: generated outputs (`dist/`, `mod/`, generated bundles), unrelated OpenSpec changes, unrelated package/app sources except temporary generator probes removed before closure.
- Owners: Nx owns project/pattern generator execution and migrations; Habitat owns rule-pack/baseline semantics and classify output; Grit owns native pattern tests; AGENTS/README own agent operating procedure.
- Forbidden owners: H8 must not create domain logic generators, custom structural scanners, or broad enforcement wrappers to compensate for unclear scope.

## Implementation

- Completed tasks: phase record opened before implementation; project
  generator implemented for `foundation`, `plugin`, and `app`; unsupported
  kinds refuse with domain-owner rationale; pattern generator implemented for
  native Grit pattern + empty locked baseline + rule-pack entry under the
  historical H8 contract; no-op migration wired; classify path/diff output
  completed; AGENTS and README procedure updated; probes and final gates
  passed. Current recovery note: registered generated-rule baseline creation
  now depends on `habitat-scaffold-contract-repair`'s explicit baseline and
  rule-introduction manifest contract plus authority/proof metadata from
  `habitat-pattern-generator-metadata-repair`. The current pattern generator
  repair makes sparse generation candidate-only and fail-closes registered
  lifecycles until the manifest/proof gates are accepted; H8 alone is not
  accepted authority for new enforced rules. The no-op migration remains
  wiring proof only; any future convention migration requires a named source
  shape, target shape, planned file operations, and idempotence proof.
- Remaining tasks: none in H8; current repair obligations live in downstream
  Habitat repair packets.
- Stop conditions triggered: none.
- Timing interpretation carried from H7: broad self-edits to root/Habitat inputs are an operational boundary, not the normal hook path. H8 should keep normal checks scoped and explicit rather than optimizing around the broad self-edit case.

## Verification

- Commands run:
  - `git status --short --branch` -> clean on `agent-F-habitat-generators-migrations` at open.
  - `git log -1 --oneline` -> `9c20ffd99 feat(habitat): add git hook enforcement path`.
  - `gt log short --stack` -> H8 inserted above H7 and below `agent-F-habitat-effect-core`.
  - `nx g @internal/habitat-harness:project h8-probe-foundation --kind=foundation`
    -> generated `packages/h8-probe-foundation`.
  - `nx g @internal/habitat-harness:project h8-probe-plugin --kind=plugin`
    -> generated `packages/plugins/plugin-h8-probe-plugin`.
  - `nx g @internal/habitat-harness:project h8-probe-app --kind=app`
    -> generated `apps/h8-probe-app` with unscoped app project name
    `h8-probe-app`.
  - `nx run-many -t build,check,test
    --projects=@civ7/h8-probe-foundation,@civ7/plugin-h8-probe-plugin,h8-probe-app
    --skip-nx-cache --outputStyle=static` -> pass cold; all three generated
    projects built, typechecked, and ran Bun test stubs.
  - `nx g @internal/habitat-harness:project h8-probe-mod
    --kind=mod --dry-run` -> refused with rationale: only uniform
    plugin/foundation/app kinds are supported; mod/engine/control/adapter/sdk/tooling
    are domain-owned shapes.
  - `nx g @internal/habitat-harness:pattern grit-h8-probe ...` ->
    generated `.grit/patterns/habitat/checks/h8_probe.md`, empty baseline,
    and rule-pack entry.
  - `GRIT_TELEMETRY_DISABLED=true grit patterns test
    --filter=h8_probe --verbose` -> pass, 1 pattern / 2 samples.
  - Rule-pack registration probe via Node JSON read -> `grit-h8-probe`
    present with `ownerTool: grit-check`, `gritPattern: h8_probe`, owner
    `@internal/habitat-harness`.
  - `bun run biome:check -- --colors=off` with probes present -> pass after
    generator formatting fixes.
  - `bun run habitat:check` with probes present -> pass, 43 rules, 0 failing,
    1 advisory doc-ambiguity finding.
  - Temporary migration run file with package `./tools/habitat-harness` +
    `nx migrate --run-migrations=migrations.h8-probe.json
    --skip-install` -> pass; no-op migration made no changes. Probe file
    removed. This proves migration wiring only, not convention migration
    behavior.
  - `bun run habitat classify packages/civ7-adapter/src/index.ts` -> project
    `@civ7/adapter`, tag `kind:adapter`, `adapter-boundary` in scope, required
    targets include `nx run @civ7/adapter:check`.
  - `bun run habitat classify
    mods/mod-swooper-maps/src/recipes/standard/recipe.ts` -> project
    `mod-swooper-maps`, tag `kind:mod`, recipe-surface rules in scope,
    required targets include `nx run mod-swooper-maps:check`.
  - `bun run habitat classify packages/config/src/index.ts` -> project
    `@civ7/config`, tag `kind:foundation`, internal harness rules in scope,
    required targets include `nx run @civ7/config:check`.
  - `bun run habitat classify apps/mapgen-studio/src/main.tsx` -> project
    `mapgen-studio`, tag `kind:app`, `grit-studio-recipe-artifacts` in scope,
    required targets include `nx run mapgen-studio:check`.
  - `bun run --cwd tools/habitat-harness check` -> pass.
  - `bun run --cwd tools/habitat-harness test` -> pass, 3 files / 14 tests.
  - `bun run openspec -- validate habitat-generators-migrations --strict` ->
    pass.
  - Final `bun run biome:check -- --colors=off` after probe removal -> pass,
    2342 files.
  - Final `bun run habitat:check` after probe removal -> pass, 42 rules, 0
    failing, 1 advisory doc-ambiguity finding.

## Realignment

- Downstream docs/specs/issues updated: root `AGENTS.md`,
  `tools/habitat-harness/README.md`, H8 proposal/spec/tasks.
- Tests/guards updated: added classify matrix/diff tests; native Grit pattern
  tests remain the pattern authority; generator probes removed after proof.
- Deferrals/triage updated: non-uniform project kinds remain refused until
  domain owners define real generator shapes.

## Next Action

- Use H8 as historical source evidence only. Current classify/generator,
  Pattern Authority, baseline, and migration proof claims are owned by their
  downstream repair packets.
