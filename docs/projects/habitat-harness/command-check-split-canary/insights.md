# Command-Check Split Canary Insights

Status: implementation notes for the first vertical split canary.

## Baseline

- `prohibit_cross_op_runtime_calls` passed as `command-check`.
- `require_public_ecology_surfaces_and_retired_topology_removal` passed as `command-check`.
- `ensure_docs_checkout_paths_are_portable` returned `advisory-findings` with `ok: true` as `command-check`.
- `prohibit_runtime_orchestration_helpers_in_domain_ops` passed as `grit-check` and already owned the `ops.bind` / `runValidated` predicate.

## Slice Results

### `prohibit_cross_op_runtime_calls`

The command script mixed two assertions: cross-op module-source reach and local orchestration helper calls. The cross-op source reach was already expressed in the packet pattern, so the rule record moved to `grit-check`. The local orchestration helper scan was deleted as duplicate because `prohibit_runtime_orchestration_helpers_in_domain_ops` already owns that exact path-scoped call predicate.

Insight: a split can delete code without creating a new owner when the assertion is already owned by a narrower Grit packet.

### `require_public_ecology_surfaces_and_retired_topology_removal`

The source import/export predicate and retired topology absence predicate both fit the existing pattern. The active ecology root existence branch did not fit Habitat pattern authority; it was demoted rather than preserved. If the root-existence claim returns, it should be a data-driven topology/currentness rule with an explicit owner and proof class.

Insight: retired-path absence can stay Grit-owned when the scan root is the live parent directory. Missing active roots are a different proof class.

### `ensure_docs_checkout_paths_are_portable`

The command script was an advisory heuristic. The Grit provider already had a docs apply dry-run route that reports advisory diagnostics for `patternName: docs_local_checkout_paths`; it only needed to point at the authority-tree pattern path. The Grit path preserves advisory severity and `ok: true`, but it reports rewrite-backed findings rather than every broad host-path heuristic match.

Insight: docs rewrite diagnostics should prefer apply-backed evidence. That narrows the claim but makes the diagnostic more defensible and keeps rewrite authority in the pattern packet.

## Workflow Lessons

- Split at assertion level before changing `ownerTool`.
- Run the old owner path first, then the new owner path immediately after each conversion.
- Delete a command script only when every branch is converted, delegated to an existing rule, or explicitly demoted.
- Record intentional narrowing. A smaller, more defensible Grit predicate is acceptable only when the dropped branch is named.
- Do not move examples out of `.pattern.md`; they are local pattern evidence, not runtime fixtures.
