# Notifications View Source Slice

Status: burned down after serving as local source proof.
Date: 2026-06-04.

Historical note: this was transitional proof of native in-process oRPC
mechanics, not a template for future facade-only read wrappers.

The control-oRPC `notifications.view` leaf has since been removed. Current
notification, decision, and blocker service behavior is owned by
`attention.current`, which consumes the direct-control notification runtime
port from typed context. The direct-control notification read atom and facade
method remain available as low-level runtime ports.

## Scope

This slice adds the second read-only native procedure module:
`notifications.view`.

The write set is:

- `packages/civ7-control-orpc/src/modules/notifications/**` for the
  contract-first notification procedure leaf and Effect/oRPC handler;
- root control-oRPC contract/router exports to compose the new
  `notifications` router family;
- direct-control facade typing and live facade forwarding for
  `getCiv7PlayNotificationView`;
- a procedure-specific `ORPCTaggedError` named
  `Civ7NotificationViewUnavailableError`;
- focused local no-network tests for direct `call` and in-process server-side
  router client behavior.

No direct-control procedure-core implementation, custom middleware/context
pipeline, transport edge, CLI caller, Studio caller, in-game bridge, OpenAPI
surface, Task 2.9.4/5.x/6.x acceptance, runtime proof, or play-thread action
is part of this slice.

## Native oRPC/Effect Shape

The procedure is a native module under `packages/civ7-control-orpc`:

- contract leaf built from the direct-control TypeBox input/output schemas
  through the existing Standard Schema adapter;
- nested root contract/router shape `{ notifications: { view }, runtime }`;
- handler implemented with `implementEffect` through the package implementer;
- dependency access through typed oRPC context and the direct-control facade;
- no endpoint, session, state, command, or raw command fields in procedure
  input;
- tagged safe failure projection through the native error map.

The direct-control package remains the owner of the notification read atom,
App UI command source, result parsing, schema artifacts, and runtime proof
claims.

## Proof Captured

Focused tests prove:

- `notifications.view` calls a fake direct-control facade through the oRPC
  router without network transport;
- the server-side router client calls the same router graph;
- `maxNotifications` keeps the direct-control schema bounds;
- `host`, `port`, `state`, `stateName`, `session`, `command`, and
  `rawCommand` remain rejected procedure input and do not touch the fake
  runtime facade;
- direct-control facade failures become
  `NOTIFICATION_VIEW_UNAVAILABLE` with safe structured data only;
- raw command-looking failure messages such as
  `CMD:65535:readPlayNotifications()` are not serialized into the public
  error;
- the contract metadata names `notifications.view`,
  `family: "notifications"`, `risk: "read-only"`, and
  `proofBoundary: "local-package-test"`.

Verification run:

- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization
  --strict`
- `git diff --check`

## Remaining Boundaries

This is still local package proof. It does not prove live App UI notification
state, player progress, runtime availability, repeat-safe mutation, or any
transport/caller behavior.

Middleware remains pending. The repeated safe-error/input-context pattern is
now evidence for a future native oRPC/effect-orpc middleware candidate, not
permission to add a custom direct-control or wrapper pipeline.
