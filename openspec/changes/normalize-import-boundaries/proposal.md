## Why

0e accepts a scoped import policy instead of a broad `@mapgen/*` ban. The train
needs a dedicated boundary slice so public surfaces and sanctioned recipe
imports are remediated before guardrails enforce the first narrow rule.

## Target Authority Refs

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`: 0e,
  Problem Layers 3 and 6, Domino 1, Guardrail G4.
- `openspec/config.yaml`: import policy is scoped; broad bans wait until public
  surfaces exist.
- `openspec/specs/mapgen-normalization-workstreams/spec.md`: import guardrails
  begin with a narrow recipe deep-import guard after remediation.

## What Changes

- Document the import matrix for public docs/examples, public consumers,
  standard recipe assembly, cross-domain source, intra-domain internals, and
  tests.
- Add or repair public surfaces needed by `src/recipes/**` before enforcing
  the first recipe deep-import guard.
- Remediate recipe imports that reach into internals covered by the narrow
  guard.
- Add the first guardrail only for currently passing behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mapgen-normalization-workstreams`: separates import remediation from D1
  config migration and later topology moves.

## Dependencies

- Requires: `normalize-config-surface`.
- Enables parallel work: ecology topology, catalog dissolution, core purity,
  and later G4 enforcement.

## Forbidden Non-Goals

- No broad ban on sanctioned `@mapgen/domain/<domain>`, `/ops`, or `/config`
  surfaces.
- No forced movement of ecology or morphology stage hubs.
- No catalog/tag decomposition unless required to expose a narrow public
  surface.
- No generated artifact hand edits.

## Impact

- Affected owners: standard recipe assembly, domain/stage public surfaces,
  import policy docs, guard scripts.
- Expected write set:
  - import policy docs under `docs/system/libs/mapgen/policies/`
  - `mods/mod-swooper-maps/src/domain/**` public entrypoints
  - `mods/mod-swooper-maps/src/recipes/**` import callsites
  - guard/lint scripts and tests
- Protected paths: config surface migration, ecology topology moves, placement
  decomposition, adapter projection, generated outputs.
- Stop conditions:
  - recipe import remediation requires a public surface whose owner is
    unresolved;
  - the proposed guard would fail current intended imports;
  - the policy blocks an alias already sanctioned by accepted packaging docs.
- Verification gates:
  - import-policy focused tests or guard;
  - search for recipe deep reach-ins covered by G4;
  - `bun run openspec -- validate normalize-import-boundaries --strict`;
  - `bun run openspec:validate`;
  - `git diff --check`.
