# Habitat Dominoes

Status: working sequence ledger

This document records the current ratchet sequence for Habitat authority work.
It is not a full roadmap and should not become an exhaustive backlog. Each
domino is a concrete move that makes the next move simpler or more obvious.

The current priority is authority content and package integration. Deep Habitat
Toolkit redesign is a separate effort unless a narrow Toolkit fix is required
to keep the authority ratchet moving.

## Sequence Rule

Prefer the next irreversible, testable integration move over broad redesign.
When a domino lands, reassess the tree and runner surface before committing to
the next one.

Do not use this sequence to justify speculative ontology work. Ontology and
resolver design should only harden after the gathered authority content proves
the need.

## Completed Dominoes

### 1. Recover The Normative Frame

Outcome: Habitat is the authority tree for repo structure and policy. The core
frame is allowlist-first pattern definition, followed by burn-down against those
patterns.

What landed:

- Preserved runtime/context work as the good foundation from the earlier
  Toolkit effort.
- Rejected broad implementation improvisation as the wrong mode for the current
  phase.
- Established that `.habitat` owns authored authority content while
  `tools/habitat-harness` owns Toolkit execution mechanics.

### 2. Gather Baked-In Authority Content

Outcome: patterns, rule records, baselines, scripts, and related enforcement
assets were pulled out of scattered package/tool locations and collected under
`.habitat`.

What landed:

- Consolidated rule-like assets from package-local and Toolkit-local surfaces.
- Kept operational product/runtime scripts with their consumers when they are
  not Habitat-scoped linting, fixing, generation, migration, or checking.
- Recorded compatibility debt instead of blocking the content move on complete
  runner integration.

### 3. Co-Locate Rule Packets By Subject

Outcome: the first gathered authority corpus was reorganized from type buckets
into packet folders, one folder per gathered authority handle.

What landed:

- Moved `rule.json`, matching pattern Markdown, baselines, apply/check scripts,
  and same-subject loose scripts together.
- Established packet-level co-location as the transition shape before final
  ontology.
- Avoided early niche grouping during the co-location pass.

### 4. Establish Shallow Niche Jurisdictions

Outcome: packets were moved into a first-pass niche hierarchy based on durable
jurisdiction rather than runner type, file type, rule ID, or current defect
name.

Current niche model:

- `global/repository`
- `habitat/toolkit`
- `docs/content`
- `docs/projects`
- `docs/site`
- `civ7/resources`
- `civ7/platform`
- `civ7/mapgen/core`
- `civ7/mapgen/pipeline`
- `civ7/mapgen/studio`

What landed:

- Removed bad niche labels that described artifact classes instead of
  jurisdictions.
- Introduced `civ7/resources` for official-resource-derived generated
  projections.
- Kept MapGen pipeline special cases such as ecology and placement as packet
  names, not niche names.

### 5. Normalize Rule Packet File Names

Outcome: rule-owned files were normalized to a consistent dot-pattern inside
each packet.

What landed:

- `<rule>.rule.json`
- `<rule>.pattern.md`
- `<rule>.baseline.json`
- transitional scripts such as `<rule>.check.mjs` or `<rule>.check.sh`

This was a mechanical legibility pass, not a final support-artifact ontology.

### 6. Separate Mutating Operations From Read-Only Checks

Outcome: obvious mutating preflight helpers were split away from Habitat
`check` packets, and package-local ensure/build workflows were kept with their
consumers.

What landed:

- Read-only Habitat checks for currentness/shape where appropriate.
- Package-local ensure scripts for workflows that build or refresh product
  outputs.
- Provisional docs operations for fix/generate behaviors without pretending
  they are read-only checks.

### 7. Migrate First MapGen Static Guardrail Batch

Outcome: the clearest package-local static/source-shape architecture tests were
moved into Habitat-owned check packets.

What landed:

- Transitional `command-check` packets for MapGen static guardrails that still
  need script-based execution.
- Deleted fully migrated package tests where Habitat had parity.
- Package scripts still call direct `.habitat` script paths as a temporary
  bridge because the Habitat runner still has path/discovery debt.

Important boundary:

- Runtime/product behavior tests stayed package-local.
- Broad wrapped package-test execution was not reintroduced as the Habitat
  model.

### 8. Define Artifact Kinds

Outcome: `.habitat/ARTIFACT-KINDS.md` captured the current top-level executable
artifact kinds and mutability rules.

Current kinds:

- `check`: read-only evaluation.
- `fix`: idempotent repair of existing authored files.
- `generate`: materialization of declared generated or scaffolded outputs.
- `migrate`: intentional transition from one accepted authored shape to
  another.

What intentionally did not land:

- support-artifact ontology;
- implementation adapter schema;
- blueprint structure;
- final resolver metadata.

### 9. Define The Authority Tree Shape

Outcome: `.habitat/AUTHORITY-TREE-SHAPE.md` recorded the current jurisdiction
model.

Current rule:

```text
.habitat/<niche>/_self/<kind>/<packet>/
```

Key decisions:

- Niche is jurisdiction.
- `_self` separates exact-niche packets from child niches.
- Artifact kind is below `_self`, not the primary domain axis.
- Blueprint is a future executable/enforceable model inside a niche, not the
  same thing as a niche.

### 10. Flatten The Authority Tree

Outcome: all current packets were moved out of provisional `boundaries`,
`structure`, `capabilities`, and `contracts` buckets into the `_self/<kind>`
shape.

What landed:

- 56 packets under `_self/check`.
- 1 packet under `_self/fix`.
- 1 packet under `_self/generate`.
- 7 unsettled Toolkit packets under `_self/triage`.
- No old layer buckets remain.

Current semantic review:

- The tree holds together.
- Niches read as authored jurisdictions.
- `_self` makes artifact packets visibly distinct from child niches.
- `habitat/toolkit/_self/triage` is intentionally murky and should remain so
  until admission/resolver design is addressed.

### 11. Bridge Package Scripts Through Habitat Check

Goal: packages should run Habitat-owned checks through the Habitat command
surface instead of calling `.habitat/.../*.check.*` directly.

Status: landed as `agent-DRA-habitat-check-runner-bridge`.

What landed:

- Fixed the narrow async registry fallback issue that prevented selected
  checks from reaching the flattened authority-tree rule-pack index.
- Added repeatable `--rule` selection so package scripts can run curated rule
  groups through `habitat check --rule <id> --rule <id>`.
- Added command-check runner inference for direct packet-local `.mjs`, `.sh`,
  and `.py` detects.
- Rewired the MapGen static guardrail package scripts through Habitat command
  invocations.
- Rewired the root strict domain-refactor guardrail alias through Habitat while
  preserving its existing environment profile.
- Preserve the existing check set; do not redesign check semantics in this
  slice.
- Keep `_self/triage` excluded from default execution.

What this proved:

- A single rule can run through `habitat check --rule <id>`.
- A curated package group can run through Habitat without hard-coded `.habitat`
  script paths in package scripts.
- `mods/mod-swooper-maps` architecture static guardrails run through Habitat.
- Existing package scripts retain their prior behavioral scope.

What this did not prove:

- Plain `habitat check` / `bun run habitat:check` full-suite execution remains
  broken and should not be treated as a known-good aggregate.
- Long root/package aliases such as
  `lint:domain-refactor-guardrails:strict-core` may still exist as caller
  profiles even when they now route through Habitat. Those aliases are not final
  authority; they are script-surface debt.
- Existing rule violations, including the strict domain-refactor guardrail
  failure, remain policy burn-down work after the runner bridge reaches the
  rule.

## Known Runner Debt

### Full-Suite `habitat check`

The selected-rule path and the full-suite path are now intentionally separated
in the working model.

`habitat check --rule <id>` is the proven bridge. It uses explicit rule
selection, resolves a curated packet set, applies baselines, and can support
package scripts while the broader runner is being redesigned.

Plain `habitat check` / `bun run habitat:check` is not currently a trustworthy
aggregate. It still tries to run the accumulated default rule universe through
old assumptions about registry shape, artifact admission, packet identity,
default inclusion, and error reporting. The observed `Internal Server Error`
is not a surprise and should not be papered over as a one-off bug.

Current direction: treat full-suite execution as a likely scrap-and-rebuild
surface. The rebuild should start from the flattened authority tree:

- discover executable packets from `.habitat/**/_self/<kind>/<packet>/`;
- infer niche, artifact kind, and packet identity from the path;
- exclude `_self/triage` from default execution;
- refuse unknown, stale, or not-yet-admitted packets with explicit selector or
  admission diagnostics;
- report per-packet failures directly, not as generic service errors;
- preserve curated `--rule` execution as the compatibility bridge while this is
  rebuilt.

Do not let the broken full-suite path drive the authority ontology. The current
Toolkit internals are overfit to earlier shapes and should not be used as proof
that the flattened model is wrong.

## Active Next Domino

### 12. Package Script Surface Consolidation

Goal: remove rogue lint/check/architecture authority from package scripts as a
caller surface, without deleting package-local tests that still contain
unmigrated authority.

This is the next cleanup domino before deeper Toolkit redesign. It fits the
current ratchet because package scripts are now able to call curated Habitat
rules through `habitat check --rule`, and the remaining script surface is
mostly a routing and classification problem.

What this domino should do:

- Inventory all root and package `package.json` scripts that look like lint,
  check, architecture, guardrail, contract, boundary, generated, manifest, or
  schema enforcement.
- Classify each script as:
  - Habitat-routable authority already represented by one or more rule IDs;
  - hidden authority still baked into package tests or package-local scripts;
  - operational product/runtime workflow that should remain with its consumer;
  - graph/tool-required script that must stay where a tool such as Nx, ESLint,
    or TypeScript expects it.
- Replace explicit package/root enforcement wrappers with
  `habitat check --rule ...` when the authority is already represented in
  `.habitat`.
- Keep short convenience aliases only when they are clearly caller profiles,
  not independent sources of policy.
- Record hidden package-test authority as candidates for later migration rather
  than deleting those tests.
- Avoid routing through plain `habitat check` until the full-suite path is
  rebuilt.

Acceptance shape:

- No package script calls a Habitat packet-local script path directly when a
  registered rule ID exists.
- Long, specific lint/check aliases are either removed, shortened to clear
  Habitat caller aliases, or explicitly recorded as profile debt.
- Package tests containing structural authority are identified and queued for
  extraction instead of silently preserved or removed.
- Operational scripts remain with their consumers, especially when they run
  product workflows rather than Habitat authority.
- The worktree proves the updated callers through targeted package/root script
  commands.

Scope guard:

- Do not migrate the next batch of hidden package-test authority inside this
  domino unless it is a trivial already-admitted rule selection change.
- Do not repair underlying rule violations such as strict domain-refactor
  guardrail findings here.
- Do not rely on broad `habitat check` as proof.
- Do not redesign full-suite runner discovery in this slice.

## Planned Dominoes

### 13. Full-Suite Runner Rebuild

Goal: replace the broken plain `habitat check` aggregate with a runner that
understands the flattened authority tree directly.

Expected direction:

- Discover executable packets from:
  - `.habitat/**/_self/check/*/`
  - `.habitat/**/_self/fix/*/`
  - `.habitat/**/_self/generate/*/`
  - `.habitat/**/_self/migrate/*/`
- Infer niche from the path before `_self`.
- Infer kind from the directory below `_self`.
- Infer packet identity from the directory below kind.
- Exclude `_self/triage` from default execution.
- Avoid metadata declarations for facts already recoverable from the tree.
- Preserve selected-rule execution as the compatibility path.
- Produce explicit admission, selector, and packet execution diagnostics instead
  of generic `Internal Server Error` failures.

Why this comes after script-surface consolidation:

Script consolidation reduces the caller surface first. Full-suite rebuild is
larger and easier to overbuild if done before the repo stops depending on
package-local lint/check wrappers as implicit policy.

### 14. Authoring-Surface Hidden Authority Batch

Goal: migrate the next obvious cluster of MapGen authoring-surface authority
from package tests into Habitat-owned packets.

Candidate sources:

- `mods/mod-swooper-maps/test/config/standard-authoring-surface-guards.test.ts`
- `mods/mod-swooper-maps/test/config/standard-recipe-artifact-guards.test.ts`
- `apps/mapgen-studio/test/config/defaultConfigSchema.test.ts`
- `apps/mapgen-studio/test/config/standardRecipeArtifactGuards.test.ts`

Likely authority:

- MapGen authoring contracts.
- Generated recipe artifact shape.
- Public schema surface shape.
- Standard stage topology/public authoring model.

Scope guard:

- Genericize only where the parent niche makes that natural.
- Keep runtime behavior, product correctness, and generated bundle proof
  package-local.
- Use transitional scripts only where Grit/source-check is not yet viable.

### 15. Studio And Server Structural Authority Batch

Goal: extract static Studio/server authority from tests that currently mix
structure with runtime/dev-server behavior.

Candidate sources:

- `daemonDeployIsolation.test.ts`
- `watchIgnores.test.ts`
- `nxDevRunner.test.ts`
- `oneMount.test.ts`

Likely split:

- Move static path/config/process-boundary assertions into Habitat.
- Keep dev-server behavior, UI behavior, runtime proof, and integration
  behavior package-local.

### 16. Core And Platform Public-Surface Authority Batch

Goal: migrate broader package/API boundary authority after MapGen and Studio
patterns prove the bridge and resolver.

Candidate sources:

- `packages/mapgen-core/test/architecture/core-purity.test.ts`
- `mods/mod-civ7-intelligence-bridge/test/controller-mod-package.test.ts`
- `packages/civ7-direct-control/test/public-api.test.ts`

Scope guard:

- Treat these as API/package-boundary authority, not MapGen authoring-surface
  work.
- Do not mix this batch into the MapGen authoring batch.

### 17. Sift, Rename, And Reclassify Packets

Goal: after the runner bridge and two or three migrated clusters exist, do a
semantic reclassification pass on packet names, niche placement, and artifact
kind assignment.

Questions to resolve then:

- Which packets are real checks versus future migrations, fixes, generators, or
  package-local tests?
- Which packets should be renamed from defect-shaped names to broader authority
  concepts?
- Which packets should move from parent niches into proven child niches such as
  future `pipeline/recipes` or `pipeline/stages`?
- Which Toolkit triage packets should be admitted, split, or removed?

Why not now:

Before more execution evidence exists, renaming and reshaping risks encoding a
theory instead of observed structure.

### 18. Blueprint Model Design

Goal: define blueprint as the executable/enforceable unit inside a niche.

Current direction:

- Niche remains jurisdiction.
- Blueprint becomes a designed model for creating, maintaining, or evolving a
  class of thing.
- A niche may contain multiple blueprints.

Open examples:

- stage blueprint;
- recipe blueprint;
- contract blueprint;
- map projection blueprint;
- service module blueprint.

Scope guard:

- Do not collapse niche into blueprint.
- Do not force current artifact packets to become blueprint directories until
  the model is proven.

### 19. Toolkit Simplification And Service-Model Cleanup

Goal: return to the Habitat Toolkit itself after authority content and command
integration have stabilized.

Known concern:

The current Toolkit internals remain over-engineered. Some validation scripts
and service-model concepts are wrong or too precise. They should not drive the
authority ontology.

Likely future cleanup:

- Simplify resolver/admission primitives.
- Retire transitional `command-check` junk-drawer behavior where possible.
- Replace AST-ish schema validation scripts with proper validators or remove
  them when they are not Habitat authority.
- Preserve the runtime/context foundation that has already proven useful.

This is intentionally later. The current ratchet is authority content first,
then package command integration, then resolver alignment.

## Current Hand-Off

The next implementation context should start with Domino 12:

1. Inventory lint/check/architecture-like scripts in root and package
   `package.json` files.
2. Classify each as Habitat-routable authority, hidden package-test authority,
   operational workflow, or hard tool-location constraint.
3. Rewire already-admitted authority through curated
   `habitat check --rule ...` calls.
4. Queue hidden package-test authority for later migration instead of deleting
   it.
5. Verify the updated caller scripts directly; do not use broad
   `habitat check` as the acceptance proof.
