# Effect-First Systematic Workstream

Status: workstream control record  
Created: 2026-06-19  
Controlling backlog: `docs/projects/habitat-harness/deep-refactor/effect-first-repair-backlog.md`  
Domino plan: `docs/projects/habitat-harness/deep-refactor/effect-first-refactor-domino-plan.md`  

This workstream controls the Effect-first Habitat repair train. It exists to
keep implementation agents from treating the backlog as one large refactor or
from advancing source changes before the relevant packet has passed its gates.

## Workstream Gates

1. Corpus before tuning: inspect current `tools/habitat-harness/src`, local
   docs, OpenSpec records, `.habitat`, root package scripts, Nx metadata,
   Biome/Grit/Husky config, and Graphite stack state before changing source.
2. Expectations before stats: write expected public behavior, allowed direct
   resource zones, static scan expectations, and public-surface risk before
   running broad checks.
3. Architecture before implementation: source packets depend on the accepted
   Effect substrate, provider, config, error, and runtime boundary design.
4. One owner per concern: a file belongs to one domain, provider, resource,
   runtime, public, command, generator, or plugin owner.
5. Provider before domain cutover: domain packets may not call Grit, Biome, Nx,
   Git, or Husky directly.
6. Fake Layers before feature tests: implementation packets must prove the
   service can be substituted through Effect requirements.
7. Public surface before deletion: root exports, command JSON, hook behavior,
   and package `files` changes require compatibility-matrix rows.
8. Guardrail before closure: structural invariants need Habitat/Grit/Biome/Nx
   guard ownership, not only tests or prose.
9. D14/D15 containment: D14A artifact authority and D15 provenance triggers do
   not expand unless the owning packet records the exact public contract change.
10. Clean stack closure: each packet closes with validation output, expected
    remaining static matches, Graphite status, and clean worktree.

## Review Lanes

- Domain lane: verify Habitat language, bounded context ownership, and absence
  of product/host vocabulary leakage.
- System lane: verify runtime edge placement, resource lifecycle, provider
  topology, and second-order effects on hooks/CI.
- TypeScript refactor lane: verify state-space collapse, deleted invalid states,
  public/internal exports, and no new escape hatches.
- Tooling lane: verify Effect, GritQL, Biome, Nx, Git, and Husky semantics are
  consumed through their proper owner.
- Public contract lane: verify D0 matrix rows, command parity, JSON shape,
  package exports, scripts, hooks, and docs.

## Verification Spine

Planning packets:

```bash
bun run openspec -- validate <change-id> --strict
bun run openspec:validate
git diff --check
git status --short --branch
gt status
```

Source packets add the closest classified checks:

```bash
bun run habitat classify <changed-path-or-diff>
bun run --cwd tools/habitat-harness check
bun run --cwd tools/habitat-harness test
bun run habitat check --tool habitat --json
```

Packets that touch command behavior, hooks, exports, or generated/artifact
paths must add the adjacent parity or fixture checks named in their OpenSpec
tasks.

