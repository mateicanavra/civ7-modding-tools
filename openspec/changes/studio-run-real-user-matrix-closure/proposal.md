# Studio Run Real User Matrix Closure

## Why

The remediation is not complete until the actual user path succeeds: rendered
Studio page, visible Run in Game click, saved Test of Time config with basic
mods, Huge map, 10 players, generated setup row, started Civ7 game, and
post-start readback for the generated content.

This packet owns the final live matrix and retained evidence chain after the
prior remediation packets have repaired the inputs and runtime boundary.

## Authority

- Direct user guidance requiring saved Test of Time basic-mods config, Huge map,
  10 players, Swooper Earthlike, Latest Juicy, and Desert Mountains.
- `real-user-path-remediation-proposal.md` required live scenario matrix.
- `target-vocabulary.md` live verification contract.
- `packet-authoring-contract.md` declared gate and review-lane rules.
- All prior remediation packets in
  `real-user-path-remediation-packet-index.md`.

## Requires

- `foundation-orogeny-public-config-surface`.
- `studio-run-terminal-adoption-invariant`.
- `studio-run-browser-originated-contract`.
- `studio-run-setup-failure-taxonomy`.
- `studio-run-generated-map-mod-visibility`.
- `studio-run-saved-config-modset-reconciliation`.
- Running Studio server and reachable Civ7/direct-control environment.

## Enables Parallel Work

- None. This is the closure packet for the remediation train.

## Affected Owners

- live browser-originated harness
- workstream evidence records
- public `/rpc` endpoint checks
- Civ7 direct-control and public live snapshot/status surfaces
- final OpenSpec/Habitat/reviewer closure gates

## Forbidden Owners

- Endpoint-only rows as substitutes for browser-originated starts.
- Handler-direct or fixture-only checks as closure evidence.
- Runtime redesign hidden inside final matrix execution.
- Public evidence records that expose private diagnostics or local paths.

## Write Set

Likely write set:

- existing live harness/evidence utilities
- `openspec/changes/studio-run-real-user-matrix-closure/workstream/**`
- target vocabulary or packet index only if review discovers a legitimate
  source-backed correction

## Consumer Impact

This packet determines whether the user-facing Run in Game remediation is
closed-passed or remains open. It records the durable chain needed for another
operator to diagnose any failed row without leaking private detail into public
UI state.

## Stop Conditions

- Any required scenario fails or remains unrun.
- Civ7 or Studio endpoint runtime is unavailable.
- Public status, diagnostics lookup, generated/deployed identity, setup row,
  and post-start in-game readback cannot be connected for the same request id.
- Any required review lane is incomplete or has undispositioned material
  findings.

## Before And After

Before:

- endpoint-originated rows exist, but not the required rendered-button matrix;
- setup row readback and in-game readback are not retained as one chain for the
  user's realistic scenario;
- Swooper Earthlike, Latest Juicy, and Desert Mountains are not all closed
  through the visible Studio path.

After:

- each required scenario has a retained browser-originated evidence row;
- request id, diagnostics id, generated artifact id, deployment snapshot,
  setup row readback, terminal public status, and in-game readback match;
- the initiative can be closed only if all gates and reviewer lanes are green.

## Behavior Verification

The packet runs the final live matrix. It may add harness refinements needed to
make the matrix repeatable, but it does not implement new runtime fixes unless
the packet is re-scoped and reviewed.

## Structural Enforcement

Permanent positive assertion:

- final closure evidence is browser-originated and in-game observed; endpoint
  rows alone do not satisfy the final matrix.

This is primarily an evidence contract and live gate. Do not add brittle code
shape assertions for individual harness lines.

## Verification Gates

- `bun run openspec -- validate studio-run-real-user-matrix-closure --strict`.
- `bun run openspec:validate`.
- `bun habitat classify` for the packet write set and every reported command.
- `nx run mapgen-studio:test`.
- contract/server/app/UI checks reported by Habitat and relevant Nx targets.
- Live rendered-button matrix for Swooper Earthlike, Latest Juicy, and Swooper
  Desert Mountains with `ToT_BasicModsEnabled.Civ7Cfg`, Huge map, 10 players,
  balanced resources, and seed `1538316415`.
- TypeScript refactoring, code quality/structure, library correctness,
  testing-design, and Habitat/authority review lanes.
