---
level: error
---
# Grit Studio Run Cancel Command Owner

Packet 3 makes cancellation an explicit public command:
`runInGame.cancel({ requestId })`. This rule asserts the structural owner path:
the contract owns the closed wire shape, the router owns the oRPC leaf, and the
operation runtime owns the cancellation command and registry transition owner.
Interruption, cleanup ordering, diagnostics persistence, lease release, terminal
event cardinality, and transport abort behavior are runtime behavior claims
covered by Packet 3 tests and live endpoint proof, not static pattern snippets.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    ! $body <: contains `const requestIdInputSchema = contractSchema($schema)`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    ! $body <: contains `requestId: Type.String({ minLength: 1 })`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    ! $body <: contains `{ additionalProperties: false }`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$",
    ! $body <: contains `export const cancel = oc.errors(runInGameErrors).input(requestIdInputSchema).output(operationStatusSchema)`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-contract/src/index\.ts$",
    ! $body <: contains `cancel: runInGame.cancel`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/router/index\.ts$",
    ! $body <: contains `cancel: oe.runInGame.cancel.effect($handler)`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/router/index\.ts$",
    ! $body <: contains `.runInGameCancel(input)`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/router/index\.ts$",
    ! $body <: contains `"runInGame.cancel"`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/StudioOperationRuntime\.ts$",
    ! $body <: contains `readonly runInGameCancel: ($input) => Effect.Effect<$output, StudioRuntimeFailure>`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/StudioOperationRuntime\.ts$",
    ! $body <: contains `runInGameCancel: (input) => $impl`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/registry\.ts$",
    ! $body <: contains `export function cancelRunInGame($args) { $body }`
  },
  `export const abort = $impl` where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$"
  },
  `export const cancelRequest = $impl` where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$"
  },
  `export const cancelRun = $impl` where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$"
  },
  `export const runInGameCancel = $impl` where {
    $filename <: r".*packages/studio-contract/src/runInGame\.ts$"
  },
  `abort: runInGame.$impl` where {
    $filename <: r".*packages/studio-contract/src/index\.ts$"
  },
  `cancelRequest: runInGame.$impl` where {
    $filename <: r".*packages/studio-contract/src/index\.ts$"
  },
  `cancelRun: runInGame.$impl` where {
    $filename <: r".*packages/studio-contract/src/index\.ts$"
  },
  `runInGameCancel: runInGame.$impl` where {
    $filename <: r".*packages/studio-contract/src/index\.ts$"
  },
  `abort: oe.runInGame.$proc.effect($handler)` where {
    $filename <: r".*packages/studio-server/src/router/index\.ts$"
  },
  `cancelRequest: oe.runInGame.$proc.effect($handler)` where {
    $filename <: r".*packages/studio-server/src/router/index\.ts$"
  },
  `cancelRun: oe.runInGame.$proc.effect($handler)` where {
    $filename <: r".*packages/studio-server/src/router/index\.ts$"
  },
  `runInGameCancel: oe.runInGame.$proc.effect($handler)` where {
    $filename <: r".*packages/studio-server/src/router/index\.ts$"
  }
}
```

## Matches Fixture

```typescript
// @filename: packages/studio-contract/src/runInGame.ts
export const status = oc.input(contractSchema(Type.Object({ requestId: Type.String() })));

// @filename: packages/studio-contract/src/index.ts
export const studioEffectContract = oc.router({ runInGame: { start, status, diagnostics } });

// @filename: packages/studio-server/src/router/index.ts
const router = { runInGame: { status: oe.runInGame.status.effect(handler) } };

// @filename: packages/studio-server/src/operationRuntime/StudioOperationRuntime.ts
export interface StudioOperationRuntimeApi {
  readonly runInGameStatus: (input) => Effect.succeed(input);
}

// @filename: packages/studio-server/src/operationRuntime/registry.ts
export function transitionRunInGame() {}
```

## Ignores Fixture

```typescript
// @filename: packages/studio-contract/src/runInGame.ts
const requestIdInputSchema = contractSchema(
  Type.Object(
    {
      requestId: Type.String({ minLength: 1 }),
    },
    { additionalProperties: false }
  )
);
export const cancel = oc
  .errors(runInGameErrors)
  .input(requestIdInputSchema)
  .output(operationStatusSchema);

// @filename: packages/studio-contract/src/index.ts
const contract = {
  runInGame: {
    start: runInGame.start,
    status: runInGame.status,
    cancel: runInGame.cancel,
    diagnostics: runInGame.diagnostics,
  },
};

// @filename: packages/studio-server/src/router/index.ts
const router = {
  cancel: oe.runInGame.cancel.effect(function* ({ input }) {
    return yield* operationRuntime.runInGameCancel(input).pipe(map("runInGame.cancel"));
  }),
};

// @filename: packages/studio-server/src/operationRuntime/StudioOperationRuntime.ts
export interface StudioOperationRuntimeApi {
  readonly runInGameCancel: (
    input: StudioInputs["runInGame"]["cancel"]
  ) => Effect.Effect<StudioOutputs["runInGame"]["cancel"], StudioRuntimeFailure>;
}
const api = {
  runInGameCancel: (input) => operationRuntime.runInGameCancel(input),
};

// @filename: packages/studio-server/src/operationRuntime/registry.ts
export function cancelRunInGame(args) {}
```
