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

Every domino should reduce future states. A scan or ledger is not progress by
itself; it only counts inside a vertical slice that also moves or deletes
authority, rewires callers, proves behavior, and leaves fewer places for policy
to hide.

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
  `tools/habitat` owns Toolkit execution mechanics.

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
- Preserved the existing check set; did not redesign check semantics in this
  slice.
- Kept `_self/triage` excluded from default execution.

What this proved:

- A single rule can run through `habitat check --rule <id>`.
- A curated package group can run through Habitat without hard-coded `.habitat`
  script paths in package scripts.
- `mods/mod-swooper-maps` architecture static guardrails run through Habitat.
- Existing package scripts retain their prior behavioral scope.

What this did not prove:

- Plain `habitat check` / graph-wide `nx run-many -t habitat:check` full-suite execution remains
  broken and should not be treated as a known-good aggregate.
- Root/package lint aliases should collapse into package-level `lint` scripts.
  Profiled non-lint callers such as `ci:architecture-strict-core` may still
  exist when they preserve an explicit environment profile while routing
  through Habitat.
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

Plain `habitat check` / graph-wide `nx run-many -t habitat:check` is not
currently a trustworthy aggregate. It still tries to run the accumulated default rule universe through
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

### 12. Package Script Cleanup

Goal: remove obvious lint/check/structure authority from root and package
`package.json` surfaces by moving simple enforcement scripts into `.habitat`
and rewiring callers through `habitat check --rule ...`.

This is a cleanup domino, not an audit domino. The deliverable is less cruft:
fewer package scripts that act like policy, fewer direct script paths, and
fewer duplicate enforcement surfaces.

What this domino should do:

- Walk every root/package `package.json` script once.
- For every clearly simple lint/check/structure script:
  - if it already has a Habitat rule, rewire the caller to
    `habitat check --rule ...`;
  - if it is a standalone script that should be Habitat-owned, move it into the
    appropriate `.habitat/<niche>/_self/check/<packet>/` packet, register it,
    add an empty or existing baseline as appropriate, and route it through
    `habitat check --rule ...`;
  - if it is redundant after a Habitat route exists, remove the alias instead
    of keeping a shadow policy name.
- Leave package-local operational workflows in place when they run product
  behavior, builds, dev servers, generated-output refresh, or tool-required
  package checks.
- Leave scripts whose authority is embedded in tests for the next domino. Do
  not partially extract those in this pass.
- Avoid broad `habitat check`; use curated `--rule` calls only.

Acceptance shape:

- No root/package script directly invokes `.habitat/**/<packet>.check.*` when a
  registered rule can be called.
- Any simple package-visible lint/check script that belongs to Habitat is moved
  fully into a Habitat check packet and made runnable by rule ID.
- Package scripts that remain are clearly operational, tool-required, package
  test entrypoints, or short aliases into Habitat/Nx.
- The changed root/package scripts are verified directly.
- The worktree is clean and committed.

Scope guard:

- Do not create a classification ledger as a substitute for moving or deleting
  script authority.
- Do not migrate authority embedded inside test files or broad package test
  suites.
- Do not repair underlying rule violations such as strict domain-refactor
  guardrail findings here.
- Do not rely on broad `habitat check` as proof.
- Do not redesign full-suite runner discovery in this slice.

## Planned Dominoes

### 13. Embedded Hidden Authority Migration

Goal: extract structural authority that is still baked into package tests or
other embedded locations, one vertical cluster at a time.

This is separate from package script cleanup because these checks are not simple
script moves. They require reading the test oracle, splitting structure from
runtime/product behavior, migrating only the structural authority, and then
deleting or narrowing the original test.

First likely cluster: MapGen authoring-surface authority.

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

Later embedded clusters:

- Studio/server static authority, such as daemon deploy isolation, watch
  ignores, Nx dev runner shape, and one-mount structure.
- Core/platform public-surface authority, such as MapGen core purity,
  intelligence bridge package shape, and direct-control public API boundaries.

Scope guard:

- Move structural authority into Habitat.
- Keep runtime behavior, product correctness, dev-server behavior, generated
  bundle proof, and integration behavior package-local.
- Delete or narrow the original test only after Habitat has parity for the
  migrated structural oracle.
- Use transitional scripts only where Grit/source-check is not yet viable.

### 14. Full-Suite Runner Rebuild

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

Why this comes after package-script cleanup and at least one embedded migration:

The runner should be rebuilt around a smaller, cleaner caller surface and a
proven set of migrated packets. Rebuilding it before removing obvious package
script cruft risks preserving compatibility for states that should disappear.

### 15. Sift, Rename, And Reclassify Packets

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

### 16. Blueprint Model Design

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

### 17. Toolkit Simplification And Service-Model Cleanup

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

1. Scan root/package `package.json` files for lint/check/structure scripts.
2. Move or rewire only the obvious simple Habitat authority.
3. Delete redundant aliases where the Habitat route replaces them.
4. Leave operational scripts and embedded-test authority alone.
5. Verify changed callers directly; do not use broad `habitat check` as the
   acceptance proof.
