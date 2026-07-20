# Studio Run Browser Originated Contract

## Why

The previous live matrix used real Studio endpoints, but it did not make the
rendered Studio button a first-class acceptance surface. The product path starts
in the browser: visible selection, saved setup config, seed, map size, player
count, and the Run in Game control. Endpoint-only admission can be green while
the user click admits a different effective request or leaves the UI unable to
follow the daemon operation.

This packet defines and tests the browser-originated request contract before
the runtime setup repair depends on it.

## Authority

- Direct user guidance that the visible Studio button is the product path.
- `real-user-path-remediation-proposal.md` Unit A.
- `target-vocabulary.md` live endpoint and final matrix rules.
- `packet-authoring-contract.md` live endpoint check definition.
- `studio-run-terminal-adoption-invariant` for the browser terminal state
  oracle.

## Requires

- `foundation-orogeny-public-config-surface`.
- `studio-run-terminal-adoption-invariant`.
- Running Studio daemon public `/rpc` mount for live checks.

## Enables Parallel Work

- Setup failure taxonomy can use browser-originated request ids as evidence.
- Final matrix harness can reuse the rendered-click admission path.

## Affected Owners

- Studio Run in Game UI control and request construction
- Studio operation event/current client boundary
- public `/rpc` `runInGame.start`, `runInGame.status`,
  `studio.events.watch`, and `studio.operations.current`
- live harness utilities that drive the rendered page

## Forbidden Owners

- Handler-direct or fixture-only calls as substitutes for browser-originated
  admission.
- Browser construction of private diagnostics or attribution.
- Alternate runtime transports outside the public `/rpc` oRPC contract.

## Write Set

Likely write set:

- `apps/mapgen-studio/src/app/hooks/useRunInGame.ts`
- `apps/mapgen-studio/src/app/StudioShell.tsx`
- `packages/mapgen-studio-ui/src/components/panels/GameConsole.tsx`
- `packages/mapgen-studio-ui/src/components/panels/statusLabels.ts`
- `packages/mapgen-studio-ui/test/**`
- operation/event client tests
- Studio browser harness utilities under existing test/workstream locations
- this OpenSpec packet and workstream evidence

## Consumer Impact

The visible button path becomes an explicit acceptance surface. Endpoint-only
runs remain useful supporting checks but cannot close the rendered user path.

## Stop Conditions

- The rendered UI and endpoint request builders admit different effective
  requests.
- Request id is only available through handler-direct or endpoint-only setup.
- Browser-originated evidence rows cannot be distinguished from endpoint rows.

## Before And After

Before:

- endpoint-originated request tests can bypass persisted browser/editor state;
- rendered click admission is not recorded as its own contract;
- request id capture may rely on endpoint calls instead of visible status.

After:

- a visible Run in Game click admits one request through the public oRPC mount;
- the browser status surface exposes the admitted `requestId` and public-only
  status fields;
- event stream and current-operation surfaces agree on the active operation;
- request construction from UI selections is covered before launch repair work.

## Behavior Verification

Behavior tests and harness checks drive a rendered Studio page, set the visible
inputs, click Run in Game, and compare the admitted request/status against the
selected user-facing values. These checks may use a fake daemon for fast
contract tests, but packet closure also requires a live Studio endpoint check
from this worktree.

## Structural Enforcement

Permanent positive assertions:

- browser Run in Game admission uses the public `/rpc` oRPC contract;
- the browser does not construct private diagnostics or attribution records;
- browser-originated evidence records are distinct from endpoint-originated
  records.

Only use Habitat/Grit if a recurring structural class needs enforcement.
Behavior belongs in tests and live checks.

## Verification Gates

- `bun run openspec -- validate studio-run-browser-originated-contract --strict`.
- `bun habitat classify` for the packet write set and every reported command.
- Focused UI/request construction tests.
- Live Studio endpoint check started from this worktree where the visible Run
  in Game button admits a request and the public status/current/event surfaces
  agree.
- TypeScript refactoring, code quality/structure, library correctness,
  testing-design, and Habitat/authority review lanes.
