## Why

The intra-project plane — domain surfaces, runtime purity, stage isolation,
contract shapes inside `mod-swooper-maps`, plus generated-zone protection —
is where most existing enforcement lives (8 ESLint rule families, 5 grit-able
lint-script families) and where codemod capability is entirely missing. This
slice creates the GritQL pattern catalog (syntax layer) and the file layer
(path/generated-zone rules), porting those rules to harness ownership with
fixtures, and establishing the first `grit:apply` codemod as a first-class
remediation path. GritQL under Bun was de-risked 2026-06-12 (FRAME §4):
install, check, apply, and `--json` all proven; known gotchas recorded.

## Target Authority Refs

- `docs/projects/habitat-harness/FRAME.md` §4 (grit de-risk + gotchas), hard core #1–#3
- `docs/projects/habitat-harness/invariant-corpus.md` (port dispositions: §A, §B, §E)
- `docs/projects/habitat-harness/taxonomy.md` §4 (scope:* rule families)
- `docs/projects/habitat-harness/habitat-harness-spec-draft-input.md` §5.5
  (GritQL ownership), §7 (file layer), §8 (remediation rules)
- `https://docs.grit.io/language/overview`

## What Changes

- Add `@getgrit/cli` devDependency; `.grit/grit.yaml` loading native
  `.grit/patterns/habitat/**` markdown patterns; commit `.grit/grit.yaml`;
  gitignore `.grit/.gritmodules` and cache artifacts.
- Port to grit-check patterns (each with native `grit patterns test` samples
  and a tested failure message; ESLint/script originals stay active until
  `habitat-enforcement-consolidation`):
  - `scope:domain-surface` family: deep domain imports, step-contract
    entrypoint-only imports, recipe.ts ops-surface imports, studio
    recipe-artifact imports, domain-root `export *` facades.
  - `scope:runtime-purity` family: TypeBox `Value.*`/`TypeCompiler` in runtime
    layers, `runValidated` calls, canonical-helper redeclaration, empty schema
    defaults, and the G3 runtime-value ban (no Civ7 runtime imports in
    mapgen-core engine/core paths). Runtime config-merge patterns remain under
    the wrapped full-profile guardrail.
  - `scope:stage-isolation` family: sibling-stage step imports (G5),
    domain-root catalogs (G2), wrapper-only stage config (G9), placement
    outcome contract boundary (G8). G1 milestone-prefixed recipe IDs remain
    under the original guardrail after a Grit parity stop.
  - ownership family: adapter-boundary runtime `/base-standard/` import
    detection (empty Grit baseline; legacy broad string script currently has
    7 allowlisted provenance/test files), control-orpc contract-ownership
    patterns, viz contract ownership (G10: no shared `steps/viz.ts` hubs, no
    cross-step private viz imports), and SDK mapgen entrypoint isolation
    (G11: SDK root must not import `./mapgen`; `@civ7/adapter/civ7`
    importable only under `src/mapgen/`).
- First grit-apply codemod (fixture-gated; apply runs Biome format after):
  deep `@mapgen/domain/<domain>/ops/<private>` imports rewrite to the public
  `/ops` surface where the mapping is mechanical. `export *` → named exports
  is not approved in H5 because pure GritQL cannot safely synthesize cross-file
  named export lists. The value-star/type-star distinction itself is covered by
  the Grit check pattern, but the `export type *` edge remains outside native
  sample coverage because `grit patterns test` currently parse-errors on that
  TypeScript syntax before the pattern can run. H5 does not add a custom
  temp-workspace test around that parser edge.
- File layer in the harness rule pack: generated zones
  (`mods/mod-swooper-maps/src/maps/generated/**`, `packages/civ7-types/generated/**`,
  `packages/civ7-map-policy/src/civ7-tables.gen.ts`) become write-protected
  paths with "regenerate via <command>" remediation, enforced by
  `habitat check --staged` (diff-aware) and CI diff checks.
- Harness integration: `grit:check` inferred target routes through
  `habitat check --tool grit-check`; `habitat fix` runs approved grit-apply
  patterns before Biome; every pattern registered in the rule pack with empty
  locked baselines.
- The harness Grit adapter runs one native `grit check --json --level error`
  scan over declared audit roots, maps the shared JSON report to Habitat rule
  IDs, and derives pass/fail from unbaselined findings because raw JSON
  `grit check` exits 0 on findings (de-risk gotcha #4). It must not copy
  files, create temp workspaces, emulate native samples, or run Grit once per
  rule.

## What Does Not Change

- ESLint blocks and lint scripts remain active (dual-running with identical
  semantics) until consolidation retires them — parity is the point of this
  slice's verification.
- No new architectural rules beyond the promised-but-unenforced generated-zone
  protection; no semantic rewrites of product code outside fixture-proven
  codemods (none auto-applied in this slice).
- Architecture tests untouched.

## Requires

- `habitat-harness-scaffold`
- `habitat-biome-hygiene` (grit-apply must format rewrites with Biome)
- `habitat-oclif-cli` (downstream commands extend the oclif CLI surface, not
  the scaffold hand parser)

## Enables Parallel Work

- `habitat-enforcement-consolidation` (retirements depend on parity evidence
  from this slice).
- `habitat-git-hooks` (cheap staged grit checks).

## Affected Owners

- New: `.grit/patterns/habitat/**` (+ native samples), `.grit/grit.yaml`
- `tools/habitat-harness` rule pack, plugin targets, baselines
- Root devDependencies; CI affected targets (`grit:check`)

## Forbidden Owners

- GritQL must not own project-graph law (no cross-project dependency
  reasoning in patterns — that is `boundaries`).
- No pattern without fixtures may run in apply mode (check-only until
  fixtures exist).
- No hand-edits to generated zones, including in fixtures.
- No semantic/domain-behavior rewrites in codemods (fail-closed rule).

## Stop Conditions

- A ported rule cannot reach parity with its ESLint/script original (different
  match set on the current tree) — stop, record the delta, keep the original
  authoritative for that rule, and log it; do not ship a weaker port.
- GritQL cannot express a rule family at all — record per FRAME degeneration
  trigger accounting (habitat-native budget) before reassigning.
- A grit-apply pattern produces any non-format diff on fixtures beyond the
  declared rewrite.

## Consumer Impact

Agents gain `habitat fix`-able structural rules with precise diagnostics.
Generated zones become actually write-protected (first new enforcement; AGENTS
promise made real). No behavior change in product code.

## Verification Gates

- `bun run openspec -- validate habitat-grit-catalog --strict`
- Pattern parity: current-tree original mechanisms remain green while
  grit-check findings are empty; every ported Grit rule has positive and
  negative fixtures. Any rule that cannot safely reach parity stays under its
  original mechanism and is explicitly excluded from H6 retirement.
- Native sample suite: every pattern has passing input/output (apply) or
  match/no-match (check) samples run by `grit patterns test`; parser-edge
  cases that native samples cannot ingest remain documented stops rather than
  custom Grit test harnesses.
- `bunx nx affected -t grit:check` green; `habitat fix --dry-run` lists only
  approved codemods and then runs Biome check.
- Generated-zone probe: a staged hand-edit to a generated file fails
  `habitat check --staged` with the regenerate remediation; probe removed.
- `bun run build && bun run check && bun run test` unchanged-green.
