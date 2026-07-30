---
level: error
---
# Require Typed Service Effect Error Authority

Explicit service `Effect.Effect` failure slots do not use global `Error` or a
same-source subclass of it. Internal capability failures use an owned tagged
error. Public failures may use the pinned `effect-orpc` `ORPCTaggedError`
authority declared by the contract.

This law owns explicit two- and three-argument Effect type applications.
TypeScript owns cross-file assignability and inferred channels; Effect tests
own runtime translation behavior.

```grit
language js(typescript)

predicate require_service_effect_error_authority_is_service_production_source() {
  $filename <: r".*/services/[^/]+/src/.*\.ts$"
}

predicate require_service_effect_error_authority_is_error_subclass($name) {
  $program <: contains `class $name extends Error { $body }`
}

predicate require_service_effect_error_authority_contains_untyped_error($failure) {
  or {
    $failure <: contains `Error`,
    $failure <: contains $name where {
      require_service_effect_error_authority_is_error_subclass(name=$name)
    }
  }
}

or {
  `Effect.Effect<$success, $failure>` where {
    require_service_effect_error_authority_is_service_production_source(),
    require_service_effect_error_authority_contains_untyped_error(failure=$failure)
  },
  `Effect.Effect<$success, $failure, $requirements>` where {
    require_service_effect_error_authority_is_service_production_source(),
    require_service_effect_error_authority_contains_untyped_error(failure=$failure)
  }
}
```

## Matches global Error in a port

```typescript
// @filename: services/control/src/service/model/ports/unit.ts
import type { Effect } from "effect";
export type UnitPort = {
  send(): Effect.Effect<void, Error>;
};
```

## Matches a same-source Error subclass

```typescript
// @filename: services/control/src/service/modules/unit/model/ports/unit.ts
import type { Effect } from "effect";
class UnitFailure extends Error {}
export declare const send: Effect.Effect<void, UnitFailure, Scope>;
```

## Ignores owned internal and public failures

```typescript
// @filename: services/control/src/service/modules/unit/model/errors/unit.ts
import { Data, type Effect } from "effect";
import { ORPCTaggedError } from "effect-orpc";
export class UnitPortFailure extends Data.TaggedError("UnitPortFailure")<{
  readonly cause: unknown;
}> {}
export class UnitUnavailable extends ORPCTaggedError("UnitUnavailable", {
  status: 503,
}) {}
export declare const internal: Effect.Effect<void, UnitPortFailure>;
export declare const external: Effect.Effect<void, UnitUnavailable>;
```

## Ignores proof source

```typescript
// @filename: services/control/test/behavior/unit.test.ts
import type { Effect } from "effect";
export declare const failure: Effect.Effect<void, Error>;
```
