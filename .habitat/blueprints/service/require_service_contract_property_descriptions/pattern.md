---
level: error
---
# Require Service Contract Property Descriptions

Every property authored directly inside a module contract's
`Type.Object({...})` carries a nonblank static `description` in its own TypeBox
options. `Type.Optional(...)` delegates to its wrapped schema. Named
`*Schema` values and `...*Schema.properties` spreads delegate to that schema
authority.

```grit
language js(typescript)

predicate require_service_contract_property_descriptions_is_module_contract() {
  $filename <: r".*/services/[^/]+/src/service/modules/[^/]+/contract/[^/]+\.ts$"
}

predicate require_service_contract_property_descriptions_imports_canonical_typebox() {
  $program <: contains `import { $..., Type, $... } from "typebox"`
}

predicate require_service_contract_property_descriptions_is_named_schema($schema) {
  $schema <: identifier(),
  $schema <: r".*Schema$"
}

predicate require_service_contract_property_descriptions_is_described_typebox_schema($schema) {
  $schema <: `Type.$constructor($...)`,
  ! $schema <: `Type.Optional($_)`,
  $schema <: call_expression(arguments=$arguments),
  $arguments <: [..., `{ $..., description: $description, $... }`],
  $description <: string(),
  ! $description <: r"^[\"']\s*[\"']$",
  not {
    $schema <: `Type.Enum($...)`,
    $arguments <: [$enum_values]
  }
}

predicate require_service_contract_property_descriptions_is_allowed_property_schema($schema) {
  or {
    require_service_contract_property_descriptions_is_named_schema(schema=$schema),
    require_service_contract_property_descriptions_is_described_typebox_schema(schema=$schema),
    and {
      $schema <: `Type.Optional($inner_schema)`,
      or {
        require_service_contract_property_descriptions_is_named_schema(schema=$inner_schema),
        require_service_contract_property_descriptions_is_described_typebox_schema(schema=$inner_schema)
      }
    }
  }
}

or {
  import_statement(source=$typebox_source) as $typebox_import where {
    require_service_contract_property_descriptions_is_module_contract(),
    $typebox_source <: r"^[\"']typebox[\"']$",
    $typebox_import <: contains import_specifier(name=`Type`, alias=$alias),
    $alias <: identifier()
  },
  variable_declarator(value=`Type`) where {
    require_service_contract_property_descriptions_is_module_contract(),
    require_service_contract_property_descriptions_imports_canonical_typebox()
  },
  `Type.Object($shape, $...)` where {
    require_service_contract_property_descriptions_is_module_contract(),
    not { require_service_contract_property_descriptions_imports_canonical_typebox() }
  },
  `$other.Object($shape, $...)` where {
    require_service_contract_property_descriptions_is_module_contract(),
    ! $other <: `Type`
  },
  `Type.Object($shape, $...)` where {
    require_service_contract_property_descriptions_is_module_contract(),
    require_service_contract_property_descriptions_imports_canonical_typebox(),
    $shape <: `{ $properties }`,
    $properties <: some `$key: $schema` where {
      not { require_service_contract_property_descriptions_is_allowed_property_schema(schema=$schema) }
    }
  },
  `Type.Object($shape, $...)` where {
    require_service_contract_property_descriptions_is_module_contract(),
    require_service_contract_property_descriptions_imports_canonical_typebox(),
    $shape <: `{ $properties }`,
    $properties <: some `...$spread` where {
      ! $spread <: r"^[A-Za-z_$][A-Za-z0-9_$]*Schema\.properties$"
    }
  },
  `Type.Object($shape, $...)` where {
    require_service_contract_property_descriptions_is_module_contract(),
    require_service_contract_property_descriptions_imports_canonical_typebox(),
    $shape <: `{ $properties }`,
    $properties <: some shorthand_property_identifier()
  },
  `Type.Object($shape, $...)` where {
    require_service_contract_property_descriptions_is_module_contract(),
    require_service_contract_property_descriptions_imports_canonical_typebox(),
    $shape <: `{ $properties }`,
    $properties <: some method_definition()
  }
}
```

## Matches undocumented and dynamic descriptions

```typescript
// @filename: services/control/src/service/modules/unit/contract/command.ts
import { Type } from "typebox";
export const CommandSchema = Type.Object({
  unitId: Type.String(),
  target: Type.Optional(Type.String({ description: targetDescription })),
});
```

## Matches aliased TypeBox authority

```typescript
// @filename: services/control/src/service/modules/unit/contract/command.ts
import { Type as T } from "typebox";
export const CommandSchema = T.Object({
  unitId: T.String({ description: "Unit identifier." }),
});
```

## Ignores direct and delegated descriptions

```typescript
// @filename: services/control/src/service/modules/unit/contract/command.ts
import { Type } from "typebox";
export const UnitSchema = Type.String({ description: "Unit identifier." });
export const CommandSchema = Type.Object({
  unitId: UnitSchema,
  target: Type.Optional(Type.String({ description: "Target identifier." })),
});
```
