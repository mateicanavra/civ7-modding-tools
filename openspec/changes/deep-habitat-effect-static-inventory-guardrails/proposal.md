# Change: Deep Habitat Effect Static Inventory Guardrails

## Why

The TypeScript refactor lane found recurring state-space smells in Habitat
source: direct process/fs/env/time calls, library-local Effect runtime use,
generic throws, public/internal barrel leaks, and host/process vocabulary in
generic runtime modules. These must be inventoried and guarded before broad
source migration.

## What Changes

- Add a checked inventory of every current occurrence by file and disposition:
  provider-owned, host-adapter edge, domain violation, public-contract risk, or
  allowed test helper.
- Define guardrail owner decisions and pre-migration blocker checks for
  recurring violations.
- Assign each future guardrail to the correct enforcement owner: GritQL,
  Biome, Nx, Habitat file-layer, or TypeScript tests.
- Record that this packet enables no new blocking guardrail; later guardrail
  enabling packets must add injected fixtures and current-tree proof together.

## What Does Not Change

- No runtime behavior changes.
- No current direct-use occurrence is silently allowed without an explicit
  disposition.

## Affected Owners

- `tools/habitat-harness/src/**`
- `.habitat/patterns/**` or equivalent Grit guard artifacts if accepted.
- Habitat rule registry and baseline records if new guardrails are enforced.
- This OpenSpec packet.

## Stop Conditions

- A guardrail cannot distinguish provider/runtime modules from domain modules.
- A public barrel change lacks callsite census and package-export risk review.
- A test is proposed as the only owner for a structural invariant that should
  be enforced by Habitat/Grit/Biome/Nx.

## Verification

- Static inventory scans from the domino plan.
- Inventory and owner-assignment evidence for every proposed guard.
- `bun run habitat:check -- --json`
- `bun run openspec -- validate deep-habitat-effect-static-inventory-guardrails --strict`
- `bun run openspec:validate`
- `git diff --check`
