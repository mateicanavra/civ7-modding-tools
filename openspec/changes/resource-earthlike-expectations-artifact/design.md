# Resource Earthlike Expectations Artifact Design

## Decision

The typed expectation artifact lives in the resource domain:

```text
mods/mod-swooper-maps/src/domain/resources/earthlike-expectations
```

It is exported through `@mapgen/domain/resources` and registered in the
resource artifact catalog as:

```text
artifact:resources.earthlikeExpectations
```

The artifact is built from the official corpus so every row carries:

- official resource symbol;
- static resource row slot;
- runtime id status `unverified`;
- eligible ages;
- official placement constraint summary.

## Runtime Boundary

The artifact does not include runtime numeric ids and does not import adapter or
placement runtime code. Tests assert the source avoids `@civ7/adapter`,
`ResourceBuilder`, `placeResourceIntent`, and placement op imports.

## Blocked Rows

The five corpus-blocked resources stay visible and active-zero:

- `RESOURCE_CLOVES`
- `RESOURCE_GOLD_DISTANT_LANDS`
- `RESOURCE_LAPIS_LAZULI`
- `RESOURCE_NICKEL`
- `RESOURCE_SILVER_DISTANT_LANDS`

Their expectation rows have:

```text
status = "blocked"
min = 0
target = 0
max = 0
evidence = "blocked"
conditionMultipliers = []
```

## Schema Boundary

The TypeBox schema is strict:

- `additionalProperties: false` on artifact and row objects;
- closed group, status, evidence, and source literals;
- a blocked-row branch that permits only zero ranges and blocked evidence;
- an active-row branch for `expected` and `conditional` rows.

Schema tests reject runtime/numeric id overclaims, feature rows, invalid status,
missing range fields, and blocked-row nonzero range leakage.

## Write Set

- `mods/mod-swooper-maps/src/domain/resources/earthlike-expectations/**`
- `mods/mod-swooper-maps/src/domain/resources/index.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/resources/artifacts.ts`
- `mods/mod-swooper-maps/test/resources/resource-earthlike-expectations-artifact.test.ts`
- `openspec/changes/resource-earthlike-expectations-artifact/**`
