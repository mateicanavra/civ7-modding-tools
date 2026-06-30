# G-HOST Code/Vendor Topology Review

Reviewer lane: code/vendor topology adversary for `deep-habitat-host-policy-boundary-gate`.

Verdict: **BLOCKED**.

Reason: the packet points in the correct direction, but it still leaves host-specific path/gate ownership, apply-root selection, and test ownership to implementation inference. That hits the explicit stop condition for this lane and the remediation frame requirement that implementation agents receive concrete write sets, protected paths, proof classes, and validation commands before source work starts.

## P1 Findings

### P1: G-HOST does not define the declaration set D10/D2 need to consume

The source packet says G-HOST must define a host declaration/refusal contract for generated/protected zones, host-specific regeneration commands, pattern-specific apply gates, unsupported host-owned kinds, and non-claims. The OpenSpec packet turns that into underspecified statements such as "Define host policy declaration and refusal boundary" and "Move Civ/MapGen-specific assumptions out of generic Habitat authority", but it never records the concrete declaration rows.

Current host-owned generated/protected data is not abstract; it is already visible:

- `generated-zones.ts` defines three generated-zone declarations in generic source: `swooper-map-generated` at `mods/mod-swooper-maps/src/maps/generated/`, `civ7-types-generated` at `packages/civ7-types/generated/`, and `civ7-map-policy-tables` at `packages/civ7-map-policy/src/civ7-tables.gen.ts`.
- `rules.json` has matching file-layer rules at `file-layer-swooper-map-generated`, `file-layer-civ7-types-generated`, and `file-layer-civ7-map-policy-tables`.
- `verify-generated-zones.mjs` covers additional Swooper generated artifacts: `mods/mod-swooper-maps/mod/config`, `mods/mod-swooper-maps/mod/swooper-maps.modinfo`, and `mods/mod-swooper-maps/mod/text/en_us/MapText.xml`.
- `plugin.js` defines the `generated:check` target with Swooper and map-policy inputs plus dependencies on `@swooper/mapgen-core:build` and `@civ7/map-policy:verify`.

D2 already says `generatedZone` must become a `ProtectedZoneReference` to G-HOST/D10 declarations, and D10 already says missing G-HOST declarations block host-owned closure. G-HOST must therefore name the host declaration rows D10 consumes: host owner, zone id, matcher, generated/protected/host-owned surface kind, regeneration command or external workflow, allowed authority lane, recovery instruction, non-claims, and missing/malformed/conflict refusal shape.

Required repair: add a concrete G-HOST host declaration matrix for the current observed host-policy surface. Do not leave the declaration file location, row shape, owner names, or missing-host-policy behavior to D10/D13 implementation.

### P1: Apply-gate ownership and root selection remain implementation-inferred

The packet names "pattern-specific apply gates" but does not inventory the live gate topology. Current `grit-apply.ts` has host-coupled roots and validations:

- Apply patterns are hard-coded as `.habitat/patterns/active/apply/deep_import_to_public_surface.md` and `.habitat/patterns/active/apply/docs_local_checkout_paths_rewrite.md`.
- Source apply roots are discovered from `mods/*/src/{recipes,maps}`.
- Docs apply roots are not `docs/`; they are Markdown files under `docs` whose text includes `/docs/`, `.md`, and an absolute Unix-style checkout prefix.
- Post-apply validation parses `@mapgen/domain/<domain>/ops` imports and resolves public ops targets under `mods/mod-swooper-maps/src/domain/<domain>/ops.ts` or `mods/mod-swooper-maps/src/domain/<domain>/ops/index.ts`.
- `grit-apply.test.ts` proves these roots, output modes, isolated-copy checks, type-only import preservation, missing-export refusal, rollback, and selected gate behavior.

That public-ops target validation is MapGen host semantics inside a generic transaction module. It is not merely Grit output parsing. G-HOST must decide whether this is a host declaration, a D9 transaction path-authority projection, a D8 pattern-governance input, or a MapGen-owned rule/gate outside generic Habitat. The current OpenSpec packet leaves that decision to the executor.

Vendor boundary note: official Grit docs support explicit `grit apply <PATTERN> [PATHS]...` path arguments and `--dry-run`, but they do not specify a stable dry-run output schema or full no-write guarantee. The existing repo research cites the official URL `https://docs.grit.io/cli/reference` for that claim. Therefore G-HOST should prefer repo-owned path declarations plus local transaction proof over assuming Grit itself owns Habitat's host policy.

Required repair: add an apply-gate matrix covering each current apply pattern, source roots, docs roots, expected write set, protected set, host owner, native-tool owner, validation owner, and non-claims. If MapGen public-ops export validation remains, name it as host policy consumed by D9 or move it explicitly outside generic Habitat authority.

### P1: Validation gates do not falsify missing host policy, staged protection, or apply-root drift

The current G-HOST validation gates are:

- `bun run habitat classify mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json`
- `bun run openspec -- validate deep-habitat-host-policy-boundary-gate --strict`
- `bun run openspec:validate`
- `git diff --check`

Those gates do not exercise the current host-policy enforcement surfaces. They do not cover staged generated-zone refusals, unknown generated-zone reference refusal, missing host declaration refusal, `generated:check` target metadata, Grit apply root selection, docs apply roots, public ops export validation, or project-generator refusal of unsupported host-owned shapes. The source packet's stronger proof template named `generated-zones.test.ts` and `grit-apply.test.ts`, but the first file does not exist in this worktree. The live tests are `test/lib/grit-apply.test.ts`, `test/lib/hooks.test.ts`, `test/lib/classify.test.ts`, and `test/generators/project-generator.test.ts`, plus a missing focused unit seam for generated-zone declarations.

Required repair: replace the current validation list with design-time and later-implementation gates that name exact commands, expected status, cache/freshness stance, and non-claims. Required later gates include a focused generated/protected declaration test suite, staged `habitat check --staged --tool file-layer --json` clean and injected-bad cases, `nx show target @internal/habitat-harness:generated:check --json` or accepted successor, `nx run @internal/habitat-harness:generated:check`, `grit-apply.test.ts`, and generator refusal tests for unsupported host-owned project kinds.

## P2 Findings

### P2: G-HOST risks claiming generic ownership over existing native/repo declarations

The repo already uses native and repo-declared mechanisms that should stay authoritative for their layer:

- Nx owns target resolution, dependencies, cache flags, inputs, and target metadata through `nx.json` and the Habitat `createNodesV2` plugin.
- Biome owns formatting/lint hygiene and excludes the three generated surfaces in `biome.json`.
- Grit owns pattern syntax, ignore behavior, and explicit scan/apply path arguments, with `.gritignore` excluding the three generated surfaces.
- Git owns staged path identity.
- Habitat file-layer/D10 owns protected mutation decisions, not drift freshness.

G-HOST should not introduce a parallel generic policy engine that duplicates these native declarations. Its correct role is host-policy data and refusal states consumed by D10/D9/D13, with projections into native-tool wrappers where needed.

Required repair: add a native-tool boundary table to G-HOST. For every current host-coupled path, identify whether source truth remains in host declaration, Nx target metadata, Biome config, Grit ignore/apply pattern, Git staged state, D10 protected mutation projection, or D9 transaction projection.

### P2: Generator refusal surfaces are already concrete and should not be generalized into host semantics

The project generator supports only `plugin`, `foundation`, and `app`; it refuses `mod`, `engine`, `control`, `adapter`, `sdk`, and `tooling` before writes. Tests prove refusal before any generated files are written. This is a project creation/refusal contract, not evidence that generic Habitat understands MapGen or Civ7 authoring.

G-HOST currently lists "unsupported host-owned project, generator, or authoring kinds" in the source packet contract, but the OpenSpec packet does not separate existing uniform-project creation refusals from future MapGen authoring topology. That risks turning current Civ7 taxonomy terms into a generic host-policy model.

Required repair: state that current project-generator unsupported-kind refusals are D13/D14-facing project creation facts consumed by G-HOST only when they need host-policy recovery wording. Do not require G-HOST to infer or author MapGen recipe/domain/op/stage/step semantics.

## P3 Findings

### P3: Prompt/input authority includes a stale generated-zone test path

The requested file `tools/habitat-harness/test/lib/generated-zones.test.ts` is absent. The live adjacent surfaces are:

- `tools/habitat-harness/src/lib/generated-zones.ts`
- `tools/habitat-harness/scripts/verify-generated-zones.mjs`
- `tools/habitat-harness/src/rules/rules.json`
- `tools/habitat-harness/test/lib/grit-apply.test.ts`
- `tools/habitat-harness/test/lib/hooks.test.ts`
- `tools/habitat-harness/test/lib/classify.test.ts`
- `tools/habitat-harness/test/generators/project-generator.test.ts`

This is not a source blocker by itself, but G-HOST should not cite the nonexistent test as a validation gate. It should call out the missing focused generated-zone unit test as an implementation test obligation or cite D10's accepted replacement test plan.

## Exact Surfaces Discovered

Current host-specific generated/protected set:

| Surface | Current source | Owner force |
| --- | --- | --- |
| `mods/mod-swooper-maps/src/maps/generated/` | `generated-zones.ts`, `rules.json`, `biome.json`, `.gritignore`, `nx.json`, `plugin.js`, `verify-generated-zones.mjs` | Host Swooper/MapGen generated output; D10 guard consumes G-HOST declaration; Nx/Biome/Grit keep native config mirrors. |
| `packages/civ7-types/generated/` | `generated-zones.ts`, `rules.json`, `biome.json`, `.gritignore` | External Civ7 resources workflow; G-HOST must not invent regeneration in generic Habitat. |
| `packages/civ7-map-policy/src/civ7-tables.gen.ts` | `generated-zones.ts`, `rules.json`, `biome.json`, `.gritignore`, `plugin.js` | Map-policy generated table; generator/verifier belongs to `@civ7/map-policy`, not generic Habitat. |
| `mods/mod-swooper-maps/mod/config`, `mods/mod-swooper-maps/mod/swooper-maps.modinfo`, `mods/mod-swooper-maps/mod/text/en_us/MapText.xml` | `verify-generated-zones.mjs`, `plugin.js` inputs | Generated drift/freshness surfaces, not staged hand-edit zone rows yet. G-HOST/D10 must decide whether these become declarations or remain drift-only. |
| `.civ7/`, `.git/`, `.habitat/cache/patterns/`, `dist/`, `node_modules/`, `tools/habitat-harness/dist/` | `grit.ts` protected scan-root prefixes | Generic/protected infrastructure roots for Grit scan-root refusal; do not recast these as Civ7 host declarations except `.civ7/` where resource ownership is host-specific and already routed by docs/process. |
| `pnpm-lock.yaml`, `pnpm-workspace.yaml` | `rules.json` `forbiddenFileNames` | File-layer forbidden artifact policy, not generated-zone or host-policy semantics. |

Current host-coupled constants and consumers:

| File/surface | Coupling | Consumers |
| --- | --- | --- |
| `tools/habitat-harness/src/lib/generated-zones.ts` | Zone ids, path matchers, recovery text, staged Git name-status reader. | `rules/architecture.ts`, `grit.ts`, file-layer checks. |
| `tools/habitat-harness/src/rules/rules.json` | File-layer rows link to `generatedZone` ids; human prose carries host commands. | `architecture.ts`, `command-engine.ts`, `plugin.js`, classify, reports. |
| `tools/habitat-harness/src/plugin.js` | `OWNER_ROOTS`, `generated:check` target inputs/dependencies, file-layer aliases to `generated:check`. | Nx graph and classify target behavior. |
| `tools/habitat-harness/scripts/verify-generated-zones.mjs` | Swooper map artifact paths and generator command; snapshot/restore behavior. | `generated:check` target. |
| `tools/habitat-harness/src/lib/grit.ts` | Swooper scan roots, ignored Swooper tests, protected prefixes, generated zone import. | Grit check root validation and scan-root refusal. |
| `tools/habitat-harness/src/lib/grit-apply.ts` | Apply pattern paths, `mods/*/src/{recipes,maps}` roots, docs local checkout rewrite roots, MapGen public ops export validation. | `habitat fix`, D9 transaction future, `grit-apply.test.ts`. |
| `tools/habitat-harness/src/generators/project/generator.cjs` | `@civ7` package naming and refused non-uniform kinds. | Nx generator and project-generator tests; D13/D14 refusal consumers. |

Likely test ownership:

| Test surface | What it should prove |
| --- | --- |
| Focused generated/protected declaration tests under `tools/habitat-harness/test/lib/` | Known declarations, missing declaration, malformed declaration, overlap/conflict, unknown zone reference, host unavailable, recovery/non-claims. |
| `tools/habitat-harness/test/lib/grit-apply.test.ts` | Apply root selection, isolated-copy proof, public ops export validation, rollback, selected gate failure, no source-tree write during dry-run proof. |
| `tools/habitat-harness/test/lib/hooks.test.ts` | File-layer refusal stops before Biome, Grit, generated publish, or resource publish. |
| `tools/habitat-harness/test/lib/classify.test.ts` | Host-owned generated paths classify to the right project/rules/targets without inventing unavailable targets. |
| `tools/habitat-harness/test/generators/project-generator.test.ts` | Unsupported host-owned project kinds refuse before writes; supported uniform kinds stay scaffolded. |
| Native target inspection | `generated:check` resolves on `@internal/habitat-harness`, is `cache: false`, and has explicit child dependencies; this is Nx metadata proof, not generated freshness. |

## Validation Gates To Require

Design-time:

- `bun run openspec -- validate deep-habitat-host-policy-boundary-gate --strict` expected exit `0`.
- `bun run openspec:validate` expected exit `0`.
- `git diff --check` expected exit `0`.
- Wording/topology audit over G-HOST packet artifacts verifying no host path/gate/root/test ownership is left to implementation inference.

Later implementation:

- `bun run --cwd tools/habitat-harness test -- test/lib/grit-apply.test.ts test/lib/hooks.test.ts test/lib/classify.test.ts test/generators/project-generator.test.ts` expected exit `0` after host-policy fixtures land.
- Add and run focused generated/protected declaration tests; do not cite nonexistent `test/lib/generated-zones.test.ts` until created.
- `bun run habitat check --staged --tool file-layer --json` for clean staged state and injected staged mutations under each declared generated/protected/forbidden surface; expected clean exit `0` and injected exit `1`.
- `nx show target @internal/habitat-harness:generated:check --json` or accepted successor; expected metadata records `cache: false`, command, inputs, and child dependencies.
- `nx run @internal/habitat-harness:generated:check --outputStyle=static`; expected exit `0` only as drift/freshness observation, not mutation authorization.
- Inject one unregistered host policy and prove generic Habitat refuses to interpret it as built-in truth.

## Lane Verdict

Accepted facts:

- G-HOST is the right boundary concept for host-specific path data, regeneration actions, and missing-host-policy refusals.
- Generic Habitat must not treat Civ7/MapGen paths as universal toolkit behavior.
- D10/D2/D9/D13 are already framed to consume G-HOST rather than own host semantics.

Blocked:

- G-HOST is not accepted for design/specification yet. It must first record the concrete host declaration matrix, apply-gate/root matrix, native-tool boundary table, and validation/test ownership matrix. Until then, D10/D13/D9 source implementation cannot safely consume host policy without recreating the design locally.

Skills used: domain-design, information-design, system-design, solution-design, testing-design, typescript-refactoring.
