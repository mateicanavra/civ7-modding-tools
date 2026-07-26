# Review Disposition Ledger

| Finding | Severity | Disposition | Evidence |
|---|---:|---|---|
| Corpus owner should be a new Swooper Maps `resources` domain, not adapter or placement | P2 | accepted | Added `mods/mod-swooper-maps/src/domain/resources/**`; placement behavior unchanged. |
| Do not introduce a resource stage shell in this slice | P2 | accepted | Added only `src/recipes/standard/stages/resources/artifacts.ts`; no recipe/stage index/order change. |
| Runtime numeric id mapping is unverified | P2 | accepted | Every corpus row has `runtimeId.status: "unverified"` and `value: null`; tests assert this. |
| `Types` declaration order differs from `Resources` row order | P2 | accepted | Tests assert corpus uses `Resources` row order and prove `<Types>` order differs. |
| No-biome-row resources need explicit disposition | P2/P3 | accepted | Distant-lands, lapis lazuli, cloves, and nickel are visible as blocked or conditional/unknown. |
| Lotus is not a resource | P3 | accepted | Test asserts `RESOURCE_LOTUS` is absent from corpus. |
| Tests did not prove all source-backed corpus fields | P2 | accepted, repaired, repair-reviewed | Added XML-derived comparator for all corpus rows covering display fields, source file/table, base class, weight, valid ages, class overrides, biome source tables/counts, yields, tags, and placement flags. |
| `artifact:resources.corpus` schema allowed `resources: Type.Any[]` | P2 | accepted, repaired, repair-reviewed | Added nested schema for resource entries and a schema test rejecting runtime-id overclaims. |
| Corpus/order exports were mutable surfaces | P3 | accepted, repaired, repair-reviewed | Deep-froze corpus and type order exports; replaced mutable `Map` export with a frozen record. |
| Spec said runtime id value was absent while implementation uses `null` | P3 | accepted, repaired, repair-reviewed | Spec now says runtime numeric id value is null. |
