---
level: error
tags: [service, contract, ownership]
---
# Require Civ7 Service Contract Envelope Ownership

Each Civ7 service procedure contract owns its complete request and response
envelopes directly. The roots are inline `standard(Type.*(...))` expressions,
so another file or detached local authority cannot silently redefine what
crosses the procedure boundary. Private local schema parts may still compose
inside those roots when they represent genuinely reusable nested vocabulary.

This is qualified Civ7 contract law over the selected oRPC and TypeBox stack.
It is not shared Habitat service law and does not teach generic vendor syntax.

```grit
language js(typescript)

predicate is_inline_standard_typebox_schema($value) {
  $value <: `standard(Type.$constructor($args))`
}

or {
  call_expression(function=`$builder.input`, arguments=[$schema]) where {
    $filename <: r".*services/[^/]+/src/service/modules/[^/]+/contract/[^/]+\.ts$",
    ! $filename <: includes "/contract/index.ts",
    ! is_inline_standard_typebox_schema($schema)
  },
  call_expression(function=`$builder.output`, arguments=[$schema]) where {
    $filename <: r".*services/[^/]+/src/service/modules/[^/]+/contract/[^/]+\.ts$",
    ! $filename <: includes "/contract/index.ts",
    ! is_inline_standard_typebox_schema($schema)
  }
}
```

## Matches fixture

```typescript
// @filename: services/example/src/service/modules/catalog/contract/find.ts
import { standard } from "@example/typebox-standard-schema";
import { oc } from "@orpc/contract";
import { Type } from "typebox";

const InputSchema = Type.Object({ query: Type.String() });
const OutputSchema = Type.Object({ found: Type.Boolean() });

export const find = oc
  .input(standard(InputSchema))
  .output(standard(OutputSchema));
```

## Ignores fixture

```typescript
// @filename: services/example/src/service/modules/catalog/contract/find.ts
import { standard } from "@example/typebox-standard-schema";
import { oc } from "@orpc/contract";
import { Type } from "typebox";

const QuerySchema = Type.String({ minLength: 1 });

export const find = oc
  .input(standard(Type.Object({ query: QuerySchema }, { additionalProperties: false })))
  .output(standard(Type.Object({ found: Type.Boolean() }, { additionalProperties: false })));
```
