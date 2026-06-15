# Source Synthesis

**Change:** `habitat-classify-generator-repair`
**Owner:** DRA Habitat recovery owner

## Frame Carry-Forward

The takeover frame requires agents to classify before authoring and generated
structure to be supported rather than invented. The H8 recovery rows say the
current classify/generate surface is useful but overclaims target and generator
truth.

## Current Code Evidence

- `classifyPath` consumes resolved Nx project graph metadata instead of
  manually scanning workspace roots for `package.json`.
- Project target emission is gated by resolved Nx target metadata. Missing
  targets are recorded as unavailable instead of runnable commands.
- `workspaceTargets()` emits fixed workspace gates with structured ownership
  proof separate from project-local targets.
- `rulesInScope` is now derived from structured `scopedRules` entries.
  Classify distinguishes exact path matches, project-owner rules,
  workspace-level gates, and unresolved metadata instead of presenting
  owner-level aggregation as exact path truth.
- Exact path extraction only consumes machine-readable scope strings. Scope
  prose with unmodeled qualifiers such as exclusions or compound natural
  language is not partially scraped into exact path truth.
- `classifyTarget()` supports literal diffs and patch files by extracting
  changed paths and classifying each path.
- Project generator supports only the canonical uniform `plugin`,
  `foundation`, and `app` contracts. It refuses unsupported kinds, mismatched
  roots, mismatched package names, non-empty roots, and workspace package-name
  collisions before writes.
- Pattern generator remains separately governed by
  `habitat-pattern-generator-metadata-repair`.
- Current migration metadata declares a no-op migration, which proves wiring
  only.

## Fresh Command Evidence

- `bun run habitat classify packages/civ7-adapter/src/index.ts` reports
  `@civ7/adapter:check`, does not report `@civ7/adapter:test`, and records
  `test` as an unavailable project target.
- `bun run habitat classify apps/mapgen-studio/src/main.tsx` reports
  `grit-studio-recipe-artifacts` as `exact-path` because the path matches the
  rule's current scope pattern.
- `bun run habitat classify packages/civ7-adapter/src/index.ts` does not report
  `grit-studio-recipe-artifacts`, and reports `adapter-boundary` as
  `exact-path`.
- `bun run habitat classify packages/civ7-adapter/src/index.ts` does not report
  `grit-adapter-base-standard-import`; its `packages/**/*.ts outside
  packages/civ7-adapter` prose scope is not machine-readable exact scan-root
  metadata.
- `bun run habitat classify packages/mapgen-core/src/core/index.ts` reports
  `grit-mapgen-core-runtime-civ7` as `exact-path`, preserving pure glob scope
  behavior for machine-readable metadata.
- `bun run habitat classify mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-floodplains/index.ts`
  reports `grit-domain-ops-boundary-imports` as `exact-path` and
  `grit-runtime-validation-imports` as `unresolved-metadata`, preserving the
  row without pretending the current prose-only scope is exact.
- `nx show project @civ7/adapter --json` reports targets `build`,
  `check`, and `nx-release-publish`.
- `nx show target @civ7/adapter:test` exits 1 because the target is not
  found.
- `nx show projects --with-target test --json` excludes
  `@civ7/adapter`, confirming the target absence through a second resolved Nx
  surface.
- A package inventory found four projects with no package `test` script:
  `@civ7/adapter`, `@civ7/types`, `@swooper/mapgen-viz`, and `civ-mod-dacia`.
- `nx show target mod-swooper-maps:test` resolves, proving the target
  exists for some classified project kinds.
- `nx show target @internal/habitat-harness:biome:ci` resolves,
  proving one workspace/Habitat gate exists.
- `nx --version` reports local Nx v22.7.5 in this worktree. Any
  sidecar claim that the active worktree is not an Nx workspace is invalid for
  this packet.
- `bun run habitat classify package.json` reports workspace-level gates and no
  project-local target.
- `nx g @internal/habitat-harness:project unsupported-mod-probe --kind=mod --dry-run`
  refuses before writes.
- `nx g @internal/habitat-harness:project misplaced-probe --kind=app --directory=packages/misplaced-app-probe --dry-run`
  refuses before writes because the `app` root contract is `apps/<name>`.
- `nx g @internal/habitat-harness:project generator-plugin-probe --kind=plugin --dry-run`
  plans only canonical plugin files under
  `packages/plugins/plugin-generator-plugin-probe/`.
- `nx g @internal/habitat-harness:project generator-foundation-probe --kind=foundation --dry-run`
  plans only canonical foundation files under
  `packages/generator-foundation-probe/`.
- `nx g @internal/habitat-harness:project generator-app-probe --kind=app --dry-run`
  plans only canonical app files under `apps/generator-app-probe/`.
- `nx g @internal/habitat-harness:project adapter --kind=foundation --dry-run`
  refuses before writes because `@civ7/adapter` already exists at
  `packages/civ7-adapter/package.json`.

## Official Documentation Evidence

- Nx official docs, captured in
  `docs/projects/habitat-harness/research/official-docs-nx.md`, support using
  resolved Nx project/target metadata as target proof. `nx show project`,
  `nx show projects --with-target`, and `nx show target` are documented
  command surfaces.
- Nx docs say inferred tasks come from plugins and tool config, and plugin
  order can affect target output. Habitat must not infer target existence from
  `targetDefaults`, tags, folder names, or static strings.
- Nx generator docs support local generators, dry-run file previews, file
  creation, and overwrite behavior. They do not prove Habitat-specific
  kind/root authority.
- Effect docs are relevant when implementation crosses external command
  orchestration, command provenance, service/runtime, scoped resource, retry,
  concurrency, or typed failure-channel boundaries. Official docs support
  Layers for service dependency graphs, typed expected errors, runtime-edge
  execution, scoped cleanup, and command data capture. Those capabilities must
  be evaluated when local TypeScript would otherwise rebuild them manually.

## Design Implications

1. Classify output must be resolved-metadata-backed.
2. Target absence must be represented as absence or unavailable state, not as a
   command to run.
3. Rule scope now stops implying exact path truth from owner name or partial
   prose scraping alone; rows with insufficient scan-root metadata stay visible
   as unresolved rather than exact.
4. Workspace/Habitat gates need separate presentation from project-local
   targets.
5. Generator support validates accepted kind/root/package/tag matrix before
   writes.
6. Unsupported-kind refusal is current behavior to preserve.
7. Mismatched kind/root acceptance is repaired for the supported uniform
   project generator contract.
8. Migration proof must distinguish no-op wiring from convention migration.
9. Classify implementation closure must consume command-surface repair evidence
   before claiming canonical command proof.
10. Effect is not a syntax preference. It becomes a substrate decision when
    classify/generator repair needs command proof orchestration, provenance,
    service substitution, cleanup scopes, retries, bounded concurrency, or
    tagged failure channels.

## Uncertainties

- Resolved Nx metadata implementation uses `@nx/devkit`
  `createProjectGraphAsync()` in-process. Native `nx show` commands remain the
  proof surface for command evidence.
- Exact classify output schema evolution requires implementation design:
  preserving backward-compatible fields may be possible, but exact-scope proof
  needs structured additions.
- Grit rule scan-root metadata is not yet complete, so exact path scope for many
  Grit rules depends on `habitat-grit-proof-repair` and pattern manifests.
- Root/dev/prod command-surface proof remains owned by
  `habitat-oclif-entrypoint-repair`.
- Whether structured Nx in-process metadata is enough for classify remains an
  implementation-time decision. If it is not enough, the Effect substrate
  decision becomes required before implementation closure.
- One earlier Nx sidecar local-workspace claim was invalidated because it came
  from the wrong checkout. The official-doc constraints remain useful, but
  current local proof comes from this worktree's `nx ...` probes.
- Generator scratch project discovery and generated target-matrix proof remain
  open. Current generator evidence proves dry-run output and fail-closed
  refusal, not Nx discovery after real scratch writes.
