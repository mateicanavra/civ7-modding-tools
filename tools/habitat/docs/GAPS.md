# Habitat Toolkit Gaps

This document names the gaps that matter for the next Habitat product phase.
The distinction is central:

- Platform-substrate health means Habitat can classify, check, enforce, route,
  verify, and guard structural change.
- Authoring-workflow capability means Habitat can create useful MapGen
  structures directly and verify those generated structures build, check, and fit
  the recipe/domain topology.

The current toolkit is much stronger on platform-substrate health than on
authoring-workflow capability.

## Authoring Generators Not Yet Built

Habitat does not yet generate these MapGen authoring structures:

- a whole new MapGen mod recipe;
- a whole new MapGen domain;
- a domain operation;
- a recipe stage;
- a recipe step;
- a step contract/default/schema bundle;
- a recipe-stage-step wiring update;
- a domain operation registry update;
- a Studio recipe artifact update.

The existing `project` generator is a workspace package scaffold for uniform
project kinds. The existing `pattern` generator is a Habitat pattern lifecycle
scaffold. Neither is a MapGen authoring generator.

## Missing Product Acceptance Loop

The missing controlling test is:

```text
Starting from a clean repo, use Habitat to generate a new MapGen domain with
one operation, wire it into a new or existing recipe stage/step, run the
generated structure through Habitat, graph verification, and recipe compilation, and show the
generated code is correct enough for an agent to continue from it without
hand-inventing topology.
```

Until a test like this exists, Habitat can look healthy while failing the
stronger product outcome.

Required acceptance properties for future authoring generators:

- generated paths match existing MapGen conventions;
- generated names and IDs are stable and collision-safe;
- generated files compile without manual topology fixes;
- recipe/domain/stage/step registries are updated where needed;
- generated structures pass `habitat classify`;
- generated structures pass owning package `check`, `test`, and relevant
  Habitat rules;
- generated output does not weaken boundary, pattern, or baseline contracts;
- generator tests validate both writes and refusals.

## Diagnostic Patterns Are Not Live Fixes

Most Habitat patterns are diagnostics. They detect structural violations
and fail through Habitat, but they do not apply repairs.

Current implemented state:

- `apply.pattern.md` role files and default apply-admission definitions resolve
  against the live Grit registry.
- `bun habitat fix --dry-run` runs admitted Grit diagnostics without writing.
- A role file, a Grit check, or an admission definition does not grant a live
  rewrite.

**Gap:** `habitat fix` has no live mutation path. The router supplies no
protected-zone decision and the transaction policy explicitly refuses live
execution. Formatting, post-fix gates, rollback, transaction diff records, and
commit-readiness are consequently not implemented.

**Re-entry condition:** a future live-fix design must first establish an
approved protected-zone decision at the router and implement execution in the
transaction policy. It must then supply the per-pattern evidence below before
it is presented as runnable.

## Future / Not Implemented: Apply Safety Acceptance Target

The following is a target acceptance contract for a future live apply path, not
current transaction behavior. Each future apply pattern would need:

- exact rewrite inventory;
- allowed roots;
- create/delete policy;
- target export existence checks where imports are rewritten;
- typecheck or package-local verification gate;
- false-positive fixtures;
- current-tree dry-run result;
- live-write, rollback, and dirty-worktree proof.

Even after an execution substrate exists, it cannot establish the semantic
correctness of a pattern by itself.

## pattern manifest Can Overpower Product Focus

The pattern manifest machinery is useful for preventing weak Habitat rules from
quietly becoming enforcement law. Its risk is that it can become the center of
gravity. The next phase should not confuse "well-governed rule admission" with
"the toolkit helps agents author useful MapGen structures."

Pattern work should be judged by whether it protects or repairs real authoring
flows.

## Docs Are Reference, Not Product Behavior

Habitat has a deep documentation and ledger trail. That trail is useful for
handoff and audit, but it is not product behavior.

A future agent should prefer:

- generator acceptance tests over prose claims;
- current-tree command output over historical ledgers;
- path-grounded code inspection over broad summaries;
- future live-apply diffs and rollback evidence over "pattern exists" claims.

## Known Non-Goals For The Existing Surface

The current toolkit does not claim to:

- replace MapGen architecture;
- infer recipe semantics from intent;
- author domain behavior;
- generate Civ7 resource data;
- make arbitrary structural rewrites safe;
- guarantee runtime game behavior;
- make hooks authoritative over CI or explicit graph verification.

Any future work that wants Habitat to own one of these must add a concrete
interface, validation path, and acceptance test.
