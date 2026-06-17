# Habitat Toolkit Gaps

This document names the gaps that matter for the next Habitat product phase.
The distinction is central:

- Platform-substrate health means Habitat can classify, check, enforce, route,
  prove, and guard structural change.
- Authoring-workflow capability means Habitat can create useful MapGen
  structures directly and prove those generated structures build, check, and fit
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
project kinds. The existing `pattern` generator is a Grit rule lifecycle
scaffold. Neither is a MapGen authoring generator.

## Missing Product Acceptance Loop

The missing controlling test is:

```text
Starting from a clean repo, use Habitat to generate a new MapGen domain with
one operation, wire it into a new or existing recipe stage/step, run the
generated structure through Nx, Habitat, and recipe compilation, and show the
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
- generated output does not weaken boundary, Grit, or baseline contracts;
- generator tests prove both writes and refusals.

## Diagnostic Patterns Are Not Broad Fixes

Most Habitat Grit patterns are diagnostics. They detect structural violations
and fail through Habitat, but they do not apply repairs.

Current apply state:

- `.grit/patterns/habitat/apply/deep_import_to_public_surface.md` is wired into
  `habitat fix`.
- `.grit/patterns/habitat/apply/helper_redeclarations_to_imports.md` exists but
  is not wired into `habitat fix`.
- No general mapping exists from each diagnostic Grit rule to a safe apply
  pattern.

This is partly deliberate and partly unfinished. It is deliberate that unsafe
or ambiguous rewrites are not automatically applied. It is unfinished wherever a
diagnostic pattern has a mechanical, locally provable repair that Habitat still
does not expose.

## Apply Safety Still Needs Per-Pattern Product Proof

The apply transaction has strong generic guardrails, but each new apply pattern
still needs its own proof:

- exact rewrite inventory;
- allowed roots;
- create/delete policy;
- target export existence checks where imports are rewritten;
- typecheck or package-local verification gate;
- false-positive fixtures;
- current-tree dry-run result;
- rollback and dirty-worktree behavior.

The transaction substrate cannot prove the semantic correctness of a pattern by
itself.

## Pattern Authority Can Overpower Product Focus

The Pattern Authority machinery is useful for preventing weak Grit rules from
quietly becoming enforcement law. Its risk is that it can become the center of
gravity. The next phase should not confuse "well-governed rule admission" with
"the toolkit helps agents author useful MapGen structures."

Pattern work should be judged by whether it protects or repairs real authoring
flows.

## Docs Are Reference, Not Product Proof

Habitat has a deep documentation and ledger trail. That trail is useful for
handoff and audit, but it is not product proof.

A future agent should prefer:

- generator acceptance tests over prose claims;
- current-tree command output over historical ledgers;
- path-grounded code inspection over broad summaries;
- applied diffs and rollback proof over "pattern exists" claims.

## Known Non-Goals For The Existing Surface

The current toolkit does not claim to:

- replace MapGen architecture;
- infer recipe semantics from intent;
- author domain behavior;
- generate Civ7 resource data;
- make arbitrary Grit changes safe;
- guarantee runtime game behavior;
- make hooks authoritative over CI or explicit graph verification.

Any future work that wants Habitat to own one of these must add a concrete
interface, proof path, and acceptance test.
