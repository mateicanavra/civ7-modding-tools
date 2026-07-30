---
level: error
---
# Require Service Contract Authority

The root contract composes module contracts through the shared `base`. A module
contract index aggregates direct semantic leaves as one plain contract tree.
Each leaf exposes one filename-matched procedure or coherent semantic group.
The module name belongs to the aggregate; a module-named leaf cannot hide the
same mega-contract behind another file.

Contract-local request, response, envelope, and helper TypeBox schemas remain
private beside their owning procedure. They move to `model/dto` only when they
are genuinely reusable DTO authority. Every input and output crosses oRPC
through the local `standard(...)` bridge. TypeScript and Knip own unused
private declarations; Habitat does not require a schema registry merely to
prove transitive reachability. Local error maps remain literal or private
objects. TypeBox capabilities that cannot project through the public
JSON-schema boundary are excluded.

```grit
language js(typescript)

function contract_leaf_export_status($filename, $name) js {
  const match = $filename.text.match(
    /\/modules\/([^/]+)\/contract\/([^/]+)\.ts$/,
  );
  if (!match || match[2] === "index") return "not-leaf";
  if (match[1] === match[2]) return "module-capsule";
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(match[2])) {
    return "noncanonical-filename";
  }
  const expected = match[2].replace(
    /-([a-z0-9])/g,
    (_all, value) => value.toUpperCase(),
  );
  return expected === $name.text ? "ok" : "wrong-export";
}

predicate require_service_contract_authority_is_root_service_contract() {
  $filename <: r".*/services/[^/]+/src/service/contract\.ts$"
}

predicate require_service_contract_authority_is_module_contract_index() {
  $filename <: r".*/services/[^/]+/src/service/modules/[^/]+/contract/index\.ts$"
}

predicate require_service_contract_authority_is_module_contract_leaf() {
  $filename <: r".*/services/[^/]+/src/service/modules/[^/]+/contract/[^/]+\.ts$",
  ! require_service_contract_authority_is_module_contract_index()
}

predicate require_service_contract_authority_is_schema_owner() {
  or {
    require_service_contract_authority_is_module_contract_leaf(),
    $filename <: r".*/services/[^/]+/src/service/(?:schema/[^/]+|(?:modules/[^/]+/)?model/dto/[^/]+)\.ts$"
  }
}

predicate require_service_contract_authority_has_registered_contract_leaf($body) {
  $body <: some $statement where {
    $statement <: import_statement(source=$source) as $import,
    $source <: r"^[\"']\./[a-z][a-z0-9]*(?:-[a-z0-9]+)*[\"']$",
    $import <: contains import_specifier(name=$name),
    $body <: contains `export const contract = $value` where {
      $value <: contains $name
    }
  }
}

predicate require_service_contract_authority_is_local_error_map($map) {
  $map <: r"^[A-Za-z_$][A-Za-z0-9_$]*$",
  $program <: contains `const $map = { $properties }`
}

predicate require_service_contract_authority_is_allowed_contract_leaf_statement($statement) {
  or {
    $statement <: import_statement(),
    $statement <: `export const $name = $value`,
    $statement <: `const $name = $value`,
    $statement <: `function $name($args) { $body }`
  }
}

predicate require_service_contract_authority_is_nonprojectable_typebox_constructor($constructor) {
  $constructor <: r"^[\"']?(?:BigInt|Call|Codec|Constructor|Deferred|Function|Generic|Identifier|Infer|Parameter|Refine|Rest|Symbol|Tuple|Undefined|Unsafe|Void)[\"']?$"
}

predicate require_service_contract_authority_is_bigint_literal($value) {
  $value <: r"^-?(?:0|[1-9][0-9]*)n$"
}

or {
  program(statements=$body) where {
    require_service_contract_authority_is_root_service_contract(),
    ! $body <: contains `export const contract = base.router($modules)`
  },
  program(statements=$body) where {
    require_service_contract_authority_is_module_contract_index(),
    ! {
      $body <: contains `export const contract = { $properties }`,
      require_service_contract_authority_has_registered_contract_leaf(body=$body)
    }
  },
  program(statements=$body) where {
    require_service_contract_authority_is_module_contract_leaf(),
    ! $body <: contains `export const $name = $value` where {
      $status = contract_leaf_export_status(filename=$filename, name=$name),
      $status <: includes "ok"
    }
  },
  program(statements=$body) where {
    require_service_contract_authority_is_module_contract_leaf(),
    $body <: some $statement where {
      ! require_service_contract_authority_is_allowed_contract_leaf_statement(statement=$statement)
    }
  },
  `$procedure.$direction($schema)` where {
    require_service_contract_authority_is_module_contract_leaf(),
    $direction <: r"^(?:input|output)$",
    ! $schema <: `standard($declaration)`
  },
  `$procedure.errors($errors)` where {
    require_service_contract_authority_is_module_contract_leaf(),
    ! {
      or {
        $errors <: `{ $properties }`,
        require_service_contract_authority_is_local_error_map(map=$errors)
      }
    }
  },
  import_statement(source=$source) as $import where {
    require_service_contract_authority_is_module_contract_leaf(),
    $source <: r"^[\"']typebox[\"']$",
    $import <: `import * as $namespace from $source`
  },
  import_statement(source=$source) as $import where {
    require_service_contract_authority_is_schema_owner(),
    $source <: r"^[\"']typebox[\"']$",
    $import <: contains import_specifier(name=$name) where {
      ! $name <: r"^[\"']?(?:Static|Type|TSchema)[\"']?$"
    }
  },
  `$typebox.$constructor` where {
    require_service_contract_authority_is_schema_owner(),
    or {
      and {
        $typebox <: `Type`,
        $program <: contains `import { $..., Type, $... } from "typebox"`
      },
      $program <: contains `import { $..., Type as $typebox, $... } from "typebox"`
    },
    require_service_contract_authority_is_nonprojectable_typebox_constructor(constructor=$constructor)
  },
  `$typebox.Literal($value, $...)` where {
    require_service_contract_authority_is_schema_owner(),
    or {
      and {
        $typebox <: `Type`,
        $program <: contains `import { $..., Type, $... } from "typebox"`
      },
      $program <: contains `import { $..., Type as $typebox, $... } from "typebox"`
    },
    require_service_contract_authority_is_bigint_literal(value=$value)
  }
}
```

## Matches an export that does not match its leaf

```typescript
// @filename: services/control/src/service/modules/unit/contract/command-request.ts
export const command = base.input(standard(CommandInputSchema));
```

## Matches a module aggregate disguised as a leaf

```typescript
// @filename: services/control/src/service/modules/unit/contract/unit.ts
import { base } from "../../../base";
export const unit = base.router({
  command: base,
  target: base,
});
```

## Ignores normal transitive private schema composition

```typescript
// @filename: services/control/src/service/modules/unit/contract/command-request.ts
import { Type } from "typebox";
const UnitIdSchema = Type.String();
const CommandEnvelopeSchema = Type.Object({ unitId: UnitIdSchema });
const CommandInputSchema = Type.Object({ command: CommandEnvelopeSchema });
export const commandRequest = base.input(standard(CommandInputSchema));
```

## Matches imported error authority

```typescript
// @filename: services/control/src/service/modules/unit/contract/command.ts
import { unitErrors } from "../model/errors/unit";
export const command = base.errors(unitErrors).input(standard(CommandSchema));
```

## Matches nonprojectable TypeBox authority

```typescript
// @filename: services/control/src/service/modules/unit/contract/command.ts
import { Type } from "typebox";
const CommandInputSchema = Type.Tuple([Type.String()]);
export const command = base.input(standard(CommandInputSchema));
```

## Matches an index without a direct semantic leaf

```typescript
// @filename: services/control/src/service/modules/unit/contract/index.ts
export const contract = {};
```

## Ignores private reachable leaf schemas

```typescript
// @filename: services/control/src/service/modules/unit/contract/command-request.ts
import { type Static, Type } from "typebox";
import { base } from "../../../base";
import { standard } from "../../../schema/standard";
const CommandInputSchema = Type.Object({ unitId: Type.String() });
const CommandOutputSchema = Type.Object({ accepted: Type.Boolean() });
const commandErrors = { COMMAND_UNAVAILABLE: { status: 503 } };
export const commandRequest = base
  .input(standard(CommandInputSchema))
  .output(standard(CommandOutputSchema))
  .errors(commandErrors);
```

## Ignores direct index and root composition

```typescript
// @filename: services/control/src/service/modules/unit/contract/index.ts
import { commandRequest } from "./command-request";
export const contract = { commandRequest };

// @filename: services/control/src/service/contract.ts
import { base } from "./base";
import { contract as unit } from "./modules/unit/contract";
export const contract = base.router({ unit });
```
