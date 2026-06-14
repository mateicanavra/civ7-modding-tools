# Source Synthesis

**Change:** `habitat-classify-generator-repair`
**Owner:** DRA Habitat recovery owner

## Frame Carry-Forward

The takeover frame requires agents to classify before authoring and generated
structure to be supported rather than invented. The H8 recovery rows say the
current classify/generate surface is useful but overclaims target and generator
truth.

## Current Code Evidence

- `classifyPath` manually scans workspace roots for `package.json` instead of
  consuming resolved Nx project metadata.
- `projectTargets()` always emits `<project>:check` and `<project>:test`.
- `workspaceTargets()` emits fixed Habitat/Nx commands.
- `rulesInScope` includes every rule owned by the classified project plus every
  `@internal/habitat-harness` rule.
- `classifyTarget()` supports literal diffs and patch files by extracting
  changed paths and classifying each path.
- Project generator supports `plugin`, `foundation`, and `app`, refuses other
  kinds, writes package/config/source/test/README files, and accepts a
  directory override.
- Pattern generator remains separately governed by
  `habitat-pattern-generator-metadata-repair`.
- Current migration metadata declares a no-op migration, which proves wiring
  only.

## Fresh Command Evidence

- `bun run habitat classify packages/civ7-adapter/src/index.ts` reports
  `@civ7/adapter:check` and `@civ7/adapter:test`.
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
  plans files under `packages/`, showing kind/root mismatch is not refused yet.

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
3. Rule scope must stop implying exact path truth from owner name alone.
4. Workspace/Habitat gates need separate presentation from project-local
   targets.
5. Generator support must validate accepted kind/root/package/tag matrix before
   writes.
6. Unsupported-kind refusal is current behavior to preserve.
7. Mismatched kind/root acceptance is a repair target.
8. Migration proof must distinguish no-op wiring from convention migration.
9. Classify implementation closure must consume command-surface repair evidence
   before claiming canonical command proof.
10. Effect is not a syntax preference. It becomes a substrate decision when
    classify/generator repair needs command proof orchestration, provenance,
    service substitution, cleanup scopes, retries, bounded concurrency, or
    tagged failure channels.

## Uncertainties

- Exact implementation API for resolved Nx metadata remains to be selected:
  command-backed `nx show` proof, structured Nx project graph APIs, or a
  Habitat metadata adapter.
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
