# Design - Control App Surface Proof

## Frame

### Objective

Make `grit-control-app-surface` a truthful Habitat check row for the game-door
invariant: production app/package code must not construct
`Civ7DirectControlSession` outside the sanctioned session owner files.

### Product Movement

This row helps Habitat enforce executable control architecture. App, router,
feature, CLI, and service code route game-wire work through canonical control
doors instead of creating caller-local direct-control sessions.

### Selection

- Rule id: `grit-control-app-surface`
- Grit pattern: `control_app_surface`
- Pattern file: `.grit/patterns/habitat/checks/control_app_surface.md`
- Owner layer: `grit-check`
- Registry scope:
  `apps/**/*.ts`, `apps/**/*.tsx`, `packages/**/*.ts`, `packages/**/*.tsx`
- Current Grit predicate scope:
  `.*(?:apps|packages)/.*\.tsx?$`, excluding sanctioned owner files and test
  paths
- Forbidden current syntax class:
  `new Civ7DirectControlSession(...)`

### Hard Core

1. This is a check proof, not an apply proof.
2. Native fixture proof, parser inventory, Habitat wrapper behavior, baseline
   inventory, injected proof, raw acquisition, classify/generator behavior, and
   product proof are separate proof classes.
3. Current row predicate is production `apps` and `packages` `.ts`/`.tsx`
   files only, with tests excluded.
4. The sanctioned owner files are
   `packages/studio-server/src/services/Civ7TunerSession.ts` and
   `packages/civ7-direct-control/src/session/session.ts`.
5. Direct constructors in app/package production code are positives; allowed
   owner constructors, tests, tools, identifier references, source strings, and
   wrapper/helper calls are controls.

### Exterior

- Direct-control package implementation changes.
- Studio server session implementation changes.
- Broad direct-control import policy.
- control-oRPC contract ownership.
- DDIT adapter scan-root/ignore activation.
- Source remediation.
- Raw direct Grit acquisition.
- Apply/codemod safety.
- Product/runtime proof.

### Falsifier

This checkpoint fails if native fixture proof reports controls, if parser
inventory finds live current candidates without disposition, if Habitat wrapper
selection does not include CAS after registration, if the baseline is missing,
or if the row implies broad direct-control import closure, control-oRPC closure,
DDIT adapter activation, classify/generator behavior, apply safety, or
product/runtime proof.

## Source Synthesis

`docs/system/direct-control/GAME-DOOR-INVARIANT.md` names the sanctioned
production direct-control constructors and states that app code, router leaves,
feature modules, operation engines, and caller-local utility scripts must not
construct `Civ7DirectControlSession` directly. `docs/system/ARCHITECTURE.md`
keeps runtime Civ7 control in `@civ7/direct-control`, and the Habitat taxonomy
assigns raw tuner/session primitives to `@civ7/direct-control`, Studio host
session lifecycle to `@civ7/studio-server`, and procedure/service behavior to
`@civ7/control-orpc`.

The current guard test `packages/studio-server/test/gameDoorInvariant.test.ts`
already treats only the direct-control session implementation and Studio
server `Civ7TunerSession` service as allowed production constructor owners.
This Grit row ports the constructor-surface portion into Habitat. It does not
ban every direct-control import because current architecture contains
legitimate direct-control imports in owner and service layers.

## Fixture Matrix

| Class | Expected current-predicate behavior |
| --- | --- |
| App feature/server `.ts` constructs `new Civ7DirectControlSession(...)` | Reports |
| App feature `.tsx` constructs `new Civ7DirectControlSession(...)` | Reports |
| Package CLI/service/control code constructs `new Civ7DirectControlSession(...)` outside owner files | Reports |
| `packages/studio-server/src/services/Civ7TunerSession.ts` constructor | Does not report |
| `packages/civ7-direct-control/src/session/session.ts` constructor | Does not report |
| Package `test` / `tests` / `.test.ts` / `.test.tsx` constructors | Do not report |
| `tools/**`, identifier references, source strings, and wrapper/helper calls | Do not report |

## Proof Contract

This row checkpoint may record:

- `CAS-NATIVE-FIXTURES-2026-06-15`: native fixture/parser-edge proof.
- `CAS-CONTROL-SURFACE-INVENTORY-2026-06-15`: parser inventory/live
  zero-candidate record truth over current `apps` and `packages`.
- `CAS-NATIVE-CORPUS-REFRESH-2026-06-15`: native sample corpus refresh.
- `CAS-HABITAT-GRIT-TOOL-2026-06-15` and
  `CAS-PER-RULE-SELECTOR-2026-06-15`: wrapper and selector proof after CAS
  registration.
- `CAS-BASELINE-FILES-2026-06-15`: explicit empty baseline inventory after
  CAS registration.
- `CAS-INJECTED-PROBE-2026-06-15`: CAS-only injected probe and owner-file
  control proof through the accepted harness API.
- Aggregate record alignment for this row.

This row checkpoint must not record:

- raw direct Grit acquisition;
- broad direct-control import closure;
- control-oRPC contract/root-index closure;
- DDIT adapter scan-root/ignore activation;
- full shared injected-corpus closure while DDIT remains blocked;
- baseline mutation;
- classify/generator behavior;
- source remediation;
- apply/codemod safety;
- broader control architecture closure;
- product/runtime proof.

Current restacked shared proof ids may be cited only as inherited shared proof:

- `HGPR-HABITAT-GRIT-TOOL-2026-06-15`
- `HGPR-PER-RULE-SELECTORS-2026-06-15`
- `HGPR-BASELINE-FILES-2026-06-15`
- `HGPR-BASELINE-INTEGRITY-2026-06-15`
- `HGPR-INJECTED-GRIT-ROWS-2026-06-15`
- `HGPR-RAW-GRIT-UNCLAIMED-2026-06-15`
