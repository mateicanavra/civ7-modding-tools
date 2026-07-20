# Studio Run Setup Failure Taxonomy

## Why

Current private diagnostics can report a generated setup row missing while the
summary says direct-control start is unavailable. That is safe enough for the
public UI, but it is operationally misleading. Direct control may be reachable;
the failing boundary can be the active Civ7 setup mod set or generated row
visibility.

This packet sharpens setup failure classification before the composition fix so
the next packet can use precise diagnostics while repairing the live launch
boundary.

## Authority

- Direct user guidance that blockers become diagnostics and design inputs.
- `real-user-path-remediation-proposal.md` Unit B2.
- `target-vocabulary.md` public failure categories and attribution sections.
- Completed packets: `studio-run-public-status-diagnostics`,
  `studio-run-runtime-observation`, and
  `studio-run-diagnostics-retention-guards`.

## Requires

- Public/private status split and diagnostics lookup.
- Browser-originated request identity from
  `studio-run-browser-originated-contract`.
- Existing setup row readback and runtime observation records.

## Enables Parallel Work

- Generated mod visibility and saved-config reconciliation packets can
  terminalize with precise private reasons during investigation and repair.

## Affected Owners

- Run in Game runtime-control failure mapping
- private diagnostics and attribution records
- setup row readback records
- public status safe failure categories
- direct-control setup read APIs as consumers, not alternate runtime owners

## Forbidden Owners

- Generic direct-control unavailable summaries for row/mod-set failures.
- Public payloads containing private row samples, local paths, or attribution.
- Alternate runtime transports or caller-local Civ7 control scripts.

## Write Set

Likely write set:

- `apps/mapgen-studio/src/server/runInGame/**`
- `apps/mapgen-studio/src/server/operations/**`
- `apps/mapgen-studio/src/server/diagnostics/**`
- `apps/mapgen-studio/test/runInGame/**`
- `packages/civ7-direct-control/**` only if the owned setup read surface needs
  structured failure data
- this OpenSpec packet and workstream evidence

## Consumer Impact

Users still see safe public runtime categories. Operators can use diagnostics
lookup to see whether the failing boundary is row visibility, generated mod
enablement, setup read timeout, or direct-control transport availability.

## Stop Conditions

- Row invisibility collapses into generic direct-control unavailability.
- Tuner/socket unavailability is reported as row invisibility.
- Public status/current/events leak private diagnostics.
- Failure reasons are modeled as open strings instead of a closed contract.

## Before And After

Before:

- setup row invisibility can collapse into a broad
  `direct-control-unavailable` private reason;
- diagnostics do not consistently separate tuner/socket unavailability from
  row/mod-set mismatch;
- operators can be sent toward the wrong subsystem.

After:

- private diagnostics distinguish setup row not visible, generated map mod not
  enabled, setup row mismatched, tuner unavailable, and setup read timeout;
- public status remains safe and bounded;
- diagnostics retain a bounded sample of visible rows or active mod-set data
  only when it is safe for private lookup.

## Behavior Verification

Behavior tests drive fake direct-control/setup readers through each failure
class and assert public/private projection. They do not merely search for old
reason strings.

## Structural Enforcement

Permanent positive assertion:

- setup-control failures are represented by a closed internal reason union and
  mapped to safe public categories.

Prefer TypeScript closed unions and schema validation for this invariant. Use
Habitat only if a recurring boundary shape across files needs enforcement.

## Verification Gates

- `bun run openspec -- validate studio-run-setup-failure-taxonomy --strict`.
- `bun habitat classify` for the packet write set and every reported command.
- Focused runtime-control diagnostics tests.
- Live endpoint failure reproduction or controlled fixture check showing row
  invisibility terminalizes with specific private diagnostics.
- TypeScript refactoring, code quality/structure, library correctness,
  testing-design, and Habitat/authority review lanes.
